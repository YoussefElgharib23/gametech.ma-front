<script setup lang="ts">
interface Props {
  to?: string;
  image?: string;
  brandImage?: string;
  brandName?: string;
  stockStatus?: string;
  title: string;
  currentPrice: string;
  oldPrice?: string;
}

const props = withDefaults(defineProps<Props>(), {
  to: "#",
  image: "",
  brandImage: "",
  brandName: "",
  stockStatus: "EN STOCK",
  oldPrice: "",
});

const emit = defineEmits<{ "add-to-cart": [] }>();
const recentlyAdded = ref(false);
let resetTimer: ReturnType<typeof setTimeout> | null = null;

const normalizedStockStatus = computed(() => (props.stockStatus ?? "").trim().toLowerCase());

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

function onAddToCart(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
  if (recentlyAdded.value || isOutOfStock.value) return;

  emit("add-to-cart");

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
  <NuxtLink
    :to="to"
    class="group flex flex-col rounded-xl border border-neutral-200 bg-white overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-neutral-300 hover:-translate-y-0.5 cursor-pointer">
    <!-- Image block with overlaid badge -->
    <div class="relative">
      <div
        class="relative flex min-h-[120px] items-center justify-center overflow-hidden rounded-lg bg-white p-2 sm:min-h-[200px] sm:p-3">
        <NuxtImg
          v-if="image"
          :src="image"
          :alt="title"
          class="h-[140px] w-full object-contain transition-transform duration-300 group-hover:scale-105 sm:h-[260px]"
          loading="lazy" />
        <UIcon v-else name="i-lucide-image" class="text-3xl text-neutral-400 sm:text-4xl" />

        <!-- Promo: absolute top-right on image (same layout for all cards) -->
        <div
          v-if="oldPrice"
          class="absolute top-1.5 right-1.5 rounded-md bg-secondary-500/95 px-1.5 py-1 text-[10px] font-semibold text-brand-dark-950 shadow-sm sm:top-2 sm:right-2 sm:px-2 sm:py-1.5 sm:text-[11px]">
          <span>En Promo</span>
        </div>

        <!-- Stock: bottom-left pill on image -->
        <span
          class="absolute bottom-1.5 left-1.5 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide shadow-xs sm:bottom-2 sm:left-2 sm:px-2.5 sm:py-1 sm:text-[10px]"
          :class="stockBadgeClass">
          {{ stockStatus }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-1 flex-col p-2.5 pt-2 sm:p-4 sm:pt-3">
      <!-- Brand: logo + name -->
      <div v-if="brandImage || brandName" class="flex items-center gap-1 mb-2">
        <div class="rounded overflow-hidden size-6">
          <NuxtImg
            v-if="brandImage"
            :src="brandImage"
            :alt="brandName || 'Brand'"
            class="size-full object-contain shrink-0"
            loading="lazy" />
        </div>
        <span v-if="brandName" class="text-xs font-medium text-neutral-500 truncate">
          {{ brandName }}
        </span>
      </div>

      <h3
        class="mb-2 line-clamp-2 h-[36px] text-xs font-semibold text-neutral-900 sm:mb-3 sm:h-[40px] sm:text-sm">
        {{ title }}
      </h3>

      <div class="mt-auto flex flex-col gap-1">
        <div class="-space-y-1 flex flex-col">
          <span v-if="oldPrice" class="text-xs tabular-nums text-neutral-400 line-through sm:text-sm">
            {{ oldPrice }}
          </span>
          <span
            class="text-base font-bold tabular-nums text-primary-700 sm:text-lg"
            :class="{ 'mt-3 sm:mt-[18px]': !oldPrice }">
            {{ currentPrice }}
          </span>
        </div>
        <UButton
          class="mt-2 h-9 w-full cursor-pointer text-xs sm:mt-3 sm:h-10 sm:text-sm"
          :label="isOutOfStock ? 'Indisponible' : recentlyAdded ? 'Ajouté au panier' : 'Ajouter au panier'"
          :icon="isOutOfStock ? 'i-lucide-ban' : recentlyAdded ? 'i-lucide-check' : 'i-lucide-shopping-cart'"
          color="neutral"
          :disabled="recentlyAdded || isOutOfStock"
          :variant="isOutOfStock ? 'soft' : recentlyAdded ? 'soft' : 'solid'"
          block
          @click="onAddToCart" />
      </div>
    </div>
  </NuxtLink>
</template>
