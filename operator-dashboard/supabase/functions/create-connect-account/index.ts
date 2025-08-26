// supabase/functions/create-connect-account/index.ts
// Creates Stripe Connect Express accounts for operators

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
    const { operator_id, business_info, refresh_url, return_url, operator_country } = await req.json()

    if (!operator_id) {
      throw new Error('operator_id is required')
    }

    // Get operator details
    const { data: operator, error: operatorError } = await supabase
      .from('operators')
      .select('*')
      .eq('id', operator_id)
      .single()

    if (operatorError || !operator) {
      throw new Error('Operator not found')
    }

    // Check if operator already has a Connect account
    if (operator.stripe_connect_account_id) {
      console.log(`⚠️ Operator already has Connect account: ${operator.stripe_connect_account_id}`)
      
      // Get operator dashboard URL with fallback
      const dashboardUrl = Deno.env.get('OPERATOR_DASHBOARD_URL') || 'http://localhost:3000'
      
      // Return existing account link
      const accountLink = await stripe.accountLinks.create({
        account: operator.stripe_connect_account_id,
        refresh_url: refresh_url || `${dashboardUrl}/profile?stripe_refresh=true`,
        return_url: return_url || `${dashboardUrl}/profile?stripe_success=true`,
        type: 'account_onboarding',
      })

      return new Response(
        JSON.stringify({
          success: true,
          account_id: operator.stripe_connect_account_id,
          onboarding_url: accountLink.url,
          existing_account: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    console.log(`🏢 Creating Connect account for operator: ${operator_id}`)

    // Validate and use the selected country from frontend
    const supportedCountries = [
      'FR', 'US', 'GB', 'AU', 'CA', 'DE', 'IT', 'ES', 'NL', 'CH',
      'AT', 'BE', 'DK', 'FI', 'IE', 'LU', 'NO', 'PT', 'SE', 'SG', 
      'JP', 'HK', 'NZ'
    ]
    
    const connectCountry = operator_country && supportedCountries.includes(operator_country) 
      ? operator_country 
      : 'FR' // Default to France (confirmed working)

    console.log(`🌍 Creating Connect account for country: ${connectCountry}`)

    // Create Stripe Express account for international operators
    const account = await stripe.accounts.create({
      type: 'express',
      country: connectCountry,
      email: operator.email || undefined,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: business_info?.business_type || 'individual',
      settings: {
        payouts: {
          schedule: {
            interval: 'manual' // We'll trigger payouts manually after tour completion + 48 hour delay
          }
        }
      },
      metadata: {
        operator_id: operator_id,
        platform: 'VAI Tourism Platform',
        country: 'French Polynesia',
        commission_rate: '0.11' // 11% to platform
      }
    })

    console.log(`✅ Created Connect account: ${account.id}`)

    // Update operator record
    const { error: updateError } = await supabase
      .from('operators')
      .update({
        stripe_connect_account_id: account.id,
        stripe_connect_status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', operator_id)

    if (updateError) {
      console.error('Failed to update operator record:', updateError)
      throw updateError
    }

    // Get operator dashboard URL with fallback
    const dashboardUrl = Deno.env.get('OPERATOR_DASHBOARD_URL') || 'http://localhost:3000'

    // Create account onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: refresh_url || `${dashboardUrl}/profile?stripe_refresh=true`,
      return_url: return_url || `${dashboardUrl}/profile?stripe_success=true`,
      type: 'account_onboarding',
    })

    console.log(`🔗 Generated onboarding link for account: ${account.id}`)

    return new Response(
      JSON.stringify({
        success: true,
        account_id: account.id,
        onboarding_url: accountLink.url,
        existing_account: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Connect account creation error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        code: error.code || 'account_creation_failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})