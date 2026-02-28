<script setup lang="ts">
const brands = [
  { name: 'ASUS', icon: 'i-simple-icons-asus', color: '#00539B', href: '#' },
  { name: 'Logitech', icon: 'i-simple-icons-logitech', color: '#00B8FC', href: '#' },
  { name: 'NVIDIA', icon: 'i-simple-icons-nvidia', color: '#76B900', href: '#' },
  { name: 'AMD', icon: 'i-simple-icons-amd', color: '#ED1C24', href: '#' },
  { name: 'Intel', icon: 'i-simple-icons-intel', color: '#0071C5', href: '#' },
  { name: 'Corsair', icon: 'i-simple-icons-corsair', color: '#F00000', href: '#' },
  { name: 'Razer', icon: 'i-simple-icons-razer', color: '#00FF00', href: '#' },
  { name: 'MSI', icon: 'i-simple-icons-msi', color: '#FF0000', href: '#' },
  { name: 'Gigabyte', icon: 'i-simple-icons-gigabyte', color: '#E60012', href: '#' },
  { name: 'EVGA', icon: 'i-simple-icons-evga', color: '#292929', href: '#' },
  { name: 'Cooler Master', icon: 'i-simple-icons-coolermaster', color: '#E83E2B', href: '#' },
  { name: 'Kingston', icon: 'i-simple-icons-kingston', color: '#ED1C24', href: '#' },
  { name: 'G.Skill', icon: 'i-simple-icons-gskill', color: '#CC0000', href: '#' },
  { name: 'Seagate', icon: 'i-simple-icons-seagate', color: '#6AB2DF', href: '#' },
  { name: 'Western Digital', icon: 'i-simple-icons-westerndigital', color: '#0078D4', href: '#' }
]
</script>

<template>
  <UContainer class="py-8">
    <h2 class="text-lg font-semibold text-default mb-6">
      Nos marques
    </h2>
    <div
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
    >
      <NuxtLink
        v-for="brand in brands"
        :key="brand.name"
        :to="brand.href"
        class="flex flex-col items-center justify-center gap-2"
      >
        <UIcon
          :name="brand.icon"
          class="size-10"
          :style="{ color: brand.color }"
          aria-hidden
        />
        <span class="text-sm font-medium text-neutral-700">
          {{ brand.name }}
        </span>
      </NuxtLink>
    </div>
  </UContainer>
</template>
