// operator-dashboard/src/hooks/useAuth.js
// CHROME-COMPATIBLE VERSION - Fixes session timeout issues

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [operator, setOperator] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true // Prevent state updates after unmount
    let timeoutId = null

    const checkSession = async () => {
      try {
        console.log('🔍 Checking session...')
        
        // FIXED: Increased timeout for Chrome compatibility (3s → 8s)
        const { data: { session }, error: sessionError } = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session timeout')), 8000) // ← 8 seconds instead of 3
          )
        ]);
        
        if (sessionError) {
          console.warn('⚠️ Session error:', sessionError.message)
          throw sessionError
        }
        
        if (session?.user && isMounted) {
          console.log('✅ Valid session found for:', session.user.email)
          
          // Get operator data - all fields to prevent additional fetches
          const { data: operatorData, error } = await supabase
            .from('operators')
            .select('*') // Get all fields to match what ProfileTab expects
            .eq('auth_user_id', session.user.id)
            .eq('status', 'active')
            .single()
          
          if (operatorData && !error && isMounted) {
            setOperator(operatorData)
            console.log('✅ Session restored:', operatorData.company_name)
          } else if (error) {
            console.warn('⚠️ Operator lookup failed:', error.message)
            // Don't force sign out immediately - might be temporary DB issue
            if (error.code === 'PGRST116') {
              console.log('🔄 Operator not found, signing out...')
              await supabase.auth.signOut()
            }
          }
        } else {
          console.log('ℹ️ No valid session found')
        }
      } catch (error) {
        console.error('❌ Session check error:', error.message)
        
        // FIXED: Don't fail immediately on timeout - give Chrome more time
        if (error.message === 'Session timeout') {
          console.log('🔄 Session timeout, but continuing...')
          // Let the fallback timeout handle this
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // FIXED: Increased fallback timeout for Chrome (5s → 12s)
    //timeoutId = setTimeout(() => {
    //  if (isMounted) {
    //    console.log('⏰ Session check timeout - forcing loading to false')
    //    setLoading(false)
    //  }
    // }, 12000) // 12 second fallback for Chrome

    // Start session check
    checkSession().then(() => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return
        
        console.log('🔄 Auth state change:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: operatorData, error } = await supabase
            .from('operators')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .eq('status', 'active')
            .single()
          
          if (operatorData && !error && isMounted) {
            setOperator(operatorData)
            console.log('✅ Operator signed in:', operatorData.company_name)
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setOperator(null)
            console.log('👋 Operator signed out')
          }
        }
      }
    )

    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      subscription?.unsubscribe()
    }
  }, [])

  // Secure login with email + password
  const login = async (email, password) => {
    try {
      setLoading(true)
      
      console.log('🔐 Attempting login for:', email)
      
      // Auth with Supabase (no custom timeout - let Supabase handle it)
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
      
      // Get full operator data
      const { data: operatorData, error: operatorError } = await supabase
        .from('operators')
        .select('*')
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

  // Secure logout
  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setOperator(null)
      console.log('👋 Operator logged out securely')
    } catch (error) {
      console.error('❌ Logout error:', error)
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