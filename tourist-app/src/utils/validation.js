// src/utils/validation.js
// Shared validation utilities for consistent data handling

/**
 * Validate operator data for profile display
 */
export const validateOperatorData = (operator) => {
  const errors = []
  const warnings = []

  if (!operator) {
    errors.push('Operator data is required')
    return { isValid: false, errors, warnings }
  }

  // Required fields validation
  if (!operator.company_name?.trim()) {
    errors.push('Company name is required')
  }

  if (!operator.island?.trim()) {
    errors.push('Island location is required')
  }

  if (!operator.status) {
    errors.push('Operator status is required')
  } else if (operator.status !== 'active') {
    warnings.push('Operator is not active')
  }

  // Data type validation
  if (operator.total_tours_completed !== undefined &&
      (!Number.isInteger(Number(operator.total_tours_completed)) || Number(operator.total_tours_completed) < 0)) {
    errors.push('Total tours completed must be a non-negative integer')
  }

  if (operator.average_rating !== undefined &&
      (isNaN(Number(operator.average_rating)) || Number(operator.average_rating) < 0 || Number(operator.average_rating) > 5)) {
    errors.push('Average rating must be a number between 0 and 5')
  }

  // Profile completeness warnings
  if (!operator.business_description?.trim() || operator.business_description.trim().length < 20) {
    warnings.push('Business description is missing or too short for optimal profile display')
  }

  if (!operator.operator_logo?.trim()) {
    warnings.push('Operator logo is missing')
  }

  if (!operator.phone?.trim() && !operator.whatsapp_number?.trim()) {
    warnings.push('No contact methods available')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate activity data for display
 */
export const validateActivityData = (activity) => {
  const errors = []
  const warnings = []

  if (!activity) {
    errors.push('Activity data is required')
    return { isValid: false, errors, warnings }
  }

  // Required fields
  if (!activity.tour_name?.trim()) {
    errors.push('Tour name is required')
  }

  if (!activity.tour_type?.trim()) {
    errors.push('Tour type is required')
  }

  if (!activity.location?.trim()) {
    errors.push('Location is required')
  }

  // Pricing validation
  if (activity.discount_price_adult !== undefined) {
    const price = Number(activity.discount_price_adult)
    if (isNaN(price) || price < 0) {
      errors.push('Adult price must be a positive number')
    }
  }

  if (activity.discount_price_child !== undefined) {
    const price = Number(activity.discount_price_child)
    if (isNaN(price) || price < 0) {
      errors.push('Child price must be a positive number')
    }
  }

  // Capacity validation
  if (activity.max_capacity !== undefined) {
    const capacity = Number(activity.max_capacity)
    if (!Number.isInteger(capacity) || capacity <= 0) {
      errors.push('Max capacity must be a positive integer')
    }
  }

  if (activity.available_spots !== undefined && activity.max_capacity !== undefined) {
    const available = Number(activity.available_spots)
    const max = Number(activity.max_capacity)
    if (available > max) {
      errors.push('Available spots cannot exceed max capacity')
    }
  }

  // Display warnings
  if (!activity.description?.trim() || activity.description.trim().length < 20) {
    warnings.push('Description is missing or too short')
  }

  if (!activity.template_cover_image?.trim()) {
    warnings.push('Cover image is missing')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate operator slug format
 */
export const validateOperatorSlug = (slug) => {
  if (!slug || typeof slug !== 'string') {
    return { isValid: false, error: 'Slug is required and must be a string' }
  }

  // Check slug format (lowercase, hyphens, no special chars)
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  if (!slugRegex.test(slug)) {
    return {
      isValid: false,
      error: 'Slug must contain only lowercase letters, numbers, and hyphens'
    }
  }

  // Check length
  if (slug.length < 3 || slug.length > 100) {
    return {
      isValid: false,
      error: 'Slug must be between 3 and 100 characters'
    }
  }

  return { isValid: true }
}

/**
 * Validate contact information
 */
export const validateContactInfo = (operator) => {
  const issues = []

  // Phone number validation
  if (operator.phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/
    if (!phoneRegex.test(operator.phone)) {
      issues.push('Phone number format appears invalid')
    }
  }

  // WhatsApp number validation
  if (operator.whatsapp_number) {
    const whatsappRegex = /^\+?[\d\s\-\(\)]{8,}$/
    if (!whatsappRegex.test(operator.whatsapp_number)) {
      issues.push('WhatsApp number format appears invalid')
    }
  }

  // At least one contact method should be available
  if (!operator.phone && !operator.whatsapp_number) {
    issues.push('At least one contact method (phone or WhatsApp) should be provided')
  }

  return {
    isValid: issues.length === 0,
    issues
  }
}

/**
 * Sanitize operator data for safe display
 */
export const sanitizeOperatorData = (operator) => {
  if (!operator) return null

  return {
    ...operator,
    // Trim whitespace from string fields
    company_name: operator.company_name?.trim() || '',
    contact_person: operator.contact_person?.trim() || '',
    business_description: operator.business_description?.trim() || '',
    island: operator.island?.trim() || '',
    phone: operator.phone?.trim() || '',
    whatsapp_number: operator.whatsapp_number?.trim() || '',
    operator_logo: operator.operator_logo?.trim() || '',

    // Ensure numeric fields are properly typed
    total_tours_completed: parseInt(operator.total_tours_completed) || 0,
    average_rating: parseFloat(operator.average_rating) || 0,

    // Ensure boolean fields
    whale_tour_certified: Boolean(operator.whale_tour_certified),

    // Clean up status
    status: operator.status?.toLowerCase() || 'inactive'
  }
}

/**
 * Sanitize activity data for safe display
 */
export const sanitizeActivityData = (activity) => {
  if (!activity) return null

  return {
    ...activity,
    // Trim string fields
    tour_name: activity.tour_name?.trim() || '',
    tour_type: activity.tour_type?.trim() || '',
    description: activity.description?.trim() || '',
    location: activity.location?.trim() || '',
    meeting_point: activity.meeting_point?.trim() || '',

    // Ensure numeric fields
    duration_hours: parseFloat(activity.duration_hours) || 0,
    max_capacity: parseInt(activity.max_capacity) || 0,
    available_spots: parseInt(activity.available_spots) || 0,
    discount_price_adult: parseInt(activity.discount_price_adult) || 0,
    discount_price_child: parseInt(activity.discount_price_child) || 0,
    original_price_adult: parseInt(activity.original_price_adult) || 0,
    min_age: parseInt(activity.min_age) || null,
    max_age: parseInt(activity.max_age) || null,

    // Ensure boolean fields
    pickup_available: Boolean(activity.pickup_available),
    equipment_included: Boolean(activity.equipment_included),
    food_included: Boolean(activity.food_included),
    drinks_included: Boolean(activity.drinks_included),
    whale_regulation_compliant: Boolean(activity.whale_regulation_compliant),
    weather_dependent: Boolean(activity.weather_dependent),
    is_template: Boolean(activity.is_template),

    // Ensure arrays
    languages: Array.isArray(activity.languages) ? activity.languages : [],
    pickup_locations: Array.isArray(activity.pickup_locations) ? activity.pickup_locations : []
  }
}

/**
 * Check if operator data is suitable for profile display
 */
export const isOperatorProfileReady = (operator) => {
  const validation = validateOperatorData(operator)
  const contactValidation = validateContactInfo(operator)

  // Must have valid basic data
  if (!validation.isValid) {
    return {
      ready: false,
      reason: 'Missing required operator information',
      details: validation.errors
    }
  }

  // Must have contact info
  if (!contactValidation.isValid) {
    return {
      ready: false,
      reason: 'No valid contact information',
      details: contactValidation.issues
    }
  }

  // Check for minimum profile quality
  const hasDescription = operator.business_description?.trim()?.length >= 20
  const hasContactMethod = operator.phone || operator.whatsapp_number

  if (!hasDescription && !hasContactMethod) {
    return {
      ready: false,
      reason: 'Profile needs more information for public display',
      details: ['Add business description and contact information']
    }
  }

  return {
    ready: true,
    completeness: calculateProfileCompleteness(operator)
  }
}

/**
 * Calculate profile completeness percentage
 */
export const calculateProfileCompleteness = (operator) => {
  if (!operator) return 0

  const checks = [
    !!operator.company_name?.trim(),           // 15%
    !!operator.business_description?.trim() && operator.business_description.trim().length >= 20, // 20%
    !!operator.operator_logo?.trim(),          // 10%
    !!operator.phone?.trim() || !!operator.whatsapp_number?.trim(), // 15%
    !!operator.contact_person?.trim(),         // 10%
    !!operator.island?.trim(),                 // 10%
    operator.total_tours_completed > 0 || operator.whale_tour_certified, // 10%
    !!operator.business_license?.trim(),       // 5%
    !!operator.insurance_certificate?.trim(),  // 5%
  ]

  const weights = [15, 20, 10, 15, 10, 10, 10, 5, 5]
  let totalScore = 0

  checks.forEach((passed, index) => {
    if (passed) {
      totalScore += weights[index]
    }
  })

  return Math.round(totalScore)
}