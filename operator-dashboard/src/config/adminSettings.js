// src/config/adminSettings.js
// Phase 1: Admin-controlled tour date restrictions

export const ADMIN_SETTINGS = {
  // Global minimum tour date - admin can easily modify this
  MINIMUM_TOUR_DATE: '2025-08-30', // ISO date format: YYYY-MM-DD
  
  // Role-based permissions
  ROLE_PERMISSIONS: {
    'onboarding': {
      canCreateTours: true,
      enforceMinimumDate: true,
      description: 'Learning mode - date restricted'
    },
    'verified': {
      canCreateTours: true,
      enforceMinimumDate: false,
      description: 'Full access operator'
    }
  }
}

// Helper function to get current minimum date
export const getMinimumTourDate = (operatorRole = 'onboarding') => {
  const rolePermissions = ADMIN_SETTINGS.ROLE_PERMISSIONS[operatorRole]
  
  if (!rolePermissions?.enforceMinimumDate) {
    return null // No restriction for this role
  }
  
  return ADMIN_SETTINGS.MINIMUM_TOUR_DATE
}

// Helper function to check if date is allowed
export const isDateAllowed = (tourDate, operatorRole = 'onboarding') => {
  const minimumDate = getMinimumTourDate(operatorRole)
  
  if (!minimumDate) {
    return true // No restriction
  }
  
  return tourDate >= minimumDate
}