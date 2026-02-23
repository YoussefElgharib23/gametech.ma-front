<script setup lang="ts">
const categories = ref([
  {
    id: 1,
    name: "PÉRIPHÉRIQUE PC",
    image: "/images/categories/peripherique-pc.jpg",
  },
  {
    id: 2,
    name: "CARTE GRAPHIQUE",
    image: "/images/categories/carte-graphique.jpg",
  },
  {
    id: 3,
    name: "CLAVIER",
    image: "/images/categories/clavier.jpg",
  },
  {
    id: 4,
    name: "SOURIS",
    image: "/images/categories/souris.jpg",
  },
  {
    id: 5,
    name: "CASQUE",
    image: "/images/categories/casque.jpg",
  },
  {
    id: 6,
    name: "PROCESSEUR",
    image: "/images/categories/processeur.jpg",
  },
]);
</script>

<template>
  <UContainer class="py-8">
    <h2 class="text-xl font-semibold mb-6 text-brand-dark-950">
      NOS CATÉGORIES
    </h2>

    <div
      class="bg-white rounded-lg border border-neutral-200 shadow-sm p-6 px-10"
    >
      <UCarousel
        v-slot="{ item }"
        :items="categories"
        arrows
        :slides-to-scroll="1"
        prev-icon="i-lucide-chevron-left"
        next-icon="i-lucide-chevron-right"
        :prev="{ color: 'neutral', variant: 'ghost', size: 'lg' }"
        :next="{ color: 'neutral', variant: 'ghost', size: 'lg' }"
        :ui="{
          item: 'basis-1/5',
          container: 'gap-6',
          prev: 'sm:-start-10 hover:bg-transparent cursor-pointer',
          next: 'sm:-end-10 hover:bg-transparent cursor-pointer',
        }"
      >
        <div
          class="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div
            class="w-32 h-32 bg-neutral-100 rounded-md flex items-center justify-center overflow-hidden"
          >
            <NuxtImg
              v-if="item.image"
              :src="item.image"
              :alt="item.name"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <UIcon
              v-else
              name="i-lucide-image"
              class="text-neutral-400 text-3xl"
            />
          </div>
          <p
            class="text-xs uppercase font-medium text-brand-dark-950 text-center"
          >
            {{ item.name }}
          </p>
        </div>
      </UCarousel>
    </div>
  </UContainer>
</template>
