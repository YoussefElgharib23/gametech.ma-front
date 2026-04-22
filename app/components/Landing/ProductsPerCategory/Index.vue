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

const productsSwiperRef = ref(null);

const productsSwiper = useSwiper(productsSwiperRef, {
  loop: true,
  autoplay: {
    delay: 4000,
    disableOnInteraction: false,
  },
  slidesPerView: 2,
  spaceBetween: 8,
  breakpoints: {
    768: { slidesPerView: 3, spaceBetween: 12 },
    1024: { slidesPerView: 4, spaceBetween: 12 },
  },
  mousewheel: {
    forceToAxis: true,
  },
});

const scrollPrev = () => productsSwiper.prev();
const scrollNext = () => productsSwiper.next();

watch(
  [productsSwiperRef, activeCategory],
  async () => {
    await nextTick();
    const el = productsSwiperRef.value as any;
    el?.initialize?.();
    el?.swiper?.update?.();
  },
  { immediate: true },
);
</script>

<template>
  <UContainer v-if="showSection" class="py-6 sm:py-8">
    <div class="mb-3 flex items-center justify-end gap-2 sm:mb-4 lg:justify-between">
      <UTooltip text="Précédent" :delay-duration="0">
        <UButton
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="ghost"
          aria-label="Précédent"
          size="md"
          class="rounded-full"
          @click="scrollPrev" />
      </UTooltip>
      <UTooltip text="Suivant" :delay-duration="0">
        <UButton
          icon="i-lucide-chevron-right"
          color="neutral"
          variant="ghost"
          aria-label="Suivant"
          size="md"
          class="rounded-full"
          @click="scrollNext" />
      </UTooltip>
    </div>
    <div class="flex flex-col gap-4 lg:flex-row lg:gap-8">
      <!-- Categories: horizontal scroll on small screens, rail on lg+ -->
      <div
        class="-mx-4 flex shrink-0 flex-row gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:thin] lg:mx-0 lg:w-56 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
        <UButton
          v-for="cat in categoryTabs"
          :key="cat.value"
          :color="activeCategory === cat.value ? 'primary' : 'neutral'"
          :variant="activeCategory === cat.value ? 'solid' : 'outline'"
          class="group shrink-0 justify-center uppercase font-semibold whitespace-nowrap lg:w-full lg:whitespace-normal lg:justify-start lg:text-left"
          size="lg"
          @click="activeCategory = cat.value">
          <span
            :class="[
              'hidden shrink-0 items-center justify-center overflow-hidden transition-[width,opacity] duration-200 lg:flex',
              activeCategory === cat.value ? 'w-4 opacity-100' : 'w-0 opacity-0 group-hover:w-4 group-hover:opacity-100',
            ]">
            <UIcon name="i-lucide-chevron-right" class="size-4 shrink-0" />
          </span>
          <span class="max-w-[75vw] truncate sm:max-w-none lg:max-w-full lg:wrap-break-word lg:leading-snug">
            {{ cat.label }}
          </span>
        </UButton>
      </div>

      <!-- Product carousel -->
      <div class="min-w-0 flex-1">
        <ClientOnly>
          <swiper-container ref="productsSwiperRef" :init="false" :key="activeCategory">
            <swiper-slide v-for="item in currentProducts" :key="item.id">
              <div class="py-1 sm:py-2">
                <ProductCard
                  :to="`/products/${item.slug}`"
                  :image="item.image ?? ''"
                  :images="'images' in item ? item.images ?? [] : []"
                  :stock-status="item.stockStatus"
                  :title="item.title"
                  :current-price="item.currentPrice"
                  :old-price="item.oldPrice ?? ''" />
              </div>
            </swiper-slide>
          </swiper-container>
          <template #fallback>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              <div v-for="item in (currentProducts as any[]).slice(0, 8)" :key="item.id" class="py-1 sm:py-2">
                <ProductCard
                  :to="`/products/${item.slug}`"
                  :image="item.image ?? ''"
                  :images="'images' in item ? item.images ?? [] : []"
                  :stock-status="item.stockStatus"
                  :title="item.title"
                  :current-price="item.currentPrice"
                  :old-price="item.oldPrice ?? ''" />
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>
    <div class="mt-5 flex justify-center px-1 sm:mt-6">
      <UButton
        class="w-full max-w-md sm:w-auto text-center justify-center"
        label="Voir tous les produits"
        trailing-icon="i-lucide-arrow-up-right"
        color="primary"
        size="lg"
        variant="outline"
        :to="`/category/${activeCategory}`" />
    </div>
  </UContainer>
</template>
