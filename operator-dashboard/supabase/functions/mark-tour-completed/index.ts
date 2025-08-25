// supabase/functions/mark-tour-completed/index.ts
// Marks a tour as completed and starts the 48-hour payout countdown

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { booking_id, operator_id, completed_at } = await req.json()

    if (!booking_id || !operator_id) {
      throw new Error('booking_id and operator_id are required')
    }

    console.log(`✅ Marking tour as completed for booking: ${booking_id}`)

    // Get booking details and verify operator ownership
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_reference,
        operator_id,
        payment_status,
        tour_completed_at,
        payout_status,
        operator_amount_cents,
        booking_status
      `)
      .eq('id', booking_id)
      .eq('operator_id', operator_id) // Security: only booking's operator can mark complete
      .single()

    if (bookingError || !booking) {
      throw new Error('Booking not found or access denied')
    }

    // Validate booking state
    if (booking.booking_status !== 'confirmed') {
      throw new Error('Only confirmed bookings can be marked as completed')
    }

    if (booking.payment_status !== 'captured' && booking.payment_status !== 'paid') {
      throw new Error('Payment must be captured before marking tour complete')
    }

    if (booking.tour_completed_at) {
      // Already completed - return current status
      const payoutEligibleAt = new Date(new Date(booking.tour_completed_at).getTime() + (48 * 60 * 60 * 1000))
      
      return new Response(
        JSON.stringify({
          success: true,
          already_completed: true,
          booking_reference: booking.booking_reference,
          tour_completed_at: booking.tour_completed_at,
          payout_eligible_at: payoutEligibleAt.toISOString(),
          payout_status: booking.payout_status,
          message: 'Tour was already marked as completed'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Mark tour as completed
    const completedTimestamp = completed_at || new Date().toISOString()
    const payoutEligibleAt = new Date(new Date(completedTimestamp).getTime() + (48 * 60 * 60 * 1000))

    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        tour_completed_at: completedTimestamp,
        payout_status: booking.operator_amount_cents ? 'pending' : 'not_applicable',
        booking_status: 'completed' // Update overall status
      })
      .eq('id', booking_id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    console.log(`🎯 Tour completed for booking ${booking.booking_reference}`)
    console.log(`💰 Payout eligible at: ${payoutEligibleAt.toISOString()}`)

    // Schedule automatic payout processing (this could trigger a cron job or webhook)
    // For now, we'll just log it - in production you might want to trigger a delayed job
    const hoursUntilPayout = 48
    console.log(`⏰ Payout will be processed in ${hoursUntilPayout} hours`)

    return new Response(
      JSON.stringify({
        success: true,
        booking_id: booking.id,
        booking_reference: booking.booking_reference,
        tour_completed_at: completedTimestamp,
        payout_eligible_at: payoutEligibleAt.toISOString(),
        payout_status: updatedBooking.payout_status,
        operator_amount_cents: booking.operator_amount_cents,
        hours_until_payout: hoursUntilPayout,
        message: 'Tour marked as completed. Payout will be processed in 48 hours.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Tour completion error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        code: error.code || 'tour_completion_failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})