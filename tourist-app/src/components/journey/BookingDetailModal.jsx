// File: tourist-app/src/components/journey/BookingDetailModal.jsx
import React from 'react'
import { 
  X, Calendar, Clock, MapPin, Users, Star, Phone, MessageCircle,
  CheckCircle, XCircle, AlertCircle, Timer, Award, Copy, Mail,
  ExternalLink, RotateCcw, Euro, Info, Utensils, Accessibility
} from 'lucide-react'
import { TOUR_TYPE_EMOJIS } from '../../constants/moods'
import toast from 'react-hot-toast'

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
  if (!isOpen || !booking) return null

  // Status configuration (same as StatusCard)
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'awaiting_confirmation':
        return {
          color: 'bg-yellow-500',
          textColor: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
          icon: Timer,
          label: 'Pending',
          description: 'Awaiting confirmation from operator',
          progress: 33
        }
      case 'confirmed':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          icon: CheckCircle,
          label: 'Confirmed!',
          description: 'Your adventure is confirmed and ready to go',
          progress: 66
        }
      case 'completed':
        return {
          color: 'bg-blue-500',
          textColor: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          icon: Award,
          label: 'Complete',
          description: 'Adventure completed successfully',
          progress: 100
        }
      case 'declined':
      case 'cancelled':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          icon: XCircle,
          label: status === 'declined' ? 'Declined' : 'Cancelled',
          description: 'This booking is no longer active',
          progress: 0
        }
      default:
        return {
          color: 'bg-slate-500',
          textColor: 'text-slate-400',
          bgColor: 'bg-slate-500/10',
          borderColor: 'border-slate-500/20',
          icon: AlertCircle,
          label: 'Unknown',
          description: 'Status unclear',
          progress: 0
        }
    }
  }

  const statusConfig = getStatusConfig(booking.booking_status)
  const StatusIcon = statusConfig.icon
  const tourEmoji = TOUR_TYPE_EMOJIS[booking.tours?.tour_type] || '🌴'

  // Copy booking reference
  const copyBookingReference = () => {
    navigator.clipboard.writeText(booking.booking_reference)
    toast.success('Booking reference copied!')
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] border border-slate-700 overflow-hidden">
        
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
                    {booking.tours?.tour_name || 'Tour Details'}
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

            {/* Tour & Booking Info */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Left Column */}
              <div className="space-y-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Tour Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date:</span>
                      <span className="text-white">{formatDate(booking.tours?.tour_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Time:</span>
                      <span className="text-white">{formatTime(booking.tours?.time_slot)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-white">{booking.tours?.duration_hours || 'N/A'}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Type:</span>
                      <span className="text-white">{booking.tours?.tour_type || 'N/A'}</span>
                    </div>
                    {booking.tours?.meeting_point && (
                      <div className="pt-2 border-t border-slate-600">
                        <div className="text-slate-400 mb-1">Meeting Point:</div>
                        <div className="text-white text-xs">{booking.tours.meeting_point}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Reference */}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Booking Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Reference:</span>
                      <button
                        onClick={copyBookingReference}
                        className="text-blue-400 hover:text-blue-300 font-mono transition-colors flex items-center gap-1"
                      >
                        {booking.booking_reference}
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Participants:</span>
                      <span className="text-white">{booking.num_adults + (booking.num_children || 0)} ({booking.num_adults} adults{booking.num_children ? `, ${booking.num_children} children` : ''})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Booked:</span>
                      <span className="text-white">{formatDate(booking.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Operator Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Company:</span>
                      <span className="text-white">{booking.operators?.company_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Island:</span>
                      <span className="text-white">{booking.operators?.island || 'N/A'}</span>
                    </div>
                    {booking.operators?.contact_person && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Contact:</span>
                        <span className="text-white">{booking.operators.contact_person}</span>
                      </div>
                    )}
                    {booking.operators?.whatsapp_number && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">WhatsApp:</span>
                        <span className="text-white">{booking.operators.whatsapp_number}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Euro className="w-4 h-4" />
                    Pricing
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Subtotal:</span>
                      <span className="text-white">{formatPrice(booking.subtotal)}</span>
                    </div>
                    {booking.commission_amount && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Service fee:</span>
                        <span className="text-white">{formatPrice(booking.commission_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold pt-2 border-t border-slate-600">
                      <span className="text-white">Total:</span>
                      <span className="text-white">{formatPrice(booking.total_amount || booking.subtotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Requirements */}
            {(booking.special_requirements || booking.dietary_restrictions || booking.accessibility_needs) && (
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Special Requirements
                </h3>
                <div className="space-y-2 text-sm">
                  {booking.special_requirements && (
                    <div>
                      <span className="text-slate-400">Special requests:</span>
                      <p className="text-white mt-1">{booking.special_requirements}</p>
                    </div>
                  )}
                  {booking.dietary_restrictions && (
                    <div>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Utensils className="w-3 h-3" />
                        Dietary restrictions:
                      </span>
                      <p className="text-white mt-1">{booking.dietary_restrictions}</p>
                    </div>
                  )}
                  {booking.accessibility_needs && (
                    <div>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Accessibility className="w-3 h-3" />
                        Accessibility needs:
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
                <h3 className="font-semibold text-white mb-3">Tour Description</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {booking.tours.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-700 bg-slate-800/50">
          <div className="flex gap-3">
            {/* Contact Button */}
            {canContactOperator(booking) && (
              <button
                onClick={() => onContactOperator?.(booking)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                {booking.operators?.whatsapp_number ? (
                  <MessageCircle className="w-4 h-4" />
                ) : (
                  <Phone className="w-4 h-4" />
                )}
                Contact Operator
              </button>
            )}

            {/* Rebook Button */}
            {canRebook(booking) && (
              <button
                onClick={() => onRebook?.(booking)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Book Again
              </button>
            )}

            {/* Support Button */}
            <button
              onClick={() => onGetSupport?.(booking)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Get Support
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingDetailModal