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

function parsePrice(priceStr: string): number {
  const digits = priceStr.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function formatMad(amount: number): string {
  const s = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${s} MAD`;
}

const savingsText = computed(() => {
  if (!props.oldPrice) return null;
  const oldVal = parsePrice(props.oldPrice);
  const currentVal = parsePrice(props.currentPrice);
  const save = oldVal - currentVal;
  if (save <= 0) return null;
  return `Économisez ${formatMad(save)}`;
});

const emit = defineEmits<{ "add-to-cart": [] }>();

function onAddToCart(e: MouseEvent) {
  e.preventDefault();
  e.stopPropagation();
  emit("add-to-cart");
}
</script>

<template>
  <NuxtLink
    :to="to"
    class="group flex flex-col rounded-xl border border-neutral-200 bg-white overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-neutral-300 hover:-translate-y-0.5 cursor-pointer"
  >
    <!-- Image block with overlaid badge -->
    <div class="relative p-3 pb-0">
      <div
        class="relative rounded-lg bg-white min-h-[200px] flex items-center justify-center overflow-hidden p-3"
      >
        <NuxtImg
          v-if="image"
          :src="image"
          :alt="title"
          class="w-full h-auto object-contain max-h-[180px] transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <UIcon v-else name="i-lucide-image" class="text-neutral-400 text-4xl" />

        <!-- Stock: bottom-left pill on image -->
        <span
          class="absolute bottom-2 left-2 rounded-full bg-brand-accent-500 text-brand-accent-950 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-sm"
        >
          {{ stockStatus }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-1 flex-col p-4 pt-3">
      <!-- Brand: logo + name -->
      <div v-if="brandImage || brandName" class="flex items-center gap-2 mb-2">
        <NuxtImg
          v-if="brandImage"
          :src="brandImage"
          :alt="brandName || 'Brand'"
          class="size-6 object-contain shrink-0"
          loading="lazy"
        />
        <span
          v-if="brandName"
          class="text-xs font-medium text-neutral-500 truncate"
        >
          {{ brandName }}
        </span>
      </div>

      <h3
        class="text-sm font-semibold text-neutral-900 line-clamp-2 mb-3 h-[40px]"
      >
        {{ title }}
      </h3>

      <!-- Price row: current + old inline -->
      <div class="mt-auto flex flex-col gap-1">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-lg font-bold tabular-nums text-primary-700">
            {{ currentPrice }}
          </span>
          <span
            v-if="oldPrice"
            class="text-sm tabular-nums text-neutral-400 line-through"
          >
            {{ oldPrice }}
          </span>
        </div>
        <div
          v-if="oldPrice"
          class="flex flex-wrap items-center gap-1.5 text-xs text-secondary-600 font-medium"
        >
          <span>En Promo</span>
          <span v-if="savingsText">• {{ savingsText }}</span>
        </div>
        <UButton
          class="mt-3 w-full h-10 text-sm"
          label="Ajouter au panier"
          icon="i-lucide-shopping-cart"
          color="neutral"
          block
          @click="onAddToCart"
        />
      </div>
    </div>
  </NuxtLink>
</template>
