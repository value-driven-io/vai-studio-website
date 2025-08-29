// Tour results component - Step 3 of discovery flow
import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { getIslandById } from '../../../constants/islands'
import { ENHANCED_MOOD_CATEGORIES } from '../../../constants/enhancedMoods'
import { useTours } from '../../../hooks/useTours'
import { useAppStore } from '../../../stores/bookingStore'
import DiscoveryService from '../../../services/discoveryService'
import SmartFilters from './SmartFilters'
import TourCard from '../../shared/TourCard'
import BookingModal from '../../booking/BookingModal'
import toast from 'react-hot-toast'

const TourResults = ({ 
  island, 
  mood, 
  onBack,
  onChangeIsland,
  onChangeMood 
}) => {
  const { t } = useTranslation()
  const { 
    discoverTours = [], 
    loading, 
    refreshTours, 
    formatPrice, 
    formatDate, 
    formatTime,
    getUrgencyColor,
    calculateSavings 
  } = useTours()
  
  const { favorites, toggleFavorite } = useAppStore()
  
  // Local state
  const [activeFilters, setActiveFilters] = useState([])
  const [selectedTour, setSelectedTour] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Get display data
  const islandData = getIslandById(island)
  const moodData = ENHANCED_MOOD_CATEGORIES.find(m => m.id === mood)
  const MoodIcon = moodData?.icon

  // Filter tours using discovery service
  const filteredTours = useMemo(() => {
    return DiscoveryService.getDiscoveryTours(
      discoverTours, 
      island, 
      mood, 
      activeFilters
    )
  }, [discoverTours, island, mood, activeFilters])

  // Handlers
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
      isFavorite ? '💔 Removed from favorites' : '❤️ Added to favorites',
      { duration: 2000 }
    )
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshTours()
      toast.success(t('toastNotifications.tourUpdated'))
    } catch (error) {
      toast.error(t('toastNotifications.refreshFailed'))
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with breadcrumb navigation */}
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{t('common.back')}</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={onChangeIsland}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <span>{islandData?.emoji}</span>
              <span>{t(islandData?.nameKey || 'islands.all')}</span>
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={onChangeMood}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              {MoodIcon && <MoodIcon className="w-4 h-4" />}
              <span>{t(moodData?.titleKey || '')}</span>
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white 
                     px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${(loading || isRefreshing) ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline text-sm">{t('discovery.refreshTours')}</span>
          </button>
        </div>
      </div>

      {/* Smart Filters */}
      <SmartFilters
        moodId={mood}
        activeFilters={activeFilters}
        onFilterToggle={setActiveFilters}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {filteredTours.length > 0 
              ? t('discovery.perfectMatches', `Perfect matches for you`)
              : t('discovery.noToursFound')
            }
          </h3>
          <p className="text-sm text-slate-400">
            {filteredTours.length} {filteredTours.length === 1 ? t('discovery.tours') : t('discovery.toursPlural')}
            {activeFilters.length > 0 && ` • ${activeFilters.length} filters applied`}
          </p>
        </div>
      </div>

      {/* Tour Results */}
      {loading ? (
        <TourCardSkeleton count={3} />
      ) : filteredTours.length > 0 ? (
        <div className="space-y-4">
          {filteredTours.map((tour, index) => (
            <TourCard
              key={tour.id}
              tour={tour}
              onBookingClick={handleBookTour}
              onFavoriteToggle={handleFavoriteToggle}
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
      ) : (
        <EmptyState 
          island={islandData}
          mood={moodData}
          activeFilters={activeFilters}
          onClearFilters={() => setActiveFilters([])}
          onChangeMood={onChangeMood}
          onChangeIsland={onChangeIsland}
        />
      )}

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

// Empty state component
const EmptyState = ({ 
  island, 
  mood, 
  activeFilters, 
  onClearFilters, 
  onChangeMood, 
  onChangeIsland 
}) => {
  const { t } = useTranslation()

  return (
    <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
      <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">🌴</span>
      </div>
      <h3 className="text-lg font-semibold text-slate-300 mb-2">
        {t('discovery.noToursFound')}
      </h3>
      <p className="text-slate-500 mb-6 max-w-md mx-auto">
        {activeFilters.length > 0 
          ? t('discovery.tryFewerFilters')
          : t('discovery.tryDifferentMood')
        }
      </p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        {activeFilters.length > 0 && (
          <button
            onClick={onClearFilters}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg 
                     transition-colors"
          >
            {t('discovery.clearFilters')}
          </button>
        )}
        <button
          onClick={onChangeMood}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg 
                   transition-colors"
        >
          {t('discovery.tryDifferentMood')}
        </button>
        <button
          onClick={onChangeIsland}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg 
                   transition-colors"
        >
          {t('discovery.tryDifferentIsland')}
        </button>
      </div>
    </div>
  )
}

// Skeleton loader (reusing existing one)
const TourCardSkeleton = ({ count = 3 }) => (
  <div className="space-y-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            </div>
            <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="h-12 bg-slate-700 rounded"></div>
            <div className="h-12 bg-slate-700 rounded"></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-6 bg-slate-700 rounded w-1/3"></div>
            <div className="h-10 bg-slate-700 rounded w-24"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
)

export default TourResults