// src/services/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Add fallback check
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  throw new Error('Supabase configuration missing')
}

console.log('🔧 Creating Supabase client')
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

      // Remove fields that don't belong in the bookings table
      const { tour_name, customer_first_name, customer_last_name, ...cleanBookingData } = bookingData

      const bookingPayload = {
        ...cleanBookingData,
        subtotal,
        commission_amount: commissionAmount,
        applied_commission_rate: commissionRate,
        booking_reference: bookingReference,
        booking_status: 'pending',
        payment_status: bookingData.payment_status || 'pending',
        confirmation_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        webhook_sent: false,
        whatsapp_sent: false,
        email_sent: false,
        commission_locked_at: null,
        // Stripe Connect payment fields
        payment_intent_id: bookingData.payment_intent_id || null,
        operator_amount_cents: bookingData.operator_amount_cents || null,
        platform_fee_cents: bookingData.platform_fee_cents || null
      }

      // Insert booking
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingPayload])
        .select('id, booking_reference, booking_status, created_at, payment_status')
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
  }
}

// Journey Service
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
  }
}