// src/components/PaymentStatusIndicator.jsx
// Payment status indicator component for bookings

import React from 'react'
import { useTranslation } from 'react-i18next'
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import paymentService from '../services/paymentService'

const PaymentStatusIndicator = ({ booking, compact = false }) => {
  const { t } = useTranslation()
  const paymentInfo = paymentService.formatPaymentInfo(booking)

  if (paymentInfo.status === 'noPayment') {
    return compact ? null : (
      <div className="flex items-center gap-2 text-slate-400">
        <DollarSign className="w-4 h-4" />
        <span className="text-sm">{t('payment.status.noPayment')}</span>
      </div>
    )
  }

  const getIcon = () => {
    switch (paymentInfo.status) {
      case 'authorized':
        return <Clock className="w-4 h-4" />
      case 'captured':
        return <CheckCircle className="w-4 h-4" />
      case 'refunded':
        return <RefreshCw className="w-4 h-4" />
      case 'failed':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getBadgeColor = () => {
    switch (paymentInfo.status) {
      case 'authorized':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'captured':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'refunded':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${getBadgeColor()}`}>
        {getIcon()}
        <span>{t(`payment.status.${paymentInfo.status}`)}</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Payment Status Badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getBadgeColor()}`}>
        {getIcon()}
        <span className="font-medium">{t(`payment.status.${paymentInfo.status}`)}</span>
      </div>

      {/* Payment Details */}
      {paymentInfo.amount && (
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{t('payment.details.amount')}:</span>
            <span className="text-white font-medium">
              {new Intl.NumberFormat('fr-FR').format(paymentInfo.amount)} XPF
            </span>
          </div>
          
          {paymentInfo.capturedAt && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">{t('payment.details.captured')}:</span>
              <span className="text-slate-300">
                {paymentInfo.capturedAt && !isNaN(new Date(paymentInfo.capturedAt)) 
                  ? new Date(paymentInfo.capturedAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : t('payment.details.processing')
                }
              </span>
            </div>
          )}
        </div>
      )}

      {/* Payment Intent ID (for debugging) */}
      {booking.payment_intent_id && process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-slate-500 font-mono">
          {booking.payment_intent_id.substring(0, 20)}...
        </div>
      )}
    </div>
  )
}

export default PaymentStatusIndicator