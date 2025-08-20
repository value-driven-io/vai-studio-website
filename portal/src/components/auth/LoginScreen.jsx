import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Lock, Smartphone, AlertCircle } from 'lucide-react'
import { useClientStore } from '../../store/clientStore'
import LanguageSwitcher from '../ui/LanguageSwitcher'

const LoginScreen = () => {
  const { t } = useTranslation()
  const { authenticate, error, isLoading, urlClientSlug } = useClientStore()
  
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto-focus input on mount
  useEffect(() => {
    const input = document.getElementById('access-password')
    if (input) {
      input.focus()
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password.trim() || isSubmitting) return

    setIsSubmitting(true)
    
    try {
      const result = await authenticate(password)
      if (!result.success) {
        // Error is handled by the store
        setPassword('')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-vai-coral/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-vai-sunset/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Language switcher */}
        <div className="absolute -top-16 right-0">
          <LanguageSwitcher />
        </div>

        {/* Login card */}
        <div className="vai-card vai-glassmorphism-strong">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-vai-coral/20 rounded-xl">
                <Lock className="w-8 h-8 text-vai-coral" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-vai-pearl mb-2">
              {t('auth.title')}
            </h1>
            
            <p className="text-vai-muted">
              {t('auth.subtitle')}
            </p>
            
            {/* Client hint if from deep link */}
            {urlClientSlug && (
              <div className="mt-3 p-2 bg-vai-coral/10 rounded-lg border border-vai-coral/20">
                <p className="text-sm text-vai-coral">
                  Client: {urlClientSlug}
                </p>
              </div>
            )}
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">
                {error === 'Invalid access code' ? t('auth.error.invalid') : 
                 error === 'Connection error. Please try again.' ? t('auth.error.connection') :
                 t('auth.error.general')}
              </p>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                id="access-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('auth.placeholder')}
                className="vai-input pr-12"
                disabled={isSubmitting}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
              />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-vai-muted hover:text-vai-pearl transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={!password.trim() || isSubmitting}
              className="vai-button-primary w-full flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t('common.loading')}</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>{t('auth.button')}</span>
                </>
              )}
            </button>
          </form>

          {/* Help section */}
          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <div className="text-center">
              <p className="text-sm text-vai-muted mb-3">
                {t('auth.help.title')}
              </p>
              
              <a
                href="https://wa.me/68987269065"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-vai-coral hover:text-vai-coral-light transition-colors"
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {t('auth.help.contact')} ({t('auth.help.phone')})
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-vai-muted">
            VAI Studio © 2025 • International Quality. Island Style.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginScreen