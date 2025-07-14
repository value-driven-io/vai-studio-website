// ================================
// OPERATOR REGISTRATION SERVICE - COMPLETE WITH ALL HELPER FUNCTIONS
// File: /app/operator-welcome/services/registration.js
// ================================

const registrationService = {
  
  // ===========================
  // OPERATOR REGISTRATION (FIXED FOR DUAL ROLES)
  // ===========================
  
  async registerOperator(formData) {
    try {
      console.log('🎯 Starting operator registration:', formData)
      
      const supabase = window.getSupabase();
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }
      
      const { 
        company_name, contact_person, email, whatsapp_number, 
        islands_served, languages, tour_types_offered = [],
        business_description = '', target_bookings_monthly, 
        customer_type_preference, terms_accepted = false, 
        marketing_emails = true
      } = formData
      
      // Validate required fields
      if (!company_name || !contact_person || !email || !whatsapp_number || !islands_served || !languages) {
        throw new Error('Please fill in all required fields')
      }
      
      if (!terms_accepted) {
        throw new Error('Please agree to the Terms of Service and Privacy Policy')
      }
      
      // Validate tour types (allow empty for now)
      const tourTypesArray = Array.isArray(tour_types_offered) ? tour_types_offered : 
                            typeof tour_types_offered === 'string' ? [tour_types_offered] : [];
      
      // ✅ FIXED: Check for existing OPERATOR first (prevent duplicate operators)
      const { data: existingOperator } = await supabase
        .from('operators')
        .select('id, email, status')
        .eq('email', email.toLowerCase().trim())
        .single()
      
      if (existingOperator) {
        return {
          success: false,
          error: 'Operator email already registered. Please contact support or use a different email address.',
          existing: true
        }
      }
      
      // Split name into first/last
      const [firstName, ...lastNameParts] = contact_person.trim().split(' ')
      const lastName = lastNameParts.join(' ') || null
      
      // ✅ FIXED: Handle existing TOURIST user (reuse instead of error)
      let touristUser;
      const { data: existingTourist } = await supabase
        .from('tourist_users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single()
      
      if (existingTourist) {
        // ✅ Reuse existing tourist record - UPDATE for operator role
        touristUser = existingTourist;
        console.log('✅ Using existing tourist user:', touristUser.id)
        
        // Update tourist record with operator-specific data
        const updatedFavorites = {
          ...existingTourist.favorites,
          preferences: {
            ...existingTourist.favorites?.preferences,
            registration_step: 'operator_complete',
            user_type: 'operator',
            is_local: true,
            home_island: islands_served,
            operator_account: true,
            primary_language: Array.isArray(languages) ? languages[0] : languages,
            preferred_language: Array.isArray(languages) ? languages[0] : languages,
            target_bookings_monthly: target_bookings_monthly,
            customer_type_preference: customer_type_preference,
            terms_accepted: terms_accepted,
            terms_accepted_date: new Date().toISOString(),
            marketing_emails: marketing_emails,
            founding_member: true,
            application_number: Math.floor(Math.random() * 1000000)
          },
          behavior_data: {
            ...existingTourist.favorites?.behavior_data,
            operator_registration_date: new Date().toISOString(),
            registration_source: 'operator_landing_page',
            registration_type: 'operator',
            company_name: company_name,
            islands_served: islands_served,
            tour_types_offered: tourTypesArray,
            business_description: business_description
          }
        }
        
        const { error: updateError } = await supabase
          .from('tourist_users')
          .update({ favorites: updatedFavorites })
          .eq('id', existingTourist.id)
        
        if (updateError) {
          console.error('Tourist update error:', updateError)
          // Continue anyway - this is not critical for operator creation
        }
        
      } else {
        // ✅ Create NEW tourist record (STEP 1: Create tourist_users record for app access)
        const touristData = {
          email: email.toLowerCase().trim(),
          first_name: firstName,
          last_name: lastName,
          whatsapp_number: whatsapp_number?.trim() || null,
          marketing_emails: marketing_emails,
          status: 'registered', // Will be activated after approval
          
          favorites: {
            preferences: {
              registration_step: 'operator_complete',
              user_type: 'operator',
              is_local: true, // Operators are local businesses
              home_island: islands_served,
              languages: Array.isArray(languages) ? languages : [languages],
              primary_language: Array.isArray(languages) ? languages[0] : languages,
              onboarding_completed: false,
              preferred_language: Array.isArray(languages) ? languages[0] : languages,
              operator_account: true,
              
              // Original form fields that you had
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
              registration_source: 'operator_landing_page',
              registration_type: 'operator',
              company_name: company_name,
              islands_served: islands_served,
              tour_types_offered: tourTypesArray,
              business_description: business_description
            }
          }
        }
        
        const { data: newTourist, error: touristError } = await supabase
          .from('tourist_users')
          .insert([touristData])
          .select()
          .single()
        
        if (touristError) {
          console.error('Tourist user creation error:', touristError)
          throw new Error('Registration failed. Please try again.')
        }
        
        touristUser = newTourist;
        console.log('✅ Created new tourist user:', touristUser.id)
      }
      
      // STEP 2: Create operators record (business data)
      const operatorData = {
        email: email.toLowerCase().trim(),
        company_name: company_name.trim(),
        contact_person: contact_person.trim(),
        whatsapp_number: whatsapp_number?.trim() || null,
        island: islands_served, // Primary island
        status: 'pending', // Requires manual approval
        
        // NEW: Use business_description as direct column
        business_description: business_description?.trim() || null,
        
        // Store additional business data in notes JSONB field
        notes: {
          tourist_user_id: touristUser.id,
          registration_source: 'operator_landing_page',
          registration_date: new Date().toISOString(),
          
          // Business details
          islands_served: islands_served,
          tour_types_offered: tourTypesArray,
          languages: Array.isArray(languages) ? languages : [languages],
          primary_language: Array.isArray(languages) ? languages[0] : languages,
          
          // Original form fields that you had
          target_bookings_monthly: target_bookings_monthly,
          customer_type_preference: customer_type_preference,
          
          // Legal and preferences
          terms_accepted: terms_accepted,
          terms_accepted_date: new Date().toISOString(),
          marketing_emails: marketing_emails,
          
          // Founding member status
          founding_member: true,
          application_number: Math.floor(Math.random() * 1000000),
          
          // Technical details
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          timestamp: new Date().toISOString(),
          existing_tourist: existingTourist ? true : false // Flag for dual role
        }
      }
      
      const { data: operatorUser, error: operatorError } = await supabase
        .from('operators')
        .insert([operatorData])
        .select()
        .single()
      
      if (operatorError) {
        console.error('Operator creation error:', operatorError)
        
        // Clean up tourist_users record if operator creation fails
        // BUT ONLY if we created a new tourist user (not if we reused existing)
        if (!existingTourist) {
          await supabase
            .from('tourist_users')
            .delete()
            .eq('id', touristUser.id)
        }
        
        if (operatorError.code === '23505') { // Unique constraint violation
          throw new Error('Email already registered. Please use a different email address.')
        }
        throw new Error('Registration failed. Please try again.')
      }
      
      console.log('✅ Operator user created:', operatorUser.id)
      
      // STEP 3: Send notification webhook (n8n)
      try {
        const webhookData = {
          type: 'operator_registration',
          user_id: touristUser.id,
          operator_id: operatorUser.id,
          email: email.toLowerCase().trim(),
          company_name: company_name,
          contact_person: contact_person,
          whatsapp_number: whatsapp_number,
          islands_served: islands_served,
          tour_types_offered: tourTypesArray,
          languages: Array.isArray(languages) ? languages : [languages],
          business_description: business_description,
          target_bookings_monthly: target_bookings_monthly,
          customer_type_preference: customer_type_preference,
          registration_date: new Date().toISOString(),
          source: 'operator_landing_page',
          marketing_emails: marketing_emails,
          terms_accepted: terms_accepted,
          founding_member: true,
          existing_tourist: existingTourist ? true : false // NEW: Flag for dual role
        }
        
        await fetch('https://n8n-stable-latest.onrender.com/webhook/vai-app-operator-registration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData)
        })
        
        console.log('Webhook notification sent')
      } catch (webhookError) {
        console.warn('Webhook notification failed:', webhookError)
        // Don't fail registration if webhook fails
      }
      
      // Return success with all original data
      return {
        success: true,
        user: touristUser,
        operator: operatorUser,
        message: 'Registration successful! We\'ll review your application and contact you within 24 hours.',
        existing_tourist: existingTourist ? true : false, // NEW: Indicate dual role
        dual_role: existingTourist ? true : false
      }
      
    } catch (error) {
      console.error('Operator registration error:', error)
      
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.',
        details: error
      }
    }
  },
  
  // ===========================
  // HELPER FUNCTIONS
  // ===========================
  
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },
  
  validatePhone(phone) {
    // Allow various international formats
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(phone)
  },
  
  formatPhoneNumber(phone) {
      // Remove all non-digit characters
      const digitsOnly = phone.replace(/\D/g, '')
      
      // Ensure it has a + prefix if it's a valid mobile number
      if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
          return `+${digitsOnly}`
      }
      
      // Return original if can't format
      return phone
  },
  
  // ===========================
  // SUPABASE INITIALIZATION 
  // ===========================
  
  async initSupabase() {
    if (typeof window !== 'undefined' && !window.getSupabase) {
      console.log('🔄 Initializing Supabase...')
      
      try {
        // Load Supabase if not already loaded
        if (!window.supabase) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        }
        
        // Initialize Supabase client
        const supabaseUrl = 'https://rizqwxcmpzhdmqjjqgyw.supabase.co'
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpenF3eGNtcHpoZG1xampxZ3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MDM3MTIsImV4cCI6MjA2NjI3OTcxMn0.dlNpxINvs2yzlFQndTZIrfQTBgWpQ5Ee0aPGVwRPHo0'
        
        const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey)
        
        window.getSupabase = () => supabaseClient
        
        console.log('✅ Supabase initialized successfully')
        return supabaseClient
      } catch (error) {
        console.error('❌ Supabase initialization failed:', error)
        throw new Error('Failed to initialize database connection')
      }
    }
    
    return window.getSupabase()
  }
}

// ===========================
// INITIALIZATION CODE 
// ===========================

// Initialize Supabase when script loads
if (typeof window !== 'undefined') {
  registrationService.initSupabase().catch(console.error)
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.registrationService = registrationService
}