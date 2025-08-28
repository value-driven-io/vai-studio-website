// src/components/auth/AuthModal.jsx
import React, { useState } from 'react'
import { X, Mail, Lock, User, MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { supabase } from '../../services/supabase'

const AuthModal = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const { t } = useTranslation()
  const { signIn, signUp, loading } = useAuth()
  const [mode, setMode] = useState(defaultMode) // 'login' or 'register'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    whatsapp: ''
  })
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (mode === 'register') {
        const result = await signUp(formData.email, formData.password, {
          first_name: formData.firstName,
          whatsapp_number: formData.whatsapp
        })
        
        if (result.user) {
        // Clear form after successful signup
        setFormData({
          email: '',
          password: '',
          firstName: '',
          whatsapp: ''
        })
        
        toast.success(t('auth.messages.accountCreated'), {
          duration: 6000, // Show longer for important message
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #059669'
          }
        })
        
        // Don't close modal immediately - let user read the message
        setTimeout(() => {
          onClose()
        }, 1000)
      }
      } else {
        const result = await signIn(formData.email, formData.password)
        
        if (result.user) {
          toast.success(t('auth.messages.welcomeBack'))
          onClose()
        }
      }
    } catch (error) {
      console.error('Auth error:', error)
      
      // Handle specific email confirmation errors
      if (error.message?.includes('email')) {
        toast.error(t('auth.messages.checkEmailFormat'))
      } else if (error.message?.includes('password')) {
        toast.error(t('auth.messages.passwordTooShort'))
      } else if (error.message?.includes('already registered')) {
        toast.error(t('auth.messages.emailExists'))
      } else if (error.message?.includes('rate limit')) {
        toast.error(t('auth.messages.rateLimited'))
      } else {
        toast.error(error.message || t('auth.messages.authFailed'))
      }
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
  <div 
    className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 99999
    }}
  >
    {/* Full screen backdrop */}
    <div 
      className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    />
    
    {/* Modal container - forced to center */}
    <div 
      className="relative bg-slate-800 rounded-2xl max-w-md w-full mx-auto border border-slate-700 shadow-2xl"
      style={{
        position: 'relative',
        zIndex: 100000,
        maxHeight: '85vh',
        overflowY: 'auto',
        marginTop: 'auto',
        marginBottom: 'auto'
      }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {mode === 'login' ? t('auth.modal.welcomeBack') : t('auth.modal.createAccount')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('auth.modal.firstName')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('auth.placeholders.firstName')}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('auth.modal.emailAddress')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('auth.placeholders.email')}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('auth.modal.password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('auth.placeholders.password')}
              />
            </div>
          </div>

          {mode === 'login' && (
            <div className="text-right mt-2">
              <button
                type="button"
                onClick={async () => {
                  if (!formData.email) {
                    toast.error(t('auth.messages.enterEmailFirst'))
                    return
                  }
                  
                  try {
                    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
                      redirectTo: `${window.location.origin}/auth/callback`
                    })
                    
                    if (error) throw error
                    
                    toast.success(t('auth.messages.resetEmailSent'))
                  } catch (error) {
                    toast.error(t('auth.messages.resetEmailFailed', { error: error.message }))
                  }
                }}
                className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                {t('auth.modal.forgotPassword')}
              </button>
            </div>
          )}

          {/* WhatsApp (Register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('auth.modal.whatsappOptional')}
              </label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('auth.placeholders.whatsapp')}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('auth.modal.processing') : (mode === 'login' ? t('auth.modal.signIn') : t('auth.modal.createAccountBtn'))}
          </button>
        </form>

        {/* Mode Switch */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              // Clear form when switching modes
              setFormData({
                email: '',
                password: '',
                firstName: '',
                whatsapp: ''
              })
            }}
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            {mode === 'login' 
              ? t('auth.modal.switchToRegister') 
              : t('auth.modal.switchToLogin')
            }
          </button>
        </div>

        {/* Benefits (Register mode) */}
        {mode === 'register' && (
          <div className="space-y-3 mt-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="text-blue-400 text-sm font-medium mb-2">{t('auth.benefits.title')}</h4>
              <ul className="text-blue-300 text-xs space-y-1">
                <li>{t('auth.benefits.trackBookings')}</li>
                <li>{t('auth.benefits.syncFavorites')}</li>
                <li>{t('auth.benefits.fasterRebooking')}</li>
              </ul>
            </div>
            
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h4 className="text-yellow-400 text-sm font-medium mb-1">{t('auth.emailConfirmation.title')}</h4>
              <p className="text-yellow-300 text-xs">
                {t('auth.emailConfirmation.message')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)

}

export default AuthModal