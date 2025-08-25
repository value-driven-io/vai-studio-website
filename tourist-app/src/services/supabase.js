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
    disabled: false // Pro Plan Supabase
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

      const commissionRate = operatorData.commission_rate || 11.00 // fallback to 11%

      // Calculate totals with dynamic commission rate
      const adultTotal = bookingData.num_adults * bookingData.adult_price
      const childTotal = bookingData.num_children * (bookingData.child_price || Math.round(bookingData.adult_price * 0.7))
      const totalAmount = adultTotal + childTotal  // What tourist pays (Final Price)

      // Calculate commission from total amount (Final Price Model)
      const commissionAmount = Math.round(totalAmount * (commissionRate / 100))
      const subtotal = totalAmount - commissionAmount  // What operator receives

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
        payment_status: bookingData.payment_status || 'pending',
        confirmation_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        webhook_sent: false,
        whatsapp_sent: false,
        email_sent: false,
        commission_locked_at: null, // Not locked until confirmed
        // Stripe Connect payment fields
        payment_intent_id: bookingData.payment_intent_id || null,
        operator_amount_cents: bookingData.operator_amount_cents || null,
        platform_fee_cents: bookingData.platform_fee_cents || null
      }

      // Insert booking
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingPayload])
        .select()
        .single()

      if (error) throw error

      // Update available spots in tours table
        const totalParticipants = bookingData.num_adults + bookingData.num_children

        try {
          // Get current available spots
          const { data: tourData, error: tourError } = await supabase
            .from('tours')
            .select('available_spots')
            .eq('id', bookingData.tour_id)
            .single()

          if (tourError) {
            console.warn('Failed to fetch tour for spots update:', tourError)
          } else if (tourData) {
            // Calculate new available spots
            const newAvailableSpots = Math.max(0, tourData.available_spots - totalParticipants)
            
            // Update tours table
            const { error: spotsError } = await supabase
              .from('tours')
              .update({ available_spots: newAvailableSpots })
              .eq('id', bookingData.tour_id)

            if (spotsError) {
              console.warn('Failed to update available spots:', spotsError)
              // Don't throw error - booking was successful, spots update is secondary
            } else {
              console.log(`✅ Updated available spots: ${tourData.available_spots} → ${newAvailableSpots}`)
            }
          }
        } catch (spotsError) {
          console.warn('Available spots update failed:', spotsError)
          // Don't throw - booking creation succeeded, spots update is non-critical
        }

      return data

    } catch (error) {
      console.error('Booking creation error:', error)
      throw error
    }
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
          meeting_point,
          tour_type,
          duration_hours
        ),
        operators:operator_id (
          company_name,
          whatsapp_number,
          phone,
          contact_person
        ),
        tourist_users:tourist_user_id (
          first_name,
          last_name, 
          email,
          whatsapp_number,
          phone
        )
      `)
      .eq('tourist_users.email', customerEmail)
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
        ),
        tourist_users:tourist_user_id (
          first_name,
          last_name, 
          email,
          whatsapp_number,
          phone
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
          filter: `tourist_users.email=eq.${customerEmail}`
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
        ),
        tourist_users:tourist_user_id (
          first_name,
          last_name, 
          email,
          whatsapp_number,
          phone
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

    // Restore available spots when declining
    if (status === 'declined' && data) {
      try {
        const totalParticipants = (data.num_adults || 0) + (data.num_children || 0)
        
        // Get current available spots
        const { data: tourData, error: tourError } = await supabase
          .from('tours')
          .select('available_spots')
          .eq('id', data.tour_id)
          .single()

        if (tourError) {
          console.warn('Failed to fetch tour for spots restoration:', tourError)
        } else if (tourData) {
          // Add participants back to available spots
          const newAvailableSpots = tourData.available_spots + totalParticipants
          
          // Update tours table
          const { error: spotsError } = await supabase
            .from('tours')
            .update({ available_spots: newAvailableSpots })
            .eq('id', data.tour_id)

          if (spotsError) {
            console.warn('Failed to restore available spots:', spotsError)
          } else {
            console.log(`✅ Restored available spots: ${tourData.available_spots} → ${newAvailableSpots}`)
          }
        }
      } catch (spotsError) {
        console.warn('Available spots restoration failed:', spotsError)
        // Don't throw - booking status update succeeded
      }
    }

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

// Journey & Booking Management Functions

export const journeyService = {
  // Lightweight query for Journey tab (67% faster)
  async getUserBookings(email, whatsapp) {
    try {
      console.log('🔍 getUserBookings called with:', { email, whatsapp })
      
      // Clean inputs
      const cleanEmail = email?.trim()
      const cleanWhatsApp = whatsapp?.trim()
      
      if (!cleanEmail && !cleanWhatsApp) {
        console.log('No email or WhatsApp provided')
        return []
      }

      let emailBookings = []
      let whatsappBookings = []

      // Select ONLY columns needed for Journey tab
      const essentialColumns = `
        id,
        booking_reference,
        booking_status,
        created_at,
        confirmed_at,
        cancelled_at,
        total_amount,
        num_adults,
        num_children,
        customer_email,
        customer_whatsapp,
        confirmation_deadline,
        special_requirements,
        tours:tour_id (
          tour_name,
          tour_date,
          time_slot,
          meeting_point,
          tour_type
        ),
        operators:operator_id (
          company_name,
          whatsapp_number,
          island
        )
      `

      // Query by email if provided
      if (cleanEmail) {
        const { data: emailData, error: emailError } = await supabase
          .from('bookings')
          .select(essentialColumns) // Only essential columns
          .eq('customer_email', cleanEmail)
          .order('created_at', { ascending: false })

        if (emailError) {
          console.error('Error fetching bookings by email:', emailError)
        } else {
          emailBookings = emailData || []
          console.log(`Found ${emailBookings.length} bookings by email`)
        }
      }

      // Query by WhatsApp if provided
      if (cleanWhatsApp) {
        const { data: whatsappData, error: whatsappError } = await supabase
          .from('bookings')
          .select(essentialColumns) // Only essential columns
          .eq('customer_whatsapp', cleanWhatsApp)
          .order('created_at', { ascending: false })

        if (whatsappError) {
          console.error('Error fetching bookings by WhatsApp:', whatsappError)
        } else {
          whatsappBookings = whatsappData || []
          console.log(`Found ${whatsappBookings.length} bookings by WhatsApp`)
        }
      }

      // Merge and deduplicate
      const allBookings = [...emailBookings, ...whatsappBookings]
      const uniqueBookings = allBookings.filter((booking, index, self) => 
        index === self.findIndex(b => b.id === booking.id)
      )

      const sortedBookings = uniqueBookings.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      )

      console.log(`✅ Total unique bookings found: ${sortedBookings.length}`)
      return sortedBookings
      
    } catch (error) {
      console.error('Error in getUserBookings:', error)
      throw error
    }
  },

  // 🔧 ULTRA-LIGHTWEIGHT: Status check for smart polling
  async getUserBookingStatusUpdates(email, whatsapp, sinceTimestamp) {
    try {
      if (!email && !whatsapp) return []

      const ultraLightColumns = `
        id,
        booking_reference,
        booking_status,
        updated_at
      `

      let query = supabase
        .from('bookings')
        .select(ultraLightColumns)
        .gt('updated_at', sinceTimestamp || '1970-01-01')
        .order('updated_at', { ascending: false })

      // Build filter condition
      if (email && whatsapp) {
        query = query.or(`customer_email.eq.${email},customer_whatsapp.eq.${whatsapp}`)
      } else if (email) {
        query = query.eq('customer_email', email)
      } else if (whatsapp) {
        query = query.eq('customer_whatsapp', whatsapp)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching status updates:', error)
        return []
      }

      console.log(`📊 Status updates found: ${data?.length || 0}`)
      return data || []
      
    } catch (error) {
      console.error('Error in getUserBookingStatusUpdates:', error)
      return []
    }
  },

  // 🔧 DETAILED: Full booking data for booking detail modal
  async getBookingDetails(bookingId) {
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
            restrictions,
            equipment_included,
            food_included,
            drinks_included
          ),
          operators:operator_id (
            company_name,
            whatsapp_number,
            phone,
            contact_person,
            island,
            email
          )
        `)
        .eq('id', bookingId)
        .single()

      if (error) throw error
      return data
      
    } catch (error) {
      console.error('Error in getBookingDetails:', error)
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
          ),
          tourist_users:tourist_user_id (
            first_name,
            last_name, 
            email,
            whatsapp_number,
            phone
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
          filter: email ? `tourist_users.email=eq.${email}` : `tourist_users.whatsapp_number=eq.${whatsapp}`
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
          tours:tour_id (tour_name, tour_date),
          operators:operator_id (company_name),
          tourist_users:tourist_user_id (
            first_name,
            last_name, 
            email,
            whatsapp_number,
            phone
          )
        `)
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false })

      if (email && whatsapp) {
        query = query.or(`tourist_users.email.eq."${email}",tourist_users.whatsapp_number.eq."${whatsapp}"`)
      } else if (email) {
        query = query.eq('tourist_users.email', email)
      } else if (whatsapp) {
        query = query.eq('tourist_users.whatsapp_number', whatsapp)
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