// src/components/PaymentActionButtons.jsx
// Payment action buttons for manual payment management

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  CreditCard, 
  RefreshCw, 
  AlertCircle,
  ExternalLink,
  Loader2
} from 'lucide-react'
import paymentService from '../services/paymentService'
import toast from 'react-hot-toast'

const PaymentActionButtons = ({ 
  booking, 
  onPaymentUpdate = () => {},
  size = 'default' // 'sm' | 'default'
}) => {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const paymentInfo = paymentService.formatPaymentInfo(booking)

  if (paymentInfo.status === 'noPayment') {
    return null
  }

  const handleCapturePayment = async () => {
    if (!paymentInfo.canCapture || !booking.payment_intent_id) return

    setProcessing(true)
    try {
      console.log('💰 Manually capturing payment:', booking.payment_intent_id)
      
      const result = await paymentService.capturePayment(
        booking.payment_intent_id,
        booking.id
      )

      toast.success(t('payment.messages.captureSuccess'), {
        duration: 5000,
        style: {
          background: '#059669',
          color: 'white'
        }
      })

      // Notify parent component
      onPaymentUpdate(result.booking)

    } catch (error) {
      console.error('❌ Manual payment capture failed:', error)
      toast.error(t('payment.messages.captureError', { error: error.message }), {
        duration: 8000,
        style: {
          background: '#dc2626',
          color: 'white'
        }
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleRefundPayment = async () => {
    if (!paymentInfo.canRefund || !booking.payment_intent_id) return

    const confirmRefund = window.confirm(
      t('payment.messages.confirmRefund', { 
        amount: new Intl.NumberFormat('fr-FR').format(booking.total_amount) 
      })
    )

    if (!confirmRefund) return

    setProcessing(true)
    try {
      console.log('💸 Manually refunding payment:', booking.payment_intent_id)
      
      const result = await paymentService.refundPayment(
        booking.payment_intent_id,
        booking.id,
        null, // Full refund
        'requested_by_customer'
      )

      toast.success(t('payment.messages.refundSuccess'), {
        duration: 5000,
        style: {
          background: '#059669',
          color: 'white'
        }
      })

      // Notify parent component
      onPaymentUpdate(result.booking)

    } catch (error) {
      console.error('❌ Manual payment refund failed:', error)
      toast.error(t('payment.messages.refundError', { error: error.message }), {
        duration: 8000,
        style: {
          background: '#dc2626',
          color: 'white'
        }
      })
    } finally {
      setProcessing(false)
    }
  }

  const openStripePayment = () => {
    if (!booking.payment_intent_id) return
    
    // Open Stripe Dashboard payment details in new tab
    const stripeUrl = `https://dashboard.stripe.com/payments/${booking.payment_intent_id}`
    window.open(stripeUrl, '_blank', 'noopener,noreferrer')
  }

  const buttonSize = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'

  return (
    <div className="flex items-center gap-2">
      {/* Capture Payment Button */}
      {paymentInfo.canCapture && (
        <button
          onClick={handleCapturePayment}
          disabled={processing}
          className={`${buttonSize} bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white font-medium rounded-lg transition-colors flex items-center gap-2`}
          title={t('payment.tooltips.capture')}
        >
          {processing ? (
            <Loader2 className={`${iconSize} animate-spin`} />
          ) : (
            <CreditCard className={iconSize} />
          )}
          {size !== 'sm' && t('payment.actions.capture')}
        </button>
      )}

      {/* Refund Payment Button */}
      {paymentInfo.canRefund && (
        <button
          onClick={handleRefundPayment}
          disabled={processing}
          className={`${buttonSize} bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-medium rounded-lg transition-colors flex items-center gap-2`}
          title={t('payment.tooltips.refund')}
        >
          {processing ? (
            <Loader2 className={`${iconSize} animate-spin`} />
          ) : (
            <RefreshCw className={iconSize} />
          )}
          {size !== 'sm' && t('payment.actions.refund')}
        </button>
      )}

      {/* View in Stripe Button */}
      {booking.payment_intent_id && (
        <button
          onClick={openStripePayment}
          className={`${buttonSize} bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2`}
          title={t('payment.tooltips.stripe')}
        >
          <ExternalLink className={iconSize} />
          {size !== 'sm' && t('payment.actions.stripeLink')}
        </button>
      )}

      {/* Payment Error Indicator */}
      {paymentInfo.status === 'failed' && (
        <div className="flex items-center gap-1 text-red-400">
          <AlertCircle className={iconSize} />
          {size !== 'sm' && <span className="text-xs">Failed</span>}
        </div>
      )}
    </div>
  )
}

export default PaymentActionButtons