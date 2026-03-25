<script lang="ts">
import type { LandingProductCard } from "~/components/Landing/Products/Index.vue";

export interface ProductsPerCategoryBlock {
  slug: string;
  name: string;
  products: LandingProductCard[];
}
</script>

<script setup lang="ts">
interface DemoProduct {
  id: number;
  slug: string;
  image: string;
  stockStatus: string;
  title: string;
  currentPrice: string;
  oldPrice?: string;
}

const props = defineProps<{
  /** When omitted (e.g. dashboard preview), built-in demo data is used. */
  blocks?: ProductsPerCategoryBlock[];
}>();

const useDemo = computed(() => props.blocks === undefined);

const demoCategoryTabs = [
  { value: "carte-graphique", label: "CARTE GRAPHIQUE" },
  { value: "processeur", label: "PROCESSEUR" },
  { value: "memoires-ram", label: "MÉMOIRES RAM" },
  { value: "disques-durs", label: "DISQUES DURS" },
  { value: "cpu-cooler", label: "CPU COOLER" },
  { value: "alimentation-pc", label: "ALIMENTATION PC (PSU)" },
];

const makeDemoProducts = (prefix: string, count: number, baseId: number): DemoProduct[] =>
  Array.from({ length: count }, (_, i) => {
    const id = baseId + i;
    const hasOld = i % 3 !== 2;
    return {
      id,
      slug: `demo-${prefix}-${id}`.toLowerCase().replace(/\s+/g, "-"),
      image: `/images/products/product-${id % 12 || 12}.jpg`,
      stockStatus: "EN STOCK",
      title: `${prefix} ${i + 1}`,
      currentPrice: `${[999, 3699, 119, 1399, 255, 10799][i % 6]} MAD`,
      ...(hasOld && {
        oldPrice: `${[1399, 4400, 284, 1800, 284, 12200][i % 6]} MAD`,
      }),
    };
  });

const demoProductsByCategory = ref<Record<string, DemoProduct[]>>({
  "carte-graphique": makeDemoProducts("Carte graphique", 10, 101),
  processeur: makeDemoProducts("Processeur", 10, 201),
  "memoires-ram": makeDemoProducts("RAM", 10, 301),
  "disques-durs": makeDemoProducts("Disque dur", 10, 401),
  "cpu-cooler": makeDemoProducts("CPU Cooler", 10, 501),
  "alimentation-pc": makeDemoProducts("Alimentation", 10, 601),
});

const categoryTabs = computed(() => {
  if (useDemo.value) {
    return demoCategoryTabs;
  }
  return (props.blocks ?? []).map((b) => ({
    value: b.slug,
    label: b.name.toUpperCase(),
  }));
});

const activeCategory = ref("");

watch(
  [useDemo, () => props.blocks],
  () => {
    if (useDemo.value) {
      const first = demoCategoryTabs[0]?.value;
      if (first && !demoProductsByCategory.value[activeCategory.value]) {
        activeCategory.value = first;
      } else if (first && !activeCategory.value) {
        activeCategory.value = first;
      }
      return;
    }
    const list = props.blocks ?? [];
    if (list.length === 0) {
      return;
    }
    if (!list.some((b) => b.slug === activeCategory.value)) {
      activeCategory.value = list[0]!.slug;
    }
  },
  { immediate: true },
);

const currentProducts = computed((): DemoProduct[] | LandingProductCard[] => {
  if (useDemo.value) {
    return demoProductsByCategory.value[activeCategory.value] ?? [];
  }
  const block = props.blocks?.find((b) => b.slug === activeCategory.value);
  return block?.products ?? [];
});

const showSection = computed(() => {
  if (useDemo.value) {
    return true;
  }
  return (props.blocks ?? []).length > 0;
});

const categoryCarousel = useTemplateRef<{ emblaApi: { scrollPrev: () => void; scrollNext: () => void } }>("categoryCarousel");

const scrollPrev = () => categoryCarousel.value?.emblaApi?.scrollPrev();
const scrollNext = () => categoryCarousel.value?.emblaApi?.scrollNext();
</script>

<template>
  <UContainer v-if="showSection" class="py-8">
    <div class="flex items-center justify-between mb-4">
      <UTooltip text="Précédent" :delay-duration="0">
        <UButton
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="ghost"
          aria-label="Précédent"
          class="rounded-full"
          @click="scrollPrev" />
      </UTooltip>
      <UTooltip text="Suivant" :delay-duration="0">
        <UButton
          icon="i-lucide-chevron-right"
          color="neutral"
          variant="ghost"
          aria-label="Suivant"
          class="rounded-full"
          @click="scrollNext" />
      </UTooltip>
    </div>
    <div class="flex gap-6 lg:gap-8">
      <!-- Left: vertical category buttons -->
      <div class="shrink-0 w-48 lg:w-56 flex flex-col gap-2">
        <UButton
          v-for="cat in categoryTabs"
          :key="cat.value"
          :color="activeCategory === cat.value ? 'primary' : 'neutral'"
          :variant="activeCategory === cat.value ? 'solid' : 'outline'"
          class="group w-full justify uppercase font-semibold"
          size="xl"
          @click="activeCategory = cat.value">
          <span
            :class="[
              'flex shrink-0 items-center justify-center overflow-hidden transition-[width,opacity] duration-200',
              activeCategory === cat.value ? 'w-4 opacity-100' : 'w-0 opacity-0 group-hover:w-4 group-hover:opacity-100',
            ]">
            <UIcon name="i-lucide-chevron-right" class="size-4 shrink-0" />
          </span>
          <span class="shrink-0">{{ cat.label }}</span>
        </UButton>
      </div>

      <!-- Right: product carousel -->
      <div class="flex-1 min-w-0">
        <UCarousel
          ref="categoryCarousel"
          v-slot="{ item }"
          :key="activeCategory"
          :items="currentProducts"
          :slides-to-scroll="1"
          :autoplay="{ delay: 4000 }"
          :ui="{
            item: 'sm:basis-1/2 md:basis-1/3 lg:basis-1/4 shrink-0',
            container: 'gap-1',
            viewport: 'overflow-hidden',
          }">
          <div class="py-2">
            <ProductCard
              :to="`/products/${item.slug}`"
              :image="item.image ?? ''"
              :stock-status="item.stockStatus"
              :title="item.title"
              :current-price="item.currentPrice"
              :old-price="item.oldPrice ?? ''" />
          </div>
        </UCarousel>
      </div>
    </div>
    <div class="mt-6 flex justify-center">
      <UButton
        label="Voir tous les produits"
        trailing-icon="i-lucide-arrow-up-right"
        color="primary"
        size="lg"
        variant="outline"
        :to="`/category/${activeCategory}`" />
    </div>
  </UContainer>
</template>
