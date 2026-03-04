<script setup lang="ts">
const flashProducts = ref([
  {
    id: 1,
    discount: "-400 MAD",
    image: "/images/products/product-1.jpg",
    specs: "8GB / 256GB",
    stockStatus: "EN STOCK",
    title: "Product Title 1",
    currentPrice: "2 499 MAD",
    oldPrice: "2 899 MAD",
    promotionInfo: "En Promo",
  },
  {
    id: 2,
    discount: "-400 MAD",
    image: "/images/products/product-2.jpg",
    specs: "8GB / 256GB",
    stockStatus: "EN STOCK",
    title: "Product Title 2",
    currentPrice: "2 699 MAD",
    oldPrice: "3 099 MAD",
    promotionInfo: "En Promo",
  },
  {
    id: 3,
    discount: "-400 MAD",
    image: "/images/products/product-3.jpg",
    specs: "8GB / 256GB",
    stockStatus: "EN STOCK",
    title: "Product Title 3",
    currentPrice: "2 599 MAD",
    oldPrice: "2 999 MAD",
    soldPercentage: "24",
  },
  {
    id: 4,
    discount: "-400 MAD",
    image: "/images/products/product-4.jpg",
    specs: "8GB / 256GB",
    stockStatus: "EN STOCK",
    title: "Product Title 4",
    currentPrice: "2 799 MAD",
    oldPrice: "3 199 MAD",
    soldPercentage: "11",
  },
  {
    id: 5,
    discount: "-400 MAD",
    image: "/images/products/product-5.jpg",
    specs: "8GB / 256GB",
    stockStatus: "EN STOCK",
    title: "Product Title 5",
    currentPrice: "3 499 MAD",
    oldPrice: "3 899 MAD",
    soldPercentage: "6",
  },
  {
    id: 6,
    discount: "-400 MAD",
    image: "/images/products/product-6.jpg",
    specs: "8GB / 256GB",
    stockStatus: "EN STOCK",
    title: "Product Title 6",
    currentPrice: "3 549 MAD",
    oldPrice: "3 949 MAD",
    promotionInfo: "En Promo",
  },
  {
    id: 7,
    discount: "-700 MAD",
    image: "/images/products/product-7.jpg",
    specs: "16GB/512GB",
    stockStatus: "EN STOCK",
    title: "Product Title 7",
    currentPrice: "5 490 MAD",
    oldPrice: "6 190 MAD",
    promotionInfo: "En Promo",
  },
  {
    id: 8,
    discount: "-700 MAD",
    image: "/images/products/product-8.jpg",
    specs: "16GB/512GB",
    stockStatus: "EN STOCK",
    title: "Product Title 8",
    currentPrice: "5 590 MAD",
    oldPrice: "6 290 MAD",
    promotionInfo: "En Promo",
  },
  {
    id: 9,
    discount: "-600 MAD",
    image: "/images/products/product-9.jpg",
    specs: "16GB/512GB",
    stockStatus: "EN STOCK",
    title: "Product Title 9",
    currentPrice: "5 690 MAD",
    oldPrice: "6 290 MAD",
    promotionInfo: "En Promo",
  },
  {
    id: 10,
    discount: "-600 MAD",
    image: "/images/products/product-10.jpg",
    specs: "16GB/512GB",
    stockStatus: "EN STOCK",
    title: "Product Title 10",
    currentPrice: "6 390 MAD",
    oldPrice: "6 990 MAD",
    promotionInfo: "En Promo",
  },
  {
    id: 11,
    discount: "-700 MAD",
    image: "/images/products/product-11.jpg",
    specs: "16GB/512GB",
    stockStatus: "EN STOCK",
    title: "Product Title 11",
    currentPrice: "6 890 MAD",
    oldPrice: "7 590 MAD",
    promotionInfo: "En Promo",
  },
]);
</script>

<template>
  <UContainer class="py-8">
    <div class="bg-neutral-300/20 rounded-lg p-6">
      <div
        class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 lg:mb-8"
      >
        <h2
          class="text-3xl sm:text-4xl tracking-tighter font-extrabold order-2 lg:order-1"
        >
          Vente Flash
        </h2>
        <div
          class="order-1 lg:order-2 flex flex-col items-center lg:items-end gap-1"
        >
          <span
            class="text-xs font-medium text-neutral-600 uppercase tracking-wider"
            >Se termine dans</span
          >
          <CountdownTimer :days="2" :hours="5" :minutes="12" :seconds="49" />
        </div>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-5 gap-4">
        <!-- First Row - 6 products -->
        <ProductCard
          v-for="product in flashProducts.slice(0, 6)"
          :key="product.id"
          :image="product.image"
          :stock-status="product.stockStatus"
          :title="product.title"
          :current-price="product.currentPrice"
          :old-price="product.oldPrice"
        />

        <!-- Second Row - 5 products + 1 "Voir plus" card -->
        <ProductCard
          v-for="product in flashProducts.slice(6, 9)"
          :key="product.id"
          :image="product.image"
          :stock-status="product.stockStatus"
          :title="product.title"
          :current-price="product.currentPrice"
          :old-price="product.oldPrice"
        />
        <ProductCardMore />
      </div>
    </div>
  </UContainer>
</template>
