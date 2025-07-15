// src/components/booking/BookingModal.jsx
import React, { useState } from 'react'
import { X, Clock, MapPin, Users, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'
import { tourService } from '../../services/tourService'
import { useAppStore } from '../../stores/bookingStore'
import { authService } from '../../services/authService'
import { TOUR_TYPE_EMOJIS } from '../../constants/moods'
import { formatPrice, formatDate, formatTime } from '../../lib/utils'
import toast from 'react-hot-toast'

const BookingModal = ({ tour, isOpen, onClose }) => {
  const { addBooking, updateUserProfile } = useAppStore()
  const [step, setStep] = useState(1) // 1: Quick Form, 2: Optional Details, 3: Success
  const [showOptional, setShowOptional] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bookingResult, setBookingResult] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_whatsapp: '',
    customer_email: '',
    customer_phone: '',
    num_adults: 1,
    num_children: 0,
    special_requirements: '',
    dietary_restrictions: '',
    accessibility_needs: ''
  })

  // Form validation
  const [errors, setErrors] = useState({})

  if (!isOpen || !tour) return null

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }

  const validateQuickForm = () => {
    const newErrors = {}
    
    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Name is required'
    }
    
    if (!formData.customer_whatsapp.trim()) {
      newErrors.customer_whatsapp = 'WhatsApp number is required'
    } else if (!/^\+?[\d\s\-\(\)]{8,}$/.test(formData.customer_whatsapp)) {
      newErrors.customer_whatsapp = 'Please enter a valid phone number'
    }

    // Email validation (required)
    if (!formData.customer_email.trim()) {
      newErrors.customer_email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = 'Please enter a valid email address'
    }

    // Phone validation (optional but must be valid if provided)
    if (formData.customer_phone && !/^\+?[\d\s\-\(\)]{8,}$/.test(formData.customer_phone)) {
      newErrors.customer_phone = 'Please enter a valid phone number'
    }
    
    if (formData.num_adults < 1) {
      newErrors.num_adults = 'At least 1 adult is required'
    }
    
    const totalParticipants = formData.num_adults + formData.num_children
    if (totalParticipants > tour.available_spots) {
      newErrors.num_adults = `Only ${tour.available_spots} spots available`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleQuickBooking = async () => {
    if (!validateQuickForm()) return

    try {
        setLoading(true)
        
        // 🆕 STEP 1: Create tourist account first
        const accountResult = await authService.createTouristAccount(
          formData.customer_name,
          formData.customer_email,
          formData.customer_whatsapp,
          formData.customer_phone
        )

        if (!accountResult.success) {
          throw new Error(accountResult.error)
        }

        // ✅ STEP 2: Create booking with account linkage (existing logic)
        const totalParticipants = formData.num_adults + formData.num_children
        const subtotal = (formData.num_adults * tour.discount_price_adult) + 
                        (formData.num_children * (tour.discount_price_child || 0))

      const bookingData = {
        tour_id: tour.id,
        operator_id: tour.operator_id,
        tourist_user_id: accountResult.tourist_user_id,
        customer_name: formData.customer_name,
        customer_whatsapp: formData.customer_whatsapp,
        customer_email: formData.customer_email?.trim() || '',
        customer_phone: formData.customer_phone?.trim() || '', // Use empty string instead of null
        num_adults: formData.num_adults,
        num_children: formData.num_children,
        // Don't include total_participants - it's auto-generated in DB
        adult_price: tour.discount_price_adult,
        child_price: tour.discount_price_child || 0,
        subtotal: subtotal,
        special_requirements: formData.special_requirements?.trim() || '',
        dietary_restrictions: formData.dietary_restrictions?.trim() || '',
        accessibility_needs: formData.accessibility_needs?.trim() || '',
        available_spots: tour.available_spots // Pass this for updating spots
      }

      const result = await tourService.createBooking(bookingData)
      
      // Save user profile for future bookings lookup
      //updateUserProfile({
       // name: formData.customer_name,
       // email: formData.customer_email?.trim() || '',
       // whatsapp: formData.customer_whatsapp
      //})
      
      setBookingResult(result)
      addBooking(result)
      setStep(3)
      
      toast.success('Booking request sent! Check your WhatsApp for updates.')
      
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const calculatePricing = () => {
    const adultTotal = formData.num_adults * tour.discount_price_adult
    const childTotal = formData.num_children * (tour.discount_price_child || 0)
    const subtotal = adultTotal + childTotal
    const commission = Math.round(subtotal * 0.1)
    // Note: total_amount is calculated by database, but we show it for UX
    const total = subtotal + commission
    
    return { subtotal, commission, total, adultTotal, childTotal }
  }

  const pricing = calculatePricing()

  // Success Screen
  if (step === 3 && bookingResult) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              Booking Confirmed! 🎉
            </h2>
            
            <p className="text-slate-300 mb-6">
              Your adventure is reserved! Now the operator needs to confirm.
            </p>
            
            <div className="bg-slate-700 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-white mb-2">Booking Details</h3>
              <div className="space-y-1 text-sm text-slate-300">
                <div>Reference: <span className="text-white font-mono">{bookingResult.booking_reference}</span></div>
                <div>Tour: {tour.tour_name}</div>
                <div>Date: {formatDate(tour.tour_date)} {formatTime(tour.time_slot)}</div>
                <div>Participants: {formData.num_adults + formData.num_children}</div>
                <div>Total: {formatPrice(bookingResult.total_amount || (bookingResult.subtotal + bookingResult.commission_amount))}</div>
              </div>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6" style={{textAlign: 'left'}}>
              <h4 className="font-semibold text-white mb-2">What's Next?</h4>
              <div className="text-sm text-slate-300 space-y-1">
                <div>1. Operator confirms your booking request (Mail & via this VAI Tickets)</div>
                <div>2. Once confirmed: Communicate final details and meeting point with Operator</div>
                <div>3. Payment directly with operator (no upfront cost to VAI Tickets)</div>
                <div>4. Enjoy your adventure! 🌴</div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
              <a
                href={`https://wa.me/68987269065?text=Hi! I have a question about my booking ${bookingResult.booking_reference}`}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main Booking Form
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Book Your Adventure</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tour Summary */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-start gap-3">
            <div className="text-2xl">
              {TOUR_TYPE_EMOJIS[tour.tour_type] || '🌴'}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">{tour.tour_name}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(tour.tour_date)} {formatTime(tour.time_slot)}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {tour.operator_island}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {tour.available_spots} spots left
                </div>
                <div className="text-green-400 font-medium">
                  {formatPrice(tour.discount_price_adult)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="p-6">
          {/* Quick Booking Section */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-4">
              ⚡ Quick Booking
            </h4>
            
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  className={`w-full p-3 bg-slate-700 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 ${
                    errors.customer_name ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.customer_name && (
                  <p className="text-red-400 text-sm mt-1">{errors.customer_name}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  value={formData.customer_whatsapp}
                  onChange={(e) => handleInputChange('customer_whatsapp', e.target.value)}
                  className={`w-full p-3 bg-slate-700 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 ${
                    errors.customer_whatsapp ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="+689 12 34 56 78"
                />
                {errors.customer_whatsapp && (
                  <p className="text-red-400 text-sm mt-1">{errors.customer_whatsapp}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => handleInputChange('customer_email', e.target.value)}
                  className={`w-full p-3 bg-slate-700 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 ${
                    errors.customer_email ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="your@email.com"
                />
                {errors.customer_email && (
                  <p className="text-red-400 text-sm mt-1">{errors.customer_email}</p>
                )}
                <p className="text-xs text-slate-400 mt-1">For booking confirmations and updates</p>
              </div>

              {/* Participants */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Adults *
                  </label>
                  <select
                    value={formData.num_adults}
                    onChange={(e) => handleInputChange('num_adults', parseInt(e.target.value))}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({length: Math.min(tour.available_spots, 8)}, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Children
                  </label>
                  <select
                    value={formData.num_children}
                    onChange={(e) => handleInputChange('num_children', parseInt(e.target.value))}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({length: Math.min(tour.available_spots, 6)}, (_, i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {errors.num_adults && (
                <p className="text-red-400 text-sm">{errors.num_adults}</p>
              )}
            </div>
          </div>

          {/* Optional Details Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setShowOptional(!showOptional)}
              className="flex items-center justify-between w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              <span className="text-white font-medium">
                Optional Details (Phone, Special Requests)
              </span>
              {showOptional ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {showOptional && (
              <div className="mt-4 space-y-4 p-4 bg-slate-900 rounded-lg">
                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                    className={`w-full p-3 bg-slate-700 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 ${
                      errors.customer_phone ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="+689 12 34 56 78"
                  />
                  {errors.customer_phone && (
                    <p className="text-red-400 text-sm mt-1">{errors.customer_phone}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">Optional - for backup contact</p>
                </div>

                {/* Special Requirements */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Special Requirements
                  </label>
                  <textarea
                    value={formData.special_requirements}
                    onChange={(e) => handleInputChange('special_requirements', e.target.value)}
                    rows={2}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Any special requests or questions..."
                  />
                </div>

                {/* Dietary Restrictions */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Dietary Restrictions
                  </label>
                  <input
                    type="text"
                    value={formData.dietary_restrictions}
                    onChange={(e) => handleInputChange('dietary_restrictions', e.target.value)}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Vegetarian, allergies, etc."
                  />
                </div>

                {/* Accessibility */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Accessibility Needs
                  </label>
                  <input
                    type="text"
                    value={formData.accessibility_needs}
                    onChange={(e) => handleInputChange('accessibility_needs', e.target.value)}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Wheelchair access, mobility assistance, etc."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="bg-slate-900 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-white mb-3">Pricing Summary</h4>
            <div className="space-y-2 text-sm">
              {formData.num_adults > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>{formData.num_adults} Adult{formData.num_adults > 1 ? 's' : ''} × {formatPrice(tour.discount_price_adult)}</span>
                  <span>{formatPrice(pricing.adultTotal)}</span>
                </div>
              )}
              {formData.num_children > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>{formData.num_children} Child{formData.num_children > 1 ? 'ren' : ''} × {formatPrice(tour.discount_price_child || 0)}</span>
                  <span>{formatPrice(pricing.childTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300 text-xs">
                <span>Platform fee (10%)</span>
                <span>{formatPrice(pricing.commission)}</span>
              </div>
              <div className="border-t border-slate-700 pt-2 flex justify-between font-semibold text-white">
                <span>Estimated Total</span>
                <span>{formatPrice(pricing.total)}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                💡 Payment is made directly with the operator - no upfront cost!
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleQuickBooking}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Booking...
              </>
            ) : (
              <>
                🎫 Reserve My Spot
              </>
            )}
          </button>

          <p className="text-xs text-slate-400 text-center mt-3">
            By booking, you agree that payment will be handled directly with the tour operator.
          </p>
        </div>
      </div>
    </div>
  )
}

export default BookingModal