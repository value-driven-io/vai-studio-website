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
    document.querySelector(`[data-lang-btn="${lang}"]`).classList.add('active');

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

// Dynamic SEO Meta Tag Switching
function updateSEOForLanguage(lang) {
    const title = document.querySelector('title');
    const description = document.querySelector('meta[name="description"]');
    
    if (lang === 'fr') {
        // French SEO
        title.textContent = 'VAI Studio - Création Sites Web Polynésie Française | Solutions Numériques Moorea Tahiti';
        description.setAttribute('content', 'Conception de sites web professionnels, systèmes de réservation et solutions numériques pour entreprises polynésiennes. Basé à Moorea. Expertise internationale, authenticité polynésienne.');
        document.documentElement.setAttribute('lang', 'fr');
    } else {
        // English SEO
        title.textContent = 'VAI Studio - Web Design French Polynesia | Moorea & Tahiti Digital Solutions';
        description.setAttribute('content', 'Professional web design, booking systems & digital solutions for French Polynesian businesses. Based in Moorea. International expertise, Polynesian authenticity.');
        document.documentElement.setAttribute('lang', 'en');
    }
}

// Load saved language preference
window.addEventListener('load', () => {
    const savedLang = SafeStorage.getItem('preferred-language') || 'fr';
    if (savedLang && savedLang !== document.body.getAttribute('data-current-lang')) {
        switchLanguage(savedLang);
    }
});

// Mobile Menu Toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active');
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

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Parallax effect for hero background (desktop only)
window.addEventListener('mousemove', (e) => {
    const heroBackground = document.getElementById('hero-bg');
    if (heroBackground && window.innerWidth > 768) {
        const x = (e.clientX / window.innerWidth) * 10;
        const y = (e.clientY / window.innerHeight) * 10;
        heroBackground.style.transform = `translate(${x}px, ${y}px)`;
    }
});

// Enhanced Journey Controls - Desktop
let currentJourneyStep = 0;

function goToJourneyStep(step) {
    currentJourneyStep = step;
    
    // Update dots
    document.querySelectorAll('.journey-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === step);
    });
    
    // Update screens
    document.querySelectorAll('.screen-content').forEach((screen, index) => {
        screen.classList.toggle('active', index === step);
    });
    
    // Update floating cards
    document.querySelectorAll('.service-card-float').forEach(card => {
        card.classList.remove('visible');
    });
    
    // Show appropriate cards based on step
    if (step === 1) {
        document.querySelector('#float-card-1')?.classList.add('visible');
    } else if (step === 2) {
        document.querySelector('#float-card-2')?.classList.add('visible');
    } else if (step === 3) {
        document.querySelector('#float-card-3')?.classList.add('visible');
        document.querySelector('#float-card-4')?.classList.add('visible');
        document.querySelector('#journey-text-desktop')?.classList.add('active');
    } else {
        document.querySelector('#journey-text-desktop')?.classList.remove('active');
    }
    
    // Track journey interaction
    if (typeof gtag !== 'undefined') {
        gtag('event', 'journey_step', {
            'event_category': 'User Interaction',
            'event_label': `Step ${step}`,
            'value': step
        });
    }
}

// Auto-advance journey on desktop
function startJourneyAutoplay() {
    if (window.innerWidth > 768) {
        timerManager.startTimer('journey', () => {
            currentJourneyStep = (currentJourneyStep + 1) % 4;
            goToJourneyStep(currentJourneyStep);
        }, 4000);
    }
}

function stopJourneyAutoplay() {
    timerManager.clearTimer('journey');
}

// Start autoplay when journey section is visible
const journeyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && window.innerWidth > 768) {
            startJourneyAutoplay();
        } else {
            stopJourneyAutoplay();
        }
    });
});

// Mobile Service Slider
let currentMobileSlide = 0;
const totalMobileSlides = 4;

function goToMobileSlide(slide) {
    currentMobileSlide = slide;
    const track = document.getElementById('mobileServiceTrack');
    if (track) {
        track.style.transform = `translateX(-${slide * 100}%)`;
    }
    
    // Update dots
    document.querySelectorAll('.mobile-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === slide);
    });
    
    // Track mobile slider interaction
    if (typeof gtag !== 'undefined') {
        gtag('event', 'mobile_slider', {
            'event_category': 'User Interaction',
            'event_label': `Slide ${slide}`,
            'value': slide
        });
    }
}

// Auto-advance mobile slider
function startMobileSliderAutoplay() {
    if (window.innerWidth <= 768) {
        timerManager.startTimer('mobileSlider', () => {
            currentMobileSlide = (currentMobileSlide + 1) % totalMobileSlides;
            goToMobileSlide(currentMobileSlide);
        }, 3000);
    }
}

function stopMobileSliderAutoplay() {
    timerManager.clearTimer('mobileSlider');
}

// Touch handling for mobile slider
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    stopMobileSliderAutoplay();
}

function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].clientX;
    handleSwipe();
    // Restart autoplay after touch interaction
    setTimeout(startMobileSliderAutoplay, 2000);
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0 && currentMobileSlide < totalMobileSlides - 1) {
            // Swipe left - next slide
            goToMobileSlide(currentMobileSlide + 1);
        } else if (diff < 0 && currentMobileSlide > 0) {
            // Swipe right - previous slide
            goToMobileSlide(currentMobileSlide - 1);
        }
    }
}

// FAQ Toggle Function
function toggleFAQ(faqItem) {
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Open clicked item if it wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
        
        // Track FAQ interaction
        const question = faqItem.querySelector('h3').textContent;
        if (typeof gtag !== 'undefined') {
            gtag('event', 'faq_interaction', {
                'event_category': 'FAQ',
                'event_label': question,
                'value': 1
            });
        }
    }
}

// Email Signup Handler
function handleEmailSignup(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    
    // Track email signup
    if (typeof gtag !== 'undefined') {
        gtag('event', 'email_signup', {
            'event_category': 'Lead Generation',
            'event_label': 'Newsletter Signup',
            'value': 1
        });
    }
    
    // Here you would integrate with your email service (JotForm)
    alert(document.body.getAttribute('data-current-lang') === 'fr' ? 
        'Merci ! Tu recevras bientôt nos conseils numériques.' : 
        'Thank you! You\'ll receive our digital tips soon.');
    
    // Clear form
    event.target.reset();
}

// Optimized Journey scroll animation for Chrome
let ticking = false;

function updateJourneyProgress() {
    // Only run on desktop and if not in manual control mode
    if (window.innerWidth <= 768) return;
    
    const journeySection = document.querySelector('.journey-section');
    if (!journeySection) return;
    
    const journeyRect = journeySection.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -journeyRect.top / (journeyRect.height - window.innerHeight)));
    
    // Update screen content based on scroll progress
    const screens = document.querySelectorAll('#journey-screen-1, #journey-screen-2, #journey-screen-3, #journey-screen-4');
    const cards = document.querySelectorAll('.desktop-journey .service-card-float');
    const showcase = document.getElementById('showcase');
    const journeyTextDesktop = document.getElementById('journey-text-desktop');
    
    // Reset all screens and cards
    screens.forEach(screen => screen.classList.remove('active'));
    cards.forEach(card => card.classList.remove('visible'));
    
    let step = 0;
    if (progress < 0.25) {
        step = 0;
        document.getElementById('journey-screen-1')?.classList.add('active');
        if (journeyTextDesktop) journeyTextDesktop.classList.remove('active');
    } else if (progress < 0.5) {
        step = 1;
        document.getElementById('journey-screen-2')?.classList.add('active');
        document.querySelector('.desktop-journey #float-card-1')?.classList.add('visible');
        if (journeyTextDesktop) journeyTextDesktop.classList.remove('active');
    } else if (progress < 0.75) {
        step = 2;
        document.getElementById('journey-screen-3')?.classList.add('active');
        document.querySelector('.desktop-journey #float-card-2')?.classList.add('visible');
        if (journeyTextDesktop) journeyTextDesktop.classList.remove('active');
    } else {
        step = 3;
        document.getElementById('journey-screen-4')?.classList.add('active');
        document.querySelector('.desktop-journey #float-card-3')?.classList.add('visible');
        document.querySelector('.desktop-journey #float-card-4')?.classList.add('visible');
        if (journeyTextDesktop) journeyTextDesktop.classList.add('active');
    }
    
    // Update dots
    document.querySelectorAll('.journey-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === step);
    });
    
    // Subtle showcase scaling with performance optimization
    if (showcase) {
        const scale = 1 + progress * 0.05;
        const rotation = progress * 2 - 1;
        showcase.style.transform = `scale(${scale}) rotateY(${rotation}deg)`;
    }
    
    ticking = false;
}

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateJourneyProgress);
        ticking = true;
    }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add touch listeners to mobile slider
    const mobileSlider = document.querySelector('.mobile-service-slider');
    if (mobileSlider) {
        mobileSlider.addEventListener('touchstart', handleTouchStart, {passive: true});
        mobileSlider.addEventListener('touchend', handleTouchEnd, {passive: true});
    }
    
    // Initialize mobile slider autoplay
    if (window.innerWidth <= 768) {
        startMobileSliderAutoplay();
    }
    
    // Observe journey section for desktop autoplay
    const journeySection = document.querySelector('.journey-section');
    if (journeySection) {
        journeyObserver.observe(journeySection);
    }
});

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.getElementById('navbar').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});


// Optimized scroll handlers
const optimizedNavbarScroll = throttle(() => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}, 16);

const optimizedJourneyUpdate = throttle(() => {
    updateJourneyProgress();
}, 16);

const optimizedScrollDepth = throttle(() => {
    const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (maxScroll % 25 === 0 && maxScroll > 0) {
            gtag('event', 'scroll', {
                'event_category': 'Engagement',
                'event_label': 'Scroll Depth',
                'value': maxScroll
            });
        }
    }
}, 1000);

// Initialize scroll effects with performance optimization
window.addEventListener('scroll', optimizedNavbarScroll, { passive: true });
window.addEventListener('scroll', optimizedJourneyUpdate, { passive: true });
window.addEventListener('scroll', optimizedScrollDepth, { passive: true });


// Enhanced resize handler with proper cleanup
function handleResize() {
    timerManager.clearAllTimers();
    
    if (window.innerWidth > 768) {
        document.getElementById('mobileMenu')?.classList.remove('active');
        const journeySection = document.querySelector('.journey-section');
        if (journeySection && journeySection.getBoundingClientRect().top < window.innerHeight) {
            startJourneyAutoplay();
        }
    } else {
        startMobileSliderAutoplay();
    }
}

const throttledResize = throttle(handleResize, 250);
window.addEventListener('resize', throttledResize);

updateJourneyProgress();

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

// Observe all service cards and sections
document.querySelectorAll('.service-card, .section-header, .about-content, .contact-content, .social-impact-content, .faq-item').forEach(el => {
    observer.observe(el);
});

// Enhanced floating shapes animation (desktop only)
if (window.innerWidth > 768) {
    document.querySelectorAll('.shape').forEach((shape, index) => {
        const animationDuration = 8 + (index * 2);
        shape.style.animationDuration = `${animationDuration}s`;
    });
}

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

// Enhanced Analytics Functions
function trackLanguageSwitch(language) {
    gtag('event', 'language_switch', {
        'event_category': 'User Interaction',
        'event_label': language,
        'value': language === 'fr' ? 1 : 0
    });
}


// Track service card interactions
document.querySelectorAll('.service-card').forEach((card, index) => {
    card.addEventListener('click', function() {
        const serviceName = card.querySelector('h3').textContent;
        gtag('event', 'service_interest', {
            'event_category': 'Services',
            'event_label': serviceName,
            'value': index + 1
        });
    });
});

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

    // Cleanup on page unload to prevent memory leaks
    window.addEventListener('beforeunload', () => {
        timerManager.clearAllTimers();
        if (journeyObserver) {
            journeyObserver.disconnect();
        }
    });

}

