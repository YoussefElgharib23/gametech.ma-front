<script setup lang="ts">
import { refDebounced } from "@vueuse/core";

interface SearchProduct {
  id: number;
  slug: string;
  title: string;
  image: string | null;
  priceLabel: string;
  oldPriceLabel: string | null;
  isPromo: boolean;
}

interface SearchResponse {
  items: SearchProduct[];
  has_more: boolean;
}

const searchTerm = ref("");
const debouncedSearch = refDebounced(searchTerm, 400);
const open = ref(false);
const isLoading = ref(false);
const results = ref<SearchProduct[]>([]);
const hasMore = ref(false);

const loadProducts = async () => {
  isLoading.value = true;
  try {
    const q = debouncedSearch.value.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("limit", "5");

    const data = await $apiFetch<SearchResponse>(`/search/products?${params.toString()}`);
    results.value = data.items ?? [];
    hasMore.value = !!data.has_more;
  } catch {
    results.value = [];
    hasMore.value = false;
  } finally {
    isLoading.value = false;
  }
};

watch(open, async function (val: boolean) {
  if (!val) {
    return (results.value = []);
  }

  console.log("watch open", val);

  await loadProducts();
});

watch(
  debouncedSearch,
  async (term) => {
    if (!open.value) return;

    await loadProducts();
  },
  { immediate: true },
);
</script>

<template>
  <UPopover v-model:open="open" :dismissible="false" :ui="{ content: 'w-full sm:w-[500px] p-0' }" class="">
    <template #anchor>
      <UInput
        v-model="searchTerm"
        placeholder="Rechercher dans le catalogue"
        trailing-icon="i-lucide-search"
        class="relative z-50 w-full"
        :ui="{
          base: 'h-10 w-full sm:w-[500px]',
        }"
        @focus="open = true" />
    </template>

    <template #content>
      <div class="max-h-80 overflow-y-auto w-full">
        <div class="flex items-center justify-between px-3 py-2 border-b border-neutral-100">
          <span class="text-xs font-medium text-neutral-600">Résultats de recherche</span>
          <button type="button" class="text-[11px] text-neutral-400 hover:text-neutral-600" @click="open = false">Fermer</button>
        </div>

        <div v-if="isLoading" class="px-4 py-3 text-xs text-neutral-500">Recherche en cours…</div>

        <div v-else-if="results.length === 0" class="px-4 py-3 text-xs text-neutral-500">Aucun produit trouvé.</div>

        <ul v-else class="divide-y divide-neutral-100">
          <li v-for="product in results" :key="product.id">
            <NuxtLink
              :to="`/products/${product.slug}`"
              class="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50"
              @click="open = false">
              <div class="h-12 w-12 rounded-md overflow-hidden bg-neutral-100 flex items-center justify-center">
                <img
                  v-if="product.image"
                  :src="product.image"
                  :alt="product.title"
                  class="h-full w-full object-cover"
                  loading="lazy" />
                <UIcon v-else name="i-lucide-image" class="text-neutral-300" />
              </div>

              <div class="min-w-0 flex-1">
                <p class="text-xs font-medium text-neutral-900 truncate">
                  {{ product.title }}
                </p>
                <div class="mt-1 flex items-center gap-1 text-xs">
                  <span class="font-semibold text-brand-accent-600">
                    {{ product.priceLabel }}
                  </span>
                  <span v-if="product.oldPriceLabel" class="text-[11px] text-neutral-400 line-through">
                    {{ product.oldPriceLabel }}
                  </span>
                  <span
                    v-if="product.isPromo"
                    class="ml-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    En promo
                  </span>
                </div>
              </div>
            </NuxtLink>
          </li>

          <li v-if="hasMore" class="px-4 py-2 text-center">
            <NuxtLink
              :to="`/search?query=${searchTerm}`"
              class="inline-flex items-center gap-1 text-[11px] font-medium text-primary-600 hover:text-primary-700"
              @click="open = false">
              <span>Voir plus de résultats</span>
              <UIcon name="i-lucide-arrow-right" class="h-3 w-3" />
            </NuxtLink>
          </li>
        </ul>
      </div>
    </template>
  </UPopover>
</template>

<style>
@media (max-width: 640px) {
  [data-reka-popper-content-wrapper] {
    min-width: 92% !important;
  }
}
</style>
