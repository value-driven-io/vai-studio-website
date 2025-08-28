// src/components/journey/BookingSection.jsx
import React from 'react'
import { 
  Calendar, Clock, MapPin, Users, Star, Phone, MessageCircle,
  Copy, ExternalLink, RotateCcw, AlertCircle, CheckCircle, XCircle,
  Timer, Award
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TOUR_TYPE_EMOJIS } from '../../constants/moods'
import toast from 'react-hot-toast'

const BookingSection = ({ 
  title,
  bookings,
  filteredBookings,
  emptyMessage,
  emptyIcon: EmptyIcon,
  handleContactOperator,
  handleRebook,
  copyBookingReference,
  handleGetSupport,
  canContactOperator,
  canRebook,
  formatPrice,
  formatDate,
  formatTime,
  getBookingStatusColor,
  getBookingStatusIcon
}) => {
  const { t } = useTranslation()
  const displayBookings = filteredBookings || bookings

  if (displayBookings.length === 0) {
    return (
      <div className="text-center py-12">
        <EmptyIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-400 mb-2">{emptyMessage}</h3>
        <p className="text-slate-500">
          {title === t('journey.sections.activeBookings') && t('journey.emptyStates.activePending')}
          {title === t('journey.sections.upcomingAdventures') && t('journey.emptyStates.upcomingConfirmed')}
          {title === t('journey.sections.pastExperiences') && t('journey.emptyStates.pastCompleted')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {displayBookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          handleContactOperator={handleContactOperator}
          handleRebook={handleRebook}
          copyBookingReference={copyBookingReference}
          handleGetSupport={handleGetSupport}
          canContactOperator={canContactOperator}
          canRebook={canRebook}
          formatPrice={formatPrice}
          formatDate={formatDate}
          formatTime={formatTime}
          getBookingStatusColor={getBookingStatusColor}
          getBookingStatusIcon={getBookingStatusIcon}
        />
      ))}
    </div>
  )
}

// Individual Booking Card Component
const BookingCard = ({ 
  booking,
  handleContactOperator,
  handleRebook,
  copyBookingReference,
  handleGetSupport,
  canContactOperator,
  canRebook,
  formatPrice,
  formatDate,
  formatTime,
  getBookingStatusColor,
  getBookingStatusIcon
}) => {
  const tourEmoji = TOUR_TYPE_EMOJIS[booking.tours?.tour_type] || '🌴'
  const statusColor = getBookingStatusColor(booking.booking_status)
  const statusIcon = getBookingStatusIcon(booking.booking_status)

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{tourEmoji}</span>
            <h3 className="text-lg font-semibold text-white">
              {booking.tours?.tour_name || t('journey.tourInfo.tourExperience')}
            </h3>
          </div>
          
          <div className="text-slate-400 text-sm">
            {t('journey.tourInfo.withOperator', { operator: booking.operators?.company_name || t('journey.tourInfo.tourOperator') })}
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <span 
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColor}`}
            >
              <span>{statusIcon}</span>
              {booking.booking_status?.charAt(0).toUpperCase() + booking.booking_status?.slice(1)}
            </span>
          </div>
        </div>

        {/* Booking Reference */}
        <div className="text-right">
          <div className="text-xs text-slate-400 mb-1">Booking Reference</div>
          <button
            onClick={() => copyBookingReference(booking.booking_reference)}
            className="flex items-center gap-1 text-sm text-slate-300 hover:text-white transition-colors"
          >
            <span className="font-mono">{booking.booking_reference}</span>
            <Copy className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Tour Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-2 text-slate-300">
          <Calendar className="w-4 h-4 text-slate-400" />
          <div>
            <div className="text-sm font-medium">
              {formatDate(booking.tours?.tour_date)}
            </div>
            <div className="text-xs text-slate-400">
              {formatTime(booking.tours?.time_slot)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <MapPin className="w-4 h-4 text-slate-400" />
          <div>
            <div className="text-sm font-medium">
              {booking.tours?.meeting_point || 'TBD'}
            </div>
            <div className="text-xs text-slate-400">Meeting Point</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <Users className="w-4 h-4 text-slate-400" />
          <div>
            <div className="text-sm font-medium">
              {booking.num_adults} adult{booking.num_adults !== 1 ? 's' : ''}
              {booking.num_children > 0 && `, ${booking.num_children} child${booking.num_children !== 1 ? 'ren' : ''}`}
            </div>
            <div className="text-xs text-slate-400">Participants</div>
          </div>
        </div>
      </div>

      {/* Special Requirements */}
      {(booking.special_requirements || booking.dietary_restrictions || booking.accessibility_needs) && (
        <div className="mb-6 p-3 bg-slate-700/50 rounded-lg">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Special Requirements</h4>
          <div className="space-y-1 text-xs text-slate-400">
            {booking.special_requirements && (
              <div>• {booking.special_requirements}</div>
            )}
            {booking.dietary_restrictions && (
              <div>• Dietary: {booking.dietary_restrictions}</div>
            )}
            {booking.accessibility_needs && (
              <div>• Accessibility: {booking.accessibility_needs}</div>
            )}
          </div>
        </div>
      )}

      {/* Operator Response */}
      {booking.operator_response && (
        <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h4 className="text-sm font-medium text-blue-400 mb-2">Operator Message</h4>
          <p className="text-sm text-slate-300">{booking.operator_response}</p>
        </div>
      )}

      {/* Decline Reason */}
      {booking.decline_reason && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <h4 className="text-sm font-medium text-red-400 mb-2">Decline Reason</h4>
          <p className="text-sm text-slate-300">{booking.decline_reason}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        {/* Pricing */}
        <div className="text-right">
          <div className="text-lg font-bold text-white">
            {formatPrice(booking.total_amount)}
          </div>
          <div className="text-xs text-slate-400">
            Total paid
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Contact Operator */}
          {canContactOperator(booking) && (
            <button
              onClick={() => handleContactOperator(booking)}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
            >
              {booking.operators?.whatsapp_number ? (
                <MessageCircle className="w-4 h-4" />
              ) : (
                <Phone className="w-4 h-4" />
              )}
              Contact
            </button>
          )}

          {/* Rebook */}
          {canRebook(booking) && (
            <button
              onClick={() => handleRebook(booking)}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Rebook
            </button>
          )}

          {/* Get Support */}
          <button
            onClick={() => handleGetSupport(booking)}
            className="flex items-center gap-1 px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Support
          </button>
        </div>
      </div>

      {/* Confirmation Deadline Warning */}
      {booking.booking_status === 'pending' && booking.confirmation_deadline && (
        <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-orange-400" />
            <div className="text-sm">
              <span className="text-orange-400 font-medium">
                Waiting for confirmation from the operator.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingSection