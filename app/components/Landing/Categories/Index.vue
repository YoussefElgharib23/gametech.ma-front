<script lang="ts">
export interface CategorySummary {
  id: number;
  name: string;
  slug: string;
  image: string | null;
}
</script>

<script setup lang="ts">
// @ts-nocheck

/** PrestaShop category URLs → in-app `/category/{slug}` (strip leading id-). */
function slugFromCategoryLink(link: string): string {
  const segment = link.split("/").filter(Boolean).pop() ?? "";
  return segment.replace(/^\d+-/, "") || segment;
}

/** Paths under `public/imgs/categories/` (filenames use spaces, no accents). */
const landingCategorySlides = [
  {
    name: "SOURIS",
    link: "/group/souris",
    image: "/imgs/categories/SOURIS.png",
  },
  {
    name: "CASQUE",
    link: "/group/casque",
    image: "/imgs/categories/CASQUE.png",
  },
  {
    name: "PROCESSEUR",
    link: "/group/processeur",
    image: "/imgs/categories/PROCESSEUR.png",
  },
  {
    name: "PC GAMER",
    link: "/group/pc-gamer",
    image: "/imgs/categories/PC GAMER.png",
  },
  {
    name: "BOITIER GAMER",
    link: "/group/boitier-gamer",
    image: "/imgs/categories/BOITIER GAMER.png",
  },
  {
    name: "ECRAN PC",
    link: "/group/ecran-professionel",
    image: "/imgs/categories/ECRAN PC.png",
  },
  {
    name: "PÉRIPHÉRIQUE PC",
    link: "/category/peripherique-pc",
    image: "/imgs/categories/PERIPHERIQUE PC.png",
  },
  {
    name: "CARTE GRAPHIQUE",
    link: "/group/carte-graphique",
    image: "/imgs/categories/CARTE GRAPHIQUE.png",
  },
  {
    name: "CLAVIER",
    link: "/group/clavier",
    image: "/imgs/categories/CLAVIER.png",
  },
];

const containerRef = ref(null);

const swiper = useSwiper(containerRef, {
  loop: true,
  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
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

watch(
  [containerRef, () => landingCategorySlides.length],
  async () => {
    await nextTick();
    const el = containerRef.value as any;
    el?.initialize?.();
    el?.swiper?.update?.();
  },
  { immediate: true },
);
</script>

<template>
  <UContainer v-if="landingCategorySlides.length" class="py-8">
    <h2 class="text-xl font-semibold mb-6 text-brand-dark-950">NOS CATÉGORIES</h2>

    <div class="relative bg-white rounded-lg border border-neutral-200 shadow-sm p-4 px-4 sm:p-6 sm:px-6 lg:px-10">
      <ClientOnly>
        <swiper-container ref="containerRef" :init="false" class="w-full">
          <swiper-slide v-for="item in landingCategorySlides" :key="item.link">
            <NuxtLink :to="item.link" class="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div class="size-24 sm:size-28 lg:size-32 rounded-md flex items-center justify-center overflow-hidden">
                <NuxtImg :src="item.image" :alt="item.name" class="w-full h-full object-cover" loading="lazy" />
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
              v-for="item in landingCategorySlides.slice(0, 5)"
              :key="item.link"
              :to="`/category/${slugFromCategoryLink(item.link)}`"
              class="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div
                class="size-24 sm:size-28 lg:size-32 bg-neutral-100 rounded-md flex items-center justify-center overflow-hidden">
                <NuxtImg :src="item.image" :alt="item.name" class="w-full h-full object-cover" loading="lazy" />
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
