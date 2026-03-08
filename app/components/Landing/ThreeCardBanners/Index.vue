<script setup lang="ts">
interface SliderApiResponse {
  id: number;
  side: string;
  link: string | null;
  image: { id: number; url: string } | null;
}

const CARD_SIDES = ["three-card-1", "three-card-2", "three-card-3"] as const;

const props = withDefaults(
  defineProps<{
    editable?: boolean;
  }>(),
  { editable: false },
);

const { data: slidersData } = await useAPIFetch<SliderApiResponse[]>("/sliders");
const slidersOverride = ref<SliderApiResponse[] | null>(null);

const slidersList = computed(
  () => slidersOverride.value ?? slidersData.value ?? [],
);

const cards = computed(() =>
  CARD_SIDES.map((side, index) => ({
    index,
    side,
    slider: slidersList.value.find((s) => s.side === side) ?? null,
  })),
);

// Editable state per card
interface CardEditState {
  editLink: string;
  editUploadId: number | null;
  editImageUrl: string | null;
  uploading: boolean;
  saving: boolean;
}

const cardEditState = reactive<Record<number, CardEditState>>({
  0: {
    editLink: "",
    editUploadId: null,
    editImageUrl: null,
    uploading: false,
    saving: false,
  },
  1: {
    editLink: "",
    editUploadId: null,
    editImageUrl: null,
    uploading: false,
    saving: false,
  },
  2: {
    editLink: "",
    editUploadId: null,
    editImageUrl: null,
    uploading: false,
    saving: false,
  },
});

const toast = useToast();

watch(
  [cards],
  () => {
    cards.value.forEach(({ index, slider }) => {
      const state = cardEditState[index];
      if (!state) return;
      state.editLink = slider?.link ?? "";
      state.editUploadId = slider?.image?.id ?? null;
      state.editImageUrl = null;
    });
  },
  { immediate: true, deep: true },
);

function triggerFileInput(index: number) {
  const input = document.getElementById(
    `three-card-upload-${index}`,
  ) as HTMLInputElement | null;
  input?.click();
}

async function onFileChange(index: number, event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  const state = cardEditState[index];
  if (!state) return;

  state.uploading = true;
  try {
    const body = new FormData();
    body.append("file", file);
    body.append("directory", "sliders");

    const upload = await $apiFetch<{ id: number; url: string }>(
      "/uploads/preview",
      { method: "POST", body },
    );

    state.editUploadId = upload.id;
    state.editImageUrl = upload.url;
  } catch {
    toast.add({
      id: `three-card-upload-error-${index}`,
      title: "Échec du téléchargement",
      description: "Impossible de télécharger cette image.",
      color: "error",
    });
  } finally {
    state.uploading = false;
    target.value = "";
  }
}

async function saveCard(index: number) {
  const state = cardEditState[index];
  const card = cards.value[index];
  if (!state || state.saving || !card?.slider) {
    if (card?.slider == null) {
      toast.add({
        id: "three-card-no-slider",
        title: "Carte non chargée",
        description:
          "Les cartes n'existent pas encore. Exécutez le seeder (SliderSeeder) côté backend.",
        color: "error",
      });
    }
    return;
  }

  state.saving = true;
  try {
    const updated = await $apiFetch<SliderApiResponse[]>("/sliders/bulk", {
      method: "PUT",
      body: {
        items: [
          {
            slider_id: card.slider.id,
            link: state.editLink || null,
            upload_id: state.editUploadId ?? null,
          },
        ],
      },
    });

    slidersOverride.value = Array.isArray(updated) ? updated : null;
    state.editImageUrl = null;

    toast.add({
      id: `three-card-save-${index}`,
      title: "Carte enregistrée",
      color: "success",
    });
  } catch {
    toast.add({
      id: `three-card-save-error-${index}`,
      title: "Erreur lors de l'enregistrement",
      color: "error",
    });
  } finally {
    state.saving = false;
  }
}

function displayLink(cardIndex: number) {
  const card = cards.value[cardIndex];
  const state = cardEditState[cardIndex];
  if (props.editable && state) return state.editLink;
  return card?.slider?.link ?? "";
}

function displayImageUrl(cardIndex: number) {
  const card = cards.value[cardIndex];
  const state = cardEditState[cardIndex];
  if (props.editable && state?.editImageUrl) return state.editImageUrl;
  return card?.slider?.image?.url ?? null;
}

const isExternalLink = (url: string) => /^https?:\/\//i.test(url);
</script>

<template>
  <UContainer class="py-8">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="(card, i) in cards"
        :key="card.side"
      >
        <component
          :is="
            editable
              ? 'div'
              : displayLink(i)
                ? 'a'
                : 'div'
          "
          :href="
            !editable && displayLink(i)
              ? displayLink(i)
              : undefined
          "
          :target="
            !editable && displayLink(i) && isExternalLink(displayLink(i))
              ? '_blank'
              : undefined
          "
          :rel="
            !editable && displayLink(i) && isExternalLink(displayLink(i))
              ? 'noopener noreferrer'
              : undefined
          "
          class="group relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 shadow-sm aspect-square flex items-center justify-center"
          :class="{ 'bg-cover bg-center': displayImageUrl(i) }"
          :style="
            displayImageUrl(i)
              ? { backgroundImage: `url(${displayImageUrl(i)})` }
              : undefined
          "
        >
          <div
            v-if="!displayImageUrl(i)"
            class="flex h-full w-full items-center justify-center"
          >
            <UIcon name="i-lucide-image" class="text-neutral-400 text-2xl" />
          </div>

          <div
            v-if="editable"
            class="absolute inset-0 flex flex-col items-end justify-between bg-black/20 p-4 opacity-0 transition-opacity group-hover:opacity-100"
            @click.stop
          >
            <div class="w-full space-y-2 rounded bg-white/90 p-3">
              <UInput
                v-model="cardEditState[i].editLink"
                size="xs"
                :placeholder="`Lien carte ${i + 1} (optionnel)`"
              />
              <div class="flex items-center justify-between gap-2">
                <UButton
                  color="neutral"
                  variant="soft"
                  size="xs"
                  icon="i-lucide-upload-cloud"
                  :label="
                    cardEditState[i].uploading
                      ? 'Téléchargement…'
                      : 'Choisir une image'
                  "
                  :loading="cardEditState[i].uploading"
                  @click.stop="triggerFileInput(i)"
                />
                <UButton
                  type="button"
                  color="primary"
                  size="xs"
                  icon="i-lucide-save"
                  :label="
                    cardEditState[i].saving ? 'Enregistrement…' : 'Enregistrer'
                  "
                  :loading="cardEditState[i].saving"
                  @click="saveCard(i)"
                />
              </div>
            </div>
            <span class="text-[11px] text-white/90">Carte {{ i + 1 }}</span>
          </div>

          <input
            v-if="editable"
            :id="`three-card-upload-${i}`"
            type="file"
            class="hidden"
            accept="image/*"
            @change="(e: Event) => onFileChange(i, e)"
          />
        </component>
        <p
          v-if="editable"
          class="mt-1.5 text-[11px] text-neutral-500"
        >
          Image recommandée : 400×400 px
        </p>
      </div>
    </div>
  </UContainer>
</template>
