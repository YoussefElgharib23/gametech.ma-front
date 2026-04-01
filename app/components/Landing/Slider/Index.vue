<script setup lang="ts">
type SliderSideKey = "left" | "center" | "right-top" | "right-bottom";

interface SliderItemState {
  side: SliderSideKey;
  sliderId: number | null;
  uploadId: number | null;
  link: string;
  imageUrl: string | null;
  uploading: boolean;
}

const props = defineProps<{
  editable?: boolean;
  /**
   * Optional pre-fetched sliders for the homepage.
   * When provided, they are used instead of fetching /sliders on mount.
   */
  sliderItems?: SliderApiResponse[] | null;
}>();

const items = ref<Record<SliderSideKey, SliderItemState>>({
  left: {
    side: "left",
    sliderId: null,
    uploadId: null,
    link: "",
    imageUrl: null,
    uploading: false,
  },
  center: {
    side: "center",
    sliderId: null,
    uploadId: null,
    link: "",
    imageUrl: null,
    uploading: false,
  },
  "right-top": {
    side: "right-top",
    sliderId: null,
    uploadId: null,
    link: "",
    imageUrl: null,
    uploading: false,
  },
  "right-bottom": {
    side: "right-bottom",
    sliderId: null,
    uploadId: null,
    link: "",
    imageUrl: null,
    uploading: false,
  },
});

const saving = ref(false);
const toast = useToast();

interface SliderApiResponse {
  id: number;
  side: string;
  link: string | null;
  image: { id: number; url: string } | null;
}

const { data: slidersData } = await useAPIFetch<SliderApiResponse[]>("/sliders");

const sourceSliders = computed<SliderApiResponse[]>(() => {
  if (props.sliderItems && props.sliderItems.length) {
    return props.sliderItems;
  }
  return slidersData.value ?? [];
});

watchEffect(() => {
  if (!sourceSliders.value.length) return;

  for (const slider of sourceSliders.value) {
    const side = slider.side as SliderSideKey;
    if (!items.value[side]) continue;
    items.value[side].sliderId = slider.id;
    items.value[side].link = slider.link ?? "";
    if (slider.image) {
      items.value[side].uploadId = slider.image.id;
      items.value[side].imageUrl = slider.image.url;
    }
  }
});

async function handleFileChange(side: SliderSideKey, file: File) {
  const item = items.value[side];
  item.uploading = true;

  try {
    const body = new FormData();
    body.append("file", file);
    body.append("directory", "sliders");

    const upload = await $apiFetch<{ id: number; url: string }>("/uploads/preview", {
      method: "POST",
      body,
    });

    item.uploadId = upload.id;
    item.imageUrl = upload.url;
  } catch {
    toast.add({
      id: `slider-upload-error-${side}`,
      title: "Échec du téléchargement",
      description: "Impossible de télécharger cette image. Réessayez.",
      color: "error",
    });
  } finally {
    item.uploading = false;
  }
}

const canSave = computed(() => Object.values(items.value).some((item) => item.sliderId && (item.uploadId || item.link)));

async function saveAll() {
  saving.value = true;

  try {
    const payload = {
      items: Object.values(items.value)
        .filter((item) => item.sliderId)
        .map((item) => ({
          slider_id: item.sliderId!,
          link: item.link || null,
          upload_id: item.uploadId ?? null,
        })),
    };

    await $apiFetch("/sliders/bulk", {
      method: "PUT",
      body: payload,
    });

    toast.add({
      id: "slider-save-success",
      title: "Sliders enregistrés",
      description: "Les images de la page d'accueil ont été mises à jour.",
      color: "success",
    });
  } catch {
    toast.add({
      id: "slider-save-error",
      title: "Erreur lors de l'enregistrement",
      description: "Impossible d'enregistrer les sliders. Réessayez.",
      color: "error",
    });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="max-w-[1360px] mx-auto px-4">
    <div class="grid grid-cols-8 gap-4 pt-12">
      <div class="col-span-2">
        <LandingSliderZone
          side="left"
          :image-url="items.left.imageUrl"
          :link="items.left.link"
          :editable="editable"
          :uploading="items.left.uploading"
          label="Zone gauche"
          root-class="min-h-[450px]"
          recommended-size="320×450 px"
          @update:link="items.left.link = $event"
          @select-image="(file) => handleFileChange('left', file)" />
      </div>

      <div class="col-span-4">
        <LandingSliderZone
          side="center"
          :image-url="items.center.imageUrl"
          :link="items.center.link"
          :editable="editable"
          :uploading="items.center.uploading"
          label="Zone centrale"
          root-class="min-h-[450px]"
          recommended-size="640×450 px"
          @update:link="items.center.link = $event"
          @select-image="(file) => handleFileChange('center', file)" />
      </div>

      <div class="col-span-2 space-y-4">
        <div>
          <LandingSliderZone
            side="right-top"
            :image-url="items['right-top'].imageUrl"
            :link="items['right-top'].link"
            :editable="editable"
            :uploading="items['right-top'].uploading"
            label="Haut droite"
            root-class="min-h-[225px]"
            recommended-size="320×225 px"
            @update:link="items['right-top'].link = $event"
            @select-image="(file) => handleFileChange('right-top', file)" />
        </div>
        <div>
          <LandingSliderZone
            side="right-bottom"
            :image-url="items['right-bottom'].imageUrl"
            :link="items['right-bottom'].link"
            :editable="editable"
            :uploading="items['right-bottom'].uploading"
            label="Bas droite"
            root-class="min-h-[225px]"
            recommended-size="320×225 px"
            @update:link="items['right-bottom'].link = $event"
            @select-image="(file) => handleFileChange('right-bottom', file)" />
        </div>
      </div>
    </div>

    <div v-if="editable" class="mt-4 flex items-center justify-end gap-3 border-t border-neutral-200 pt-4">
      <span class="text-[11px] text-neutral-500">
        Les modifications ne seront visibles sur la boutique qu'après enregistrement.
      </span>
      <UButton
        color="primary"
        size="xs"
        icon="i-lucide-save"
        :label="saving ? 'Enregistrement…' : 'Enregistrer les sliders'"
        :loading="saving"
        @click="saveAll" />
    </div>
  </div>
</template>
