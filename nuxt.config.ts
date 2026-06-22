// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [// '@nuxt/fonts',
  "@nuxt/eslint", "@nuxt/ui", "@nuxt/image", "@nuxtjs/device", "@nuxtjs/i18n", "@vueuse/nuxt", "nuxt-swiper"],

  routeRules: {
    "/": { prerender: false },
    "/**": {
      prerender: false,
      cache: false,
    },
  },

  colorMode: {
    preference: "light",
    fallback: "light",
  },

  devtools: {
    enabled: true,
  },

  fonts: {
    families: [{ name: "Space Grotesk", provider: "google" }],
  },

  css: ["~/assets/css/main.css"],

  routeRules: {
    "/": { prerender: true },
  },

  compatibilityDate: "2025-01-15",

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api",
    },
  },

  // Enable credentials for Sanctum cookie-based authentication
  nitro: {
    routeRules: {
      "/api/**": {
        cors: true,
        headers: {
          "Access-Control-Allow-Credentials": "true",
        },
      },
    },
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: "never",
        braceStyle: "1tbs",
      },
    },
  },

  routeRules: {
    "/**": {
      cache: false,
    },
  },
});