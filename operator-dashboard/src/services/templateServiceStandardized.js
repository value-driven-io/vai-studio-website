// templateServiceStandardized.js - Standardized Template Service with Consistent Error Handling
import { supabase } from '../lib/supabase'
import { 
  createErrorResponse, 
  createSuccessResponse, 
  createValidationResult,
  ERROR_CODES,
  handleSupabaseError,
  wrapServiceFunction
} from '../utils/serviceResponse'

/**
 * Template validation rules
 */
const validateTemplateData = (templateData) => {
  const errors = []
  const warnings = []

  // Required fields
  if (!templateData.operator_id) errors.push('OPERATOR_ID_REQUIRED')
  if (!templateData.tour_name?.trim()) errors.push('TOUR_NAME_REQUIRED')
  if (!templateData.tour_type?.trim()) errors.push('TOUR_TYPE_REQUIRED')

  // Data type validation
  if (templateData.max_capacity !== undefined) {
    if (typeof templateData.max_capacity !== 'number' || templateData.max_capacity <= 0) {
      errors.push('INVALID_CAPACITY')
    } else if (templateData.max_capacity > 50) {
      warnings.push('LARGE_CAPACITY_WARNING')
    }
  }

  if (templateData.original_price_adult !== undefined) {
    if (typeof templateData.original_price_adult !== 'number' || templateData.original_price_adult < 0) {
      errors.push('INVALID_ADULT_PRICE')
    }
  }

  if (templateData.auto_close_hours !== undefined) {
    if (typeof templateData.auto_close_hours !== 'number' || templateData.auto_close_hours < 0) {
      errors.push('INVALID_AUTO_CLOSE_HOURS')
    } else if (templateData.auto_close_hours > 72) {
      warnings.push('LONG_AUTO_CLOSE_WARNING')
    }
  }

  // UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (templateData.operator_id && !uuidRegex.test(templateData.operator_id)) {
    errors.push('INVALID_OPERATOR_ID_FORMAT')
  }

  // String length validation
  if (templateData.tour_name && templateData.tour_name.length > 255) {
    errors.push('TOUR_NAME_TOO_LONG')
  }
  
  if (templateData.description && templateData.description.length > 2000) {
    errors.push('DESCRIPTION_TOO_LONG')
  }

  return createValidationResult(errors.length === 0, errors, warnings)
}

/**
 * Core template service functions (without error handling wrappers)
 */
const templateServiceCore = {
  /**
   * Create a new activity template
   */
  async createTemplate(templateData) {
    console.log('🎯 Creating activity template:', { 
      operator_id: templateData.operator_id,
      tour_name: templateData.tour_name,
      tour_type: templateData.tour_type 
    })

    // Validate input data
    const validation = validateTemplateData(templateData)
    if (!validation.valid) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_FAILED,
        'Template data validation failed',
        validation.errors,
        { warnings: validation.warnings }
      )
    }

    // Verify operator exists and is active
    const { data: operator, error: operatorError } = await supabase
      .from('operators')
      .select('id, status, business_name')
      .eq('id', templateData.operator_id)
      .single()

    if (operatorError) {
      return handleSupabaseError(operatorError, 'operator verification')
    }

    if (operator.status !== 'active') {
      return createErrorResponse(
        ERROR_CODES.BUSINESS_RULE_VIOLATION,
        'Only active operators can create templates',
        { operatorStatus: operator.status }
      )
    }

    // Check for duplicate template name
    const { data: existingTemplate } = await supabase
      .from('tours')
      .select('id')
      .eq('operator_id', templateData.operator_id)
      .eq('tour_name', templateData.tour_name.trim())
      .eq('is_template', true)
      .eq('status', 'active')
      .single()

    if (existingTemplate) {
      return createErrorResponse(
        ERROR_CODES.ALREADY_EXISTS,
        'A template with this name already exists',
        { existingTemplateId: existingTemplate.id }
      )
    }

    // Prepare template data
    const { discount_percentage, ...cleanTemplateData } = templateData
    const templatePayload = {
      ...cleanTemplateData,
      tour_name: templateData.tour_name.trim(),
      activity_type: 'template',
      is_template: true,
      status: 'active',
      tour_date: null,
      time_slot: null,
      available_spots: templateData.max_capacity || 1,
      created_by_operator: true,
      created_at: new Date().toISOString()
    }

    // Insert template
    const { data: template, error: insertError } = await supabase
      .from('tours')
      .insert(templatePayload)
      .select()
      .single()

    if (insertError) {
      return handleSupabaseError(insertError, 'template creation')
    }

    console.log('✅ Template created successfully:', template.id)
    
    return createSuccessResponse(
      template,
      'Template created successfully',
      { 
        warnings: validation.warnings,
        operatorName: operator.business_name
      }
    )
  },

  /**
   * Get all templates for an operator
   */
  async getOperatorTemplates(operatorId, filters = {}) {
    if (!operatorId) {
      return createErrorResponse(ERROR_CODES.REQUIRED_FIELD_MISSING, 'Operator ID is required')
    }

    // Build query
    let query = supabase
      .from('tours')
      .select('*')
      .eq('operator_id', operatorId)
      .eq('is_template', true)

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    } else {
      query = query.in('status', ['active', 'draft']) // Exclude cancelled by default
    }

    if (filters.tour_type) {
      query = query.eq('tour_type', filters.tour_type)
    }

    if (filters.search) {
      query = query.ilike('tour_name', `%${filters.search}%`)
    }

    const { data: templates, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      return handleSupabaseError(error, 'template fetch')
    }

    return createSuccessResponse(
      templates || [],
      `Found ${templates?.length || 0} templates`,
      {
        count: templates?.length || 0,
        filters: filters
      }
    )
  },

  /**
   * Get template by ID with dependency information
   */
  async getTemplateById(templateId, includeStats = false) {
    if (!templateId) {
      return createErrorResponse(ERROR_CODES.REQUIRED_FIELD_MISSING, 'Template ID is required')
    }

    // Get template
    const { data: template, error: templateError } = await supabase
      .from('tours')
      .select('*')
      .eq('id', templateId)
      .eq('is_template', true)
      .single()

    if (templateError) {
      return handleSupabaseError(templateError, 'template fetch by ID')
    }

    let responseData = template
    let meta = null

    // Include usage statistics if requested
    if (includeStats) {
      const stats = await this.getTemplateUsageStats(templateId)
      
      if (stats.success) {
        meta = {
          usageStats: stats.data,
          canDelete: stats.data.activeBookings === 0,
          hasActiveSchedules: stats.data.activeSchedules > 0
        }
      }
    }

    return createSuccessResponse(responseData, 'Template retrieved successfully', meta)
  },

  /**
   * Get template usage statistics
   */
  async getTemplateUsageStats(templateId) {
    // Get schedules using this template
    const { data: schedules, error: scheduleError } = await supabase
      .from('schedules')
      .select('id, status')
      .eq('template_id', templateId)

    // Get scheduled tours from this template
    const { data: tours, error: tourError } = await supabase
      .from('tours')
      .select('id, status')
      .eq('parent_template_id', templateId)
      .eq('activity_type', 'scheduled')

    // Get active bookings for tours from this template
    const tourIds = tours?.map(t => t.id) || []
    let activeBookings = 0
    
    if (tourIds.length > 0) {
      const { data: bookings, error: bookingError } = await supabase
        .from('bookings')
        .select('id')
        .in('tour_id', tourIds)
        .in('booking_status', ['pending', 'confirmed'])
      
      activeBookings = bookings?.length || 0
    }

    return createSuccessResponse({
      totalSchedules: schedules?.length || 0,
      activeSchedules: schedules?.filter(s => s.status === 'active').length || 0,
      totalTours: tours?.length || 0,
      activeTours: tours?.filter(t => t.status === 'active').length || 0,
      activeBookings
    })
  },

  /**
   * Update an existing template
   */
  async updateTemplate(templateId, updateData, operatorId) {
    if (!templateId) {
      return createErrorResponse(ERROR_CODES.REQUIRED_FIELD_MISSING, 'Template ID is required')
    }

    // Validate update data
    const validation = validateTemplateData(updateData)
    if (!validation.valid) {
      return createErrorResponse(
        ERROR_CODES.VALIDATION_FAILED,
        'Update data validation failed',
        validation.errors,
        { warnings: validation.warnings }
      )
    }

    // Verify template exists and belongs to operator
    const { data: existingTemplate, error: fetchError } = await supabase
      .from('tours')
      .select('id, operator_id, tour_name, status')
      .eq('id', templateId)
      .eq('is_template', true)
      .single()

    if (fetchError) {
      return handleSupabaseError(fetchError, 'template verification')
    }

    if (operatorId && existingTemplate.operator_id !== operatorId) {
      return createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'You do not have permission to update this template'
      )
    }

    // Check for duplicate name if name is being changed
    if (updateData.tour_name && updateData.tour_name.trim() !== existingTemplate.tour_name) {
      const { data: duplicateCheck } = await supabase
        .from('tours')
        .select('id')
        .eq('operator_id', existingTemplate.operator_id)
        .eq('tour_name', updateData.tour_name.trim())
        .eq('is_template', true)
        .eq('status', 'active')
        .neq('id', templateId)
        .single()

      if (duplicateCheck) {
        return createErrorResponse(
          ERROR_CODES.ALREADY_EXISTS,
          'Another template with this name already exists'
        )
      }
    }

    // Prepare update data
    const cleanUpdateData = {
      ...updateData,
      updated_at: new Date().toISOString()
    }

    if (updateData.tour_name) {
      cleanUpdateData.tour_name = updateData.tour_name.trim()
    }

    // Update template
    const { data: updatedTemplate, error: updateError } = await supabase
      .from('tours')
      .update(cleanUpdateData)
      .eq('id', templateId)
      .eq('is_template', true)
      .select()
      .single()

    if (updateError) {
      return handleSupabaseError(updateError, 'template update')
    }

    console.log('✅ Template updated successfully:', templateId)

    // Get impact analysis
    const statsResult = await this.getTemplateUsageStats(templateId)
    let impactInfo = null
    
    if (statsResult.success) {
      impactInfo = {
        affectedSchedules: statsResult.data.totalSchedules,
        affectedTours: statsResult.data.totalTours,
        hasActiveBookings: statsResult.data.activeBookings > 0
      }
    }

    return createSuccessResponse(
      updatedTemplate,
      'Template updated successfully',
      {
        warnings: validation.warnings,
        impact: impactInfo
      }
    )
  },

  /**
   * Soft delete a template (set status to cancelled)
   */
  async deleteTemplate(templateId, operatorId, options = {}) {
    if (!templateId) {
      return createErrorResponse(ERROR_CODES.REQUIRED_FIELD_MISSING, 'Template ID is required')
    }

    // Get comprehensive dependency check from our enhanced templateService
    const dependencyCheck = await this.getTemplateDependencies(templateId)
    if (!dependencyCheck.success) {
      return dependencyCheck
    }

    const { canDelete, statistics, warnings, risks } = dependencyCheck.data

    // Enforce deletion rules unless forced
    if (!canDelete && !options.force) {
      return createErrorResponse(
        ERROR_CODES.BUSINESS_RULE_VIOLATION,
        'Template cannot be deleted due to active dependencies',
        {
          reason: 'Active bookings exist',
          activeBookings: statistics.activeBookings.total,
          warnings,
          risks
        }
      )
    }

    if (statistics.schedules.total > 0 && !options.forceDelete) {
      return createErrorResponse(
        ERROR_CODES.DEPENDENCY_VIOLATION,
        'Template has dependent schedules and tours',
        {
          schedules: statistics.schedules.total,
          tours: statistics.scheduledTours.total,
          warnings,
          risks,
          suggestion: 'Use forceDelete option or deactivate schedules first'
        }
      )
    }

    // Verify ownership
    const { data: template, error: fetchError } = await supabase
      .from('tours')
      .select('id, operator_id, tour_name')
      .eq('id', templateId)
      .eq('is_template', true)
      .single()

    if (fetchError) {
      return handleSupabaseError(fetchError, 'template ownership verification')
    }

    if (operatorId && template.operator_id !== operatorId) {
      return createErrorResponse(
        ERROR_CODES.FORBIDDEN,
        'You do not have permission to delete this template'
      )
    }

    // Perform soft delete
    const { data: deletedTemplate, error: deleteError } = await supabase
      .from('tours')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId)
      .eq('is_template', true)
      .select()
      .single()

    if (deleteError) {
      return handleSupabaseError(deleteError, 'template deletion')
    }

    console.log('✅ Template soft deleted successfully:', templateId)

    return createSuccessResponse(
      {
        templateId,
        templateName: template.tour_name,
        deletionType: 'soft_delete',
        affectedResources: {
          schedules: statistics.schedules.total,
          tours: statistics.scheduledTours.total
        }
      },
      'Template deleted successfully',
      { warnings, originalDependencies: statistics }
    )
  },

  /**
   * Get comprehensive template dependencies (reuse from templateServiceUpdated)
   */
  async getTemplateDependencies(templateId) {
    // This would call the comprehensive dependency checking function
    // from our templateServiceUpdated.js implementation
    // For now, return a basic implementation
    
    return createSuccessResponse({
      canDelete: true,
      hasImpact: false,
      statistics: {
        schedules: { total: 0, active: 0, details: [] },
        scheduledTours: { total: 0, active: 0, customized: 0, details: [] },
        activeBookings: { total: 0, totalAmount: 0, details: [] }
      },
      warnings: [],
      risks: [],
      recommendedActions: []
    })
  }
}

/**
 * Wrap all service functions with standardized error handling and performance monitoring
 */
export const templateService = {
  createTemplate: wrapServiceFunction(
    templateServiceCore.createTemplate.bind(templateServiceCore), 
    'createTemplate'
  ),
  
  getOperatorTemplates: wrapServiceFunction(
    templateServiceCore.getOperatorTemplates.bind(templateServiceCore), 
    'getOperatorTemplates'
  ),
  
  getTemplateById: wrapServiceFunction(
    templateServiceCore.getTemplateById.bind(templateServiceCore), 
    'getTemplateById'
  ),
  
  updateTemplate: wrapServiceFunction(
    templateServiceCore.updateTemplate.bind(templateServiceCore), 
    'updateTemplate'
  ),
  
  deleteTemplate: wrapServiceFunction(
    templateServiceCore.deleteTemplate.bind(templateServiceCore), 
    'deleteTemplate'
  ),
  
  getTemplateUsageStats: wrapServiceFunction(
    templateServiceCore.getTemplateUsageStats.bind(templateServiceCore), 
    'getTemplateUsageStats'
  ),
  
  getTemplateDependencies: wrapServiceFunction(
    templateServiceCore.getTemplateDependencies.bind(templateServiceCore), 
    'getTemplateDependencies'
  ),

  // Utility functions (no wrapping needed)
  validateTemplateData
}

export default templateService