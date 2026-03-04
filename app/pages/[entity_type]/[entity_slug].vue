<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";

const route = useRoute();

interface ArchiveProduct {
  id: number;
  slug: string;
  title: string;
  image: string;
  brand: string;
  stockStatus: string;
  price: number;
  priceLabel: string;
  oldPriceLabel?: string;
}

const entityType = computed(() => String(route.params.entity_type || ""));
const entitySlug = computed(() => String(route.params.entity_slug || ""));

// Mock products for the archive page – later replaced by API response
const allProducts = ref<ArchiveProduct[]>([
  {
    id: 1,
    slug: "amd-ryzen-9-5950x",
    title: "AMD Ryzen 9 5950X 16 Cores 32 Threads",
    image:
      "https://pcgameragadir.ma/storage/uploads/products/TlF3g1GFIpyjcKALFS0rQz13SnqAaCVMfRJXTxjs_small.jpg",
    brand: "AMD",
    stockStatus: "EN STOCK",
    price: 4999,
    priceLabel: "4 999 MAD",
    oldPriceLabel: "5 499 MAD",
  },
  {
    id: 2,
    slug: "intel-core-i7-13700k",
    title: "Intel Core i7-13700K 16 Cores",
    image:
      "https://pcgameragadir.ma/storage/uploads/products/TlF3g1GFIpyjcKALFS0rQz13SnqAaCVMfRJXTxjs_small.jpg",
    brand: "Intel",
    stockStatus: "EN STOCK",
    price: 3699,
    priceLabel: "3 699 MAD",
    oldPriceLabel: "4 400 MAD",
  },
  {
    id: 3,
    slug: "nvidia-rtx-4070-ti",
    title: "NVIDIA GeForce RTX 4070 Ti 12GB",
    image:
      "https://pcgameragadir.ma/storage/uploads/products/TlF3g1GFIpyjcKALFS0rQz13SnqAaCVMfRJXTxjs_small.jpg",
    brand: "NVIDIA",
    stockStatus: "EN STOCK",
    price: 8399,
    priceLabel: "8 399 MAD",
    oldPriceLabel: "9 199 MAD",
  },
  {
    id: 4,
    slug: "samsung-990-pro-1tb",
    title: "Samsung 990 Pro 1TB NVMe Gen4",
    image:
      "https://pcgameragadir.ma/storage/uploads/products/TlF3g1GFIpyjcKALFS0rQz13SnqAaCVMfRJXTxjs_small.jpg",
    brand: "Samsung",
    stockStatus: "EN STOCK",
    price: 899,
    priceLabel: "899 MAD",
    oldPriceLabel: "999 MAD",
  },
  {
    id: 5,
    slug: "corsair-vengeance-ddr5",
    title: "Corsair Vengeance RGB DDR5 32GB 6000MHz",
    image:
      "https://pcgameragadir.ma/storage/uploads/products/TlF3g1GFIpyjcKALFS0rQz13SnqAaCVMfRJXTxjs_small.jpg",
    brand: "Corsair",
    stockStatus: "EN STOCK",
    price: 1199,
    priceLabel: "1 199 MAD",
  },
  {
    id: 6,
    slug: "msi-mpg-b650",
    title: "MSI MPG B650 TOMAHAWK WIFI",
    image:
      "https://pcgameragadir.ma/storage/uploads/products/TlF3g1GFIpyjcKALFS0rQz13SnqAaCVMfRJXTxjs_small.jpg",
    brand: "MSI",
    stockStatus: "EN STOCK",
    price: 1899,
    priceLabel: "1 899 MAD",
  },
]);

const allBrands = computed(() =>
  Array.from(new Set(allProducts.value.map((p) => p.brand))).sort(),
);

const minPrice = computed(() =>
  Math.min(...allProducts.value.map((p) => p.price)),
);
const maxPrice = computed(() =>
  Math.max(...allProducts.value.map((p) => p.price)),
);

const priceRange = ref([minPrice.value, maxPrice.value]);

const selectedBrands = ref<string[]>([]);

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
]);

const filteredProducts = computed(() =>
  allProducts.value.filter((p) => {
    const [min, max] = priceRange.value;
    const inPriceRange =
      p.price >= (min ?? minPrice.value) && p.price <= (max ?? maxPrice.value);
    const brandOk =
      selectedBrands.value.length === 0 ||
      selectedBrands.value.includes(p.brand);
    return inPriceRange && brandOk;
  }),
);

const sidebarProducts = computed(() => allProducts.value.slice(0, 3));

const hasPriceFilter = computed(
  () =>
    priceRange.value[0] !== minPrice.value ||
    priceRange.value[1] !== maxPrice.value,
);

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
  if (!entityType.value) return "Produits";
  return `${entityType.value.replace(/-/g, " ")} – ${entitySlug.value.replace(
    /-/g,
    " ",
  )}`;
});

useSeoMeta({
  title: () => `${archiveTitle.value} | Gametech.ma`,
  description:
    "Découvrez notre sélection de produits filtrables par prix et marque.",
});
</script>

<template>
  <div class="w-full py-6 px-4">
    <div class="flex gap-6 max-w-[1920px] mx-auto">
      <!-- Filters -->
      <aside class="hidden lg:block w-80 shrink-0">
        <div class="sticky top-14 space-y-4">
          <h2
            class="text-sm font-semibold uppercase tracking-wide text-neutral-600"
          >
            Filtres
          </h2>

          <UAccordion
            type="multiple"
            :items="filterItems"
            :unmount-on-hide="false"
            class="divide-y divide-muted"
            default-value="price"
          >
            <template #price>
              <div class="p-4 space-y-4">
                <div
                  class="flex items-center justify-between text-xs text-neutral-500"
                >
                  <span>Plage de prix (MAD)</span>
                  <span class="tabular-nums font-medium text-neutral-700">
                    {{ priceRange[0] }} – {{ priceRange[1] }}
                  </span>
                </div>

                <USlider
                  v-model="priceRange"
                  :min="minPrice"
                  :max="maxPrice"
                  :step="100"
                  color="primary"
                />

                <div class="flex items-center gap-3 pt-2">
                  <UInput
                    v-model.number="priceRange[0]"
                    type="number"
                    size="xs"
                    :min="minPrice"
                    :max="priceRange[1]"
                    class="w-full"
                    placeholder="Min"
                  />
                  <span class="text-xs text-neutral-400">–</span>
                  <UInput
                    v-model.number="priceRange[1]"
                    type="number"
                    size="xs"
                    :min="priceRange[0]"
                    :max="maxPrice"
                    class="w-full"
                    placeholder="Max"
                  />
                </div>
              </div>
            </template>

            <template #brand>
              <div class="p-4 space-y-3">
                <p class="text-xs text-neutral-500">
                  Sélectionnez une ou plusieurs marques.
                </p>
                <div class="max-h-64 overflow-y-auto">
                  <UCheckboxGroup
                    v-model="selectedBrands"
                    :items="allBrands"
                    color="primary"
                  />
                </div>
              </div>
            </template>
          </UAccordion>

          <div
            v-if="hasPriceFilter || selectedBrands.length"
            class="space-y-2 pt-1 text-xs"
          >
            <div v-if="hasPriceFilter" class="flex flex-col gap-1">
              <span class="text-xs font-medium text-neutral-500"> Prix </span>
              <div class="flex items-center gap-1.5">
                <UBadge
                  color="primary"
                  variant="soft"
                  size="xs"
                  class="inline-flex items-center gap-1"
                >
                  <span class="text-[11px]">
                    {{ priceRange[0] }} – {{ priceRange[1] }}
                  </span>
                  <button
                    type="button"
                    class="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-primary-700 hover:bg-primary-100"
                    @click.stop="resetPriceFilter"
                  >
                    ×
                  </button>
                </UBadge>
              </div>
            </div>

            <div v-if="selectedBrands.length" class="flex flex-col gap-1">
              <span class="text-xs font-medium text-neutral-500"> Marque </span>
              <div class="flex flex-wrap gap-1.5">
                <UBadge
                  v-for="brand in selectedBrands"
                  :key="brand"
                  color="neutral"
                  variant="soft"
                  size="xs"
                  class="inline-flex items-center gap-1"
                >
                  <span class="text-[11px]">{{ brand }}</span>
                  <button
                    type="button"
                    class="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-neutral-700 hover:bg-neutral-100"
                    @click.stop="clearBrandFilter(brand)"
                  >
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
                }
              "
            >
              Tout effacer
            </button>
          </div>

          <div class="mt-6 space-y-3">
            <h3
              class="text-xs font-semibold uppercase tracking-wide text-neutral-600"
            >
              Produits similaires
            </h3>
            <div class="space-y-3">
              <NuxtLink
                v-for="product in sidebarProducts"
                :key="product.id"
                :to="`/products/${product.slug}`"
                class="flex gap-3 rounded-lg border border-neutral-200/80 bg-white/80 p-3 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
              >
                <div
                  class="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-neutral-100"
                >
                  <img
                    :src="product.image"
                    :alt="product.title"
                    class="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-xs font-medium text-neutral-900 line-clamp-2">
                    {{ product.title }}
                  </p>
                  <p class="mt-1 text-xs font-semibold text-brand-accent-600">
                    {{ product.priceLabel }}
                    <span
                      v-if="product.oldPriceLabel"
                      class="ml-1 text-[11px] text-neutral-400 line-through"
                    >
                      {{ product.oldPriceLabel }}
                    </span>
                  </p>
                  <p
                    v-if="product.stockStatus"
                    class="mt-0.5 text-[11px] font-medium text-emerald-600"
                  >
                    {{ product.stockStatus }}
                  </p>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>
      </aside>

      <!-- Products list -->
      <section class="min-w-0">
        <div class="mb-6">
          <h1
            class="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900"
          >
            {{ archiveTitle }}
          </h1>
          <p class="mt-1 text-sm text-neutral-500">
            Affinez votre recherche avec les filtres par prix et marque, puis
            explorez les produits correspondants.
          </p>
        </div>

        <div class="flex items-center justify-between mb-4">
          <p class="text-sm text-neutral-500">
            {{ filteredProducts.length }} produit<span
              v-if="filteredProducts.length > 1"
              >s</span
            >
            trouvé<span v-if="filteredProducts.length > 1">s</span>
          </p>
        </div>

        <div
          v-if="filteredProducts.length"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :to="`/products/${product.slug}`"
            :image="product.image"
            :title="product.title"
            :current-price="product.priceLabel"
            :old-price="product.oldPriceLabel"
            :stock-status="product.stockStatus"
          />
        </div>

        <div v-else class="py-16 text-center text-sm text-neutral-500">
          Aucun produit ne correspond à ces filtres.
        </div>
      </section>
    </div>
  </div>
</template>
