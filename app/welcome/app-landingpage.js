// VAI Landing Page JavaScript
// app/welcome/app-landingpage.js


// QR CODE TRACKING

// QR Tracking Data Capture
(function initQRTracking() {
    // Capture QR tracking data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const utmSource = urlParams.get('utm_source');
    const utmCampaign = urlParams.get('utm_campaign');
    const utmMedium = urlParams.get('utm_medium');
    const utmContent = urlParams.get('utm_content');
    
    // If we have QR tracking data, process it
    if (sessionId || utmSource || utmCampaign) {
        console.log('QR tracking detected:', {
            sessionId,
            utmSource,
            utmCampaign,
            utmMedium,
            utmContent
        });
        
        // Get tracking data from localStorage (set by QR redirect page)
        let trackingData = {};
        try {
            trackingData = JSON.parse(localStorage.getItem('vai_qr_tracking') || '{}');
        } catch (e) {
            console.warn('Could not parse QR tracking data:', e);
        }
        
        // Merge URL parameters with tracking data
        const fullTrackingData = {
            ...trackingData,
            session_id: sessionId,
            utm_source: utmSource,
            utm_campaign: utmCampaign,
            utm_medium: utmMedium,
            utm_content: utmContent,
            landing_timestamp: new Date().toISOString(),
            page_url: window.location.href
        };
        
        // Enhanced Google Analytics tracking for QR landing
        if (typeof gtag !== 'undefined') {
            gtag('event', 'qr_landing_page_view', {
                campaign_name: fullTrackingData.campaign || utmCampaign,
                source: fullTrackingData.source || utmSource,
                medium: fullTrackingData.medium || utmMedium,
                location: fullTrackingData.location || utmContent,
                session_id: sessionId,
                event_category: 'QR Code',
                event_label: 'Landing Page View'
            });
            
            // Track as conversion for QR campaigns
            if (utmMedium === 'qr_code') {
                gtag('event', 'qr_campaign_view', {
                    campaign_name: utmCampaign,
                    source: utmSource,
                    content: utmContent
                });
            }
        }
        
        // Store complete attribution data for registration
        sessionStorage.setItem('vai_attribution', JSON.stringify(fullTrackingData));
        
        // Optional: Send to Supabase for detailed tracking
        if (window.supabase) {
            sendQRTrackingToSupabase(fullTrackingData);
        }
        
        // Clean up localStorage after processing
        localStorage.removeItem('vai_qr_tracking');
    }
})();

// Function to send QR tracking to Supabase (optional)
async function sendQRTrackingToSupabase(trackingData) {
    try {
        const { data, error } = await window.supabase
            .from('qr_scans')
            .insert([{
                session_id: trackingData.session_id,
                campaign: trackingData.campaign || trackingData.utm_campaign,
                source: trackingData.source || trackingData.utm_source,
                medium: trackingData.medium || trackingData.utm_medium,
                location: trackingData.location || trackingData.utm_content,
                user_agent: trackingData.user_agent || navigator.userAgent,
                referrer: trackingData.referrer || document.referrer,
                screen_width: trackingData.screen_width || screen.width,
                screen_height: trackingData.screen_height || screen.height,
                language: trackingData.language || navigator.language,
                timezone: trackingData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
            }]);
            
        if (error) {
            console.warn('QR tracking insert error:', error);
        } else {
            console.log('QR tracking data saved to Supabase');
        }
    } catch (error) {
        console.warn('Failed to send QR tracking to Supabase:', error);
    }
}


// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initAnimations();
    initCountdown();
    initFAQ();
    initForms();
    initSmoothScrolling();
    initHeaderEffects();
    initOperatorForm();
});

// Intersection Observer for animations
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all animation elements
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
    animatedElements.forEach(el => {
        if (el) observer.observe(el);
    });
}

// Countdown Timer
function initCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;

    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');

    if (!daysElement || !hoursElement || !minutesElement) return;

    function updateCountdown() {
        try {
            const launchDate = new Date('July 14, 2025 00:00:00').getTime();
            const now = new Date().getTime();
            const distance = launchDate - now;

            if (distance < 0) {
                // Launch date has passed
                countdownElement.innerHTML = '<div class="countdown-item"><span class="countdown-number">LIVE</span><span class="countdown-label">NOW</span></div>';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

            daysElement.textContent = days.toString().padStart(2, '0');
            hoursElement.textContent = hours.toString().padStart(2, '0');
            minutesElement.textContent = minutes.toString().padStart(2, '0');
        } catch (error) {
            console.warn('Countdown update error:', error);
        }
    }

    // Update immediately and then every minute
    updateCountdown();
    setInterval(updateCountdown, 60000);
}

// FAQ Toggle functionality
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            toggleFAQ(this);
        });
    });
}

function toggleFAQ(element) {
    try {
        const answer = element.nextElementSibling;
        const icon = element.querySelector('span:last-child');
        
        if (!answer || !icon) return;
        
        if (answer.classList.contains('active')) {
            answer.classList.remove('active');
            icon.textContent = '+';
            icon.style.transform = 'rotate(0deg)';
        } else {
            // Close all other FAQs
            document.querySelectorAll('.faq-answer.active').forEach(faq => {
                faq.classList.remove('active');
                const prevIcon = faq.previousElementSibling?.querySelector('span:last-child');
                if (prevIcon) {
                    prevIcon.textContent = '+';
                    prevIcon.style.transform = 'rotate(0deg)';
                }
            });
            
            // Open this FAQ
            answer.classList.add('active');
            icon.textContent = '−';
            icon.style.transform = 'rotate(180deg)';
        }
    } catch (error) {
        console.warn('FAQ toggle error:', error);
    }
}

// Form handling
function initForms() {
    // Tourist form
    const touristForm = document.getElementById('touristForm');
    if (touristForm) {
        touristForm.addEventListener('submit', handleTouristSubmission);
    }

    // Operator form
    const operatorForm = document.getElementById('operatorForm');
    if (operatorForm) {
        operatorForm.addEventListener('submit', handleOperatorSubmission);
    }
}

function handleTouristSubmission(e) {
    e.preventDefault();
    
    try {
        // Get form data
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Validate required fields
        if (!data.email || !data.name || !data.islands || !data.travel_date) {
            showMessage('Please fill in all required fields.', 'error');
            return;
        }
        
        // Validate email format
        if (!isValidEmail(data.email)) {
            showMessage('Please enter a valid email address.', 'error');
            return;
        }
        
        // Here you would send to your backend/Supabase
        console.log('Tourist Registration:', data);
        
        // Show success message
        showMessage('🎉 Success! You\'re registered for VAI launch access. Check your email for confirmation.', 'success');
        
        // Reset form
        e.target.reset();
        
        // Optional: Track conversion event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'tourist_registration', {
                'event_category': 'Lead Generation',
                'event_label': 'Tourist Registration'
            });
        }
        
    } catch (error) {
        console.error('Tourist form submission error:', error);
        showMessage('Something went wrong. Please try again.', 'error');
    }
}

function handleOperatorSubmission(e) {
    e.preventDefault();
    
    try {
        // Get form data
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Validate required fields
        const requiredFields = ['company_name', 'email', 'whatsapp', 'island', 'tour_types', 'contact_person'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
            showMessage('Please fill in all required fields.', 'error');
            return;
        }
        
        // Validate email format
        if (!isValidEmail(data.email)) {
            showMessage('Please enter a valid business email address.', 'error');
            return;
        }
        
        // Here you would send to your backend/Supabase
        console.log('Operator Registration:', data);
        
        // Show success message
        showMessage('🌺 Welcome to VAI! Your founding operator application has been submitted. We\'ll contact you within 24 hours.', 'success');
        
        // Reset form
        e.target.reset();
        
        // Hide operator form
        const operatorSection = document.getElementById('operator-form');
        if (operatorSection) {
            operatorSection.style.display = 'none';
        }
        
        // Optional: Track conversion event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'operator_registration', {
                'event_category': 'Lead Generation',
                'event_label': 'Operator Registration'
            });
        }
        
    } catch (error) {
        console.error('Operator form submission error:', error);
        showMessage('Something went wrong. Please try again.', 'error');
    }
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showMessage(message, type = 'info') {
    // Remove any existing messages
    const existingMessage = document.querySelector('.vai-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `vai-message vai-message-${type}`;
    messageEl.textContent = message;
    
    // Style the message
    messageEl.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        max-width: 90%;
        text-align: center;
        animation: slideInMessage 0.3s ease;
    `;
    
    // Add animation keyframes if not already added
    if (!document.querySelector('#vai-message-styles')) {
        const style = document.createElement('style');
        style.id = 'vai-message-styles';
        style.textContent = `
            @keyframes slideInMessage {
                from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to DOM
    document.body.appendChild(messageEl);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.style.animation = 'slideInMessage 0.3s ease reverse';
            setTimeout(() => messageEl.remove(), 300);
        }
    }, 5000);
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Header scroll effects
function initHeaderEffects() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let lastScrollY = window.scrollY;
    
    function updateHeader() {
        const currentScrollY = window.scrollY;
        
        try {
            if (currentScrollY > 100) {
                header.style.background = 'rgba(15, 23, 42, 0.95)';
                header.style.backdropFilter = 'blur(15px)';
            } else {
                header.style.background = 'rgba(15, 23, 42, 0.9)';
                header.style.backdropFilter = 'blur(10px)';
            }
            
            lastScrollY = currentScrollY;
        } catch (error) {
            console.warn('Header update error:', error);
        }
    }
    
    // Throttle scroll events
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateHeader();
                ticking = false;
            });
            ticking = true;
        }
    });
}

// Operator form show/hide functionality
function initOperatorForm() {
    const operatorLinks = document.querySelectorAll('a[href="#operator-form"]');
    const operatorSection = document.getElementById('operator-form');
    
    if (!operatorSection) return;
    
    operatorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            try {
                // Show the operator form
                operatorSection.style.display = 'block';
                
                // Smooth scroll to the form
                const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
                const targetPosition = operatorSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Add fade-in animation
                operatorSection.style.opacity = '0';
                operatorSection.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    operatorSection.style.transition = 'all 0.6s ease';
                    operatorSection.style.opacity = '1';
                    operatorSection.style.transform = 'translateY(0)';
                }, 100);
                
            } catch (error) {
                console.error('Operator form show error:', error);
            }
        });
    });
}

// Error handling for images
function initImageErrorHandling() {
    const images = document.querySelectorAll('img[onerror]');
    
    images.forEach(img => {
        img.addEventListener('error', function() {
            // The onerror attribute in HTML will handle the fallback
            console.warn('Image failed to load:', this.src);
        });
    });
}

// Initialize image error handling when DOM is ready
document.addEventListener('DOMContentLoaded', initImageErrorHandling);

// Expose functions globally for HTML event handlers (if needed)
window.toggleFAQ = toggleFAQ;

// Also initialize FAQ after DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initFAQ();
});

// Make sure FAQ is initialized
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            toggleFAQ(this);
        });
    });
}

// Optional: Performance monitoring
window.addEventListener('load', function() {
    console.log('VAI Landing Page loaded successfully');
    
    // Track page load time if analytics available
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_load_complete', {
            'event_category': 'Performance',
            'event_label': 'Landing Page'
        });
    }
});

// Handle any uncaught errors gracefully
window.addEventListener('error', function(e) {
    console.warn('JavaScript error caught:', e.error);
    // Don't show error to users, just log it
});

// Optional: Add keyboard navigation for accessibility
document.addEventListener('keydown', function(e) {
    // ESC key to close any open FAQs
    if (e.key === 'Escape') {
        const activeFAQs = document.querySelectorAll('.faq-answer.active');
        activeFAQs.forEach(faq => {
            const question = faq.previousElementSibling;
            if (question) {
                toggleFAQ(question);
            }
        });
    }
});



/* ============================================================================
   BILINGUAL LANGUAGE SYSTEM - ADD TO app-landingpage.js
   Complete implementation with translation interceptors and form integration
   ============================================================================ */

// Safe localStorage wrapper (extracted from global.js)
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

// SEO data for landing page language switching
const landingPageSEO = {
    en: {
        title: 'VAI - Unlock Paradise in French Polynesia | Launching Soon',
        description: 'Stop missing authentic French Polynesia experiences. VAI unlocks paradise with instant access to local operators, transparent pricing, and mood-powered discovery. Register for July 14th launch.',
        keywords: 'French Polynesia, Tahiti, Bora Bora, Moorea, Rangiroa, tours, authentic experiences, local operators, last minute booking, spontaneous travel, Polynesian culture'
    },
    fr: {
        title: 'VAI - Débloque le Paradis en Polynésie Française | Lancement Bientôt',
        description: 'Arrête de rater les expériences authentiques de la Polynésie française. VAI débloque le paradis avec un accès instantané aux opérateurs locaux, des prix transparents et une découverte basée sur l\'humeur. Inscris-toi pour le lancement du 14 juillet.',
        keywords: 'Polynésie française, Tahiti, Bora Bora, Moorea, Rangiroa, tours, expériences authentiques, opérateurs locaux, réservation dernière minute, voyage spontané, culture polynésienne'
    }
};

// Island-vibe French translations for error/success messages
const messageTranslations = {
    // Tourist form validation errors
    'Please fill in all required fields': {
        en: 'Please fill in all required fields',
        fr: 'Remplis tous les champs obligatoires stp'
    },
    'Please enter a valid email address': {
        en: 'Please enter a valid email address',
        fr: 'Entre une adresse email valide stp'
    },
    'Please enter a valid email address (e.g., name@example.com)': {
        en: 'Please enter a valid email address (e.g., name@example.com)',
        fr: 'Entre une adresse email valide (ex: nom@exemple.com) stp'
    },
    'Please enter your full name': {
        en: 'Please enter your full name',
        fr: 'Entre ton nom complet stp'
    },
    'Please enter your email address': {
        en: 'Please enter your email address',
        fr: 'Entre ton adresse email stp'
    },
    'Please select an island': {
        en: 'Please select an island',
        fr: 'Choisis une île stp'
    },
    'Please select your primary language': {
        en: 'Please select your primary language',
        fr: 'Choisis ta langue principale stp'
    },
    'Please agree to receive VAI launch updates': {
        en: 'Please agree to receive VAI launch updates',
        fr: 'Accepte de recevoir les updates de lancement VAI stp'
    },
    'Please agree to the Terms of Service and Privacy Policy': {
        en: 'Please agree to the Terms of Service and Privacy Policy',
        fr: 'Accepte les Conditions d\'Utilisation et la Politique de Confidentialité stp'
    },
    'Please enter a valid WhatsApp number (e.g., +1234567890)': {
        en: 'Please enter a valid WhatsApp number (e.g., +1234567890)',
        fr: 'Entre un numéro WhatsApp valide (ex: +1234567890) stp'
    },
    'This field is required': {
        en: 'This field is required',
        fr: 'Ce champ est obligatoire'
    },
    
    // Operator form validation errors
    'Please enter your company name': {
        en: 'Please enter your company name',
        fr: 'Entre le nom de ton entreprise stp'
    },
    'Please enter the contact person name': {
        en: 'Please enter the contact person name',
        fr: 'Entre le nom de la personne de contact stp'
    },
    'Please enter your business email': {
        en: 'Please enter your business email',
        fr: 'Entre ton email professionnel stp'
    },
    'Please enter a valid business email address': {
        en: 'Please enter a valid business email address',
        fr: 'Entre une adresse email professionnelle valide stp'
    },
    'Please select at least one island you operate on': {
        en: 'Please select at least one island you operate on',
        fr: 'Choisis au moins une île sur laquelle tu opères stp'
    },
    'Please select at least one tour type you offer': {
        en: 'Please select at least one tour type you offer',
        fr: 'Choisis au moins un type de tour que tu proposes stp'
    },
    'Please select your primary tour language': {
        en: 'Please select your primary tour language',
        fr: 'Choisis ta langue principale pour les tours stp'
    },
    
    // Success messages
    'Success! You\'re registered for VAI launch access. Check your email for confirmation.': {
        en: '🎉 Success! You\'re registered for VAI launch access. Check your email for confirmation.',
        fr: '🎉 Super ! Tu es inscrit pour l\'accès au lancement VAI. Vérifie ton email pour confirmation.'
    },
    '🎉 Success! You\'re registered for VAI launch access. Check your email for confirmation.': {
        en: '🎉 Success! You\'re registered for VAI launch access. Check your email for confirmation.',
        fr: '🎉 Super ! Tu es inscrit pour l\'accès au lancement VAI. Vérifie ton email pour confirmation.'
    },
    'Welcome to VAI! Your founding operator application has been submitted. We\'ll contact you within 24 hours.': {
        en: '🌺 Welcome to VAI! Your founding operator application has been submitted. We\'ll contact you within 24 hours.',
        fr: '🌺 Bienvenue à VAI ! Ta candidature d\'opérateur fondateur a été soumise. On te contactera dans les 24 heures.'
    },
    '🌺 Welcome to VAI! Your founding operator application has been submitted. We\'ll contact you within 24 hours.': {
        en: '🌺 Welcome to VAI! Your founding operator application has been submitted. We\'ll contact you within 24 hours.',
        fr: '🌺 Bienvenue à VAI ! Ta candidature d\'opérateur fondateur a été soumise. On te contactera dans les 24 heures.'
    },
    
    // Registration service success messages
    'You\'ll receive launch updates when VAI goes live on July 14th.': {
        en: 'You\'ll receive launch updates when VAI goes live on July 14th.',
        fr: 'Tu recevras les updates de lancement quand VAI sera en ligne le 14 juillet.'
    },
    'Your founding member application is being reviewed. You\'ll hear from us within 24 hours.': {
        en: 'Your founding member application is being reviewed. You\'ll hear from us within 24 hours.',
        fr: 'Ta candidature de membre fondateur est en cours d\'examen. Tu auras de nos nouvelles dans les 24 heures.'
    },
    
    // Generic errors
    'Something went wrong. Please try again.': {
        en: 'Something went wrong. Please try again.',
        fr: 'Quelque chose a foiré. Réessaie stp.'
    },
    'Connection error. Please check your internet and try again.': {
        en: 'Connection error. Please check your internet and try again.',
        fr: 'Erreur de connexion. Vérifie ton internet et réessaie stp.'
    },
    'Request timed out. Please try again.': {
        en: 'Request timed out. Please try again.',
        fr: 'Demande expirée. Réessaie stp.'
    },
    'This email is already registered. Please use a different email.': {
        en: 'This email is already registered. Please use a different email.',
        fr: 'Cet email est déjà inscrit. Utilise un email différent stp.'
    },
    'Email already registered. Please use a different email address.': {
        en: 'Email already registered. Please use a different email address.',
        fr: 'Email déjà inscrit. Utilise une adresse email différente stp.'
    },
    'Server error. Please try again in a few moments.': {
        en: 'Server error. Please try again in a few moments.',
        fr: 'Erreur serveur. Réessaie dans quelques instants stp.'
    },
    'Network error. Please check your connection.': {
        en: 'Network error. Please check your connection.',
        fr: 'Erreur réseau. Vérifie ta connexion stp.'
    },
    'Registration service not loaded. Please refresh the page.': {
        en: 'Registration service not loaded. Please refresh the page.',
        fr: 'Service d\'inscription pas chargé. Rafraîchis la page stp.'
    },
    'Registration failed. Please try again.': {
        en: 'Registration failed. Please try again.',
        fr: 'Inscription échouée. Réessaie stp.'
    },
    'Some information is invalid. Please check your entries.': {
        en: 'Some information is invalid. Please check your entries.',
        fr: 'Certaines infos sont invalides. Vérifie tes entrées stp.'
    },
    
    // Form placeholders
    'Enter your full name': {
        en: 'Enter your full name',
        fr: 'Entre ton nom complet'
    },
    'Enter your email': {
        en: 'Enter your email',
        fr: 'Entre ton email'
    },
    'e.g., +1234567890 or +689 XX XX XX XX': {
        en: 'e.g., +1234567890 or +689 XX XX XX XX',
        fr: 'ex: +1234567890 ou +689 XX XX XX XX'
    },
    'Your tour company name': {
        en: 'Your tour company name',
        fr: 'Nom de ton entreprise de tours'
    },
    'Your full name': {
        en: 'Your full name',
        fr: 'Ton nom complet'
    },
    'business@yourcompany.com': {
        en: 'business@yourcompany.com',
        fr: 'entreprise@tonentreprise.com'
    },
    'Any international format': {
        en: 'Any international format',
        fr: 'Tout format international'
    },
    'Select your primary language...': {
        en: 'Select your primary language...',
        fr: 'Sélectionne ta langue principale...'
    },
    'Select an island...': {
        en: 'Select an island...',
        fr: 'Sélectionne une île...'
    },
    'Select language...': {
        en: 'Select language...',
        fr: 'Sélectionne la langue...'
    },
    'Select range...': {
        en: 'Select range...',
        fr: 'Sélectionne une gamme...'
    },
    'No preference': {
        en: 'No preference',
        fr: 'Aucune préférence'
    }
};

/**
 * Updates the page's title and meta description based on the selected language.
 * @param {string} lang - The selected language ('fr' or 'en').
 */
function updateSEOForLanguage(lang) {
    const langSeo = landingPageSEO[lang];
    if (!langSeo) return;

    const titleTag = document.querySelector('title');
    const descriptionTag = document.querySelector('meta[name="description"]');
    const keywordsTag = document.querySelector('meta[name="keywords"]');

    if (titleTag) titleTag.textContent = langSeo.title;
    if (descriptionTag) descriptionTag.setAttribute('content', langSeo.description);
    if (keywordsTag) keywordsTag.setAttribute('content', langSeo.keywords);
    
    // Update HTML lang attribute
    document.documentElement.setAttribute('lang', lang);
}

/**
 * Switches the website's language.
 * @param {string} lang The target language ('en' or 'fr').
 */
function switchLanguage(lang) {
    if (!['en', 'fr'].includes(lang)) return;

    console.log(`🌺 Switching language to: ${lang}`);

    // Update body attribute (triggers CSS changes)
    document.body.setAttribute('data-current-lang', lang);

    // Update button active states
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.langBtn === lang);
    });

    // Update SEO meta tags
    updateSEOForLanguage(lang);
    
    // Save preference to localStorage
    SafeStorage.setItem('preferred-language', lang);

    // Update form placeholders based on language
    updateFormPlaceholders(lang);
    
    // Update island label if form is visible
    updateIslandLabelForLanguage(lang);

    // Update countdown labels
    updateCountdownLabels(lang);

    // Track language switch with analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'language_switch', {
            'event_category': 'User Interaction',
            'event_label': lang,
            'value': lang === 'fr' ? 1 : 0
        });
    }
    
    console.log(`✅ Language switched to: ${lang}`);
    
    // Dispatch custom event for other components
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

/**
 * Updates form placeholders based on current language
 * @param {string} lang - The selected language ('fr' or 'en').
 */
function updateFormPlaceholders(lang) {
    const currentTranslations = {};
    
    // Build translations object for current language
    Object.keys(messageTranslations).forEach(key => {
        if (messageTranslations[key][lang]) {
            currentTranslations[key] = messageTranslations[key][lang];
        }
    });
    
    // Update tourist form placeholders
    const touristNameInput = document.getElementById('tourist-name');
    const touristEmailInput = document.getElementById('tourist-email');
    const whatsappInput = document.querySelector('input[name="whatsapp_number"]');
    
    if (touristNameInput) touristNameInput.placeholder = currentTranslations['Enter your full name'] || '';
    if (touristEmailInput) touristEmailInput.placeholder = currentTranslations['Enter your email'] || '';
    if (whatsappInput) whatsappInput.placeholder = currentTranslations['e.g., +1234567890 or +689 XX XX XX XX'] || '';
    
    // Update operator form placeholders
    const companyInput = document.getElementById('company-name');
    const contactInput = document.getElementById('contact-person');
    const businessEmailInput = document.getElementById('operator-email');
    const businessWhatsappInput = document.getElementById('operator-whatsapp');
    
    if (companyInput) companyInput.placeholder = currentTranslations['Your tour company name'] || '';
    if (contactInput) contactInput.placeholder = currentTranslations['Your full name'] || '';
    if (businessEmailInput) businessEmailInput.placeholder = currentTranslations['business@yourcompany.com'] || '';
    if (businessWhatsappInput) businessWhatsappInput.placeholder = currentTranslations['Any international format'] || '';
    
    // Update select option texts (first empty option)
    const selects = document.querySelectorAll('select.form-input');
    selects.forEach(select => {
        const firstOption = select.querySelector('option[value=""]');
        if (firstOption) {
            const originalText = firstOption.textContent;
            const translatedText = currentTranslations[originalText.trim()] || originalText;
            firstOption.textContent = translatedText;
        }
    });
}

/**
 * Updates island label based on user type and language
 * @param {string} lang - The selected language ('fr' or 'en').
 */
function updateIslandLabelForLanguage(lang) {
    const form = document.getElementById('tourist-form');
    if (!form) return;
    
    const checkedInput = form.querySelector('input[name="user_type"]:checked');
    if (!checkedInput) return;
    
    const islandLabel = form.querySelector('.island-question');
    if (!islandLabel) return;
    
    const islandLabelEn = islandLabel.querySelector('[data-lang="en"]');
    const islandLabelFr = islandLabel.querySelector('[data-lang="fr"]');
    
    if (lang === 'en' && islandLabelEn) {
        islandLabelEn.textContent = checkedInput.value === 'local' 
            ? 'Which island do you live on? *'
            : 'Which island will you visit first? *';
    } else if (lang === 'fr' && islandLabelFr) {
        islandLabelFr.textContent = checkedInput.value === 'local' 
            ? 'Sur quelle île vis-tu ? *'
            : 'Quelle île visiteras-tu en premier ? *';
    }
}

/**
 * Updates countdown labels based on language
 * @param {string} lang - The selected language ('fr' or 'en').
 */
function updateCountdownLabels(lang) {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;

    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');

    if (!daysElement || !hoursElement || !minutesElement) return;

    // Check if launch date has passed
    const launchDate = new Date('July 14, 2025 00:00:00').getTime();
    const now = new Date().getTime();
    
    if (launchDate - now < 0) {
        // Launch date has passed - show in current language
        const liveText = lang === 'en' ? 'LIVE' : 'EN DIRECT';
        const nowText = lang === 'en' ? 'NOW' : 'MAINTENANT';
        
        countdownElement.innerHTML = `<div class="countdown-item"><span class="countdown-number">${liveText}</span><span class="countdown-label">${nowText}</span></div>`;
    }
}

/**
 * Translates error/success messages based on current language
 * @param {string} message - Original message to translate
 * @param {string} lang - Target language
 * @returns {string} - Translated message
 */
function translateMessage(message, lang) {
    // Try exact match first
    if (messageTranslations[message] && messageTranslations[message][lang]) {
        return messageTranslations[message][lang];
    }
    
    // Try partial match for dynamic messages containing variable parts
    for (const key in messageTranslations) {
        if (message.includes(key) && messageTranslations[key][lang]) {
            return messageTranslations[key][lang];
        }
    }
    
    // For messages that contain names (like "Welcome John!")
    const patterns = [
        { 
            en: /Welcome (.+)! You'll receive launch updates/,
            fr: /Bienvenue (.+) ! Tu recevras les updates de lancement/,
            template: {
                en: 'Welcome $1! You\'ll receive launch updates when VAI goes live on July 14th.',
                fr: 'Bienvenue $1 ! Tu recevras les updates de lancement quand VAI sera en ligne le 14 juillet.'
            }
        },
        {
            en: /Welcome (.+)! Your founding member application/,
            fr: /Bienvenue (.+) ! Ta candidature de membre fondateur/,
            template: {
                en: 'Welcome $1! Your founding member application is being reviewed. You\'ll hear from us within 24 hours.',
                fr: 'Bienvenue $1 ! Ta candidature de membre fondateur est en cours d\'examen. Tu auras de nos nouvelles dans les 24 heures.'
            }
        }
    ];
    
    for (const pattern of patterns) {
        const currentLangPattern = pattern[lang === 'en' ? 'fr' : 'en']; // Check opposite language pattern
        const match = message.match(currentLangPattern);
        if (match) {
            return pattern.template[lang].replace('$1', match[1]);
        }
    }
    
    // Return original message if no translation found
    return message;
}

// ============================================================================
// TRANSLATION INTERCEPTOR SYSTEM
// ============================================================================

/**
 * Intercepts and translates showMessage calls from registration-handler.js
 */
function setupMessageInterceptor() {
    console.log('🌺 Setting up message translation interceptors');
    
    // Store original functions (if they exist)
    let originalShowMessage = window.showMessage;
    let originalShowSmartError = window.showSmartError;
    let originalShowFieldError = window.showFieldError;
    let originalShowSuccess = window.showSuccess;
    
    // Wait for registration handler to load and then override
    const setupInterceptors = () => {
        // Intercept showMessage function
        if (typeof window.showMessage === 'function') {
            if (!originalShowMessage || originalShowMessage === window.showMessage) {
                originalShowMessage = window.showMessage;
            }
        }
        
        window.showMessage = function(message, type = 'info') {
            const currentLang = document.body.getAttribute('data-current-lang') || 'en';
            const translatedMessage = translateMessage(message, currentLang);
            
            console.log(`🌺 Message translation (${currentLang}):`, message, '→', translatedMessage);
            
            if (originalShowMessage && originalShowMessage !== window.showMessage) {
                return originalShowMessage(translatedMessage, type);
            } else {
                // Fallback implementation
                return showLocalizedMessage(translatedMessage, type);
            }
        };

        // Intercept showSmartError function (from registration-handler.js)
        window.showSmartError = function(form, message, fieldName = null) {
            const currentLang = document.body.getAttribute('data-current-lang') || 'en';
            const translatedMessage = translateMessage(message, currentLang);
            
            console.log(`🌺 Smart error translation (${currentLang}):`, message, '→', translatedMessage);
            
            if (originalShowSmartError && originalShowSmartError !== window.showSmartError) {
                return originalShowSmartError(form, translatedMessage, fieldName);
            } else {
                // Fallback implementation
                if (fieldName) {
                    const field = form.querySelector(`[name="${fieldName}"]`);
                    if (field) {
                        showFieldError(field, translatedMessage);
                        field.focus();
                        return;
                    }
                }
                showLocalizedMessage(translatedMessage, 'error');
            }
        };

        // Intercept showFieldError function
        window.showFieldError = function(field, message) {
            const currentLang = document.body.getAttribute('data-current-lang') || 'en';
            const translatedMessage = translateMessage(message, currentLang);
            
            if (originalShowFieldError && originalShowFieldError !== window.showFieldError) {
                return originalShowFieldError(field, translatedMessage);
            } else {
                // Fallback implementation
                clearFieldError(field);
                
                field.classList.add('error');
                
                const errorEl = document.createElement('div');
                errorEl.className = 'error-message show';
                errorEl.textContent = translatedMessage;
                
                field.parentNode.appendChild(errorEl);
            }
        };

        // Intercept showSuccess function
        window.showSuccess = function(form, message) {
            const currentLang = document.body.getAttribute('data-current-lang') || 'en';
            const translatedMessage = translateMessage(message, currentLang);
            
            console.log(`🌺 Success message translation (${currentLang}):`, message, '→', translatedMessage);
            
            if (originalShowSuccess && originalShowSuccess !== window.showSuccess) {
                return originalShowSuccess(form, translatedMessage);
            } else {
                // Fallback implementation
                showLocalizedMessage(translatedMessage, 'success');
            }
        };
    };
    
    // Set up interceptors immediately if functions exist
    setupInterceptors();
    
    // Also set up interceptors when registration handler loads
    const checkForRegistrationHandler = () => {
        if (window.vaiRegistrationHandler) {
            console.log('🌺 Registration handler detected, updating interceptors');
            setupInterceptors();
        } else {
            setTimeout(checkForRegistrationHandler, 100);
        }
    };
    
    setTimeout(checkForRegistrationHandler, 500);
    
    console.log('✅ Message interceptors configured');
}

/**
 * Clear field errors (helper function)
 */
function clearFieldError(field) {
    field.classList.remove('error');
    const errorEl = field.parentNode.querySelector('.error-message');
    if (errorEl) {
        errorEl.remove();
    }
}

/**
 * Shows a localized message to the user
 * @param {string} message - Message to show
 * @param {string} type - Type of message ('success', 'error', 'info')
 */
function showLocalizedMessage(message, type) {
    // Remove existing messages
    const existingMsg = document.querySelector('.vai-message');
    if (existingMsg) {
        existingMsg.remove();
    }
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `vai-message vai-message-${type}`;
    messageEl.textContent = message;
    
    // Add to DOM with styling (styles are in CSS)
    document.body.appendChild(messageEl);
    
    // Remove after timeout
    const timeout = type === 'success' ? 5000 : 8000;
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.style.opacity = '0';
            setTimeout(() => messageEl.remove(), 300);
        }
    }, timeout);
}

// ============================================================================
// REGISTRATION DATA ENHANCEMENT
// ============================================================================

/**
 * Enhances registration data with interface language
 */
function enhanceRegistrationData() {
    console.log('🌺 Setting up registration data enhancement');
    
    // Function to enhance registration service
    const enhanceService = () => {
        if (!window.registrationService) {
            console.log('🌺 Registration service not found, waiting...');
            return false;
        }
        
        console.log('🌺 Enhancing registration service with interface_language');
        
        // Store original functions
        const originalRegisterTourist = window.registrationService.registerTourist;
        const originalRegisterOperator = window.registrationService.registerOperator;

        // Enhance tourist registration
        window.registrationService.registerTourist = function(formData) {
            const currentLang = document.body.getAttribute('data-current-lang') || 'en';
            const enhancedData = {
                ...formData,
                interface_language: currentLang
            };
            console.log('🌺 Enhanced tourist registration data with interface_language:', currentLang);
            return originalRegisterTourist.call(this, enhancedData);
        };

        // Enhance operator registration
        window.registrationService.registerOperator = function(formData) {
            const currentLang = document.body.getAttribute('data-current-lang') || 'en';
            const enhancedData = {
                ...formData,
                interface_language: currentLang
            };
            console.log('🌺 Enhanced operator registration data with interface_language:', currentLang);
            return originalRegisterOperator.call(this, enhancedData);
        };
        
        console.log('✅ Registration service enhanced with language support');
        return true;
    };
    
    // Try to enhance immediately
    if (!enhanceService()) {
        // If not available, keep checking
        const checkRegistrationService = () => {
            if (enhanceService()) {
                return; // Success, stop checking
            }
            setTimeout(checkRegistrationService, 100);
        };
        setTimeout(checkRegistrationService, 200);
    }
}

// ============================================================================
// SCROLL TO FORM FUNCTION
// ============================================================================

/**
 * Scrolls to tourist form when launch date is clicked
 */
function scrollToTouristForm() {
    const touristForm = document.getElementById('tourist-form');
    if (touristForm) {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
        const targetPosition = touristForm.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // Optional: Add a subtle highlight effect to the form
        touristForm.style.transition = 'all 0.5s ease';
        touristForm.style.transform = 'scale(1.02)';
        touristForm.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.1)';
        
        setTimeout(() => {
            touristForm.style.transform = 'scale(1)';
            touristForm.style.boxShadow = 'none';
        }, 1000);
        
        // Track the click with analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'launch_date_click', {
                'event_category': 'User Interaction',
                'event_label': 'Header Launch Date',
                'value': 1
            });
        }
    }
}

// ============================================================================
// ENHANCED FORM SETUP
// ============================================================================

/**
 * Enhanced form setup with language support
 */
function setupBilingualForms() {
    console.log('🌺 Setting up bilingual form enhancements');
    
    // Tourist form user type change handler
    const userTypeInputs = document.querySelectorAll('input[name="user_type"]');
    const islandSelection = document.getElementById('island-selection');
    
    userTypeInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.checked && islandSelection) {
                islandSelection.style.display = 'block';
                setTimeout(() => {
                    islandSelection.classList.add('show');
                }, 50);
                
                // Update label based on selection and current language
                const currentLang = document.body.getAttribute('data-current-lang') || 'en';
                updateIslandLabelForLanguage(currentLang);
            }
        });
    });
    
    // WhatsApp opt-in handler
    const whatsappCheckbox = document.getElementById('whatsapp-checkbox');
    const whatsappInput = document.getElementById('whatsapp-input');
    
    if (whatsappCheckbox && whatsappInput) {
        whatsappCheckbox.addEventListener('change', function() {
            if (this.checked) {
                whatsappInput.style.display = 'block';
                setTimeout(() => {
                    whatsappInput.classList.add('show');
                }, 50);
                whatsappInput.querySelector('input').required = true;
            } else {
                whatsappInput.classList.remove('show');
                setTimeout(() => {
                    whatsappInput.style.display = 'none';
                }, 300);
                whatsappInput.querySelector('input').required = false;
            }
        });
    }
    
    // Show island selection for default tourist selection
    setTimeout(() => {
        const checkedInput = document.querySelector('input[name="user_type"]:checked');
        if (checkedInput) {
            checkedInput.dispatchEvent(new Event('change'));
        }
    }, 100);
    
    console.log('✅ Bilingual form setup complete');
}


// Button Scrolling Fix 
function fixFormButtonScrolling() {
    const formLinks = document.querySelectorAll('a[href="#tourist-form"]');
    
    formLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetForm = document.getElementById('tourist-form');
            if (targetForm) {
                const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
                const targetPosition = targetForm.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Visual feedback
                targetForm.style.transition = 'all 0.5s ease';
                targetForm.style.transform = 'scale(1.01)';
                targetForm.style.boxShadow = '0 0 20px rgba(241, 103, 44, 0.3)';
                
                setTimeout(() => {
                    targetForm.style.transform = 'scale(1)';
                    targetForm.style.boxShadow = 'none';
                }, 1000);
            }
        });
    });
    
    console.log(`✅ Fixed ${formLinks.length} form button links`);
}

// ============================================================================
// OPERATOR FORM OVERLAY ENHANCEMENT
// ============================================================================

/**
 * Enhance operator form overlay with language switching
 */
function enhanceOperatorFormOverlay() {
    console.log('🌺 Enhancing operator form overlay');
    
    const showFormBtn = document.getElementById('show-operator-form-btn');
    const operatorOverlay = document.getElementById('operator-form-overlay');
    const closeFormBtn = document.getElementById('close-operator-form');
    
    if (showFormBtn && operatorOverlay && closeFormBtn) {
        // Show fullscreen operator form
        showFormBtn.addEventListener('click', function(e) {
            e.preventDefault();
            operatorOverlay.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            
            // Update form placeholders for current language
            const currentLang = document.body.getAttribute('data-current-lang') || 'en';
            updateFormPlaceholders(currentLang);
        });
        
        // Close fullscreen operator form
        closeFormBtn.addEventListener('click', function(e) {
            e.preventDefault();
            operatorOverlay.classList.remove('show');
            document.body.style.overflow = 'auto'; // Restore scrolling
        });
        
        // Close on overlay click (outside form)
        operatorOverlay.addEventListener('click', function(e) {
            if (e.target === operatorOverlay) {
                closeFormBtn.click();
            }
        });
        
        // Close on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && operatorOverlay.classList.contains('show')) {
                closeFormBtn.click();
            }
        });
        
        console.log('✅ Operator form overlay enhanced');
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the bilingual language system
 */
function initLanguageSystem() {
    console.log('🌺 Initializing VAI bilingual system');
    
    // Apply saved language preference
    const savedLang = SafeStorage.getItem('preferred-language');
    if (savedLang && savedLang !== document.body.getAttribute('data-current-lang')) {
        switchLanguage(savedLang);
    }
    
    // Update placeholders for current language
    const currentLang = document.body.getAttribute('data-current-lang') || 'en';
    updateFormPlaceholders(currentLang);
    
    // Setup translation interceptors
    setupMessageInterceptor();
    
    // Setup enhanced forms
    setupBilingualForms();
    fixFormButtonScrolling();
    
    // Enhance operator form overlay
    enhanceOperatorFormOverlay();
    
    // Enhance registration data with interface language
    enhanceRegistrationData();
    
    console.log('✅ VAI bilingual system ready');
}

// Make functions globally available
window.switchLanguage = switchLanguage;
window.scrollToTouristForm = scrollToTouristForm;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌺 DOM loaded, starting language system initialization');
    // Wait for other scripts to load first
    setTimeout(initLanguageSystem, 500);
});

// Listen for language changes to update form elements
document.addEventListener('languageChanged', function(e) {
    const lang = e.detail.language;
    console.log(`🌺 Language changed event received: ${lang}`);
    updateFormPlaceholders(lang);
    updateCountdownLabels(lang);
    
    // Update any island labels if forms are visible
    const islandSelection = document.getElementById('island-selection');
    if (islandSelection && islandSelection.style.display !== 'none') {
        updateIslandLabelForLanguage(lang);
    }
});

// For debugging purposes (can be removed in production)
window.VAI_BILINGUAL_DEBUG = {
    switchLanguage,
    translateMessage,
    updateSEOForLanguage,
    updateFormPlaceholders,
    messageTranslations,
    SafeStorage,
    showLocalizedMessage,
    clearFieldError
};

console.log('🌺 VAI Bilingual JavaScript system loaded');