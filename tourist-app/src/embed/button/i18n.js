/**
 * VAI Embed Widget - Internationalization Module
 * Supports: English (default), French
 *
 * Detects user's browser language and returns appropriate translations
 * Falls back to English if language not supported
 */

const translations = {
  en: {
    close: 'Close',
    loading: 'Loading...',
    error: 'Connection failed. Please try again.',
    bookingComplete: 'Booking confirmed!'
  },
  fr: {
    close: 'Fermer',
    loading: 'Chargement...',
    error: 'Échec de connexion. Veuillez réessayer.',
    bookingComplete: 'Réservation confirmée !'
  }
};

/**
 * Detects user's preferred language from browser
 * @returns {string} Language code ('en' or 'fr')
 */
function getLanguage() {
  const lang = navigator.language.toLowerCase();

  // Check for French variants (fr, fr-FR, fr-CA, etc.)
  if (lang.startsWith('fr')) {
    return 'fr';
  }

  // Default to English
  return 'en';
}

/**
 * Get translated string for given key
 * @param {string} key - Translation key
 * @returns {string} Translated string
 */
export const t = (key) => {
  const lang = getLanguage();
  return translations[lang]?.[key] || translations.en[key] || key;
};

/**
 * Get current language code
 * @returns {string} Current language code
 */
export const getCurrentLanguage = () => getLanguage();
