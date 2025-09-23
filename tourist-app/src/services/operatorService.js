// src/services/operatorService.js
import { supabase } from './supabase'
import {
  OPERATOR_QUERIES,
  OPERATOR_QUERY_PATTERNS,
  QUERY_HELPERS
} from '../utils/databaseQueries'
import {
  operatorCache,
  withCache,
  CACHE_KEYS
} from '../utils/cache'
import {
  validateOperatorData,
  sanitizeOperatorData,
  isOperatorProfileReady
} from '../utils/validation'

export const operatorService = {
  // Generate URL-friendly slug from company name (using shared utility)
  generateSlug: QUERY_HELPERS.generateSlug,

  // Get operator data by slug (company name based)
  getOperatorBySlug: async (slug) => {
    return withCache(
      operatorCache,
      CACHE_KEYS.operatorBySlug(slug),
      async () => {
        try {
          // Get all active operators and find matching slug
          const { data: operators, error: operatorsError } = await supabase
            .from('operators')
            .select(OPERATOR_QUERIES.baseOperatorSelect)
            .eq('status', 'active')

          if (operatorsError) throw operatorsError

          // Find operator whose generated slug matches the requested slug
          const operator = operators?.find(op =>
            operatorService.generateSlug(op.company_name, op.island) === slug
          )

          if (!operator) {
            return null
          }

          // Validate and sanitize operator data
          const sanitizedOperator = sanitizeOperatorData(operator)
          const validation = validateOperatorData(sanitizedOperator)

          if (!validation.isValid) {
            console.warn('Operator data validation failed:', validation.errors)
          }

          // Get operator's activities/templates
          const activities = await operatorService.getOperatorActivities(operator.id)

          // Process operator data with shared utilities
          const processedOperator = QUERY_HELPERS.processOperatorData(sanitizedOperator)

          return {
            ...processedOperator,
            activities,
            slug,
            validation
          }
        } catch (error) {
          console.error('Error fetching operator by slug:', error)
          throw error
        }
      },
      7 * 60 * 1000 // Cache for 7 minutes
    )
  },

  // Get operator data by ID
  getOperatorById: async (operatorId) => {
    return withCache(
      operatorCache,
      CACHE_KEYS.operator(operatorId),
      async () => {
        try {
          // Use shared query pattern
          const { data: operator, error: operatorError } = await OPERATOR_QUERY_PATTERNS
            .getOperatorForProfile(supabase, operatorId)

          if (operatorError) throw operatorError
          if (!operator) return null

          // Validate and sanitize operator data
          const sanitizedOperator = sanitizeOperatorData(operator)
          const validation = validateOperatorData(sanitizedOperator)

          if (!validation.isValid) {
            console.warn('Operator data validation failed:', validation.errors)
          }

          // Get operator's activities
          const activities = await operatorService.getOperatorActivities(operatorId)

          // Process operator data with shared utilities
          const processedOperator = QUERY_HELPERS.processOperatorData(sanitizedOperator)

          return {
            ...processedOperator,
            activities,
            validation
          }
        } catch (error) {
          console.error('Error fetching operator by ID:', error)
          throw error
        }
      },
      5 * 60 * 1000 // Cache for 5 minutes
    )
  },

  // Get all activities (templates and instances) for an operator
  getOperatorActivities: async (operatorId) => {
    return withCache(
      operatorCache,
      CACHE_KEYS.operatorActivities(operatorId),
      async () => {
        try {
          // Get templates using shared query pattern
          const { data: templates, error: templatesError } = await OPERATOR_QUERY_PATTERNS
            .getOperatorActivities(supabase, operatorId, true)

          if (templatesError) throw templatesError

          // Get active tour instances for availability info
          const { data: instances, error: instancesError } = await OPERATOR_QUERY_PATTERNS
            .getOperatorWithInstances(supabase, operatorId)

          if (instancesError) throw instancesError

          // Combine templates with their instance availability
          const templatesWithAvailability = templates?.map(template => {
            const templateInstances = instances?.filter(instance =>
              instance.parent_template_id === template.id || instance.template_id === template.id
            ) || []

            const availabilityInfo = {
              instance_count: templateInstances.length,
              total_spots: templateInstances.reduce((sum, inst) => sum + (inst.available_spots || 0), 0),
              next_available: templateInstances.length > 0 ? templateInstances[0].tour_date : null
            }

            return {
              ...template,
              is_template: true,
              availability: availabilityInfo,
              instances: templateInstances
            }
          }) || []

          return templatesWithAvailability
        } catch (error) {
          console.error('Error fetching operator activities:', error)
          throw error
        }
      },
      3 * 60 * 1000 // Cache for 3 minutes (activities change more frequently)
    )
  },

  // Get statistics for operator profile
  getOperatorStats: async (operatorId) => {
    return withCache(
      operatorCache,
      CACHE_KEYS.operatorStats(operatorId),
      async () => {
        try {
          const operator = await operatorService.getOperatorById(operatorId)
          if (!operator) return null

          // Use shared utility to calculate activity stats
          const activityStats = QUERY_HELPERS.calculateActivityStats(operator.activities)

          return {
            total_tours_completed: operator.total_tours_completed || 0,
            average_rating: operator.average_rating || 0,
            whale_certified: operator.whale_tour_certified || false,
            years_active: operator.yearsActive || 0,
            ...activityStats
          }
        } catch (error) {
          console.error('Error fetching operator stats:', error)
          throw error
        }
      },
      5 * 60 * 1000 // Cache for 5 minutes
    )
  },

  // Search operators (for future use)
  searchOperators: async (query, filters = {}) => {
    return withCache(
      operatorCache,
      CACHE_KEYS.operatorSearch(query, filters),
      async () => {
        try {
          // Use shared query pattern
          const { data: operators, error } = await OPERATOR_QUERY_PATTERNS
            .searchOperators(supabase, query, 20)

          if (error) throw error

          // Process each operator with shared utilities
          return operators?.map(operator => {
            const processed = QUERY_HELPERS.processOperatorData(operator)
            return sanitizeOperatorData(processed)
          }) || []
        } catch (error) {
          console.error('Error searching operators:', error)
          throw error
        }
      },
      2 * 60 * 1000 // Cache search results for 2 minutes
    )
  },

  // Clear operator cache (useful for data updates)
  clearCache: (operatorId) => {
    if (operatorId) {
      operatorCache.delete(CACHE_KEYS.operator(operatorId))
      operatorCache.delete(CACHE_KEYS.operatorActivities(operatorId))
      operatorCache.delete(CACHE_KEYS.operatorStats(operatorId))
    } else {
      operatorCache.clear()
    }
  },

  // Check if operator profile is ready for public display
  validateOperatorProfile: (operator) => {
    const validation = validateOperatorData(operator)
    const readiness = isOperatorProfileReady(operator)

    return {
      ...validation,
      ...readiness
    }
  },

  // Get profile completeness for operator dashboard
  getProfileCompleteness: (operator) => {
    const { calculateProfileCompleteness } = require('../utils/validation')
    return calculateProfileCompleteness(operator)
  }
}