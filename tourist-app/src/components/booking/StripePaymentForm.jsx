// tourist-app/src/components/booking/StripePaymentForm.jsx
import React, { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCurrencyContext } from '../../hooks/useCurrency'
import { convertFromXPF, formatPrice } from '../../utils/currency'

const StripePaymentForm = ({ 
  bookingData, 
  onPaymentSuccess, 
  onPaymentError,
  isProcessing,
  setIsProcessing 
}) => {
  const { t } = useTranslation()
  const stripe = useStripe()
  const elements = useElements()
  const { selectedCurrency } = useCurrencyContext()
  const [paymentError, setPaymentError] = useState(null)

  // Calculate USD amount for Stripe (XPF is base currency)
  const totalXPF = bookingData.adult_price * bookingData.num_adults + 
                   (bookingData.child_price || 0) * bookingData.num_children
  const usdAmount = Math.round(convertFromXPF(totalXPF, 'USD') * 100) // Convert to cents

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!stripe || !elements || isProcessing) return
    
    setIsProcessing(true)
    setPaymentError(null)

    try {
      // Debug: Log booking data to see what we have
      console.log('🔍 BookingData received:', bookingData)
      console.log('🔍 operator_id specifically:', bookingData?.operator_id)
      console.log('🔍 All fields check:', {
        amount: usdAmount,
        currency: 'usd', 
        booking_reference: bookingData?.booking_reference,
        operator_id: bookingData?.operator_id
      })

      // Additional safety check - if operator_id is missing, abort
      if (!bookingData?.operator_id) {
        console.error('❌ CRITICAL: operator_id is missing from bookingData!')
        console.error('❌ BookingData keys:', Object.keys(bookingData || {}))
        setPaymentError(t('payment.paymentSetupError'))
        setIsProcessing(false)
        return
      }

      // Create Stripe Connect payment intent with marketplace model
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-connect-payment-intent`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          amount: usdAmount,
          currency: 'usd',
          booking_reference: bookingData.booking_reference,
          operator_id: bookingData.operator_id || null, // ✅ Required for Connect payments
          metadata: {
            booking_id: bookingData.booking_reference,
            tour_name: bookingData.tour_name,
            customer_email: bookingData.customer_email,
            total_xpf: totalXPF,
            display_currency: selectedCurrency,
            num_adults: bookingData.num_adults,
            num_children: bookingData.num_children || 0
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { 
        client_secret, 
        payment_intent_id, 
        operator_amount, 
        platform_fee,
        commission_rate 
      } = await response.json()

      // Confirm payment (authorize only, don't capture)
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: bookingData.customer_name || `${bookingData.customer_first_name || ''} ${bookingData.customer_last_name || ''}`.trim(),
            email: bookingData.customer_email,
          },
        }
      })

      if (error) {
        // Debug: Log Stripe error details
        console.error('🔴 Stripe payment confirmation error:', error)
        console.error('🔴 Error details:', {
          code: error.code,
          message: error.message,
          type: error.type,
          param: error.param,
          decline_code: error.decline_code
        })
        
        // Handle specific error types
        let errorMessage = error.message
        switch (error.code) {
          case 'card_declined':
            errorMessage = t('payment.cardDeclined')
            break
          case 'expired_card':
            errorMessage = t('payment.expiredCard')
            break
          case 'incorrect_cvc':
            errorMessage = t('payment.incorrectCvc')
            break
          case 'insufficient_funds':
            errorMessage = t('payment.insufficientFunds')
            break
          default:
            errorMessage = t('payment.paymentErrorDesc')
        }
        setPaymentError(errorMessage)
        onPaymentError(errorMessage)
      } else if (paymentIntent.status === 'requires_capture') {
        // ✅ Payment authorized successfully with Connect marketplace model!
        onPaymentSuccess({
          payment_intent_id: paymentIntent.id,
          payment_status: 'authorized',
          amount_authorized: paymentIntent.amount,
          currency: paymentIntent.currency,
          operator_amount_cents: operator_amount,
          platform_fee_cents: platform_fee,
          commission_rate: commission_rate
        })
      }
    } catch (error) {
      console.error('Payment error:', error)
      const errorMessage = error.message || t('payment.networkError')
      setPaymentError(errorMessage)
      onPaymentError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: 'rgb(var(--color-ui-text-primary))',
        fontFamily: 'system-ui, sans-serif',
        '::placeholder': {
          color: 'rgb(var(--color-ui-text-tertiary))',
        },
        iconColor: 'rgb(var(--color-ui-text-tertiary))',
      },
      invalid: {
        color: 'rgb(var(--color-status-error))',
        iconColor: 'rgb(var(--color-status-error))',
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Payment Amount Summary */}
      <div className="vai-surface-elevated rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-5 h-5 text-status-info-light" />
          <span className="font-medium text-ui-text-primary">{t('payment.securePayment')}</span>
        </div>
        
        <div className="space-y-1 text-sm">
          <div className="flex justify-between vai-text-secondary">
            <span>{t('payment.displayedAs', { 
              amount: formatPrice(totalXPF, selectedCurrency), 
              currency: selectedCurrency 
            })}</span>
          </div>
          <div className="flex justify-between text-ui-text-primary font-medium">
            <span>{t('payment.chargingIn', { 
              amount: `$${(usdAmount / 100).toFixed(2)}` 
            })}</span>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <label className="vai-form-label block text-sm font-medium">
            {t('payment.cardInformation')}
          </label>
          
          <div className="vai-surface-secondary rounded-lg p-4 focus-within:ring-2 focus-within:ring-status-info focus-within:border-status-info">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-2 text-sm text-status-info-light">
          <Lock className="w-4 h-4" />
          <span>{t('payment.securedByStripe')}</span>
        </div>

        {/* Payment Info */}
        <div className="bg-status-info-bg border border-status-info rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-status-info-light mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="text-status-info-light font-medium">{t('payment.noChargeUntilConfirmed')}</p>
              <p className="text-status-info-light">{t('payment.automaticRefund')}</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {paymentError && (
          <div className="bg-status-error-bg border border-status-error rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-status-error-light mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-status-error-light font-medium">{t('payment.paymentError')}</p>
                <p className="text-status-error-light text-sm mt-1">{paymentError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full vai-button-success disabled:vai-button-secondary font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-ui-text-primary border-t-transparent rounded-full animate-spin" />
              {t('payment.authorizingPayment')}
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              {t('payment.completePayment')}
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default StripePaymentForm