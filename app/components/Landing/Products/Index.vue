<script setup lang="ts">
type TabType = "selections" | "new-arrival" | "best-seller";

const activeTab = ref<string>("selections");

const tabs = [
  { value: "selections", label: "Nos sélections", icon: "i-lucide-star" },
  { value: "new-arrival", label: "Nouvel arrivage", icon: "i-lucide-sparkles" },
  { value: "best-seller", label: "Best seller", icon: "i-lucide-trophy" },
];

const selectionsProducts = ref([
  {
    id: 1,
    image: "/images/products/product-1.jpg",
    stockStatus: "EN STOCK",
    title: "Product Title 1",
    currentPrice: "999 MAD",
    oldPrice: "1 399 MAD",
  },
  {
    id: 2,
    image: "/images/products/product-2.jpg",
    stockStatus: "EN STOCK",
    title: "Product Title 2",
    currentPrice: "3 699 MAD",
    oldPrice: "4 400 MAD",
  },
  {
    id: 3,
    image: "/images/products/product-3.jpg",
    stockStatus: "EN STOCK",
    title: "Product Title 3",
    currentPrice: "119 MAD",
  },
  {
    id: 4,
    image: "/images/products/product-4.jpg",
    stockStatus: "EN STOCK",
    title: "Product Title 4",
    currentPrice: "1 399 MAD",
    oldPrice: "1 800 MAD",
  },
  {
    id: 5,
    image: "/images/products/product-5.jpg",
    stockStatus: "EN STOCK",
    title: "Product Title 5",
    currentPrice: "255 MAD",
    oldPrice: "284 MAD",
  },
  {
    id: 6,
    image: "/images/products/product-6.jpg",
    stockStatus: "EN STOCK",
    title: "Product Title 6",
    currentPrice: "10 799 MAD",
    oldPrice: "12 200 MAD",
  },
  {
    id: 7,
    image: "/images/products/product-7.jpg",
    stockStatus: "EN STOCK",
    title: "Product Title 7",
    currentPrice: "379 MAD",
  },
  {
    id: 8,
    image: "/images/products/product-8.jpg",
    stockStatus: "EN STOCK",
    title: "Product Title 8",
    currentPrice: "1 399 MAD",
  },
  {
    id: 9,
    image: "/images/products/product-9.jpg",
    stockStatus: "EN STOCK",
    title: "Product Title 9",
    currentPrice: "299 MAD",
  },
  {
    id: 10,
    image: "/images/products/product-10.jpg",
    stockStatus: "EN STOCK",
    title: "Product Title 10",
    currentPrice: "2 099 MAD",
  },
  {
    id: 11,
    image: "/images/products/product-11.jpg",
    stockStatus: "EN STOCK",
    title: "Product Title 11",
    currentPrice: "699 MAD",
    oldPrice: "1 060 MAD",
  },
  {
    id: 12,
    image: "/images/products/product-12.jpg",
    stockStatus: "EN STOCK",
    title: "Product Title 12",
    currentPrice: "11 999 MAD",
  },
]);

const newArrivalProducts = ref([
  {
    id: 21,
    image: "/images/products/new-1.jpg",
    stockStatus: "EN STOCK",
    title: "New Product 1",
    currentPrice: "1 299 MAD",
    oldPrice: "1 599 MAD",
  },
  {
    id: 22,
    image: "/images/products/new-2.jpg",
    stockStatus: "EN STOCK",
    title: "New Product 2",
    currentPrice: "2 499 MAD",
    oldPrice: "2 899 MAD",
  },
  {
    id: 23,
    image: "/images/products/new-3.jpg",
    stockStatus: "EN STOCK",
    title: "New Product 3",
    currentPrice: "899 MAD",
  },
  {
    id: 24,
    image: "/images/products/new-4.jpg",
    stockStatus: "EN STOCK",
    title: "New Product 4",
    currentPrice: "1 799 MAD",
    oldPrice: "2 199 MAD",
  },
  {
    id: 25,
    image: "/images/products/new-5.jpg",
    stockStatus: "EN STOCK",
    title: "New Product 5",
    currentPrice: "3 299 MAD",
    oldPrice: "3 699 MAD",
  },
  {
    id: 26,
    image: "/images/products/new-6.jpg",
    stockStatus: "EN STOCK",
    title: "New Product 6",
    currentPrice: "599 MAD",
  },
  {
    id: 27,
    image: "/images/products/new-7.jpg",
    stockStatus: "EN STOCK",
    title: "New Product 7",
    currentPrice: "4 999 MAD",
    oldPrice: "5 499 MAD",
  },
  {
    id: 28,
    image: "/images/products/new-8.jpg",
    stockStatus: "EN STOCK",
    title: "New Product 8",
    currentPrice: "1 199 MAD",
  },
  {
    id: 29,
    image: "/images/products/new-9.jpg",
    stockStatus: "EN STOCK",
    title: "New Product 9",
    currentPrice: "2 799 MAD",
    oldPrice: "3 199 MAD",
  },
  {
    id: 30,
    image: "/images/products/new-10.jpg",
    stockStatus: "EN STOCK",
    title: "New Product 10",
    currentPrice: "6 499 MAD",
    oldPrice: "7 199 MAD",
  },
  {
    id: 31,
    image: "/images/products/new-11.jpg",
    stockStatus: "EN STOCK",
    title: "New Product 11",
    currentPrice: "999 MAD",
  },
  {
    id: 32,
    image: "/images/products/new-12.jpg",
    stockStatus: "EN STOCK",
    title: "New Product 12",
    currentPrice: "8 799 MAD",
    oldPrice: "9 999 MAD",
  },
]);

const bestSellerProducts = ref([
  {
    id: 41,
    image: "/images/products/best-1.jpg",
    stockStatus: "EN STOCK",
    title: "Best Seller 1",
    currentPrice: "1 599 MAD",
    oldPrice: "1 999 MAD",
  },
  {
    id: 42,
    image: "/images/products/best-2.jpg",
    stockStatus: "EN STOCK",
    title: "Best Seller 2",
    currentPrice: "3 999 MAD",
    oldPrice: "4 599 MAD",
  },
  {
    id: 43,
    image: "/images/products/best-3.jpg",
    stockStatus: "EN STOCK",
    title: "Best Seller 3",
    currentPrice: "499 MAD",
  },
  {
    id: 44,
    image: "/images/products/best-4.jpg",
    stockStatus: "EN STOCK",
    title: "Best Seller 4",
    currentPrice: "2 299 MAD",
    oldPrice: "2 699 MAD",
  },
  {
    id: 45,
    image: "/images/products/best-5.jpg",
    stockStatus: "EN STOCK",
    title: "Best Seller 5",
    currentPrice: "5 499 MAD",
    oldPrice: "6 199 MAD",
  },
  {
    id: 46,
    image: "/images/products/best-6.jpg",
    stockStatus: "EN STOCK",
    title: "Best Seller 6",
    currentPrice: "799 MAD",
  },
  {
    id: 47,
    image: "/images/products/best-7.jpg",
    stockStatus: "EN STOCK",
    title: "Best Seller 7",
    currentPrice: "1 899 MAD",
    oldPrice: "2 299 MAD",
  },
  {
    id: 48,
    image: "/images/products/best-8.jpg",
    stockStatus: "EN STOCK",
    title: "Best Seller 8",
    currentPrice: "4 299 MAD",
  },
  {
    id: 49,
    image: "/images/products/best-9.jpg",
    stockStatus: "EN STOCK",
    title: "Best Seller 9",
    currentPrice: "3 599 MAD",
    oldPrice: "4 099 MAD",
  },
  {
    id: 50,
    image: "/images/products/best-10.jpg",
    stockStatus: "EN STOCK",
    title: "Best Seller 10",
    currentPrice: "9 999 MAD",
    oldPrice: "11 499 MAD",
  },
  {
    id: 51,
    image: "/images/products/best-11.jpg",
    stockStatus: "EN STOCK",
    title: "Best Seller 11",
    currentPrice: "1 299 MAD",
  },
  {
    id: 52,
    image: "/images/products/best-12.jpg",
    stockStatus: "EN STOCK",
    title: "Best Seller 12",
    currentPrice: "7 299 MAD",
    oldPrice: "8 199 MAD",
  },
]);

const currentProducts = computed(() => {
  switch (activeTab.value as TabType) {
    case "selections":
      return selectionsProducts.value;
    case "new-arrival":
      return newArrivalProducts.value;
    case "best-seller":
      return bestSellerProducts.value;
    default:
      return selectionsProducts.value;
  }
});

const firstRowProducts = computed(() => {
  return currentProducts.value.slice(0, 6);
});

const secondRowProducts = computed(() => {
  return currentProducts.value.slice(6, 12);
});

const carouselRow1 = useTemplateRef<{ emblaApi: any }>("carouselRow1");
const carouselRow2 = useTemplateRef<{ emblaApi: any }>("carouselRow2");

const scrollPrev = () => {
  carouselRow1.value?.emblaApi?.scrollPrev();
  carouselRow2.value?.emblaApi?.scrollPrev();
};

const scrollNext = () => {
  carouselRow1.value?.emblaApi?.scrollNext();
  carouselRow2.value?.emblaApi?.scrollNext();
};
</script>

<template>
  <UContainer class="py-8">
    <!-- Tab Navigation -->
    <div class="flex items-center justify-center mb-6">
      <UButton
        icon="i-lucide-chevron-left"
        color="neutral"
        variant="ghost"
        size="lg"
        aria-label="Précédent"
        class="rounded-full"
        @click="scrollPrev"
      />
      <div class="max-w-2xl mx-auto">
        <UTabs
          v-model="activeTab"
          :items="tabs"
          color="secondary"
          variant="pill"
          :content="false"
          class="w-full"
          :ui="{
            root: 'flex items-center justify-center gap-1',
            list: 'flex items-center gap-2',
            trigger: 'uppercase font-semibold',
          }"
        />
      </div>
      <UButton
        icon="i-lucide-chevron-right"
        color="neutral"
        variant="ghost"
        size="lg"
        aria-label="Suivant"
        class="rounded-full"
        @click="scrollNext"
      />
    </div>

    <!-- First Row Carousel -->
    <div class="mb-4">
      <UCarousel
        ref="carouselRow1"
        v-slot="{ item }"
        :items="firstRowProducts"
        :slides-to-scroll="1"
        :autoplay="{ delay: 3000 }"
        :ui="{
          item: 'basis-1/6 shrink-0',
          container: 'gap-1',
          viewport: 'overflow-hidden',
        }"
      >
        <ProductCardSimple
          :image="item.image"
          :stock-status="item.stockStatus"
          :title="item.title"
          :current-price="item.currentPrice"
          :old-price="item.oldPrice"
        />
      </UCarousel>
    </div>

    <!-- Second Row Carousel -->
    <div>
      <UCarousel
        ref="carouselRow2"
        v-slot="{ item }"
        :items="secondRowProducts"
        :slides-to-scroll="1"
        :autoplay="{ delay: 3000 }"
        :ui="{
          item: 'basis-1/6 shrink-0',
          container: 'gap-1',
          viewport: 'overflow-hidden',
        }"
      >
        <ProductCardSimple
          :image="item.image"
          :stock-status="item.stockStatus"
          :title="item.title"
          :current-price="item.currentPrice"
          :old-price="item.oldPrice"
        />
      </UCarousel>
    </div>
  </UContainer>
</template>
