<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";

export interface ArchiveBrandOption {
  name: string;
  image?: string | null;
}

const props = defineProps<{
  filterItems: AccordionItem[];
  filteredBrands: ArchiveBrandOption[];
  boundsMin: number;
  boundsMax: number;
}>();

const priceRange = defineModel<[number, number]>("priceRange", { required: true });
const brandSearchQuery = defineModel<string>("brandSearchQuery", { required: true });
const selectedBrands = defineModel<string[]>("selectedBrands", { required: true });
const stockStatusFilter = defineModel<"all" | "in_stock" | "out_of_stock" | "preorder">("stockStatusFilter", {
  required: true,
});
const promoFilter = defineModel<"all" | "promo" | "no_promo">("promoFilter", { required: true });

const hasPriceFilter = computed(
  () => priceRange.value[0] !== props.boundsMin || priceRange.value[1] !== props.boundsMax,
);
const hasStockFilter = computed(() => stockStatusFilter.value !== "all");
const hasPromoFilter = computed(() => promoFilter.value !== "all");

function toggleBrand(name: string, checked: boolean) {
  if (checked) {
    if (!selectedBrands.value.includes(name)) selectedBrands.value = [...selectedBrands.value, name];
  } else {
    selectedBrands.value = selectedBrands.value.filter((b) => b !== name);
  }
}

function resetPriceFilter() {
  priceRange.value = [props.boundsMin, props.boundsMax];
}

function clearBrandFilter(brand?: string) {
  if (!brand) {
    selectedBrands.value = [];
    return;
  }
  selectedBrands.value = selectedBrands.value.filter((b) => b !== brand);
}
</script>

<template>
  <div class="space-y-4">
    <UAccordion :items="filterItems" type="multiple" class="divide-y divide-muted" :ui="{ body: 'sm:p-0 p-0' }">
      <template #price>
        <div class="space-y-4 p-4">
          <div class="flex items-center justify-between text-xs text-neutral-500">
            <span>Plage de prix (MAD)</span>
            <span class="font-medium text-neutral-700 tabular-nums">{{ priceRange[0] }} – {{ priceRange[1] }}</span>
          </div>

          <USlider v-model="priceRange" :min="boundsMin" :max="boundsMax" color="primary" />

          <div class="flex items-center gap-3 pt-2">
            <UInput
              v-model.number="priceRange[0]"
              type="number"
              size="xs"
              :min="boundsMin"
              :max="priceRange[1]"
              class="w-full"
              placeholder="Min" />
            <span class="text-xs text-neutral-400">–</span>
            <UInput
              v-model.number="priceRange[1]"
              type="number"
              size="xs"
              :min="priceRange[0]"
              :max="boundsMax"
              class="w-full"
              placeholder="Max" />
          </div>
        </div>
      </template>

      <template #brand>
        <div class="p-2">
          <p class="mb-2 text-xs text-neutral-500">Sélectionnez une ou plusieurs marques.</p>
          <UInput
            v-model="brandSearchQuery"
            placeholder="Rechercher une marque..."
            size="sm"
            icon="i-heroicons-magnifying-glass"
            class="w-full" />
          <div class="max-h-64 space-y-1.5 overflow-y-auto">
            <label
              v-for="brand in filteredBrands"
              :key="brand.name"
              class="flex cursor-pointer items-center gap-2.5 rounded-md p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <UCheckbox
                :model-value="selectedBrands.includes(brand.name)"
                color="primary"
                size="sm"
                @update:model-value="(v) => toggleBrand(brand.name, v === true)" />
              <img
                v-if="brand.image"
                :src="brand.image"
                :alt="brand.name"
                class="h-6 w-8 shrink-0 object-contain object-center"
                loading="lazy" />
              <span
                v-else
                class="flex h-6 w-8 shrink-0 items-center justify-center rounded bg-neutral-200 text-[10px] font-medium text-neutral-500 dark:bg-neutral-700">
                {{ brand.name.slice(0, 2).toUpperCase() }}
              </span>
              <span class="truncate text-sm text-neutral-800 dark:text-neutral-200">{{ brand.name }}</span>
            </label>
          </div>
        </div>
      </template>

      <template #stock>
        <div class="p-2">
          <p class="text-xs text-neutral-500">Filtrer par disponibilité.</p>
          <URadioGroup
            v-model="stockStatusFilter"
            :items="[
              { label: 'Tous', value: 'all' },
              { label: 'En stock', value: 'in_stock' },
              { label: 'Rupture de stock', value: 'out_of_stock' },
              { label: 'Pré-commande', value: 'preorder' },
            ]"
            size="xs"
            color="primary" />
        </div>
      </template>

      <template #promo>
        <div class="p-2">
          <p class="text-xs text-neutral-500">Filtrer par promotion.</p>
          <URadioGroup
            v-model="promoFilter"
            :items="[
              { label: 'Tous', value: 'all' },
              { label: 'En promo', value: 'promo' },
              { label: 'Non en promo', value: 'no_promo' },
            ]"
            size="xs"
            color="primary" />
        </div>
      </template>
    </UAccordion>

    <div v-if="hasPriceFilter || selectedBrands.length || hasStockFilter || hasPromoFilter" class="space-y-2 pt-1 text-xs">
      <div v-if="hasPriceFilter" class="flex flex-col gap-1">
        <span class="text-xs font-medium text-neutral-500">Prix</span>
        <div class="flex items-center gap-1.5">
          <UBadge color="primary" variant="soft" size="xs" class="inline-flex items-center gap-1">
            <span class="text-[11px]">{{ priceRange[0] }} – {{ priceRange[1] }}</span>
            <button
              type="button"
              class="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-primary-700 hover:bg-primary-100"
              @click.stop="resetPriceFilter">
              ×
            </button>
          </UBadge>
        </div>
      </div>

      <div v-if="selectedBrands.length" class="flex flex-col gap-1">
        <span class="text-xs font-medium text-neutral-500">Marque</span>
        <div class="flex flex-wrap gap-1.5">
          <UBadge
            v-for="brand in selectedBrands"
            :key="brand"
            color="neutral"
            variant="soft"
            size="xs"
            class="inline-flex items-center gap-1">
            <span class="text-[11px]">{{ brand }}</span>
            <button
              type="button"
              class="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-neutral-700 hover:bg-neutral-100"
              @click.stop="clearBrandFilter(brand)">
              ×
            </button>
          </UBadge>
        </div>
      </div>

      <div v-if="hasStockFilter" class="flex flex-col gap-1">
        <span class="text-xs font-medium text-neutral-500">Stock</span>
        <div class="flex flex-wrap gap-1.5">
          <UBadge color="neutral" variant="soft" size="xs" class="inline-flex items-center gap-1">
            <span class="text-[11px]">
              {{
                stockStatusFilter === "in_stock"
                  ? "En stock"
                  : stockStatusFilter === "out_of_stock"
                    ? "Rupture de stock"
                    : stockStatusFilter === "preorder"
                      ? "Pré-commande"
                      : ""
              }}
            </span>
            <button
              type="button"
              class="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-neutral-700 hover:bg-neutral-100"
              @click.stop="stockStatusFilter = 'all'">
              ×
            </button>
          </UBadge>
        </div>
      </div>

      <div v-if="hasPromoFilter" class="flex flex-col gap-1">
        <span class="text-xs font-medium text-neutral-500">Promotion</span>
        <div class="flex flex-wrap gap-1.5">
          <UBadge color="neutral" variant="soft" size="xs" class="inline-flex items-center gap-1">
            <span class="text-[11px]">
              {{ promoFilter === "promo" ? "En promo" : promoFilter === "no_promo" ? "Non en promo" : "" }}
            </span>
            <button
              type="button"
              class="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-neutral-700 hover:bg-neutral-100"
              @click.stop="promoFilter = 'all'">
              ×
            </button>
          </UBadge>
        </div>
      </div>

      <button
        type="button"
        class="text-[11px] font-medium text-neutral-500 hover:text-neutral-700"
        @click.stop="
          () => {
            resetPriceFilter();
            clearBrandFilter();
            stockStatusFilter = 'all';
            promoFilter = 'all';
          }
        ">
        Tout effacer
      </button>
    </div>
  </div>
</template>
