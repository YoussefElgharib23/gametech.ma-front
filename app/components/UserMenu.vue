<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

defineProps<{
  collapsed?: boolean;
}>();

const { user, logout } = useAuth();

// Use actual user data from auth composable or fallback
const displayUser = computed(() => ({
  name: user.value?.name || "Utilisateur",
  avatar: {
    src: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.value?.name || "User")}&background=0D8ABC&color=fff`,
    alt: user.value?.name || "Utilisateur",
  },
}));

async function handleLogout() {
  await logout();
}

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: "label",
      label: displayUser.value.name,
      avatar: displayUser.value.avatar,
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
        ...displayUser,
        label: collapsed ? undefined : displayUser?.name,
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
