// operator-dashboard/src/components/BookingDetailModal.jsx
import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  X, Calendar, Clock, MapPin, User, Phone, Mail,
  CheckCircle, XCircle, AlertCircle, Timer, Award,
  MessageCircle, Users, CreditCard, Lock, Unlock,
  Info, DollarSign, TrendingUp, Star, Flag
} from 'lucide-react'
import PaymentStatusIndicator from './PaymentStatusIndicator'
import PaymentActionButtons from './PaymentActionButtons'

const BookingDetailModal = ({
  isOpen,
  onClose,
  booking,
  operator,
  processingBooking,
  handleBookingAction,
  handleDeclineBooking,
  formatDate,
  formatPrice,
  getTimeUntilDeadline,
  getStatusColor,
  getStatusIcon,
  shouldShowCustomerDetails,
  onChatClick
}) => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'customer', 'financial'

  // Detailed confirmation handlers
  const handleConfirmBooking = () => {
    const hasPayment = booking.payment_intent_id && booking.payment_status === 'authorized'
    const confirmMessage = hasPayment 
      ? t('bookings.confirmations.confirmWithPayment', { 
          amount: new Intl.NumberFormat('fr-FR').format(booking.total_amount),
          customerName: booking.customer_name 
        })
      : t('bookings.confirmations.confirmWithoutPayment', { 
          customerName: booking.customer_name 
        })
    
    if (window.confirm(confirmMessage)) {
      handleBookingAction(booking.id, 'confirmed')
    }
  }

  const handleCompleteBooking = () => {
    const confirmMessage = t('bookings.confirmations.complete', { 
      customerName: booking.customer_name,
      tourName: booking.tours?.tour_name 
    })
    
    if (window.confirm(confirmMessage)) {
      handleBookingAction(booking.id, 'completed')
    }
  }

  const handleDeclineWithConfirmation = () => {
    const hasPayment = booking.payment_intent_id && ['authorized', 'paid'].includes(booking.payment_status)
    const confirmMessage = hasPayment 
      ? t('bookings.confirmations.declineWithPayment', { 
          amount: new Intl.NumberFormat('fr-FR').format(booking.total_amount),
          customerName: booking.customer_name 
        })
      : t('bookings.confirmations.declineWithoutPayment', { 
          customerName: booking.customer_name 
        })
    
    if (window.confirm(confirmMessage)) {
      handleDeclineBooking(booking.id)
    }
  }

  // Don't render if modal is closed or no booking
  if (!isOpen || !booking) return null

  // 🎯 PRIORITY & STATUS CALCULATIONS
  const getBookingPriority = () => {
    if (booking.booking_status !== 'pending') {
      return {
        level: booking.booking_status,
        color: booking.booking_status === 'confirmed' ? 'green' : 
               booking.booking_status === 'completed' ? 'blue' :
               booking.booking_status === 'declined' ? 'red' : 'gray',
        urgent: false
      }
    }

    if (!booking.tours?.booking_deadline) {
      return { level: 'medium', color: 'yellow', urgent: false }
    }

    const deadline = new Date(booking.tours.booking_deadline)
    const now = new Date()
    const hoursUntil = (deadline - now) / (1000 * 60 * 60)

    if (hoursUntil <= 8 && hoursUntil > 0) {
      return { level: 'critical', color: 'red', urgent: true }
    }
    if (hoursUntil <= 16 && hoursUntil > 0) {
      return { level: 'high', color: 'orange', urgent: true }
    }
    return { level: 'medium', color: 'yellow', urgent: false }
  }

  const priority = getBookingPriority()
  const showDetails = shouldShowCustomerDetails(booking)
  const totalParticipants = (booking.num_adults || 0) + (booking.num_children || 0)
  const netRevenue = booking.subtotal || 0
  const commissionRate = booking.applied_commission_rate || 
  ((booking.commission_amount || 0) / (booking.total_amount || 1)) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-4xl mx-auto my-8">
        <div className="relative w-full max-w-4xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-h-[90vh] overflow-hidden">
          
          {/* 📋 MODAL HEADER */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-700/30">
            <div className="flex items-center gap-4">
              {/* Priority Indicator */}
              <div className={`w-4 h-4 rounded-full ${
                priority.color === 'red' ? 'bg-red-400' :
                priority.color === 'orange' ? 'bg-orange-400' :
                priority.color === 'yellow' ? 'bg-yellow-400' :
                priority.color === 'green' ? 'bg-green-400' :
                priority.color === 'blue' ? 'bg-blue-400' : 'bg-slate-400'
              } ${priority.urgent ? 'animate-pulse' : ''}`} />
              
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {booking.tours?.tour_name || t('bookings.labels.unknownTour')}
                </h2>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span>{t('bookings.labels.ref')} {booking.booking_reference}</span>
                  <span>•</span>
                  <span className={`font-medium ${
                    priority.color === 'red' ? 'text-red-400' :
                    priority.color === 'orange' ? 'text-orange-400' :
                    priority.color === 'yellow' ? 'text-yellow-400' :
                    priority.color === 'green' ? 'text-green-400' :
                    priority.color === 'blue' ? 'text-blue-400' : 'text-slate-400'
                  }`}>
                    {priority.level === 'critical' ? t('bookings.priority.critical') :
                     priority.level === 'high' ? t('bookings.priority.high') :
                     priority.level === 'medium' ? t('bookings.priority.medium') :
                     t(`common.${priority.level}`)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* 🗂️ TAB NAVIGATION */}
          <div className="flex border-b border-slate-700 bg-slate-700/20">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Info className="w-4 h-4 inline mr-2" />
              {t('bookings.detail.tabs.details')}
            </button>
            
            <button
              onClick={() => setActiveTab('customer')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'customer'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              {t('bookings.detail.tabs.customer')}
              {!showDetails && <Lock className="w-3 h-3 inline ml-1" />}
            </button>
            
            <button
              onClick={() => setActiveTab('financial')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'financial'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4 inline mr-2" />
              {t('bookings.detail.tabs.actions')}
            </button>
          </div>

          {/* 📋 MODAL CONTENT */}
          <div className="p-6 max-h-[60vh] overflow-y-auto pb-safe">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Tour Information */}
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    {t('bookings.detail.tourInformation')}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <span className="text-slate-400 text-sm">{t('bookings.detail.tourDate')}</span>
                        <p className="text-white font-medium">
                          {formatDate(booking.tours?.tour_date)}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-slate-400 text-sm">{t('bookings.detail.timeSlot')}</span>
                        <p className="text-white">
                          {booking.tours?.time_slot || t('bookings.labels.timeTbd')}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-slate-400 text-sm">{t('bookings.modal.fields.duration')}</span>
                        <p className="text-white">
                          {booking.tours?.duration_hours ? `${booking.tours.duration_hours}h` : t('bookings.modal.notSpecified')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-slate-400 text-sm">{t('bookings.detail.meetingPoint')}</span>
                        <p className="text-white">
                          {booking.tours?.meeting_point || t('bookings.labels.locationTbd')}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-slate-400 text-sm">{t('bookings.detail.participants')}</span>
                        <p className="text-white flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {booking.num_adults || 0} {t('bookings.labels.adults')}, {booking.num_children || 0} {t('bookings.labels.children')}
                          <span className="text-slate-400">({totalParticipants} {t('common.total')})</span>
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-slate-400 text-sm">{t('bookings.detail.bookingDate')}</span>
                        <p className="text-white">
                          {formatDate(booking.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Status & Deadlines */}
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Timer className="w-5 h-5 text-orange-400" />
                    {t('bookings.modal.sections.status')}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 text-sm">{t('bookings.modal.fields.currentStatus')}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.booking_status)}`}>
                          {getStatusIcon(booking.booking_status)}
                          <span className="capitalize">{t(`common.${booking.booking_status}`)}</span>
                        </span>
                      </div>
                    </div>
                    
                    {booking.booking_status === 'pending' && booking.tours?.booking_deadline && (
                      <div>
                        <span className="text-slate-400 text-sm">{t('bookings.modal.fields.deadline')}</span>
                        <p className={`text-white font-medium ${priority.urgent ? 'text-red-400' : ''}`}>
                          {formatDate(booking.tours.booking_deadline)}
                          {priority.urgent && (
                            <span className="ml-2 text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                              {t('bookings.modal.urgent')}
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Special Requirements */}
                {booking.special_requests && (
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                      <Flag className="w-5 h-5 text-purple-400" />
                      {t('bookings.detail.specialRequests')}
                    </h3>
                    <p className="text-white bg-slate-800/50 rounded p-3">
                      {booking.special_requests}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* CUSTOMER TAB */}
            {activeTab === 'customer' && (
              <div className="space-y-6">
                {showDetails ? (
                  <>
                    {/* Customer Information */}
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-green-400" />
                        {t('bookings.detail.customerInformation')}
                        <Unlock className="w-4 h-4 text-green-400" />
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <span className="text-slate-400 text-sm">{t('bookings.modal.fields.customerName')}</span>
                            <p className="text-white font-medium">{booking.customer_name}</p>
                          </div>
                          
                          <div>
                            <span className="text-slate-400 text-sm">{t('bookings.modal.fields.email')}</span>
                            <p className="text-white flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              {booking.customer_email}
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-slate-400 text-sm">{t('bookings.modal.fields.phone')}</span>
                            <p className="text-white flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {booking.customer_phone || t('bookings.labels.notProvided')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <span className="text-slate-400 text-sm">{t('bookings.modal.fields.whatsapp')}</span>
                            <p className="text-white">
                              {booking.customer_whatsapp || booking.customer_phone || t('bookings.labels.notProvided')}
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-slate-400 text-sm">{t('bookings.modal.fields.language')}</span>
                            <p className="text-white">
                              {booking.preferred_language || t('bookings.modal.notSpecified')}
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-slate-400 text-sm">{t('bookings.modal.fields.customerType')}</span>
                            <p className="text-white">
                              {booking.customer_type || t('bookings.modal.tourist')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Communication Actions */}
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-white mb-4">
                        {t('bookings.modal.sections.communication')}
                      </h3>
                      
                      <div className="flex flex-wrap gap-3">
                        {booking.booking_status === 'confirmed' && (
                          <button
                            onClick={() => onChatClick(booking)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            {t('bookings.actions.chat')}
                          </button>
                        )}
                        
                        {booking.customer_phone && (
                          <a
                            href={`tel:${booking.customer_phone}`}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            {t('bookings.actions.call')}
                          </a>
                        )}
                        
                        <a
                          href={`mailto:${booking.customer_email}`}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          {t('bookings.actions.email')}
                        </a>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Lock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      {t('bookings.modal.customerLocked.title')}
                    </h3>
                    <p className="text-slate-400 mb-6">
                      {t('bookings.modal.customerLocked.message')}
                    </p>
                    {booking.booking_status === 'pending' && (
                      <p className="text-sm text-blue-400">
                        {t('bookings.modal.customerLocked.hint')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* FINANCIAL TAB */}
            {activeTab === 'financial' && (
              <div className="space-y-6">
                {/* Revenue Breakdown */}
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    {t('bookings.modal.sections.revenueBreakdown')}
                  </h3>
                  
                  <div className="space-y-4">

                    <div className="flex justify-between items-center py-2 border-b border-slate-600">
                      <span className="text-slate-300">
                        {t('bookings.modal.fields.customerPaid')}</span>
                      <span className="text-red-400 font-semibold">{formatPrice(booking.total_amount || booking.subtotal || 0)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 text-sm text-slate-400">
                      <span>
                        {t('bookings.modal.fields.commission')} ({commissionRate.toFixed(1)}%)
                      </span>
                      <span>-{formatPrice(booking.commission_amount || 0)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-3 bg-green-500/10 rounded-lg px-3">
                      <span className="text-green-400 font-medium">{t('bookings.modal.fields.yourRevenue')}</span>
                      <span className="text-green-400 font-bold text-lg">{formatPrice(netRevenue)}</span>
                    </div>
                    
                  </div>
                </div>

                {/* 💰 ENHANCED Payment Information */}
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-400" />
                      {t('bookings.modal.sections.paymentInfo')}
                    </h3>
                    {/* Payment Action Buttons */}
                    <PaymentActionButtons 
                      booking={booking}
                      size="sm"
                      onPaymentUpdate={(updatedBooking) => {
                        // Refresh booking data - you may need to implement this callback
                        console.log('Payment updated:', updatedBooking)
                      }}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    {/* Payment Status Indicator */}
                    <PaymentStatusIndicator booking={booking} />
                    
                    {/* Payment Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-600">
                      {booking.payment_intent_id && (
                        <div>
                          <span className="text-slate-400 text-sm">{t('payment.details.method')}</span>
                          <p className="text-white flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            {t('payment.details.stripeSecured')}
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <span className="text-slate-400 text-sm">{t('bookings.modal.fields.commissionRate')}</span>
                        <p className="text-white">{commissionRate.toFixed(1)}%</p>
                      </div>
                      
                      {booking.stripe_fee && booking.stripe_fee > 0 && (
                        <div>
                          <span className="text-slate-400 text-sm">{t('payment.details.processingFee')}</span>
                          <p className="text-red-300">{formatPrice(booking.stripe_fee)}</p>
                        </div>
                      )}
                      
                      <div>
                        <span className="text-slate-400 text-sm">{t('bookings.modal.fields.commissionLocked')}</span>
                        <p className="text-white flex items-center gap-2">
                          {booking.commission_locked_at ? (
                            <>
                              <Lock className="w-4 h-4 text-green-400" />
                              {formatDate(booking.commission_locked_at)}
                            </>
                          ) : (
                            <>
                              <Unlock className="w-4 h-4 text-yellow-400" />
                              {t('bookings.modal.notLocked')}
                            </>
                          )}
                        </p>
                      </div>
                      
                      {booking.payment_captured_at && (
                        <div className="md:col-span-2">
                          <span className="text-slate-400 text-sm">{t('payment.details.capturedAt')}</span>
                          <p className="text-green-400">{formatDate(booking.payment_captured_at)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 🎬 MODAL ACTIONS */}
          <div className="p-6 border-t border-slate-700 bg-slate-700/30 sticky bottom-0 sm:static">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">
                {t('bookings.modal.lastUpdated')}: {formatDate(booking.updated_at || booking.created_at)}
              </div>
              
              <div className="flex gap-3">
                {booking.booking_status === 'pending' && (
                  <>
                    <button
                      onClick={handleConfirmBooking}
                      disabled={processingBooking === booking.id}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {processingBooking === booking.id ? t('bookings.actions.confirming') : t('bookings.actions.confirm')}
                    </button>
                    
                    <button
                      onClick={handleDeclineWithConfirmation}
                      disabled={processingBooking === booking.id}
                      className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      {t('bookings.actions.decline')}
                    </button>
                  </>
                )}
                
                {booking.booking_status === 'confirmed' && (
                  <button
                    onClick={handleCompleteBooking}
                    disabled={processingBooking === booking.id}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <Award className="w-4 h-4" />
                    {t('bookings.actions.complete')}
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingDetailModal