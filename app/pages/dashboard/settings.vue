<script setup lang="ts">
import { z } from "zod";

definePageMeta({
  layout: "dashboard",
});

type SettingsResponse = {
  settings: Record<string, unknown>;
};

const toast = useToast();

const schema = z.object({
  store_name: z.string().min(1, "Le nom de la boutique est requis."),
  company_name: z.string().min(1, "Le nom de la société est requis."),
  company_email: z.string().email("Email invalide.").optional().or(z.literal("")),
  company_phone_1: z.string().optional().or(z.literal("")),
  company_phone_2: z.string().optional().or(z.literal("")),
  company_address: z.string().optional().or(z.literal("")),
  socials_facebook: z.string().url("URL invalide.").optional().or(z.literal("")),
  socials_instagram: z.string().url("URL invalide.").optional().or(z.literal("")),
  socials_tiktok: z.string().url("URL invalide.").optional().or(z.literal("")),
  socials_youtube: z.string().url("URL invalide.").optional().or(z.literal("")),
  socials_whatsapp: z.string().optional().or(z.literal("")),
  flash_sales_enabled: z.boolean().optional(),
  flash_sales_expires_at: z.string().optional().or(z.literal("")),
});

type FormState = z.infer<typeof schema>;

const state = reactive<FormState>({
  store_name: "",
  company_name: "",
  company_email: "",
  company_phone_1: "",
  company_phone_2: "",
  company_address: "",
  socials_facebook: "",
  socials_instagram: "",
  socials_tiktok: "",
  socials_youtube: "",
  socials_whatsapp: "",
  flash_sales_enabled: true,
  flash_sales_expires_at: "",
});

const { data, pending, refresh } = await useAPIFetch<SettingsResponse>("/dashboard/store-settings");

function isoToDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad2 = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function datetimeLocalToIso(v: string): string | null {
  const trimmed = (v ?? "").trim();
  if (!trimmed) return null;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function fromSettingsMap(settings: Record<string, unknown> | undefined): void {
  const s = settings ?? {};

  const getString = (key: string): string => (typeof s[key] === "string" ? (s[key] as string) : "");
  const getBool = (key: string): boolean => {
    const v = s[key];
    if (typeof v === "boolean") return v;
    if (v === 1 || v === "1") return true;
    if (v === 0 || v === "0") return false;
    return false;
  };

  state.store_name = getString("store.name");
  state.company_name = getString("company.name");
  state.company_email = getString("company.email");
  state.company_phone_1 = getString("company.phone_1");
  state.company_phone_2 = getString("company.phone_2");
  state.company_address = getString("company.address");
  state.socials_facebook = getString("socials.facebook");
  state.socials_instagram = getString("socials.instagram");
  state.socials_tiktok = getString("socials.tiktok");
  state.socials_youtube = getString("socials.youtube");
  state.socials_whatsapp = getString("socials.whatsapp");
  state.flash_sales_enabled = getBool("flash_sales.enabled");
  state.flash_sales_expires_at = isoToDatetimeLocal(getString("flash_sales.expires_at"));
}

watch(
  () => data.value?.settings,
  (settings) => {
    fromSettingsMap(settings);
  },
  { immediate: true },
);

const saving = ref(false);

async function onSubmit() {
  const parsed = schema.safeParse(state);
  if (!parsed.success) {
    toast.add({
      title: "Validation",
      description: parsed.error.issues[0]?.message ?? "Veuillez vérifier le formulaire.",
      color: "red",
    });
    return;
  }

  saving.value = true;
  try {
    const payload = parsed.data;

    await $apiFetch("/dashboard/store-settings", {
      method: "PUT",
      body: {
        settings: {
          "store.name": payload.store_name,
          "company.name": payload.company_name,
          "company.email": payload.company_email || null,
          "company.phone_1": payload.company_phone_1 || null,
          "company.phone_2": payload.company_phone_2 || null,
          "company.address": payload.company_address || null,
          "socials.facebook": payload.socials_facebook || null,
          "socials.instagram": payload.socials_instagram || null,
          "socials.tiktok": payload.socials_tiktok || null,
          "socials.youtube": payload.socials_youtube || null,
          "socials.whatsapp": payload.socials_whatsapp || null,
          "flash_sales.enabled": payload.flash_sales_enabled ?? false,
          "flash_sales.expires_at": datetimeLocalToIso(payload.flash_sales_expires_at) ?? null,
        },
      },
    });

    toast.add({
      title: "Enregistré",
      description: "Les paramètres de la boutique ont été mis à jour.",
      color: "green",
    });
    await refresh();
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <UDashboardPanel id="settings">
    <template #body>
      <div class="space-y-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-lg font-semibold tracking-tight text-neutral-900">
              Paramètres de la boutique
            </h1>
            <p class="mt-1 text-sm text-neutral-500">
              Mettez à jour les informations affichées sur le site (contact, réseaux sociaux, etc.).
            </p>
          </div>

          <div class="flex items-center gap-2">
            <UButton
              color="neutral"
              variant="soft"
              icon="i-lucide-refresh-cw"
              :loading="pending"
              label="Rafraîchir"
              @click="refresh()"
            />
            <UButton
              color="primary"
              icon="i-lucide-save"
              :loading="saving"
              label="Enregistrer"
              @click="onSubmit"
            />
          </div>
        </div>

        <div class="grid gap-4 lg:grid-cols-3">
          <UCard class="lg:col-span-2">
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-store" class="h-4 w-4 text-primary-600" />
                <h2 class="text-sm font-semibold text-neutral-900">Identité</h2>
              </div>
            </template>

            <div class="grid gap-4 sm:grid-cols-2">
              <UFormField label="Nom de la boutique" required>
                <UInput v-model="state.store_name" placeholder="GameTech" />
              </UFormField>
              <UFormField label="Nom de la société" required>
                <UInput v-model="state.company_name" placeholder="GameTech SARL" />
              </UFormField>
            </div>

            <div class="grid gap-4 sm:grid-cols-2 mt-4">
              <UFormField label="Email">
                <UInput v-model="state.company_email" placeholder="contact@gametech.ma" />
              </UFormField>
              <UFormField label="Adresse">
                <UInput v-model="state.company_address" placeholder="Adresse..." />
              </UFormField>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-phone" class="h-4 w-4 text-primary-600" />
                <h2 class="text-sm font-semibold text-neutral-900">Contact</h2>
              </div>
            </template>

            <div class="space-y-4">
              <UFormField label="Téléphone 1">
                <UInput v-model="state.company_phone_1" placeholder="+212 ..." />
              </UFormField>
              <UFormField label="Téléphone 2">
                <UInput v-model="state.company_phone_2" placeholder="+212 ..." />
              </UFormField>
            </div>
          </UCard>
        </div>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-share-2" class="h-4 w-4 text-primary-600" />
              <h2 class="text-sm font-semibold text-neutral-900">Réseaux sociaux</h2>
            </div>
          </template>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <UFormField label="Facebook (URL)">
              <UInput v-model="state.socials_facebook" placeholder="https://facebook.com/..." />
            </UFormField>
            <UFormField label="Instagram (URL)">
              <UInput v-model="state.socials_instagram" placeholder="https://instagram.com/..." />
            </UFormField>
            <UFormField label="TikTok (URL)">
              <UInput v-model="state.socials_tiktok" placeholder="https://tiktok.com/@..." />
            </UFormField>
            <UFormField label="YouTube (URL)">
              <UInput v-model="state.socials_youtube" placeholder="https://youtube.com/..." />
            </UFormField>
            <UFormField label="WhatsApp (numéro ou lien)">
              <UInput v-model="state.socials_whatsapp" placeholder="+212 ... ou https://wa.me/..." />
            </UFormField>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-zap" class="h-4 w-4 text-primary-600" />
              <h2 class="text-sm font-semibold text-neutral-900">Vente Flash</h2>
            </div>
          </template>

          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Activer la section">
              <div class="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                <div class="min-w-0">
                  <p class="text-sm font-medium text-neutral-900">Afficher “Vente Flash”</p>
                  <p class="text-xs text-neutral-500">Désactivez pour masquer entièrement le bloc.</p>
                </div>
                <USwitch v-model="state.flash_sales_enabled" />
              </div>
            </UFormField>

            <UFormField
              label="Expire le"
              description="Une fois la date dépassée, la section est automatiquement cachée."
            >
              <UInput v-model="state.flash_sales_expires_at" type="datetime-local" />
            </UFormField>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

