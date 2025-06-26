// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // --- PWA General Settings ---
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],

      // --- Web App Manifest ---
      manifest: {
        name: 'VAI Tickets - Discover French Polynesia',
        short_name: 'VAI Tickets',
        description: 'Last-minute tour bookings in French Polynesia',
        theme_color: '#3b82f6',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          // Note: Combined the two 512x512 icons. The 'any maskable' purpose is sufficient.
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshot-wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: 'screenshot-narrow.png',
            sizes: '750x1334',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ],
        categories: ['travel', 'lifestyle', 'navigation'],
        shortcuts: [
          {
            name: 'Discover Tours',
            url: '/',
            icons: [{ src: 'shortcut-discover.png', sizes: '192x192' }]
          },
          {
            name: 'My Bookings',
            url: '/bookings',
            icons: [{ src: 'shortcut-bookings.png', sizes: '192x192' }]
          }
        ]
      },

      // --- Service Worker Configuration (Workbox) ---
      workbox: {
        // Pre-cache these assets when the service worker is installed.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}'],

        // Define runtime caching strategies for dynamic content.
        runtimeCaching: [
          {
            // Cache Supabase API calls
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 5 // 5 minutes
              },
              // ** THE FIX IS HERE **
              // Custom logic must be wrapped in a `plugins` array.
              plugins: [
                {
                  cacheKeyWillBeUsed: async ({ request }) => {
                    // Cache API calls in 5-minute blocks to reduce churn
                    return `${request.url}_${Math.floor(Date.now() / 1000 / 300)}`;
                  }
                }
              ]
            }
          },
          {
            // Cache Supabase Storage assets (images, etc.)
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-storage-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      }
    })
  ],

  // --- Polyfill for libraries that use 'global' ---
  define: {
    global: 'globalThis',
  },

  define: {
    'process.env': process.env
  },

  // --- Development Server Settings ---
  server: {
    host: '0.0.0.0', // Accessible on your local network
    port: 3001
  },

  // --- Production Build Settings ---
  build: {
    sourcemap: true
  }
});