// src/services/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Add fallback check
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  throw new Error('Supabase configuration missing')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,        // ← Enable for auth
    persistSession: true,          // ← Enable for auth
    detectSessionInUrl: true       // ← Enable for email links
  },
  realtime: {
    disabled: true // Keep disabled
  }
})

// Tour Discovery Service
export const tourService = {
  // Get active tours from your view
  async getActiveTours(filters = {}) {
    let query = supabase
      .from('active_tours_with_operators')
      .select('*')
      .eq('status', 'active')
      .gte('tour_date', new Date().toISOString().split('T')[0])
      .gt('available_spots', 0)
      .order('hours_until_deadline', { ascending: true })

    // Apply filters
    if (filters.island && filters.island !== 'all') {
      query = query.eq('operator_island', filters.island)
    }
    
    if (filters.tourType && filters.tourType !== 'all') {
      query = query.eq('tour_type', filters.tourType)
    }

    if (filters.timeframe === 'today') {
      const today = new Date().toISOString().split('T')[0]
      query = query.eq('tour_date', today)
    } else if (filters.timeframe === 'tomorrow') {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      query = query.eq('tour_date', tomorrow.toISOString().split('T')[0])
    } else if (filters.timeframe === 'week') {
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      query = query.lte('tour_date', nextWeek.toISOString().split('T')[0])
    }

    // Price range filter
    if (filters.priceRange && filters.priceRange !== 'all') {
      switch (filters.priceRange) {
        case 'under-5000':
          query = query.lt('discount_price_adult', 5000)
          break
        case '5000-10000':
          query = query.gte('discount_price_adult', 5000).lt('discount_price_adult', 10000)
          break
        case '10000-20000':
          query = query.gte('discount_price_adult', 10000).lt('discount_price_adult', 20000)
          break
        case 'over-20000':
          query = query.gte('discount_price_adult', 20000)
          break
      }
    }

    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching tours:', error)
      throw error
    }
    
    return data || []
  },

  // Get tour details by ID
  async getTourById(tourId) {
    const { data, error } = await supabase
      .from('active_tours_with_operators')
      .select('*')
      .eq('id', tourId)
      .single()

    if (error) throw error
    return data
  },

  // Subscribe to real-time tour updates
  subscribeToursUpdates(callback) {
    return supabase
      .channel('tours-updates')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'tours' 
        },
        (payload) => callback(payload)
      )
      .subscribe()
  }
}

// Booking Service
export const bookingService = {
  // Create new booking - this triggers your n8n workflow
  async createBooking(bookingData) {
    try {
      // Get operator's current commission rate from database
      const { data: operatorData, error: operatorError } = await supabase
        .from('operators')
        .select('commission_rate')
        .eq('id', bookingData.operator_id)
        .single()

      if (operatorError) {
        console.error('Error fetching operator commission rate:', operatorError)
        throw new Error('Unable to retrieve commission rate')
      }

      const commissionRate = operatorData.commission_rate || 10.00 // fallback to 10%

      // Calculate totals with dynamic commission rate
      const adultTotal = bookingData.num_adults * bookingData.adult_price
      const childTotal = bookingData.num_children * (bookingData.child_price || Math.round(bookingData.adult_price * 0.7))
      const subtotal = adultTotal + childTotal
      
      // FIXED: Use dynamic commission rate instead of hard-coded 10%
      const commissionAmount = Math.round(subtotal * (commissionRate / 100))
      const totalAmount = subtotal + commissionAmount

      // Generate booking reference
      const now = Date.now()
      const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '')
      const bookingReference = `VAI-${now}-${dateStr}`

      const bookingPayload = {
        ...bookingData,
        subtotal,
        commission_amount: commissionAmount,
        applied_commission_rate: commissionRate, // Store the rate used
        booking_reference: bookingReference,
        booking_status: 'pending',
        payment_status: 'pending',
        confirmation_deadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        webhook_sent: false,
        whatsapp_sent: false,
        email_sent: false,
        commission_locked_at: null // Not locked until confirmed
      }

      // Insert booking
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingPayload])
        .select()
        .single()

      if (error) throw error

      return data

    } catch (error) {
      console.error('Booking creation error:', error)
      throw error
    }
  },

  // 🔥 MISSING FUNCTIONS - ADD THESE:

  // Get user's bookings
  async getUserBookings(customerEmail) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        tours:tour_id (
          tour_name,
          tour_date,
          time_slot,
          meeting_point,
          tour_type,
          duration_hours
        ),
        operators:operator_id (
          company_name,
          whatsapp_number,
          phone,
          contact_person
        )
      `)
      .eq('customer_email', customerEmail)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user bookings:', error)
      throw error
    }
    
    return data || []
  },

  // Get booking by reference
  async getBookingByReference(bookingReference) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        tours:tour_id (
          tour_name,
          tour_date,
          time_slot,
          meeting_point,
          tour_type,
          duration_hours
        ),
        operators:operator_id (
          company_name,
          whatsapp_number,
          phone,
          contact_person
        )
      `)
      .eq('booking_reference', bookingReference)
      .single()

    if (error) {
      console.error('Error fetching booking by reference:', error)
      throw error
    }
    
    return data
  },

  // Subscribe to booking status updates
  subscribeToBookingUpdates(customerEmail, callback) {
    return supabase
      .channel('booking-updates')
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'bookings',
          filter: `customer_email=eq.${customerEmail}`
        },
        (payload) => callback(payload)
      )
      .subscribe()
  },

  // Subscribe to specific booking updates by reference
  subscribeToBookingByReference(bookingReference, callback) {
    return supabase
      .channel(`booking-${bookingReference}`)
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'bookings',
          filter: `booking_reference=eq.${bookingReference}`
        },
        (payload) => callback(payload)
      )
      .subscribe()
  }
}

// Operator Service (for operator dashboard)
export const operatorService = {
  // Get operator's tours
  async getOperatorTours(operatorId) {
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .eq('operator_id', operatorId)
      .order('tour_date', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Get operator's bookings
  async getOperatorBookings(operatorId, status = null) {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        tours:tour_id (
          tour_name,
          tour_date,
          time_slot,
          meeting_point
        )
      `)
      .eq('operator_id', operatorId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('booking_status', status)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  // Get operator stats
  async getOperatorStats(operatorId) {
    const { data, error } = await supabase
      .from('operator_booking_summary')
      .select('*')
      .eq('operator_id', operatorId)
      .single()

    if (error) {
      console.error('Error fetching operator stats:', error)
      // Return default stats if view doesn't exist or has no data
      return {
        total_bookings: 0,
        confirmed_bookings: 0,
        pending_bookings: 0,
        total_revenue: 0,
        total_commission: 0
      }
    }
    
    return data
  },

  // Confirm or decline booking (for operator use)
  async updateBookingStatus(bookingId, status, operatorResponse = null, declineReason = null) {
    const updateData = {
      booking_status: status,
      operator_response: operatorResponse,
      operator_response_received_at: new Date().toISOString(),
      operator_response_method: 'dashboard'
    }

    if (status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString()
    } else if (status === 'declined') {
      updateData.cancelled_at = new Date().toISOString()
      updateData.decline_reason = declineReason
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// Notification Service
export const notificationService = {
  // Request notification permission
  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  },

  // Show local notification
  showNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options
      })
    }
  }
}

// Utility function to format prices
export const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR').format(price) + ' XPF'
}

// Utility function to format dates
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Utility function to format time
export const formatTime = (time) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ADD THESE FUNCTIONS TO: src/services/supabase.js

// Journey & Booking Management Functions
export const journeyService = {
  // Get user's bookings by email or WhatsApp
  async getUserBookings(email, whatsapp) {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          tours:tour_id (
            tour_name,
            tour_date,
            time_slot,
            meeting_point,
            tour_type,
            duration_hours,
            pickup_available,
            pickup_locations,
            requirements,
            restrictions
          ),
          operators:operator_id (
            company_name,
            whatsapp_number,
            phone,
            contact_person,
            island
          )
        `)
        .order('created_at', { ascending: false })

      // Search by email OR WhatsApp
      if (email && whatsapp) {
        query = query.or(`customer_email.eq.${email},customer_whatsapp.eq.${whatsapp}`)
      } else if (email) {
        query = query.eq('customer_email', email)
      } else if (whatsapp) {
        query = query.eq('customer_whatsapp', whatsapp)
      } else {
        throw new Error('Either email or WhatsApp is required')
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching user bookings:', error)
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getUserBookings:', error)
      throw error
    }
  },

  // Get booking by reference
  async getBookingByReference(bookingReference) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          tours:tour_id (
            tour_name,
            tour_date,
            time_slot,
            meeting_point,
            tour_type,
            duration_hours,
            pickup_available,
            pickup_locations,
            requirements,
            restrictions
          ),
          operators:operator_id (
            company_name,
            whatsapp_number,
            phone,
            contact_person,
            island
          )
        `)
        .eq('booking_reference', bookingReference)
        .single()

      if (error) {
        console.error('Error fetching booking by reference:', error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Error in getBookingByReference:', error)
      throw error
    }
  },

  // Subscribe to booking status updates for a user
  subscribeToUserBookings(email, whatsapp, callback) {
    const channel = supabase
      .channel('user-bookings')
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'bookings',
          filter: email ? `customer_email=eq.${email}` : `customer_whatsapp=eq.${whatsapp}`
        },
        (payload) => {
          console.log('Booking update received:', payload)
          callback(payload)
        }
      )
      .subscribe()

    return channel
  },

  // Get favorite tours by tour IDs
  async getFavoriteTours(tourIds) {
    try {
      if (!tourIds || tourIds.length === 0) {
        return []
      }

      const { data, error } = await supabase
        .from('active_tours_with_operators')
        .select('*')
        .in('id', tourIds)
        .eq('status', 'active')
        .order('tour_date', { ascending: true })

      if (error) {
        console.error('Error fetching favorite tours:', error)
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getFavoriteTours:', error)
      throw error
    }
  },

  // Auto-discover bookings after first booking
  async checkForNewBookings(userProfile) {
    try {
      const { email, whatsapp } = userProfile
      if (!email && !whatsapp) return []

      // Get bookings from last 24 hours
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      let query = supabase
        .from('bookings')
        .select(`
          *,
          tours:tour_id (tour_name, tour_date, time_slot),
          operators:operator_id (company_name)
        `)
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false })

      if (email && whatsapp) {
        query = query.or(`customer_email.eq.${email},customer_whatsapp.eq.${whatsapp}`)
      } else if (email) {
        query = query.eq('customer_email', email)
      } else if (whatsapp) {
        query = query.eq('customer_whatsapp', whatsapp)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error checking for new bookings:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in checkForNewBookings:', error)
      return []
    }
  }
}

// Update the existing tourService to include favorites support
export const tourServiceUpdated = {
  ...tourService, // Keep existing functions
  
  // Get tour details for favorites
  async getToursByIds(tourIds) {
    try {
      if (!tourIds || tourIds.length === 0) {
        return []
      }

      const { data, error } = await supabase
        .from('active_tours_with_operators')
        .select('*')
        .in('id', tourIds)
        .order('tour_date', { ascending: true })

      if (error) {
        console.error('Error fetching tours by IDs:', error)
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getToursByIds:', error)
      return []
    }
  }
}