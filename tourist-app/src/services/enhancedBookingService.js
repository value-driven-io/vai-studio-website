import { supabase } from './supabase'

export const enhancedBookingService = {
  BOOKING_TOUR_FIELDS: `
    id, operator_id, parent_schedule_id, parent_template_id,
    effective_discount_price_adult, effective_discount_price_child,
    effective_max_capacity, effective_available_spots,
    tour_name, tour_date, time_slot, max_capacity, available_spots,
    company_name, operator_whatsapp_number, commission_rate
  `,

  async getTourForBooking(tourId) {
    // First try enhanced view
    const { data: enhancedData, error: enhancedError } = await supabase
      .from('active_tours_with_operators')
      .select(this.BOOKING_TOUR_FIELDS)
      .eq('id', tourId)
      .single()

    if (enhancedData && !enhancedError) {
      return enhancedData
    }

    console.warn('Enhanced view failed, falling back to tours table:', enhancedError)

    // Fallback to tours table with operator join
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('tours')
      .select(`
        id, operator_id, parent_schedule_id, parent_template_id,
        discount_price_adult, discount_price_child,
        max_capacity, available_spots,
        tour_name, tour_date, time_slot,
        operators!inner(
          company_name,
          whatsapp_number,
          commission_rate
        )
      `)
      .eq('id', tourId)
      .single()

    if (fallbackError || !fallbackData) {
      throw new Error('Tour not available for booking')
    }

    // Flatten operator data and map to expected structure
    const flattenedData = {
      ...fallbackData,
      effective_discount_price_adult: fallbackData.discount_price_adult,
      effective_discount_price_child: fallbackData.discount_price_child,
      effective_max_capacity: fallbackData.max_capacity,
      effective_available_spots: fallbackData.available_spots,
      schedule_id: fallbackData.parent_schedule_id,
      company_name: fallbackData.operators.company_name,
      operator_whatsapp_number: fallbackData.operators.whatsapp_number,
      commission_rate: fallbackData.operators.commission_rate
    }
    delete flattenedData.operators

    return flattenedData
  },

  async createBooking(bookingData) {
    try {
      const tourContext = await this.getTourForBooking(bookingData.tour_id)

      const adultTotal = bookingData.num_adults * tourContext.effective_discount_price_adult
      const childTotal = bookingData.num_children * (tourContext.effective_discount_price_child || 0)
      const totalAmount = adultTotal + childTotal
      const commissionAmount = Math.round(totalAmount * (tourContext.commission_rate / 100))
      const subtotal = totalAmount - commissionAmount

      const now = Date.now()
      const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '')
      const bookingReference = `VAI-${now}-${dateStr}`

      const { data, error } = await supabase.rpc('create_booking_atomic', {
        booking_data: {
          ...bookingData,
          operator_id: tourContext.operator_id,
          schedule_id: tourContext.parent_schedule_id || tourContext.schedule_id,
          adult_price: tourContext.effective_discount_price_adult,
          child_price: tourContext.effective_discount_price_child,
          subtotal,
          commission_amount: commissionAmount,
          booking_reference: bookingReference,
          confirmation_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          applied_commission_rate: tourContext.commission_rate
        },
        tour_id: bookingData.tour_id
      })

      if (error || !data?.success) {
        throw new Error(data?.error || 'Booking creation failed')
      }

      return data
    } catch (error) {
      console.error('Enhanced booking creation error:', error)
      throw error
    }
  }
}