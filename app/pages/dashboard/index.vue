<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

type OverviewResponse = {
  cards: {
    sales_today: number;
    sales_today_label: string;
    pending_orders: number;
    out_of_stock_products: number;
    new_customers_this_month: number;
  };
  recent_orders: Array<{
    id: number;
    uid: string;
    status: string;
    customer_name: string;
    total: number;
    total_label: string;
    created_at: string;
  }>;
};

const { data } = await useAPIFetch<OverviewResponse>("/dashboard/overview");

const cards = computed(() => data.value?.cards);
const recentOrders = computed(() => data.value?.recent_orders ?? []);

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
</script>

<template>
  <UDashboardPanel id="home">
    <template #body>
      <div class="space-y-6">
        <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-neutral-500">
                  Ventes du jour
                </p>
                <p class="mt-1 text-2xl font-semibold tracking-tight">{{ cards?.sales_today_label ?? "0 MAD" }}</p>
              </div>
              <UIcon
                name="i-lucide-shopping-bag"
                class="h-6 w-6 text-primary-600"
              />
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-neutral-500">
                  Commandes en attente
                </p>
                <p class="mt-1 text-2xl font-semibold tracking-tight">{{ cards?.pending_orders ?? 0 }}</p>
              </div>
              <UIcon
                name="i-lucide-clipboard-list"
                class="h-6 w-6 text-primary-600"
              />
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-neutral-500">
                  Produits en rupture
                </p>
                <p class="mt-1 text-2xl font-semibold tracking-tight">{{ cards?.out_of_stock_products ?? 0 }}</p>
              </div>
              <UIcon
                name="i-lucide-package-x"
                class="h-6 w-6 text-primary-600"
              />
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-medium text-neutral-500">
                  Nouveaux clients
                </p>
                <p class="mt-1 text-2xl font-semibold tracking-tight">{{ cards?.new_customers_this_month ?? 0 }}</p>
              </div>
              <UIcon name="i-lucide-users" class="h-6 w-6 text-primary-600" />
            </div>
          </UCard>
        </section>

        <section class="grid gap-4 lg:grid-cols-3">
          <UCard class="lg:col-span-2">
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="text-sm font-semibold text-neutral-900">
                  Activité récente
                </h2>
                <UButton
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  label="Voir tout"
                  icon="i-lucide-arrow-right"
                  to="/dashboard/orders"
                />
              </div>
            </template>

            <ul class="space-y-3 text-sm">
              <li v-if="!recentOrders.length" class="flex items-center justify-between text-neutral-500">
                <span>Aucune activité récente pour le moment.</span>
              </li>
              <li
                v-for="order in recentOrders"
                :key="order.id"
                class="flex items-center justify-between gap-3 text-neutral-700"
              >
                <div class="min-w-0">
                  <p class="truncate font-medium">
                    #{{ order.uid.substring(0, 8) }} - {{ order.customer_name }}
                  </p>
                  <p class="text-xs text-neutral-500">{{ order.created_at }} · {{ statusLabel(order.status) }}</p>
                </div>
                <span class="whitespace-nowrap font-medium">{{ order.total_label }}</span>
              </li>
            </ul>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="text-sm font-semibold text-neutral-900">
                Raccourcis rapides
              </h2>
            </template>

            <div class="space-y-2">
              <UButton
                block
                color="neutral"
                variant="soft"
                icon="i-lucide-layout-dashboard"
                label="Aperçu de la boutique"
                to="/dashboard/home"
              />
              <UButton
                block
                color="primary"
                variant="soft"
                icon="i-lucide-folder-tree"
                label="Gérer les catégories"
                to="/dashboard/categories"
              />
              <UButton
                block
                color="neutral"
                variant="soft"
                icon="i-lucide-tag"
                label="Gérer les marques"
                to="/dashboard/brands"
              />
              <UButton
                block
                color="neutral"
                variant="soft"
                icon="i-lucide-shopping-bag"
                label="Voir les produits"
                to="/dashboard/products"
              />
              <UButton
                block
                color="neutral"
                variant="soft"
                icon="i-lucide-users"
                label="Voir les clients"
                to="/dashboard/customers"
              />
            </div>
          </UCard>
        </section>
      </div>
    </template>
  </UDashboardPanel>
</template>
