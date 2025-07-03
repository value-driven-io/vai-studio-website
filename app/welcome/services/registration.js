// ================================
// FIXED REGISTRATION SERVICE
// File: app/welcome/services/registration.js
// ================================

const registrationService = {
  
  // ===========================
  // TOURIST REGISTRATION (FIXED)
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
        marketing_emails = true, languages = ['english']
      } = formData
      
      // Validate required fields
      if (!name || !email || !user_type || !island) {
        throw new Error('Please fill in all required fields')
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
          error: 'Email already registered. Please sign in instead.',
          existing: true
        }
      }
      
      // Prepare user data (REMOVED temp_password field)
      const userData = {
        email: email.toLowerCase().trim(),
        first_name: firstName,
        last_name: lastName,
        whatsapp_number: whatsapp_number?.trim() || null,
        marketing_emails,
        status: 'registered', // Start as registered, activate later
        
        // Enhanced preferences with language support
        favorites: {
          preferences: {
            registration_step: 'complete',
            user_type: user_type,
            home_island: user_type === 'local' ? island : null,
            visit_island: user_type === 'tourist' ? island : null,
            is_local: user_type === 'local',
            languages: languages,
            primary_language: languages[0] || 'english',
            onboarding_completed: false,
            preferred_language: languages[0] || 'english'
          },
          tour_ids: [],
          behavior_data: {
            registration_date: new Date().toISOString(),
            registration_source: 'landing_page',
            registration_type: user_type
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
        throw error
      }
      
      // Send welcome email (non-blocking)
      this.sendWelcomeEmail('tourist', {
        user_id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        user_type: user_type,
        island: island,
        languages: languages
      }).catch(err => console.warn('Email notification failed:', err))
      
      console.log('✅ Tourist registration successful:', newUser.id)
      
      return {
        success: true,
        user: newUser,
        message: `Welcome ${firstName}! You'll receive access details when VAI launches.`,
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
  // OPERATOR REGISTRATION (ENHANCED)
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
        customer_type_preference = null
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
      
      // Check for existing operator
      const { data: existingOperator } = await supabase
        .from('operators')
        .select('id, email, status')
        .eq('email', email.toLowerCase().trim())
        .single()
      
      if (existingOperator) {
        return {
          success: false,
          error: 'Operator email already registered. Please contact support.',
          existing: true
        }
      }
      
      // STEP 1: Create tourist_users record
      const [firstName, ...lastNameParts] = contact_person.trim().split(' ')
      const lastName = lastNameParts.join(' ') || null
      
      const touristData = {
        email: email.toLowerCase().trim(),
        first_name: firstName,
        last_name: lastName,
        whatsapp_number: whatsapp_number?.trim() || null,
        marketing_emails: true,
        status: 'registered',
        
        favorites: {
          preferences: {
            registration_step: 'operator_complete',
            user_type: 'operator',
            is_local: true,
            home_island: islands_served[0],
            languages: languages,
            primary_language: languages[0] || 'english',
            onboarding_completed: false,
            preferred_language: languages[0] || 'english',
            operator_account: true
          },
          tour_ids: [],
          behavior_data: {
            registration_date: new Date().toISOString(),
            registration_source: 'operator_landing_page',
            registration_type: 'operator'
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
        throw new Error('Failed to create user account')
      }
      
      // STEP 2: Create operators record
      const operatorData = {
        company_name: company_name.trim(),
        contact_person: contact_person.trim(),
        email: email.toLowerCase().trim(),
        whatsapp_number: whatsapp_number?.trim() || null,
        island: islands_served[0], // Primary island
        commission_rate: 10, // Default 10%
        status: 'pending',
        
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
          tourist_user_id: touristUser.id
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
        throw new Error('Failed to create operator account')
      }
      
      // Send notifications (non-blocking)
      Promise.all([
        this.sendWelcomeEmail('operator', {
          operator_id: newOperator.id,
          company_name: newOperator.company_name,
          contact_person: newOperator.contact_person,
          email: newOperator.email,
          islands_served: islands_served,
          tour_types_offered: tour_types_offered,
          languages: languages
        }),
        this.sendAdminNotification('operator_registration', {
          operator_id: newOperator.id,
          company_name: newOperator.company_name,
          email: newOperator.email
        })
      ]).catch(err => console.warn('Notification error:', err))
      
      console.log('✅ Operator registration successful:', newOperator.id)
      
      return {
        success: true,
        operator: newOperator,
        message: `Welcome ${company_name}! Your application is being reviewed.`,
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
  // EMAIL NOTIFICATIONS (FIXED CORS)
  // ===========================
  
  async sendWelcomeEmail(userType, data) {
    try {
      const webhookUrls = {
        tourist: 'https://n8n-stable-latest.onrender.com/webhook-test/vai-app-user-registration',
        operator: 'https://n8n-stable-latest.onrender.com/webhook-test/vai-app-operator-registration'
      };
      
      const webhookUrl = webhookUrls[userType];
      if (!webhookUrl) return;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors', // Explicitly set CORS mode
        body: JSON.stringify({
          type: 'welcome_email',
          user_type: userType,
          timestamp: new Date().toISOString(),
          ...data
        })
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
      const webhookUrl = 'https://n8n-stable-latest.onrender.com/webhook-test/vai-admin-notifications';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          notification_type: type,
          timestamp: new Date().toISOString(),
          ...data
        })
      })
      
      if (response.ok) {
        console.log('✅ Admin notification sent')
      }
      
    } catch (error) {
      console.warn('Admin notification error:', error.message)
    }
  }
};

// Make available globally
window.registrationService = registrationService;