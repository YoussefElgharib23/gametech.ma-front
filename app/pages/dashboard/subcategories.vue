<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

interface CategoryGroup {
  id: number;
  category_id: number;
  name: string;
}

interface Subcategory {
  id: number;
  category_id: number;
  category_name: string;
  category_group_id: number | null;
  category_group_name: string | null;
  name: string;
  slug: string;
  status: "active" | "inactive";
  position: number;
}

const route = useRoute();

const categoryGroupIdParam = computed(() => {
  const raw = route.query.category_group_id;
  if (raw == null || raw === "") {
    return null;
  }
  const n = Number(raw);

  return Number.isFinite(n) && n > 0 ? n : null;
});

const categoryIdParam = computed(() => {
  const raw = route.query.category_id;
  if (raw == null || raw === "") {
    return null;
  }
  const n = Number(raw);

  return Number.isFinite(n) && n > 0 ? n : null;
});

const subcategoriesUrl = computed(() => {
  const base = "/subcategories";
  if (categoryGroupIdParam.value != null) {
    return `${base}?category_group_id=${categoryGroupIdParam.value}`;
  }
  if (categoryIdParam.value != null) {
    return `${base}?category_id=${categoryIdParam.value}`;
  }

  return base;
});

const { data: subcategoriesData, refresh } = await useAPIFetch<Subcategory[]>(subcategoriesUrl);
const { data: allGroupsData } = await useAPIFetch<CategoryGroup[]>("/category-groups");

watch(
  () => route.query,
  () => {
    void refresh();
  },
  { deep: true },
);

const groupsForCreate = computed(() => {
  if (categoryGroupIdParam.value != null) {
    return [];
  }
  const cid = categoryIdParam.value;
  if (cid == null) {
    return allGroupsData.value ?? [];
  }

  return (allGroupsData.value ?? []).filter((g) => g.category_id === cid);
});

const search = ref("");
const filteredSubcategories = computed(() => {
  const list = subcategoriesData.value ?? [];
  const term = search.value.trim().toLowerCase();
  if (!term) {
    return list;
  }

  return list.filter((sub) =>
    [sub.name, sub.slug, sub.category_name, sub.category_group_name].filter(Boolean).some((field) => field!.toLowerCase().includes(term)),
  );
});

const subcategoryColumns = [
  {
    accessorKey: "id",
    header: "ID",
    meta: { class: { td: "w-16 font-mono text-neutral-500" } },
  },
  {
    accessorKey: "name",
    header: "Sous-catégorie",
    meta: { class: { td: "min-w-0" } },
  },
  {
    accessorKey: "category_group_name",
    header: "Groupe",
    meta: { class: { td: "w-48" } },
  },
  {
    accessorKey: "status",
    header: "Statut",
    meta: { class: { td: "w-28" } },
  },
  {
    id: "actions",
    header: "",
    meta: { class: { td: "w-28 text-right" } },
  },
];

const toast = useToast();
const modalOpen = ref(false);
const deleteModalOpen = ref(false);
const editingId = ref<number | null>(null);
const deletingSubcategory = ref<Subcategory | null>(null);
const saving = ref(false);
const form = ref({
  category_group_id: undefined as number | undefined,
  name: "",
  status: true as boolean,
  position: 0,
});

const isEditing = computed(() => editingId.value != null);
const modalTitle = computed(() => (isEditing.value ? "Modifier la sous-catégorie" : "Nouvelle sous-catégorie"));

const headerTitle = computed(() => {
  if (categoryGroupIdParam.value != null) {
    const first = (subcategoriesData.value ?? [])[0];
    const gname = first?.category_group_name;
    if (gname) {
      return `Sous-catégories — ${gname}`;
    }

    return "Sous-catégories";
  }
  if (categoryIdParam.value != null) {
    const first = (subcategoriesData.value ?? [])[0];
    const cname = first?.category_name;
    if (cname) {
      return `Sous-catégories — ${cname}`;
    }

    return "Sous-catégories";
  }

  return "Sous-catégories";
});

const backToUrl = computed(() => {
  const cid = categoryIdParam.value;
  if (cid != null) {
    return `/dashboard/category-groups?category_id=${cid}`;
  }

  return "/dashboard/categories";
});

const showGroupFieldInModal = computed(() => !isEditing.value && categoryGroupIdParam.value == null);

const canCreate = computed(() => {
  if (isEditing.value) {
    return true;
  }
  if (categoryGroupIdParam.value != null) {
    return true;
  }
  if (categoryIdParam.value != null && groupsForCreate.value.length > 0) {
    return true;
  }

  return false;
});

function openCreate() {
  if (!canCreate.value) {
    toast.add({
      title: "Contexte requis",
      description: "Ouvrez les sous-catégories depuis un groupe, ou choisissez un groupe ci-dessous.",
      color: "warning",
    });

    return;
  }
  editingId.value = null;
  form.value = {
    category_group_id: categoryGroupIdParam.value ?? undefined,
    name: "",
    status: true,
    position: 0,
  };
  modalOpen.value = true;
}

function openEdit(sub: Subcategory) {
  editingId.value = sub.id;
  form.value = {
    category_group_id: sub.category_group_id ?? undefined,
    name: sub.name,
    status: sub.status === "active",
    position: sub.position,
  };
  modalOpen.value = true;
}

function openDelete(sub: Subcategory) {
  deletingSubcategory.value = sub;
  deleteModalOpen.value = true;
}

function closeModal() {
  modalOpen.value = false;
  editingId.value = null;
}

function closeDeleteModal() {
  deleteModalOpen.value = false;
  deletingSubcategory.value = null;
}

async function submitForm() {
  if (!form.value.name.trim()) {
    toast.add({ title: "Nom requis", color: "error" });

    return;
  }
  if (!isEditing.value && (form.value.category_group_id == null || form.value.category_group_id === 0)) {
    toast.add({ title: "Groupe requis", color: "error" });

    return;
  }
  saving.value = true;
  try {
    if (isEditing.value && editingId.value != null) {
      await $apiFetch(`/subcategories/${editingId.value}`, {
        method: "PUT",
        body: {
          name: form.value.name.trim(),
          status: form.value.status ? "active" : "inactive",
          position: form.value.position,
        },
      });
      toast.add({ title: "Sous-catégorie mise à jour", color: "success" });
    } else {
      await $apiFetch("/subcategories", {
        method: "POST",
        body: {
          category_group_id: form.value.category_group_id as number,
          name: form.value.name.trim(),
          status: form.value.status ? "active" : "inactive",
          position: form.value.position,
        },
      });
      toast.add({ title: "Sous-catégorie créée", color: "success" });
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
  if (!deletingSubcategory.value) {
    return;
  }
  const id = deletingSubcategory.value.id;
  saving.value = true;
  try {
    await $apiFetch(`/subcategories/${id}`, { method: "DELETE" });
    toast.add({ title: "Sous-catégorie supprimée", color: "success" });
    await refresh();
    closeDeleteModal();
  } catch {
    toast.add({ title: "Erreur lors de la suppression", color: "error" });
  } finally {
    saving.value = false;
  }
}

const groupSelectItems = computed(() => groupsForCreate.value.map((g) => ({ label: g.name, value: g.id })));
const groupIdModel = computed({
  get: () => form.value.category_group_id,
  set: (v: number | undefined) => {
    form.value.category_group_id = v;
  },
});
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :title="headerTitle">
        <template #left>
          <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" :to="backToUrl" aria-label="Retour" />
        </template>
        <template #right>
          <UButton
            icon="i-lucide-plus"
            label="Ajouter une sous-catégorie"
            color="primary"
            :disabled="!canCreate"
            @click="openCreate" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UCard :ui="{ body: 'sm:p-0 p-0' }">
        <div class="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Rechercher une sous-catégorie…"
            size="md"
            class="max-w-sm w-full" />
        </div>

        <div v-if="!filteredSubcategories.length" class="py-12 text-center text-neutral-500">
          Aucune sous-catégorie. Cliquez sur « Ajouter une sous-catégorie » pour commencer.
        </div>

        <UTable v-else :data="filteredSubcategories" :columns="subcategoryColumns">
          <template #name-cell="{ row }">
            <span class="min-w-0 truncate font-medium text-neutral-900">
              {{ row.original.name }}
            </span>
          </template>
          <template #category_group_name-cell="{ row }">
            <span class="text-neutral-600">{{ row.original.category_group_name ?? "—" }}</span>
          </template>
          <template #status-cell="{ row }">
            <UBadge :color="row.original.status === 'active' ? 'success' : 'neutral'" variant="subtle" size="xs">
              {{ row.original.status === "active" ? "Actif" : "Inactif" }}
            </UBadge>
          </template>
          <template #actions-cell="{ row }">
            <div class="bg-neutral-50 rounded-lg border border-muted p-1 inline-flex items-center justify-end gap-1">
              <UTooltip :delay-duration="0" text="Modifier">
                <UButton
                  icon="i-lucide-pencil"
                  color="neutral"
                  variant="soft"
                  size="xs"
                  aria-label="Modifier"
                  @click="openEdit(row.original)" />
              </UTooltip>
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
        <UFormField v-if="showGroupFieldInModal" label="Groupe" required class="w-full">
          <USelectMenu
            v-model="groupIdModel"
            :items="groupSelectItems"
            placeholder="Sélectionner un groupe"
            size="md"
            class="w-full"
            label-key="label"
            value-key="value" />
        </UFormField>
        <UFormField label="Nom" required class="w-full">
          <UInput v-model="form.name" placeholder="Ex. RTX 4090" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="Statut" class="w-full">
          <USwitch
            v-model="form.status"
            label="Activer la sous-catégorie"
            :description="form.status ? 'Visible sur la boutique' : 'Masquée sur la boutique'" />
        </UFormField>
        <UFormField label="Position" class="w-full">
          <UInput v-model.number="form.position" type="number" min="0" size="md" class="w-full" />
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
    title="Supprimer la sous-catégorie"
    description="Cette action est irréversible."
    :ui="{
      header: 'sm:p-3 p-3',
      body: 'sm:p-3 p-3',
      footer: 'sm:p-3 p-3',
      content: 'divide-y-0',
    }"
    @close="closeDeleteModal">
    <template #body>
      <p v-if="deletingSubcategory" class="text-neutral-600">
        Êtes-vous sûr de vouloir supprimer
        <strong>{{ deletingSubcategory.name }}</strong>
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
