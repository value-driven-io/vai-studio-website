// operator-dashboard/supabase/functions/get-payment-status/index.ts
// Supabase Edge Function to get Stripe payment status and details

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const { payment_intent_id } = await req.json()

    if (!payment_intent_id) {
      throw new Error('payment_intent_id is required')
    }

    console.log(`🔍 Fetching payment status for: ${payment_intent_id}`)

    // Retrieve payment intent with charges
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id, {
      expand: ['charges.data.balance_transaction']
    })

    const latestCharge = paymentIntent.charges.data[0]
    const balanceTransaction = latestCharge?.balance_transaction

    // Calculate actual Stripe fees if available
    let actualStripeFee = 0
    if (balanceTransaction && typeof balanceTransaction === 'object') {
      actualStripeFee = balanceTransaction.fee
    }

    const result = {
      payment_intent_id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      amount_received: paymentIntent.amount_received,
      currency: paymentIntent.currency,
      created: paymentIntent.created,
      
      // Charge information
      charge_id: latestCharge?.id,
      charge_status: latestCharge?.status,
      
      // Fee information (actual from Stripe if available)
      stripe_fee: actualStripeFee,
      
      // Capture information
      amount_capturable: paymentIntent.amount_capturable,
      capture_method: paymentIntent.capture_method,
      
      // Metadata
      description: paymentIntent.description,
      metadata: paymentIntent.metadata,
      
      // Timestamps
      created_at: new Date(paymentIntent.created * 1000).toISOString(),
      
      // Refund information
      refunds: latestCharge?.refunds || null
    }

    console.log(`✅ Payment status retrieved: ${result.status}`)

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Payment status fetch error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        code: error.code || 'status_fetch_failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})