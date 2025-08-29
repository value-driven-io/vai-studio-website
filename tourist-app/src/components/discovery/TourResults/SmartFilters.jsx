// Smart filter pills - contextual to selected mood
import React from 'react'
import { useTranslation } from 'react-i18next'
import { getFiltersForMood } from '../../../constants/smartFilters'

const SmartFilters = ({ 
  moodId, 
  activeFilters = [], 
  onFilterToggle 
}) => {
  const { t } = useTranslation()
  const availableFilters = getFiltersForMood(moodId)

  if (!availableFilters.length) {
    return null
  }

  const toggleFilter = (filterId) => {
    const isActive = activeFilters.includes(filterId)
    if (isActive) {
      onFilterToggle(activeFilters.filter(id => id !== filterId))
    } else {
      onFilterToggle([...activeFilters, filterId])
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-slate-300">
          {t('discovery.personalize')}
        </h3>
        {activeFilters.length > 0 && (
          <button
            onClick={() => onFilterToggle([])}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            {t('common.clear')}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {availableFilters.map((filter) => {
          const IconComponent = filter.icon
          const isActive = activeFilters.includes(filter.id)
          
          return (
            <button
              key={filter.id}
              onClick={() => toggleFilter(filter.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium 
                       transition-all duration-200 ${
                isActive
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span>{t(filter.labelKey)}</span>
              {isActive && (
                <span className="text-xs bg-white/20 px-1 rounded">✓</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Active filter descriptions */}
      {activeFilters.length > 0 && (
        <div className="text-xs text-slate-400">
          {activeFilters.map(filterId => {
            const filter = availableFilters.find(f => f.id === filterId)
            return filter?.description
          }).filter(Boolean).join(' • ')}
        </div>
      )}
    </div>
  )
}

export default SmartFilters