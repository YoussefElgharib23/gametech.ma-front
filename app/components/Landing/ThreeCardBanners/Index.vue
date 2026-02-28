<script setup lang="ts"></script>

<template>
  <UContainer class="py-8">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div
        v-for="i in 3"
        :key="i"
        class="bg-neutral-100 rounded-lg flex items-center justify-center aspect-square shadow-sm border border-neutral-200"
      >
        <UIcon name="i-lucide-image" class="text-neutral-400 text-2xl" />
      </div>
    </div>
  </UContainer>
</template>
