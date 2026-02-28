<script setup lang="ts">
interface Props {
  image?: string;
  stockStatus?: string;
  title: string;
  currentPrice: string;
  oldPrice?: string;
}

withDefaults(defineProps<Props>(), {
  image: "",
  stockStatus: "EN STOCK",
  oldPrice: "",
});
</script>

<template>
  <div
    class="flex flex-col bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
  >
    <!-- Product Image -->
    <div
      class="p-4 flex items-center justify-center bg-neutral-50 min-h-[200px]"
    >
      <NuxtImg
        v-if="image"
        :src="image"
        :alt="title"
        class="w-full h-auto object-contain max-h-[180px]"
        loading="lazy"
      />
      <UIcon v-else name="i-lucide-image" class="text-neutral-400 text-4xl" />
    </div>

    <!-- Stock Badge -->
    <div class="px-4 py-2">
      <span
        class="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded uppercase"
      >
        {{ stockStatus }}
      </span>
    </div>

    <!-- Product Title -->
    <div class="px-4 pb-2">
      <h3 class="text-sm font-medium text-brand-dark-950 line-clamp-2">
        {{ title }}
      </h3>
    </div>

    <!-- Prices -->
    <div class="px-4 pb-4 flex flex-col gap-1">
      <span class="text-lg font-bold text-brand-dark-950">
        {{ currentPrice }}
      </span>
      <span v-if="oldPrice" class="text-sm text-neutral-500 line-through">
        {{ oldPrice }}
      </span>
    </div>
  </div>
</template>
