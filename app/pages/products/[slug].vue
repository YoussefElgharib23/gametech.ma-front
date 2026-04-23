<script setup lang="ts">
const route = useRoute();
const slug = computed(() => String(route.params.slug ?? ""));

interface ProductBrand {
  name: string;
  image?: string;
  slug: string;
}

interface ProductCategory {
  name: string;
  slug: string;
}

interface SuggestedProduct {
  id: number;
  slug: string;
  title: string;
  image: string | null;
  currentPrice: string;
  oldPrice?: string | null;
  stockStatus: string;
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
} = await useAPIFetch<{ data: Product; suggestedProducts: SuggestedProduct[] }>(
  () => `/products/${encodeURIComponent(slug.value)}`,
);

const product = computed(() => {
  const p = productData.value?.data;
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

const suggestedProducts = computed(() => productData.value?.suggestedProducts ?? []);

const activeImageIndex = ref(0);
const gallerySwiperRef = ref(null);
const suggestedSwiperRef = ref(null);

const gallerySwiper = useSwiper(gallerySwiperRef);
const suggestedSwiper = useSwiper(suggestedSwiperRef);

const gallerySwiperKey = computed(() => (product.value.images ?? []).join("|"));

const suggestedSwiperKey = computed(() =>
  suggestedProducts.value.map((p) => `${p.id}:${p.slug}`).join("|"),
);

function onClickPrev() {
  gallerySwiper.prev();
}

function onClickNext() {
  gallerySwiper.next();
}

function onGallerySlideChange(e: Event) {
  const swiper = (e?.target as any)?.swiper;
  if (!swiper) return;
  activeImageIndex.value = swiper.activeIndex ?? 0;
}

function selectImage(index: number) {
  activeImageIndex.value = index;
  const el = gallerySwiperRef.value as any;
  el?.swiper?.slideTo?.(index);
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
const toast = useToast();
const recentlyAdded = ref(false);
let resetTimer: ReturnType<typeof setTimeout> | null = null;
const requestingDevis = ref(false);
const devisModalOpen = ref(false);
const devisForm = ref({
  name: "",
  email: "",
  phone: "",
  address: "",
});

const normalizedStockStatus = computed(() => (product.value.stockStatus ?? "").trim().toLowerCase());
const isOutOfStock = computed(() => normalizedStockStatus.value.includes("rupture"));
const isPreorder = computed(() => normalizedStockStatus.value.includes("pré") || normalizedStockStatus.value.includes("pre"));

const stockBadgeClass = computed(() => {
  if (isOutOfStock.value) {
    return "bg-red-100 text-red-800";
  }
  if (isPreorder.value) {
    return "bg-amber-100 text-amber-900";
  }
  return "bg-brand-accent-500 text-brand-accent-950";
});

async function onAddToCart() {
  if (!product.value.id) return;
  if (isOutOfStock.value) return;

  await addItem(product.value.id, 1);
  recentlyAdded.value = true;
  if (resetTimer) clearTimeout(resetTimer);
  resetTimer = setTimeout(() => {
    recentlyAdded.value = false;
  }, 3000);
}

function openDevisModal() {
  if (!product.value.id) return;
  devisModalOpen.value = true;
}

function closeDevisModal() {
  devisModalOpen.value = false;
}

function validateDevisForm(): boolean {
  return (
    devisForm.value.name.trim().length > 0 &&
    devisForm.value.email.trim().length > 0 &&
    devisForm.value.phone.trim().length > 0 &&
    devisForm.value.address.trim().length > 0
  );
}

async function submitDevis() {
  if (!product.value.id) return;
  if (!validateDevisForm()) {
    toast.add({
      title: "Informations requises",
      description: "Veuillez remplir Nom, Email, Téléphone et Adresse.",
      color: "error",
    });
    return;
  }
  requestingDevis.value = true;
  try {
    const res = await $apiFetch<{ url: string }>("/devis/pc-config", {
      method: "POST",
      body: {
        customer: {
          name: devisForm.value.name.trim(),
          email: devisForm.value.email.trim(),
          phone: devisForm.value.phone.trim(),
          address: devisForm.value.address.trim(),
        },
        items: [{ product_id: product.value.id, quantity: 1 }],
      },
    });

    if (import.meta.client) {
      window.open(res.url, "_blank", "noopener,noreferrer");
    }
    closeDevisModal();
  } catch {
    toast.add({
      title: "Erreur",
      description: "Impossible de générer le devis pour le moment.",
      color: "error",
    });
  } finally {
    requestingDevis.value = false;
  }
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
        <div class="space-y-3 sm:sticky top-12 self-start">
          <div class="relative aspect-square rounded-xl border border-muted overflow-hidden">
            <div
              v-if="product.oldPrice && product.savingsLabel"
              class="absolute left-3 top-3 z-10 rounded-md bg-secondary-500/95 px-3 py-1.5 text-xs font-semibold text-secondary-950 shadow-sm flex flex-col items-start gap-0.5">
              <span>En Promo</span>
              <span class="text-[11px] leading-tight">
                {{ product.savingsLabel }}
              </span>
            </div>
            <ClientOnly>
              <swiper-container
                v-if="product.images?.length"
                ref="gallerySwiperRef"
                :key="gallerySwiperKey"
                :loop="true"
                :slides-per-view="1"
                :space-between="0"
                @swiperslidechange="onGallerySlideChange">
                <swiper-slide v-for="(item, idx) in product.images" :key="`${item}-${idx}`">
                  <div class="w-full h-full aspect-square flex items-center justify-center">
                    <NuxtImg
                      :src="item"
                      :alt="`${product.title} - Image`"
                      class="w-full h-full object-contain"
                      sizes="(max-width: 1024px) 100vw, 50vw" />
                  </div>
                </swiper-slide>
              </swiper-container>
              <template #fallback>
                <div v-if="product.images?.[0]" class="w-full h-full aspect-square flex items-center justify-center">
                  <NuxtImg
                    :src="product.images[0]"
                    :alt="`${product.title} - Image`"
                    class="w-full h-full object-contain"
                    sizes="(max-width: 1024px) 100vw, 50vw" />
                </div>
              </template>
            </ClientOnly>
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
          <NuxtLink v-if="product.brand" :to="`/brands/${product.brand.slug}`" class="flex items-center gap-2 mb-3">
            <div class="ring ring-accented rounded-md overflow-hidden">
              <NuxtImg
                v-if="product.brand.image"
                :src="product.brand.image"
                :alt="product.brand.name"
                class="size-8 object-contain" />
            </div>
            <span class="font-medium text-neutral-500">{{ product.brand.name }}</span>
          </NuxtLink>

          <h1 class="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight mb-3">
            {{ product.title }}
          </h1>

          <div class="flex flex-wrap items-center gap-3 mb-4">
            <span class="rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide" :class="stockBadgeClass">
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
            :label="isOutOfStock ? 'Indisponible' : recentlyAdded ? 'Ajouté au panier' : 'Ajouter au panier'"
            :icon="isOutOfStock ? 'i-lucide-ban' : recentlyAdded ? 'i-lucide-check' : 'i-lucide-shopping-cart'"
            :variant="isOutOfStock ? 'soft' : recentlyAdded ? 'soft' : 'solid'"
            class="h-10 w-full text-center justify-center"
            :disabled="recentlyAdded || isOutOfStock"
            @click="onAddToCart" />

          <UButton
            label="Demander le devis"
            icon="i-lucide-file-text"
            variant="soft"
            class="h-10 w-full text-center justify-center mt-2"
            :disabled="isOutOfStock || requestingDevis"
            :loading="requestingDevis"
            @click="openDevisModal" />

          <UModal
            v-model:open="devisModalOpen"
            title="Demander un devis"
            :ui="{
              header: 'sm:p-3 p-3',
              body: 'sm:p-3 p-3',
              footer: 'sm:p-3 p-3',
              content: 'divide-y-0',
            }"
            @close="closeDevisModal">
            <template #body>
              <form class="space-y-3" @submit.prevent="submitDevis">
                <UFormField label="Nom" required class="w-full">
                  <UInput v-model="devisForm.name" size="md" placeholder="Votre nom" class="w-full" />
                </UFormField>
                <UFormField label="Email" required class="w-full">
                  <UInput v-model="devisForm.email" type="email" size="md" placeholder="vous@exemple.com" class="w-full" />
                </UFormField>
                <UFormField label="Téléphone" required class="w-full">
                  <UInput v-model="devisForm.phone" size="md" placeholder="+212 ..." class="w-full" />
                </UFormField>
                <UFormField label="Adresse" required class="w-full">
                  <UTextarea
                    v-model="devisForm.address"
                    :rows="4"
                    size="md"
                    placeholder="Votre adresse complète"
                    class="w-full" />
                </UFormField>
              </form>
            </template>
            <template #footer>
              <div class="flex justify-end gap-2">
                <UButton color="neutral" variant="outline" label="Annuler" :disabled="requestingDevis" @click="closeDevisModal" />
                <UButton
                  color="primary"
                  label="Générer le devis"
                  icon="i-lucide-file-text"
                  :loading="requestingDevis"
                  :disabled="!validateDevisForm() || requestingDevis"
                  @click="submitDevis" />
              </div>
            </template>
          </UModal>

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
        <div class="relative">
          <ClientOnly>
            <swiper-container
              ref="suggestedSwiperRef"
              :key="suggestedSwiperKey"
              class="w-full"
              :loop="true"
              :space-between="12"
              :autoplay="{ delay: 1500, disableOnInteraction: false }"
              :slides-per-view="2"
              :mousewheel="{ forceToAxis: true }"
              :breakpoints="{
                640: { slidesPerView: 3, spaceBetween: 12 },
                1024: { slidesPerView: 4, spaceBetween: 16 },
              }">
              <swiper-slide v-for="item in suggestedProducts" :key="`${item.slug}-${item.id}`">
                <div class="py-1">
                  <ProductCard
                    :to="`/products/${item.slug}`"
                    :image="item.image ?? ''"
                    :title="item.title"
                    :current-price="item.currentPrice"
                    :old-price="item.oldPrice ?? undefined"
                    :stock-status="item.stockStatus"
                    @add-to-cart="addItem(item.id, 1)" />
                </div>
              </swiper-slide>
            </swiper-container>
            <template #fallback>
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <div v-for="item in suggestedProducts.slice(0, 8)" :key="item.id" class="py-1">
                  <ProductCard
                    :to="`/products/${item.slug}`"
                    :image="item.image ?? ''"
                    :title="item.title"
                    :current-price="item.currentPrice"
                    :old-price="item.oldPrice ?? undefined"
                    :stock-status="item.stockStatus"
                    @add-to-cart="addItem(item.id, 1)" />
                </div>
              </div>
            </template>
          </ClientOnly>
          <UButton
            v-if="suggestedSwiper.instance"
            icon="i-lucide-chevron-left"
            color="neutral"
            variant="ghost"
            aria-label="Précédent"
            class="hidden sm:flex absolute z-10 -start-10 top-1/2 -translate-y-1/2 rounded-full"
            @click="suggestedSwiper.prev()" />
          <UButton
            v-if="suggestedSwiper.instance"
            icon="i-lucide-chevron-right"
            color="neutral"
            variant="ghost"
            aria-label="Suivant"
            class="hidden sm:flex absolute z-10 -end-10 top-1/2 -translate-y-1/2 rounded-full"
            @click="suggestedSwiper.next()" />
        </div>
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
