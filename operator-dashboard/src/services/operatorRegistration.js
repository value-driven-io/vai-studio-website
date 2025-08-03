// src/services/operatorRegistration.js
import { supabase } from '../lib/supabase'

class OperatorRegistrationService {
  
  /**
   * Register a new operator with complete validation and dual-table insert
   * Maintains exact compatibility with existing landing page registration
   */
  async registerOperator(formData) {
    try {
      console.log('🚀 Starting operator registration for:', formData.email)
      
      // Validate input data
      const validation = this.validateRegistrationData(formData)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      const {
        company_name, contact_person, email, whatsapp_number, island,
        business_description, tour_types, languages, target_bookings_monthly,
        customer_type_preference, terms_accepted, marketing_emails
      } = formData

      const normalizedEmail = email.toLowerCase().trim()
      
      // STEP 1: Check for existing tourist user (dual role capability)
      let touristUser = null
      let existingTourist = false

      const { data: existingUser, error: userCheckError } = await supabase
        .from('tourist_users')
        .select('*')
        .eq('email', normalizedEmail)
        .single()

      if (existingUser && !userCheckError) {
        touristUser = existingUser
        existingTourist = true
        console.log('✅ Found existing tourist user for dual role:', touristUser.id)
      }

      // STEP 2: Create tourist_users record if needed
      if (!existingTourist) {
        const touristData = {
          email: normalizedEmail,
          whatsapp_number: whatsapp_number?.trim() || null,
          first_name: contact_person.trim(),
          
          // Enhanced profile data for operators
          profile_data: {
            contact_person: contact_person.trim(),
            company_name: company_name.trim(),
            islands_served: island,
            tour_types_offered: tour_types,
            languages: Array.isArray(languages) ? languages : [languages],
            primary_language: Array.isArray(languages) ? languages[0] : languages,
            onboarding_completed: false,
            preferred_language: Array.isArray(languages) ? languages[0] : languages,
            operator_account: true,
            
            // Business targeting data
            target_bookings_monthly: target_bookings_monthly,
            customer_type_preference: customer_type_preference,
            
            // Legal and preferences
            terms_accepted: terms_accepted,
            terms_accepted_date: new Date().toISOString(),
            marketing_emails: marketing_emails,
            
            // Founding member status
            founding_member: true,
            application_number: Math.floor(Math.random() * 1000000)
          },
          tour_ids: [],
          behavior_data: {
            registration_date: new Date().toISOString(),
            registration_source: 'operator_dashboard_app',
            registration_type: 'operator',
            company_name: company_name.trim(),
            islands_served: island,
            tour_types_offered: tour_types,
            business_description: business_description.trim()
          }
        }

        const { data: newTourist, error: touristError } = await supabase
          .from('tourist_users')
          .insert([touristData])
          .select()
          .single()

        if (touristError) {
          console.error('❌ Tourist user creation error:', touristError)
          throw new Error('Registration failed. Please try again.')
        }

        touristUser = newTourist
        console.log('✅ Created new tourist user:', touristUser.id)
      }

      // STEP 3: Create operators record (business data)
      const operatorData = {
        email: normalizedEmail,
        company_name: company_name.trim(),
        contact_person: contact_person.trim(),
        whatsapp_number: whatsapp_number?.trim() || null,
        island: island,
        status: 'pending', // 🔑 CRITICAL: Requires manual approval
        
        // Business description as direct column
        business_description: business_description?.trim() || null,
        
        // Store additional business data in notes JSONB field
        notes: {
          tourist_user_id: touristUser.id,
          registration_source: 'operator_dashboard_app',
          registration_date: new Date().toISOString(),
          
          // Business details
          islands_served: island,
          tour_types_offered: tour_types,
          languages: Array.isArray(languages) ? languages : [languages],
          primary_language: Array.isArray(languages) ? languages[0] : languages,
          
          // Business metrics
          target_bookings_monthly: target_bookings_monthly,
          customer_type_preference: customer_type_preference,
          
          // Marketing and legal
          marketing_emails: marketing_emails,
          terms_accepted: terms_accepted,
          terms_accepted_date: new Date().toISOString(),
          
          // Founding member tracking
          founding_member: true,
          existing_tourist: existingTourist,
          application_number: touristUser.profile_data?.application_number || Math.floor(Math.random() * 1000000)
        }
      }

      const { data: operatorUser, error: operatorError } = await supabase
        .from('operators')
        .insert([operatorData])
        .select()
        .single()

      if (operatorError) {
        console.error('❌ Operator creation error:', operatorError)
        
        // Handle specific errors
        if (operatorError.code === '23505') {
          if (operatorError.message.includes('email')) {
            throw new Error('An operator account with this email already exists.')
          }
        }
        
        throw new Error('Registration failed. Please try again.')
      }

      console.log('✅ Created operator record:', operatorUser.id)

      // STEP 4: Send notification webhook (non-blocking)
      this.sendRegistrationNotification({
        ...formData,
        tourist_user_id: touristUser.id,
        operator_id: operatorUser.id,
        existing_tourist: existingTourist,
        registration_source: 'operator_dashboard_app'
      }).catch(error => {
        console.warn('⚠️ Webhook notification failed:', error)
        // Don't fail registration if webhook fails
      })

      // STEP 5: Return success with comprehensive data
      return {
        success: true,
        user: touristUser,
        operator: operatorUser,
        message: 'Registration successful! We\'ll review your application and contact you within 24 hours.',
        status: 'pending_approval',
        existing_tourist: existingTourist,
        dual_role: existingTourist,
        next_steps: [
          'Check your email for confirmation',
          'Our team will review your application',
          'You\'ll receive approval notification within 24 hours',
          'Once approved, you can login and start creating tours'
        ]
      }

    } catch (error) {
      console.error('❌ Operator registration error:', error)
      
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.',
        details: error
      }
    }
  }

  /**
   * Validate registration data before processing
   */
  validateRegistrationData(formData) {
    const errors = []

    // Required fields validation
    if (!formData.company_name?.trim()) errors.push('Company name is required')
    if (!formData.contact_person?.trim()) errors.push('Contact person is required')
    if (!formData.email?.trim()) errors.push('Email is required')
    if (!formData.whatsapp_number?.trim()) errors.push('WhatsApp number is required')
    if (!formData.island) errors.push('Island selection is required')
    if (!formData.business_description?.trim()) errors.push('Business description is required')
    if (!formData.tour_types?.length) errors.push('At least one tour type must be selected')
    if (!formData.target_bookings_monthly) errors.push('Target bookings selection is required')
    if (!formData.customer_type_preference) errors.push('Customer type preference is required')
    if (!formData.terms_accepted) errors.push('Terms of service must be accepted')

    // Email format validation
    if (formData.email && !this.validateEmail(formData.email)) {
      errors.push('Valid email address is required')
    }

    // Phone number basic validation
    if (formData.whatsapp_number && !this.validatePhone(formData.whatsapp_number)) {
      errors.push('Valid WhatsApp number is required')
    }

    // Company name length validation
    if (formData.company_name && formData.company_name.trim().length < 2) {
      errors.push('Company name must be at least 2 characters')
    }

    return {
      valid: errors.length === 0,
      error: errors.length > 0 ? errors.join(', ') : null,
      errors: errors
    }
  }

  /**
   * Email validation helper
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  /**
   * Phone number validation helper
   */
  validatePhone(phone) {
    // Allow various international formats
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,}$/
    return phoneRegex.test(phone.trim())
  }

  /**
   * Send registration notification to n8n webhook
   */
  async sendRegistrationNotification(data) {
    try {
      const webhookData = {
        email: data.email,
        company_name: data.company_name,
        contact_person: data.contact_person,
        whatsapp_number: data.whatsapp_number,
        island: data.island,
        business_description: data.business_description,
        tour_types: data.tour_types,
        languages: data.languages,
        target_bookings_monthly: data.target_bookings_monthly,
        customer_type_preference: data.customer_type_preference,
        registration_date: new Date().toISOString(),
        source: 'operator_dashboard_app',
        marketing_emails: data.marketing_emails,
        terms_accepted: data.terms_accepted,
        founding_member: true,
        existing_tourist: data.existing_tourist || false,
        tourist_user_id: data.tourist_user_id,
        operator_id: data.operator_id
      }

      const response = await fetch('https://n8n-stable-latest.onrender.com/webhook/vai-app-operator-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      })

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`)
      }

      console.log('✅ Registration notification sent successfully')
      return true

    } catch (error) {
      console.error('❌ Webhook notification error:', error)
      throw error
    }
  }

  /**
   * Check operator approval status
   */
  async checkApprovalStatus(email) {
    try {
      const { data, error } = await supabase
        .from('operators')
        .select('id, status, company_name, created_at, notes')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { found: false, status: null }
        }
        throw error
      }

      return {
        found: true,
        status: data.status,
        operator: data,
        canLogin: data.status === 'active'
      }

    } catch (error) {
      console.error('❌ Approval status check error:', error)
      return { found: false, status: null, error: error.message }
    }
  }
}

// Export singleton instance
export const operatorRegistrationService = new OperatorRegistrationService()
export default operatorRegistrationService