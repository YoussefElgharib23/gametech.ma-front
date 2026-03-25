<script setup lang="ts">
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
const confirmModalOpen = ref(false);
const pendingStatusOrderId = ref<number | null>(null);
const pendingStatusValue = ref<string | null>(null);
const confirmPreviewItems = ref<
  Array<{
    product_name: string;
    ordered_quantity: number;
    stock_quantity: number | null;
    remaining_stock: number | null;
    has_enough_stock: boolean;
  }>
>([]);
const confirmCanProceed = ref(true);
const deleteModalOpen = ref(false);
const pendingDeleteOrderId = ref<number | null>(null);

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

const orderColumns = [
  {
    accessorKey: "uid",
    header: "Numero",
    meta: { class: { td: "w-32" } },
  },
  {
    accessorKey: "customer_name",
    header: "Client",
    meta: { class: { td: "min-w-0" } },
  },
  {
    accessorKey: "contact",
    header: "Contact",
    meta: { class: { td: "min-w-0" } },
  },
  {
    accessorKey: "total",
    header: "Total",
    meta: { class: { td: "w-36" } },
  },
  {
    accessorKey: "status",
    header: "Statut",
    meta: { class: { td: "w-48" } },
  },
  {
    accessorKey: "created_at",
    header: "Date",
    meta: { class: { td: "w-40" } },
  },
  {
    id: "actions",
    header: "",
    meta: { class: { td: "w-20 text-right" } },
  },
];

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

const onStatusChange = async (order: Order, nextStatus: string) => {
  if (nextStatus !== "confirmed" || order.status === "confirmed") {
    await updateOrderStatus(order.id, nextStatus);
    return;
  }

  try {
    const preview = await $apiFetch<{
      can_confirm: boolean;
      items: Array<{
        product_name: string;
        ordered_quantity: number;
        stock_quantity: number | null;
        remaining_stock: number | null;
        has_enough_stock: boolean;
      }>;
    }>(`/admin/orders/${order.id}/confirm-preview`);

    pendingStatusOrderId.value = order.id;
    pendingStatusValue.value = nextStatus;
    confirmPreviewItems.value = preview.items ?? [];
    confirmCanProceed.value = preview.can_confirm;
    confirmModalOpen.value = true;
  } catch (error) {
    console.error("Failed to preview confirmation impact:", error);
  }
};

const closeConfirmModal = () => {
  confirmModalOpen.value = false;
  pendingStatusOrderId.value = null;
  pendingStatusValue.value = null;
  confirmPreviewItems.value = [];
  confirmCanProceed.value = true;
};

const confirmStatusUpdate = async () => {
  if (!pendingStatusOrderId.value || !pendingStatusValue.value || !confirmCanProceed.value) return;
  await updateOrderStatus(pendingStatusOrderId.value, pendingStatusValue.value);
  closeConfirmModal();
};

const askDeleteOrder = (orderId: number) => {
  pendingDeleteOrderId.value = orderId;
  deleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  deleteModalOpen.value = false;
  pendingDeleteOrderId.value = null;
};

const confirmDeleteOrder = async () => {
  if (!pendingDeleteOrderId.value) return;
  try {
    await $apiFetch(`/admin/orders/${pendingDeleteOrderId.value}`, {
      method: "DELETE",
    });
    await refresh();
    closeDeleteModal();
  } catch (error) {
    console.error("Failed to delete order:", error);
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

        <UTable v-else :data="orders" :columns="orderColumns">
          <template #uid-cell="{ row }">
            <span class="font-medium text-neutral-900">#{{ row.original.uid.substring(0, 8) }}</span>
          </template>

          <template #customer_name-cell="{ row }">
            <span class="text-sm text-neutral-900">
              {{ row.original.customer.first_name }} {{ row.original.customer.last_name }}
            </span>
          </template>

          <template #contact-cell="{ row }">
            <div class="text-sm text-neutral-600">
              <div>{{ row.original.customer.email }}</div>
              <div class="text-xs text-neutral-500">{{ row.original.customer.phone }}</div>
            </div>
          </template>

          <template #total-cell="{ row }">
            <span class="font-medium text-neutral-900">{{ getOrderTotalLabel(row.original) }}</span>
          </template>

          <template #status-cell="{ row }">
            <USelect
              :model-value="row.original.status"
              :items="statusOptions.filter((s) => s.value !== 'all')"
              label-key="label"
              value-key="value"
              size="xs"
              @update:model-value="(val) => onStatusChange(row.original, val as string)" />
          </template>

          <template #created_at-cell="{ row }">
            <span class="text-sm text-neutral-600">{{ row.original.created_at }}</span>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex items-center justify-end gap-1 bg-neutral-50 rounded-lg border border-neutral-200 p-1">
              <UTooltip :delay-duration="0" text="Voir les details">
                <UButton
                  icon="i-lucide-eye"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  :to="`/dashboard/orders/${row.original.id}`" />
              </UTooltip>
              <USeparator orientation="vertical" class="h-4" />
              <UTooltip :delay-duration="0" text="Supprimer la commande">
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="xs"
                  @click="askDeleteOrder(row.original.id)" />
              </UTooltip>
            </div>
          </template>
        </UTable>

        <div v-if="lastPage > 1" class="mt-6 flex justify-center border-t border-neutral-200 px-4 py-3">
          <UPagination v-model="page" :page-count="lastPage" :total="total" />
        </div>
      </UCard>
    </template>
  </UDashboardPanel>

  <UModal v-model:open="confirmModalOpen" title="Confirmer le changement de statut" @close="closeConfirmModal">
    <template #body>
      <p class="text-sm text-neutral-600 mb-3">En confirmant cette commande, le stock des produits sera déduit.</p>
      <div class="space-y-2 max-h-64 overflow-auto">
        <div v-for="(item, idx) in confirmPreviewItems" :key="idx" class="rounded border border-neutral-200 p-2 text-sm">
          <p class="font-medium">{{ item.product_name }}</p>
          <p class="text-neutral-600">
            Commandé: {{ item.ordered_quantity }} · Stock: {{ item.stock_quantity ?? "Non suivi" }} · Reste:
            {{ item.remaining_stock ?? "N/A" }}
          </p>
          <p v-if="!item.has_enough_stock" class="text-error-600 text-xs mt-1">Stock insuffisant pour ce produit.</p>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="outline" label="Annuler" @click="closeConfirmModal" />
        <UButton color="primary" label="Confirmer le statut" :disabled="!confirmCanProceed" @click="confirmStatusUpdate" />
      </div>
    </template>
  </UModal>

  <UModal v-model:open="deleteModalOpen" title="Supprimer la commande" @close="closeDeleteModal">
    <template #body>
      <p class="text-sm text-neutral-600">Cette action est irréversible. Voulez-vous vraiment supprimer cette commande ?</p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="outline" label="Annuler" @click="closeDeleteModal" />
        <UButton color="error" label="Supprimer" @click="confirmDeleteOrder" />
      </div>
    </template>
  </UModal>
</template>
