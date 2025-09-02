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
        ? 'bg-green-500/10 border-green-500/30' 
        : 'bg-orange-500/10 border-orange-500/30'
    }`}>
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{tourEmoji}</span>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {t('nextTour.title', { default: 'Next Adventure' })}
            </h3>
            <div className={`text-sm font-medium ${
              isConfirmed ? 'text-green-400' : 'text-orange-400'
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
              ? 'bg-green-500/20 text-green-300 border-green-500/30' 
              : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
          }`}>
            <div className="text-sm font-medium">{getTimeUntilTour()}</div>
          </div>
        )}
      </div>

      {/* Tour Details */}
      <div className="space-y-4">
        <h4 className="text-xl font-bold text-white">
          {tour.tours?.tour_name || t('nextTour.tourName', { default: 'Your Tour' })}
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div>
              <div className="font-medium">
                {formatDate(tour.tours?.tour_date)}
              </div>
              <div className="text-slate-500">
                {formatTime(tour.tours?.time_slot)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="w-4 h-4 text-slate-400" />
            <div>
              <div className="font-medium">
                {tour.operators?.island || t('nextTour.location', { default: 'Location TBD' })}
              </div>
              <div className="text-slate-500">
                {tour.operators?.company_name || t('nextTour.operator', { default: 'Tour Operator' })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-slate-300">
            <Users className="w-4 h-4 text-slate-400" />
            <div>
              <div className="font-medium">
                {tour.num_adults + (tour.num_children || 0)} {t('nextTour.people', { default: 'people' })}
              </div>
              <div className="text-slate-500">
                {tour.num_adults} adults{tour.num_children > 0 && `, ${tour.num_children} children`}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-4 h-4 text-slate-400 text-center">💰</span>
            <div>
              <div className="font-medium">
                {formatPrice(tour.total_amount)}
              </div>
              <div className="text-slate-500">
                {t('nextTour.totalPaid', { default: 'Total paid' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Point (if confirmed) */}
      {isConfirmed && tour.tours?.meeting_point && (
        <div className="mt-4 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-400" />
            <div>
              <div className="text-sm font-medium text-green-300">
                {t('nextTour.meetingPoint', { default: 'Meeting Point' })}
              </div>
              <div className="text-sm text-slate-300">
                {tour.tours.meeting_point}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-xs text-slate-400">
          {t('nextTour.reference', { default: 'Reference' })}: {tour.booking_reference}
        </div>
        
        <button
          onClick={() => onContact(tour)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isConfirmed
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-orange-600 hover:bg-orange-700 text-white'
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