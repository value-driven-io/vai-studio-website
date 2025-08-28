// src/components/auth/AuthCallback.jsx
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../services/supabase'

const AuthCallback = () => {
  const { t } = useTranslation()
  const [status, setStatus] = useState('processing')
  const [message, setMessage] = useState('')

  useEffect(() => {
    setMessage(t('authCallback.processing.message'))
  }, [t])

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Starting auth callback processing...')
        
        // First, handle any auth tokens in the URL (email confirmations, password resets, etc.)
        const { data: authData, error: authError } = await supabase.auth.getSession()
        
        // If no immediate session, try to handle URL-based auth (like email confirmations)
        if (!authData.session && (window.location.hash || window.location.search)) {
          console.log('🔗 Processing URL auth parameters...')
          
          // Let Supabase process the URL tokens
          const { data: urlSession, error: urlError } = await supabase.auth.getSession()
          
          if (urlError) {
            console.error('❌ URL auth processing error:', urlError)
          }
          
          // Wait a moment for session to be established
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
        // Now get the session after URL processing
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError)
          throw sessionError
        }

        if (!session?.user) {
          console.warn('⚠️ No valid session found after URL processing')
          setStatus('error')
          setMessage(t('authCallback.error.noSession'))
          setTimeout(() => {
            window.location.href = 'https://app.vai.studio/?message=signin'
          }, 3000)
          return
        }

        const user = session.user
        console.log('✅ Valid session found for user:', user.email)

        // Check if user is an operator (priority check)
        console.log('🔍 Checking if user is an operator...')
        const { data: operator, error: operatorError } = await supabase
          .from('operators')
          .select('id, company_name, status')
          .eq('auth_user_id', user.id)
          .single()

        // Handle operator result
        if (operator && !operatorError) {
          console.log('✅ Operator found:', operator.company_name, 'Status:', operator.status)
          setStatus('success')
          setMessage(t('authCallback.success.operatorWelcome', { companyName: operator.company_name }))
          
          setTimeout(() => {
            window.location.href = `https://vai-operator-dashboard.onrender.com/auth/callback?message=operator`
          }, 2000)
          return
        }

        // If no operator found, check for tourist user
        console.log('🔍 Checking if user is a VAI Tickets User...')
        const { data: tourist, error: touristError } = await supabase
          .from('tourist_users')
          .select('id, first_name')
          .eq('auth_user_id', user.id)
          .single()

        // Handle tourist result
        if (tourist && !touristError) {
          console.log('✅ VAI Tickets User found:', tourist.first_name || 'Tourist')
          setStatus('success')
          setMessage(t('authCallback.success.touristWelcome', { firstName: tourist.first_name ? `, ${tourist.first_name}` : '' }))
        } else {
          console.log('ℹ️ No specific VAI Tickets User record found, redirecting to VAI Tickets anyway')
          setStatus('success')
          setMessage(t('authCallback.success.genericWelcome'))
        }

        setTimeout(() => {
          window.location.href = `https://app.vai.studio/?message=welcome`
        }, 2000)

      } catch (error) {
        console.error('❌ Auth callback error:', error)
        setStatus('error')
        setMessage(t('authCallback.error.authFailed'))
        
        setTimeout(() => {
          window.location.href = 'https://app.vai.studio/?message=signin'
        }, 5000)
      }
    }

    handleAuthCallback()
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
          {/* Status Icon */}
          <div className="mb-6">
            {status === 'processing' && (
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            )}
            {status === 'success' && (
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-2xl">✓</span>
              </div>
            )}
            {status === 'error' && (
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                <span className="text-white text-2xl">✗</span>
              </div>
            )}
          </div>

          {/* Status Message */}
          <h2 className="text-xl font-semibold mb-3">
            {status === 'processing' && t('authCallback.processing.title')}
            {status === 'success' && t('authCallback.success.title')}
            {status === 'error' && t('authCallback.error.title')}
          </h2>

          <p className="text-slate-400 mb-6">
            {message}
          </p>

          {/* Progress indicator for processing */}
          {status === 'processing' && (
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          )}

          {/* Error fallback buttons */}
          {status === 'error' && (
            <div className="space-y-3 mt-6">
              <a 
                href="https://app.vai.studio/"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                {t('authCallback.error.goToVaiTickets')}
              </a>
              <a 
                href="https://vai-operator-dashboard.onrender.com/"
                className="block w-full bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                {t('authCallback.error.goToVaiOperator')}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthCallback