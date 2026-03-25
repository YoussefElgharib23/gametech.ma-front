<script setup lang="ts">
import type { CategorySummary } from "~/components/Landing/Categories/Index.vue";

definePageMeta({
  layout: "dashboard",
});

/** Local preview assets until dashboard loads home payload from the API */
const demoCategories: CategorySummary[] = [
  {
    id: 1,
    name: "PÉRIPHÉRIQUE PC",
    slug: "peripherique-pc",
    image: "/images/categories/peripherique-pc.jpg",
  },
  {
    id: 2,
    name: "CARTE GRAPHIQUE",
    slug: "carte-graphique",
    image: "/images/categories/carte-graphique.jpg",
  },
  {
    id: 3,
    name: "CLAVIER",
    slug: "clavier",
    image: "/images/categories/clavier.jpg",
  },
  {
    id: 4,
    name: "SOURIS",
    slug: "souris",
    image: "/images/categories/souris.jpg",
  },
  {
    id: 5,
    name: "CASQUE",
    slug: "casque",
    image: "/images/categories/casque.jpg",
  },
  {
    id: 6,
    name: "PROCESSEUR",
    slug: "processeur",
    image: "/images/categories/processeur.jpg",
  },
];
</script>

<template>
  <div class="space-y-0 flex-1 w-full overflow-auto">
    <!-- Slider – editable in dashboard -->
    <LandingSlider :editable="true" />

    <!-- Categories carousel -->
    <LandingCategories :categories="demoCategories" />

    <!-- Flash sales -->
    <LandingFlashSales />

    <!-- Products carousel -->
    <LandingProducts />

    <!-- Landing banner -->
    <LandingBanner :editable="true" />

    <!-- Products per category -->
    <LandingProductsPerCategory />

    <!-- Three card banners – editable in dashboard -->
    <LandingThreeCardBanners :editable="true" />

    <!-- Our brands -->
    <LandingBrands />

    <!-- Trust section -->
    <LandingTrustSection />
  </div>
</template>
