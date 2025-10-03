/* ========================================
   VAI PLATFORM - i18n IMPLEMENTATION
   Simple language switcher for EN/FR
   ======================================== */

// Current language (default: English)
let currentLang = localStorage.getItem('vai-platform-lang') || 'en';

// Translation data will be loaded from JSON files
let translations = {};

// Load translation file
async function loadTranslations(lang) {
    try {
        const response = await fetch(`/presentation/VAI/platform/i18n/${lang}.json`);
        if (!response.ok) {
            console.warn(`Translation file for ${lang} not found, falling back to English`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`Error loading translations for ${lang}:`, error);
        return null;
    }
}

// Apply translations to page
function applyTranslations(data) {
    if (!data) return;

    // Find all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getNestedTranslation(data, key);

        if (translation) {
            // Handle different element types
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.placeholder) {
                    element.placeholder = translation;
                }
            } else {
                element.textContent = translation;
            }
        }
    });
}

// Get nested translation using dot notation (e.g., "nav.overview")
function getNestedTranslation(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Switch language
async function switchLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('vai-platform-lang', lang);

    // Load and apply translations
    const data = await loadTranslations(lang);
    if (data) {
        translations[lang] = data;
        applyTranslations(data);
    }

    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Update active state on language switcher buttons
    updateLanguageSwitcher();
}

// Update language switcher UI
function updateLanguageSwitcher() {
    const languageButtons = document.querySelectorAll('.lang-switch-btn');
    languageButtons.forEach(btn => {
        if (btn.dataset.lang === currentLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Initialize language switcher
function initLanguageSwitcher() {
    // Create language switcher HTML
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    const languageSwitcher = document.createElement('div');
    languageSwitcher.className = 'language-switcher';
    languageSwitcher.innerHTML = `
        <button class="lang-switch-btn ${currentLang === 'en' ? 'active' : ''}" data-lang="en" aria-label="Switch to English">
            EN
        </button>
        <button class="lang-switch-btn ${currentLang === 'fr' ? 'active' : ''}" data-lang="fr" aria-label="Switch to French">
            FR
        </button>
    `;

    navActions.appendChild(languageSwitcher);

    // Add click handlers
    const buttons = languageSwitcher.querySelectorAll('.lang-switch-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            if (lang !== currentLang) {
                switchLanguage(lang);
            }
        });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize language switcher UI
    initLanguageSwitcher();

    // Load and apply current language
    if (currentLang !== 'en') {
        // Load translations for current language
        const data = await loadTranslations(currentLang);
        if (data) {
            translations[currentLang] = data;
            applyTranslations(data);
        }
    }
});

console.log('VAI Platform i18n initialized');
