<script setup lang="ts">
import type { CategoriesWithChildrenResponse } from "~/components/Landing/Header/Nav.vue";

const cartOpen = ref(false);
const { items, itemsCount, subtotalLabel, shippingLabel, grandTotalLabel, pending, incrementItem, decrementItem, removeItem } =
  useCart();

const route = useRoute();
const { storeSettings, load } = useStoreSettings();
await load();

const { isMegaMenuOpen } = useNavMegaMenuOverlay();

const currentHighlightedCategory = ref<"menu" | "special" | null>("menu");
const currentOpenedCategory = ref<any>();

watch(
  () => route.path,
  () => {
    currentHighlightedCategory.value = "menu";
    currentOpenedCategory.value = undefined;
  },
);

const { data: navCategories } = await useNuxtData<CategoriesWithChildrenResponse>("navCategories");

/** Client route: same two-segment pattern as `app/pages/[entity_type]/[entity_slug].vue`. */
function entityPagePath(entityType: string, slug: string): string {
  return `/${entityType}/${slug}`;
}

const megaMenuCategories = computed(() => {
  return navCategories.value?.categories.map((category) => ({
    id: category.id,
    label: category.name,
    to: entityPagePath("category", category.slug),
    icon: category.icon,
    groups: category.groups.map((group) => ({
      id: group.id,
      label: group.name,
      to: entityPagePath("group", group.slug),
    })),
  }));
});

const topContactLine = computed(() => {
  const parts: string[] = [];

  if (storeSettings.value.company_phone_1) {
    parts.push(`Service Client : ${storeSettings.value.company_phone_1}`);
  }

  if (storeSettings.value.company_phone_2) {
    parts.push(`Téléphone 2 : ${storeSettings.value.company_phone_2}`);
  }

  if (storeSettings.value.company_email) {
    parts.push(`Email : ${storeSettings.value.company_email}`);
  }

  return parts.join(" • ");
});
</script>

<template>
  <UApp>
    <div class="relative z-50 isolate bg-white">
      <div class="bg-brand-accent-500 border-b border-brand-dark-100">
        <UContainer class="py-2">
          <p class="text-brand-dark-500 text-xs text-center">
            {{ topContactLine || `© ${new Date().getFullYear()}` }}
          </p>
        </UContainer>
      </div>

      <UHeader
        class="static"
        :ui="{
          body: 'sm:p-0 p-0',
        }">
        <template #left>
          <NuxtLink to="/">
            <AppLogo class="w-auto h-6 shrink-0" />
          </NuxtLink>
        </template>

        <LandingHeaderSearch />

        <template #right>
          <!-- TODO: Later implmenet customer login button -->
          <!-- <UButton icon="i-lucide-log-in" label="Connexion" color="neutral" variant="ghost" aria-label="Connexion" /> -->

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

        <template #body>
          <div v-if="!currentOpenedCategory?.id" class="grid grid-cols-2 border-y-2 border-secondary">
            <button
              @click.prevent="currentHighlightedCategory = 'menu'"
              :class="[
                'h-[35px] text-sm uppercase font-medium',
                currentHighlightedCategory === 'menu' ? 'bg-secondary-500 text-secondary-950' : '',
              ]">
              Menu
            </button>
            <button
              @click.prevent="currentHighlightedCategory = 'special'"
              :class="[
                'h-[35px] text-sm uppercase font-medium',
                currentHighlightedCategory === 'special' ? 'bg-secondary-500 text-secondary-950' : '',
              ]">
              SPÉCIAL
            </button>
          </div>
          <div v-else-if="currentOpenedCategory.id && currentHighlightedCategory == 'menu'">
            <button
              @click.prevent="currentOpenedCategory = undefined"
              class="bg-secondary-500 text-secondary-950 h-[35px] uppercase font-medium flex items-center gap-x-1 w-full justify-start text-sm px-4">
              <UIcon name="i-lucide-chevron-left" class="size-4" />
              <span>Retour</span>
            </button>
          </div>

          <div v-if="currentHighlightedCategory === 'menu'">
            <div v-if="currentOpenedCategory?.id === undefined" class="divide-y divide-secondary border-b border-secondary">
              <NuxtLink to="/pc-config-builder" class="flex items-center gap-2 h-[45px] px-4 w-full font-medium">
                <UIcon name="i-lucide-cpu" class="size-5" />
                <span class="text-sm">Configurateur PC</span>
              </NuxtLink>
              <button
                v-for="item in megaMenuCategories"
                :key="item.label"
                class="flex items-center gap-2 h-[45px] px-4 w-full font-medium"
                @click="currentOpenedCategory = item">
                <div v-if="item.icon" class="size-5 rounded overflow-hidden">
                  <img :src="item.icon" class="size-full object-cover" />
                </div>
                <Icon v-else name="i-lucide-image" class="size-4" />
                <span class="text-sm">{{ item.label }}</span>

                <Icon name="i-lucide-chevron-right" class="size-4 ms-auto" />
              </button>
            </div>

            <div v-else-if="currentOpenedCategory.id !== undefined" class="divide-y divide-secondary border-b border-secondary">
              <NuxtLink
                :to="group.to"
                class="flex w-full flex-1 py-2 px-4 text-sm font-medium"
                v-for="group in currentOpenedCategory.groups">
                {{ group.label }}
              </NuxtLink>
            </div>
          </div>

          <div v-if="currentHighlightedCategory === 'special'" class="divide-y divide-secondary border-b border-secondary">
            <NuxtLink to="/" class="flex items-center text-sm h-[45px] px-4 w-full font-medium">
              <span>TOUS NOS PRODUITS</span>
            </NuxtLink>
            <NuxtLink to="/pc-config-builder" class="flex items-center uppercase text-sm h-[45px] px-4 w-full font-medium">
              <span>CONFIGURATEUR PC</span>
            </NuxtLink>
            <NuxtLink to="/section/nouvel-arrivage" class="flex items-center uppercase text-sm h-[45px] px-4 w-full font-medium">
              Nouvel arrivage
            </NuxtLink>
            <NuxtLink
              to="/section/meilleures-ventes"
              class="flex items-center uppercase text-sm h-[45px] px-4 w-full font-medium">
              Meilleures ventes
            </NuxtLink>
            <NuxtLink to="/section/promotion" class="flex items-center uppercase text-sm h-[45px] px-4 w-full font-medium">
              Promotion
            </NuxtLink>
          </div>
        </template>
      </UHeader>

      <div class="bg-neutral-950 sticky top-0 ring ring-muted/20">
        <UContainer>
          <LandingHeaderNav />
        </UContainer>
      </div>
    </div>

    <WhatsAppFloat />

    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0">
      <div
        v-if="isMegaMenuOpen"
        class="fixed inset-0 z-40 bg-neutral-950/50 backdrop-blur-[1px] pointer-events-auto"
        aria-hidden="true" />
    </Transition>

    <UMain>
      <slot />
    </UMain>

    <AppFooter />
  </UApp>
</template>
