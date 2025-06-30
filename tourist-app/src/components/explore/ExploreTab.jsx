// src/components/explore/ExploreTab.jsx
import React, { useState, useEffect } from 'react'
import { 
  Search, Filter, SlidersHorizontal, X, ChevronDown, 
  RefreshCw, Grid, List, MapPin, Clock, Users, Star,
  Calendar, DollarSign, Timer
} from 'lucide-react'
import { useTours } from '../../hooks/useTours'
import { useAppStore } from '../../stores/bookingStore'
import { TOUR_TYPE_EMOJIS, ISLAND_EMOJIS } from '../../constants/moods'
import BookingModal from '../booking/BookingModal'

const ExploreTab = () => {
  const { 
    filters, 
    updateFilter, 
    setSearch, 
    setSortBy, 
    setDateRange, 
    setPriceRange,
    clearFilters 
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

  const TourCard = ({ tour, mode = 'grid' }) => {
    const savings = calculateSavings(tour.original_price_adult, tour.discount_price_adult)
    const urgencyColor = getUrgencyColor(tour.hours_until_deadline)
    
    if (mode === 'list') {
      return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-all p-4">
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-slate-700 rounded-lg flex items-center justify-center text-2xl">
              {TOUR_TYPE_EMOJIS[tour.tour_type] || '🌴'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-white truncate">
                    {tour.tour_name}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {tour.company_name} • {tour.operator_island}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-white">
                    {formatPrice(tour.discount_price_adult)}
                  </div>
                  {savings > 0 && (
                    <div className="text-xs text-green-400">
                      Save {formatPrice(savings)}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-slate-300 mb-3">
                <span>{formatDate(tour.tour_date)} {formatTime(tour.time_slot)}</span>
                <span>{tour.available_spots} spots</span>
                {tour.duration_hours && <span>{tour.duration_hours}h</span>}
                {tour.operator_rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span>{tour.operator_rating}</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => handleBookTour(tour)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Reserve Spot
              </button>
            </div>
          </div>
        </div>
      )
    }

    // Grid mode (default)
    return (
      <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-all">
        <div className="p-4">
          {/* Tour Type Icon */}
          <div className="text-3xl mb-3 text-center">
            {TOUR_TYPE_EMOJIS[tour.tour_type] || '🌴'}
          </div>
          
          {/* Tour Info */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
              {tour.tour_name}
            </h3>
            <p className="text-slate-400 text-sm">
              {tour.company_name}
            </p>
          </div>

          {/* Tour Details */}
          <div className="space-y-2 text-sm text-slate-300 mb-4">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{tour.operator_island}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(tour.tour_date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatTime(tour.time_slot)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{tour.available_spots} spots left</span>
            </div>
            {tour.duration_hours && (
              <div className="flex items-center gap-1">
                <Timer className="w-3 h-3" />
                <span>{tour.duration_hours}h duration</span>
              </div>
            )}
            {tour.operator_rating && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span>{tour.operator_rating}/5</span>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="mb-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-lg font-bold text-white">
                  {formatPrice(tour.discount_price_adult)}
                </span>
                {savings > 0 && (
                  <div className="text-xs text-slate-400 line-through">
                    {formatPrice(tour.original_price_adult)}
                  </div>
                )}
              </div>
              {savings > 0 && (
                <span className="text-xs font-medium text-green-400">
                  Save {formatPrice(savings)}
                </span>
              )}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => handleBookTour(tour)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Reserve Spot
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="pt-8 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                🔍 Explore Tours
              </h1>
              <p className="text-slate-400">
                Find your perfect adventure
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={refreshTours}
                disabled={loading}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search tours, operators, islands..."
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-white font-medium">Filters</span>
                {getActiveFiltersCount() > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
                {getActiveFiltersCount() > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {/* Island Filter */}
              <select
                value={filters.island}
                onChange={(e) => updateFilter('island', e.target.value)}
                className="bg-slate-700 text-white rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">🏝️ All Islands</option>
                {availableIslands.map(island => (
                  <option key={island} value={island}>
                    {ISLAND_EMOJIS[island] || '🏝️'} {island}
                  </option>
                ))}
              </select>

              {/* Tour Type Filter */}
              <select
                value={filters.tourType}
                onChange={(e) => updateFilter('tourType', e.target.value)}
                className="bg-slate-700 text-white rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">🎯 All Types</option>
                {availableTourTypes.map(type => (
                  <option key={type} value={type}>
                    {TOUR_TYPE_EMOJIS[type] || '🌴'} {type}
                  </option>
                ))}
              </select>

              {/* Time Filter */}
              <select
                value={filters.timeframe}
                onChange={(e) => updateFilter('timeframe', e.target.value)}
                className="bg-slate-700 text-white rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">📅 Any Time</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="week">This Week</option>
              </select>

              {/* Sort Filter */}
              <select
                value={filters.sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-700 text-white rounded-lg px-3 py-2 text-sm"
              >
                <option value="date">📅 Sort by Date</option>
                <option value="price-low">💰 Price: Low to High</option>
                <option value="price-high">💎 Price: High to Low</option>
                <option value="rating">⭐ Highest Rated</option>
                <option value="duration">⏱️ Duration</option>
                <option value="spots">👥 Most Available</option>
              </select>
            </div>

            {/* Advanced Filters (Collapsible) */}
            {showFilters && (
              <div className="border-t border-slate-700 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Duration Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Duration
                    </label>
                    <select
                      value={filters.duration}
                      onChange={(e) => updateFilter('duration', e.target.value)}
                      className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="all">Any Duration</option>
                      <option value="half-day">Half Day (≤4h)</option>
                      <option value="full-day">Full Day (4-8h)</option>
                      <option value="multi-day">Multi Day (8h+)</option>
                    </select>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Price Range
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.priceRange?.min || ''}
                        className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 text-sm"
                        onChange={(e) => {
                          const min = e.target.value ? parseInt(e.target.value) : null
                          setPriceRange({
                            ...filters.priceRange,
                            min: min,
                            max: filters.priceRange?.max || null
                          })
                        }}
                      />
                      <span className="text-slate-400">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.priceRange?.max || ''}
                        className="flex-1 bg-slate-700 text-white rounded-lg px-3 py-2 text-sm"
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
                    {filters.priceRange && (
                      <button
                        onClick={() => setPriceRange(null)}
                        className="text-xs text-slate-400 hover:text-white mt-1"
                      >
                        Clear price range
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between mt-6 mb-4">
            <div className="text-slate-400">
              {loading ? (
                'Loading tours...'
              ) : (
                `${tours.length} tour${tours.length !== 1 ? 's' : ''} found`
              )}
            </div>
          </div>
        </div>

        {/* Tours Grid/List */}
        <div className="pb-20">
          {loading ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
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
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {tours.map(tour => (
                <TourCard key={tour.id} tour={tour} mode={viewMode} />
              ))}
            </div>
          )}
        </div>
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