// src/services/operatorRegistration.js
import { supabase } from '../lib/supabase'

class OperatorRegistrationService {
  
  /**
   * Register a new operator with complete validation and dual-table insert
   * ✅ SCHEMA-COMPATIBLE - Uses actual database structure
   * ✅ PROVEN PATTERN - Follows existing landing page registration logic
   * ✅ IMMEDIATE AUTH - Creates Supabase auth for instant login
   */
  async registerOperator(formData) {
    try {
      // 🎯 DEBUG: Verify which database we're connecting to (operator-dashboard uses process.env)
      console.log('🎯 Database URL being used:', process.env.REACT_APP_SUPABASE_URL)
      console.log('🚀 Starting schema-compatible operator registration for:', formData.email)
      
      // Validate input data
      const validation = this.validateRegistrationData(formData)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      const {
      company_name, contact_person, email, whatsapp_number, island, preferred_language,
      business_description, tour_types, languages, target_bookings_monthly,
      customer_type_preference, terms_accepted, marketing_emails
    } = formData

      const normalizedEmail = email.toLowerCase().trim()
      const languageCode = preferred_language || this.convertLanguageToCode(Array.isArray(languages) ? languages[0] : languages)
      
      console.log('📝 Registration data processed:', {
        email: normalizedEmail,
        company: company_name.trim(),
        island: island,
        languageCode: languageCode,
        originalLanguages: languages
      })

      // ✅ IMMEDIATE AUTH: Prepare credentials upfront
      const tempPassword = `VAI_${normalizedEmail}`
      let authUserId = null
      
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
        
        // Update existing tourist with operator preferences (following landing page pattern)
        const updatedFavorites = {
          ...existingUser.favorites,
          preferences: {
            ...existingUser.favorites?.preferences,
            registration_step: 'operator_complete',
            user_type: 'operator',
            is_local: true,
            home_island: island,
            languages: Array.isArray(languages) ? languages : [languages],
            primary_language: languageCode,
            operator_account: true,
            target_bookings_monthly: target_bookings_monthly,
            customer_type_preference: customer_type_preference,
            terms_accepted: terms_accepted,
            terms_accepted_date: new Date().toISOString(),
            marketing_emails: marketing_emails,
            founding_member: true,
            application_number: existingUser.favorites?.preferences?.application_number || Math.floor(Math.random() * 1000000)
          },
          behavior_data: {
            ...existingUser.favorites?.behavior_data,
            operator_registration_date: new Date().toISOString(),
            registration_source: 'operator_dashboard_app',
            registration_type: 'operator',
            company_name: company_name,
            islands_served: island,
            tour_types_offered: tour_types,
            business_description: business_description
          }
        }
        
        const { error: updateError } = await supabase
          .from('tourist_users')
          .update({ favorites: updatedFavorites })
          .eq('id', existingUser.id)
        
        if (updateError) {
          console.warn('⚠️ Tourist update warning:', updateError)
          // Continue anyway - this is not critical for operator creation
        }
      }

      // STEP 2: Create tourist_users record if needed (using ACTUAL schema)
      if (!existingTourist) {
        // Split contact_person into first/last name
        const [firstName, ...lastNameParts] = contact_person.trim().split(' ')
        const lastName = lastNameParts.join(' ') || null

        const touristData = {
          // ✅ Using ACTUAL columns that exist
          email: normalizedEmail,
          first_name: firstName,
          last_name: lastName,
          whatsapp_number: whatsapp_number?.trim() || null,
          marketing_emails: marketing_emails,
          preferred_language: languageCode,
          status: 'registered', // Will be activated after operator approval
          
          // ✅ Store extra data in favorites JSONB (ACTUAL column, proven pattern)
          favorites: {
            preferences: {
              registration_step: 'operator_complete',
              user_type: 'operator',
              is_local: true, // Operators are local businesses
              home_island: island,
              languages: Array.isArray(languages) ? languages : [languages],
              primary_language: languageCode,
              onboarding_completed: false,
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

      // STEP 2.5: Create Supabase Auth User (IMMEDIATE AUTH)
      console.log('🔐 Creating Supabase auth for operator:', normalizedEmail)
      
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: tempPassword,
        options: {
          emailRedirectTo: undefined // Prevent email confirmation requirement
        }
      })

      if (authError) {
        console.warn('⚠️ Auth creation failed:', authError.message)
        // Continue without auth - can be created later by admin
        // Don't fail the entire registration
      } else if (authUser?.user) {
        authUserId = authUser.user.id
        console.log('✅ Created Supabase auth user:', authUserId)
      }

      // STEP 3: Create operators record (using ACTUAL schema)
      const operatorData = {
        // ✅ Using ACTUAL columns that exist
        email: normalizedEmail,
        company_name: company_name.trim(),
        contact_person: contact_person.trim(),
        whatsapp_number: whatsapp_number?.trim() || null,
        island: island,
        status: 'pending', // 🔑 CRITICAL: Requires manual approval

        // Flexible commission rate management >> Set up the default commission rate
        commission_rate: parseFloat(process.env.REACT_APP_DEFAULT_COMMISSION_RATE) || 11.00,
        
        // ✅ Store auth_user_id for immediate login capability
        auth_user_id: authUserId, // Links to Supabase auth
        
        // ✅ Store temp password for reference
        temp_password: authUserId ? tempPassword : null,
        
        // ✅ business_description is an ACTUAL column (TEXT)
        business_description: business_description?.trim() || null,
        
        // ✅ Store additional business data in notes TEXT field (as JSON string)
        notes: JSON.stringify({
          tourist_user_id: touristUser.id,
          registration_source: 'operator_dashboard_app',
          registration_date: new Date().toISOString(),
          
          // Auth information
          auth_created: !!authUserId,
          temp_password_set: !!authUserId,
          immediate_login_enabled: !!authUserId,
          
          // Business details
          islands_served: island,
          tour_types_offered: tour_types,
          languages: Array.isArray(languages) ? languages : [languages],
          primary_language: languageCode,
          
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
          application_number: touristUser.favorites?.preferences?.application_number || Math.floor(Math.random() * 1000000)
        })
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
        languages: [languageCode], // 🆕 Use the actual selected language
        tourist_user_id: touristUser.id,
        operator_id: operatorUser.id,
        existing_tourist: existingTourist,
        registration_source: 'vai_operator_app'
      }).catch(error => {
        console.warn('⚠️ Webhook notification failed:', error)
        // Don't fail registration if webhook fails
      })

      // STEP 5: Return success with comprehensive data
      const successResponse = {
        success: true,
        user: touristUser,
        operator: operatorUser,
        message: 'Registration successful! We\'ll review your application and contact you within 24 hours.',
        status: 'pending_approval',
        existing_tourist: existingTourist,
        dual_role: existingTourist,
        
        // ✅ NEW: Immediate login capability
        immediate_login: !!authUserId,
        login_credentials: authUserId ? {
          email: normalizedEmail,
          temp_password: tempPassword
        } : null,
        
        next_steps: authUserId ? [
          'You can login immediately to check your approval status',
          'Use your email and temporary password "VAI_',email,'" to access VAI Operator',
          'Our team will review your application within 24 hours',
          'Once approved, you\'ll have full access to create tours'
        ] : [
          'Check your email for confirmation',
          'Our team will review your application',
          'You\'ll receive approval notification within 24 hours',
          'Once approved, you can login and start creating tours'
        ]
      }

      return successResponse

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
   * Convert language names to language codes for database storage
   * Database field: tourist_users.preferred_language character varying(5)
   */
  convertLanguageToCode(language) {
    const languageMap = {
      'French': 'fr',
      'English': 'en', 
      'Français': 'fr',
      'Anglais': 'en',
      'french': 'fr',
      'english': 'en'
    }
    
    // If it's already a code (2-3 chars), return as is
    if (typeof language === 'string' && language.length <= 3) {
      return language.toLowerCase()
    }
    
    // Convert full name to code
    return languageMap[language] || 'fr' // Default to French for French Polynesia
  }

    /**
   * Phone number validation helper
   * 🔧 UPDATED: Handles optional WhatsApp field properly
   */
  validatePhone(phone) {
    if (!phone || !phone.trim()) return true // Empty is valid (optional field)
    
    // Allow various international formats
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,}$/
    return phoneRegex.test(phone.trim())
  }  /**
   * Validate registration data before processing
   * 🔧 UPDATED: Made WhatsApp, target_bookings, customer_type optional per requirements
   */
  validateRegistrationData(formData) {
    const errors = []

    // ✅ REQUIRED FIELDS (per your specifications)
    if (!formData.company_name?.trim()) errors.push('Company name is required')
    if (!formData.contact_person?.trim()) errors.push('Contact person is required')
    if (!formData.email?.trim()) errors.push('Email is required')
    if (!formData.island) errors.push('Island selection is required')
    if (!formData.business_description?.trim()) errors.push('Business description is required')
    if (!formData.tour_types?.length) errors.push('At least one tour type must be selected')
    if (!formData.terms_accepted) errors.push('Terms of service must be accepted')

    // ✅ OPTIONAL FIELDS - Only validate format if provided
    // WhatsApp: Optional, but validate format if provided
    if (formData.whatsapp_number?.trim() && !this.validatePhone(formData.whatsapp_number)) {
      errors.push('Valid WhatsApp number format is required')
    }

    // Email format validation
    if (formData.email && !this.validateEmail(formData.email)) {
      errors.push('Valid email address is required')
    }

    // Company name length validation
    if (formData.company_name && formData.company_name.trim().length < 2) {
      errors.push('Company name must be at least 2 characters')
    }

    // 🗑️ REMOVED: These are now optional
    // - whatsapp_number (optional)
    // - target_bookings_monthly (optional) 
    // - customer_type_preference (optional)

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
   * 🔧 UPDATED: Handles optional WhatsApp field properly
   */
  validatePhone(phone) {
    if (!phone || !phone.trim()) return true // Empty is valid (optional field)
    
    // Allow various international formats
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,}$/
    return phoneRegex.test(phone.trim())
  }
  
  /**
   * Send registration notification to n8n webhook
   * ✅ UNCHANGED - This part was working correctly
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
        preferred_language: data.preferred_language,
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
   * ✅ UNCHANGED - This part was working correctly
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