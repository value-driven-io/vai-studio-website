// 🔧 SOPHISTICATED BOOKING ERROR HANDLER
// Maps database errors to user-friendly translated messages

export const bookingErrorHandler = {
  /**
   * Maps error codes/messages to translation keys
   * @param {string|object} error - Error message or error object
   * @param {function} t - Translation function
   * @returns {object} - { message, type, actionable }
   */
  getErrorMessage(error, t) {
    const errorStr = typeof error === 'string' ? error : error?.message || error?.error || 'Unknown error'
    const errorCode = error?.error_code || this.detectErrorCode(errorStr)

    // Map error codes to translation keys and user actions
    const errorMap = {
      // Database/Function errors
      'TOUR_NOT_FOUND': {
        key: 'bookingErrors.tourNotFound',
        type: 'warning',
        actionable: true,
        actions: ['refresh', 'browse_other']
      },
      'TOUR_INACTIVE': {
        key: 'bookingErrors.tourInactive',
        type: 'warning',
        actionable: true,
        actions: ['contact_support', 'try_later']
      },
      'INSUFFICIENT_CAPACITY': {
        key: 'bookingErrors.insufficientSpots',
        type: 'warning',
        actionable: true,
        actions: ['reduce_participants', 'choose_other'],
        params: {
          available: error?.available || 0,
          requested: error?.requested || 1
        }
      },

      // Validation errors
      'INVALID_PARTICIPANTS': {
        key: 'bookingErrors.invalidParticipants',
        type: 'error',
        actionable: true,
        actions: ['fix_form']
      },
      'VALIDATION_ERROR': {
        key: 'bookingErrors.validationError',
        type: 'error',
        actionable: true,
        actions: ['fix_form']
      },

      // Payment errors
      'PAYMENT_FAILED': {
        key: 'bookingErrors.paymentFailed',
        type: 'error',
        actionable: true,
        actions: ['retry', 'contact_support']
      },

      // Network/System errors
      'NETWORK_ERROR': {
        key: 'bookingErrors.networkError',
        type: 'error',
        actionable: true,
        actions: ['check_connection', 'retry']
      },
      'SERVER_ERROR': {
        key: 'bookingErrors.serverError',
        type: 'error',
        actionable: true,
        actions: ['try_later', 'contact_support']
      },

      // User creation errors
      'USER_CREATION_FAILED': {
        key: 'bookingErrors.touristUserCreationFailed',
        type: 'error',
        actionable: true,
        actions: ['retry', 'contact_support']
      },
      'EMAIL_EXISTS': {
        key: 'bookingErrors.emailAlreadyExists',
        type: 'warning',
        actionable: true,
        actions: ['use_different_email', 'contact_support']
      },

      // Capacity/timing errors
      'CAPACITY_EXCEEDED': {
        key: 'bookingErrors.capacityExceeded',
        type: 'warning',
        actionable: true,
        actions: ['choose_other_date', 'browse_other']
      },
      'DEADLINE_PASSED': {
        key: 'bookingErrors.bookingDeadlinePassed',
        type: 'warning',
        actionable: true,
        actions: ['choose_other_date', 'browse_other']
      },
      'CONCURRENT_BOOKING': {
        key: 'bookingErrors.concurrentBookingDetected',
        type: 'warning',
        actionable: true,
        actions: ['refresh', 'choose_other']
      },

      // Rate limiting
      'RATE_LIMIT': {
        key: 'bookingErrors.rateLimit',
        type: 'warning',
        actionable: true,
        actions: ['wait', 'try_later']
      },

      // Maintenance
      'MAINTENANCE': {
        key: 'bookingErrors.maintenanceMode',
        type: 'info',
        actionable: true,
        actions: ['try_later', 'contact_support']
      }
    }

    const errorInfo = errorMap[errorCode] || {
      key: 'bookingErrors.unknownError',
      type: 'error',
      actionable: true,
      actions: ['contact_support']
    }

    return {
      message: t(errorInfo.key, errorInfo.params || {}),
      type: errorInfo.type,
      actionable: errorInfo.actionable,
      actions: errorInfo.actions,
      originalError: errorStr,
      errorCode
    }
  },

  /**
   * Detects error codes from error messages
   * @param {string} errorStr - Error message string
   * @returns {string} - Detected error code
   */
  detectErrorCode(errorStr) {
    const errorPatterns = [
      { pattern: /tour not found|tour.*not available/i, code: 'TOUR_NOT_FOUND' },
      { pattern: /tour.*inactive|not available for booking/i, code: 'TOUR_INACTIVE' },
      { pattern: /insufficient spots|not enough spots|capacity/i, code: 'INSUFFICIENT_CAPACITY' },
      { pattern: /invalid.*participants|participants.*invalid/i, code: 'INVALID_PARTICIPANTS' },
      { pattern: /validation|invalid.*data|check.*details/i, code: 'VALIDATION_ERROR' },
      { pattern: /payment.*failed|payment.*error/i, code: 'PAYMENT_FAILED' },
      { pattern: /network.*error|connection.*error|internet/i, code: 'NETWORK_ERROR' },
      { pattern: /server.*error|temporarily unavailable|service unavailable/i, code: 'SERVER_ERROR' },
      { pattern: /user.*creation.*failed|profile.*failed/i, code: 'USER_CREATION_FAILED' },
      { pattern: /email.*exists|account.*exists/i, code: 'EMAIL_EXISTS' },
      { pattern: /capacity.*exceeded|maximum.*capacity/i, code: 'CAPACITY_EXCEEDED' },
      { pattern: /deadline.*passed|booking.*closed/i, code: 'DEADLINE_PASSED' },
      { pattern: /concurrent|someone.*booked|spots.*taken/i, code: 'CONCURRENT_BOOKING' },
      { pattern: /too many.*attempts|rate.*limit/i, code: 'RATE_LIMIT' },
      { pattern: /maintenance|under.*maintenance/i, code: 'MAINTENANCE' }
    ]

    for (const { pattern, code } of errorPatterns) {
      if (pattern.test(errorStr)) {
        return code
      }
    }

    return 'UNKNOWN_ERROR'
  },

  /**
   * Gets action button configurations for error types
   * @param {array} actions - Array of action keys
   * @param {function} t - Translation function
   * @returns {array} - Array of action button configs
   */
  getActionButtons(actions, t) {
    const actionMap = {
      refresh: { label: t('common.refresh'), variant: 'primary', action: 'refresh' },
      retry: { label: t('common.retry'), variant: 'primary', action: 'retry' },
      browse_other: { label: t('common.browseOther'), variant: 'secondary', action: 'browse' },
      choose_other: { label: t('common.chooseOther'), variant: 'secondary', action: 'choose' },
      contact_support: { label: t('common.contactSupport'), variant: 'outline', action: 'support' },
      try_later: { label: t('common.tryLater'), variant: 'secondary', action: 'close' },
      fix_form: { label: t('common.fixForm'), variant: 'primary', action: 'fix' },
      check_connection: { label: t('common.checkConnection'), variant: 'secondary', action: 'close' },
      reduce_participants: { label: t('common.reduceParticipants'), variant: 'primary', action: 'reduce' },
      choose_other_date: { label: t('common.chooseOtherDate'), variant: 'secondary', action: 'date' },
      use_different_email: { label: t('common.useDifferentEmail'), variant: 'primary', action: 'email' },
      wait: { label: t('common.wait'), variant: 'secondary', action: 'close' }
    }

    return actions?.map(action => actionMap[action]).filter(Boolean) || []
  }
}

// Export error types for consistent styling
export const ERROR_TYPES = {
  ERROR: 'error',     // Red - Critical errors
  WARNING: 'warning', // Orange - User action needed
  INFO: 'info'        // Blue - Information
}