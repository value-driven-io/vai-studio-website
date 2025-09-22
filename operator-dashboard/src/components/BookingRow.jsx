// BookingRow.jsx - Symmetric, readable booking row design
import {
  MessageCircle, Eye, AlertCircle, CheckCircle, XCircle,
  Copy, Clock, Users, Calendar
} from 'lucide-react'
import PaymentStatusIndicator from './PaymentStatusIndicator'

const BookingRow = ({
  booking,
  formatPrice,
  getTimeUntilDeadline,
  shouldShowCustomerDetails,
  onBookingClick,
  onChatClick,
  t
}) => {
  const statusConfig = {
    pending: {
      icon: AlertCircle,
      color: 'text-orange-400',
      bg: 'bg-orange-500/20',
      border: 'border-orange-500/30',
      label: 'En attente'
    },
    confirmed: {
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-500/20',
      border: 'border-green-500/30',
      label: 'Confirmé'
    },
    cancelled: {
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/20',
      border: 'border-red-500/30',
      label: 'Annulé'
    },
    declined: {
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/20',
      border: 'border-red-500/30',
      label: 'Refusé'
    },
    completed: {
      icon: CheckCircle,
      color: 'text-blue-400',
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/30',
      label: 'Terminé'
    }
  }

  const status = statusConfig[booking.booking_status] || statusConfig.pending
  const StatusIcon = status.icon
  const timeInfo = getTimeUntilDeadline ? getTimeUntilDeadline(booking) : null
  const isUrgent = timeInfo?.isUrgent
  const showCustomerName = shouldShowCustomerDetails(booking)
  const guestCount = (booking.num_adults || 0) + (booking.num_children || 0)
  const bookingAmount = booking.total_amount || booking.subtotal || 0
  // For now, treat all messages as unread since we don't have read/unread tracking
  const hasUnreadMessages = booking.has_messages
  const unreadMessageCount = hasUnreadMessages ? 1 : 0

  // Copy booking reference to clipboard
  const copyBookingRef = (e) => {
    e.stopPropagation()
    if (booking.booking_reference) {
      navigator.clipboard.writeText(booking.booking_reference)
      // You could add a toast notification here
    }
  }

  return (
    <div
      onClick={() => onBookingClick(booking)}
      className={`
        group relative border rounded-xl cursor-pointer transition-all duration-200
        ${isUrgent
          ? 'border-red-500/50 bg-gradient-to-r from-red-500/5 to-red-500/10 hover:from-red-500/10 hover:to-red-500/15'
          : 'border-slate-600/30 bg-gradient-to-r from-slate-700/10 to-slate-700/20 hover:from-slate-600/20 hover:to-slate-600/30'
        }
        hover:border-slate-500/50 hover:shadow-lg hover:shadow-slate-900/20
      `}
    >
      {/* Urgent Indicator */}
      {isUrgent && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="flex items-center justify-center w-4 h-4 bg-red-500 rounded-full">
            <Clock className="w-2 h-2 text-white" />
          </div>
        </div>
      )}

      {/* Top Section - Status & Primary Info */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between">
          {/* Left: Status Badge & Customer */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Status Badge */}
            <div className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold
              ${status.bg} ${status.color} ${status.border} border
            `}>
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{status.label}</span>
            </div>

            {/* Customer Name */}
            <div className="flex-1 min-w-0">
              {showCustomerName ? (
                <h4 className="text-white text-sm font-semibold truncate">
                  {booking.customer_name || t('bookings.labels.anonymous')}
                </h4>
              ) : (
                <h4 className="text-slate-400 text-sm font-medium">
                  {t('bookings.labels.customerProtected')}
                </h4>
              )}
            </div>
          </div>

          {/* Right: Primary Actions */}
          <div className="flex items-center gap-2">
            {/* Chat Button - Primary Action */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onChatClick(booking)
              }}
              className={`
                relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${hasUnreadMessages
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25'
                  : booking.has_messages
                  ? 'bg-slate-600 text-slate-200 hover:bg-slate-500 hover:text-white border-blue-400/30 border'
                  : 'bg-slate-600 text-slate-200 hover:bg-slate-500 hover:text-white'
                }
              `}
              title={t('bookings.actions.chat')}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t('bookings.actions.chat')}</span>
              {hasUnreadMessages && unreadMessageCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{unreadMessageCount > 99 ? '99+' : unreadMessageCount}</span>
                </span>
              )}
              {booking.has_messages && !hasUnreadMessages && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-400 rounded-full border-2 border-white"></span>
              )}
            </button>

            {/* View Details Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onBookingClick(booking)
              }}
              className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-600/50 rounded-lg transition-all"
              title={t('bookings.actions.viewDetails')}
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section - Details */}
      <div className="px-4 pb-4 border-t border-slate-600/20">
        <div className="flex items-center justify-between pt-3">
          {/* Left Side - Reference & Guests */}
          <div className="flex items-center gap-6">
            {/* Booking Reference */}
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <div className="flex items-center gap-1">
                {booking.booking_reference ? (
                  <>
                    <span className="text-slate-400 text-xs font-mono">
                      {booking.booking_reference}
                    </span>
                    <button
                      onClick={copyBookingRef}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-600 rounded transition-all"
                      title={t('bookings.actions.copyReference')}
                    >
                      <Copy className="w-3 h-3 text-slate-500 hover:text-white" />
                    </button>
                  </>
                ) : (
                  <span className="text-slate-500 text-xs">
                    Auto-généré
                  </span>
                )}
              </div>
            </div>

            {/* Guest Count */}
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-300 text-sm font-medium">
                {guestCount} {guestCount === 1 ? t('bookings.labels.guest') : t('bookings.labels.guests')}
              </span>
            </div>
          </div>

          {/* Right Side - Amount & Status */}
          <div className="flex items-center gap-4">
            {/* Amount */}
            <div className="flex items-center">
              <span className="text-green-400 text-sm font-bold">
                {formatPrice(bookingAmount)}
              </span>
            </div>

            {/* Deadline */}
            {timeInfo && (
              <div className={`
                flex items-center gap-1 px-2 py-1 rounded text-xs font-medium
                ${isUrgent
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-slate-600/30 text-slate-400'
                }
              `}>
                <Clock className="w-3 h-3" />
                <span>{timeInfo.display}</span>
              </div>
            )}

            {/* Payment Status */}
            <PaymentStatusIndicator booking={booking} size="sm" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingRow