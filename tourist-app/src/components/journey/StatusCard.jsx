// File: tourist-app/src/components/journey/StatusCard.jsx
import React, { useState } from 'react'
import { 
  Calendar, Clock, MapPin, Users, Star, Phone, MessageCircle,
  CheckCircle, XCircle, AlertCircle, Timer, Award, Copy,
  ExternalLink, RotateCcw, ChevronRight, MoreHorizontal
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const [showActions, setShowActions] = useState(false)

  // Status configuration
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'awaiting_confirmation':
        return {
          color: 'bg-status-caution',
          textColor: 'text-status-caution-light',
          bgColor: 'bg-status-caution-bg',
          borderColor: 'border-status-caution',
          icon: Timer,
          label: t('statusCard.status.pending'),
          description: t('statusCard.status.pendingDesc'),
          progress: 33
        }
      case 'confirmed':
        return {
          color: 'bg-status-success',
          textColor: 'text-status-success-light',
          bgColor: 'bg-status-success-bg',
          borderColor: 'border-status-success',
          icon: CheckCircle,
          label: t('statusCard.status.confirmed'),
          description: t('statusCard.status.confirmedDesc'),
          progress: 66
        }
      case 'completed':
        return {
          color: 'bg-status-info',
          textColor: 'text-status-info-light',
          bgColor: 'bg-status-info-bg',
          borderColor: 'border-status-info',
          icon: Award,
          label: t('statusCard.status.complete'),
          description: t('statusCard.status.completeDesc'),
          progress: 100
        }
      case 'declined':
      case 'cancelled':
        return {
          color: 'bg-status-error',
          textColor: 'text-status-error-light',
          bgColor: 'bg-status-error-bg',
          borderColor: 'border-status-error',
          icon: XCircle,
          label: status === 'declined' ? t('statusCard.status.declined') : t('statusCard.status.cancelled'),
          description: status === 'declined' ? t('statusCard.status.declinedDesc') : t('statusCard.status.cancelledDesc'),
          progress: 0
        }
      default:
        return {
          color: 'bg-ui-surface-tertiary',
          textColor: 'text-ui-text-disabled',
          bgColor: 'bg-ui-surface-tertiary',
          borderColor: 'border-ui-border-secondary',
          icon: AlertCircle,
          label: t('statusCard.status.unknown'),
          description: t('statusCard.status.unknownDesc'),
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
    toast.success(t('statusCard.messages.referencesCopied'))
  }

  return (
    <div className={`relative rounded-xl backdrop-blur-sm border transition-all duration-300 hover:scale-[1.02] ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
      
      {/* Status Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-ui-surface-tertiary rounded-t-xl overflow-hidden">
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
            <div className="text-xs vai-text-disabled">
              {formatDate(booking.tours?.tour_date)}
            </div>
            <div className="text-xs vai-text-secondary font-medium">
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
            <h3 className="text-ui-text-primary font-semibold truncate">
              {booking.active_tours_with_operators?.tour_name || booking.tours?.tour_name || t('statusCard.tourInfo.tourNotAvailable')}
            </h3>
            {booking.active_tours_with_operators?.template_name && booking.active_tours_with_operators?.tour_name !== booking.active_tours_with_operators?.template_name && (
              <div className="text-xs text-ui-text-tertiary">
                Part of: {booking.active_tours_with_operators.template_name}
              </div>
            )}
            {booking.schedule_id && (
              <div className="text-xs text-ui-text-tertiary flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Recurring Schedule
              </div>
            )}
            <div className="flex items-center gap-2 text-xs vai-text-disabled">
              <MapPin className="w-3 h-3" />
              <span>{booking.operators?.island || t('statusCard.tourInfo.locationTBD')}</span>
              <span>•</span>
              <span>{booking.operators?.company_name || t('statusCard.tourInfo.operator')}</span>
            </div>
          </div>
        </div>

        {/* Details Row */}
        <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
          <div className="text-center">
            <Users className="w-4 h-4 vai-text-disabled mx-auto mb-1" />
            <div className="vai-text-secondary font-medium">
              {booking.num_adults + (booking.num_children || 0)}
            </div>
            <div className="vai-text-disabled">{t('statusCard.details.participants')}</div>
          </div>
          
          <div className="text-center">
            <span className="vai-text-disabled text-lg font-mono">▼</span>
            <div className="vai-text-secondary font-medium">
              {formatPrice(booking.total_amount || booking.subtotal)}
            </div>
            <div className="vai-text-disabled">{t('statusCard.details.total')}</div>
          </div>
          
          <div className="text-center">
            <Copy className="w-4 h-4 vai-text-disabled mx-auto mb-1" />
            <button 
              onClick={copyBookingReference}
              className="vai-text-secondary font-medium hover:text-status-info-light transition-colors font-mono text-[10px]"
              title={t('ui.actions.clickToCopy')}
            >
              {booking.booking_reference?.slice(-6) || 'N/A'}
            </button>
            <div className="vai-text-disabled">{t('statusCard.details.reference')}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* More Details Button (Primary) */}
          <button
            onClick={() => onShowDetails?.(booking)}
            className="flex-1 vai-button-primary text-sm font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            <span>{t('statusCard.actions.moreDetails')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Quick Actions */}
          <div className="flex gap-2">
            {/* Contact Button */}
            {canContactOperator(booking) && (
              <button
                onClick={() => onContactOperator?.(booking)}
                className="vai-button-secondary p-2 rounded-lg transition-colors flex items-center justify-center"
                title={t('statusCard.actions.contactOperator')}
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
                className="vai-button-secondary p-2 rounded-lg transition-colors flex items-center justify-center"
                title={t('statusCard.actions.bookAgain')}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Support Button */}
            <button
              onClick={() => onGetSupport?.(booking)}
              className="bg-slate-600 hover:bg-slate-700 text-ui-text-primary p-2 rounded-lg transition-colors flex items-center justify-center"
              title={t('statusCard.actions.getSupport')}
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status-specific Additional Info */}
        {booking.booking_status === 'pending' && (
          <div className="mt-3 p-2 bg-status-caution-bg border border-status-caution rounded-lg">
            <p className="text-xs text-status-caution-light">
              {t('statusCard.messages.pendingInfo', { statusDesc: statusConfig.description })}
            </p>
          </div>
        )}

        {booking.booking_status === 'confirmed' && booking.tours?.meeting_point && (
          <div className="mt-3 p-2 bg-status-success-bg border border-status-success rounded-lg">
            <p className="text-xs text-status-success-light">
              {t('statusCard.messages.meetingPoint', { location: booking.tours.meeting_point })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StatusCard