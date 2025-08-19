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
      // Create payment intent with authorization only
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          amount: usdAmount,
          currency: 'usd',
          booking_reference: bookingData.booking_reference,
          capture_method: 'manual', // ✅ Authorization only
          metadata: {
            booking_id: bookingData.booking_reference,
            tour_name: bookingData.tour_name,
            customer_email: bookingData.customer_email,
            total_xpf: totalXPF,
            display_currency: selectedCurrency
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const { client_secret, payment_intent_id } = await response.json()

      // Confirm payment (authorize only, don't capture)
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${bookingData.customer_first_name} ${bookingData.customer_last_name}`,
            email: bookingData.customer_email,
          },
        }
      })

      if (error) {
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
        // ✅ Payment authorized successfully!
        onPaymentSuccess({
          payment_intent_id: paymentIntent.id,
          payment_status: 'authorized',
          amount_authorized: paymentIntent.amount,
          currency: paymentIntent.currency
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
        color: '#f1f5f9', // text-slate-100
        fontFamily: 'system-ui, sans-serif',
        '::placeholder': {
          color: '#94a3b8', // text-slate-400
        },
        iconColor: '#94a3b8',
      },
      invalid: {
        color: '#ef4444', // text-red-500
        iconColor: '#ef4444',
      },
    },
  }

  return (
    <div className="space-y-6">
      {/* Payment Amount Summary */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-5 h-5 text-blue-400" />
          <span className="font-medium text-white">{t('payment.securePayment')}</span>
        </div>
        
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-slate-300">
            <span>{t('payment.displayedAs', { 
              amount: formatPrice(totalXPF, selectedCurrency), 
              currency: selectedCurrency 
            })}</span>
          </div>
          <div className="flex justify-between text-white font-medium">
            <span>{t('payment.chargingIn', { 
              amount: `$${(usdAmount / 100).toFixed(2)}` 
            })}</span>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">
            {t('payment.cardInformation')}
          </label>
          
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center gap-2 text-sm text-blue-400">
          <Lock className="w-4 h-4" />
          <span>{t('payment.securedByStripe')}</span>
        </div>

        {/* Payment Info */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="text-blue-300 font-medium">{t('payment.noChargeUntilConfirmed')}</p>
              <p className="text-blue-200">{t('payment.automaticRefund')}</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {paymentError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-300 font-medium">{t('payment.paymentError')}</p>
                <p className="text-red-200 text-sm mt-1">{paymentError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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