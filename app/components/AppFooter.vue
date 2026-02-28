<script setup lang="ts">
const productLinks = [
  { label: "Catégories", href: "#" },
  { label: "Promotions", href: "#" },
  { label: "Nouveautés", href: "#" },
  { label: "PC Configurateur", href: "#" },
];

const companyLinks = [
  { label: "Contact", href: "#" },
  { label: "FAQ", href: "#" },
  { label: "Blog", href: "#" },
  { label: "À propos", href: "#" },
];

const legalLinks = [
  { label: "CGV", href: "#" },
  { label: "Confidentialité", href: "#" },
];

const socialLinks = [
  {
    icon: "i-lucide-instagram",
    href: "https://instagram.com",
    label: "Instagram",
  },
  { icon: "i-lucide-twitter", href: "https://twitter.com", label: "Twitter" },
  {
    icon: "i-lucide-linkedin",
    href: "https://linkedin.com",
    label: "LinkedIn",
  },
];
</script>

<template>
  <footer
    class="w-full border-t border-neutral-200 bg-background text-foreground"
  >
    <UContainer class="pb-6">
      <div
        class="flex flex-col items-start justify-between gap-8 py-4 md:flex-row lg:py-8"
      >
        <div class="w-full md:w-auto">
          <NuxtLink to="/" class="flex items-center gap-2">
            <AppLogo class="h-8 w-auto shrink-0" />
          </NuxtLink>
          <p class="text-sm text-neutral-500 mt-4 max-w-sm">
            Gametech.ma est un magasin informatique spécialisé dans la vente et
            l'achat de matériel informatique au Maroc. Que ce soit des PC de
            bureau, des PC portables ou des PC gamers, ordinateur gamer,
            composants ou périphériques.
          </p>
        </div>

        <div
          class="w-full md:w-auto grid grid-cols-2 gap-8 sm:grid-cols-4 md:flex md:gap-12 lg:gap-16"
        >
          <div class="min-w-[120px]">
            <h3 class="text-neutral-500 text-sm font-semibold">Produit</h3>
            <ul class="mt-4 space-y-3 text-sm">
              <li
                v-for="link in productLinks"
                :key="link.label"
                class="hover:text-primary transition-colors"
              >
                <NuxtLink :to="link.href">
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <div class="min-w-[120px]">
            <h3 class="text-neutral-500 text-sm font-semibold">Entreprise</h3>
            <ul class="mt-4 space-y-3 text-sm">
              <li
                v-for="link in companyLinks"
                :key="link.label"
                class="hover:text-primary transition-colors"
              >
                <NuxtLink :to="link.href">
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <div class="min-w-[120px]">
            <h3 class="text-neutral-500 text-sm font-semibold">Légal</h3>
            <ul class="mt-4 space-y-3 text-sm">
              <li
                v-for="link in legalLinks"
                :key="link.label"
                class="hover:text-primary transition-colors"
              >
                <NuxtLink :to="link.href">
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 class="text-neutral-500 text-sm font-semibold">Réseaux</h3>
            <div class="mt-4 flex gap-4 text-neutral-500">
              <a
                v-for="social in socialLinks"
                :key="social.label"
                :href="social.href"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="social.label"
                class="hover:text-primary transition-colors"
              >
                <UIcon :name="social.icon" class="size-5" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-12 md:mt-16 pt-8 border-t border-neutral-200">
        <p class="text-sm text-neutral-500">
          © {{ new Date().getFullYear() }} Gametech.ma. Tous droits réservés.
        </p>
      </div>
    </UContainer>
  </footer>
</template>
