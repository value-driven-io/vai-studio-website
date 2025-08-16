// operator-dashboard/src/hooks/useAuth.js
// CHROME-COMPATIBLE VERSION - Fixes session timeout issues

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next' 
import { supabase } from '../lib/supabase' 
import { needsPasswordChange } from '../utils/passwordSecurity'

export const useAuth = () => {
  const { t } = useTranslation() 
  const [operator, setOperator] = useState(null)
  const [loading, setLoading] = useState(true)

  // Intelligent error parsing with i18n support (ENHANCED WITH DEBUG LOGS)
  const parseAuthError = (error) => {
    console.log('🔍 parseAuthError called with:', error) // DEBUG

    if (!error || !error.message) {
      const result = t('login.errors.unknownError')
      console.log('🔍 unknownError translation result:', result) // DEBUG
      return result
    }

    const errorMessage = error.message.toLowerCase()
    console.log('🔍 Processing error message:', errorMessage) // DEBUG
    
    // Map Supabase error patterns to localized messages
    if (errorMessage.includes('invalid login credentials') || 
        errorMessage.includes('invalid email or password')) {
      const result = t('login.errors.invalidCredentials')
      console.log('🔍 invalidCredentials translation result:', result) // DEBUG
      return result
    }
    
    if (errorMessage.includes('email not confirmed') || 
        errorMessage.includes('email address not confirmed')) {
      const result = t('login.errors.emailNotConfirmed')
      console.log('🔍 emailNotConfirmed translation result:', result) // DEBUG
      return result
    }
    
    if (errorMessage.includes('too many requests') || 
        errorMessage.includes('rate limit') ||
        errorMessage.includes('email rate limit exceeded')) {
      const result = t('login.errors.tooManyAttempts')
      console.log('🔍 tooManyAttempts translation result:', result) // DEBUG
      return result
    }
    
    if (errorMessage.includes('account locked') || 
        errorMessage.includes('user locked')) {
      const result = t('login.errors.accountLocked')
      console.log('🔍 accountLocked translation result:', result) // DEBUG
      return result
    }
    
    if (errorMessage.includes('invalid email') || 
        errorMessage.includes('email format')) {
      const result = t('login.errors.invalidEmail')
      console.log('🔍 invalidEmail translation result:', result) // DEBUG
      return result
    }
    
    if (errorMessage.includes('password') && 
        (errorMessage.includes('short') || errorMessage.includes('minimum'))) {
      const result = t('login.errors.passwordTooShort')
      console.log('🔍 passwordTooShort translation result:', result) // DEBUG
      return result
    }
    
    if (errorMessage.includes('network') || 
        errorMessage.includes('failed to fetch') ||
        errorMessage.includes('connection')) {
      const result = t('login.errors.networkError')
      console.log('🔍 networkError translation result:', result) // DEBUG
      return result
    }
    
    if (errorMessage.includes('server error') || 
        errorMessage.includes('internal server') ||
        errorMessage.includes('503') || errorMessage.includes('502')) {
      const result = t('login.errors.serverError')
      console.log('🔍 serverError translation result:', result) // DEBUG
      return result
    }
    
    if (errorMessage.includes('session') && 
        (errorMessage.includes('expired') || errorMessage.includes('invalid'))) {
      const result = t('login.errors.sessionExpired')
      console.log('🔍 sessionExpired translation result:', result) // DEBUG
      return result
    }
    
    if (errorMessage.includes('maintenance') || 
        errorMessage.includes('unavailable')) {
      const result = t('login.errors.maintenanceMode')
      console.log('🔍 maintenanceMode translation result:', result) // DEBUG
      return result
    }
    
    // Handle operator-specific errors
    if (errorMessage.includes('no operator account found') || 
        errorMessage.includes('operator account')) {
      const result = t('login.errors.accountNotFound')
      console.log('🔍 accountNotFound translation result:', result) // DEBUG
      return result
    }
    
    if (errorMessage.includes('suspended') || 
        errorMessage.includes('inactive')) {
      const result = t('login.errors.accountSuspended')
      console.log('🔍 accountSuspended translation result:', result) // DEBUG
      return result
    }
    
    if (errorMessage.includes('pending approval') || 
        errorMessage.includes('pending')) {
      const result = t('login.errors.accountPending')
      console.log('🔍 accountPending translation result:', result) // DEBUG
      return result
    }
    
    // Special handling for your existing timeout messages
    if (errorMessage.includes('login timeout') || 
        errorMessage.includes('login is taking too long')) {
      const result = t('login.errors.networkError')
      console.log('🔍 timeout->networkError translation result:', result) // DEBUG
      return result
    }
    
    // Default fallback with original message for debugging
    console.warn('🔍 Unmapped auth error:', error.message)
    const result = t('login.errors.unknownError')
    console.log('🔍 fallback unknownError translation result:', result) // DEBUG
    return result
  }

  // ALL your existing useEffect logic unchanged
  useEffect(() => {
    let isMounted = true // Prevent state updates after unmount
    let timeoutId = null

    const checkSession = async () => {
      try {
        console.log('🔍 Checking session...')
        
        // CHROME FIX: getSession() hangs indefinitely on browser refresh in Chrome
        // Use timeout but handle gracefully since onAuthStateChange works 
        console.log('⏱️ Starting getSession...')
        const start = Date.now()

        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('getSession hung - relying on onAuthStateChange')), 3000)
        )

        const { data: { session }, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ])

        console.log(`⏱️ getSession completed in ${Date.now() - start}ms`)

        if (sessionError) {
          console.warn('⚠️ Session error:', sessionError.message)
          throw sessionError
        }
        
        if (session?.user && isMounted) {
          console.log('✅ Valid session found for:', session.user.email)
          
          // Get operator data - all fields to prevent additional fetches
          const { data: operatorData, error } = await supabase
          .from('operators')
          .select('*')
          .eq('auth_user_id', session.user.id)
          // ✅ REMOVED: .eq('status', 'active') - now allows pending operators
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
        
        // CHROME FIX: If getSession hangs, rely on onAuthStateChange
        if (error.message.includes('getSession hung')) {
          console.log('🔄 getSession hung in Chrome - onAuthStateChange will handle auth')
          // Don't throw - let onAuthStateChange handle authentication
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

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
          console.log('🔍 Looking up operator for:', session.user.email)
          
          try {
            // 🔧 CHROME FIX: Wrap hanging operator query with timeout
            const { data: operatorData, error } = await Promise.race([
              supabase
                .from('operators')
                .select('*')
                .eq('auth_user_id', session.user.id)
                // ✅ REMOVED: .eq('status', 'active') - now allows pending operators
                .single(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Operator lookup timeout')), 5000)
              )
            ])
            
            if (operatorData && !error && isMounted) {
              setOperator(operatorData) 
              setLoading(false) // 🔧 ENSURE loading clears
              console.log('✅ Operator signed in:', operatorData.company_name)
            } else if (error) {
              console.warn('⚠️ Operator lookup error:', error.message)
              setLoading(false) // 🔧 ENSURE loading clears even on error
            }
          } catch (error) {
            console.error('❌ Operator query failed:', error.message)
            // 🔧 CRITICAL: Clear loading even if operator lookup fails
            setLoading(false)
            
            if (error.message.includes('timeout')) {
              console.log('🔄 Chrome operator query hung - user stays authenticated but no operator data')
              // User stays SIGNED_IN but without operator context
              // They can still access basic functionality
            }
          }
        }
 else if (event === 'SIGNED_OUT') {
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

  // ✅ ENHANCED: Your existing login function with ONLY error message enhancement
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
        const parsedError = parseAuthError(authError)
        console.log('🔍 Parsed error for return:', parsedError) // DEBUG
        return { 
          success: false, 
          error: parsedError
        }
      }
      
      if (!authData.user) {
        return { 
          success: false, 
          error: t('login.errors.unknownError') // Localized message
        }
      }
      
      // Get Operator data 
      console.log('🔍 Looking up operator for user:', authData.user.email)
      const { data: operatorData, error: operatorError } = await supabase
        .from('operators')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        // ✅ REMOVED: .eq('status', 'active') - now allows pending operators
        .single()

      if (operatorError || !operatorData) {
      console.error('❌ Operator lookup error:', operatorError)
      await supabase.auth.signOut()
      const accountNotFoundError = t('login.errors.accountNotFound')
      console.log('🔍 Account not found error for return:', accountNotFoundError) // DEBUG
      return { 
        success: false, 
        error: accountNotFoundError
      }
    }

      // Handle suspended or inactive statuses (old logic with toast notifcation and sign out)
      //if (operatorData.status === 'suspended' || operatorData.status === 'inactive') {
       // await supabase.auth.signOut()
       // return {
      //    success: false,
      //    error: t('login.errors.accountSuspended') // Localized message
      //  }
      //}
      
      // Handle different operator statuses

      console.log('✅ Login successful:', operatorData.company_name)
      setOperator(operatorData)
      
      // Your existing last_auth_login update functionality
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
        error: parseAuthError(error) // Use intelligent error parsing
      }
    } finally {
      setLoading(false)
    }
  }

  // Your existing logout function unchanged
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

  // Function to refresh operator data after password change
  const refreshOperatorData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: operatorData, error } = await supabase
          .from('operators')
          .select('*')
          .eq('auth_user_id', session.user.id)
          .single()
        
        if (operatorData && !error) {
          setOperator(operatorData)
          console.log('✅ Operator data refreshed after password change')
        }
      }
    } catch (error) {
      console.error('❌ Failed to refresh operator data:', error)
    }
  }

  return {
    operator,
    loading,
    login,
    logout,
    refreshOperatorData, // for Password Change
    isAuthenticated: !!operator,
    needsPasswordChange: needsPasswordChange(operator) // Password change check
  }
}