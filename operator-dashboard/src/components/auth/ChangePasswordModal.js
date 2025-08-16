// operator-dashboard/src/components/auth/ChangePasswordModal.js
import React, { useState } from 'react'
import { Eye, EyeOff, Lock, Shield, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const ChangePasswordModal = ({ 
  context = 'forced', // 'forced', 'voluntary', 'reset'
  operator,
  onSuccess,
  onCancel,
  canDismiss = false 
}) => {

const { t } = useTranslation()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // ✅ DEFINE HELPER FUNCTIONS FIRST (before they're used)
  
  // Enhanced password validation with current password check
  const isUsingCurrentPassword = () => {
    return context === 'voluntary' && newPassword === currentPassword && newPassword.length > 0
  }

  // Password strength validation
  const validatePassword = (password) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password), 
      hasNumber: /\d/.test(password),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
    
    const allMet = Object.values(requirements).every(Boolean)
    return { valid: allMet, requirements }
  }

  // ✅ NOW SAFE TO USE THE FUNCTIONS
  const passwordValidation = validatePassword(newPassword)
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0
  const isFormValid = passwordValidation.valid && passwordsMatch && !isUsingCurrentPassword()

  // Real-time validation
  const validateForm = () => {
    const newErrors = {}
    
    // For voluntary changes, require current password
    if (context === 'voluntary' && !currentPassword.trim()) {
    newErrors.currentPassword = t('passwordSecurity.errors.currentPasswordRequired')
    }

    if (!passwordValidation.valid) {
    newErrors.newPassword = t('passwordSecurity.errors.passwordRequirements')
    }

    if (!passwordsMatch) {
    newErrors.confirmPassword = t('passwordSecurity.errors.passwordsNoMatch')
    }

    // Check for same password reuse
    if (isUsingCurrentPassword()) {
    newErrors.newPassword = t('passwordSecurity.errors.samePassword')
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Comprehensive error parsing for Supabase auth errors
  const parsePasswordError = (error) => {
    const errorMessage = error.message?.toLowerCase() || ''
    
    // Same password reuse
    if (errorMessage.includes('new password should be different')) {
      return { 
        type: 'newPassword', 
        message: t('passwordSecurity.errors.samePassword') 
      }
    }
    
    // Current password verification errors (for voluntary changes)
    if (errorMessage.includes('invalid login credentials') || 
        errorMessage.includes('authentication failed') ||
        errorMessage.includes('invalid email or password')) {
      return { 
        type: 'currentPassword', 
        message: t('passwordSecurity.errors.currentPasswordIncorrect') 
      }
    }
    
    // Password strength errors
    if (errorMessage.includes('password should be at least')) {
      return { 
        type: 'newPassword', 
        message: t('passwordSecurity.errors.minLength') 
      }
    }
    
    if (errorMessage.includes('password does not meet requirements') ||
        errorMessage.includes('weak password')) {
      return { 
        type: 'newPassword', 
        message: t('passwordSecurity.errors.weakPassword') 
      }
    }
    
    // Rate limiting
    if (errorMessage.includes('too many requests') || 
        errorMessage.includes('rate limit exceeded')) {
      return { 
        type: 'general', 
        message: t('passwordSecurity.errors.tooManyAttempts') 
      }
    }
    
    // Session/auth errors
    if (errorMessage.includes('session') && errorMessage.includes('expired')) {
      return { 
        type: 'general', 
        message: t('passwordSecurity.errors.sessionExpired') 
      }
    }
    
    if (errorMessage.includes('user not found') || 
        errorMessage.includes('unauthorized')) {
      return { 
        type: 'general', 
        message: t('passwordSecurity.errors.authError') 
      }
    }
    
    // Network errors
    if (errorMessage.includes('network') || 
        errorMessage.includes('fetch') || 
        errorMessage.includes('connection')) {
      return { 
        type: 'general', 
        message: t('passwordSecurity.errors.networkError') 
      }
    }
    
    // Database/server errors
    if (errorMessage.includes('database') || 
        errorMessage.includes('server error') || 
        errorMessage.includes('500') || 
        errorMessage.includes('503')) {
      return { 
        type: 'general', 
        message: t('passwordSecurity.errors.serverError') 
      }
    }
    
    // Fallback
    return { 
      type: 'general', 
      message: t('passwordSecurity.errors.generalError') 
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Check for current password reuse in voluntary changes
    if (isUsingCurrentPassword()) {
      setErrors({ newPassword: 'New password must be different from your current password' })
      return
    }

    setLoading(true)
    
    try {
      console.log('🔐 Attempting password change for context:', context)
      
      // For voluntary changes, verify current password first
      if (context === 'voluntary' && currentPassword) {
        console.log('🔍 Verifying current password...')
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: operator.email,
          password: currentPassword
        })
        
        if (verifyError) {
          console.error('❌ Current password verification failed:', verifyError)
          const parsedError = parsePasswordError(verifyError)
          setErrors({ [parsedError.type]: parsedError.message })
          toast.error(parsedError.message, {
            duration: 5000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #dc2626'
            }
          })
          return
        }
        console.log('✅ Current password verified')
      }
      
      // Update password with Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (authError) {
        console.error('❌ Auth password update failed:', authError)
        const parsedError = parsePasswordError(authError)
        setErrors({ [parsedError.type]: parsedError.message })
        toast.error(parsedError.message, {
          duration: 5000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #dc2626'
          }
        })
        return
      }

      console.log('✅ Password updated in Supabase Auth')

      // Update operator record to mark auth setup as completed
      const { error: operatorError } = await supabase
        .from('operators')
        .update({
          auth_setup_completed: true,
          temp_password: null, // Clear temp password
          updated_at: new Date().toISOString()
        })
        .eq('id', operator.id)

      if (operatorError) {
        console.error('❌ Operator record update failed:', operatorError)
        // Password was changed successfully, but database update failed
        toast.error(t('passwordSecurity.errors.syncFailed'), {
          duration: 6000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #f59e0b'
          }
        })
      } else {
        console.log('✅ Operator auth_setup_completed set to true')
      }

      // Success handling
      toast.success(t('passwordSecurity.success.passwordUpdated'), {
        duration: 4000,
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid #059669'
        }
      })

      // Call success callback
      if (onSuccess) {
        onSuccess()
      }

    } catch (error) {
      console.error('❌ Password change error:', error)
      const parsedError = parsePasswordError(error)
      
      setErrors({ [parsedError.type]: parsedError.message })
      
      toast.error(parsedError.message, {
        duration: 5000,
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid #dc2626'
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  // Context-specific messaging
  const getContextContent = () => {
    switch (context) {
        case 'forced':
        return {
            title: t('passwordSecurity.modal.forcedTitle'),
            subtitle: t('passwordSecurity.modal.forcedSubtitle'),
            icon: <Shield className="w-8 h-8 text-yellow-400" />,
            showCurrentPassword: false
        }
        case 'voluntary':
        return {
            title: t('passwordSecurity.modal.voluntaryTitle'), 
            subtitle: t('passwordSecurity.modal.voluntarySubtitle'),
            icon: <Lock className="w-8 h-8 text-blue-400" />,
            showCurrentPassword: true
        }
        case 'reset':
        return {
            title: t('passwordSecurity.modal.resetTitle'),
            subtitle: t('passwordSecurity.modal.resetSubtitle'),
            icon: <Lock className="w-8 h-8 text-green-400" />,
            showCurrentPassword: false
        }
        default:
        return {
            title: t('passwordSecurity.modal.defaultTitle'),
            subtitle: t('passwordSecurity.modal.defaultSubtitle'),
            icon: <Lock className="w-8 h-8 text-blue-400" />,
            showCurrentPassword: true
        }
    }
    }

  const contextContent = getContextContent()

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            {contextContent.icon}
            <h2 className="text-xl font-semibold text-white">
              {contextContent.title}
            </h2>
            {canDismiss && (
              <button
                onClick={onCancel}
                className="ml-auto text-slate-400 hover:text-slate-300 p-1 rounded"
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-slate-400 text-sm">
            {contextContent.subtitle}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Password (for voluntary changes) */}
          {contextContent.showCurrentPassword && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {t('passwordSecurity.fields.currentPassword')}
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full px-3 py-2 bg-slate-700 border ${
                    errors.currentPassword ? 'border-red-500' : 'border-slate-600'
                  } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500`}
                  placeholder={t('passwordSecurity.fields.currentPasswordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.currentPassword}</p>
              )}
            </div>
          )}

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('passwordSecurity.fields.newPassword')}
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full px-3 py-2 bg-slate-700 border ${
                  errors.newPassword ? 'border-red-500' : 'border-slate-600'
                } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500`}
                placeholder={t('passwordSecurity.fields.newPasswordPlaceholder')}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Password Requirements */}
            {newPassword.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="text-xs text-slate-400 mb-1">{t('passwordSecurity.requirements.title')}</div>
                {Object.entries({
                    [t('passwordSecurity.requirements.minLength')]: passwordValidation.requirements.minLength,
                    [t('passwordSecurity.requirements.hasUpper')]: passwordValidation.requirements.hasUpper,
                    [t('passwordSecurity.requirements.hasLower')]: passwordValidation.requirements.hasLower,
                    [t('passwordSecurity.requirements.hasNumber')]: passwordValidation.requirements.hasNumber,
                    [t('passwordSecurity.requirements.hasSymbol')]: passwordValidation.requirements.hasSymbol
                    }).map(([requirement, met]) => (
                  <div key={requirement} className="flex items-center gap-2 text-xs">
                    {met ? (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-slate-500" />
                    )}
                    <span className={met ? 'text-green-400' : 'text-slate-500'}>
                      {requirement}
                    </span>
                  </div>
                ))}
                
                {/* Same password check for voluntary changes */}
                {context === 'voluntary' && currentPassword && newPassword && (
                  <div className="flex items-center gap-2 text-xs">
                    {!isUsingCurrentPassword() ? (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-red-400" />
                    )}
                    <span className={!isUsingCurrentPassword() ? 'text-green-400' : 'text-red-400'}>
                     {t('passwordSecurity.requirements.differentFromCurrent')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('passwordSecurity.fields.confirmPassword')}
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 bg-slate-700 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-slate-600'
                } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500`}
                placeholder={t('passwordSecurity.fields.confirmPasswordPlaceholder')}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <div className="mt-1 flex items-center gap-2 text-xs">
                {passwordsMatch ? (
                <>
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span className="text-green-400">{t('passwordSecurity.requirements.passwordsMatch')}</span>
                </>
                ) : (
                <>
                    <AlertCircle className="w-3 h-3 text-red-400" />
                    <span className="text-red-400">{t('passwordSecurity.requirements.passwordsDontMatch')}</span>
                </>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {canDismiss && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                {t('passwordSecurity.buttons.cancel')}
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:text-slate-400 text-white rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  {t('passwordSecurity.buttons.updating')}
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  {context === 'forced' ? t('passwordSecurity.buttons.completeSetup') : t('passwordSecurity.buttons.updatePassword')}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="px-6 pb-6">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-blue-400 text-xs">
              {t('passwordSecurity.notices.securityNotice')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChangePasswordModal