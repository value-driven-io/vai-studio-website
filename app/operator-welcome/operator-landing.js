// VAI Operator Landing Page - JavaScript
// Modern ES6+ with Language Switch & Form Integration

(function() {
    'use strict';

    // ================================
    // CONSTANTS AND CONFIGURATION
    // ================================

    const CONFIG = {
        FORM_ENDPOINT: 'https://n8n-stable-latest.onrender.com/webhook-test/vai-app-operator-registration',
        WHATSAPP_SUPPORT: 'https://wa.me/68987269065',
        DASHBOARD_URL: 'https://vai-operator-dashboard.onrender.com/',
        ANIMATION_DURATION: 300,
        SCROLL_OFFSET: 100,
        DEFAULT_LANGUAGE: 'en'
    };

    // ================================
    // LANGUAGE SWITCHING SYSTEM
    // ================================

    const landingPageSEO = {
        en: {
            title: 'VAI Operators - Grow Your French Polynesian Tour Business | Digital Platform',
            description: 'Join VAI\'s operator platform and grow your French Polynesian tour business. 10% commission, advanced booking system, revenue recovery from cancellations.',
            keywords: 'French Polynesia tour operators, tourism business platform, booking system, operator dashboard, revenue recovery, digital marketing, tour operator tools'
        },
        fr: {
            title: 'VAI Opérateurs - Développe ton Business Touristique en Polynésie | Plateforme Digitale',
            description: 'Rejoins la plateforme opérateur VAI et développe ton business touristique en Polynésie française. Commission 10%, système de réservation avancé, récupération des revenus perdus.',
            keywords: 'opérateurs touristiques Polynésie française, plateforme business tourisme, système réservation, tableau de bord opérateur, récupération revenus, marketing digital, outils opérateur'
        }
    };

    const messageTranslations = {
        // Form validation messages
        'Please fill in all required fields': {
            en: 'Please fill in all required fields',
            fr: 'Remplis tous les champs obligatoires stp'
        },
        'Please enter a valid email address': {
            en: 'Please enter a valid email address',
            fr: 'Entre une adresse email valide stp'
        },
        'Please enter a valid phone number': {
            en: 'Please enter a valid phone number',
            fr: 'Entre un numéro de téléphone valide stp'
        },
        'Please agree to the Terms of Service': {
            en: 'Please agree to the Terms of Service',
            fr: 'Accepte les Conditions d\'Utilisation stp'
        },
        'Company name must be at least 2 characters': {
            en: 'Company name must be at least 2 characters',
            fr: 'Le nom de l\'entreprise doit faire au moins 2 caractères'
        },
        'Please select at least one tour type': {
            en: 'Please select at least one tour type',
            fr: 'Sélectionne au moins un type de tour stp'
        },
        
        // Success messages
        'Registration successful! We\'ll contact you within 24 hours.': {
            en: 'Registration successful! We\'ll contact you within 24 hours.',
            fr: 'Inscription réussie ! On te contactera dans les 24 heures. 🌺'
        },
        'Welcome to VAI! Check your email for next steps.': {
            en: 'Welcome to VAI! Check your email for next steps.',
            fr: 'Bienvenue chez VAI ! Vérifie ton email pour les étapes suivantes. 🏝️'
        },
        
        // Error messages
        'Email already registered. Please use a different email.': {
            en: 'Email already registered. Please use a different email.',
            fr: 'Email déjà enregistré. Utilise un autre email stp.'
        },
        'Registration failed. Please try again.': {
            en: 'Registration failed. Please try again.',
            fr: 'Inscription échouée. Réessaie stp.'
        },
        'There was an error submitting your registration. Please try again.': {
            en: 'There was an error submitting your registration. Please try again.',
            fr: 'Il y a eu une erreur lors de l\'envoi de ton inscription. Réessaie stp.'
        },
        'Please check your internet connection and try again.': {
            en: 'Please check your internet connection and try again.',
            fr: 'Vérifie ta connexion internet et réessaie stp.'
        },
        
        // Loading states
        'Submitting...': {
            en: 'Submitting...',
            fr: 'Envoi en cours...'
        },
        'Processing your application...': {
            en: 'Processing your application...',
            fr: 'Traitement de ta candidature...'
        },
        
        // Form placeholders
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
        '+689 XX XX XX XX': {
            en: '+689 XX XX XX XX',
            fr: '+689 XX XX XX XX'
        },
        'Select your primary island': {
            en: 'Select your primary island',
            fr: 'Sélectionne ton île principale'
        },
        'Select language...': {
            en: 'Select language...',
            fr: 'Sélectionne la langue...'
        },
        'Describe your tours, experience, and what makes your business unique...': {
            en: 'Describe your tours, experience, and what makes your business unique...',
            fr: 'Décris tes tours, ton expérience, et ce qui rend ton business unique...'
        }
    };

    // ================================
    // UTILITY FUNCTIONS
    // ================================

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    function smoothScrollTo(selector) {
        const element = document.querySelector(selector);
        if (!element) return;

        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = element.offsetTop - headerHeight - CONFIG.SCROLL_OFFSET;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    // ================================
    // LANGUAGE SWITCHING FUNCTIONALITY
    // ================================

    function updateSEOForLanguage(lang) {
        const langSeo = landingPageSEO[lang];
        if (!langSeo) return;

        const titleTag = document.querySelector('title');
        const descriptionTag = document.querySelector('meta[name="description"]');
        const keywordsTag = document.querySelector('meta[name="keywords"]');

        if (titleTag) titleTag.textContent = langSeo.title;
        if (descriptionTag) descriptionTag.setAttribute('content', langSeo.description);
        if (keywordsTag) keywordsTag.setAttribute('content', langSeo.keywords);
        
        document.documentElement.setAttribute('lang', lang);
    }

    function updateFormPlaceholders(lang) {
        const currentTranslations = {};
        
        Object.keys(messageTranslations).forEach(key => {
            if (messageTranslations[key][lang]) {
                currentTranslations[key] = messageTranslations[key][lang];
            }
        });
        
        // Update form placeholders
        const placeholderMappings = {
            'company-name': 'Your tour company name',
            'contact-person': 'Your full name',
            'operator-email': 'business@yourcompany.com',
            'operator-whatsapp': '+689 XX XX XX XX',
            'business-description': 'Describe your tours, experience, and what makes your business unique...'
        };
        
        Object.entries(placeholderMappings).forEach(([fieldId, placeholderKey]) => {
            const field = document.getElementById(fieldId);
            if (field && currentTranslations[placeholderKey]) {
                field.placeholder = currentTranslations[placeholderKey];
            }
        });
        
        // Update select options
        const selectMappings = {
            'operator-islands': 'Select your primary island',
            'operator-language': 'Select language...'
        };
        
        Object.entries(selectMappings).forEach(([selectId, optionKey]) => {
            const select = document.getElementById(selectId);
            if (select && currentTranslations[optionKey]) {
                const firstOption = select.querySelector('option[value=""]');
                if (firstOption) {
                    firstOption.textContent = currentTranslations[optionKey];
                }
            }
        });
    }

    function getStoredLanguage() {
        try {
            return localStorage.getItem('vai_language') || CONFIG.DEFAULT_LANGUAGE;
        } catch (e) {
            return CONFIG.DEFAULT_LANGUAGE;
        }
    }

    function setStoredLanguage(lang) {
        try {
            localStorage.setItem('vai_language', lang);
        } catch (e) {
            console.warn('Could not store language preference');
        }
    }

    function switchLanguage(lang) {
        if (!['en', 'fr'].includes(lang)) {
            lang = CONFIG.DEFAULT_LANGUAGE;
        }
        
        console.log(`🌐 Switching language to: ${lang}`);
        
        // Update body attribute
        document.body.setAttribute('data-current-lang', lang);
        
        // Update language buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.langBtn === lang) {
                btn.classList.add('active');
            }
        });
        
        // Update SEO
        updateSEOForLanguage(lang);
        
        // Update form placeholders
        updateFormPlaceholders(lang);
        
        // Store language preference
        setStoredLanguage(lang);
        
        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }

    // ================================
    // NOTIFICATION SYSTEM
    // ================================

    function showNotification(message, type = 'info') {
        const currentLang = document.body.getAttribute('data-current-lang') || CONFIG.DEFAULT_LANGUAGE;
        
        // Translate message if available
        if (messageTranslations[message] && messageTranslations[message][currentLang]) {
            message = messageTranslations[message][currentLang];
        }
        
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="Close notification">×</button>
            </div>
        `;

        const styles = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                padding: 1rem;
                border-radius: 0.5rem;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                animation: slideInRight 0.3s ease-out;
            }
            .notification-success {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
            }
            .notification-error {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                color: white;
            }
            .notification-info {
                background: linear-gradient(135deg, #6366f1, #4f46e5);
                color: white;
            }
            .notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
            }
            .notification-close {
                background: none;
                border: none;
                color: currentColor;
                font-size: 1.5rem;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.2s;
            }
            .notification-close:hover {
                opacity: 1;
            }
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;

        if (!document.querySelector('#notification-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'notification-styles';
            styleElement.textContent = styles;
            document.head.appendChild(styleElement);
        }

        document.body.appendChild(notification);

        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            notification.remove();
        });

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // ================================
    // FORM HANDLING
    // ================================

    class OperatorForm {
        constructor() {
            this.form = document.querySelector('.operator-form');
            this.submitButton = this.form?.querySelector('button[type="submit"]');
            this.isSubmitting = false;
            
            this.init();
        }

        init() {
            if (!this.form) return;

            this.form.addEventListener('submit', this.handleSubmit.bind(this));
            this.setupFormValidation();
            this.setupPhoneFormatting();
        }

        setupFormValidation() {
            const inputs = this.form.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        }

        setupPhoneFormatting() {
            const phoneInput = this.form.querySelector('#whatsapp_number');
            if (!phoneInput) return;

            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                
                // Format for French Polynesia (+689)
                if (value.startsWith('689')) {
                    value = value.substring(3);
                }
                
                if (value.length > 0) {
                    if (value.length <= 2) {
                        value = `+689 ${value}`;
                    } else if (value.length <= 4) {
                        value = `+689 ${value.substring(0, 2)} ${value.substring(2)}`;
                    } else if (value.length <= 6) {
                        value = `+689 ${value.substring(0, 2)} ${value.substring(2, 4)} ${value.substring(4)}`;
                    } else {
                        value = `+689 ${value.substring(0, 2)} ${value.substring(2, 4)} ${value.substring(4, 6)} ${value.substring(6, 8)}`;
                    }
                }
                
                e.target.value = value;
            });
        }

        validateField(field) {
            const value = field.value.trim();
            const fieldName = field.name;
            let isValid = true;
            let errorMessage = '';

            // Remove existing error
            this.clearFieldError(field);

            // Required field validation
            if (field.required && !value) {
                isValid = false;
                errorMessage = `${this.getFieldLabel(field)} is required`;
            }

            // Email validation
            if (fieldName === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
            }

            // Phone validation
            if (fieldName === 'whatsapp_number' && value) {
                const phoneRegex = /^\+689 \d{2} \d{2} \d{2} \d{2}$/;
                if (!phoneRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid French Polynesian phone number';
                }
            }

            // Company name validation
            if (fieldName === 'company_name' && value && value.length < 2) {
                isValid = false;
                errorMessage = 'Company name must be at least 2 characters long';
            }

            if (!isValid) {
                this.showFieldError(field, errorMessage);
            }

            return isValid;
        }

        showFieldError(field, message) {
            field.classList.add('error');
            
            // Create error message element
            const errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.textContent = message;
            
            // Insert error message after the field
            field.parentElement.appendChild(errorElement);
        }

        clearFieldError(field) {
            field.classList.remove('error');
            const errorElement = field.parentElement.querySelector('.field-error');
            if (errorElement) {
                errorElement.remove();
            }
        }

        getFieldLabel(field) {
            const label = field.parentElement.querySelector('label');
            return label ? label.textContent.replace('*', '').trim() : field.name;
        }

        validateForm() {
            const requiredFields = this.form.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!this.validateField(field)) {
                    isValid = false;
                }
            });

            return isValid;
        }

        async handleSubmit(e) {
            e.preventDefault();
            
            if (this.isSubmitting) return;
            
            // Validate form
            if (!this.validateForm()) {
                showNotification('Please fix the errors in the form', 'error');
                return;
            }

            this.isSubmitting = true;
            this.setSubmitButtonLoading(true);

            try {
                // Collect form data
                const formData = new FormData(this.form);
                const data = Object.fromEntries(formData.entries());

                // Add metadata
                data.submitted_at = new Date().toISOString();
                data.source = 'operator_landing_page';
                data.user_agent = navigator.userAgent;
                data.referrer = document.referrer;

                // Convert tour_types array to string if multiple selected
                if (data.tour_types && Array.isArray(data.tour_types)) {
                    data.tour_types = data.tour_types.join(', ');
                }

                // Submit form
                const response = await fetch(CONFIG.FORM_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    showNotification('Registration successful! We\'ll contact you within 24 hours.', 'success');
                    this.form.reset();
                    
                    // Track success
                    this.trackFormSubmission('success', data);
                    
                    // Redirect to dashboard after short delay
                    setTimeout(() => {
                        window.open(CONFIG.DASHBOARD_URL, '_blank');
                    }, 2000);
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                showNotification('There was an error submitting your registration. Please try again or contact support.', 'error');
                this.trackFormSubmission('error', { error: error.message });
            } finally {
                this.isSubmitting = false;
                this.setSubmitButtonLoading(false);
            }
        }

        setSubmitButtonLoading(loading) {
            if (!this.submitButton) return;

            if (loading) {
                this.submitButton.disabled = true;
                this.submitButton.innerHTML = `
                    <span class="loading-spinner"></span>
                    Submitting...
                `;
            } else {
                this.submitButton.disabled = false;
                this.submitButton.innerHTML = 'Join VAI Platform';
            }
        }

        trackFormSubmission(status, data) {
            // Track with Google Analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submission', {
                    event_category: 'Operator Registration',
                    event_label: status,
                    custom_form_data: JSON.stringify(data)
                });
            }

            // Track with custom analytics
            if (typeof analytics !== 'undefined') {
                analytics.track('Operator Form Submission', {
                    status: status,
                    source: 'landing_page',
                    ...data
                });
            }
        }
    }

    // ================================
    // SCROLL ANIMATIONS
    // ================================

    class ScrollAnimations {
        constructor() {
            this.elements = document.querySelectorAll('[data-animate]');
            this.observer = null;
            this.init();
        }

        init() {
            if (!this.elements.length) return;

            // Use Intersection Observer for better performance
            this.observer = new IntersectionObserver(
                this.handleIntersection.bind(this),
                {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                }
            );

            this.elements.forEach(element => {
                this.observer.observe(element);
            });
        }

        handleIntersection(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const animationType = element.dataset.animate;
                    
                    element.classList.add(`animate-${animationType}`);
                    
                    // Unobserve element after animation
                    this.observer.unobserve(element);
                }
            });
        }
    }

    // ================================
    // HEADER SCROLL BEHAVIOR
    // ================================

    class HeaderScrollBehavior {
        constructor() {
            this.header = document.querySelector('.header');
            this.lastScrollY = window.scrollY;
            this.init();
        }

        init() {
            if (!this.header) return;

            window.addEventListener('scroll', throttle(this.handleScroll.bind(this), 16));
        }

        handleScroll() {
            const currentScrollY = window.scrollY;
            
            // Add/remove scrolled class
            if (currentScrollY > 100) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }

            // Hide/show header on scroll
            if (currentScrollY > this.lastScrollY && currentScrollY > 200) {
                this.header.style.transform = 'translateY(-100%)';
            } else {
                this.header.style.transform = 'translateY(0)';
            }

            this.lastScrollY = currentScrollY;
        }
    }

    // ================================
    // SMOOTH SCROLLING FOR LINKS
    // ================================

    class SmoothScrolling {
        constructor() {
            this.init();
        }

        init() {
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[href^="#"]');
                if (!link) return;

                e.preventDefault();
                const targetId = link.getAttribute('href');
                smoothScrollTo(targetId);
            });
        }
    }

    // ================================
    // DASHBOARD PREVIEW INTERACTION
    // ================================

    class DashboardPreview {
        constructor() {
            this.preview = document.querySelector('.dashboard-preview');
            this.init();
        }

        init() {
            if (!this.preview) return;

            this.preview.addEventListener('click', () => {
                window.open(CONFIG.DASHBOARD_URL, '_blank');
            });

            // Add hover effects
            this.preview.addEventListener('mouseenter', () => {
                this.preview.style.cursor = 'pointer';
            });
        }
    }

    // ================================
    // PERFORMANCE MONITORING
    // ================================

    class PerformanceMonitor {
        constructor() {
            this.init();
        }

        init() {
            // Monitor Core Web Vitals
            this.monitorCLS();
            this.monitorLCP();
            this.monitorFID();
        }

        monitorCLS() {
            let cls = 0;
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (!entry.hadRecentInput) {
                        cls += entry.value;
                    }
                }
            }).observe({ type: 'layout-shift', buffered: true });
        }

        monitorLCP() {
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                // Track LCP with analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'lcp', {
                        event_category: 'Web Vitals',
                        value: Math.round(lastEntry.startTime),
                        event_label: 'Largest Contentful Paint'
                    });
                }
            }).observe({ type: 'largest-contentful-paint', buffered: true });
        }

        monitorFID() {
            new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    // Track FID with analytics
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'fid', {
                            event_category: 'Web Vitals',
                            value: Math.round(entry.processingStart - entry.startTime),
                            event_label: 'First Input Delay'
                        });
                    }
                }
            }).observe({ type: 'first-input', buffered: true });
        }
    }

    // ================================
    // ANALYTICS TRACKING
    // ================================

    class AnalyticsTracker {
        constructor() {
            this.init();
        }

        init() {
            this.trackPageView();
            this.trackScrollDepth();
            this.trackButtonClicks();
            this.trackFormInteractions();
        }

        trackPageView() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_view', {
                    page_title: document.title,
                    page_location: window.location.href,
                    page_path: window.location.pathname
                });
            }
        }

        trackScrollDepth() {
            let maxScroll = 0;
            const trackingPoints = [25, 50, 75, 100];
            
            window.addEventListener('scroll', throttle(() => {
                const scrollPercent = Math.round(
                    (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
                );
                
                if (scrollPercent > maxScroll) {
                    maxScroll = scrollPercent;
                    
                    trackingPoints.forEach(point => {
                        if (scrollPercent >= point && maxScroll >= point) {
                            if (typeof gtag !== 'undefined') {
                                gtag('event', 'scroll', {
                                    event_category: 'Engagement',
                                    event_label: `${point}%`,
                                    value: point
                                });
                            }
                        }
                    });
                }
            }, 1000));
        }

        trackButtonClicks() {
            document.addEventListener('click', (e) => {
                const button = e.target.closest('button, .btn, a[href^="#"]');
                if (!button) return;

                const buttonText = button.textContent.trim();
                const buttonType = button.classList.contains('btn-primary') ? 'primary' : 'secondary';
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'click', {
                        event_category: 'Button',
                        event_label: buttonText,
                        button_type: buttonType
                    });
                }
            });
        }

        trackFormInteractions() {
            const form = document.querySelector('.operator-form');
            if (!form) return;

            // Track form start
            form.addEventListener('focusin', () => {
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_start', {
                        event_category: 'Form',
                        event_label: 'Operator Registration'
                    });
                }
            }, { once: true });

            // Track field interactions
            const fields = form.querySelectorAll('input, select, textarea');
            fields.forEach(field => {
                field.addEventListener('blur', () => {
                    if (field.value.trim()) {
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'form_field_complete', {
                                event_category: 'Form',
                                event_label: field.name
                            });
                        }
                    }
                });
            });
        }
    }

    // ================================
    // INITIALIZATION
    // ================================

    document.addEventListener('DOMContentLoaded', () => {
        // Initialize language system
        const storedLanguage = getStoredLanguage();
        switchLanguage(storedLanguage);
        
        // Initialize all components
        new ScrollAnimations();
        new HeaderScrollBehavior();
        new SmoothScrolling();
        new DashboardPreview();
        new PerformanceMonitor();
        new AnalyticsTracker();
        
        // Initialize language switcher
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = btn.getAttribute('data-lang-btn');
                switchLanguage(lang);
            });
        });

        // Add loading spinner styles
        const spinnerStyles = `
            .loading-spinner {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 2px solid #ffffff;
                border-radius: 50%;
                border-top-color: transparent;
                animation: spin 1s linear infinite;
                margin-right: 0.5rem;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            .field-error {
                color: #ef4444;
                font-size: 0.875rem;
                margin-top: 0.25rem;
            }
            .form-input.error {
                border-color: #ef4444;
                box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
            }
        `;

        const styleElement = document.createElement('style');
        styleElement.textContent = spinnerStyles;
        document.head.appendChild(styleElement);

        // Track page load complete
        window.addEventListener('load', () => {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_load_complete', {
                    event_category: 'Performance',
                    event_label: 'Operator Landing Page'
                });
            }
        });
    });

    // ================================
    // GLOBAL FUNCTIONS
    // ================================

    // Export functions for global use
    window.switchLanguage = switchLanguage;
    window.showNotification = showNotification;
    window.smoothScrollTo = smoothScrollTo;
    
    // Export VAI utilities
    window.VAI = {
        smoothScrollTo,
        showNotification,
        switchLanguage,
        CONFIG
    };

    // ================================
    // ERROR HANDLING
    // ================================

    window.addEventListener('error', (e) => {
        console.error('JavaScript error:', e.error);
        
        // Track errors with analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: e.error.message,
                fatal: false
            });
        }
    });

    // ================================
    // PROGRESSIVE ENHANCEMENTx
    // ================================

    // Add 'js-enabled' class to body
    document.documentElement.classList.add('js-enabled');

})();