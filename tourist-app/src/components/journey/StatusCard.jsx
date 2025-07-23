// File: tourist-app/src/components/journey/StatusCard.jsx
import React, { useState } from 'react'
import { 
  Calendar, Clock, MapPin, Users, Star, Phone, MessageCircle,
  CheckCircle, XCircle, AlertCircle, Timer, Award, Copy,
  ExternalLink, RotateCcw, ChevronRight, MoreHorizontal
} from 'lucide-react'
import { TOUR_TYPE_EMOJIS } from '../../constants/moods'
import toast from 'react-hot-toast'

const StatusCard = ({ 
  booking, 
  formatPrice, 
  formatDate, 
  formatTime,
  onContactOperator,
  onRebook,
  onGetSupport,
  onShowDetails, // New prop for detail modal
  canContactOperator = () => true,
  canRebook = () => true
}) => {
  const [showActions, setShowActions] = useState(false)

  // Status configuration
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
          description: 'Awaiting confirmation',
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
          description: 'Ready to go',
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
          description: 'Adventure finished',
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
          description: 'Not available',
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

  // Get tour emoji
  const tourEmoji = TOUR_TYPE_EMOJIS[booking.tours?.tour_type] || '🌴'

  // Copy booking reference
  const copyBookingReference = () => {
    navigator.clipboard.writeText(booking.booking_reference)
    toast.success('Booking reference copied!')
  }

  return (
    <div className={`relative rounded-xl backdrop-blur-sm border transition-all duration-300 hover:scale-[1.02] ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
      
      {/* Status Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-700 rounded-t-xl overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ease-out ${statusConfig.color}`}
          style={{ width: `${statusConfig.progress}%` }}
        />
      </div>

      <div className="p-4">
        {/* Header Row: Status + Date + Actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Status Badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
              <StatusIcon className={`w-3.5 h-3.5 ${statusConfig.textColor}`} />
              <span className={`text-xs font-medium ${statusConfig.textColor}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Tour Date */}
          <div className="text-right">
            <div className="text-xs text-slate-400">
              {formatDate(booking.tours?.tour_date)}
            </div>
            <div className="text-xs text-slate-300 font-medium">
              {formatTime(booking.tours?.time_slot)}
            </div>
          </div>
        </div>

        {/* Tour Info Row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl flex-shrink-0">
            {tourEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate">
              {booking.tours?.tour_name || 'Tour Name Not Available'}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-3 h-3" />
              <span>{booking.operators?.island || 'Location TBD'}</span>
              <span>•</span>
              <span>{booking.operators?.company_name || 'Operator'}</span>
            </div>
          </div>
        </div>

        {/* Details Row */}
        <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
          <div className="text-center">
            <Users className="w-4 h-4 text-slate-400 mx-auto mb-1" />
            <div className="text-slate-300 font-medium">
              {booking.num_adults + (booking.num_children || 0)}
            </div>
            <div className="text-slate-500">Participants</div>
          </div>
          
          <div className="text-center">
            <span className="text-slate-400 text-lg font-mono">▼</span>
            <div className="text-slate-300 font-medium">
              {formatPrice(booking.total_amount || booking.subtotal)}
            </div>
            <div className="text-slate-500">Total</div>
          </div>
          
          <div className="text-center">
            <Copy className="w-4 h-4 text-slate-400 mx-auto mb-1" />
            <button 
              onClick={copyBookingReference}
              className="text-slate-300 font-medium hover:text-blue-400 transition-colors font-mono text-[10px]"
              title="Click to copy"
            >
              {booking.booking_reference?.slice(-6) || 'N/A'}
            </button>
            <div className="text-slate-500">Reference</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* More Details Button (Primary) */}
          <button
            onClick={() => onShowDetails?.(booking)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>More Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Quick Actions */}
          <div className="flex gap-2">
            {/* Contact Button */}
            {canContactOperator(booking) && (
              <button
                onClick={() => onContactOperator?.(booking)}
                className="bg-slate-600 hover:bg-slate-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
                title="Contact Operator"
              >
                {booking.operators?.whatsapp_number ? (
                  <MessageCircle className="w-4 h-4" />
                ) : (
                  <Phone className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Rebook Button */}
            {canRebook(booking) && (
              <button
                onClick={() => onRebook?.(booking)}
                className="bg-slate-600 hover:bg-slate-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
                title="Book Again"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Support Button */}
            <button
              onClick={() => onGetSupport?.(booking)}
              className="bg-slate-600 hover:bg-slate-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
              title="Get Support"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status-specific Additional Info */}
        {booking.booking_status === 'pending' && (
          <div className="mt-3 p-2 bg-yellow-500/5 border border-yellow-500/10 rounded-lg">
            <p className="text-xs text-yellow-300/80">
              {statusConfig.description} - Keep an eye on your emails!
            </p>
          </div>
        )}

        {booking.booking_status === 'confirmed' && booking.tours?.meeting_point && (
          <div className="mt-3 p-2 bg-green-500/5 border border-green-500/10 rounded-lg">
            <p className="text-xs text-green-300/80">
              📍 Meeting point: {booking.tours.meeting_point}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StatusCard