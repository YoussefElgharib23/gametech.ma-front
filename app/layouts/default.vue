<script setup lang="ts">
const cartOpen = ref(false);
const { items, itemsCount, subtotalLabel, shippingLabel, grandTotalLabel, pending, incrementItem, decrementItem, removeItem } =
  useCart();
</script>

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

        <USlideover
          v-model:open="cartOpen"
          title="Mon panier"
          side="right"
          :ui="{
            header: 'sm:p-3 p-3',
            body: 'sm:p-3 p-3',
            footer: 'sm:p-3 p-3',
          }">
          <UChip :text="itemsCount" size="3xl">
            <UButton icon="i-lucide-shopping-cart" aria-label="Panier" color="neutral" variant="ghost" />
          </UChip>

          <template #body>
            <div v-if="pending" class="py-6 text-center text-sm text-neutral-500">Chargement du panier...</div>

            <div v-else-if="!items.length" class="py-10 text-center">
              <UIcon name="i-lucide-shopping-cart" class="mx-auto mb-3 size-8 text-neutral-300" />
              <p class="text-sm font-medium text-neutral-700">Votre panier est vide</p>
              <p class="mt-1 text-xs text-neutral-500">Ajoutez des produits pour les retrouver ici.</p>
            </div>

            <div v-else class="space-y-3">
              <div v-for="item in items" :key="item.id" class="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
                <div class="flex gap-3">
                  <div
                    v-if="item.product.image"
                    class="p-px h-12 w-12 rounded-md object-cover shrink-0 border border-neutral-200 bg-neutral-100">
                    <NuxtImg
                      :src="item.product.image"
                      :alt="item.product.title"
                      class="size-full object-contain mix-blend-multiply" />
                  </div>
                  <div v-else class="h-12 w-12 rounded-md bg-neutral-100 shrink-0 border border-neutral-200" />

                  <div class="min-w-0 flex-1">
                    <div class="mb-1 flex items-center justify-between gap-2">
                      <p class="text-[11px] text-neutral-500 truncate">
                        {{ item.product.brand || "Produit" }}
                      </p>
                      <UBadge color="neutral" variant="soft" size="xs" class="shrink-0">x{{ item.quantity }}</UBadge>
                    </div>
                    <NuxtLink
                      :to="`/products/${item.product.slug}`"
                      class="line-clamp-2 text-sm font-medium text-neutral-900 hover:text-primary-700">
                      {{ item.product.title }}
                    </NuxtLink>
                    <div class="mt-2 flex items-end justify-between gap-2">
                      <p class="text-xs text-neutral-500">{{ item.product.price_label }} / unité</p>
                      <p class="text-sm font-semibold text-primary-700">{{ item.line_total_label }}</p>
                    </div>
                  </div>
                </div>

                <div class="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
                  <div class="flex items-center gap-1 rounded-md border border-neutral-200 p-0.5">
                    <UButton
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      icon="i-lucide-minus"
                      @click="() => void decrementItem(item.id)" />
                    <span class="min-w-7 text-center text-sm font-medium">{{ item.quantity }}</span>
                    <UButton
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      icon="i-lucide-plus"
                      @click="() => void incrementItem(item.id)" />
                  </div>

                  <UButton
                    size="xs"
                    color="error"
                    variant="soft"
                    label="Supprimer"
                    icon="i-lucide-trash-2"
                    @click="() => void removeItem(item.id)" />
                </div>
              </div>
            </div>
          </template>

          <template #footer>
            <div class="w-full space-y-3">
              <div class="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-neutral-600">Sous-total</span>
                  <span class="font-semibold text-neutral-900">{{ subtotalLabel }}</span>
                </div>
                <div class="mt-1 flex items-center justify-between text-sm">
                  <span class="text-neutral-600">Livraison</span>
                  <span class="font-semibold text-neutral-900">{{ shippingLabel }}</span>
                </div>
                <div class="mt-2 pt-2 border-t border-neutral-200 flex items-center justify-between text-sm">
                  <span class="text-neutral-900 font-semibold">Total</span>
                  <span class="font-bold text-primary-700">{{ grandTotalLabel }}</span>
                </div>
                <p class="mt-1 text-[11px] text-neutral-500">Livraison et taxes calculees a l'etape de paiement.</p>
              </div>

              <UButton
                color="primary"
                label="Passer a la caisse"
                to="/checkout"
                class="w-full justify-center text-center h-10"
                :disabled="!items.length || pending"
                @click="cartOpen = false" />
            </div>
          </template>
        </USlideover>
      </template>
    </UHeader>

    <div class="bg-neutral-950 sticky top-0 z-50 ring ring-muted/20">
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
