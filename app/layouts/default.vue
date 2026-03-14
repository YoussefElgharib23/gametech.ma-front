<template>
  <UApp>
    <div class="bg-brand-accent-500 border-b border-brand-dark-100">
      <UContainer class="py-2">
        <p class="text-brand-dark-500 text-xs text-center">Built with Nuxt UI • © {{ new Date().getFullYear() }}</p>
      </UContainer>
    </div>

    <UHeader class="static">
      <template #left>
        <NuxtLink to="/">
          <AppLogo class="w-auto h-6 shrink-0" />
        </NuxtLink>
      </template>

      <LandingHeaderSearch />

      <template #right>
        <UButton icon="i-lucide-log-in" label="Connexion" color="neutral" variant="ghost" aria-label="Connexion" />

        <UButton icon="i-lucide-shopping-cart" aria-label="Panier" color="neutral" variant="ghost" />
      </template>
    </UHeader>

    <div class="bg-neutral-950 sticky top-0 z-50">
      <UContainer>
        <LandingHeaderNav />
      </UContainer>
    </div>

    <UMain>
      <slot />
    </UMain>

    <AppFooter />
  </UApp>
</template>
