// FILE: operator-dashboard/src/components/Login.js
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, Lock, Eye, EyeOff, Globe } from 'lucide-react'

const Login = ({ onLogin, loading }) => {
  const { t, i18n } = useTranslation()
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

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      {/* Language Switcher - Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors">
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">
              {i18n.language === 'fr' ? '🇫🇷' : '🇺🇸'}
            </span>
          </button>
          
          <div className="absolute right-0 top-full mt-2 bg-slate-800 rounded-lg border border-slate-600 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[140px]">
            <button
              onClick={() => changeLanguage('fr')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                i18n.language === 'fr' ? 'bg-slate-700 text-blue-400' : 'text-slate-300'
              }`}
            >
              <span className="text-lg">🇫🇷</span>
              <span className="text-sm font-medium">Français</span>
              {i18n.language === 'fr' && (
                <span className="ml-auto text-blue-400">✓</span>
              )}
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                i18n.language === 'en' ? 'bg-slate-700 text-blue-400' : 'text-slate-300'
              }`}
            >
              <span className="text-lg">🇺🇸</span>
              <span className="text-sm font-medium">English</span>
              {i18n.language === 'en' && (
                <span className="ml-auto text-blue-400">✓</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🏝️ VAI Tickets</h1>
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
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder={t('login.emailPlaceholder')}
                disabled={loading}
                required
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
                className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder={t('login.passwordPlaceholder')}
                disabled={loading}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('login.signingIn') : t('login.signInSecurely')}
          </button>
        </form>

        {/* Help Section */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm mb-2">
            {t('login.useCredentials')}
          </p>
          <p className="text-slate-500 text-xs">
            {t('login.needHelp')}{' '}
            <a href="mailto:hello@vai.studio" className="text-blue-400 hover:text-blue-300">
              hello@vai.studio
            </a>
          </p>
        </div>

        {/* Credential Reminder */}
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-400 text-xs text-center">
            💡 {t('login.passwordReminder')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login