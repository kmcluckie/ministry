// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  app: {
    head: {
      meta: [
        { 
          name: 'viewport', 
          content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        }
      ]
    }
  },

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
      background_color: '#FCFAF5',
      icons: [
        {
          src: '/icon.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  ssr: false,

  alias: {
    '~/shared': './shared'
  },

  compatibilityDate: '2025-07-16',
})