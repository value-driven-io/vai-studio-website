// src/components/operator/sections/OperatorServices.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, Users, MapPin, Star, Globe, Badge, ChevronRight } from 'lucide-react'
import { TOUR_TYPE_EMOJIS } from '../../../constants/moods'
import { SinglePriceDisplay } from '../../shared/PriceDisplay'
import { useCurrencyContext } from '../../../hooks/useCurrency'

const OperatorServices = ({ operator, activities }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { selectedCurrency, changeCurrency } = useCurrencyContext()
  const [showAll, setShowAll] = useState(false)

  // Don't show if no activities
  if (!activities || activities.length === 0) {
    return null
  }

  // Sort activities by availability and name
  const sortedActivities = [...activities].sort((a, b) => {
    // Prioritize activities with availability
    const aHasAvailability = a.availability?.total_spots > 0
    const bHasAvailability = b.availability?.total_spots > 0

    if (aHasAvailability && !bHasAvailability) return -1
    if (!aHasAvailability && bHasAvailability) return 1

    // Then sort by name
    return a.tour_name.localeCompare(b.tour_name)
  })

  // Show first 3 activities by default, then expandable
  const displayedActivities = showAll ? sortedActivities : sortedActivities.slice(0, 3)
  const hasMore = sortedActivities.length > 3

  const handleActivityClick = (activity) => {
    // Navigate to the activity detail page
    if (activity.is_template) {
      navigate(`/template/${activity.id}`)
    } else {
      // For instances, navigate to instance detail or booking
      navigate(`/tour/${activity.id}`)
    }
  }

  // Helper function to get formatted languages
  const getFormattedLanguages = (languages) => {
    if (!languages || !Array.isArray(languages)) return []
    const languageMap = {
      'English': '🇬🇧 EN',
      'French': '🇫🇷 FR',
      'Tahitian': '🇵🇫 TY',
      'German': '🇩🇪 DE',
      'Spanish': '🇪🇸 ES',
      'Chinese': '🇨🇳 ZH',
      'Italian': '🇮🇹 IT',
      'Japanese': '🇯🇵 JA',
      'en': '🇬🇧 EN',
      'fr': '🇫🇷 FR',
      'de': '🇩🇪 DE',
      'es': '🇪🇸 ES',
      'zh': '🇨🇳 ZH',
      'ta': '🇵🇫 TY',
      'it': '🇮🇹 IT',
      'ja': '🇯🇵 JA',
      'ty': '🇵🇫 TY'
    }

    return [...new Set(languages.map(lang => languageMap[lang] || `🗣️ ${lang}`))]
  }

  return (
    <div className="bg-ui-surface-secondary/50 rounded-xl p-6 border border-ui-border-primary">
      <h2 className="text-lg font-semibold text-ui-text-primary mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        {t('operatorProfile.services.title')}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {displayedActivities.map((activity) => {
          const tourEmoji = TOUR_TYPE_EMOJIS[activity.tour_type] || '🌴'
          const hasAvailability = activity.availability?.total_spots > 0
          const languages = getFormattedLanguages(activity.languages)

          return (
            <div
              key={activity.id}
              onClick={() => handleActivityClick(activity)}
              className="bg-ui-surface-primary rounded-lg p-4 border border-ui-border-primary hover:border-interactive-primary/50 transition-all duration-200 cursor-pointer group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Activity Image/Emoji */}
                  <div className="w-12 h-12 bg-interactive-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {activity.template_cover_image ? (
                      <img
                        src={activity.template_cover_image}
                        alt={activity.tour_name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full flex items-center justify-center ${activity.template_cover_image ? 'hidden' : 'flex'}`}
                      style={{ display: activity.template_cover_image ? 'none' : 'flex' }}
                    >
                      <span className="text-xl" role="img" aria-label={activity.tour_type}>
                        {tourEmoji}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-ui-text-primary leading-tight group-hover:text-interactive-primary transition-colors">
                      {activity.tour_name}
                    </h3>
                    <p className="text-sm text-ui-text-secondary">
                      {activity.tour_type}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-ui-text-muted group-hover:text-interactive-primary transition-colors flex-shrink-0" />
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                {/* Duration */}
                {activity.duration_hours && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-ui-text-muted" />
                    <span className="text-ui-text-secondary">
                      {activity.duration_hours}h
                    </span>
                  </div>
                )}

                {/* Location */}
                {activity.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-ui-text-muted" />
                    <span className="text-ui-text-secondary">
                      {activity.location}
                    </span>
                  </div>
                )}

                {/* Languages */}
                {languages.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-ui-text-muted" />
                    <span className="text-ui-text-secondary">
                      {languages.slice(0, 2).join(' ')}
                      {languages.length > 2 && ` +${languages.length - 2}`}
                    </span>
                  </div>
                )}

                {/* Special features */}
                {activity.whale_regulation_compliant && (
                  <div className="flex items-center gap-1">
                    <Badge className="w-3 h-3 text-status-success" />
                    <span className="text-status-success text-xs">
                      {t('operatorProfile.services.whaleCertified')}
                    </span>
                  </div>
                )}
              </div>

              {/* Availability & Pricing */}
              <div className="flex items-center justify-between pt-3 border-t border-ui-border-primary">
                <div className="flex items-center gap-2">
                  {hasAvailability ? (
                    <>
                      <Users className="w-3 h-3 text-status-success" />
                      <span className="text-xs text-status-success">
                        {t('operatorProfile.services.availableSpots', { count: activity.availability.total_spots })}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-ui-text-muted">
                      {activity.is_template ?
                        t('operatorProfile.services.checkAvailability') :
                        t('operatorProfile.services.soldOut')
                      }
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <SinglePriceDisplay
                    xpfAmount={activity.discount_price_adult || activity.original_price_adult || 0}
                    label=""
                    selectedCurrency={selectedCurrency}
                    onCurrencyChange={changeCurrency}
                    showCurrencySelector={false}
                    size="small"
                    className="justify-end"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Show More/Less Button */}
      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 px-4 py-2 text-interactive-primary hover:text-interactive-primary-hover hover:bg-interactive-primary/10 rounded-lg transition-colors"
          >
            {showAll ? (
              <>
                {t('operatorProfile.services.showLess')}
                <ChevronRight className="w-4 h-4 rotate-90" />
              </>
            ) : (
              <>
                {t('operatorProfile.services.showMore', { count: sortedActivities.length - 3 })}
                <ChevronRight className="w-4 h-4 -rotate-90" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default OperatorServices