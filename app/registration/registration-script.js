// ================================
// VAI REGISTRATION PAGE SCRIPT
// Reuses existing services and handlers
// ================================

// Global variables
let currentLanguage = 'fr';
let isSubmitting = false;

// ================================
// INITIALIZATION
// ================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🌺 VAI Registration Page Loading...');
    
    // Initialize all components
    initLanguageSystem();
    initCountdown();
    initFormHandlers();
    initConditionalFields();
    initPlaceholders();
    
    console.log('✅ VAI Registration Page Ready!');
});

// ================================
// LANGUAGE SWITCHING SYSTEM
// (Reused from app-landingpage.js)
// ================================

function switchLanguage(lang) {
    console.log(`🌍 Switching to language: ${lang}`);
    
    currentLanguage = lang;
    document.body.setAttribute('data-current-lang', lang);
    
    // Update active language button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-lang-btn="${lang}"]`).classList.add('active');
    
    // Update placeholders
    updatePlaceholders();
    
    console.log(`✅ Language switched to: ${lang}`);
}

function initLanguageSystem() {
    // Set initial language based on body attribute
    const initialLang = document.body.getAttribute('data-current-lang') || 'fr';
    currentLanguage = initialLang;
    
    // Add click handlers to language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang-btn');
            switchLanguage(lang);
        });
    });
}

function updatePlaceholders() {
    document.querySelectorAll('[data-placeholder-en][data-placeholder-fr]').forEach(input => {
        const placeholder = currentLanguage === 'en' 
            ? input.getAttribute('data-placeholder-en')
            : input.getAttribute('data-placeholder-fr');
        input.setAttribute('placeholder', placeholder);
    });
    
    // Update select options
    const islandSelect = document.getElementById('island');
    if (islandSelect) {
        const defaultOption = islandSelect.querySelector('option[value=""]');
        if (defaultOption) {
            defaultOption.textContent = currentLanguage === 'en' 
                ? 'Select an island' 
                : 'Sélectionnez une île';
        }
    }
}

function initPlaceholders() {
    updatePlaceholders();
}

// ================================
// COUNTDOWN TIMER
// (Reused from app-landingpage.js)
// ================================

function initCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;

    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');

    if (!daysElement || !hoursElement || !minutesElement) return;

    function updateCountdown() {
        try {
            const launchDate = new Date('July 20, 2025 00:00:00').getTime();
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
    
    console.log('✅ Countdown timer initialized');
}

// ================================
// CONDITIONAL FORM FIELDS
// ================================

function initConditionalFields() {
    // Island selection appears when user selects Tourist or Local
    const userTypeRadios = document.querySelectorAll('input[name="user_type"]');
    const islandSelection = document.getElementById('island-selection');
    
    userTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'tourist' || this.value === 'local') {
                islandSelection.style.display = 'block';
                // Make island field required
                document.getElementById('island').setAttribute('required', 'required');
            } else {
                islandSelection.style.display = 'none';
                // Remove required attribute
                document.getElementById('island').removeAttribute('required');
            }
        });
    });
    
    // WhatsApp input appears when checkbox is checked
    const whatsappOptIn = document.getElementById('whatsapp_opt_in');
    const whatsappInput = document.getElementById('whatsapp-input');
    
    whatsappOptIn.addEventListener('change', function() {
        if (this.checked) {
            whatsappInput.style.display = 'block';
        } else {
            whatsappInput.style.display = 'none';
            // Clear the input value
            document.getElementById('whatsapp_number').value = '';
        }
    });
    
    console.log('✅ Conditional fields initialized');
}

// ================================
// FORM HANDLERS
// (Reuses registration-handler.js logic)
// ================================

function initFormHandlers() {
    const form = document.getElementById('tourist-registration-form');
    if (!form) {
        console.error('Registration form not found');
        return;
    }
    
    form.addEventListener('submit', handleFormSubmit);
    
    // Add real-time validation
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
    
    console.log('✅ Form handlers initialized');
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (isSubmitting) return;
    isSubmitting = true;
    
    const form = e.target;
    const submitBtn = document.getElementById('submit-btn');
    
    try {
        // Clear previous errors
        clearAllErrors(form);
        
        // Show loading state
        setSubmitState(submitBtn, true, currentLanguage === 'en' ? 'Registering...' : 'Inscription...');
        
        // Extract form data
        const formData = extractTouristData(form);
        
        console.log('🎯 Form data extracted:', formData);
        
        // Validate data
        const validationResult = validateTouristData(formData, form);
        if (!validationResult.valid) {
            showSmartError(form, validationResult.message, validationResult.field);
            return;
        }
        
        // Check if registrationService is available
        if (typeof window.registrationService === 'undefined') {
            throw new Error('Registration service not loaded. Please refresh the page.');
        }
        
        // Submit registration
        const result = await window.registrationService.registerTourist(formData);
        
        if (result.success) {
            showSuccess(form, result.message, 'tourist');
            trackEvent('tourist_registration_success', formData);
            
            // Reset form on success (but don't show it immediately due to success screen)
            setTimeout(() => {
                form.reset();
                // Hide conditional fields
                const islandSelection = document.getElementById('island-selection');
                const whatsappInput = document.getElementById('whatsapp-input');
                if (islandSelection) islandSelection.style.display = 'none';
                if (whatsappInput) whatsappInput.style.display = 'none';
            }, 500);
            
        } else {
            showSmartError(form, result.error);
            trackEvent('tourist_registration_error', { error: result.error });
        }
        
    } catch (error) {
        console.error('Tourist registration error:', error);
        showSmartError(form, getErrorMessage(error));
        trackEvent('tourist_registration_error', { error: error.message });
        
    } finally {
        setSubmitState(submitBtn, false, currentLanguage === 'en' ? '🌺 Join VAI - Unlock Paradise' : '🌺 Rejoindre VAI - Débloquer le Paradis');
        isSubmitting = false;
    }
}

// ================================
// DATA EXTRACTION
// (Reused from registration-handler.js)
// ================================

function extractTouristData(form) {
    const formData = new FormData(form);
    
    // Primary language based on current selection
    const primaryLanguage = currentLanguage;
    
    // WhatsApp number only if opted in
    const whatsappOptIn = form.querySelector('input[name="whatsapp_opt_in"]')?.checked;
    const whatsappNumber = whatsappOptIn ? formData.get('whatsapp_number')?.trim() : null;
    
    return {
        name: formData.get('name')?.trim(),
        email: formData.get('email')?.trim(),
        user_type: formData.get('user_type') || 'tourist',
        island: formData.get('island'),
        whatsapp_number: whatsappNumber,
        marketing_emails: formData.get('marketing_emails') !== null,
        terms_accepted: formData.get('terms_accepted') !== null,
        languages: primaryLanguage ? [primaryLanguage] : ['french'] // Convert to array for consistency
    };
}

// ================================
// VALIDATION
// (Reused from registration-handler.js)
// ================================

function validateTouristData(formData, form) {
    // Validate required fields
    if (!formData.name || formData.name.length < 2) {
        return {
            valid: false,
            message: currentLanguage === 'en' ? 'Please enter your full name' : 'Veuillez entrer votre nom complet',
            field: 'name'
        };
    }
    
    if (!formData.email || !isValidEmail(formData.email)) {
        return {
            valid: false,
            message: currentLanguage === 'en' ? 'Please enter a valid email address' : 'Veuillez entrer une adresse email valide',
            field: 'email'
        };
    }
    
    if (!formData.user_type) {
        return {
            valid: false,
            message: currentLanguage === 'en' ? 'Please select if you are a tourist or local resident' : 'Veuillez sélectionner si vous êtes touriste ou résident local',
            field: 'user_type'
        };
    }
    
    if ((formData.user_type === 'tourist' || formData.user_type === 'local') && !formData.island) {
        return {
            valid: false,
            message: currentLanguage === 'en' ? 'Please select your preferred island' : 'Veuillez sélectionner votre île préférée',
            field: 'island'
        };
    }
    
    if (!formData.terms_accepted) {
        return {
            valid: false,
            message: currentLanguage === 'en' ? 'Please agree to the Privacy Policy and Terms' : 'Veuillez accepter la Politique de Confidentialité et les Conditions',
            field: 'terms_accepted'
        };
    }
    
    return { valid: true };
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    switch (fieldName) {
        case 'name':
            if (!value || value.length < 2) {
                isValid = false;
                errorMessage = currentLanguage === 'en' ? 'Please enter your full name' : 'Veuillez entrer votre nom complet';
            }
            break;
        case 'email':
            if (!value || !isValidEmail(value)) {
                isValid = false;
                errorMessage = currentLanguage === 'en' ? 'Please enter a valid email address' : 'Veuillez entrer une adresse email valide';
            }
            break;
        case 'island':
            if (field.hasAttribute('required') && !value) {
                isValid = false;
                errorMessage = currentLanguage === 'en' ? 'Please select an island' : 'Veuillez sélectionner une île';
            }
            break;
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ================================
// ERROR HANDLING
// ================================

function showFieldError(field, message) {
    const errorElement = document.getElementById(`${field.name}-error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('active');
    }
    field.classList.add('error');
}

function clearFieldError(field) {
    const errorElement = document.getElementById(`${field.name}-error`);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('active');
    }
    field.classList.remove('error');
}

function clearAllErrors(form) {
    // Clear field errors
    form.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.classList.remove('active');
    });
    
    // Clear input error states
    form.querySelectorAll('.form-input, .form-select').forEach(el => {
        el.classList.remove('error');
    });
    
    // Clear form-level error
    const formError = document.getElementById('form-error');
    if (formError) {
        formError.style.display = 'none';
        formError.textContent = '';
    }
}

function showSmartError(form, message, fieldName = null) {
    if (fieldName) {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (field) {
            showFieldError(field, message);
            field.focus();
            return;
        }
    }
    
    // Show form-level error
    const formError = document.getElementById('form-error');
    if (formError) {
        formError.textContent = message;
        formError.style.display = 'block';
    }
}

function getErrorMessage(error) {
    const message = error.message || 'An error occurred';
    
    // Common error translations
    const errorTranslations = {
        'Email already registered': {
            en: 'Email already registered. Please use a different email address.',
            fr: 'Email déjà enregistré. Veuillez utiliser une adresse email différente.'
        },
        'Please fill in all required fields': {
            en: 'Please fill in all required fields',
            fr: 'Veuillez remplir tous les champs obligatoires'
        }
    };
    
    const translation = errorTranslations[message];
    if (translation) {
        return currentLanguage === 'en' ? translation.en : translation.fr;
    }
    
    return message;
}

// ================================
// SUCCESS SCREEN
// ================================

function showSuccess(form, message, type) {
    const successScreen = document.getElementById('success-screen');
    if (successScreen) {
        successScreen.classList.add('active');
        
        // Hide success screen after 10 seconds
        // setTimeout(() => {
        //     successScreen.classList.remove('active');
        // }, 10000);
    }
}

// ================================
// UI STATE MANAGEMENT
// ================================

function setSubmitState(button, isLoading, text) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `
            <span style="display: inline-flex; align-items: center; gap: 10px;">
                <span style="width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></span>
                ${text}
            </span>
        `;
    } else {
        button.disabled = false;
        button.innerHTML = text;
    }
}

// Add spin animation for loading spinner
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// ================================
// ANALYTICS/TRACKING
// ================================

function trackEvent(eventName, data) {
    console.log(`📊 Event: ${eventName}`, data);
    
    // Add analytics tracking here if needed
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            event_category: 'Registration',
            event_label: data.user_type || 'unknown',
            custom_map: data
        });
    }
}

// ================================
// UTILITY FUNCTIONS
// ================================

// Make functions globally available for HTML onclick handlers
window.switchLanguage = switchLanguage;

// Debug helper
window.debugRegistration = function() {
    console.log('Current Language:', currentLanguage);
    console.log('Form Data:', extractTouristData(document.getElementById('tourist-registration-form')));
};

console.log('🌺 VAI Registration Script Loaded Successfully!');


// ================================
// SCROLL TO REGISTRATION
// ================================

function scrollToRegistration() {
    const registrationSection = document.querySelector('.registration-section');
    if (registrationSection) {
        registrationSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Make function globally available
window.scrollToRegistration = scrollToRegistration;