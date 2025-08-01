// FILE: operator-dashboard/src/components/Login.js
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import LanguageDropdown from './LanguageDropdown'

const Login = ({ onLogin, loading }) => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

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

    // Call the secure login function with both email and password
    const result = await onLogin(email, password)
    if (!result.success) {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      
      {/* Language Dropdown - Fixed Z-Index Issue */}
      <div className="fixed top-6 right-6 z-[9999]">
        <LanguageDropdown />
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🏝️ VAI Operator</h1>
          <p className="text-slate-300">{t('login.operatorDashboard')}</p>
          <p className="text-slate-400 text-sm mt-2">{t('login.secureLoginRequired')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('login.emailAddress')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                placeholder={t('login.emailPlaceholder')}
                disabled={loading}
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
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                placeholder={t('login.passwordPlaceholder')}
                disabled={loading}
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
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 animate-in slide-in-from-top-2 duration-300">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
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
        </form>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm mb-2">
            {t('login.useCredentials')}
          </p>
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

        {/* Credential Reminder */}
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-400 text-xs text-center">
            💡 {t('login.passwordReminder')}
          </p>
        </div>

        {/* Operator Registration Section */}
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-xs">
            {t('login.registeraccount')}{' '}  
            <a 
              href="https://vai.studio/app/operator-welcome" 
              className="text-yellow-400 hover:text-yellow-300 transition-colors underline decoration-dotted"
            >
               VAI Operator
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}

export default Login