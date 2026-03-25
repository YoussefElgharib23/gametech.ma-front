<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

defineProps<{
  collapsed?: boolean;
}>();

const teams = ref([
  {
    label: "Nuxt",
    avatar: {
      src: "https://github.com/nuxt.png",
      alt: "Nuxt",
    },
  },
  {
    label: "NuxtHub",
    avatar: {
      src: "https://github.com/nuxt-hub.png",
      alt: "NuxtHub",
    },
  },
  {
    label: "NuxtLabs",
    avatar: {
      src: "https://github.com/nuxtlabs.png",
      alt: "NuxtLabs",
    },
  },
]);
const selectedTeam = ref(teams.value[0]);

const items = computed<DropdownMenuItem[][]>(() => {
  return [
    teams.value.map((team) => ({
      ...team,
      onSelect() {
        selectedTeam.value = team;
      },
    })),
    [
      {
        label: "Create team",
        icon: "i-lucide-circle-plus",
      },
      {
        label: "Manage teams",
        icon: "i-lucide-cog",
      },
    ],
  ];
});
</script>

<template>
  <NuxtLink to="/" class="flex w-full hover:bg-gray-100 rounded-md p-2 duration-300">
    <NuxtImg src="/imgs/logo.jpg" alt="GameTech" class="h-4 mx-auto shrink-0 mix-blend-multiply" />
  </NuxtLink>
</template>
