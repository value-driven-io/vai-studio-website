// COMPLETE Services Page JavaScript - Fixed Version

// Throttle function to limit how often functions can be called
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

// Safe localStorage wrapper with fallback
const SafeStorage = {
    setItem: function(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            console.warn('localStorage not available');
            return false;
        }
    },
    
    getItem: function(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn('localStorage not available');
            return null;
        }
    }
};

// Timer management to prevent memory leaks
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
        this.timers.forEach((timerId) => clearInterval(timerId));
        this.timers.clear();
    }
}

const timerManager = new TimerManager();
let maxScroll = 0;

// Language Switching Function - Fixed
function switchLanguage(lang) {
    document.body.setAttribute('data-current-lang', lang);
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-lang-btn="${lang}"]`)?.classList.add('active');

    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Update SEO Meta Tags
    updateSEOForLanguage(lang);
    
    // Update feature toggle buttons
    updateFeatureToggleLanguage();
    
    // Track language switch
    if (typeof gtag !== 'undefined') {
        trackLanguageSwitch(lang);
    }
    
    // Store preference safely
    SafeStorage.setItem('preferred-language', lang);
}

// Dynamic SEO Meta Tag Switching for Services Page
function updateSEOForLanguage(lang) {
    const title = document.querySelector('title');
    const description = document.querySelector('meta[name="description"]');
    
    if (lang === 'fr') {
        // French SEO for Services
        title.textContent = 'Systèmes Réservation & Solutions Numériques Polynésie Française | Services VAI Studio';
        description.setAttribute('content', 'Systèmes de réservation professionnels, solutions restaurant et sites touristiques pour entreprises polynésiennes. Préparez votre haute saison avec VAI Studio - basé à Moorea.');
        document.documentElement.setAttribute('lang', 'fr');
    } else {
        // English SEO for Services
        title.textContent = 'Booking Systems & Digital Solutions French Polynesia | VAI Studio Services';
        description.setAttribute('content', 'Professional booking systems, restaurant digital solutions & tourism websites for French Polynesian businesses. Get peak season ready with VAI Studio - based in Moorea.');
        document.documentElement.setAttribute('lang', 'en');
    }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
    }
}

// Enhanced Analytics Functions
function trackLanguageSwitch(language) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'language_switch', {
            'event_category': 'User Interaction',
            'event_label': language,
            'value': language === 'fr' ? 1 : 0
        });
    }
}

// Feature Toggle Functionality - Fixed
function toggleFeatures(button) {
    const card = button.closest('.solution-card');
    const expandableSection = card.querySelector('.features-expandable');
    const currentLang = document.body.getAttribute('data-current-lang') || 'fr';
    
    // Check if currently expanded by looking at display style
    const isCurrentlyExpanded = expandableSection.style.display === 'block';
    
    if (isCurrentlyExpanded) {
        // Collapse
        expandableSection.style.display = 'none';
        expandableSection.classList.remove('expanded');
        
        // Update button text for collapse
        if (currentLang === 'en') {
            button.innerHTML = '<span data-lang="en">+ More features</span><span data-lang="fr">+ Plus de fonctionnalités</span>';
        } else {
            button.innerHTML = '<span data-lang="en">+ More features</span><span data-lang="fr">+ Plus de fonctionnalités</span>';
        }
    } else {
        // Expand
        expandableSection.style.display = 'block';
        expandableSection.classList.add('expanded');
        
        // Update button text for expand
        if (currentLang === 'en') {
            button.innerHTML = '<span data-lang="en">- Less features</span><span data-lang="fr">- Voir moins</span>';
        } else {
            button.innerHTML = '<span data-lang="en">- Less features</span><span data-lang="fr">- Voir moins</span>';
        }
    }
    
    // Track feature expansion
    const serviceName = card.querySelector('.solution-title').textContent;
    if (typeof gtag !== 'undefined') {
        gtag('event', 'feature_toggle', {
            'event_category': 'Services',
            'event_label': serviceName,
            'event_action': isCurrentlyExpanded ? 'collapse' : 'expand',
            'value': isCurrentlyExpanded ? 0 : 1
        });
    }
}

// Language-aware feature toggle updates - Fixed
function updateFeatureToggleLanguage() {
    const toggleButtons = document.querySelectorAll('.features-toggle');
    
    toggleButtons.forEach(button => {
        const card = button.closest('.solution-card');
        const expandableSection = card.querySelector('.features-expandable');
        const isExpanded = expandableSection.style.display === 'block';
        
        if (isExpanded) {
            button.innerHTML = '<span data-lang="en">- Less features</span><span data-lang="fr">- Voir moins</span>';
        } else {
            button.innerHTML = '<span data-lang="en">+ More features</span><span data-lang="fr">+ Plus de fonctionnalités</span>';
        }
    });
}

// Enhanced Service Card Tracking
function initServiceCardTracking() {
    // Track when cards become visible
    const serviceCards = document.querySelectorAll('.solution-card');
    
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const serviceName = entry.target.querySelector('.solution-title').textContent;
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'service_view', {
                        'event_category': 'Services',
                        'event_label': serviceName,
                        'value': 1
                    });
                }
                // Stop observing once viewed
                cardObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -20px 0px'
    });
    
    // Observe all service cards
    serviceCards.forEach(card => {
        cardObserver.observe(card);
    });
    
    // Track service card clicks (not on buttons)
    serviceCards.forEach((card, index) => {
        card.addEventListener('click', function(e) {
            // Don't track if clicking on CTA button or feature toggle
            if (!e.target.closest('.solution-cta') && !e.target.closest('.features-toggle')) {
                const serviceName = this.querySelector('.solution-title').textContent;
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'service_card_click', {
                        'event_category': 'Services',
                        'event_label': serviceName,
                        'value': index + 1
                    });
                }
            }
        });
    });
    
    // Track pricing views
    const investmentElements = document.querySelectorAll('.solution-investment');
    const pricingObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const serviceName = entry.target.closest('.solution-card').querySelector('.solution-title').textContent;
                const price = entry.target.querySelector('.investment-amount').textContent;
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'pricing_view', {
                        'event_category': 'Services',
                        'event_label': serviceName,
                        'custom_parameters': {
                            'price_range': price
                        }
                    });
                }
                // Stop observing once viewed
                pricingObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.8
    });
    
    investmentElements.forEach(element => {
        pricingObserver.observe(element);
    });
    
    // Enhanced CTA tracking
    const solutionCTAs = document.querySelectorAll('.solution-cta');
    solutionCTAs.forEach(cta => {
        cta.addEventListener('click', function() {
            const serviceName = this.closest('.solution-card').querySelector('.solution-title').textContent;
            const buttonText = this.textContent.trim();
            const price = this.closest('.solution-card').querySelector('.investment-amount').textContent;
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'service_cta_click', {
                    'event_category': 'Services CTA',
                    'event_label': serviceName,
                    'event_action': buttonText,
                    'custom_parameters': {
                        'price_range': price
                    }
                });
            }
        });
    });
    
    // Footer CTA tracking
    const footerCTA = document.querySelector('.footer-cta-button');
    if (footerCTA) {
        footerCTA.addEventListener('click', function() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'footer_cta_click', {
                    'event_category': 'Services CTA',
                    'event_label': 'Transform Business Footer',
                    'value': 1
                });
            }
        });
    }
}

// Services Page Specific Functions
function initServicesPage() {
    // Track services page view
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            'page_title': 'Services',
            'page_location': window.location.href,
            'event_category': 'Services Page'
        });
    }
    
    // Track service highlight interactions
    const serviceHighlights = document.querySelectorAll('.service-highlight');
    serviceHighlights.forEach((highlight, index) => {
        highlight.addEventListener('click', function() {
            const serviceName = this.querySelector('h3').textContent;
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'service_highlight_click', {
                    'event_category': 'Services',
                    'event_label': serviceName,
                    'value': index + 1
                });
            }
        });
    });
    
    // Enhanced CTA button tracking for hero section
    const ctaButtons = document.querySelectorAll('.services-hero-cta .btn');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'services_cta_click', {
                    'event_category': 'Services CTA',
                    'event_label': buttonText,
                    'value': 1
                });
            }
        });
    });
}

// Services page specific animations
function animateOnScroll() {
    const serviceElements = document.querySelectorAll('.service-highlight');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    serviceElements.forEach(element => {
        // Set initial state for animation
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.6s ease';
        
        observer.observe(element);
    });
}

// Load saved language preference
window.addEventListener('load', () => {
    const savedLang = SafeStorage.getItem('preferred-language') || 'fr';
    if (savedLang && savedLang !== document.body.getAttribute('data-current-lang')) {
        switchLanguage(savedLang);
    }
    
    // Initialize services page animations
    animateOnScroll();
});

// Services page initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Services page loaded');
    
    // Initialize services page specific functionality
    initServicesPage();
    
    // Initialize service card tracking
    initServiceCardTracking();
    
    // Track core solutions section view
    const coreSection = document.querySelector('.core-solutions-section');
    if (coreSection) {
        let sectionViewed = false;
        
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !sectionViewed) {
                    sectionViewed = true;
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'services_section_view', {
                            'event_category': 'Services Page',
                            'event_label': 'Core Solutions Section',
                            'value': 1
                        });
                    }
                    
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2
        });
        
        sectionObserver.observe(coreSection);
    }
    
    // Initialize feature toggle language
    updateFeatureToggleLanguage();
});

// Navbar scroll effect
window.addEventListener('scroll', throttle(() => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
}, 16));

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.getElementById('navbar')?.offsetHeight || 80;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Track scroll depth for engagement
const optimizedScrollDepth = throttle(() => {
    const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (maxScroll % 25 === 0 && maxScroll > 0) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'scroll', {
                    'event_category': 'Engagement',
                    'event_label': 'Scroll Depth',
                    'value': maxScroll
                });
            }
        }
    }
}, 1000);

window.addEventListener('scroll', optimizedScrollDepth, { passive: true });

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (mobileMenu && mobileToggle && !mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        mobileMenu.classList.remove('active');
    }
});

// Keyboard accessibility for feature toggles
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.classList.contains('features-toggle')) {
            e.preventDefault();
            toggleFeatures(e.target);
        }
    }
});

// Handle resize for responsive adjustments
const throttledServicesResize = throttle(() => {
    // Update feature toggle language on resize
    updateFeatureToggleLanguage();
}, 250);

window.addEventListener('resize', throttledServicesResize);

// Enhanced resize handler with proper cleanup
function handleResize() {
    timerManager.clearAllTimers();
}

const throttledResize = throttle(handleResize, 250);
window.addEventListener('resize', throttledResize);


// ADD THIS TO YOUR EXISTING services/script.js file
// Add this code BEFORE the cleanup section at the bottom

// Quick Design Services Tracking and Functionality
function initQuickServicesSection() {
    // Track when quick services cards become visible
    const quickServiceCards = document.querySelectorAll('.quick-service-card');
    
    const quickCardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const serviceName = entry.target.querySelector('.quick-service-title').textContent;
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'quick_service_view', {
                        'event_category': 'Quick Services',
                        'event_label': serviceName,
                        'value': 1
                    });
                }
                // Stop observing once viewed
                quickCardObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.4,
        rootMargin: '0px 0px -30px 0px'
    });
    
    // Observe all quick service cards
    quickServiceCards.forEach(card => {
        quickCardObserver.observe(card);
    });
    
    // Track quick service card clicks (not on CTA buttons)
    quickServiceCards.forEach((card, index) => {
        card.addEventListener('click', function(e) {
            // Don't track if clicking on CTA button
            if (!e.target.closest('.quick-service-cta')) {
                const serviceName = this.querySelector('.quick-service-title').textContent;
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'quick_service_card_click', {
                        'event_category': 'Quick Services',
                        'event_label': serviceName,
                        'value': index + 1
                    });
                }
            }
        });
    });
    
    // Track quick service pricing views
    const quickPricingElements = document.querySelectorAll('.quick-service-pricing');
    const quickPricingObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const serviceName = entry.target.closest('.quick-service-card').querySelector('.quick-service-title').textContent;
                const price = entry.target.querySelector('.quick-price').textContent;
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'quick_service_pricing_view', {
                        'event_category': 'Quick Services',
                        'event_label': serviceName,
                        'custom_parameters': {
                            'price_range': price
                        }
                    });
                }
                // Stop observing once viewed
                quickPricingObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.8
    });
    
    quickPricingElements.forEach(element => {
        quickPricingObserver.observe(element);
    });
    
    // Track quick service CTA clicks
    const quickServiceCTAs = document.querySelectorAll('.quick-service-cta');
    quickServiceCTAs.forEach(cta => {
        cta.addEventListener('click', function() {
            const serviceName = this.closest('.quick-service-card').querySelector('.quick-service-title').textContent;
            const buttonText = this.textContent.trim();
            const price = this.closest('.quick-service-card').querySelector('.quick-price').textContent;
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'quick_service_cta_click', {
                    'event_category': 'Quick Services CTA',
                    'event_label': serviceName,
                    'event_action': buttonText,
                    'custom_parameters': {
                        'price_range': price,
                        'service_type': 'quick_service'
                    }
                });
            }
        });
    });
    
    // Track custom work CTA
    const customWorkCTA = document.querySelector('.quick-footer-cta');
    if (customWorkCTA) {
        customWorkCTA.addEventListener('click', function() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'custom_work_cta_click', {
                    'event_category': 'Quick Services CTA',
                    'event_label': 'Custom Work Request',
                    'value': 1
                });
            }
        });
    }
    
    // Track section view
    const quickServicesSection = document.querySelector('.quick-services-section');
    if (quickServicesSection) {
        let quickSectionViewed = false;
        
        const quickSectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !quickSectionViewed) {
                    quickSectionViewed = true;
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'quick_services_section_view', {
                            'event_category': 'Services Page',
                            'event_label': 'Quick Services Section',
                            'value': 1
                        });
                    }
                    
                    quickSectionObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3
        });
        
        quickServicesSection.observe && quickSectionObserver.observe(quickServicesSection);
    }
}

// Quick Services Card Animation on Scroll
function animateQuickServicesOnScroll() {
    const quickServiceCards = document.querySelectorAll('.quick-service-card');
    
    const quickAnimationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -30px 0px'
    });
    
    quickServiceCards.forEach((card, index) => {
        // Set initial state for animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all 0.5s ease ${index * 0.1}s`; // Staggered animation
        
        quickAnimationObserver.observe(card);
    });
}

// Quick Service Price Comparison Analytics
function trackQuickServicePriceComparison() {
    // Track when users view multiple pricing sections (indicates comparison shopping)
    let viewedPrices = new Set();
    
    const priceComparisonObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const serviceName = entry.target.closest('.quick-service-card').querySelector('.quick-service-title').textContent;
                viewedPrices.add(serviceName);
                
                // If user has viewed 3+ prices, they're comparison shopping
                if (viewedPrices.size >= 3 && typeof gtag !== 'undefined') {
                    gtag('event', 'price_comparison_behavior', {
                        'event_category': 'Quick Services',
                        'event_label': 'Multiple Price Views',
                        'value': viewedPrices.size
                    });
                }
            }
        });
    }, {
        threshold: 0.8
    });
    
    document.querySelectorAll('.quick-service-pricing').forEach(pricing => {
        priceComparisonObserver.observe(pricing);
    });
}

// Update existing DOMContentLoaded to include quick services
const originalDOMContentLoaded = document.addEventListener;
document.addEventListener('DOMContentLoaded', function() {
    console.log('Services page loaded');
    
    // Initialize services page specific functionality (existing)
    initServicesPage();
    
    // Initialize service card tracking (existing)
    initServiceCardTracking();
    
    // Initialize quick services functionality (NEW)
    initQuickServicesSection();
    
    // Initialize quick services animations (NEW)
    animateQuickServicesOnScroll();
    
    // Initialize price comparison tracking (NEW)
    trackQuickServicePriceComparison();
    
    // Track core solutions section view (existing)
    const coreSection = document.querySelector('.core-solutions-section');
    if (coreSection) {
        let sectionViewed = false;
        
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !sectionViewed) {
                    sectionViewed = true;
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'services_section_view', {
                            'event_category': 'Services Page',
                            'event_label': 'Core Solutions Section',
                            'value': 1
                        });
                    }
                    
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2
        });
        
        sectionObserver.observe(coreSection);
    }
    
    // Initialize feature toggle language (existing)
    updateFeatureToggleLanguage();
});

// Quick Service Hover Analytics (Track engagement)
function trackQuickServiceHoverEngagement() {
    const quickServiceCards = document.querySelectorAll('.quick-service-card');
    
    quickServiceCards.forEach(card => {
        let hoverTimeout;
        
        card.addEventListener('mouseenter', function() {
            hoverTimeout = setTimeout(() => {
                const serviceName = this.querySelector('.quick-service-title').textContent;
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'quick_service_hover_engagement', {
                        'event_category': 'Quick Services',
                        'event_label': serviceName,
                        'value': 1
                    });
                }
            }, 2000); // Track if user hovers for 2+ seconds
        });
        
        card.addEventListener('mouseleave', function() {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
        });
    });
}

// Initialize hover tracking after DOM loads
window.addEventListener('load', () => {
    trackQuickServiceHoverEngagement();
});


// Investment & Process Section JavaScript - Add to services/script.js

// Investment & Process Section Tracking and Functionality
function initInvestmentProcessSection() {
    console.log('Initializing Investment & Process section...');
    
    // Track when investment and process cards become visible
    const investmentProcessCards = document.querySelectorAll('.pricing-philosophy-card, .payment-options-card, .process-overview-card');
    
    const investmentCardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                let cardType = '';
                if (entry.target.classList.contains('pricing-philosophy-card')) {
                    cardType = 'Pricing Philosophy';
                } else if (entry.target.classList.contains('payment-options-card')) {
                    cardType = 'Payment Options';
                } else if (entry.target.classList.contains('process-overview-card')) {
                    cardType = 'Process Overview';
                }
                
                if (typeof gtag !== 'undefined' && cardType) {
                    gtag('event', 'investment_process_card_view', {
                        'event_category': 'Investment Process',
                        'event_label': cardType,
                        'value': 1
                    });
                }
                // Stop observing once viewed
                investmentCardObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.4,
        rootMargin: '0px 0px -30px 0px'
    });
    
    // Observe all investment and process cards
    investmentProcessCards.forEach(card => {
        investmentCardObserver.observe(card);
    });
    
    // Track payment option interactions
    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach((option, index) => {
        option.addEventListener('click', function() {
            let paymentType = '';
            if (this.classList.contains('standard')) {
                paymentType = 'Standard 50/50';
            } else if (this.classList.contains('popular')) {
                paymentType = 'Full Payment (5% discount)';
            } else if (this.classList.contains('express')) {
                paymentType = 'Whale Season Express';
            }
            
            if (typeof gtag !== 'undefined' && paymentType) {
                gtag('event', 'payment_option_click', {
                    'event_category': 'Investment Process',
                    'event_label': paymentType,
                    'value': index + 1
                });
            }
        });
        
        // Track hover engagement for payment options
        let paymentHoverTimeout;
        option.addEventListener('mouseenter', function() {
            paymentHoverTimeout = setTimeout(() => {
                let paymentType = '';
                if (this.classList.contains('standard')) {
                    paymentType = 'Standard 50/50';
                } else if (this.classList.contains('popular')) {
                    paymentType = 'Full Payment (5% discount)';
                } else if (this.classList.contains('express')) {
                    paymentType = 'Whale Season Express';
                }
                
                if (typeof gtag !== 'undefined' && paymentType) {
                    gtag('event', 'payment_option_hover_engagement', {
                        'event_category': 'Investment Process',
                        'event_label': paymentType,
                        'value': 1
                    });
                }
            }, 2000); // Track if user hovers for 2+ seconds
        });
        
        option.addEventListener('mouseleave', function() {
            if (paymentHoverTimeout) {
                clearTimeout(paymentHoverTimeout);
            }
        });
    });
    
    // Track process step interactions and visibility
    const processSteps = document.querySelectorAll('.process-step');
    
    // Track individual process step views
    const processStepObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stepNumber = entry.target.getAttribute('data-step');
                const stepTitle = entry.target.querySelector('.step-title').textContent.trim();
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'process_step_view', {
                        'event_category': 'Investment Process',
                        'event_label': `Step ${stepNumber}: ${stepTitle}`,
                        'value': parseInt(stepNumber)
                    });
                }
                // Stop observing once viewed
                processStepObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.6,
        rootMargin: '0px 0px -20px 0px'
    });
    
    processSteps.forEach(step => {
        processStepObserver.observe(step);
        
        // Track step clicks
        step.addEventListener('click', function() {
            const stepNumber = this.getAttribute('data-step');
            const stepTitle = this.querySelector('.step-title').textContent.trim();
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'process_step_click', {
                    'event_category': 'Investment Process',
                    'event_label': `Step ${stepNumber}: ${stepTitle}`,
                    'value': parseInt(stepNumber)
                });
            }
        });
    });
    
    // Track non-profit note interaction
    const nonprofitNote = document.querySelector('.nonprofit-note');
    if (nonprofitNote) {
        nonprofitNote.addEventListener('click', function() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'nonprofit_note_click', {
                    'event_category': 'Investment Process',
                    'event_label': 'Non-profit Services Info',
                    'value': 1
                });
            }
        });
    }
    
    // Track timeline urgency note
    const timelineNote = document.querySelector('.timeline-note');
    if (timelineNote) {
        const timelineNoteObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'whale_season_urgency_view', {
                            'event_category': 'Investment Process',
                            'event_label': 'Timeline Urgency Note',
                            'value': 1
                        });
                    }
                    timelineNoteObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.8
        });
        
        timelineNoteObserver.observe(timelineNote);
        
        timelineNote.addEventListener('click', function() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'whale_season_urgency_click', {
                    'event_category': 'Investment Process',
                    'event_label': 'Timeline Urgency Note',
                    'value': 1
                });
            }
        });
    }
    
    // Track pricing features engagement
    const pricingFeatures = document.querySelectorAll('.pricing-features-list li');
    pricingFeatures.forEach((feature, index) => {
        feature.addEventListener('click', function() {
            const featureText = this.textContent.trim();
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'pricing_feature_click', {
                    'event_category': 'Investment Process',
                    'event_label': featureText,
                    'value': index + 1
                });
            }
        });
    });
    
    // Track Investment & Process CTA clicks
    const investmentProcessCTAs = document.querySelectorAll('.process-cta-primary, .process-cta-secondary');
    investmentProcessCTAs.forEach(cta => {
        cta.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            const ctaType = this.classList.contains('process-cta-primary') ? 'Primary' : 'Secondary';
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'investment_process_cta_click', {
                    'event_category': 'Investment Process CTA',
                    'event_label': `${ctaType}: ${buttonText}`,
                    'value': ctaType === 'Primary' ? 2 : 1
                });
            }
        });
    });
    
    // Track section completion (when user scrolls through entire section)
    const investmentProcessSection = document.querySelector('.investment-process-section');
    if (investmentProcessSection) {
        let sectionCompleted = false;
        
        const sectionCompletionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !sectionCompleted) {
                    // Check if user has scrolled to bottom of section
                    const rect = entry.target.getBoundingClientRect();
                    const sectionBottom = rect.bottom;
                    const windowHeight = window.innerHeight;
                    
                    if (sectionBottom <= windowHeight * 1.2) { // Allow some buffer
                        sectionCompleted = true;
                        
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'investment_process_section_completed', {
                                'event_category': 'Investment Process',
                                'event_label': 'Section Fully Viewed',
                                'value': 1
                            });
                        }
                        
                        sectionCompletionObserver.unobserve(entry.target);
                    }
                }
            });
        }, {
            threshold: 0.1
        });
        
        sectionCompletionObserver.observe(investmentProcessSection);
    }
}

// Investment & Process Section Animation on Scroll
function animateInvestmentProcessOnScroll() {
    const investmentProcessCards = document.querySelectorAll('.pricing-philosophy-card, .payment-options-card, .process-overview-card');
    const processSteps = document.querySelectorAll('.process-step');
    
    const investmentAnimationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -30px 0px'
    });
    
    // Set initial state and observe cards
    investmentProcessCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`; // Staggered animation
        
        investmentAnimationObserver.observe(card);
    });
    
    // Process steps already have CSS animation, but add intersection observer for triggering
    const processStepAnimationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -20px 0px'
    });
    
    processSteps.forEach(step => {
        processStepAnimationObserver.observe(step);
    });
}

// Track Payment Option Comparison Behavior
function trackPaymentOptionComparison() {
    let viewedPaymentOptions = new Set();
    
    const paymentComparisonObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                let paymentType = '';
                if (entry.target.classList.contains('standard')) {
                    paymentType = 'Standard';
                } else if (entry.target.classList.contains('popular')) {
                    paymentType = 'Full Payment';
                } else if (entry.target.classList.contains('express')) {
                    paymentType = 'Whale Season Express';
                }
                
                if (paymentType) {
                    viewedPaymentOptions.add(paymentType);
                    
                    // If user has viewed all 3 payment options, they're comparison shopping
                    if (viewedPaymentOptions.size >= 3 && typeof gtag !== 'undefined') {
                        gtag('event', 'payment_options_comparison_behavior', {
                            'event_category': 'Investment Process',
                            'event_label': 'Viewed All Payment Options',
                            'value': viewedPaymentOptions.size
                        });
                    }
                }
            }
        });
    }, {
        threshold: 0.8
    });
    
    document.querySelectorAll('.payment-option').forEach(option => {
        paymentComparisonObserver.observe(option);
    });
}

// Process Step Sequential Tracking
function trackProcessStepSequentialViewing() {
    let viewedSteps = new Set();
    let lastViewedStep = 0;
    
    const sequentialStepObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stepNumber = parseInt(entry.target.getAttribute('data-step'));
                viewedSteps.add(stepNumber);
                
                // Check if viewing steps in sequence
                if (stepNumber === lastViewedStep + 1) {
                    lastViewedStep = stepNumber;
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'process_step_sequential_view', {
                            'event_category': 'Investment Process',
                            'event_label': `Sequential Step ${stepNumber}`,
                            'value': stepNumber
                        });
                    }
                    
                    // If user has viewed all 6 steps sequentially
                    if (viewedSteps.size === 6) {
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'process_journey_completed', {
                                'event_category': 'Investment Process',
                                'event_label': 'Viewed All Steps Sequentially',
                                'value': 6
                            });
                        }
                    }
                }
            }
        });
    }, {
        threshold: 0.7
    });
    
    document.querySelectorAll('.process-step').forEach(step => {
        sequentialStepObserver.observe(step);
    });
}

// Enhanced Investment & Process Section Initialization
function initEnhancedInvestmentProcessTracking() {
    // Track section view
    const investmentProcessSection = document.querySelector('.investment-process-section');
    if (investmentProcessSection) {
        let sectionViewed = false;
        
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !sectionViewed) {
                    sectionViewed = true;
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'investment_process_section_view', {
                            'event_category': 'Services Page',
                            'event_label': 'Investment Process Section',
                            'value': 1
                        });
                    }
                    
                    sectionObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.2
        });
        
        sectionObserver.observe(investmentProcessSection);
    }
    
    // Initialize all tracking functions
    initInvestmentProcessSection();
    animateInvestmentProcessOnScroll();
    trackPaymentOptionComparison();
    trackProcessStepSequentialViewing();
}

// Add to the existing DOMContentLoaded event listener in services/script.js
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    // Initialize Investment & Process section (ADD THIS)
    initEnhancedInvestmentProcessTracking();
    
    // ... rest of existing code ...
});

// Initialize enhanced tracking after page load
window.addEventListener('load', () => {
    // Track engagement with pricing philosophy vs payment options
    const pricingPhilosophyCard = document.querySelector('.pricing-philosophy-card');
    const paymentOptionsCard = document.querySelector('.payment-options-card');
    
    if (pricingPhilosophyCard && paymentOptionsCard) {
        [pricingPhilosophyCard, paymentOptionsCard].forEach(card => {
            let cardHoverTimeout;
            
            card.addEventListener('mouseenter', function() {
                cardHoverTimeout = setTimeout(() => {
                    const cardType = this.classList.contains('pricing-philosophy-card') ? 'Pricing Philosophy' : 'Payment Options';
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'pricing_card_engagement', {
                            'event_category': 'Investment Process',
                            'event_label': cardType + ' Extended Hover',
                            'value': 1
                        });
                    }
                }, 3000); // Track if user hovers for 3+ seconds
            });
            
            card.addEventListener('mouseleave', function() {
                if (cardHoverTimeout) {
                    clearTimeout(cardHoverTimeout);
                }
            });
        });
    }
});

// Export functions for potential external use
if (typeof window !== 'undefined') {
    window.InvestmentProcessTracking = {
        init: initEnhancedInvestmentProcessTracking,
        trackPaymentOption: trackPaymentOptionComparison,
        trackProcessSteps: trackProcessStepSequentialViewing
    };
}

// Cleanup on page unload to prevent memory leaks
window.addEventListener('beforeunload', () => {
    timerManager.clearAllTimers();
});