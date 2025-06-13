// Homepage JavaScript - Interactive/Auto-rotating Services Showcase
// Mobile-First with Performance Optimizations

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

// Dynamic SEO Meta Tag Switching for Homepage
function updateSEOForLanguage(lang) {
    const title = document.querySelector('title');
    const description = document.querySelector('meta[name="description"]');
    
    if (lang === 'fr') {
        // French SEO for Homepage
        title.textContent = 'VAI Studio - Création Sites Web Polynésie Française | Design Web Moorea & Tahiti';
        description.setAttribute('content', 'Solutions web professionnelles pour entreprises polynésiennes. Sites tourisme, restaurants, systèmes réservation. Qualité internationale, prix locaux - Basé à Moorea.');
        document.documentElement.setAttribute('lang', 'fr');
    } else {
        // English SEO for Homepage
        title.textContent = 'VAI Studio - Web Design French Polynesia | Moorea & Tahiti Digital Solutions';
        description.setAttribute('content', 'Professional web solutions for French Polynesian businesses. Tourism sites, restaurants, booking systems. International quality, local prices - Based in Moorea.');
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

// Loading Screen Management
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loadingScreen');
    const body = document.body;
    
    // Minimum loading time of 1.5 seconds for better mobile performance
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        body.classList.remove('loading');
    }, 1500);
});

// Load saved language preference
window.addEventListener('load', () => {
    const savedLang = SafeStorage.getItem('preferred-language') || 'fr';
    if (savedLang && savedLang !== document.body.getAttribute('data-current-lang')) {
        switchLanguage(savedLang);
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

// Parallax effect for hero background (desktop only)
window.addEventListener('mousemove', (e) => {
    const heroBackground = document.getElementById('hero-bg');
    if (heroBackground && window.innerWidth > 768) {
        const x = (e.clientX / window.innerWidth) * 10;
        const y = (e.clientY / window.innerHeight) * 10;
        heroBackground.style.transform = `translate(${x}px, ${y}px)`;
    }
});


// =================================================
// ENHANCED JOURNEY EXPERIENCE CLASS (Corrected)
// =================================================

/**
 * Manages all interactivity for the "Journey" section.
 */
class EnhancedJourneyExperience {
    constructor() {
        this.elements = {
            section: document.querySelector('.journey-experience-section'),
            heroButtons: document.querySelectorAll('.hero-journey-btn'),
            textSteps: document.querySelectorAll('.journey-step'),
            screens: document.querySelectorAll('.journey-screen'),
            dots: document.querySelectorAll('.progress-dot'),
            paths: document.querySelectorAll('.journey-path'),
        };

        if (!this.elements.section) {
            console.log('Journey section not found, skipping initialization.');
            return;
        }

        this.currentJourney = 'tourism'; // Default journey
        this.isDesktop = window.innerWidth > 768;

        this.init();
    }

    init() {
        // Set a default journey on page load.
        this.selectJourney(this.currentJourney, true);

        // Add event listeners for hero buttons.
        this.elements.heroButtons.forEach(btn => {
            btn.addEventListener('click', () => this.selectJourney(btn.dataset.journey));
        });

        // Setup desktop-specific features.
        if (this.isDesktop) {
            this.setupStepObserver();
            this.elements.dots.forEach(dot => {
                dot.addEventListener('click', () => this.scrollToStep(dot.dataset.step));
            });
        }
    }
    
    selectJourney(journey, isInitialLoad = false) {
        this.currentJourney = journey;

        this.elements.heroButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.journey === journey));
        this.elements.paths.forEach(path => path.classList.toggle('active', path.dataset.journey === journey));

        // Always reset to the first step when a new journey is selected
        this.updateScreenAndProgress(1); 

        if (this.isDesktop && !isInitialLoad) {
            this.elements.section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    setupStepObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -40% 0px',
            threshold: 0.1,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const stepEl = entry.target;
                    // Ensure we only act on steps within the *active* journey path
                    if (stepEl.closest('.journey-path.active')) {
                        const stepNumber = this.getStepNumber(stepEl.dataset.step);
                        this.updateScreenAndProgress(stepNumber);
                    }
                }
            });
        }, observerOptions);
        
        this.elements.textSteps.forEach(step => observer.observe(step));
    }

    updateScreenAndProgress(stepNumber) {
        const stepName = this.getStepName(stepNumber);

        const targetScreen = document.querySelector(`.journey-screen[data-journey="${this.currentJourney}"][data-step="${stepName}"]`);
        this.elements.screens.forEach(s => s.classList.remove('active'));
        if (targetScreen) targetScreen.classList.add('active');

        this.elements.dots.forEach(dot => dot.classList.toggle('active', parseInt(dot.dataset.step) === stepNumber));

        if (this.isDesktop) {
            const activePath = document.querySelector(`.journey-path[data-journey="${this.currentJourney}"]`);
            activePath?.querySelectorAll('.journey-step').forEach(step => {
                step.classList.toggle('active-step', step.dataset.step === stepName);
            });
        }
    }

    scrollToStep(stepNumber) {
        const stepName = this.getStepName(stepNumber);
        const targetStep = document.querySelector(`.journey-path.active .journey-step[data-step="${stepName}"]`);
        if (targetStep) {
            targetStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // --- Helper Functions ---
    getStepName = (num) => ({ 1: 'problem', 2: 'solution', 3: 'result' }[num]);
    getStepNumber = (name) => ({ 'problem': 1, 'solution': 2, 'result': 3 }[name]);
}


// =================================================
// ENHANCED HOMEPAGE INITIALIZATION
// =================================================

// Initialize the enhanced journey experience
let enhancedJourneyExperience;

// Enhanced homepage tracking
function initEnhancedHomepageTracking() {
    // Track hero journey interactions
    const heroJourneyButtons = document.querySelectorAll('.hero-journey-btn');
    heroJourneyButtons.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            const journey = this.getAttribute('data-journey');
            const journeyTitle = this.querySelector('.journey-title').textContent;
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'hero_journey_button_click', {
                    'event_category': 'Hero Interaction',
                    'event_label': `${journey}: ${journeyTitle}`,
                    'value': index + 1
                });
            }
        });
    });
    
    // Track journey CTA interactions
    const journeyCTAs = document.querySelectorAll('.journey-cta .btn');
    journeyCTAs.forEach((cta, index) => {
        cta.addEventListener('click', function() {
            const journeySection = this.closest('.journey-path');
            const journey = journeySection ? journeySection.getAttribute('data-journey') : 'unknown';
            const buttonText = this.textContent.trim();
            const isSecondary = this.classList.contains('btn-secondary');
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'enhanced_journey_cta_click', {
                    'event_category': 'Journey CTA',
                    'event_label': `${journey} - ${buttonText}`,
                    'value': isSecondary ? 0 : 1
                });
            }
        });
    });
}

// Enhanced scroll depth tracking
function initEnhancedScrollTracking() {
    let maxScroll = 0;
    const scrollTracker = throttle(() => {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            if (maxScroll % 25 === 0 && maxScroll > 0) {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'enhanced_scroll_depth', {
                        'event_category': 'Enhanced Homepage',
                        'event_label': 'Scroll Depth',
                        'value': maxScroll
                    });
                }
            }
        }
    }, 1000);
    
    window.addEventListener('scroll', scrollTracker, { passive: true });
}

// Mobile journey experience handling
function initMobileJourneyExperience() {
    if (window.innerWidth <= 768) {
        // On mobile, journey experience is simplified
        const heroJourneyButtons = document.querySelectorAll('.hero-journey-btn');
        const journeyPaths = document.querySelectorAll('.journey-path');
        
        heroJourneyButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const journey = this.getAttribute('data-journey');
                
                // Update active states
                heroJourneyButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Show selected journey
                journeyPaths.forEach(path => {
                    path.classList.remove('active');
                    if (path.getAttribute('data-journey') === journey) {
                        path.classList.add('active');
                    }
                });
                
                // Update screens
                const screens = document.querySelectorAll('.journey-screen');
                screens.forEach(screen => {
                    screen.classList.remove('active');
                    if (screen.getAttribute('data-journey') === journey && 
                        screen.getAttribute('data-step') === 'problem') {
                        screen.classList.add('active');
                    }
                });
            });
        });
    }
}

// Utility throttle function
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

// Initialize Journey Experience
let journeyExperience;

// =================================================
// HOMEPAGE JOURNEY SPECIFIC FUNCTIONS
// =================================================

// Enhanced CTA tracking for journey buttons
function initJourneyCTATracking() {
    // Track journey CTA clicks
    document.querySelectorAll('.journey-cta .btn').forEach((btn, index) => {
        btn.addEventListener('click', function() {
            const journeySection = this.closest('.journey-path');
            const journey = journeySection ? journeySection.getAttribute('data-journey') : 'unknown';
            const buttonText = this.textContent.trim();
            const isSecondary = this.classList.contains('btn-secondary');
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'journey_cta_click', {
                    'event_category': 'Journey CTA',
                    'event_label': `${journey} - ${buttonText}`,
                    'value': isSecondary ? 0 : 1
                });
            }
        });
    });
    
    // Track pricing info views
    const pricingElements = document.querySelectorAll('.pricing-info');
    if (pricingElements.length > 0) {
        const pricingObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const journeySection = entry.target.closest('.journey-path');
                    const journey = journeySection ? journeySection.getAttribute('data-journey') : 'unknown';
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'pricing_view', {
                            'event_category': 'Journey Experience',
                            'event_label': `${journey} pricing viewed`,
                            'value': 1
                        });
                    }
                }
            });
        }, { threshold: 0.8 });
        
        pricingElements.forEach(element => {
            pricingObserver.observe(element);
        });
    }
}

// Journey completion tracking
function trackJourneyCompletion() {
    const resultSections = document.querySelectorAll('.journey-section[data-step="result"]');
    
    if (resultSections.length > 0) {
        const completionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const journeySection = entry.target.closest('.journey-path');
                    const journey = journeySection ? journeySection.getAttribute('data-journey') : 'unknown';
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'journey_completion', {
                            'event_category': 'Journey Experience',
                            'event_label': `${journey} journey completed`,
                            'value': 3
                        });
                    }
                }
            });
        }, { threshold: 0.7 });
        
        resultSections.forEach(section => {
            completionObserver.observe(section);
        });
    }
}

// Enhanced scroll depth tracking for journey sections
const optimizedJourneyScrollDepth = throttle(() => {
    if (!journeyExperience || !journeyExperience.isJourneyVisible()) return;
    
    const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (maxScroll % 25 === 0 && maxScroll > 0) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'journey_scroll_depth', {
                    'event_category': 'Journey Engagement',
                    'event_label': 'Journey Scroll Depth',
                    'value': maxScroll
                });
            }
        }
    }
}, 1000);

window.addEventListener('scroll', optimizedJourneyScrollDepth, { passive: true });

// =================================================
// HOMEPAGE SPECIFIC FUNCTIONS
// =================================================

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

// Homepage interaction tracking
function initHomepageTracking() {
    // Track hero CTA clicks
    const heroCTAs = document.querySelectorAll('.hero-buttons .btn');
    heroCTAs.forEach((cta, index) => {
        cta.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            const buttonType = this.classList.contains('btn-primary') ? 'Primary' : 'Secondary';
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'hero_cta_click', {
                    'event_category': 'Homepage CTA',
                    'event_label': `${buttonType}: ${buttonText}`,
                    'value': index + 1
                });
            }
        });
    });
    
    // Track social impact teaser interactions
    const impactTeaser = document.querySelector('.social-impact-teaser');
    if (impactTeaser) {
        let impactViewed = false;
        
        const impactObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !impactViewed) {
                    impactViewed = true;
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'impact_teaser_view', {
                            'event_category': 'Homepage Engagement',
                            'event_label': 'Social Impact Teaser',
                            'value': 1
                        });
                    }
                }
            });
        }, { threshold: 0.5 });
        
        impactObserver.observe(impactTeaser);
        
        // Track impact CTA click
        const impactCTA = impactTeaser.querySelector('.btn-impact');
        if (impactCTA) {
            impactCTA.addEventListener('click', function() {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'impact_cta_click', {
                        'event_category': 'Homepage CTA',
                        'event_label': 'Social Impact Learn More',
                        'value': 1
                    });
                }
            });
        }
    }
    
    // Track about teaser interactions
    const aboutTeaser = document.querySelector('.about-teaser');
    if (aboutTeaser) {
        const aboutCTA = aboutTeaser.querySelector('.btn-secondary');
        if (aboutCTA) {
            aboutCTA.addEventListener('click', function() {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'about_cta_click', {
                        'event_category': 'Homepage CTA',
                        'event_label': 'Learn More About Kevin',
                        'value': 1
                    });
                }
            });
        }
    }
    
    // Track final CTA interactions
    const finalCTAs = document.querySelectorAll('.final-cta-buttons .btn');
    finalCTAs.forEach((cta, index) => {
        cta.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            const buttonType = this.classList.contains('btn-primary') ? 'Primary' : 'Secondary';
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'final_cta_click', {
                    'event_category': 'Homepage CTA',
                    'event_label': `${buttonType}: ${buttonText}`,
                    'value': index + 1
                });
            }
        });
    });
}

// Track scroll depth for engagement
const optimizedScrollDepth = throttle(() => {
    const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (maxScroll % 25 === 0 && maxScroll > 0) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'scroll_depth_homepage', {
                    'event_category': 'Homepage Engagement',
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

// Enhanced smooth scrolling with journey awareness
function smoothScrollToSection(targetId) {
    const target = document.querySelector(targetId);
    if (!target) return;
    
    const navHeight = document.getElementById('navbar')?.offsetHeight || 80;
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
    
    // If scrolling to journey experience, reset to first step
    if (targetId === '#journey-experience' && journeyExperience) {
        journeyExperience.scrollToStep(1);
    } else {
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Enhanced resize handler with proper cleanup
function handleResize() {
    timerManager.clearAllTimers();
    
    // Restart services showcase if visible
    if (servicesShowcase && servicesShowcase.isVisible) {
        setTimeout(() => {
            servicesShowcase.resumeAutoRotate();
        }, 500);
    }
}

const throttledResize = throttle(handleResize, 250);
window.addEventListener('resize', throttledResize);

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (mobileMenu && mobileToggle && !mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        mobileMenu.classList.remove('active');
    }
});

// Prevent body scroll when mobile menu is open
const mobileMenuObserver = new MutationObserver(() => {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu && mobileMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});

if (document.getElementById('mobileMenu')) {
    mobileMenuObserver.observe(document.getElementById('mobileMenu'), {
        attributes: true,
        attributeFilter: ['class']
    });
}

// Enhanced floating shapes animation (desktop only)
if (window.innerWidth > 768) {
    document.querySelectorAll('.shape').forEach((shape, index) => {
        const animationDuration = 8 + (index * 2);
        shape.style.animationDuration = `${animationDuration}s`;
    });
}

// Performance optimizations for mobile
if (window.innerWidth <= 768) {
    // Reduce animation complexity on mobile
    document.documentElement.style.setProperty('--glass-bg', 'rgba(26, 26, 46, 0.8)');
    
    // Disable parallax on mobile
    const heroBackground = document.getElementById('hero-bg');
    if (heroBackground) {
        heroBackground.style.transform = 'none';
    }
}

// Lazy loading for non-critical images (if implemented)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}


// =================================================
// ENHANCED HOMEPAGE FUNCTIONS
// =================================================

// Enhanced homepage tracking
function initEnhancedHomepageTracking() {
    // Track hero journey interactions
    const heroJourneyButtons = document.querySelectorAll('.hero-journey-btn');
    heroJourneyButtons.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            const journey = this.getAttribute('data-journey');
            const journeyTitle = this.querySelector('.journey-title').textContent;
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'hero_journey_button_click', {
                    'event_category': 'Hero Interaction',
                    'event_label': `${journey}: ${journeyTitle}`,
                    'value': index + 1
                });
            }
        });
    });
    
    // Track journey CTA interactions
    const journeyCTAs = document.querySelectorAll('.journey-cta .btn');
    journeyCTAs.forEach((cta, index) => {
        cta.addEventListener('click', function() {
            const journeySection = this.closest('.journey-path');
            const journey = journeySection ? journeySection.getAttribute('data-journey') : 'unknown';
            const buttonText = this.textContent.trim();
            const isSecondary = this.classList.contains('btn-secondary');
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'enhanced_journey_cta_click', {
                    'event_category': 'Journey CTA',
                    'event_label': `${journey} - ${buttonText}`,
                    'value': isSecondary ? 0 : 1
                });
            }
        });
    });
}

// Enhanced scroll depth tracking
function initEnhancedScrollTracking() {
    let maxScroll = 0;
    const scrollTracker = throttle(() => {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            if (maxScroll % 25 === 0 && maxScroll > 0) {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'enhanced_scroll_depth', {
                        'event_category': 'Enhanced Homepage',
                        'event_label': 'Scroll Depth',
                        'value': maxScroll
                    });
                }
            }
        }
    }, 1000);
    
    window.addEventListener('scroll', scrollTracker, { passive: true });
}

// Mobile journey experience handling
function initMobileJourneyExperience() {
    if (window.innerWidth <= 768) {
        // On mobile, journey experience is simplified
        const heroJourneyButtons = document.querySelectorAll('.hero-journey-btn');
        const journeyPaths = document.querySelectorAll('.journey-path');
        
        heroJourneyButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const journey = this.getAttribute('data-journey');
                
                // Update active states
                heroJourneyButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Show selected journey
                journeyPaths.forEach(path => {
                    path.classList.remove('active');
                    if (path.getAttribute('data-journey') === journey) {
                        path.classList.add('active');
                    }
                });
                
                // Update screens
                const screens = document.querySelectorAll('.journey-screen');
                screens.forEach(screen => {
                    screen.classList.remove('active');
                    if (screen.getAttribute('data-journey') === journey && 
                        screen.getAttribute('data-step') === 'problem') {
                        screen.classList.add('active');
                    }
                });
            });
        });
    }
}

// Utility throttle function
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


// =================================================
// INITIALIZATION
// =================================================

// Initialize everything when DOM is ready
// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Homepage loaded - Initializing enhanced journey experience');
    
    // Initialize Enhanced Journey Experience
    enhancedJourneyExperience = new EnhancedJourneyExperience();
    
    // Initialize enhanced tracking
    initEnhancedHomepageTracking();
    initEnhancedScrollTracking();
    initMobileJourneyExperience();
    
    // Initialize existing homepage tracking
    initHomepageTracking();
    
    // Observe elements for fade-in animations
    document.querySelectorAll('.impact-teaser-content, .about-teaser-content, .final-cta-content').forEach(el => {
        observer.observe(el);
    });
    
    // Track homepage load
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            'page_title': 'Homepage with Journey Experience',
            'page_location': window.location.href,
            'event_category': 'Homepage'
        });
    }
});

// Cleanup on page unload to prevent memory leaks
window.addEventListener('beforeunload', () => {
    if (enhancedJourneyExperience) {
        enhancedJourneyExperience.destroy();
    }
    timerManager.clearAllTimers();
    
    // Cleanup observers
    if (observer) {
        observer.disconnect();
    }
});

// Export for potential external use
if (typeof window !== 'undefined') {
    window.VAIStudio = {
        enhancedJourneyExperience: enhancedJourneyExperience,
        switchLanguage: switchLanguage,
        toggleMobileMenu: toggleMobileMenu
    };
}