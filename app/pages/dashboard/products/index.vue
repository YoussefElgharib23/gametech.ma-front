<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

interface Product {
  id: number;
  slug: string;
  sku: string;
  title: string;
  description: string | null;
  short_description: string | null;
  category_id: number | null;
  category_name: string | null;
  subcategory_id: number | null;
  subcategory_name: string | null;
  brand_id: number | null;
  brand_name: string | null;
  brand_image: string | null;
  price: number;
  price_label: string;
  compare_at_price: number | null;
  compare_at_price_label: string | null;
  stock_status: "in_stock" | "out_of_stock" | "preorder";
  stock_status_label: string;
  stock_quantity: number | null;
  status: "active" | "inactive" | "draft";
  is_featured: boolean;
  position: number;
  published_at: string | null;
  images: string[];
}

interface ProductsPaginated {
  data: Product[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

const search = ref("");
const statusFilter = ref<string>("all");
const categoryFilter = ref<number | null>(null);
const brandFilter = ref<number | null>(null);
const page = ref(1);
const perPage = 15;

const query = computed(() => ({
  search: search.value.trim() || undefined,
  status: statusFilter.value !== "all" ? statusFilter.value : undefined,
  category_id: categoryFilter.value != null ? categoryFilter.value : undefined,
  brand_id: brandFilter.value != null ? brandFilter.value : undefined,
  page: page.value,
  per_page: perPage,
}));

const { data: productsData, refresh } = await useAPIFetch<ProductsPaginated>("/dashboard/products", {
  query,
});

const products = computed(() => productsData.value?.data ?? []);
const total = computed(() => productsData.value?.total ?? 0);
const lastPage = computed(() => productsData.value?.last_page ?? 1);
const currentPage = computed(() => productsData.value?.current_page ?? page.value);

watch([search, statusFilter, categoryFilter, brandFilter], () => {
  page.value = 1;
});

const productColumns = [
  {
    accessorKey: "title",
    header: "Produit",
    meta: { class: { td: "min-w-0" } },
  },
  {
    accessorKey: "category_display",
    header: "Catégorie",
    meta: { class: { td: "w-44" } },
  },
  {
    accessorKey: "price_label",
    header: "Prix",
    meta: { class: { td: "w-32" } },
  },
  {
    accessorKey: "stock_status",
    header: "Stock",
    meta: { class: { td: "w-32" } },
  },
  {
    accessorKey: "status",
    header: "Statut",
    meta: { class: { td: "w-28" } },
  },
  {
    id: "actions",
    header: "",
    meta: { class: { td: "w-28 text-right" } },
  },
];

const toast = useToast();
const deleteModalOpen = ref(false);
const deletingProduct = ref<Product | null>(null);
const deleting = ref(false);

function openDelete(product: Product) {
  deletingProduct.value = product;
  deleteModalOpen.value = true;
}

function closeDeleteModal() {
  deleteModalOpen.value = false;
  deletingProduct.value = null;
}

async function confirmDelete() {
  if (!deletingProduct.value) return;
  const id = deletingProduct.value.id;
  deleting.value = true;
  try {
    await $apiFetch(`/dashboard/products/${id}`, { method: "DELETE" });
    toast.add({ title: "Produit supprimé", color: "success" });
    await refresh();
    closeDeleteModal();
  } catch {
    toast.add({
      title: "Erreur lors de la suppression",
      color: "error",
    });
  } finally {
    deleting.value = false;
  }
}

function getStockStatusColor(status: string) {
  switch (status) {
    case "in_stock":
      return "success";
    case "out_of_stock":
      return "error";
    case "preorder":
      return "warning";
    default:
      return "neutral";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "success";
    case "inactive":
      return "neutral";
    case "draft":
      return "warning";
    default:
      return "neutral";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "active":
      return "Actif";
    case "inactive":
      return "Inactif";
    case "draft":
      return "Brouillon";
    default:
      return status;
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Produits">
        <template #right>
          <UButton icon="i-lucide-plus" label="Ajouter un produit" color="primary" to="/dashboard/products/create" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UCard :ui="{ body: 'sm:p-0 p-0' }">
        <div class="flex flex-col gap-3 border-b border-neutral-200 px-4 py-3">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Rechercher par titre, SKU, marque…"
            size="md"
            class="w-full" />

          <div class="flex flex-wrap items-center gap-2">
            <USelectMenu
              v-model="statusFilter"
              :items="[
                { label: 'Tous les statuts', value: 'all' },
                { label: 'Actif', value: 'active' },
                { label: 'Inactif', value: 'inactive' },
                { label: 'Brouillon', value: 'draft' },
              ]"
              placeholder="Statut"
              size="sm"
              class="w-40"
              label-key="label"
              value-key="value" />
            <span class="text-xs text-neutral-500">
              {{ total }} produit{{ total !== 1 ? "s" : "" }}
              <span v-if="total > 0 && productsData">({{ productsData.from ?? 0 }}–{{ productsData.to ?? 0 }})</span>
            </span>
          </div>
        </div>

        <div v-if="!products.length" class="py-12 text-center text-neutral-500">
          Aucun produit. Cliquez sur « Ajouter un produit » pour commencer.
        </div>

        <UTable v-else :data="products" :columns="productColumns">
          <template #title-cell="{ row }">
            <div class="flex items-center gap-3">
              <div class="h-12 w-12 shrink-0 overflow-hidden rounded border border-neutral-200 bg-neutral-100 p-[2px]">
                <img
                  v-if="row.original.images?.[0]"
                  :src="row.original.images[0]"
                  :alt="row.original.title"
                  class="h-full w-full object-cover mix-blend-multiply" />
                <div v-else class="flex h-full w-full items-center justify-center text-neutral-400">
                  <UIcon name="i-lucide-image" class="size-5" />
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium text-neutral-900">
                  {{ row.original.title }}
                </p>
                <p class="text-xs text-neutral-500 truncate">
                  <span class="font-mono">{{ row.original.sku }}</span>
                  <span v-if="row.original.stock_quantity != null" class="text-neutral-400">
                    · {{ row.original.stock_quantity }} en stock
                  </span>
                </p>
              </div>
            </div>
          </template>

          <template #category_display-cell="{ row }">
            <span v-if="row.original.category_name || row.original.subcategory_name" class="text-sm text-neutral-700">
              <template v-if="row.original.subcategory_name">
                {{ row.original.category_name }} / {{ row.original.subcategory_name }}
              </template>
              <template v-else>
                {{ row.original.category_name ?? row.original.subcategory_name }}
              </template>
            </span>
            <span v-else class="text-neutral-400">—</span>
          </template>

          <template #stock_status-cell="{ row }">
            <UBadge :color="getStockStatusColor(row.original.stock_status)" variant="subtle" size="xs">
              {{ row.original.stock_status_label }}
            </UBadge>
          </template>

          <template #status-cell="{ row }">
            <UBadge :color="getStatusColor(row.original.status)" variant="subtle" size="xs">
              {{ getStatusLabel(row.original.status) }}
            </UBadge>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex items-center justify-end gap-1">
              <UTooltip text="Voir le produit" :delay-duration="0">
                <UButton
                  icon="i-lucide-eye"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  aria-label="Voir le produit"
                  :to="`/products/${row.original.slug}`"
                  target="_blank"
                  rel="noopener noreferrer" />
              </UTooltip>
              <UTooltip text="Modifier le produit" :delay-duration="0">
                <UButton
                  icon="i-lucide-pencil"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  aria-label="Modifier"
                  :to="`/dashboard/products/${row.original.id}/edit`" />
              </UTooltip>
              <UTooltip text="Supprimer le produit" :delay-duration="0">
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="xs"
                  aria-label="Supprimer"
                  @click="openDelete(row.original)" />
              </UTooltip>
            </div>
          </template>
        </UTable>

        <div v-if="total > 0" class="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3">
          <p class="text-sm text-neutral-500">Page {{ currentPage }} sur {{ lastPage }}</p>
          <UPagination v-model:page="page" :total="total" :items-per-page="perPage" :show-edges="true" size="sm" />
        </div>
      </UCard>
    </template>
  </UDashboardPanel>

  <!-- Delete confirmation modal -->
  <UModal
    v-model:open="deleteModalOpen"
    title="Supprimer le produit"
    description="Cette action est irréversible."
    :ui="{
      header: 'sm:p-3 p-3 border-none',
      body: 'sm:p-3 p-3',
      footer: 'sm:p-3 p-3',
      content: 'divide-y-0',
    }"
    @close="closeDeleteModal">
    <template #body>
      <p v-if="deletingProduct" class="text-neutral-600">
        Êtes-vous sûr de vouloir supprimer
        <strong>{{ deletingProduct.title }}</strong>
        ?
      </p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="outline" label="Annuler" @click="closeDeleteModal" />
        <UButton color="error" label="Supprimer" :loading="deleting" @click="confirmDelete" />
      </div>
    </template>
  </UModal>
</template>
