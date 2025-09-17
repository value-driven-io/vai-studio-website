import React, { useState } from 'react'
import { 
  Heart, Clock, Users, MapPin, Star, ArrowRight, Calendar,
  Zap, Shield, Coffee, Car, Globe, AlertTriangle, ChevronDown,
  ChevronUp, X, Cloud
} from 'lucide-react'
import { TOUR_TYPE_EMOJIS } from '../../constants/moods'
import TourDetailModalNew from './TourDetailModal'
import { useTranslation } from 'react-i18next'
import { TourCardPrice } from './PriceDisplay'
import { useCurrencyContext } from '../../hooks/useCurrency'

//  TourCard with progressive disclosure
const TourCard = ({ 
  tour, 
  isUrgent = false, 
  mode = 'compact', // 'compact', 'expanded', 'detailed'
  onBookingClick,
  onFavoriteToggle,
  isFavorite = false,
  formatPrice,
  formatDate,
  formatTime,
  calculateSavings,
  getUrgencyColor,
  hideBookButton = false, //  Hide book button for journey bookings
  className = ""
}) => {
  // 🌍 Add translation hook
  const { t } = useTranslation()

  const { selectedCurrency } = useCurrencyContext()
  
  // ALL ORIGINAL STATE PRESERVED:
  const [showFullScreen, setShowFullScreen] = useState(false)
  
  if (!tour) return null

  const tourEmoji = TOUR_TYPE_EMOJIS[tour.tour_type] || '🌴'
  const savings = calculateSavings?.(tour.original_price_adult, tour.discount_price_adult)
  const urgencyInfo = getUrgencyColor?.(tour.hours_until_deadline)
  
  // ALL ORIGINAL URGENCY LOGIC PRESERVED - Only strings translated:
  const getUrgencyLevel = () => {
    if (!tour.hours_until_deadline) return null
    const hours = tour.hours_until_deadline
    if (hours <= 2) return { level: 'critical', text: t('tourCard.urgency.bookingEndsSoon'), color: 'bg-status-error' }
    if (hours <= 4) return { level: 'high', text: t('tourCard.urgency.limitedTime'), color: 'bg-status-warning' }
    if (hours <= 8) return { level: 'medium', text: t('tourCard.urgency.bookToday'), color: 'bg-status-caution' }
    return null
  }

  const urgency = getUrgencyLevel()

  // ALL ORIGINAL HANDLERS PRESERVED:
  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    onFavoriteToggle?.(tour.id)
  }

  // Card click - route templates to template detail, others to modal
  const handleCardClick = () => {
    if (tour.is_template && tour.template_id && onBookingClick) {
      onBookingClick(tour)
    } else {
      setShowFullScreen(true)
    }
  }

  // Proper handleBookingClick function
  const handleBookingClick = (e) => {
    e.stopPropagation()
    if (onBookingClick && !hideBookButton) {
      onBookingClick(tour)
    }
  }

  return (
    <>
      {/* Main Card - ALL STYLING AND STRUCTURE PRESERVED */}
      <div 
        className={`bg-ui-surface-secondary rounded-xl border border-ui-border-primary hover:border-ui-border-secondary
            transition-all duration-300 overflow-hidden cursor-pointer tour-card ${className}`}
        onClick={handleCardClick}
      >
        {/* Compact View */}
        <div className="relative">
          {/* Urgency Banner - ALL LOGIC PRESERVED */}
          {urgency && (
            <div className={`absolute top-0 left-0 right-0 ${urgency.color} text-ui-text-primary 
                           text-xs font-medium py-1 px-3 flex items-center gap-1 z-10`}>
              <Zap className="w-3 h-3" />
              {urgency.text}
              {tour.hours_until_deadline && (
                <span className="ml-auto">
                  {tour.hours_until_deadline < 1 
                    ? `${Math.round(tour.hours_until_deadline * 60)}${t('tourCard.urgency.minutesLeft')}`
                    : `${Math.round(tour.hours_until_deadline)}${t('tourCard.urgency.hoursLeft')}`
                  }
                </span>
              )}
            </div>
          )}

          {/* Visual Header Section - ALL PRESERVED */}
          <div className={`relative bg-gradient-to-br from-interactive-primary/10 via-purple-600/5 to-ui-surface-secondary/20 ${urgency ? 'pt-8' : 'pt-4'} pb-4 px-4`}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Prominent Emoji Container */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-interactive-primary-light/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-interactive-primary-light/20">
                    <span className="text-2xl" role="img" aria-label={tour.tour_type}>
                      {tourEmoji}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-ui-text-primary truncate leading-tight">
                      {tour.tour_name}
                    </h3>
                    <p className="text-ui-text-secondary text-sm mt-0.5">
                      {tour.company_name} • 📍 {tour.location || tour.operator_island}
                    </p>
                  </div>
                </div>
              </div>

              {/* Favorite Button - ALL LOGIC PRESERVED */}
              <button
                onClick={handleFavoriteClick}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isFavorite
                    ? 'bg-status-error text-ui-text-primary hover:bg-status-error-light scale-110'
                    : 'bg-ui-surface-primary/80 text-ui-text-secondary hover:bg-ui-surface-tertiary hover:text-status-error-light'
                }`}
                aria-label={isFavorite ? t('tourCard.accessibility.removeFromFavorites') : t('tourCard.accessibility.addToFavorites')}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Card Content - ALL PRESERVED */}
          <div className="p-4 pt-0">
            {/* Key Info Row */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2 text-ui-text-muted">
                <Calendar className="w-4 h-4 text-ui-text-secondary" />
                <div>
                  <div className="font-medium">{formatDate?.(tour.tour_date) || tour.tour_date}</div>
                  <div className="text-xs text-ui-text-secondary">
                    {formatTime?.(tour.time_slot) || tour.time_slot}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-ui-text-muted">
                <Users className="w-4 h-4 text-ui-text-secondary" />
                <div>
                  <div className="font-medium">{tour.available_spots} {t('tourCard.capacity.spotsLeft')}</div>
                  <div className="text-xs text-ui-text-secondary">{t('tourCard.capacity.max')} {tour.max_capacity}</div>
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-gradient-to-r from-ui-surface-primary/30 to-ui-surface-tertiary/20 border border-ui-surface-primary rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {/* Original price display */}
                    {/*{tour.original_price_adult > tour.discount_price_adult && (
                      <span className="text-status-error-light line-through text-sm">
                        {formatPrice?.(tour.original_price_adult) || `${tour.original_price_adult} XPF`}
                      </span>
                    )}
                    {/* Multi-currency price display */}
                    <TourCardPrice
                      originalPrice={tour.original_price_adult}
                      discountPrice={tour.discount_price_adult}
                      selectedCurrency={selectedCurrency}
                      showCurrencySelector={false}
                    />
                  </div>
                  
                  <div className="text-xs text-ui-text-secondary mt-1">{t('tourCard.pricing.perAdult')}</div>
                </div>
                
                {savings && (
                  <div className="hidden sm:flex bg-status-success text-ui-text-primary text-sm px-3 py-1.5 rounded-full font-semibold text-center">
                    {t('tourCard.pricing.save')} {savings}%
                  </div>
                )}
              </div>
              
              {/* Quick Inclusions - ALL CONDITIONAL LOGIC PRESERVED */}
              <div className="flex gap-2 mt-3">
                {tour.equipment_included && (
                  <div className="flex items-center gap-1 text-xs text-interactive-primary-light bg-interactive-primary-light/10 px-2 py-1 rounded">
                    <Shield className="w-3 h-3" />
                    <span>{t('tourCard.inclusions.equipment')}</span>
                  </div>
                )}
                {tour.food_included && (
                  <div className="flex items-center gap-1 text-xs text-status-success-light bg-status-success/10 px-2 py-1 rounded">
                    <Coffee className="w-3 h-3" />
                    <span>{t('tourCard.inclusions.food')}</span>
                  </div>
                )}
                {tour.pickup_available && (
                  <div className="flex items-center gap-1 text-xs text-mood-culture bg-mood-culture/10 px-2 py-1 rounded">
                    <Car className="w-3 h-3" />
                    <span>{t('tourCard.inclusions.pickup')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 🎨 ENHANCED: Action Buttons - ALL CONDITIONAL LOGIC PRESERVED */}
            <div className="flex gap-2">
              {/* Conditional Book Button with Gradient */}
              {!hideBookButton && (
                <button
                  onClick={handleBookingClick}
                  className="flex-1 bg-gradient-to-br from-interactive-primary-light/20 to-purple-500/20
                              hover:from-interactive-primary/40 hover:to-purple-600/40
                              text-ui-text-primary py-3 px-4 rounded-lg font-semibold transition-all duration-200
                              flex items-center justify-center gap-2 shadow-lg shadow-ui-surface-tertiary/25 border border-ui-surface-primary"
                >
                  {t('tourCard.actions.bookNow')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (tour.is_template && tour.template_id && onBookingClick) {
                    onBookingClick(tour)
                  } else {
                    setShowFullScreen(true)
                  }
                }}
                className={`px-4 py-3 bg-ui-surface-tertiary/80 hover:bg-ui-surface-primary/80 text-ui-text-muted hover:text-ui-text-primary
                        rounded-lg transition-all duration-200 border border-mood-culture/30 flex items-center justify-center gap-2 ${
                          hideBookButton ? 'flex-1' : ''
                        }`}
                aria-label={t('tourCard.accessibility.viewDetails')}
              >
                {hideBookButton ? (
                  <>
                    <span>{t('tourCard.actions.details')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>{t('tourCard.actions.details')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        
      </div>

        {/* TourCardDetail MODAL - ALL PRESERVED */}
          {showFullScreen && (
            <TourDetailModalNew 
              tour={tour}
              isOpen={showFullScreen}
              onClose={() => setShowFullScreen(false)}
              onBookingClick={hideBookButton ? null : onBookingClick}
              onFavoriteToggle={onFavoriteToggle}
              isFavorite={isFavorite}
              formatPrice={formatPrice}
              formatDate={formatDate}
              formatTime={formatTime}
              calculateSavings={calculateSavings}
              hideBookButton={hideBookButton}
            />
          )}
    </>
  )
}

export default TourCard