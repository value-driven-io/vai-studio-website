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
  console.log('🚀 Edge Function called v2:', req.method, req.url)
  
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
    
    console.log('🔍 Operator data from DB:', JSON.stringify(operator, null, 2))

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
    // Handle different commission rate storage formats from DB (string/number, percentage/basis points)
    let commissionRatePercent = parseFloat(operator.commission_rate) || 11.0
    
    // If commission rate is > 100, it's likely stored as basis points (e.g., 1100 = 11%)
    if (commissionRatePercent > 100) {
      commissionRatePercent = commissionRatePercent / 100 // Convert basis points to percentage
    }
    
    const commissionRate = commissionRatePercent / 100 // Convert percentage to decimal
    const platformFee = Math.round(amount * commissionRate)
    const operatorAmount = amount - platformFee

    console.log('🔍 Commission calculation details:', {
      commissionRateFromDB: operator.commission_rate,
      commissionRatePercent: commissionRatePercent,
      commissionRateDecimal: commissionRate,
      totalAmountCents: amount,
      platformFeeCents: platformFee,
      operatorAmountCents: operatorAmount
    })

    console.log(`💰 Payment split: Total: $${amount/100}, Platform: $${platformFee/100} (${Math.round(commissionRate*100)}%), Operator: $${operatorAmount/100}`)

    // Safety check: Ensure operatorAmount is at least 1 cent
    if (operatorAmount < 1) {
      throw new Error(`Operator amount too small: ${operatorAmount} cents. Commission rate may be too high.`)
    }

    console.log('🔧 About to call Stripe with:', {
      amount: amount,
      currency: currency.toLowerCase(),
      transfer_data_destination: operator.stripe_connect_account_id,
      transfer_data_amount: operatorAmount,
      application_fee_amount: platformFee
    })

    // Create regular payment intent (platform charges, then transfers to operator)
    // This avoids destination charge restrictions for international accounts
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency.toLowerCase(),
      capture_method: 'manual', // Authorization only
      automatic_payment_methods: {
        enabled: true,
      },
      // No transfer_data - we'll handle transfer separately after capture
      metadata: {
        booking_reference: booking_reference,
        operator_id: operator_id,
        platform: 'VAI Tourism Platform',
        operator_amount_cents: operatorAmount.toString(),
        platform_fee_cents: platformFee.toString(),
        commission_rate: commissionRatePercent.toString(),
        created_at: new Date().toISOString(),
        ...metadata
      },
      description: `VAI Tourism - ${metadata.tour_name || 'Tour Booking'} - ${booking_reference}`,
      statement_descriptor_suffix: 'VAI Tour',
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
        commission_rate: commissionRatePercent,
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