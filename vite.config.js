import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 15000000,
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
      devOptions: {
        enabled: true
      },
      manifest: {
        id: '/?source=pwa',
        name: 'Information Technology ERP',
        short_name: 'IT ERP',
        description: 'Manage student attendance efficiently.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        dir: 'ltr',
        categories: ['education', 'productivity'],
        launch_handler: {
          client_mode: ['navigate-existing', 'auto']
        },
        shortcuts: [
          {
            name: 'Attendance',
            short_name: 'Attendance',
            description: 'Mark or view attendance',
            url: '/attendance',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
          }
        ],
        screenshots: [
          {
            src: '/screenshot-mobile.png',
            sizes: '1080x1920',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Attendance ERP Mobile Home'
          },
          {
            src: '/screenshot-desktop.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Attendance ERP Desktop Dashboard'
          }
        ],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
