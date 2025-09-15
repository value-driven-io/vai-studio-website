// bookingValidationService.js - Real-Time Booking Deadline Validation
import { supabase } from '../lib/supabase'

// Polynesian timezone constant
const POLYNESIA_TZ = 'Pacific/Tahiti' // UTC-10

// Standardized response structure
const createErrorResponse = (code, message, details = null) => ({
  success: false,
  error: {
    code,
    message,
    details,
    timestamp: new Date().toISOString()
  }
})

const createSuccessResponse = (data, message = null) => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString()
})

export const bookingValidationService = {
  /**
   * Real-time validation of booking availability and deadline
   * @param {string} tourId - Tour ID to book
   * @param {number} adultCount - Number of adult tickets
   * @param {number} childCount - Number of child tickets
   * @returns {Promise<Object>} Validation result with detailed information
   */
  async validateBookingAvailability(tourId, adultCount = 1, childCount = 0) {
    try {
      console.log('🔍 Real-time booking validation for tour:', tourId)

      // Get comprehensive tour information
      const { data: tour, error: tourError } = await supabase
        .from('tours')
        .select(`
          id,
          tour_name,
          tour_date,
          time_slot,
          status,
          max_capacity,
          available_spots,
          auto_close_hours,
          booking_deadline,
          original_price_adult,
          discount_price_adult,
          discount_price_child,
          promo_discount_percent,
          promo_discount_value,
          is_customized,
          parent_template_id,
          parent_schedule_id,
          operator_id,
          weather_dependent,
          special_notes,
          instance_note
        `)
        .eq('id', tourId)
        .single()

      if (tourError) {
        if (tourError.code === 'PGRST116') {
          return createErrorResponse('TOUR_NOT_FOUND', 'The requested tour could not be found')
        }
        return createErrorResponse('TOUR_FETCH_FAILED', tourError.message, tourError)
      }

      // Comprehensive validation checks
      const validationResults = {
        tour,
        validationChecks: {},
        canBook: false,
        pricing: {},
        warnings: [],
        errors: []
      }

      // Check 1: Tour Status
      const statusCheck = this.validateTourStatus(tour)
      validationResults.validationChecks.status = statusCheck
      if (!statusCheck.valid) {
        validationResults.errors.push(statusCheck.message)
      }

      // Check 2: Capacity Availability
      const capacityCheck = this.validateCapacity(tour, adultCount, childCount)
      validationResults.validationChecks.capacity = capacityCheck
      if (!capacityCheck.valid) {
        validationResults.errors.push(capacityCheck.message)
      }

      // Check 3: Booking Deadline (CRITICAL - Real-time validation)
      const deadlineCheck = await this.validateBookingDeadline(tour)
      validationResults.validationChecks.deadline = deadlineCheck
      if (!deadlineCheck.valid) {
        validationResults.errors.push(deadlineCheck.message)
      }

      // Check 4: Date Validity (not in the past)
      const dateCheck = this.validateTourDate(tour)
      validationResults.validationChecks.date = dateCheck
      if (!dateCheck.valid) {
        validationResults.errors.push(dateCheck.message)
      }

      // Check 5: Operator Status
      const operatorCheck = await this.validateOperatorStatus(tour.operator_id)
      validationResults.validationChecks.operator = operatorCheck
      if (!operatorCheck.valid) {
        validationResults.errors.push(operatorCheck.message)
      }

      // Calculate pricing with all discounts
      validationResults.pricing = this.calculateBookingPricing(tour, adultCount, childCount)

      // Add warnings for weather-dependent activities
      if (tour.weather_dependent) {
        validationResults.warnings.push('This activity is weather dependent and may be cancelled due to conditions')
      }

      // Add instance notes as information
      if (tour.instance_note) {
        validationResults.warnings.push(tour.instance_note)
      }

      // Determine if booking can proceed
      validationResults.canBook = validationResults.errors.length === 0

      // Generate user-friendly messages
      if (validationResults.canBook) {
        return createSuccessResponse(validationResults, 'Tour is available for booking')
      } else {
        return createErrorResponse(
          'BOOKING_NOT_AVAILABLE',
          'This tour is not currently available for booking',
          validationResults
        )
      }

    } catch (error) {
      console.error('Error in validateBookingAvailability:', error)
      return createErrorResponse('VALIDATION_ERROR', error.message, error)
    }
  },

  /**
   * Validate tour status
   * @param {Object} tour - Tour data
   * @returns {Object} Status validation result
   */
  validateTourStatus(tour) {
    const validStatuses = ['active']
    
    if (!validStatuses.includes(tour.status)) {
      return {
        valid: false,
        message: this.getStatusMessage(tour.status),
        code: `TOUR_STATUS_${tour.status.toUpperCase()}`
      }
    }

    return {
      valid: true,
      message: 'Tour is active and available',
      code: 'TOUR_STATUS_ACTIVE'
    }
  },

  /**
   * Validate capacity availability
   * @param {Object} tour - Tour data
   * @param {number} adultCount - Adult tickets requested
   * @param {number} childCount - Child tickets requested
   * @returns {Object} Capacity validation result
   */
  validateCapacity(tour, adultCount, childCount) {
    const totalRequested = adultCount + childCount
    const availableSpots = tour.available_spots || 0

    if (totalRequested <= 0) {
      return {
        valid: false,
        message: 'At least one ticket must be selected',
        code: 'INVALID_TICKET_COUNT'
      }
    }

    if (totalRequested > availableSpots) {
      return {
        valid: false,
        message: `Only ${availableSpots} spot${availableSpots !== 1 ? 's' : ''} available, you requested ${totalRequested}`,
        code: 'INSUFFICIENT_CAPACITY',
        details: {
          requested: totalRequested,
          available: availableSpots,
          maxCapacity: tour.max_capacity
        }
      }
    }

    return {
      valid: true,
      message: `${availableSpots} spots available`,
      code: 'CAPACITY_AVAILABLE',
      details: {
        requested: totalRequested,
        available: availableSpots,
        remaining: availableSpots - totalRequested
      }
    }
  },

  /**
   * Real-time booking deadline validation (CRITICAL FEATURE)
   * @param {Object} tour - Tour data
   * @returns {Promise<Object>} Deadline validation result
   */
  async validateBookingDeadline(tour) {
    try {
      const now = new Date()
      const tourDate = new Date(tour.tour_date + 'T' + tour.time_slot)
      
      // Use tour-specific auto_close_hours or default to 2 hours
      const autoCloseHours = tour.auto_close_hours || 2
      
      // Calculate booking deadline = tour time - auto_close_hours
      const bookingDeadline = new Date(tourDate.getTime() - (autoCloseHours * 60 * 60 * 1000))

      const isPastDeadline = now >= bookingDeadline
      const timeUntilDeadline = bookingDeadline.getTime() - now.getTime()
      const hoursUntilDeadline = Math.max(0, Math.floor(timeUntilDeadline / (1000 * 60 * 60)))
      const minutesUntilDeadline = Math.max(0, Math.floor((timeUntilDeadline % (1000 * 60 * 60)) / (1000 * 60)))

      console.log('⏰ Booking deadline check:', {
        tourDate: tourDate.toISOString(),
        currentTime: now.toISOString(),
        bookingDeadline: bookingDeadline.toISOString(),
        autoCloseHours,
        isPastDeadline,
        hoursUntilDeadline,
        minutesUntilDeadline
      })

      if (isPastDeadline) {
        return {
          valid: false,
          message: `Booking deadline has passed. This tour closes for booking ${autoCloseHours} hours before start time.`,
          code: 'BOOKING_DEADLINE_PASSED',
          details: {
            deadlineTime: bookingDeadline.toISOString(),
            tourTime: tourDate.toISOString(),
            autoCloseHours,
            deadlinePassed: true
          }
        }
      }

      // Warning if deadline is approaching (within 2 hours)
      const urgentThreshold = 2 * 60 * 60 * 1000 // 2 hours in milliseconds
      const isUrgent = timeUntilDeadline <= urgentThreshold

      return {
        valid: true,
        message: isUrgent 
          ? `⚠️ Booking closes in ${hoursUntilDeadline}h ${minutesUntilDeadline}m` 
          : `Booking closes ${hoursUntilDeadline}h ${minutesUntilDeadline}m before tour time`,
        code: isUrgent ? 'DEADLINE_APPROACHING' : 'DEADLINE_OK',
        details: {
          deadlineTime: bookingDeadline.toISOString(),
          tourTime: tourDate.toISOString(),
          autoCloseHours,
          hoursUntilDeadline,
          minutesUntilDeadline,
          isUrgent,
          deadlinePassed: false
        }
      }

    } catch (error) {
      console.error('Error in deadline validation:', error)
      return {
        valid: false,
        message: 'Could not validate booking deadline',
        code: 'DEADLINE_CHECK_ERROR',
        details: error
      }
    }
  },

  /**
   * Validate tour date (not in the past)
   * @param {Object} tour - Tour data
   * @returns {Object} Date validation result
   */
  validateTourDate(tour) {
    const now = new Date()
    const tourDateTime = new Date(tour.tour_date + 'T' + tour.time_slot)

    if (tourDateTime <= now) {
      return {
        valid: false,
        message: 'This tour has already started or finished',
        code: 'TOUR_IN_PAST'
      }
    }

    return {
      valid: true,
      message: 'Tour is scheduled for the future',
      code: 'TOUR_DATE_VALID'
    }
  },

  /**
   * Validate operator status
   * @param {string} operatorId - Operator ID
   * @returns {Promise<Object>} Operator validation result
   */
  async validateOperatorStatus(operatorId) {
    try {
      const { data: operator, error } = await supabase
        .from('operators')
        .select('id, status, business_name')
        .eq('id', operatorId)
        .single()

      if (error || !operator) {
        return {
          valid: false,
          message: 'Tour operator information not available',
          code: 'OPERATOR_NOT_FOUND'
        }
      }

      if (operator.status !== 'active') {
        return {
          valid: false,
          message: 'This tour operator is currently not available for bookings',
          code: 'OPERATOR_INACTIVE'
        }
      }

      return {
        valid: true,
        message: 'Tour operator is active',
        code: 'OPERATOR_ACTIVE'
      }

    } catch (error) {
      console.error('Error validating operator:', error)
      return {
        valid: false,
        message: 'Could not verify tour operator status',
        code: 'OPERATOR_CHECK_ERROR'
      }
    }
  },

  /**
   * Calculate comprehensive booking pricing
   * @param {Object} tour - Tour data
   * @param {number} adultCount - Adult tickets
   * @param {number} childCount - Child tickets
   * @returns {Object} Pricing breakdown
   */
  calculateBookingPricing(tour, adultCount, childCount) {
    const baseAdultPrice = tour.discount_price_adult || tour.original_price_adult || 0
    const baseChildPrice = tour.discount_price_child || 0

    let effectiveAdultPrice = baseAdultPrice
    let effectiveChildPrice = baseChildPrice

    // Apply promotional discounts if available
    let promoDiscount = 0
    let promoType = 'none'

    if (tour.promo_discount_percent && tour.promo_discount_percent > 0) {
      promoDiscount = Math.round(baseAdultPrice * (tour.promo_discount_percent / 100))
      effectiveAdultPrice = baseAdultPrice - promoDiscount
      promoType = 'percentage'
    } else if (tour.promo_discount_value && tour.promo_discount_value > 0) {
      promoDiscount = tour.promo_discount_value
      effectiveAdultPrice = Math.max(0, baseAdultPrice - promoDiscount)
      promoType = 'fixed'
    }

    const adultSubtotal = effectiveAdultPrice * adultCount
    const childSubtotal = effectiveChildPrice * childCount
    const totalAmount = adultSubtotal + childSubtotal

    return {
      breakdown: {
        adult: {
          basePrice: baseAdultPrice,
          effectivePrice: effectiveAdultPrice,
          quantity: adultCount,
          subtotal: adultSubtotal
        },
        child: {
          basePrice: baseChildPrice,
          effectivePrice: effectiveChildPrice,
          quantity: childCount,
          subtotal: childSubtotal
        }
      },
      promoDiscount: {
        type: promoType,
        amount: promoDiscount,
        percentage: tour.promo_discount_percent || 0,
        fixedValue: tour.promo_discount_value || 0
      },
      total: {
        beforeDiscount: (baseAdultPrice * adultCount) + (baseChildPrice * childCount),
        afterDiscount: totalAmount,
        savings: ((baseAdultPrice * adultCount) + (baseChildPrice * childCount)) - totalAmount
      },
      currency: 'XPF' // Polynesian Francs
    }
  },

  /**
   * Get user-friendly status message
   * @param {string} status - Tour status
   * @returns {string} User-friendly message
   */
  getStatusMessage(status) {
    const messages = {
      'sold_out': 'This tour is sold out',
      'cancelled': 'This tour has been cancelled',
      'completed': 'This tour has already taken place',
      'inactive': 'This tour is currently not available',
      'draft': 'This tour is not yet published'
    }
    
    return messages[status] || `This tour is not available (status: ${status})`
  },

  /**
   * Continuous booking availability monitor (for real-time updates)
   * @param {string} tourId - Tour ID to monitor
   * @param {Function} callback - Callback function for updates
   * @returns {Function} Cleanup function to stop monitoring
   */
  startBookingMonitor(tourId, callback) {
    console.log('🔄 Starting real-time booking monitor for tour:', tourId)

    // Monitor tour changes (capacity updates, status changes)
    const tourSubscription = supabase
      .channel(`tour-${tourId}`)
      .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'tours', filter: `id=eq.${tourId}` },
          (payload) => {
            console.log('📡 Tour updated, re-validating availability:', payload.new)
            this.validateBookingAvailability(tourId, 1, 0).then(callback)
          })
      .subscribe()

    // Monitor new bookings that might affect availability
    const bookingsSubscription = supabase
      .channel(`tour-bookings-${tourId}`)
      .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'bookings', filter: `tour_id=eq.${tourId}` },
          (payload) => {
            console.log('📡 New booking detected, re-validating availability:', payload.new)
            this.validateBookingAvailability(tourId, 1, 0).then(callback)
          })
      .subscribe()

    // Return cleanup function
    return () => {
      console.log('🛑 Stopping booking monitor for tour:', tourId)
      tourSubscription.unsubscribe()
      bookingsSubscription.unsubscribe()
    }
  },

  /**
   * Quick deadline check (lightweight version for frequent polling)
   * @param {string} tourId - Tour ID
   * @returns {Promise<Object>} Quick deadline check result
   */
  async quickDeadlineCheck(tourId) {
    try {
      const { data: tour, error } = await supabase
        .from('tours')
        .select('tour_date, time_slot, auto_close_hours')
        .eq('id', tourId)
        .single()

      if (error || !tour) {
        return createErrorResponse('TOUR_NOT_FOUND', 'Tour not found for deadline check')
      }

      const deadlineCheck = await this.validateBookingDeadline(tour)
      
      return createSuccessResponse({
        tourId,
        deadlineValid: deadlineCheck.valid,
        message: deadlineCheck.message,
        details: deadlineCheck.details
      })

    } catch (error) {
      return createErrorResponse('QUICK_CHECK_ERROR', error.message)
    }
  }
}

export default bookingValidationService