<script setup lang="ts">
interface MegaMenuLink {
  label: string;
  to: string;
}

interface MegaMenuCategory {
  label: string;
  link?: string;
  links: MegaMenuLink[];
}

interface NavSubcategory {
  id: number;
  name: string;
  slug: string;
}

interface NavCategory {
  id: number;
  name: string;
  slug: string;
  subcategories: NavSubcategory[];
}

interface CategoriesWithChildrenResponse {
  categories: NavCategory[];
}

interface MegaMenuFeature {
  eyebrow: string;
  title: string;
  description: string;
  priceLabel: string;
  to: string;
  ctaLabel: string;
  helperText: string;
  helperLinkLabel: string;
  helperLinkTo: string;
}

const open = ref(false);

const { data: categoriesData } = await useAPIFetch<CategoriesWithChildrenResponse>("/categories/with-children");

const navCategories = computed(() => categoriesData.value?.categories ?? []);

const megaMenuCategories = computed<MegaMenuCategory[]>(() => {
  return navCategories.value.map((cat) => ({
    label: cat.name,
    link: `/category/${cat.slug}`,
    links: cat.subcategories.map((sub) => ({
      label: sub.name,
      to: `/subcategory/${sub.slug}`,
    })),
  }));
});

const megaMenuFeature = ref<MegaMenuFeature>({
  eyebrow: "PC Config Builder",
  title: "Montez votre PC sur-mesure",
  description: "Choisissez vos composants, vérifiez la compatibilité et obtenez une config prête à commander.",
  priceLabel: "Démarrer",
  to: "/pc-config-builder",
  ctaLabel: "Construire ma config",
  helperText: "Besoin d'inspiration ? Parcourez nos catégories et nos meilleures sélections.",
  helperLinkLabel: "Explorer les produits →",
  helperLinkTo: "/",
});

const quickLinks = [
  { label: "Configurateur", to: "/pc-config-builder", icon: "i-lucide-cpu" },
  { label: "Nouvel arrivage", to: "/section/nouvel-arrivage", icon: "i-lucide-plus" },
  { label: "Meilleures ventes", to: "/section/meilleures-ventes", icon: "i-lucide-star" },
  { label: "Promotion", to: "/section/promotion", icon: "i-lucide-percent" },
] as const;
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <UPopover
      v-model:open="open"
      :content="{
        align: 'start',
        side: 'bottom',
        sideOffset: 8,
      }"
      :ui="{ content: 'w-[960px] max-w-[90vw] p-4' }"
      arrow>
      <UButton
        icon="i-lucide-menu"
        color="secondary"
        label="Tous nos produits"
        variant="solid"
        class="rounded-none py-3 font-semibold uppercase cursor-pointer h-11" />

      <template #content>
        <!-- Masonry Categories -->
        <div class="columns-2 md:columns-3 gap-8">
          <div v-for="section in megaMenuCategories" :key="section.label" class="space-y-1.5 break-inside-avoid mb-6">
            <NuxtLink :to="section.link" class="text-xs font-semibold uppercase text-neutral-400" @click="open = false">
              {{ section.label }}
            </NuxtLink>

            <ul class="space-y-1 text-sm">
              <li v-for="link in section.links" :key="link.label" class="group flex items-center gap-x-1">
                <NuxtLink :to="link.to" class="hover:text-primary-700 block py-0.5" @click="open = false">
                  {{ link.label }}
                </NuxtLink>

                <UIcon
                  name="i-lucide-arrow-up-right"
                  class="text-neutral-500 size-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </li>
            </ul>
          </div>
        </div>

        <!-- Feature Product -->
        <div class="mt-4 rounded-xl bg-neutral-100/80 border border-neutral-200 p-4 flex flex-col justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase text-neutral-500 mb-1">
              {{ megaMenuFeature.eyebrow }}
            </p>

            <p class="text-sm font-semibold mb-1">
              {{ megaMenuFeature.title }}
            </p>

            <p class="text-xs text-neutral-600 mb-3">
              {{ megaMenuFeature.description }}
            </p>
          </div>

          <div class="flex items-center justify-between gap-3">
            <p class="text-lg font-bold text-primary-700">
              {{ megaMenuFeature.priceLabel }}
            </p>

            <UButton
              size="xs"
              color="primary"
              trailing-icon="i-lucide-arrow-up-right"
              :label="megaMenuFeature.ctaLabel"
              :to="megaMenuFeature.to"
              @click="open = false" />
          </div>

          <div class="mt-3 pt-3 border-t border-neutral-200 flex justify-between items-center">
            <span class="text-[11px] text-neutral-500">
              {{ megaMenuFeature.helperText }}
            </span>

            <NuxtLink
              :to="megaMenuFeature.helperLinkTo"
              class="text-[11px] font-semibold text-primary-700 hover:underline"
              @click="open = false">
              {{ megaMenuFeature.helperLinkLabel }}
            </NuxtLink>
          </div>
        </div>
      </template>
    </UPopover>

    <div class="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2">
      <UButton
        v-for="link in quickLinks"
        :key="link.to"
        :to="link.to"
        :icon="'icon' in link ? link.icon : undefined"
        color="neutral"
        variant="ghost"
        :label="link.label"
        class="rounded-none font-semibold uppercase text-white hover:text-primary h-11" />
    </div>
  </div>
</template>
