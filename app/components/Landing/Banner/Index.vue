<script setup lang="ts">
interface SliderApiResponse {
  id: number;
  side: string;
  link: string | null;
  image: { id: number; url: string } | null;
}

const props = withDefaults(
  defineProps<{
    editable?: boolean;
    /**
     * Optional pre-fetched banner slider item.
     */
    bannerItem?: SliderApiResponse | null;
  }>(),
  { editable: false, bannerItem: null },
);

const { data: slidersData } = await useAPIFetch<SliderApiResponse[]>("/sliders");

const slidersOverride = ref<SliderApiResponse[] | null>(null);

const banner = computed<SliderApiResponse | null>(() => {
  if (slidersOverride.value) {
    return slidersOverride.value.find((s) => s.side === "banner") ?? null;
  }

  if (props.bannerItem) {
    return props.bannerItem;
  }

  const list = slidersData.value ?? [];
  return list.find((s) => s.side === "banner") ?? null;
});

const imageUrl = computed(() => banner.value?.image?.url ?? null);
const link = computed(() => banner.value?.link ?? "");
const sliderId = computed(() => banner.value?.id ?? null);

// Editable state (only used when editable prop is true)
const editLink = ref("");
const editUploadId = ref<number | null>(null);
const editImageUrl = ref<string | null>(null);
const uploading = ref(false);
const saving = ref(false);
const toast = useToast();

watch(
  [banner, link, imageUrl],
  () => {
    editLink.value = link.value ?? "";
    editUploadId.value = banner.value?.image?.id ?? null;
    editImageUrl.value = null;
  },
  { immediate: true },
);

function triggerFileInput() {
  const input = document.getElementById("banner-upload") as HTMLInputElement | null;
  input?.click();
}

async function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  uploading.value = true;
  try {
    const body = new FormData();
    body.append("file", file);
    body.append("directory", "sliders");

    const upload = await $apiFetch<{ id: number; url: string }>(
      "/uploads/preview",
      { method: "POST", body },
    );

    editUploadId.value = upload.id;
    editImageUrl.value = upload.url;
  } catch {
    toast.add({
      id: "banner-upload-error",
      title: "Échec du téléchargement",
      description: "Impossible de télécharger cette image.",
      color: "error",
    });
  } finally {
    uploading.value = false;
    target.value = "";
  }
}

async function saveBanner() {
  if (saving.value) return;
  if (!sliderId.value) {
    toast.add({
      id: "banner-no-slider",
      title: "Bannière non chargée",
      description:
        "Aucun bandeau n'existe encore. Exécutez le seeder (SliderSeeder) côté backend.",
      color: "error",
    });
    return;
  }

  saving.value = true;
  try {
    const updated = await $apiFetch<SliderApiResponse[]>("/sliders/bulk", {
      method: "PUT",
      body: {
        items: [
          {
            slider_id: sliderId.value,
            link: editLink.value || null,
            upload_id: editUploadId.value ?? null,
          },
        ],
      },
    });

    slidersOverride.value = Array.isArray(updated) ? updated : null;
    editImageUrl.value = null;

    toast.add({
      id: "banner-save-success",
      title: "Bannière enregistrée",
      color: "success",
    });
  } catch {
    toast.add({
      id: "banner-save-error",
      title: "Erreur lors de l'enregistrement",
      color: "error",
    });
  } finally {
    saving.value = false;
  }
}

const displayLink = computed(() =>
  props.editable ? editLink.value : (link.value ?? ""),
);

const displayImageUrl = computed(() => {
  if (props.editable && editImageUrl.value) return editImageUrl.value;
  return imageUrl.value;
});

const isExternalLink = (url: string) => /^https?:\/\//i.test(url);
</script>

<template>
  <UContainer>
    <component
      :is="editable ? 'div' : (displayLink ? 'a' : 'div')"
      :href="!editable && displayLink ? displayLink : undefined"
      :target="!editable && displayLink && isExternalLink(displayLink) ? '_blank' : undefined"
      :rel="!editable && displayLink && isExternalLink(displayLink) ? 'noopener noreferrer' : undefined"
      class="group relative block overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 shadow-sm h-[400px]"
      :class="{ 'bg-cover bg-center': displayImageUrl }"
      :style="
        displayImageUrl
          ? { backgroundImage: `url(${displayImageUrl})` }
          : undefined
      "
    >
      <div
        v-if="!displayImageUrl"
        class="flex h-full w-full items-center justify-center"
      >
        <UIcon name="i-lucide-image" class="text-neutral-400 text-2xl" />
      </div>

      <div
        v-if="editable"
        class="absolute inset-0 flex flex-col items-end justify-between bg-black/20 p-4 opacity-0 transition-opacity group-hover:opacity-100"
        @click.stop
      >
        <div class="w-full space-y-2 rounded bg-white/90 p-3">
          <UInput
            v-model="editLink"
            size="xs"
            placeholder="Lien du bandeau (optionnel)"
          />
          <div class="flex items-center justify-between gap-2">
            <UButton
              color="neutral"
              variant="soft"
              size="xs"
              icon="i-lucide-upload-cloud"
              :label="uploading ? 'Téléchargement…' : 'Choisir une image'"
              :loading="uploading"
              @click.stop="triggerFileInput"
            />
            <UButton
              type="button"
              color="primary"
              size="xs"
              icon="i-lucide-save"
              :label="saving ? 'Enregistrement…' : 'Enregistrer'"
              :loading="saving"
              @click="saveBanner"
            />
          </div>
        </div>
        <span class="text-[11px] text-white/90">Bannière</span>
      </div>

      <input
        v-if="editable"
        id="banner-upload"
        type="file"
        class="hidden"
        accept="image/*"
        @change="onFileChange"
      />
    </component>
    <p
      v-if="editable"
      class="mt-1.5 text-[11px] text-neutral-500"
    >
      Image recommandée : 1280×400 px
    </p>
  </UContainer>
</template>
