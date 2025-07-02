// ==============================================
// STEP 4: UPDATE OPERATOR DASHBOARD AUTHENTICATION
// ==============================================

// FILE: operator-dashboard/src/hooks/useAuth.js
// REPLACE the entire file with this secure version:

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [operator, setOperator] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true // Prevent state updates after unmount

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user && isMounted) {
          // Get operator data linked to this auth user
          const { data: operatorData, error } = await supabase
            .from('operators')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .eq('status', 'active')
            .single()
          
          if (operatorData && !error && isMounted) {
            setOperator(operatorData)
            console.log('Restored operator session:', operatorData.company_name)
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        // CRITICAL: Always set loading to false, even on errors
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Add timeout fallback for Chrome
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.log('Session check timeout - forcing loading to false')
        setLoading(false)
      }
    }, 5000) // 5 second fallback

    checkSession().then(() => {
      clearTimeout(timeoutId)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return
        
        console.log('Auth state change:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: operatorData, error } = await supabase
            .from('operators')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .eq('status', 'active')
            .single()
          
          if (operatorData && !error && isMounted) {
            setOperator(operatorData)
            console.log('Operator signed in:', operatorData.company_name)
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setOperator(null)
            console.log('Operator signed out')
          }
        }
      }
    )

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      subscription?.unsubscribe()
    }
  }, [])

  // NEW: Secure login with email + password
  const login = async (email, password) => {
    try {
      setLoading(true)
      
      console.log('Attempting secure login for:', email)
      
      // Use Supabase Auth for secure login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password
      })
      
      if (authError) {
        console.error('Auth error:', authError)
        return { 
          success: false, 
          error: authError.message || 'Login failed. Please check your credentials.' 
        }
      }
      
      if (!authData.user) {
        return { 
          success: false, 
          error: 'Login failed. No user data received.' 
        }
      }
      
      // Get operator data linked to this auth user
      const { data: operatorData, error: operatorError } = await supabase
        .from('operators')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .eq('status', 'active')
        .single()
      
      if (operatorError || !operatorData) {
        console.error('Operator lookup error:', operatorError)
        // Sign out the auth user since they're not a valid operator
        await supabase.auth.signOut()
        return { 
          success: false, 
          error: 'No active operator account found for this email. Please contact support.' 
        }
      }
      
      console.log('Secure login successful:', operatorData.company_name)
      setOperator(operatorData)
      
      // Update last login time
      await supabase
        .from('operators')
        .update({ last_auth_login: new Date().toISOString() })
        .eq('id', operatorData.id)
      
      return { success: true }
      
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: 'Login failed. Please try again.' 
      }
    } finally {
      setLoading(false)
    }
  }

  // NEW: Secure logout
  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setOperator(null)
      console.log('Operator logged out securely')
    } catch (error) {
      console.error('Logout error:', error)
      // Force local logout even if remote logout fails
      setOperator(null)
    }
  }

  return {
    operator,
    loading,
    login,
    logout,
    isAuthenticated: !!operator
  }
}