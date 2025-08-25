// tourist-app/supabase/functions/create-connect-payment-intent/index.ts
// Creates Stripe Connect marketplace payment intents with automatic commission split

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
    const { 
      amount, 
      currency, 
      booking_reference, 
      operator_id,
      metadata = {} 
    } = await req.json()

    if (!amount || !operator_id || !booking_reference) {
      throw new Error('amount, operator_id, and booking_reference are required')
    }

    console.log(`💳 Creating Connect payment intent for booking: ${booking_reference}`)
    console.log(`💰 Amount: ${amount} ${currency}, Operator: ${operator_id}`)

    // Get operator's Stripe Connect account
    const { data: operator, error: operatorError } = await supabase
      .from('operators')
      .select('stripe_connect_account_id, commission_rate, name')
      .eq('id', operator_id)
      .single()

    if (operatorError || !operator) {
      throw new Error(`Operator not found: ${operator_id}`)
    }

    if (!operator.stripe_connect_account_id) {
      throw new Error('Operator has not connected their Stripe account')
    }

    const commissionRate = operator.commission_rate || 0.11 // Default 11% to platform
    const platformFeeAmount = Math.round(amount * commissionRate) // Platform fee in cents
    const operatorAmount = amount - platformFeeAmount // Amount operator receives

    console.log(`💼 Commission split: Platform ${platformFeeAmount}¢, Operator ${operatorAmount}¢`)

    // Create payment intent with destination charge (marketplace model)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency || 'usd',
      capture_method: 'manual', // Authorization only - capture after operator confirms
      
      // Marketplace model: money goes to connected account, platform takes fee
      transfer_data: {
        destination: operator.stripe_connect_account_id,
        amount: operatorAmount // Amount that goes to operator (after platform fee)
      },
      
      // Platform fee (what VAI Studio keeps)
      application_fee_amount: platformFeeAmount,
      
      metadata: {
        booking_reference,
        operator_id,
        operator_name: operator.name,
        platform_fee: platformFeeAmount,
        operator_amount: operatorAmount,
        commission_rate: commissionRate.toString(),
        ...metadata
      },

      // Description for both platform and connected account
      description: `VAI Booking ${booking_reference} - ${operator.name}`,
      
      // Connected account statement descriptor
      on_behalf_of: operator.stripe_connect_account_id,
    })

    console.log(`✅ Created Connect payment intent: ${paymentIntent.id}`)
    console.log(`🎯 Destination account: ${operator.stripe_connect_account_id}`)

    return new Response(
      JSON.stringify({
        success: true,
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        amount,
        currency: paymentIntent.currency,
        operator_amount: operatorAmount,
        platform_fee: platformFeeAmount,
        commission_rate: commissionRate,
        destination_account: operator.stripe_connect_account_id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Connect payment creation error:', error)
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
        code: error.code || 'payment_creation_failed',
        type: error.type || 'unknown'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})