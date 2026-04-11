<script lang="ts">
export interface CategorySummary {
  id: number;
  name: string;
  slug: string;
  image: string | null;
}
</script>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    categories: CategorySummary[];
  }>(),
  {
    categories: () => [],
  },
);
</script>

<template>
  <UContainer v-if="props.categories.length" class="py-8">
    <h2 class="text-xl font-semibold mb-6 text-brand-dark-950">NOS CATÉGORIES</h2>

    <div class="bg-white rounded-lg border border-neutral-200 shadow-sm p-4 px-4 sm:p-6 sm:px-6 lg:px-10">
      <UCarousel
        v-slot="{ item }"
        :items="props.categories"
        arrows
        :slides-to-scroll="1"
        prev-icon="i-lucide-chevron-left"
        next-icon="i-lucide-chevron-right"
        :prev="{ color: 'neutral', variant: 'ghost', size: 'lg' }"
        :next="{ color: 'neutral', variant: 'ghost', size: 'lg' }"
        :ui="{
          item: 'basis-1/2 shrink-0 lg:basis-1/5',
          container: 'gap-4 sm:gap-6',
          prev: 'sm:-start-10 -start-4 hover:bg-transparent cursor-pointer',
          next: 'sm:-end-10 -end-4 hover:bg-transparent cursor-pointer',
        }">
        <NuxtLink
          :to="`/category/${item.slug}`"
          class="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div class="size-24 sm:size-28 lg:size-32 bg-neutral-100 rounded-md flex items-center justify-center overflow-hidden">
            <NuxtImg v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover" loading="lazy" />
            <UIcon v-else name="i-lucide-image" class="text-neutral-400 text-3xl" />
          </div>
          <p class="text-xs uppercase font-medium text-brand-dark-950 text-center">
            {{ item.name }}
          </p>
        </NuxtLink>
      </UCarousel>
    </div>
  </UContainer>
</template>
