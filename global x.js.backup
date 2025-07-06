/**
 * VAI Studio - Global JavaScript
 *
 * This file contains scripts that are used across the entire website.
 * It includes utility functions, language switching, navigation controls,
 * and other global functionalities.
 *
 * Contents:
 * 1.  Utility Functions (throttle, SafeStorage, TimerManager)
 * 2.  Language & SEO Management
 * 3.  Global UI Handlers (Navbar, Mobile Menu, Loading Screen)
 * 4.  Global Event Listeners
 */

// =================================================================
// 1. UTILITY FUNCTIONS
// =================================================================

/**
 * Throttles a function to limit how often it can be called.
 * @param {Function} func The function to throttle.
 * @param {number} limit The throttle limit in milliseconds.
 * @returns {Function} The throttled function.
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

/**
 * A safe wrapper for localStorage that handles potential exceptions.
 */
const SafeStorage = {
    setItem: function(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            console.warn('localStorage is not available or has been disabled.');
            return false;
        }
    },
    getItem: function(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn('localStorage is not available or has been disabled.');
            return null;
        }
    }
};

/**
 * A simple class to manage setInterval timers and prevent memory leaks.
 */
class TimerManager {
    constructor() {
        this.timers = new Map();
    }
    startTimer(name, callback, interval) {
        this.clearTimer(name);
        const timerId = setInterval(callback, interval);
        this.timers.set(name, timerId);
        return timerId;
    }
    clearTimer(name) {
        if (this.timers.has(name)) {
            clearInterval(this.timers.get(name));
            this.timers.delete(name);
        }
    }
    clearAllTimers() {
        this.timers.forEach(timerId => clearInterval(timerId));
        this.timers.clear();
    }
}

const timerManager = new TimerManager();

// =================================================================
// 2. LANGUAGE & SEO MANAGEMENT
// =================================================================

/**
 * SEO data for each page in both languages.
 * This centralized object makes it easy to manage and scale.
 */
const seoData = {
    '/': {
        fr: {
            title: 'VAI Studio - Création Sites Web Polynésie Française | Design Web Moorea & Tahiti',
            description: 'Solutions web professionnelles pour entreprises polynésiennes. Sites tourisme, restaurants, systèmes réservation. Qualité internationale, prix locaux - Basé à Moorea.'
        },
        en: {
            title: 'VAI Studio - Web Design French Polynesia | Moorea & Tahiti Digital Solutions',
            description: 'Professional web solutions for French Polynesian businesses. Tourism sites, restaurants, booking systems. International quality, local prices - Based in Moorea.'
        }
    },
    '/services/': {
        fr: {
            title: 'Systèmes Réservation & Solutions Numériques Polynésie Française | Services VAI Studio',
            description: 'Systèmes de réservation professionnels, solutions restaurant et sites touristiques pour entreprises polynésiennes. Préparez votre haute saison avec VAI Studio - basé à Moorea.'
        },
        en: {
            title: 'Booking Systems & Digital Solutions French Polynesia | VAI Studio Services',
            description: 'Professional booking systems, restaurant digital solutions & tourism websites for French Polynesian businesses. Get peak season ready with VAI Studio - based in Moorea.'
        }
    },
    '/contact/': {
        fr: {
            title: 'Contact VAI Studio | Conception Web Polynésie Française - Solutions Numériques Moorea',
            description: 'Contactez VAI Studio pour conception web professionnelle et solutions numériques en Polynésie française. Consultation gratuite, prêt haute saison. Basé à Moorea, service toutes îles.'
        },
        en: {
            title: 'Contact VAI Studio | Web Design French Polynesia - Moorea Digital Solutions',
            description: 'Contact VAI Studio for professional web design and digital solutions in French Polynesia. Free consultation, peak season ready. Based in Moorea, serving all islands.'
        }
    }
};

/**
 * Updates the page's title and meta description based on the selected language.
 * @param {string} lang - The selected language ('fr' or 'en').
 */
function updateSEOForLanguage(lang) {
    const path = window.location.pathname;
    let pageKey = '/'; // Default to homepage
    if (path.includes('/services/')) {
        pageKey = '/services/';
    } else if (path.includes('/contact/')) {
        pageKey = '/contact/';
    }

    const pageSeo = seoData[pageKey];
    if (!pageSeo) return;

    const langSeo = pageSeo[lang];
    if (!langSeo) return;

    const titleTag = document.querySelector('title');
    const descriptionTag = document.querySelector('meta[name="description"]');

    if (titleTag) titleTag.textContent = langSeo.title;
    if (descriptionTag) descriptionTag.setAttribute('content', langSeo.description);
    document.documentElement.setAttribute('lang', lang);
}

/**
 * Switches the website's language.
 * @param {string} lang The target language ('en' or 'fr').
 */
function switchLanguage(lang) {
    if (!['en', 'fr'].includes(lang)) return;

    document.body.setAttribute('data-current-lang', lang);

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.langBtn === lang);
    });

    updateSEOForLanguage(lang);
    SafeStorage.setItem('preferred-language', lang);

    // If on the services page, update the feature toggle button text
    if (typeof updateFeatureToggleLanguage === 'function') {
        updateFeatureToggleLanguage();
    }

    if (typeof gtag !== 'undefined') {
        gtag('event', 'language_switch', {
            'event_category': 'User Interaction',
            'event_label': lang,
            'value': lang === 'fr' ? 1 : 0
        });
    }
}

// =================================================================
// 3. GLOBAL UI HANDLERS
// =================================================================

/**
 * Toggles the mobile navigation menu.
 */
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const toggleButton = document.querySelector('.mobile-menu-toggle');
    if (mobileMenu) {
        const isActive = mobileMenu.classList.toggle('active');
        toggleButton.setAttribute('aria-expanded', isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';
    }
}

/**
 * Handles the navbar scroll effect.
 */
function handleNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
}

/**
 * Manages the initial loading screen.
 * It now uses sessionStorage to show the animation only once per session.
 */
function handleLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (!loadingScreen) {
        document.body.classList.remove('loading');
        return;
    }

    // Check if the user has already visited in this session
    if (sessionStorage.getItem('vaiStudioVisited')) {
        // If so, hide the loading screen immediately
        loadingScreen.style.display = 'none';
        document.body.classList.remove('loading');
    } else {
        // If this is the first visit in the session, show the animation
        // and set the flag in sessionStorage
        sessionStorage.setItem('vaiStudioVisited', 'true');
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            document.body.classList.remove('loading');
            // Use 'transitionend' to set display to none after the fade-out completes
            loadingScreen.addEventListener('transitionend', () => {
                loadingScreen.style.display = 'none';
            }, { once: true });
        }, 1200); // Animation duration
    }
}


/**
 * Smoothly scrolls to an element on the page.
 * @param {Event} e The click event.
 */
function smoothScroll(e) {
    if (e.target.tagName === 'A' && e.target.hash) {
        const targetId = e.target.hash;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            const navHeight = document.getElementById('navbar')?.offsetHeight || 70;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
}

// =================================================================
// 4. GLOBAL EVENT LISTENERS
// =================================================================

// Fires when the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
    // Handle the loading screen logic as soon as the DOM is ready
    handleLoadingScreen();

    // Apply saved language preference
    const savedLang = SafeStorage.getItem('preferred-language');
    if (savedLang && savedLang !== document.body.getAttribute('data-current-lang')) {
        switchLanguage(savedLang);
    }

    // Add click listener for smooth scrolling
    document.addEventListener('click', smoothScroll);
    
    // Add click listener to close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const mobileMenu = document.getElementById('mobileMenu');
        const toggleButton = document.querySelector('.mobile-menu-toggle');
        if (mobileMenu?.classList.contains('active') && !mobileMenu.contains(e.target) && !toggleButton.contains(e.target)) {
            toggleMobileMenu();
        }
    });
});

// Throttled scroll listener for performance.
window.addEventListener('scroll', throttle(handleNavbarScroll, 100), { passive: true });
