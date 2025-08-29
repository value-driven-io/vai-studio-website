// Individual island card component
import React from 'react'
import { useTranslation } from 'react-i18next'

const IslandCard = ({ 
  island, 
  tourCount = 0, 
  isSelected = false, 
  onClick 
}) => {
  const { t } = useTranslation()

  return (
    <button
      onClick={() => onClick(island)}
      className={`w-full p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
        isSelected 
          ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/25'
          : 'border-slate-700 bg-slate-800 hover:border-slate-600 hover:bg-slate-700'
      }`}
    >
      <div className="text-center space-y-2">
        {/* Island emoji */}
        <div className="text-3xl mb-2" role="img" aria-label={t(island.nameKey)}>
          {island.emoji}
        </div>
        
        {/* Island name */}
        <div className={`font-semibold ${
          isSelected ? 'text-blue-300' : 'text-white'
        }`}>
          {t(island.nameKey)}
        </div>
        
        {/* Tour count */}
        {island.id !== 'all' && (
          <div className="text-xs text-slate-400">
            {tourCount > 0 
              ? `${tourCount} ${tourCount === 1 ? t('discovery.tours') : t('discovery.toursPlural')}`
              : t('discovery.noToursAvailable', 'No tours available')
            }
          </div>
        )}
        
        {/* Special badge for "All Islands" */}
        {island.id === 'all' && (
          <div className="text-xs text-blue-400 font-medium">
            {t('discovery.seeAllOptions', 'See all options')}
          </div>
        )}
      </div>
    </button>
  )
}

export default IslandCard