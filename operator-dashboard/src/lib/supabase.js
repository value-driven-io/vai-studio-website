// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Use environment variables instead of hardcoded values
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Add error checking
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token' // ← Force consistent storage key
  }
})

// Helper functions for operators
export const operatorService = {
  // Get operator by email (for login)
  async getOperatorByEmail(email) {
    const { data, error } = await supabase
      .from('operators')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error) throw error
    return data
  },

  // Get tours for specific operator
  async getOperatorTours(operatorId) {
    const { data, error } = await supabase
      .from('tours')
      .select(`
        *,
        bookings:bookings(count)
      `)
      .eq('operator_id', operatorId)
      .eq('status', 'active')
      .order('tour_date', { ascending: true })
    
    if (error) throw error
    return data
  },


  // Delete tour (soft delete by setting status to 'cancelled')
  async deleteTour(tourId) {
    const { data, error } = await supabase
      .from('tours')
      .update({ status: 'cancelled' })
      .eq('id', tourId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get booking stats for operator
  async getOperatorStats(operatorId) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        total_amount,
        subtotal,
        booking_status,
        created_at
      `)
      .eq('operator_id', operatorId)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
    
    if (error) throw error
    
    const confirmedBookings = data.filter(booking => booking.booking_status === 'confirmed')
    const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + (booking.subtotal || 0), 0)
    const totalBookings = confirmedBookings.length
    
    return {
      totalRevenue,
      totalBookings,
      pendingBookings: data.filter(booking => booking.booking_status === 'pending').length
    }
  },

  // ADD to operatorService:
  async atomicSpotUpdate(tourId, spotsToSubtract) {
    const { data, error } = await supabase.rpc('update_tour_spots', {
      tour_id: tourId,
      spots_change: -spotsToSubtract
    })
    
    if (error) throw error
    return data
  },

  // Marketing Intelligence Queries
  async getMarketingAnalytics(operatorId, startDate = null, endDate = null) {
    // Default to last 30 days if no dates provided
    const defaultStartDate = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const defaultEndDate = endDate || new Date().toISOString()

    // Get all bookings with tour and customer data
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        tours:tour_id (
          tour_name,
          tour_type,
          tour_date,
          max_capacity,
          original_price_adult,
          discount_price_adult
        )
      `)
      .eq('operator_id', operatorId)
      .gte('created_at', defaultStartDate)
      .lte('created_at', defaultEndDate)

    if (bookingsError) throw bookingsError

    // Get tour performance data
    const { data: tours, error: toursError } = await supabase
      .from('tours')
      .select(`
        *,
        bookings:bookings(
          booking_status,
          total_amount,
          subtotal,
          num_adults,
          num_children,
          created_at
        )
      `)
      .eq('operator_id', operatorId)

    if (toursError) throw toursError

    return {
      bookings: bookings || [],
      tours: tours || []
    }
  },

  // Get customer analytics
  async getCustomerAnalytics(operatorId, period = 30) {
    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        customer_email,
        customer_whatsapp,
        total_amount,
        booking_status,
        created_at
      `)
      .eq('operator_id', operatorId)
      .gte('created_at', startDate)

    if (error) throw error
    return data || []
  },

  // Get tour type performance
  async getTourTypeAnalytics(operatorId) {
    const { data, error } = await supabase
      .from('tours')
      .select(`
        tour_type,
        bookings:bookings(
          booking_status,
          subtotal,
          created_at
        )
      `)
      .eq('operator_id', operatorId)

    if (error) throw error
    return data || []
  },

  // Get booking trends over time
  async getBookingTrends(operatorId, period = 90) {
    const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        created_at,
        booking_status,
        subtotal,
        tours:tour_id (
          tour_date,
          tour_type
        )
      `)
      .eq('operator_id', operatorId)
      .gte('created_at', startDate)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }
}