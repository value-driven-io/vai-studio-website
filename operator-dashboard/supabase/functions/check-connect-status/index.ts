// supabase/functions/check-connect-status/index.ts
// Checks and updates Stripe Connect account status

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
    const { operator_id } = await req.json()

    if (!operator_id) {
      throw new Error('operator_id is required')
    }

    // Get operator Connect account details
    const { data: operator, error: operatorError } = await supabase
      .from('operators')
      .select('stripe_connect_account_id')
      .eq('id', operator_id)
      .single()

    if (operatorError || !operator) {
      throw new Error('Operator not found')
    }

    if (!operator.stripe_connect_account_id) {
      return new Response(
        JSON.stringify({
          success: true,
          connected: false,
          status: 'not_connected',
          onboarding_complete: false,
          charges_enabled: false,
          payouts_enabled: false
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    console.log(`🔍 Checking Connect account status: ${operator.stripe_connect_account_id}`)

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(operator.stripe_connect_account_id)

    // Determine overall status
    let connectStatus = 'connected'
    if (!account.details_submitted) {
      connectStatus = 'pending'
    } else if (account.requirements?.disabled_reason) {
      connectStatus = 'rejected'
    }

    // Update operator record with latest status
    const { error: updateError } = await supabase
      .from('operators')
      .update({
        stripe_connect_status: connectStatus,
        stripe_onboarding_complete: account.details_submitted,
        stripe_charges_enabled: account.charges_enabled,
        stripe_payouts_enabled: account.payouts_enabled,
        updated_at: new Date().toISOString()
      })
      .eq('id', operator_id)

    if (updateError) {
      console.error('Failed to update operator status:', updateError)
    }

    // Check for any requirements or issues
    const requirements = account.requirements || {}
    const hasIssues = requirements.currently_due?.length > 0 || requirements.past_due?.length > 0

    return new Response(
      JSON.stringify({
        success: true,
        connected: true,
        account_id: account.id,
        status: connectStatus,
        onboarding_complete: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        has_issues: hasIssues,
        requirements: {
          currently_due: requirements.currently_due || [],
          past_due: requirements.past_due || [],
          disabled_reason: requirements.disabled_reason
        },
        business_profile: {
          mcc: account.business_profile?.mcc,
          url: account.business_profile?.url,
          name: account.business_profile?.name
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Connect status check error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        code: error.code || 'status_check_failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})