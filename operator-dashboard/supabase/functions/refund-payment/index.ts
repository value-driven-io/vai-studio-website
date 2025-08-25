// operator-dashboard/supabase/functions/refund-payment/index.ts
// Supabase Edge Function to refund or cancel Stripe payments

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
    const { payment_intent_id, refund_amount, reason = 'requested_by_customer' } = await req.json()

    if (!payment_intent_id) {
      throw new Error('payment_intent_id is required')
    }

    console.log(`💸 Processing refund for payment intent: ${payment_intent_id}`)

    // First, get the payment intent to check its status
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id)
    console.log(`💰 Payment intent status: ${paymentIntent.status}`)

    let result = {}

    if (paymentIntent.status === 'requires_capture') {
      // Payment was only authorized, cancel it instead of refunding
      console.log('🚫 Canceling authorized payment (not captured yet)')
      
      const canceledIntent = await stripe.paymentIntents.cancel(payment_intent_id)
      
      result = {
        success: true,
        action: 'canceled',
        payment_intent_id: canceledIntent.id,
        amount_refunded: canceledIntent.amount,
        currency: canceledIntent.currency,
        status: canceledIntent.status
      }

    } else if (paymentIntent.status === 'succeeded') {
      // Payment was captured, create a refund
      console.log('💸 Creating refund for captured payment')
      
      const refund = await stripe.refunds.create({
        payment_intent: payment_intent_id,
        amount: refund_amount || undefined, // If null, refund full amount
        reason: reason,
        metadata: {
          refund_source: 'vai_operator_dashboard',
          timestamp: new Date().toISOString()
        }
      })

      result = {
        success: true,
        action: 'refunded',
        refund_id: refund.id,
        payment_intent_id: payment_intent_id,
        amount_refunded: refund.amount,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason
      }

    } else {
      throw new Error(`Cannot refund payment in status: ${paymentIntent.status}`)
    }

    console.log(`✅ Payment ${result.action} successfully`)

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Payment refund error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        code: error.code || 'refund_failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})