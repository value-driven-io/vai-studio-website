// operator-dashboard/src/services/scheduleService.js
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
        .select('id, tour_name, tour_type, max_capacity, discount_price_adult')
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
   * Placeholder for future create schedule functionality
   * @param {Object} scheduleData - The schedule data to create
   * @returns {Promise<Object>} Created schedule record
   */
  async createSchedule(scheduleData) {
    // Phase 3: This will be implemented later
    console.log('createSchedule placeholder - to be implemented in Phase 3')
    throw new Error('Create functionality not yet implemented')
  }
}