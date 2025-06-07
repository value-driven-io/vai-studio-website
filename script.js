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
    
    // Store preference
    localStorage.setItem('preferred-language', lang);
}

// Load saved language preference
window.addEventListener('load', () => {
    const savedLang = localStorage.getItem('preferred-language') || 'en';
    if (savedLang !== 'en') {
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
    
    // Minimum loading time of 2 seconds for smooth experience
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        body.classList.remove('loading');
    }, 2000);
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

// Parallax effect for hero background
window.addEventListener('mousemove', (e) => {
    const heroBackground = document.getElementById('hero-bg');
    if (heroBackground && window.innerWidth > 768) {
        const x = (e.clientX / window.innerWidth) * 10;
        const y = (e.clientY / window.innerHeight) * 10;
        heroBackground.style.transform = `translate(${x}px, ${y}px)`;
    }
});

// Optimized Journey scroll animation for Chrome
let ticking = false;

function updateJourneyProgress() {
    // Only run on desktop
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
    
    if (progress < 0.25) {
        // Initial state
        document.getElementById('journey-screen-1')?.classList.add('active');
        if (journeyTextDesktop) journeyTextDesktop.classList.remove('active');
    } else if (progress < 0.5) {
        // Tourism focus
        document.getElementById('journey-screen-2')?.classList.add('active');
        document.querySelector('.desktop-journey #float-card-1')?.classList.add('visible');
        if (journeyTextDesktop) journeyTextDesktop.classList.remove('active');
    } else if (progress < 0.75) {
        // Restaurant focus
        document.getElementById('journey-screen-3')?.classList.add('active');
        document.querySelector('.desktop-journey #float-card-2')?.classList.add('visible');
        if (journeyTextDesktop) journeyTextDesktop.classList.remove('active');
    } else {
        // Business/final state
        document.getElementById('journey-screen-4')?.classList.add('active');
        document.querySelector('.desktop-journey #float-card-3')?.classList.add('visible');
        document.querySelector('.desktop-journey #float-card-4')?.classList.add('visible');
        if (journeyTextDesktop) journeyTextDesktop.classList.add('active');
    }
    
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

// Mobile Journey - Static Display
function initMobileJourney() {
    if (window.innerWidth <= 768) {
        // Show all mobile content immediately
        const mobileCards = document.querySelectorAll('.service-card-float');
        const journeyText = document.getElementById('journey-text');
        const firstScreen = document.getElementById('journey-screen-1');
        
        // Make sure first screen is visible
        document.querySelectorAll('.screen-content').forEach(screen => {
            screen.classList.remove('active');
        });
        if (firstScreen) firstScreen.classList.add('active');
        
        // Show all cards and text
        mobileCards.forEach(card => {
            card.classList.add('visible');
            card.style.opacity = '1';
            card.style.transform = 'none';
        });
        
        if (journeyText) {
            journeyText.classList.add('active');
            journeyText.style.opacity = '1';
        }
    }
}

// Call on resize and load
window.addEventListener('resize', initMobileJourney);
window.addEventListener('load', initMobileJourney);

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

// Initialize scroll effects with performance optimization
window.addEventListener('scroll', requestTick, { passive: true });

window.addEventListener('resize', () => {
    requestTick();
    // Close mobile menu on resize
    if (window.innerWidth > 768) {
        document.getElementById('mobileMenu').classList.remove('active');
    }
});

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
document.querySelectorAll('.service-card, .section-header, .about-content, .contact-content, .social-impact-content').forEach(el => {
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
    
    if (!mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        mobileMenu.classList.remove('active');
    }
});

// Prevent body scroll when mobile menu is open
const mobileMenuObserver = new MutationObserver(() => {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu.classList.contains('active')) {
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


// Enhanced Language Switching with SEO
function switchLanguage(lang) {
    document.body.setAttribute('data-current-lang', lang);
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-lang-btn="${lang}"]`).classList.add('active');

    // Update SEO Meta Tags
    updateSEOForLanguage(lang);
    
    // Track language switch
    if (typeof gtag !== 'undefined') {
        trackLanguageSwitch(lang);
    }
    
    // Store preference
    localStorage.setItem('preferred-language', lang);
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

// Enhanced Analytics Functions (add these if they don't exist)
function trackLanguageSwitch(language) {
    gtag('event', 'language_switch', {
        'event_category': 'User Interaction',
        'event_label': language,
        'value': language === 'fr' ? 1 : 0
    });
}