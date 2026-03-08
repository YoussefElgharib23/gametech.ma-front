<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});
</script>

<template>
  <div class="space-y-0 flex-1 w-full overflow-auto">
    <!-- Slider – editable in dashboard -->
    <LandingSlider :editable="true" />

    <!-- Categories carousel -->
    <LandingCategories />

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
