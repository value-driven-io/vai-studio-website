import { supabase } from './supabase'

export const enhancedJourneyService = {
  JOURNEY_TOUR_FIELDS: `
    id, tour_name, tour_date, time_slot, meeting_point, tour_type,
    template_name, template_id, parent_schedule_id, effective_meeting_point,
    company_name, operator_whatsapp_number, operator_island,
    is_customized, instance_note, promotional_discount_amount,
    final_price_adult, schedule_paused, has_promotional_pricing
  `,

  async getUserBookings(email, whatsapp) {
    try {
      const cleanEmail = email?.trim()
      const cleanWhatsApp = whatsapp?.trim()

      if (!cleanEmail && !cleanWhatsApp) {
        return []
      }

      // First try enhanced view
      const { data: enhancedData, error: enhancedError } = await supabase
        .from('bookings')
        .select(`
          id, booking_reference, booking_status, created_at, confirmed_at,
          cancelled_at, total_amount, num_adults, num_children, schedule_id,
          customer_email, customer_whatsapp, confirmation_deadline,
          special_requirements,
          active_tours_with_operators!inner(${this.JOURNEY_TOUR_FIELDS})
        `)
        .or(`customer_email.eq.${cleanEmail},customer_whatsapp.eq.${cleanWhatsApp}`)
        .order('created_at', { ascending: false })

      if (enhancedData && !enhancedError) {
        return this.categorizeBookings(enhancedData)
      }

      console.warn('Enhanced view failed, falling back to tours table:', enhancedError)

      // Fallback to standard tours table
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('bookings')
        .select(`
          id, booking_reference, booking_status, created_at, confirmed_at,
          cancelled_at, total_amount, num_adults, num_children, schedule_id,
          customer_email, customer_whatsapp, confirmation_deadline,
          special_requirements,
          tours!inner(
            id, tour_name, tour_date, time_slot, meeting_point, tour_type,
            template_name, parent_template_id, parent_schedule_id
          ),
          operators!inner(
            company_name, operator_whatsapp_number, operator_island
          )
        `)
        .or(`customer_email.eq.${cleanEmail},customer_whatsapp.eq.${cleanWhatsApp}`)
        .order('created_at', { ascending: false })

      if (fallbackError) {
        console.error('Error fetching fallback journey bookings:', fallbackError)
        throw fallbackError
      }

      // Transform fallback data to match enhanced structure
      const transformedData = (fallbackData || []).map(booking => ({
        ...booking,
        active_tours_with_operators: {
          ...booking.tours,
          schedule_id: booking.tours?.parent_schedule_id,
          template_id: booking.tours?.parent_template_id,
          company_name: booking.operators?.company_name,
          operator_whatsapp_number: booking.operators?.operator_whatsapp_number,
          operator_island: booking.operators?.operator_island,
          effective_meeting_point: booking.tours?.meeting_point
        }
      }))

      return this.categorizeBookings(transformedData)
    } catch (error) {
      console.error('Error in enhanced getUserBookings:', error)
      throw error
    }
  },

  categorizeBookings(bookings) {
    const now = new Date()
    const categorized = { active: [], upcoming: [], past: [] }

    bookings.forEach(booking => {
      const tourData = booking.active_tours_with_operators
      const tourDate = new Date(tourData?.tour_date || booking.created_at)

      switch (booking.booking_status) {
        case 'pending':
          categorized.active.push(booking)
          break
        case 'confirmed':
          if (tourDate > now) {
            categorized.upcoming.push(booking)
          } else {
            categorized.past.push(booking)
          }
          break
        case 'completed':
          categorized.past.push(booking)
          break
        default:
          categorized.past.push(booking)
      }
    })

    return categorized
  }
}