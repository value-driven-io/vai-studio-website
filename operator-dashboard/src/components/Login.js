// src/components/Login.js 
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, Lock, Eye, EyeOff, UserPlus, Info } from 'lucide-react'
import LanguageDropdown from './LanguageDropdown'
import RegistrationForm from './auth/RegistrationForm'
import PendingApprovalScreen from './auth/PendingApprovalScreen'
import LearnMoreScreen from './auth/LearnMoreScreen'
import { useRegistration } from '../hooks/useRegistration'
import VAILogo from './VAILogo'

const Login = ({ onLogin, loading }) => {
  const { t } = useTranslation()
  const { checkApprovalStatus } = useRegistration()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  
  // Extended states for registration and learn more flows
  const [currentView, setCurrentView] = useState('login') // 'login' | 'register' | 'pending' | 'learnmore'
  const [registrationResult, setRegistrationResult] = useState(null)
  const [pendingOperator, setPendingOperator] = useState(null)
  const [campaignSource, setCampaignSource] = useState(null)

  // Check URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const welcomeParam = urlParams.get('welcome')
    const source = urlParams.get('utm_source') || urlParams.get('source')
    const campaign = urlParams.get('utm_campaign') || urlParams.get('campaign')
    
    // Set campaign source for tracking
    if (source || campaign) {
      setCampaignSource(source || campaign)
    }

    // Auto-navigate to learn more screen if welcome parameter is present
    if (welcomeParam) {
      console.log('🎯 Welcome parameter detected:', welcomeParam)
      setCurrentView('learnmore')
      
      // Track campaign entry
      if (typeof window !== 'undefined') {
        if (typeof window.fbq === 'function') {
          window.fbq('track', 'ViewContent', {
            content_type: 'campaign_landing',
            campaign_parameter: welcomeParam,
            utm_source: source,
            utm_campaign: campaign
          })
        }

        if (typeof window.gtag === 'function') {
          window.gtag('event', 'campaign_entry', {
            campaign_parameter: welcomeParam,
            utm_source: source,
            utm_campaign: campaign,
            page_title: 'VAI Operator Login with Campaign'
          })
        }
      }
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!email) {
      setError(t('login.emailRequired'))
      return
    }
    
    if (!password) {
      setError(t('login.passwordRequired'))
      return
    }

    console.log('🔐 Attempting login with registration flow check...')

    // Attempt login
    const result = await onLogin(email, password)
    
    if (!result.success) {
      console.log('❌ Login failed:', result.error)
      
      // Check if this is a pending approval case
      if (result.error?.includes('No active operator account found') || 
          result.error?.includes('operator account')) {
        
        console.log('🔍 Checking if this is a pending operator...')
        // Check approval status
        const statusResult = await checkApprovalStatus(email)
        
        if (statusResult.found) {
          console.log('✅ Found pending operator:', statusResult.operator)
          setPendingOperator(statusResult.operator)
          setCurrentView('pending')
          return
        } else {
          console.log('❌ No operator found for this email')
        }
      }
      
      setError(result.error)
    }
  }

  const handleRegistrationSuccess = (result) => {
    console.log('🎉 Registration successful, switching to pending view')
    setRegistrationResult(result)
    setPendingOperator(result.operator)
    setCurrentView('pending')

    // Track successful registration from learn more
    if (campaignSource && typeof window !== 'undefined') {
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'CompleteRegistration', {
          content_type: 'operator_registration',
          campaign_source: campaignSource,
          registration_from: 'learn_more'
        })
      }

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'registration_from_learn_more', {
          campaign_source: campaignSource,
          conversion_value: 1
        })
      }
    }
  }

  const handleBackToLogin = () => {
    console.log('🔙 Returning to login view')
    setCurrentView('login')
    setRegistrationResult(null)
    setPendingOperator(null)
    setError('')
    
    // Clear URL parameters when returning to login
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }

  const handleStatusCheck = (statusData) => {
    if (statusData.canLogin) {
      console.log('✅ Operator approved, returning to login')
      // Operator has been approved, redirect to login
      setCurrentView('login')
      setError('')
      // Optionally auto-fill email
      if (pendingOperator?.email) {
        setEmail(pendingOperator.email)
      }
    }
  }

  const handleShowLearnMore = () => {
    setCurrentView('learnmore')
    
    // Track learn more click from login screen
    if (typeof window !== 'undefined') {
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'ViewContent', {
          content_type: 'learn_more_from_login'
        })
      }

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'learn_more_clicked', {
          source: 'login_screen'
        })
      }
    }
  }

  const handleGetAccessFromLearnMore = () => {
    setCurrentView('register')
  }

  // Render learn more screen
  if (currentView === 'learnmore') {
    return (
      <LearnMoreScreen
        onBack={handleBackToLogin}
        onGetAccess={handleGetAccessFromLearnMore}
        campaignSource={campaignSource}
      />
    )
  }

  // Render registration form
  if (currentView === 'register') {
    return (
      <RegistrationForm
        onBack={handleBackToLogin}
        onSuccess={handleRegistrationSuccess}
      />
    )
  }

  // Render pending approval screen
  if (currentView === 'pending') {
    return (
      <PendingApprovalScreen
        operator={pendingOperator}
        registrationResult={registrationResult}
        onBack={handleBackToLogin}
        onCheckStatus={handleStatusCheck}
      />
    )
  }

  // Render login form (default)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <VAILogo size="lg" />
          <h1 className="text-3xl font-bold text-white mb-2">Operator</h1>
        </div>

        {/* Language Selector */}
        <div className="flex justify-center mb-6">
          <LanguageDropdown />
        </div>

        {/* Login Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                {t('login.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('login.emailPlaceholder')}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('login.passwordPlaceholder')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {t('login.signingIn')}
                </div>
              ) : (
                t('login.signInSecurely')
              )}
            </button>

            {/* Credential Reminder */}
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-400 text-xs text-center">
                💡 {t('login.passwordReminder')}
              </p>
            </div>
          </form>

          {/* Registration Section */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-400">
                  {t('login.newOperator')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('register')}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 gap-2 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center mt-2"
            >
              <UserPlus className="w-4 h-4" />
              {t('login.createAccount')}
            </button>
          </div>

          {/* Learn More Section */}
          <div className="mt-6 text-center">
            <button
              onClick={handleShowLearnMore}
              className="flex items-center justify-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors text-sm mx-auto"
            >
              <Info className="w-4 h-4" />
              {t('login.learnMoreLink')}
            </button>
          </div>

          {/* Help Section */}
          <div className="mt-6 text-center">
            <div className="w-full border-t border-slate-600"></div>
            <div className="mt-6 text-center">
              <p className="text-slate-500 text-xs">
                {t('login.needHelp')}{' '}
                <a 
                  href="mailto:hello@vai.studio" 
                  className="text-blue-400 hover:text-blue-300 transition-colors underline decoration-dotted"
                >
                  hello@vai.studio
                </a> {' & '}
                <a 
                  href="https://wa.me/68987269065" 
                  className="text-blue-400 hover:text-blue-300 transition-colors underline decoration-dotted"
                >
                  WhatsApp
                </a>
              </p>
            </div>
          </div>
        </div>
        
        {/*  VAI TICKETS LINK OUTSIDE MODAL CONTAINER */}
   {/*
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
      <a 
        href="https://app.vai.studio/" 
        target="_blank"
        rel="noopener noreferrer"
        className="text-slate-400 hover:text-slate-300 transition-colors text-xs flex items-center gap-2"
      >
        {t('login.vaitickets')}
      </a>
    </div> 
    */}
      </div>
    </div>
  )
}

export default Login