// src/components/booking/BookingModal.jsx
import React, { useState } from 'react'
import { X, Clock, MapPin, Users, Star, Phone, ChevronDown, ChevronUp, CheckCircle, Calendar, MessageCircle, CreditCard, Timer, DollarSign, Shield, Info, Award, Accessibility, Euro } from 'lucide-react'
import { bookingService } from '../../services/supabase'
import { supabase } from '../../services/supabase'
import { useAppStore } from '../../stores/bookingStore'
import { authService } from '../../services/authService'
import { TOUR_TYPE_EMOJIS } from '../../constants/moods'
import { formatPrice, formatDate, formatTime } from '../../lib/utils'
import toast from 'react-hot-toast'
import { BookingPriceBreakdown } from '../shared/PriceDisplay'
import { useCurrencyContext } from '../../hooks/useCurrency'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import StripePaymentForm from './StripePaymentForm'
import { CompactPriceDisplay } from '../shared/PriceDisplay'

import { useTranslation } from 'react-i18next'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const BookingModal = ({ tour, isOpen, onClose }) => {
  // translation hook
  const { t } = useTranslation()
  
  const { addBooking, updateUserProfile, setActiveTab, setJourneyStage } = useAppStore()
  const [step, setStep] = useState(1) // 1: Quick Form, 2: Optional Details, 3: Success
  const [showOptional, setShowOptional] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bookingResult, setBookingResult] = useState(null)
  const [accountResult, setAccountResult] = useState(null)
  // State to handle payment step
  const [bookingData, setBookingData] = useState(null)
  const [showPaymentStep, setShowPaymentStep] = useState(false)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState(null)

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

  const { selectedCurrency, changeCurrency } = useCurrencyContext()

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
      newErrors.customer_first_name = t('validation.firstNameRequired')
    }
    
    if (!formData.customer_last_name.trim()) {
      newErrors.customer_last_name = t('validation.lastNameRequired')
    }
    
    if (!formData.customer_whatsapp.trim()) {
      newErrors.customer_whatsapp = t('validation.whatsappRequired')
    } else if (!/^\+?[\d\s\-\(\)]{8,}$/.test(formData.customer_whatsapp)) {
      newErrors.customer_whatsapp = t('validation.whatsappInvalid')
    }

    // Email validation (required)
    if (!formData.customer_email.trim()) {
      newErrors.customer_email = t('validation.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = t('validation.emailInvalid')
    }

    // Phone validation (optional but must be valid if provided)
    if (formData.customer_phone && !/^\+?[\d\s\-\(\)]{8,}$/.test(formData.customer_phone)) {
      newErrors.customer_phone = t('validation.phoneInvalid')
    }
    
    if (formData.num_adults < 1) {
      newErrors.num_adults = t('validation.adultsRequired')
    }
    
    const totalParticipants = formData.num_adults + formData.num_children
    if (totalParticipants > tour.available_spots) {
      newErrors.num_adults = t('validation.spotsExceeded', { count: tour.available_spots })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  //  BOOKING LOGIC
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

        // ✅ STEP 2: Prepare booking data and proceed to payment
        const totalParticipants = formData.num_adults + formData.num_children
        const subtotal = (formData.num_adults * tour.discount_price_adult) + 
                        (formData.num_children * (tour.discount_price_child || 0))


        // Get operator_id - if missing from tour object, fetch from database
        let operatorId = tour.operator_id

        if (!operatorId) {
          console.log('⚠️ operator_id missing from tour, fetching from database...')

          // Try tours table first (for traditional tours)
          let { data: tourData, error: tourError } = await supabase
            .from('tours')
            .select('operator_id')
            .eq('id', tour.id)
            .single()

          if (tourData && !tourError) {
            operatorId = tourData.operator_id
            console.log('✅ Fetched operator_id from tours table:', operatorId)
          } else {
            // If not found in tours table, try active_tours_with_operators (for template instances)
            console.log('⚠️ Tour not found in tours table, trying active_tours_with_operators...')

            const { data: instanceData, error: instanceError } = await supabase
              .from('active_tours_with_operators')
              .select('operator_id')
              .eq('id', tour.id)
              .single()

            if (instanceData && !instanceError) {
              operatorId = instanceData.operator_id
              console.log('✅ Fetched operator_id from active_tours_with_operators:', operatorId)
            } else {
              console.error('❌ Failed to fetch operator_id from both tables:', { tourError, instanceError })
              toast.error(t('toastNotifications.operatorInfoFailed'))
              return
            }
          }
        }

        if (!operatorId) {
          toast.error(t('toastNotifications.operatorInfoMissing'))
          return
        }

        // Generate temporary booking reference for payment step
        const now = Date.now()
        const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '')
        const tempBookingReference = `VAI-${now}-${dateStr}`

        // Store booking data for payment step (don't create booking yet)
        const preparedBookingData = {
          tour_id: tour.id,
          operator_id: operatorId,
          tourist_user_id: accountResult.tourist_user_id,
          customer_name: fullName,
          customer_whatsapp: formData.customer_whatsapp,
          customer_email: formData.customer_email?.trim() || '',
          customer_phone: formData.customer_phone?.trim() || '',
          num_adults: formData.num_adults,
          num_children: formData.num_children,
          adult_price: tour.discount_price_adult,
          child_price: tour.discount_price_child || 0,
          subtotal: subtotal,
          special_requirements: formData.special_requirements?.trim() || '',
          dietary_restrictions: formData.dietary_restrictions?.trim() || '',
          accessibility_needs: formData.accessibility_needs?.trim() || '',
          booking_reference: tempBookingReference,
          customer_first_name: formData.customer_first_name.trim(),
          customer_last_name: formData.customer_last_name.trim(),
          tour_name: tour.tour_name
        }

        // Store for payment step
        setBookingData(preparedBookingData)
        setShowPaymentStep(true)
      
    } catch (error) {
      console.error('Booking error:', error)
      toast.error(t('booking.bookingError'))
    } finally {
      setLoading(false)
    }
  }

  //  Payment Functions
  const handlePaymentSuccess = async (paymentData) => {
    setLoading(true)
    
    try {
      // Use the stored booking data and add Connect payment info
      // Remove fields that don't exist in bookings table schema
      const { 
        tour_name, 
        customer_first_name, 
        customer_last_name, 
        ...bookingDataForDB 
      } = bookingData
      
      const finalBookingData = {
        ...bookingDataForDB,
        payment_intent_id: paymentData.payment_intent_id,
        payment_status: 'authorized',
        operator_amount_cents: paymentData.operator_amount_cents || null,
        platform_fee_cents: paymentData.platform_fee_cents || null
        // Note: commission_rate is calculated in booking service from operator data
      }

      // Create booking (your existing logic)
      const result = await bookingService.createBooking(finalBookingData)
      
      // Update with payment intent ID AND payment status
      await supabase
        .from('bookings')
        .update({ 
          payment_intent_id: paymentData.payment_intent_id,
          payment_status: 'authorized'
        })
        .eq('id', result.id)

      // Your existing success logic
      setBookingResult(result)
      addBooking(result)
      setStep(3)
      
      toast.success(t('booking.bookingSuccess'))
    } catch (error) {
      console.error('Booking creation error:', error)
      toast.error(t('booking.bookingError'))
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentError = (errorMessage) => {
    toast.error(errorMessage)
    setShowPaymentStep(false) // Go back to form
  }

  const calculatePricing = () => {
    const adultTotal = formData.num_adults * tour.discount_price_adult
    const childTotal = formData.num_children * (tour.discount_price_child || 0)
    const total = adultTotal + childTotal  // Clean total for tourist
    
    return { total, adultTotal, childTotal }
  }

  const pricing = calculatePricing()

    // SUCCESS SCREEN - PAYMENT FLOW VERSION
    if (step === 3 && bookingResult) {
      // 🆕 Determine if this is a payment booking or old flow booking
      const hasPaymentData = !!bookingResult.payment_intent_id // NEW FLOW if Stripe payment exists

      
      return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 pb-20 sm:pb-4">
          <div className="bg-ui-surface-secondary rounded-none sm:rounded-2xl max-w-md w-full border-0 sm:border border-ui-border-primary h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6">
              {/* Header with Success Icon */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-status-success rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-ui-text-primary" />
                </div>
                
                <h2 className="text-2xl font-bold text-ui-text-primary mb-2">
                  {hasPaymentData ? t('payment.paymentAuthorizedSuccess') : t('success.bookingRequested')}
                </h2>
                
                <p className="text-ui-text-muted">
                  {hasPaymentData 
                    ? t('payment.awaitingConfirmation')
                    : t('success.adventureRequest')
                  }
                </p>
              </div>

              {/* 🆕 ENHANCED STATUS PROGRESSION BAR - NEW FLOW */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-ui-text-secondary">{t('success.bookingProgress')}</span>
                </div>
                
                <div className="flex items-center justify-between relative">
                  {/* Progress Line */}
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-ui-surface-tertiary"></div>
                  <div className="absolute top-4 left-4 h-0.5 bg-interactive-primary transition-all duration-500" 
                      style={{width: hasPaymentData ? '25%' : '0%'}}></div>
                  
                  {/* Status Steps - 4 STEP PROGRESSION FOR NEW FLOW */}
                  <div className="flex items-center justify-between w-full relative z-10">
                    {/* Step 1: Payment Secured / Requested (Current) */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-interactive-primary border-2 border-white flex items-center justify-center mb-2">
                        {hasPaymentData ? (
                          <CreditCard className="w-4 h-4 text-ui-text-primary" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-ui-text-primary" />
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-interactive-primary-light text-xs font-medium">
                          {hasPaymentData ? t('success.paymentSecured') : t('success.requested')}
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Operator Review */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-ui-surface-tertiary border-2 border-white flex items-center justify-center mb-2">
                        <Timer className="w-4 h-4 text-ui-text-secondary" />
                      </div>
                      <div className="text-center">
                        <div className="text-ui-text-secondary text-xs font-medium">{t('success.operatorReview')}</div>
                      </div>
                    </div>

                    {/* Step 3: Payment Captured / Confirmed */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-ui-surface-tertiary border-2 border-white flex items-center justify-center mb-2">
                        {hasPaymentData ? (
                          <DollarSign className="w-4 h-4 text-ui-text-secondary" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-ui-text-secondary" />
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-ui-text-secondary text-xs font-medium">
                          {hasPaymentData ? t('success.paymentCaptured') : t('success.confirmed')}
                        </div>
                      </div>
                    </div>
                    
                    {/* Step 4: Ready for Adventure */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-ui-surface-tertiary border-2 border-white flex items-center justify-center mb-2">
                        <Award className="w-4 h-4 text-ui-text-secondary" />
                      </div>
                      <div className="text-center">
                        <div className="text-ui-text-secondary text-xs font-medium">{t('success.readyAdventure')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 🆕 PAYMENT PROTECTION NOTICE - NEW FLOW ONLY */}
              {hasPaymentData && (
                <div className="mb-6 bg-interactive-primary-light/10 border border-interactive-primary-light/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-interactive-primary-light mt-0.5 flex-shrink-0" />
                    <div className="space-y-2 text-sm">
                      <p className="text-interactive-primary-light font-medium">{t('payment.noChargeUntilConfirmed')}</p>
                      <p className="text-interactive-primary-light">{t('payment.automaticRefund')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Details */}
              <div className="bg-ui-surface-primary/30 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-ui-text-primary mb-3">{t('success.bookingDetails')}</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ui-text-secondary">{t('success.reference')}</span>
                    <span className="text-ui-text-primary font-mono">{bookingResult.booking_reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ui-text-secondary">{t('success.activity')}</span>
                    <span className="text-ui-text-primary">{tour.tour_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ui-text-secondary">{t('success.date')}</span>
                    <span className="text-ui-text-primary">{formatDate(tour.tour_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ui-text-secondary">{t('success.participants')}</span>
                    <span className="text-ui-text-primary">{formData.num_adults + formData.num_children}</span>
                  </div>
                  <div className="flex justify-between border-t border-ui-border-secondary pt-2">
                    <span className="text-ui-text-secondary">{t('success.total')}</span>
                    <div className="text-right">
                      <span className="text-ui-text-primary font-semibold">{formatPrice(bookingResult.total_amount || bookingResult.subtotal || pricing.total)}</span>
                      {hasPaymentData && (
                        <div className="text-xs text-ui-text-secondary mt-1">
                          <CompactPriceDisplay 
                            xpfAmount={bookingResult.total_amount || bookingResult.subtotal || pricing.total}
                            selectedCurrency="USD"
                            showCurrency={false}
                          /> {t('bookingDetails.chargedUSD')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 🆕 Payment Status - NEW FLOW ONLY */}
                  {hasPaymentData && (
                    <div className="flex justify-between">
                      <span className="text-ui-text-secondary">{t('bookingDetails.paymentStatus')}</span>
                      <span className="text-status-success-light">{t('status.paymentAuthorized')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 🆕 WHAT'S NEXT SECTION - UPDATED FOR NEW FLOW */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-ui-text-primary mb-4">{t('success.whatsNext')}</h3>
                
                <div className="space-y-4">
                  {hasPaymentData ? (
                    // NEW FLOW What's Next
                    <>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-interactive-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-ui-text-primary text-xs font-bold">1</span>
                        </div>
                        <div>
                          <div className="text-interactive-primary-light font-medium">{t('success.paymentProtection')}</div>
                          <div className="text-ui-text-disabled text-xs">{t('success.paymentProtectionDesc')}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-status-caution flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-ui-text-primary text-xs font-bold">2</span>
                        </div>
                        <div>
                          <div className="text-status-caution font-medium">{t('success.operatorDecision')}</div>
                          <div className="text-ui-text-disabled text-xs">{t('success.operatorDecisionDesc')}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-ui-surface-tertiary flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-ui-text-secondary text-xs font-bold">3</span>
                        </div>
                        <div>
                          <div className="text-ui-text-secondary font-medium">{t('success.confirmationNotification')}</div>
                          <div className="text-ui-text-disabled text-xs">{t('success.confirmationNotificationDesc')}</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    // OLD FLOW What's Next (fallback)
                    <>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-status-caution flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-ui-text-primary text-xs font-bold">1</span>
                        </div>
                        <div>
                          <div className="text-status-caution font-medium">{t('success.operatorReview')}</div>
                          <div className="text-ui-text-disabled text-xs">{t('success.operatorReviewDesc')}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-ui-surface-tertiary flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-ui-text-secondary text-xs font-bold">2</span>
                        </div>
                        <div>
                          <div className="text-ui-text-secondary font-medium">{t('success.confirmationChat')}</div>
                          <div className="text-ui-text-disabled text-xs">{t('success.confirmationChatDesc')}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-ui-surface-tertiary flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-ui-text-secondary text-xs font-bold">3</span>
                        </div>
                        <div>
                          <div className="text-ui-text-secondary font-medium">{t('success.readyAdventure')}</div>
                          <div className="text-ui-text-disabled text-xs">{t('success.readyAdventureDesc')}</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 🆕 ACTION BUTTONS */}
              <div className="space-y-3">
                {/* Primary Action: Track Your Booking */}
                <button
                  onClick={() => {
                    onClose() // Close modal
                    setJourneyStage('active') // Set to show active booking view
                    setActiveTab('journey') // Switch to journey tab
                  }}
                  className="w-full bg-interactive-primary hover:bg-interactive-primary-hover text-ui-text-primary font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  {t('buttons.trackBooking')}
                </button>
                
                {/* Secondary Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 bg-ui-surface-tertiary hover:bg-ui-surface-primary text-ui-text-primary py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    {t('buttons.close')}
                  </button>
                  
                  {/* Payment Details Button - NEW FLOW ONLY */}
                  {hasPaymentData && (
                    <button
                      onClick={() => {
                        // Could open payment details modal or navigate to payment view
                        toast.success(t('toastNotifications.paymentDetails', { paymentId: bookingResult.payment_intent_id }))
                      }}
                      className="flex-1 bg-status-success hover:bg-status-success text-ui-text-primary py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      {t('buttons.viewPaymentDetails')}
                    </button>
                  )}
                  
                  <a
                    href={`https://wa.me/68987269065?text=Hi! I just booked ${tour.tour_name} (${bookingResult.booking_reference}).${hasPaymentData ? ' Payment is secured.' : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-status-success hover:bg-status-success text-ui-text-primary py-2 px-4 rounded-lg transition-colors text-sm text-center"
                  >
                    {t('buttons.whatsapp')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

  // MAIN BOOKING FORM
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 pb-20 sm:pb-4">
      <div className="bg-ui-surface-secondary rounded-none sm:rounded-2xl max-w-lg w-full h-full sm:h-auto sm:max-h-[90vh] border-0 sm:border border-ui-border-primary flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-ui-surface-secondary p-6 border-b border-ui-border-primary flex items-center justify-between">
          <h2 className="text-xl font-bold text-ui-text-primary">{t('bookingModal.header')}</h2>
          <button
            onClick={onClose}
            className="p-2 text-ui-text-secondary hover:text-ui-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
        {/* Tour Summary */}
        <div className="p-6 border-b border-ui-border-primary">
          <div className="flex items-start gap-3">
            <div className="text-2xl">
              {TOUR_TYPE_EMOJIS[tour.tour_type] || '🌴'}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-ui-text-primary mb-1">{tour.tour_name}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-ui-text-muted">
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
                  {tour.available_spots === 1 
                    ? t('bookingModal.spotsLeft', { count: tour.available_spots })
                    : t('bookingModal.spotsLeftPlural', { count: tour.available_spots })
                  }
                </div>
                <div className="text-status-success-light font-medium">
                  {formatPrice(tour.discount_price_adult)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="p-6">

          {showPaymentStep ? (
            // Payment Step
            <Elements stripe={stripePromise}>
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-sm text-ui-text-secondary">
                  <button
                    onClick={() => setShowPaymentStep(false)}
                    className="text-interactive-primary-light hover:text-interactive-primary"
                  >
                    {t('paymentFlow.backToDetails')}
                  </button>
                  <span className="text-ui-text-secondary">→</span>
                  <span className="text-ui-text-primary">{t('paymentFlow.step2')}</span>
                </div>

                <StripePaymentForm
                  bookingData={bookingData}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                  isProcessing={paymentProcessing}
                  setIsProcessing={setPaymentProcessing}
                />
              </div>
            </Elements>
          ) : (
            <>
          {/* Quick Booking Section */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-ui-text-primary mb-4">
              {t('bookingModal.quickBooking')}
            </h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label htmlFor="customer_first_name" className="block text-sm font-medium text-ui-text-muted mb-1">
                    {t('form.firstName')}
                  </label>
                  <input
                    id="customer_first_name"
                    type="text"
                    value={formData.customer_first_name}
                    onChange={(e) => handleInputChange('customer_first_name', e.target.value)}
                    aria-required="true"
                    aria-describedby={errors.customer_first_name ? "firstName-error" : undefined}
                    className={`w-full p-3 bg-ui-surface-primary border rounded-lg text-ui-text-primary focus:ring-2 focus:ring-interactive-focus ${
                      errors.customer_first_name ? 'border-status-error' : 'border-ui-border-secondary'
                    }`}
                    placeholder={t('placeholders.firstName')}
                  />
                  {errors.customer_first_name && (
                    <p id="firstName-error" role="alert" className="text-status-error-light text-sm mt-1">{errors.customer_first_name}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="customer_last_name" className="block text-sm font-medium text-ui-text-muted mb-1">
                    {t('form.lastName')}
                  </label>
                  <input
                    id="customer_last_name"
                    type="text"
                    value={formData.customer_last_name}
                    onChange={(e) => handleInputChange('customer_last_name', e.target.value)}
                    aria-required="true"
                    aria-describedby={errors.customer_last_name ? "lastName-error" : undefined}
                    className={`w-full p-3 bg-ui-surface-primary border rounded-lg text-ui-text-primary focus:ring-2 focus:ring-interactive-focus ${
                      errors.customer_last_name ? 'border-status-error' : 'border-ui-border-secondary'
                    }`}
                    placeholder={t('placeholders.lastName')}
                  />
                  {errors.customer_last_name && (
                    <p id="lastName-error" role="alert" className="text-status-error-light text-sm mt-1">{errors.customer_last_name}</p>
                  )}
                </div>
              </div>

              {/* WhatsApp */}
              <div>
                <label htmlFor="customer_whatsapp" className="block text-sm font-medium text-ui-text-muted mb-1">
                  {t('form.whatsappNumber')}
                </label>
                <input
                  id="customer_whatsapp"
                  type="tel"
                  value={formData.customer_whatsapp}
                  onChange={(e) => handleInputChange('customer_whatsapp', e.target.value)}
                  aria-required="true"
                  aria-describedby={errors.customer_whatsapp ? "whatsapp-error" : undefined}
                  className={`w-full p-3 bg-ui-surface-primary border rounded-lg text-ui-text-primary focus:ring-2 focus:ring-interactive-focus ${
                    errors.customer_whatsapp ? 'border-status-error' : 'border-ui-border-secondary'
                  }`}
                  placeholder={t('placeholders.whatsapp')}
                />
                {errors.customer_whatsapp && (
                  <p id="whatsapp-error" role="alert" className="text-status-error-light text-sm mt-1">{errors.customer_whatsapp}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="customer_email" className="block text-sm font-medium text-ui-text-muted mb-1">
                  {t('form.emailAddress')}
                </label>
                <input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => handleInputChange('customer_email', e.target.value)}
                  aria-required="true"
                  aria-describedby={errors.customer_email ? "email-error" : undefined}
                  className={`w-full p-3 bg-ui-surface-primary border rounded-lg text-ui-text-primary focus:ring-2 focus:ring-interactive-focus ${
                    errors.customer_email ? 'border-status-error' : 'border-ui-border-secondary'
                  }`}
                  placeholder={t('placeholders.email')}
                />
                {errors.customer_email && (
                  <p id="email-error" role="alert" className="text-status-error-light text-sm mt-1">{errors.customer_email}</p>
                )}
                <p className="text-xs text-ui-text-secondary mt-1">For booking confirmations and updates</p>
              </div>

              {/* Participants */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="num_adults" className="block text-sm font-medium text-ui-text-muted mb-1">
                    {t('form.adults')}
                  </label>
                  <select
                    id="num_adults"
                    value={formData.num_adults}
                    onChange={(e) => handleInputChange('num_adults', parseInt(e.target.value))}
                    aria-required="true"
                    className="w-full p-3 bg-ui-surface-primary border border-ui-border-secondary rounded-lg text-ui-text-primary focus:ring-2 focus:ring-interactive-focus"
                  >
                    {Array.from({length: Math.min(tour.available_spots, 8)}, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="num_children" className="block text-sm font-medium text-ui-text-muted mb-1">
                    {t('form.children')}
                  </label>
                  <select
                    id="num_children"
                    value={formData.num_children}
                    onChange={(e) => handleInputChange('num_children', parseInt(e.target.value))}
                    className="w-full p-3 bg-ui-surface-primary border border-ui-border-secondary rounded-lg text-ui-text-primary focus:ring-2 focus:ring-interactive-focus"
                  >
                    {Array.from({length: Math.min(tour.available_spots, 6)}, (_, i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {errors.num_adults && (
                <p id="adults-error" role="alert" className="text-status-error-light text-sm">{errors.num_adults}</p>
              )}
            </div>
          </div>

          {/* Optional Details Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setShowOptional(!showOptional)}
              className="flex items-center justify-between w-full p-3 bg-ui-surface-primary hover:bg-ui-surface-tertiary rounded-lg transition-colors"
            >
              <span className="text-ui-text-primary font-medium">
                {t('bookingModal.optionalDetails')}
              </span>
              {showOptional ? (
                <ChevronUp className="w-5 h-5 text-ui-text-secondary" />
              ) : (
                <ChevronDown className="w-5 h-5 text-ui-text-secondary" />
              )}
            </button>

            {showOptional && (
              <div className="mt-4 space-y-4 p-4 bg-ui-surface-secondary rounded-lg">
                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-ui-text-muted mb-1">
                    {t('form.phoneNumber')}
                  </label>
                  <input
                    type="tel"
                    value={formData.customer_phone}
                    onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                    className={`w-full p-3 bg-ui-surface-primary border rounded-lg text-ui-text-primary focus:ring-2 focus:ring-interactive-focus ${
                      errors.customer_phone ? 'border-status-error' : 'border-ui-border-secondary'
                    }`}
                    placeholder={t('placeholders.phone')}
                  />
                  {errors.customer_phone && (
                    <p className="text-status-error-light text-sm mt-1">{errors.customer_phone}</p>
                  )}
                  <p className="text-xs text-ui-text-secondary mt-1">{t('placeholders.backupContact')}</p>
                </div>

                {/* Special Requirements */}
                <div>
                  <label className="block text-sm font-medium text-ui-text-muted mb-1">
                    {t('form.specialRequirements')}
                  </label>
                  <textarea
                    value={formData.special_requirements}
                    onChange={(e) => handleInputChange('special_requirements', e.target.value)}
                    rows={2}
                    className="w-full p-3 bg-ui-surface-primary border border-ui-border-secondary rounded-lg text-ui-text-primary focus:ring-2 focus:ring-interactive-focus"
                    placeholder={t('placeholders.specialRequests')}
                  />
                </div>

                {/* Dietary Restrictions */}
                <div>
                  <label className="block text-sm font-medium text-ui-text-muted mb-1">
                    {t('form.dietaryRestrictions')}
                  </label>
                  <input
                    type="text"
                    value={formData.dietary_restrictions}
                    onChange={(e) => handleInputChange('dietary_restrictions', e.target.value)}
                    className="w-full p-3 bg-ui-surface-primary border border-ui-border-secondary rounded-lg text-ui-text-primary focus:ring-2 focus:ring-interactive-focus"
                    placeholder={t('placeholders.dietary')}
                  />
                </div>

                {/* Accessibility */}
                <div>
                  <label className="block text-sm font-medium text-ui-text-muted mb-1">
                    {t('form.accessibilityNeeds')}
                  </label>
                  <input
                    type="text"
                    value={formData.accessibility_needs}
                    onChange={(e) => handleInputChange('accessibility_needs', e.target.value)}
                    className="w-full p-3 bg-ui-surface-primary border border-ui-border-secondary rounded-lg text-ui-text-primary focus:ring-2 focus:ring-interactive-focus"
                    placeholder={t('placeholders.accessibility')}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Pricing Summary  */}
          <div className="bg-ui-surface-secondary rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-ui-text-primary mb-3">{t('bookingModal.pricingSummary')}</h4>
            <div className="space-y-2 text-sm">
              {/* Multi-currency booking breakdown */}
              <BookingPriceBreakdown
                adultPrice={tour.discount_price_adult}
                childPrice={tour.discount_price_child || 0}
                numAdults={formData.num_adults}
                numChildren={formData.num_children}
                selectedCurrency={selectedCurrency}
                onCurrencyChange={changeCurrency}
                showCurrencySelector={false}
                className="space-y-2"
              />
              <p className="text-xs text-ui-text-secondary mt-2">
                {t('bookingModal.paymentNote')}
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleQuickBooking}
            disabled={loading}
            className="w-full bg-interactive-primary hover:bg-interactive-primary-hover disabled:bg-ui-surface-tertiary text-ui-text-primary font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('common.loading')}
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                {t('paymentFlow.proceedToPayment')}
              </>
            )}
          </button>

          <p className="text-xs text-ui-text-secondary text-center mt-3">
            {t('bookingModal.termsNote')}
          </p>
        </>
      )}
      </div> 
      </div> 
    </div> 
    </div>
  )
}

export default BookingModal