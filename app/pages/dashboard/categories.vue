<script setup lang="ts">
import { useSortable } from "@vueuse/integrations/useSortable";

definePageMeta({
  layout: "dashboard",
});

interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  status: "active" | "inactive";
  position: number;
}

const { data: categoriesData, refresh } = await useAPIFetch<Category[]>("/categories");

const search = ref("");
const filteredCategories = computed(() => {
  const list = categoriesData.value ?? [];
  const term = search.value.trim().toLowerCase();
  if (!term) return list;
  return list.filter((cat) => [cat.name, cat.slug].filter(Boolean).some((field) => field!.toLowerCase().includes(term)));
});

const toast = useToast();
const reorderMode = ref(false);
const savingOrder = ref(false);
const reorderData = ref<Category[]>([]);
const reorderSnapshotIds = ref<number[]>([]);
const sortable = shallowRef<any>(null);

const sortedCategories = computed(() => {
  return (categoriesData.value ?? []).slice().sort((a, b) => a.position - b.position || a.id - b.id);
});

const tableData = computed(() => (reorderMode.value ? reorderData.value : filteredCategories.value));
const tableUi = computed(() => (reorderMode.value ? { tbody: "categories-table-tbody" } : undefined));

watch(
  () => categoriesData.value,
  () => {
    if (reorderMode.value) {
      return;
    }
    reorderData.value = sortedCategories.value.slice();
  },
  { immediate: true },
);

async function beginReorder(): Promise<void> {
  if (search.value.trim()) {
    toast.add({
      title: "Désactivez la recherche",
      description: "Pour réordonner, videz d’abord le champ de recherche.",
      color: "neutral",
    });
    return;
  }

  reorderData.value = sortedCategories.value.slice();
  reorderSnapshotIds.value = reorderData.value.map((c) => c.id);
  reorderMode.value = true;

  await nextTick();
  sortable.value?.destroy?.();
  sortable.value = useSortable(".categories-table-tbody", reorderData, {
    animation: 150,
    handle: ".category-drag-handle",
  });
}

function endReorder(): void {
  reorderMode.value = false;
  sortable.value?.destroy?.();
  sortable.value = null;
}

function cancelReorder(): void {
  const list = categoriesData.value ?? [];
  const byId = new Map(list.map((c) => [c.id, c]));
  reorderData.value = reorderSnapshotIds.value.map((id) => byId.get(id)).filter(Boolean) as Category[];
  endReorder();
}

async function saveReorder(): Promise<void> {
  if (!reorderMode.value) {
    return;
  }

  const updates: Array<{ id: number; position: number }> = [];
  for (let i = 0; i < reorderData.value.length; i++) {
    const cat = reorderData.value[i]!;
    if (cat.position !== i) {
      updates.push({ id: cat.id, position: i });
    }
  }

  if (!updates.length) {
    toast.add({ title: "Ordre inchangé", color: "neutral" });
    endReorder();
    return;
  }

  savingOrder.value = true;
  try {
    for (const u of updates) {
      await $apiFetch(`/categories/${u.id}`, {
        method: "PUT",
        body: { position: u.position },
      });
    }

    toast.add({ title: "Ordre enregistré", color: "success" });
    endReorder();
    await refresh();
  } catch {
    toast.add({ title: "Erreur lors de l’enregistrement de l’ordre", color: "error" });
  } finally {
    savingOrder.value = false;
  }
}

const categoryColumns = [
  {
    id: "drag",
    header: "",
    meta: { class: { th: "w-10", td: "w-10" } },
  },
  {
    accessorKey: "name",
    header: "Catégorie",
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
    meta: { class: { td: "w-36 text-right" } },
  },
];

const modalOpen = ref(false);
const deleteModalOpen = ref(false);
const editingId = ref<number | null>(null);
const deletingCategory = ref<Category | null>(null);
const saving = ref(false);
const uploading = ref(false);
const form = ref({
  name: "",
  image: "",
  status: true as boolean, // true = active, false = inactive
  position: 0,
});

function triggerImageInput() {
  const input = document.getElementById("category-image-upload") as HTMLInputElement | null;
  input?.click();
}

async function onImageChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  uploading.value = true;
  try {
    const body = new FormData();
    body.append("file", file);
    body.append("directory", "categories");
    const upload = await $apiFetch<{ id: number; url: string }>("/uploads/preview", { method: "POST", body });
    form.value.image = upload.url;
  } catch {
  } finally {
    uploading.value = false;
    target.value = "";
  }
}

function clearImage() {
  form.value.image = "";
}

const isEditing = computed(() => editingId.value != null);
const modalTitle = computed(() => (isEditing.value ? "Modifier la catégorie" : "Nouvelle catégorie"));

function openCreate() {
  editingId.value = null;
  form.value = { name: "", image: "", status: true, position: 0 };
  modalOpen.value = true;
}

function openEdit(cat: Category) {
  editingId.value = cat.id;
  form.value = {
    name: cat.name,
    image: cat.image ?? "",
    status: cat.status === "active",
    position: cat.position,
  };
  modalOpen.value = true;
}

function openDelete(cat: Category) {
  deletingCategory.value = cat;
  deleteModalOpen.value = true;
}

function closeModal() {
  modalOpen.value = false;
  editingId.value = null;
}

function closeDeleteModal() {
  deleteModalOpen.value = false;
  deletingCategory.value = null;
}

async function submitForm() {
  if (!form.value.name.trim()) {
    toast.add({
      title: "Nom requis",
      color: "error",
    });
    return;
  }
  saving.value = true;
  try {
    if (isEditing.value && editingId.value != null) {
      await $apiFetch(`/categories/${editingId.value}`, {
        method: "PUT",
        body: {
          name: form.value.name.trim(),
          image: form.value.image.trim() || null,
          status: form.value.status ? "active" : "inactive",
          position: form.value.position,
        },
      });
      toast.add({ title: "Catégorie mise à jour", color: "success" });
    } else {
      await $apiFetch("/categories", {
        method: "POST",
        body: {
          name: form.value.name.trim(),
          image: form.value.image.trim() || null,
          status: form.value.status ? "active" : "inactive",
          position: form.value.position,
        },
      });
      toast.add({ title: "Catégorie créée", color: "success" });
    }
    await refresh();
    closeModal();
  } catch {
    toast.add({
      title: "Erreur lors de l'enregistrement",
      color: "error",
    });
  } finally {
    saving.value = false;
  }
}

async function confirmDelete() {
  if (!deletingCategory.value) return;
  const id = deletingCategory.value.id;
  saving.value = true;
  try {
    await $apiFetch(`/categories/${id}`, { method: "DELETE" });
    toast.add({ title: "Catégorie supprimée", color: "success" });
    await refresh();
    closeDeleteModal();
  } catch {
    toast.add({
      title: "Erreur lors de la suppression",
      color: "error",
    });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Catégories">
        <template #right>
          <div class="flex items-center gap-2">
            <template v-if="!reorderMode">
              <UButton icon="i-lucide-arrow-up-down" label="Réordonner" color="neutral" variant="soft" @click="beginReorder" />
            </template>
            <template v-else>
              <UButton
                icon="i-lucide-x"
                label="Annuler"
                color="neutral"
                variant="outline"
                :disabled="savingOrder"
                @click="cancelReorder" />
              <UButton
                icon="i-lucide-check"
                label="Enregistrer l’ordre"
                color="primary"
                :loading="savingOrder"
                @click="saveReorder" />
            </template>

            <UButton
              icon="i-lucide-plus"
              label="Ajouter une catégorie"
              color="primary"
              :disabled="savingOrder"
              @click="openCreate" />
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UCard :ui="{ body: 'sm:p-0 p-0' }">
        <template #header>
          <div class="p-2">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              placeholder="Rechercher une catégorie…"
              size="md"
              class="max-w-sm w-full" />
          </div>
        </template>

        <div v-if="!filteredCategories.length" class="py-12 text-center text-neutral-500">
          Aucune catégorie. Cliquez sur « Ajouter une catégorie » pour commencer.
        </div>

        <UTable v-else :data="tableData" :columns="categoryColumns" :ui="tableUi">
          <template #drag-cell>
            <div class="flex justify-center">
              <UButton
                v-if="reorderMode"
                class="category-drag-handle cursor-move"
                icon="i-lucide-grip-vertical"
                color="neutral"
                variant="ghost"
                size="xs"
                aria-label="Déplacer" />
            </div>
          </template>
          <template #name-cell="{ row }">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 shrink-0 overflow-hidden rounded border border-neutral-200 bg-neutral-100">
                <img
                  v-if="row.original.image"
                  :src="row.original.image"
                  :alt="row.original.name"
                  class="h-full w-full object-cover" />
                <div v-else class="flex h-full w-full items-center justify-center text-neutral-400">
                  <UIcon name="i-lucide-image" class="size-5" />
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
              <template v-if="!reorderMode">
                <UTooltip :delay-duration="0" text="Groupes">
                  <UButton
                    icon="i-lucide-layers"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    aria-label="Groupes"
                    :to="`/dashboard/category-groups?category_id=${row.original.id}`" />
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
              </template>
            </div>
          </template>
        </UTable>
      </UCard>
    </template>
  </UDashboardPanel>

  <!-- Create / Edit modal -->
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
          <UInput v-model="form.name" placeholder="Ex. CARTE GRAPHIQUE" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="Statut" class="w-full">
          <USwitch
            v-model="form.status"
            label="Activer la catégorie"
            :description="form.status ? 'Visible sur la boutique' : 'Masquée sur la boutique'" />
        </UFormField>
        <UFormField label="Image (optionnel)" class="w-full">
          <div class="flex w-full flex-col items-start gap-3">
            <div
              v-if="form.image"
              class="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
              <img :src="form.image" alt="Aperçu" class="h-full w-full object-cover" />
              <UButton
                icon="i-lucide-x"
                color="error"
                variant="outline"
                size="xs"
                class="absolute right-1 top-1"
                aria-label="Supprimer l'image"
                @click="clearImage" />
            </div>
            <UButton
              color="neutral"
              variant="soft"
              size="lg"
              icon="i-lucide-upload-cloud"
              class="max-w-xs"
              :label="uploading ? 'Téléchargement…' : form.image ? 'Changer l\'image' : 'Choisir une image'"
              :loading="uploading"
              @click="triggerImageInput" />
          </div>
          <input id="category-image-upload" type="file" class="hidden" accept="image/*" @change="onImageChange" />
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

  <!-- Delete confirmation modal -->
  <UModal
    v-model:open="deleteModalOpen"
    title="Supprimer la catégorie"
    description="Cette action est irréversible."
    :ui="{
      header: 'sm:p-3 p-3 border-none',
      body: 'sm:p-3 p-3',
      footer: 'sm:p-3 p-3',
      content: 'divide-y-0',
    }"
    @close="closeDeleteModal">
    <template #body>
      <p v-if="deletingCategory" class="text-neutral-600">
        Êtes-vous sûr de vouloir supprimer
        <strong>{{ deletingCategory.name }}</strong>
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
