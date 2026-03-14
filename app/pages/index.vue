<script setup lang="ts">
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

interface BrandSummary {
  id: number;
  name: string;
  slug: string;
  image: string | null;
}

interface HomeLandingPayload {
  sliders: {
    main: SliderItem[];
    three_card: SliderItem[];
    banner: SliderItem | null;
  };
  brands: BrandSummary[];
}

const { data: landingData } = await useAPIFetch<HomeLandingPayload>("/home");
</script>

<template>
  <div>
    <!-- Slider of images -->
    <LandingSlider :slider-items="landingData?.sliders.main ?? []" />

    <!-- Categories carousel -->
    <LandingCategories />

    <!-- Flash sales -->
    <LandingFlashSales />

    <!-- Products carousel -->
    <LandingProducts />

    <!-- Landing banner -->
    <LandingBanner :banner-item="landingData?.sliders.banner ?? null" />

    <!-- Products per category -->
    <LandingProductsPerCategory />

    <!-- Three card banners -->
    <LandingThreeCardBanners :slider-items="landingData?.sliders.three_card ?? []" />

    <!-- Our brands -->
    <LandingBrands :brands="landingData?.brands ?? []" />

    <!-- Trust section -->
    <LandingTrustSection />
  </div>
</template>

