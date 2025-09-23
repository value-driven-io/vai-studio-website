// src/config/operatorFields.js

// Field categories for modular organization
export const OPERATOR_FIELD_CONFIG = {
  // Current fields from database
  basic: ['company_name', 'contact_person', 'island', 'business_description'],
  trust: ['total_tours_completed', 'average_rating', 'whale_tour_certified', 'business_license', 'insurance_certificate'],
  contact: ['phone', 'whatsapp_number'],
  visual: ['operator_logo'],
  operational: ['status', 'preferred_language', 'created_at'],

  // Future expandable fields (ready for database additions)
  social: [], // Future: instagram_handle, facebook_page, website_url
  certifications: [], // Future: diving_certified, first_aid_certified, tourism_license
  specialties: [], // Future: photography_services, guide_languages, boat_type
  extended: [], // Future: years_experience, team_size, boat_capacity, equipment_list
}

// Display rules for each field - determines when to show/hide
export const DISPLAY_RULES = {
  // Basic information
  company_name: (value) => !!value?.trim(),
  contact_person: (value) => !!value?.trim(),
  island: (value) => !!value?.trim(),
  business_description: (value) => value?.trim()?.length > 20, // Only show substantial descriptions

  // Trust indicators - hide zeros to maintain professional appearance
  total_tours_completed: (value) => value > 0,
  average_rating: (value) => value > 0,
  whale_tour_certified: (value) => value === true,
  business_license: (value) => !!value?.trim(),
  insurance_certificate: (value) => !!value?.trim(),

  // Contact information
  phone: (value) => !!value?.trim(),
  whatsapp_number: (value) => !!value?.trim(),

  // Visual elements
  operator_logo: (value) => !!value?.trim(),

  // Operational
  status: (value) => value === 'active',
  preferred_language: (value) => !!value?.trim(),
  created_at: (value) => !!value,

  // Future fields (examples for when database expands)
  // instagram_handle: (value) => value?.trim().length > 0,
  // facebook_page: (value) => value?.startsWith('http'),
  // website_url: (value) => isValidUrl(value),
  // diving_certified: (value) => value === true,
  // years_experience: (value) => value > 0,
}

// Section visibility logic
export const SECTION_RULES = {
  hero: () => true, // Always show hero section

  trust: (operator) => {
    return (
      operator.total_tours_completed > 0 ||
      operator.average_rating > 0 ||
      operator.whale_tour_certified ||
      operator.business_license ||
      operator.insurance_certificate
    )
  },

  stats: (operator) => {
    return (
      operator.total_tours_completed > 0 ||
      operator.average_rating > 0 ||
      (operator.activities && operator.activities.length > 0)
    )
  },

  about: (operator) => {
    return !!operator.business_description?.trim() && operator.business_description.trim().length > 20
  },

  activities: (operator) => {
    return operator.activities && operator.activities.length > 0
  },

  contact: (operator) => {
    return operator.phone || operator.whatsapp_number
  },

  share: () => true, // Always show sharing options
}

// Trust indicators for new operators (fallback messaging)
export const NEW_OPERATOR_INDICATORS = {
  licensed: (operator) => operator.business_license || operator.insurance_certificate,
  certified: (operator) => operator.whale_tour_certified,
  local_expert: (operator) => operator.island,
  new_to_platform: (operator) => operator.total_tours_completed === 0,
}

// Alternative messaging for new operators
export const NEW_OPERATOR_MESSAGES = {
  trust_badge: 'operatorProfile.newOperator.trustBadge', // "New Local Expert"
  licensed_text: 'operatorProfile.newOperator.licensed', // "Licensed & Insured"
  local_expert_text: 'operatorProfile.newOperator.localExpert', // "Island Expert"
  fresh_perspective: 'operatorProfile.newOperator.freshPerspective', // "Fresh Perspective"
  coming_soon: 'operatorProfile.newOperator.comingSoon', // "Upcoming Adventures"
}

// Helper function to check if field should be displayed
export const shouldShowField = (fieldName, value, operator = null) => {
  const rule = DISPLAY_RULES[fieldName]
  if (!rule) return !!value // Default: show if has value

  return rule(value, operator)
}

// Helper function to check if section should be displayed
export const shouldShowSection = (sectionName, operator) => {
  const rule = SECTION_RULES[sectionName]
  if (!rule) return false

  return rule(operator)
}

// Helper function to get trust indicators for operator
export const getTrustIndicators = (operator) => {
  const indicators = []

  // Always show licensing if available
  if (operator.business_license) indicators.push('licensed')
  if (operator.insurance_certificate) indicators.push('insured')
  if (operator.whale_tour_certified) indicators.push('whale_certified')

  // For new operators, emphasize other qualities
  if (operator.total_tours_completed === 0) {
    indicators.push('new_to_platform')
    if (operator.island) indicators.push('local_expert')
  }

  // For experienced operators
  if (operator.total_tours_completed > 0) {
    indicators.push('experienced')
  }

  if (operator.average_rating > 4.0) {
    indicators.push('highly_rated')
  }

  return indicators
}

// Helper function to get display stats (only positive/meaningful ones)
export const getDisplayStats = (operator) => {
  const stats = []

  if (operator.total_tours_completed > 0) {
    stats.push({
      key: 'tours_completed',
      value: operator.total_tours_completed,
      label: 'operatorProfile.stats.toursCompleted'
    })
  }

  if (operator.average_rating > 0) {
    stats.push({
      key: 'rating',
      value: operator.average_rating,
      label: 'operatorProfile.stats.rating'
    })
  }

  if (operator.activities && operator.activities.length > 0) {
    stats.push({
      key: 'activities',
      value: operator.activities.length,
      label: 'operatorProfile.stats.activities'
    })
  }

  // Calculate years active (only if meaningful)
  if (operator.created_at) {
    const yearsActive = new Date().getFullYear() - new Date(operator.created_at).getFullYear()
    if (yearsActive > 0) {
      stats.push({
        key: 'years_active',
        value: yearsActive,
        label: 'operatorProfile.stats.yearsActive'
      })
    }
  }

  return stats
}