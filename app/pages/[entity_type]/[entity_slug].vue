<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";
import type { Ref } from "vue";
import { refDebounced } from "@vueuse/core";

const route = useRoute();
const { addItem } = useCart();

interface ArchiveProduct {
  id: number;
  slug: string;
  title: string;
  image: string | null;
  brand: string;
  brand_image?: string | null;
  stockStatus: string;
  price: number;
  priceLabel: string;
  oldPriceLabel?: string | null;
}

interface ArchiveEntity {
  type: string;
  slug: string;
  label: string;
}

interface ArchivePagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ArchiveMeta {
  min_price: number | null;
  max_price: number | null;
  pagination?: ArchivePagination;
}

interface ArchiveBrand {
  name: string;
  image?: string | null;
}

interface ArchiveResponse {
  entity: ArchiveEntity;
  products: ArchiveProduct[];
  meta: ArchiveMeta;
  sidebar_products: ArchiveProduct[];
  brands?: ArchiveBrand[] | string[];
}

const entityType = computed(() => String(route.params.entity_type || ""));
const entitySlug = computed(() => String(route.params.entity_slug || ""));

const allProducts = ref<ArchiveProduct[]>([]);
const archiveEntity = ref<ArchiveEntity | null>(null);

const selectedBrands = ref<string[]>([]);
const stockStatusFilter = ref<"all" | "in_stock" | "out_of_stock" | "preorder">("all");
const promoFilter = ref<"all" | "promo" | "no_promo">("all");

type SortOption = "default" | "price_asc" | "price_desc" | "latest" | "oldest";
const sortBy = ref<SortOption>("default");

const perPage = 24;
const currentPage = ref(1);

const sortOptions = [
  { value: "default" as const, label: "Par défaut" },
  { value: "latest" as const, label: "Plus récents" },
  { value: "oldest" as const, label: "Plus anciens" },
  { value: "price_asc" as const, label: "Prix croissant" },
  { value: "price_desc" as const, label: "Prix décroissant" },
];

// Price range used for API query and UI
const priceRange = ref<[number, number]>([0, 0]);

// Debounced versions to avoid hammering the API while user drags slider / toggles filters.
// Debounce each bound separately to avoid array/deep reactivity quirks.
const debouncedMinPrice = refDebounced(
  computed(() => priceRange.value[0]),
  300,
);
const debouncedMaxPrice = refDebounced(
  computed(() => priceRange.value[1]),
  300,
);
const debouncedSelectedBrands = refDebounced(selectedBrands, 300);

const query = computed(() => ({
  min_price: debouncedMinPrice.value || undefined,
  max_price: debouncedMaxPrice.value || undefined,
  brands: debouncedSelectedBrands.value.length ? debouncedSelectedBrands.value : undefined,
  stock_status: stockStatusFilter.value !== "all" ? stockStatusFilter.value : undefined,
  promo: promoFilter.value !== "all" ? promoFilter.value : undefined,
  sort: sortBy.value !== "default" ? sortBy.value : undefined,
  page: currentPage.value,
  per_page: perPage,
}));

const { data: archiveData } = await useAPIFetch<ArchiveResponse>(() => `/archive/${entityType.value}/${entitySlug.value}`, {
  query,
});

watch(
  archiveData,
  (val) => {
    allProducts.value = val?.products ?? [];
    archiveEntity.value = val?.entity ?? null;

    const meta = val?.meta;
    if (
      meta &&
      typeof meta.min_price === "number" &&
      typeof meta.max_price === "number" &&
      priceRange.value[0] === 0 &&
      priceRange.value[1] === 0
    ) {
      priceRange.value = [meta.min_price, meta.max_price];
    }
  },
  { immediate: true },
);

const allBrands = computed((): ArchiveBrand[] => {
  const raw = archiveData.value?.brands ?? Array.from(new Set(allProducts.value.map((p) => p.brand))).sort();
  if (!Array.isArray(raw)) return [];
  const first = raw[0];
  if (typeof first === "string") {
    return (raw as string[]).map((name) => ({ name, image: null }));
  }
  return raw as ArchiveBrand[];
});

const brandSearchQuery = ref("");

const filteredBrands = computed(() => {
  const q = brandSearchQuery.value.trim().toLowerCase();
  if (!q) return allBrands.value;
  return allBrands.value.filter((b) => b.name.toLowerCase().includes(q));
});

const toggleBrand = (name: string, checked: boolean) => {
  if (checked) {
    if (!selectedBrands.value.includes(name)) selectedBrands.value = [...selectedBrands.value, name];
  } else {
    selectedBrands.value = selectedBrands.value.filter((b) => b !== name);
  }
};

// Reset to page 1 when filters or sort change
watch([() => priceRange.value[0], () => priceRange.value[1], selectedBrands, stockStatusFilter, promoFilter, sortBy], () => {
  currentPage.value = 1;
});

const baseMinPrice = computed(() => archiveData.value?.meta.min_price ?? priceRange.value[0]);
const baseMaxPrice = computed(() => archiveData.value?.meta.max_price ?? priceRange.value[1]);

const pagination = computed(() => archiveData.value?.meta.pagination ?? null);

const paginationSummary = computed(() => {
  const p = pagination.value;
  if (!p || p.total === 0) return null;
  const from = (p.current_page - 1) * p.per_page + 1;
  const to = Math.min(p.current_page * p.per_page, p.total);
  return { from, to, total: p.total };
});

const productsSectionRef = ref<HTMLElement | null>(null);

function onPageChange() {
  nextTick(() => {
    productsSectionRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

// Aliases used in template bindings
const minPrice = baseMinPrice;
const maxPrice = baseMaxPrice;

const filterItems = ref<AccordionItem[]>([
  {
    label: "Prix",
    slot: "price",
    value: "price",
  },
  {
    label: "Marque",
    slot: "brand",
    value: "brand",
  },
  {
    label: "Stock",
    slot: "stock",
    value: "stock",
  },
  {
    label: "Promotion",
    slot: "promo",
    value: "promo",
  },
]);

// Products already come filtered from API based on query
const filteredProducts = computed(() => allProducts.value);

const sidebarProducts = computed(() => archiveData.value?.sidebar_products ?? []);

const hasPriceFilter = computed(() => priceRange.value[0] !== minPrice.value || priceRange.value[1] !== maxPrice.value);

const hasStockFilter = computed(() => stockStatusFilter.value !== "all");
const hasPromoFilter = computed(() => promoFilter.value !== "all");

const resetPriceFilter = () => {
  priceRange.value = [minPrice.value, maxPrice.value];
};

const clearBrandFilter = (brand?: string) => {
  if (!brand) {
    selectedBrands.value = [];
    return;
  }

  selectedBrands.value = selectedBrands.value.filter((b) => b !== brand);
};

const archiveTitle = computed(() => {
  if (archiveEntity.value?.label) {
    return archiveEntity.value.label;
  }
  if (!entityType.value) return "Produits";
  return `${entityType.value.replace(/-/g, " ")} – ${entitySlug.value.replace(/-/g, " ")}`;
});

useSeoMeta({
  title: () => `${archiveTitle.value} | Gametech.ma`,
  description: "Découvrez notre sélection de produits filtrables par prix et marque.",
});
</script>

<template>
  <div class="w-full py-6 px-4">
    <div class="flex gap-6 max-w-[1920px] mx-auto">
      <!-- Filters -->
      <aside class="hidden lg:block w-80 shrink-0">
        <div class="sticky top-14 space-y-4">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-neutral-600">Filtres</h2>

          <UAccordion :items="filterItems" type="multiple" class="divide-y divide-muted" :ui="{ body: 'sm:p-0 p-0' }">
            <template #price>
              <div class="p-4 space-y-4">
                <div class="flex items-center justify-between text-xs text-neutral-500">
                  <span>Plage de prix (MAD)</span>
                  <span class="tabular-nums font-medium text-neutral-700">{{ priceRange[0] }} – {{ priceRange[1] }}</span>
                </div>

                <USlider v-model="priceRange" :min="minPrice" :max="maxPrice" color="primary" />

                <div class="flex items-center gap-3 pt-2">
                  <UInput
                    v-model.number="priceRange[0]"
                    type="number"
                    size="xs"
                    :min="minPrice"
                    :max="priceRange[1]"
                    class="w-full"
                    placeholder="Min" />
                  <span class="text-xs text-neutral-400">–</span>
                  <UInput
                    v-model.number="priceRange[1]"
                    type="number"
                    size="xs"
                    :min="priceRange[0]"
                    :max="maxPrice"
                    class="w-full"
                    placeholder="Max" />
                </div>
              </div>
            </template>

            <template #brand>
              <div class="p-2">
                <p class="text-xs text-neutral-500 mb-2">Sélectionnez une ou plusieurs marques.</p>
                <UInput
                  v-model="brandSearchQuery"
                  placeholder="Rechercher une marque..."
                  size="sm"
                  icon="i-heroicons-magnifying-glass"
                  class="w-full" />
                <div class="max-h-64 overflow-y-auto space-y-1.5">
                  <label
                    v-for="brand in filteredBrands"
                    :key="brand.name"
                    class="flex cursor-pointer items-center gap-2.5 rounded-md p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    <UCheckbox
                      :model-value="selectedBrands.includes(brand.name)"
                      color="primary"
                      size="sm"
                      @update:model-value="(v) => toggleBrand(brand.name, v === true)" />
                    <img
                      v-if="brand.image"
                      :src="brand.image"
                      :alt="brand.name"
                      class="h-6 w-8 shrink-0 object-contain object-center"
                      loading="lazy" />
                    <span
                      v-else
                      class="h-6 w-8 shrink-0 flex items-center justify-center rounded bg-neutral-200 dark:bg-neutral-700 text-[10px] font-medium text-neutral-500">
                      {{ brand.name.slice(0, 2).toUpperCase() }}
                    </span>
                    <span class="truncate text-sm text-neutral-800 dark:text-neutral-200">{{ brand.name }}</span>
                  </label>
                </div>
              </div>
            </template>

            <template #stock>
              <div class="p-2">
                <p class="text-xs text-neutral-500">Filtrer par disponibilité.</p>
                <URadioGroup
                  v-model="stockStatusFilter"
                  :items="[
                    { label: 'Tous', value: 'all' },
                    { label: 'En stock', value: 'in_stock' },
                    { label: 'Rupture de stock', value: 'out_of_stock' },
                    { label: 'Pré-commande', value: 'preorder' },
                  ]"
                  size="xs"
                  color="primary" />
              </div>
            </template>

            <template #promo>
              <div class="p-2">
                <p class="text-xs text-neutral-500">Filtrer par promotion.</p>
                <URadioGroup
                  v-model="promoFilter"
                  :items="[
                    { label: 'Tous', value: 'all' },
                    { label: 'En promo', value: 'promo' },
                    { label: 'Non en promo', value: 'no_promo' },
                  ]"
                  size="xs"
                  color="primary" />
              </div>
            </template>
          </UAccordion>

          <div v-if="hasPriceFilter || selectedBrands.length || hasStockFilter || hasPromoFilter" class="space-y-2 pt-1 text-xs">
            <div v-if="hasPriceFilter" class="flex flex-col gap-1">
              <span class="text-xs font-medium text-neutral-500">Prix</span>
              <div class="flex items-center gap-1.5">
                <UBadge color="primary" variant="soft" size="xs" class="inline-flex items-center gap-1">
                  <span class="text-[11px]">{{ priceRange[0] }} – {{ priceRange[1] }}</span>
                  <button
                    type="button"
                    class="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-primary-700 hover:bg-primary-100"
                    @click.stop="resetPriceFilter">
                    ×
                  </button>
                </UBadge>
              </div>
            </div>

            <div v-if="selectedBrands.length" class="flex flex-col gap-1">
              <span class="text-xs font-medium text-neutral-500">Marque</span>
              <div class="flex flex-wrap gap-1.5">
                <UBadge
                  v-for="brand in selectedBrands"
                  :key="brand"
                  color="neutral"
                  variant="soft"
                  size="xs"
                  class="inline-flex items-center gap-1">
                  <span class="text-[11px]">{{ brand }}</span>
                  <button
                    type="button"
                    class="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-neutral-700 hover:bg-neutral-100"
                    @click.stop="clearBrandFilter(brand)">
                    ×
                  </button>
                </UBadge>
              </div>
            </div>

            <div v-if="hasStockFilter" class="flex flex-col gap-1">
              <span class="text-xs font-medium text-neutral-500">Stock</span>
              <div class="flex flex-wrap gap-1.5">
                <UBadge color="neutral" variant="soft" size="xs" class="inline-flex items-center gap-1">
                  <span class="text-[11px]">
                    {{
                      stockStatusFilter === "in_stock"
                        ? "En stock"
                        : stockStatusFilter === "out_of_stock"
                          ? "Rupture de stock"
                          : stockStatusFilter === "preorder"
                            ? "Pré-commande"
                            : ""
                    }}
                  </span>
                  <button
                    type="button"
                    class="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-neutral-700 hover:bg-neutral-100"
                    @click.stop="stockStatusFilter = 'all'">
                    ×
                  </button>
                </UBadge>
              </div>
            </div>

            <div v-if="hasPromoFilter" class="flex flex-col gap-1">
              <span class="text-xs font-medium text-neutral-500">Promotion</span>
              <div class="flex flex-wrap gap-1.5">
                <UBadge color="neutral" variant="soft" size="xs" class="inline-flex items-center gap-1">
                  <span class="text-[11px]">
                    {{ promoFilter === "promo" ? "En promo" : promoFilter === "no_promo" ? "Non en promo" : "" }}
                  </span>
                  <button
                    type="button"
                    class="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-neutral-700 hover:bg-neutral-100"
                    @click.stop="promoFilter = 'all'">
                    ×
                  </button>
                </UBadge>
              </div>
            </div>

            <button
              type="button"
              class="text-[11px] font-medium text-neutral-500 hover:text-neutral-700"
              @click.stop="
                () => {
                  resetPriceFilter();
                  clearBrandFilter();
                  stockStatusFilter = 'all';
                  promoFilter = 'all';
                }
              ">
              Tout effacer
            </button>
          </div>

          <div class="mt-6 space-y-3">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-neutral-600">Produits similaires</h3>
            <div class="space-y-3">
              <NuxtLink
                v-for="product in sidebarProducts"
                :key="product.id"
                :to="`/products/${product.slug}`"
                class="flex gap-3 rounded-lg border border-neutral-200/80 bg-white/80 p-3 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50">
                <div class="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                  <img :src="product.image" :alt="product.title" class="h-full w-full object-cover" loading="lazy" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-medium text-neutral-900 line-clamp-2">
                    {{ product.title }}
                  </p>
                  <p class="mt-1 text-xs font-semibold text-brand-accent-600">
                    {{ product.priceLabel }}
                    <span v-if="product.oldPriceLabel" class="ml-1 text-[11px] text-neutral-400 line-through">
                      {{ product.oldPriceLabel }}
                    </span>
                  </p>
                  <p v-if="product.stockStatus" class="mt-0.5 text-[11px] font-medium text-emerald-600">
                    {{ product.stockStatus }}
                  </p>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </aside>

      <!-- Products list -->
      <section ref="productsSectionRef" class="min-w-0">
        <div class="mb-6">
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            {{ archiveTitle }}
          </h1>
          <p class="mt-1 text-sm text-neutral-500">
            Affinez votre recherche avec les filtres par prix et marque, puis explorez les produits correspondants.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <p class="text-sm text-neutral-500">
            <template v-if="paginationSummary">
              {{ paginationSummary.from }}–{{ paginationSummary.to }} sur {{ paginationSummary.total }} produit
              <span v-if="paginationSummary.total > 1">s</span>
            </template>
            <template v-else>
              {{ filteredProducts.length }} produit
              <span v-if="filteredProducts.length > 1">s</span>
              trouvé
              <span v-if="filteredProducts.length > 1">s</span>
            </template>
          </p>
          <div class="flex items-center gap-2">
            <span class="text-sm text-neutral-500 whitespace-nowrap">Trier par</span>
            <USelectMenu
              v-model="sortBy"
              :items="sortOptions"
              value-key="value"
              :search-input="false"
              placeholder="Trier par"
              class="min-w-[180px]" />
          </div>
        </div>

        <div v-if="filteredProducts.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :to="`/products/${product.slug}`"
            :image="product.image ?? ''"
            :brand-name="product.brand"
            :brand-image="product.brand_image ?? ''"
            :title="product.title"
            :current-price="product.priceLabel"
            :old-price="product.oldPriceLabel ?? undefined"
            :stock-status="product.stockStatus"
            @add-to-cart="addItem(product.id, 1)" />
        </div>

        <div v-else class="py-16 text-center text-sm text-neutral-500">Aucun produit ne correspond à ces filtres.</div>

        <div v-if="pagination && pagination.last_page > 1" class="mt-8 flex flex-col items-center gap-4">
          <UPagination
            v-model:page="currentPage"
            :total="pagination.total"
            :items-per-page="pagination.per_page"
            :show-controls="true"
            show-edges
            :sibling-count="1"
            @update:page="onPageChange" />
        </div>
      </section>
    </div>
  </div>
</template>
