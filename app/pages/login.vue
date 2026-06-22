<script setup lang="ts">
definePageMeta({
  layout: "guest",
  middleware: ["guest"],
});

type FormState = {
  email: string;
  password: string;
  remember: boolean;
};

const { login, isLoading } = useAuth();
const route = useRoute();
const toast = useToast();

const form = reactive<FormState>({
  email: "",
  password: "",
  remember: false,
});

const showPassword = ref(false);

const handleLogin = async () => {
  const { success, error } = await login({
    email: form.email,
    password: form.password,
    device_name: "Dashboard",
  });

  if (success) {
    toast.add({
      title: "Succès",
      description: "Connexion réussie !",
      color: "success",
    });

    // Redirect to intended page or dashboard
    const redirect = route.query.redirect as string;
    await navigateTo(redirect || "/dashboard");
  } else {
    toast.add({
      title: "Erreur",
      description: error || "Identifiants invalides.",
      color: "error",
    });
  }
};
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold text-neutral-900">
            Connexion Dashboard
          </h1>
          <p class="mt-2 text-sm text-neutral-500">
            Connectez-vous pour accéder à l'administration
          </p>
        </div>
      </template>

      <UForm
        :state="form"
        class="space-y-4"
        @submit="handleLogin"
      >
        <UFormField
          label="Email"
          name="email"
          required
        >
          <UInput
            v-model="form.email"
            type="email"
            placeholder="admin@gametech.ma"
            icon="i-lucide-mail"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Mot de passe"
          name="password"
          required
        >
          <UInput
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            icon="i-lucide-lock"
            size="lg"
            class="w-full"
            :ui="{
              trailing: 'pr-0.5'
            }"
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <div class="flex items-center justify-between">
          <UCheckbox
            v-model="form.remember"
            label="Se souvenir de moi"
          />
        </div>

        <UButton
          type="submit"
          color="primary"
          size="lg"
          block
          :loading="isLoading"
          :disabled="isLoading"
        >
          Se connecter
        </UButton>
      </UForm>

      <template #footer>
        <p class="text-center text-xs text-neutral-400">
          Gametech.ma Dashboard — Accès réservé aux administrateurs
        </p>
      </template>
    </UCard>
  </div>
</template>
