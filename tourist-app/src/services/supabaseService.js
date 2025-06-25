import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
)

export const tourService = {
  // Get available tours
  getAvailableTours: async () => {
    const { data, error } = await supabase
      .from('tours')
      .select(`
        *,
        operators (
          company_name,
          island
        )
      `)
      .gt('available_spots', 0)
      .gte('tour_date', new Date().toISOString().split('T')[0])
      .order('tour_date', { ascending: true })

    if (error) throw error
    return data
  },

  // Create new booking
  createBooking: async (tourId, bookingData) => {
  // Generate booking reference
  const bookingReference = `VAI-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
  
  // Set confirmation deadline (60 minutes from now)
  const confirmationDeadline = new Date()
  confirmationDeadline.setMinutes(confirmationDeadline.getMinutes() + 60)
  
  // Get tour data for pricing and operator
  const { data: tour, error: tourError } = await supabase
    .from('tours')
    .select('discount_price_adult, discount_price_child, operator_id')
    .eq('id', tourId)
    .single()
  
  if (tourError) throw tourError
  
  // Calculate pricing
  const adultPrice = tour.discount_price_adult
  const childPrice = tour.discount_price_child || Math.round(adultPrice * 0.7)
  const subtotal = (bookingData.num_adults * adultPrice) + (bookingData.num_children * childPrice)
  const commission = Math.round(subtotal * 0.10) // 10% commission
  
  // Prepare booking data with ALL required fields
  const bookingInsert = {
    // Required UUID fields
    tour_id: tourId,
    operator_id: tour.operator_id,
    
    // Required customer info
    customer_name: bookingData.customer_name,
    customer_email: bookingData.customer_email,
    customer_phone: bookingData.customer_whatsapp, // Use WhatsApp for phone too
    customer_whatsapp: bookingData.customer_whatsapp,
    
    // Required participant counts
    num_adults: bookingData.num_adults,
    num_children: bookingData.num_children || 0,
    
    // Required pricing fields
    adult_price: adultPrice,
    subtotal: subtotal,
    commission_amount: commission,
    
    // Optional fields (only add if we have values)
    ...(bookingData.special_requirements && { special_requirements: bookingData.special_requirements }),
    ...(bookingData.dietary_restrictions && { dietary_restrictions: bookingData.dietary_restrictions }),
    ...(bookingData.accessibility_needs && { accessibility_needs: bookingData.accessibility_needs }),
    ...(bookingReference && { booking_reference: bookingReference }),
    ...(childPrice && { child_price: childPrice }),
    
    // Add confirmation deadline
    confirmation_deadline: confirmationDeadline.toISOString()
  }
  
  console.log('Inserting complete booking:', bookingInsert)
  
  // Create booking in database
  const { data, error } = await supabase
    .from('bookings')
    .insert([bookingInsert])
    .select()
  
  if (error) {
    console.error('Supabase error:', error)
    throw error
  }
  
  // Trigger n8n webhook
  const webhookUrl = 'https://n8n-stable-latest.onrender.com/webhook-test/vai-new-booking'
  
  try {
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        booking_id: data[0].id
      })
    })
    
    if (!webhookResponse.ok) {
      console.error('Webhook failed:', webhookResponse.status, webhookResponse.statusText)
    }
  } catch (webhookError) {
    console.error('Webhook error:', webhookError)
    // Don't throw here - booking was created successfully
  }
  
  return data[0]
}
}