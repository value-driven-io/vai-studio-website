// src/components/TourCompletionCard.jsx
// Component for marking tours complete and managing payouts

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Calendar,
  AlertCircle,
  ExternalLink
} from 'lucide-react'
import { paymentService } from '../services/paymentService'
import { toast } from 'react-hot-toast'

const TourCompletionCard = ({ booking, operator, onUpdate }) => {
  const { t } = useTranslation()
  const [completing, setCompleting] = useState(false)
  const [processingPayout, setProcessingPayout] = useState(false)

  // Calculate payout timing
  const getPayoutInfo = () => {
    if (!booking.tour_completed_at) {
      return {
        status: 'not_completed',
        message: 'Tour not yet completed',
        canComplete: booking.booking_status === 'confirmed' && 
                    ['captured', 'paid'].includes(booking.payment_status)
      }
    }

    const completedAt = new Date(booking.tour_completed_at)
    const payoutEligibleAt = new Date(completedAt.getTime() + (48 * 60 * 60 * 1000))
    const now = new Date()
    const hoursRemaining = Math.ceil((payoutEligibleAt.getTime() - now.getTime()) / (1000 * 60 * 60))

    if (hoursRemaining > 0) {
      return {
        status: 'waiting',
        message: `Payout in ${hoursRemaining} hours`,
        payoutEligibleAt: payoutEligibleAt.toISOString(),
        hoursRemaining
      }
    } else {
      return {
        status: 'ready',
        message: 'Ready for payout',
        payoutEligibleAt: payoutEligibleAt.toISOString(),
        canProcess: booking.payout_status === 'pending'
      }
    }
  }

  const payoutInfo = getPayoutInfo()

  const handleMarkCompleted = async () => {
    try {
      setCompleting(true)
      
      const result = await paymentService.markTourCompleted(booking.id, operator.id)
      
      if (result.success) {
        toast.success(
          result.already_completed 
            ? 'Tour was already marked as completed' 
            : 'Tour marked as completed! Payout in 48 hours.'
        )
        
        if (onUpdate) {
          onUpdate()
        }
      }
      
    } catch (error) {
      console.error('Failed to mark tour completed:', error)
      toast.error('Failed to mark tour completed: ' + error.message)
    } finally {
      setCompleting(false)
    }
  }

  const handleProcessPayout = async () => {
    try {
      setProcessingPayout(true)
      
      const result = await paymentService.processPayouts(booking.id)
      
      if (result.success && result.processed > 0) {
        toast.success('Payout processed successfully!')
        if (onUpdate) {
          onUpdate()
        }
      } else if (result.results?.[0]?.hours_remaining) {
        toast.error(`Payout not ready yet. ${result.results[0].hours_remaining} hours remaining.`)
      } else {
        toast.error('No payouts were processed')
      }
      
    } catch (error) {
      console.error('Failed to process payout:', error)
      toast.error('Failed to process payout: ' + error.message)
    } finally {
      setProcessingPayout(false)
    }
  }

  // Don't show card for bookings without payment
  if (!booking.operator_amount_cents || !booking.payment_intent_id) {
    return null
  }

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            payoutInfo.status === 'ready' ? 'bg-green-500/20' :
            payoutInfo.status === 'waiting' ? 'bg-yellow-500/20' :
            'bg-slate-500/20'
          }`}>
            {payoutInfo.status === 'ready' ? (
              <DollarSign className="w-5 h-5 text-green-400" />
            ) : payoutInfo.status === 'waiting' ? (
              <Clock className="w-5 h-5 text-yellow-400" />
            ) : (
              <Calendar className="w-5 h-5 text-slate-400" />
            )}
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white">
              Tour Completion & Payout
            </h4>
            <p className="text-xs text-slate-400">
              48-hour delayed payout system
            </p>
          </div>
        </div>

        <div className={`px-2 py-1 rounded text-xs font-medium ${
          payoutInfo.status === 'ready' ? 'bg-green-500/20 text-green-400' :
          payoutInfo.status === 'waiting' ? 'bg-yellow-500/20 text-yellow-400' :
          booking.payout_status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
          booking.payout_status === 'paid' ? 'bg-green-500/20 text-green-400' :
          'bg-slate-500/20 text-slate-400'
        }`}>
          {booking.payout_status === 'processing' ? 'Processing' :
           booking.payout_status === 'paid' ? 'Paid' :
           booking.payout_status === 'failed' ? 'Failed' :
           payoutInfo.message}
        </div>
      </div>

      {/* Payout Amount */}
      <div className="bg-slate-900 rounded p-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Your payout amount:</span>
          <span className="text-green-400 font-semibold">
            ${(booking.operator_amount_cents / 100).toFixed(2)}
          </span>
        </div>
        {booking.platform_fee_cents && (
          <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
            <span>Platform fee:</span>
            <span>${(booking.platform_fee_cents / 100).toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Completion Status & Actions */}
      <div className="space-y-3">
        {!booking.tour_completed_at ? (
          // Not completed yet
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span>Tour not marked as completed</span>
            </div>
            
            {payoutInfo.canComplete ? (
              <button
                onClick={handleMarkCompleted}
                disabled={completing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg font-medium transition-colors"
              >
                {completing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Marking Complete...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Tour Completed
                  </>
                )}
              </button>
            ) : (
              <div className="text-xs text-slate-400 p-2 bg-slate-700 rounded">
                Payment must be captured before marking tour complete
              </div>
            )}
          </div>
        ) : (
          // Completed - show payout status
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Tour completed on {new Date(booking.tour_completed_at).toLocaleDateString()}</span>
            </div>

            {payoutInfo.status === 'waiting' && (
              <div className="text-xs text-yellow-400 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                <Clock className="w-4 h-4 inline mr-2" />
                Payout will be processed in {payoutInfo.hoursRemaining} hours
                <div className="text-slate-400 mt-1">
                  Eligible at: {new Date(payoutInfo.payoutEligibleAt).toLocaleString()}
                </div>
              </div>
            )}

            {payoutInfo.status === 'ready' && payoutInfo.canProcess && (
              <button
                onClick={handleProcessPayout}
                disabled={processingPayout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg font-medium transition-colors"
              >
                {processingPayout ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing Payout...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4" />
                    Process Payout Now
                  </>
                )}
              </button>
            )}

            {booking.payout_status === 'processing' && (
              <div className="text-xs text-blue-400 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                <Clock className="w-4 h-4 inline mr-2" />
                Payout is being processed by Stripe
              </div>
            )}

            {booking.payout_status === 'paid' && booking.payout_transfer_id && (
              <div className="text-xs text-green-400 p-2 bg-green-500/10 rounded border border-green-500/20">
                <CheckCircle2 className="w-4 h-4 inline mr-2" />
                Payout completed
                <div className="text-slate-400 mt-1 flex items-center gap-1">
                  Transfer ID: {booking.payout_transfer_id}
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TourCompletionCard