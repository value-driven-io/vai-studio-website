// ================================
// UPDATED REGISTRATION SERVICE FOR NEW FORM STRUCTURE
// File: app/welcome/services/registration.js
// ================================

const registrationService = {
  
  // ===========================
  // TOURIST REGISTRATION (UPDATED FOR NEW FORM)
  // ===========================
  
  async registerTourist(formData) {
    try {
      console.log('🎯 Starting tourist registration:', formData)
      
      const supabase = window.getSupabase();
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }
      
      const { 
        name, email, user_type, island, whatsapp_number = null, 
        marketing_emails = true, terms_accepted = false, languages = ['english']
      } = formData
      
      // Validate required fields
      if (!name || !email || !user_type || !island) {
        throw new Error('Please fill in all required fields')
      }
      
      if (!terms_accepted) {
        throw new Error('Please agree to the Terms of Service and Privacy Policy')
      }
      
      // Split name into first/last
      const [firstName, ...lastNameParts] = name.trim().split(' ')
      const lastName = lastNameParts.join(' ') || null
      
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('tourist_users')
        .select('id, email, status')
        .eq('email', email.toLowerCase().trim())
        .single()
      
      if (existingUser) {
        return {
          success: false,
          error: 'Email already registered. Please use a different email address.',
          existing: true
        }
      }
      
      // Prepare user data with updated structure
      const userData = {
        email: email.toLowerCase().trim(),
        first_name: firstName,
        last_name: lastName,
        whatsapp_number: whatsapp_number?.trim() || null,
        marketing_emails,
        status: 'registered', // Start as registered, activate later
        
        // Enhanced preferences with updated language support
        favorites: {
          preferences: {
            registration_step: 'complete',
            user_type: user_type,
            home_island: user_type === 'local' ? island : null,
            visit_island: user_type === 'tourist' ? island : null,
            is_local: user_type === 'local',
            languages: languages, // Array for consistency
            primary_language: languages[0] || 'english',
            onboarding_completed: false,
            preferred_language: languages[0] || 'english',
            terms_accepted: terms_accepted,
            terms_accepted_date: new Date().toISOString()
          },
          tour_ids: [],
          behavior_data: {
            registration_date: new Date().toISOString(),
            registration_source: 'landing_page',
            registration_type: user_type,
            marketing_consent: marketing_emails,
            whatsapp_provided: !!whatsapp_number
          }
        }
      }
      
      // Insert user into tourist_users table
      const { data: newUser, error } = await supabase
        .from('tourist_users')
        .insert([userData])
        .select()
        .single()
      
      if (error) {
        console.error('Database error:', error)
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Email already registered. Please use a different email address.')
        }
        throw error
      }
      
      // Send welcome email (non-blocking)
      this.sendWelcomeEmail('tourist', {
        user_id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        user_type: user_type,
        island: island,
        languages: languages,
        marketing_emails: marketing_emails
      }).catch(err => console.warn('Email notification failed:', err))
      
      console.log('✅ Tourist registration successful:', newUser.id)
      
      return {
        success: true,
        user: newUser,
        message: `Welcome ${firstName}! You'll receive launch updates when VAI goes live on July 14th.`,
        next_step: user_type === 'tourist' ? 'download_app' : 'explore_local'
      }
      
    } catch (error) {
      console.error('❌ Tourist registration error:', error)
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.'
      }
    }
  },
  
  // ===========================
  // OPERATOR REGISTRATION (UPDATED FOR NEW FORM)
  // ===========================
  
  async registerOperator(formData) {
    try {
      console.log('🎯 Starting operator registration:', formData)
      
      const supabase = window.getSupabase();
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }
      
      const {
        company_name,
        contact_person,
        email,
        whatsapp_number,
        islands_served = [],
        tour_types_offered = [],
        languages = ['english'],
        target_bookings_monthly = null,
        customer_type_preference = null,
        terms_accepted = false
      } = formData
      
      // Validate required fields
      if (!company_name || !contact_person || !email) {
        throw new Error('Please fill in all required business fields')
      }
      
      if (islands_served.length === 0) {
        throw new Error('Please select at least one island you operate on')
      }
      
      if (tour_types_offered.length === 0) {
        throw new Error('Please select at least one tour type you offer')
      }
      
      if (!terms_accepted) {
        throw new Error('Please agree to the Terms of Service and Privacy Policy')
      }
      
      // Check for existing operator
      const { data: existingOperator } = await supabase
        .from('operators')
        .select('id, email, status')
        .eq('email', email.toLowerCase().trim())
        .single()
      
      if (existingOperator) {
        return {
          success: false,
          error: 'Operator email already registered. Please contact support or use a different email.',
          existing: true
        }
      }
      
      // STEP 1: Create tourist_users record (for app access)
      const [firstName, ...lastNameParts] = contact_person.trim().split(' ')
      const lastName = lastNameParts.join(' ') || null
      
      const touristData = {
        email: email.toLowerCase().trim(),
        first_name: firstName,
        last_name: lastName,
        whatsapp_number: whatsapp_number?.trim() || null,
        marketing_emails: true, // Operators get platform updates
        status: 'registered', // Will be activated after approval
        
        favorites: {
          preferences: {
            registration_step: 'operator_complete',
            user_type: 'operator',
            is_local: true, // Operators are local businesses
            home_island: islands_served[0], // Primary island
            languages: languages,
            primary_language: languages[0] || 'english',
            onboarding_completed: false,
            preferred_language: languages[0] || 'english',
            operator_account: true,
            terms_accepted: terms_accepted,
            terms_accepted_date: new Date().toISOString()
          },
          tour_ids: [],
          behavior_data: {
            registration_date: new Date().toISOString(),
            registration_source: 'operator_landing_page',
            registration_type: 'operator',
            company_name: company_name,
            islands_served: islands_served,
            tour_types_offered: tour_types_offered
          }
        }
      }
      
      const { data: touristUser, error: touristError } = await supabase
        .from('tourist_users')
        .insert([touristData])
        .select()
        .single()
      
      if (touristError) {
        console.error('Tourist user creation error:', touristError)
        if (touristError.code === '23505') { // Unique constraint violation
          throw new Error('Email already registered. Please use a different email address.')
        }
        throw new Error('Failed to create user account')
      }
      
      // STEP 2: Create operators record (business functionality)
      const operatorData = {
        company_name: company_name.trim(),
        contact_person: contact_person.trim(),
        email: email.toLowerCase().trim(),
        whatsapp_number: whatsapp_number?.trim() || null,
        island: islands_served[0], // Primary island
        commission_rate: 10, // Default 10%
        status: 'pending', // pending → active (after approval)
        
        // Store additional data in notes (compatible with existing schema)
        notes: JSON.stringify({
          islands_served: islands_served,
          tour_types_offered: tour_types_offered,
          languages: languages,
          business_goals: {
            target_bookings_monthly,
            customer_type_preference
          },
          registration_date: new Date().toISOString(),
          tourist_user_id: touristUser.id,
          terms_accepted: terms_accepted,
          terms_accepted_date: new Date().toISOString(),
          approval_required: true,
          founding_member: true // First 23 operators get benefits
        })
      }
      
      const { data: newOperator, error: operatorError } = await supabase
        .from('operators')
        .insert([operatorData])
        .select()
        .single()
      
      if (operatorError) {
        console.error('Operator creation error:', operatorError)
        
        // Cleanup: remove tourist user if operator creation failed
        await supabase.from('tourist_users').delete().eq('id', touristUser.id)
        
        if (operatorError.code === '23505') { // Unique constraint violation
          throw new Error('Operator email already registered. Please use a different email address.')
        }
        throw new Error('Failed to create operator account')
      }
      
      // STEP 3: Send notifications (non-blocking)
      Promise.all([
        this.sendWelcomeEmail('operator', {
          operator_id: newOperator.id,
          tourist_user_id: touristUser.id,
          company_name: newOperator.company_name,
          contact_person: newOperator.contact_person,
          email: newOperator.email,
          islands_served: islands_served,
          tour_types_offered: tour_types_offered,
          languages: languages,
          founding_member: true
        }),
        
        this.sendAdminNotification('operator_registration', {
          operator_id: newOperator.id,
          company_name: newOperator.company_name,
          contact_person: newOperator.contact_person,
          email: newOperator.email,
          islands_served: islands_served,
          tour_types_offered: tour_types_offered,
          languages: languages,
          whatsapp_number: whatsapp_number,
          founding_member: true
        })
      ]).catch(err => console.warn('Notification error:', err))
      
      console.log('✅ Operator registration successful:', newOperator.id)
      
      return {
        success: true,
        operator: newOperator,
        tourist_user: touristUser,
        message: `Welcome ${company_name}! Your founding member application is being reviewed. You'll hear from us within 24 hours.`,
        status: 'pending_approval',
        next_step: 'await_approval'
      }
      
    } catch (error) {
      console.error('❌ Operator registration error:', error)
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.'
      }
    }
  },
  
  // ===========================
  // EMAIL NOTIFICATIONS (ENHANCED)
  // ===========================
  
  async sendWelcomeEmail(userType, data) {
    try {
      const webhookUrls = {
        tourist: 'https://n8n-stable-latest.onrender.com/webhook/vai-app-user-registration',
        operator: 'https://n8n-stable-latest.onrender.com/webhook/vai-app-operator-registration'
      };
      
      const webhookUrl = webhookUrls[userType];
      if (!webhookUrl) return;
      
      const payload = {
        type: 'welcome_email',
        user_type: userType,
        timestamp: new Date().toISOString(),
        launch_date: '2025-07-14',
        platform_url: userType === 'tourist' ? 'https://app.vai.studio' : 'https://vai-operator-dashboard.onrender.com',
        ...data
      };
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        console.log(`✅ Welcome email triggered for ${userType}`)
      } else {
        console.warn(`Welcome email failed for ${userType}:`, response.status)
      }
      
    } catch (error) {
      console.warn(`Welcome email error for ${userType}:`, error.message)
      // Don't throw - email failure shouldn't block registration
    }
  },
  
  async sendAdminNotification(type, data) {
    try {
      const webhookUrl = 'https://n8n-stable-latest.onrender.com/webhook/vai-admin-notifications';
      
      const payload = {
        notification_type: type,
        timestamp: new Date().toISOString(),
        priority: data.founding_member ? 'high' : 'normal',
        action_required: type === 'operator_registration' ? 'approval_needed' : 'none',
        ...data
      };
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        console.log('✅ Admin notification sent')
      }
      
    } catch (error) {
      console.warn('Admin notification error:', error.message)
    }
  },
  
  // ===========================
  // UTILITY FUNCTIONS
  // ===========================
  
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },
  
  validateWhatsApp(phone) {
    // Enhanced WhatsApp validation - support international formats
    const phoneRegex = /^[\+]?[1-9]\d{1,14}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  },
  
  formatWhatsApp(phone) {
    // Standardize phone number format
    const cleaned = phone.replace(/\s/g, '')
    if (cleaned.startsWith('+')) {
      return cleaned
    }
    return '+' + cleaned
  },
  
  // Enhanced error handling
  handleDatabaseError(error) {
    if (error.code === '23505') {
      return 'Email already registered. Please use a different email address.'
    }
    if (error.code === '23502') {
      return 'Please fill in all required fields.'
    }
    if (error.code === '23514') {
      return 'Some information is invalid. Please check your entries.'
    }
    return 'Registration failed. Please try again.'
  }
};

// Make available globally
window.registrationService = registrationService;