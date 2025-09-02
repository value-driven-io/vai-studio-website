// File: tourist-app/src/components/journey/BookingDetailModal.jsx
import { 
  X, Calendar, MapPin, Users, Phone, MessageCircle,
  CheckCircle, XCircle, AlertCircle, Timer, Award, Copy,
  ExternalLink, RotateCcw, Euro, Info, Utensils, Accessibility, 
  CreditCard, Shield
} from 'lucide-react'
import { TOUR_TYPE_EMOJIS } from '../../constants/moods'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const BookingDetailModal = ({ 
  booking, 
  isOpen, 
  onClose,
  formatPrice, 
  formatDate, 
  formatTime,
  onContactOperator,
  onRebook,
  onGetSupport,
  canContactOperator = () => true,
  canRebook = () => true
}) => {
  // 🚨 REQUIRED: Initialize translation hook
  const { t } = useTranslation()
  
  if (!isOpen || !booking) return null

  // Status configuration - ENHANCED for NEW Payment FLOW
  const getStatusConfig = (booking) => {
    const status = booking?.booking_status?.toLowerCase()
    const paymentStatus = booking?.payment_status?.toLowerCase()
    const hasPayment = booking?.payment_intent_id
    
    // 🆕 NEW FLOW: Handle payment status combinations
    if (status === 'pending') {
      if (paymentStatus === 'authorized' && hasPayment) {
        return {
          color: 'bg-blue-500',
          textColor: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          icon: CreditCard,
          label: t('status.pendingPayment'),
          description: t('status.pendingPaymentDesc'),
          progress: 25,
          showPaymentInfo: true
        }
      } else {
        return {
          color: 'bg-yellow-500',
          textColor: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
          icon: Timer,
          label: t('status.pending'),
          description: 'Awaiting confirmation from operator',
          progress: 33,
          showPaymentInfo: false
        }
      }
    }
    
    if (status === 'confirmed') {
      if (paymentStatus === 'paid' || paymentStatus === 'captured') {
        return {
          color: 'bg-green-500',
          textColor: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          icon: CheckCircle,
          label: t('status.confirmedPaid'),
          description: t('status.confirmedPaidDesc'),
          progress: 75,
          showPaymentInfo: true
        }
      } else {
        return {
          color: 'bg-green-500',
          textColor: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          icon: CheckCircle,
          label: t('status.confirmed'),
          description: 'Your adventure is confirmed and ready to go',
          progress: 66,
          showPaymentInfo: false
        }
      }
    }
    
    if (status === 'completed') {
      return {
        color: 'bg-blue-500',
        textColor: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        icon: Award,
        label: t('status.completed'),
        description: 'Adventure completed successfully',
        progress: 100,
        showPaymentInfo: paymentStatus === 'paid'
      }
    }
    
    if (status === 'declined') {
      if (paymentStatus === 'refunded') {
        return {
          color: 'bg-orange-500',
          textColor: 'text-orange-400',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/20',
          icon: RotateCcw,
          label: t('status.declinedRefunded'),
          description: t('status.declinedRefundedDesc'),
          progress: 0,
          showPaymentInfo: true,
          showRefundInfo: true
        }
      } else {
        return {
          color: 'bg-red-500',
          textColor: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          icon: XCircle,
          label: t('status.declined'),
          description: 'This booking is no longer active',
          progress: 0,
          showPaymentInfo: false
        }
      }
    }
    
    if (status === 'cancelled') {
      return {
        color: 'bg-red-500',
        textColor: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        icon: XCircle,
        label: t('status.cancelled'),
        description: 'This booking was cancelled',
        progress: 0,
        showPaymentInfo: paymentStatus === 'refunded',
        showRefundInfo: paymentStatus === 'refunded'
      }
    }
    
    // Default fallback
    return {
      color: 'bg-slate-500',
      textColor: 'text-slate-400',
      bgColor: 'bg-slate-500/10',
      borderColor: 'border-slate-500/20',
      icon: AlertCircle,
      label: t('bookingDetails.status.unknown', { default: 'Unknown' }),
      description: t('bookingDetails.status.statusUnclear', { default: 'Status unclear' }),
      progress: 0,
      showPaymentInfo: false
    }
  }

  const statusConfig = getStatusConfig(booking)
  const StatusIcon = statusConfig.icon
  const tourEmoji = TOUR_TYPE_EMOJIS[booking.tours?.tour_type] || '🌴'

  // Copy booking reference
  const copyBookingReference = () => {
    navigator.clipboard.writeText(booking.booking_reference)
    toast.success(t('journey.messages.bookingRefCopied'))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] border border-slate-700 overflow-hidden">
        
        {/* Header */}
        <div className="relative p-6 border-b border-slate-700">
          {/* Status Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-700">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${statusConfig.color}`}
              style={{ width: `${statusConfig.progress}%` }}
            />
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl">{tourEmoji}</div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {booking.tours?.tour_name || t('bookingDetails.header.tourDetails', { default: 'Tour Details' })}
                  </h2>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
                    <StatusIcon className={`w-4 h-4 ${statusConfig.textColor}`} />
                    <span className={`text-sm font-medium ${statusConfig.textColor}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            
            {/* Status Description */}
            <div className={`p-4 rounded-lg ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
              <p className={`text-sm ${statusConfig.textColor}`}>
                {statusConfig.description}
              </p>
            </div>

            {/* 🆕 PAYMENT INFORMATION SECTION - NEW FLOW (CORRECTLY PLACED) */}
            {statusConfig.showPaymentInfo && (
              <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {t('bookingDetails.paymentStatus')}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{t('bookingDetails.paymentMethod')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white">{t('bookingDetails.stripeSecured')}</span>
                      <CreditCard className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                  
                  {booking.payment_status === 'authorized' && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">{t('bookingDetails.authorizedAmount')}</span>
                        <span className="text-yellow-400">{formatPrice(booking.total_amount)}</span>
                      </div>
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-yellow-400 text-sm">
                          <Shield className="w-4 h-4" />
                          <span>{t('bookingDetails.noChargeYet')}</span>
                        </div>
                        <p className="text-yellow-300 text-xs mt-1">{t('bookingDetails.chargeOnConfirmation')}</p>
                      </div>
                    </>
                  )}
                  
                  {(booking.payment_status === 'paid' || booking.payment_status === 'captured') && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">{t('bookingDetails.capturedAmount')}</span>
                        <span className="text-green-400">{formatPrice(booking.total_amount)}</span>
                      </div>
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>{t('status.paymentCaptured')}</span>
                        </div>
                        {booking.payment_captured_at && (
                          <p className="text-green-300 text-xs mt-1">
                            Captured: {formatDate(booking.payment_captured_at)}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                  
                  {statusConfig.showRefundInfo && booking.payment_status === 'refunded' && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">{t('bookingDetails.refundedAmount')}</span>
                        <span className="text-orange-400">{formatPrice(booking.total_amount)}</span>
                      </div>
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-orange-400 text-sm">
                          <RotateCcw className="w-4 h-4" />
                          <span>{t('bookingDetails.refundComplete')}</span>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {booking.payment_intent_id && (
                    <div className="text-xs text-slate-500 border-t border-slate-600 pt-2">
                      {t('bookingDetails.fields.paymentId', { default: 'Payment ID' })}: {booking.payment_intent_id}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tour & Booking Info */}
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
              
              {/* Left Column */}
              <div className="space-y-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t('bookingDetails.sections.tourDetails', { default: 'Tour Details' })}
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('bookingDetails.fields.date', { default: 'Date' })}:</span>
                      <span className="text-white">{formatDate(booking.tours?.tour_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('bookingDetails.fields.time', { default: 'Time' })}:</span>
                      <span className="text-white">{formatTime(booking.tours?.time_slot)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('bookingDetails.fields.duration', { default: 'Duration' })}:</span>
                      <span className="text-white">{booking.tours?.duration_hours || t('common.notAvailable', { default: 'N/A' })}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('bookingDetails.fields.type', { default: 'Type' })}:</span>
                      <span className="text-white">{booking.tours?.tour_type || t('common.notAvailable', { default: 'N/A' })}</span>
                    </div>
                    {booking.tours?.meeting_point && (
                      <div className="pt-2 border-t border-slate-600">
                        <div className="text-slate-400 mb-1">{t('bookingDetails.fields.meetingPoint', { default: 'Meeting Point' })}:</div>
                        <div className="text-white text-xs bg-green-500/10 border border-green-500/20 rounded p-2 mt-1">
                          {booking.tours.meeting_point}
                        </div>
                      </div>
                    )}
                    {booking.tours?.max_capacity && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('bookingDetails.fields.maxCapacity', { default: 'Max capacity' })}:</span>
                        <span className="text-white">{booking.tours.max_capacity} {t('common.people', { default: 'people' })}</span>
                      </div>
                    )}
                    {booking.tours?.whats_included && (
                      <div className="pt-2 border-t border-slate-600">
                        <div className="text-slate-400 mb-1">{t('bookingDetails.fields.whatsIncluded', { default: 'What\'s included' })}:</div>
                        <div className="text-white text-xs">{booking.tours.whats_included}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Reference */}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    {t('bookingDetails.sections.bookingInfo', { default: 'Booking Info' })}
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">{t('bookingDetails.fields.reference', { default: 'Reference' })}:</span>
                      <button
                        onClick={copyBookingReference}
                        className="text-blue-400 hover:text-blue-300 font-mono transition-colors flex items-center gap-1"
                      >
                        {booking.booking_reference}
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('bookingDetails.fields.participants', { default: 'Participants' })}:</span>
                      <span className="text-white">{booking.num_adults + (booking.num_children || 0)} ({booking.num_adults} {t('common.adults', { default: 'adults' })}{booking.num_children ? `, ${booking.num_children} ${t('common.children', { default: 'children' })}` : ''})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('bookingDetails.fields.booked', { default: 'Booked' })}:</span>
                      <span className="text-white">{formatDate(booking.created_at)}</span>
                    </div>
                    {booking.confirmation_deadline && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('bookingDetails.fields.confirmationBy', { default: 'Confirmation by' })}:</span>
                        <span className="text-orange-300">{formatDate(booking.confirmation_deadline)}</span>
                      </div>
                    )}
                    {booking.booking_status === 'confirmed' && booking.confirmed_at && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('bookingDetails.fields.confirmed', { default: 'Confirmed' })}:</span>
                        <span className="text-green-300">{formatDate(booking.confirmed_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle Column */}
              <div className="space-y-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {t('bookingDetails.sections.operatorDetails', { default: 'Operator Details' })}
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('bookingDetails.fields.company', { default: 'Company' })}:</span>
                      <span className="text-white">{booking.operators?.company_name || t('common.notAvailable', { default: 'N/A' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">{t('bookingDetails.fields.island', { default: 'Island' })}:</span>
                      <span className="text-white">{booking.operators?.island || t('common.notAvailable', { default: 'N/A' })}</span>
                    </div>
                    {booking.operators?.contact_person && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('bookingDetails.fields.contact', { default: 'Contact' })}:</span>
                        <span className="text-white">{booking.operators.contact_person}</span>
                      </div>
                    )}
                    {booking.operators?.whatsapp_number && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('bookingDetails.fields.whatsapp', { default: 'WhatsApp' })}:</span>
                        <span className="text-white">{booking.operators.whatsapp_number}</span>
                      </div>
                    )}
                    {booking.operators?.phone && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('bookingDetails.fields.phone', { default: 'Phone' })}:</span>
                        <span className="text-white">{booking.operators.phone}</span>
                      </div>
                    )}
                    {booking.operators?.email && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('bookingDetails.fields.email', { default: 'Email' })}:</span>
                        <span className="text-white text-xs">{booking.operators.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {t('bookingDetails.sections.customerDetails', { default: 'Customer Details' })}
                  </h3>
                  <div className="space-y-3 text-sm">
                    {booking.customer_name && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('bookingDetails.fields.name', { default: 'Name' })}:</span>
                        <span className="text-white">{booking.customer_name}</span>
                      </div>
                    )}
                    {booking.customer_email && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('bookingDetails.fields.email', { default: 'Email' })}:</span>
                        <span className="text-white text-xs">{booking.customer_email}</span>
                      </div>
                    )}
                    {booking.customer_whatsapp && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('bookingDetails.fields.whatsapp', { default: 'WhatsApp' })}:</span>
                        <span className="text-white">{booking.customer_whatsapp}</span>
                      </div>
                    )}
                    {booking.customer_phone && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('bookingDetails.fields.phone', { default: 'Phone' })}:</span>
                        <span className="text-white">{booking.customer_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Euro className="w-4 h-4" />
                    {t('bookingDetails.sections.pricing', { default: 'Pricing' })}
                  </h3>
                  <div className="space-y-3 text-sm">
                    {booking.adult_price && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('bookingDetails.fields.adultPrice', { default: 'Adult price' })}:</span>
                        <span className="text-white">{formatPrice(booking.adult_price)} x {booking.num_adults}</span>
                      </div>
                    )}
                    {booking.child_price && booking.num_children > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('bookingDetails.fields.childPrice', { default: 'Child price' })}:</span>
                        <span className="text-white">{formatPrice(booking.child_price)} x {booking.num_children}</span>
                      </div>
                    )}
                    {booking.discount_amount && booking.discount_amount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>{t('bookingDetails.fields.discount', { default: 'Discount' })}:</span>
                        <span>-{formatPrice(booking.discount_amount)}</span>
                      </div>
                    )}
                    {booking.subtotal && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('bookingDetails.fields.subtotal', { default: 'Subtotal' })}:</span>
                        <span className="text-white">{formatPrice(booking.subtotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold pt-2 border-t border-slate-600 text-lg">
                      <span className="text-white">{t('bookingDetails.fields.total', { default: 'Total' })}:</span>
                      <span className="text-white">{formatPrice(booking.total_amount || booking.subtotal)}</span>
                    </div>
                    {booking.discount_amount && booking.discount_amount > 0 && (
                      <div className="text-xs text-green-400 text-center">
                        💰 {t('bookingDetails.messages.savings', { amount: formatPrice(booking.discount_amount), default: 'You saved {{amount}} on this booking!' })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Special Requirements */}
            {(booking.special_requirements || booking.dietary_restrictions || booking.accessibility_needs) && (
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  {t('bookingDetails.sections.specialRequirements', { default: 'Special Requirements' })}
                </h3>
                <div className="space-y-2 text-sm">
                  {booking.special_requirements && (
                    <div>
                      <span className="text-slate-400">{t('bookingDetails.fields.specialRequests', { default: 'Special requests' })}:</span>
                      <p className="text-white mt-1">{booking.special_requirements}</p>
                    </div>
                  )}
                  {booking.dietary_restrictions && (
                    <div>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Utensils className="w-3 h-3" />
                        {t('bookingDetails.fields.dietaryRestrictions', { default: 'Dietary restrictions' })}:
                      </span>
                      <p className="text-white mt-1">{booking.dietary_restrictions}</p>
                    </div>
                  )}
                  {booking.accessibility_needs && (
                    <div>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Accessibility className="w-3 h-3" />
                        {t('bookingDetails.fields.accessibilityNeeds', { default: 'Accessibility needs' })}:
                      </span>
                      <p className="text-white mt-1">{booking.accessibility_needs}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tour Description */}
            {booking.tours?.description && (
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">{t('bookingDetails.sections.tourDescription', { default: 'Tour Description' })}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {booking.tours.description}
                </p>
              </div>
            )}

            {/* Status-Specific Help Section */}
            <div className={`rounded-lg p-4 ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
              <h3 className={`font-semibold mb-3 flex items-center gap-2 ${statusConfig.textColor}`}>
                <Info className="w-4 h-4" />
                {booking.booking_status === 'pending' && t('bookingDetails.help.pendingTitle', { default: 'What happens next?' })}
                {booking.booking_status === 'confirmed' && t('bookingDetails.help.confirmedTitle', { default: 'You\'re all set!' })}
                {booking.booking_status === 'completed' && t('bookingDetails.help.completedTitle', { default: 'Thanks for your adventure!' })}
                {(booking.booking_status === 'declined' || booking.booking_status === 'cancelled') && t('bookingDetails.help.cancelledTitle', { default: 'Booking Status' })}
              </h3>
              <div className={`text-sm space-y-2 ${statusConfig.textColor}`}>
                {booking.booking_status === 'pending' && (
                  <>
                    <p>• {t('bookingDetails.help.pending1', { default: 'Your booking is being reviewed by the operator' })}</p>
                    <p>• {t('bookingDetails.help.pending2', { default: 'You will receive confirmation within 24 hours' })}</p>
                    <p>• {t('bookingDetails.help.pending3', { default: 'Payment will only be charged after confirmation' })}</p>
                    <p>• {t('bookingDetails.help.pending4', { default: 'Feel free to contact the operator for questions' })}</p>
                  </>
                )}
                {booking.booking_status === 'confirmed' && (
                  <>
                    <p>• {t('bookingDetails.help.confirmed1', { default: 'Your tour is confirmed and secured' })}</p>
                    <p>• {t('bookingDetails.help.confirmed2', { default: 'Arrive at the meeting point on time' })}</p>
                    <p>• {t('bookingDetails.help.confirmed3', { default: 'Bring any required items mentioned in tour details' })}</p>
                    <p>• {t('bookingDetails.help.confirmed4', { default: 'Contact the operator if you have any questions' })}</p>
                  </>
                )}
                {booking.booking_status === 'completed' && (
                  <>
                    <p>• {t('bookingDetails.help.completed1', { default: 'Hope you had an amazing experience!' })}</p>
                    <p>• {t('bookingDetails.help.completed2', { default: 'Your booking is now complete' })}</p>
                    <p>• {t('bookingDetails.help.completed3', { default: 'Feel free to book the same tour again' })}</p>
                    <p>• {t('bookingDetails.help.completed4', { default: 'Contact support if you need any help' })}</p>
                  </>
                )}
                {(booking.booking_status === 'declined' || booking.booking_status === 'cancelled') && (
                  <>
                    <p>• {t('bookingDetails.help.cancelled1', { default: 'This booking is no longer active' })}</p>
                    <p>• {t('bookingDetails.help.cancelled2', { default: 'Any payments have been refunded' })}</p>
                    <p>• {t('bookingDetails.help.cancelled3', { default: 'You can book a similar tour anytime' })}</p>
                    <p>• {t('bookingDetails.help.cancelled4', { default: 'Contact support for assistance' })}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-700 bg-slate-800/50">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-3 flex-1">
              {/* Primary Action Based on Status */}
              {booking.booking_status === 'pending' && canContactOperator(booking) && (
                <button
                  onClick={() => onContactOperator?.(booking)}
                  className="flex items-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium"
                >
                  {booking.operators?.whatsapp_number ? (
                    <MessageCircle className="w-4 h-4" />
                  ) : (
                    <Phone className="w-4 h-4" />
                  )}
                  {t('bookingDetails.actions.followUp', { default: 'Follow Up with Operator' })}
                </button>
              )}

              {booking.booking_status === 'confirmed' && canContactOperator(booking) && (
                <button
                  onClick={() => onContactOperator?.(booking)}
                  className="flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                >
                  {booking.operators?.whatsapp_number ? (
                    <MessageCircle className="w-4 h-4" />
                  ) : (
                    <Phone className="w-4 h-4" />
                  )}
                  {t('bookingDetails.actions.contactOperator', { default: 'Chat with Operator' })}
                </button>
              )}

              {/* Rebook Button */}
              {canRebook(booking) && (
                <button
                  onClick={() => onRebook?.(booking)}
                  className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t('bookingDetails.actions.bookAgain', { default: 'Book Again' })}
                </button>
              )}

              {/* Support Button */}
              <button
                onClick={() => onGetSupport?.(booking)}
                className="flex items-center gap-2 px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                {t('bookingDetails.actions.getSupport', { default: 'Get Support' })}
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="bg-slate-700 hover:bg-slate-600 text-white py-3 px-6 rounded-lg transition-colors font-medium min-w-[100px]"
            >
              {t('common.close', { default: 'Close' })}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingDetailModal