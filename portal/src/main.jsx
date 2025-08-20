import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Import i18n configuration
import './utils/i18n.js'

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Vite PWA plugin will handle this automatically
    console.log('🔧 Service Worker support detected')
  })
}

// Test Supabase connection on load
import { testConnection } from './utils/supabase.js'
testConnection()

// PWA install prompt handling
let deferredPrompt
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('💫 PWA install prompt available')
  deferredPrompt = e
  // You can show your own install button here
})

window.addEventListener('appinstalled', () => {
  console.log('🎉 PWA was installed')
  deferredPrompt = null
})

// Global error handling
window.addEventListener('error', (e) => {
  console.error('❌ Global error:', e.error)
})

window.addEventListener('unhandledrejection', (e) => {
  console.error('❌ Unhandled promise rejection:', e.reason)
})

// Performance monitoring
if (import.meta.env.DEV) {
  console.log('🚀 VAI Client Portal - Development Mode')
  
  // Log performance metrics in development
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0]
    console.log('📊 Load Performance:', {
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
      loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
      totalTime: perfData.loadEventEnd - perfData.fetchStart
    })
  })
}

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)