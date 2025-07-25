// ================================
// UPDATED REGISTRATION HANDLER WITH SMART ERROR MESSAGES
// File: app/welcome/registration-handler.js
// ================================

class RegistrationHandler {
  constructor() {
    this.isSubmitting = false
    this.init()
  }
  
  init() {
    console.log('🎯 Initializing VAI Registration Handler')
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupForms())
    } else {
      this.setupForms()
    }
  }
  
  setupForms() {
    console.log('🔧 Setting up registration forms')
    
    // Wait for other scripts to load
    setTimeout(() => {
      this.setupTouristForm()
      this.setupOperatorForm()
      this.addFormEnhancements()
      console.log('✅ Registration forms ready')
    }, 100)
  }
  
  // ===========================
  // TOURIST FORM SETUP (UPDATED)
  // ===========================
  
  setupTouristForm() {
    const form = document.querySelector('#tourist-form')
    
    if (!form) {
      console.log('ℹ️ Tourist form not found - skipping setup')
      return
    }
    
    console.log('🎯 Setting up tourist form')
    
    // Add submit handler
    form.addEventListener('submit', (e) => this.handleTouristSubmit(e))
    
    // Add form validation listeners
    this.addTouristFormValidation(form)
    
    console.log('✅ Tourist form setup complete')
  }
  
  addTouristFormValidation(form) {
    // Real-time validation for key fields
    const requiredFields = ['name', 'email', 'primary_language', 'island'];
    
    requiredFields.forEach(fieldName => {
      const field = form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        field.addEventListener('blur', () => this.validateField(field));
        field.addEventListener('change', () => this.validateField(field));
      }
    });
    
    // Email format validation
    const emailField = form.querySelector('[name="email"]');
    if (emailField) {
      emailField.addEventListener('input', () => {
        if (emailField.value && !this.validateEmail(emailField.value)) {
          this.showFieldError(emailField, 'Please enter a valid email address');
        } else {
          this.clearFieldError(emailField);
        }
      });
    }
  }
  
  // ===========================
  // OPERATOR FORM SETUP (UPDATED)
  // ===========================
  
  setupOperatorForm() {
    const form = document.querySelector('#operator-form')
    
    if (!form) {
      console.log('ℹ️ Operator form not found - skipping setup')
      return
    }
    
    console.log('🎯 Setting up operator form')
    
    // Add submit handler
    form.addEventListener('submit', (e) => this.handleOperatorSubmit(e))
    
    // Add form validation listeners
    this.addOperatorFormValidation(form)
    
    console.log('✅ Operator form setup complete')
  }
  
  addOperatorFormValidation(form) {
    // Real-time validation for key fields
    const requiredFields = ['company_name', 'contact_person', 'email', 'primary_language'];
    
    requiredFields.forEach(fieldName => {
      const field = form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        field.addEventListener('blur', () => this.validateField(field));
        field.addEventListener('change', () => this.validateField(field));
      }
    });
    
    // Email format validation
    const emailField = form.querySelector('[name="email"]');
    if (emailField) {
      emailField.addEventListener('input', () => {
        if (emailField.value && !this.validateEmail(emailField.value)) {
          this.showFieldError(emailField, 'Please enter a valid business email address');
        } else {
          this.clearFieldError(emailField);
        }
      });
    }
  }
  
  // ===========================
  // FORM SUBMISSION HANDLERS (UPDATED)
  // ===========================
  
  async handleTouristSubmit(e) {
  e.preventDefault()
  
  if (this.isSubmitting) return
  this.isSubmitting = true
  
  const form = e.target
  const submitBtn = form.querySelector('button[type="submit"]')
  
  try {
    // Clear previous errors
    this.clearAllErrors(form)
    
    // Show loading state
    this.setSubmitState(submitBtn, true, 'Registering...')
    
    // Extract form data
    const formData = this.extractTouristData(form)
    
    console.log('🎯 Tourist form data extracted:', formData)
    
    // Validate data with smart error messages
    const validationResult = this.validateTouristData(formData, form)
    if (!validationResult.valid) {
      this.showSmartError(form, validationResult.message, validationResult.field)
      return
    }
    
    // Check if registrationService is available
    if (typeof window.registrationService === 'undefined') {
      throw new Error('Registration service not loaded. Please refresh the page.')
    }
    
    // Submit registration
    const result = await window.registrationService.registerTourist(formData)
    
    if (result.success) {
      this.showSuccess(form, result.message, 'tourist')
      this.trackEvent('tourist_registration_success', formData)
      
      // Reset form on success (but don't show it immediately due to success screen)
      setTimeout(() => {
        form.reset()
        // Hide conditional fields
        const islandSelection = document.getElementById('island-selection')
        const whatsappInput = document.getElementById('whatsapp-input')
        if (islandSelection) islandSelection.style.display = 'none'
        if (whatsappInput) whatsappInput.style.display = 'none'
      }, 500)
      
    } else {
      this.showSmartError(form, result.error)
      this.trackEvent('tourist_registration_error', { error: result.error })
    }
    
  } catch (error) {
    console.error('Tourist registration error:', error)
    this.showSmartError(form, this.getErrorMessage(error))
    this.trackEvent('tourist_registration_error', { error: error.message })
    
  } finally {
    this.setSubmitState(submitBtn, false, '🌺 Join VAI - Unlock Paradise')
    this.isSubmitting = false
  }
}


  
  async handleOperatorSubmit(e) {
  e.preventDefault()
  
  if (this.isSubmitting) return
  this.isSubmitting = true
  
  const form = e.target
  const submitBtn = form.querySelector('button[type="submit"]')
  
  try {
    // Clear previous errors
    this.clearAllErrors(form)
    
    // Show loading state
    this.setSubmitState(submitBtn, true, 'Submitting Application...')
    
    // Extract form data
    const formData = this.extractOperatorData(form)
    
    console.log('🎯 Operator form data extracted:', formData)
    
    // Validate data with smart error messages
    const validationResult = this.validateOperatorData(formData, form)
    if (!validationResult.valid) {
      this.showSmartError(form, validationResult.message, validationResult.field)
      return
    }
    
    // Check if registrationService is available
    if (typeof window.registrationService === 'undefined') {
      throw new Error('Registration service not loaded. Please refresh the page.')
    }
    
    // Submit registration
    const result = await window.registrationService.registerOperator(formData)
    
    if (result.success) {
      this.showSuccess(form, result.message, 'operator')
      this.trackEvent('operator_registration_success', formData)
      
      // Reset form on success (but don't show it immediately due to success screen)
      setTimeout(() => {
        form.reset()
      }, 500)
      
    } else {
      this.showSmartError(form, result.error)
      this.trackEvent('operator_registration_error', { error: result.error })
    }
    
  } catch (error) {
    console.error('Operator registration error:', error)
    this.showSmartError(form, this.getErrorMessage(error))
    this.trackEvent('operator_registration_error', { error: error.message })
    
  } finally {
    this.setSubmitState(submitBtn, false, '🚀 Submit Operator Application')
    this.isSubmitting = false
  }
}



  
  // ===========================
  // DATA EXTRACTION (UPDATED FOR NEW FORM STRUCTURE)
  // ===========================
  
  extractTouristData(form) {
    const formData = new FormData(form);
    
    // UPDATED: Primary language from dropdown
    const primaryLanguage = formData.get('primary_language')?.trim();
    
    // UPDATED: WhatsApp number only if opted in
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
        languages: primaryLanguage ? [primaryLanguage] : ['english'] // Convert to array for consistency
    };
  }

  extractOperatorData(form) {
    const formData = new FormData(form);
    
    // Extract arrays
    const islands_served = Array.from(form.querySelectorAll('input[name="islands_served"]:checked'))
        .map(input => input.value);
    
    const tour_types_offered = Array.from(form.querySelectorAll('input[name="tour_types_offered"]:checked'))
        .map(input => input.value);
        
    // UPDATED: Primary language from dropdown
    const primaryLanguage = formData.get('primary_language')?.trim();
    
    return {
        company_name: formData.get('company_name')?.trim(),
        contact_person: formData.get('contact_person')?.trim(),
        email: formData.get('email')?.trim(),
        whatsapp_number: formData.get('whatsapp_number')?.trim(),
        islands_served,
        tour_types_offered,
        languages: primaryLanguage ? [primaryLanguage] : ['english'],
        target_bookings_monthly: formData.get('target_bookings_monthly') || null,
        customer_type_preference: formData.get('customer_type_preference') || null,
        terms_accepted: formData.get('terms_accepted') !== null
    };
  }
  
  // ===========================
  // ENHANCED VALIDATION WITH SMART ERROR MESSAGES
  // ===========================
  
  validateTouristData(data, form) {
    if (!data.name) {
      return { valid: false, message: 'Please enter your full name', field: 'name' }
    }
    
    if (!data.email) {
      return { valid: false, message: 'Please enter your email address', field: 'email' }
    }
    
    if (!this.validateEmail(data.email)) {
      return { valid: false, message: 'Please enter a valid email address (e.g., name@example.com)', field: 'email' }
    }
    
    if (!data.island) {
      return { valid: false, message: 'Please select an island', field: 'island' }
    }
    
    if (!data.languages || data.languages.length === 0 || !data.languages[0]) {
      return { valid: false, message: 'Please select your primary language', field: 'primary_language' }
    }
    
    if (!data.marketing_emails) {
      return { valid: false, message: 'Please agree to receive VAI launch updates', field: 'marketing_emails' }
    }
    
    if (!data.terms_accepted) {
      return { valid: false, message: 'Please agree to the Privacy Policy', field: 'terms_accepted' }
    }
    
    if (data.whatsapp_number && !this.validateWhatsApp(data.whatsapp_number)) {
      return { valid: false, message: 'Please enter a valid WhatsApp number (e.g., +1234567890)', field: 'whatsapp_number' }
    }
    
    return { valid: true }
  }
  
  validateOperatorData(data, form) {
    if (!data.company_name) {
      return { valid: false, message: 'Please enter your company name', field: 'company_name' }
    }
    
    if (!data.contact_person) {
      return { valid: false, message: 'Please enter the contact person name', field: 'contact_person' }
    }
    
    if (!data.email) {
      return { valid: false, message: 'Please enter your business email', field: 'email' }
    }
    
    if (!this.validateEmail(data.email)) {
      return { valid: false, message: 'Please enter a valid business email address', field: 'email' }
    }
    
    if (data.islands_served.length === 0) {
      return { valid: false, message: 'Please select at least one island you operate on', field: 'islands_served' }
    }
    
    if (data.tour_types_offered.length === 0) {
      return { valid: false, message: 'Please select at least one tour type you offer', field: 'tour_types_offered' }
    }
    
    if (!data.languages || data.languages.length === 0 || !data.languages[0]) {
      return { valid: false, message: 'Please select your primary tour language', field: 'primary_language' }
    }
    
    if (!data.terms_accepted) {
      return { valid: false, message: 'Please agree to the Privacy Policy', field: 'terms_accepted' }
    }
    
    return { valid: true }
  }
  
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  validateWhatsApp(phone) {
    // Enhanced WhatsApp validation - support international formats
    const phoneRegex = /^[\+]?[1-9]\d{1,14}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }
  
  // ===========================
  // SMART ERROR HANDLING
  // ===========================
  
  showSmartError(form, message, fieldName = null) {
    if (fieldName) {
      const field = form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        this.showFieldError(field, message);
        field.focus();
        return;
      }
    }
    
    // Show general error message
    this.showMessage(form, message, 'error');
  }
  
  showFieldError(field, message) {
    this.clearFieldError(field);
    
    field.classList.add('error');
    
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message show';
    errorEl.textContent = message;
    
    field.parentNode.appendChild(errorEl);
  }
  
  clearFieldError(field) {
    field.classList.remove('error');
    const errorEl = field.parentNode.querySelector('.error-message');
    if (errorEl) {
      errorEl.remove();
    }
  }
  
  clearAllErrors(form) {
    const errorFields = form.querySelectorAll('.error');
    errorFields.forEach(field => this.clearFieldError(field));
    
    const generalErrors = document.querySelectorAll('.vai-message');
    generalErrors.forEach(error => error.remove());
  }
  
  validateField(field) {
    if (!field.value && field.required) {
      this.showFieldError(field, 'This field is required');
      return false;
    } else {
      this.clearFieldError(field);
      return true;
    }
  }
  
  getErrorMessage(error) {
    const errorMessages = {
      'fetch': 'Connection error. Please check your internet and try again.',
      'timeout': 'Request timed out. Please try again.',
      'duplicate': 'This email is already registered. Please use a different email.',
      'invalid': 'Some information is invalid. Please check your entries.',
      'server': 'Server error. Please try again in a few moments.',
      'network': 'Network error. Please check your connection.'
    };
    
    const message = error.message || error;
    
    for (const [key, value] of Object.entries(errorMessages)) {
      if (message.toLowerCase().includes(key)) {
        return value;
      }
    }
    
    return 'Something went wrong. Please try again.';
  }
  
  // ===========================
  // UI FEEDBACK (ENHANCED)
  // ===========================
  
  setSubmitState(button, isLoading, text) {
    if (!button) return
    
    button.disabled = isLoading
    button.textContent = text
    
    if (isLoading) {
      button.classList.add('loading')
      button.style.opacity = '0.7'
      button.style.cursor = 'not-allowed'
    } else {
      button.classList.remove('loading')
      button.style.opacity = '1'
      button.style.cursor = 'pointer'
    }
  }
  
  showSuccess(form, message, userType = 'tourist') {
  // Show the success screen overlay instead of just toast
  this.showSuccessScreen(form, message, userType)
  
  // Hide the success screen after 10 seconds (optional)
  //setTimeout(() => {
  //  this.hideSuccessScreen(form, userType)
  //}, 10000)
}
  
  showMessage(form, message, type) {
    // Remove existing messages
    const existingMsg = document.querySelector('.vai-message')
    if (existingMsg) {
      existingMsg.remove()
    }
    
    // Create message element
    const messageEl = document.createElement('div')
    messageEl.className = `vai-message`
    messageEl.textContent = message
    
    // Apply styling based on type
    const bgColor = type === 'success' ? '#10b981' : '#ef4444'
    messageEl.style.cssText = `
      position: fixed;
      top: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: ${bgColor};
      color: white;
      padding: 20px 30px;
      border-radius: 12px;
      font-weight: 600;
      z-index: 10000;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      max-width: 90%;
      text-align: center;
      animation: slideInMessage 0.5s ease;
      font-size: 16px;
    `
    
    // Add animation styles if not already added
    if (!document.querySelector('#vai-message-styles')) {
      const style = document.createElement('style')
      style.id = 'vai-message-styles'
      style.textContent = `
        @keyframes slideInMessage {
          from { transform: translateX(-50%) translateY(-30px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        .form-input.error {
          border-color: #ef4444 !important;
          background-color: rgba(239, 68, 68, 0.1);
        }
        .error-message {
          color: #ef4444;
          font-size: 14px;
          margin-top: 5px;
          font-weight: 500;
        }
      `
      document.head.appendChild(style)
    }
    
    // Add to DOM
    document.body.appendChild(messageEl)
    
    // Remove after timeout
    const timeout = type === 'success' ? 5000 : 8000
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.style.opacity = '0'
        setTimeout(() => messageEl.remove(), 300)
      }
    }, timeout)
  }
  
  
  showNextSteps(userType, step) {
    const messages = {

      /*

      // This method is now replaced by the success screen overlay
      
      tourist: {
        download_app: '🎉 Perfect! You\'ll get an email when VAI launches on August 1st. Get ready to unlock paradise!',
        explore_local: '🌺 Welcome! Discover local experiences starting August 1st when VAI goes live.'
      }, */
      operator: {
        await_approval: '🚀 Excellent! Your application is under review. You\'ll hear from us within 24 hours.',
        dashboard_ready: '✅ Great! You can now access your operator dashboard.'
      }
    }
    
    const message = messages[userType]?.[step] || 'Thank you for registering with VAI!'
    this.showSuccess(null, message)
  }
  


  // ===========================
  // FORM ENHANCEMENTS
  // ===========================
  
  addFormEnhancements() {
    // Add smooth scrolling to form sections
    const formLinks = document.querySelectorAll('a[href^="#tourist-form"], a[href^="#operator-form"]')
    
    formLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault()
        const targetId = link.getAttribute('href').substring(1)
        const target = document.getElementById(targetId)
        
        if (target) {
          const headerHeight = document.querySelector('.header')?.offsetHeight || 80
          const targetPosition = target.offsetTop - headerHeight - 20
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          })
        }
      })
    })
  }
  
  // ===========================
  // ANALYTICS
  // ===========================
  
  trackEvent(eventName, data) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        event_category: 'Registration',
        event_label: data.user_type || 'unknown',
        ...data
      })
    }
    
    // Console logging for development
    console.log(`📊 Event: ${eventName}`, data)
  }


  /**
 * Shows the success screen overlay
 */
showSuccessScreen(form, message, userType) {
  console.log(`🎯 Attempting to show success screen for ${userType}`)
  
  const overlayId = userType === 'tourist' ? 'tourist-success-overlay' : 'operator-success-overlay'
  const messageId = userType === 'tourist' ? 'tourist-success-message' : 'operator-success-message'
  
  const overlay = document.getElementById(overlayId)
  const messageElement = document.getElementById(messageId)
  
  console.log(`🔍 Looking for overlay: ${overlayId}`)
  console.log(`🔍 Overlay found:`, overlay)
  
  if (!overlay) {
    console.warn(`❌ Success overlay not found: ${overlayId}`)
    // Fallback to old toast method
    this.showMessage(form, message, 'success')
    return
  }
  
  // Update the message if custom message provided
  if (message && messageElement) {
    console.log(`📝 Updating message: ${message}`)
    // Store original message
    const originalMessage = messageElement.innerHTML
    
    // Update with custom message while preserving language structure
    const currentLang = document.body.getAttribute('data-current-lang') || 'en'
    this.updateSuccessMessage(messageElement, message, currentLang)
    
    // Restore original after hiding
    setTimeout(() => {
      messageElement.innerHTML = originalMessage
    }, 12000)
  }
  
  // Special handling for operator form (in fullscreen overlay)
  if (userType === 'operator') {
    console.log(`🎯 Applying operator form special handling`)
    
    // Make sure the operator form overlay is visible
    const operatorFormOverlay = document.getElementById('operator-form-overlay')
    if (operatorFormOverlay && !operatorFormOverlay.classList.contains('show')) {
      console.log(`⚠️ Operator form overlay not visible, showing it first`)
      operatorFormOverlay.classList.add('show')
    }
    
    // Add special class for operator form context
    overlay.classList.add('operator-context')
    
    // Ensure proper z-index stacking
    overlay.style.zIndex = '10002'
    overlay.style.position = 'fixed'
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
  }
  
  // Show the overlay
  console.log(`✅ Showing success screen overlay`)
  overlay.classList.add('active')
  
  // Track success screen show
  this.trackEvent(`success_screen_shown`, { user_type: userType })
  
  // AUTO-CLOSE: Close operator form overlay after success message
  if (userType === 'operator') {
    setTimeout(() => {
      console.log('🔄 Auto-closing operator form overlay')
      const operatorFormOverlay = document.getElementById('operator-form-overlay')
      if (operatorFormOverlay) {
        operatorFormOverlay.classList.remove('show')
        document.body.style.overflow = 'auto'
      }
    }, 5000) // Close after 5 seconds
  }
  
  console.log(`✅ Success screen shown for ${userType}`)
}

/**
 * Updates success message while preserving language structure
 */
updateSuccessMessage(messageElement, newMessage, currentLang) {
  const langElements = messageElement.querySelectorAll('[data-lang]')
  
  if (langElements.length > 0) {
    // Update the appropriate language element
    langElements.forEach(el => {
      if (el.getAttribute('data-lang') === currentLang) {
        el.textContent = newMessage
      }
    })
  } else {
    // No language structure, just update text
    messageElement.textContent = newMessage
  }
}

/**
 * Hides the success screen overlay
 */
hideSuccessScreen(form, userType) {
  console.log(`🔄 Hiding success screen for ${userType}`)
  
  const overlayId = userType === 'tourist' ? 'tourist-success-overlay' : 'operator-success-overlay'
  const overlay = document.getElementById(overlayId)
  
  if (overlay) {
    overlay.classList.remove('active')
    overlay.classList.remove('operator-context')
    
    // Restore body scroll for operator form
    if (userType === 'operator') {
      // Only restore scroll if operator form overlay is also being closed
      setTimeout(() => {
        const operatorFormOverlay = document.getElementById('operator-form-overlay')
        if (!operatorFormOverlay || !operatorFormOverlay.classList.contains('show')) {
          document.body.style.overflow = 'auto'
        }
      }, 300)
    }
    
    console.log(`✅ Success screen hidden for ${userType}`)
  }
}

/**
 * Resets the tourist form and hides success screen
 */
resetTouristForm() {
  console.log('🔄 Resetting tourist form')
  
  const form = document.querySelector('#tourist-form')
  if (form) {
    form.reset()
    this.hideSuccessScreen(form, 'tourist')
    
    // Hide conditional fields
    const islandSelection = document.getElementById('island-selection')
    const whatsappInput = document.getElementById('whatsapp-input')
    if (islandSelection) islandSelection.style.display = 'none'
    if (whatsappInput) whatsappInput.style.display = 'none'
    
    // Clear any errors
    this.clearAllErrors(form)
    
    console.log('✅ Tourist form reset complete')
  }
}

/**
 * Resets the operator form and hides success screen
 */
resetOperatorForm() {
  console.log('🔄 Resetting operator form')
  
  const form = document.querySelector('#operator-form')
  if (form) {
    form.reset()
    this.hideSuccessScreen(form, 'operator')
    
    // Clear any errors
    this.clearAllErrors(form)
    
    // Optional: close the operator form overlay after a delay
    setTimeout(() => {
      const operatorOverlay = document.getElementById('operator-form-overlay')
      if (operatorOverlay) {
        operatorOverlay.classList.remove('show')
        document.body.style.overflow = 'auto'
      }
    }, 2000)
    
    console.log('✅ Operator form reset complete')
  }
}

}

// ===========================
// INITIALIZATION
// ===========================

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure other scripts load first
  setTimeout(() => {
    window.vaiRegistrationHandler = new RegistrationHandler()
  }, 200)
})


// Close operator form overlay when back button is clicked
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('close-operator-form')
  const operatorOverlay = document.getElementById('operator-form-overlay')
  
  if (closeBtn && operatorOverlay) {
    closeBtn.addEventListener('click', () => {
      operatorOverlay.classList.remove('show')
      document.body.style.overflow = 'auto'
      
      // Also reset form if needed
      const operatorForm = document.getElementById('operator-form')
      if (operatorForm) {
        operatorForm.reset()
      }
    })
  }
})