// src/components/explore/ExploreTab.jsx (CONVERTED TO i18n)
import React, { useState, useEffect } from 'react'
import { 
  Search, Filter, SlidersHorizontal, X, ChevronDown, 
  RefreshCw, Grid, List, MapPin, Clock, Users, Star,
  Calendar, DollarSign, Timer, Heart, Trash2
} from 'lucide-react'
import { useTours } from '../../hooks/useTours'
import { useAppStore } from '../../stores/bookingStore'
import { TOUR_TYPE_EMOJIS, ISLAND_EMOJIS } from '../../constants/moods'
import BookingModal from '../booking/BookingModal'
import toast from 'react-hot-toast'
import TourCard from '../shared/TourCard'
import VAILogo from '../shared/VAILogo'
import { useTranslation } from 'react-i18next'

// Date Picker
const DatePickerModal = ({ isOpen, onClose, onDateSelect, currentDateRange }) => {
  const [startDate, setStartDate] = useState(currentDateRange?.start || '')
  const [endDate, setEndDate] = useState(currentDateRange?.end || '')

  const handleApply = () => {
    if (startDate && endDate) {
      onDateSelect({ start: startDate, end: endDate })
    } else if (startDate) {
      onDateSelect({ start: startDate, end: startDate })
    }
    onClose()
  }

  const handleClear = () => {
    onDateSelect(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-sm mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Select Dates</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Date Inputs */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 focus:border-blue-500"
            />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

const ExploreTab = () => {
  // 🌍 ONLY NEW ADDITION: Add translation hook
  const { t } = useTranslation()
  
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
  const [showDatePicker, setShowDatePicker] = useState(false)

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

  // HANDLERS 
  const handleBookTour = (tour) => {
    setSelectedTour(tour)
    setShowBookingModal(true)
  }

  const handleCloseBookingModal = () => {
    setShowBookingModal(false)
    setSelectedTour(null)
  }

  // Date Picker Handler
const handleDateSelect = (dateRange) => {
  setDateRange(dateRange)
  if (dateRange) {
    // Clear timeframe filter when custom date is selected
    updateFilter('timeframe', 'all')
  }
}

const getDateRangeLabel = () => {
  if (filters.dateRange) {
    const start = new Date(filters.dateRange.start).toLocaleDateString()
    const end = new Date(filters.dateRange.end).toLocaleDateString()
    return start === end ? start : `${start} - ${end}`
  }
  return 'Select Dates'
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
      isFavorite ? t('explore.favorites.removed') : t('explore.favorites.added'),
      {
        duration: 2000,
        style: {
          background: isFavorite ? '#dc2626' : '#16a34a',
          color: 'white'
        }
      }
    )
  }

  // FilterChip Component
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

      {/* Mobile-First 3-Lane Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto">
          
          {/* LANE 1: Title + subtitle + counter + refresh button */}
          <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-slate-700/50">
            <div className="flex-1 min-w-0"> {/* min-w-0 prevents flex overflow */}
              <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 mb-1">
                {t('explore.title')}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm text-slate-400">{t('explore.subtitle')}</p>
                {tours.length > 0 && (
                  <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full">
                    {tours.length} {t('explore.available')}
                  </span>
                )}
              </div>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={refreshTours}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg transition-colors min-h-44 ml-4 flex-shrink-0"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{loading ? t('explore.loading') : t('explore.refresh')}</span>
            </button>
          </div>

          {/* LANE 2: Date filters + Sort dropdown */}
          <div className="px-3 sm:px-4 md:px-6 py-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {/* Quick Date Filters */}
                  <div className="flex gap-2 flex-shrink-0">
                    {[
                      { id: 'today', label: t('explore.timeFilters.today'), icon: '☀️' },
                      { id: 'tomorrow', label: t('explore.timeFilters.tomorrow'), icon: '🌅' },
                      { id: 'week', label: t('explore.timeFilters.thisWeek'), icon: '📆' }
                    ].map((timeOption) => (
                      <button
                        key={timeOption.id}
                        onClick={() => {
                          updateFilter('timeframe', timeOption.id)
                          setDateRange(null) // Clear custom date range when quick filter is selected
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-44 ${
                          filters.timeframe === timeOption.id
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                        }`}
                      >
                        <span className="text-base">{timeOption.icon}</span>
                        <span className="whitespace-nowrap">{timeOption.label}</span>
                      </button>
                    ))}

                    {/* Calendar Date Picker Button */}
                    <button
                      onClick={() => setShowDatePicker(true)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-44 ${
                        filters.dateRange
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                    </button>
                  </div>
            </div>
          </div>

          {/* LANE 3: Search field (65%) + Advanced filter + Clear filter */}
          <div className="px-3 sm:px-4 md:px-6 py-3">
            <div className="flex items-center gap-3">
              {/* Search Field */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder={t('explore.searchPlaceholder')}
                  className="w-full pl-12 pr-4 py-2.5 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-base text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
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

              {/* Sort Dropdown */}
              <select
                value={filters.sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-700 border border-slate-600 text-white rounded-lg px-2 py-2 text-sm focus:border-blue-500 min-h-44 ml-auto flex-shrink-0"
              >
                <option value="date">{t('explore.sortOptions.date')}</option>
                <option value="price">{t('explore.sortOptions.price')}</option>
                <option value="availability">{t('explore.sortOptions.availability')}</option>
                <option value="urgency">{t('explore.sortOptions.urgency')}</option>
              </select>
              
              {/* Advanced Filter Button - 35% space */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-all min-h-44 ${
                    showFilters || getActiveFiltersCount() > 0
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {getActiveFiltersCount() > 0 && (
                    <span className="bg-white text-blue-600 text-xs px-2 py-0.5 rounded-full font-bold">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </button>

                

                {/* Clear Filters Button */}
                {getActiveFiltersCount() > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all min-h-44"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Active Filters Display  */}
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

          {/* ADVANCED FILTER PANEL */}
          {showFilters && (
            <div className="border-t border-slate-700 bg-slate-800/95 backdrop-blur-sm">
              <div className="px-3 sm:px-4 md:px-6 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Island Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('explore.filterLabels.island')}</label>
                    <select
                      value={filters.island}
                      onChange={(e) => updateFilter('island', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:border-blue-500"
                    >
                      <option value="all">{t('explore.filterOptions.allIslands')}</option>
                      {availableIslands.map(island => (
                        <option key={island} value={island}>{island}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tour Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('explore.filterLabels.activityType')}</label>
                    <select
                      value={filters.tourType}
                      onChange={(e) => updateFilter('tourType', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:border-blue-500"
                    >
                      <option value="all">{t('explore.filterOptions.allTypes')}</option>
                      {availableTourTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Duration Filter */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('explore.filterLabels.duration')}</label>
                    <select
                      value={filters.duration}
                      onChange={(e) => updateFilter('duration', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:border-blue-500"
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t('explore.filterLabels.priceRange')}</label>
                  <div className="grid grid-cols-2 gap-3 max-w-md">
                    <input
                      type="number"
                      placeholder={t('explore.placeholders.minPrice')}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:border-blue-500"
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
                      placeholder={t('explore.placeholders.maxPrice')}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2.5 text-sm focus:border-blue-500"
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

                {/* Filter Actions */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700">
                  <div className="text-sm text-slate-400">
                    {loading ? t('explore.loading') : `${tours.length} ${t('explore.toursFound')}`}
                  </div>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {t('explore.applyFilters')}
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
            <h3 className="text-xl font-semibold text-slate-400 mb-2">{t('explore.noToursFound')}</h3>
            <p className="text-slate-500 mb-4">{t('explore.noToursFoundDesc')}</p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {t('explore.clearAllFilters')}
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
                    isFavorite ? t('explore.favorites.removed') : t('explore.favorites.added'),
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

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={handleDateSelect}
        currentDateRange={filters.dateRange}
      />
    </div>
  )
}

export default ExploreTab