<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";
import { CATALOG_SECTIONS, CATALOG_SECTION_SLUGS, type CatalogSectionSlug } from "~/constants/catalogSections";
import { CONFIGURATOR_CATEGORIES, type ConfiguratorCategory } from "~/constants/configuratorCategories";

definePageMeta({
  layout: "dashboard",
});

interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
  category_id: number;
}

interface Brand {
  id: number;
  name: string;
  image: string | null;
}

const router = useRouter();
const toast = useToast();

const schema = z.object({
  title: z.string().min(1, "Titre requis"),
  sku: z.string().min(1, "SKU requis"),
  description: z.string().optional(),
  short_description: z.string().optional(),
  category_id: z.number({ required_error: "Catégorie requise" }),
  subcategory_id: z.number().optional().nullable(),
  brand_id: z.number({ required_error: "Marque requise" }),
  price: z.coerce
    .string()
    .min(1, "Prix requis")
    .refine((v: string) => !Number.isNaN(parseFloat(v)) && parseFloat(v) >= 0, "Prix doit être un nombre positif ou zéro"),
  compare_at_price: z.coerce.string().optional(),
  stock_status: z.enum(["in_stock", "out_of_stock", "preorder"]),
  stock_quantity: z.coerce.string().optional(),
  status: z.enum(["active", "inactive", "draft"]),
  is_featured: z.boolean(),
  position: z.number(),
  section: z.enum(["selections", "new-arrival", "best-seller"]).optional(),
  configurator_category: z.enum(CONFIGURATOR_CATEGORIES).optional(),
  catalog_sections: z.array(z.enum(CATALOG_SECTION_SLUGS)).optional(),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<z.infer<typeof schema>>>({
  title: "",
  sku: "",
  description: "",
  short_description: "",
  category_id: undefined,
  subcategory_id: undefined,
  brand_id: undefined,
  price: "",
  compare_at_price: "",
  stock_status: "in_stock",
  stock_quantity: "",
  status: "draft",
  is_featured: false,
  position: 0,
  section: undefined,
  configurator_category: undefined,
  catalog_sections: [],
});

const formRef = useTemplateRef<{
  submit: () => Promise<void>;
  setErrors: (errors: Array<{ name: string; message: string }>) => void;
}>("productForm");

const { data: categoriesData } = await useAPIFetch<Category[]>("/categories");
const { data: subcategoriesData } = await useAPIFetch<Subcategory[]>("/subcategories");
const { data: brandsData } = await useAPIFetch<Brand[]>("/brands");

const uploadedImages = ref<Array<{ id: number; url: string }>>([]);
const uploading = ref(false);
const saving = ref(false);

const brandItems = computed(() =>
  (brandsData.value ?? []).map((b) => ({
    label: b.name,
    value: b.id,
    avatar: b.image ? { src: b.image } : undefined,
  })),
);

const subcategoryIdModel = computed({
  get: () => state.subcategory_id ?? undefined,
  set: (v: number | undefined) => {
    state.subcategory_id = v;
  },
});

const filteredSubcategories = computed(() => {
  if (state.category_id == null) return [];
  return (subcategoriesData.value ?? []).filter((s) => s.category_id === state.category_id);
});

watch(
  () => state.category_id,
  () => {
    state.subcategory_id = undefined;
  },
);

const statusOptions = [
  { label: "Actif", value: "active" },
  { label: "Inactif", value: "inactive" },
  { label: "Brouillon", value: "draft" },
];

const stockStatusOptions = [
  { label: "En stock", value: "in_stock" },
  { label: "Rupture de stock", value: "out_of_stock" },
  { label: "Pré-commande", value: "preorder" },
];

const landingSectionOptions: { label: string; value: "selections" | "new-arrival" | "best-seller" | undefined }[] = [
  { label: "Aucune", value: undefined },
  { label: "Nos sélections", value: "selections" },
  { label: "Nouvel arrivage", value: "new-arrival" },
  { label: "Best seller", value: "best-seller" },
];

const configuratorCategoryOptions: { label: string; value: ConfiguratorCategory | undefined }[] = [
  { label: "Aucune", value: undefined },
  ...CONFIGURATOR_CATEGORIES.map((c) => ({ label: c.slice(0, 1).toUpperCase() + c.slice(1).toLowerCase(), value: c })),
];

const catalogSectionOptions: { label: string; value: CatalogSectionSlug }[] = CATALOG_SECTIONS.map((s) => ({
  label: s.label,
  value: s.slug,
}));

const statusDotClass = computed(() => {
  switch (state.status) {
    case "active":
      return "bg-green-500";
    case "inactive":
      return "bg-neutral-400";
    case "draft":
      return "bg-yellow-500";
    default:
      return "bg-neutral-400";
  }
});

function triggerImageInput() {
  const input = document.getElementById("product-images-upload") as HTMLInputElement | null;
  input?.click();
}

async function onImagesChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;
  uploading.value = true;
  try {
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      body.append("directory", "products");
      const upload = await $apiFetch<{ id: number; url: string }>("/uploads/preview", { method: "POST", body });
      uploadedImages.value.push(upload);
    }
  } catch {
    toast.add({ title: "Erreur lors du téléchargement", color: "error" });
  } finally {
    uploading.value = false;
    target.value = "";
  }
}

function removeImage(index: number) {
  uploadedImages.value.splice(index, 1);
}

function moveImageLeft(index: number) {
  if (index === 0) return;
  const a = uploadedImages.value[index];
  const b = uploadedImages.value[index - 1];
  if (a === undefined || b === undefined) return;
  uploadedImages.value[index] = b;
  uploadedImages.value[index - 1] = a;
}

function moveImageRight(index: number) {
  if (index === uploadedImages.value.length - 1) return;
  const a = uploadedImages.value[index];
  const b = uploadedImages.value[index + 1];
  if (a === undefined || b === undefined) return;
  uploadedImages.value[index] = b;
  uploadedImages.value[index + 1] = a;
}

function backendErrorsToFormErrors(errors: Record<string, string[]>): Array<{ name: string; message: string }> {
  return Object.entries(errors).map(([name, messages]) => ({
    name,
    message: (Array.isArray(messages) && messages.length > 0 ? messages[0] : String(messages)) ?? "",
  }));
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const data = event.data;
  saving.value = true;
  formRef.value?.setErrors([]);
  try {
    await $apiFetch("/dashboard/products", {
      method: "POST",
      body: {
        title: data.title.trim(),
        sku: data.sku.trim(),
        description: (data.description ?? "").trim() || null,
        short_description: (data.short_description ?? "").trim() || null,
        category_id: data.category_id,
        subcategory_id: data.subcategory_id ?? null,
        brand_id: data.brand_id,
        price: parseFloat(data.price),
        compare_at_price: data.compare_at_price ? parseFloat(data.compare_at_price) : null,
        stock_status: data.stock_status,
        stock_quantity: data.stock_quantity ? parseInt(data.stock_quantity, 10) : null,
        status: data.status,
        is_featured: data.is_featured,
        position: data.position,
        section: data.section === undefined ? null : data.section,
        configurator_category: data.configurator_category === undefined ? null : data.configurator_category,
        catalog_sections: data.catalog_sections?.length ? data.catalog_sections : null,
        upload_ids: uploadedImages.value.map((img) => img.id).filter((id) => id > 0),
      },
    });
    toast.add({ title: "Produit créé", color: "success" });
    router.push("/dashboard/products");
  } catch (error: any) {
    const backendErrors = error?.data?.errors;
    if (backendErrors && typeof backendErrors === "object") {
      const formErrors = backendErrorsToFormErrors(backendErrors);
      formRef.value?.setErrors(formErrors);
    }
    toast.add({
      title: "Erreur lors de l'enregistrement",
      description: error?.data?.message ?? "Une erreur est survenue",
      color: "error",
    });
  } finally {
    saving.value = false;
  }
}

function submitForm() {
  formRef.value?.submit();
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Nouveau produit">
        <template #right>
          <div class="flex items-center gap-2">
            <UButton color="neutral" variant="outline" label="Ignorer" to="/dashboard/products" />
            <UButton color="primary" label="Enregistrer" :loading="saving" @click="submitForm" />
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="mb-2">
        <NuxtLink to="/dashboard/products" class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
          Retour aux produits
        </NuxtLink>
      </div>

      <UForm ref="productForm" :schema="schema" :state="state" class="w-full" @submit="onSubmit">
        <div class="flex gap-6 items-start">
          <!-- ── LEFT COLUMN ── -->
          <div class="flex-1 min-w-0 space-y-4">
            <!-- Title & Description -->
            <UCard>
              <div class="space-y-4">
                <UFormField label="Titre" name="title" required class="w-full">
                  <UInput v-model="state.title" placeholder="Ex. AMD Ryzen 9 5950X" size="lg" class="w-full" autofocus />
                </UFormField>
                <UFormField label="Description courte" name="short_description" class="w-full">
                  <UTextarea
                    v-model="state.short_description"
                    placeholder="Résumé affiché sur les cartes produit et en SEO…"
                    :rows="2"
                    size="md"
                    class="w-full" />
                </UFormField>
                <UFormField label="Description" name="description" class="w-full">
                  <DashboardTextEditor v-model="state.description" placeholder="Description détaillée du produit…" />
                </UFormField>
              </div>
            </UCard>

            <!-- Media -->
            <UCard>
              <template #header>
                <h3 class="text-sm font-semibold text-neutral-800">Médias</h3>
              </template>

              <div
                v-if="!uploadedImages.length"
                class="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 py-12 cursor-pointer transition hover:border-neutral-300 hover:bg-neutral-100"
                @click="triggerImageInput">
                <UIcon name="i-lucide-image-plus" class="size-10 text-neutral-400" />
                <div class="text-center">
                  <p class="text-sm font-medium text-neutral-700">Ajouter des images</p>
                  <p class="text-xs text-neutral-500 mt-0.5">Cliquez ou déposez vos fichiers ici</p>
                </div>
              </div>

              <div v-else class="space-y-3">
                <div class="relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 aspect-video group">
                  <img :src="uploadedImages[0]?.url" alt="Image principale" class="h-full w-full object-contain" />
                  <div
                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <UButton icon="i-lucide-trash-2" color="error" variant="solid" size="sm" @click="removeImage(0)" />
                  </div>
                  <span class="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                    Principale
                  </span>
                </div>

                <div v-if="uploadedImages.length > 1" class="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  <div
                    v-for="(img, idx) in uploadedImages.slice(1)"
                    :key="idx + 1"
                    class="relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 group cursor-pointer">
                    <img :src="img.url" :alt="`Image ${idx + 2}`" class="h-full w-full object-cover" />
                    <div
                      class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <UButton
                        v-if="idx + 1 > 0"
                        icon="i-lucide-arrow-left"
                        color="neutral"
                        variant="solid"
                        size="xs"
                        @click="moveImageLeft(idx + 1)" />
                      <UButton icon="i-lucide-trash-2" color="error" variant="solid" size="xs" @click="removeImage(idx + 1)" />
                      <UButton
                        v-if="idx + 1 < uploadedImages.length - 1"
                        icon="i-lucide-arrow-right"
                        color="neutral"
                        variant="solid"
                        size="xs"
                        @click="moveImageRight(idx + 1)" />
                    </div>
                  </div>

                  <div
                    class="aspect-square flex items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50 cursor-pointer hover:border-neutral-300 hover:bg-neutral-100 transition"
                    @click="triggerImageInput">
                    <UIcon name="i-lucide-plus" class="size-5 text-neutral-400" />
                  </div>
                </div>

                <UButton
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  icon="i-lucide-upload-cloud"
                  :label="uploading ? 'Téléchargement…' : 'Ajouter des images'"
                  :loading="uploading"
                  @click="triggerImageInput" />
              </div>

              <input id="product-images-upload" type="file" class="hidden" accept="image/*" multiple @change="onImagesChange" />
            </UCard>

            <!-- Pricing -->
            <UCard>
              <template #header>
                <h3 class="text-sm font-semibold text-neutral-800">Prix</h3>
              </template>
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="Prix (MAD)" name="price" required class="w-full">
                  <UInput v-model="state.price" type="number" step="0.01" min="0" placeholder="0.00" size="md" class="w-full" />
                </UFormField>
                <UFormField label="Prix comparé (MAD)" name="compare_at_price" description="Affiche un prix barré" class="w-full">
                  <UInput
                    v-model="state.compare_at_price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    size="md"
                    class="w-full" />
                </UFormField>
              </div>

              <div
                v-if="state.compare_at_price && state.price && parseFloat(state.compare_at_price) > parseFloat(state.price)"
                class="mt-3 flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-md px-3 py-2">
                <UIcon name="i-lucide-tag" class="size-3.5 shrink-0" />
                Réduction de {{ Math.round((1 - parseFloat(state.price) / parseFloat(state.compare_at_price)) * 100) }}%
              </div>
            </UCard>

            <!-- Inventory -->
            <UCard>
              <template #header>
                <h3 class="text-sm font-semibold text-neutral-800">Inventaire</h3>
              </template>
              <div class="grid grid-cols-2 gap-4">
                <UFormField label="SKU (Référence)" name="sku" required class="w-full">
                  <UInput v-model="state.sku" placeholder="Ex. RYZEN-5950X-001" size="md" class="w-full" />
                </UFormField>
                <UFormField label="Quantité" name="stock_quantity" class="w-full">
                  <UInput v-model="state.stock_quantity" type="number" min="0" placeholder="—" size="md" class="w-full" />
                </UFormField>
              </div>
              <div class="mt-4">
                <UFormField label="Disponibilité" name="stock_status" class="w-full">
                  <USelectMenu
                    v-model="state.stock_status"
                    :items="stockStatusOptions"
                    size="md"
                    class="w-full"
                    value-key="value"
                    label-key="label" />
                </UFormField>
              </div>
            </UCard>
          </div>

          <!-- ── RIGHT COLUMN (sidebar) ── -->
          <div class="w-72 shrink-0 space-y-4">
            <!-- Status -->
            <UCard>
              <template #header>
                <h3 class="text-sm font-semibold text-neutral-800">Statut</h3>
              </template>
              <UFormField name="status" class="w-full">
                <USelectMenu v-model="state.status" :items="statusOptions" size="md" class="w-full" value-key="value">
                  <template #leading>
                    <span :class="['inline-block size-2 rounded-full shrink-0', statusDotClass]" />
                  </template>
                </USelectMenu>
              </UFormField>
              <div class="mt-3">
                <UFormField name="is_featured" class="w-full">
                  <div class="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2.5">
                    <div>
                      <p class="text-sm font-medium text-neutral-800">Mis en avant</p>
                      <p class="text-xs text-neutral-500 mt-0.5">Afficher en page d'accueil</p>
                    </div>
                    <USwitch v-model="state.is_featured" />
                  </div>
                </UFormField>
              </div>
            </UCard>

            <!-- Organisation -->
            <UCard>
              <template #header>
                <h3 class="text-sm font-semibold text-neutral-800">Organisation</h3>
              </template>
              <div class="space-y-3">
                <UFormField label="Marque" name="brand_id" required class="w-full">
                  <USelectMenu
                    v-model="state.brand_id"
                    :items="brandItems"
                    placeholder="Sélectionner une marque"
                    size="md"
                    class="w-full"
                    label-key="label"
                    value-key="value">
                    <template #leading>
                      <UAvatar
                        v-if="state.brand_id && brandsData?.find((b) => b.id === state.brand_id)?.image"
                        :src="brandsData?.find((b) => b.id === state.brand_id)?.image ?? ''"
                        size="xs"
                        class="shrink-0" />
                    </template>
                  </USelectMenu>
                </UFormField>
                <UFormField label="Catégorie" name="category_id" required class="w-full">
                  <USelectMenu
                    v-model="state.category_id"
                    :items="(categoriesData ?? []).map((c) => ({ label: c.name, value: c.id }))"
                    placeholder="Sélectionner une catégorie"
                    size="md"
                    class="w-full"
                    label-key="label"
                    value-key="value" />
                </UFormField>
                <UFormField label="Sous-catégorie" name="subcategory_id" class="w-full">
                  <USelectMenu
                    v-model="subcategoryIdModel"
                    :items="filteredSubcategories.map((s) => ({ label: s.name, value: s.id }))"
                    placeholder="Sélectionner"
                    size="md"
                    class="w-full"
                    label-key="label"
                    value-key="value"
                    :disabled="state.category_id == null || !filteredSubcategories.length" />
                </UFormField>
                <UFormField
                  label="Bloc page d'accueil"
                  name="section"
                  description="Où afficher ce produit dans le carrousel (produits actifs uniquement)"
                  class="w-full">
                  <USelectMenu
                    v-model="state.section"
                    :items="landingSectionOptions"
                    placeholder="Aucune"
                    size="md"
                    class="w-full"
                    label-key="label"
                    value-key="value" />
                </UFormField>
                <UFormField
                  label="Catégorie configurateur"
                  name="configurator_category"
                  description="Utilisée pour le PC Config Builder (filtrage des composants)."
                  class="w-full">
                  <USelectMenu
                    v-model="state.configurator_category"
                    :items="configuratorCategoryOptions"
                    size="md"
                    class="w-full"
                    label-key="label"
                    value-key="value" />
                </UFormField>
                <UFormField
                  label="Sections catalogue"
                  name="catalog_sections"
                  description="Affiche ce produit dans les pages: Nouvel arrivage, Meilleures ventes, Promotion."
                  class="w-full">
                  <USelectMenu
                    v-model="state.catalog_sections"
                    :items="catalogSectionOptions"
                    multiple
                    placeholder="Aucune"
                    size="md"
                    class="w-full"
                    label-key="label"
                    value-key="value" />
                </UFormField>
              </div>
            </UCard>
          </div>
        </div>
      </UForm>
    </template>
  </UDashboardPanel>
</template>
