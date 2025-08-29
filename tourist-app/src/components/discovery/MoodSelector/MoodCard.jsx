// Enhanced mood card with smart preview data
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Clock, Zap } from 'lucide-react'

const MoodCard = ({ 
  mood, 
  previewData = {}, 
  isSelected = false, 
  onClick 
}) => {
  const { t } = useTranslation()
  const IconComponent = mood.icon

  const {
    tourCount = 0,
    durationRange = '',
    priceRange = '',
    highlights = [],
    urgentCount = 0
  } = previewData

  return (
    <button
      onClick={() => onClick(mood)}
      className={`w-full p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
        isSelected 
          ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/25'
          : 'border-slate-700 bg-slate-800 hover:border-slate-600 hover:bg-slate-700'
      }`}
    >
      <div className="space-y-3">
        {/* Mood Header */}
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${mood.colors.bg}`}>
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <div className={`font-semibold mb-1 ${
              isSelected ? 'text-blue-300' : 'text-white'
            }`}>
              {t(mood.titleKey)}
            </div>
            <div className="text-xs text-slate-400 leading-tight">
              {t(mood.subtitleKey)}
            </div>
          </div>
        </div>

        {/* Smart Preview Data */}
        {tourCount > 0 && (
          <div className="space-y-2">
            {/* Duration and price indicators */}
            <div className="flex items-center justify-between text-xs">
              {durationRange && (
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3" />
                  {durationRange}
                </span>
              )}
              {priceRange && (
                <span className="text-slate-400">
                  {priceRange}
                </span>
              )}
            </div>

            {/* Highlights */}
            {highlights.length > 0 && (
              <div className="space-y-1">
                {highlights.slice(0, 2).map((highlight, index) => (
                  <div key={index} className="text-xs text-slate-300 truncate">
                    {highlight}
                  </div>
                ))}
              </div>
            )}

            {/* Tour count and urgency */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-700">
              <span className="text-xs font-medium text-slate-300">
                {tourCount} {tourCount === 1 ? t('discovery.tours') : t('discovery.toursPlural')}
              </span>
              {urgentCount > 0 && (
                <span className="flex items-center gap-1 text-xs text-orange-400 font-medium">
                  <Zap className="w-3 h-3" />
                  {urgentCount} {t('discovery.urgent').toLowerCase()}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {tourCount === 0 && (
          <div className="text-xs text-slate-500 text-center py-2">
            {t('discovery.noToursForMood', 'No tours available')}
          </div>
        )}
      </div>
    </button>
  )
}

export default MoodCard