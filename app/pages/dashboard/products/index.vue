<script setup lang="ts">
import { refDebounced, watchDebounced } from "@vueuse/core";
import type { RouteLocationRaw } from "vue-router";

definePageMeta({
  layout: "dashboard",
});

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
  image: string | null;
}

interface Product {
  id: number;
  slug: string;
  sku: string;
  title: string;
  description: string | null;
  short_description: string | null;
  category_id: number | null;
  category_name: string | null;
  category_group_id: number | null;
  category_group_name: string | null;
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
  section: string | null;
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

const route = useRoute();
const router = useRouter();

const search = ref("");
const searchDebounced = refDebounced(search, 350);
const statusFilter = ref<string>("all");
const categoryFilter = ref<number | undefined>(undefined);
const brandFilter = ref<number | undefined>(undefined);
const needsCatalogOnly = ref(false);
const page = ref(1);
const perPage = 15;

const syncingFromRoute = ref(false);

function parsePositiveIntParam(value: unknown): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw == null || raw === "") {
    return undefined;
  }
  const n = Number(raw);

  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
}

function parsePageParam(value: unknown): number {
  const p = parsePositiveIntParam(value);

  return p ?? 1;
}

function readFiltersFromRouteQuery(): void {
  const q = route.query;
  const s = q.search;
  search.value = typeof s === "string" ? s : Array.isArray(s) && typeof s[0] === "string" ? s[0] : "";
  const st = q.status;
  statusFilter.value =
    typeof st === "string" && (st === "active" || st === "inactive" || st === "draft") ? st : "all";
  categoryFilter.value = parsePositiveIntParam(q.category_id);
  brandFilter.value = parsePositiveIntParam(q.brand_id);
  const nc = Array.isArray(q.needs_catalog) ? q.needs_catalog[0] : q.needs_catalog;
  needsCatalogOnly.value = nc === "1";
  page.value = parsePageParam(q.page);
}

function routeSearchString(): string {
  const s = route.query.search;
  if (typeof s === "string") {
    return s;
  }
  if (Array.isArray(s) && typeof s[0] === "string") {
    return s[0];
  }

  return "";
}

function buildListQueryRecord(): Record<string, string> {
  const out: Record<string, string> = {};
  const t = search.value.trim();
  if (t) {
    out.search = t;
  }
  if (statusFilter.value !== "all") {
    out.status = statusFilter.value;
  }
  if (categoryFilter.value != null) {
    out.category_id = String(categoryFilter.value);
  }
  if (brandFilter.value != null) {
    out.brand_id = String(brandFilter.value);
  }
  if (needsCatalogOnly.value) {
    out.needs_catalog = "1";
  }
  if (page.value > 1) {
    out.page = String(page.value);
  }

  return out;
}

function listQueryRecordsEqual(a: Record<string, string>, b: Record<string, string>): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    if ((a[k] ?? "") !== (b[k] ?? "")) {
      return false;
    }
  }

  return true;
}

function syncRouteFromFilters(): void {
  if (syncingFromRoute.value) {
    return;
  }
  const next = buildListQueryRecord();
  const current = buildListQueryRecordFromLocationQuery(route.query);
  if (listQueryRecordsEqual(next, current)) {
    return;
  }
  void router.replace({ path: route.path, query: next });
}

function buildListQueryRecordFromLocationQuery(q: typeof route.query): Record<string, string> {
  const out: Record<string, string> = {};
  const pick = (key: string): string | undefined => {
    const v = q[key];
    if (typeof v === "string") {
      return v;
    }
    if (Array.isArray(v) && typeof v[0] === "string") {
      return v[0];
    }

    return undefined;
  };
  const s = pick("search");
  if (s) {
    out.search = s;
  }
  const st = pick("status");
  if (st === "active" || st === "inactive" || st === "draft") {
    out.status = st;
  }
  const cid = pick("category_id");
  if (cid) {
    out.category_id = cid;
  }
  const bid = pick("brand_id");
  if (bid) {
    out.brand_id = bid;
  }
  if (pick("needs_catalog") === "1") {
    out.needs_catalog = "1";
  }
  const pg = pick("page");
  if (pg && Number(pg) > 1) {
    out.page = pg;
  }

  return out;
}

function buildProductsListPathWithQuery(): string {
  const q = buildListQueryRecord();
  const qs = new URLSearchParams(q).toString();

  return qs ? `/dashboard/products?${qs}` : "/dashboard/products";
}

function editProductLocation(productId: number): RouteLocationRaw {
  return {
    path: `/dashboard/products/${productId}/edit`,
    query: { return: encodeURIComponent(buildProductsListPathWithQuery()) },
  };
}

function createProductLocation(): RouteLocationRaw {
  return {
    path: "/dashboard/products/create",
    query: { return: encodeURIComponent(buildProductsListPathWithQuery()) },
  };
}

watch(
  () => route.query,
  () => {
    syncingFromRoute.value = true;
    readFiltersFromRouteQuery();
    nextTick(() => {
      syncingFromRoute.value = false;
    });
  },
  { deep: true, immediate: true },
);

watch([statusFilter, categoryFilter, brandFilter, needsCatalogOnly], () => {
  if (syncingFromRoute.value) {
    return;
  }
  page.value = 1;
});

watch([statusFilter, categoryFilter, brandFilter, needsCatalogOnly, page], () => {
  if (syncingFromRoute.value) {
    return;
  }
  syncRouteFromFilters();
});

watchDebounced(
  search,
  () => {
    if (syncingFromRoute.value) {
      return;
    }
    if (search.value.trim() !== routeSearchString().trim()) {
      page.value = 1;
    }
    syncRouteFromFilters();
  },
  { debounce: 350 },
);

const { data: categoriesData } = await useAPIFetch<Category[]>("/categories");
const { data: brandsData } = await useAPIFetch<Brand[]>("/brands");

const query = computed(() => ({
  search: searchDebounced.value.trim() || undefined,
  status: statusFilter.value !== "all" ? statusFilter.value : undefined,
  category_id: categoryFilter.value != null ? categoryFilter.value : undefined,
  brand_id: brandFilter.value != null ? brandFilter.value : undefined,
  needs_catalog: needsCatalogOnly.value ? 1 : undefined,
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

const categoryFilterItems = computed(() => [
  { label: "Toutes les catégories", value: undefined as number | undefined },
  ...(categoriesData.value ?? []).map((c) => ({ label: c.name, value: c.id })),
]);

const brandFilterItems = computed(() => [
  { label: "Toutes les marques", value: undefined as number | undefined },
  ...(brandsData.value ?? []).map((b) => ({ label: b.name, value: b.id })),
]);

function isProductCatalogIncomplete(p: Product): boolean {
  if (p.category_id == null) {
    return true;
  }

  return p.category_group_id == null && p.subcategory_id == null;
}

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
    accessorKey: "section",
    header: "Accueil",
    meta: { class: { td: "w-28" } },
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

function getLandingSectionLabel(section: string | null) {
  switch (section) {
    case "selections":
      return "Sélections";
    case "new-arrival":
      return "Nouveautés";
    case "best-seller":
      return "Best seller";
    default:
      return "—";
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Produits">
        <template #right>
          <UButton icon="i-lucide-plus" label="Ajouter un produit" color="primary" :to="createProductLocation()" />
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
            <USelectMenu
              v-model="categoryFilter"
              :items="categoryFilterItems"
              placeholder="Catégorie"
              size="sm"
              class="min-w-44 max-w-56"
              label-key="label"
              value-key="value" />
            <USelectMenu
              v-model="brandFilter"
              :items="brandFilterItems"
              placeholder="Marque"
              size="sm"
              class="min-w-40 max-w-48"
              label-key="label"
              value-key="value" />
            <div
              class="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50/80 px-2.5 py-1.5 shrink-0">
              <USwitch v-model="needsCatalogOnly" size="sm" />
              <span class="text-xs font-medium text-amber-900 leading-tight max-w-44 sm:max-w-none">
                À catégoriser
                <span class="hidden sm:inline text-amber-800/90 font-normal"> (sans cat. ou sans groupe / sous-cat.)</span>
              </span>
            </div>
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

          <template #section-cell="{ row }">
            <span class="text-xs text-neutral-600">{{ getLandingSectionLabel(row.original.section) }}</span>
          </template>

          <template #category_display-cell="{ row }">
            <div class="flex flex-col gap-1 items-start">
              <UBadge
                v-if="isProductCatalogIncomplete(row.original)"
                color="warning"
                variant="subtle"
                size="xs"
                class="shrink-0">
                À catégoriser
              </UBadge>
              <span
                v-if="row.original.category_name || row.original.category_group_name || row.original.subcategory_name"
                class="text-sm text-neutral-700">
                <template v-if="row.original.subcategory_name">
                  {{ row.original.category_name }} / {{ row.original.category_group_name }} / {{ row.original.subcategory_name }}
                </template>
                <template v-else-if="row.original.category_group_name">
                  {{ row.original.category_name }} / {{ row.original.category_group_name }}
                </template>
                <template v-else>
                  {{ row.original.category_name ?? row.original.subcategory_name }}
                </template>
              </span>
              <span v-else class="text-neutral-400 text-sm">—</span>
            </div>
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
            <div class="flex items-center justify-end gap-1 bg-neutral-50 rounded-lg border border-neutral-200 p-1">
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
              <USeparator orientation="vertical" class="h-4" />
              <UTooltip text="Modifier le produit" :delay-duration="0">
                <UButton
                  icon="i-lucide-pencil"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  aria-label="Modifier"
                  :to="editProductLocation(row.original.id)" />
              </UTooltip>
              <USeparator orientation="vertical" class="h-4" />
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
