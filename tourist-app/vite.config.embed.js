/**
 * Vite Configuration - Embed Widget Build
 *
 * Builds the embed widget as a standalone script:
 * - Single file output (button.js)
 * - Inline CSS
 * - Minified for production
 * - Source maps for debugging
 * - Target: <12KB gzipped
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Build configuration
  build: {
    // Output directory
    outDir: 'dist/embed',
    emptyOutDir: true,

    // Library mode
    lib: {
      entry: resolve(__dirname, 'src/embed/button/index.js'),
      name: 'VAI',
      formats: ['iife'], // Immediately Invoked Function Expression
      fileName: () => 'button.js'
    },

    // Rollup options
    rollupOptions: {
      // No external dependencies - bundle everything
      external: [],

      output: {
        // Inline all assets (CSS)
        inlineDynamicImports: true,

        // Compact output
        compact: true,

        // Banner comment
        banner: '/* VAI Embed Widget v1.0.0 | (c) 2025 VAI Studio | https://vai.studio */',

        // Preserve license comments
        preserveEntrySignatures: 'strict'
      }
    },

    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console.log for analytics stub
        drop_debugger: true,
        pure_funcs: [], // Don't remove any functions
        passes: 2
      },
      mangle: {
        properties: false // Don't mangle property names
      },
      format: {
        comments: /^!|@preserve|@license|@cc_on/i // Preserve license comments
      }
    },

    // Source maps
    sourcemap: true,

    // Target modern browsers (ES2020+)
    target: 'es2020',

    // CSS options
    cssCodeSplit: false, // Inline all CSS
    cssMinify: true,

    // Chunk size warnings
    chunkSizeWarningLimit: 15, // Warn if bundle > 15KB (target is 12KB)

    // Asset handling
    assetsInlineLimit: 100000, // Inline all assets (100KB limit)

    // Report compressed size
    reportCompressedSize: true
  },

  // Define environment variables
  define: {
    'import.meta.env.EMBED_VERSION': JSON.stringify('1.0.0'),
    '__EMBED_BUILD__': true
  },

  // Plugins (none needed for embed build)
  plugins: [],

  // Resolve aliases
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@embed': resolve(__dirname, 'src/embed'),
      '@lib': resolve(__dirname, 'src/lib')
    }
  },

  // Server config (for development)
  server: {
    port: 5174, // Different port from main app (5173)
    strictPort: true,
    open: '/demo.html' // Open demo page
  },

  // Preview config (for testing production build)
  preview: {
    port: 4174,
    strictPort: true
  }
});
