// supabase/functions/create-connect-payment-intent/index.ts
// Stripe Connect marketplace payment intent creation
// Creates destination charges for operator payouts with platform fees

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

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestBody = await req.json()
    console.log('📦 Request body received:', JSON.stringify(requestBody, null, 2))
    
    const { 
      amount, 
      currency, 
      booking_reference, 
      operator_id,
      metadata = {} 
    } = requestBody

    console.log('💳 Parsed parameters:', { amount, currency, booking_reference, operator_id })

    if (!amount || !currency || !booking_reference || !operator_id) {
      console.log('❌ Missing parameters check:', { 
        amount: !!amount, 
        currency: !!currency, 
        booking_reference: !!booking_reference, 
        operator_id: !!operator_id 
      })
      throw new Error('Missing required fields: amount, currency, booking_reference, operator_id')
    }

    console.log(`💳 Creating Connect payment intent for booking: ${booking_reference}, operator: ${operator_id}`)

    // Get operator's Stripe Connect account
    const { data: operator, error: operatorError } = await supabase
      .from('operators')
      .select('stripe_connect_account_id, commission_rate, stripe_charges_enabled')
      .eq('id', operator_id)
      .single()

    if (operatorError || !operator) {
      throw new Error('Operator not found')
    }

    if (!operator.stripe_connect_account_id) {
      throw new Error('Operator has no Stripe Connect account')
    }

    if (!operator.stripe_charges_enabled) {
      throw new Error('Operator cannot accept payments yet - setup incomplete')
    }

    // Calculate commission split (default 11% to platform, 89% to operator)
    const commissionRate = operator.commission_rate || 0.11
    const platformFee = Math.round(amount * commissionRate)
    const operatorAmount = amount - platformFee

    console.log(`💰 Payment split: Total: $${amount/100}, Platform: $${platformFee/100} (${Math.round(commissionRate*100)}%), Operator: $${operatorAmount/100}`)

    // Create destination charge (marketplace model)
    // Note: If operator is in French Polynesia (PF), they can receive XPF directly
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency.toLowerCase(), // Supports XPF for French Polynesia accounts
      capture_method: 'manual', // Authorization only
      automatic_payment_methods: {
        enabled: true,
      },
      transfer_data: {
        destination: operator.stripe_connect_account_id,
        amount: operatorAmount, // Amount that goes to operator (89%)
      },
      application_fee_amount: platformFee, // Platform fee (11%)
      metadata: {
        booking_reference: booking_reference,
        operator_id: operator_id,
        platform: 'VAI Tourism Platform',
        operator_amount_cents: operatorAmount.toString(),
        platform_fee_cents: platformFee.toString(),
        commission_rate: commissionRate.toString(),
        created_at: new Date().toISOString(),
        ...metadata
      },
      description: `VAI Tourism - ${metadata.tour_name || 'Tour Booking'} - ${booking_reference}`,
      statement_descriptor: 'VAI Tourism',
      receipt_email: metadata.customer_email || null,
    })

    console.log(`✅ Connect payment intent created: ${paymentIntent.id}`)

    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        operator_amount: operatorAmount,
        platform_fee: platformFee,
        commission_rate: commissionRate,
        destination_account: operator.stripe_connect_account_id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Connect payment intent creation error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        code: error.code || 'payment_intent_failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})