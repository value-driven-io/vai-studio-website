// Island selector component - Step 1 of discovery flow
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ISLANDS, getAvailableIslands } from '../../../constants/islands'
import { useTours } from '../../../hooks/useTours'
import IslandCard from './IslandCard'
import { MapPin } from 'lucide-react'

const IslandSelector = ({ onSelect, selectedIsland = null }) => {
  const { t } = useTranslation()
  const { discoverTours = [] } = useTours()

  // Get islands that have available tours
  const availableIslands = getAvailableIslands(discoverTours)

  // Count tours per island
  const getIslandTourCount = (islandId) => {
    if (islandId === 'all') {
      return discoverTours.length
    }
    return discoverTours.filter(tour => tour.location === islandId).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-2xl">
          <MapPin className="w-6 h-6 text-blue-400" />
          <h2 className="font-semibold text-white">
            {t('discovery.islandFirst')}
          </h2>
        </div>
        <p className="text-slate-400 max-w-md mx-auto">
          {t('discovery.chooseIsland')}
        </p>
      </div>

      {/* Island Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {availableIslands.map((island) => (
          <IslandCard
            key={island.id}
            island={island}
            tourCount={getIslandTourCount(island.id)}
            isSelected={selectedIsland === island.id}
            onClick={(selectedIslandObj) => onSelect(selectedIslandObj.id)}
          />
        ))}
      </div>

      {/* Helper text */}
      <div className="text-center">
        <p className="text-xs text-slate-500">
          {t('discovery.islandSelectionHelp', 'Select an island to see available activities')}
        </p>
      </div>
    </div>
  )
}

export default IslandSelector