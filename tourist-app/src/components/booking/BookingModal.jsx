// src/components/booking/BookingModal.jsx
import React, { useState } from 'react'
import { X, Clock, MapPin, Users, ChevronDown, ChevronUp, CheckCircle, Calendar, MessageCircle } from 'lucide-react'
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
  const [accountResult, setAccountResult] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    customer_first_name: '',
    customer_last_name: '',
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

    if (!formData.customer_first_name.trim()) {
      newErrors.customer_first_name = 'First name is required'
    }
    
    if (!formData.customer_last_name.trim()) {
      newErrors.customer_last_name = 'Last name is required'
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
        const fullName = `${formData.customer_first_name.trim()} ${formData.customer_last_name.trim()}`
        const accountResult = await authService.createTouristAccount(
          fullName,
          formData.customer_email,
          formData.customer_whatsapp,
          formData.customer_phone
        )

        if (!accountResult.success) {
          throw new Error(accountResult.error)
        }

        // NEW: Store account result for success screen
        setAccountResult(accountResult)

        // ✅ STEP 2: Create booking with account linkage (existing logic)
        const totalParticipants = formData.num_adults + formData.num_children
        const subtotal = (formData.num_adults * tour.discount_price_adult) + 
                        (formData.num_children * (tour.discount_price_child || 0))

      const bookingData = {
        tour_id: tour.id,
        operator_id: tour.operator_id,
        tourist_user_id: accountResult.tourist_user_id,
        customer_name: fullName, // Use combined name for backward compatibility
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

    // Success Screen (Step 3) - Enhanced Version
    if (step === 3 && bookingResult) {
      return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header with Success Icon */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">
                  Booking Requested! 🎉
                </h2>
                
                <p className="text-slate-300">
                  Your adventure request is on its way to the operator!
                </p>
              </div>

              {/* 🆕 STATUS PROGRESSION BAR */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">BOOKING PROGRESS</span>
                </div>
                
                <div className="flex items-center justify-between relative">
                  {/* Progress Line */}
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-600"></div>
                  <div className="absolute top-4 left-4 h-0.5 bg-blue-500 transition-all duration-500" style={{width: '0%'}}></div>
                  
                  {/* Status Steps */}
                  <div className="flex items-center justify-between w-full relative z-10">
                    {/* Step 1: Requested (Current) */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center mb-2">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-medium text-blue-400">Requested</span>
                    </div>
                    
                    {/* Step 2: Confirmed */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-600 border-2 border-slate-500 flex items-center justify-center mb-2">
                        <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                      </div>
                      <span className="text-xs font-medium text-slate-400">Confirmed!</span>
                    </div>
                    
                    {/* Step 3: Complete */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-600 border-2 border-slate-500 flex items-center justify-center mb-2">
                        <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                      </div>
                      <span className="text-xs font-medium text-slate-400">Complete</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Creation Success Info */}
              {accountResult && !accountResult.existing_user && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Account Created!
                  </h4>
                  <div className="text-sm text-blue-300 space-y-1">
                    <div>Email: <span className="text-white font-mono">{formData.customer_email}</span></div>
                    <div>Password: <span className="text-white font-mono">{accountResult.temp_password}</span></div>
                    <div className="text-blue-200 text-xs mt-2">
                      💡 Check your email to activate your account. Use the password above to sign in.
                    </div>
                  </div>
                </div>
              )}

              {/* Existing User Info */}
              {accountResult && accountResult.existing_user && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Account Linked!
                  </h4>
                  <div className="text-sm text-green-300">
                    This booking has been added to your existing VAI account.
                  </div>
                </div>
              )}
              
              {/* Booking Details */}
              <div className="bg-slate-700 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Booking Details
                </h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span>Reference:</span>
                    <span className="text-white font-mono">{bookingResult.booking_reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tour:</span>
                    <span className="text-white">{tour.tour_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="text-white">{formatDate(tour.tour_date)} {formatTime(tour.time_slot)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Participants:</span>
                    <span className="text-white">{formData.num_adults + formData.num_children}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span className="text-white">{formatPrice(bookingResult.total_amount || (bookingResult.subtotal + bookingResult.commission_amount))}</span>
                  </div>
                </div>
              </div>
              
              {/* 🆕 ENHANCED WHAT'S NEXT SECTION */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  What's Next?
                </h4>
                <div className="text-sm text-slate-300 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div>
                      <div className="text-white font-medium">Operator Review</div>
                      <div className="text-slate-400 text-xs">Operators will answer as soon as possible. Keep an eye on your mails/check this app!</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-slate-400 text-xs font-bold">2</span>
                    </div>
                    <div>
                      <div className="text-slate-400 font-medium">Confirmation & Chat</div>
                      <div className="text-slate-500 text-xs">Messages tab will unlock after confirmation</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-slate-400 text-xs font-bold">3</span>
                    </div>
                    <div>
                      <div className="text-slate-400 font-medium">Ready for your Adventure</div>
                      <div className="text-slate-500 text-xs">Once you have all info, it's time to enjoy! 🌴</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 🆕 ACTION BUTTONS */}
              <div className="space-y-3">
                {/* Primary Action: Track Your Booking */}
                <button
                  onClick={() => {
                    onClose() // Close modal
                    setActiveTab('journey') // Switch to journey tab
                    // Note: You'll need to add logic to focus on 'urgent' stage in JourneyTab
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Track Your Booking
                </button>
                
                {/* Secondary Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    Close
                  </button>
                  <a
                    href={`https://wa.me/68987269065?text=Hi! I just booked ${tour.tour_name} (${bookingResult.booking_reference}). When will you confirm?`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-center text-sm flex items-center justify-center gap-1"
                  >
                    <MessageCircle className="w-3 h-3" />
                    WhatsApp
                  </a>
                </div>
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


              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customer_first_name}
                    onChange={(e) => handleInputChange('customer_first_name', e.target.value)}
                    className={`w-full p-3 bg-slate-700 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 ${
                      errors.customer_first_name ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="First name"
                  />
                  {errors.customer_first_name && (
                    <p className="text-red-400 text-sm mt-1">{errors.customer_first_name}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customer_last_name}
                    onChange={(e) => handleInputChange('customer_last_name', e.target.value)}
                    className={`w-full p-3 bg-slate-700 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 ${
                      errors.customer_last_name ? 'border-red-500' : 'border-slate-600'
                    }`}
                    placeholder="Last name"
                  />
                  {errors.customer_last_name && (
                    <p className="text-red-400 text-sm mt-1">{errors.customer_last_name}</p>
                  )}
                </div>
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