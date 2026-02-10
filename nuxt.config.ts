// https://nuxt.com/docs/api/configuration/nuxt-config
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true'
const baseURL = isGitHubPages ? '/fin-manager/' : '/'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,

  modules: [
    '@pinia/nuxt',
    '@nuxt/icon',
    '@vueuse/nuxt',
    '@vite-pwa/nuxt'
  ],

  css: ['~/assets/scss/main.scss'],

  app: {
    baseURL,
    head: {
      title: 'Финансовый менеджер',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'theme-color', content: '#1a1a2e' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
      ],
      link: [
        { rel: 'apple-touch-icon', href: `${baseURL}apple-touch-icon.png` }
      ]
    }
  },

  pwa: {
    registerType: 'autoUpdate',
    scope: baseURL,
    base: baseURL,
    manifest: {
      name: 'Финансовый менеджер',
      short_name: 'Расходы',
      description: 'Приложение для учета повседневных расходов',
      theme_color: '#1a1a2e',
      background_color: '#0f0f1a',
      display: 'standalone',
      orientation: 'portrait',
      scope: baseURL,
      start_url: baseURL,
      icons: [
        {
          src: 'icon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: isGitHubPages ? '/fin-manager/' : '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.iconify\.design\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'iconify-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    },
    client: {
      installPrompt: true
    },
    devOptions: {
      enabled: true,
      type: 'module'
    }
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "variables" as *;`,
          api: 'modern-compiler',
          loadPaths: ['./app/assets/scss']
        }
      }
    }
  }
})
