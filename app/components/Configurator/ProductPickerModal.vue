<script setup lang="ts">
import type { ConfiguratorProduct } from "~/composables/useConfigurator";
import type { ConfiguratorCategory } from "~/constants/configuratorCategories";

interface ApiResponse {
  data: ConfiguratorProduct[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

const emptyMeta = () => ({ current_page: 1, last_page: 1, per_page: 20, total: 0 });

const props = defineProps<{
  category: ConfiguratorCategory | null;
  selectedIds: Set<number>;
}>();

const emit = defineEmits<{
  select: [product: ConfiguratorProduct];
  close: [];
}>();

const isOpen = defineModel<boolean>("open", { default: false });

const searchQuery = ref("");
const page = ref(1);
const perPage = 20;
const loading = ref(false);
const products = ref<ConfiguratorProduct[]>([]);
const meta = ref<ApiResponse["meta"]>(emptyMeta());

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedSearch = ref("");

watch(searchQuery, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedSearch.value = val;
    page.value = 1;
  }, 300);
});

watch(
  () => props.category,
  () => {
    searchQuery.value = "";
    debouncedSearch.value = "";
    page.value = 1;
    products.value = [];
    meta.value = emptyMeta();
  },
);

async function fetchProducts() {
  if (!props.category) return;
  loading.value = true;
  try {
    const params = new URLSearchParams();
    params.set("category", props.category);
    if (debouncedSearch.value) params.set("q", debouncedSearch.value);
    params.set("page", String(page.value));
    params.set("per_page", String(perPage));

    const result = await $apiFetch<ApiResponse>(`/configurator/products?${params}`, {
      method: "GET",
      showToast: false,
      withLoading: false,
    });

    products.value = result?.data ?? [];
    meta.value = result?.meta ?? emptyMeta();
  } catch {
    products.value = [];
    meta.value = emptyMeta();
  } finally {
    loading.value = false;
  }
}

watch(isOpen, (open) => {
  if (open) fetchProducts();
});

watch([debouncedSearch, page], () => {
  if (isOpen.value) fetchProducts();
});

function handleSelect(product: ConfiguratorProduct) {
  emit("select", product);
}

function handleClose() {
  isOpen.value = false;
  emit("close");
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="`Choisir — ${category ?? ''}`"
    :ui="{ content: 'sm:max-w-3xl' }"
    @update:open="
      (v: boolean) => {
        if (!v) handleClose();
      }
    ">
    <template #default>
      <span />
    </template>

    <template #body>
      <div class="flex flex-col gap-4">
        <UInput
          v-model="searchQuery"
          placeholder="Rechercher un produit..."
          icon="i-lucide-search"
          size="lg"
          autofocus
          class="w-full" />

        <div class="text-xs text-neutral-500">
          {{ meta.total }} produit{{ meta.total !== 1 ? "s" : "" }} trouvé{{ meta.total !== 1 ? "s" : "" }}
        </div>

        <!-- Loading skeleton -->
        <div v-if="loading && products.length === 0" class="flex flex-col gap-3">
          <div v-for="i in 5" :key="i" class="h-16 bg-neutral-100 rounded-lg animate-pulse" />
        </div>

        <!-- Empty state -->
        <div v-else-if="products.length === 0" class="py-12 text-center text-neutral-400">
          <UIcon name="i-lucide-search-x" class="text-4xl mb-2" />
          <p>Aucun produit trouvé</p>
        </div>

        <!-- Product list -->
        <div
          v-else
          class="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1"
          :class="{ 'opacity-60 pointer-events-none': loading }">
          <button
            v-for="product in products"
            :key="product.id"
            type="button"
            :disabled="selectedIds.has(product.id)"
            class="flex items-center gap-3 rounded-lg border p-3 text-left transition-all"
            :class="
              selectedIds.has(product.id)
                ? 'border-primary-300 bg-primary-50 cursor-default opacity-70'
                : 'border-neutral-200 hover:border-primary-400 hover:bg-primary-50/50 cursor-pointer'
            "
            @click="handleSelect(product)">
            <div
              class="size-12 shrink-0 rounded-md bg-white border border-neutral-100 flex items-center justify-center overflow-hidden">
              <NuxtImg
                v-if="product.image"
                :src="product.image"
                :alt="product.title"
                class="size-full object-contain"
                loading="lazy" />
              <UIcon v-else name="i-lucide-image" class="text-neutral-300 text-lg" />
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-neutral-900 truncate">{{ product.title }}</p>
              <p v-if="product.brand_name" class="text-xs text-neutral-500">{{ product.brand_name }}</p>
            </div>

            <div class="shrink-0 text-right">
              <p class="text-sm font-bold text-primary-700 whitespace-nowrap">{{ product.currentPrice }}</p>
              <p v-if="product.oldPrice" class="text-xs text-neutral-400 line-through">{{ product.oldPrice }}</p>
            </div>

            <div class="shrink-0 inline-flex items-center justify-center">
              <UIcon v-if="selectedIds.has(product.id)" name="i-lucide-check-circle" class="text-primary-500 size-4" />
              <UIcon v-else name="i-lucide-plus-circle" class="text-neutral-400 size-4" />
            </div>
          </button>
        </div>

        <!-- Pagination -->
        <div v-if="meta.last_page > 1" class="flex items-center justify-center pt-2">
          <UPagination
            v-model:page="page"
            :items-per-page="meta.per_page"
            :total="meta.total"
            :sibling-count="1"
            show-edges
            size="sm" />
        </div>
      </div>
    </template>
  </UModal>
</template>
