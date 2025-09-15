// useBookingValidation.js - React Hook for Real-Time Booking Validation
import { useState, useEffect, useCallback, useRef } from 'react'
import bookingValidationService from '../services/bookingValidationService'

/**
 * Custom hook for real-time booking validation
 * @param {string} tourId - Tour ID to validate
 * @param {Object} options - Hook options
 * @returns {Object} Validation state and methods
 */
export const useBookingValidation = (tourId, options = {}) => {
  const {
    adultCount = 1,
    childCount = 0,
    autoValidate = true,
    pollInterval = 30000, // 30 seconds
    enableRealTimeUpdates = true
  } = options

  // State management
  const [validation, setValidation] = useState({
    loading: true,
    canBook: false,
    tour: null,
    validationChecks: {},
    pricing: null,
    warnings: [],
    errors: [],
    lastValidated: null
  })

  const [deadlineStatus, setDeadlineStatus] = useState({
    valid: true,
    isUrgent: false,
    hoursUntilDeadline: null,
    minutesUntilDeadline: null,
    message: ''
  })

  // Refs for cleanup
  const pollIntervalRef = useRef(null)
  const realtimeCleanupRef = useRef(null)
  const validationTimeoutRef = useRef(null)

  /**
   * Perform booking validation
   */
  const validateBooking = useCallback(async (forceRefresh = false) => {
    if (!tourId) return

    // Avoid too frequent validations unless forced
    const now = Date.now()
    const lastValidated = validation.lastValidated
    const timeSinceLastValidation = lastValidated ? now - lastValidated : Infinity

    if (!forceRefresh && timeSinceLastValidation < 5000) {
      console.log('⏭️ Skipping validation - too recent')
      return
    }

    try {
      setValidation(prev => ({ ...prev, loading: true }))

      const result = await bookingValidationService.validateBookingAvailability(
        tourId,
        adultCount,
        childCount
      )

      if (result.success) {
        const { data } = result
        
        setValidation({
          loading: false,
          canBook: data.canBook,
          tour: data.tour,
          validationChecks: data.validationChecks,
          pricing: data.pricing,
          warnings: data.warnings,
          errors: data.errors,
          lastValidated: now
        })

        // Update deadline-specific state
        const deadlineCheck = data.validationChecks.deadline
        if (deadlineCheck) {
          setDeadlineStatus({
            valid: deadlineCheck.valid,
            isUrgent: deadlineCheck.code === 'DEADLINE_APPROACHING',
            hoursUntilDeadline: deadlineCheck.details?.hoursUntilDeadline || null,
            minutesUntilDeadline: deadlineCheck.details?.minutesUntilDeadline || null,
            message: deadlineCheck.message
          })
        }

      } else {
        setValidation({
          loading: false,
          canBook: false,
          tour: null,
          validationChecks: {},
          pricing: null,
          warnings: [],
          errors: [result.error.message],
          lastValidated: now
        })
      }

    } catch (error) {
      console.error('Validation error:', error)
      setValidation(prev => ({
        ...prev,
        loading: false,
        canBook: false,
        errors: [error.message || 'Validation failed'],
        lastValidated: now
      }))
    }
  }, [tourId, adultCount, childCount, validation.lastValidated])

  /**
   * Quick deadline check (lightweight)
   */
  const checkDeadline = useCallback(async () => {
    if (!tourId) return

    try {
      const result = await bookingValidationService.quickDeadlineCheck(tourId)
      
      if (result.success) {
        const { data } = result
        
        setDeadlineStatus(prev => ({
          ...prev,
          valid: data.deadlineValid,
          message: data.message,
          hoursUntilDeadline: data.details?.hoursUntilDeadline || null,
          minutesUntilDeadline: data.details?.minutesUntilDeadline || null,
          isUrgent: data.details?.isUrgent || false
        }))
      }
    } catch (error) {
      console.error('Deadline check error:', error)
    }
  }, [tourId])

  /**
   * Format time remaining until deadline
   */
  const getTimeUntilDeadline = useCallback(() => {
    const { hoursUntilDeadline, minutesUntilDeadline } = deadlineStatus
    
    if (hoursUntilDeadline === null || minutesUntilDeadline === null) {
      return null
    }

    if (hoursUntilDeadline > 0) {
      return `${hoursUntilDeadline}h ${minutesUntilDeadline}m`
    } else if (minutesUntilDeadline > 0) {
      return `${minutesUntilDeadline}m`
    } else {
      return 'Closing soon'
    }
  }, [deadlineStatus])

  /**
   * Get validation status summary
   */
  const getValidationSummary = useCallback(() => {
    if (validation.loading) {
      return { status: 'loading', message: 'Checking availability...' }
    }

    if (!validation.canBook) {
      return { 
        status: 'error', 
        message: validation.errors[0] || 'Not available for booking' 
      }
    }

    if (deadlineStatus.isUrgent) {
      return { 
        status: 'warning', 
        message: `Booking closes in ${getTimeUntilDeadline()}` 
      }
    }

    return { status: 'success', message: 'Available for booking' }
  }, [validation, deadlineStatus, getTimeUntilDeadline])

  // Auto-validate on mount and when dependencies change
  useEffect(() => {
    if (autoValidate && tourId) {
      validateBooking(true)
    }
  }, [tourId, adultCount, childCount, autoValidate, validateBooking])

  // Set up polling for deadline updates
  useEffect(() => {
    if (!tourId || !autoValidate) return

    // Clear existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
    }

    // Set up new polling interval
    pollIntervalRef.current = setInterval(() => {
      checkDeadline()
    }, pollInterval)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [tourId, pollInterval, checkDeadline, autoValidate])

  // Set up real-time updates via Supabase subscriptions
  useEffect(() => {
    if (!tourId || !enableRealTimeUpdates) return

    // Clean up existing subscription
    if (realtimeCleanupRef.current) {
      realtimeCleanupRef.current()
    }

    // Start real-time monitoring
    realtimeCleanupRef.current = bookingValidationService.startBookingMonitor(
      tourId,
      (updatedValidation) => {
        if (updatedValidation.success) {
          console.log('📡 Real-time update received, updating validation state')
          
          // Debounce rapid updates
          if (validationTimeoutRef.current) {
            clearTimeout(validationTimeoutRef.current)
          }

          validationTimeoutRef.current = setTimeout(() => {
            validateBooking(true)
          }, 1000) // 1 second debounce
        }
      }
    )

    return () => {
      if (realtimeCleanupRef.current) {
        realtimeCleanupRef.current()
      }
    }
  }, [tourId, enableRealTimeUpdates, validateBooking])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
      if (realtimeCleanupRef.current) {
        realtimeCleanupRef.current()
      }
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current)
      }
    }
  }, [])

  return {
    // Validation state
    ...validation,
    
    // Deadline-specific state
    deadlineStatus,
    timeUntilDeadline: getTimeUntilDeadline(),
    
    // Helper methods
    validateBooking,
    checkDeadline,
    getValidationSummary,
    
    // Quick status checks
    isAvailable: validation.canBook,
    isLoading: validation.loading,
    hasErrors: validation.errors.length > 0,
    hasWarnings: validation.warnings.length > 0,
    
    // Pricing information
    totalPrice: validation.pricing?.total?.afterDiscount || 0,
    savings: validation.pricing?.total?.savings || 0,
    hasPromoDiscount: validation.pricing?.promoDiscount?.type !== 'none',
    
    // Capacity information
    availableSpots: validation.tour?.available_spots || 0,
    maxCapacity: validation.tour?.max_capacity || 0,
    
    // Configuration
    refresh: () => validateBooking(true)
  }
}

/**
 * Simpler hook for just deadline checking
 */
export const useBookingDeadline = (tourId, options = {}) => {
  const { pollInterval = 60000 } = options
  
  const [deadline, setDeadline] = useState({
    valid: true,
    isUrgent: false,
    message: '',
    hoursRemaining: null,
    minutesRemaining: null,
    loading: true
  })

  const checkDeadline = useCallback(async () => {
    if (!tourId) return

    try {
      const result = await bookingValidationService.quickDeadlineCheck(tourId)
      
      if (result.success) {
        const { data } = result
        setDeadline({
          valid: data.deadlineValid,
          isUrgent: data.details?.isUrgent || false,
          message: data.message,
          hoursRemaining: data.details?.hoursUntilDeadline || null,
          minutesRemaining: data.details?.minutesUntilDeadline || null,
          loading: false
        })
      } else {
        setDeadline(prev => ({
          ...prev,
          loading: false,
          valid: false,
          message: result.error.message
        }))
      }
    } catch (error) {
      setDeadline(prev => ({
        ...prev,
        loading: false,
        valid: false,
        message: 'Could not check deadline'
      }))
    }
  }, [tourId])

  // Initial check and polling
  useEffect(() => {
    if (tourId) {
      checkDeadline()
      
      const interval = setInterval(checkDeadline, pollInterval)
      return () => clearInterval(interval)
    }
  }, [tourId, pollInterval, checkDeadline])

  return {
    ...deadline,
    refresh: checkDeadline
  }
}

export default useBookingValidation