<script setup lang="ts">
const flashProducts = ref([
  {
    id: 1,
    discount: "-400 MAD",
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
    image: "",
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
  <section class="flash-section relative overflow-hidden bg-brand-dark-950">
    <!-- Background effects -->
    <div class="flash-grid absolute inset-0 opacity-[0.03]" />
    <div class="flash-glow-left" />
    <div class="flash-glow-right" />
    <div class="flash-glow-center" />

    <!-- Accent line at top -->
    <div
      class="absolute top-0 inset-x-0 h-[2px] bg-linear-to-r from-transparent via-brand-accent-500 to-transparent opacity-60" />

    <UContainer class="relative z-10 pt-10 pb-10 md:pt-12 md:pb-12">
      <!-- Header row -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 md:mb-10">
        <!-- Left: title cluster -->
        <div class="flex items-center gap-4">
          <div class="relative shrink-0">
            <div class="flash-bolt-ring" />
            <div
              class="size-14 md:size-16 rounded-2xl bg-brand-accent-500 flex items-center justify-center shadow-lg shadow-brand-accent-500/30">
              <UIcon name="i-lucide-zap" class="text-brand-dark-950 text-2xl md:text-3xl" />
            </div>
          </div>

          <div>
            <span
              class="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-red-400 ring-1 ring-red-500/25 mb-2">
              <span class="relative flex size-1.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span class="relative inline-flex size-1.5 rounded-full bg-red-500" />
              </span>
              Offre limitée
            </span>

            <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-none">
              Vente
              <span class="text-brand-accent-500">Flash</span>
            </h2>
            <p class="text-sm text-brand-dark-300 mt-1 hidden sm:block">Des prix cassés, mais pas pour longtemps.</p>
          </div>
        </div>

        <!-- Right: countdown -->
        <div class="flex flex-col items-center md:items-end gap-2">
          <span class="text-[11px] font-semibold text-brand-dark-400 uppercase tracking-widest">Se termine dans</span>
          <div class="flash-countdown-wrapper">
            <CountdownTimer :days="2" :hours="5" :minutes="12" :seconds="49" />
          </div>
        </div>
      </div>

      <!-- Products grid -->
      <div class="flash-products grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <ProductCard
          v-for="product in flashProducts.slice(0, 9)"
          :key="product.id"
          :image="product.image"
          :stock-status="product.stockStatus"
          :title="product.title"
          :current-price="product.currentPrice"
          :old-price="product.oldPrice" />
        <ProductCardMore />
      </div>
    </UContainer>

    <!-- Accent line at bottom -->
    <div
      class="absolute bottom-0 inset-x-0 h-[2px] bg-linear-to-r from-transparent via-brand-accent-500 to-transparent opacity-60" />
  </section>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.flash-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px);
  background-size: 40px 40px;
}

.flash-glow-left {
  @apply absolute rounded-full blur-3xl pointer-events-none;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, var(--color-brand-accent-500) 0%, transparent 70%);
  top: 0;
  left: -100px;
  opacity: 0.1;
}

.flash-glow-right {
  @apply absolute rounded-full blur-3xl pointer-events-none;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, #ef4444 0%, transparent 70%);
  top: 0;
  right: -80px;
  opacity: 0.1;
}

.flash-glow-center {
  @apply absolute rounded-full blur-3xl pointer-events-none;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, var(--color-brand-accent-500) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.04;
}

.flash-bolt-ring {
  @apply absolute -inset-1.5 rounded-2xl;
  background: conic-gradient(
    from 0deg,
    var(--color-brand-accent-500),
    transparent 25%,
    transparent 75%,
    var(--color-brand-accent-500)
  );
  opacity: 0.4;
  animation: flash-spin 4s linear infinite;
}

@keyframes flash-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Countdown overrides ── */
.flash-countdown-wrapper :deep(.countdown) {
  color: white;
}

.flash-countdown-wrapper :deep([role="timer"]) {
  color: white;
}

.flash-countdown-wrapper :deep([role="timer"] > span) {
  color: var(--color-brand-accent-400);
}

.flash-countdown-wrapper :deep([role="timer"] > div) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
}

.flash-countdown-wrapper :deep([role="timer"] > div > .text-\[10px\]),
.flash-countdown-wrapper :deep([role="timer"] > div > .text-xs) {
  color: var(--color-brand-dark-200);
}

/* ── Product cards: dark theme overrides ── */
.flash-products :deep(a) {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
}

.flash-products :deep(a:hover) {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.15);
}

.flash-products :deep(a .bg-white) {
  background: rgba(255, 255, 255, 0.04);
}

.flash-products :deep(a h3) {
  color: #f0f1f4;
}

.flash-products :deep(a .text-neutral-500) {
  color: var(--color-brand-dark-300);
}

.flash-products :deep(a .text-neutral-400) {
  color: var(--color-brand-dark-400);
}

.flash-products :deep(a .text-neutral-900) {
  color: #f0f1f4;
}

.flash-products :deep(a .text-primary-700) {
  color: var(--color-brand-accent-400);
}

/* "Voir plus" card */
.flash-products :deep(> div:last-child) {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

.flash-products :deep(> div:last-child .text-brand-dark-950) {
  color: #f0f1f4;
}

.flash-products :deep(> div:last-child .bg-neutral-50) {
  background: transparent;
}
</style>
