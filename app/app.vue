<script setup lang="ts">
useHead({
  meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
  link: [{ rel: "icon", href: "/favicon.ico?v=2" }],
  htmlAttrs: {
    lang: "en",
  },
});

const title = "Gametech.ma – PC Gamer Maroc, Laptops & Accessoires Gaming | Livraison Rapide";
const description =
  "Découvrez Gametech.ma, votre boutique tech au Maroc spécialisée en PC gamer, laptops puissants et accessoires gaming. Profitez de prix compétitifs, garantie, service après-vente et livraison rapide partout au Maroc.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: "https://ui.nuxt.com/assets/templates/nuxt/starter-light.png",
  twitterImage: "https://ui.nuxt.com/assets/templates/nuxt/starter-light.png",
  twitterCard: "summary_large_image",
});

if (import.meta.client) {
  const { authenticateVisitor } = useVisitor();
  const { loadCart } = useCart();

  onMounted(async () => {
    await authenticateVisitor();
    await loadCart();
  });
}
</script>

<template>
  <!-- Developer: Youssef EL GHARIB -->
  <!-- Email: elgharibyoussef23@gmail.com -->
  <!-- Phone: +212641949203 -->

  <UApp>
    <NuxtLoadingIndicator />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
