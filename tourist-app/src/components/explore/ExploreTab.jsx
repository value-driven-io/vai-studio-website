// REPLACE: src/components/explore/ExploreTab.jsx
import React, { useState, useEffect } from 'react'
import { 
  Search, Filter, SlidersHorizontal, X, ChevronDown, 
  RefreshCw, Grid, List, MapPin, Clock, Users, Star,
  Calendar, DollarSign, Timer, Heart
} from 'lucide-react'
import { useTours } from '../../hooks/useTours'
import { useAppStore } from '../../stores/bookingStore'
import { TOUR_TYPE_EMOJIS, ISLAND_EMOJIS } from '../../constants/moods'
import BookingModal from '../booking/BookingModal'
import toast from 'react-hot-toast'
import TourCard from '../shared/TourCard'

const ExploreTab = () => {
  const { 
    filters, 
    updateFilter, 
    setSearch, 
    setSortBy, 
    setDateRange, 
    setPriceRange,
    clearFilters,
    favorites,
    toggleFavorite
  } = useAppStore()
  
  const { 
    tours, 
    loading, 
    refreshTours, 
    formatPrice, 
    formatDate, 
    formatTime,
    getUrgencyColor,
    calculateSavings 
  } = useTours()

  // Local state
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTour, setSelectedTour] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [localSearch, setLocalSearch] = useState(filters.search || '')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(localSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearch, setSearch])

  // Get unique values for filter options
  const [availableIslands, setAvailableIslands] = useState([])
  const [availableTourTypes, setAvailableTourTypes] = useState([])
  const [priceRange, setPriceRangeLocal] = useState({ min: 0, max: 50000 })

  useEffect(() => {
    if (tours.length > 0) {
      // Extract unique islands
      const islands = [...new Set(tours.map(tour => tour.operator_island).filter(Boolean))]
      setAvailableIslands(islands)
      
      // Extract unique tour types
      const types = [...new Set(tours.map(tour => tour.tour_type).filter(Boolean))]
      setAvailableTourTypes(types)
      
      // Calculate price range
      const prices = tours.map(tour => tour.discount_price_adult).filter(Boolean)
      if (prices.length > 0) {
        setPriceRangeLocal({
          min: Math.min(...prices),
          max: Math.max(...prices)
        })
      }
    }
  }, [tours])

  const handleBookTour = (tour) => {
    setSelectedTour(tour)
    setShowBookingModal(true)
  }

  const handleCloseBookingModal = () => {
    setShowBookingModal(false)
    setSelectedTour(null)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.island !== 'all') count++
    if (filters.tourType !== 'all') count++
    if (filters.timeframe !== 'week') count++
    if (filters.duration !== 'all') count++
    if (filters.search) count++
    if (filters.dateRange) count++
    if (filters.priceRange && (filters.priceRange.min || filters.priceRange.max)) count++
    return count
  }

  const handleFavoriteClick = (e, tourId) => {
    e.stopPropagation()
    const isFavorite = favorites.includes(tourId)
    toggleFavorite(tourId)
    toast.success(
      isFavorite ? '💔 Removed from favorites' : '❤️ Added to favorites',
      {
        duration: 2000,
        style: {
          background: isFavorite ? '#dc2626' : '#16a34a',
          color: 'white'
        }
      }
    )
  }

  // Add the FilterChip Component
  const FilterChip = ({ label, onRemove }) => (
    <span className="inline-flex items-center gap-1.5 bg-blue-600/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-lg text-xs font-medium filter-chip">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-white transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  )

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      
      {/* Mobile-First Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          {/* Compact Title Bar */}
          <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                🔎 <span className="hidden xs:inline">Explore</span> Tours
              </h1>
              {tours.length > 0 && (
                <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full">
                  {tours.length}
                </span>
              )}
            </div>
            
            {/* Refresh Button - Always visible */}
            <button
              onClick={refreshTours}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg transition-colors min-h-44"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{loading ? 'Loading...' : 'Refresh'}</span>
            </button>
          </div>

          {/* Search Section */}
          <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search tours, islands, or activities..."
                className="w-full pl-12 pr-4 py-3 sm:py-3.5 bg-slate-700 border border-slate-600 rounded-xl text-base text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              {localSearch && (
                <button
                  onClick={() => setLocalSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions & Filter Bar */}
          <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Date Filters - Mobile Friendly */}
              <div className="flex gap-1 sm:gap-2">
                {[
                  { id: 'today', label: 'Today', icon: '📅' },
                  { id: 'tomorrow', label: 'Tomorrow', icon: '🌅' },
                  { id: 'week', label: 'Week', icon: '📆' }
                ].map((timeOption) => (
                  <button
                    key={timeOption.id}
                    onClick={() => updateFilter('timeframe', timeOption.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-44 ${
                      filters.timeframe === timeOption.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{timeOption.icon}</span>
                    <span className="hidden xs:inline">{timeOption.label}</span>
                  </button>
                ))}
              </div>

              {/* Main Filters Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all min-h-44 ${
                  showFilters || getActiveFiltersCount() > 0
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                {getActiveFiltersCount() > 0 && (
                  <span className="bg-white text-blue-600 text-xs px-2 py-0.5 rounded-full font-bold">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>

              {/* Clear Filters - Only show when needed */}
              {getActiveFiltersCount() > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all min-h-44"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}

              {/* Sort - Compact Dropdown */}
              {/*<select
                value={filters.sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500 min-h-44 ml-auto"
              >
                <option value="date">📅 Date</option>
                <option value="price">💰 Price</option>
                <option value="availability">👥 Spots</option>
                <option value="urgency">⚡ Urgent</option>
              </select> */}

            </div>

            {/* Active Filters Display */}
            {getActiveFiltersCount() > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-700/50">
                {filters.island !== 'all' && (
                  <FilterChip
                    label={`📍 ${filters.island}`}
                    onRemove={() => updateFilter('island', 'all')}
                  />
                )}
                {filters.tourType !== 'all' && (
                  <FilterChip
                    label={`🎯 ${filters.tourType}`}
                    onRemove={() => updateFilter('tourType', 'all')}
                  />
                )}
                {filters.duration !== 'all' && (
                  <FilterChip
                    label={`⏱️ ${filters.duration}`}
                    onRemove={() => updateFilter('duration', 'all')}
                  />
                )}
                {filters.priceRange && (
                  <FilterChip
                    label={`💰 ${filters.priceRange.min || 0}-${filters.priceRange.max || '∞'} XPF`}
                    onRemove={() => setPriceRange(null)}
                  />
                )}
              </div>
            )}
          </div>

          {/* Mobile Filter Modal/Panel */}
          {showFilters && (
            <div className="border-t border-slate-700 bg-slate-800/95 backdrop-blur-sm">
              <div className="px-3 sm:px-4 md:px-6 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Island Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">📍 Island</label>
                    <select
                      value={filters.island}
                      onChange={(e) => updateFilter('island', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:border-blue-500"
                    >
                      <option value="all">All Islands</option>
                      {availableIslands.map(island => (
                        <option key={island} value={island}>{island}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tour Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">🎯 Activity Type</label>
                    <select
                      value={filters.tourType}
                      onChange={(e) => updateFilter('tourType', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:border-blue-500"
                    >
                      <option value="all">All Types</option>
                      {availableTourTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Duration Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">⏱️ Duration</label>
                    <select
                      value={filters.duration}
                      onChange={(e) => updateFilter('duration', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:border-blue-500"
                    >
                      <option value="all">Any Duration</option>
                      <option value="short">Under 3 hours</option>
                      <option value="medium">3-6 hours</option>
                      <option value="long">6+ hours</option>
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">💰 Price Range</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min XPF"
                        className="flex-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:border-blue-500"
                        value={filters.priceRange?.min || ''}
                        onChange={(e) => {
                          const min = e.target.value ? parseInt(e.target.value) : null
                          setPriceRange({
                            ...filters.priceRange,
                            min: min,
                            max: filters.priceRange?.max || null
                          })
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Max XPF"
                        className="flex-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:border-blue-500"
                        value={filters.priceRange?.max || ''}
                        onChange={(e) => {
                          const max = e.target.value ? parseInt(e.target.value) : null
                          setPriceRange({
                            ...filters.priceRange,
                            min: filters.priceRange?.min || null,
                            max: max
                          })
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700">
                  <div className="text-sm text-slate-400">
                    {loading ? 'Loading...' : `${tours.length} tours found`}
                  </div>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tours Grid/List */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 pb-20">
        {loading ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2' 
              : 'grid-cols-1'
          }`}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-slate-800 rounded-xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No tours found</h3>
            <p className="text-slate-500 mb-4">Try adjusting your filters or search terms</p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2' 
              : 'grid-cols-1'
          }`}>
            {tours.map(tour => (
              <TourCard 
                key={tour.id} 
                tour={tour} 
                mode={viewMode === 'list' ? 'expanded' : 'compact'}
                onBookingClick={handleBookTour}
                onFavoriteToggle={(tourId) => {
                  const isFavorite = favorites.includes(tourId)
                  toggleFavorite(tourId)
                  toast.success(
                    isFavorite ? '💔 Removed from favorites' : '❤️ Added to favorites',
                    { duration: 2000, style: { background: isFavorite ? '#dc2626' : '#16a34a', color: 'white' }}
                  )
                }}
                isFavorite={favorites.includes(tour.id)}
                formatPrice={formatPrice}
                formatDate={formatDate}
                formatTime={formatTime}
                calculateSavings={calculateSavings}
                getUrgencyColor={getUrgencyColor}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal 
        tour={selectedTour}
        isOpen={showBookingModal}
        onClose={handleCloseBookingModal}
      />
    </div>
  )
}

export default ExploreTab