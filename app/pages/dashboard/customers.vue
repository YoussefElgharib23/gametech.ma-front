<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

type CustomerRow = {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  orders_count: number;
  total_spent: number;
  total_spent_label: string;
  created_at: string | null;
};

type CustomersPaginated = {
  data: CustomerRow[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

type CustomerOrderHistoryItem = {
  id: number;
  uid: string;
  status: string;
  total: number;
  total_label: string;
  created_at: string | null;
};

const search = ref("");
const page = ref(1);
const perPage = 15;
const ordersModalOpen = ref(false);
const selectedCustomer = ref<{ id: number; name: string; email: string } | null>(null);
const customerOrders = ref<CustomerOrderHistoryItem[]>([]);
const loadingOrders = ref(false);

const query = computed(() => ({
  search: search.value.trim() || undefined,
  page: page.value,
  per_page: perPage,
}));

const { data: customersData } = await useAPIFetch<CustomersPaginated>("/dashboard/customers", {
  query,
});

const rows = computed(() => customersData.value?.data ?? []);
const total = computed(() => customersData.value?.total ?? 0);
const lastPage = computed(() => customersData.value?.last_page ?? 1);

watch(search, () => {
  page.value = 1;
});

const totalSpentLabel = computed(() => {
  const amount = rows.value.reduce((sum, row) => sum + Number(row.total_spent || 0), 0);
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 2,
  }).format(amount);
});

const totalOrders = computed(() => rows.value.reduce((sum, row) => sum + row.orders_count, 0));

const customerColumns = [
  {
    accessorKey: "name",
    header: "Client",
    meta: { class: { td: "min-w-0" } },
  },
  {
    accessorKey: "contact",
    header: "Contact",
    meta: { class: { td: "min-w-0" } },
  },
  {
    accessorKey: "orders_count",
    header: "Commandes",
    meta: { class: { td: "w-32" } },
  },
  {
    accessorKey: "total_spent_label",
    header: "Total dépensé",
    meta: { class: { td: "w-44" } },
  },
  {
    accessorKey: "created_at",
    header: "Inscription",
    meta: { class: { td: "w-40" } },
  },
  {
    id: "actions",
    header: "",
    meta: { class: { td: "w-32 text-right" } },
  },
];

const statusLabel = (status: string) => {
  switch (status) {
    case "new":
      return "Nouveau";
    case "confirmed":
      return "Confirmé";
    case "delivered":
      return "Livré";
    case "returned":
      return "Retourné";
    case "cancelled":
      return "Annulé";
    default:
      return status;
  }
};

const openOrdersHistory = async (row: CustomerRow) => {
  selectedCustomer.value = {
    id: row.id,
    name: row.name,
    email: row.email,
  };
  customerOrders.value = [];
  ordersModalOpen.value = true;
  loadingOrders.value = true;

  try {
    const response = await $apiFetch<{
      customer: { id: number; name: string; email: string };
      orders: CustomerOrderHistoryItem[];
    }>(`/dashboard/customers/${row.id}/orders`);
    customerOrders.value = response.orders ?? [];
  } catch (error) {
    console.error("Failed to load customer order history:", error);
  } finally {
    loadingOrders.value = false;
  }
};

const closeOrdersHistory = () => {
  ordersModalOpen.value = false;
  selectedCustomer.value = null;
  customerOrders.value = [];
};
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Clients" />
    </template>

    <template #body>
      <div class="space-y-4">
        <div class="grid gap-4 md:grid-cols-3">
          <UCard>
            <p class="text-xs font-medium text-neutral-500">Clients affichés</p>
            <p class="mt-1 text-2xl font-semibold tracking-tight">{{ rows.length }}</p>
          </UCard>
          <UCard>
            <p class="text-xs font-medium text-neutral-500">Commandes (page)</p>
            <p class="mt-1 text-2xl font-semibold tracking-tight">{{ totalOrders }}</p>
          </UCard>
          <UCard>
            <p class="text-xs font-medium text-neutral-500">Montant dépensé (page)</p>
            <p class="mt-1 text-2xl font-semibold tracking-tight">{{ totalSpentLabel }}</p>
          </UCard>
        </div>

        <UCard :ui="{ body: 'sm:p-0 p-0' }">
          <div class="flex items-center gap-3 border-b border-neutral-200 px-4 py-3">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              placeholder="Rechercher par nom, email ou téléphone..."
              size="md"
              class="w-full" />
            <span class="text-xs text-neutral-500 whitespace-nowrap">{{ total }} client{{ total !== 1 ? "s" : "" }}</span>
          </div>

          <div v-if="!rows.length" class="py-12 text-center text-neutral-500">Aucun client trouvé.</div>

          <UTable v-else :data="rows" :columns="customerColumns">
            <template #name-cell="{ row }">
              <p class="font-medium text-neutral-900">{{ row.original.name }}</p>
            </template>

            <template #contact-cell="{ row }">
              <div class="text-sm text-neutral-600">
                <p>{{ row.original.email }}</p>
                <p class="text-xs text-neutral-500">{{ row.original.phone || "—" }}</p>
              </div>
            </template>

            <template #orders_count-cell="{ row }">
              <UBadge color="info" variant="soft">{{ row.original.orders_count }} Commandes</UBadge>
            </template>

            <template #total_spent_label-cell="{ row }">
              <p class="font-medium text-neutral-900">{{ row.original.total_spent_label }}</p>
            </template>

            <template #created_at-cell="{ row }">
              <p class="text-sm text-neutral-600">{{ row.original.created_at || "—" }}</p>
            </template>

            <template #actions-cell="{ row }">
              <div class="flex justify-end">
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-history"
                  @click="openOrdersHistory(row.original)"
                >
                  Historique
                </UButton>
              </div>
            </template>
          </UTable>

          <div v-if="lastPage > 1" class="flex justify-end border-t border-neutral-200 px-4 py-3">
            <UPagination v-model:page="page" :total="total" :items-per-page="perPage" :show-edges="true" size="sm" />
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>

  <UModal
    v-model:open="ordersModalOpen"
    :title="selectedCustomer ? `Historique des commandes - ${selectedCustomer.name}` : 'Historique des commandes'"
    @close="closeOrdersHistory"
  >
    <template #body>
      <div v-if="loadingOrders" class="flex justify-center py-6">
        <UIcon name="i-lucide-loader-circle" class="h-6 w-6 animate-spin text-primary-500" />
      </div>

      <div v-else-if="!customerOrders.length" class="py-6 text-center text-neutral-500">
        Aucune commande trouvée pour ce client.
      </div>

      <div v-else class="space-y-2 max-h-80 overflow-auto">
        <div
          v-for="order in customerOrders"
          :key="order.id"
          class="rounded border border-neutral-200 p-3"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="font-medium text-neutral-900">#{{ order.uid.substring(0, 8) }}</p>
              <p class="text-xs text-neutral-500">{{ order.created_at || "—" }} · {{ statusLabel(order.status) }}</p>
            </div>
            <div class="flex items-center gap-2">
              <p class="font-medium text-neutral-900">{{ order.total_label }}</p>
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                icon="i-lucide-arrow-right"
                :to="`/dashboard/orders/${order.id}`"
                @click="closeOrdersHistory"
              >
                Voir
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end">
        <UButton color="neutral" variant="outline" label="Fermer" @click="closeOrdersHistory" />
      </div>
    </template>
  </UModal>
</template>
