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

const containerRef = ref(null);

const swiper = useSwiper(containerRef, {
  loop: true,
  autoplay: {
    delay: 3000,
  },
  slidesPerView: 2,
  spaceBetween: 16,
  breakpoints: {
    640: {
      slidesPerView: 3,
      spaceBetween: 24,
    },
    1024: {
      slidesPerView: 5,
      spaceBetween: 24,
    },
  },
  mousewheel: {
    forceToAxis: true,
  },
});
</script>

<template>
  <UContainer v-if="props.categories.length" class="py-8">
    <h2 class="text-xl font-semibold mb-6 text-brand-dark-950">NOS CATÉGORIES</h2>

    <div class="relative bg-white rounded-lg border border-neutral-200 shadow-sm p-4 px-4 sm:p-6 sm:px-6 lg:px-10">
      <ClientOnly>
        <swiper-container ref="containerRef">
          <swiper-slide v-for="item in props.categories" :key="item.id">
            <NuxtLink
              :to="`/category/${item.slug}`"
              class="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div
                class="size-24 sm:size-28 lg:size-32 bg-neutral-100 rounded-md flex items-center justify-center overflow-hidden">
                <NuxtImg v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover" loading="lazy" />
                <UIcon v-else name="i-lucide-image" class="text-neutral-400 text-3xl" />
              </div>
              <p class="text-xs uppercase font-medium text-brand-dark-950 text-center">
                {{ item.name }}
              </p>
            </NuxtLink>
          </swiper-slide>
        </swiper-container>
        <template #fallback>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            <NuxtLink
              v-for="item in props.categories.slice(0, 5)"
              :key="item.id"
              class="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div
                class="size-24 sm:size-28 lg:size-32 bg-neutral-100 rounded-md flex items-center justify-center overflow-hidden">
                <NuxtImg v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover" loading="lazy" />
                <UIcon v-else name="i-lucide-image" class="text-neutral-400 text-3xl" />
              </div>
              <p class="text-xs uppercase font-medium text-brand-dark-950 text-center">
                {{ item.name }}
              </p>
            </NuxtLink>
          </div>
        </template>
      </ClientOnly>

      <!-- Go back one slide -->
      <UButton
        v-if="swiper.instance"
        icon="i-lucide-chevron-left"
        color="neutral"
        variant="ghost"
        size="lg"
        aria-label="Précédent"
        class="rounded-full absolute top-1/2 -translate-y-1/2 start-1"
        @click="swiper.prev()" />
      <!-- Go forward one slide -->
      <UButton
        v-if="swiper.instance"
        icon="i-lucide-chevron-right"
        color="neutral"
        variant="ghost"
        size="lg"
        aria-label="Suivant"
        class="rounded-full absolute top-1/2 -translate-y-1/2 end-1"
        @click="swiper.next()" />
    </div>
  </UContainer>
</template>
