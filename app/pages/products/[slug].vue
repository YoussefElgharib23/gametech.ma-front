<script setup lang="ts">
const route = useRoute();
const slug = computed(() => String(route.params.slug ?? ""));

interface ProductBrand {
  name: string;
  image?: string;
}

interface ProductCategory {
  name: string;
  slug: string;
}

interface Product {
  id: number;
  slug: string;
  sku: string;
  title: string;
  description: string;
  shortDescription: string;
  images: string[];
  brand?: ProductBrand | null;
  currentPrice: string;
  oldPrice?: string | null;
  savingsLabel?: string | null;
  stockStatus: string;
  category: ProductCategory | null;
}

const siteName = "Gametech.ma";

const {
  data: productData,
  error: productError,
  pending: productPending,
} = await useAPIFetch<Product>(() => `/products/${encodeURIComponent(slug.value)}`, {
  transform: (data: { data: Product }) => data.data,
});

const product = computed(() => {
  const p = productData.value;
  if (!p) {
    return {
      id: 0,
      slug: slug.value,
      sku: "",
      title: "",
      description: "",
      shortDescription: "",
      images: [],
      brand: null,
      currentPrice: "",
      oldPrice: null,
      savingsLabel: null,
      stockStatus: "",
      category: null,
    } as Product;
  }
  return p;
});

const productNotFound = computed(() => !!productError.value || (!productPending.value && !productData.value && slug.value));

const suggestedProducts = ref([
  {
    id: 2,
    slug: "intel-core-i7-13700k",
    title: "Intel Core i7-13700K 16 Cores",
    image: "https://pcgameragadir.ma/storage/uploads/products/68cee28d7b94c/ryzen-9-5950x_large.webp",
    currentPrice: "3 699 MAD",
    oldPrice: "4 400 MAD",
    stockStatus: "EN STOCK",
  },
  {
    id: 3,
    slug: "nvidia-rtx-4070-ti",
    title: "NVIDIA GeForce RTX 4070 Ti 12GB",
    image: "https://pcgameragadir.ma/storage/uploads/products/68cee28d7b94c/ryzen-9-5950x_large.webp",
    currentPrice: "8 399 MAD",
    oldPrice: "9 199 MAD",
    stockStatus: "EN STOCK",
  },
  {
    id: 4,
    slug: "samsung-990-pro-1tb",
    title: "Samsung 990 Pro 1TB NVMe Gen4",
    image: "https://pcgameragadir.ma/storage/uploads/products/68cee28d7b94c/ryzen-9-5950x_large.webp",
    currentPrice: "899 MAD",
    oldPrice: "999 MAD",
    stockStatus: "EN STOCK",
  },
  {
    id: 5,
    slug: "corsair-vengeance-ddr5",
    title: "Corsair Vengeance RGB DDR5 32GB 6000MHz",
    image: "https://pcgameragadir.ma/storage/uploads/products/68cee28d7b94c/ryzen-9-5950x_large.webp",
    currentPrice: "1 199 MAD",
    stockStatus: "EN STOCK",
  },
]);

const activeImageIndex = ref(0);
const carouselRef = useTemplateRef("carousel");

function onClickPrev() {
  activeImageIndex.value--;
}

function onClickNext() {
  activeImageIndex.value++;
}

function onSelect(index: number) {
  activeImageIndex.value = index;
}

function selectImage(index: number) {
  activeImageIndex.value = index;
  carouselRef.value?.emblaApi?.scrollTo(index);
}

const breadcrumbItems = computed(() => {
  const items: { label: string; to?: string }[] = [{ label: "Accueil", to: "/" }];
  if (product.value.category) {
    items.push({
      label: product.value.category.name,
      to: `/categories/${product.value.category.slug}`,
    });
  }
  items.push({ label: product.value.title || "Produit", to: undefined });
  return items;
});

// SEO
const getOrigin = () => {
  if (import.meta.client && typeof window !== "undefined") return window.location.origin;
  try {
    const u = useRequestURL();
    return u?.origin ?? "";
  } catch {
    return "";
  }
};
const canonicalPath = computed(() => `/products/${product.value.slug}`);
const canonicalHref = computed(() => {
  const origin = getOrigin();
  return origin ? `${origin}${canonicalPath.value}` : canonicalPath.value;
});
const ogImage = computed(() => product.value.images?.[0] ?? "");

const pageTitle = computed(() => `${product.value.title ?? ""} | ${siteName}`);
const metaDescription = computed(() => product.value.shortDescription ?? "");

useHead({
  title: () => pageTitle.value,
  meta: [{ name: "description", content: () => metaDescription.value }],
  link: [{ rel: "canonical", href: () => canonicalHref.value }],
});

useSeoMeta({
  title: () => `${product.value.title} | ${siteName}`,
  description: () => product.value.shortDescription,
  ogTitle: () => `${product.value.title} | ${siteName}`,
  ogDescription: () => product.value.shortDescription,
  ogImage: () => ogImage.value,
  ogUrl: () => canonicalHref.value,
  twitterCard: "summary_large_image",
  twitterTitle: () => `${product.value.title} | ${siteName}`,
  twitterDescription: () => product.value.shortDescription,
  twitterImage: () => ogImage.value,
});

const jsonLd = computed(() => {
  const p = product.value;
  const priceStr = String(p.currentPrice ?? "")
    .replace(/\s/g, "")
    .replace("MAD", "")
    .trim();
  const price = Number.parseInt(priceStr, 10) || 0;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title ?? "",
    description: p.shortDescription ?? "",
    image: p.images ?? [],
    sku: p.sku ?? "",
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "MAD",
      availability: p.stockStatus === "EN STOCK" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };
});

const jsonLdScript = computed(() => JSON.stringify(jsonLd.value));

useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: () => jsonLdScript.value,
    },
  ],
});

const { addItem } = useCart();
const recentlyAdded = ref(false);
let resetTimer: ReturnType<typeof setTimeout> | null = null;

async function onAddToCart() {
  if (!product.value.id) return;

  await addItem(product.value.id, 1);
  recentlyAdded.value = true;
  if (resetTimer) clearTimeout(resetTimer);
  resetTimer = setTimeout(() => {
    recentlyAdded.value = false;
  }, 3000);
}

onBeforeUnmount(() => {
  if (resetTimer) clearTimeout(resetTimer);
});
</script>

<template>
  <UContainer class="py-6 sm:py-8">
    <div v-if="productPending" class="flex items-center justify-center py-24">
      <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-neutral-400" />
    </div>
    <div v-else-if="productNotFound" class="py-24 text-center">
      <h1 class="text-xl font-semibold text-neutral-900 mb-2">Produit introuvable</h1>
      <p class="text-neutral-500 mb-4">Ce produit n'existe pas ou n'est plus disponible.</p>
      <UButton to="/" label="Retour à l'accueil" />
    </div>
    <template v-else>
      <!-- Breadcrumb -->
      <nav aria-label="Breadcrumb" class="mb-6">
        <ol class="flex flex-wrap items-center gap-1.5 text-sm text-neutral-600">
          <template v-for="(item, i) in breadcrumbItems" :key="i">
            <li v-if="i" aria-hidden="true" class="flex items-center gap-1.5">
              <UIcon name="i-lucide-chevron-right" class="size-3.5 shrink-0 text-neutral-400" />
            </li>
            <li class="flex items-center">
              <NuxtLink v-if="item.to" :to="item.to" class="hover:text-neutral-900 hover:underline">
                {{ item.label }}
              </NuxtLink>
              <span v-else class="font-medium text-neutral-900 truncate max-w-[200px] sm:max-w-none">
                {{ item.label }}
              </span>
            </li>
          </template>
        </ol>
      </nav>

      <!-- Product layout: gallery + info -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-12">
        <!-- Gallery -->
        <div class="space-y-3 sticky top-12 self-start">
          <div class="relative aspect-square rounded-xl border border-muted overflow-hidden">
            <div
              v-if="product.oldPrice && product.savingsLabel"
              class="absolute left-3 top-3 z-10 rounded-md bg-secondary-500/95 px-3 py-1.5 text-xs font-semibold text-secondary-950 shadow-sm flex flex-col items-start gap-0.5">
              <span>En Promo</span>
              <span class="text-[11px] leading-tight">
                {{ product.savingsLabel }}
              </span>
            </div>
            <UCarousel
              v-if="product.images?.length"
              ref="carousel"
              v-slot="{ item }"
              :items="product.images"
              :ui="{
                item: 'w-full',
                container: 'gap-0',
              }"
              arrows
              :prev="{
                color: 'neutral',
                variant: 'solid',
                icon: 'i-lucide-chevron-left',
                class: 'absolute left-2 top-1/2 -translate-y-1/2 size-10 rounded-full shadow-lg bg-white/90 hover:bg-white',
                onClick: onClickPrev,
              }"
              :next="{
                color: 'neutral',
                variant: 'solid',
                icon: 'i-lucide-chevron-right',
                class: 'absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-full shadow-lg bg-white/90 hover:bg-white',
                onClick: onClickNext,
              }"
              @select="onSelect">
              <div class="w-full h-full aspect-square flex items-center justify-center">
                <NuxtImg
                  :src="item"
                  :alt="`${product.title} - Image`"
                  class="w-full h-full object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw" />
              </div>
            </UCarousel>
            <div v-else class="w-full h-full flex items-center justify-center">
              <UIcon name="i-lucide-image" class="text-neutral-400 text-6xl" />
            </div>
          </div>
          <div class="flex gap-3 pt-4">
            <div
              v-for="(item, index) in product.images"
              :key="index"
              class="size-11 opacity-25 hover:opacity-100 transition-opacity border border-muted rounded-md overflow-hidden"
              :class="{
                'opacity-100 border-accented': activeImageIndex === index,
              }"
              @click="selectImage(index)">
              <NuxtImg :src="item" class="object-contain w-full h-full aspect-square" />
            </div>
          </div>
        </div>

        <!-- Product info -->
        <div class="flex flex-col">
          <!-- Brand -->
          <div v-if="product.brand" class="flex items-center gap-2 mb-3">
            <div class="ring ring-accented rounded-md overflow-hidden">
              <NuxtImg
                v-if="product.brand.image"
                :src="product.brand.image"
                :alt="product.brand.name"
                class="size-8 object-contain" />
            </div>
            <span class="font-medium text-neutral-500">{{ product.brand.name }}</span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mb-3">
            {{ product.title }}
          </h1>

          <div class="flex flex-wrap items-center gap-3 mb-4">
            <span
              class="rounded-full bg-brand-accent-500 text-brand-accent-950 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide">
              {{ product.stockStatus }}
            </span>
            <span class="text-sm text-neutral-500">Réf. {{ product.sku }}</span>
          </div>

          <div class="flex flex-col gap-1 mb-6">
            <span v-if="product.oldPrice" class="text-lg text-neutral-400 line-through tabular-nums">
              {{ product.oldPrice }}
            </span>
            <span class="text-2xl sm:text-3xl font-bold tabular-nums text-primary-700">
              {{ product.currentPrice }}
            </span>
          </div>

          <UButton
            :label="recentlyAdded ? 'Ajoute au panier' : 'Ajouter au panier'"
            :icon="recentlyAdded ? 'i-lucide-check' : 'i-lucide-shopping-cart'"
            :variant="recentlyAdded ? 'soft' : 'solid'"
            class="h-10 w-full text-center justify-center"
            :disabled="recentlyAdded"
            @click="onAddToCart" />

          <div
            v-if="product.description"
            class="prose prose-sm mt-4 w-full max-w-none prose-p:w-full"
            v-html="product.description" />
          <div v-else class="prose prose-sm mt-4 w-full max-w-none prose-p:w-full text-neutral-500">
            <p>Aucune description disponible.</p>
          </div>
        </div>
      </div>

      <!-- Suggested products -->
      <section>
        <h2 class="text-xl font-bold text-neutral-900 mb-6">Vous aimerez aussi</h2>
        <UCarousel
          v-slot="{ item }"
          :items="suggestedProducts"
          :slides-to-scroll="1"
          :ui="{
            item: 'basis-1/2 sm:basis-1/3 lg:basis-1/4 shrink-0',
            container: 'gap-3',
            viewport: 'overflow-hidden',
          }"
          arrows
          :prev="{
            color: 'neutral',
            variant: 'ghost',
            icon: 'i-lucide-chevron-left',
            class: 'hidden sm:flex -left-4 top-1/2 -translate-y-1/2 rounded-full',
          }"
          :next="{
            color: 'neutral',
            variant: 'ghost',
            icon: 'i-lucide-chevron-right',
            class: 'hidden sm:flex -right-4 top-1/2 -translate-y-1/2 rounded-full',
          }"
          class="relative">
          <div class="py-1">
            <ProductCard
              :to="`/products/${item.slug}`"
              :image="item.image"
              :title="item.title"
              :current-price="item.currentPrice"
              :old-price="item.oldPrice"
              :stock-status="item.stockStatus"
              @add-to-cart="addItem(item.id, 1)" />
          </div>
        </UCarousel>
      </section>
    </template>
  </UContainer>
</template>

<style scoped>
@reference "~/assets/css/main.css";

:deep(table) {
  @apply w-full border border-gray-300 dark:border-neutral-700 rounded-md table-auto table text-sm;
}

:deep(table *) {
  @apply !m-0;
}

:deep(table th) {
  @apply !px-4 py-2 bg-gray-100 font-semibold text-left;
}

:deep(table td) {
  @apply !px-4 py-2 border-t border-gray-200 dark:border-neutral-700;
}

:deep(table td:not(:last-child)),
:deep(table th:not(:last-child)) {
  @apply border-r border-gray-200 dark:border-neutral-700;
}

/* Table Resize Cursors */
:deep(table) {
  cursor: default;
}

:deep(table colgroup col) {
  cursor: default;
}

:deep(table colgroup col:hover) {
  cursor: default;
}

:deep(table tbody tr:hover) {
  cursor: default;
}
</style>
