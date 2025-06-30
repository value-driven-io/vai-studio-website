// src/components/journey/BookingLookup.jsx
import React, { useState } from 'react'
import { Search, Mail, MessageCircle, X } from 'lucide-react'

const BookingLookup = ({ isOpen, onClose, onSearch }) => {
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [errors, setErrors] = useState({})

  if (!isOpen) return null

  const validateAndSearch = () => {
    const newErrors = {}
    
    if (!email.trim() && !whatsapp.trim()) {
      newErrors.general = 'Please provide either email or WhatsApp number'
    }
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (whatsapp && !/^\+?[\d\s\-\(\)]{8,}$/.test(whatsapp)) {
      newErrors.whatsapp = 'Please enter a valid phone number'
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      onSearch(email.trim(), whatsapp.trim())
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Find Your Bookings</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <p className="text-blue-400 text-sm">
              Enter the email or WhatsApp number you used when booking to view your reservations.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors(prev => ({ ...prev, email: null }))
                  }}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* OR Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-600"></div>
              <span className="text-slate-400 text-sm">OR</span>
              <div className="flex-1 h-px bg-slate-600"></div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                WhatsApp Number
              </label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => {
                    setWhatsapp(e.target.value)
                    if (errors.whatsapp) setErrors(prev => ({ ...prev, whatsapp: null }))
                  }}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 ${
                    errors.whatsapp ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="+689 12 34 56 78"
                />
              </div>
              {errors.whatsapp && (
                <p className="text-red-400 text-sm mt-1">{errors.whatsapp}</p>
              )}
            </div>

            {/* General Error */}
            {errors.general && (
              <p className="text-red-400 text-sm">{errors.general}</p>
            )}

            {/* Search Button */}
            <button
              onClick={validateAndSearch}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Find My Bookings
            </button>
          </div>

          {/* Privacy Note */}
          <p className="text-xs text-slate-400 text-center mt-4">
            We only use this information to find your existing bookings. Your privacy is protected.
          </p>
        </div>
      </div>
    </div>
  )
}

export default BookingLookup