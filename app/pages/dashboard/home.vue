<script setup lang="ts">
import type { BrandSummary } from "~/components/Landing/Brands/Index.vue";
import type { CategorySummary } from "~/components/Landing/Categories/Index.vue";
import type { LandingProductsBySection } from "~/components/Landing/Products/Index.vue";
import type { ProductsPerCategoryBlock } from "~/components/Landing/ProductsPerCategory/Index.vue";

definePageMeta({
  layout: "dashboard",
});

interface SliderImage {
  id: number;
  url: string;
  path?: string;
  name?: string;
}

interface SliderItem {
  id: number;
  side: string;
  link: string | null;
  image: SliderImage | null;
}

interface HomeLandingPayload {
  sliders: {
    main: SliderItem[];
    three_card: SliderItem[];
    banner: SliderItem | null;
  };
  categories: CategorySummary[];
  brands: BrandSummary[];
  landing_products: LandingProductsBySection;
  products_per_category: ProductsPerCategoryBlock[];
}

const { data: landingData } = await useAPIFetch<HomeLandingPayload>("/home");

const emptyLandingProducts: LandingProductsBySection = {
  selections: [],
  "new-arrival": [],
  "best-seller": [],
};
</script>

<template>
  <div class="space-y-0 flex-1 w-full overflow-auto">
    <!-- Slider – editable in dashboard -->
    <LandingSlider :editable="true" :slider-items="landingData?.sliders.main ?? []" />

    <!-- Categories carousel -->
    <LandingCategories />

    <!-- Flash sales -->
    <LandingFlashSales />

    <!-- Products carousel -->
    <LandingProducts :landing-products="landingData?.landing_products ?? emptyLandingProducts" />

    <!-- Landing banner -->
    <LandingBanner :editable="true" :banner-item="landingData?.sliders.banner ?? null" />

    <!-- Products per category -->
    <LandingProductsPerCategory :blocks="landingData?.products_per_category ?? []" />

    <!-- Three card banners – editable in dashboard -->
    <LandingThreeCardBanners :editable="true" :slider-items="landingData?.sliders.three_card ?? []" />

    <!-- Our brands -->
    <LandingBrands :brands="landingData?.brands ?? []" />

    <!-- Trust section -->
    <LandingTrustSection />
  </div>
</template>
