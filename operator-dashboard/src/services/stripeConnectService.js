// src/services/stripeConnectService.js
// Stripe Connect service for operator Express account management

import { supabase } from '../lib/supabase'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const stripeConnectService = {
  
  /**
   * Create or retrieve Stripe Connect Express account for operator
   * @param {string} operatorId - Operator ID
   * @param {object} businessInfo - Business information for account creation
   * @returns {Promise<object>} Account creation result with onboarding URL
   */
  async createConnectAccount(operatorId, businessInfo = {}) {
    try {
      console.log(`🏢 Creating Connect account for operator: ${operatorId}`)

      const response = await fetch(`${supabaseUrl}/functions/v1/create-connect-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          operator_id: operatorId,
          business_info: businessInfo,
          operator_country: businessInfo.operator_country || 'FR', // Default to France for French Polynesia
          refresh_url: `${window.location.origin}/profile?stripe_refresh=true`,
          return_url: `${window.location.origin}/profile?stripe_success=true`
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create Connect account')
      }

      const result = await response.json()
      
      if (result.existing_account) {
        console.log(`✅ Using existing Connect account: ${result.account_id}`)
      } else {
        console.log(`✅ Created new Connect account: ${result.account_id}`)
      }

      return result

    } catch (error) {
      console.error('❌ Connect account creation error:', error)
      throw error
    }
  },

  /**
   * Check Connect account status and update local database
   * @param {string} operatorId - Operator ID
   * @returns {Promise<object>} Account status details
   */
  async checkConnectStatus(operatorId) {
    try {
      console.log(`🔍 Checking Connect status for operator: ${operatorId}`)

      const response = await fetch(`${supabaseUrl}/functions/v1/check-connect-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          operator_id: operatorId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to check Connect status')
      }

      const status = await response.json()
      
      return status

    } catch (error) {
      console.error('❌ Connect status check error:', error)
      throw error
    }
  },

  /**
   * Get operator's current Connect account status from database
   * @param {string} operatorId - Operator ID
   * @returns {Promise<object>} Local status from database
   */
  async getLocalConnectStatus(operatorId) {
    try {
      const { data, error } = await supabase
        .from('operators')
        .select(`
          stripe_connect_account_id,
          stripe_connect_status,
          stripe_onboarding_complete,
          stripe_charges_enabled,
          stripe_payouts_enabled,
          commission_rate
        `)
        .eq('id', operatorId)
        .single()

      if (error) {
        throw error
      }

      return {
        account_id: data.stripe_connect_account_id,
        status: data.stripe_connect_status,
        onboarding_complete: data.stripe_onboarding_complete,
        charges_enabled: data.stripe_charges_enabled,
        payouts_enabled: data.stripe_payouts_enabled,
        commission_rate: data.commission_rate,
        connected: !!data.stripe_connect_account_id
      }

    } catch (error) {
      console.error('Error fetching local Connect status:', error)
      throw error
    }
  },

  /**
   * Generate account management link for existing Connect account
   * @param {string} operatorId - Operator ID
   * @param {string} linkType - Type of link ('account_onboarding' or 'account_update')
   * @returns {Promise<string>} Account management URL
   */
  async createAccountLink(operatorId, linkType = 'account_update') {
    try {
      console.log(`🔗 Creating account management link for operator: ${operatorId}`)

      const response = await fetch(`${supabaseUrl}/functions/v1/create-account-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          operator_id: operatorId,
          link_type: linkType
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create account link')
      }

      const result = await response.json()
      return result.link_url

    } catch (error) {
      console.error('❌ Account link creation error:', error)
      throw error
    }
  },

  /**
   * Format Connect status for UI display
   * @param {object} connectStatus - Connect status object
   * @returns {object} Formatted status info
   */
  formatConnectStatus(connectStatus) {
    if (!connectStatus.connected) {
      return {
        status: 'not_connected',
        statusText: 'Not Connected',
        statusColor: 'text-slate-400',
        description: 'Connect your Stripe account to receive payouts',
        canReceivePayments: false
      }
    }

    switch (connectStatus.status) {
      case 'pending':
        return {
          status: 'pending',
          statusText: 'Setup Required',
          statusColor: 'text-yellow-400',
          description: 'Complete your account setup to start receiving payouts',
          canReceivePayments: false
        }
      
      case 'connected':
        if (connectStatus.charges_enabled && connectStatus.payouts_enabled) {
          return {
            status: 'active',
            statusText: 'Active',
            statusColor: 'text-green-400',
            description: 'Your account is ready to receive payouts',
            canReceivePayments: true
          }
        } else {
          return {
            status: 'restricted',
            statusText: 'Limited',
            statusColor: 'text-yellow-400',
            description: 'Account connected but has restrictions',
            canReceivePayments: false
          }
        }
      
      case 'rejected':
        return {
          status: 'rejected',
          statusText: 'Action Required',
          statusColor: 'text-red-400',
          description: 'Account requires attention - check Stripe dashboard',
          canReceivePayments: false
        }
      
      default:
        return {
          status: 'unknown',
          statusText: 'Unknown',
          statusColor: 'text-slate-400',
          description: 'Unable to determine account status',
          canReceivePayments: false
        }
    }
  }
}

export default stripeConnectService