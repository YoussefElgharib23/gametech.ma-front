<script setup lang="ts">
type TabType = "selections" | "new-arrival" | "best-seller";

const activeTab = ref<string>("selections");

const tabs = [
  { value: "selections", label: "Nos sélections", icon: "i-lucide-star" },
  { value: "new-arrival", label: "Nouvel arrivage", icon: "i-lucide-sparkles" },
  { value: "best-seller", label: "Best seller", icon: "i-lucide-trophy" },
];

const productImage =
  "https://pcgameragadir.ma/storage/uploads/products/68cee28d7b94c/ryzen-9-5950x_large.webp";

const selectionsProducts = ref([
  {
    id: 1,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "AMD Ryzen 9 5950X 16 Cores 32 Threads",
    currentPrice: "4 999 MAD",
    oldPrice: "5 499 MAD",
  },
  {
    id: 2,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "Intel Core i7-13700K 16 Cores",
    currentPrice: "3 699 MAD",
    oldPrice: "4 400 MAD",
  },
  {
    id: 3,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "Corsair Vengeance RGB DDR5 32GB 6000MHz",
    currentPrice: "1 199 MAD",
  },
  {
    id: 4,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "NVIDIA GeForce RTX 4070 Ti 12GB",
    currentPrice: "8 399 MAD",
    oldPrice: "9 199 MAD",
  },
  {
    id: 5,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "Samsung 990 Pro 1TB NVMe Gen4",
    currentPrice: "899 MAD",
    oldPrice: "999 MAD",
  },
  {
    id: 6,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "AMD Radeon RX 7900 XTX 24GB",
    currentPrice: "10 799 MAD",
    oldPrice: "12 200 MAD",
  },
  {
    id: 7,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "Noctua NH-D15 chromax.black",
    currentPrice: "679 MAD",
  },
  {
    id: 8,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "MSI MAG B650 TOMAHAWK WIFI",
    currentPrice: "1 899 MAD",
  },
  {
    id: 9,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "Corsair RM850x 850W 80+ Gold",
    currentPrice: "1 299 MAD",
  },
  {
    id: 10,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "G.Skill Trident Z5 RGB DDR5 32GB",
    currentPrice: "2 099 MAD",
  },
  {
    id: 11,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "WD Black SN850X 2TB NVMe",
    currentPrice: "1 699 MAD",
    oldPrice: "1 899 MAD",
  },
  {
    id: 12,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "ASUS ROG Strix RTX 4080 OC",
    currentPrice: "14 999 MAD",
  },
]);

const newArrivalProducts = ref([
  {
    id: 21,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "AMD Ryzen 7 7800X3D 8 Cores 3D V-Cache",
    currentPrice: "3 299 MAD",
    oldPrice: "3 599 MAD",
  },
  {
    id: 22,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "Gigabyte AORUS RTX 4070 Super",
    currentPrice: "6 499 MAD",
    oldPrice: "6 899 MAD",
  },
  {
    id: 23,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "Kingston Fury Beast DDR5 16GB 5600MHz",
    currentPrice: "599 MAD",
  },
  {
    id: 24,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "ASUS TUF Gaming B760-Plus WIFI",
    currentPrice: "1 799 MAD",
    oldPrice: "2 199 MAD",
  },
  {
    id: 25,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "Be Quiet! Dark Rock Pro 4",
    currentPrice: "899 MAD",
    oldPrice: "999 MAD",
  },
  {
    id: 26,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "Seagate FireCuda 530 1TB NVMe",
    currentPrice: "1 099 MAD",
  },
  {
    id: 27,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "EVGA SuperNOVA 1000 G6 80+ Gold",
    currentPrice: "1 899 MAD",
    oldPrice: "2 099 MAD",
  },
  {
    id: 28,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "AMD Ryzen 5 7600X 6 Cores",
    currentPrice: "2 199 MAD",
  },
  {
    id: 29,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "MSI GeForce RTX 4060 Ti GAMING X",
    currentPrice: "3 799 MAD",
    oldPrice: "4 099 MAD",
  },
  {
    id: 30,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "Lian Li O11 Dynamic EVO",
    currentPrice: "1 499 MAD",
    oldPrice: "1 699 MAD",
  },
  {
    id: 31,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "Logitech G Pro X Superlight 2",
    currentPrice: "999 MAD",
  },
  {
    id: 32,
    image: productImage,
    stockStatus: "EN STOCK",
    title: 'ASUS ROG Swift PG27AQDM 27" OLED',
    currentPrice: "8 799 MAD",
    oldPrice: "9 999 MAD",
  },
]);

const bestSellerProducts = ref([
  {
    id: 41,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "AMD Ryzen 9 5950X 16 Cores 32 Threads",
    currentPrice: "4 799 MAD",
    oldPrice: "5 299 MAD",
  },
  {
    id: 42,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "NVIDIA GeForce RTX 4070 12GB",
    currentPrice: "5 999 MAD",
    oldPrice: "6 499 MAD",
  },
  {
    id: 43,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "HyperX Fury DDR4 32GB 3200MHz",
    currentPrice: "699 MAD",
  },
  {
    id: 44,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "Samsung 980 Pro 500GB NVMe",
    currentPrice: "549 MAD",
    oldPrice: "649 MAD",
  },
  {
    id: 45,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "Cooler Master Hyper 212 RGB",
    currentPrice: "349 MAD",
    oldPrice: "399 MAD",
  },
  {
    id: 46,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "Razer DeathAdder V3 Pro",
    currentPrice: "799 MAD",
  },
  {
    id: 47,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "ASUS ROG Maximus Z790 Hero",
    currentPrice: "4 299 MAD",
    oldPrice: "4 599 MAD",
  },
  {
    id: 48,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "Corsair iCUE H150i Elite LCD",
    currentPrice: "2 199 MAD",
  },
  {
    id: 49,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "Intel Core i5-13600K 14 Cores",
    currentPrice: "2 899 MAD",
    oldPrice: "3 199 MAD",
  },
  {
    id: 50,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "MSI GeForce RTX 4090 GAMING X",
    currentPrice: "22 999 MAD",
    oldPrice: "24 499 MAD",
  },
  {
    id: 51,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "NZXT H7 Flow Mid-Tower",
    currentPrice: "1 299 MAD",
  },
  {
    id: 52,
    image: productImage,
    stockStatus: "EN STOCK",
    title: "SteelSeries Apex Pro TKL",
    currentPrice: "1 499 MAD",
    oldPrice: "1 699 MAD",
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
          item: 'basis-1/5 shrink-0',
          container: 'gap-1',
          viewport: 'overflow-hidden',
        }"
      >
        <div class="py-2">
          <ProductCard
            :image="item.image"
            :stock-status="item.stockStatus"
            :title="item.title"
            :current-price="item.currentPrice"
            :old-price="item.oldPrice"
          />
        </div>
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
          item: 'basis-1/5 shrink-0',
          container: 'gap-1',
          viewport: 'overflow-hidden',
        }"
      >
        <ProductCard
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
