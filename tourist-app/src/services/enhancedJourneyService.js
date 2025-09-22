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

      // Step 1: Get bookings data first
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          id, booking_reference, booking_status, created_at, confirmed_at,
          cancelled_at, total_amount, num_adults, num_children, schedule_id,
          customer_email, customer_whatsapp, confirmation_deadline,
          special_requirements, tour_id, operator_id, adult_price
        `)
        .or(`customer_email.eq.${cleanEmail},customer_whatsapp.eq.${cleanWhatsApp}`)
        .order('created_at', { ascending: false })

      if (bookingError) {
        console.error('Error fetching bookings:', bookingError)
        throw bookingError
      }

      if (!bookingData || bookingData.length === 0) {
        return this.categorizeBookings([])
      }

      // Step 2: Get unique tour IDs and operator IDs
      const tourIds = [...new Set(bookingData.map(b => b.tour_id))]
      const operatorIds = [...new Set(bookingData.map(b => b.operator_id))]

      // Step 3: Fetch tour and operator data separately
      const [toursResult, operatorsResult] = await Promise.all([
        supabase
          .from('tours')
          .select(`
            id, tour_name, tour_date, time_slot, meeting_point, tour_type,
            parent_template_id, parent_schedule_id
          `)
          .in('id', tourIds),
        supabase
          .from('operators')
          .select(`
            id, company_name, whatsapp_number, island
          `)
          .in('id', operatorIds)
      ])

      const { data: toursData, error: toursError } = toursResult
      const { data: operatorsData, error: operatorsError } = operatorsResult

      if (toursError || operatorsError) {
        console.warn('Error fetching related data:', { toursError, operatorsError })
        // Continue with partial data
      }

      // Step 4: Create lookup maps
      const toursMap = new Map((toursData || []).map(tour => [tour.id, tour]))
      const operatorsMap = new Map((operatorsData || []).map(op => [op.id, op]))

      // Step 5: Transform data to match expected structure
      const transformedData = bookingData.map(booking => {
        const tour = toursMap.get(booking.tour_id)
        const operator = operatorsMap.get(booking.operator_id)

        return {
          ...booking,
          active_tours_with_operators: {
            ...tour,
            schedule_id: tour?.parent_schedule_id,
            template_id: tour?.parent_template_id,
            template_name: tour?.tour_name, // Use tour_name as template_name fallback
            company_name: operator?.company_name,
            operator_whatsapp_number: operator?.whatsapp_number,
            operator_island: operator?.island,
            effective_meeting_point: tour?.meeting_point,
            has_promotional_pricing: false,
            promotional_discount_amount: 0,
            final_price_adult: booking.adult_price,
            schedule_paused: false
          }
        }
      })

      return this.categorizeBookings(transformedData)
    } catch (error) {
      console.error('Error in enhanced getUserBookings:', error)
      throw error
    }
  },

  categorizeBookings(bookings) {
    const now = new Date()
    const categorized = { active: [], upcoming: [], past: [], cancelled: [] }

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
        case 'cancelled':
        case 'declined':
          categorized.cancelled.push(booking)
          break
        default:
          categorized.past.push(booking)
      }
    })

    // Sort each category
    categorized.active.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    categorized.upcoming.sort((a, b) => new Date(a.active_tours_with_operators?.tour_date) - new Date(b.active_tours_with_operators?.tour_date))
    categorized.past.sort((a, b) => new Date(b.active_tours_with_operators?.tour_date) - new Date(a.active_tours_with_operators?.tour_date))
    categorized.cancelled.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    return categorized
  }
}