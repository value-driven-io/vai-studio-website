// src/components/shared/TourDetailModal.jsx (CONVERTED TO i18n)
import React from 'react'
import { 
  Heart, Clock, Users, MapPin, Star, ArrowRight, Calendar,
  Shield, Coffee, Car, Globe, AlertTriangle, X, Cloud, Share2
} from 'lucide-react'
import { TOUR_TYPE_EMOJIS } from '../../constants/moods'
import { useTranslation } from 'react-i18next'
import { SinglePriceDisplay } from './PriceDisplay'
import { useCurrencyContext } from '../../hooks/useCurrency'
import toast from 'react-hot-toast'

const TourDetailModal = ({ 
  tour, 
  isOpen, 
  onClose, 
  onBookingClick, 
  onFavoriteToggle,
  isFavorite,
  formatPrice,
  formatDate,
  formatTime,
  calculateSavings,
  hideBookButton = false
}) => {
  // 🌍 translation hook
  const { t } = useTranslation()

  const { selectedCurrency, changeCurrency } = useCurrencyContext()
  
  if (!isOpen) return null

  const tourEmoji = TOUR_TYPE_EMOJIS[tour.tour_type] || '🌴'
  const savings = calculateSavings?.(tour.original_price_adult, tour.discount_price_adult)

  // Format languages with flags 
  const formatLanguages = (languages) => {
    if (!languages || !Array.isArray(languages)) return t('tourDetail.languages.tbd')
    const languageMap = {
      'English': '🇬🇧 English',
      'French': '🇫🇷 French', 
      'Tahitian': '🇵🇫 Tahitian',
      'German': '🇩🇪 German',
      'Spanish': '🇪🇸 Spanish',
      'Chinese': '🇨🇳 Chinese'
    }
    return languages.map(lang => languageMap[lang] || `🗣️ ${lang}`).join(', ')
  }

  // 🎯 HELPER: Format age requirements 
  const formatAgeRequirements = () => {
    if (tour.min_age && tour.max_age) {
      return t('tourDetail.age.ageRange', { min: tour.min_age, max: tour.max_age })
    } else if (tour.min_age) {
      return t('tourDetail.age.minimumAge', { min: tour.min_age })
    } else if (tour.max_age) {
      return t('tourDetail.age.maximumAge', { max: tour.max_age })
    }
    return t('tourDetail.age.suitableForAll')
  }

  // 🎯 HELPER: Format fitness level 
  const getFitnessDisplay = (level) => {
    const fitnessMap = {
      'easy': { label: t('tourDetail.fitness.easy'), color: 'text-status-success-light', icon: '😊' },
      'moderate': { label: t('tourDetail.fitness.moderate'), color: 'text-status-caution', icon: '🚶' },
      'challenging': { label: t('tourDetail.fitness.challenging'), color: 'text-status-warning', icon: '🏃' },
      'expert': { label: t('tourDetail.fitness.expert'), color: 'bg-status-error/20 text-status-error-light', icon: '🏔️' }
    }
    return fitnessMap[level] || { label: t('tourDetail.fitness.tbd'), color: 'text-ui-text-secondary', icon: '❓' }
  }

  const fitness = getFitnessDisplay(tour.fitness_level)

  // Safe booking click handler 
  const handleModalBookingClick = () => {
    if (onBookingClick && !hideBookButton) {
      onBookingClick(tour)
      onClose()
    }
  }

  // Tour/Acitivty Link Sharing
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/tour/${tour.id}`
    const shareData = {
      title: tour.tour_name,
      text: `Check out this amazing activity: ${tour.tour_name}`,
      url: shareUrl
    }

    // Detect if device is mobile/touch device
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)

    try {
      // On mobile: prefer native share, fallback to copy
      if (isMobile && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        // On desktop or mobile fallback: always copy to clipboard
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(shareUrl)
          toast.success(t('tourDetail.share.linkCopied', 'Activity link copied to clipboard!'))
        } else {
          // Fallback for insecure contexts
          const textArea = document.createElement('textarea')
          textArea.value = shareUrl
          textArea.style.position = 'fixed'
          textArea.style.left = '-999999px'
          textArea.style.top = '-999999px'
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          toast.success(t('tourDetail.share.linkCopied', 'Activity link copied to clipboard!'))
        }
      }
    } catch (error) {
      console.error('Error sharing:', error)
      // Always try clipboard copy as final fallback
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(shareUrl)
          toast.success(t('tourDetail.share.linkCopied', 'Activity link copied to clipboard!'))
        }
      } catch (clipboardError) {
        toast.error(t('tourDetail.share.shareFailed', 'Failed to share activity'))
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-ui-surface-secondary rounded-2xl max-w-4xl w-full border border-ui-border-primary my-4 mb-20 sm:my-8 sm:mb-8">
        
        {/* 🎨 ENHANCED HEADER with Trust Indicators  */}
        <div className="relative">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-ui-border-primary">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Large Emoji Container */}
              <div className="w-16 h-16 bg-gradient-to-br from-interactive-primary/20 to-mood-luxury/20 rounded-xl flex items-center justify-center border border-interactive-primary/20 flex-shrink-0">
                <span className="text-3xl">{tourEmoji}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-ui-text-primary leading-tight">{tour.tour_name}</h2>
                <p className="text-ui-text-secondary text-sm sm:text-base mt-1">
                  {tour.company_name} • 📍 {tour.location || tour.operator_island}
                </p>
                
                {/* Trust Indicators  */}
                <div className="flex items-center gap-4 mt-2 text-sm">
                  {tour.operator_average_rating && (
                    <div className="flex items-center gap-1 text-status-caution">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">{tour.operator_average_rating}</span>
                    </div>
                  )}
                  {tour.operator_total_tours_completed && (
                    <div className="text-ui-text-secondary">
                      {tour.operator_total_tours_completed} {t('tourDetail.details.toursCompleted')}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-ui-text-secondary">
                    <span className={`w-2 h-2 rounded-full ${fitness.color.includes('success') ? 'bg-status-success-light' : fitness.color.includes('caution') ? 'bg-status-caution' : fitness.color.includes('warning') ? 'bg-status-warning' : 'bg-ui-text-secondary'}`}></span>
                    <span className="text-xs">{fitness.label.split(' - ')[0]}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons  */}
            <div className="flex items-center gap-2 flex-shrink-0">

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-ui-surface-primary text-ui-text-secondary hover:bg-ui-surface-tertiary hover:text-interactive-primary-light transition-colors"
                title="Share this tour"
              >
                <Share2 className="w-5 h-5" />
              </button>

              {/* Favorite Button */}
              <button
                onClick={() => onFavoriteToggle?.(tour.id)}
                className={`p-2 rounded-full transition-all ${
                  isFavorite 
                    ? 'bg-status-error text-ui-text-primary' 
                    : 'bg-ui-surface-primary text-ui-text-secondary hover:bg-ui-surface-tertiary'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-ui-surface-primary text-ui-text-secondary hover:bg-ui-surface-tertiary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT - Mobile Responsive  */}
        <div className="flex flex-col lg:flex-row">
          {/* Main Content */}
          <div className="flex-1 p-4 sm:p-6 space-y-6">
            
            {/* KEY DETAILS CARDS - Always Show  */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <DetailCard icon={Calendar} label={t('tourDetail.details.dateTime')} highlight>
                <div className="font-semibold">{formatDate?.(tour.tour_date) || tour.tour_date}</div>
                <div className="text-ui-text-secondary">{formatTime?.(tour.time_slot) || tour.time_slot}</div>
              </DetailCard>
              
              <DetailCard icon={Users} label={t('tourDetail.details.availability')} highlight={tour.available_spots <= 2}>
                <div className="font-semibold">{tour.available_spots} {t('tourDetail.details.spotsLeft')}</div>
                <div className="text-ui-text-secondary">{t('tourDetail.details.ofMax', { max: tour.max_capacity })}</div>
              </DetailCard>
              
              <DetailCard icon={Clock} label={t('tourDetail.details.duration')}>
                <div className="font-semibold">{t('tourDetail.details.hoursExperience', { hours: tour.duration_hours || 3 })}</div>
                <div className="text-ui-text-secondary">{t('tourDetail.details.fullAdventure')}</div>
              </DetailCard>

              <DetailCard icon={MapPin} label={t('tourDetail.details.fitnessLevel')}>
                <div className={`font-semibold ${fitness.color}`}>
                  {fitness.icon} {fitness.label.split(' - ')[0]}
                </div>
                <div className="text-ui-text-secondary">{fitness.label.split(' - ')[1] || t('tourDetail.fitness.allLevels')}</div>
              </DetailCard>
            </div>

            {/* DESCRIPTION - Always Show */}
            <div>
              <h3 className="text-lg font-semibold text-ui-text-primary mb-3">{t('tourDetail.sections.aboutExperience')}</h3>
              <p className="text-ui-text-muted leading-relaxed">
                {tour.description || t('tourDetail.defaults.experienceDescription')}
              </p>
            </div>

            {/* 🎯 ENHANCED INCLUSIONS - Always Show Structure  */}
            <div>
              <h3 className="text-lg font-semibold text-ui-text-primary mb-3">{t('tourDetail.sections.whatsIncluded')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InclusionDetailItem 
                  included={tour.equipment_included}
                  title={t('tourDetail.inclusions.professionalEquipment')}
                  description={t('tourDetail.inclusions.equipmentDesc')}
                />
                <InclusionDetailItem 
                  included={tour.food_included}
                  title={t('tourDetail.inclusions.foodRefreshments')}
                  description={t('tourDetail.inclusions.foodDesc')}
                />
                <InclusionDetailItem 
                  included={tour.drinks_included}
                  title={t('tourDetail.inclusions.beverages')}
                  description={t('tourDetail.inclusions.beveragesDesc')}
                />
                <InclusionDetailItem 
                  included={tour.pickup_available}
                  title={t('tourDetail.inclusions.hotelTransfer')}
                  description={t('tourDetail.inclusions.transferDesc')}
                />
              </div>
              
              {/* Languages Section */}
              <div className="mt-4 p-3 bg-ui-surface-primary/30 rounded-lg">
                <div className="font-medium text-ui-text-muted mb-1">{t('tourDetail.languages.offered')}</div>
                <div className="text-sm text-ui-text-muted">{formatLanguages(tour.languages)}</div>
              </div>
            </div>

            {/* MEETING POINT - Always Show  */}
            <div>
              <h3 className="text-lg font-semibold text-ui-text-primary mb-3">{t('tourDetail.sections.meetingPoint')}</h3>
              <div className="bg-ui-surface-primary/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-interactive-primary-light mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-ui-text-primary font-medium">
                      {tour.meeting_point || t('tourDetail.meetingPoint.willBeConfirmed')}
                    </div>
                    <div className="text-ui-text-secondary text-sm mt-1">
                      {t('tourDetail.meetingPoint.detailsAfterBooking')}
                    </div>
                    
                    {/* 🎯 NEW: Pickup Locations - Show if available  */}
                    {tour.pickup_available && tour.pickup_locations && tour.pickup_locations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-ui-border-secondary">
                        <div className="text-sm font-medium text-ui-text-muted mb-1">{t('tourDetail.meetingPoint.pickupLocations')}</div>
                        <div className="text-sm text-ui-text-muted">
                          {tour.pickup_locations.join(' • ')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* AGE & REQUIREMENTS - Always Show Core, Conditional Details  */}
            <div>
              <h3 className="text-lg font-semibold text-ui-text-primary mb-3">{t('tourDetail.sections.ageRequirements')}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-ui-surface-primary/30 rounded-lg">
                  <Users className="w-5 h-5 text-interactive-primary-light" />
                  <div>
                    <div className="font-medium text-ui-text-primary">{formatAgeRequirements()}</div>
                    <div className="text-sm text-ui-text-secondary">{t('tourDetail.age.ageRequirements')}</div>
                  </div>
                </div>

                {/* Show additional requirements only if they exist  */}
                {(tour.requirements || tour.restrictions) && (
                  <div className="bg-status-warning/10 border border-status-warning/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-status-warning mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('tourDetail.requirements.importantRequirements')}</span>
                    </div>
                    <div className="space-y-1 text-sm text-ui-text-muted">
                      {tour.requirements && <div>• {tour.requirements}</div>}
                      {tour.restrictions && <div>• {tour.restrictions}</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Weather & Safety - Show if relevant  */}
            {(tour.weather_dependent || tour.whale_regulation_compliant || tour.backup_plan) && (
              <div>
                <h3 className="text-lg font-semibold text-ui-text-primary mb-3">{t('tourDetail.sections.weatherSafety')}</h3>
                <div className="space-y-3">
                  {tour.weather_dependent && (
                    <div className="flex items-start gap-3 p-3 bg-ui-surface-primary/30 rounded-lg">
                      <Cloud className="w-5 h-5 text-interactive-primary-light mt-0.5" />
                      <div>
                        <div className="font-medium text-ui-text-primary">{t('tourDetail.weather.weatherDependent')}</div>
                        <div className="text-sm text-ui-text-secondary">
                          {tour.backup_plan || t('tourDetail.weather.alternativeArrangements')}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {tour.whale_regulation_compliant && (
                    <div className="flex items-center gap-3 p-3 bg-status-success/10 border border-status-success/20 rounded-lg">
                      <Shield className="w-5 h-5 text-status-success-light" />
                      <div className="text-status-success-light">
                        <div className="font-medium">{t('tourDetail.weather.regulationCompliant')}</div>
                        <div className="text-sm opacity-80">{t('tourDetail.weather.certifiedMarine')}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Special Notes - Show only if exists */}
            {tour.special_notes && (
              <div>
                <h3 className="text-lg font-semibold text-ui-text-primary mb-3">{t('tourDetail.sections.specialNotes')}</h3>
                <div className="p-4 bg-interactive-primary/10 border border-interactive-primary/20 rounded-lg">
                  <p className="text-ui-text-muted text-sm leading-relaxed">{tour.special_notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* PRICING SIDEBAR - Mobile Bottom, Desktop Side */}
          <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-ui-border-primary p-4 sm:p-6">
            <div className="sticky top-6">
              <div className="bg-gradient-to-r from-ui-surface-primary/30 to-ui-surface-tertiary/20 border border-ui-border-secondary/50 rounded-xl p-4 space-y-4">
                
                {/* Main Pricing */}
                {/* Multi-currency price display with selector */}
                <SinglePriceDisplay
                  xpfAmount={tour.discount_price_adult}
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={changeCurrency}
                  showCurrencySelector={false}
                  size="large"
                  className="mb-4"
                />
                
                {savings && (
                  <div className="bg-status-success text-ui-text-primary text-sm px-3 py-1 rounded-full font-semibold mb-2">
                    {t('tourDetail.pricing.save')} {savings}%
                  </div>
                )}
                
                {/* Child Pricing Display */}
                {tour.discount_price_child && tour.discount_price_child !== tour.discount_price_adult && (
                  <div className="text-sm text-ui-text-muted mb-3">
                    {t('tourDetail.pricing.children')} {formatPrice?.(tour.discount_price_child) || `${tour.discount_price_child} XPF`}
                  </div>
                )}

                {/* Book Now Button  */}
                {!hideBookButton && (
                  <button
                    onClick={handleModalBookingClick}
                    className="w-full bg-gradient-to-r from-interactive-primary to-interactive-primary-light hover:from-interactive-primary-hover hover:to-interactive-primary
                             text-ui-text-primary py-4 px-6 rounded-lg font-semibold transition-all duration-200
                             flex items-center justify-center gap-2 shadow-lg"
                  >
                    {t('tourDetail.pricing.bookThisExperience')}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}

                {/* Quick Info  */}
                <div className="pt-4 border-t border-ui-border-secondary space-y-2 text-sm">
                  <div className="flex justify-between text-ui-text-muted">
                    <span>{t('tourDetail.trust.socialImpact')}</span>
                    <span className="text-status-success-light">✓</span>
                  </div>
                  <div className="flex justify-between text-ui-text-muted">
                    <span>{t('tourDetail.trust.authenticExperience')}</span>
                    <span className="text-status-success-light">✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Detail Card Component 
const DetailCard = ({ icon: Icon, label, children, highlight = false }) => (
  <div className={`p-3 rounded-lg border transition-colors ${
    highlight 
      ? 'bg-interactive-primary/10 border-interactive-primary/30' 
      : 'bg-ui-surface-primary/30 border-ui-border-secondary/50'
  }`}>
    <div className="flex items-center gap-2 mb-2">
      <Icon className={`w-4 h-4 ${highlight ? 'text-interactive-primary-light' : 'text-ui-text-secondary'}`} />
      <span className="text-xs font-medium text-ui-text-secondary uppercase tracking-wide">{label}</span>
    </div>
    <div className="text-sm">{children}</div>
  </div>
)

// Inclusion Detail Item Component
const InclusionDetailItem = ({ included, title, description }) => (
  <div className={`p-3 rounded-lg border ${
    included 
      ? 'bg-status-success/10 border-status-success/20 text-status-success-light' 
      : 'bg-ui-surface-primary/50 border-ui-border-secondary text-ui-text-disabled'
  }`}>
    <div className="flex items-center gap-2 mb-1">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
        included ? 'bg-status-success' : 'bg-ui-border-secondary'
      }`}>
        {included && <span className="text-ui-text-primary text-xs">✓</span>}
      </div>
      <span className="font-medium text-sm">{title}</span>
    </div>
    <p className="text-xs opacity-80">{description}</p>
  </div>
)

export default TourDetailModal