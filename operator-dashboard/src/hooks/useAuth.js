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
  const [hasValidSession, setHasValidSession] = useState(() => {
    // Initialize from localStorage if available
    try {
      const storedSession = localStorage.getItem('supabase.auth.token')
      if (storedSession) {
        const sessionData = JSON.parse(storedSession)
        return !!(sessionData?.access_token && sessionData?.expires_at && 
                 new Date().getTime() < sessionData.expires_at * 1000)
      }
    } catch (error) {
      console.warn('⚠️ Failed to initialize session state from localStorage:', error.message)
    }
    return false
  })

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
    let hasInitialized = false // Prevent double initialization in StrictMode

    const checkSession = async () => {
      // console.log('🔍 DEBUG: checkSession called, hasInitialized:', hasInitialized, 'hasValidSession:', hasValidSession)
      if (hasInitialized) {
        console.log('🔧 Skipping duplicate checkSession in StrictMode')
        return
      }
      hasInitialized = true
      
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
          // console.log('🔍 DEBUG: Setting hasValidSession = true (was:', hasValidSession + ')')
          setHasValidSession(true)
          
          // Get operator data with retry mechanism
          try {
            console.log('🔍 Initial operator lookup for session restore...')
            
            const { data: operatorData, error } = await Promise.race([
              supabase
                .from('operators')
                .select('*')
                .eq('auth_user_id', session.user.id)
                .single(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Initial operator lookup timeout')), 8000)
              )
            ])
            
            if (operatorData && !error && isMounted) {
              setOperator(operatorData)
              console.log('✅ Session restored:', operatorData.company_name)
            } else if (error) {
              console.warn('⚠️ Initial operator lookup failed:', error.message)
              
              // Don't force sign out immediately - might be temporary DB issue
              if (error.code === 'PGRST116') {
                console.log('🔄 Operator not found in database, signing out...')
                await supabase.auth.signOut()
              } else if (error.message.includes('timeout')) {
                console.log('⏳ Initial operator lookup timed out, will rely on onAuthStateChange')
                // Let onAuthStateChange handle the operator lookup with retries
              }
            }
          } catch (lookupError) {
            console.warn('⚠️ Initial operator lookup error:', lookupError.message)
            // Don't fail the session check - let onAuthStateChange handle it
          }
        } else {
          console.log('ℹ️ No valid session found')
          console.log('🔍 DEBUG: Setting hasValidSession = false (was:', hasValidSession + ')')
          console.log('🔍 DEBUG: session object:', session)
          console.log('🔍 DEBUG: isMounted:', isMounted)
          if (isMounted) {
            setHasValidSession(false)
          } else {
            console.log('🔧 Skipping hasValidSession update - component unmounting')
          }
        }
      } catch (error) {
        console.error('❌ Session check error:', error.message)
        
        // CHROME FIX: If getSession hangs, check localStorage directly
        if (error.message.includes('getSession hung')) {
          console.log('🔄 getSession hung in Chrome - checking localStorage directly...')
          
          try {
            // Check if we have session data in localStorage
            const storedSession = localStorage.getItem('supabase.auth.token')
            if (storedSession) {
              const sessionData = JSON.parse(storedSession)
              const accessToken = sessionData?.access_token
              const expiresAt = sessionData?.expires_at
              
              console.log('🔍 Found localStorage session data:', !!accessToken)
              
              // Check if token hasn't expired
              if (accessToken && expiresAt && new Date().getTime() < expiresAt * 1000) {
                console.log('✅ localStorage session is valid, triggering recovery...')
                
                // Manually trigger auth state change to recover session
                // This will cause onAuthStateChange to fire with the correct session
                supabase.auth.getSession().catch(() => {
                  // Even if this fails, the localStorage check succeeded
                  console.log('🔄 Manual getSession failed, but localStorage session is valid')
                })
                
                // Don't clear loading yet - let onAuthStateChange handle it
                return // Exit early, don't set loading to false
              } else {
                console.log('⚠️ localStorage session expired or invalid')
              }
            } else {
              console.log('ℹ️ No localStorage session found')
            }
          } catch (storageError) {
            console.warn('⚠️ Failed to check localStorage session:', storageError.message)
          }
          
          // If localStorage check didn't find valid session, proceed normally
          console.log('🔄 Relying on onAuthStateChange for auth recovery')
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
        
        // StrictMode protection: Skip duplicate INITIAL_SESSION if we already initialized
        if (event === 'INITIAL_SESSION' && hasInitialized && operator) {
          console.log('🔧 Skipping duplicate INITIAL_SESSION in StrictMode')
          return
        }
        
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          hasInitialized = true
        }
        
        // CHROME FIX: If no event but we should have a session, check localStorage
        if (!session && !event && isMounted) {
          try {
            const storedSession = localStorage.getItem('supabase.auth.token')
            if (storedSession) {
              const sessionData = JSON.parse(storedSession)
              if (sessionData?.access_token && sessionData?.expires_at && 
                  new Date().getTime() < sessionData.expires_at * 1000) {
                console.log('🔧 onAuthStateChange: Found valid localStorage session, attempting recovery...')
                // Try to recover session silently
                supabase.auth.getSession().catch(() => {
                  console.log('🔧 Silent session recovery failed, but continuing...')
                })
                return // Let the recursive call handle this
              }
            }
          } catch (error) {
            console.warn('⚠️ Failed localStorage check in onAuthStateChange:', error.message)
          }
        }
        
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
          console.log('🔍 Looking up operator for:', session.user.email, '(event:', event + ')')
          console.log('🔍 DEBUG: onAuthStateChange setting hasValidSession = true (was:', hasValidSession + ')')
          setHasValidSession(true)
          
          // Retry mechanism for operator lookup
          const retryOperatorLookup = async (retries = 3, delay = 1000) => {
            for (let attempt = 1; attempt <= retries; attempt++) {
              try {
                console.log(`🔄 Operator lookup attempt ${attempt}/${retries}`)
                
                // Use faster timeout for first attempt, longer for retries
                const timeout = attempt === 1 ? 4000 : 8000
                
                const { data: operatorData, error } = await Promise.race([
                  supabase
                    .from('operators')
                    .select('*')
                    .eq('auth_user_id', session.user.id)
                    .single(),
                  new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Operator lookup timeout')), timeout)
                  )
                ])
                
                if (operatorData && !error) {
                  console.log('✅ Operator found on attempt', attempt, ':', operatorData.company_name)
                  return operatorData
                } else if (error && !error.message.includes('timeout')) {
                  // Non-timeout errors should not be retried
                  console.warn('⚠️ Non-timeout operator lookup error:', error.message)
                  throw error
                }
                
                throw new Error(error?.message || 'Unknown operator lookup error')
                
              } catch (error) {
                console.warn(`⚠️ Operator lookup attempt ${attempt} failed:`, error.message)
                
                if (attempt === retries) {
                  throw error // Final attempt failed
                }
                
                if (error.message.includes('timeout')) {
                  console.log(`⏳ Waiting ${delay}ms before retry ${attempt + 1}...`)
                  await new Promise(resolve => setTimeout(resolve, delay))
                  delay *= 1.5 // Exponential backoff
                } else {
                  // Non-timeout errors shouldn't be retried
                  throw error
                }
              }
            }
          }
          
          try {
            const operatorData = await retryOperatorLookup()
            
            if (operatorData && isMounted) {
              setOperator(operatorData)
              setLoading(false)
              console.log('✅ Operator authenticated:', operatorData.company_name)
            }
          } catch (error) {
            console.error('❌ All operator lookup attempts failed:', error.message)
            setLoading(false)
            
            // Don't force logout - user is authenticated, just missing operator data
            if (error.message.includes('timeout')) {
              console.log('🔄 Operator lookup completely failed - user authenticated without operator context')
              
              // Set a temporary "loading operator" state that the UI can handle
              setOperator(null)
              
              // Try one final background attempt after a delay
              setTimeout(async () => {
                try {
                  const { data: operatorData, error } = await supabase
                    .from('operators')
                    .select('*')
                    .eq('auth_user_id', session.user.id)
                    .single()
                  
                  if (operatorData && !error && isMounted) {
                    console.log('✅ Background operator lookup succeeded:', operatorData.company_name)
                    setOperator(operatorData)
                  }
                } catch (bgError) {
                  console.warn('⚠️ Background operator lookup also failed:', bgError.message)
                }
              }, 10000) // Try again in 10 seconds
            }
          }
        }
        else if (event === 'SIGNED_OUT' || (!session?.user && event)) {
          if (isMounted) {
            setOperator(null)
            setHasValidSession(false)
            console.log('👋 Operator signed out or session lost (event:', event + ')')
          }
        }
        else if (session?.user && !event) {
          // Handle cases where we have a session but no specific event
          console.log('🔍 Session detected without event, setting hasValidSession=true')
          setHasValidSession(true)
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
      setHasValidSession(false)
      console.log('👋 Operator logged out securely')
    } catch (error) {
      console.error('❌ Logout error:', error)
      // Force local logout even if remote logout fails
      setOperator(null)
      setHasValidSession(false)
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

  // console.log('🔍 DEBUG: useAuth returning - hasValidSession:', hasValidSession, 'operator:', !!operator, 'loading:', loading)
  
  return {
    operator,
    loading,
    login,
    logout,
    refreshOperatorData, // for Password Change
    isAuthenticated: hasValidSession, // Use session state instead of operator presence
    needsPasswordChange: needsPasswordChange(operator) // Password change check
  }
}