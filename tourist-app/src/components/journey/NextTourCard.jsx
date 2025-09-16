// NextTourCard.jsx - Card showing next upcoming tour with clear actions
import { Calendar, Clock, MapPin, Users, MessageCircle, Phone, ChevronRight } from 'lucide-react'
import { TOUR_TYPE_EMOJIS } from '../../constants/moods'

const NextTourCard = ({ 
  tour, 
  formatDate, 
  formatTime, 
  formatPrice, 
  onContact, 
  t 
}) => {
  const tourEmoji = TOUR_TYPE_EMOJIS[tour.tours?.tour_type] || '🌴'
  const isConfirmed = tour.booking_status === 'confirmed'
  
  // Calculate time until tour
  const getTimeUntilTour = () => {
    if (!tour.tours?.tour_date) return null
    
    const tourDate = new Date(tour.tours.tour_date)
    const now = new Date()
    const diffMs = tourDate - now
    
    if (diffMs <= 0) return t('nextTour.startingSoon', { default: 'Starting soon!' })
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) {
      return t('nextTour.daysUntil', { days, hours, default: '{{days}}d {{hours}}h until adventure' })
    }
    return t('nextTour.hoursUntil', { hours, default: '{{hours}}h until adventure' })
  }

  return (
    <div className={`rounded-xl p-6 border transition-all ${
      isConfirmed 
        ? 'bg-status-success-bg border-status-success'
        : 'bg-status-warning-bg border-status-warning'
    }`}>
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{tourEmoji}</span>
          <div>
            <h3 className="text-lg font-semibold text-ui-text-primary">
              {t('nextTour.title', { default: 'Next Adventure' })}
            </h3>
            <div className={`text-sm font-medium ${
              isConfirmed ? 'text-status-success-light' : 'text-status-warning-light'
            }`}>
              {isConfirmed 
                ? t('nextTour.confirmed', { default: '✅ Confirmed & Ready' })
                : t('nextTour.pending', { default: '⏳ Awaiting Confirmation' })
              }
            </div>
          </div>
        </div>
        
        {/* Countdown */}
        {getTimeUntilTour() && (
          <div className={`text-right px-3 py-1.5 rounded-full border ${
            isConfirmed 
              ? 'bg-status-success-bg text-status-success border-status-success'
              : 'bg-status-warning-bg text-status-warning border-status-warning'
          }`}>
            <div className="text-sm font-medium">{getTimeUntilTour()}</div>
          </div>
        )}
      </div>

      {/* Tour Details */}
      <div className="space-y-4">
        <h4 className="text-xl font-bold text-ui-text-primary">
          {tour.tours?.tour_name || t('nextTour.tourName', { default: 'Your Tour' })}
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2 text-ui-text-secondary">
            <Calendar className="w-4 h-4 vai-text-disabled" />
            <div>
              <div className="font-medium">
                {formatDate(tour.tours?.tour_date)}
              </div>
              <div className="vai-text-disabled">
                {formatTime(tour.tours?.time_slot)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-ui-text-secondary">
            <MapPin className="w-4 h-4 vai-text-disabled" />
            <div>
              <div className="font-medium">
                {tour.operators?.island || t('nextTour.location', { default: 'Location TBD' })}
              </div>
              <div className="vai-text-disabled">
                {tour.operators?.company_name || t('nextTour.operator', { default: 'Tour Operator' })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-ui-text-secondary">
            <Users className="w-4 h-4 vai-text-disabled" />
            <div>
              <div className="font-medium">
                {tour.num_adults + (tour.num_children || 0)} {t('nextTour.people', { default: 'people' })}
              </div>
              <div className="vai-text-disabled">
                {tour.num_adults} adults{tour.num_children > 0 && `, ${tour.num_children} children`}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-ui-text-secondary">
            <span className="w-4 h-4 vai-text-disabled text-center">💰</span>
            <div>
              <div className="font-medium">
                {formatPrice(tour.total_amount)}
              </div>
              <div className="vai-text-disabled">
                {t('nextTour.totalPaid', { default: 'Total paid' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Point (if confirmed) */}
      {isConfirmed && tour.tours?.meeting_point && (
        <div className="mt-4 p-3 bg-status-success-bg border border-status-success rounded-lg">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-status-success-light" />
            <div>
              <div className="text-sm font-medium text-status-success">
                {t('nextTour.meetingPoint', { default: 'Meeting Point' })}
              </div>
              <div className="text-sm text-ui-text-secondary">
                {tour.tours.meeting_point}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-xs vai-text-disabled">
          {t('nextTour.reference', { default: 'Reference' })}: {tour.booking_reference}
        </div>
        
        <button
          onClick={() => onContact(tour)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isConfirmed
              ? 'vai-button-success'
              : 'vai-button-warning'
          }`}
        >
          {tour.operators?.whatsapp_number ? (
            <MessageCircle className="w-4 h-4" />
          ) : (
            <Phone className="w-4 h-4" />
          )}
          <span>
            {isConfirmed 
              ? t('nextTour.chat', { default: 'Chat with Operator' })
              : t('nextTour.followUp', { default: 'Follow Up' })
            }
          </span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

export default NextTourCard