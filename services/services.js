/**
 * VAI Studio - Services Page JavaScript
 *
 * This file contains scripts specific to the services page.
 * It manages the expandable feature lists and service-specific analytics.
 *
 * It depends on `global.js` being loaded first.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Services page scripts initializing...');

    // =================================================================
    // SERVICES PAGE UI HANDLERS
    // =================================================================

    /**
     * Toggles the visibility of extra features in a service card.
     * @param {HTMLElement} button The button that was clicked.
     */
    window.toggleFeatures = function(button) {
        const card = button.closest('.solution-card');
        if (!card) return;
        
        const expandableSection = card.querySelector('.features-expandable');
        if (!expandableSection) return;

        const isExpanded = expandableSection.classList.toggle('expanded');
        
        // Update the button text based on state and language
        updateFeatureToggleLanguage();

        // Track the interaction with analytics
        if (typeof gtag !== 'undefined') {
            const serviceName = card.querySelector('.solution-title')?.textContent.trim() || 'Unknown Service';
            gtag('event', 'feature_toggle', {
                'event_category': 'Services Interaction',
                'event_label': serviceName,
                'value': isExpanded ? 1 : 0
            });
        }
    }
    
    /**
     * Updates the text of all feature toggle buttons based on the current language.
     */
    window.updateFeatureToggleLanguage = function() {
        const currentLang = document.body.getAttribute('data-current-lang') || 'fr';
        
        document.querySelectorAll('.features-toggle').forEach(button => {
            const card = button.closest('.solution-card');
            const expandableSection = card.querySelector('.features-expandable');
            const isExpanded = expandableSection.classList.contains('expanded');

            if (isExpanded) {
                 button.innerHTML = currentLang === 'en' 
                    ? '<span data-lang="en">- Less features</span><span data-lang="fr">- Voir moins</span>'
                    : '<span data-lang="en">- Less features</span><span data-lang="fr">- Voir moins</span>';
            } else {
                 button.innerHTML = currentLang === 'en' 
                    ? '<span data-lang="en">+ More features</span><span data-lang="fr">+ Plus de fonctionnalités</span>'
                    : '<span data-lang="en">+ More features</span><span data-lang="fr">+ Plus de fonctionnalités</span>';
            }
        });
    }

    // Initial update for feature toggles on page load
    updateFeatureToggleLanguage();

    // =================================================================
    // SERVICES PAGE ANALYTICS
    // =================================================================
    
    /**
     * Initializes all analytics tracking for the services page.
     */
    function initServiceCardTracking() {
        // Track service card CTA clicks
        document.querySelectorAll('.solution-cta').forEach(cta => {
            cta.addEventListener('click', function() {
                const card = this.closest('.solution-card');
                const serviceName = card?.querySelector('.solution-title')?.textContent.trim() || 'Unknown Service';
                const price = card?.querySelector('.investment-amount')?.textContent.trim() || 'N/A';

                if (typeof gtag !== 'undefined') {
                    gtag('event', 'service_cta_click', {
                        'event_category': 'Services CTA',
                        'event_label': serviceName,
                        'value': price
                    });
                }
            });
        });
        
        // Track Quick Design Service CTA clicks
        document.querySelectorAll('.quick-service-cta').forEach(cta => {
            cta.addEventListener('click', function() {
                const card = this.closest('.quick-service-card');
                const serviceName = card?.querySelector('.quick-service-title')?.textContent.trim() || 'Unknown Quick Service';
                 if (typeof gtag !== 'undefined') {
                    gtag('event', 'quick_service_cta_click', {
                        'event_category': 'Quick Services CTA',
                        'event_label': serviceName
                    });
                }
            });
        });
    }

    initServiceCardTracking();

    console.log('Services page scripts initialized successfully.');
});
