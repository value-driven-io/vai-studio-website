// Contact Page JavaScript - Complete Implementation

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

// Language Switching Function
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
    
    // Track language switch
    if (typeof gtag !== 'undefined') {
        trackLanguageSwitch(lang);
    }
    
    // Store preference safely
    SafeStorage.setItem('preferred-language', lang);
}

// Dynamic SEO Meta Tag Switching for Contact Page
function updateSEOForLanguage(lang) {
    const title = document.querySelector('title');
    const description = document.querySelector('meta[name="description"]');
    
    if (lang === 'fr') {
        // French SEO for Contact
        title.textContent = 'Contact VAI Studio | Conception Web Polynésie Française - Solutions Numériques Moorea';
        description.setAttribute('content', 'Contactez VAI Studio pour conception web professionnelle et solutions numériques en Polynésie française. Consultation gratuite, prêt haute saison. Basé à Moorea, service toutes îles.');
        document.documentElement.setAttribute('lang', 'fr');
    } else {
        // English SEO for Contact
        title.textContent = 'Contact VAI Studio | Web Design French Polynesia - Moorea Digital Solutions';
        description.setAttribute('content', 'Contact VAI Studio for professional web design and digital solutions in French Polynesia. Free consultation, peak season ready. Based in Moorea, serving all islands.');
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

// Contact FAQ Toggle Function
function toggleContactFAQ(faqItem) {
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.contact-faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Open clicked item if it wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
        
        // Track FAQ interaction
        const question = faqItem.querySelector('h3').textContent;
        if (typeof gtag !== 'undefined') {
            gtag('event', 'contact_faq_interaction', {
                'event_category': 'Contact FAQ',
                'event_label': question,
                'value': 1
            });
        }
    }
}

// URL Parameter Detection and Processing
function detectAndProcessURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const service = urlParams.get('service');
    const urgency = urlParams.get('urgency');
    const source = urlParams.get('source') || 'direct';
    
    // Track contact page entry with context
    if (typeof gtag !== 'undefined') {
        gtag('event', 'contact_page_entry', {
            'event_category': 'Contact Page',
            'event_label': source,
            'custom_parameters': {
                'service_interest': service,
                'urgency_level': urgency
            }
        });
    }
    
    // Update hero content based on service
    updateHeroContent(service, urgency);
    
    // Store parameters for JotForm pre-filling
    if (service || urgency) {
        SafeStorage.setItem('contact_service', service);
        SafeStorage.setItem('contact_urgency', urgency);
        SafeStorage.setItem('contact_source', source);
        
        // Prepare JotForm pre-filling
        prepareJotFormPreFill(service, urgency, source);
    }
    
    return { service, urgency, source };
}

// Update Hero Content Based on Service
function updateHeroContent(service, urgency) {
    const badge = document.getElementById('contact-badge');
    const title = document.getElementById('contact-title');
    const subtitle = document.getElementById('contact-subtitle');
    const currentLang = document.body.getAttribute('data-current-lang') || 'fr';
    
    // Service-specific hero content
    const serviceContent = {
        'tourism-booking': {
            en: {
                badge: '🐋 Whale Season Ready',
                title: 'Get Your Tours Booked Faster',
                subtitle: 'Professional booking systems designed for peak whale season. Increase bookings, reduce manual work, and capture every opportunity from August through November.'
            },
            fr: {
                badge: '🐋 Prêt Saison Baleines',
                title: 'Réserve tes Tours Plus Rapidement',
                subtitle: 'Systèmes de réservation professionnels conçus pour la haute saison des baleines. Augmente les réservations, réduis le travail manuel et capture chaque opportunité d\'août à novembre.'
            }
        },
        'restaurant-digital': {
            en: {
                badge: '🍽️ Restaurant Solutions',
                title: 'Showcase Your Cuisine Online',
                subtitle: 'Beautiful digital menus and restaurant websites that make customers hungry. Perfect for roulottes, cafes, and fine dining establishments across French Polynesia.'
            },
            fr: {
                badge: '🍽️ Solutions Restaurant',
                title: 'Mets en Valeur ta Cuisine en Ligne',
                subtitle: 'Beaux menus numériques et sites restaurant qui donnent faim aux clients. Parfait pour roulottes, cafés et établissements de restauration fine en Polynésie française.'
            }
        },
        'business-kickstart': {
            en: {
                badge: '🚀 Quick Launch',
                title: 'Get Online in 1-2 Weeks',
                subtitle: 'Everything you need for a professional online presence - fast. Perfect for new businesses or those preparing for peak season with limited time.'
            },
            fr: {
                badge: '🚀 Lancement Rapide',
                title: 'Sois en Ligne en 1-2 Semaines',
                subtitle: 'Tout ce dont tu as besoin pour une présence en ligne professionnelle - rapidement. Parfait pour nouvelles entreprises ou celles se préparant pour la haute saison avec temps limité.'
            }
        }
    };
    
    // Apply service-specific content
    if (service && serviceContent[service]) {
        const content = serviceContent[service][currentLang];
        if (content) {
            // Update badge
            if (badge) {
                badge.innerHTML = content.badge;
            }
            
            // Update title
            if (title) {
                title.innerHTML = content.title;
            }
            
            // Update subtitle
            if (subtitle) {
                subtitle.innerHTML = content.subtitle;
            }
        }
    }
    
    // Add urgency indicator for whale season
    if (urgency === 'whale-season' && badge) {
        badge.style.background = 'rgba(255, 71, 87, 0.1)';
        badge.style.borderColor = 'rgba(255, 71, 87, 0.3)';
        badge.style.color = 'var(--accent-coral)';
    }
}

// JotForm Pre-filling Preparation
function prepareJotFormPreFill(service, urgency, source) {
    // Wait for JotForm to load, then attempt pre-filling
    const checkJotForm = setInterval(() => {
        const jotformFrame = document.querySelector('iframe[src*="jotform.com"]');
        if (jotformFrame) {
            clearInterval(checkJotForm);
            
            // Try to access JotForm and pre-fill
            setTimeout(() => {
                preFilljotform(service, urgency, source);
            }, 2000); // Wait for form to fully load
        }
    }, 500);
    
    // Clear check after 10 seconds to prevent infinite loop
    setTimeout(() => clearInterval(checkJotForm), 10000);
}

// Pre-fill JotForm with URL parameters
function preFilljotform(service, urgency, source) {
    try {
        const jotformFrame = document.querySelector('iframe[src*="jotform.com"]');
        if (!jotformFrame) return;
        
        // Service mapping for JotForm values
        const serviceMapping = {
            'tourism-booking': '🏝️ Tourism & Booking Systems',
            'restaurant-digital': '🍽️ Restaurant Digital Solutions',
            'business-kickstart': '🚀 Business Kickstart Package',
            'custom-website': '🎨 Custom Website Design',
            'wellness-platform': '🌺 Wellness Provider Platforms',
            'website-redesign': '🔄 Website Redesign'
        };
        
        const urgencyMapping = {
            'whale-season': 'Urgent - Need for whale season',
            'standard': 'Standard - 2-8 weeks',
            'flexible': 'Flexible - When ready'
        };
        
        // Prepare pre-fill data
        const prefillData = {};
        
        if (service && serviceMapping[service]) {
            prefillData.serviceInterest = serviceMapping[service];
        }
        
        if (urgency && urgencyMapping[urgency]) {
            prefillData.urgency = urgencyMapping[urgency];
        }
        
        if (source) {
            prefillData.source = source;
        }
        
        // Store for potential form access
        window.jotformPrefillData = prefillData;
        
        // Track pre-fill attempt
        if (typeof gtag !== 'undefined') {
            gtag('event', 'jotform_prefill_attempt', {
                'event_category': 'Contact Form',
                'event_label': service || 'unknown',
                'custom_parameters': prefillData
            });
        }
        
    } catch (error) {
        console.warn('JotForm pre-fill failed:', error);
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

// Contact Page Specific Analytics
function initContactPageAnalytics() {
    // Track contact method interactions
    const contactMethods = document.querySelectorAll('.quick-contact-btn, .method-cta');
    contactMethods.forEach(method => {
        method.addEventListener('click', function() {
            const methodType = this.classList.contains('whatsapp-btn') ? 'WhatsApp' :
                             this.classList.contains('form-btn') ? 'Form' :
                             this.href.includes('wa.me') ? 'WhatsApp' :
                             this.href.includes('facebook') ? 'Facebook' :
                             this.href.includes('mailto') ? 'Email' : 'Unknown';
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'contact_method_click', {
                    'event_category': 'Contact Methods',
                    'event_label': methodType,
                    'value': 1
                });
            }
        });
    });
    
    // Track form section visibility
    const formSection = document.querySelector('.contact-form-section');
    if (formSection) {
        const formObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'contact_form_section_view', {
                            'event_category': 'Contact Form',
                            'event_label': 'Form Section Viewed',
                            'value': 1
                        });
                    }
                    formObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        formObserver.observe(formSection);
    }
    
    // Track alternative contact methods section
    const altContactSection = document.querySelector('.alternative-contact-section');
    if (altContactSection) {
        const altContactObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'alternative_contact_section_view', {
                            'event_category': 'Contact Page',
                            'event_label': 'Alternative Methods Viewed',
                            'value': 1
                        });
                    }
                    altContactObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        altContactObserver.observe(altContactSection);
    }
    
    // Track CTA button clicks
    const ctaButtons = document.querySelectorAll('.contact-cta-primary, .contact-cta-secondary');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonType = this.classList.contains('contact-cta-primary') ? 'Primary' : 'Secondary';
            const buttonText = this.textContent.trim();
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'contact_cta_click', {
                    'event_category': 'Contact CTA',
                    'event_label': `${buttonType}: ${buttonText}`,
                    'value': buttonType === 'Primary' ? 2 : 1
                });
            }
        });
    });
}

// Form Engagement Tracking
function trackFormEngagement() {
    const jotformContainer = document.getElementById('jotform-container');
    if (!jotformContainer) return;
    
    let formEngaged = false;
    let formStartTime = null;
    
    // Track form interaction
    const formInteractionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !formEngaged) {
                formEngaged = true;
                formStartTime = Date.now();
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'contact_form_engagement_start', {
                        'event_category': 'Contact Form',
                        'event_label': 'Form Interaction Started',
                        'value': 1
                    });
                }
            }
        });
    }, { threshold: 0.5 });
    
    formInteractionObserver.observe(jotformContainer);
    
    // Track form completion (when user navigates away or scrolls past form)
    window.addEventListener('beforeunload', () => {
        if (formEngaged && formStartTime) {
            const timeSpent = Date.now() - formStartTime;
            const timeSpentSeconds = Math.round(timeSpent / 1000);
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'contact_form_time_spent', {
                    'event_category': 'Contact Form',
                    'event_label': 'Time Spent on Form',
                    'value': timeSpentSeconds
                });
            }
        }
    });
}

// Response Promise Interaction Tracking
function trackResponsePromiseInteraction() {
    const promiseItems = document.querySelectorAll('.promise-item');
    
    promiseItems.forEach((item, index) => {
        // Track hover engagement
        let hoverTimeout;
        
        item.addEventListener('mouseenter', function() {
            hoverTimeout = setTimeout(() => {
                const promiseType = this.querySelector('h3').textContent.trim();
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'response_promise_engagement', {
                        'event_category': 'Contact Page',
                        'event_label': promiseType,
                        'value': 1
                    });
                }
            }, 2000); // Track if user hovers for 2+ seconds
        });
        
        item.addEventListener('mouseleave', function() {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
        });
        
        // Track clicks
        item.addEventListener('click', function() {
            const promiseType = this.querySelector('h3').textContent.trim();
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'response_promise_click', {
                    'event_category': 'Contact Page',
                    'event_label': promiseType,
                    'value': index + 1
                });
            }
        });
    });
}

// Location & Availability Interaction Tracking
function trackLocationAvailabilityInteraction() {
    const locationItems = document.querySelectorAll('.location-item, .availability-item');
    
    locationItems.forEach(item => {
        item.addEventListener('click', function() {
            const itemTitle = this.querySelector('h4').textContent.trim();
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'location_availability_click', {
                    'event_category': 'Contact Page',
                    'event_label': itemTitle,
                    'value': 1
                });
            }
        });
    });
}

// Contact Page Animations
function initContactPageAnimations() {
    // Animate elements on scroll
    const animatedElements = document.querySelectorAll(
        '.promise-item, .contact-method, .contact-faq-item, .location-item, .availability-item'
    );
    
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    });
    
    animatedElements.forEach((element, index) => {
        // Set initial state for animation
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = `all 0.6s ease ${index * 0.1}s`; // Staggered animation
        
        animationObserver.observe(element);
    });
}

// Smooth Form Scrolling
function initSmoothFormScrolling() {
    const formButtons = document.querySelectorAll('a[href="#contact-form"]');
    
    formButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const formSection = document.getElementById('contact-form');
            if (formSection) {
                const navHeight = document.getElementById('navbar')?.offsetHeight || 80;
                const targetPosition = formSection.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Track form scroll
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'contact_form_scroll', {
                        'event_category': 'Contact Form',
                        'event_label': 'Scrolled to Form',
                        'value': 1
                    });
                }
            }
        });
    });
}

// Load saved language preference
window.addEventListener('load', () => {
    const savedLang = SafeStorage.getItem('preferred-language') || 'fr';
    if (savedLang && savedLang !== document.body.getAttribute('data-current-lang')) {
        switchLanguage(savedLang);
    }
});

// Contact page initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Contact page loaded');
    
    // Detect and process URL parameters
    const urlParams = detectAndProcessURLParameters();
    
    // Initialize contact page analytics
    initContactPageAnalytics();
    
    // Initialize form engagement tracking
    trackFormEngagement();
    
    // Initialize response promise interaction tracking
    trackResponsePromiseInteraction();
    
    // Initialize location & availability interaction tracking
    trackLocationAvailabilityInteraction();
    
    // Initialize animations
    initContactPageAnimations();
    
    // Initialize smooth form scrolling
    initSmoothFormScrolling();
    
    // Track contact page view with context
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            'page_title': 'Contact',
            'page_location': window.location.href,
            'event_category': 'Contact Page',
            'custom_parameters': {
                'service_context': urlParams.service,
                'urgency_context': urlParams.urgency,
                'source_context': urlParams.source
            }
        });
    }
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

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (mobileMenu && mobileToggle && !mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        mobileMenu.classList.remove('active');
    }
});

// Keyboard accessibility for FAQ toggles
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.closest('.contact-faq-question')) {
            e.preventDefault();
            toggleContactFAQ(e.target.closest('.contact-faq-item'));
        }
    }
});

// Handle resize for responsive adjustments
const throttledContactResize = throttle(() => {
    // Handle responsive changes
    const heroLayout = document.querySelector('.contact-hero-layout');
    if (heroLayout && window.innerWidth <= 768) {
        // Mobile-specific adjustments
        heroLayout.style.flexDirection = 'column';
    }
}, 250);

window.addEventListener('resize', throttledContactResize);

// Enhanced resize handler with proper cleanup
function handleContactResize() {
    timerManager.clearAllTimers();
    
    // Re-initialize animations for new screen size
    const animatedElements = document.querySelectorAll('.promise-item, .contact-method');
    animatedElements.forEach(element => {
        element.style.transition = 'all 0.3s ease';
    });
}

const throttledResize = throttle(handleContactResize, 250);
window.addEventListener('resize', throttledResize);

// JotForm Integration Helpers
function getJotFormStatus() {
    const jotformFrame = document.querySelector('iframe[src*="jotform.com"]');
    return {
        loaded: !!jotformFrame,
        visible: jotformFrame && jotformFrame.offsetHeight > 0,
        prefillData: window.jotformPrefillData || {}
    };
}

// Contact Form Completion Detection
function detectFormCompletion() {
    // Monitor for thank you page or form submission success
    const checkForCompletion = setInterval(() => {
        const jotformFrame = document.querySelector('iframe[src*="jotform.com"]');
        if (jotformFrame) {
            try {
                const frameDoc = jotformFrame.contentDocument || jotformFrame.contentWindow.document;
                if (frameDoc && frameDoc.querySelector('.form-thank-you, .thank-you, [data-type="thank-you"]')) {
                    clearInterval(checkForCompletion);
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'contact_form_submission', {
                            'event_category': 'Contact Form',
                            'event_label': 'Form Submitted Successfully',
                            'value': 1
                        });
                    }
                }
            } catch (error) {
                // Cross-origin restrictions prevent access - this is normal
            }
        }
    }, 2000);
    
    // Clear check after 30 minutes to prevent infinite loop
    setTimeout(() => clearInterval(checkForCompletion), 1800000);
}

// Initialize form completion detection
window.addEventListener('load', () => {
    setTimeout(detectFormCompletion, 3000);
});

// Export functions for potential external use
if (typeof window !== 'undefined') {
    window.ContactPageTracking = {
        trackLanguageSwitch,
        toggleContactFAQ,
        getJotFormStatus,
        detectAndProcessURLParameters
    };
}

// Cleanup on page unload to prevent memory leaks
window.addEventListener('beforeunload', () => {
    timerManager.clearAllTimers();
});