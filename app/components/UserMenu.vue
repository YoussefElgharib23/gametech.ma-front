<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

defineProps<{
  collapsed?: boolean;
}>();

const user = ref({
  name: "Benjamin Canac",
  avatar: {
    src: "https://github.com/benjamincanac.png",
    alt: "Benjamin Canac",
  },
});

const token = useCookie<string | null>("token", { default: () => null });

async function handleLogout() {
  try {
    await $apiFetch("/auth/logout", { method: "POST" });
  } catch {
    /* token may already be invalid */
  }
  token.value = null;
  await navigateTo("/");
}

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: "label",
      label: user.value.name,
      avatar: user.value.avatar,
    },
  ],
  [
    {
      label: "Profil",
      icon: "i-lucide-user",
      to: "/dashboard/profile",
    },
    {
      label: "Paramètres",
      icon: "i-lucide-settings",
      to: "/dashboard/settings",
    },
  ],
  [
    {
      label: "Déconnexion",
      icon: "i-lucide-log-out",
      onSelect: () => {
        void handleLogout();
      },
    },
  ],
]);
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }">
    <UButton
      v-bind="{
        ...user,
        label: collapsed ? undefined : user?.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down',
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed',
      }" />
  </UDropdownMenu>
</template>
