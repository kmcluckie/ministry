// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/eslint', '@nuxt/test-utils', '@nuxtjs/supabase'],

  css: ['~/assets/css/main.css'],

  ssr: false,

  alias: {
    '~/shared': './shared'
  },

  compatibilityDate: '2025-07-16',
})