// ================================
// OPERATOR REGISTRATION HANDLER
// File: registration-handler.js
// ================================

(function() {
    'use strict';

    // ================================
    // CONSTANTS
    // ================================

    const FORM_CONFIG = {
        FORM_ID: 'operator-registration-form',
        SUBMIT_BUTTON_SELECTOR: 'button[type="submit"]',
        REQUIRED_FIELDS: [
            'company_name',
            'contact_person', 
            'email',
            'whatsapp_number',
            'islands_served',
            'languages',
            'terms_accepted'
        ],
        VALIDATION_RULES: {
            company_name: { min: 2, max: 100 },
            contact_person: { min: 2, max: 100 },
            email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
            whatsapp_number: { pattern: /^[\+]?[\d\s\-\(\)]{10,}$/ },
            business_description: { max: 500 }
        }
    };

    // ================================
    // VALIDATION FUNCTIONS
    // ================================

    function validateField(field, value, rules) {
        const errors = [];
        
        if (rules.min && value.length < rules.min) {
            errors.push(`Must be at least ${rules.min} characters long`);
        }
        
        if (rules.max && value.length > rules.max) {
            errors.push(`Must be no more than ${rules.max} characters long`);
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
            if (field === 'email') {
                errors.push('Please enter a valid email address');
            } else if (field === 'whatsapp_number') {
                errors.push('Please enter a valid phone number');
            } else {
                errors.push('Invalid format');
            }
        }
        
        return errors;
    }

    function showFieldError(field, message) {
        // Clear existing errors
        clearFieldError(field);
        
        // Add error class
        field.classList.add('error');
        
        // Create error message
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error show';
        errorElement.textContent = message;
        
        // Insert after field
        field.parentElement.appendChild(errorElement);
    }

    function clearFieldError(field) {
        field.classList.remove('error');
        const existingError = field.parentElement.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    function clearAllErrors(form) {
        form.querySelectorAll('.form-input').forEach(field => {
            clearFieldError(field);
        });
        
        // Remove any form-level messages
        const existingMessages = form.querySelectorAll('.form-message');
        existingMessages.forEach(msg => msg.remove());
    }

    function showFormMessage(form, message, type = 'error') {
        // Remove existing messages
        const existingMessages = form.querySelectorAll('.form-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;
        
        // Insert at top of form
        form.insertBefore(messageElement, form.firstChild);
        
        // Scroll to message
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // ================================
    // FORM DATA PROCESSING
    // ================================

    function getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        // Process regular fields
        for (const [key, value] of formData.entries()) {
            if (key === 'tour_types_offered') {
                // Handle multiple checkboxes
                if (!data[key]) data[key] = [];
                data[key].push(value);
            } else {
                data[key] = value.trim();
            }
        }
        
        // Handle checkboxes that might not be in FormData if unchecked
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox.name && !data.hasOwnProperty(checkbox.name)) {
                data[checkbox.name] = false;
            } else if (checkbox.name && data[checkbox.name] === 'on') {
                data[checkbox.name] = true;
            }
        });
        
        // Ensure tour_types_offered is an array
        if (!data.tour_types_offered) {
            data.tour_types_offered = [];
        } else if (!Array.isArray(data.tour_types_offered)) {
            data.tour_types_offered = [data.tour_types_offered];
        }
        
        // Convert languages to array if needed
        if (data.languages && !Array.isArray(data.languages)) {
            data.languages = [data.languages];
        }
        
        // Add metadata
        data.registration_source = 'operator_landing_page';
        data.user_type = 'operator';
        data.submitted_at = new Date().toISOString();
        data.user_agent = navigator.userAgent;
        data.referrer = document.referrer;
        data.current_language = document.body.getAttribute('data-current-lang') || 'en';
        
        return data;
    }

    // ================================
    // FORM VALIDATION
    // ================================

    function validateForm(form) {
        const data = getFormData(form);
        let isValid = true;
        const errors = {};
        
        // Check required fields
        FORM_CONFIG.REQUIRED_FIELDS.forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            const value = data[fieldName];
            
            if (!field) return;
            
            if (fieldName === 'terms_accepted') {
                if (!value) {
                    showFieldError(field, 'Please agree to the Terms of Service and Privacy Policy');
                    isValid = false;
                }
                return;
            }
            
            if (fieldName === 'tour_types_offered') {
                if (!Array.isArray(value) || value.length === 0) {
                    // Tour types are now optional - just highlight the section
                    const firstCheckbox = form.querySelector('input[name="tour_types_offered"]');
                    if (firstCheckbox) {
                        const section = firstCheckbox.closest('.form-section');
                        if (section) {
                            const title = section.querySelector('.form-section-title');
                            if (title) {
                                title.style.border = '2px solid #f59e0b';
                                title.style.borderRadius = '8px';
                                title.style.padding = '8px';
                                setTimeout(() => {
                                    title.style.border = '';
                                    title.style.borderRadius = '';
                                    title.style.padding = '';
                                }, 3000);
                            }
                        }
                    }
                    // Just show a warning, don't fail validation
                    console.log('ℹ️ No tour types selected - operator can add them later');
                }
                return true; // Always return true to make it optional
            }
            
            if (!value || value === '') {
                showFieldError(field, 'This field is required');
                isValid = false;
                return;
            }
            
            // Apply specific validation rules
            if (FORM_CONFIG.VALIDATION_RULES[fieldName]) {
                const fieldErrors = validateField(fieldName, value, FORM_CONFIG.VALIDATION_RULES[fieldName]);
                if (fieldErrors.length > 0) {
                    showFieldError(field, fieldErrors[0]);
                    isValid = false;
                }
            }
        });
        
        return isValid;
    }

    // ================================
    // FORM SUBMISSION
    // ================================

    function setSubmitButtonLoading(button, loading) {
        if (!button) return;
        
        if (loading) {
            button.disabled = true;
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = `
                <span class="loading-spinner"></span>
                <span data-lang="en">Submitting...</span>
                <span data-lang="fr">Envoi en cours...</span>
            `;
        } else {
            button.disabled = false;
            if (button.dataset.originalText) {
                button.innerHTML = button.dataset.originalText;
            }
        }
    }

    async function handleFormSubmission(form) {
        // Clear previous errors
        clearAllErrors(form);
        
        // Validate form
        if (!validateForm(form)) {
            showFormMessage(form, 'Please fix the errors above', 'error');
            return;
        }
        
        const submitButton = form.querySelector(FORM_CONFIG.SUBMIT_BUTTON_SELECTOR);
        setSubmitButtonLoading(submitButton, true);
        
        try {
            // Get form data
            const formData = getFormData(form);
            
            console.log('📝 Submitting operator registration:', formData);
            
            // Check if registration service is available
            if (!window.registrationService) {
                throw new Error('Registration service not loaded. Please refresh the page.');
            }
            
            // Submit registration
            const result = await window.registrationService.registerOperator(formData);
            
            if (result.success) {
                // Success - show beautiful success screen
                const successScreen = new SuccessScreen();
                successScreen.show({
                    email: formData.email,
                    company_name: formData.company_name,
                    contact_person: formData.contact_person
                });
                
                // Track success
                trackFormSubmission('success', formData);
                
                // Reset form
                form.reset();
                
                // Clear any existing messages
                clearAllErrors(form);
                
            } else {
                // Error - show error message
                const errorMessage = result.error || 'Registration failed. Please try again.';
                showFormMessage(form, errorMessage, 'error');
                
                if (window.showNotification) {
                    window.showNotification(errorMessage, 'error');
                }
                
                // Track error
                trackFormSubmission('error', { error: errorMessage, formData });
            }
            
        } catch (error) {
            console.error('❌ Form submission error:', error);
            
            let errorMessage = 'There was an error submitting your registration. Please try again.';
            
            if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage = 'Please check your internet connection and try again.';
            } else if (error.message.includes('not loaded')) {
                errorMessage = error.message;
            }
            
            showFormMessage(form, errorMessage, 'error');
            
            if (window.showNotification) {
                window.showNotification(errorMessage, 'error');
            }
            
            // Track error
            trackFormSubmission('error', { error: error.message });
            
        } finally {
            setSubmitButtonLoading(submitButton, false);
        }
    }

    // ================================
    // ANALYTICS TRACKING
    // ================================

    function trackFormSubmission(status, data) {
        // Track with Google Analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submission', {
                event_category: 'Operator Registration',
                event_label: status,
                value: status === 'success' ? 1 : 0
            });
        }
        
        // Track with custom analytics
        if (typeof analytics !== 'undefined') {
            analytics.track('Operator Form Submission', {
                status: status,
                source: 'operator_landing_page',
                timestamp: new Date().toISOString(),
                ...data
            });
        }
        
        console.log(`📊 Form submission tracked: ${status}`);
    }

    function trackFormStart() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_start', {
                event_category: 'Operator Registration',
                event_label: 'Form Started'
            });
        }
    }

    function trackFieldCompletion(fieldName) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_field_complete', {
                event_category: 'Operator Registration',
                event_label: fieldName
            });
        }
    }

    // ================================
    // PHONE NUMBER FORMATTING
    // ================================

    function setupPhoneFormatting(phoneInput) {
        if (!phoneInput) return;
        
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            // Auto-format for French Polynesia
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

    // ================================
    // FORM INITIALIZATION
    // ================================

    function initializeForm() {
        const form = document.getElementById(FORM_CONFIG.FORM_ID);
        if (!form) {
            console.warn('⚠️ Operator registration form not found');
            return;
        }
        
        console.log('🎯 Initializing operator registration form');
        
        // Setup form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleFormSubmission(form);
        });
        
        // Setup phone formatting
        const phoneInput = form.querySelector('[name="whatsapp_number"]');
        setupPhoneFormatting(phoneInput);
        
        // Track form start on first interaction
        let formStarted = false;
        form.addEventListener('focusin', () => {
            if (!formStarted) {
                formStarted = true;
                trackFormStart();
            }
        }, { once: true });
        
        // Track field completions
        const trackableFields = form.querySelectorAll('input, select, textarea');
        trackableFields.forEach(field => {
            field.addEventListener('blur', () => {
                if (field.value.trim() && field.name) {
                    trackFieldCompletion(field.name);
                }
            });
        });
        
        // Real-time validation for better UX
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                if (input.value.trim()) {
                    // Clear error if field now has value
                    clearFieldError(input);
                }
            });
            
            input.addEventListener('input', () => {
                // Clear error on input
                if (input.classList.contains('error')) {
                    clearFieldError(input);
                }
            });
        });
        
        console.log('✅ Operator registration form initialized');
    }

    // ================================
    // INITIALIZATION
    // ================================

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeForm);
    } else {
        initializeForm();
    }

    // Re-initialize on language change
    document.addEventListener('languageChanged', () => {
        console.log('🌐 Language changed - updating form');
        // Form will be automatically updated by language system
    });

})();