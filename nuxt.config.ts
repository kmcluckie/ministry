// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/eslint', '@nuxt/test-utils', '@nuxtjs/supabase', '@vite-pwa/nuxt'],

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/register']
    }
  },

  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/'
    },
    manifest: {
      name: 'Ministry App',
      short_name: 'Ministry',
      theme_color: '#4c646e',
      background_color: '#FCFAF5'
    }
  },

  css: ['~/assets/css/main.css'],

  ssr: false,

  alias: {
    '~/shared': './shared'
  },

  compatibilityDate: '2025-07-16',
})