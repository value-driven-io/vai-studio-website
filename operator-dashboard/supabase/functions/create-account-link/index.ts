// supabase/functions/create-account-link/index.ts
// Creates Stripe Connect account management links for operators

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
    const { operator_id, link_type = 'account_onboarding' } = await req.json()

    if (!operator_id) {
      throw new Error('operator_id is required')
    }

    // Get operator's Connect account details
    const { data: operator, error: operatorError } = await supabase
      .from('operators')
      .select('stripe_connect_account_id')
      .eq('id', operator_id)
      .single()

    if (operatorError || !operator) {
      throw new Error('Operator not found')
    }

    if (!operator.stripe_connect_account_id) {
      throw new Error('Operator has no Stripe Connect account')
    }

    console.log(`🔗 Creating account link for: ${operator.stripe_connect_account_id}, type: ${link_type}`)

    // Get operator dashboard URL with fallback
    // For staging/development, use localhost. For production, set OPERATOR_DASHBOARD_URL environment variable
    const dashboardUrl = Deno.env.get('OPERATOR_DASHBOARD_URL') || 'http://localhost:3000'
    
    console.log(`🔗 Using dashboard URL: ${dashboardUrl}`)

    // Create account link based on type
    const accountLink = await stripe.accountLinks.create({
      account: operator.stripe_connect_account_id,
      refresh_url: `${dashboardUrl}/profile?stripe_refresh=true`,
      return_url: `${dashboardUrl}/profile?stripe_success=true`,
      type: link_type, // 'account_onboarding' or 'account_update'
    })

    console.log(`✅ Created account link: ${accountLink.url}`)

    return new Response(
      JSON.stringify({
        success: true,
        link_url: accountLink.url,
        link_type,
        expires_at: accountLink.expires_at
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Account link creation error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        code: error.code || 'account_link_failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})