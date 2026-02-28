<script setup>
useHead({
  meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
  link: [{ rel: "icon", href: "/favicon.ico" }],
  htmlAttrs: {
    lang: "en",
  },
});

const title = "Nuxt Starter Template";
const description =
  "A production-ready starter template powered by Nuxt UI. Build beautiful, accessible, and performant applications in minutes, not hours.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: "https://ui.nuxt.com/assets/templates/nuxt/starter-light.png",
  twitterImage: "https://ui.nuxt.com/assets/templates/nuxt/starter-light.png",
  twitterCard: "summary_large_image",
});
</script>

<template>
  <UApp>
    <div class="bg-brand-accent-500 border-b border-brand-dark-100">
      <UContainer class="py-2">
        <p class="text-brand-dark-500 text-xs text-center">
          Built with Nuxt UI • © {{ new Date().getFullYear() }}
        </p>
      </UContainer>
    </div>

    <UHeader class="static">
      <template #left>
        <NuxtLink to="/">
          <AppLogo class="w-auto h-6 shrink-0" />
        </NuxtLink>
      </template>

      <UInput
        placeholder="Rechercher dans le catalogue"
        trailing-icon="i-lucide-search"
        :ui="{
          base: 'h-10 w-[500px]',
        }"
      />

      <template #right>
        <UButton
          icon="i-lucide-log-in"
          label="Connexion"
          color="neutral"
          variant="ghost"
          aria-label="Connexion"
        />

        <UButton
          icon="i-lucide-shopping-cart"
          aria-label="Panier"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UHeader>

    <div class="bg-neutral-950 sticky top-0 z-50">
      <UContainer>
        <LandingHeaderNav />
      </UContainer>
    </div>

    <UMain>
      <NuxtPage />
    </UMain>

    <AppFooter />
  </UApp>
</template>
