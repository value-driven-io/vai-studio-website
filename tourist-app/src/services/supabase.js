console.log('Environment check:')
console.log('URL exists:', !!import.meta.env.VITE_SUPABASE_URL)
console.log('KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
console.log('All env vars:', import.meta.env)

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
    autoRefreshToken: false,
    persistSession: false
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
    }

    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching tours:', error)
      throw error
    }
    
    return data
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
    // Calculate totals
    const adultTotal = bookingData.num_adults * bookingData.adult_price
    const childTotal = bookingData.num_children * (bookingData.child_price || bookingData.adult_price * 0.7)
    const subtotal = adultTotal + childTotal
    const commissionAmount = Math.round(subtotal * 0.10) // 10% commission
    const totalAmount = subtotal + commissionAmount

    // Generate booking reference
    const bookingReference = `VAI-${Date.now()}-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}`

    const bookingPayload = {
      ...bookingData,
      subtotal,
      commission_amount: commissionAmount,
      total_amount: totalAmount,
      booking_reference: bookingReference,
      total_participants: bookingData.num_adults + bookingData.num_children,
      booking_status: 'pending',
      payment_status: 'pending',
      confirmation_deadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      webhook_sent: false,
      whatsapp_sent: false,
      email_sent: false
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingPayload])
      .select()
      .single()

    if (error) {
      console.error('Error creating booking:', error)
      throw error
    }

    return data
  },

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
          meeting_point
        ),
        operators:operator_id (
          company_name,
          whatsapp_number
        )
      `)
      .eq('customer_email', customerEmail)
      .order('created_at', { ascending: false })

    if (error) throw error
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