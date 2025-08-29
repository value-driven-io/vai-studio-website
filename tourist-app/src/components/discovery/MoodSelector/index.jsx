// Mood selector component - Step 2 of discovery flow
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ENHANCED_MOOD_CATEGORIES } from '../../../constants/enhancedMoods'
import { getIslandById } from '../../../constants/islands'
import { useTours } from '../../../hooks/useTours'
import DiscoveryService from '../../../services/discoveryService'
import MoodCard from './MoodCard'
import { ArrowLeft, Sparkles } from 'lucide-react'

const MoodSelector = ({ 
  island, 
  onSelect, 
  onBack,
  selectedMood = null 
}) => {
  const { t } = useTranslation()
  const { discoverTours = [] } = useTours()
  
  const islandData = getIslandById(island)

  // Generate preview data for each mood based on selected island
  const moodPreviews = useMemo(() => {
    const previews = {}
    
    ENHANCED_MOOD_CATEGORIES.forEach(mood => {
      const islandTours = island === 'all' 
        ? discoverTours 
        : discoverTours.filter(tour => tour.location === island)
      
      previews[mood.id] = DiscoveryService.getMoodPreviewData(islandTours, mood.id)
    })
    
    return previews
  }, [discoverTours, island])

  return (
    <div className="space-y-6">
      {/* Header with back navigation */}
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{t('common.back')}</span>
        </button>
        
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">{islandData?.emoji}</span>
            <h2 className="text-xl font-semibold text-white">
              {t(islandData?.nameKey || 'islands.all')}
            </h2>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Sparkles className="w-4 h-4" />
            <p>{t('discovery.moodQuestion')}</p>
          </div>
        </div>
      </div>

      {/* Mood Grid - Perfect 2x2 on mobile, 1x4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ENHANCED_MOOD_CATEGORIES.map((mood) => (
          <MoodCard
            key={mood.id}
            mood={mood}
            previewData={moodPreviews[mood.id]}
            isSelected={selectedMood === mood.id}
            onClick={(selectedMoodObj) => onSelect(selectedMoodObj.id)}
          />
        ))}
      </div>

      {/* Helper text */}
      <div className="text-center">
        <p className="text-xs text-slate-500">
          {t('discovery.moodSelectionHelp', 'Select your mood to see personalized activities')}
        </p>
      </div>
    </div>
  )
}

export default MoodSelector