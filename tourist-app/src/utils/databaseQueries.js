// src/utils/databaseQueries.js
// Shared database query utilities to reduce duplication and ensure consistency

/**
 * Standard operator data fields for consistent querying
 */
export const OPERATOR_QUERIES = {
  // Base operator fields for profile pages
  baseOperatorSelect: `
    id,
    company_name,
    contact_person,
    island,
    business_description,
    operator_logo,
    total_tours_completed,
    average_rating,
    whale_tour_certified,
    business_license,
    insurance_certificate,
    phone,
    whatsapp_number,
    status,
    preferred_language,
    created_at
  `,

  // Extended operator fields for admin/dashboard use
  extendedOperatorSelect: `
    id,
    company_name,
    contact_person,
    email,
    island,
    address,
    business_description,
    operator_logo,
    total_tours_completed,
    average_rating,
    whale_tour_certified,
    business_license,
    insurance_certificate,
    phone,
    whatsapp_number,
    status,
    preferred_language,
    commission_rate,
    created_at,
    updated_at
  `,

  // Standard activity/template fields
  baseActivitySelect: `
    id,
    tour_name,
    tour_type,
    description,
    duration_hours,
    max_capacity,
    available_spots,
    original_price_adult,
    discount_price_adult,
    discount_price_child,
    location,
    meeting_point,
    pickup_available,
    pickup_locations,
    languages,
    equipment_included,
    food_included,
    drinks_included,
    whale_regulation_compliant,
    fitness_level,
    min_age,
    max_age,
    template_cover_image,
    status,
    weather_dependent,
    backup_plan,
    is_template,
    parent_template_id,
    tour_date,
    time_slot
  `,

  // Activity fields for discovery/listing pages (lighter)
  discoveryActivitySelect: `
    id,
    tour_name,
    tour_type,
    description,
    duration_hours,
    discount_price_adult,
    discount_price_child,
    original_price_adult,
    location,
    languages,
    fitness_level,
    whale_regulation_compliant,
    template_cover_image,
    status,
    is_template
  `
}

/**
 * Standard filters and conditions for consistent querying
 */
export const QUERY_CONDITIONS = {
  // Only active operators
  activeOperators: (query) => query.eq('status', 'active'),

  // Only active activities/templates
  activeActivities: (query) => query.eq('status', 'active'),

  // Only templates (not instances)
  templatesOnly: (query) => query.eq('is_template', true),

  // Only instances (not templates)
  instancesOnly: (query) => query.eq('is_template', false),

  // Future activities only
  futureActivities: (query) => query.gte('tour_date', new Date().toISOString().split('T')[0]),

  // Activities with available spots
  availableActivities: (query) => query.gt('available_spots', 0),

  // Apply island filter
  byIsland: (query, island) => island && island !== 'all' ? query.eq('island', island) : query,

  // Apply tour type filter
  byTourType: (query, tourType) => tourType && tourType !== 'all' ? query.eq('tour_type', tourType) : query,

  // Apply operator filter
  byOperator: (query, operatorId) => operatorId ? query.eq('operator_id', operatorId) : query
}

/**
 * Common query patterns for operator-related data
 */
export const OPERATOR_QUERY_PATTERNS = {
  /**
   * Get operator with basic info for profile display
   */
  getOperatorForProfile: (supabase, operatorId) => {
    return supabase
      .from('operators')
      .select(OPERATOR_QUERIES.baseOperatorSelect)
      .eq('id', operatorId)
      .eq('status', 'active')
      .single()
  },

  /**
   * Get operator activities/templates
   */
  getOperatorActivities: (supabase, operatorId, templatesOnly = true) => {
    let query = supabase
      .from('activity_templates_view')
      .select(OPERATOR_QUERIES.baseActivitySelect)
      .eq('operator_id', operatorId)

    if (templatesOnly) {
      query = QUERY_CONDITIONS.templatesOnly(query)
    }

    return QUERY_CONDITIONS.activeActivities(query)
      .order('tour_name', { ascending: true })
  },

  /**
   * Get operator with activity instances for availability
   */
  getOperatorWithInstances: (supabase, operatorId) => {
    return supabase
      .from('active_tours_with_operators')
      .select(`
        id,
        tour_name,
        tour_type,
        tour_date,
        time_slot,
        available_spots,
        max_capacity,
        discount_price_adult,
        discount_price_child,
        parent_template_id,
        template_id,
        status
      `)
      .eq('operator_id', operatorId)
      .gte('tour_date', new Date().toISOString().split('T')[0])
      .order('tour_date', { ascending: true })
  },

  /**
   * Search operators by name/description
   */
  searchOperators: (supabase, searchTerm, limit = 20) => {
    let query = supabase
      .from('operators')
      .select(`
        id,
        company_name,
        island,
        business_description,
        operator_logo,
        total_tours_completed,
        average_rating,
        whale_tour_certified
      `)

    query = QUERY_CONDITIONS.activeOperators(query)

    if (searchTerm) {
      query = query.or(`company_name.ilike.%${searchTerm}%,business_description.ilike.%${searchTerm}%`)
    }

    return query
      .order('total_tours_completed', { ascending: false })
      .limit(limit)
  }
}

/**
 * Helper functions for data processing
 */
export const QUERY_HELPERS = {
  /**
   * Generate URL-friendly slug from company name
   */
  generateSlug: (companyName, island = '') => {
    if (!companyName) return null

    let slug = companyName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim('-') // Remove leading/trailing hyphens

    // Add island if provided and not already in name
    if (island && !slug.includes(island.toLowerCase().replace(/\s+/g, '-'))) {
      slug += `-${island.toLowerCase().replace(/\s+/g, '-')}`
    }

    return slug
  },

  /**
   * Calculate activity statistics for operator
   */
  calculateActivityStats: (activities) => {
    if (!activities || !Array.isArray(activities)) {
      return {
        totalActivities: 0,
        totalAvailableSpots: 0,
        tourTypes: [],
        uniqueLanguages: [],
        priceRange: null
      }
    }

    const totalActivities = activities.length
    const totalAvailableSpots = activities.reduce((sum, activity) =>
      sum + (activity.availability?.total_spots || 0), 0
    )

    // Get unique tour types
    const tourTypes = [...new Set(activities.map(activity => activity.tour_type))]

    // Get all languages offered
    const allLanguages = activities.flatMap(activity => activity.languages || [])
    const uniqueLanguages = [...new Set(allLanguages)]

    // Get price range
    const prices = activities
      .map(activity => activity.discount_price_adult || 0)
      .filter(p => p > 0)

    const priceRange = prices.length > 0 ? {
      min: Math.min(...prices),
      max: Math.max(...prices)
    } : null

    return {
      totalActivities,
      totalAvailableSpots,
      tourTypes,
      uniqueLanguages,
      priceRange
    }
  },

  /**
   * Process operator data for consistent formatting
   */
  processOperatorData: (operator) => {
    if (!operator) return null

    return {
      ...operator,
      // Ensure consistent slug generation
      slug: QUERY_HELPERS.generateSlug(operator.company_name, operator.island),

      // Calculate years active
      yearsActive: operator.created_at ?
        new Date().getFullYear() - new Date(operator.created_at).getFullYear() : 0,

      // Determine if new operator
      isNewOperator: !operator.total_tours_completed || operator.total_tours_completed === 0,

      // Ensure numeric values
      total_tours_completed: parseInt(operator.total_tours_completed) || 0,
      average_rating: parseFloat(operator.average_rating) || 0
    }
  }
}