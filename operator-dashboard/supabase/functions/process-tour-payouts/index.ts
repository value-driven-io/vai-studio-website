// supabase/functions/process-tour-payouts/index.ts
// Processes payouts for tours completed more than 48 hours ago

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Minimum delay before payout (48 hours in milliseconds)
const PAYOUT_DELAY_MS = 48 * 60 * 60 * 1000

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { booking_id, force_process = false } = await req.json()

    console.log(`💰 Processing payouts${booking_id ? ` for booking ${booking_id}` : ' for all eligible bookings'}`)

    // Query for bookings ready for payout
    let query = supabase
      .from('bookings')
      .select(`
        id,
        booking_reference,
        tour_completed_at,
        operator_amount_cents,
        platform_fee_cents,
        payment_intent_id,
        payment_status,
        payout_status,
        payout_transfer_id,
        operator_id,
        operators!inner(
          stripe_connect_account_id,
          stripe_payouts_enabled,
          name
        )
      `)
      .eq('payment_status', 'captured') // Only captured payments
      .eq('payout_status', 'pending') // Only pending payouts
      .not('tour_completed_at', 'is', null) // Must have completion timestamp
      .not('operator_amount_cents', 'is', null) // Must have payout amount
      .eq('operators.stripe_payouts_enabled', true) // Operator must be able to receive payouts

    if (booking_id) {
      query = query.eq('id', booking_id)
    } else if (!force_process) {
      // Only process bookings completed more than 48 hours ago
      const cutoffTime = new Date(Date.now() - PAYOUT_DELAY_MS).toISOString()
      query = query.lt('tour_completed_at', cutoffTime)
    }

    const { data: eligibleBookings, error: queryError } = await query

    if (queryError) {
      throw queryError
    }

    if (!eligibleBookings || eligibleBookings.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No bookings eligible for payout',
          processed: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    console.log(`📋 Found ${eligibleBookings.length} bookings ready for payout`)

    const results = []

    for (const booking of eligibleBookings) {
      try {
        console.log(`💸 Processing payout for booking ${booking.booking_reference}`)

        // Validate operator has Connect account
        if (!booking.operators?.stripe_connect_account_id) {
          throw new Error(`Operator ${booking.operator_id} has no Stripe Connect account`)
        }

        // Check if enough time has passed since tour completion
        const completedAt = new Date(booking.tour_completed_at)
        const timeSinceCompletion = Date.now() - completedAt.getTime()
        
        if (timeSinceCompletion < PAYOUT_DELAY_MS && !force_process) {
          const hoursRemaining = Math.ceil((PAYOUT_DELAY_MS - timeSinceCompletion) / (1000 * 60 * 60))
          console.log(`⏳ Booking ${booking.booking_reference} needs ${hoursRemaining} more hours before payout`)
          results.push({
            booking_id: booking.id,
            booking_reference: booking.booking_reference,
            success: false,
            error: `Payout scheduled in ${hoursRemaining} hours`,
            hours_remaining: hoursRemaining
          })
          continue
        }

        // Create transfer to operator's Connect account
        const transfer = await stripe.transfers.create({
          amount: booking.operator_amount_cents,
          currency: 'usd',
          destination: booking.operators.stripe_connect_account_id,
          description: `VAI Booking ${booking.booking_reference} - Tour completed payout`,
          metadata: {
            booking_id: booking.id,
            booking_reference: booking.booking_reference,
            operator_id: booking.operator_id,
            operator_name: booking.operators.name,
            tour_completed_at: booking.tour_completed_at,
            payout_delay_hours: '48'
          }
        })

        console.log(`✅ Created transfer: ${transfer.id} for ${transfer.amount}¢ to ${booking.operators.name}`)

        // Update booking record
        const { error: updateError } = await supabase
          .from('bookings')
          .update({
            payout_status: 'processing',
            payout_transfer_id: transfer.id,
            payout_scheduled_at: new Date().toISOString()
          })
          .eq('id', booking.id)

        if (updateError) {
          console.error(`Failed to update booking ${booking.id}:`, updateError)
          throw updateError
        }

        results.push({
          booking_id: booking.id,
          booking_reference: booking.booking_reference,
          success: true,
          transfer_id: transfer.id,
          amount: transfer.amount,
          operator_name: booking.operators.name,
          tour_completed_at: booking.tour_completed_at
        })

      } catch (error) {
        console.error(`❌ Failed to process payout for booking ${booking.id}:`, error)
        
        // Mark as failed in database
        await supabase
          .from('bookings')
          .update({
            payout_status: 'failed'
          })
          .eq('id', booking.id)

        results.push({
          booking_id: booking.id,
          booking_reference: booking.booking_reference,
          success: false,
          error: error.message
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    console.log(`📊 Payout processing complete: ${successCount} successful, ${failCount} failed`)

    return new Response(
      JSON.stringify({
        success: true,
        processed: successCount,
        failed: failCount,
        total: results.length,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Payout processing error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        code: error.code || 'payout_processing_failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})