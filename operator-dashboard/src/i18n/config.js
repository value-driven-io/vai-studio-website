// src/i18n/config.js
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import all language files
import en from '../locales/en.json'
import fr from '../locales/fr.json'
import ty from '../locales/ty.json'  // Tahitian
import de from '../locales/de.json'  // German
import es from '../locales/es.json'  // Spanish
import zh from '../locales/zh.json'  // Chinese

// Language resources
const resources = {
  en: { translation: en },
  fr: { translation: fr },
  ty: { translation: ty },
  de: { translation: de },
  es: { translation: es },
  zh: { translation: zh }
}

// Supported languages - automatically derived from resources
const supportedLanguages = Object.keys(resources)

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr', // French as default for French Polynesia
    supportedLngs: supportedLanguages,
    
    // Language detection with localStorage persistence
    lng: localStorage.getItem('vai_language') || 'fr',
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    // Development settings
    debug: process.env.NODE_ENV === 'development',
    
    // Loading settings
    react: {
      useSuspense: false, // Prevents loading issues
    },
    
    // Missing key handling for development
    saveMissing: process.env.NODE_ENV === 'development',
    missingKeyHandler: (lng, ns, key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`🌍 Missing translation key: ${key} for language: ${lng}`)
      }
    },
    
    // Automatically save language preference changes
    detection: {
      caches: ['localStorage']
    }
  })

// Listen for language changes and save to localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('vai_language', lng)
  
  // Optional: Send analytics
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'language_change', {
      'new_language': lng,
      'timestamp': new Date().toISOString()
    })
  }
})

export default i18n
export { supportedLanguages }