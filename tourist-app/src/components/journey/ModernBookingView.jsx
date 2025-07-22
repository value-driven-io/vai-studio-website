// File: tourist-app/src/components/journey/ModernBookingView.jsx
import React, { useState, useMemo, useEffect } from 'react'
import { 
  Search, Filter, SlidersHorizontal, X, ChevronDown, 
  RefreshCw, Calendar, MapPin, Tag, ArrowUpDown,
  Timer, CheckCircle, Award, XCircle
} from 'lucide-react'
import StatusCard from './StatusCard'
import BookingDetailModal from './BookingDetailModal'
import { TOUR_TYPE_EMOJIS } from '../../constants/moods'

const ModernBookingView = ({
  userBookings = { active: [], upcoming: [], past: [] },
  loading = false,
  formatPrice,
  formatDate, 
  formatTime,
  onContactOperator,
  onRebook,
  onGetSupport,
  canContactOperator,
  canRebook,
  onRefresh
}) => {
  // Local state
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  // Filter state
  const [filters, setFilters] = useState({
    status: 'all', // all, pending, confirmed, completed, cancelled
    dateRange: 'all', // all, this_week, this_month, past
    tourType: 'all', // all, diving, hiking, etc.
    island: 'all', // all, tahiti, moorea, etc.
    sortBy: 'status_priority' // status_priority, date_newest, date_oldest, tour_date, alphabetical
  })

  // Combine all bookings into one array with metadata
  const allBookings = useMemo(() => {
    const combined = [
      ...userBookings.active.map(booking => ({ ...booking, category: 'active' })),
      ...userBookings.upcoming.map(booking => ({ ...booking, category: 'upcoming' })),
      ...userBookings.past.map(booking => ({ ...booking, category: 'past' }))
    ]
    return combined
  }, [userBookings])

  // Get unique filter options from bookings
  const filterOptions = useMemo(() => {
    const tourTypes = [...new Set(allBookings.map(b => b.tours?.tour_type).filter(Boolean))]
    const islands = [...new Set(allBookings.map(b => b.operators?.island).filter(Boolean))]
    
    return {
      tourTypes: tourTypes.sort(),
      islands: islands.sort()
    }
  }, [allBookings])

  // Status priority for sorting
  const getStatusPriority = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'awaiting_confirmation': return 1
      case 'confirmed': return 2
      case 'completed': return 3
      case 'declined': return 4
      case 'cancelled': return 5
      default: return 6
    }
  }

  // Filter and sort bookings
  const filteredAndSortedBookings = useMemo(() => {
    let filtered = [...allBookings]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(booking => 
        booking.tours?.tour_name?.toLowerCase().includes(query) ||
        booking.operators?.company_name?.toLowerCase().includes(query) ||
        booking.booking_reference?.toLowerCase().includes(query) ||
        booking.operators?.island?.toLowerCase().includes(query) ||
        booking.tours?.tour_type?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(booking => {
        const status = booking.booking_status?.toLowerCase()
        switch (filters.status) {
          case 'pending': return status === 'pending' || status === 'awaiting_confirmation'
          case 'confirmed': return status === 'confirmed'
          case 'completed': return status === 'completed'
          case 'cancelled': return status === 'cancelled' || status === 'declined'
          default: return true
        }
      })
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.created_at)
        const tourDate = booking.tours?.tour_date ? new Date(booking.tours.tour_date) : null

        switch (filters.dateRange) {
          case 'this_week': return bookingDate >= oneWeekAgo
          case 'this_month': return bookingDate >= oneMonthAgo
          case 'past': return tourDate ? tourDate < now : bookingDate < oneMonthAgo
          default: return true
        }
      })
    }

    // Tour type filter
    if (filters.tourType !== 'all') {
      filtered = filtered.filter(booking => booking.tours?.tour_type === filters.tourType)
    }

    // Island filter
    if (filters.island !== 'all') {
      filtered = filtered.filter(booking => booking.operators?.island === filters.island)
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'status_priority':
          const statusDiff = getStatusPriority(a.booking_status) - getStatusPriority(b.booking_status)
          if (statusDiff !== 0) return statusDiff
          // Secondary sort by tour date (upcoming first)
          const dateA = a.tours?.tour_date ? new Date(a.tours.tour_date) : new Date(0)
          const dateB = b.tours?.tour_date ? new Date(b.tours.tour_date) : new Date(0)
          return dateA - dateB

        case 'date_newest':
          return new Date(b.created_at) - new Date(a.created_at)

        case 'date_oldest':
          return new Date(a.created_at) - new Date(b.created_at)

        case 'tour_date':
          const tourDateA = a.tours?.tour_date ? new Date(a.tours.tour_date) : new Date(0)
          const tourDateB = b.tours?.tour_date ? new Date(b.tours.tour_date) : new Date(0)
          return tourDateA - tourDateB

        case 'alphabetical':
          const nameA = a.tours?.tour_name || ''
          const nameB = b.tours?.tour_name || ''
          return nameA.localeCompare(nameB)

        default:
          return 0
      }
    })

    return filtered
  }, [allBookings, searchQuery, filters])

  // Status counts for filter badges
  const statusCounts = useMemo(() => {
    return {
      pending: allBookings.filter(b => ['pending', 'awaiting_confirmation'].includes(b.booking_status?.toLowerCase())).length,
      confirmed: allBookings.filter(b => b.booking_status?.toLowerCase() === 'confirmed').length,
      completed: allBookings.filter(b => b.booking_status?.toLowerCase() === 'completed').length,
      cancelled: allBookings.filter(b => ['cancelled', 'declined'].includes(b.booking_status?.toLowerCase())).length
    }
  }, [allBookings])

  // Handle detail modal
  const handleShowDetails = (booking) => {
    setSelectedBooking(booking)
    setShowDetailModal(true)
  }

  const handleCloseDetailModal = () => {
    setShowDetailModal(false)
    setSelectedBooking(null)
  }

  // Filter update helper
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: 'all',
      dateRange: 'all', 
      tourType: 'all',
      island: 'all',
      sortBy: 'status_priority'
    })
    setSearchQuery('')
  }

  const hasActiveFilters = searchQuery || Object.entries(filters).some(([key, value]) => 
    key !== 'sortBy' && value !== 'all'
  )

  return (
    <div className="space-y-4">
      
      {/* Header Controls */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
        
        {/* Search Bar */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookings, tours, operators..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-white text-blue-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                !
              </span>
            )}
          </button>

          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t border-slate-700">
            
            {/* Quick Status Filters */}
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Status</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => updateFilter('status', 'all')}
                  className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                    filters.status === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  All ({allBookings.length})
                </button>
                <button
                  onClick={() => updateFilter('status', 'pending')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                    filters.status === 'pending' 
                      ? 'bg-yellow-600 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Timer className="w-3 h-3" />
                  Pending ({statusCounts.pending})
                </button>
                <button
                  onClick={() => updateFilter('status', 'confirmed')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                    filters.status === 'confirmed' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <CheckCircle className="w-3 h-3" />
                  Confirmed ({statusCounts.confirmed})
                </button>
                <button
                  onClick={() => updateFilter('status', 'completed')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                    filters.status === 'completed' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Award className="w-3 h-3" />
                  Completed ({statusCounts.completed})
                </button>
                {statusCounts.cancelled > 0 && (
                  <button
                    onClick={() => updateFilter('status', 'cancelled')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                      filters.status === 'cancelled' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <XCircle className="w-3 h-3" />
                    Cancelled ({statusCounts.cancelled})
                  </button>
                )}
              </div>
            </div>

            {/* Advanced Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Date Range */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => updateFilter('dateRange', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="this_week">This Week</option>
                  <option value="this_month">This Month</option>
                  <option value="past">Past Tours</option>
                </select>
              </div>

              {/* Tour Type */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Tour Type</label>
                <select
                  value={filters.tourType}
                  onChange={(e) => updateFilter('tourType', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  {filterOptions.tourTypes.map(type => (
                    <option key={type} value={type}>
                      {TOUR_TYPE_EMOJIS[type] || '🌴'} {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Island */}
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Island</label>
                <select
                  value={filters.island}
                  onChange={(e) => updateFilter('island', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Islands</option>
                  {filterOptions.islands.map(island => (
                    <option key={island} value={island}>
                      {island}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sort & Clear Row */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-700">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-300">Sort by:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="status_priority">Status Priority</option>
                  <option value="date_newest">Newest First</option>
                  <option value="date_oldest">Oldest First</option>
                  <option value="tour_date">Tour Date</option>
                  <option value="alphabetical">A-Z</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-slate-400 px-2">
        <span>
          Showing {filteredAndSortedBookings.length} of {allBookings.length} bookings
          {hasActiveFilters && ' (filtered)'}
        </span>
        {filteredAndSortedBookings.length > 0 && (
          <span className="text-slate-500">
            Sorted by {filters.sortBy.replace('_', ' ')}
          </span>
        )}
      </div>

      {/* Booking List */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeletons
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-800/50 rounded-xl h-48 animate-pulse border border-slate-700/50"></div>
            ))}
          </div>
        ) : filteredAndSortedBookings.length === 0 ? (
          // Empty state
          <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/50">
            <div className="text-6xl mb-4">
              {hasActiveFilters ? '🔍' : '📋'}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {hasActiveFilters ? 'No bookings match your filters' : 'No bookings found'}
            </h3>
            <p className="text-slate-400 mb-6">
              {hasActiveFilters 
                ? 'Try adjusting your search or filter criteria'
                : 'Your bookings will appear here once you make your first booking'
              }
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          // Booking cards
          filteredAndSortedBookings.map((booking) => (
            <StatusCard
              key={booking.id}
              booking={booking}
              formatPrice={formatPrice}
              formatDate={formatDate}
              formatTime={formatTime}
              onContactOperator={onContactOperator}
              onRebook={onRebook}
              onGetSupport={onGetSupport}
              onShowDetails={handleShowDetails}
              canContactOperator={canContactOperator}
              canRebook={canRebook}
            />
          ))
        )}
      </div>

      {/* Detail Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        formatPrice={formatPrice}
        formatDate={formatDate}
        formatTime={formatTime}
        onContactOperator={onContactOperator}
        onRebook={onRebook}
        onGetSupport={onGetSupport}
        canContactOperator={canContactOperator}
        canRebook={canRebook}
      />
    </div>
  )
}

export default ModernBookingView