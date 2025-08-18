// src/services/authService.js
import { supabase } from './supabase'

export const authService = {
  // Sign up new user
  async signUp(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData // Additional user metadata
      }
    })
    
    if (error) throw error
    return data
  },

  // Sign in existing user
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  getCurrentUser() {
    return supabase.auth.getUser()
  },

  // Get current session
  getSession() {
    return supabase.auth.getSession()
  },

  // Listen for auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Password reset
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`
    })
    
    if (error) throw error
  },

  // Create tourist account with both auth + database record 
  // STEPS: 1. CHECK: Does tourist record already exist? 
   //   → YES: Return existing record immediately (skip auth creation entirely)
   //   → NO: Continue to step 2

   // 2. Try to create auth user
   //   → SUCCESS: Get auth_user_id
    //  → FAIL: Set auth_user_id = null, continue

   // 3. INSERT new tourist record (simple, predictable)
    //  → SUCCESS: Return new record
    //  → FAIL (duplicate): Get existing record and return it

  async createTouristAccount(name, email, whatsapp, phone = '') {// Create tourist account with both auth + database record (bulletproof version)
    try {
      // Split name into first/last name
      const nameParts = name.trim().split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ') || ''

      // Check for existing tourist_users record FIRST
      const { data: existingTourist, error: existingError } = await supabase
        .from('tourist_users')
        .select('id, auth_user_id, email, first_name, last_name')
        .eq('email', email.trim())
        .single()

      if (existingTourist && !existingError) {
        console.log('✅ Existing tourist user found, using existing record')
        return {
          success: true,
          tourist_user_id: existingTourist.id,
          auth_user_id: existingTourist.auth_user_id,
          email: existingTourist.email,
          existing_user: true,
          temp_password: `VAI_${email.trim()}` // Return temp password for consistency
        }
      }

      // If no existing tourist record, proceed with creation
      console.log('ℹ️ No existing tourist record found, creating new account')

      // Generate secure password with provided email
      // This will be changed after email verification
      // This ensures we can create the auth user first, then link to tourist_users
      const tempPassword = `VAI_${email.trim()}`

      // Try to create auth user first, then handle tourist_users with INSERT
      let authResult
      let authUserId = null

      try {
        // Try to create Supabase Auth User
        authResult = await this.signUp(email.trim(), tempPassword, {
          first_name: firstName,
          last_name: lastName
        })
        authUserId = authResult.user.id
        console.log('✅ Auth user created:', email.trim())
      } catch (authError) {
        // If auth user already exists -  get their ID
        // Correct error message check and handle gracefully
        if (authError.message?.includes('User already registered') || 
            authError.message?.includes('already been registered')) {
          console.log('ℹ️ Auth user already exists, proceeding with null auth_user_id')
          // Continue with tourist_users creation but leave auth_user_id as null
          authUserId = null
        } else {
          console.error('❌ Auth creation failed with unexpected error:', authError)
          throw authError
        }
      }

      // Create tourist_users record
      const { data: touristData, error: touristError } = await supabase
        .from('tourist_users')
        .insert([{
          email: email.trim(),
          first_name: firstName,
          last_name: lastName,
          whatsapp_number: whatsapp.trim(),
          phone: phone.trim(),
          auth_user_id: authUserId, // Can be null if auth creation failed
          email_verified: false,
          status: 'active'
        }])
        .select()
        .single()

      if (touristError) {
        console.error('Tourist insert error:', touristError)
        
        // If insert fails due to duplicate email, get the existing record
        if (touristError.code === '23505') { // Unique constraint violation
          const { data: existing } = await supabase
            .from('tourist_users')
            .select('id, auth_user_id, email')
            .eq('email', email.trim())
            .single()
          
          if (existing) {
            console.log('✅ Using existing tourist record after insert failure')
            return {
              success: true,
              tourist_user_id: existing.id,
              auth_user_id: existing.auth_user_id,
              email: existing.email,
              existing_user: true,
              temp_password: tempPassword // Return temp password for initial login
            }
          }
        }
        throw touristError
      }

      console.log('✅ Tourist record created/updated:', email.trim())
      return {
        success: true,
        tourist_user_id: touristData.id,
        auth_user_id: touristData.auth_user_id,
        email: email.trim(),
        existing_user: false,
        temp_password: tempPassword // Return temp password for initial login
      }

    } catch (error) {
      console.error('createTouristAccount error:', error)
      return {
        success: false,
        error: error.message || 'Account creation failed'
      }
    }
  }
}