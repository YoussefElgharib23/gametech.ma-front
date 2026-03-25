<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});
</script>

<template>
  <UDashboardPanel id="profile">
    <template #body>
      <div class="space-y-2">
        <h1 class="text-lg font-semibold tracking-tight text-neutral-900">
          Profil
        </h1>
        <p class="text-sm text-neutral-500">
          Informations du compte administrateur.
        </p>
      </div>
    </template>
  </UDashboardPanel>
</template>
