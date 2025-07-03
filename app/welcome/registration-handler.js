// ================================
// FIXED REGISTRATION HANDLER
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
  // TOURIST FORM SETUP (FIXED IDs)
  // ===========================
  
  setupTouristForm() {
    // FIXED: Use correct form ID from HTML
    const form = document.querySelector('#tourist-form')
    
    if (!form) {
      console.log('ℹ️ Tourist form not found - skipping setup')
      return
    }
    
    console.log('🎯 Setting up tourist form')
    
    // Add submit handler
    form.addEventListener('submit', (e) => this.handleTouristSubmit(e))
    
    // Add dynamic behavior
    this.addTouristFormListeners(form)
    
    console.log('✅ Tourist form setup complete')
  }
  
  addTouristFormListeners(form) {
    // User type change updates island question
    const userTypeInputs = form.querySelectorAll('input[name="user_type"]')
    const islandLabel = form.querySelector('.island-question')
    
    userTypeInputs.forEach(input => {
      input.addEventListener('change', () => {
        if (islandLabel) {
          islandLabel.textContent = input.value === 'local' 
            ? 'Which island do you live on? *'
            : 'Which island will you visit first? *'
        }
      })
    })
    
    // WhatsApp checkbox toggles phone input
    const whatsappCheckbox = form.querySelector('input[name="whatsapp_opt_in"]')
    const whatsappInput = form.querySelector('.whatsapp-input')
    
    if (whatsappCheckbox && whatsappInput) {
      whatsappCheckbox.addEventListener('change', () => {
        whatsappInput.style.display = whatsappCheckbox.checked ? 'block' : 'none'
        const phoneField = whatsappInput.querySelector('input[name="whatsapp_number"]')
        if (phoneField) {
          phoneField.required = whatsappCheckbox.checked
        }
      })
    }
  }
  
  // ===========================
  // OPERATOR FORM SETUP (FIXED IDs)
  // ===========================
  
  setupOperatorForm() {
    // FIXED: Use correct form ID from HTML
    const form = document.querySelector('#operator-form')
    
    if (!form) {
      console.log('ℹ️ Operator form not found - skipping setup')
      return
    }
    
    console.log('🎯 Setting up operator form')
    
    // Add submit handler
    form.addEventListener('submit', (e) => this.handleOperatorSubmit(e))
    
    console.log('✅ Operator form setup complete')
  }
  
  // ===========================
  // FORM SUBMISSION HANDLERS
  // ===========================
  
  async handleTouristSubmit(e) {
    e.preventDefault()
    
    if (this.isSubmitting) return
    this.isSubmitting = true
    
    const form = e.target
    const submitBtn = form.querySelector('button[type="submit"]')
    
    try {
      // Show loading state
      this.setSubmitState(submitBtn, true, 'Registering...')
      
      // Extract form data with FIXED language extraction
      const formData = this.extractTouristData(form)
      
      console.log('🎯 Tourist form data extracted:', formData)
      
      // Validate data
      if (!this.validateTouristData(formData)) {
        return
      }
      
      // Check if registrationService is available
      if (typeof window.registrationService === 'undefined') {
        throw new Error('Registration service not loaded. Please refresh the page.')
      }
      
      // Submit registration
      const result = await window.registrationService.registerTourist(formData)
      
      if (result.success) {
        this.showSuccess(form, result.message)
        this.trackEvent('tourist_registration_success', formData)
        
        // Reset form on success
        form.reset()
        
        // Hide WhatsApp input
        const whatsappInput = form.querySelector('.whatsapp-input')
        if (whatsappInput) {
          whatsappInput.style.display = 'none'
        }
        
        // Show next steps
        setTimeout(() => {
          this.showNextSteps('tourist', result.next_step)
        }, 2000)
        
      } else {
        this.showError(form, result.error)
        this.trackEvent('tourist_registration_error', { error: result.error })
      }
      
    } catch (error) {
      console.error('Tourist registration error:', error)
      this.showError(form, 'Registration failed. Please try again.')
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
      // Show loading state
      this.setSubmitState(submitBtn, true, 'Submitting Application...')
      
      // Extract form data with FIXED language extraction
      const formData = this.extractOperatorData(form)
      
      console.log('🎯 Operator form data extracted:', formData)
      
      // Validate data
      if (!this.validateOperatorData(formData)) {
        return
      }
      
      // Check if registrationService is available
      if (typeof window.registrationService === 'undefined') {
        throw new Error('Registration service not loaded. Please refresh the page.')
      }
      
      // Submit registration
      const result = await window.registrationService.registerOperator(formData)
      
      if (result.success) {
        this.showSuccess(form, result.message)
        this.trackEvent('operator_registration_success', formData)
        
        // Reset form on success
        form.reset()
        
        // Show next steps
        setTimeout(() => {
          this.showNextSteps('operator', result.next_step)
        }, 2000)
        
      } else {
        this.showError(form, result.error)
        this.trackEvent('operator_registration_error', { error: result.error })
      }
      
    } catch (error) {
      console.error('Operator registration error:', error)
      this.showError(form, 'Registration failed. Please try again.')
      this.trackEvent('operator_registration_error', { error: error.message })
      
    } finally {
      this.setSubmitState(submitBtn, false, '🚀 Submit Operator Application')
      this.isSubmitting = false
    }
  }
  
  // ===========================
  // DATA EXTRACTION (FIXED LANGUAGE HANDLING)
  // ===========================
  
  extractTouristData(form) {
    const formData = new FormData(form);
    
    // FIXED: Properly extract selected languages
    const languages = Array.from(form.querySelectorAll('input[name="languages"]:checked'))
        .map(input => input.value);
    
    // FIXED: Get WhatsApp number only if opted in
    const whatsappOptIn = form.querySelector('input[name="whatsapp_opt_in"]')?.checked;
    const whatsappNumber = whatsappOptIn ? formData.get('whatsapp_number')?.trim() : null;
    
    return {
        name: formData.get('name')?.trim(),
        email: formData.get('email')?.trim(),
        user_type: formData.get('user_type') || 'tourist',
        island: formData.get('island'),
        whatsapp_number: whatsappNumber,
        marketing_emails: formData.get('marketing_emails') !== null,
        languages: languages.length > 0 ? languages : ['english'] // Default to English
    };
  }

  extractOperatorData(form) {
    const formData = new FormData(form);
    
    // FIXED: Properly extract arrays
    const islands_served = Array.from(form.querySelectorAll('input[name="islands_served"]:checked'))
        .map(input => input.value);
    
    const tour_types_offered = Array.from(form.querySelectorAll('input[name="tour_types_offered"]:checked'))
        .map(input => input.value);
        
    // FIXED: Operator language is a dropdown (single selection), convert to array for consistency
    const selectedLanguage = formData.get('languages')?.trim();
    const languages = selectedLanguage ? [selectedLanguage] : ['english'];
    
    return {
        company_name: formData.get('company_name')?.trim(),
        contact_person: formData.get('contact_person')?.trim(),
        email: formData.get('email')?.trim(),
        whatsapp_number: formData.get('whatsapp_number')?.trim(),
        islands_served,
        tour_types_offered,
        languages,
        target_bookings_monthly: formData.get('target_bookings_monthly') || null,
        customer_type_preference: formData.get('customer_type_preference') || null
    };
  }
  
  // ===========================
  // VALIDATION (ENHANCED)
  // ===========================
  
  validateTouristData(data) {
    if (!data.name) {
      this.showError(null, 'Please enter your name')
      return false
    }
    
    if (!this.validateEmail(data.email)) {
      this.showError(null, 'Please enter a valid email address')
      return false
    }
    
    if (!data.island) {
      this.showError(null, 'Please select an island')
      return false
    }
    
    if (data.whatsapp_number && !this.validateWhatsApp(data.whatsapp_number)) {
      this.showError(null, 'Please enter a valid WhatsApp number')
      return false
    }
    
    // FIXED: Enhanced language validation
    if (!data.languages || data.languages.length === 0) {
      this.showError(null, 'Please select at least one language')
      return false
    }
    
    return true
  }
  
  validateOperatorData(data) {
    if (!data.company_name) {
      this.showError(null, 'Please enter your company name')
      return false
    }
    
    if (!data.contact_person) {
      this.showError(null, 'Please enter a contact person name')
      return false
    }
    
    if (!this.validateEmail(data.email)) {
      this.showError(null, 'Please enter a valid email address')
      return false
    }
    
    if (data.islands_served.length === 0) {
      this.showError(null, 'Please select at least one island you operate on')
      return false
    }
    
    if (data.tour_types_offered.length === 0) {
      this.showError(null, 'Please select at least one tour type you offer')
      return false
    }
    
    // FIXED: Language validation for operators (now dropdown single selection)
    if (!data.languages || data.languages.length === 0 || !data.languages[0]) {
      this.showError(null, 'Please select your primary tour language')
      return false
    }
    
    return true
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
  
  showSuccess(form, message) {
    this.showMessage(form, message, 'success')
  }
  
  showError(form, message) {
    this.showMessage(form, message, 'error')
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
      tourist: {
        download_app: '🎉 Perfect! You\'ll get an email when VAI launches on July 14th. Get ready to unlock paradise!',
        explore_local: '🌺 Welcome! Discover local experiences starting July 14th when VAI goes live.'
      },
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