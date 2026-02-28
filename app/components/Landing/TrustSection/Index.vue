<script setup lang="ts">
const trustItems = [
  {
    icon: "i-lucide-shield-check",
    title: "PAIEMENT SÉCURISÉ",
    description:
      "Paiement 100% sécurisé par carte bancaire ou à la livraison. Vos données sont protégées.",
  },
  {
    icon: "i-lucide-truck",
    title: "LIVRAISON RAPIDE",
    description:
      "Livraison express partout au Maroc. Retours faciles sous 14 jours si vous n'êtes pas satisfait.",
  },
  {
    icon: "i-lucide-headphones",
    title: "HOTLINE",
    description:
      "Équipe support à votre écoute et FAQ pour répondre à toutes vos questions.",
  },
  {
    icon: "i-lucide-smartphone",
    title: "SITE RESPONSIVE À 100%",
    description:
      "Commandez depuis n'importe quel appareil. Notre site s'adapte à votre écran.",
  },
];
</script>

<template>
  <UContainer class="py-10">
    <div class="bg-neutral-50 rounded-xl p-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="item in trustItems"
          :key="item.title"
          class="flex flex-col items-center text-center bg-white/90 rounded-lg p-3"
        >
          <UIcon :name="item.icon" class="size-7 text-primary mb-3" />
          <h3 class="font-semibold text-default uppercase tracking-wide mb-2">
            {{ item.title }}
          </h3>
          <p class="text-sm text-neutral-600">
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </UContainer>
</template>
