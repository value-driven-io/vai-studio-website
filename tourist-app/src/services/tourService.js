// src/services/tourService.js
import { supabase } from './supabase'
import { getTodayInFP, getTomorrowInFP, getDaysFromTodayInFP } from '../lib/timezone'

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

      // Enhanced date filtering
      if (filters.dateRange) {
        if (filters.dateRange.start) {
          query = query.gte('tour_date', filters.dateRange.start)
        }
        if (filters.dateRange.end) {
          query = query.lte('tour_date', filters.dateRange.end)
        }
      } else if (filters.timeframe && filters.timeframe !== 'all') {
        // Use French Polynesia timezone for accurate date filtering
        const todayFP = getTodayInFP()
        const tomorrowFP = getTomorrowInFP()
        
        switch (filters.timeframe) {
          case 'today':
            query = query.eq('tour_date', todayFP)
            break
          case 'tomorrow':
            query = query.eq('tour_date', tomorrowFP)
            break
          case 'week':
            const weekFromNowFP = getDaysFromTodayInFP(7)
            query = query.gte('tour_date', todayFP)
                        .lte('tour_date', weekFromNowFP)
            break
        }
      }

      // Price range filtering
      if (filters.priceRange) {
        if (filters.priceRange.min) {
          query = query.gte('discount_price_adult', filters.priceRange.min)
        }
        if (filters.priceRange.max) {
          query = query.lte('discount_price_adult', filters.priceRange.max)
        }
      }

      // Duration filtering
      if (filters.duration && filters.duration !== 'all') {
        switch (filters.duration) {
          case 'half-day':
            query = query.lte('duration_hours', 4)
            break
          case 'full-day':
            query = query.gt('duration_hours', 4).lte('duration_hours', 8)
            break
          case 'multi-day':
            query = query.gt('duration_hours', 8)
            break
        }
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching tours:', error)
        throw error
      }

      // Calculate hours until deadline for each tour
      let toursWithDeadline = data.map(tour => ({
        ...tour,
        hours_until_deadline: tour.booking_deadline 
          ? Math.max(0, (new Date(tour.booking_deadline) - new Date()) / (1000 * 60 * 60))
          : null
      }))

      // Apply text search filter (client-side for simplicity)
      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase().trim()
        toursWithDeadline = toursWithDeadline.filter(tour => 
          tour.tour_name?.toLowerCase().includes(searchTerm) ||
          tour.description?.toLowerCase().includes(searchTerm) ||
          tour.company_name?.toLowerCase().includes(searchTerm) ||
          tour.tour_type?.toLowerCase().includes(searchTerm) ||
          tour.operator_island?.toLowerCase().includes(searchTerm)
        )
      }

      // Apply sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price-low':
            toursWithDeadline.sort((a, b) => (a.discount_price_adult || 0) - (b.discount_price_adult || 0))
            break
          case 'price-high':
            toursWithDeadline.sort((a, b) => (b.discount_price_adult || 0) - (a.discount_price_adult || 0))
            break
          case 'date':
            toursWithDeadline.sort((a, b) => new Date(a.tour_date) - new Date(b.tour_date))
            break
          case 'rating':
            toursWithDeadline.sort((a, b) => (b.operator_rating || 0) - (a.operator_rating || 0))
            break
          case 'duration':
            toursWithDeadline.sort((a, b) => (a.duration_hours || 0) - (b.duration_hours || 0))
            break
          case 'spots':
            toursWithDeadline.sort((a, b) => (b.available_spots || 0) - (a.available_spots || 0))
            break
          default:
            // Keep default date sorting
            break
        }
      }

      return toursWithDeadline
    } catch (error) {
      console.error('Error in getActiveTours:', error)
      throw error
    }
  },

  // Get user bookings by email or WhatsApp
  getUserBookings: async (email, whatsapp) => {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          tours (
            tour_name,
            tour_type,
            tour_date,
            time_slot,
            duration_hours,
            meeting_point,
            original_price_adult,
            discount_price_adult
          ),
          operators (
            company_name,
            contact_person,
            whatsapp_number,
            phone,
            email,
            island
          )
        `)
        .order('created_at', { ascending: false })

      // Search by email or WhatsApp
      if (email && whatsapp) {
        query = query.or(`customer_email.eq.${email},customer_whatsapp.eq.${whatsapp}`)
      } else if (email) {
        query = query.eq('customer_email', email)
      } else if (whatsapp) {
        query = query.eq('customer_whatsapp', whatsapp)
      } else {
        return [] // No search criteria provided
      }

      const { data, error } = await query

      if (error) throw error

      // Categorize bookings
      const now = new Date()
      const categorized = {
        active: [],
        upcoming: [],
        past: [],
        cancelled: []
      }

      data.forEach(booking => {
        const tourDate = new Date(booking.tours?.tour_date || booking.created_at)
        
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
          case 'declined':
          case 'cancelled':
            categorized.cancelled.push(booking)
            break
          default:
            categorized.active.push(booking)
        }
      })

      return categorized
    } catch (error) {
      console.error('Error fetching user bookings:', error)
      throw error
    }
  },

  // Get booking by reference
  getBookingByReference: async (bookingReference) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          tours (*),
          operators (*)
        `)
        .eq('booking_reference', bookingReference)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching booking by reference:', error)
      throw error
    }
  },

  // Get tours for Discover tab (today + tomorrow + next few days)
  getDiscoverTours: async () => {
    try {
      // Use French Polynesia timezone
      const todayFP = getTodayInFP()
      const threeDaysFromNowFP = getDaysFromTodayInFP(3)

      const { data, error } = await supabase
        .from('active_tours_with_operators')
        .select('*')
        .eq('status', 'active')
        .gt('available_spots', 0)
        .gte('tour_date', todayFP)
        .lte('tour_date', threeDaysFromNowFP)
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