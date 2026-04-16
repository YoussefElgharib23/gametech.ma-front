<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

interface Category {
  id: number;
  name: string;
}

interface CategoryGroup {
  id: number;
  category_id: number;
  category_name?: string | null;
  name: string;
  slug: string;
  icon: string | null;
  status: "active" | "inactive";
  position: number;
}

const route = useRoute();

const categoryIdParam = computed(() => {
  const raw = route.query.category_id;
  if (raw == null || raw === "") {
    return null;
  }
  const n = Number(raw);

  return Number.isFinite(n) && n > 0 ? n : null;
});

const { data: categoriesData } = await useAPIFetch<Category[]>("/categories");
const { data: allGroupsData, refresh } = await useAPIFetch<CategoryGroup[]>("/category-groups");

const groupsForCategory = computed(() => {
  const id = categoryIdParam.value;
  if (id == null) {
    return [];
  }

  return (allGroupsData.value ?? []).filter((g) => g.category_id === id);
});

const currentCategoryName = computed(() => {
  const id = categoryIdParam.value;
  if (id == null) {
    return null;
  }

  return categoriesData.value?.find((c) => c.id === id)?.name ?? null;
});

const search = ref("");
const filteredGroups = computed(() => {
  const list = groupsForCategory.value;
  const term = search.value.trim().toLowerCase();
  if (!term) {
    return list;
  }

  return list.filter((g) => g.name.toLowerCase().includes(term));
});

const groupColumns = [
  {
    accessorKey: "name",
    header: "Groupe",
    meta: { class: { td: "min-w-0" } },
  },
  {
    accessorKey: "status",
    header: "Statut",
    meta: { class: { td: "w-28" } },
  },
  {
    id: "actions",
    header: "",
    meta: { class: { td: "w-44 text-right" } },
  },
];

const toast = useToast();
const modalOpen = ref(false);
const deleteModalOpen = ref(false);
const editingId = ref<number | null>(null);
const deletingGroup = ref<CategoryGroup | null>(null);
const saving = ref(false);
const form = ref({
  name: "",
  status: true as boolean,
});

const isEditing = computed(() => editingId.value != null);
const modalTitle = computed(() => (isEditing.value ? "Modifier le groupe" : "Nouveau groupe"));
const navbarTitle = computed(() =>
  currentCategoryName.value ? `Groupes — ${currentCategoryName.value}` : "Groupes",
);

function openCreate() {
  if (categoryIdParam.value == null) {
    toast.add({ title: "Catégorie introuvable", description: "Ouvrez cette page depuis une catégorie.", color: "error" });

    return;
  }
  editingId.value = null;
  form.value = { name: "", status: true };
  modalOpen.value = true;
}

function openEdit(group: CategoryGroup) {
  editingId.value = group.id;
  form.value = {
    name: group.name,
    status: group.status === "active",
  };
  modalOpen.value = true;
}

function openDelete(group: CategoryGroup) {
  deletingGroup.value = group;
  deleteModalOpen.value = true;
}

function closeModal() {
  modalOpen.value = false;
  editingId.value = null;
}

function closeDeleteModal() {
  deleteModalOpen.value = false;
  deletingGroup.value = null;
}

async function submitForm() {
  if (!form.value.name.trim()) {
    toast.add({ title: "Nom requis", color: "error" });

    return;
  }
  if (categoryIdParam.value == null) {
    toast.add({ title: "Catégorie requise", color: "error" });

    return;
  }
  saving.value = true;
  try {
    if (isEditing.value && editingId.value != null) {
      await $apiFetch(`/category-groups/${editingId.value}`, {
        method: "PUT",
        body: {
          name: form.value.name.trim(),
          status: form.value.status ? "active" : "inactive",
        },
      });
      toast.add({ title: "Groupe mis à jour", color: "success" });
    } else {
      await $apiFetch("/category-groups", {
        method: "POST",
        body: {
          category_id: categoryIdParam.value,
          name: form.value.name.trim(),
          status: form.value.status ? "active" : "inactive",
        },
      });
      toast.add({ title: "Groupe créé", color: "success" });
    }
    await refresh();
    closeModal();
  } catch {
    toast.add({ title: "Erreur lors de l'enregistrement", color: "error" });
  } finally {
    saving.value = false;
  }
}

async function confirmDelete() {
  if (!deletingGroup.value) {
    return;
  }
  const id = deletingGroup.value.id;
  saving.value = true;
  try {
    await $apiFetch(`/category-groups/${id}`, { method: "DELETE" });
    toast.add({ title: "Groupe supprimé", color: "success" });
    await refresh();
    closeDeleteModal();
  } catch {
    toast.add({ title: "Erreur lors de la suppression", color: "error" });
  } finally {
    saving.value = false;
  }
}

function subcategoriesUrl(group: CategoryGroup): string {
  const cid = group.category_id;
  const gid = group.id;

  return `/dashboard/subcategories?category_group_id=${gid}&category_id=${cid}`;
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="navbarTitle">
        <template #left>
          <UButton
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            to="/dashboard/categories"
            aria-label="Retour aux catégories" />
        </template>
        <template #right>
          <UButton
            icon="i-lucide-plus"
            label="Ajouter un groupe"
            color="primary"
            :disabled="categoryIdParam == null"
            @click="openCreate" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="categoryIdParam == null" class="py-16 text-center text-neutral-600 px-4">
        <p class="text-sm font-medium text-neutral-800">Aucune catégorie sélectionnée</p>
        <p class="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
          Ouvrez les groupes depuis la liste des catégories (bouton « Groupes » sur une ligne).
        </p>
        <UButton class="mt-4" color="primary" variant="soft" label="Aller aux catégories" to="/dashboard/categories" />
      </div>

      <UCard v-else :ui="{ body: 'sm:p-0 p-0' }">
        <template #header>
          <div class="p-2">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              placeholder="Rechercher un groupe…"
              size="md"
              class="max-w-sm w-full" />
          </div>
        </template>

        <div v-if="!filteredGroups.length" class="py-12 text-center text-neutral-500">
          Aucun groupe pour cette catégorie. Cliquez sur « Ajouter un groupe » pour commencer.
        </div>

        <UTable v-else :data="filteredGroups" :columns="groupColumns">
          <template #name-cell="{ row }">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 shrink-0 overflow-hidden rounded border border-neutral-200 bg-neutral-100">
                <img
                  v-if="row.original.icon"
                  :src="row.original.icon"
                  :alt="row.original.name"
                  class="h-full w-full object-cover" />
                <div v-else class="flex h-full w-full items-center justify-center text-neutral-400">
                  <UIcon name="i-lucide-layers" class="size-5" />
                </div>
              </div>
              <span class="min-w-0 truncate font-medium text-neutral-900">
                {{ row.original.name }}
              </span>
            </div>
          </template>
          <template #status-cell="{ row }">
            <UBadge :color="row.original.status === 'active' ? 'success' : 'neutral'" variant="subtle" size="xs">
              {{ row.original.status === "active" ? "Actif" : "Inactif" }}
            </UBadge>
          </template>
          <template #actions-cell="{ row }">
            <div class="inline-flex items-center justify-end gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1">
              <UTooltip :delay-duration="0" text="Sous-catégories">
                <UButton
                  icon="i-lucide-folder-tree"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  aria-label="Sous-catégories"
                  :to="subcategoriesUrl(row.original)" />
              </UTooltip>
              <USeparator orientation="vertical" class="h-4" />
              <UTooltip :delay-duration="0" text="Modifier">
                <UButton
                  icon="i-lucide-pencil"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  aria-label="Modifier"
                  @click="openEdit(row.original)" />
              </UTooltip>
              <USeparator orientation="vertical" class="h-4" />
              <UTooltip :delay-duration="0" text="Supprimer">
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="xs"
                  aria-label="Supprimer"
                  @click="openDelete(row.original)" />
              </UTooltip>
            </div>
          </template>
        </UTable>
      </UCard>
    </template>
  </UDashboardPanel>

  <UModal
    v-model:open="modalOpen"
    :title="modalTitle"
    @close="closeModal"
    :ui="{
      header: 'sm:p-3 p-3',
      body: 'sm:p-3 p-3',
      footer: 'sm:p-3 p-3',
      content: 'divide-y-0',
    }">
    <template #body>
      <form class="w-full space-y-4" @submit.prevent="submitForm">
        <UFormField label="Nom" required class="w-full">
          <UInput v-model="form.name" placeholder="Ex. NVIDIA GeForce" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="Statut" class="w-full">
          <USwitch
            v-model="form.status"
            label="Activer le groupe"
            :description="form.status ? 'Visible sur la boutique' : 'Masqué sur la boutique'" />
        </UFormField>
      </form>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="outline" label="Annuler" @click="closeModal" />
        <UButton color="primary" :label="isEditing ? 'Enregistrer' : 'Créer'" :loading="saving" @click="submitForm" />
      </div>
    </template>
  </UModal>

  <UModal
    v-model:open="deleteModalOpen"
    title="Supprimer le groupe"
    description="Cette action est irréversible."
    :ui="{
      header: 'sm:p-3 p-3 border-none',
      body: 'sm:p-3 p-3',
      footer: 'sm:p-3 p-3',
      content: 'divide-y-0',
    }"
    @close="closeDeleteModal">
    <template #body>
      <p v-if="deletingGroup" class="text-neutral-600">
        Êtes-vous sûr de vouloir supprimer
        <strong>{{ deletingGroup.name }}</strong>
        ?
      </p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="outline" label="Annuler" @click="closeDeleteModal" />
        <UButton color="error" label="Supprimer" :loading="saving" @click="confirmDelete" />
      </div>
    </template>
  </UModal>
</template>
