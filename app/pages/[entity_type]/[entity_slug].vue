<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";
import { refDebounced, useMediaQuery } from "@vueuse/core";

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

const mobileFiltersOpen = ref(false);

const mobileActiveFiltersCount = computed(() => {
  let count = 0;
  if (priceRange.value[0] !== minPrice.value || priceRange.value[1] !== maxPrice.value) {
    count += 1;
  }
  count += selectedBrands.value.length;
  if (stockStatusFilter.value !== "all") {
    count += 1;
  }
  if (promoFilter.value !== "all") {
    count += 1;
  }
  return count;
});

const isLargeScreen = useMediaQuery("(min-width: 1024px)");

watch(isLargeScreen, (wide) => {
  if (wide) {
    mobileFiltersOpen.value = false;
  }
});

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
    <div class="flex gap-6 w-full max-w-[1920px] mx-auto">
      <!-- Filters -->
      <aside class="hidden lg:block w-80 shrink-0">
        <div class="sticky top-14 space-y-4">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-neutral-600">Filtres</h2>

          <ArchiveEntityArchiveFiltersForm
            v-model:price-range="priceRange"
            v-model:brand-search-query="brandSearchQuery"
            v-model:selected-brands="selectedBrands"
            v-model:stock-status-filter="stockStatusFilter"
            v-model:promo-filter="promoFilter"
            :filter-items="filterItems"
            :filtered-brands="filteredBrands"
            :bounds-min="minPrice"
            :bounds-max="maxPrice" />

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
                <div class="min-w-0 w-full flex-1">
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
      <section ref="productsSectionRef" class="min-w-0 w-full flex-1">
        <div class="mb-6">
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            {{ archiveTitle }}
          </h1>
          <p class="mt-1 text-sm text-neutral-500">
            <span class="lg:hidden">
              Touchez
              <span class="font-medium text-neutral-700">Filtres</span>
              pour affiner par prix, marque, stock et promotions.
            </span>
            <span class="hidden lg:inline">
              Affinez votre recherche avec les filtres par prix et marque, puis explorez les produits correspondants.
            </span>
          </p>
        </div>

        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="min-w-0 text-sm text-neutral-500">
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
          <div class="flex flex-wrap items-center gap-2 sm:justify-end">
            <UButton
              class="shrink-0 lg:hidden"
              icon="i-lucide-sliders-horizontal"
              color="neutral"
              variant="outline"
              :label="mobileActiveFiltersCount ? `Filtres (${mobileActiveFiltersCount})` : 'Filtres'"
              @click="mobileFiltersOpen = true" />
            <div class="flex min-w-0 flex-1 items-center gap-2 sm:flex-initial">
              <span class="shrink-0 whitespace-nowrap text-sm text-neutral-500">Trier par</span>
              <USelectMenu
                v-model="sortBy"
                :items="sortOptions"
                value-key="value"
                :search-input="false"
                placeholder="Trier par"
                class="min-w-0 flex-1 sm:min-w-[180px]" />
            </div>
          </div>
        </div>

        <div v-if="filteredProducts.length" class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 grid-cols-2 gap-4">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :to="`/products/${product.slug}`"
            :image="product.image ?? ''"
            :images="product.images ?? []"
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

    <USlideover
      v-model:open="mobileFiltersOpen"
      title="Filtres"
      side="left"
      :ui="{
        header: 'p-4 border-b border-muted',
        body: 'p-4 overflow-y-auto overscroll-contain max-h-[calc(100dvh-9rem)]',
        footer: 'p-4 border-t border-muted',
      }">
      <template #body>
        <ArchiveEntityArchiveFiltersForm
          v-model:price-range="priceRange"
          v-model:brand-search-query="brandSearchQuery"
          v-model:selected-brands="selectedBrands"
          v-model:stock-status-filter="stockStatusFilter"
          v-model:promo-filter="promoFilter"
          :filter-items="filterItems"
          :filtered-brands="filteredBrands"
          :bounds-min="minPrice"
          :bounds-max="maxPrice" />
      </template>
      <template #footer>
        <UButton label="Voir les résultats" color="primary" block class="justify-center" @click="mobileFiltersOpen = false" />
      </template>
    </USlideover>
  </div>
</template>
