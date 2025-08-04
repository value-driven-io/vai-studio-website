// src/components/Login.js 
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react'
import LanguageDropdown from './LanguageDropdown'
import RegistrationForm from './auth/RegistrationForm'
import PendingApprovalScreen from './auth/PendingApprovalScreen'
import { useRegistration } from '../hooks/useRegistration'
import VAILogo from './VAILogo'

const Login = ({ onLogin, loading }) => {
  const { t } = useTranslation()
  const { checkApprovalStatus } = useRegistration()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  
  // New states for registration flow
  const [currentView, setCurrentView] = useState('login') // 'login' | 'register' | 'pending'
  const [registrationResult, setRegistrationResult] = useState(null)
  const [pendingOperator, setPendingOperator] = useState(null)

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
  }

  const handleBackToLogin = () => {
    console.log('🔙 Returning to login view')
    setCurrentView('login')
    setRegistrationResult(null)
    setPendingOperator(null)
    setError('')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      
      {/* Language Dropdown - Fixed Z-Index Issue */}
      <div className="fixed top-6 right-6 z-[9999]">
        <LanguageDropdown />
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 max-w-md w-full relative z-10">
        <div className="text-center mb-8"><VAILogo/>
          <h1 className="text-3xl font-bold text-white mb-2">Operator</h1>
          <p className="text-slate-400 text-sm mt-2">{t('login.operatorDashboard')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('login.emailAddress')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('login.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
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
            className="w-full mt-4 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            {t('login.createAccount')}
          </button>
        </div>
        {/* more info  */}
        <div className="mt-6 text-center">
            <p className="text-slate-500 text-xs">
            {t('login.moreInfo')}{' '}
            <a 
              href="https://vai.studio/app/operator-welcome" 
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              VAI Operator
            </a>
          </p>
        </div>

            

        {/* Help Section */}
        <div className="mt-6 text-center">
          <div className="w-full border-t border-slate-600"></div>
          <div className="mt-6 text-center">
            </div><p className="text-slate-500 text-xs">
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
  )
}

export default Login