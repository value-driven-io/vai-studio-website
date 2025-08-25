// operator-dashboard/supabase/functions/create-payment-intent/index.ts
// Supabase Edge Function for VAI Tickets payment authorization
// Called by tourist-app for initial payment processing

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

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    const { 
      amount, 
      currency, 
      booking_reference, 
      capture_method = 'manual',
      metadata = {} 
    } = await req.json()

    console.log(`💳 Creating payment intent for booking: ${booking_reference}`)

    // Validate required fields
    if (!amount || !currency || !booking_reference) {
      throw new Error('Missing required fields: amount, currency, booking_reference')
    }

    // Validate amount (must be positive integer)
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error('Amount must be a positive integer (in cents)')
    }

    // Create Payment Intent with authorization only
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency.toLowerCase(),
      capture_method: capture_method, // 'manual' for auth/capture flow
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        booking_reference: booking_reference,
        platform: 'VAI_Tickets',
        created_at: new Date().toISOString(),
        ...metadata
      },
      description: `VAI Tickets Booking - ${booking_reference}`,
      statement_descriptor: 'VAI Tickets',
      receipt_email: metadata.customer_email || null,
    })

    console.log(`✅ Payment intent created: ${paymentIntent.id}`)

    // Return client secret for frontend confirmation
    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Payment Intent creation error:', error)
    
    // Handle specific Stripe errors
    let errorResponse = {
      error: 'Payment intent creation failed',
      message: error.message || 'Unknown error occurred'
    }

    if (error.type === 'StripeCardError') {
      errorResponse = {
        error: 'Card error',
        message: error.message,
        code: error.code
      }
    } else if (error.type === 'StripeInvalidRequestError') {
      errorResponse = {
        error: 'Invalid request',
        message: error.message
      }
    }

    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})