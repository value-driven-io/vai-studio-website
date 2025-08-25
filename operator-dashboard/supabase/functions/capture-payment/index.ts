// operator-dashboard/supabase/functions/capture-payment/index.ts
// Supabase Edge Function to capture authorized Stripe payments

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { payment_intent_id, amount_to_capture } = await req.json()

    if (!payment_intent_id) {
      throw new Error('payment_intent_id is required')
    }

    console.log(`💰 Capturing payment intent: ${payment_intent_id}`)

    // First, check the current status of the payment intent
    let paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id)
    console.log(`📊 Current payment status: ${paymentIntent.status}`)

    if (paymentIntent.status === 'succeeded') {
      // Payment is already captured - return success with current data
      console.log(`✅ Payment already captured: ${paymentIntent.id}`)
      console.log(`💵 Amount already captured: ${paymentIntent.amount_received}`)
    } else if (paymentIntent.status === 'requires_capture') {
      // Payment needs to be captured
      console.log(`🔄 Capturing payment: ${payment_intent_id}`)
      paymentIntent = await stripe.paymentIntents.capture(payment_intent_id, {
        amount_to_capture: amount_to_capture || undefined
      })
      console.log(`✅ Payment captured successfully: ${paymentIntent.id}`)
      console.log(`💵 Amount captured: ${paymentIntent.amount_received}`)
    } else {
      // Payment is in an unexpected state
      throw new Error(`Cannot capture payment in status: ${paymentIntent.status}`)
    }

    // Calculate Stripe fee (approximate - actual fee from Stripe webhooks is more accurate)
    const stripeFee = Math.round(paymentIntent.amount_received * 0.029 + 30) // 2.9% + 30¢

    return new Response(
      JSON.stringify({
        success: true,
        payment_intent_id: paymentIntent.id,
        charge_id: paymentIntent.charges?.data?.[0]?.id || null,
        amount_captured: paymentIntent.amount_received,
        currency: paymentIntent.currency,
        stripe_fee: stripeFee,
        status: paymentIntent.status
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Payment capture error:', error)
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      statusCode: error.statusCode
    })

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        code: error.code || 'capture_failed',
        type: error.type || 'unknown',
        details: error.statusCode ? `HTTP ${error.statusCode}` : 'No additional details'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})