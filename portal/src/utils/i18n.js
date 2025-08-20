import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Translation resources
import enTranslations from '../locales/en.json'
import frTranslations from '../locales/fr.json'

const resources = {
  en: {
    translation: enTranslations
  },
  fr: {
    translation: frTranslations
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    
    // Language detection options
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'vai_portal_language',
      caches: ['localStorage'],
      excludeCacheFor: ['cimode'] // don't cache in CI mode
    },
    
    // Fallback language
    fallbackLng: 'fr',
    
    // Supported languages
    supportedLngs: ['fr', 'en'],
    
    // Non-explicit supported languages
    nonExplicitSupportedLngs: true,
    
    // Debug mode (disable in production)
    debug: import.meta.env.DEV,
    
    // Interpolation options
    interpolation: {
      escapeValue: false // React already does escaping
    },
    
    // React options
    react: {
      useSuspense: false
    }
  })

export default i18n