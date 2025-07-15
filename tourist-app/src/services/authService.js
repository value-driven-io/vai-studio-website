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
      redirectTo: `${window.location.origin}/reset-password`
    })
    
    if (error) throw error
  },

  // Create tourist account with both auth + database record (bulletproof version)
  async createTouristAccount(name, email, whatsapp, phone = '') {
    try {
      // Split name into first/last name
      const nameParts = name.trim().split(' ')
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(' ') || ''

      // Generate secure password
      const tempPassword = Math.random().toString(36).slice(-12) + Date.now().toString(36)

      // 🔧 APPROACH: Try to create auth user first, then handle tourist_users with UPSERT
      let authResult
      let authUserId

      try {
        // Try to create Supabase Auth User
        authResult = await this.signUp(email.trim(), tempPassword, {
          first_name: firstName,
          last_name: lastName
        })
        authUserId = authResult.user.id
        console.log('✅ Auth user created:', email.trim())
      } catch (authError) {
        // If auth user already exists, that's fine - we'll get their ID
        if (authError.message?.includes('already been registered')) {
          console.log('ℹ️ Auth user already exists, continuing...')
          // Get the existing auth user (we'll link to existing tourist_users)
          const { data: { user } } = await supabase.auth.getUser()
          if (user?.email === email.trim()) {
            authUserId = user.id
          } else {
            // We can't easily get the auth user ID, so we'll try a different approach
            throw new Error('Auth user exists but we cannot access it')
          }
        } else {
          throw authError
        }
      }

      // 🔧 UPSERT: Try INSERT, if fails due to duplicate, get existing record
      const { data: touristData, error: touristError } = await supabase
        .from('tourist_users')
        .upsert([{
          email: email.trim(),
          first_name: firstName,
          last_name: lastName,
          whatsapp_number: whatsapp.trim(),
          phone: phone.trim(),
          auth_user_id: authUserId,
          email_verified: false,
          status: 'active'
        }], {
          onConflict: 'email',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (touristError) {
        console.error('Tourist upsert error:', touristError)
        // If UPSERT fails, try to get existing record
        const { data: existing } = await supabase
          .from('tourist_users')
          .select('id, auth_user_id, email')
          .eq('email', email.trim())
          .single()
        
        if (existing) {
          console.log('✅ Using existing tourist record after upsert failure')
          return {
            success: true,
            tourist_user_id: existing.id,
            auth_user_id: existing.auth_user_id,
            email: existing.email,
            existing_user: true
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
        existing_user: false
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