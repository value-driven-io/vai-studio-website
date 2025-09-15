// serviceResponse.js - Centralized Service Response Standards
// This utility provides consistent response patterns across all services

/**
 * Standardized error response structure
 * @param {string} code - Error code for programmatic handling
 * @param {string} message - Human-readable error message
 * @param {*} details - Additional error details (optional)
 * @param {Object} context - Additional context information (optional)
 * @returns {Object} Standardized error response
 */
export const createErrorResponse = (code, message, details = null, context = null) => ({
  success: false,
  error: {
    code,
    message,
    details,
    context,
    timestamp: new Date().toISOString()
  }
})

/**
 * Standardized success response structure
 * @param {*} data - Response data
 * @param {string} message - Human-readable success message (optional)
 * @param {Object} meta - Additional metadata (optional)
 * @returns {Object} Standardized success response
 */
export const createSuccessResponse = (data, message = null, meta = null) => ({
  success: true,
  data,
  message,
  meta,
  timestamp: new Date().toISOString()
})

/**
 * Error code constants for consistency
 */
export const ERROR_CODES = {
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Authentication/Authorization errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  QUERY_FAILED: 'QUERY_FAILED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  
  // Business logic errors
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_PERMISSION: 'INSUFFICIENT_PERMISSION',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  DEPENDENCY_VIOLATION: 'DEPENDENCY_VIOLATION',
  
  // Booking specific errors
  BOOKING_DEADLINE_PASSED: 'BOOKING_DEADLINE_PASSED',
  INSUFFICIENT_CAPACITY: 'INSUFFICIENT_CAPACITY',
  TOUR_NOT_AVAILABLE: 'TOUR_NOT_AVAILABLE',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  
  // Template/Schedule specific errors
  TEMPLATE_IN_USE: 'TEMPLATE_IN_USE',
  SCHEDULE_CONFLICT: 'SCHEDULE_CONFLICT',
  GENERATION_FAILED: 'GENERATION_FAILED',
  
  // System errors
  UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR'
}

/**
 * Validation result structure
 * @param {boolean} valid - Whether validation passed
 * @param {Array<string>} errors - Array of validation error codes
 * @param {Array<string>} warnings - Array of validation warnings (optional)
 * @returns {Object} Validation result
 */
export const createValidationResult = (valid, errors = [], warnings = []) => ({
  valid,
  errors,
  warnings,
  timestamp: new Date().toISOString()
})

/**
 * Wrap async service functions with standardized error handling
 * @param {Function} serviceFunction - The service function to wrap
 * @param {string} operationName - Name of the operation for logging
 * @returns {Function} Wrapped function with error handling
 */
export const withErrorHandling = (serviceFunction, operationName) => {
  return async (...args) => {
    try {
      const result = await serviceFunction(...args)
      
      // If the service function already returns a standardized response, pass it through
      if (typeof result === 'object' && result.hasOwnProperty('success')) {
        return result
      }
      
      // Otherwise, wrap it in a success response
      return createSuccessResponse(result, `${operationName} completed successfully`)
      
    } catch (error) {
      console.error(`❌ Error in ${operationName}:`, error)
      
      // Handle different error types
      if (error.code) {
        // Database/Supabase error
        return createErrorResponse(
          ERROR_CODES.DATABASE_ERROR,
          error.message,
          error,
          { operation: operationName }
        )
      }
      
      if (error.message?.includes('validation')) {
        return createErrorResponse(
          ERROR_CODES.VALIDATION_FAILED,
          error.message,
          error,
          { operation: operationName }
        )
      }
      
      // Generic unexpected error
      return createErrorResponse(
        ERROR_CODES.UNEXPECTED_ERROR,
        error.message || 'An unexpected error occurred',
        error,
        { operation: operationName }
      )
    }
  }
}

/**
 * Handle Supabase errors consistently
 * @param {Object} supabaseError - Error from Supabase
 * @param {string} operation - Operation that failed
 * @returns {Object} Standardized error response
 */
export const handleSupabaseError = (supabaseError, operation) => {
  const { code, message, details, hint } = supabaseError
  
  // Map common Supabase error codes to our standard codes
  const errorCodeMap = {
    'PGRST116': ERROR_CODES.NOT_FOUND, // Row not found
    '23505': ERROR_CODES.ALREADY_EXISTS, // Unique violation
    '23503': ERROR_CODES.DEPENDENCY_VIOLATION, // Foreign key violation
    '42P01': ERROR_CODES.DATABASE_ERROR, // Table does not exist
    '42703': ERROR_CODES.DATABASE_ERROR, // Column does not exist
  }
  
  const mappedCode = errorCodeMap[code] || ERROR_CODES.DATABASE_ERROR
  
  return createErrorResponse(
    mappedCode,
    message || 'Database operation failed',
    { code, details, hint },
    { operation, originalError: supabaseError }
  )
}

/**
 * Create a pagination metadata object
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @returns {Object} Pagination metadata
 */
export const createPaginationMeta = (page, limit, total) => ({
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1
  }
})

/**
 * Service response validator
 * @param {Object} response - Response object to validate
 * @returns {boolean} Whether the response follows the standard format
 */
export const isValidServiceResponse = (response) => {
  if (!response || typeof response !== 'object') {
    return false
  }
  
  const hasSuccess = response.hasOwnProperty('success')
  const hasTimestamp = response.hasOwnProperty('timestamp')
  
  if (!hasSuccess || !hasTimestamp) {
    return false
  }
  
  if (response.success) {
    return response.hasOwnProperty('data')
  } else {
    return response.hasOwnProperty('error') && 
           typeof response.error === 'object' &&
           response.error.hasOwnProperty('code') &&
           response.error.hasOwnProperty('message')
  }
}

/**
 * Log service operations consistently
 * @param {string} operation - Operation name
 * @param {Object} params - Operation parameters
 * @param {Object} result - Operation result
 * @param {number} duration - Operation duration in ms
 */
export const logServiceOperation = (operation, params, result, duration) => {
  const logData = {
    operation,
    params: params ? Object.keys(params).reduce((acc, key) => {
      // Don't log sensitive data
      if (['password', 'token', 'secret', 'key'].some(sensitive => key.toLowerCase().includes(sensitive))) {
        acc[key] = '[REDACTED]'
      } else {
        acc[key] = params[key]
      }
      return acc
    }, {}) : {},
    success: result?.success || false,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString()
  }
  
  if (result?.success) {
    console.log(`✅ ${operation}:`, logData)
  } else {
    console.error(`❌ ${operation}:`, logData, result?.error)
  }
}

/**
 * Performance monitoring wrapper
 * @param {Function} serviceFunction - Function to monitor
 * @param {string} operationName - Name for logging
 * @returns {Function} Wrapped function with performance monitoring
 */
export const withPerformanceMonitoring = (serviceFunction, operationName) => {
  return async (...args) => {
    const startTime = performance.now()
    
    try {
      const result = await serviceFunction(...args)
      const duration = Math.round(performance.now() - startTime)
      
      logServiceOperation(operationName, args[0], result, duration)
      
      return result
    } catch (error) {
      const duration = Math.round(performance.now() - startTime)
      logServiceOperation(operationName, args[0], { success: false, error }, duration)
      throw error
    }
  }
}

/**
 * Combine multiple service wrappers
 * @param {Function} serviceFunction - Original service function
 * @param {string} operationName - Operation name
 * @param {Object} options - Wrapper options
 * @returns {Function} Fully wrapped service function
 */
export const wrapServiceFunction = (serviceFunction, operationName, options = {}) => {
  let wrappedFunction = serviceFunction
  
  if (options.withErrorHandling !== false) {
    wrappedFunction = withErrorHandling(wrappedFunction, operationName)
  }
  
  if (options.withPerformanceMonitoring !== false) {
    wrappedFunction = withPerformanceMonitoring(wrappedFunction, operationName)
  }
  
  return wrappedFunction
}

// Export commonly used patterns
export {
  createErrorResponse as error,
  createSuccessResponse as success,
  createValidationResult as validation,
  ERROR_CODES as codes
}