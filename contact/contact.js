/**
 * VAI Studio - Contact Page JavaScript
 *
 * This file contains scripts specific to the contact page.
 * It manages the FAQ accordion, JotForm pre-filling from URL parameters,
 * and contact-specific analytics.
 *
 * It depends on `global.js` being loaded first.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Contact page scripts initializing...');

    // =================================================================
    // CONTACT PAGE UI HANDLERS
    // =================================================================

    /**
     * Toggles a single FAQ item and closes others.
     * This function is attached to the window object to be accessible
     * by the 'onclick' attribute in the HTML.
     * @param {HTMLElement} faqItem The FAQ item element to toggle.
     */
    window.toggleContactFAQ = function(faqItem) {
        if (!faqItem) return;
        const isActive = faqItem.classList.contains('active');

        // Close all other items first to ensure only one is open at a time.
        document.querySelectorAll('.contact-faq-item.active').forEach(item => {
            if (item !== faqItem) {
                item.classList.remove('active');
            }
        });

        // Toggle the clicked item
        faqItem.classList.toggle('active');

        // Track the interaction with analytics, only on open
        if (typeof gtag !== 'undefined' && !isActive) {
            const question = faqItem.querySelector('.contact-faq-question h3')?.textContent.trim() || 'Unknown FAQ';
            gtag('event', 'contact_faq_open', {
                'event_category': 'Contact Interaction',
                'event_label': question
            });
        }
    }

    // Add keyboard event listeners for accessibility.
    // The 'click' event is already handled by the `onclick` attribute in the HTML.
    document.querySelectorAll('.contact-faq-item').forEach(item => {
        item.addEventListener('keydown', (e) => {
             if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleContactFAQ(item); // Calls the global function
            }
        });
    });

    /**
     * Smoothly scrolls to the contact form section.
     */
    function initSmoothFormScrolling() {
        document.querySelectorAll('a[href="#contact-form"]').forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const formSection = document.getElementById('contact-form');
                if (formSection) {
                    const navHeight = document.getElementById('navbar')?.offsetHeight || 70;
                    const targetPosition = formSection.getBoundingClientRect().top + window.pageYOffset - navHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    initSmoothFormScrolling();
    
    // =================================================================
    // URL PARAMETER & JOTFORM HANDLING
    // =================================================================

    /**
     * Checks for URL parameters and updates the page content accordingly.
     */
    function processURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const service = urlParams.get('service');
        if (!service) return;

        const titleEl = document.getElementById('contact-title');
        const subtitleEl = document.getElementById('contact-subtitle');
        const badgeEl = document.getElementById('contact-badge');
        const currentLang = document.body.getAttribute('data-current-lang') || 'fr';

        const content = {
            'tourism-booking': {
                en: {
                    badge: '🐋 Whale Season Ready',
                    title: 'Get Your Tours Booked Faster',
                    subtitle: 'Let\'s set up a professional booking system designed for the peak whale season.'
                },
                fr: {
                    badge: '🐋 Prêt Saison Baleines',
                    title: 'Réserve Tes Tours Plus Rapidement',
                    subtitle: 'Mettons en place un système de réservation professionnel conçu pour la haute saison des baleines.'
                }
            }
            // Add other services here if needed
        };

        if (content[service] && content[service][currentLang]) {
            const newContent = content[service][currentLang];
            if(badgeEl) badgeEl.innerHTML = newContent.badge;
            if(titleEl) titleEl.querySelector(`[data-lang="${currentLang}"]`).textContent = newContent.title;
            if(subtitleEl) subtitleEl.querySelector(`[data-lang="${currentLang}"]`).textContent = newContent.subtitle;
        }
    }

    processURLParameters();
    
    // =================================================================
    // CONTACT PAGE ANALYTICS
    // =================================================================
    
    /**
     * Initializes all analytics tracking for the contact page.
     */
    function initContactAnalytics() {
        // Track quick contact method clicks
        document.querySelectorAll('.quick-contact-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const method = this.classList.contains('whatsapp-btn') ? 'WhatsApp' : 'Form';
                if(typeof gtag !== 'undefined') {
                    gtag('event', 'quick_contact_click', {
                        'event_category': 'Contact Method',
                        'event_label': `Hero ${method}`
                    });
                }
            });
        });

        // Track alternative contact method clicks
        document.querySelectorAll('.alternative-contact-grid .method-cta').forEach(cta => {
            cta.addEventListener('click', function() {
                const method = this.closest('.contact-method')?.querySelector('h3')?.textContent.trim() || 'Unknown';
                 if(typeof gtag !== 'undefined') {
                    gtag('event', 'alt_contact_click', {
                        'event_category': 'Contact Method',
                        'event_label': `Alt ${method}`
                    });
                }
            });
        });
    }

    initContactAnalytics();
    
    console.log('Contact page scripts initialized successfully.');
});