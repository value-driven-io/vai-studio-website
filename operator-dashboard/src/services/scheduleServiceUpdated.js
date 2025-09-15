// Updated scheduleService.js - Using Explicit Template-Schedule Relationships
import { supabase } from '../lib/supabase'
import { formatPolynesianDate } from '../utils/timezone'

// Local timezone helpers to avoid modifying shared timezone.js
const POLYNESIA_TZ = 'Pacific/Tahiti' // UTC-10

const parsePolynesianDate = (dateString) => {
  if (!dateString) return null
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day) // month is 0-indexed
}

const formatPolynesianDateISO = (date) => {
  if (!date) return ''
  const formatted = new Date(date).toLocaleDateString("en-CA", {
    timeZone: POLYNESIA_TZ,
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit'
  })
  return formatted // en-CA locale gives YYYY-MM-DD format
}

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

export const scheduleService = {
  /**
   * Get all schedules with explicit relationships using the new view
   * @param {string} operatorId - The operator's ID
   * @returns {Promise<Object>} Standardized response with schedule records
   */
  async getSchedulesWithRelationships(operatorId) {
    try {
      console.log('📋 Loading schedules with explicit relationships for operator:', operatorId)

      const { data: schedules, error } = await supabase
        .from('schedule_details') // Use new view for clear data access
        .select('*')
        .eq('operator_id', operatorId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching schedules:', error)
        return createErrorResponse('FETCH_SCHEDULES_FAILED', error.message, error)
      }

      console.log(`✅ Loaded ${schedules?.length || 0} schedules with relationships`)
      return createSuccessResponse(schedules || [])

    } catch (error) {
      console.error('Error in getSchedulesWithRelationships:', error)
      return createErrorResponse('UNEXPECTED_ERROR', error.message, error)
    }
  },

  /**
   * Create a template-based schedule with explicit relationship
   * @param {Object} scheduleData - The schedule data including template_id
   * @returns {Promise<Object>} Standardized response with created schedule
   */
  async createTemplateSchedule(scheduleData) {
    try {
      console.log('🚀 Creating template-based schedule:', scheduleData)

      // Step 1: Validate input data
      const validation = this.validateTemplateScheduleData(scheduleData)
      if (!validation.valid) {
        return createErrorResponse('VALIDATION_FAILED', 'Schedule data validation failed', validation.errors)
      }

      // Step 2: Verify operator permissions
      const operatorCheck = await this.verifyOperatorPermissions(scheduleData.operator_id)
      if (!operatorCheck.success) {
        return operatorCheck
      }

      // Step 3: Verify template exists and belongs to operator
      const templateCheck = await this.verifyTemplateAccess(scheduleData.template_id, scheduleData.operator_id)
      if (!templateCheck.success) {
        return templateCheck
      }

      // Step 4: Check for schedule conflicts
      const conflictCheck = await this.checkTemplateScheduleConflicts(scheduleData)
      if (!conflictCheck.success) {
        return conflictCheck
      }

      // Step 5: Prepare schedule data with explicit relationship
      const insertData = {
        operator_id: scheduleData.operator_id,
        template_id: scheduleData.template_id, // Explicit template relationship
        schedule_type: 'template_based', // Clear schedule type
        recurrence_type: scheduleData.recurrence_type,
        days_of_week: scheduleData.days_of_week || null,
        start_time: scheduleData.start_time,
        start_date: scheduleData.start_date,
        end_date: scheduleData.end_date,
        exceptions: scheduleData.exceptions || null,
        // Remove tour_id confusion - not needed for template schedules
        tour_id: null
      }

      // Step 6: Insert schedule
      const { data: newSchedule, error: insertError } = await supabase
        .from('schedules')
        .insert(insertData)
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting template schedule:', insertError)
        return createErrorResponse('DATABASE_INSERT_FAILED', insertError.message, insertError)
      }

      console.log('✅ Template schedule created successfully:', newSchedule.id)

      // Step 7: Generate scheduled tours from template
      const template = templateCheck.data
      const scheduleDataWithId = { ...scheduleData, id: newSchedule.id }
      
      const tourGenerationResult = await this.generateScheduledToursFromTemplate(template, scheduleDataWithId)
      if (!tourGenerationResult.success) {
        // Schedule created but tour generation failed - log warning but don't fail
        console.warn('⚠️ Schedule created but tour generation failed:', tourGenerationResult.error)
      }

      // Step 8: Get complete schedule data with relationships
      const completeSchedule = await this.getScheduleById(newSchedule.id)
      
      return createSuccessResponse({
        ...completeSchedule.data,
        generated_tours_count: tourGenerationResult.success ? tourGenerationResult.data.length : 0,
        tour_generation_status: tourGenerationResult.success ? 'success' : 'failed',
        tour_generation_error: tourGenerationResult.success ? null : tourGenerationResult.error
      }, 'Template schedule created successfully')

    } catch (error) {
      console.error('Error in createTemplateSchedule:', error)
      return createErrorResponse('UNEXPECTED_ERROR', error.message, error)
    }
  },

  /**
   * Get schedule by ID with full relationship data
   * @param {string} scheduleId - Schedule ID
   * @returns {Promise<Object>} Standardized response with schedule data
   */
  async getScheduleById(scheduleId) {
    try {
      const { data: schedule, error } = await supabase
        .from('schedule_details')
        .select('*')
        .eq('id', scheduleId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return createErrorResponse('SCHEDULE_NOT_FOUND', 'Schedule not found')
        }
        return createErrorResponse('FETCH_SCHEDULE_FAILED', error.message, error)
      }

      return createSuccessResponse(schedule)
    } catch (error) {
      return createErrorResponse('UNEXPECTED_ERROR', error.message, error)
    }
  },

  /**
   * Get schedule dependencies before deletion
   * @param {string} scheduleId - Schedule ID
   * @returns {Promise<Object>} Standardized response with dependency information
   */
  async getScheduleDependencies(scheduleId) {
    try {
      console.log('🔍 Checking schedule dependencies:', scheduleId)

      const { data: dependencies, error } = await supabase
        .rpc('get_schedule_dependencies', { schedule_id_param: scheduleId })

      if (error) {
        return createErrorResponse('DEPENDENCY_CHECK_FAILED', error.message, error)
      }

      // Process dependencies into a more usable format
      const dependencyMap = {}
      dependencies.forEach(dep => {
        dependencyMap[dep.dependency_type] = {
          count: dep.dependency_count,
          details: dep.dependency_details
        }
      })

      const canDelete = (dependencyMap.active_bookings?.count || 0) === 0
      const hasScheduledTours = (dependencyMap.scheduled_tours?.count || 0) > 0

      return createSuccessResponse({
        canDelete,
        hasScheduledTours,
        dependencies: dependencyMap,
        warnings: this.generateDependencyWarnings(dependencyMap)
      })

    } catch (error) {
      console.error('Error in getScheduleDependencies:', error)
      return createErrorResponse('UNEXPECTED_ERROR', error.message, error)
    }
  },

  /**
   * Enhanced schedule deletion with comprehensive dependency checking
   * @param {string} scheduleId - Schedule ID
   * @param {string} operatorId - Operator ID for security
   * @returns {Promise<Object>} Standardized response
   */
  async deleteSchedule(scheduleId, operatorId) {
    try {
      console.log('🗑️ Deleting schedule with dependency checking:', scheduleId)

      // Step 1: Check dependencies
      const dependencyCheck = await this.getScheduleDependencies(scheduleId)
      if (!dependencyCheck.success) {
        return dependencyCheck
      }

      if (!dependencyCheck.data.canDelete) {
        return createErrorResponse(
          'SCHEDULE_HAS_DEPENDENCIES', 
          'Cannot delete schedule with active bookings',
          dependencyCheck.data
        )
      }

      // Step 2: Verify ownership
      const { data: schedule, error: fetchError } = await supabase
        .from('schedules')
        .select('id, operator_id, schedule_type')
        .eq('id', scheduleId)
        .eq('operator_id', operatorId)
        .single()

      if (fetchError || !schedule) {
        return createErrorResponse('SCHEDULE_NOT_FOUND', 'Schedule not found or access denied')
      }

      // Step 3: Delete scheduled tours first (if any)
      if (dependencyCheck.data.hasScheduledTours) {
        const { error: tourDeleteError } = await supabase
          .from('tours')
          .delete()
          .eq('parent_schedule_id', scheduleId)
          .eq('operator_id', operatorId)

        if (tourDeleteError) {
          console.warn('Warning: Could not delete all scheduled tours:', tourDeleteError)
        }
      }

      // Step 4: Delete the schedule
      const { error: deleteError } = await supabase
        .from('schedules')
        .delete()
        .eq('id', scheduleId)
        .eq('operator_id', operatorId)

      if (deleteError) {
        return createErrorResponse('DELETE_FAILED', deleteError.message, deleteError)
      }

      console.log('✅ Schedule deleted successfully:', scheduleId)
      return createSuccessResponse(
        { scheduleId, deletedTours: dependencyCheck.data.dependencies.scheduled_tours?.count || 0 },
        'Schedule and related tours deleted successfully'
      )

    } catch (error) {
      console.error('Error in deleteSchedule:', error)
      return createErrorResponse('UNEXPECTED_ERROR', error.message, error)
    }
  },

  /**
   * Verify operator permissions and status
   * @param {string} operatorId - Operator ID
   * @returns {Promise<Object>} Standardized response
   */
  async verifyOperatorPermissions(operatorId) {
    try {
      const { data: operator, error } = await supabase
        .from('operators')
        .select('id, status, commission_rate')
        .eq('id', operatorId)
        .single()

      if (error || !operator) {
        return createErrorResponse('OPERATOR_NOT_FOUND', 'Operator not found')
      }

      if (operator.status !== 'active') {
        return createErrorResponse('OPERATOR_INACTIVE', `Operator status: ${operator.status}`)
      }

      return createSuccessResponse(operator)
    } catch (error) {
      return createErrorResponse('OPERATOR_CHECK_FAILED', error.message, error)
    }
  },

  /**
   * Verify template access and status
   * @param {string} templateId - Template ID
   * @param {string} operatorId - Operator ID
   * @returns {Promise<Object>} Standardized response
   */
  async verifyTemplateAccess(templateId, operatorId) {
    try {
      const { data: template, error } = await supabase
        .from('tours')
        .select('*')
        .eq('id', templateId)
        .eq('operator_id', operatorId)
        .eq('is_template', true)
        .single()

      if (error || !template) {
        return createErrorResponse('TEMPLATE_NOT_FOUND', 'Template not found or access denied')
      }

      if (template.status !== 'active') {
        return createErrorResponse('TEMPLATE_INACTIVE', `Template status: ${template.status}`)
      }

      return createSuccessResponse(template)
    } catch (error) {
      return createErrorResponse('TEMPLATE_CHECK_FAILED', error.message, error)
    }
  },

  /**
   * Enhanced template schedule conflict checking
   * @param {Object} scheduleData - New schedule data
   * @returns {Promise<Object>} Standardized response
   */
  async checkTemplateScheduleConflicts(scheduleData) {
    try {
      // Check for existing schedules with same template + time that might conflict
      const { data: existingSchedules, error } = await supabase
        .from('schedules')
        .select('id, recurrence_type, start_time, start_date, end_date, days_of_week, exceptions')
        .eq('template_id', scheduleData.template_id) // Use explicit template_id
        .eq('start_time', scheduleData.start_time)
        .eq('operator_id', scheduleData.operator_id)

      if (error) {
        console.warn('Warning: Could not check conflicts:', error)
        return createSuccessResponse(null, 'Conflict check skipped due to error')
      }

      if (!existingSchedules || existingSchedules.length === 0) {
        return createSuccessResponse(null, 'No conflicts found')
      }

      // Check for actual conflicts
      for (const existing of existingSchedules) {
        const conflict = this.detectDateTimeConflict(scheduleData, existing)
        if (conflict.hasConflict) {
          return createErrorResponse(
            'SCHEDULE_CONFLICT',
            'Schedule conflicts with existing schedule',
            {
              conflictingScheduleId: existing.id,
              conflictDate: conflict.conflictDate,
              existingSchedule: existing
            }
          )
        }
      }

      return createSuccessResponse(null, 'No conflicts found')
    } catch (error) {
      console.warn('Warning: Conflict check failed:', error)
      return createSuccessResponse(null, 'Conflict check skipped due to error')
    }
  },

  /**
   * Generate dependency warnings for UI display
   * @param {Object} dependencyMap - Dependency information
   * @returns {Array} Array of warning messages
   */
  generateDependencyWarnings(dependencyMap) {
    const warnings = []

    if (dependencyMap.scheduled_tours?.count > 0) {
      warnings.push(`This schedule has generated ${dependencyMap.scheduled_tours.count} tour instances`)
    }

    if (dependencyMap.active_bookings?.count > 0) {
      warnings.push(`${dependencyMap.active_bookings.count} customers have active bookings for this schedule`)
    }

    return warnings
  },

  /**
   * Validate template schedule data with comprehensive checks
   * @param {Object} scheduleData - Schedule data to validate
   * @returns {Object} Validation result
   */
  validateTemplateScheduleData(scheduleData) {
    const errors = []

    try {
      // Required fields
      if (!scheduleData.template_id) errors.push('TEMPLATE_ID_REQUIRED')
      if (!scheduleData.operator_id) errors.push('OPERATOR_ID_REQUIRED')
      if (!scheduleData.recurrence_type) errors.push('RECURRENCE_TYPE_REQUIRED')
      if (!scheduleData.start_time) errors.push('START_TIME_REQUIRED')
      if (!scheduleData.start_date) errors.push('START_DATE_REQUIRED')
      if (!scheduleData.end_date) errors.push('END_DATE_REQUIRED')

      // UUID format validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (scheduleData.template_id && !uuidRegex.test(scheduleData.template_id)) {
        errors.push('INVALID_TEMPLATE_ID_FORMAT')
      }
      if (scheduleData.operator_id && !uuidRegex.test(scheduleData.operator_id)) {
        errors.push('INVALID_OPERATOR_ID_FORMAT')
      }

      // Recurrence validation
      const validRecurrenceTypes = ['once', 'daily', 'weekly', 'monthly']
      if (scheduleData.recurrence_type && !validRecurrenceTypes.includes(scheduleData.recurrence_type)) {
        errors.push('INVALID_RECURRENCE_TYPE')
      }

      // Weekly recurrence requires days
      if (scheduleData.recurrence_type === 'weekly' && (!scheduleData.days_of_week || scheduleData.days_of_week.length === 0)) {
        errors.push('WEEKLY_REQUIRES_DAYS')
      }

      // Time format validation
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (scheduleData.start_time && !timeRegex.test(scheduleData.start_time)) {
        errors.push('INVALID_TIME_FORMAT')
      }

      // Date validation
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (scheduleData.start_date && !dateRegex.test(scheduleData.start_date)) {
        errors.push('INVALID_START_DATE_FORMAT')
      }
      if (scheduleData.end_date && !dateRegex.test(scheduleData.end_date)) {
        errors.push('INVALID_END_DATE_FORMAT')
      }

      // Date logic validation
      if (scheduleData.start_date && scheduleData.end_date) {
        const startDate = new Date(scheduleData.start_date)
        const endDate = new Date(scheduleData.end_date)

        if (endDate <= startDate) {
          errors.push('END_DATE_BEFORE_START')
        }

        // Reasonable date range (2 years max)
        const maxRange = 365 * 2 * 24 * 60 * 60 * 1000
        if (endDate - startDate > maxRange) {
          errors.push('DATE_RANGE_TOO_LARGE')
        }
      }

    } catch (error) {
      errors.push(`VALIDATION_ERROR: ${error.message}`)
    }

    return {
      valid: errors.length === 0,
      errors: errors
    }
  },

  /**
   * Generate scheduled tours from template with proper relationships
   * @param {Object} template - Template data
   * @param {Object} scheduleData - Schedule data with ID
   * @returns {Promise<Object>} Standardized response with generated tours
   */
  async generateScheduledToursFromTemplate(template, scheduleData) {
    try {
      console.log('🔄 Generating scheduled tours from template:', template.id)

      const dates = this.generateDatesFromSchedule(scheduleData)
      if (dates.length === 0) {
        return createSuccessResponse([], 'No dates generated from schedule pattern')
      }

      const scheduledTours = []

      for (const date of dates) {
        const scheduledTourData = {
          // Core identification
          operator_id: template.operator_id,
          tour_name: template.tour_name,
          tour_type: template.tour_type || 'Lagoon Tour',
          description: template.description,
          
          // Schedule-specific fields with explicit relationships
          tour_date: date,
          time_slot: scheduleData.start_time,
          activity_type: 'scheduled',
          is_template: false,
          parent_template_id: template.id, // Explicit template reference
          parent_schedule_id: scheduleData.id, // Explicit schedule reference
          
          // Copy all template data comprehensively
          max_capacity: template.max_capacity || 1,
          available_spots: template.max_capacity || 1,
          original_price_adult: template.original_price_adult || 0,
          discount_price_adult: template.discount_price_adult || template.original_price_adult || 0,
          discount_price_child: template.discount_price_child || 0,
          meeting_point: template.meeting_point || 'TBD',
          location: template.location,
          meeting_point_gps: template.meeting_point_gps,
          duration_hours: template.duration_hours,
          pickup_available: template.pickup_available || false,
          equipment_included: template.equipment_included || false,
          food_included: template.food_included || false,
          drinks_included: template.drinks_included || false,
          whale_regulation_compliant: template.whale_regulation_compliant || false,
          weather_dependent: template.weather_dependent !== undefined ? template.weather_dependent : true,
          pickup_locations: template.pickup_locations || null,
          languages: template.languages || ['French'],
          max_whale_group_size: template.max_whale_group_size || 6,
          min_age: template.min_age,
          max_age: template.max_age,
          fitness_level: template.fitness_level,
          requirements: template.requirements,
          restrictions: template.restrictions,
          status: template.status || 'active',
          booking_deadline: template.booking_deadline,
          auto_close_hours: template.auto_close_hours || 2,
          backup_plan: template.backup_plan,
          special_notes: template.special_notes,
          created_by_operator: true,
          
          // Initialize customization tracking
          is_customized: false,
          frozen_fields: [],
          overrides: {},
          customization_timestamp: null
        }

        const { data: scheduledTour, error } = await supabase
          .from('tours')
          .insert(scheduledTourData)
          .select()
          .single()

        if (error) {
          console.error('Error creating scheduled tour:', error)
          return createErrorResponse('TOUR_GENERATION_FAILED', error.message, error)
        }

        scheduledTours.push(scheduledTour)
      }

      console.log(`✅ Generated ${scheduledTours.length} scheduled tours`)
      return createSuccessResponse(scheduledTours, `Generated ${scheduledTours.length} tours from template`)

    } catch (error) {
      console.error('Error generating scheduled tours:', error)
      return createErrorResponse('TOUR_GENERATION_ERROR', error.message, error)
    }
  },

  /**
   * Generate dates from schedule configuration
   * @param {Object} scheduleData - Schedule configuration
   * @returns {Array} Array of date strings in YYYY-MM-DD format
   */
  generateDatesFromSchedule(scheduleData) {
    console.log('📅 Generating dates from schedule:', {
      start_date: scheduleData.start_date,
      end_date: scheduleData.end_date,
      recurrence_type: scheduleData.recurrence_type,
      days_of_week: scheduleData.days_of_week,
      exceptions: scheduleData.exceptions
    })
    
    const dates = []
    const startDate = new Date(scheduleData.start_date + 'T12:00:00')
    const endDate = new Date(scheduleData.end_date + 'T12:00:00')
    const exceptions = (scheduleData.exceptions || []).map(date => 
      typeof date === 'string' && date.includes('T') ? date.split('T')[0] : date
    )

    if (scheduleData.recurrence_type === 'once') {
      if (!exceptions.includes(scheduleData.start_date)) {
        dates.push(scheduleData.start_date)
      }
    } else if (scheduleData.recurrence_type === 'daily') {
      let currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        const dateStr = formatPolynesianDateISO(currentDate)
        if (!exceptions.includes(dateStr)) {
          dates.push(dateStr)
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
    } else if (scheduleData.recurrence_type === 'weekly') {
      const daysOfWeek = scheduleData.days_of_week || []
      let currentDate = new Date(startDate)
      
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay()
        
        if (daysOfWeek.includes(String(dayOfWeek)) || daysOfWeek.includes(Number(dayOfWeek))) {
          const dateStr = formatPolynesianDateISO(currentDate)
          if (!exceptions.includes(dateStr)) {
            dates.push(dateStr)
          }
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
    } else if (scheduleData.recurrence_type === 'monthly') {
      let currentDate = new Date(startDate)
      const dayOfMonth = startDate.getDate()
      
      while (currentDate <= endDate) {
        if (currentDate.getDate() === dayOfMonth) {
          const dateStr = formatPolynesianDateISO(currentDate)
          if (!exceptions.includes(dateStr)) {
            dates.push(dateStr)
          }
        }
        currentDate.setDate(currentDate.getDate() + 1)
      }
    }

    const sortedDates = dates.sort()
    console.log(`📅 Generated ${sortedDates.length} dates:`, sortedDates.slice(0, 5), sortedDates.length > 5 ? '...' : '')
    return sortedDates
  },

  /**
   * Detect conflicts between schedule patterns
   * @param {Object} newSchedule - New schedule data
   * @param {Object} existingSchedule - Existing schedule data
   * @returns {Object} Conflict detection result
   */
  detectDateTimeConflict(newSchedule, existingSchedule) {
    const newStart = new Date(newSchedule.start_date)
    const newEnd = new Date(newSchedule.end_date)
    const existingStart = new Date(existingSchedule.start_date)
    const existingEnd = new Date(existingSchedule.end_date)

    // Check for date range overlap
    const hasDateOverlap = newStart <= existingEnd && newEnd >= existingStart

    if (!hasDateOverlap) {
      return { hasConflict: false }
    }

    // For same recurrence type and overlapping dates, it's a conflict
    if (newSchedule.recurrence_type === existingSchedule.recurrence_type) {
      return { 
        hasConflict: true, 
        conflictDate: `${newSchedule.start_date}_${newSchedule.start_time}`
      }
    }

    return { hasConflict: false }
  }

  // ... Additional methods can be added here following the same standardized pattern
}