<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import * as z from "zod";

definePageMeta({
  layout: false,
});

type Schema = z.output<typeof schema>;

const schema = z.object({
  email: z.string().email("Email invalide."),
  password: z.string().min(1, "Mot de passe requis."),
});

const token = useCookie<string | null>("token", { default: () => null });
const toast = useToast();

const state = reactive<z.input<typeof schema>>({
  email: "",
  password: "",
});

const formRef = useTemplateRef("formRef");
const loading = ref(false);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;
  formRef.value?.setErrors([]);
  try {
    const data = event.data;

    const res = await $apiFetch<{
      token: string;
      user: { id: number; name: string; email: string };
    }>("/auth/login", {
      method: "POST",
      body: {
        email: data.email.trim(),
        password: data.password,
        device_name: "dashboard",
      },
    });

    token.value = res.token;

    toast.add({
      title: "Connecté",
      description: `Bienvenue ${res.user.name}`,
      color: "success",
    });

    await navigateTo("/dashboard");
  } catch (error: any) {
    toast.add({
      title: "Connexion impossible",
      description: error?.data?.message ?? "Vérifiez vos identifiants.",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="mx-auto w-full p-4">
    <div class="overflow-hidden rounded-xl shadow border border-neutral-200 bg-white">
      <div class="grid md:grid-cols-2">
        <!-- Left: marketing panel -->
        <div class="relative hidden md:flex flex-col p-10 bg-brand-dark-950 text-brand-dark-50">
          <div class="absolute inset-0 bg-linear-to-br from-brand-dark-950 via-brand-dark-900 to-brand-dark-950" />
          <div class="absolute inset-0 opacity-10 hero-grid-bg" />

          <div class="relative z-10 flex items-center gap-2 text-lg font-semibold">
            <UIcon name="i-lucide-store" class="h-5 w-5" />
            <span>GameTech</span>
          </div>

          <div class="relative z-10 mt-auto">
            <blockquote class="text-sm leading-relaxed text-brand-dark-200 text-balance">
              “Accédez au tableau de bord pour gérer vos produits, commandes et paramètres de la boutique.”
            </blockquote>
          </div>
        </div>

        <!-- Right: form -->
        <div class="flex items-center justify-center p-6 md:p-10 lg:h-[calc(100dvh-64px)]">
          <div class="w-full max-w-sm space-y-6">
            <div class="text-center space-y-2">
              <NuxtImg src="/imgs/logo.jpg" alt="GameTech" class="h-6 w-auto mx-auto" />

              <h1 class="text-2xl font-semibold tracking-tight text-neutral-900">Connexion</h1>
              <p class="text-sm text-neutral-500">Connectez-vous avec votre email et mot de passe.</p>
            </div>

            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
              <UFormField label="Email" name="email" required>
                <UInput v-model="state.email" type="email" placeholder="admin@gametech.ma" autocomplete="email" size="lg" />
              </UFormField>

              <UFormField label="Mot de passe" name="password" required>
                <UInput
                  v-model="state.password"
                  type="password"
                  placeholder="••••••••"
                  autocomplete="current-password"
                  size="lg" />
              </UFormField>

              <UButton
                type="submit"
                block
                size="lg"
                color="primary"
                :loading="loading"
                icon="i-lucide-log-in"
                label="Se connecter" />

              <div class="max-w-[180px] mx-auto">
                <USeparator />

                <NuxtLink to="/" class="text-center text-xs text-primary-400 w-full flex items-center justify-center gap-1 mt-2">
                  <UIcon name="i-lucide-arrow-left" class="h-4 w-4" />
                  Retour à l'accueil
                </NuxtLink>
              </div>
            </UForm>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-grid-bg {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.5) 1px, transparent 1px);
  background-size: 44px 44px;
}
</style>
