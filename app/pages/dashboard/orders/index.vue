<script setup lang="ts">
import { EyeIcon } from "lucide-vue-next";

definePageMeta({
  layout: "dashboard",
});

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
  total: number;
  total_label?: string;
  created_at: string;
  items: any[];
};

type PaginatedResponse = {
  data: Order[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

const searchQuery = ref("");
const statusFilter = ref("all");
const page = ref(1);
const perPage = 20;

const statusOptions = [
  { value: "all", label: "Tous", color: "gray" },
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

const getStatusLabel = (status: string) => {
  const option = statusOptions.find((s) => s.value === status);
  return option?.label || status;
};

const getOrderTotalLabel = (order: Order) => {
  if (order.total_label) return order.total_label;
  return moneyFormatter.format(Number(order.total || 0));
};

const query = computed(() => ({
  status: statusFilter.value !== "all" ? statusFilter.value : undefined,
  search: searchQuery.value.trim() || undefined,
  page: page.value,
  per_page: perPage,
}));

const { data: ordersData, refresh } = await useAPIFetch<PaginatedResponse>("/admin/orders", {
  query,
});

const orders = computed(() => ordersData.value?.data ?? []);
const total = computed(() => ordersData.value?.total ?? 0);
const lastPage = computed(() => ordersData.value?.last_page ?? 1);

const updateOrderStatus = async (orderId: number, newStatus: string) => {
  try {
    await $apiFetch(`/admin/orders/${orderId}/status`, {
      method: "PATCH",
      body: { status: newStatus },
    });

    await refresh();
  } catch (error) {
    console.error("Failed to update order status:", error);
  }
};

watch([searchQuery, statusFilter], () => {
  page.value = 1;
});
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Commandes" />
    </template>

    <template #body>
      <UCard :ui="{ body: 'sm:p-0 p-0' }">
        <div class="mt-0 flex flex-col gap-3 border-b border-neutral-200 px-4 py-3 sm:flex-row">
          <UInput
            v-model="searchQuery"
            placeholder="Rechercher par numero, nom, email ou telephone..."
            class="flex-1"
            icon="i-heroicons-magnifying-glass" />

          <USelect v-model="statusFilter" :items="statusOptions" label-key="label" value-key="value" class="w-full sm:w-48" />
        </div>

        <div v-if="orders.length === 0" class="py-12 text-center">
          <p class="text-gray-500">Aucune commande trouvee</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Numero</th>
                <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Client</th>
                <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Contact</th>
                <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total</th>
                <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Statut</th>
                <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                <th class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
                <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  #{{ order.uid.substring(0, 8) }}
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                  {{ order.customer.first_name }} {{ order.customer.last_name }}
                </td>
                <td class="px-3 py-4 text-sm text-gray-500">
                  <div>{{ order.customer.email }}</div>
                  <div class="text-gray-400">{{ order.customer.phone }}</div>
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                  {{ getOrderTotalLabel(order) }}
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm">
                  <USelect
                    :model-value="order.status"
                    :items="statusOptions.filter((s) => s.value !== 'all')"
                    label-key="label"
                    value-key="value"
                    size="xs"
                    @update:model-value="(val) => updateOrderStatus(order.id, val as string)" />
                </td>
                <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {{ order.created_at }}
                </td>
                <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div class="flex border border-neutral-200 rounded-xl overflow-hidden ring-1 ring-neutral-100/50 max-w-fit">
                    <div class="bg-neutral-50/80 p-1.5 space-x-1">
                      <UTooltip :delay-duration="0" text="Voir les details">
                        <UButton
                          icon="i-lucide-eye"
                          color="neutral"
                          variant="ghost"
                          size="xs"
                          :to="`/dashboard/orders/${order.id}`" />
                      </UTooltip>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="lastPage > 1" class="mt-6 flex justify-center border-t border-neutral-200 px-4 py-3">
          <UPagination v-model="page" :page-count="lastPage" :total="total" />
        </div>
      </UCard>
    </template>
  </UDashboardPanel>
</template>
