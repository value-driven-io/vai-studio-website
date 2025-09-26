// src/i18n/config.js
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import language files
import en from '../locales/en.json'
import fr from '../locales/fr.json'
import es from '../locales/es.json'
import de from '../locales/de.json'
import it from '../locales/it.json'
import ty from '../locales/ty.json'
import zh from '../locales/zh.json'  // Chinese
import ja from '../locales/ja.json'  // Japanese  

// Language resources (starting with 2 languages)
const resources = {
  fr: { translation: fr },
  en: { translation: en },
  es: { translation: es },  // Spanish
  de: { translation: de },  // German
  it: { translation: it },  // Italian
  ty: { translation: ty },  // Tahitian
  zh: { translation: zh },  // Chinese
  ja: { translation: ja }   // Japanese
}

// Supported languages - automatically derived from resources
const supportedLanguages = Object.keys(resources)

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: {
      'es': ['en', 'fr'],     // Spanish → English → French
      'de': ['en', 'fr'],     // German → English → French
      'it': ['en', 'fr'],     // Italian → English → French
      'ty': ['fr', 'en'],     // Tahitian → French → English
      'zh': ['en', 'fr'],     // Chinese → English → French
      'ja': ['en', 'fr'],     // Japanese → English → French
      'en': ['fr'],           // English → French
      'default': ['fr', 'en'] // Any other language → French → English
    },
    supportedLngs: supportedLanguages,
    
    // Language detection with localStorage persistence
    lng: localStorage.getItem('vai_language') || 'fr', // French default
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },

    returnEmptyString: false,  // Don't return empty strings for missing keys
    returnNull: false,         // Don't return null for missing keys
    
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
        console.warn(`🌍 Missing translation key: ${key} for language: ${lng} - falling back`)
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
      'component': 'tourist_app',
      'timestamp': new Date().toISOString()
    })
  }
})

export default i18n
export { supportedLanguages }