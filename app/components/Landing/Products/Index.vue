<script lang="ts">
export type ProductLandingTab = "selections" | "new-arrival" | "best-seller";

export interface LandingProductCard {
  id: number;
  slug: string;
  title: string;
  image: string | null;
  images?: string[];
  stockStatus: string;
  currentPrice: string;
  oldPrice?: string | null;
}

export interface LandingProductsBySection {
  selections: LandingProductCard[];
  "new-arrival": LandingProductCard[];
  "best-seller": LandingProductCard[];
}
</script>

<script setup lang="ts">
type TabType = ProductLandingTab;

const props = defineProps<{
  /** When omitted (e.g. dashboard preview), built-in demo data is used. */
  landingProducts?: LandingProductsBySection;
}>();

const demoImage = "https://pcgameragadir.ma/storage/uploads/products/TlF3g1GFIpyjcKALFS0rQz13SnqAaCVMfRJXTxjs_small.jpg";

function demoCard(id: number, slug: string, title: string, currentPrice: string, oldPrice?: string): LandingProductCard {
  return {
    id,
    slug,
    title,
    image: demoImage,
    images: [demoImage],
    stockStatus: "EN STOCK",
    currentPrice,
    oldPrice: oldPrice ?? undefined,
  };
}

const builtInDemo = (): LandingProductsBySection => ({
  selections: [
    demoCard(1, "demo-ryzen", "AMD Ryzen 9 5950X 16 Cores 32 Threads", "4 999 MAD", "5 499 MAD"),
    demoCard(2, "demo-i7", "Intel Core i7-13700K 16 Cores", "3 699 MAD", "4 400 MAD"),
    demoCard(3, "demo-ram", "Corsair Vengeance RGB DDR5 32GB 6000MHz", "1 199 MAD"),
    demoCard(4, "demo-gpu", "NVIDIA GeForce RTX 4070 Ti 12GB", "8 399 MAD", "9 199 MAD"),
    demoCard(5, "demo-ssd", "Samsung 990 Pro 1TB NVMe Gen4", "899 MAD", "999 MAD"),
    demoCard(6, "demo-rx", "AMD Radeon RX 7900 XTX 24GB", "10 799 MAD", "12 200 MAD"),
  ],
  "new-arrival": [
    demoCard(21, "demo-7800x3d", "AMD Ryzen 7 7800X3D 8 Cores 3D V-Cache", "3 299 MAD", "3 599 MAD"),
    demoCard(22, "demo-4070s", "Gigabyte AORUS RTX 4070 Super", "6 499 MAD", "6 899 MAD"),
    demoCard(23, "demo-ddr5", "Kingston Fury Beast DDR5 16GB 5600MHz", "599 MAD"),
    demoCard(24, "demo-b760", "ASUS TUF Gaming B760-Plus WIFI", "1 799 MAD", "2 199 MAD"),
  ],
  "best-seller": [
    demoCard(41, "demo-5950x", "AMD Ryzen 9 5950X 16 Cores 32 Threads", "4 799 MAD", "5 299 MAD"),
    demoCard(42, "demo-4070", "NVIDIA GeForce RTX 4070 12GB", "5 999 MAD", "6 499 MAD"),
    demoCard(43, "demo-hx", "HyperX Fury DDR4 32GB 3200MHz", "699 MAD"),
    demoCard(44, "demo-980", "Samsung 980 Pro 500GB NVMe", "549 MAD", "649 MAD"),
  ],
});

const data = computed(() => (props.landingProducts !== undefined ? props.landingProducts : builtInDemo()));

const activeTab = ref<string>("selections");

const tabs = [
  { value: "selections", label: "Nos sélections", icon: "i-lucide-star" },
  { value: "new-arrival", label: "Nouvel arrivage", icon: "i-lucide-sparkles" },
  { value: "best-seller", label: "Best seller", icon: "i-lucide-trophy" },
];

const currentProducts = computed(() => {
  switch (activeTab.value as TabType) {
    case "selections":
      return data.value.selections;
    case "new-arrival":
      return data.value["new-arrival"];
    case "best-seller":
      return data.value["best-seller"];
    default:
      return data.value.selections;
  }
});

const hasAnyProducts = computed(
  () => data.value.selections.length > 0 || data.value["new-arrival"].length > 0 || data.value["best-seller"].length > 0,
);

const firstRowProducts = computed(() => currentProducts.value.slice(0, 6));

const secondRowProducts = computed(() => currentProducts.value.slice(6, 12));

const carouselRow1 = useTemplateRef<{ emblaApi: unknown }>("carouselRow1");
const carouselRow2 = useTemplateRef<{ emblaApi: unknown }>("carouselRow2");

const scrollPrev = () => {
  (carouselRow1.value as { emblaApi?: { scrollPrev: () => void } })?.emblaApi?.scrollPrev();
  (carouselRow2.value as { emblaApi?: { scrollPrev: () => void } })?.emblaApi?.scrollPrev();
};

const scrollNext = () => {
  (carouselRow1.value as { emblaApi?: { scrollNext: () => void } })?.emblaApi?.scrollNext();
  (carouselRow2.value as { emblaApi?: { scrollNext: () => void } })?.emblaApi?.scrollNext();
};
</script>

<template>
  <UContainer v-if="hasAnyProducts" class="py-8">
    <!-- Tab Navigation -->
    <div class="flex items-center justify-center mb-6">
      <div class="sm:block hidden">
        <UButton
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="ghost"
          size="lg"
          aria-label="Précédent"
          class="rounded-full"
          @click="scrollPrev" />
      </div>
      <div class="max-w-2xl mx-auto sm:block hidden">
        <UTabs
          variant="pill"
          class="w-full"
          :content="false"
          :items="tabs"
          v-model="activeTab"
          :ui="{
            root: 'flex items-center justify-center gap-1',
            list: 'flex items-center gap-2 rounded-full border border-muted shadow-xs',
            trigger: 'uppercase font-semibold text-sm py-2.5 text-sm',
            indicator: 'rounded-full',
          }" />
      </div>
      <div class="sm:hidden flex items-center justify-center gap-2">
        <UButton
          v-for="tab in tabs"
          :key="tab.value"
          :color="activeTab === tab.value ? 'primary' : 'neutral'"
          :variant="activeTab === tab.value ? 'solid' : 'outline'"
          size="xs"
          :label="tab.label"
          :icon="tab.icon"
          @click="activeTab = tab.value" />
      </div>
      <div class="sm:block hidden">
        <UButton
          icon="i-lucide-chevron-right"
          color="neutral"
          variant="ghost"
          size="lg"
          aria-label="Suivant"
          class="rounded-full"
          @click="scrollNext" />
      </div>
    </div>

    <div v-if="!currentProducts.length" class="py-10 text-center text-neutral-500">Aucun produit dans cette sélection.</div>

    <!-- First Row Carousel -->
    <div v-if="firstRowProducts.length" class="mb-4">
      <UCarousel
        ref="carouselRow1"
        v-slot="{ item }"
        :items="firstRowProducts"
        :slides-to-scroll="1"
        :autoplay="{ delay: 3000 }"
        :ui="{
          item: 'basis-1/2 sm:basis-1/5 shrink-0',
          container: 'gap-1',
          viewport: 'overflow-hidden',
        }">
        <div class="py-2">
          <ProductCard
            :to="`/products/${item.slug}`"
            :image="item.image ?? ''"
            :images="item.images ?? []"
            :stock-status="item.stockStatus"
            :title="item.title"
            :current-price="item.currentPrice"
            :old-price="item.oldPrice ?? ''" />
        </div>
      </UCarousel>
    </div>

    <!-- Second Row Carousel -->
    <div v-if="secondRowProducts.length">
      <UCarousel
        ref="carouselRow2"
        v-slot="{ item }"
        :items="secondRowProducts"
        :slides-to-scroll="1"
        :autoplay="{ delay: 3000 }"
        :ui="{
          item: 'basis-1/2 sm:basis-1/5 shrink-0',
          container: 'gap-1',
          viewport: 'overflow-hidden',
        }">
        <div class="py-2">
          <ProductCard
            :to="`/products/${item.slug}`"
            :image="item.image ?? ''"
            :images="item.images ?? []"
            :stock-status="item.stockStatus"
            :title="item.title"
            :current-price="item.currentPrice"
            :old-price="item.oldPrice ?? ''" />
        </div>
      </UCarousel>
    </div>
  </UContainer>
</template>
