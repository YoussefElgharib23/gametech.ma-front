<script setup lang="ts">
interface MegaMenuLink {
  label: string;
  to: string;
}

/** One group under a category (API shape normalized for mega menu). */
interface MegaMenuGroup {
  id: number;
  label: string;
  slug: string;
  /** Path to the group archive page (`pages/[entity_type]/[entity_slug].vue`). */
  link: string;
  icon: string | null;
  productsCount: number;
  /** Subcategory links under this group */
  links: MegaMenuLink[];
}

/** One top-level category column with nested groups. */
interface MegaMenuCategory {
  id: number;
  label: string;
  slug: string;
  link: string;
  image: string | null;
  icon: string | null;
  groups: MegaMenuGroup[];
  /** Flat list of all subcategory links (category → all groups); handy for flat layouts */
  links: MegaMenuLink[];
}

interface NavSubcategory {
  id: number;
  name: string;
  slug: string;
  products_count?: number;
}

interface NavGroup {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  products_count?: number;
  subcategories: NavSubcategory[];
}

interface NavCategory {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  icon?: string | null;
  groups: NavGroup[];
}

export interface CategoriesWithChildrenResponse {
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

const { setMegaMenuOpen } = useNavMegaMenuOverlay();

watch(open, (value) => setMegaMenuOpen(value), { immediate: true });

onBeforeUnmount(() => setMegaMenuOpen(false));

const { data: categoriesData } = await useAsyncData<CategoriesWithChildrenResponse>("navCategories", () =>
  $apiFetch("/categories/with-children"),
);

const currentHoverCategory = ref<MegaMenuCategory | null>(null);
const navCategories = computed(() => categoriesData.value?.categories ?? []);

/** Client route: same two-segment pattern as `app/pages/[entity_type]/[entity_slug].vue`. */
function entityPagePath(entityType: string, slug: string): string {
  return `/${entityType}/${slug}`;
}

function mapSubcategoryToLink(sub: NavSubcategory): MegaMenuLink {
  return {
    label: sub.name,
    to: entityPagePath("subcategory", sub.slug),
  };
}

const megaMenuCategories = computed<MegaMenuCategory[]>(() => {
  return navCategories.value.map((cat) => {
    const groups: MegaMenuGroup[] = (cat.groups ?? []).map((group) => {
      const links = (group.subcategories ?? []).map((sub) => mapSubcategoryToLink(sub));

      return {
        id: group.id,
        label: group.name,
        slug: group.slug,
        link: entityPagePath("group", group.slug),
        icon: group.icon ?? null,
        productsCount: group.products_count ?? 0,
        links,
      };
    });

    const links = groups.flatMap((g) => g.links);

    return {
      id: cat.id,
      label: cat.name,
      slug: cat.slug,
      link: entityPagePath("category", cat.slug),
      image: cat.image ?? null,
      icon: cat.icon ?? null,
      groups,
      links,
    };
  });
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
      mode="hover"
      :ui="{ content: 'w-[280px] sm:p-0 p-0 z-[100]' }"
      arrow>
      <UButton
        icon="i-lucide-menu"
        color="secondary"
        label="Tous nos produits"
        variant="solid"
        class="rounded-none py-3 font-semibold uppercase cursor-pointer h-11" />

      <template #content>
        <NuxtLink to="/pc-config-builder" class="flex items-center gap-2 text-start px-2 text-sm h-10 w-full hover:bg-neutral-50">
          <UIcon name="i-lucide-cpu" class="size-4" />
          <span>Configurateur PC</span>
        </NuxtLink>

        <div
          v-for="category in megaMenuCategories"
          :key="category.id"
          class="relative"
          @mouseenter="currentHoverCategory = category"
          @mouseleave="currentHoverCategory = null">
          <NuxtLink :to="category.link" class="flex items-center gap-2 text-start px-2 text-sm h-10 w-full hover:bg-neutral-50">
            <div v-if="category.icon" class="size-6 rounded overflow-hidden">
              <img :src="category.icon" :alt="`${category.label} icon`" class="size-full object-cover" />
            </div>
            <UIcon v-else name="i-lucide-image" class="size-4" />
            <span>{{ category.label }}</span>

            <UIcon name="i-lucide-chevron-right" class="size-4 ms-auto" />
          </NuxtLink>
          <Transition
            enter-active-class="transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            enter-from-class="opacity-0 scale-[0.96]"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-150 ease-[cubic-bezier(0.4,0,1,1)]"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-[0.98]">
            <div
              v-if="currentHoverCategory?.id === category.id"
              :key="category.id"
              class="nav-group-flyout absolute top-0 left-full z-10 w-[600px] origin-left rounded-r-md border border-neutral-200 bg-white p-3 shadow-lg shadow-neutral-900/10 ring-1 ring-black/5 translate-x-px grid grid-cols-2">
              <div
                v-for="(group, groupIndex) in category.groups"
                :key="group.id"
                class="nav-group-flyout__col space-y-1.5 break-inside-avoid mb-6 opacity-0"
                :style="{ animationDelay: `${60 + groupIndex * 55}ms` }">
                <NuxtLink :to="group.link" class="text-xs font-semibold uppercase text-neutral-400" @click="open = false">
                  {{ group.label }}
                </NuxtLink>

                <ul class="space-y-1 text-sm">
                  <li v-for="link in group.links" :key="link.label" class="group flex items-center gap-x-1">
                    <NuxtLink :to="link.to" class="hover:text-primary-700 block py-0.5" @click="open = false">
                      {{ link.label }}
                    </NuxtLink>
                  </li>
                </ul>
              </div>
            </div>
          </Transition>
        </div>
        <!-- Masonry Categories -->
        <div v-if="false" class="columns-2 md:columns-3 gap-8">
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
        <div
          v-if="false"
          class="mt-4 rounded-xl bg-neutral-100/80 border border-neutral-200 p-4 flex flex-col justify-between gap-3">
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

<style scoped>
@keyframes nav-group-flyout-col {
  from {
    opacity: 0;
    transform: translateY(0.5rem);
    filter: blur(2px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

.nav-group-flyout__col {
  animation: nav-group-flyout-col 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@media (prefers-reduced-motion: reduce) {
  .nav-group-flyout {
    transition-duration: 1ms !important;
  }

  .nav-group-flyout__col {
    animation: none !important;
    opacity: 1 !important;
  }
}
</style>
