// src/components/journey/BookingLookup.jsx
import React, { useState } from 'react'
import { Search, Mail, MessageCircle, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const BookingLookup = ({ isOpen, onClose, onSearch }) => {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [errors, setErrors] = useState({})

  if (!isOpen) return null

  const validateAndSearch = () => {
    const newErrors = {}
    
    if (!email.trim() && !whatsapp.trim()) {
      newErrors.general = t('bookingLookup.validation.provideContact')
    }
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('bookingLookup.validation.validEmail')
    }
    
    if (whatsapp && !/^\+?[\d\s\-\(\)]{8,}$/.test(whatsapp)) {
      newErrors.whatsapp = t('bookingLookup.validation.validPhone')
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      onSearch(email.trim(), whatsapp.trim())
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-ui-surface-primary rounded-2xl max-w-md w-full border border-ui-border-primary">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-ui-text-primary">{t('bookingLookup.title')}</h2>
            <button
              onClick={onClose}
              className="p-2 text-ui-text-tertiary hover:text-ui-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Info */}
          <div className="bg-interactive-primary/10 border border-interactive-primary/20 rounded-lg p-4 mb-6">
            <p className="text-interactive-primary text-sm">
              {t('bookingLookup.info')}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-ui-text-secondary mb-2">
                {t('bookingLookup.form.emailLabel')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ui-text-tertiary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors(prev => ({ ...prev, email: null }))
                  }}
                  className={`w-full pl-10 pr-4 py-3 bg-ui-surface-secondary border rounded-lg text-ui-text-primary placeholder-ui-text-tertiary focus:ring-2 focus:ring-interactive-primary ${
                    errors.email ? 'border-status-error' : 'border-ui-border-secondary'
                  }`}
                  placeholder={t('bookingLookup.placeholders.email')}
                />
              </div>
              {errors.email && (
                <p className="text-status-error text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* OR Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-ui-border-secondary"></div>
              <span className="text-ui-text-tertiary text-sm">{t('common.or')}</span>
              <div className="flex-1 h-px bg-ui-border-secondary"></div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-ui-text-secondary mb-2">
                {t('bookingLookup.form.whatsappLabel')}
              </label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-ui-text-tertiary" />
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => {
                    setWhatsapp(e.target.value)
                    if (errors.whatsapp) setErrors(prev => ({ ...prev, whatsapp: null }))
                  }}
                  className={`w-full pl-10 pr-4 py-3 bg-ui-surface-secondary border rounded-lg text-ui-text-primary placeholder-ui-text-tertiary focus:ring-2 focus:ring-interactive-primary ${
                    errors.whatsapp ? 'border-status-error' : 'border-ui-border-secondary'
                  }`}
                  placeholder={t('bookingLookup.placeholders.whatsapp')}
                />
              </div>
              {errors.whatsapp && (
                <p className="text-status-error text-sm mt-1">{errors.whatsapp}</p>
              )}
            </div>

            {/* General Error */}
            {errors.general && (
              <p className="text-status-error text-sm">{errors.general}</p>
            )}

            {/* Search Button */}
            <button
              onClick={validateAndSearch}
              className="w-full bg-interactive-primary hover:bg-interactive-secondary text-ui-text-primary font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              {t('bookingLookup.form.searchButton')}
            </button>
          </div>

          {/* Privacy Note */}
          <p className="text-xs text-ui-text-tertiary text-center mt-4">
            We only use this information to find your existing bookings. Your privacy is protected.
          </p>
        </div>
      </div>
    </div>
  )
}

export default BookingLookup