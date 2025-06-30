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

  const TourCard = ({ tour, mode = 'grid' }) => {
    const savings = calculateSavings(tour.original_price_adult, tour.discount_price_adult)
    const urgencyColor = getUrgencyColor(tour.hours_until_deadline)
    const isFavorite = favorites.includes(tour.id)
    
    if (mode === 'list') {
      return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-all p-4">
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-slate-700 rounded-lg flex items-center justify-center text-2xl">
              {TOUR_TYPE_EMOJIS[tour.tour_type] || '🌴'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">{tour.tour_name}</h3>
                  <p className="text-slate-400 text-sm">{tour.company_name} • {tour.operator_island}</p>
                </div>
                
                {/* Heart Button for List View */}
                <button
                  onClick={(e) => handleFavoriteClick(e, tour.id)}
                  className={`ml-3 p-2 rounded-full transition-all ${
                    isFavorite 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-red-400'
                  }`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-sm">{formatDate(tour.tour_date)}</div>
                    <div className="text-xs text-slate-400">{formatTime(tour.time_slot)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Users className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-sm">{tour.available_spots} left</div>
                    <div className="text-xs text-slate-400">of {tour.max_capacity}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <div className="text-sm truncate">{tour.meeting_point}</div>
                </div>
              </div>
              
              {tour.hours_until_deadline && tour.hours_until_deadline <= 8 && (
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-2 ${urgencyColor}`}>
                  <Clock className="w-3 h-3" />
                  {tour.hours_until_deadline < 1 
                    ? `${Math.round(tour.hours_until_deadline * 60)} min left`
                    : `${Math.round(tour.hours_until_deadline)}h left`
                  }
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end justify-between">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">
                    {formatPrice(tour.discount_price_adult)}
                  </span>
                  {savings > 0 && (
                    <span className="text-sm text-slate-400 line-through">
                      {formatPrice(tour.original_price_adult)}
                    </span>
                  )}
                </div>
                {savings > 0 && (
                  <div className="text-xs text-green-400">
                    Save {formatPrice(savings)}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => handleBookTour(tour)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                Reserve Spot
              </button>
            </div>
          </div>
        </div>
      )
    }
    
    // Grid View (default)
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 transition-all relative">
        {/* Heart Button for Grid View - Top Right */}
        <button
          onClick={(e) => handleFavoriteClick(e, tour.id)}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all shadow-lg ${
            isFavorite 
              ? 'bg-red-500 text-white hover:bg-red-600 hover:scale-110' 
              : 'bg-slate-700/80 text-slate-400 hover:bg-slate-600 hover:text-red-400 backdrop-blur-sm'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        <div className="p-4">
          {/* Urgency Badge */}
          {tour.hours_until_deadline && tour.hours_until_deadline <= 8 && (
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-3 ${urgencyColor}`}>
              <Clock className="w-3 h-3" />
              {tour.hours_until_deadline < 1 
                ? `${Math.round(tour.hours_until_deadline * 60)} min left`
                : `${Math.round(tour.hours_until_deadline)}h left`
              }
            </div>
          )}

          {/* Tour Title with padding for heart */}
          <div className="flex items-center gap-2 mb-2 pr-12">
            <span className="text-xl">{TOUR_TYPE_EMOJIS[tour.tour_type] || '🌴'}</span>
            <h3 className="text-lg font-semibold text-white">{tour.tour_name}</h3>
          </div>
          
          <div className="text-slate-400 text-sm mb-3">
            with {tour.company_name} • {tour.operator_island}
          </div>

          {/* Tour Details */}
          <div className="grid grid-cols-1 gap-3 mb-4">
            <div className="flex items-center gap-2 text-slate-300">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-sm font-medium">{formatDate(tour.tour_date)}</div>
                <div className="text-xs text-slate-400">{formatTime(tour.time_slot)}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-sm">{tour.available_spots} spots left</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-sm">{tour.meeting_point}</span>
              </div>
            </div>
          </div>

          {/* Pricing and Actions */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">
                  {formatPrice(tour.discount_price_adult)}
                </span>
                {savings > 0 && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatPrice(tour.original_price_adult)}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <div className="text-xs text-green-400">
                  Save {formatPrice(savings)}
                </div>
              )}
            </div>

            <button
              onClick={() => handleBookTour(tour)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              Reserve Spot
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Explore Tours</h1>
              <p className="text-slate-400">Find the perfect adventure for your French Polynesia experience</p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={refreshTours}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search tours, operators, or islands..."
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              {/* Island Filter */}
              <select
                value={filters.island}
                onChange={(e) => updateFilter('island', e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500"
              >
                <option value="all">All Islands</option>
                {availableIslands.map(island => (
                  <option key={island} value={island}>{island}</option>
                ))}
              </select>

              {/* Tour Type Filter */}
              <select
                value={filters.tourType}
                onChange={(e) => updateFilter('tourType', e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500"
              >
                <option value="all">All Types</option>
                {availableTourTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              {/* Timeframe Filter */}
              <select
                value={filters.timeframe}
                onChange={(e) => updateFilter('timeframe', e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500"
              >
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="week">This Week</option>
                <option value="all">All Dates</option>
              </select>

              {/* Sort By */}
              <select
                value={filters.sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:border-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="price">Sort by Price</option>
                <option value="availability">Sort by Availability</option>
                <option value="urgency">Sort by Urgency</option>
              </select>

              {/* Advanced Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  showFilters ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Advanced
                {getActiveFiltersCount() > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </button>

              {/* Clear Filters */}
              {getActiveFiltersCount() > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Duration Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
                    <select
                      value={filters.duration}
                      onChange={(e) => updateFilter('duration', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="all">Any Duration</option>
                      <option value="short">Under 3 hours</option>
                      <option value="medium">3-6 hours</option>
                      <option value="long">6+ hours</option>
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Price Range</label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          className="flex-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
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
                          placeholder="Max"
                          className="flex-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm"
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
      </div>

      {/* Tours Grid/List */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-20">
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