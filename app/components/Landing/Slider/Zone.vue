<script setup lang="ts">
type SliderSideKey = "left" | "center" | "right-top" | "right-bottom";

const props = withDefaults(
  defineProps<{
    side: SliderSideKey;
    imageUrl: string | null;
    link: string;
    editable?: boolean;
    uploading?: boolean;
    label: string;
    rootClass: string;
    /** Recommended image size when editable (e.g. "320×450 px") */
    recommendedSize?: string;
  }>(),
  { editable: false, uploading: false },
);

const emit = defineEmits<{
  "update:link": [value: string];
  selectImage: [file: File];
}>();

const tag = computed(() => (!props.editable && props.link ? "a" : "div"));

const linkProps = computed(() => {
  if (tag.value !== "a") return {};
  const href = props.link;
  const external = /^https?:\/\//i.test(href);
  return {
    href,
    ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
  };
});

function onZoneClick() {
  if (props.editable) triggerFileInput();
}

function triggerFileInput() {
  const input = document.getElementById(`slider-upload-${props.side}`) as HTMLInputElement | null;
  input?.click();
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) emit("selectImage", file);
  target.value = "";
}
</script>

<template>
  <component
    :is="tag"
    v-bind="linkProps"
    class="rounded-md bg-neutral-100 overflow-hidden relative group block border border-muted shadow-sm"
    :class="[rootClass, { 'bg-cover bg-center': imageUrl }]"
    :style="imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined"
    @click="editable ? onZoneClick() : undefined">
    <div v-if="!imageUrl" class="flex h-full w-full items-center justify-center">
      <UIcon name="i-lucide-image" class="text-neutral-400 text-2xl" />
    </div>

    <div
      v-if="editable"
      class="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 flex items-end"
      @click.stop>
      <div class="w-full space-y-2 p-3" @click.stop>
        <UInput
          :model-value="link"
          size="xs"
          placeholder="Lien du slider (optionnel)"
          @update:model-value="emit('update:link', $event)" />
        <div class="flex items-center justify-between gap-2">
          <UButton
            color="neutral"
            variant="soft"
            size="xs"
            icon="i-lucide-upload-cloud"
            :label="uploading ? 'Téléchargement…' : 'Choisir une image'"
            :loading="uploading"
            @click.stop="triggerFileInput" />
          <span class="text-[11px] text-neutral-200">{{ label }}</span>
        </div>
      </div>
    </div>

    <input v-if="editable" :id="`slider-upload-${side}`" type="file" class="hidden" accept="image/*" @change="onFileChange" />
  </component>
  <p v-if="editable && recommendedSize" class="mt-1.5 text-[11px] text-neutral-500">Image recommandée : {{ recommendedSize }}</p>
</template>
