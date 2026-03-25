<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

interface Brand {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  status: "active" | "inactive";
}

const { data: brandsData, refresh } = await useAPIFetch<Brand[]>("/brands");

const search = ref("");
const filteredBrands = computed(() => {
  const list = brandsData.value ?? [];
  const term = search.value.trim().toLowerCase();
  if (!term) return list;
  return list.filter((b) => [b.name, b.slug].filter(Boolean).some((field) => field!.toLowerCase().includes(term)));
});

const brandColumns = [
  {
    accessorKey: "name",
    header: "Marque",
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
    meta: { class: { td: "w-28 text-right" } },
  },
];

const toast = useToast();
const modalOpen = ref(false);
const deleteModalOpen = ref(false);
const editingId = ref<number | null>(null);
const deletingBrand = ref<Brand | null>(null);
const saving = ref(false);
const uploading = ref(false);
const form = ref({
  name: "",
  image: "",
  status: true as boolean,
});

function triggerImageInput() {
  const input = document.getElementById("brand-image-upload") as HTMLInputElement | null;
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
    body.append("directory", "brands");
    const upload = await $apiFetch<{ id: number; url: string }>("/uploads/preview", { method: "POST", body });
    form.value.image = upload.url;
  } catch {
    toast.add({ title: "Erreur lors du téléchargement", color: "error" });
  } finally {
    uploading.value = false;
    target.value = "";
  }
}

function clearImage() {
  form.value.image = "";
}

const isEditing = computed(() => editingId.value != null);
const modalTitle = computed(() => (isEditing.value ? "Modifier la marque" : "Nouvelle marque"));

function openCreate() {
  editingId.value = null;
  form.value = { name: "", image: "", status: true };
  modalOpen.value = true;
}

function openEdit(brand: Brand) {
  editingId.value = brand.id;
  form.value = {
    name: brand.name,
    image: brand.image ?? "",
    status: brand.status === "active",
  };
  modalOpen.value = true;
}

function openDelete(brand: Brand) {
  deletingBrand.value = brand;
  deleteModalOpen.value = true;
}

function closeModal() {
  modalOpen.value = false;
  editingId.value = null;
}

function closeDeleteModal() {
  deleteModalOpen.value = false;
  deletingBrand.value = null;
}

async function submitForm() {
  if (!form.value.name.trim()) {
    toast.add({ title: "Nom requis", color: "error" });
    return;
  }
  saving.value = true;
  try {
    if (isEditing.value && editingId.value != null) {
      await $apiFetch(`/brands/${editingId.value}`, {
        method: "PUT",
        body: {
          name: form.value.name.trim(),
          image: form.value.image.trim() || null,
          status: form.value.status ? "active" : "inactive",
        },
      });
      toast.add({ title: "Marque mise à jour", color: "success" });
    } else {
      await $apiFetch("/brands", {
        method: "POST",
        body: {
          name: form.value.name.trim(),
          image: form.value.image.trim() || null,
          status: form.value.status ? "active" : "inactive",
        },
      });
      toast.add({ title: "Marque créée", color: "success" });
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
  if (!deletingBrand.value) return;
  const id = deletingBrand.value.id;
  saving.value = true;
  try {
    await $apiFetch(`/brands/${id}`, { method: "DELETE" });
    toast.add({ title: "Marque supprimée", color: "success" });
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
      <UDashboardNavbar title="Marques">
        <template #right>
          <UButton icon="i-lucide-plus" label="Ajouter une marque" color="primary" @click="openCreate" />
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
              placeholder="Rechercher une marque…"
              size="md"
              class="max-w-sm w-full" />
          </div>
        </template>

        <div v-if="!filteredBrands.length" class="py-12 text-center text-neutral-500">
          Aucune marque. Cliquez sur « Ajouter une marque » pour commencer.
        </div>

        <UTable v-else :data="filteredBrands" :columns="brandColumns">
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

  <!-- Create / Edit modal -->
  <UModal
    v-model:open="modalOpen"
    :title="modalTitle"
    :ui="{
      header: 'sm:p-3 p-3',
      body: 'sm:p-3 p-3',
      footer: 'sm:p-3 p-3',
      content: 'divide-y-0',
    }"
    @close="closeModal">
    <template #body>
      <form class="w-full space-y-4" @submit.prevent="submitForm">
        <UFormField label="Nom" required class="w-full">
          <UInput v-model="form.name" placeholder="Ex. AMD, MSI, Corsair" size="lg" class="w-full" />
        </UFormField>
        <UFormField label="Statut" class="w-full">
          <USwitch
            v-model="form.status"
            label="Activer la marque"
            :description="form.status ? 'Visible sur la boutique' : 'Masquée sur la boutique'" />
        </UFormField>
        <UFormField label="Logo (optionnel)" class="w-full">
          <div class="flex w-full flex-col items-start gap-3">
            <div
              v-if="form.image"
              class="relative h-32 w-32 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
              <img :src="form.image" alt="Aperçu" class="h-full w-full object-contain" />
              <UButton
                icon="i-lucide-x"
                color="error"
                variant="outline"
                size="xs"
                class="absolute right-1 top-1"
                aria-label="Supprimer le logo"
                @click="clearImage" />
            </div>
            <UButton
              color="neutral"
              variant="soft"
              size="lg"
              icon="i-lucide-upload-cloud"
              class="max-w-xs"
              :label="uploading ? 'Téléchargement…' : form.image ? 'Changer le logo' : 'Choisir un logo'"
              :loading="uploading"
              @click="triggerImageInput" />
          </div>
          <input id="brand-image-upload" type="file" class="hidden" accept="image/*" @change="onImageChange" />
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
    title="Supprimer la marque"
    description="Cette action est irréversible."
    :ui="{
      header: 'sm:p-3 p-3 border-none',
      body: 'sm:p-3 p-3',
      footer: 'sm:p-3 p-3',
      content: 'divide-y-0',
    }"
    @close="closeDeleteModal">
    <template #body>
      <p v-if="deletingBrand" class="text-neutral-600">
        Êtes-vous sûr de vouloir supprimer
        <strong>{{ deletingBrand.name }}</strong>
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
