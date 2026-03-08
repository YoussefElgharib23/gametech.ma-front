<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  position: number;
}

const { data: categoriesData, refresh } = await useAPIFetch<Category[]>("/categories");
const categories = computed(() => categoriesData.value ?? []);

const categoryColumns = [
  {
    accessorKey: "id",
    header: "ID",
    meta: { class: { td: "w-16 font-mono text-neutral-500" } },
  },
  {
    accessorKey: "name",
    header: "Catégorie",
    meta: { class: { td: "min-w-0" } },
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
const deletingCategory = ref<Category | null>(null);
const saving = ref(false);
const uploading = ref(false);
const form = ref({
  name: "",
  image: "",
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
    toast.add({
      title: "Échec du téléchargement",
      description: "Impossible de télécharger cette image.",
      color: "error",
    });
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
  form.value = { name: "", image: "", position: 0 };
  modalOpen.value = true;
}

function openEdit(cat: Category) {
  editingId.value = cat.id;
  form.value = {
    name: cat.name,
    image: cat.image ?? "",
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
          <UButton icon="i-lucide-plus" label="Ajouter une catégorie" color="primary" @click="openCreate" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UCard :ui="{ body: 'sm:p-0 p-0' }">
        <div v-if="!categories.length" class="py-12 text-center text-neutral-500">
          Aucune catégorie. Cliquez sur « Ajouter une catégorie » pour commencer.
        </div>

        <UTable v-else :data="categories" :columns="categoryColumns">
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
          <template #actions-cell="{ row }">
            <div class="flex items-center justify-end gap-1">
              <UButton
                icon="i-lucide-pencil"
                color="neutral"
                variant="ghost"
                size="xs"
                aria-label="Modifier"
                @click="openEdit(row.original)" />
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="xs"
                aria-label="Supprimer"
                @click="openDelete(row.original)" />
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
