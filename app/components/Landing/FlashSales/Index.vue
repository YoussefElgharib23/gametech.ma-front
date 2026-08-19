<script setup lang="ts">
import { VENTE_FLASH_SECTION_SLUG } from "~/constants/catalogSections";

interface FlashArchiveProduct {
  id: number;
  slug: string;
  title: string;
  image: string | null;
  stockStatus: string;
  priceLabel: string;
  oldPriceLabel?: string | null;
}

interface FlashArchiveResponse {
  products: FlashArchiveProduct[];
  meta?: {
    pagination?: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
  };
}

const { storeSettings, load } = useStoreSettings();
await load();

const isEnabled = computed(() => storeSettings.value.flash_sales_enabled !== false);

const isExpired = computed(() => {
  const v = (storeSettings.value.flash_sales_expires_at ?? "").trim();
  if (!v) return false;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return false;
  return Date.now() >= d.getTime();
});

const isVisible = computed(() => isEnabled.value && !isExpired.value);

const countdown = computed(() => {
  const v = (storeSettings.value.flash_sales_expires_at ?? "").trim();
  if (!v) return null;

  const end = new Date(v);
  if (Number.isNaN(end.getTime())) return null;

  const diffMs = end.getTime() - Date.now();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
});

const flashArchivePath = computed(() => `/archive/section/${VENTE_FLASH_SECTION_SLUG}`);

const {
  data: flashArchive,
  pending: flashPending,
  refresh: refreshFlashArchive,
} = await useAPIFetch<FlashArchiveResponse>(flashArchivePath, {
  query: { page: 1, per_page: 9 },
  immediate: false,
  watch: false,
});

watch(
  isVisible,
  async (visible) => {
    if (visible) {
      await refreshFlashArchive();
    }
  },
  { immediate: true },
);

const flashProductsList = computed(() => {
  if (!isVisible.value) return [];
  return flashArchive.value?.products ?? [];
});

const flashTotal = computed(() => flashArchive.value?.meta?.pagination?.total ?? 0);

const showMoreCard = computed(() => flashProductsList.value.length > 0 && flashTotal.value > flashProductsList.value.length);

const { addItem } = useCart();

const sectionListingPath = `/section/${VENTE_FLASH_SECTION_SLUG}`;
</script>

<template>
  <section v-if="isVisible" class="flash-section relative overflow-hidden bg-brand-dark-950">
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
          <span v-if="countdown" class="text-[11px] font-semibold text-brand-dark-400 uppercase tracking-widest">
            Se termine dans
          </span>
          <div class="flash-countdown-wrapper">
            <CountdownTimer
              v-if="countdown"
              :key="storeSettings.flash_sales_expires_at"
              :days="countdown.days"
              :hours="countdown.hours"
              :minutes="countdown.minutes"
              :seconds="countdown.seconds" />
            <span v-else class="text-xs text-brand-dark-300">Offre en cours</span>
          </div>
        </div>
      </div>

      <!-- Products grid (same catalog section as /section/vente-flash) -->
      <div class="flash-products grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <div v-if="flashPending" class="col-span-full py-10 text-center text-sm text-brand-dark-300">Chargement des offres…</div>
        <div v-else-if="!flashProductsList.length" class="col-span-full py-10 text-center text-sm text-brand-dark-300">
          Aucun produit en vente flash pour le moment. Ajoutez la section «&nbsp;Vente flash&nbsp;» à vos produits ou visitez
          <NuxtLink :to="sectionListingPath" class="text-brand-accent-400 underline underline-offset-2">la page dédiée</NuxtLink>
          .
        </div>
        <template v-else>
          <div v-for="(product, index) in flashProductsList" :key="product.id" class="relative min-h-0">
            <ProductCard
              :to="`/products/${product.slug}`"
              :image="product.image ?? ''"
              :images="product.images ?? []"
              :stock-status="product.stockStatus"
              :title="product.title"
              :current-price="product.priceLabel"
              :old-price="product.oldPriceLabel || undefined"
              @add-to-cart="addItem(product.id, 1)" />
          </div>
          <div v-if="showMoreCard && flashProductsList[flashProductsList.length - 1] !== undefined" class="relative">
            <ProductCard
              :to="`/products/${flashProductsList[flashProductsList.length - 1].slug}`"
              :image="flashProductsList[flashProductsList.length - 1].image ?? ''"
              :images="flashProductsList[flashProductsList.length - 1].images ?? []"
              :stock-status="flashProductsList[flashProductsList.length - 1].stockStatus"
              :title="flashProductsList[flashProductsList.length - 1].title"
              :current-price="flashProductsList[flashProductsList.length - 1].priceLabel"
              :old-price="flashProductsList[flashProductsList.length - 1].oldPriceLabel || undefined"
              @add-to-cart="addItem(flashProductsList[flashProductsList.length - 1]!.id, 1)" />
            <NuxtLink
              :to="sectionListingPath"
              aria-label="Voir tous les produits en vente flash"
              class="group absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-brand-dark-950/78 backdrop-blur-[3px] ring-1 ring-white/20 transition-colors duration-200 hover:bg-brand-dark-950/88 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark-950">
              <div class="pointer-events-none text-center max-w-[180px] px-3">
                <p class="text-sm font-semibold text-black leading-tight">
                  Découvrir plus
                  <span class="whitespace-nowrap">d’offres</span>
                </p>
                <p class="mt-1 text-[11px] text-brand-dark-500 leading-snug">Voir toute la vente flash.</p>
                <div class="relative mt-2 h-6 w-6 mx-auto overflow-hidden">
                  <div
                    class="absolute inset-0 flex items-center justify-center transition-all duration-300 group-hover:translate-x-3 group-hover:opacity-0">
                    <UIcon name="i-lucide-arrow-right" class="text-brand-accent-400 text-2xl" />
                  </div>
                  <div
                    class="absolute inset-0 flex items-center justify-center transition-all duration-300 -translate-x-3 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
                    <UIcon name="i-lucide-arrow-right" class="text-brand-accent-400 text-2xl" />
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>
        </template>
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
</style>
