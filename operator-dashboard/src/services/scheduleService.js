// operator-dashboard/src/services/scheduleService.js - PHASE 3 with i18n + Edge Cases
import { supabase } from '../lib/supabase'

export const scheduleService = {
  /**
   * Get all schedules for the authenticated operator
   * @param {string} operatorId - The operator's ID
   * @returns {Promise<Array>} Array of schedule records
   */
  async getSchedules(operatorId) {
    try {
      // First, get schedules without join
      const { data: schedules, error: schedulesError } = await supabase
        .from('schedules')
        .select('*')
        .eq('operator_id', operatorId)
        .order('created_at', { ascending: false })

      if (schedulesError) {
        console.error('Error fetching schedules:', schedulesError)
        throw schedulesError
      }

      if (!schedules || schedules.length === 0) {
        return []
      }

      // Get unique tour IDs
      const tourIds = [...new Set(schedules.map(s => s.tour_id))]

      // Fetch tour details separately
      const { data: tours, error: toursError } = await supabase
        .from('tours')
        .select('id, tour_name, tour_type, max_capacity, discount_price_adult, status')
        .in('id', tourIds)

      if (toursError) {
        console.error('Error fetching tours:', toursError)
        // Continue without tour data rather than failing completely
      }

      // Merge the data
      const schedulesWithTours = schedules.map(schedule => ({
        ...schedule,
        tours: tours?.find(tour => tour.id === schedule.tour_id) || null
      }))

      return schedulesWithTours
    } catch (error) {
      console.error('Error in getSchedules:', error)
      throw error
    }
  },

  /**
   * ✅ PHASE 3: Create a new schedule with comprehensive validation + edge case handling
   * @param {Object} scheduleData - The schedule data to create
   * @param {string} scheduleData.tour_id - UUID of the tour (required)
   * @param {string} scheduleData.operator_id - UUID of the operator (required)  
   * @param {string} scheduleData.recurrence_type - 'once', 'daily', 'weekly', 'monthly' (required)
   * @param {Array<number>} scheduleData.days_of_week - Array of integers 1-7 for Mon-Sun (optional for 'once')
   * @param {string} scheduleData.start_time - Time in HH:MM format (required)
   * @param {string} scheduleData.start_date - Date in YYYY-MM-DD format (required)
   * @param {string} scheduleData.end_date - Date in YYYY-MM-DD format (required)
   * @param {Array<string>} scheduleData.exceptions - Array of dates to skip in YYYY-MM-DD format (optional)
   * @returns {Promise<Object>} Created schedule record
   * @throws {Error} Translated error codes for component handling
   */
  async createSchedule(scheduleData) {
    try {
      console.log('🚀 Creating schedule with data:', scheduleData)

      // Step 1: Basic input validation
      const validation = this.validateScheduleData(scheduleData)
      if (!validation.valid) {
        throw new Error(`VALIDATION_FAILED|${validation.errors.join('|')}`)
      }

      // Step 2: 🛡️ EDGE CASE - Verify operator status and permissions
      const { data: operator, error: operatorError } = await supabase
        .from('operators')
        .select('id, status, commission_rate')
        .eq('id', scheduleData.operator_id)
        .single()

      if (operatorError || !operator) {
        throw new Error('OPERATOR_NOT_FOUND')
      }

      if (operator.status !== 'active') {
        throw new Error(`OPERATOR_INACTIVE|${operator.status}`)
      }

      // Step 3: 🛡️ EDGE CASE - Verify tour exists, belongs to operator, and is active
      const { data: tour, error: tourError } = await supabase
        .from('tours')  
        .select('id, tour_name, operator_id, status, tour_date, time_slot')
        .eq('id', scheduleData.tour_id)
        .eq('operator_id', scheduleData.operator_id)
        .single()

      if (tourError || !tour) {
        throw new Error('TOUR_NOT_FOUND_OR_ACCESS_DENIED')
      }

      if (tour.status !== 'active') {
        throw new Error(`TOUR_INACTIVE|${tour.status}`)
      }

      // Step 4: 🛡️ EDGE CASE - Check for schedule conflicts
      const conflictCheck = await this.checkScheduleConflicts(scheduleData, tour)
      if (!conflictCheck.valid) {
        throw new Error(`SCHEDULE_CONFLICT|${conflictCheck.reason}`)
      }

      // Step 5: 🛡️ EDGE CASE - Verify date logic against existing tour
      if (scheduleData.recurrence_type === 'once') {
        const scheduleDate = new Date(scheduleData.start_date)
        const tourDate = new Date(tour.tour_date)
        if (scheduleDate.getTime() !== tourDate.getTime()) {
          throw new Error('SINGLE_SCHEDULE_DATE_MISMATCH')
        }
      }

      // Step 6: Prepare data for insertion
      const insertData = {
        tour_id: scheduleData.tour_id,
        operator_id: scheduleData.operator_id,
        recurrence_type: scheduleData.recurrence_type,
        days_of_week: scheduleData.days_of_week || null,
        start_time: scheduleData.start_time,
        start_date: scheduleData.start_date,
        end_date: scheduleData.end_date,
        exceptions: scheduleData.exceptions || null
      }

      // Step 7: Insert into database
      const { data: newSchedule, error: insertError } = await supabase
        .from('schedules')
        .insert(insertData)
        .select()
        .single()

      if (insertError) {
        console.error('Error inserting schedule:', insertError)
        throw new Error(`DATABASE_INSERT_FAILED|${insertError.message}`)
      }

      console.log('✅ Schedule created successfully:', newSchedule.id)

      // Step 8: Return schedule with tour data attached
      return {
        ...newSchedule,
        tours: {
          id: tour.id,
          tour_name: tour.tour_name,
          status: tour.status
        }
      }

    } catch (error) {
      console.error('Error in createSchedule:', error)
      // Preserve error codes for component translation
      throw error
    }  
  },

  /**
   * ✅ PHASE 3: Update an existing schedule with edge case protection
   */
  async updateSchedule(scheduleId, updateData, operatorId) {
    try {
      console.log('🔄 Updating schedule:', scheduleId)

      // Step 1: Verify schedule exists and belongs to active operator
      const { data: existingSchedule, error: fetchError } = await supabase
        .from('schedules')
        .select('*, tours!inner(id, tour_name, status)')
        .eq('id', scheduleId)
        .eq('operator_id', operatorId)
        .single()

      if (fetchError || !existingSchedule) {
        throw new Error('SCHEDULE_NOT_FOUND_OR_ACCESS_DENIED')
      }

      // Step 2: 🛡️ EDGE CASE - Check if schedule has active bookings
      const activeBookingsCheck = await this.checkActiveBookings(scheduleId)
      if (!activeBookingsCheck.canModify) {
        throw new Error(`SCHEDULE_HAS_ACTIVE_BOOKINGS|${activeBookingsCheck.count}`)
      }

      // Step 3: 🛡️ EDGE CASE - Verify linked tour is still active
      if (existingSchedule.tours && existingSchedule.tours.status !== 'active') {
        throw new Error(`LINKED_TOUR_INACTIVE|${existingSchedule.tours.status}`)
      }

      // Step 4: Validate update data  
      const validation = this.validateScheduleData({ ...existingSchedule, ...updateData }, true)
      if (!validation.valid) {
        throw new Error(`VALIDATION_FAILED|${validation.errors.join('|')}`)
      }

      // Step 5: Prepare update data (only allow certain fields)
      const allowedFields = ['recurrence_type', 'days_of_week', 'start_time', 'start_date', 'end_date', 'exceptions']
      const filteredUpdateData = Object.keys(updateData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updateData[key]
          return obj
        }, {})

      // Add updated_at timestamp
      filteredUpdateData.updated_at = new Date().toISOString()

      // Step 6: Update in database
      const { data: updatedSchedule, error: updateError } = await supabase
        .from('schedules')
        .update(filteredUpdateData)
        .eq('id', scheduleId)
        .eq('operator_id', operatorId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating schedule:', updateError)
        throw new Error(`DATABASE_UPDATE_FAILED|${updateError.message}`)
      }

      console.log('✅ Schedule updated successfully:', scheduleId)
      return updatedSchedule

    } catch (error) {
      console.error('Error in updateSchedule:', error)
      throw error
    }
  },

  /**
   * ✅ PHASE 3: Delete a schedule with comprehensive checks
   */
  async deleteSchedule(scheduleId, operatorId) {
    try {
      console.log('🗑️ Deleting schedule:', scheduleId)

      // Step 1: Verify schedule exists and belongs to operator
      const { data: existingSchedule, error: fetchError } = await supabase
        .from('schedules')
        .select('id, tour_id')
        .eq('id', scheduleId)
        .eq('operator_id', operatorId)
        .single()

      if (fetchError || !existingSchedule) {
        throw new Error('SCHEDULE_NOT_FOUND_OR_ACCESS_DENIED')
      }

      // Step 2: 🛡️ EDGE CASE - Check for active bookings
      const { data: activeBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, booking_status, commission_locked_at')
        .eq('schedule_id', scheduleId)
        .in('booking_status', ['pending', 'confirmed'])

      if (bookingsError) {
        console.error('Error checking active bookings:', bookingsError)
        throw new Error(`BOOKINGS_CHECK_FAILED|${bookingsError.message}`)
      }

      if (activeBookings && activeBookings.length > 0) {
        // Check for commission-locked bookings (extra protection)
        const lockedBookings = activeBookings.filter(b => b.commission_locked_at)
        if (lockedBookings.length > 0) {
          throw new Error(`SCHEDULE_HAS_LOCKED_BOOKINGS|${lockedBookings.length}`)
        }
        throw new Error(`SCHEDULE_HAS_ACTIVE_BOOKINGS|${activeBookings.length}`)
      }

      // Step 3: Delete the schedule (will set bookings.schedule_id to NULL due to ON DELETE SET NULL)
      const { error: deleteError } = await supabase
        .from('schedules')
        .delete()
        .eq('id', scheduleId)
        .eq('operator_id', operatorId)

      if (deleteError) {
        console.error('Error deleting schedule:', deleteError)
        throw new Error(`DATABASE_DELETE_FAILED|${deleteError.message}`)
      }

      console.log('✅ Schedule deleted successfully:', scheduleId)
      return true

    } catch (error) {
      console.error('Error in deleteSchedule:', error)
      throw error
    }
  },

  /**
   * ✅ PHASE 3: Duplicate an existing schedule with smart overrides
   */
  async duplicateSchedule(scheduleId, operatorId, overrides = {}) {
    try {
      console.log('📋 Duplicating schedule:', scheduleId)

      // Step 1: Get original schedule with tour data
      const { data: originalSchedule, error: fetchError } = await supabase
        .from('schedules')
        .select('*, tours!inner(id, tour_name, status)')
        .eq('id', scheduleId)
        .eq('operator_id', operatorId)
        .single()

      if (fetchError || !originalSchedule) {
        throw new Error('SCHEDULE_NOT_FOUND_OR_ACCESS_DENIED')
      }

      // Step 2: 🛡️ EDGE CASE - Verify original tour is still active
      if (originalSchedule.tours.status !== 'active') {
        throw new Error(`ORIGINAL_TOUR_INACTIVE|${originalSchedule.tours.status}`)
      }

      // Step 3: Prepare duplicate data with smart defaults
      const duplicateData = {
        tour_id: originalSchedule.tour_id,
        operator_id: originalSchedule.operator_id,
        recurrence_type: originalSchedule.recurrence_type,
        days_of_week: originalSchedule.days_of_week,
        start_time: originalSchedule.start_time,
        start_date: originalSchedule.start_date,
        end_date: originalSchedule.end_date,
        exceptions: originalSchedule.exceptions,
        ...overrides // Apply any overrides (e.g., new dates, different tour)
      }

      // Step 4: Create the duplicate using createSchedule (includes all validation + edge case handling)
      const duplicatedSchedule = await this.createSchedule(duplicateData)

      console.log('✅ Schedule duplicated successfully:', duplicatedSchedule.id)
      return duplicatedSchedule

    } catch (error) {
      console.error('Error in duplicateSchedule:', error)
      throw error
    }
  },

  /**
   * 🛡️ EDGE CASE HELPER: Check for schedule conflicts
   */
  async checkScheduleConflicts(scheduleData, tour) {
    try {
      // Check for existing schedules with same tour + time that might conflict
      const { data: existingSchedules, error } = await supabase
        .from('schedules')
        .select('id, recurrence_type, start_time, start_date, end_date, days_of_week, exceptions')
        .eq('tour_id', scheduleData.tour_id)
        .eq('start_time', scheduleData.start_time)

      if (error) {
        console.error('Error checking schedule conflicts:', error)
        return { valid: true } // Allow on error, logged for monitoring
      }

      if (!existingSchedules || existingSchedules.length === 0) {
        return { valid: true }
      }

      // Implement conflict detection logic
      for (const existing of existingSchedules) {
        const conflict = this.detectDateTimeConflict(scheduleData, existing)
        if (conflict.hasConflict) {
          return { 
            valid: false, 
            reason: `EXISTING_SCHEDULE_CONFLICT|${existing.id}|${conflict.conflictDate}` 
          }
        }
      }

      return { valid: true }

    } catch (error) {
      console.error('Error in checkScheduleConflicts:', error)
      return { valid: true } // Allow on error
    }
  },

  /**
   * 🛡️ EDGE CASE HELPER: Check for active bookings
   */
  async checkActiveBookings(scheduleId) {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('id, booking_status, commission_locked_at')
        .eq('schedule_id', scheduleId)
        .in('booking_status', ['pending', 'confirmed'])

      if (error) {
        console.error('Error checking active bookings:', error)  
        return { canModify: false, count: 0, reason: 'CHECK_FAILED' }
      }

      const activeCount = bookings ? bookings.length : 0
      const lockedCount = bookings ? bookings.filter(b => b.commission_locked_at).length : 0

      return {
        canModify: activeCount === 0,
        count: activeCount,
        lockedCount: lockedCount,
        reason: activeCount > 0 ? 'ACTIVE_BOOKINGS' : null
      }

    } catch (error) {
      console.error('Error in checkActiveBookings:', error)
      return { canModify: false, count: 0, reason: 'CHECK_ERROR' }
    }
  },

  /**
   * 🛡️ EDGE CASE HELPER: Detect date/time conflicts between schedules
   */
  detectDateTimeConflict(newSchedule, existingSchedule) {
    // Simplified conflict detection - can be expanded
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
  },

  /**
   * ✅ PHASE 3: Comprehensive validation for schedule data
   * @param {Object} scheduleData - The schedule data to validate
   * @param {boolean} isUpdate - Whether this is an update operation
   * @returns {Object} Validation result with valid flag and errors array (ERROR CODES for i18n)
   */
  validateScheduleData(scheduleData, isUpdate = false) {
    const errors = []

    try {
      // Required fields validation (skip for updates)
      if (!isUpdate) {
        if (!scheduleData.tour_id) errors.push('TOUR_ID_REQUIRED')
        if (!scheduleData.operator_id) errors.push('OPERATOR_ID_REQUIRED')
      }

      if (!scheduleData.recurrence_type) {
        errors.push('RECURRENCE_TYPE_REQUIRED')
      }

      if (!scheduleData.start_time) {
        errors.push('START_TIME_REQUIRED')
      }

      if (!scheduleData.start_date) {
        errors.push('START_DATE_REQUIRED')
      }

      if (!scheduleData.end_date) {
        errors.push('END_DATE_REQUIRED')
      }

      // Recurrence type validation
      const validRecurrenceTypes = ['once', 'daily', 'weekly', 'monthly']
      if (scheduleData.recurrence_type && !validRecurrenceTypes.includes(scheduleData.recurrence_type)) {
        errors.push('INVALID_RECURRENCE_TYPE')
      }

      // Days of week validation
      if (scheduleData.days_of_week) {
        if (!Array.isArray(scheduleData.days_of_week)) {
          errors.push('DAYS_OF_WEEK_MUST_BE_ARRAY')
        } else {
          const invalidDays = scheduleData.days_of_week.filter(day => !Number.isInteger(day) || day < 1 || day > 7)
          if (invalidDays.length > 0) {
            errors.push('INVALID_DAYS_OF_WEEK')
          }
        }
      }

      // Weekly recurrence requires days_of_week
      if (scheduleData.recurrence_type === 'weekly' && (!scheduleData.days_of_week || scheduleData.days_of_week.length === 0)) {
        errors.push('WEEKLY_REQUIRES_DAYS')
      }

      // Time format validation (HH:MM)
      if (scheduleData.start_time) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        if (!timeRegex.test(scheduleData.start_time)) {
          errors.push('INVALID_TIME_FORMAT')
        }
      }

      // Date format validation (YYYY-MM-DD)
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
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Reset time for date comparison

        if (startDate < today) {
          errors.push('START_DATE_IN_PAST')
        }

        if (endDate <= startDate) {
          errors.push('END_DATE_BEFORE_START')
        }

        // Reasonable date range limits (2 years max)
        const maxDateRange = 365 * 2 * 24 * 60 * 60 * 1000 // 2 years in milliseconds
        if (endDate - startDate > maxDateRange) {
          errors.push('DATE_RANGE_TOO_LARGE')
        }
      }

      // Exceptions validation
      if (scheduleData.exceptions) {
        if (!Array.isArray(scheduleData.exceptions)) {
          errors.push('EXCEPTIONS_MUST_BE_ARRAY')
        } else {
          const invalidExceptions = scheduleData.exceptions.filter(date => !dateRegex.test(date))
          if (invalidExceptions.length > 0) {
            errors.push('INVALID_EXCEPTION_DATES')
          }
        }
      }

      // UUID format validation (basic)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

      if (scheduleData.tour_id && !uuidRegex.test(scheduleData.tour_id)) {
        errors.push('INVALID_TOUR_ID_FORMAT')
      }

      if (scheduleData.operator_id && !uuidRegex.test(scheduleData.operator_id)) {
        errors.push('INVALID_OPERATOR_ID_FORMAT')
      }

    } catch (error) {
      errors.push(`VALIDATION_ERROR|${error.message}`)
    }

    return {
      valid: errors.length === 0,
      errors: errors // Now returns error codes for i18n translation
    }
  },

  /**
   * ✅ PHASE 3: Generate preview of tour instances that would be created by a schedule
   * @param {Object} scheduleData - The schedule data to preview
   * @param {number} limit - Maximum number of instances to preview (default: 10)
   * @returns {Array} Array of preview instances with dates and times
   */
  generateSchedulePreview(scheduleData, limit = 10) {
    try {
      const preview = []
      
      if (!scheduleData.start_date || !scheduleData.end_date || !scheduleData.recurrence_type) {
        return preview
      }

      const startDate = new Date(scheduleData.start_date)
      const endDate = new Date(scheduleData.end_date)
      const exceptions = scheduleData.exceptions || []

      if (scheduleData.recurrence_type === 'once') {
        // One-time schedule
        const dateStr = scheduleData.start_date
        if (!exceptions.includes(dateStr)) {
          preview.push({
            date: dateStr,
            time: scheduleData.start_time,
            dayName: startDate.toLocaleDateString('en-US', { weekday: 'long' })
          })
        }
      } else if (scheduleData.recurrence_type === 'daily') {
        // Daily recurrence
        let currentDate = new Date(startDate)
        while (currentDate <= endDate && preview.length < limit) {
          const dateStr = currentDate.toISOString().split('T')[0]
          if (!exceptions.includes(dateStr)) {
            preview.push({
              date: dateStr,
              time: scheduleData.start_time,
              dayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' })
            })
          }
          currentDate.setDate(currentDate.getDate() + 1)
        }
      } else if (scheduleData.recurrence_type === 'weekly') {
        // Weekly recurrence
        const daysOfWeek = scheduleData.days_of_week || []
        let currentDate = new Date(startDate)
        
        while (currentDate <= endDate && preview.length < limit) {
          const dayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay() // Convert Sunday from 0 to 7
          
          if (daysOfWeek.includes(dayOfWeek)) {
            const dateStr = currentDate.toISOString().split('T')[0]
            if (!exceptions.includes(dateStr)) {
              preview.push({
                date: dateStr,
                time: scheduleData.start_time,
                dayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' })
              })
            }
          }
          currentDate.setDate(currentDate.getDate() + 1)
        }
      } else if (scheduleData.recurrence_type === 'monthly') {
        // Monthly recurrence - same day of month
        let currentDate = new Date(startDate)
        const dayOfMonth = startDate.getDate()
        
        while (currentDate <= endDate && preview.length < limit) {
          if (currentDate.getDate() === dayOfMonth) {
            const dateStr = currentDate.toISOString().split('T')[0]
            if (!exceptions.includes(dateStr)) {
              preview.push({
                date: dateStr,
                time: scheduleData.start_time,
                dayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' })
              })
            }
          }
          currentDate.setDate(currentDate.getDate() + 1)
        }
      }

      return preview.sort((a, b) => a.date.localeCompare(b.date))

    } catch (error) {
      console.error('Error generating schedule preview:', error)
      return []
    }
  }
}