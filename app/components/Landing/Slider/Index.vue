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

interface CenterSlideState {
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

const centerSlides = ref<CenterSlideState[]>([
  {
    sliderId: null,
    uploadId: null,
    link: "",
    imageUrl: null,
    uploading: false,
  },
]);

const centerSwiperRef = ref(null);
const centerSwiper = useSwiper(centerSwiperRef);

const centerSwiperKey = computed(() =>
  centerSlides.value.map((s) => s.sliderId ?? `u${s.uploadId ?? 0}`).join("-"),
);

const centerSlidesModalOpen = ref(false);

function isExternalLink(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

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

  const center = sourceSliders.value.filter((s) => s.side === "center");
  if (center.length) {
    centerSlides.value = center.map((s) => ({
      sliderId: s.id,
      uploadId: s.image?.id ?? null,
      link: s.link ?? "",
      imageUrl: s.image?.url ?? null,
      uploading: false,
    }));
  }

  for (const slider of sourceSliders.value) {
    const side = slider.side as SliderSideKey;
    if (!items.value[side]) continue;
    if (side === "center") continue;
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

async function handleCenterFileChange(index: number, file: File) {
  const slide = centerSlides.value[index];
  if (!slide) return;
  slide.uploading = true;

  try {
    const body = new FormData();
    body.append("file", file);
    body.append("directory", "sliders");

    const upload = await $apiFetch<{ id: number; url: string }>("/uploads/preview", {
      method: "POST",
      body,
    });

    slide.uploadId = upload.id;
    slide.imageUrl = upload.url;
  } catch {
    toast.add({
      id: `slider-upload-error-center-${index}`,
      title: "Échec du téléchargement",
      description: "Impossible de télécharger cette image. Réessayez.",
      color: "error",
    });
  } finally {
    slide.uploading = false;
  }
}

function addCenterSlide() {
  centerSlides.value.push({
    sliderId: null,
    uploadId: null,
    link: "",
    imageUrl: null,
    uploading: false,
  });
  nextTick(() => centerSwiper.next());
}

const deletedCenterSliderIds = ref<number[]>([]);

function removeCenterSlide(index: number) {
  const slide = centerSlides.value[index];
  if (!slide) return;
  if (slide.sliderId) deletedCenterSliderIds.value.push(slide.sliderId);
  centerSlides.value.splice(index, 1);
  if (centerSlides.value.length === 0) addCenterSlide();
}

function triggerCenterFileInput(index: number) {
  if (!import.meta.client) return;
  const input = document.getElementById(`slider-upload-center-${index}`) as HTMLInputElement | null;
  input?.click();
}

function onCenterFileInputChange(index: number, event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) handleCenterFileChange(index, file);
  target.value = "";
}

const canSave = computed(() => {
  const hasSideChanges = Object.values(items.value).some(
    (item) => item.side !== "center" && item.sliderId && (item.uploadId || item.link),
  );
  const hasCenterChanges = centerSlides.value.some((s) => s.uploadId || s.link || s.sliderId);
  return hasSideChanges || hasCenterChanges || deletedCenterSliderIds.value.length > 0;
});

async function saveAll() {
  saving.value = true;

  try {
    const payload = {
      items: [
        ...Object.values(items.value)
          .filter((item) => item.side !== "center" && item.sliderId)
          .map((item) => ({
            slider_id: item.sliderId!,
            link: item.link || null,
            upload_id: item.uploadId ?? null,
          })),
        ...centerSlides.value.map((s) => ({
          slider_id: s.sliderId,
          side: "center",
          link: s.link || null,
          upload_id: s.uploadId ?? null,
        })),
      ],
      deleted_slider_ids: deletedCenterSliderIds.value,
    };

    await $apiFetch("/sliders/bulk", {
      method: "PUT",
      body: payload,
    });

    deletedCenterSliderIds.value = [];

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
  <div class="max-w-[1360px] mx-auto px-3 sm:px-4">
    <div class="grid grid-cols-1 gap-3 pt-6 sm:gap-4 sm:pt-10 lg:grid-cols-8 lg:pt-12">
      <div class="order-2 col-span-full lg:order-0 lg:col-span-2 lg:block hidden">
        <LandingSliderZone
          side="left"
          :image-url="items.left.imageUrl"
          :link="items.left.link"
          :editable="editable"
          :uploading="items.left.uploading"
          label="Zone gauche"
          root-class="min-h-[220px] sm:min-h-[300px] lg:min-h-[450px]"
          recommended-size="320×450 px"
          @update:link="items.left.link = $event"
          @select-image="(file) => handleFileChange('left', file)" />
      </div>

      <div class="order-1 col-span-full lg:order-0 lg:col-span-4">
        <div class="space-y-3">
          <div class="relative rounded-md overflow-hidden border border-muted shadow-sm bg-neutral-100">
            <ClientOnly>
              <swiper-container
                ref="centerSwiperRef"
                :key="centerSwiperKey"
                class="block w-full min-h-[220px] sm:min-h-[320px] lg:min-h-[450px]"
                :loop="true"
                :slides-per-view="1"
                :autoplay="{ delay: 4500, disableOnInteraction: false }">
                <swiper-slide v-for="(slide, idx) in centerSlides" :key="slide.sliderId ?? `new-${idx}`">
                  <a
                    v-if="!editable && slide.link"
                    :href="slide.link"
                    class="block w-full h-full min-h-[220px] sm:min-h-[320px] lg:min-h-[450px]"
                    :target="isExternalLink(slide.link) ? '_blank' : undefined"
                    :rel="isExternalLink(slide.link) ? 'noopener noreferrer' : undefined"
                    :style="
                      slide.imageUrl
                        ? { backgroundImage: `url(${slide.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                        : undefined
                    ">
                    <div v-if="!slide.imageUrl" class="flex h-full w-full items-center justify-center">
                      <UIcon name="i-lucide-image" class="text-neutral-400 text-2xl" />
                    </div>
                  </a>
                  <div
                    v-else
                    class="block w-full h-full min-h-[220px] sm:min-h-[320px] lg:min-h-[450px]"
                    :style="
                      slide.imageUrl
                        ? { backgroundImage: `url(${slide.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                        : undefined
                    ">
                    <div v-if="!slide.imageUrl" class="flex h-full w-full items-center justify-center">
                      <UIcon name="i-lucide-image" class="text-neutral-400 text-2xl" />
                    </div>
                  </div>
                </swiper-slide>
              </swiper-container>
              <template #fallback>
                <div class="min-h-[220px] sm:min-h-[320px] lg:min-h-[450px] bg-neutral-100 flex items-center justify-center">
                  <UIcon name="i-lucide-image" class="text-neutral-400 text-2xl" />
                </div>
              </template>
            </ClientOnly>

            <UButton
              v-if="centerSwiper.instance"
              icon="i-lucide-chevron-left"
              color="neutral"
              variant="ghost"
              size="lg"
              aria-label="Précédent"
              class="hidden sm:flex rounded-full absolute top-1/2 -translate-y-1/2 start-2 bg-white/80 hover:bg-white"
              @click="centerSwiper.prev()" />
            <UButton
              v-if="centerSwiper.instance"
              icon="i-lucide-chevron-right"
              color="neutral"
              variant="ghost"
              size="lg"
              aria-label="Suivant"
              class="hidden sm:flex rounded-full absolute top-1/2 -translate-y-1/2 end-2 bg-white/80 hover:bg-white"
              @click="centerSwiper.next()" />

            <UButton
              v-if="editable"
              icon="i-lucide-images"
              label="Gérer les slides"
              color="neutral"
              variant="soft"
              size="xs"
              class="absolute left-2 bottom-2 bg-white/90 hover:bg-white z-10"
              @click="centerSlidesModalOpen = true" />
          </div>

          <p v-if="editable" class="text-[11px] text-neutral-500">Image recommandée : 640×450 px</p>
        </div>
      </div>

      <div class="order-3 col-span-full space-y-3 sm:space-y-4 lg:order-0 lg:col-span-2 lg:block hidden">
        <div>
          <LandingSliderZone
            side="right-top"
            :image-url="items['right-top'].imageUrl"
            :link="items['right-top'].link"
            :editable="editable"
            :uploading="items['right-top'].uploading"
            label="Haut droite"
            root-class="min-h-[160px] sm:min-h-[200px] lg:min-h-[225px]"
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
            root-class="min-h-[160px] sm:min-h-[200px] lg:min-h-[225px]"
            recommended-size="320×225 px"
            @update:link="items['right-bottom'].link = $event"
            @select-image="(file) => handleFileChange('right-bottom', file)" />
        </div>
      </div>
    </div>

    <div
      v-if="editable"
      class="mt-4 flex flex-col gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
      <span class="text-center text-[11px] text-neutral-500 sm:text-right">
        Les modifications ne seront visibles sur la boutique qu'après enregistrement.
      </span>
      <UButton
        class="w-full shrink-0 sm:w-auto"
        color="primary"
        size="xs"
        icon="i-lucide-save"
        :label="saving ? 'Enregistrement…' : 'Enregistrer les sliders'"
        :loading="saving"
        @click="saveAll" />
    </div>
  </div>

  <UModal
    v-if="editable"
    v-model:open="centerSlidesModalOpen"
    title="Gérer les slides (zone centrale)"
    :ui="{
      header: 'sm:p-3 p-3',
      body: 'sm:p-3 p-3',
      footer: 'sm:p-3 p-3',
      content: 'divide-y-0',
    }">
    <template #body>
      <div class="space-y-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-neutral-700">Slides</span>
          <UButton
            size="xs"
            color="neutral"
            variant="soft"
            icon="i-lucide-plus"
            label="Ajouter une slide"
            @click="addCenterSlide" />
        </div>

        <div class="space-y-3">
          <div
            v-for="(slide, idx) in centerSlides"
            :key="slide.sliderId ?? `center-form-${idx}`"
            class="rounded-lg border border-neutral-200 p-3 space-y-2">
            <div class="flex items-start justify-between gap-2">
              <UFormField label="Lien (optionnel)" class="flex-1">
                <UInput v-model="slide.link" size="sm" placeholder="https://... ou /category/..." />
              </UFormField>
              <UButton
                v-if="centerSlides.length > 1"
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="sm"
                aria-label="Supprimer"
                @click="removeCenterSlide(idx)" />
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <UButton
                color="neutral"
                variant="soft"
                size="sm"
                icon="i-lucide-upload-cloud"
                :label="slide.uploading ? 'Téléchargement…' : slide.imageUrl ? 'Changer l’image' : 'Choisir une image'"
                :loading="slide.uploading"
                @click="triggerCenterFileInput(idx)" />
              <span v-if="slide.imageUrl" class="text-[11px] text-neutral-500 truncate max-w-[520px]">{{ slide.imageUrl }}</span>
            </div>

            <input
              :id="`slider-upload-center-${idx}`"
              type="file"
              class="hidden"
              accept="image/*"
              @change="onCenterFileInputChange(idx, $event)" />
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="outline" label="Fermer" @click="centerSlidesModalOpen = false" />
      </div>
    </template>
  </UModal>
</template>
