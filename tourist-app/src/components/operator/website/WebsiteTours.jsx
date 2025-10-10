// src/components/operator/website/WebsiteTours.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Clock, Users, MapPin, Globe, Badge } from 'lucide-react'
import { TOUR_TYPE_EMOJIS } from '../../../constants/moods'
import { SinglePriceDisplay } from '../../shared/PriceDisplay'
import { useCurrencyContext } from '../../../hooks/useCurrency'

// Gradient presets for tour cards (cycling through different gradients)
const GRADIENT_PRESETS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
]

const WebsiteTours = ({ operator, activities }) => {
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
    const aHasAvailability = a.availability?.total_spots > 0
    const bHasAvailability = b.availability?.total_spots > 0

    if (aHasAvailability && !bHasAvailability) return -1
    if (!aHasAvailability && bHasAvailability) return 1

    return a.tour_name.localeCompare(b.tour_name)
  })

  // Show first 6 activities by default
  const displayedActivities = showAll ? sortedActivities : sortedActivities.slice(0, 6)
  const hasMore = sortedActivities.length > 6

  const handleBookNow = (activity) => {
    // Navigate to the booking page for this activity
    if (activity.is_template) {
      navigate(`/template/${activity.id}`)
    } else {
      navigate(`/tour/${activity.id}`)
    }
  }

  // Helper function to get formatted languages with flag emojis
  const getFormattedLanguages = (languages) => {
    if (!languages || !Array.isArray(languages)) return []
    const languageMap = {
      'English': '🇬🇧', 'French': '🇫🇷', 'Tahitian': '🇵🇫',
      'German': '🇩🇪', 'Spanish': '🇪🇸', 'Chinese': '🇨🇳',
      'Italian': '🇮🇹', 'Japanese': '🇯🇵',
      'en': '🇬🇧', 'fr': '🇫🇷', 'de': '🇩🇪', 'es': '🇪🇸',
      'zh': '🇨🇳', 'ta': '🇵🇫', 'it': '🇮🇹', 'ja': '🇯🇵', 'ty': '🇵🇫'
    }
    return [...new Set(languages.map(lang => languageMap[lang] || '🗣️'))]
  }

  // Get badge text for special features
  const getBadgeText = (activity) => {
    if (activity.whale_regulation_compliant) {
      return `🐋 ${t('operatorProfile.website.whaleCertified')}`
    }
    if (activity.is_featured) {
      return `🏆 ${t('operatorProfile.website.mostPopular')}`
    }
    if (activity.availability?.total_spots > 0 && activity.availability.total_spots <= 5) {
      return `⚡ ${t('operatorProfile.website.limitedSpots')}`
    }
    return null
  }

  return (
    <section id="tours" className="py-16 sm:py-20 bg-ui-surface-primary">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ui-text-primary mb-4" style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>
            {t('operatorProfile.website.ourTours')}
          </h2>
          <p className="text-lg sm:text-xl text-ui-text-secondary">
            {t('operatorProfile.website.bookInstantly')}
          </p>
        </div>

        {/* Tours Grid - Optimized for desktop symmetry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8">
          {displayedActivities.map((activity, index) => {
            const tourEmoji = TOUR_TYPE_EMOJIS[activity.tour_type] || '🌴'
            const hasAvailability = activity.availability?.total_spots > 0
            const languages = getFormattedLanguages(activity.languages)
            const gradient = GRADIENT_PRESETS[index % GRADIENT_PRESETS.length]
            const badge = getBadgeText(activity)

            return (
              <div
                key={activity.id}
                className="bg-ui-surface-secondary rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-ui-border-primary"
              >
                {/* Gradient Header with Image/Emoji */}
                <div
                  className="h-48 relative flex items-center justify-center"
                  style={{ background: gradient }}
                >
                  {/* Badge */}
                  {badge && (
                    <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                      {badge}
                    </span>
                  )}

                  {/* Tour Image or Emoji */}
                  {activity.template_cover_image ? (
                    <img
                      src={activity.template_cover_image}
                      alt={activity.tour_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full flex items-center justify-center text-7xl ${activity.template_cover_image ? 'hidden' : 'flex'}`}
                    style={{ display: activity.template_cover_image ? 'none' : 'flex' }}
                  >
                    <span role="img" aria-label={activity.tour_type}>
                      {tourEmoji}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-ui-text-primary mb-2 leading-tight">
                    {activity.tour_name}
                  </h3>

                  {/* Description */}
                  <p className="text-ui-text-secondary mb-4 line-clamp-3">
                    {activity.description || t('operatorProfile.website.noDescription')}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    {activity.duration_hours && (
                      <span className="flex items-center gap-1 text-sm text-ui-text-secondary">
                        <Clock className="w-4 h-4" />
                        {activity.duration_hours}h
                      </span>
                    )}
                    {activity.max_participants && (
                      <span className="flex items-center gap-1 text-sm text-ui-text-secondary">
                        <Users className="w-4 h-4" />
                        {t('operatorProfile.website.maxPeople', { count: activity.max_participants })}
                      </span>
                    )}
                    {activity.location && (
                      <span className="flex items-center gap-1 text-sm text-ui-text-secondary">
                        <MapPin className="w-4 h-4" />
                        {activity.location}
                      </span>
                    )}
                  </div>

                  {/* Languages */}
                  {languages.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="w-4 h-4 text-ui-text-muted" />
                      <span className="text-base text-ui-text-secondary">
                        {languages.join(' ')}
                      </span>
                    </div>
                  )}

                  {/* Footer: Price & Book Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-ui-border-primary">
                    <div>
                      <span className="text-xs text-ui-text-muted uppercase tracking-wide">
                        {t('operatorProfile.website.from')}
                      </span>
                      <div className="text-2xl font-bold text-interactive-primary">
                        <SinglePriceDisplay
                          xpfAmount={activity.discount_price_adult || activity.original_price_adult || 0}
                          label=""
                          selectedCurrency={selectedCurrency}
                          onCurrencyChange={changeCurrency}
                          showCurrencySelector={false}
                          size="medium"
                          className="justify-start"
                        />
                      </div>
                      <span className="text-xs text-ui-text-muted">
                        {t('operatorProfile.website.perPerson')}
                      </span>
                    </div>

                    <button
                      onClick={() => handleBookNow(activity)}
                      className="bg-interactive-primary hover:bg-interactive-primary-hover text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105"
                    >
                      {t('operatorProfile.website.bookNow')}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Show More Button */}
        {hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-8 py-3 bg-ui-surface-secondary hover:bg-ui-surface-tertiary text-ui-text-primary border-2 border-ui-border-primary rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
            >
              {showAll
                ? t('operatorProfile.services.showLess')
                : t('operatorProfile.website.showMoreTours', { count: sortedActivities.length - 6 })
              }
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default WebsiteTours
