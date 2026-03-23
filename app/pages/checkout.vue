<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const {
  items,
  itemsCount,
  pending,
  subtotalLabel,
  shippingLabel,
  grandTotalLabel,
  loadCart,
  incrementItem,
  decrementItem,
  removeItem,
} = useCart();

const schema = z.object({
  first_name: z.string().min(1, "Le prenom est obligatoire"),
  last_name: z.string().min(1, "Le nom est obligatoire"),
  email: z.string().min(1, "L'email est obligatoire").email("L'email est invalide"),
  address: z.string().min(1, "L'adresse est obligatoire"),
  city: z.string().min(1, "La ville est obligatoire"),
  phone: z.string().min(1, "Le telephone est obligatoire"),
  payment_method: z.literal("cash"),
});

type CheckoutSchema = z.output<typeof schema>;

const state = reactive<Partial<CheckoutSchema>>({
  first_name: "",
  last_name: "",
  email: "",
  address: "",
  city: "",
  phone: "",
  payment_method: "cash",
});

onMounted(async () => {
  if (!items.value.length) {
    await loadCart();
  }
});

const canSubmit = computed(() =>
  Boolean(state.first_name && state.last_name && state.email && state.address && state.city && state.phone && items.value.length),
);

const placeOrder = async (event: FormSubmitEvent<CheckoutSchema>) => {
  try {
    await $apiFetch<{ order: { id: number; uid: string }; message: string }>("/checkout", {
      method: "POST",
      body: event.data,
    });

    await loadCart();
    await navigateTo("/");
  } catch {
    // Toast/error handling is already managed by $apiFetch.
  }
};
</script>

<template>
  <div class="max-w-6xl mx-auto py-6 sm:py-12 sm:px-2 px-4">
    <div v-if="pending" class="py-10 text-center text-sm text-neutral-500">Chargement de votre panier...</div>

    <div v-else-if="!items.length" class="py-12 text-center">
      <UIcon name="i-lucide-shopping-cart" class="mx-auto mb-3 size-8 text-neutral-300" />
      <p class="text-sm font-medium text-neutral-700">Votre panier est vide.</p>
      <UButton to="/" label="Continuer mes achats" color="primary" class="mt-4" />
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-5 gap-6 pt-4 sm:pt-0">
      <UForm
        class="flex flex-col gap-5 sm:col-span-3"
        :state="state"
        :schema="schema"
        :validate-on="['blur']"
        @submit="placeOrder">
        <div class="flex flex-col gap-2">
          <h2 class="text-lg sm:text-2xl font-bold">Informations personnelles</h2>

          <UFormField
            name="first_name"
            label="Prenom"
            required
            help="Seules les lettres et le point (.), suivi d'un espace, sont autorises.">
            <UInput size="lg" v-model="state.first_name" />
          </UFormField>

          <UFormField
            name="last_name"
            label="Nom"
            required
            help="Seules les lettres et le point (.), suivi d'un espace, sont autorises.">
            <UInput size="lg" v-model="state.last_name" />
          </UFormField>

          <UFormField name="email" label="E-mail" required help="Saisissez une adresse e-mail valide.">
            <UInput size="lg" v-model="state.email" type="email" />
          </UFormField>
        </div>

        <div class="flex flex-col gap-2">
          <h2 class="mb-1 text-lg sm:text-2xl font-bold">Adresses</h2>

          <UFormField name="address" label="Adresse" required>
            <UInput size="lg" v-model="state.address" />
          </UFormField>

          <UFormField name="city" label="Ville" required>
            <UInput size="lg" v-model="state.city" />
          </UFormField>

          <UFormField name="phone" label="Telephone" required>
            <UInput size="lg" v-model="state.phone" type="tel" />
          </UFormField>
        </div>

        <div>
          <UButton
            type="submit"
            label="Valider ma commande"
            color="primary"
            class="h-10 w-full flex justify-center items-center"
            :disabled="!canSubmit" />
        </div>
      </UForm>

      <aside class="sm:col-span-2">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg sm:text-2xl font-bold">Total du panier</h2>
          <UBadge color="primary" variant="soft">{{ itemsCount }}</UBadge>
        </div>

        <div class="space-y-3">
          <div v-for="item in items" :key="item.id" class="rounded-lg border border-neutral-200 bg-white p-2.5">
            <div class="flex items-start gap-3">
              <div class="rounded border border-muted p-1 shrink-0 size-14 bg-neutral-100">
                <NuxtImg
                  v-if="item.product.image"
                  :src="item.product.image"
                  :alt="item.product.title"
                  class="object-contain size-full mix-blend-multiply" />
                <div v-else class="bg-neutral-100 size-full" />
              </div>

              <div class="min-w-0 flex-1 text-neutral-600">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="text-primary-500 text-xs font-semibold">{{ item.product.price_label }}</p>
                    <p class="line-clamp-2 text-sm text-neutral-800">{{ item.product.title }}</p>
                  </div>
                  <p class="shrink-0 text-sm font-semibold text-neutral-900">{{ item.line_total_label }}</p>
                </div>

                <div class="mt-2 flex items-center justify-between">
                  <div class="flex items-center gap-1 rounded-md border border-neutral-200 p-0.5">
                    <UButton
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      icon="i-lucide-minus"
                      @click="() => void decrementItem(item.id)" />
                    <span class="min-w-7 text-center text-sm font-medium">{{ item.quantity }}</span>
                    <UButton
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      icon="i-lucide-plus"
                      @click="() => void incrementItem(item.id)" />
                  </div>

                  <UButton
                    type="button"
                    size="xs"
                    color="error"
                    variant="soft"
                    icon="i-heroicons-trash"
                    @click="() => void removeItem(item.id)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <USeparator class="my-3" />

        <div class="flex items-center justify-between">
          <span class="font-semibold">Total (HT):</span>
          <span>{{ subtotalLabel }}</span>
        </div>
        <div class="mt-2 flex items-center justify-between">
          <span class="font-semibold">Livraison</span>
          <span>{{ shippingLabel }}</span>
        </div>
        <div class="mt-2 flex items-center justify-between pb-4">
          <span class="font-semibold">Total TTC:</span>
          <span>{{ grandTotalLabel }}</span>
        </div>
      </aside>
    </div>
  </div>
</template>
