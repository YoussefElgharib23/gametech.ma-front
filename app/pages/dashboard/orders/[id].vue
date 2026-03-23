<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";

definePageMeta({
  layout: "dashboard",
});

const route = useRoute();
const orderId = computed(() => route.params.id as string);

type OrderItem = {
  id: number;
  model: {
    id: number;
    name?: string;
    title?: string;
    slug: string;
    image?: string;
    images?: string[];
    price: number;
  };
  price: number;
  quantity: number;
  total: number;
  price_label?: string;
  total_label?: string;
};

type Order = {
  id: number;
  uid: string;
  status: string;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  address: string;
  city: string;
  phone: string;
  payment_method: string;
  sub_total: number;
  shipping_price: number;
  total: number;
  sub_total_label?: string;
  shipping_price_label?: string;
  total_label?: string;
  created_at: string;
  items: OrderItem[];
};

const editingItem = ref<number | null>(null);
const quantityDrafts = ref<Record<number, number>>({});
const showAddProduct = ref(false);
const removeModalOpen = ref(false);
const pendingRemoveItemId = ref<number | null>(null);
const searchProduct = ref("");
const searchResults = ref<any[]>([]);
const searchLoading = ref(false);

const statusOptions = [
  { value: "new", label: "Nouveau", color: "blue" },
  { value: "confirmed", label: "Confirme", color: "yellow" },
  { value: "delivered", label: "Livre", color: "green" },
  { value: "returned", label: "Retourne", color: "orange" },
  { value: "cancelled", label: "Annule", color: "red" },
];

const moneyFormatter = new Intl.NumberFormat("fr-MA", {
  style: "currency",
  currency: "MAD",
  maximumFractionDigits: 2,
});

const getItemTitle = (item: OrderItem) => item.model.name || item.model.title || "Produit";

const getItemImage = (item: OrderItem) => item.model.image || item.model.images?.[0] || "";

const getItemPriceLabel = (item: OrderItem) => item.price_label || moneyFormatter.format(Number(item.price || 0));

const getItemTotalLabel = (item: OrderItem) => item.total_label || moneyFormatter.format(Number(item.total || 0));

const getOrderSubtotalLabel = (value: Order) => value.sub_total_label || moneyFormatter.format(Number(value.sub_total || 0));

const getOrderShippingLabel = (value: Order) =>
  value.shipping_price_label || moneyFormatter.format(Number(value.shipping_price || 0));

const getOrderTotalLabel = (value: Order) => value.total_label || moneyFormatter.format(Number(value.total || 0));

const detailsSchema = z.object({
  address: z.string().min(1, "L'adresse est requise"),
  city: z.string().min(1, "La ville est requise"),
  phone: z.string().min(1, "Le telephone est requis"),
  shipping_price: z.coerce.number().min(0, "Le prix de livraison doit etre positif"),
});

type DetailsSchema = z.output<typeof detailsSchema>;

const detailsState = reactive<DetailsSchema>({
  address: "",
  city: "",
  phone: "",
  shipping_price: 0,
});

const { data: orderData, refresh } = await useAPIFetch<Order>(`/admin/orders/${orderId.value}`);
const order = computed(() => orderData.value ?? null);

watch(
  orderData,
  (value) => {
    if (!value) return;
    detailsState.address = value.address;
    detailsState.city = value.city;
    detailsState.phone = value.phone;
    detailsState.shipping_price = value.shipping_price;
  },
  { immediate: true },
);

const updateStatus = async (newStatus: string | undefined) => {
  if (!newStatus) return;
  try {
    await $apiFetch(`/admin/orders/${orderId.value}/status`, {
      method: "PATCH",
      body: { status: newStatus },
    });
    await refresh();
  } catch (error) {
    console.error("Failed to update status:", error);
  }
};

const updateQuantity = async (itemId: number, quantity: number) => {
  try {
    await $apiFetch(`/admin/orders/${orderId.value}/items/${itemId}`, {
      method: "PATCH",
      body: { quantity },
    });
    await refresh();
    editingItem.value = null;
  } catch (error) {
    console.error("Failed to update quantity:", error);
  }
};

const startEditingQuantity = (itemId: number, currentQuantity: number) => {
  editingItem.value = itemId;
  quantityDrafts.value[itemId] = currentQuantity;
};

const cancelEditingQuantity = (itemId: number) => {
  delete quantityDrafts.value[itemId];
  if (editingItem.value === itemId) {
    editingItem.value = null;
  }
};

const saveEditingQuantity = async (itemId: number) => {
  const quantity = Number(quantityDrafts.value[itemId]);
  if (!Number.isFinite(quantity) || quantity < 1) return;
  await updateQuantity(itemId, quantity);
  delete quantityDrafts.value[itemId];
};

const removeItem = async (itemId: number) => {
  try {
    await $apiFetch(`/admin/orders/${orderId.value}/items/${itemId}`, {
      method: "DELETE",
    });
    await refresh();
  } catch (error) {
    console.error("Failed to remove item:", error);
  }
};

const askRemoveItem = (itemId: number) => {
  pendingRemoveItemId.value = itemId;
  removeModalOpen.value = true;
};

const closeRemoveModal = () => {
  removeModalOpen.value = false;
  pendingRemoveItemId.value = null;
};

const confirmRemoveItem = async () => {
  if (!pendingRemoveItemId.value) return;
  await removeItem(pendingRemoveItemId.value);
  closeRemoveModal();
};

const searchProducts = async () => {
  if (!searchProduct.value || searchProduct.value.length < 2) {
    searchResults.value = [];
    return;
  }

  searchLoading.value = true;
  try {
    const response = await $apiFetch<{ items: any[] }>(`/search/products?q=${encodeURIComponent(searchProduct.value)}`);
    searchResults.value = response.items ?? [];
  } catch (error) {
    console.error("Failed to search products:", error);
  } finally {
    searchLoading.value = false;
  }
};

const addProduct = async (productId: number, quantity: number = 1) => {
  try {
    await $apiFetch(`/admin/orders/${orderId.value}/items`, {
      method: "POST",
      body: { product_id: productId, quantity },
    });
    await refresh();
    showAddProduct.value = false;
    searchProduct.value = "";
    searchResults.value = [];
  } catch (error) {
    console.error("Failed to add product:", error);
  }
};

const onDetailsSubmit = async (event: FormSubmitEvent<DetailsSchema>) => {
  try {
    await $apiFetch(`/admin/orders/${orderId.value}/details`, {
      method: "PATCH",
      body: event.data,
    });
    await refresh();
  } catch (error) {
    console.error("Failed to update details:", error);
  }
};

watch(searchProduct, () => {
  searchProducts();
});
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="order ? `Commande #${order.uid.substring(0, 8)}` : 'Commande'" />
    </template>

    <template #body>
      <div v-if="order" class="space-y-6">
        <div class="mb-2">
          <NuxtLink to="/dashboard/orders" class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
            Retour aux commandes
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div class="space-y-6 lg:col-span-2">
            <UCard :ui="{ body: 'sm:p-0 p-0' }">
              <template #header>
                <div class="flex items-center justify-between">
                  <h2 class="text-lg font-semibold">Articles de la commande</h2>
                  <UButton size="sm" icon="i-heroicons-plus" @click="showAddProduct = !showAddProduct">
                    Ajouter un produit
                  </UButton>
                </div>
              </template>

              <div v-if="showAddProduct" class="rounded-lg bg-gray-50 p-4">
                <UInput
                  v-model="searchProduct"
                  placeholder="Rechercher un produit..."
                  icon="i-heroicons-magnifying-glass"
                  :loading="searchLoading" />

                <div v-if="searchResults.length > 0" class="mt-4 space-y-2">
                  <div
                    v-for="product in searchResults"
                    :key="product.id"
                    class="flex cursor-pointer items-center justify-between rounded border border-muted bg-white p-3 hover:border-accented duration-300"
                    @click="addProduct(product.id)">
                    <div class="flex items-center gap-3">
                      <div class="h-12 w-12 rounded border border-muted bg-neutral-100 p-1">
                        <img :src="product.image" :alt="product.title" class="size-full object-cover mix-blend-multiply" />
                      </div>
                      <div>
                        <p class="text-sm font-medium">{{ product.title }}</p>
                        <p class="text-sm text-gray-500">{{ product.priceLabel }}</p>
                      </div>
                    </div>
                    <UButton size="xs" icon="i-heroicons-plus">Ajouter</UButton>
                  </div>
                </div>
              </div>

              <div class="sm:px-3 px-3">
                <div class="divide-y divide-neutral-200">
                  <div v-for="item in order.items" :key="item.id" class="flex items-center gap-4 py-3">
                    <div v-if="getItemImage(item)" class="border border-muted bg-neutral-100 rounded-md h-16 w-16">
                      <img
                        :src="getItemImage(item)"
                        :alt="getItemTitle(item)"
                        class="size-full object-contain mix-blend-multiply" />
                    </div>
                    <div v-else class="flex h-20 w-20 items-center justify-center rounded bg-gray-100 text-gray-400">
                      <UIcon name="i-heroicons-photo" class="h-6 w-6" />
                    </div>

                    <div class="">
                      <h3 class="font-medium">{{ getItemTitle(item) }}</h3>
                      <p class="text-sm text-gray-500">{{ getItemPriceLabel(item) }} x {{ item.quantity }}</p>
                    </div>

                    <div class="flex flex-col items-end gap-3 flex-1">
                      <div v-if="editingItem === item.id" class="flex items-center gap-2">
                        <UInput
                          type="number"
                        :model-value="quantityDrafts[item.id] ?? item.quantity"
                          min="1"
                          class="w-20"
                        @update:model-value="(val) => (quantityDrafts[item.id] = Number(val))" />
                      <UButton size="xs" color="primary" @click="saveEditingQuantity(item.id)">Enregistrer</UButton>
                      <UButton size="xs" color="neutral" @click="cancelEditingQuantity(item.id)">Annuler</UButton>
                      </div>

                      <div v-else class="flex items-center gap-2 flex-1">
                      <UButton
                        size="xs"
                        variant="ghost"
                        icon="i-heroicons-pencil"
                        @click="startEditingQuantity(item.id, item.quantity)" />
                        <UButton size="xs" variant="ghost" color="error" icon="i-heroicons-trash" @click="askRemoveItem(item.id)" />
                      </div>

                      <p class="text-right font-semibold">{{ getItemTotalLabel(item) }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-2 border-t border-muted p-3">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Sous-total</span>
                  <span class="font-medium">{{ getOrderSubtotalLabel(order) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Livraison</span>
                  <span class="font-medium">{{ getOrderShippingLabel(order) }}</span>
                </div>
                <div class="flex justify-between border-t border-neutral-200 pt-2 text-lg font-semibold">
                  <span>Total</span>
                  <span>{{ getOrderTotalLabel(order) }}</span>
                </div>
              </div>
            </UCard>
          </div>

          <div class="space-y-6">
            <UCard>
              <template #header>
                <h2 class="text-lg font-semibold">Informations client</h2>
              </template>

              <div class="space-y-2">
                <div>
                  <p class="text-sm text-gray-500">Nom complet</p>
                  <p class="font-medium">{{ order.customer.first_name }} {{ order.customer.last_name }}</p>
                </div>

                <div>
                  <p class="text-sm text-gray-500">Email</p>
                  <p class="font-medium">{{ order.customer.email }}</p>
                </div>

                <div>
                  <p class="text-sm text-gray-500">Telephone</p>
                  <p class="font-medium">{{ order.customer.phone }}</p>
                </div>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <h2 class="text-lg font-semibold">Details de livraison</h2>
              </template>

              <UForm :schema="detailsSchema" :state="detailsState" @submit="onDetailsSubmit">
                <div class="space-y-2">
                  <UFormField label="Adresse" name="address">
                    <UInput v-model="detailsState.address" />
                  </UFormField>

                  <UFormField label="Ville" name="city">
                    <UInput v-model="detailsState.city" />
                  </UFormField>

                  <UFormField label="Telephone" name="phone">
                    <UInput v-model="detailsState.phone" />
                  </UFormField>

                  <UFormField label="Prix de livraison (MAD)" name="shipping_price">
                    <UInput v-model.number="detailsState.shipping_price" type="number" step="0.01" />
                  </UFormField>

                  <UButton type="submit" block>Mettre a jour les details</UButton>
                </div>
              </UForm>
            </UCard>

            <UCard>
              <template #header>
                <h2 class="text-lg font-semibold">Details de paiement</h2>
              </template>

              <div class="space-y-3">
                <div>
                  <p class="text-sm text-gray-500">Methode de paiement</p>
                  <p class="font-medium capitalize">
                    {{ order.payment_method === "cash" ? "Paiement comptant a la livraison" : order.payment_method }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Statut</p>
                  <USelect
                    :model-value="order.status"
                    :items="statusOptions"
                    label-key="label"
                    value-key="value"
                    class="w-full"
                    @update:model-value="(val) => updateStatus(val as string | undefined)" />
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </div>

      <div v-else class="py-12 text-center text-gray-500">Commande introuvable.</div>
    </template>
  </UDashboardPanel>

  <UModal
    v-model:open="removeModalOpen"
    title="Supprimer l'article"
    description="Cette action est irreversible."
    :ui="{
      header: 'sm:p-3 p-3 border-none',
      body: 'sm:p-3 p-3',
      footer: 'sm:p-3 p-3',
      content: 'divide-y-0',
    }"
    @close="closeRemoveModal">
    <template #body>
      <p class="text-neutral-600">Voulez-vous vraiment supprimer cet article de la commande ?</p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="outline" label="Annuler" @click="closeRemoveModal" />
        <UButton color="error" label="Supprimer" @click="confirmRemoveItem" />
      </div>
    </template>
  </UModal>
</template>
