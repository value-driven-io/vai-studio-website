// src/services/paymentService.js
// Payment management service for operator dashboard
// Handles Stripe payment capture, refunds, and status updates

import { supabase } from '../lib/supabase'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const paymentService = {
  
  /**
   * Capture an authorized payment when operator confirms booking
   * @param {string} paymentIntentId - Stripe payment intent ID
   * @param {string} bookingId - Booking ID to update
   * @param {number} captureAmount - Amount to capture (optional, defaults to full amount)
   * @returns {Promise<object>} Payment capture result
   */
  async capturePayment(paymentIntentId, bookingId, captureAmount = null) {
    try {
      console.log(`💰 Capturing payment: ${paymentIntentId} for booking: ${bookingId}`)

      // Call Stripe payment capture API
      const captureResponse = await fetch(`${supabaseUrl}/functions/v1/capture-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          amount_to_capture: captureAmount // null = capture full authorized amount
        })
      })

      if (!captureResponse.ok) {
        const error = await captureResponse.json()
        throw new Error(error.message || 'Payment capture failed')
      }

      const captureResult = await captureResponse.json()

      // Update booking record with payment capture details
      const { data: updatedBooking, error: updateError } = await supabase
        .from('bookings')
        .update({
          payment_status: 'paid',
          payment_captured_at: new Date().toISOString(),
          stripe_charge_id: captureResult.charge_id,
          stripe_fee: captureResult.stripe_fee || 0
        })
        .eq('id', bookingId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating booking after payment capture:', updateError)
        throw updateError
      }

      console.log('✅ Payment captured and booking updated successfully')
      
      return {
        success: true,
        charge_id: captureResult.charge_id,
        amount_captured: captureResult.amount_captured,
        stripe_fee: captureResult.stripe_fee,
        booking: updatedBooking
      }

    } catch (error) {
      console.error('❌ Payment capture error:', error)
      throw error
    }
  },

  /**
   * Refund a payment when operator declines booking
   * @param {string} paymentIntentId - Stripe payment intent ID  
   * @param {string} bookingId - Booking ID to update
   * @param {number} refundAmount - Amount to refund (optional, defaults to full amount)
   * @param {string} reason - Refund reason
   * @returns {Promise<object>} Refund result
   */
  async refundPayment(paymentIntentId, bookingId, refundAmount = null, reason = 'requested_by_customer') {
    try {
      console.log(`💸 Refunding payment: ${paymentIntentId} for booking: ${bookingId}`)

      // For authorized-only payments, we can just cancel the payment intent
      const refundResponse = await fetch(`${supabaseUrl}/functions/v1/refund-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          refund_amount: refundAmount,
          reason: reason
        })
      })

      if (!refundResponse.ok) {
        const error = await refundResponse.json()
        throw new Error(error.message || 'Payment refund failed')
      }

      const refundResult = await refundResponse.json()

      // Update booking record
      const { data: updatedBooking, error: updateError } = await supabase
        .from('bookings')
        .update({
          payment_status: 'refunded',
          // Keep payment_captured_at and other history for record keeping
        })
        .eq('id', bookingId)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating booking after refund:', updateError)
        throw updateError
      }

      console.log('✅ Payment refunded and booking updated successfully')
      
      return {
        success: true,
        refund_id: refundResult.refund_id,
        amount_refunded: refundResult.amount_refunded,
        booking: updatedBooking
      }

    } catch (error) {
      console.error('❌ Payment refund error:', error)
      throw error
    }
  },

  /**
   * Get payment status and details from Stripe
   * @param {string} paymentIntentId - Stripe payment intent ID
   * @returns {Promise<object>} Payment details
   */
  async getPaymentStatus(paymentIntentId) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/get-payment-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch payment status')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching payment status:', error)
      throw error
    }
  },

  /**
   * Helper: Format payment status for UI display
   * Note: statusText removed - use t(`payment.status.${status}`) in components
   * @param {object} booking - Booking object with payment fields
   * @returns {object} Formatted payment info
   */
  formatPaymentInfo(booking) {
    if (!booking.payment_intent_id) {
      return {
        status: 'noPayment',
        statusColor: 'text-slate-400',
        canCapture: false,
        canRefund: false
      }
    }

    const paymentStatus = booking.payment_status?.toLowerCase()

    switch (paymentStatus) {
      case 'authorized':
        return {
          status: 'authorized',
          statusColor: 'text-yellow-400',
          canCapture: true,
          canRefund: true,
          amount: booking.total_amount
        }
      
      case 'captured':
      case 'paid':
        return {
          status: 'captured',
          statusColor: 'text-green-400',
          canCapture: false,
          canRefund: true,
          amount: booking.total_amount,
          capturedAt: booking.payment_captured_at
        }
      
      case 'refunded':
        return {
          status: 'refunded',
          statusColor: 'text-blue-400',
          canCapture: false,
          canRefund: false
        }
      
      case 'failed':
        return {
          status: 'failed',
          statusColor: 'text-red-400',
          canCapture: false,
          canRefund: false
        }
      
      default:
        return {
          status: 'pending',
          statusColor: 'text-slate-400',
          canCapture: false,
          canRefund: false
        }
    }
  }
}

export default paymentService