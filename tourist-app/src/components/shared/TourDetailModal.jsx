// src/components/shared/TourDetailModal.jsx (CONVERTED TO i18n)
import React from 'react'
import { 
  Heart, Clock, Users, MapPin, Star, ArrowRight, Calendar,
  Shield, Coffee, Car, Globe, AlertTriangle, X, Cloud
} from 'lucide-react'
import { TOUR_TYPE_EMOJIS } from '../../constants/moods'
// 🌍 ONLY NEW ADDITION: Import useTranslation
import { useTranslation } from 'react-i18next'

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
  // 🌍 ONLY NEW ADDITION: Add translation hook
  const { t } = useTranslation()
  
  if (!isOpen) return null

  const tourEmoji = TOUR_TYPE_EMOJIS[tour.tour_type] || '🌴'
  const savings = calculateSavings?.(tour.original_price_adult, tour.discount_price_adult)

  // 🎯 HELPER: Format languages with flags 
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
      'easy': { label: t('tourDetail.fitness.easy'), color: 'bg-green-500/20 text-green-400', icon: '😊' },
      'moderate': { label: t('tourDetail.fitness.moderate'), color: 'bg-yellow-500/20 text-yellow-400', icon: '🚶' },
      'challenging': { label: t('tourDetail.fitness.challenging'), color: 'bg-orange-500/20 text-orange-400', icon: '🏃' },
      'expert': { label: t('tourDetail.fitness.expert'), color: 'bg-red-500/20 text-red-400', icon: '🏔️' }
    }
    return fitnessMap[level] || { label: t('tourDetail.fitness.tbd'), color: 'bg-slate-500/20 text-slate-400', icon: '❓' }
  }

  const fitness = getFitnessDisplay(tour.fitness_level)

  // Safe booking click handler 
  const handleModalBookingClick = () => {
    if (onBookingClick && !hideBookButton) {
      onBookingClick(tour)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-2xl max-w-4xl w-full border border-slate-700 my-4 mb-20 sm:my-8 sm:mb-8">
        
        {/* 🎨 ENHANCED HEADER with Trust Indicators  */}
        <div className="relative">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Large Emoji Container */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-blue-500/20 flex-shrink-0">
                <span className="text-3xl">{tourEmoji}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{tour.tour_name}</h2>
                <p className="text-slate-400 text-sm sm:text-base mt-1">
                  {tour.company_name} • 📍 {tour.operator_island}
                </p>
                
                {/* Trust Indicators  */}
                <div className="flex items-center gap-4 mt-2 text-sm">
                  {tour.operator_average_rating && (
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">{tour.operator_average_rating}</span>
                    </div>
                  )}
                  {tour.operator_total_tours_completed && (
                    <div className="text-slate-400">
                      {tour.operator_total_tours_completed} {t('tourDetail.details.toursCompleted')}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-slate-400">
                    <span className={`w-2 h-2 rounded-full ${fitness.color.includes('green') ? 'bg-green-400' : fitness.color.includes('yellow') ? 'bg-yellow-400' : fitness.color.includes('orange') ? 'bg-orange-400' : 'bg-slate-400'}`}></span>
                    <span className="text-xs">{fitness.label.split(' - ')[0]}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons  */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onFavoriteToggle?.(tour.id)}
                className={`p-2 rounded-full transition-all ${
                  isFavorite 
                    ? 'bg-red-500 text-white' 
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-700 text-slate-400 hover:bg-slate-600"
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
                <div className="text-slate-400">{formatTime?.(tour.time_slot) || tour.time_slot}</div>
              </DetailCard>
              
              <DetailCard icon={Users} label={t('tourDetail.details.availability')} highlight={tour.available_spots <= 2}>
                <div className="font-semibold">{tour.available_spots} {t('tourDetail.details.spotsLeft')}</div>
                <div className="text-slate-400">{t('tourDetail.details.ofMax', { max: tour.max_capacity })}</div>
              </DetailCard>
              
              <DetailCard icon={Clock} label={t('tourDetail.details.duration')}>
                <div className="font-semibold">{t('tourDetail.details.hoursExperience', { hours: tour.duration_hours || 3 })}</div>
                <div className="text-slate-400">{t('tourDetail.details.fullAdventure')}</div>
              </DetailCard>

              <DetailCard icon={MapPin} label={t('tourDetail.details.fitnessLevel')}>
                <div className={`font-semibold ${fitness.color}`}>
                  {fitness.icon} {fitness.label.split(' - ')[0]}
                </div>
                <div className="text-slate-400">{fitness.label.split(' - ')[1] || t('tourDetail.fitness.allLevels')}</div>
              </DetailCard>
            </div>

            {/* DESCRIPTION - Always Show */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">{t('tourDetail.sections.aboutExperience')}</h3>
              <p className="text-slate-300 leading-relaxed">
                {tour.description || t('tourDetail.defaults.experienceDescription')}
              </p>
            </div>

            {/* 🎯 ENHANCED INCLUSIONS - Always Show Structure  */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">{t('tourDetail.sections.whatsIncluded')}</h3>
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
              <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
                <div className="font-medium text-slate-200 mb-1">{t('tourDetail.languages.offered')}</div>
                <div className="text-sm text-slate-300">{formatLanguages(tour.languages)}</div>
              </div>
            </div>

            {/* MEETING POINT - Always Show  */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">{t('tourDetail.sections.meetingPoint')}</h3>
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-white font-medium">
                      {tour.meeting_point || t('tourDetail.meetingPoint.willBeConfirmed')}
                    </div>
                    <div className="text-slate-400 text-sm mt-1">
                      {t('tourDetail.meetingPoint.detailsAfterBooking')}
                    </div>
                    
                    {/* 🎯 NEW: Pickup Locations - Show if available  */}
                    {tour.pickup_available && tour.pickup_locations && tour.pickup_locations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-600">
                        <div className="text-sm font-medium text-slate-200 mb-1">{t('tourDetail.meetingPoint.pickupLocations')}</div>
                        <div className="text-sm text-slate-300">
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
              <h3 className="text-lg font-semibold text-white mb-3">{t('tourDetail.sections.ageRequirements')}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <Users className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="font-medium text-white">{formatAgeRequirements()}</div>
                    <div className="text-sm text-slate-400">{t('tourDetail.age.ageRequirements')}</div>
                  </div>
                </div>

                {/* Show additional requirements only if they exist  */}
                {(tour.requirements || tour.restrictions) && (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-orange-400 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('tourDetail.requirements.importantRequirements')}</span>
                    </div>
                    <div className="space-y-1 text-sm text-slate-300">
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
                <h3 className="text-lg font-semibold text-white mb-3">{t('tourDetail.sections.weatherSafety')}</h3>
                <div className="space-y-3">
                  {tour.weather_dependent && (
                    <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                      <Cloud className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-white">{t('tourDetail.weather.weatherDependent')}</div>
                        <div className="text-sm text-slate-400">
                          {tour.backup_plan || t('tourDetail.weather.alternativeArrangements')}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {tour.whale_regulation_compliant && (
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <Shield className="w-5 h-5 text-green-400" />
                      <div className="text-green-300">
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
                <h3 className="text-lg font-semibold text-white mb-3">{t('tourDetail.sections.specialNotes')}</h3>
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-slate-300 text-sm leading-relaxed">{tour.special_notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* PRICING SIDEBAR - Mobile Bottom, Desktop Side */}
          <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-700 p-4 sm:p-6">
            <div className="sticky top-6">
              <div className="bg-gradient-to-r from-slate-700/30 to-slate-600/20 border border-slate-600/50 rounded-xl p-4 space-y-4">
                
                {/* Main Pricing */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl font-bold text-white">
                      {formatPrice?.(tour.discount_price_adult) || `${tour.discount_price_adult} XPF`}
                    </div>
                    {savings && (
                      <div className="bg-green-500 text-white text-sm px-3 py-1 rounded-full font-semibold">
                        {t('tourDetail.pricing.save')} {savings}%
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-slate-400 mb-3">{t('tourDetail.pricing.perAdult')}</div>
                  
                  {/* Child Pricing Display */}
                  {tour.discount_price_child && tour.discount_price_child !== tour.discount_price_adult && (
                    <div className="text-sm text-slate-300">
                      {t('tourDetail.pricing.children')} {formatPrice?.(tour.discount_price_child) || `${tour.discount_price_child} XPF`}
                    </div>
                  )}

                  {tour.original_price_adult > tour.discount_price_adult && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-slate-400 line-through text-sm">
                        {formatPrice?.(tour.original_price_adult) || `${tour.original_price_adult} XPF`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Book Now Button  */}
                {!hideBookButton && (
                  <button
                    onClick={handleModalBookingClick}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
                             text-white py-4 px-6 rounded-lg font-semibold transition-all duration-200 
                             flex items-center justify-center gap-2 shadow-lg"
                  >
                    {t('tourDetail.pricing.bookThisExperience')}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}

                {/* Quick Info  */}
                <div className="pt-4 border-t border-slate-600 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>{t('tourDetail.trust.socialImpact')}</span>
                    <span className="text-green-400">✓</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>{t('tourDetail.trust.authenticExperience')}</span>
                    <span className="text-green-400">✓</span>
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
      ? 'bg-blue-500/10 border-blue-500/30' 
      : 'bg-slate-700/30 border-slate-600/50'
  }`}>
    <div className="flex items-center gap-2 mb-2">
      <Icon className={`w-4 h-4 ${highlight ? 'text-blue-400' : 'text-slate-400'}`} />
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
    </div>
    <div className="text-sm">{children}</div>
  </div>
)

// Inclusion Detail Item Component
const InclusionDetailItem = ({ included, title, description }) => (
  <div className={`p-3 rounded-lg border ${
    included 
      ? 'bg-green-500/10 border-green-500/20 text-green-400' 
      : 'bg-slate-700/50 border-slate-600 text-slate-500'
  }`}>
    <div className="flex items-center gap-2 mb-1">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
        included ? 'bg-green-500' : 'bg-slate-600'
      }`}>
        {included && <span className="text-white text-xs">✓</span>}
      </div>
      <span className="font-medium text-sm">{title}</span>
    </div>
    <p className="text-xs opacity-80">{description}</p>
  </div>
)

export default TourDetailModal