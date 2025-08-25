// src/components/StripeConnectCard.jsx
// Stripe Connect account management component

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  CreditCard, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  DollarSign,
  Settings,
  Edit,
  Eye,
  Copy
} from 'lucide-react'
import { stripeConnectService } from '../services/stripeConnectService'
import { toast } from 'react-hot-toast'

const StripeConnectCard = ({ operator, onStatusUpdate }) => {
  const { t } = useTranslation()
  const [connectStatus, setConnectStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCountrySelector, setShowCountrySelector] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState('FR')

  // Stripe Connect supported countries - confirmed working
  const supportedCountries = [
    { 
      code: 'FR', 
      name: 'France', 
      flag: '🇫🇷',
      note: 'Recommended for French Polynesia operators'
    },
    { 
      code: 'US', 
      name: 'United States', 
      flag: '🇺🇸',
      note: 'Popular for international tourism operators'
    },
    { 
      code: 'AU', 
      name: 'Australia', 
      flag: '🇦🇺',
      note: 'Close to French Polynesia, common for operators'
    },
    { 
      code: 'NZ', 
      name: 'New Zealand', 
      flag: '🇳🇿',
      note: 'Pacific region, popular with operators'
    },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
    { code: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'AT', name: 'Austria', flag: '🇦🇹' },
    { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
    { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
    { code: 'FI', name: 'Finland', flag: '🇫🇮' },
    { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
    { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
    { code: 'NO', name: 'Norway', flag: '🇳🇴' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
    { code: 'SE', name: 'Sweden', flag: '🇸🇪' }
  ]

  // Load Connect status on component mount
  useEffect(() => {
    if (operator?.id) {
      loadConnectStatus()
    }
  }, [operator?.id])

  const loadConnectStatus = async () => {
    try {
      setLoading(true)
      
      // First get local status, then refresh from Stripe
      const localStatus = await stripeConnectService.getLocalConnectStatus(operator.id)
      setConnectStatus(localStatus)
      
      // If connected, check latest status from Stripe
      if (localStatus.connected) {
        const liveStatus = await stripeConnectService.checkConnectStatus(operator.id)
        setConnectStatus(prev => ({ ...prev, ...liveStatus }))
      }
      
    } catch (error) {
      console.error('Failed to load Connect status:', error)
      toast.error('Failed to load payment account status')
    } finally {
      setLoading(false)
    }
  }

  const handleConnectAccount = async () => {
    try {
      setCreating(true)
      
      // Debug: Log operator data
      console.log('🔍 Operator data:', operator)
      console.log('🔍 Operator ID:', operator?.id)
      
      if (!operator?.id) {
        throw new Error('Operator ID is missing')
      }
      
      const result = await stripeConnectService.createConnectAccount(operator.id, {
        business_type: 'individual', // Default for tourism operators
        operator_country: selectedCountry
      })

      if (result.onboarding_url) {
        // Open Stripe onboarding in new window
        const stripeWindow = window.open(
          result.onboarding_url,
          'stripe_connect',
          'width=800,height=600,scrollbars=yes,resizable=yes'
        )

        // Monitor for window close to refresh status
        const checkClosed = setInterval(() => {
          if (stripeWindow?.closed) {
            clearInterval(checkClosed)
            setTimeout(loadConnectStatus, 1000) // Refresh after 1 second
            if (onStatusUpdate) {
              onStatusUpdate()
            }
          }
        }, 1000)

        toast.success(
          result.existing_account 
            ? 'Reopened Stripe Connect setup' 
            : 'Created Stripe Connect account'
        )
      }
      
    } catch (error) {
      console.error('Failed to create Connect account:', error)
      toast.error('Failed to set up payment account: ' + error.message)
    } finally {
      setCreating(false)
    }
  }

  const handleRefreshStatus = async () => {
    await loadConnectStatus()
    toast.success('Account status refreshed')
  }

  const handleManageAccount = async (linkType = 'account_update') => {
    try {
      // Debug: Log operator data
      console.log('🔍 Operator for account management:', operator)
      console.log('🔍 Connect status:', connectStatus)
      
      const linkUrl = await stripeConnectService.createAccountLink(operator.id, linkType)
      
      // Open account management in new window
      const stripeWindow = window.open(
        linkUrl,
        'stripe_account_management',
        'width=800,height=600,scrollbars=yes,resizable=yes'
      )

      // Monitor for window close to refresh status
      const checkClosed = setInterval(() => {
        if (stripeWindow?.closed) {
          clearInterval(checkClosed)
          setTimeout(loadConnectStatus, 1000) // Refresh after 1 second
          if (onStatusUpdate) {
            onStatusUpdate()
          }
        }
      }, 1000)

      toast.success('Opened Stripe account management')
      
    } catch (error) {
      console.error('Failed to open account management:', error)
      toast.error('Failed to open account management: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-300">Loading payment account status...</span>
        </div>
      </div>
    )
  }

  const statusInfo = stripeConnectService.formatConnectStatus(connectStatus || {})

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-blue-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">
              Payment Account
            </h3>
            <p className="text-sm text-slate-400">
              Stripe Connect account for receiving payouts
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusInfo.status === 'active' ? 'bg-green-500/20 text-green-400' :
            statusInfo.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
            statusInfo.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
            'bg-slate-500/20 text-slate-400'
          }`}>
            {statusInfo.statusText}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Status Description */}
        <p className={`text-sm ${statusInfo.statusColor}`}>
          {statusInfo.description}
        </p>

        {/* Account Details */}
        {connectStatus?.account_id && (
          <div className="bg-slate-900 rounded p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Account ID:</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-300 font-mono text-xs sm:text-sm">
                  {connectStatus.account_id.substring(0, 15)}...
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(connectStatus.account_id)
                    toast.success('Account ID copied to clipboard')
                  }}
                  className="text-slate-400 hover:text-white transition-colors p-1"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            {connectStatus.commission_rate !== undefined && connectStatus.commission_rate !== null && connectStatus.commission_rate > 0 && connectStatus.commission_rate < 1 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Your share:</span>
                <span className="text-green-400 font-medium">
                  {Math.round((1 - connectStatus.commission_rate) * 100)}%
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm">
                {connectStatus.charges_enabled ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Clock className="w-4 h-4 text-yellow-400" />
                )}
                <span className="text-slate-300">Accept Payments</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                {connectStatus.payouts_enabled ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Clock className="w-4 h-4 text-yellow-400" />
                )}
                <span className="text-slate-300">Receive Payouts</span>
              </div>
            </div>
          </div>
        )}

        {/* Requirements/Issues */}
        {connectStatus?.has_issues && connectStatus.requirements && (
          <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
              <div className="text-sm">
                <p className="text-red-400 font-medium mb-1">Action Required</p>
                {connectStatus.requirements.currently_due?.length > 0 && (
                  <p className="text-red-300">
                    {connectStatus.requirements.currently_due.length} items need attention
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Country Selector for new accounts */}
        {!connectStatus?.connected && (
          <div className="bg-slate-900 rounded p-3 mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select your country/region for banking:
            </label>
            <div className="relative">
              <button
                onClick={() => setShowCountrySelector(!showCountrySelector)}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-300 hover:border-slate-500 focus:border-blue-500 focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  {supportedCountries.find(c => c.code === selectedCountry)?.flag}
                  <span>{supportedCountries.find(c => c.code === selectedCountry)?.name}</span>
                </div>
                <div className={`transform transition-transform ${showCountrySelector ? 'rotate-180' : ''}`}>
                  ▼
                </div>
              </button>
              
              {showCountrySelector && (
                <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {supportedCountries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => {
                        setSelectedCountry(country.code)
                        setShowCountrySelector(false)
                      }}
                      className={`w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-slate-700 transition-colors ${
                        selectedCountry === country.code ? 'bg-slate-700 text-blue-400' : 'text-slate-300'
                      }`}
                    >
                      <span className="mt-0.5">{country.flag}</span>
                      <div className="flex-1">
                        <div>{country.name}</div>
                        {country.note && (
                          <div className="text-xs text-slate-500 mt-0.5">{country.note}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Choose the country where you have a business bank account. 
              <br />
              <em>Note: French Polynesia direct support pending Stripe confirmation.</em>
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-2">
          {!connectStatus?.connected ? (
            <button
              onClick={handleConnectAccount}
              disabled={creating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg font-medium transition-colors"
            >
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Connect Stripe Account
                </>
              )}
            </button>
          ) : (
            <>
              {statusInfo.status !== 'active' && (
                <button
                  onClick={() => handleManageAccount('account_onboarding')}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Complete Setup
                </button>
              )}
              
              <button
                onClick={() => handleManageAccount('account_update')}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Account
              </button>
              
              {/* Temporary workaround: Direct Stripe dashboard link */}
              {connectStatus?.account_id && (
                <button
                  onClick={() => {
                    window.open(
                      `https://dashboard.stripe.com/connect/accounts/${connectStatus.account_id}`,
                      '_blank',
                      'noopener,noreferrer'
                    )
                    toast.success('Opened Stripe dashboard')
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Dashboard
                </button>
              )}
              
              <button
                onClick={handleRefreshStatus}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Refresh
              </button>
            </>
          )}
        </div>

        {/* Payout Information */}
        {statusInfo.canReceivePayments && (
          <div className="bg-green-500/10 border border-green-500/20 rounded p-3 mt-4">
            <div className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 text-green-400 mt-0.5" />
              <div className="text-sm">
                <p className="text-green-400 font-medium mb-1">Ready for Payouts</p>
                <p className="text-green-300">
                  You'll receive your payout 48 hours after activity completion.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StripeConnectCard