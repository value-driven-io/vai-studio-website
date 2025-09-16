// Clean DiscoverTab - 3 Step Flow: Location → Mood → Personalize
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, MapPin, Heart, Filter, Sparkles, Mountain, HeartHandshake, Waves, Palette } from 'lucide-react'
import { useTours } from '../../hooks/useTours'
import { useAppStore } from '../../stores/bookingStore'
import TourCard from '../shared/TourCard'
import BookingModal from '../booking/BookingModal'
import toast from 'react-hot-toast'

// Simple step enum
const STEPS = {
  LOCATION: 'location',
  MOOD: 'mood', 
  PERSONALIZE: 'personalize',
  RESULTS: 'results'
}

const DiscoverTab = () => {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(STEPS.LOCATION)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [selectedMood, setSelectedMood] = useState(null)
  const [filters, setFilters] = useState({
    duration: 'any',
    difficulty: 'any', 
    budget: 'any'
  })
  
  // Tour data and modals
  const [selectedTour, setSelectedTour] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  
  // Hooks
  const { 
    discoverTours = [], 
    loading, 
    formatPrice, 
    formatDate, 
    formatTime,
    getUrgencyColor,
    calculateSavings 
  } = useTours()
  
  const { favorites, toggleFavorite, setActiveTab } = useAppStore()

  // Filter tours based on selections
  const filteredTours = useMemo(() => {
    if (!selectedLocation || !selectedMood) return []
    
    
    let filtered = discoverTours.filter(tour => {
      // Location filter - check both location and operator_island fields
      const tourLocation = tour.location || tour.operator_island
      if (tourLocation !== selectedLocation.id) return false
      
      // Mood filter (basic mapping to tour types)
      const moodToTypes = {
        ocean: ['Diving', 'Snorkeling', 'Whale Watching', 'Lagoon Tour'],
        adventure: ['Adrenalin', 'Hike', 'Hiking', 'Diving'],
        relax: ['Mindfulness', 'Lagoon Tour', 'Cultural', 'Relax'],
        culture: ['Cultural', 'Culinary Experience']
      }
      
      const allowedTypes = moodToTypes[selectedMood.id] || []
      if (!allowedTypes.includes(tour.tour_type)) return false
      
      return true
    })

    // Apply additional filters
    if (filters.duration !== 'any') {
      filtered = filtered.filter(tour => {
        const hours = tour.duration_hours || 0
        switch (filters.duration) {
          case 'short': return hours >= 2 && hours <= 4
          case 'medium': return hours > 4 && hours <= 8
          case 'long': return hours > 8
          default: return true
        }
      })
    }

    if (filters.difficulty !== 'any') {
      filtered = filtered.filter(tour => tour.fitness_level === filters.difficulty)
    }

    if (filters.budget !== 'any') {
      filtered = filtered.filter(tour => {
        const price = tour.discount_price_adult || 0
        switch (filters.budget) {
          case 'budget': return price < 10000
          case 'mid': return price >= 10000 && price <= 25000
          case 'luxury': return price > 25000
          default: return true
        }
      })
    }

    return filtered
  }, [discoverTours, selectedLocation, selectedMood, filters])

  // Reset flow
  const resetFlow = () => {
    setCurrentStep(STEPS.LOCATION)
    setSelectedLocation(null)
    setSelectedMood(null)
    setFilters({ duration: 'any', difficulty: 'any', budget: 'any' })
  }

  // Step navigation with smooth transitions
  const goToMood = (location) => {
    setSelectedLocation(location)
    // Brief animation delay before step transition
    setTimeout(() => {
      setCurrentStep(STEPS.MOOD)
    }, 150)
  }

  const goToPersonalize = (mood) => {
    setSelectedMood(mood)
    // Brief animation delay before step transition
    setTimeout(() => {
      setCurrentStep(STEPS.PERSONALIZE)
    }, 150)
  }

  const showResults = () => {
    // Brief animation delay before step transition
    setTimeout(() => {
      setCurrentStep(STEPS.RESULTS)
    }, 150)
  }

  const goBack = () => {
    if (currentStep === STEPS.MOOD) {
      setCurrentStep(STEPS.LOCATION)
    } else if (currentStep === STEPS.PERSONALIZE) {
      setCurrentStep(STEPS.MOOD)
    } else if (currentStep === STEPS.RESULTS) {
      setCurrentStep(STEPS.PERSONALIZE)
    }
  }

  // Tour interaction handlers
  const handleBookTour = (tour) => {
    setSelectedTour(tour)
    setShowBookingModal(true)
  }

  const handleCloseBookingModal = () => {
    setShowBookingModal(false)
    setSelectedTour(null)
  }

  const handleFavoriteToggle = (tourId) => {
    toggleFavorite(tourId)
    const isFavorite = favorites.includes(tourId)
    toast.success(
      isFavorite ? t('toastNotifications.favoriteRemoved') : t('toastNotifications.favoriteAdded'),
      { duration: 2000 }
    )
  }

  return (
    <div className="min-h-0 mobile:min-h-0 bg-ui-surface-overlay">
      {/* Header with progress */}
      <div className="border-b border-ui-border-primary">
        <div className="max-w-4xl mx-auto px-4 py-4 xs:py-6">
          {/* Back button - always reserve space to prevent layout jump */}
          <div className="mb-4" style={{ minHeight: '2rem' }}>
            {currentStep !== STEPS.LOCATION && (
              <button
                onClick={goBack}
                className="flex items-center gap-2 text-ui-text-secondary hover:text-ui-text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('common.back')}</span>
              </button>
            )}
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-4">
            <StepIndicator
              step={1}
              label={t('discovery.steps.location')}
              icon={MapPin}
              isActive={currentStep === STEPS.LOCATION}
              isCompleted={selectedLocation !== null}
              onClick={() => setCurrentStep(STEPS.LOCATION)}
              clickable={true}
            />
            <div className="flex-1 h-0.5 bg-ui-border-primary mx-1 xs:mx-2 mobile:mx-4">
              <div
                className={`h-full bg-interactive-primary-light transition-all duration-300 ${
                  selectedLocation ? 'w-full' : 'w-0'
                }`}
              />
            </div>
            <StepIndicator
              step={2}
              label={t('discovery.steps.mood')}
              icon={Heart}
              isActive={currentStep === STEPS.MOOD}
              isCompleted={selectedMood !== null}
              onClick={() => selectedLocation && setCurrentStep(STEPS.MOOD)}
              clickable={selectedLocation !== null}
            />
            <div className="flex-1 h-0.5 bg-ui-border-primary mx-1 xs:mx-2 mobile:mx-4">
              <div
                className={`h-full bg-interactive-primary-light transition-all duration-300 ${
                  selectedMood ? 'w-full' : 'w-0'
                }`}
              />
            </div>
            <StepIndicator
              step={3}
              label={t('discovery.steps.personalize')}
              icon={Filter}
              isActive={currentStep === STEPS.PERSONALIZE}
              isCompleted={false}
              onClick={() => selectedLocation && selectedMood && setCurrentStep(STEPS.PERSONALIZE)}
              clickable={selectedLocation !== null && selectedMood !== null}
            />
          </div>

          {/* Current step title */}
          <div className="text-center">
            <h1 className="text-mobile-xl xs:text-mobile-2xl mobile:text-mobile-3xl font-bold text-ui-text-primary">
              {currentStep === STEPS.LOCATION && t('discovery.chooseIsland')}
              {currentStep === STEPS.MOOD && t('discovery.moodQuestion')}
              {currentStep === STEPS.PERSONALIZE && t('discovery.personalizeExperience')}
              {currentStep === STEPS.RESULTS && t('discovery.yourPerfectActivity')}
            </h1>
            <p className="text-ui-text-secondary mt-1 text-mobile-sm xs:text-mobile-base px-2 leading-mobile-relaxed">
              {currentStep === STEPS.LOCATION && t('discovery.selectIslandDescription')}
              {currentStep === STEPS.MOOD && t('discovery.pickTypeDescription')}
              {currentStep === STEPS.PERSONALIZE && t('discovery.addFiltersDescription')}
              {currentStep === STEPS.RESULTS && t('discovery.foundActivitiesDescription', { count: filteredTours.length })}
            </p>
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-4xl mx-auto px-0 md:px-8 py-6 sm:py-8">
        {currentStep === STEPS.LOCATION && (
          <LocationStep onSelect={goToMood} selectedLocation={selectedLocation} />
        )}
        
        {currentStep === STEPS.MOOD && (
          <MoodStep onSelect={goToPersonalize} selectedLocation={selectedLocation} selectedMood={selectedMood} />
        )}
        
        {currentStep === STEPS.PERSONALIZE && (
          <PersonalizeStep
            selectedLocation={selectedLocation}
            selectedMood={selectedMood}
            filters={filters}
            onFiltersChange={setFilters}
            onShowResults={showResults}
            onReset={resetFlow}
          />
        )}
        
        {currentStep === STEPS.RESULTS && (
          <ResultsStep
            tours={filteredTours}
            selectedLocation={selectedLocation}
            selectedMood={selectedMood}
            filters={filters}
            loading={loading}
            onBookTour={handleBookTour}
            onFavoriteToggle={handleFavoriteToggle}
            favorites={favorites}
            formatPrice={formatPrice}
            formatDate={formatDate}
            formatTime={formatTime}
            calculateSavings={calculateSavings}
            getUrgencyColor={getUrgencyColor}
            onReset={resetFlow}
            setActiveTab={setActiveTab}
          />
        )}
      </div>

      {/* Booking Modal */}
      {selectedTour && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={handleCloseBookingModal}
          tour={selectedTour}
          formatPrice={formatPrice}
          formatDate={formatDate}
          formatTime={formatTime}
        />
      )}
    </div>
  )
}

// Step indicator component  
const StepIndicator = ({ step, label, isActive, isCompleted, onClick, clickable }) => (
  <button
    onClick={clickable ? onClick : undefined}
    disabled={!clickable}
    className={`flex items-center gap-2 transition-all duration-200 ${
      clickable ? 'hover:scale-105 cursor-pointer' : 'cursor-default'
    } ${clickable ? 'hover:opacity-80' : ''}`}
  >
    <div className={`w-6 h-6 xs:w-8 xs:h-8 rounded-full flex items-center justify-center text-xs xs:text-sm font-medium transition-all duration-200 ${
      isCompleted
        ? 'bg-status-success text-ui-text-primary shadow-lg shadow-green-600/25'
        : isActive
        ? 'bg-interactive-primary text-ui-text-primary shadow-lg shadow-blue-600/25'
        : clickable
        ? 'bg-ui-surface-tertiary text-ui-text-muted hover:bg-ui-surface-secondary'
        : 'bg-ui-surface-primary text-ui-text-secondary'
    }`}>
      {isCompleted ? '✓' : step}
    </div>
    <span className={`hidden sm:inline text-mobile-xs xs:text-mobile-sm font-medium transition-colors ${
      isActive ? 'text-ui-text-primary' : isCompleted ? 'text-status-success-light' : clickable ? 'text-ui-text-muted' : 'text-ui-text-secondary'
    }`}>
      {label}
    </span>
  </button>
)

// Step 1: Location selection
const LocationStep = ({ onSelect, selectedLocation }) => {
  const { t } = useTranslation()
  const [showAllIslands, setShowAllIslands] = useState(false)
  
  const allIslands = [
    { id: 'Tahiti', name: t('islands.tahiti'), emoji: '🤙', description: t('islands.descriptions.tahiti'), featured: true },
    { id: 'Bora Bora', name: t('islands.boraBora'), emoji: '🏖️', description: t('islands.descriptions.boraBora'), featured: true },
    { id: 'Moorea', name: t('islands.moorea'), emoji: '🌺', description: t('islands.descriptions.moorea'), featured: true },
    { id: 'Huahine', name: t('islands.huahine'), emoji: '🌸', description: t('islands.descriptions.huahine'), featured: true },
    { id: 'Raiatea', name: t('islands.raiatea'), emoji: '⛵', description: t('islands.descriptions.raiatea'), featured: false },
    { id: 'Taha\'a', name: t('islands.tahaa'), emoji: '🥥', description: t('islands.descriptions.tahaa'), featured: false },
    { id: 'Maupiti', name: t('islands.maupiti'), emoji: '⛰️', description: t('islands.descriptions.maupiti'), featured: false },
    { id: 'Tikehau', name: t('islands.tikehau'), emoji: '🐚', description: t('islands.descriptions.tikehau'), featured: false },
    { id: 'Rangiroa', name: t('islands.rangiroa'), emoji: '🌊', description: t('islands.descriptions.rangiroa'), featured: false },
    { id: 'Fakarava', name: t('islands.fakarava'), emoji: '🦈', description: t('islands.descriptions.fakarava'), featured: false },
    { id: 'Nuku Hiva', name: t('islands.nukuHiva'), emoji: '🐴', description: t('islands.descriptions.nukuHiva'), featured: false },
    { id: 'Other', name: t('islands.other'), emoji: '🏝️', description: t('islands.descriptions.other'), featured: false },
  ]
  
  const featuredIslands = allIslands.filter(island => island.featured)
  const otherIslands = allIslands.filter(island => !island.featured)
  const displayedIslands = showAllIslands ? allIslands : featuredIslands

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 auto-rows-fr">
        {displayedIslands.map((island) => (
          <IslandCard
            key={island.id}
            island={island}
            onClick={() => onSelect(island)}
            isSelected={selectedLocation?.id === island.id}
          />
        ))}
      </div>
      
      {!showAllIslands && (
        <div className="text-center">
          <button
            onClick={() => setShowAllIslands(true)}
            className="px-6 py-3 bg-ui-surface-primary hover:bg-ui-surface-secondary text-ui-text-primary rounded-lg
                     transition-all duration-200 flex items-center gap-2 mx-auto"
          >
            <span>{t('discovery.moreIslands')}</span>
            <span className="text-ui-text-secondary">({otherIslands.length})</span>
          </button>
        </div>
      )}
    </div>
  )
}

// Reusable Island Card Component
const IslandCard = ({ island, onClick, isSelected = false }) => (
  <button
    onClick={() => onClick(island)}
    className={`group relative p-4 xs:p-6 rounded-mobile xs:rounded-mobile-xl border-2 text-left transition-touch transform min-h-48 flex flex-col justify-between h-full ${
      isSelected 
        ? 'border-interactive-focus bg-interactive-primary/20 shadow-lg shadow-blue-500/25'
        : 'border-ui-border-primary bg-ui-surface-secondary active:scale-95 active:bg-ui-surface-primary'
    }`}
  >
    <div className="flex-1 flex flex-col justify-center">
      <div className="flex items-center justify-center gap-2 xs:gap-3 mb-2 xs:mb-3">
        <span className="text-2xl xs:text-3xl transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
          {island.emoji}
        </span>
      </div>
      <h3 className={`text-mobile-base xs:text-mobile-lg font-semibold transition-colors duration-200 text-center hyphens-none overflow-wrap-anywhere leading-snug mb-2 xs:mb-3 ${
        isSelected ? 'text-interactive-primary-light' : 'text-ui-text-primary group-hover:text-interactive-primary-light'
      }`}>
        {island.name}
      </h3>
    </div>
    <p className="text-ui-text-secondary text-mobile-xs xs:text-mobile-sm leading-mobile-relaxed text-center mt-auto">{island.description}</p>
    
    {/* Subtle glow effect - only show on hover when not selected */}
    <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none ${
      isSelected 
        ? 'bg-interactive-primary/10 opacity-100'
        : 'bg-interactive-primary/5 opacity-0'
    }`} />
  </button>
)

// Reusable Mood Card Component  
const MoodCard = ({ mood, onClick, isSelected = false }) => {
  const IconComponent = mood.icon
  
  return (
    <button
      onClick={() => onClick(mood)}
      className={`group relative p-4 xs:p-6 rounded-mobile xs:rounded-mobile-xl border-2 text-left transition-touch transform min-h-48 flex flex-col justify-between h-full ${
        isSelected 
          ? 'border-mood-culture bg-mood-culture/20 shadow-lg shadow-purple-500/25'
          : 'border-ui-border-primary bg-ui-surface-secondary active:scale-95 active:bg-ui-surface-primary'
      }`}
    >
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-center gap-2 xs:gap-3 mb-2 xs:mb-3">
          <div className="transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
            <IconComponent className={`w-6 h-6 xs:w-8 xs:h-8 ${
              isSelected ? 'text-mood-culture-light' : 'text-ui-text-muted group-hover:text-mood-culture-light'
            }`} />
          </div>
        </div>
        <h3 className={`text-mobile-base xs:text-mobile-lg font-semibold transition-colors duration-200 text-center hyphens-none overflow-wrap-anywhere leading-snug mb-2 xs:mb-3 ${
          isSelected ? 'text-mood-culture-light' : 'text-ui-text-primary group-hover:text-mood-culture-light'
        }`}>
          {mood.name}
        </h3>
      </div>
      <p className="text-ui-text-secondary text-mobile-xs xs:text-mobile-sm leading-mobile-relaxed text-center mt-auto">{mood.description}</p>
      
      {/* Subtle glow effect - only show on hover when not selected */}
      <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none ${
        isSelected 
          ? 'bg-mood-culture/10 opacity-100'
          : 'bg-mood-culture/5 opacity-0'
      }`} />
    </button>
  )
}

// Step 2: Mood selection
const MoodStep = ({ onSelect, selectedLocation, selectedMood }) => {
  const { t } = useTranslation()
  const moods = [
    { id: 'ocean', name: t('moods.ocean.title'), icon: Waves, description: t('moods.ocean.description') },
    { id: 'adventure', name: t('moods.adventure.title'), icon: Mountain, description: t('moods.adventure.description') },
    { id: 'relax', name: t('moods.relax.title'), icon: HeartHandshake, description: t('moods.relax.description') },
    { id: 'culture', name: t('moods.culture.title'), icon: Palette, description: t('moods.culture.description') },
  ]

  return (
    <div className="space-y-6">
      {/* Selected location reminder */}
      <div className="text-center p-3 xs:p-4 bg-ui-surface-secondary rounded-lg border border-ui-border-primary">
        <p className="text-ui-text-muted text-xs xs:text-sm">
          {t('discovery.exploring')} <span className="text-interactive-primary-light">{selectedLocation?.emoji} {selectedLocation?.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 auto-rows-fr">
        {moods.map((mood) => (
          <MoodCard
            key={mood.id}
            mood={mood}
            onClick={onSelect}
            isSelected={selectedMood?.id === mood.id}
          />
        ))}
      </div>
    </div>
  )
}

// Step 3: Personalization filters
const PersonalizeStep = ({
  selectedLocation,
  selectedMood,
  filters,
  onFiltersChange,
  onShowResults,
  onReset
}) => {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      {/* Selection summary */}
      <div className="p-6 bg-ui-surface-secondary rounded-xl border border-ui-border-primary">
        <h3 className="font-semibold text-ui-text-primary mb-4">{t('discovery.yourSelection')}:</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-interactive-primary rounded-full text-sm">
            <span>{selectedLocation?.emoji}</span>
            <span>{selectedLocation?.name}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-mood-culture rounded-full text-sm">
            {selectedMood?.icon && <selectedMood.icon className="w-4 h-4" />}
            <span>{selectedMood?.name}</span>
          </div>
        </div>
      </div>

      {/* Filter options */}
      <div className="grid grid-cols-1 mobile:grid-cols-2 md:grid-cols-3 gap-4 mobile:gap-6">
        {/* Duration filter */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-ui-text-primary">{t('explore.filterLabels.duration')}</label>
          <select 
            value={filters.duration} 
            onChange={(e) => onFiltersChange({...filters, duration: e.target.value})}
            className="w-full p-3 bg-ui-surface-secondary border border-ui-border-primary rounded-lg text-ui-text-primary focus:ring-2 focus:border-interactive-focus focus:border-transparent"
          >
            <option value="any">{t('explore.filterOptions.anyDuration')}</option>
            <option value="short">{t('discovery.filters.halfDay')}</option>
            <option value="medium">{t('discovery.filters.fullDay')}</option>
            <option value="long">{t('discovery.filters.multiDay')}</option>
          </select>
        </div>

        {/* Difficulty filter */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-ui-text-primary">{t('discovery.filters.difficultyLabel')}</label>
          <select 
            value={filters.difficulty} 
            onChange={(e) => onFiltersChange({...filters, difficulty: e.target.value})}
            className="w-full p-3 bg-ui-surface-secondary border border-ui-border-primary rounded-lg text-ui-text-primary focus:ring-2 focus:border-interactive-focus focus:border-transparent"
          >
            <option value="any">{t('discovery.filters.anyLevel')}</option>
            <option value="easy">{t('tourDetail.fitness.easy')}</option>
            <option value="moderate">{t('tourDetail.fitness.moderate')}</option>
            <option value="challenging">{t('tourDetail.fitness.challenging')}</option>
          </select>
        </div>

        {/* Budget filter */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-ui-text-primary">{t('discovery.budget')}</label>
          <select 
            value={filters.budget} 
            onChange={(e) => onFiltersChange({...filters, budget: e.target.value})}
            className="w-full p-3 bg-ui-surface-secondary border border-ui-border-primary rounded-lg text-ui-text-primary focus:ring-2 focus:border-interactive-focus focus:border-transparent"
          >
            <option value="any">{t('discovery.filters.anyBudget')}</option>
            <option value="budget">{t('discovery.filters.budgetFriendly')}</option>
            <option value="mid">{t('discovery.filters.midRange')}</option>
            <option value="luxury">{t('discovery.filters.luxury')}</option>
          </select>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col mobile:flex-row gap-3 mobile:gap-4 justify-center pt-6">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-ui-surface-primary hover:bg-ui-surface-secondary text-ui-text-primary rounded-mobile-lg transition-touch min-h-48 w-full mobile:w-auto"
        >
          {t('discovery.startOver')}
        </button>
        <button
          onClick={onShowResults}
          className="px-6 mobile:px-8 py-3 bg-interactive-primary hover:bg-interactive-primary-hover text-ui-text-primary rounded-mobile-lg font-medium transition-touch flex items-center justify-center gap-2 min-h-48 w-full mobile:w-auto"
        >
          <Sparkles className="w-5 h-5" />
          <span className="truncate">{t('discovery.findActivities')}</span>
        </button>
      </div>
    </div>
  )
}

// Step 4: Results showing filtered tours
const ResultsStep = ({
  tours,
  selectedLocation,
  selectedMood,
  filters,
  loading,
  onBookTour,
  onFavoriteToggle,
  favorites,
  formatPrice,
  formatDate,
  formatTime,
  calculateSavings,
  getUrgencyColor,
  onReset,
  setActiveTab
}) => {
  const { t } = useTranslation()
  const activeFilterCount = Object.values(filters).filter(v => v !== 'any').length

  if (loading) {
    return <div className="text-center py-12">
      <div className="animate-spin w-8 h-8 border-4 border-interactive-primary border-t-transparent rounded-full mx-auto"></div>
      <p className="text-ui-text-secondary mt-4">{t('discovery.loadingActivities')}</p>
    </div>
  }

  if (tours.length === 0) {
    return (
      <div className="text-center py-12 bg-ui-surface-secondary/50 rounded-xl border border-ui-border-primary">
        <div className="w-16 h-16 bg-ui-surface-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🌴</span>
        </div>
        <h3 className="text-lg font-semibold text-ui-text-muted mb-2">
          {t('discovery.noActivitiesFound')}
        </h3>
        <p className="text-ui-text-disabled mb-6 max-w-md mx-auto">
          {t('discovery.tryAdjustingFilters')}
        </p>
        <button
          onClick={onReset}
          className="bg-interactive-primary hover:bg-interactive-primary-hover text-ui-text-primary px-6 py-3 rounded-lg transition-colors mb-4"
        >
          {t('discovery.startOver')}
        </button>
        
        {/* Explore hint */}
        <div className="text-center pt-4 border-t border-ui-border-primary">
          <button
            onClick={() => setActiveTab('explore')}
            className="text-interactive-primary-light hover:text-interactive-primary-light text-sm none transition-colors"
          >
            {t('discovery.tryExploreTab')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results summary */}
      <div className="bg-ui-surface-secondary/50 rounded-xl p-6 border border-ui-border-primary">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-ui-text-primary mb-2">{t('discovery.yourSelection')}</h3>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-interactive-primary rounded-full text-sm">
                <span>{selectedLocation?.emoji}</span>
                <span>{selectedLocation?.name}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-mood-culture rounded-full text-sm">
                {selectedMood?.icon && <selectedMood.icon className="w-4 h-4" />}
                <span>{selectedMood?.name}</span>
              </div>
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-status-warning rounded-full text-sm">
                  <Filter className="w-3 h-3" />
                  <span>{t('discovery.filtersCount', { count: activeFilterCount })}</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-ui-surface-primary hover:bg-ui-surface-secondary text-ui-text-primary rounded-lg transition-colors text-sm"
          >
            {t('discovery.startOver')}
          </button>
        </div>
        
        <div className="text-ui-text-secondary text-sm">
          Found <span className="text-ui-text-primary font-medium">{tours.length}</span> {t('discovery.perfectMatchesForYou')}
        </div>
      </div>

      {/* Tour results */}
      <div className="space-y-4">
        {tours.map((tour, index) => (
          <TourCard
            key={tour.id}
            tour={tour}
            onBookingClick={onBookTour}
            onFavoriteToggle={onFavoriteToggle}
            isFavorite={favorites.includes(tour.id)}
            formatPrice={formatPrice}
            formatDate={formatDate}
            formatTime={formatTime}
            calculateSavings={calculateSavings}
            getUrgencyColor={getUrgencyColor}
            className="animate-in slide-in-from-bottom duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          />
        ))}
      </div>

      {/* Footer actions */}
      <div className="text-center pt-6 border-t border-ui-border-primary">
        <p className="text-ui-text-secondary text-sm mb-4">
          {t('discovery.didntFindQuestion')}
        </p>
        <button
          onClick={onReset}
          className="px-6 py-3 bg-interactive-primary hover:bg-interactive-primary-hover text-ui-text-primary rounded-lg transition-colors"
        >
          {t('discovery.tryDifferentPreferences')}
        </button>
      </div>
    </div>
  )
}

export default DiscoverTab