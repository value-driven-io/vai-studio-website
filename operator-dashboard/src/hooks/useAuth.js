// operator-dashboard/src/hooks/useAuth.js
// CHROME-COMPATIBLE VERSION - Fixes session timeout issues

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next' 
import { supabase } from '../lib/supabase' 
import { needsPasswordChange } from '../utils/passwordSecurity'
import operatorCache from '../services/operatorCache'
import logger from '../utils/logger'

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

  // Intelligent error parsing with i18n support
  const parseAuthError = (error) => {
    logger.debug('Parsing auth error', { error }, 'AUTH')

    if (!error || !error.message) {
      const result = t('login.errors.unknownError')
      logger.debug('Using unknown error fallback', { result }, 'AUTH')
      return result
    }

    const errorMessage = error.message.toLowerCase()
    logger.debug('Processing error message', { errorMessage }, 'AUTH')
    
    // Map Supabase error patterns to localized messages
    if (errorMessage.includes('invalid login credentials') || 
        errorMessage.includes('invalid email or password')) {
      return t('login.errors.invalidCredentials')
    }
    
    if (errorMessage.includes('email not confirmed') || 
        errorMessage.includes('email address not confirmed')) {
      return t('login.errors.emailNotConfirmed')
    }
    
    if (errorMessage.includes('too many requests') || 
        errorMessage.includes('rate limit') ||
        errorMessage.includes('email rate limit exceeded')) {
      return t('login.errors.tooManyAttempts')
    }
    
    if (errorMessage.includes('account locked') || 
        errorMessage.includes('user locked')) {
      return t('login.errors.accountLocked')
    }
    
    if (errorMessage.includes('invalid email') || 
        errorMessage.includes('email format')) {
      return t('login.errors.invalidEmail')
    }
    
    if (errorMessage.includes('password') && 
        (errorMessage.includes('short') || errorMessage.includes('minimum'))) {
      return t('login.errors.passwordTooShort')
    }
    
    if (errorMessage.includes('network') || 
        errorMessage.includes('failed to fetch') ||
        errorMessage.includes('connection')) {
      return t('login.errors.networkError')
    }
    
    if (errorMessage.includes('server error') || 
        errorMessage.includes('internal server') ||
        errorMessage.includes('503') || errorMessage.includes('502')) {
      return t('login.errors.serverError')
    }
    
    if (errorMessage.includes('session') && 
        (errorMessage.includes('expired') || errorMessage.includes('invalid'))) {
      return t('login.errors.sessionExpired')
    }
    
    if (errorMessage.includes('maintenance') || 
        errorMessage.includes('unavailable')) {
      return t('login.errors.maintenanceMode')
    }
    
    // Handle operator-specific errors
    if (errorMessage.includes('no operator account found') || 
        errorMessage.includes('operator account')) {
      return t('login.errors.accountNotFound')
    }
    
    if (errorMessage.includes('suspended') || 
        errorMessage.includes('inactive')) {
      return t('login.errors.accountSuspended')
    }
    
    if (errorMessage.includes('pending approval') || 
        errorMessage.includes('pending')) {
      return t('login.errors.accountPending')
    }
    
    // Special handling for timeout messages
    if (errorMessage.includes('login timeout') || 
        errorMessage.includes('login is taking too long')) {
      return t('login.errors.networkError')
    }
    
    // Default fallback - log unmapped errors for debugging
    logger.warn('Unmapped auth error', { originalMessage: error.message }, 'AUTH')
    return t('login.errors.unknownError')
  }

  // ALL your existing useEffect logic unchanged
  useEffect(() => {
    let isMounted = true // Prevent state updates after unmount
    let timeoutId = null
    let hasInitialized = false // Prevent double initialization in StrictMode

    const checkSession = async () => {
      if (hasInitialized) {
        logger.debug('Skipping duplicate checkSession in StrictMode', null, 'AUTH')
        return
      }
      hasInitialized = true
      
      try {
        logger.debug('Checking session...', null, 'AUTH')
        
        // CHROME FIX: getSession() hangs indefinitely on browser refresh in Chrome
        const endTimer = logger.time('getSession', 'PERFORMANCE')
        const start = Date.now()

        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('getSession hung - relying on onAuthStateChange')), 3000)
        )

        const { data: { session }, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ])

        endTimer()
        logger.performance('getSession completed', { duration: Date.now() - start })

        if (sessionError) {
          logger.warn('Session error', { error: sessionError.message }, 'AUTH')
          throw sessionError
        }
        
        if (session?.user && isMounted) {
          logger.auth('Valid session found', { email: session.user.email })
          setHasValidSession(true)
          
          // Get operator data with retry mechanism
          try {
            logger.debug('Initial operator lookup for session restore...', null, 'AUTH')
            
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
              logger.auth('Session restored', { companyName: operatorData.company_name })
            } else if (error) {
              logger.warn('Initial operator lookup failed', { error: error.message }, 'AUTH')
              
              // Don't force sign out immediately - might be temporary DB issue
              if (error.code === 'PGRST116') {
                logger.debug('Operator not found in database, signing out...', null, 'AUTH')
                await supabase.auth.signOut()
              } else if (error.message.includes('timeout')) {
                logger.debug('Initial operator lookup timed out, will rely on onAuthStateChange', null, 'AUTH')
                // Let onAuthStateChange handle the operator lookup with retries
              }
            }
          } catch (lookupError) {
            logger.warn('Initial operator lookup error', { error: lookupError.message }, 'AUTH')
            // Don't fail the session check - let onAuthStateChange handle it
          }
        } else {
          logger.debug('No valid session found', { session: !!session, isMounted }, 'AUTH')
          if (isMounted) {
            setHasValidSession(false)
          } else {
            logger.debug('Skipping hasValidSession update - component unmounting', null, 'AUTH')
          }
        }
      } catch (error) {
        logger.error('Session check error', { error: error.message }, 'AUTH')
        
        // CHROME FIX: If getSession hangs, check localStorage directly
        if (error.message.includes('getSession hung')) {
          logger.debug('getSession hung in Chrome - checking localStorage directly...', null, 'AUTH')
          
          try {
            // Check if we have session data in localStorage
            const storedSession = localStorage.getItem('supabase.auth.token')
            if (storedSession) {
              const sessionData = JSON.parse(storedSession)
              const accessToken = sessionData?.access_token
              const expiresAt = sessionData?.expires_at
              
              logger.debug('Found localStorage session data', { hasToken: !!accessToken }, 'AUTH')
              
              // Check if token hasn't expired
              if (accessToken && expiresAt && new Date().getTime() < expiresAt * 1000) {
                logger.debug('localStorage session is valid, triggering recovery...', null, 'AUTH')
                
                // Manually trigger auth state change to recover session
                supabase.auth.getSession().catch(() => {
                  logger.debug('Manual getSession failed, but localStorage session is valid', null, 'AUTH')
                })
                
                return // Exit early, don't set loading to false
              } else {
                logger.debug('localStorage session expired or invalid', null, 'AUTH')
              }
            } else {
              logger.debug('No localStorage session found', null, 'AUTH')
            }
          } catch (storageError) {
            logger.warn('Failed to check localStorage session', { error: storageError.message }, 'AUTH')
          }
          
          logger.debug('Relying on onAuthStateChange for auth recovery', null, 'AUTH')
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
          
          // Enhanced operator lookup with caching and background refresh
          const lookupOperatorWithCache = async (authUserId) => {
            console.log(`🔍 [DIAGNOSTIC] Environment info:`, {
              hostname: window.location.hostname,
              userAgent: navigator.userAgent.split(' ')[0],
              connection: navigator.connection?.effectiveType || 'unknown',
              supabaseUrl: supabase.supabaseUrl?.slice(-10) || 'unknown'
            })

            // Step 1: Try to get cached data first
            const cachedOperator = operatorCache.getCachedOperator(authUserId)
            if (cachedOperator) {
              console.log('🗄️ Using cached operator data for instant load')
              setOperator(cachedOperator)
              setLoading(false)
              
              // Background refresh to keep cache fresh
              setTimeout(() => {
                console.log('🔄 Background refresh of operator data...')
                refreshOperatorInBackground(authUserId)
              }, 100)
              
              return cachedOperator
            }

            // Step 2: No cache available, fetch with optimized retry
            console.log('🔄 No cached data available, fetching from database...')
            return await retryOperatorLookup(authUserId, 2, 1000) // Reduced retries since we have prewarming
          }

          // Background refresh function
          const refreshOperatorInBackground = async (authUserId) => {
            try {
              const { data: operatorData, error } = await supabase
                .from('operators')
                .select('*')
                .eq('auth_user_id', authUserId)
                .single()

              if (operatorData && !error) {
                operatorCache.cacheOperator(authUserId, operatorData)
                
                // Update current state if data changed
                setOperator(prev => {
                  if (JSON.stringify(prev) !== JSON.stringify(operatorData)) {
                    console.log('🔄 Background refresh found updated operator data')
                    return operatorData
                  }
                  return prev
                })
              }
            } catch (error) {
              console.warn('⚠️ Background operator refresh failed:', error.message)
            }
          }

          // Optimized retry mechanism (now with fewer retries due to prewarming)
          const retryOperatorLookup = async (authUserId, retries = 2, delay = 1000) => {
            for (let attempt = 1; attempt <= retries; attempt++) {
              const attemptStart = performance.now()
              try {
                console.log(`🔄 Operator lookup attempt ${attempt}/${retries}`)
                
                // Shorter timeout since connection is prewarmed
                const timeout = attempt === 1 ? 8000 : 12000
                
                // DIAGNOSTIC: Measure network + query time separately
                const queryStart = performance.now()
                console.log(`⏱️ [DIAGNOSTIC] Starting Supabase query at ${queryStart.toFixed(2)}ms`)
                
                const queryPromise = supabase
                  .from('operators')
                  .select('*')
                  .eq('auth_user_id', authUserId)
                  .single()
                  .then(result => {
                    const queryEnd = performance.now()
                    const queryTime = queryEnd - queryStart
                    console.log(`⏱️ [DIAGNOSTIC] Supabase query completed in ${queryTime.toFixed(2)}ms`)
                    return result
                  })
                
                const { data: operatorData, error } = await Promise.race([
                  queryPromise,
                  new Promise((_, reject) => 
                    setTimeout(() => {
                      const timeoutAt = performance.now()
                      console.log(`⏱️ [DIAGNOSTIC] Timeout triggered after ${(timeoutAt - queryStart).toFixed(2)}ms`)
                      reject(new Error('Operator lookup timeout'))
                    }, timeout)
                  )
                ])
                
                const attemptEnd = performance.now()
                const totalAttemptTime = attemptEnd - attemptStart
                
                if (operatorData && !error) {
                  console.log(`✅ Operator found on attempt ${attempt} in ${totalAttemptTime.toFixed(2)}ms: ${operatorData.company_name}`)
                  
                  // Cache the successful result
                  operatorCache.cacheOperator(authUserId, operatorData)
                  
                  return operatorData
                } else if (error && !error.message.includes('timeout')) {
                  // Non-timeout errors should not be retried
                  console.warn(`⚠️ Non-timeout operator lookup error after ${totalAttemptTime.toFixed(2)}ms:`, error.message)
                  throw error
                }
                
                throw new Error(error?.message || 'Unknown operator lookup error')
                
              } catch (error) {
                const attemptEnd = performance.now()
                const totalAttemptTime = attemptEnd - attemptStart
                console.warn(`⚠️ Operator lookup attempt ${attempt} failed after ${totalAttemptTime.toFixed(2)}ms:`, error.message)
                
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
            const operatorData = await lookupOperatorWithCache(session.user.id)
            
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
      
      // Get Operator data with caching
      console.log('🔍 Looking up operator for user:', authData.user.email)
      
      // Check cache first for faster login
      let operatorData = operatorCache.getCachedOperator(authData.user.id)
      
      if (!operatorData) {
        // Fetch from database if not cached
        const { data, error: operatorError } = await supabase
          .from('operators')
          .select('*')
          .eq('auth_user_id', authData.user.id)
          .single()

        if (operatorError || !data) {
          console.error('❌ Operator lookup error:', operatorError)
          await supabase.auth.signOut()
          const accountNotFoundError = t('login.errors.accountNotFound')
          console.log('🔍 Account not found error for return:', accountNotFoundError)
          return { 
            success: false, 
            error: accountNotFoundError
          }
        }
        
        operatorData = data
        // Cache for future use
        operatorCache.cacheOperator(authData.user.id, operatorData)
      } else {
        console.log('🗄️ Using cached operator data for login:', operatorData.company_name)
        
        // Background refresh to ensure data is current
        setTimeout(() => {
          console.log('🔄 Background refresh after login...')
          supabase
            .from('operators')
            .select('*')
            .eq('auth_user_id', authData.user.id)
            .single()
            .then(({ data }) => {
              if (data) operatorCache.cacheOperator(authData.user.id, data)
            })
            .catch(() => {}) // Silent background refresh
        }, 1000)
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

  // Enhanced logout function with cache clearing
  const logout = async () => {
    try {
      // Get current user before signing out to clear their cache
      const { data: { session } } = await supabase.auth.getSession()
      const authUserId = session?.user?.id
      
      await supabase.auth.signOut()
      setOperator(null)
      setHasValidSession(false)
      
      // Clear cached operator data
      if (authUserId) {
        operatorCache.clearCache(authUserId)
      }
      
      console.log('👋 Operator logged out securely with cache cleared')
    } catch (error) {
      console.error('❌ Logout error:', error)
      // Force local logout even if remote logout fails
      setOperator(null)
      setHasValidSession(false)
      // Clear all caches as fallback
      operatorCache.clearAllCaches()
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