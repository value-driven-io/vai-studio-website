// ================================
// REGISTRATION SERVICE
// File: app/welcome/services/registrationService.js
// ================================

import { supabase } from './supabase.js'

export const registrationService = {
  
  // ===========================
  // TOURIST REGISTRATION
  // ===========================
  
  /**
   * Step 1: Quick registration (name + email only)
   * Perfect for landing page conversion
   */
  async registerTouristBasic(basicData) {
    try {
      const { name, email, marketing_emails = true } = basicData
      
      // Split name into first/last if provided as single field
      const [firstName, ...lastNameParts] = name.trim().split(' ')
      const lastName = lastNameParts.join(' ')
      
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('tourist_users')
        .select('id, email')
        .eq('email', email.toLowerCase().trim())
        .single()
      
      if (existingUser) {
        return {
          success: false,
          error: 'Email already registered. Please sign in instead.',
          existing: true
        }
      }
      
      // Create tourist user record
      const { data: newUser, error } = await supabase
        .from('tourist_users')
        .insert([{
          email: email.toLowerCase().trim(),
          first_name: firstName,
          last_name: lastName || null,
          marketing_emails,
          status: 'registered', // registered -> active (after email verification)
          favorites: {
            preferences: {
              registration_step: 'basic',
              is_local: false, // Will be updated in step 2
              onboarding_completed: false
            },
            tour_ids: [],
            behavior_data: {
              registration_date: new Date().toISOString(),
              registration_type: 'landing_page'
            }
          }
        }])
        .select()
        .single()
      
      if (error) throw error
      
      // Trigger welcome email via n8n
      await this.triggerWelcomeEmail('tourist', {
        user_id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        registration_step: 'basic'
      })
      
      return {
        success: true,
        user: newUser,
        next_step: 'preferences' // Can be skipped
      }
      
    } catch (error) {
      console.error('Tourist basic registration error:', error)
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.'
      }
    }
  },

  /**
   * Step 2: Enhanced preferences (optional, can be done in-app later)
   * Flexible for tourists vs locals
   */
  async updateTouristPreferences(userId, preferences) {
    try {
      const {
        // Travel context (optional for locals)
        travel_dates = null,
        islands_interested = [],
        travel_context = null, // solo/couple/family/group/local
        
        // Preferences (for all users)
        adventure_level = 'moderate',
        tour_types_preferred = [],
        budget_range = 'mid',
        preferred_language = 'en',
        accessibility_needs = [],
        whatsapp_number = null,
        
        // Meta data
        is_local = false
      } = preferences
      
      // Build favorites object with individual preference fields approach
      const updatedFavorites = {
        preferences: {
          registration_step: 'complete',
          is_local,
          onboarding_completed: true,
          
          // Travel context (null for locals)
          travel_dates: is_local ? null : travel_dates,
          travel_context,
          
          // Activity preferences
          adventure_level,
          tour_types_preferred,
          budget_range,
          accessibility_needs,
          
          // Location preferences
          islands_interested: is_local ? ['all'] : islands_interested
        },
        tour_ids: [], // Saved tours
        behavior_data: {
          registration_date: new Date().toISOString(),
          preferences_updated: new Date().toISOString()
        }
      }
      
      const { data: updatedUser, error } = await supabase
        .from('tourist_users')
        .update({
          whatsapp_number,
          preferred_language,
          favorites: updatedFavorites,
          status: 'active'
        })
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      
      return {
        success: true,
        user: updatedUser
      }
      
    } catch (error) {
      console.error('Tourist preferences update error:', error)
      return {
        success: false,
        error: error.message || 'Failed to update preferences.'
      }
    }
  },

  // ===========================
  // OPERATOR REGISTRATION
  // ===========================
  
  /**
   * Operator registration with flexible island support
   * Creates pending operator for admin approval
   */
  async registerOperator(operatorData) {
    try {
      const {
        // Business essentials
        company_name,
        contact_person,
        email,
        whatsapp_number,
        
        // Operations
        primary_island, // Main island for initial setup
        islands_served = [], // Can serve multiple islands
        tour_types = [],
        experience_years = '1-2',
        max_group_size = 12,
        languages_offered = ['french'],
        
        // Optional business info
        address = null,
        phone = null,
        
        // Business goals (for onboarding)
        target_bookings_monthly = '5-10',
        target_customer_type = 'mixed',
        growth_priority = 'quality'
      } = operatorData
      
      // Check if operator already exists
      const { data: existingOperator } = await supabase
        .from('operators')
        .select('id, email, status')
        .eq('email', email.toLowerCase().trim())
        .single()
      
      if (existingOperator) {
        return {
          success: false,
          error: 'Email already registered. Please contact support if you need access.',
          existing: true
        }
      }
      
      // Create operator record (pending approval)
      const { data: newOperator, error } = await supabase
        .from('operators')
        .insert([{
          company_name: company_name.trim(),
          contact_person: contact_person?.trim() || null,
          email: email.toLowerCase().trim(),
          whatsapp_number: whatsapp_number.trim(),
          phone: phone?.trim() || null,
          address: address?.trim() || null,
          
          // Primary island for current DB structure
          island: primary_island,
          
          // Status and approval
          status: 'pending', // pending -> active (after approval)
          commission_rate: 10, // Default 10%
          
          // Store additional data in notes for now (no schema changes)
          notes: JSON.stringify({
            islands_served,
            tour_types,
            experience_years,
            max_group_size,
            languages_offered,
            business_goals: {
              target_bookings_monthly,
              target_customer_type,
              growth_priority
            },
            registration_date: new Date().toISOString(),
            requires_approval: true
          })
        }])
        .select()
        .single()
      
      if (error) throw error
      
      // Trigger admin notification
      await this.triggerAdminNotification('operator_registration', {
        operator_id: newOperator.id,
        company_name: newOperator.company_name,
        email: newOperator.email,
        primary_island,
        tour_types
      })
      
      // Send acknowledgment email to operator
      await this.triggerWelcomeEmail('operator', {
        operator_id: newOperator.id,
        email: newOperator.email,
        company_name: newOperator.company_name,
        contact_person: newOperator.contact_person,
        status: 'pending'
      })
      
      return {
        success: true,
        operator: newOperator,
        status: 'pending_approval',
        next_step: 'admin_review'
      }
      
    } catch (error) {
      console.error('Operator registration error:', error)
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.'
      }
    }
  },

  // ===========================
  // EMAIL AUTOMATION
  // ===========================
  
  /**
   * Trigger email via n8n webhooks
   */
  async triggerWelcomeEmail(userType, data) {
    try {
      const webhookUrl = userType === 'tourist' 
        ? import.meta.env.VITE_N8N_TOURIST_WEBHOOK || process.env.VITE_N8N_TOURIST_WEBHOOK
        : import.meta.env.VITE_N8N_OPERATOR_WEBHOOK || process.env.VITE_N8N_OPERATOR_WEBHOOK
      
      if (!webhookUrl) {
        console.warn(`No ${userType} webhook configured`)
        return
      }
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'welcome_email',
          user_type: userType,
          data,
          timestamp: new Date().toISOString()
        })
      })
      
      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`)
      }
      
      console.log(`✅ ${userType} welcome email triggered`)
      
    } catch (error) {
      console.error(`❌ Failed to trigger ${userType} welcome email:`, error)
      // Don't fail registration if email fails
    }
  },

  async triggerAdminNotification(event_type, data) {
    try {
      const webhookUrl = import.meta.env.VITE_N8N_ADMIN_WEBHOOK || process.env.VITE_N8N_ADMIN_WEBHOOK
      
      if (!webhookUrl) {
        console.warn('No admin webhook configured')
        return
      }
      
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type,
          data,
          timestamp: new Date().toISOString()
        })
      })
      
      console.log(`✅ Admin notification sent: ${event_type}`)
      
    } catch (error) {
      console.error(`❌ Failed to send admin notification:`, error)
    }
  },

  // ===========================
  // ADMIN APPROVAL WORKFLOW
  // ===========================
  
  /**
   * Approve operator and create Supabase Auth account
   */
  async approveOperator(operatorId, adminNotes = '') {
    try {
      // Get operator data
      const { data: operator, error: fetchError } = await supabase
        .from('operators')
        .select('*')
        .eq('id', operatorId)
        .eq('status', 'pending')
        .single()
      
      if (fetchError || !operator) {
        throw new Error('Operator not found or already processed')
      }
      
      // Generate temporary password
      const tempPassword = this.generateTempPassword()
      
      // Create Supabase Auth account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: operator.email,
        password: tempPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          role: 'operator',
          company_name: operator.company_name,
          operator_id: operator.id
        }
      })
      
      if (authError) throw authError
      
      // Update operator with auth_user_id and status
      const { error: updateError } = await supabase
        .from('operators')
        .update({
          status: 'active',
          auth_user_id: authData.user.id,
          temp_password: tempPassword, // Store temporarily for email
          auth_setup_completed: true,
          notes: adminNotes ? `${operator.notes}\n\nAdmin Notes: ${adminNotes}` : operator.notes
        })
        .eq('id', operatorId)
      
      if (updateError) throw updateError
      
      // Send credentials email
      await this.triggerCredentialsEmail(operator, tempPassword)
      
      return {
        success: true,
        message: `Operator ${operator.company_name} approved successfully`,
        credentials: {
          email: operator.email,
          temp_password: tempPassword
        }
      }
      
    } catch (error) {
      console.error('Operator approval error:', error)
      return {
        success: false,
        error: error.message || 'Failed to approve operator'
      }
    }
  },

  async triggerCredentialsEmail(operator, tempPassword) {
    try {
      const webhookUrl = import.meta.env.VITE_N8N_CREDENTIALS_WEBHOOK || process.env.VITE_N8N_CREDENTIALS_WEBHOOK
      
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'operator_credentials',
          data: {
            operator_id: operator.id,
            company_name: operator.company_name,
            contact_person: operator.contact_person,
            email: operator.email,
            temp_password: tempPassword,
            dashboard_url: import.meta.env.VITE_OPERATOR_DASHBOARD_URL || process.env.VITE_OPERATOR_DASHBOARD_URL,
            support_whatsapp: import.meta.env.VITE_WHATSAPP_SUPPORT || process.env.VITE_WHATSAPP_SUPPORT
          },
          timestamp: new Date().toISOString()
        })
      })
      
      console.log('✅ Operator credentials email triggered')
      
    } catch (error) {
      console.error('❌ Failed to send credentials email:', error)
    }
  },

  // ===========================
  // UTILITY FUNCTIONS
  // ===========================
  
  generateTempPassword() {
    // Generate secure 12-character password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  },

  // Check if user has preview vs full access
  getUserAccessLevel(user) {
    const preferences = user?.favorites?.preferences || {}
    
    // Flexible preview mode logic
    if ((import.meta.env.VITE_PREVIEW_MODE_ENABLED || process.env.VITE_PREVIEW_MODE_ENABLED) === 'true') {
      return preferences.onboarding_completed ? 'preview' : 'basic'
    }
    
    // Full launch mode
    return preferences.onboarding_completed ? 'full' : 'preview'
  },

  // Get user preferences for personalization
  getUserPreferences(user) {
    const prefs = user?.favorites?.preferences || {}
    
    return {
      is_local: prefs.is_local || false,
      adventure_level: prefs.adventure_level || 'moderate',
      tour_types_preferred: prefs.tour_types_preferred || [],
      budget_range: prefs.budget_range || 'mid',
      islands_interested: prefs.islands_interested || [],
      travel_context: prefs.travel_context || null,
      accessibility_needs: prefs.accessibility_needs || []
    }
  }
}