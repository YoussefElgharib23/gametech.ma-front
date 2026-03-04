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
  savingsLabel?: string;
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
  savingsLabel: "Économisez 500 MAD",
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
      <div class="space-y-3 sticky top-12 self-start">
        <div
          class="relative aspect-square rounded-xl border border-muted overflow-hidden"
        >
          <div
            v-if="product.oldPrice && product.savingsLabel"
            class="absolute left-3 top-3 z-10 rounded-md bg-secondary-500/95 px-3 py-1.5 text-xs font-semibold text-secondary-950 shadow-sm flex flex-col items-start gap-0.5"
          >
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
        <div class="flex gap-3 pt-4">
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
          label="Ajouter au panier"
          icon="i-lucide-shopping-cart"
          class="h-10 w-full text-center justify-center"
          @click="onAddToCart"
        />

        <div class="prose prose-sm mt-4 w-full max-w-none prose-p:w-full">
          <p>
            Plongez dans une expérience <em>ultime</em> où performance rime avec
            élégance : le <strong>MSI Vector 16 HX A14VGG</strong> vous propulse
            au cœur du jeu et de la création sans concessions. Sous un design
            raffiné couleur <em>Cosmo Gray</em>, sa puissance délivre un rendu
            fluide et réactif, que ce soit pour jouer, monter des vidéos 4K ou
            modéliser en 3D. Le
            <strong>processeur Intel i9‑14900HX</strong> allié à 32 Go de RAM
            DDR5 assure une exécution sans latence, tandis que la
            <strong>RTX 4070 8 Go</strong> offre un rendu graphique immersif,
            ray tracing et DLSS compris.
          </p>
          <p>
            Côté confort et immersion, vous profitez d’un écran
            <strong>16″ QHD+ (2560×1600) 240 Hz</strong> aux angles larges
            (IPS-level) qui restitue les moindres détails avec fluidité.
            L’intégration d’un système audio calibré pour le gaming
            (haut-parleurs stéréo, technologie audio avancée) assure un rendu
            sonore dynamique, idéal pour entendre chaque pas, explosion ou
            musique d’ambiance. Le châssis, bien ventilé grâce au système
            <strong>Cooler Boost 5</strong> (double ventilateur et plusieurs
            caloducs), maintient une bonne dissipation thermique pour un usage
            <em>prolongé</em> sans surchauffe excessive.
          </p>
          <p>
            Avec son clavier <strong>SteelSeries per‑key RGB</strong>, chaque
            touche s’éclaire et réagit selon vos préférences, rendant
            l’interface visuelle aussi part intégrante de votre univers. Le tout
            dans un format fin (22,20 à 28,55 mm d’épaisseur), suffisamment
            léger pour une machine gamer (≈ 2,7 kg), offrant un bon compromis
            pour transport et puissance. Le MSI Vector 16 HX A14VGG est le
            compagnon idéal pour les créateurs et gamers exigeants, alliant
            <strong>performance extrême</strong>,
            <strong>audio immersif</strong> et
            <strong>confort longue durée</strong>.
          </p>
          <hr />
          <h3>Caractéristiques techniques</h3>
          <ul>
            <li>
              <p>
                <strong>Modèle produit</strong> : MSI Vector 16 HX A14VGG
                (référence 426MA)
                <a
                  target="_blank"
                  rel="noopener"
                  class="text-blue-500 underline flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium transition-colors duration-150 ease-in-out text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]!"
                  href="https://www.ultrapc.ma/pc-portables-gamer/9289-msi-vector-16-hx-a14vgg-426ma-intel-i9-14900hx-32gb-ddr5-1tb-ssd-rtx-4070-8gb-16-240hz-win11.html?srsltid=AfmBOopIrHpiuAoYg9PyEdpjqPj8IXhAurQZzk4nsaGxTT8VH1Q_Td4u&amp;utm_source=chatgpt.com"
                  >UltraPC</a
                >
              </p>
            </li>
            <li>
              <p>
                <strong>Processeur (CPU)</strong> : Intel Core i9‑14900HX
                (jusqu’à 5,8 GHz, 24 cœurs [8P + 16E])
                <a
                  target="_blank"
                  rel="noopener"
                  class="text-blue-500 underline flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium transition-colors duration-150 ease-in-out text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]!"
                  href="https://fr.msi.com/Laptop/Vector-16-HX-A14VX/Specification/?utm_source=chatgpt.com"
                  >MSI+2UltraPC+2</a
                >
              </p>
            </li>
            <li>
              <p>
                <strong>Carte graphique (GPU)</strong> : NVIDIA GeForce RTX 4070
                8 Go GDDR6 (jusqu’à 2175 MHz boost)
                <a
                  target="_blank"
                  rel="noopener"
                  class="text-blue-500 underline flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium transition-colors duration-150 ease-in-out text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]!"
                  href="https://www.msi.com/Laptop/Vector-16-HX-A14VX/Specification?utm_source=chatgpt.com"
                  >UltraPC+3MSI+3MSI Store+3</a
                >
              </p>
            </li>
            <li>
              <p>
                <strong>Mémoire vive (RAM)</strong> : 32 Go DDR5 (2 × 16 Go) –
                extensible jusqu’à 96 Go
                <a
                  target="_blank"
                  rel="noopener"
                  class="text-blue-500 underline flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium transition-colors duration-150 ease-in-out text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]!"
                  href="https://www.msi.com/Laptop/Vector-16-HX-A14VX/Specification?utm_source=chatgpt.com"
                  >MSI+2UltraPC+2</a
                >
              </p>
            </li>
            <li>
              <p>
                <strong>Stockage</strong> : SSD 1 To NVMe PCIe Gen4
                <a
                  target="_blank"
                  rel="noopener"
                  class="text-blue-500 underline flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium transition-colors duration-150 ease-in-out text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]!"
                  href="https://us-store.msi.com/Laptops/Gaming-Series/Vector-GP-Series/Vector-16-HX-A14VGG-254US?utm_source=chatgpt.com"
                  >MSI+3MSI Store+3UltraPC+3</a
                >
              </p>
            </li>
            <li>
              <p>
                <strong>Écran</strong> : 16″ QHD+ (2560×1600),
                <strong>240 Hz</strong>, IPS‑level, 100 % DCI‑P3 typique
                <a
                  target="_blank"
                  rel="noopener"
                  class="text-blue-500 underline flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium transition-colors duration-150 ease-in-out text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]!"
                  href="https://fr.msi.com/Laptop/Vector-16-HX-A14VX/Specification/?utm_source=chatgpt.com"
                  >MSI+3MSI+3MSI+3</a
                >
              </p>
            </li>
            <li>
              <p>
                <strong>Poids (avec batterie)</strong> : ~ 2,7 kg
                <a
                  target="_blank"
                  rel="noopener"
                  class="text-blue-500 underline flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium transition-colors duration-150 ease-in-out text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]!"
                  href="https://www.msi.com/Laptop/Vector-16-HX-A14VX/Specification?utm_source=chatgpt.com"
                  >MSI+1</a
                >
              </p>
            </li>
            <li>
              <p>
                <strong>Dimensions (L × P × H)</strong> : 357 × 284 ×
                22,20‑28,55 mm
                <a
                  target="_blank"
                  rel="noopener"
                  class="text-blue-500 underline flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium transition-colors duration-150 ease-in-out text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]!"
                  href="https://www.msi.com/Laptop/Vector-16-HX-A14VX/Specification?utm_source=chatgpt.com"
                  >MSI+1</a
                >
              </p>
            </li>
            <li>
              <p>
                <strong>Batterie</strong> : 4 cellules, 90 Whr
                <a
                  target="_blank"
                  rel="noopener"
                  class="text-blue-500 underline flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium transition-colors duration-150 ease-in-out text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]!"
                  href="https://www.msi.com/Laptop/Vector-16-HX-A14VX/Specification?utm_source=chatgpt.com"
                  >MSI+1</a
                >
              </p>
            </li>
            <li>
              <p>
                <strong>Alimentation</strong> : adaptateur 280 W (variable selon
                configuration)
                <a
                  target="_blank"
                  rel="noopener"
                  class="text-blue-500 underline flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium transition-colors duration-150 ease-in-out text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]!"
                  href="https://us-store.msi.com/Laptops/Gaming-Series/Vector-GP-Series/Vector-16-HX-A14VGG-254US?utm_source=chatgpt.com"
                  >MSI Store+1</a
                >
              </p>
            </li>
            <li>
              <p>
                <strong>Connectique</strong> :<br />  • 1 × Thunderbolt™ 4
                (DisplayPort)
                <a
                  target="_blank"
                  rel="noopener"
                  class="text-blue-500 underline flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium transition-colors duration-150 ease-in-out text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]!"
                  href="https://www.msi.com/Laptop/Vector-16-HX-A14VX/Specification?utm_source=chatgpt.com"
                  >MSI+2MSI Store+2</a
                ><br />  • 1 × USB‑C (USB 3.2 Gen2 / DisplayPort)
                <a
                  target="_blank"
                  rel="noopener"
                  class="text-blue-500 underline flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium transition-colors duration-150 ease-in-out text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]!"
                  href="https://us-store.msi.com/Laptops/Gaming-Series/Vector-GP-Series/Vector-16-HX-A14VGG-254US?utm_source=chatgpt.com"
                  >MSI Store+2MSI+2</a
                ><br />  • 1 × USB‑C (USB 3.2 Gen2 / DisplayPort / Power
                Delivery)
                <a
                  target="_blank"
                  rel="noopener"
                  class="text-blue-500 underline flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium transition-colors duration-150 ease-in-out text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]!"
                  href="https://www.msi.com/Laptop/Vector-16-HX-A14VX/Specification?utm_source=chatgpt.com"
                  >MSI+1</a
                ><br />  • 1 × USB-A USB3.2 Gen2, 1 × USB-A USB3.2 Gen1
                <a
                  target="_blank"
                  rel="noopener"
                  class="text-blue-500 underline flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium transition-colors duration-150 ease-in-out text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]!"
                  href="https://www.msi.com/Laptop/Vector-16-HX-A14VX/Specification?utm_source=chatgpt.com"
                  >MSI+2MSI+2</a
                ><br />  • 1 × HDMI 2.1 (8K @ 60 Hz / 4K @ 120 Hz)
                <a
                  target="_blank"
                  rel="noopener"
                  class="text-blue-500 underline flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium transition-colors duration-150 ease-in-out text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]!"
                  href="https://www.msi.com/Laptop/Vector-16-HX-A14VX/Specification?utm_source=chatgpt.com"
                  >MSI+2MSI+2</a
                ><br />  • 1 × lecteur SD Express (SD 7.0)
                <a
                  target="_blank"
                  rel="noopener"
                  class="text-blue-500 underline flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium transition-colors duration-150 ease-in-out text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]!"
                  href="https://us-store.msi.com/Laptops/Gaming-Series/Vector-GP-Series/Vector-16-HX-A14VGG-254US?utm_source=chatgpt.com"
                  >MSI Store+2MSI+2</a
                ><br />  • 1 × port RJ‑45 (LAN)
                <a
                  target="_blank"
                  rel="noopener"
                  class="text-blue-500 underline flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium transition-colors duration-150 ease-in-out text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]!"
                  href="https://www.msi.com/Laptop/Vector-16-HX-A14VX/Specification?utm_source=chatgpt.com"
                  >MSI+2MSI+2</a
                >
              </p>
            </li>
            <li>
              <p>
                <strong>Webcam</strong> : 720p HD avec volet de confidentialité
                (shutter)
                <a
                  target="_blank"
                  rel="noopener"
                  class="text-blue-500 underline flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium transition-colors duration-150 ease-in-out text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]!"
                  href="https://www.msi.com/Laptop/Vector-16-HX-A14VX?utm_source=chatgpt.com"
                  >MSI+2MSI Store+2</a
                >
              </p>
            </li>
            <li>
              <p>
                <strong>Clavier</strong> : SteelSeries per-key RGB anti‑ghost
                (rétroéclairé touche à touche)
                <a
                  target="_blank"
                  rel="noopener"
                  class="text-blue-500 underline flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium transition-colors duration-150 ease-in-out text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]!"
                  href="https://www.ldlc.com/fr-lu/fiche/PB00587921.html?utm_source=chatgpt.com"
                  >LDLC+2MSI Store+2</a
                >
              </p>
            </li>
            <li>
              <p>
                <strong>Système de refroidissement</strong> : Cooler Boost 5 (2
                ventilateurs + 6 caloducs, design optimisé)
                <a
                  target="_blank"
                  rel="noopener"
                  class="text-blue-500 underline flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium transition-colors duration-150 ease-in-out text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]!"
                  href="https://www.msi.com/Laptop/Vector-16-HX-A14VX?utm_source=chatgpt.com"
                  >MSI+2LDLC+2</a
                >
              </p>
            </li>
            <li>
              <p>
                <strong>Système d’exploitation</strong> : Windows 11 (version
                selon distribution)
                <a
                  target="_blank"
                  rel="noopener"
                  class="text-blue-500 underline flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium transition-colors duration-150 ease-in-out text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]!"
                  href="https://www.msi.com/Laptop/Vector-16-HX-A14VX/Specification?utm_source=chatgpt.com"
                  >MSI+2MSI+2</a
                >
              </p>
            </li>
          </ul>
          <p>
            <em
              >(Remarque : certaines variantes du Vector 16 HX utilisent une RTX
              4080 ou 4090, selon la configuration – ici la version 4070 est
              celle décrite) </em
            ><a
              target="_blank"
              rel="noopener"
              class="text-blue-500 underline flex h-4.5 overflow-hidden rounded-xl px-2 text-[9px] font-medium transition-colors duration-150 ease-in-out text-token-text-secondary! bg-[#F4F4F4]! dark:bg-[#303030]!"
              href="https://www.msi.com/Laptop/Vector-16-HX-A14VX/Specification?utm_source=chatgpt.com"
              ><em>MSI+1</em></a
            >
          </p>
          <hr />
          <h3>Points forts</h3>
          <ul>
            <li>
              <p>
                Puissance extrême avec
                <strong>Intel i9‑14900HX + RTX 4070</strong>
              </p>
            </li>
            <li>
              <p>
                Écran <strong>240 Hz QHD+</strong> pour une fluidité optimale
              </p>
            </li>
            <li>
              <p>
                Refroidissement <strong>Cooler Boost 5</strong> performant en
                charge
              </p>
            </li>
            <li>
              <p>
                Clavier
                <strong>SteelSeries RGB touche par touche</strong>
                personnalisable
              </p>
            </li>
            <li>
              <p>
                Format compact avec un bon rapport puissance/poids (~ 2,7 kg)
              </p>
            </li>
          </ul>
          <hr />
          <h3>Idéal pour…</h3>
          <ul>
            <li>
              <p>
                Les <strong>sessions de jeu prolongées</strong> en AAA ou
                esports
              </p>
            </li>
            <li>
              <p>
                Le <strong>montage vidéo / motion design / rendu 3D</strong>
              </p>
            </li>
            <li>
              <p>
                Le <strong>streaming et création de contenu</strong> (Twitch,
                YouTube)
              </p>
            </li>
            <li>
              <p>
                Le <strong>travail intensif multitâche</strong> (IDE, VM,
                développement, simulation)
              </p>
            </li>
            <li>
              <p>
                Les
                <strong>compétitions gaming locales ou LAN</strong> requérant
                réactivité et performance
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Suggested products -->
    <section>
      <h2 class="text-xl font-bold text-neutral-900 mb-6">
        Vous aimerez aussi
      </h2>
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
        class="relative"
      >
        <div class="py-1">
          <ProductCard
            :to="`/products/${item.slug}`"
            :image="item.image"
            :title="item.title"
            :current-price="item.currentPrice"
            :old-price="item.oldPrice"
            :stock-status="item.stockStatus"
          />
        </div>
      </UCarousel>
    </section>
  </UContainer>
</template>
