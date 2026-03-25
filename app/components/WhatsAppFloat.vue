<script setup lang="ts">
const { storeSettings } = useStoreSettings();

function whatsappHref(raw: string | undefined): string | null {
  const v = (raw ?? "").trim();
  if (!v) return null;

  // If user saved a full URL (https://wa.me/... or https://api.whatsapp.com/...)
  if (/^https?:\/\//i.test(v)) {
    return v;
  }

  // Otherwise treat it as a phone number and build a wa.me link
  const digits = v.replace(/[^\d+]/g, "");
  if (!digits) return null;

  let normalized = digits;
  if (normalized.startsWith("+")) {
    normalized = normalized.slice(1);
  }

  // Common Morocco normalization: 0XXXXXXXXX -> 212XXXXXXXXX
  if (normalized.startsWith("0")) {
    normalized = `212${normalized.slice(1)}`;
  }

  return `https://wa.me/${normalized}`;
}

const href = computed(() => whatsappHref(storeSettings.value.socials_whatsapp));
</script>

<template>
  <a
    v-if="href"
    :href="href"
    target="_blank"
    rel="noopener"
    aria-label="Contacter sur WhatsApp"
    class="fixed bottom-5 right-5 z-60 group"
  >
    <span
      class="absolute -inset-2 rounded-full bg-green-500/20 blur-md opacity-0 transition-opacity duration-200 group-hover:opacity-100"
    />

    <span
      class="relative inline-flex items-center justify-center size-14 rounded-full bg-green-500 shadow-lg ring-1 ring-white/15 transition-transform duration-200 group-hover:scale-[1.03] active:scale-[0.98]"
    >
      <!-- WhatsApp SVG (provided) -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 512 512"
        class="size-8"
        aria-hidden="true"
      >
        <path
          style="fill: #ededed"
          d="M0,512l35.31-128C12.359,344.276,0,300.138,0,254.234C0,114.759,114.759,0,255.117,0  S512,114.759,512,254.234S395.476,512,255.117,512c-44.138,0-86.51-14.124-124.469-35.31L0,512z"
        />
        <path
          style="fill: #55cd6c"
          d="M137.71,430.786l7.945,4.414c32.662,20.303,70.621,32.662,110.345,32.662  c115.641,0,211.862-96.221,211.862-213.628S371.641,44.138,255.117,44.138S44.138,137.71,44.138,254.234  c0,40.607,11.476,80.331,32.662,113.876l5.297,7.945l-20.303,74.152L137.71,430.786z"
        />
        <path
          style="fill: #fefefe"
          d="M187.145,135.945l-16.772-0.883c-5.297,0-10.593,1.766-14.124,5.297  c-7.945,7.062-21.186,20.303-24.717,37.959c-6.179,26.483,3.531,58.262,26.483,90.041s67.09,82.979,144.772,105.048  c24.717,7.062,44.138,2.648,60.028-7.062c12.359-7.945,20.303-20.303,22.952-33.545l2.648-12.359  c0.883-3.531-0.883-7.945-4.414-9.71l-55.614-25.6c-3.531-1.766-7.945-0.883-10.593,2.648l-22.069,28.248  c-1.766,1.766-4.414,2.648-7.062,1.766c-15.007-5.297-65.324-26.483-92.69-79.448c-0.883-2.648-0.883-5.297,0.883-7.062  l21.186-23.834c1.766-2.648,2.648-6.179,1.766-8.828l-25.6-57.379C193.324,138.593,190.676,135.945,187.145,135.945"
        />
      </svg>
    </span>
  </a>
</template>

