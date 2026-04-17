<script setup lang="ts">
import type { ConfiguratorProduct } from "~/composables/useConfigurator";
import type { ConfiguratorCategory } from "~/constants/configuratorCategories";

const {
  slots,
  groups,
  iconFor,
  addProduct,
  removeProduct,
  clearCategory,
  clearAll,
  totalPrice,
  totalProducts,
  filledCategories,
  allSelectedProducts,
  formatPrice,
} = useConfigurator();

const { addItem, loadCart } = useCart();
const router = useRouter();
const toast = useToast();

const pickerOpen = ref(false);
const pickerCategory = ref<ConfiguratorCategory | null>(null);

const pickerSelectedIds = computed(() => {
  if (!pickerCategory.value) return new Set<number>();
  const slot = slots.value.find((s) => s.category === pickerCategory.value);
  return new Set(slot?.products.map((p) => p.id) ?? []);
});

function openPicker(category: ConfiguratorCategory) {
  pickerCategory.value = category;
  pickerOpen.value = true;
}

function handleProductSelected(product: ConfiguratorProduct) {
  if (pickerCategory.value) {
    addProduct(pickerCategory.value, product);
  }
}

const addingToCart = ref(false);
const requestingDevis = ref(false);
const devisModalOpen = ref(false);
const devisForm = ref({
  name: "",
  email: "",
  phone: "",
  address: "",
});

async function addAllToCart() {
  const products = allSelectedProducts.value;
  if (products.length === 0) return;

  addingToCart.value = true;
  try {
    for (const product of products) {
      await addItem(product.id, 1);
    }
    await loadCart();
    toast.add({
      title: "Configuration ajoutée au panier",
      description: `${products.length} produit${products.length > 1 ? "s" : ""} ajouté${products.length > 1 ? "s" : ""} au panier`,
      color: "success",
    });
    clearAll();
    router.push("/checkout");
  } catch {
    toast.add({
      title: "Erreur",
      description: "Une erreur est survenue lors de l'ajout au panier",
      color: "error",
    });
  } finally {
    addingToCart.value = false;
  }
}

function openDevisModal() {
  if (totalProducts.value === 0) return;
  devisModalOpen.value = true;
}

function closeDevisModal() {
  devisModalOpen.value = false;
}

function validateDevisForm(): boolean {
  return (
    devisForm.value.name.trim().length > 0 &&
    devisForm.value.email.trim().length > 0 &&
    devisForm.value.phone.trim().length > 0 &&
    devisForm.value.address.trim().length > 0
  );
}

async function submitDevis() {
  const products = allSelectedProducts.value;
  if (products.length === 0) return;
  if (!validateDevisForm()) {
    toast.add({
      title: "Informations requises",
      description: "Veuillez remplir Nom, Email, Téléphone et Adresse.",
      color: "error",
    });
    return;
  }

  requestingDevis.value = true;
  try {
    const res = await $apiFetch<{ url: string }>("/devis/pc-config", {
      method: "POST",
      body: {
        customer: {
          name: devisForm.value.name.trim(),
          email: devisForm.value.email.trim(),
          phone: devisForm.value.phone.trim(),
          address: devisForm.value.address.trim(),
        },
        items: products.map((p) => ({ product_id: p.id, quantity: 1 })),
      },
    });

    if (import.meta.client) {
      window.open(res.url, "_blank", "noopener,noreferrer");
    }
    closeDevisModal();
  } catch {
    toast.add({
      title: "Erreur",
      description: "Impossible de générer le devis pour le moment.",
      color: "error",
    });
  } finally {
    requestingDevis.value = false;
  }
}

const expandedGroups = ref<Record<string, boolean>>(Object.fromEntries(groups.map((g) => [g.label, true])));

function toggleGroup(label: string) {
  expandedGroups.value[label] = !expandedGroups.value[label];
}

useHead({
  title: "PC Config Builder — GameTech",
});

useSeoMeta({
  title: "PC Config Builder — GameTech",
  description: "Construisez votre PC sur mesure composant par composant.",
});
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-linear-to-br from-brand-dark-950 via-brand-dark-800 to-brand-dark-950">
      <div class="hero-grid-bg absolute inset-0 opacity-[0.04]" />
      <div class="hero-glow" />

      <UContainer class="relative z-10 py-14 md:py-20">
        <div class="flex flex-col items-center text-center gap-5 max-w-2xl mx-auto">
          <!-- Badge -->
          <span
            class="inline-flex items-center gap-1.5 rounded-full bg-brand-accent-500/15 px-3.5 py-1.5 text-xs font-semibold text-brand-accent-400 ring-1 ring-brand-accent-500/25 backdrop-blur-sm">
            <span class="relative flex size-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent-400 opacity-75" />
              <span class="relative inline-flex size-2 rounded-full bg-brand-accent-500" />
            </span>
            Configurateur PC
          </span>

          <!-- Floating icons -->
          <div class="absolute top-8 left-[10%] hidden lg:block hero-float-slow opacity-20">
            <UIcon name="i-lucide-cpu" class="text-brand-accent-500 text-3xl" />
          </div>
          <div class="absolute top-16 right-[12%] hidden lg:block hero-float-medium opacity-15">
            <UIcon name="i-lucide-monitor" class="text-brand-accent-400 text-2xl" />
          </div>
          <div class="absolute bottom-10 left-[18%] hidden lg:block hero-float-medium opacity-15">
            <UIcon name="i-lucide-hard-drive" class="text-brand-accent-400 text-2xl" />
          </div>
          <div class="absolute bottom-12 right-[15%] hidden lg:block hero-float-slow opacity-20">
            <UIcon name="i-lucide-memory-stick" class="text-brand-accent-500 text-xl" />
          </div>

          <!-- Title -->
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Construisez votre
            <span class="text-brand-accent-500">PC sur mesure</span>
          </h1>

          <p class="text-base md:text-lg text-brand-dark-300 max-w-lg">
            Sélectionnez vos composants et périphériques catégorie par catégorie, suivez le total en temps réel et ajoutez tout au
            panier en un clic.
          </p>

          <!-- Stats pills -->
          <div class="flex flex-wrap items-center justify-center gap-3 mt-2">
            <div class="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 backdrop-blur-sm">
              <UIcon name="i-lucide-layers" class="text-brand-accent-500" />
              <span class="text-sm text-brand-dark-200">
                <strong class="text-white">18</strong>
                catégories
              </span>
            </div>
            <div class="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 backdrop-blur-sm">
              <UIcon name="i-lucide-shield-check" class="text-brand-accent-500" />
              <span class="text-sm text-brand-dark-200">
                Compatibilité
                <strong class="text-white">garantie</strong>
              </span>
            </div>
            <div class="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 backdrop-blur-sm">
              <UIcon name="i-lucide-zap" class="text-brand-accent-500" />
              <span class="text-sm text-brand-dark-200">
                Ajout au panier
                <strong class="text-white">instantané</strong>
              </span>
            </div>
          </div>

          <!-- Scroll CTA -->
          <div class="mt-4 animate-bounce">
            <UIcon name="i-lucide-chevrons-down" class="text-brand-dark-400 text-2xl" />
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Builder body -->
    <UContainer class="py-8 md:py-12">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left: category slots -->
        <div class="lg:col-span-2 flex flex-col gap-6">
          <div v-for="group in groups" :key="group.label">
            <button type="button" class="flex items-center gap-2 w-full text-left mb-3 group" @click="toggleGroup(group.label)">
              <UIcon
                name="i-lucide-chevron-down"
                class="text-primary-400 transition-transform"
                :class="{ '-rotate-90': !expandedGroups[group.label] }" />
              <h2 class="text-sm font-bold uppercase tracking-wider text-primary-500">
                {{ group.label }}
              </h2>
              <span class="text-xs text-primary-400">
                ({{ group.categories.filter((c) => slots.find((s) => s.category === c)!.products.length > 0).length }}/{{
                  group.categories.length
                }})
              </span>
            </button>

            <Transition name="collapse">
              <div v-show="expandedGroups[group.label]" class="flex flex-col gap-2">
                <div
                  v-for="cat in group.categories"
                  :key="cat"
                  class="rounded-xl border border-primary-200 bg-white overflow-hidden transition-all hover:border-primary-300">
                  <!-- Category header row -->
                  <div class="flex items-center gap-3 px-4 py-3">
                    <div
                      class="size-9 rounded-lg bg-neutral-100 border border-accented flex items-center justify-center shrink-0">
                      <UIcon :name="iconFor(cat)" class="text-lg text-primary-600" />
                    </div>

                    <span class="text-sm font-semibold text-primary-800 flex-1 min-w-0">
                      {{ cat }}
                    </span>

                    <span
                      v-if="slots.find((s) => s.category === cat)!.products.length > 0"
                      class="text-xs font-medium text-primary-600 bg-primary-50 rounded-full px-2 py-0.5">
                      {{ slots.find((s) => s.category === cat)!.products.length }}
                    </span>

                    <UButton
                      size="xs"
                      variant="soft"
                      color="primary"
                      icon="i-lucide-plus"
                      label="Choisir"
                      @click="openPicker(cat)" />
                  </div>

                  <!-- Selected products for this category -->
                  <div
                    v-if="slots.find((s) => s.category === cat)!.products.length > 0"
                    class="border-t border-primary-100 bg-primary-50/50">
                    <div
                      v-for="product in slots.find((s) => s.category === cat)!.products"
                      :key="product.id"
                      class="flex items-center gap-3 px-4 py-2.5 border-b border-primary-100 last:border-b-0">
                      <div
                        class="size-10 p-1 shrink-0 rounded-md bg-neutral-100 border border-primary-100 flex items-center justify-center overflow-hidden">
                        <NuxtImg
                          v-if="product.image"
                          :src="product.image"
                          :alt="product.title"
                          class="size-full object-contain mix-blend-multiply"
                          loading="lazy" />
                        <UIcon v-else name="i-lucide-image" class="text-primary-300" />
                      </div>

                      <div class="flex-1 min-w-0">
                        <NuxtLink
                          :to="`/products/${product.slug}`"
                          class="text-sm font-medium text-primary-800 hover:text-primary-600 truncate block transition-colors">
                          {{ product.title }}
                        </NuxtLink>
                        <p v-if="product.brand_name" class="text-xs text-primary-400">{{ product.brand_name }}</p>
                      </div>

                      <span class="text-sm font-bold text-primary-700 whitespace-nowrap shrink-0">
                        {{ product.currentPrice }}
                      </span>

                      <UButton
                        size="xs"
                        variant="ghost"
                        color="error"
                        icon="i-lucide-x"
                        @click="removeProduct(cat, product.id)" />
                    </div>

                    <div v-if="slots.find((s) => s.category === cat)!.products.length > 1" class="px-4 py-1.5 flex justify-end">
                      <UButton
                        size="xs"
                        variant="link"
                        color="error"
                        label="Tout retirer"
                        icon="i-lucide-trash-2"
                        @click="clearCategory(cat)" />
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Right: build summary (sticky) -->
        <div class="lg:col-span-1">
          <div class="sticky top-12 mt-8">
            <div class="rounded-xl border border-primary-200 bg-white overflow-hidden shadow-sm">
              <div class="px-5 py-4 bg-primary-900 text-white">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-cpu" class="text-xl" />
                  <h3 class="font-bold text-lg">Votre configuration</h3>
                </div>
                <p class="text-primary-200 text-xs mt-1">
                  {{ filledCategories }} catégorie{{ filledCategories !== 1 ? "s" : "" }} · {{ totalProducts }} produit{{
                    totalProducts !== 1 ? "s" : ""
                  }}
                </p>
              </div>

              <div class="p-5">
                <!-- Empty state -->
                <div v-if="totalProducts === 0" class="text-center py-8 text-primary-400">
                  <UIcon name="i-lucide-package-open" class="text-4xl mb-2" />
                  <p class="text-sm">Votre configuration est vide</p>
                  <p class="text-xs mt-1">Cliquez sur "Choisir" pour ajouter des composants</p>
                </div>

                <!-- Summary list -->
                <div v-else class="flex flex-col gap-3">
                  <template v-for="slot in slots" :key="slot.category">
                    <div v-if="slot.products.length > 0">
                      <div class="flex items-center gap-2 mb-1">
                        <UIcon :name="iconFor(slot.category)" class="text-primary-400 text-xs" />
                        <span class="text-xs font-medium text-primary-500 uppercase tracking-wide">{{ slot.category }}</span>
                      </div>
                      <div v-for="p in slot.products" :key="p.id" class="flex items-center justify-between pl-5 py-0.5">
                        <span class="text-sm text-primary-700 truncate flex-1 mr-2">{{ p.title }}</span>
                        <span class="text-sm font-semibold text-primary-900 whitespace-nowrap">{{ p.currentPrice }}</span>
                      </div>
                    </div>
                  </template>

                  <USeparator class="my-2" />

                  <div class="flex items-center justify-between">
                    <span class="text-base font-bold text-primary-900">Total</span>
                    <span class="text-xl font-bold text-primary-700">{{ formatPrice(totalPrice) }}</span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="mt-6 flex flex-col gap-2">
                  <UButton
                    block
                    size="lg"
                    color="secondary"
                    :disabled="totalProducts === 0 || addingToCart"
                    :loading="addingToCart"
                    icon="i-lucide-shopping-cart"
                    label="Ajouter tout au panier"
                    @click="addAllToCart" />

                  <UButton
                    block
                    size="lg"
                    variant="soft"
                    color="primary"
                    :disabled="totalProducts === 0 || requestingDevis"
                    :loading="requestingDevis"
                    icon="i-lucide-file-text"
                    label="Demander le devis"
                    @click="openDevisModal" />

                  <UButton
                    v-if="totalProducts > 0"
                    block
                    size="lg"
                    variant="soft"
                    color="error"
                    icon="i-lucide-trash-2"
                    label="Réinitialiser"
                    @click="clearAll" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Product picker modal -->
      <ConfiguratorProductPickerModal
        v-model:open="pickerOpen"
        :category="pickerCategory"
        :selected-ids="pickerSelectedIds"
        @select="handleProductSelected"
        @close="pickerOpen = false" />

      <UModal
        v-model:open="devisModalOpen"
        title="Demander un devis"
        :ui="{
          header: 'sm:p-3 p-3',
          body: 'sm:p-3 p-3',
          footer: 'sm:p-3 p-3',
          content: 'divide-y-0',
        }"
        @close="closeDevisModal">
        <template #body>
          <form class="space-y-3" @submit.prevent="submitDevis">
            <UFormField label="Nom" required class="w-full">
              <UInput v-model="devisForm.name" size="md" placeholder="Votre nom" class="w-full" />
            </UFormField>
            <UFormField label="Email" required class="w-full">
              <UInput v-model="devisForm.email" type="email" size="md" placeholder="vous@exemple.com" class="w-full" />
            </UFormField>
            <UFormField label="Téléphone" required class="w-full">
              <UInput v-model="devisForm.phone" size="md" placeholder="+212 ..." class="w-full" />
            </UFormField>
            <UFormField label="Adresse" required class="w-full">
              <UTextarea v-model="devisForm.address" :rows="4" size="md" placeholder="Votre adresse complète" class="w-full" />
            </UFormField>
          </form>
        </template>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="outline" label="Annuler" :disabled="requestingDevis" @click="closeDevisModal" />
            <UButton
              color="primary"
              label="Générer le devis"
              icon="i-lucide-file-text"
              :loading="requestingDevis"
              :disabled="!validateDevisForm() || requestingDevis"
              @click="submitDevis" />
          </div>
        </template>
      </UModal>
    </UContainer>
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 2000px;
}

.hero-grid-bg {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px);
  background-size: 48px 48px;
}

.hero-glow {
  @apply absolute rounded-full blur-3xl opacity-20 pointer-events-none;
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, var(--color-brand-accent-500) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@keyframes float-slow {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

@keyframes float-medium {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.hero-float-slow {
  animation: float-slow 5s ease-in-out infinite;
}

.hero-float-medium {
  animation: float-medium 3.5s ease-in-out infinite;
}
</style>
