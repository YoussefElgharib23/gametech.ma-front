<script lang="ts">
export interface BrandSummary {
  id: number;
  name: string;
  slug: string;
  image: string | null;
}
</script>

<script setup lang="ts">
const props = defineProps<{
  brands?: BrandSummary[];
}>();

const fallbackBrands = [
  { name: "ASUS", icon: "i-simple-icons-asus", color: "#00539B", href: "#" },
  { name: "Logitech", icon: "i-simple-icons-logitech", color: "#00B8FC", href: "#" },
  { name: "NVIDIA", icon: "i-simple-icons-nvidia", color: "#76B900", href: "#" },
  { name: "AMD", icon: "i-simple-icons-amd", color: "#ED1C24", href: "#" },
  { name: "Intel", icon: "i-simple-icons-intel", color: "#0071C5", href: "#" },
  { name: "Corsair", icon: "i-simple-icons-corsair", color: "#F00000", href: "#" },
  { name: "Razer", icon: "i-simple-icons-razer", color: "#00FF00", href: "#" },
  { name: "MSI", icon: "i-simple-icons-msi", color: "#FF0000", href: "#" },
  { name: "Gigabyte", icon: "i-simple-icons-gigabyte", color: "#E60012", href: "#" },
  { name: "EVGA", icon: "i-simple-icons-evga", color: "#292929", href: "#" },
  { name: "Cooler Master", icon: "i-simple-icons-coolermaster", color: "#E83E2B", href: "#" },
  { name: "Kingston", icon: "i-simple-icons-kingston", color: "#ED1C24", href: "#" },
  { name: "G.Skill", icon: "i-simple-icons-gskill", color: "#CC0000", href: "#" },
  { name: "Seagate", icon: "i-simple-icons-seagate", color: "#6AB2DF", href: "#" },
  { name: "Western Digital", icon: "i-simple-icons-westerndigital", color: "#0078D4", href: "#" },
];

const hasApiBrands = computed(() => props.brands && props.brands.length > 0);

const hoveredSlug = ref<string | null>(null);
</script>

<template>
  <UContainer class="py-8">
    <h2 class="text-lg font-semibold text-default mb-6">Nos marques</h2>

    <!-- Dynamic brands from API -->
    <div v-if="hasApiBrands" class="flex items-center flex-wrap gap-8">
      <UTooltip
        v-for="brand in props.brands"
        :key="brand.slug"
        :text="`Voir la page de la marque ${brand.name}`"
        :delay-duration="0">
        <NuxtLink
          :href="`/brands/${brand.slug}`"
          class="group flex flex-col items-center justify-center gap-2 hover:scale-105 transition-all duration-300"
          :class="hoveredSlug && hoveredSlug !== brand.slug ? 'opacity-20 blur-xs' : 'opacity-100'"
          @mouseenter="hoveredSlug = brand.slug"
          @mouseleave="hoveredSlug = null">
          <div
            class="group-hover:shadow-lg rounded-md overflow-hidden aspect-square sm:h-22 h-[70px] flex items-center justify-center">
            <NuxtImg v-if="brand.image" :src="brand.image" :alt="brand.name" class="" />
            <UIcon v-else name="i-lucide-image" class="text-neutral-400 text-3xl" />
          </div>
          <span class="text-sm font-medium text-neutral-700 truncate">
            {{ brand.name }}
          </span>
        </NuxtLink>
      </UTooltip>
    </div>

    <!-- Fallback to static icons if no API brands -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <NuxtLink
        v-for="brand in fallbackBrands"
        :key="brand.name"
        :to="brand.href"
        class="flex flex-col items-center justify-center gap-2">
        <UIcon :name="brand.icon" class="size-10" :style="{ color: brand.color }" aria-hidden />
        <span class="text-sm font-medium text-neutral-700">
          {{ brand.name }}
        </span>
      </NuxtLink>
    </div>
  </UContainer>
</template>
