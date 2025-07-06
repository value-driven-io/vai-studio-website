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
      // Get session with shorter timeout
      const { data: { session }, error: sessionError } = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 3000)
        )
      ]);
      
      if (sessionError) throw sessionError;
      
      if (session?.user && isMounted) {
        // Simplified operator lookup with specific fields only
        const { data: operatorData, error } = await supabase
          .from('operators')
          .select('id, email, company_name, island, status, commission_rate')
          .eq('auth_user_id', session.user.id)
          .eq('status', 'active')
          .single()
        
        if (operatorData && !error && isMounted) {
          setOperator(operatorData)
          console.log('✅ Session restored:', operatorData.company_name)
        } else if (error) {
          console.warn('⚠️ Operator lookup failed:', error.message)
          // Force sign out if operator not found
          await supabase.auth.signOut()
        }
      }
    } catch (error) {
      console.error('❌ Session check error:', error.message)
      // Don't throw - just continue
    } finally {
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
    
    console.log('🔐 Attempting login for:', email)
    
    // Auth without timeout (Supabase handles timeouts internally)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password
    });
    
    if (authError) {
      console.error('❌ Auth error:', authError)
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
    
    // Quick operator lookup - only essential fields
    const { data: operatorData, error: operatorError } = await supabase
        .from('operators')
        .select('id, email, company_name, island, status')
        .eq('auth_user_id', authData.user.id)
        .eq('status', 'active')
        .single()
      
      if (operatorError || !operatorData) {
        console.error('❌ Operator lookup error:', operatorError)
        await supabase.auth.signOut()
        return { 
          success: false, 
          error: 'No active operator account found. Please contact support.' 
        }
      }
      
      console.log('✅ Login successful:', operatorData.company_name)
      setOperator(operatorData)
      
      // Update last login in background (don't wait)
      supabase
        .from('operators')
        .update({ last_auth_login: new Date().toISOString() })
        .eq('id', operatorData.id)
        .then(() => console.log('📝 Last login updated'))
        .catch(err => console.warn('⚠️ Last login update failed:', err.message))
      
      return { success: true }
      
    } catch (error) {
      console.error('❌ Login error:', error.message)
      return { 
        success: false, 
        error: error.message === 'Login timeout' 
          ? 'Login is taking too long. Please check your connection and try again.'
          : 'Login failed. Please try again.' 
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