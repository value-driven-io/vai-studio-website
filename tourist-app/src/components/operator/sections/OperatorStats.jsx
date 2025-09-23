// src/components/operator/sections/OperatorStats.jsx
import { useTranslation } from 'react-i18next'
import { BarChart3, Calendar, Users, Globe, MapPin } from 'lucide-react'

const OperatorStats = ({ operator, activityStats }) => {
  const { t } = useTranslation()

  const stats = []

  // Tours completed (only if > 0)
  if (operator.total_tours_completed > 0) {
    stats.push({
      icon: BarChart3,
      label: t('operatorProfile.stats.toursCompleted'),
      value: operator.total_tours_completed,
      description: t('operatorProfile.stats.toursCompletedDesc')
    })
  }

  // Activities offered
  if (activityStats?.totalActivities > 0) {
    stats.push({
      icon: Calendar,
      label: t('operatorProfile.stats.activitiesOffered'),
      value: activityStats.totalActivities,
      description: t('operatorProfile.stats.activitiesOfferedDesc')
    })
  }

  // Available spots
  if (activityStats?.totalAvailableSpots > 0) {
    stats.push({
      icon: Users,
      label: t('operatorProfile.stats.availableSpots'),
      value: activityStats.totalAvailableSpots,
      description: t('operatorProfile.stats.availableSpotsDesc')
    })
  }

  // Languages offered
  if (activityStats?.uniqueLanguages?.length > 0) {
    stats.push({
      icon: Globe,
      label: t('operatorProfile.stats.languages'),
      value: activityStats.uniqueLanguages.length,
      description: activityStats.uniqueLanguages.slice(0, 3).join(', ') +
        (activityStats.uniqueLanguages.length > 3 ? ` +${activityStats.uniqueLanguages.length - 3}` : '')
    })
  }

  // Locations served
  if (activityStats?.tourTypes?.length > 0) {
    stats.push({
      icon: MapPin,
      label: t('operatorProfile.stats.tourTypes'),
      value: activityStats.tourTypes.length,
      description: activityStats.tourTypes.slice(0, 2).join(', ') +
        (activityStats.tourTypes.length > 2 ? ` +${activityStats.tourTypes.length - 2}` : '')
    })
  }

  // Years active (only if meaningful)
  if (operator.created_at) {
    const yearsActive = new Date().getFullYear() - new Date(operator.created_at).getFullYear()
    if (yearsActive > 0) {
      stats.push({
        icon: BarChart3,
        label: t('operatorProfile.stats.yearsActive'),
        value: yearsActive,
        description: t('operatorProfile.stats.yearsActiveDesc')
      })
    }
  }

  // Don't show section if no meaningful stats
  if (stats.length === 0) {
    return null
  }

  return (
    <div className="bg-ui-surface-secondary/50 rounded-xl p-6 border border-ui-border-primary">
      <h2 className="text-lg font-semibold text-ui-text-primary mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        {t('operatorProfile.stats.title')}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon

          return (
            <div
              key={index}
              className="p-4 bg-ui-surface-primary/50 rounded-lg border border-ui-border-primary hover:border-interactive-primary/30 transition-all duration-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-interactive-primary/20 rounded">
                  <Icon className="w-3 h-3 text-interactive-primary" />
                </div>
                <span className="text-xs font-medium text-ui-text-secondary uppercase tracking-wide">
                  {stat.label}
                </span>
              </div>

              <div className="mb-1">
                <span className="text-xl font-bold text-ui-text-primary">
                  {stat.value}
                </span>
              </div>

              <p className="text-xs text-ui-text-secondary leading-relaxed">
                {stat.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* Price range info if available */}
      {activityStats?.priceRange && (
        <div className="mt-4 p-3 bg-ui-surface-primary/30 rounded-lg border border-ui-border-primary">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ui-text-secondary">
              {t('operatorProfile.stats.priceRange')}
            </span>
            <span className="font-medium text-ui-text-primary">
              {activityStats.priceRange.min.toLocaleString()} - {activityStats.priceRange.max.toLocaleString()} XPF
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default OperatorStats