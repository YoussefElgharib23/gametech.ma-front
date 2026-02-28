<script setup lang="ts">
interface Product {
  id: number;
  image: string;
  stockStatus: string;
  title: string;
  currentPrice: string;
  oldPrice?: string;
}

const categories = [
  { value: "carte-graphique", label: "CARTE GRAPHIQUE" },
  { value: "processeur", label: "PROCESSEUR" },
  { value: "memoires-ram", label: "MÉMOIRES RAM" },
  { value: "disques-durs", label: "DISQUES DURS" },
  { value: "cpu-cooler", label: "CPU COOLER" },
  { value: "alimentation-pc", label: "ALIMENTATION PC (PSU)" },
];

const activeCategory = ref("carte-graphique");

const makeProducts = (
  prefix: string,
  count: number,
  baseId: number,
): Product[] =>
  Array.from({ length: count }, (_, i) => {
    const id = baseId + i;
    const hasOld = i % 3 !== 2;
    return {
      id,
      image: `/images/products/product-${id % 12 || 12}.jpg`,
      stockStatus: "EN STOCK",
      title: `${prefix} ${i + 1}`,
      currentPrice: `${[999, 3699, 119, 1399, 255, 10799][i % 6]} MAD`,
      ...(hasOld && {
        oldPrice: `${[1399, 4400, 284, 1800, 284, 12200][i % 6]} MAD`,
      }),
    };
  });

const productsByCategory = ref<Record<string, Product[]>>({
  "carte-graphique": makeProducts("Carte graphique", 10, 101),
  processeur: makeProducts("Processeur", 10, 201),
  "memoires-ram": makeProducts("RAM", 10, 301),
  "disques-durs": makeProducts("Disque dur", 10, 401),
  "cpu-cooler": makeProducts("CPU Cooler", 10, 501),
  "alimentation-pc": makeProducts("Alimentation", 10, 601),
});

const currentProducts = computed(
  () => productsByCategory.value[activeCategory.value] ?? [],
);

const categoryCarousel = useTemplateRef<{ emblaApi: any }>("categoryCarousel");

const scrollPrev = () => categoryCarousel.value?.emblaApi?.scrollPrev();
const scrollNext = () => categoryCarousel.value?.emblaApi?.scrollNext();
</script>

<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between mb-4">
      <UTooltip text="Précédent" :delay-duration="0">
        <UButton
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="ghost"
          aria-label="Précédent"
          class="rounded-full"
          @click="scrollPrev"
        />
      </UTooltip>
      <UTooltip text="Suivant" :delay-duration="0">
        <UButton
          icon="i-lucide-chevron-right"
          color="neutral"
          variant="ghost"
          aria-label="Suivant"
          class="rounded-full"
          @click="scrollNext"
        />
      </UTooltip>
    </div>
    <div class="flex gap-6 lg:gap-8">
      <!-- Left: vertical category buttons -->
      <div class="shrink-0 w-48 lg:w-56 flex flex-col gap-2">
        <UButton
          v-for="cat in categories"
          :key="cat.value"
          :color="activeCategory === cat.value ? 'primary' : 'neutral'"
          :variant="activeCategory === cat.value ? 'solid' : 'outline'"
          class="group w-full justify uppercase font-semibold"
          size="xl"
          @click="activeCategory = cat.value"
        >
          <span
            class="flex shrink-0 items-center justify-center overflow-hidden transition-[width,opacity] duration-200 w-0 opacity-0 group-hover:w-4 group-hover:opacity-100"
          >
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
            item: 'basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 shrink-0',
            container: 'gap-3',
            viewport: 'overflow-hidden',
          }"
        >
          <ProductCard
            :image="item.image"
            :stock-status="item.stockStatus"
            :title="item.title"
            :current-price="item.currentPrice"
            :old-price="item.oldPrice"
          />
        </UCarousel>
      </div>
    </div>
    <div class="mt-6 flex justify-center">
      <UButton
        to="/products"
        label="Browse all products"
        trailing-icon="i-lucide-arrow-right"
        color="primary"
        size="lg"
      />
    </div>
  </UContainer>
</template>
