// Clean DiscoverTab - 3 Step Flow: Location → Mood → Personalize
import { useState, useMemo, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, MapPin, Heart, Filter, Sparkles, Mountain, HeartHandshake, Waves, Palette, ArrowRight, SlidersHorizontal, X, DollarSign, Clock, Search, Trash2 } from 'lucide-react'
import { useTours } from '../../hooks/useTours'
import { templateService } from '../../services/templateService'
import { useAppStore } from '../../stores/bookingStore'
import TourCard from '../shared/TourCard'
import BookingModal from '../booking/BookingModal'
import TemplateDetailPage from '../templates/TemplateDetailPage'
import toast from 'react-hot-toast'

// Simple step enum
const STEPS = {
  DUAL_PATH: 'dualPath',
  LOCATION: 'location',
  MOOD: 'mood',
  PERSONALIZE: 'personalize',
  RESULTS: 'results'
}

const DiscoverTab = () => {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(STEPS.DUAL_PATH)
  const [selectedPath, setSelectedPath] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [selectedMood, setSelectedMood] = useState(null)
  const [filters, setFilters] = useState({
    duration: 'any',
    budget: 'any'
  })

  // Additional filters for results screen
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [additionalFilters, setAdditionalFilters] = useState({
    island: 'all',
    tourType: 'all',
    duration: 'all',
    priceRange: null
  })
  
  // Tour data and modals
  const [selectedTour, setSelectedTour] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Template discovery state
  const [templates, setTemplates] = useState([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [templatesError, setTemplatesError] = useState(null)

  // Template detail view state
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showTemplateDetail, setShowTemplateDetail] = useState(false)
  
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

  // Full options for filters (not just database values)
  const allIslands = [
    'Tahiti', 'Bora Bora', 'Moorea', 'Huahine', 'Raiatea', 'Taha\'a',
    'Maupiti', 'Tikehau', 'Rangiroa', 'Fakarava', 'Nuku Hiva', 'Other'
  ]

  const allTourTypes = [
    'Diving', 'Snorkeling', 'Whale Watching', 'Lagoon Tour', 'Adrenalin',
    'Hike', 'Hiking', 'Mindfulness', 'Cultural', 'Culinary Experience', 'Relax'
  ]

  // Fetch templates based on location, mood, and filters
  const fetchTemplates = useCallback(async () => {
    if (!selectedLocation || !selectedMood) {
      setTemplates([])
      return
    }

    setTemplatesLoading(true)
    setTemplatesError(null)

    try {
      // Map mood to tour types
      const moodToTypes = {
        ocean: ['Diving', 'Snorkeling', 'Whale Watching', 'Lagoon Tour'],
        adventure: ['Adrenalin', 'Hike', 'Hiking', 'Diving'],
        relax: ['Mindfulness', 'Lagoon Tour', 'Cultural', 'Relax'],
        culture: ['Cultural', 'Culinary Experience']
      }

      const templateFilters = {
        location: selectedLocation.id,
        // Don't filter by tour type in the service - we'll filter client-side for all allowed types
        tourType: null,
        duration: filters.duration,
        priceRange: filters.budget !== 'any' ? {
          min: filters.budget === 'budget' ? 0 : filters.budget === 'mid' ? 10000 : 30000,
          max: filters.budget === 'budget' ? 9999 : filters.budget === 'mid' ? 29999 : null
        } : null
      }

      const templatesData = await templateService.getDiscoveryTemplates(templateFilters)

      // Additional client-side filtering for mood compatibility
      const allowedTypes = moodToTypes[selectedMood.id] || []
      const filteredTemplates = templatesData.filter(template =>
        allowedTypes.includes(template.tour_type)
      )

      setTemplates(filteredTemplates)
    } catch (error) {
      console.error('Error fetching templates:', error)
      setTemplatesError(error.message)
      setTemplates([])
      toast.error(t('tourCard.loadFailed', 'Failed to load activities'))
    } finally {
      setTemplatesLoading(false)
    }
  }, [selectedLocation, selectedMood, filters])

  // Apply additional filters to templates
  const filteredTours = useMemo(() => {
    if (!templates || templates.length === 0) return []

    return templates.filter(template => {
      // Search filter
      if (searchQuery && !template.tour_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !template.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Island filter
      if (additionalFilters.island !== 'all' && template.location !== additionalFilters.island) {
        return false
      }

      // Tour type filter
      if (additionalFilters.tourType !== 'all' && template.tour_type !== additionalFilters.tourType) {
        return false
      }

      // Duration filter
      if (additionalFilters.duration !== 'all') {
        const hours = template.duration_hours || 0
        if (additionalFilters.duration === 'short' && hours >= 3) return false
        if (additionalFilters.duration === 'medium' && (hours < 3 || hours > 6)) return false
        if (additionalFilters.duration === 'long' && hours <= 6) return false
      }

      // Price range filter
      if (additionalFilters.priceRange) {
        const price = template.discount_price_adult || 0
        if (additionalFilters.priceRange.min && price < additionalFilters.priceRange.min) return false
        if (additionalFilters.priceRange.max && price > additionalFilters.priceRange.max) return false
      }

      return true
    })
  }, [templates, searchQuery, additionalFilters])

  // Fetch templates when location, mood, or filters change
  useEffect(() => {
    if (selectedLocation && selectedMood) {
      fetchTemplates()
    }
  }, [selectedLocation, selectedMood, filters, fetchTemplates])

  // Reset flow
  const resetFlow = () => {
    setCurrentStep(STEPS.LOCATION)
    setSelectedLocation(null)
    setSelectedMood(null)
    setFilters({ duration: 'any', budget: 'any' })
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
    if (currentStep === STEPS.LOCATION) {
      setCurrentStep(STEPS.DUAL_PATH)
    } else if (currentStep === STEPS.MOOD) {
      setCurrentStep(STEPS.LOCATION)
    } else if (currentStep === STEPS.PERSONALIZE) {
      setCurrentStep(STEPS.MOOD)
    } else if (currentStep === STEPS.RESULTS) {
      setCurrentStep(STEPS.PERSONALIZE)
    }
  }

  // Tour interaction handlers
  const handleBookTour = (tour) => {
    // Check if this is a template (from template discovery)
    if (tour.is_template && tour.template_id) {
      // Open template detail page instead of direct booking
      handleTemplateClick(tour)
    } else {
      // Direct booking for regular tour instances
      setSelectedTour(tour)
      setShowBookingModal(true)
    }
  }

  const handleCloseBookingModal = () => {
    setShowBookingModal(false)
    setSelectedTour(null)
  }

  // Template-specific handlers
  const handleTemplateClick = (template) => {
    setSelectedTemplate(template)
    setShowTemplateDetail(true)
  }

  const handleInstanceSelect = (instance) => {
    // Convert instance to tour format for existing booking modal
    const tourForBooking = {
      ...instance,
      // Ensure compatibility with booking modal
      id: instance.id,
      tour_name: selectedTemplate?.tour_name || instance.tour_name,
      description: selectedTemplate?.description || instance.description,

      // Fix pricing field mapping for BookingModal compatibility
      discount_price_adult: instance.effective_discount_price_adult || instance.discount_price_adult || 0,
      discount_price_child: instance.effective_discount_price_child || selectedTemplate?.discount_price_child || 0,
      original_price_adult: instance.original_price_adult || instance.effective_discount_price_adult || 0,
      // Use discount_price_child as original_price_child (simplified child pricing)
      original_price_child: instance.effective_discount_price_child || selectedTemplate?.discount_price_child || 0,

      // Additional fields that BookingModal might need
      tour_type: selectedTemplate?.tour_type || instance.tour_type,
      location: selectedTemplate?.location || instance.location,
      duration_hours: instance.duration_hours || selectedTemplate?.duration_hours,
      operator_name: instance.company_name || selectedTemplate?.operator_name,

      // Ensure all required fields are present
      available_spots: instance.available_spots || 0,
      max_capacity: instance.max_capacity || 0
    }
    setSelectedTour(tourForBooking)
    setShowBookingModal(true)
    setShowTemplateDetail(false)
  }

  const handleBackFromTemplate = () => {
    setShowTemplateDetail(false)
    setSelectedTemplate(null)
  }

  const handleFavoriteToggle = (tourId) => {
    toggleFavorite(tourId)
    const isFavorite = favorites.includes(tourId)
    toast.success(
      isFavorite ? t('toastNotifications.favoriteRemoved') : t('toastNotifications.favoriteAdded'),
      { duration: 2000 }
    )
  }

  // If showing template detail, render it as a full-screen standalone page
  if (showTemplateDetail && selectedTemplate) {
    return (
      <TemplateDetailPage
        template={selectedTemplate}
        onBack={handleBackFromTemplate}
        onInstanceSelect={handleInstanceSelect}
      />
    )
  }

  return (
    <div className="min-h-0 mobile:min-h-0 bg-ui-surface-overlay">
      {/* Header with progress */}
      <div className="border-b border-ui-border-primary">
        <div className="max-w-4xl mx-auto px-4 py-4 xs:py-6">
          {/* Back button - always reserve space to prevent layout jump */}
          <div className="mb-4" style={{ minHeight: '2rem' }}>
            {currentStep !== STEPS.DUAL_PATH && (
              <button
                onClick={goBack}
                className="flex items-center gap-2 text-ui-text-secondary hover:text-ui-text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('common.back')}</span>
              </button>
            )}
          </div>

          {/* Progress indicator - hidden on dual path step */}
          {currentStep !== STEPS.DUAL_PATH && (
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
          )}

          {/* Current step title */}
          <div className="text-center">
            <h1 className="text-mobile-xl xs:text-mobile-2xl mobile:text-mobile-3xl font-bold text-ui-text-primary">
              {currentStep === STEPS.DUAL_PATH && t('discovery.dualPath.title')}
              {currentStep === STEPS.LOCATION && t('discovery.chooseIsland')}
              {currentStep === STEPS.MOOD && t('discovery.moodQuestion')}
              {currentStep === STEPS.PERSONALIZE && t('discovery.personalizeExperience')}
              {currentStep === STEPS.RESULTS && t('discovery.yourPerfectActivity')}
            </h1>
            <p className="text-ui-text-secondary mt-1 text-mobile-sm xs:text-mobile-base px-2 leading-mobile-relaxed">
              {currentStep === STEPS.DUAL_PATH && t('discovery.dualPath.subtitle')}
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
        {currentStep === STEPS.DUAL_PATH && (
          <DualPathStep onPathSelect={(path) => {
            setSelectedPath(path)
            if (path === 'inspiration') {
              setCurrentStep(STEPS.LOCATION)
            } else {
              // For opportunity hunters, skip directly to exploration tab
              setActiveTab('explore')
            }
          }} />
        )}

        {currentStep === STEPS.LOCATION && (
          <LocationStep onSelect={goToMood} selectedLocation={selectedLocation} onBack={() => setCurrentStep(STEPS.DUAL_PATH)} />
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
            loading={templatesLoading}
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
            // Additional filter props
            showAdvancedFilters={showAdvancedFilters}
            setShowAdvancedFilters={setShowAdvancedFilters}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            additionalFilters={additionalFilters}
            setAdditionalFilters={setAdditionalFilters}
            allIslands={allIslands}
            allTourTypes={allTourTypes}
            totalTemplates={templates?.length || 0}
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

// Step 0: Dual Path Selection - Redesigned
const DualPathStep = ({ onPathSelect }) => {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Guided Discovery Path */}
        <button
          onClick={() => onPathSelect('inspiration')}
          className="group relative bg-gradient-to-br from-interactive-primary/5 to-interactive-primary/10 hover:from-interactive-primary/10 hover:to-interactive-primary/20 border-2 border-interactive-primary/20 hover:border-interactive-primary/40 rounded-2xl p-8 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-interactive-primary/10"
        >
          <div className="w-16 h-16 bg-interactive-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-interactive-primary/30 transition-colors">
            <Sparkles className="w-8 h-8 text-interactive-primary" />
          </div>
          <h3 className="text-xl font-bold text-ui-text-primary mb-3">
            {t('discovery.dualPath.guided.title', 'Guided Discovery')}
          </h3>
          <p className="text-ui-text-secondary leading-relaxed mb-6">
            {t('discovery.dualPath.guided.description', 'Let us help you find the perfect activity based on your location and mood')}
          </p>
          <div className="inline-flex items-center gap-2 text-interactive-primary font-semibold group-hover:text-interactive-primary-light transition-colors">
            <span>{t('discovery.dualPath.guided.cta', 'Start Discovery')}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        {/* Direct Search Path */}
        <button
          onClick={() => onPathSelect('opportunity')}
          className="group relative bg-gradient-to-br from-mood-adventure/5 to-mood-adventure/10 hover:from-mood-adventure/10 hover:to-mood-adventure/20 border-2 border-mood-adventure/20 hover:border-mood-adventure/40 rounded-2xl p-8 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-mood-adventure/10"
        >
          <div className="w-16 h-16 bg-mood-adventure/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-mood-adventure/30 transition-colors">
            <Mountain className="w-8 h-8 text-mood-adventure" />
          </div>
          <h3 className="text-xl font-bold text-ui-text-primary mb-3">
            {t('discovery.dualPath.direct.title', 'Browse All')}
          </h3>
          <p className="text-ui-text-secondary leading-relaxed mb-6">
            {t('discovery.dualPath.direct.description', 'Search and filter through all available activities directly')}
          </p>
          <div className="inline-flex items-center gap-2 text-mood-adventure font-semibold group-hover:text-mood-adventure-light transition-colors">
            <span>{t('discovery.dualPath.direct.cta', 'Browse Now')}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  )
}

// Step 1: Location selection
const LocationStep = ({ onSelect, selectedLocation, onBack }) => {
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
      className={`group relative p-4 xs:p-6 rounded-mobile xs:rounded-mobile-xl border-2 text-left transition-touch transform min-h-48 flex flex-col justify-center h-full ${
        isSelected
          ? 'border-mood-culture bg-mood-culture/20 shadow-lg shadow-purple-500/25'
          : 'border-ui-border-primary bg-ui-surface-secondary active:scale-95 active:bg-ui-surface-primary'
      }`}
    >
      <div className="flex items-center justify-center gap-2 xs:gap-3 mb-4">
        <div className="w-12 h-12 bg-ui-surface-primary rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-active:scale-95">
          <IconComponent className={`w-6 h-6 ${
            isSelected ? 'text-mood-culture-light' : 'text-ui-text-muted group-hover:text-mood-culture-light'
          }`} />
        </div>
      </div>
      <h3 className={`text-mobile-base xs:text-mobile-lg font-semibold transition-colors duration-200 text-center leading-snug mb-2 ${
        isSelected ? 'text-mood-culture-light' : 'text-ui-text-primary group-hover:text-mood-culture-light'
      }`}>
        {mood.name}
      </h3>
      <p className="text-ui-text-secondary text-mobile-xs xs:text-mobile-sm leading-mobile-relaxed text-center">{mood.description}</p>

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

  const budgetOptions = [
    {
      key: 'any',
      label: t('discovery.filters.anyBudget'),
      emoji: '💫',
      description: t('discovery.filters.anyBudgetDesc', 'No budget limit')
    },
    {
      key: 'budget',
      label: t('discovery.filters.under10k'),
      emoji: '💰',
      description: t('discovery.filters.under10kDesc', 'Budget-friendly options')
    },
    {
      key: 'mid',
      label: t('discovery.filters.10kTo30k'),
      emoji: '💎',
      description: t('discovery.filters.10kTo30kDesc', 'Great value experiences')
    },
    {
      key: 'luxury',
      label: t('discovery.filters.30kPlus'),
      emoji: '👑',
      description: t('discovery.filters.30kPlusDesc', 'Premium adventures')
    }
  ]


  return (
    <div className="space-y-6">
      {/* Selection summary */}
      <div className="text-center p-3 xs:p-4 bg-ui-surface-secondary rounded-lg border border-ui-border-primary">
        <p className="text-ui-text-muted text-xs xs:text-sm mb-2">
          {t('discovery.exploring')} <span className="text-interactive-primary-light">{selectedLocation?.emoji} {selectedLocation?.name}</span>
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-ui-text-muted">•</span>
          <span className="text-ui-text-primary text-sm">{selectedMood?.name}</span>
        </div>
      </div>

      {/* Budget selection - matching Step 1 & 2 pattern */}
      <div className="space-y-4">
        <h3 className="text-mobile-lg xs:text-mobile-xl font-semibold text-ui-text-primary text-center">
          {t('discovery.budget')}
        </h3>
        <p className="text-ui-text-secondary text-mobile-sm xs:text-mobile-base text-center px-2 leading-mobile-relaxed">
          {t('discovery.filters.budgetDescription', 'What\'s your preferred spending range?')}
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 auto-rows-fr">
          {budgetOptions.map((option) => (
            <FilterCard
              key={option.key}
              option={option}
              isSelected={filters.budget === option.key}
              onClick={() => onFiltersChange({...filters, budget: option.key})}
              colorScheme="budget"
            />
          ))}
        </div>
      </div>


      {/* Action buttons - mobile-first design */}
      <div className="flex flex-col mobile:flex-row gap-3 mobile:gap-4 justify-center pt-6">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-ui-surface-primary hover:bg-ui-surface-secondary text-ui-text-primary rounded-mobile-lg transition-touch min-h-[3rem] w-full mobile:w-auto"
        >
          {t('discovery.startOver')}
        </button>
        <button
          onClick={onShowResults}
          className="px-6 mobile:px-8 py-3 bg-interactive-primary hover:bg-interactive-primary-hover text-ui-text-primary rounded-mobile-lg font-medium transition-touch flex items-center justify-center gap-2 min-h-[3rem] w-full mobile:w-auto"
        >
          <Sparkles className="w-5 h-5" />
          <span className="truncate">{t('discovery.findActivities')}</span>
        </button>
      </div>
    </div>
  )
}

// Reusable Filter Card Component - matching Island and Mood card patterns
const FilterCard = ({ option, onClick, isSelected = false, colorScheme = 'default', className = '' }) => {
  const getColorClasses = (scheme, selected) => {
    if (scheme === 'budget') {
      return selected
        ? 'border-status-success bg-status-success/20 shadow-lg shadow-green-500/25'
        : 'border-ui-border-primary bg-ui-surface-secondary active:scale-95 active:bg-ui-surface-primary'
    }
    if (scheme === 'duration') {
      return selected
        ? 'border-interactive-primary bg-interactive-primary/20 shadow-lg shadow-blue-500/25'
        : 'border-ui-border-primary bg-ui-surface-secondary active:scale-95 active:bg-ui-surface-primary'
    }
    return selected
      ? 'border-interactive-focus bg-interactive-primary/20 shadow-lg shadow-blue-500/25'
      : 'border-ui-border-primary bg-ui-surface-secondary active:scale-95 active:bg-ui-surface-primary'
  }

  const getTextColor = (scheme, selected) => {
    if (scheme === 'budget' && selected) return 'text-status-success-light'
    if (scheme === 'duration' && selected) return 'text-interactive-primary-light'
    return selected ? 'text-interactive-primary-light' : 'text-ui-text-primary group-hover:text-interactive-primary-light'
  }

  return (
    <button
      onClick={() => onClick(option)}
      className={`group relative p-4 xs:p-6 rounded-mobile xs:rounded-mobile-xl border-2 text-left transition-touch transform min-h-48 flex flex-col justify-center h-full ${getColorClasses(colorScheme, isSelected)} ${className}`}
    >
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-center gap-2 xs:gap-3 mb-2 xs:mb-3">
          <span className="text-2xl xs:text-3xl transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
            {option.emoji}
          </span>
        </div>
        <h3 className={`text-mobile-base xs:text-mobile-lg font-semibold transition-colors duration-200 text-center hyphens-none overflow-wrap-anywhere leading-snug mb-2 xs:mb-3 ${getTextColor(colorScheme, isSelected)}`}>
          {option.label}
        </h3>
      </div>
      <p className="text-ui-text-secondary text-mobile-xs xs:text-mobile-sm leading-mobile-relaxed text-center mt-auto">
        {option.description}
      </p>

      {/* Subtle glow effect - only show on hover when not selected */}
      <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none ${
        isSelected
          ? `${colorScheme === 'budget' ? 'bg-status-success/10' : 'bg-interactive-primary/10'} opacity-100`
          : `${colorScheme === 'budget' ? 'bg-status-success/5' : 'bg-interactive-primary/5'} opacity-0`
      }`} />
    </button>
  )
}

// Step 4: Results showing filtered tours with advanced filters
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
  setActiveTab,
  // New props for advanced filtering
  showAdvancedFilters,
  setShowAdvancedFilters,
  searchQuery,
  setSearchQuery,
  additionalFilters,
  setAdditionalFilters,
  allIslands,
  allTourTypes,
  totalTemplates
}) => {
  const { t } = useTranslation()
  const activeFilterCount = Object.values(filters).filter(v => v !== 'any').length

  // Count additional active filters
  const additionalActiveFilters = [
    additionalFilters.island !== 'all',
    additionalFilters.tourType !== 'all',
    additionalFilters.duration !== 'all',
    additionalFilters.priceRange !== null,
    searchQuery.length > 0
  ].filter(Boolean).length

  // Clear additional filters
  const clearAdditionalFilters = () => {
    setAdditionalFilters({
      island: 'all',
      tourType: 'all',
      duration: 'all',
      priceRange: null
    })
    setSearchQuery('')
  }

  // FilterChip Component for additional filters
  const FilterChip = ({ label, onRemove }) => (
    <span className="inline-flex items-center gap-1.5 bg-interactive-primary/20 text-interactive-primary-light border border-interactive-primary/30 px-2.5 py-1 rounded-lg text-xs font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-ui-text-primary transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  )

  if (loading) {
    return <div className="text-center py-12">
      <div className="animate-spin w-8 h-8 border-4 border-interactive-primary border-t-transparent rounded-full mx-auto"></div>
      <p className="text-ui-text-secondary mt-4">{t('discovery.loadingActivities')}</p>
    </div>
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
          Found <span className="text-ui-text-primary font-medium">{tours.length}</span> of <span className="text-ui-text-primary font-medium">{totalTemplates}</span> {t('discovery.perfectMatchesForYou')}
        </div>
      </div>

      {/* Advanced Filters Section */}
      <div className="bg-ui-surface-secondary/50 rounded-xl border border-ui-border-primary">
        {/* Filter Header */}
        <div className="flex items-center justify-between p-4 border-b border-ui-border-primary">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-ui-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('explore.searchPlaceholder')}
              className="flex-1 bg-ui-surface-primary border border-ui-border-secondary rounded-lg px-3 py-2 text-ui-text-primary placeholder-ui-text-secondary focus:border-interactive-focus min-w-0"
            />
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                showAdvancedFilters || additionalActiveFilters > 0
                  ? 'bg-interactive-primary text-ui-text-primary shadow-lg'
                  : 'bg-ui-surface-primary text-ui-text-muted hover:bg-ui-surface-tertiary'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {additionalActiveFilters > 0 && (
                <span className="bg-white text-interactive-primary text-xs px-2 py-0.5 rounded-full font-bold">
                  {additionalActiveFilters}
                </span>
              )}
            </button>

            {additionalActiveFilters > 0 && (
              <button
                onClick={clearAdditionalFilters}
                className="flex items-center gap-1.5 px-3 py-2 bg-status-error hover:bg-status-error-hover text-ui-text-primary rounded-lg text-sm font-medium transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Active Additional Filters Display */}
        {additionalActiveFilters > 0 && (
          <div className="flex flex-wrap gap-2 p-4 border-b border-ui-border-primary">
            {searchQuery && (
              <FilterChip
                label={`🔍 "${searchQuery}"`}
                onRemove={() => setSearchQuery('')}
              />
            )}
            {additionalFilters.island !== 'all' && (
              <FilterChip
                label={`📍 ${additionalFilters.island}`}
                onRemove={() => setAdditionalFilters({...additionalFilters, island: 'all'})}
              />
            )}
            {additionalFilters.tourType !== 'all' && (
              <FilterChip
                label={`🎯 ${additionalFilters.tourType}`}
                onRemove={() => setAdditionalFilters({...additionalFilters, tourType: 'all'})}
              />
            )}
            {additionalFilters.duration !== 'all' && (
              <FilterChip
                label={`⏱️ ${additionalFilters.duration}`}
                onRemove={() => setAdditionalFilters({...additionalFilters, duration: 'all'})}
              />
            )}
            {additionalFilters.priceRange && (
              <FilterChip
                label={`💰 ${additionalFilters.priceRange.min || 0}-${additionalFilters.priceRange.max || '∞'} XPF`}
                onRemove={() => setAdditionalFilters({...additionalFilters, priceRange: null})}
              />
            )}
          </div>
        )}

        {/* Advanced Filter Panel */}
        {showAdvancedFilters && (
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Island Filter */}
              <div>
                <label className="block text-sm font-medium text-ui-text-muted mb-2">{t('explore.filterLabels.island')}</label>
                <select
                  value={additionalFilters.island}
                  onChange={(e) => setAdditionalFilters({...additionalFilters, island: e.target.value})}
                  className="w-full bg-ui-surface-primary border border-ui-border-secondary text-ui-text-primary rounded-lg px-3 py-2.5 text-sm focus:border-interactive-focus"
                >
                  <option value="all">{t('explore.filterOptions.allIslands')}</option>
                  {allIslands.map(island => (
                    <option key={island} value={island}>{island}</option>
                  ))}
                </select>
              </div>

              {/* Tour Type Filter */}
              <div>
                <label className="block text-sm font-medium text-ui-text-muted mb-2">{t('explore.filterLabels.activityType')}</label>
                <select
                  value={additionalFilters.tourType}
                  onChange={(e) => setAdditionalFilters({...additionalFilters, tourType: e.target.value})}
                  className="w-full bg-ui-surface-primary border border-ui-border-secondary text-ui-text-primary rounded-lg px-3 py-2.5 text-sm focus:border-interactive-focus"
                >
                  <option value="all">{t('explore.filterOptions.allTypes')}</option>
                  {allTourTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Duration Filter */}
              <div>
                <label className="block text-sm font-medium text-ui-text-muted mb-2">{t('explore.filterLabels.duration')}</label>
                <select
                  value={additionalFilters.duration}
                  onChange={(e) => setAdditionalFilters({...additionalFilters, duration: e.target.value})}
                  className="w-full bg-ui-surface-primary border border-ui-border-secondary text-ui-text-primary rounded-lg px-3 py-2.5 text-sm focus:border-interactive-focus"
                >
                  <option value="all">{t('explore.filterOptions.anyDuration')}</option>
                  <option value="short">{t('explore.filterOptions.under3Hours')}</option>
                  <option value="medium">{t('explore.filterOptions.3to6Hours')}</option>
                  <option value="long">{t('explore.filterOptions.over6Hours')}</option>
                </select>
              </div>
            </div>

            {/* Price Range - Full width section */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-ui-text-muted mb-2">{t('explore.filterLabels.priceRange')}</label>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <input
                  type="number"
                  placeholder={t('explore.placeholders.minPrice')}
                  className="w-full bg-ui-surface-primary border border-ui-border-secondary text-ui-text-primary rounded-lg px-3 py-2.5 text-sm focus:border-interactive-focus"
                  value={additionalFilters.priceRange?.min || ''}
                  onChange={(e) => {
                    const min = e.target.value ? parseInt(e.target.value) : null
                    setAdditionalFilters({
                      ...additionalFilters,
                      priceRange: {
                        ...additionalFilters.priceRange,
                        min: min,
                        max: additionalFilters.priceRange?.max || null
                      }
                    })
                  }}
                />
                <input
                  type="number"
                  placeholder={t('explore.placeholders.maxPrice')}
                  className="w-full bg-ui-surface-primary border border-ui-border-secondary text-ui-text-primary rounded-lg px-3 py-2.5 text-sm focus:border-interactive-focus"
                  value={additionalFilters.priceRange?.max || ''}
                  onChange={(e) => {
                    const max = e.target.value ? parseInt(e.target.value) : null
                    setAdditionalFilters({
                      ...additionalFilters,
                      priceRange: {
                        ...additionalFilters.priceRange,
                        min: additionalFilters.priceRange?.min || null,
                        max: max
                      }
                    })
                  }}
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-ui-border-primary">
              <div className="text-sm text-ui-text-secondary">
                {tours.length} of {totalTemplates} templates match your criteria
              </div>
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className="bg-interactive-primary hover:bg-interactive-primary-hover text-ui-text-primary px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {t('explore.applyFilters')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tour results */}
      {tours.length === 0 ? (
        <div className="text-center py-12 bg-ui-surface-secondary/50 rounded-xl border border-ui-border-primary">
          <div className="w-16 h-16 bg-ui-surface-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🌴</span>
          </div>
          <h3 className="text-lg font-semibold text-ui-text-muted mb-2">
            {t('discovery.noActivitiesFound')}
          </h3>
          <p className="text-ui-text-disabled mb-6 max-w-md mx-auto">
            {additionalActiveFilters > 0
              ? t('discovery.tryAdjustingFilters')
              : t('discovery.noTemplatesInSelection')}
          </p>

          {additionalActiveFilters > 0 && (
            <button
              onClick={clearAdditionalFilters}
              className="bg-interactive-primary hover:bg-interactive-primary-hover text-ui-text-primary px-6 py-3 rounded-lg transition-colors mb-4"
            >
              {t('discovery.clearFilters')}
            </button>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onReset}
              className="bg-ui-surface-primary hover:bg-ui-surface-secondary text-ui-text-primary px-6 py-3 rounded-lg transition-colors"
            >
              {t('discovery.startOver')}
            </button>

            <button
              onClick={() => setActiveTab('explore')}
              className="text-interactive-primary-light hover:text-interactive-primary border border-interactive-primary-light hover:bg-interactive-primary-light hover:text-ui-text-primary px-6 py-3 rounded-lg transition-colors"
            >
              {t('discovery.tryExploreTab')}
            </button>
          </div>
        </div>
      ) : (
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
      )}

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