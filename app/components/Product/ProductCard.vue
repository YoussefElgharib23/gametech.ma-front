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
      <div class="relative rounded-lg bg-white min-h-[200px] flex items-center justify-center overflow-hidden p-3">
        <NuxtImg
          v-if="image"
          :src="image"
          :alt="title"
          class="w-full object-contain h-[260px] transition-transform duration-300 group-hover:scale-105"
          loading="lazy" />
        <UIcon v-else name="i-lucide-image" class="text-neutral-400 text-4xl" />

        <!-- Promo: absolute top-right on image (same layout for all cards) -->
        <div
          v-if="oldPrice"
          class="absolute top-2 right-2 rounded-md bg-secondary-500/95 px-2 py-1.5 text-[11px] font-semibold text-brand-dark-950 shadow-sm">
          <span>En Promo</span>
        </div>

        <!-- Stock: bottom-left pill on image -->
        <span
          class="absolute bottom-2 left-2 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-xs"
          :class="stockBadgeClass">
          {{ stockStatus }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-1 flex-col p-4 pt-3">
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

      <h3 class="text-sm font-semibold text-neutral-900 line-clamp-2 mb-3 h-[40px]">
        {{ title }}
      </h3>

      <div class="mt-auto flex flex-col gap-1">
        <div class="flex flex-col -space-y-1">
          <span v-if="oldPrice" class="text-sm tabular-nums text-neutral-400 line-through">
            {{ oldPrice }}
          </span>
          <span class="text-lg font-bold tabular-nums text-primary-700" :class="{ 'mt-[18px]': !oldPrice }">
            {{ currentPrice }}
          </span>
        </div>
        <UButton
          class="mt-3 w-full h-10 text-sm cursor-pointer"
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
