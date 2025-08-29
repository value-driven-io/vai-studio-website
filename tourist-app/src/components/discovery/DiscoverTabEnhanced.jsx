// Enhanced DiscoverTab with Island-First Smart Discovery Flow
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import IslandSelector from './IslandSelector'
import MoodSelector from './MoodSelector'
import TourResults from './TourResults'

// Discovery steps enum
const DISCOVERY_STEPS = {
  ISLAND: 'island',
  MOOD: 'mood', 
  RESULTS: 'results'
}

const DiscoverTabEnhanced = () => {
  const { t } = useTranslation()
  
  // Flow state management
  const [step, setStep] = useState(DISCOVERY_STEPS.ISLAND)
  const [selectedIsland, setSelectedIsland] = useState(null)
  const [selectedMood, setSelectedMood] = useState(null)

  // Step transition handlers
  const handleIslandSelect = (island) => {
    setSelectedIsland(island)
    setStep(DISCOVERY_STEPS.MOOD)
  }

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood)
    setStep(DISCOVERY_STEPS.RESULTS)
  }

  // Navigation handlers
  const handleBackToIsland = () => {
    setStep(DISCOVERY_STEPS.ISLAND)
    setSelectedMood(null) // Clear mood when going back to island
  }

  const handleBackToMood = () => {
    setStep(DISCOVERY_STEPS.MOOD)
    // Keep island and mood selections
  }

  const handleChangeIsland = () => {
    setStep(DISCOVERY_STEPS.ISLAND)
    setSelectedMood(null) // Clear mood when changing island
  }

  const handleChangeMood = () => {
    setStep(DISCOVERY_STEPS.MOOD)
    // Keep island selection, allow new mood selection
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header - Always visible */}
      <div className="backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              {t('discovery.title')}
            </h1>
            <p className="text-slate-400">
              {t('discovery.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Step 1: Island Selection */}
        {step === DISCOVERY_STEPS.ISLAND && (
          <IslandSelector 
            onSelect={handleIslandSelect}
            selectedIsland={selectedIsland}
          />
        )}

        {/* Step 2: Mood Selection */}
        {step === DISCOVERY_STEPS.MOOD && selectedIsland && (
          <MoodSelector
            island={selectedIsland}
            onSelect={handleMoodSelect}
            onBack={handleBackToIsland}
            selectedMood={selectedMood}
          />
        )}

        {/* Step 3: Tour Results */}
        {step === DISCOVERY_STEPS.RESULTS && selectedIsland && selectedMood && (
          <TourResults
            island={selectedIsland}
            mood={selectedMood}
            onBack={handleBackToMood}
            onChangeIsland={handleChangeIsland}
            onChangeMood={handleChangeMood}
          />
        )}
      </div>
    </div>
  )
}

export default DiscoverTabEnhanced