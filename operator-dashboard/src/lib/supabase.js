// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Use environment variables instead of hardcoded values
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Add error checking
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

  // Create new tour
    async createTour(tourData) {
    const { discount_percentage, ...cleanTourData } = tourData;
    
    const { data, error } = await supabase
        .from('tours')
        .insert([{
        ...cleanTourData,
        available_spots: cleanTourData.max_capacity,
        status: 'active',
        created_by_operator: true
        }])
        .select()
        .single()
    
    if (error) throw error
    return data
  },

  // Update tour
  async updateTour(tourId, tourData) {
    const { data, error } = await supabase
      .from('tours')
      .update(tourData)
      .eq('id', tourId)
      .select()
      .single()
    
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
  }
}