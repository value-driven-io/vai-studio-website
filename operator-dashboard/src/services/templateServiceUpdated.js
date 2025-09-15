// Updated templateService.js - Comprehensive Dependency Checking & Standardized Error Handling
import { supabase } from '../lib/supabase'

// Standardized error response structure
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

export const templateService = {
  /**
   * Create a new activity template
   * @param {Object} templateData - Template data
   * @returns {Promise<Object>} Standardized response with created template
   */
  async createTemplate(templateData) {
    try {
      console.log('🎯 Creating activity template:', templateData)

      // Validate input data
      const validation = this.validateTemplateData(templateData)
      if (!validation.valid) {
        return createErrorResponse('VALIDATION_FAILED', 'Template data validation failed', validation.errors)
      }

      // Ensure template-specific fields are set and exclude generated columns
      const { discount_percentage, ...cleanTemplateData } = templateData
      const templatePayload = {
        ...cleanTemplateData,
        activity_type: 'template',
        is_template: true,
        tour_date: null,
        time_slot: null,
        available_spots: templateData.max_capacity || 1
      }

      const { data: template, error } = await supabase
        .from('tours')
        .insert(templatePayload)
        .select()
        .single()

      if (error) {
        console.error('❌ Template creation failed:', error)
        return createErrorResponse('DATABASE_INSERT_FAILED', error.message, error)
      }

      console.log('✅ Template created successfully:', template.id)
      return createSuccessResponse(template, 'Template created successfully')

    } catch (error) {
      console.error('❌ Error in createTemplate:', error)
      return createErrorResponse('UNEXPECTED_ERROR', error.message, error)
    }
  },

  /**
   * Get all templates for an operator
   * @param {string} operatorId - Operator ID
   * @returns {Promise<Object>} Standardized response with templates array
   */
  async getOperatorTemplates(operatorId) {
    try {
      const { data: templates, error } = await supabase
        .from('tours')
        .select('*')
        .eq('operator_id', operatorId)
        .eq('is_template', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching templates:', error)
        return createErrorResponse('FETCH_TEMPLATES_FAILED', error.message, error)
      }

      return createSuccessResponse(templates || [], `Found ${templates?.length || 0} templates`)

    } catch (error) {
      console.error('❌ Error in getOperatorTemplates:', error)
      return createErrorResponse('UNEXPECTED_ERROR', error.message, error)
    }
  },

  /**
   * Get comprehensive template dependencies
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} Standardized response with dependency information
   */
  async getTemplateDependencies(templateId) {
    try {
      console.log('🔍 Checking comprehensive template dependencies:', templateId)

      // Get schedules using this template (with new explicit relationship)
      const { data: schedules, error: schedulesError } = await supabase
        .from('schedules')
        .select(`
          id,
          recurrence_type,
          start_date,
          end_date,
          status,
          created_at
        `)
        .eq('template_id', templateId)

      if (schedulesError) {
        console.warn('Warning: Could not check schedule dependencies:', schedulesError)
      }

      // Get scheduled tours created from this template
      const { data: scheduledTours, error: toursError } = await supabase
        .from('tours')
        .select(`
          id,
          tour_name,
          tour_date,
          time_slot,
          status,
          parent_schedule_id,
          is_customized
        `)
        .eq('parent_template_id', templateId)
        .eq('activity_type', 'scheduled')

      if (toursError) {
        console.warn('Warning: Could not check tour dependencies:', toursError)
      }

      // Get active bookings for scheduled tours from this template
      const tourIds = scheduledTours?.map(t => t.id) || []
      let activeBookings = []
      if (tourIds.length > 0) {
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            id,
            tour_id,
            booking_status,
            customer_email,
            total_amount,
            commission_locked_at,
            tours(tour_name, tour_date, time_slot)
          `)
          .in('tour_id', tourIds)
          .in('booking_status', ['pending', 'confirmed'])

        if (bookingsError) {
          console.warn('Warning: Could not check booking dependencies:', bookingsError)
        } else {
          activeBookings = bookings || []
        }
      }

      // Calculate dependency statistics
      const stats = {
        schedules: {
          total: schedules?.length || 0,
          active: schedules?.filter(s => s.status === 'active').length || 0,
          details: schedules || []
        },
        scheduledTours: {
          total: scheduledTours?.length || 0,
          active: scheduledTours?.filter(t => t.status === 'active').length || 0,
          customized: scheduledTours?.filter(t => t.is_customized).length || 0,
          details: scheduledTours || []
        },
        activeBookings: {
          total: activeBookings.length,
          totalAmount: activeBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0),
          lockedBookings: activeBookings.filter(b => b.commission_locked_at).length,
          details: activeBookings
        }
      }

      // Determine if template can be safely deleted
      const canDelete = stats.activeBookings.total === 0
      const hasImpact = stats.schedules.total > 0 || stats.scheduledTours.total > 0

      // Generate impact warnings
      const warnings = this.generateDependencyWarnings(stats)
      const risks = this.generateDeletionRisks(stats)

      return createSuccessResponse({
        canDelete,
        hasImpact,
        statistics: stats,
        warnings,
        risks,
        recommendedActions: this.getRecommendedActions(stats, canDelete)
      }, 'Dependency analysis completed')

    } catch (error) {
      console.error('❌ Error in getTemplateDependencies:', error)
      return createErrorResponse('DEPENDENCY_CHECK_FAILED', error.message, error)
    }
  },

  /**
   * Safe template deletion with comprehensive checking
   * @param {string} templateId - Template ID
   * @param {Object} options - Deletion options
   * @returns {Promise<Object>} Standardized response
   */
  async deleteTemplate(templateId, options = {}) {
    try {
      console.log('🗑️ Attempting safe template deletion:', templateId)

      // Step 1: Check comprehensive dependencies
      const dependencyCheck = await this.getTemplateDependencies(templateId)
      if (!dependencyCheck.success) {
        return dependencyCheck
      }

      const { canDelete, statistics, warnings, risks } = dependencyCheck.data

      // Step 2: Enforce deletion rules
      if (!canDelete) {
        return createErrorResponse(
          'TEMPLATE_HAS_ACTIVE_BOOKINGS',
          'Cannot delete template with active bookings',
          {
            activeBookings: statistics.activeBookings.total,
            lockedBookings: statistics.activeBookings.lockedBookings,
            totalAmount: statistics.activeBookings.totalAmount,
            bookingDetails: statistics.activeBookings.details
          }
        )
      }

      // Step 3: Handle force deletion option
      if (statistics.schedules.total > 0 && !options.forceDelete) {
        return createErrorResponse(
          'TEMPLATE_HAS_DEPENDENCIES',
          'Template has schedules and tours that depend on it',
          {
            schedules: statistics.schedules.total,
            tours: statistics.scheduledTours.total,
            customizedTours: statistics.scheduledTours.customized,
            warnings,
            risks,
            message: 'Use forceDelete option to proceed with cascade deletion'
          }
        )
      }

      // Step 4: Perform cascade deletion if forced
      const deletionResults = {
        templatesDeleted: 0,
        schedulesDeleted: 0,
        toursDeleted: 0,
        errors: []
      }

      if (options.forceDelete && statistics.schedules.total > 0) {
        console.log('🔥 Performing cascade deletion...')

        // Delete scheduled tours first
        if (statistics.scheduledTours.total > 0) {
          const { error: toursDeleteError } = await supabase
            .from('tours')
            .delete()
            .eq('parent_template_id', templateId)

          if (toursDeleteError) {
            console.error('Error deleting scheduled tours:', toursDeleteError)
            deletionResults.errors.push(`Tour deletion failed: ${toursDeleteError.message}`)
          } else {
            deletionResults.toursDeleted = statistics.scheduledTours.total
            console.log(`✅ Deleted ${statistics.scheduledTours.total} scheduled tours`)
          }
        }

        // Delete schedules
        const { error: schedulesDeleteError } = await supabase
          .from('schedules')
          .delete()
          .eq('template_id', templateId)

        if (schedulesDeleteError) {
          console.error('Error deleting schedules:', schedulesDeleteError)
          deletionResults.errors.push(`Schedule deletion failed: ${schedulesDeleteError.message}`)
        } else {
          deletionResults.schedulesDeleted = statistics.schedules.total
          console.log(`✅ Deleted ${statistics.schedules.total} schedules`)
        }
      }

      // Step 5: Delete the template (soft delete by setting status to 'cancelled')
      const { data: template, error: templateDeleteError } = await supabase
        .from('tours')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .eq('is_template', true)
        .select()
        .single()

      if (templateDeleteError) {
        console.error('❌ Template deletion failed:', templateDeleteError)
        return createErrorResponse('TEMPLATE_DELETE_FAILED', templateDeleteError.message, {
          templateDeleteError,
          partialDeletionResults: deletionResults
        })
      }

      deletionResults.templatesDeleted = 1
      console.log('✅ Template deleted successfully:', templateId)

      return createSuccessResponse({
        templateId,
        deletionResults,
        originalDependencies: statistics
      }, `Template and ${deletionResults.schedulesDeleted} schedules, ${deletionResults.toursDeleted} tours deleted successfully`)

    } catch (error) {
      console.error('❌ Error in deleteTemplate:', error)
      return createErrorResponse('UNEXPECTED_ERROR', error.message, error)
    }
  },

  /**
   * Update an existing template with dependency impact analysis
   * @param {string} templateId - Template ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Standardized response
   */
  async updateTemplate(templateId, updateData) {
    try {
      console.log('📝 Updating template with dependency analysis:', templateId)

      // Check dependencies first to understand impact
      const dependencyCheck = await this.getTemplateDependencies(templateId)
      if (dependencyCheck.success) {
        const { statistics } = dependencyCheck.data
        
        if (statistics.scheduledTours.total > 0) {
          console.log(`⚠️ Template update will affect ${statistics.scheduledTours.total} scheduled tours`)
        }
      }

      const { data: template, error } = await supabase
        .from('tours')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .eq('is_template', true)
        .select()
        .single()

      if (error) {
        console.error('❌ Template update failed:', error)
        return createErrorResponse('TEMPLATE_UPDATE_FAILED', error.message, error)
      }

      console.log('✅ Template updated successfully')
      
      const response = createSuccessResponse(template, 'Template updated successfully')
      
      // Include dependency impact information
      if (dependencyCheck.success) {
        response.impactAnalysis = {
          affectedSchedules: dependencyCheck.data.statistics.schedules.total,
          affectedTours: dependencyCheck.data.statistics.scheduledTours.total,
          recommendations: dependencyCheck.data.recommendedActions
        }
      }

      return response

    } catch (error) {
      console.error('❌ Error in updateTemplate:', error)
      return createErrorResponse('UNEXPECTED_ERROR', error.message, error)
    }
  },

  /**
   * Generate dependency warnings for UI display
   * @param {Object} stats - Dependency statistics
   * @returns {Array} Array of warning messages
   */
  generateDependencyWarnings(stats) {
    const warnings = []

    if (stats.schedules.total > 0) {
      warnings.push(`This template is used by ${stats.schedules.total} schedule(s)`)
    }

    if (stats.scheduledTours.total > 0) {
      warnings.push(`${stats.scheduledTours.total} tour instances have been generated from this template`)
    }

    if (stats.scheduledTours.customized > 0) {
      warnings.push(`${stats.scheduledTours.customized} tour instances have custom modifications that will be lost`)
    }

    if (stats.activeBookings.total > 0) {
      warnings.push(`${stats.activeBookings.total} customers have active bookings for tours from this template`)
    }

    return warnings
  },

  /**
   * Generate deletion risk assessment
   * @param {Object} stats - Dependency statistics
   * @returns {Array} Array of risk descriptions
   */
  generateDeletionRisks(stats) {
    const risks = []

    if (stats.activeBookings.total > 0) {
      risks.push({
        level: 'critical',
        message: `${stats.activeBookings.total} active bookings will be orphaned`,
        impact: 'Customer bookings may be lost or become invalid'
      })
    }

    if (stats.activeBookings.lockedBookings > 0) {
      risks.push({
        level: 'critical',
        message: `${stats.activeBookings.lockedBookings} bookings have locked commissions`,
        impact: 'Financial records may be affected'
      })
    }

    if (stats.scheduledTours.customized > 0) {
      risks.push({
        level: 'high',
        message: `${stats.scheduledTours.customized} customized tours will be deleted`,
        impact: 'Custom pricing, notes, and settings will be permanently lost'
      })
    }

    if (stats.schedules.active > 0) {
      risks.push({
        level: 'medium',
        message: `${stats.schedules.active} active schedules will be removed`,
        impact: 'No new tours will be generated from these schedules'
      })
    }

    return risks
  },

  /**
   * Get recommended actions based on dependencies
   * @param {Object} stats - Dependency statistics
   * @param {boolean} canDelete - Whether template can be safely deleted
   * @returns {Array} Array of recommended actions
   */
  getRecommendedActions(stats, canDelete) {
    const actions = []

    if (!canDelete) {
      actions.push({
        priority: 'high',
        action: 'Wait for active bookings to complete or be cancelled',
        reason: 'Template cannot be deleted while customers have active bookings'
      })
    }

    if (stats.scheduledTours.customized > 0) {
      actions.push({
        priority: 'medium',
        action: 'Export or backup customized tour data',
        reason: 'Custom modifications will be permanently lost'
      })
    }

    if (stats.schedules.total > 0) {
      actions.push({
        priority: 'medium',
        action: 'Consider deactivating schedules first',
        reason: 'Allows gradual phase-out instead of immediate deletion'
      })
    }

    if (canDelete && stats.schedules.total === 0) {
      actions.push({
        priority: 'low',
        action: 'Safe to delete - no dependencies',
        reason: 'Template has no active schedules or bookings'
      })
    }

    return actions
  },

  /**
   * Validate template data
   * @param {Object} templateData - Template data to validate
   * @returns {Object} Validation result
   */
  validateTemplateData(templateData) {
    const errors = []

    try {
      // Required fields
      if (!templateData.operator_id) errors.push('OPERATOR_ID_REQUIRED')
      if (!templateData.tour_name) errors.push('TOUR_NAME_REQUIRED')
      if (!templateData.tour_type) errors.push('TOUR_TYPE_REQUIRED')

      // Data type validation
      if (templateData.max_capacity && (typeof templateData.max_capacity !== 'number' || templateData.max_capacity <= 0)) {
        errors.push('INVALID_CAPACITY')
      }

      if (templateData.original_price_adult && (typeof templateData.original_price_adult !== 'number' || templateData.original_price_adult < 0)) {
        errors.push('INVALID_ADULT_PRICE')
      }

      if (templateData.auto_close_hours && (typeof templateData.auto_close_hours !== 'number' || templateData.auto_close_hours < 0)) {
        errors.push('INVALID_AUTO_CLOSE_HOURS')
      }

      // UUID format validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (templateData.operator_id && !uuidRegex.test(templateData.operator_id)) {
        errors.push('INVALID_OPERATOR_ID_FORMAT')
      }

    } catch (error) {
      errors.push(`VALIDATION_ERROR: ${error.message}`)
    }

    return {
      valid: errors.length === 0,
      errors: errors
    }
  }
}

export default templateService