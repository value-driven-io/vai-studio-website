// src/services/tourService.js
import { supabase } from './supabase'

export const tourService = {
  // Get all active tours with enhanced filtering
  getActiveTours: async (filters = {}) => {
    try {
      let query = supabase
        .from('active_tours_with_operators')
        .select('*')
        .eq('status', 'active')
        .gt('available_spots', 0)
        .order('tour_date', { ascending: true })

      // Apply filters
      if (filters.island && filters.island !== 'all') {
        query = query.eq('operator_island', filters.island)
      }

      if (filters.tourType && filters.tourType !== 'all') {
        query = query.eq('tour_type', filters.tourType)
      }

      if (filters.timeframe && filters.timeframe !== 'all') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        switch (filters.timeframe) {
          case 'today':
            const endOfToday = new Date(today)
            endOfToday.setDate(today.getDate() + 1)
            query = query.gte('tour_date', today.toISOString().split('T')[0])
                        .lt('tour_date', endOfToday.toISOString().split('T')[0])
            break
          case 'tomorrow':
            const tomorrow = new Date(today)
            tomorrow.setDate(today.getDate() + 1)
            const dayAfterTomorrow = new Date(tomorrow)
            dayAfterTomorrow.setDate(tomorrow.getDate() + 1)
            query = query.gte('tour_date', tomorrow.toISOString().split('T')[0])
                        .lt('tour_date', dayAfterTomorrow.toISOString().split('T')[0])
            break
          case 'week':
            const weekFromNow = new Date(today)
            weekFromNow.setDate(today.getDate() + 7)
            query = query.gte('tour_date', today.toISOString().split('T')[0])
                        .lte('tour_date', weekFromNow.toISOString().split('T')[0])
            break
        }
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching tours:', error)
        throw error
      }

      // Calculate hours until deadline for each tour
      const toursWithDeadline = data.map(tour => ({
        ...tour,
        hours_until_deadline: tour.booking_deadline 
          ? Math.max(0, (new Date(tour.booking_deadline) - new Date()) / (1000 * 60 * 60))
          : null
      }))

      return toursWithDeadline
    } catch (error) {
      console.error('Error in getActiveTours:', error)
      throw error
    }
  },

  // Get tours for Discover tab (today + tomorrow + next few days)
  getDiscoverTours: async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // Get tours for next 3 days (more spontaneous/last-minute feel)
      const threeDaysFromNow = new Date(today)
      threeDaysFromNow.setDate(today.getDate() + 3)

      const { data, error } = await supabase
        .from('active_tours_with_operators')
        .select('*')
        .eq('status', 'active')
        .gt('available_spots', 0)
        .gte('tour_date', today.toISOString().split('T')[0])
        .lte('tour_date', threeDaysFromNow.toISOString().split('T')[0])
        .order('tour_date', { ascending: true })

      if (error) throw error

      return data.map(tour => ({
        ...tour,
        hours_until_deadline: tour.booking_deadline 
          ? Math.max(0, (new Date(tour.booking_deadline) - new Date()) / (1000 * 60 * 60))
          : null
      }))
    } catch (error) {
      console.error('Error fetching discover tours:', error)
      throw error
    }
  },

  // Get tours filtered by mood categories
  getToursByMood: async (mood) => {
    const moodMapping = {
      adventure: ['Adrenalin', 'Hike', 'Diving'],
      relax: ['Mindfulness', 'Lagoon Tour', 'Cultural'],
      culture: ['Cultural'],
      ocean: ['Diving', 'Snorkeling', 'Whale Watching', 'Lagoon Tour']
    }

    const relevantTypes = moodMapping[mood] || []
    
    if (relevantTypes.length === 0) {
      return []
    }

    try {
      const { data, error } = await supabase
        .from('active_tours_with_operators')
        .select('*')
        .eq('status', 'active')
        .gt('available_spots', 0)
        .in('tour_type', relevantTypes)
        .order('tour_date', { ascending: true })

      if (error) throw error

      return data.map(tour => ({
        ...tour,
        hours_until_deadline: tour.booking_deadline 
          ? Math.max(0, (new Date(tour.booking_deadline) - new Date()) / (1000 * 60 * 60))
          : null
      }))
    } catch (error) {
      console.error('Error fetching tours by mood:', error)
      throw error
    }
  },

  // Get urgent deals (booking deadline within 4 hours)
  getUrgentTours: async () => {
    try {
      const now = new Date()
      const fourHoursFromNow = new Date(now.getTime() + (4 * 60 * 60 * 1000))

      const { data, error } = await supabase
        .from('active_tours_with_operators')
        .select('*')
        .eq('status', 'active')
        .gt('available_spots', 0)
        .lt('booking_deadline', fourHoursFromNow.toISOString())
        .gt('booking_deadline', now.toISOString())
        .order('booking_deadline', { ascending: true })

      if (error) throw error

      return data.map(tour => ({
        ...tour,
        hours_until_deadline: tour.booking_deadline 
          ? Math.max(0, (new Date(tour.booking_deadline) - new Date()) / (1000 * 60 * 60))
          : null,
        urgency_level: this.getUrgencyLevel(tour.booking_deadline)
      }))
    } catch (error) {
      console.error('Error fetching urgent tours:', error)
      throw error
    }
  },

  // Helper function to determine urgency level
  getUrgencyLevel: (deadline) => {
    if (!deadline) return { level: 'normal', color: 'green', text: 'Available' }
    
    const hoursLeft = (new Date(deadline) - new Date()) / (1000 * 60 * 60)
    
    if (hoursLeft <= 1) return { level: 'critical', color: 'red', text: 'Booking closes in 1h!' }
    if (hoursLeft <= 2) return { level: 'high', color: 'orange', text: 'Booking closes in 2h!' }
    if (hoursLeft <= 4) return { level: 'medium', color: 'yellow', text: 'Booking closes soon!' }
    return { level: 'normal', color: 'green', text: 'Available' }
  },

  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      // Generate booking reference
      const bookingRef = `VAI-${Date.now()}-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}`
      
      // Calculate commission (10%)
      const commission = Math.round(bookingData.subtotal * 0.1)

      // SAFE BOOKING OBJECT - Only non-generated columns
      const booking = {
        // Required fields we can insert
        tour_id: bookingData.tour_id,
        operator_id: bookingData.operator_id,
        customer_name: bookingData.customer_name,
        customer_email: bookingData.customer_email,
        customer_phone: bookingData.customer_phone,
        customer_whatsapp: bookingData.customer_whatsapp,
        num_adults: bookingData.num_adults,
        num_children: bookingData.num_children,
        adult_price: bookingData.adult_price,
        child_price: bookingData.child_price,
        subtotal: bookingData.subtotal,
        commission_amount: commission,
        
        // Optional fields
        special_requirements: bookingData.special_requirements,
        dietary_restrictions: bookingData.dietary_restrictions,
        accessibility_needs: bookingData.accessibility_needs,
        
        // Booking metadata
        booking_reference: bookingRef,
        booking_status: 'pending',
        confirmation_deadline: new Date(Date.now() + 60 * 60 * 1000).toISOString()
        
        // EXCLUDED (auto-generated):
        // - id (uuid_generate_v4())
        // - created_at (now())
        // - updated_at (now())
        // - total_participants (calculated from num_adults + num_children)
        // - total_amount (calculated from subtotal + commission_amount)
        // - All the workflow timestamp fields (confirmed_at, cancelled_at, etc.)
        // - All the boolean flags (webhook_sent, whatsapp_sent, email_sent)
      }

      console.log('Creating booking with safe data:', booking)

      const { data, error } = await supabase
        .from('bookings')
        .insert([booking])
        .select()
        .single()

      if (error) {
        console.error('Supabase insert error:', error)
        throw error
      }

      // Update available spots
      await supabase
        .from('tours')
        .update({ 
          available_spots: bookingData.available_spots - (bookingData.num_adults + bookingData.num_children)
        })
        .eq('id', bookingData.tour_id)

      return data
    } catch (error) {
      console.error('Error creating booking:', error)
      throw error
    }
  },

  // Get unique islands for filtering
  getAvailableIslands: async () => {
    try {
      const { data, error } = await supabase
        .from('active_tours_with_operators')
        .select('operator_island')
        .eq('status', 'active')
        .gt('available_spots', 0)

      if (error) throw error

      const uniqueIslands = [...new Set(data.map(tour => tour.operator_island))]
      return uniqueIslands.filter(island => island) // Remove null values
    } catch (error) {
      console.error('Error fetching islands:', error)
      return []
    }
  },

  // Get unique tour types for filtering
  getAvailableTourTypes: async () => {
    try {
      const { data, error } = await supabase
        .from('active_tours_with_operators')
        .select('tour_type')
        .eq('status', 'active')
        .gt('available_spots', 0)

      if (error) throw error

      const uniqueTypes = [...new Set(data.map(tour => tour.tour_type))]
      return uniqueTypes.filter(type => type) // Remove null values
    } catch (error) {
      console.error('Error fetching tour types:', error)
      return []
    }
  }
}