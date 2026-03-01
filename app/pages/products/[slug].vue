<script setup lang="ts">
const route = useRoute();

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
  brand?: ProductBrand;
  currentPrice: string;
  oldPrice?: string;
  stockStatus: string;
  category: ProductCategory;
}

const siteName = "Gametech.ma";

const product = ref<Product>({
  id: 1,
  slug: "amd-ryzen-9-5950x",
  sku: "RYZEN-5950X-001",
  title: "AMD Ryzen 9 5950X 16 Cores 32 Threads",
  description:
    "Le processeur AMD Ryzen 9 5950X offre 16 cœurs et 32 threads pour des performances exceptionnelles en création de contenu et en jeu. Basé sur l'architecture Zen 3, il offre une fréquence de base de 3,4 GHz et un boost jusqu'à 4,9 GHz. Idéal pour le montage vidéo, le rendu 3D et les applications exigeantes.",
  shortDescription:
    "Processeur AMD Ryzen 9 5950X 16 cœurs 32 threads, architecture Zen 3. Performances exceptionnelles pour la création et le gaming.",
  images: [
    "https://pcgameragadir.ma/storage/uploads/products/68cee28d7b94c/ryzen-9-5950x_large.webp",
    "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=800&h=800&fit=crop",
    "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&h=800&fit=crop",
  ],
  brand: {
    name: "AMD",
    image: "https://pcgameragadir.ma/storage/uploads/brands/amd.png",
  },
  currentPrice: "4 999 MAD",
  oldPrice: "5 499 MAD",
  stockStatus: "EN STOCK",
  category: { name: "Processeurs", slug: "processeurs" },
});

const suggestedProducts = ref([
  {
    id: 2,
    slug: "intel-core-i7-13700k",
    title: "Intel Core i7-13700K 16 Cores",
    image:
      "https://pcgameragadir.ma/storage/uploads/products/68cee28d7b94c/ryzen-9-5950x_large.webp",
    currentPrice: "3 699 MAD",
    oldPrice: "4 400 MAD",
    stockStatus: "EN STOCK",
  },
  {
    id: 3,
    slug: "nvidia-rtx-4070-ti",
    title: "NVIDIA GeForce RTX 4070 Ti 12GB",
    image:
      "https://pcgameragadir.ma/storage/uploads/products/68cee28d7b94c/ryzen-9-5950x_large.webp",
    currentPrice: "8 399 MAD",
    oldPrice: "9 199 MAD",
    stockStatus: "EN STOCK",
  },
  {
    id: 4,
    slug: "samsung-990-pro-1tb",
    title: "Samsung 990 Pro 1TB NVMe Gen4",
    image:
      "https://pcgameragadir.ma/storage/uploads/products/68cee28d7b94c/ryzen-9-5950x_large.webp",
    currentPrice: "899 MAD",
    oldPrice: "999 MAD",
    stockStatus: "EN STOCK",
  },
  {
    id: 5,
    slug: "corsair-vengeance-ddr5",
    title: "Corsair Vengeance RGB DDR5 32GB 6000MHz",
    image:
      "https://pcgameragadir.ma/storage/uploads/products/68cee28d7b94c/ryzen-9-5950x_large.webp",
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

const breadcrumbItems = computed(() => [
  { label: "Accueil", to: "/" },
  {
    label: product.value.category.name,
    to: `/categories/${product.value.category.slug}`,
  },
  { label: product.value.title, to: undefined },
]);

// SEO
const getOrigin = () => {
  if (import.meta.client && typeof window !== "undefined")
    return window.location.origin;
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

const pageTitle = computed(() => `${product.value.title} | ${siteName}`);
const metaDescription = computed(() => product.value.shortDescription);

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
  const priceStr = product.value.currentPrice
    .replace(/\s/g, "")
    .replace("MAD", "")
    .trim();
  const price = Number.parseInt(priceStr, 10) || 0;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.value.title,
    description: product.value.shortDescription,
    image: product.value.images,
    sku: product.value.sku,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "MAD",
      availability:
        product.value.stockStatus === "EN STOCK"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
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

function onAddToCart() {
  // Placeholder: will connect to API / cart later
}
</script>

<template>
  <UContainer class="py-6 sm:py-8">
    <!-- Breadcrumb -->
    <nav aria-label="Breadcrumb" class="mb-6">
      <ol class="flex flex-wrap items-center gap-1.5 text-sm text-neutral-600">
        <template v-for="(item, i) in breadcrumbItems" :key="i">
          <li v-if="i" aria-hidden="true" class="flex items-center gap-1.5">
            <UIcon
              name="i-lucide-chevron-right"
              class="size-3.5 shrink-0 text-neutral-400"
            />
          </li>
          <li class="flex items-center">
            <NuxtLink
              v-if="item.to"
              :to="item.to"
              class="hover:text-neutral-900 hover:underline"
            >
              {{ item.label }}
            </NuxtLink>
            <span
              v-else
              class="font-medium text-neutral-900 truncate max-w-[200px] sm:max-w-none"
            >
              {{ item.label }}
            </span>
          </li>
        </template>
      </ol>
    </nav>

    <!-- Product layout: gallery + info -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 mb-12">
      <!-- Gallery -->
      <div class="space-y-3">
        <div
          class="relative aspect-square rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden"
        >
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
              class:
                'absolute left-2 top-1/2 -translate-y-1/2 size-10 rounded-full shadow-lg bg-white/90 hover:bg-white',
              onClick: onClickPrev,
            }"
            :next="{
              color: 'neutral',
              variant: 'solid',
              icon: 'i-lucide-chevron-right',
              class:
                'absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-full shadow-lg bg-white/90 hover:bg-white',
              onClick: onClickNext,
            }"
            @select="onSelect"
          >
            <div
              class="w-full h-full aspect-square flex items-center justify-center"
            >
              <NuxtImg
                :src="item"
                :alt="`${product.title} - Image`"
                class="w-full h-full object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </UCarousel>
          <div v-else class="w-full h-full flex items-center justify-center">
            <UIcon name="i-lucide-image" class="text-neutral-400 text-6xl" />
          </div>
        </div>
        <div class="flex gap-3 pt-4 max-w-xs mx-auto mb-4">
          <div
            v-for="(item, index) in product.images"
            :key="index"
            class="size-11 opacity-25 hover:opacity-100 transition-opacity border border-muted rounded-md overflow-hidden"
            :class="{
              'opacity-100 border-accented': activeImageIndex === index,
            }"
            @click="selectImage(index)"
          >
            <NuxtImg
              :src="item"
              class="object-contain w-full h-full aspect-square"
            />
          </div>
        </div>
      </div>

      <!-- Product info -->
      <div class="flex flex-col">
        <!-- Brand -->
        <div v-if="product.brand" class="flex items-center gap-2 mb-3">
          <NuxtImg
            v-if="product.brand.image"
            :src="product.brand.image"
            :alt="product.brand.name"
            class="size-8 object-contain"
          />
          <span class="text-sm font-medium text-neutral-500">{{
            product.brand.name
          }}</span>
        </div>

        <h1
          class="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mb-3"
        >
          {{ product.title }}
        </h1>

        <div class="flex flex-wrap items-center gap-3 mb-4">
          <span
            class="rounded-full bg-brand-accent-500 text-brand-accent-950 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide"
          >
            {{ product.stockStatus }}
          </span>
          <span class="text-sm text-neutral-500">Réf. {{ product.sku }}</span>
          <div
            v-if="product.oldPrice"
            class="rounded-md bg-secondary-500/95 px-2 py-1 text-xs font-semibold text-secondary-950"
          >
            En Promo
          </div>
        </div>

        <div class="flex flex-col gap-1 mb-6">
          <span
            v-if="product.oldPrice"
            class="text-lg text-neutral-400 line-through tabular-nums"
          >
            {{ product.oldPrice }}
          </span>
          <span
            class="text-2xl sm:text-3xl font-bold tabular-nums text-primary-700"
          >
            {{ product.currentPrice }}
          </span>
        </div>

        <UButton
          size="lg"
          label="Ajouter au panier"
          icon="i-lucide-shopping-cart"
          class="w-full sm:w-auto min-w-48"
          @click="onAddToCart"
        />
      </div>
    </div>

    <!-- Description -->
    <section class="border-t border-neutral-200 pt-8 mb-12">
      <h2 class="text-lg font-semibold text-neutral-900 mb-3">Description</h2>
      <p class="text-neutral-600 whitespace-pre-line max-w-3xl">
        {{ product.description }}
      </p>
    </section>

    <!-- Suggested products -->
    <section>
      <h2 class="text-xl font-bold text-neutral-900 mb-6">
        Vous aimerez aussi
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <ProductCard
          v-for="item in suggestedProducts"
          :key="item.id"
          :to="`/products/${item.slug}`"
          :image="item.image"
          :title="item.title"
          :current-price="item.currentPrice"
          :old-price="item.oldPrice"
          :stock-status="item.stockStatus"
        />
      </div>
    </section>
  </UContainer>
</template>
