// operator-dashboard/src/components/BookingsHeader.jsx
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  RefreshCw, Search, Calendar, Filter, 
  AlertCircle, CheckCircle, XCircle, Clock3,
  TrendingUp, DollarSign, Timer, Award
} from 'lucide-react'

const BookingsHeader = ({
  allBookings,
  operator,
  stats,
  bookingFilter,
  setBookingFilter,
  timeFilter,
  setTimeFilter,
  searchTerm,
  setSearchTerm,
  fetchAllBookings,
  formatPrice,
  bookingsLoading
}) => {
  const { t } = useTranslation()

  // 📊 REVENUE CALCULATIONS (Net Focus)
  const revenueStats = useMemo(() => {
    if (!allBookings || allBookings.length === 0) {
      return {
        todayNet: 0,
        weekNet: 0,
        pendingNet: 0,
        criticalCount: 0,
        avgBooking: 0,
        totalNet: 0
      }
    }

    const now = new Date()
    const today = now.toDateString()
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Filter for revenue-generating bookings (confirmed + completed)
    const revenueBookings = allBookings.filter(b => 
      ['confirmed', 'completed'].includes(b.booking_status)
    )

    // Today's net revenue (tours happening today)
    const todayNet = revenueBookings
      .filter(b => {
        const tourDate = new Date(b.tours?.tour_date)
        return tourDate.toDateString() === today
      })
      .reduce((sum, b) => sum + (b.subtotal || 0), 0)

    // This week's net revenue
    const weekNet = revenueBookings
      .filter(b => {
        const tourDate = new Date(b.tours?.tour_date)
        return tourDate >= now && tourDate <= weekFromNow
      })
      .reduce((sum, b) => sum + (b.subtotal || 0) - (b.commission_amount || 0), 0)

    // Pending net revenue at risk
    const pendingBookings = allBookings.filter(b => b.booking_status === 'pending')
    const pendingNet = pendingBookings
      .reduce((sum, b) => sum + (b.subtotal || 0) - (b.commission_amount || 0), 0)

    // Critical priority count (pending + booking closes in 8h)
    const criticalCount = pendingBookings.filter(b => {
      if (!b.tours?.booking_deadline) return false
      const deadline = new Date(b.tours.booking_deadline)
      const hoursUntil = (deadline - now) / (1000 * 60 * 60)
      return hoursUntil <= 8 && hoursUntil > 0
    }).length

    // Average net revenue per confirmed booking
    const avgBooking = revenueBookings.length > 0 
      ? revenueBookings.reduce((sum, b) => sum + (b.subtotal || 0) - (b.commission_amount || 0), 0) / revenueBookings.length
      : 0

    // Total net revenue (all time)
    const totalNet = revenueBookings
      .reduce((sum, b) => sum + (b.subtotal || 0) - (b.commission_amount || 0), 0)

    return {
      todayNet,
      weekNet, 
      pendingNet,
      criticalCount,
      avgBooking,
      totalNet
    }
  }, [allBookings])

  // 🔢 FILTER COUNTS (Dynamic)
  const filterCounts = useMemo(() => {
    if (!allBookings || allBookings.length === 0) {
      return {
        all: 0,
        needsAction: 0,
        deadlineSoon: 0,
        confirmed: 0,
        todaysTours: 0,
        completed: 0,
        declined: 0
      }
    }

    const now = new Date()
    const today = now.toDateString()

    const pendingBookings = allBookings.filter(b => b.booking_status === 'pending')
    
    // Critical priority (pending + booking closes in 8h)
    const deadlineSoon = pendingBookings.filter(b => {
      if (!b.tours?.booking_deadline) return false
      const deadline = new Date(b.tours.booking_deadline)
      const hoursUntil = (deadline - now) / (1000 * 60 * 60)
      return hoursUntil <= 8 && hoursUntil > 0
    }).length

    // Today's tours (any status)
    const todaysTours = allBookings.filter(b => {
      if (!b.tours?.tour_date) return false
      const tourDate = new Date(b.tours.tour_date)
      return tourDate.toDateString() === today
    }).length

    return {
      all: allBookings.length,
      needsAction: pendingBookings.length,
      deadlineSoon,
      confirmed: allBookings.filter(b => b.booking_status === 'confirmed').length,
      todaysTours,
      completed: allBookings.filter(b => b.booking_status === 'completed').length,
      declined: allBookings.filter(b => b.booking_status === 'declined').length
    }
  }, [allBookings])

  // 🎯 TOUR FILTER OPTIONS (Dynamic)
  const tourOptions = useMemo(() => {
    if (!allBookings || allBookings.length === 0) return []
    
    const tourCounts = allBookings.reduce((acc, booking) => {
      const tourName = booking.tours?.tour_name || 'Unknown Activity/Tour'
      acc[tourName] = (acc[tourName] || 0) + 1
      return acc
    }, {})

    return Object.entries(tourCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count) // Sort by booking count
  }, [allBookings])

  // 🔄 REFRESH HANDLER
  const handleRefresh = async () => {
    try {
      await fetchAllBookings()
    } catch (error) {
      console.error('Failed to refresh bookings:', error)
    }
  }

  // 🧹 CLEAR FILTERS
  const clearAllFilters = () => {
    setBookingFilter('all')
    setTimeFilter('all')
    setSearchTerm('')
  }

  return (
    <div className="space-y-6">
      {/* 📊 REVENUE DASHBOARD */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            {t('bookings.header.revenueDashboard')}
          </h2>
          <button
            onClick={handleRefresh}
            disabled={bookingsLoading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${bookingsLoading ? 'animate-spin' : ''}`} />
{t('common.refresh')}
          </button>
        </div>

        {/* Revenue Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Today Net */}
          <div className="bg-slate-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {formatPrice(revenueStats.todayNet)}
            </div>
            <div className="text-xs text-slate-400 mt-1">{t('bookings.revenue.todayNet')}</div>
          </div>

          {/* Week Net */}
          <div className="bg-slate-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {formatPrice(revenueStats.weekNet)}
            </div>
            <div className="text-xs text-slate-400 mt-1">{t('bookings.revenue.weekNet')}</div>
          </div>

          {/* Pending At Risk */}
          <div className="bg-slate-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">
              {formatPrice(revenueStats.pendingNet)}
            </div>
            <div className="text-xs text-slate-400 mt-1">{t('bookings.revenue.pendingRevenue')}</div>
          </div>

          {/* Critical Count */}
          <div className="bg-slate-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">
              {revenueStats.criticalCount}
            </div>
            <div className="text-xs text-slate-400 mt-1">{t('bookings.revenue.criticalDeadline')}</div>
          </div>

          {/* Average Booking */}
          <div className="bg-slate-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {formatPrice(revenueStats.avgBooking)}
            </div>
            <div className="text-xs text-slate-400 mt-1">{t('bookings.revenue.avgBooking')}</div>
          </div>
        </div>
      </div>

      {/* 🎛️ SMART FILTERS */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            {t('bookings.header.smartFilters')}
          </h3>
          <button
            onClick={clearAllFilters}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            {t('bookings.header.clearAll')}
          </button>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('bookings.filters.status')}
            </label>
            <select
              value={bookingFilter}
              onChange={(e) => setBookingFilter(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:border-blue-500"
            >
              <option value="all">{t('bookings.filters.allBookings')} ({filterCounts.all})</option>
              <option value="pending">{t('bookings.filters.needsAction')} ({filterCounts.needsAction})</option>
              <option value="confirmed">{t('bookings.stats.confirmed')} ({filterCounts.confirmed})</option>
              <option value="completed">{t('bookings.stats.completed')} ({filterCounts.completed})</option>
              <option value="declined">{t('bookings.stats.declined')} ({filterCounts.declined})</option>
            </select>
          </div>

          {/* Time Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('bookings.filters.timePeriod')}
            </label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:border-blue-500"
            >
              <option value="all">{t('bookings.filters.allTime')}</option>
              <option value="today">{t('bookings.filters.today')} ({filterCounts.todaysTours})</option>
              <option value="tomorrow">{t('bookings.filters.tomorrow')}</option>
              <option value="week">{t('bookings.filters.thisWeek')}</option>
              <option value="next-week">{t('bookings.filters.nextWeek')}</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('bookings.filters.priority')}
            </label>
            <select
              value={bookingFilter === 'pending' ? 'pending' : 'all'}
              onChange={(e) => {
                if (e.target.value === 'critical') {
                  setBookingFilter('pending')
                  setTimeFilter('8hours')
                } else {
                  setBookingFilter(e.target.value)
                }
              }}
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:border-blue-500"
            >
              <option value="all">{t('bookings.filters.allPriorities')}</option>
              <option value="critical">{t('bookings.filters.critical')} ({filterCounts.deadlineSoon})</option>
              <option value="pending">{t('bookings.filters.allPending')} ({filterCounts.needsAction})</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('bookings.filters.search')}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('bookings.filters.searchPlaceholder')}
                className="w-full bg-slate-700 text-white rounded-lg pl-10 pr-3 py-2 border border-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Quick Action Chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setBookingFilter('pending')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              bookingFilter === 'pending' 
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
            }`}
          >
            {t('bookings.quickActions.needsAction')} ({filterCounts.needsAction})
          </button>
          
          {filterCounts.deadlineSoon > 0 && (
            <button
              onClick={() => {
                setBookingFilter('pending')
                // TODO: Add 8-hour deadline filter logic
              }}
              className="px-3 py-1 rounded-full text-sm bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
            >
              {t('bookings.quickActions.deadlineSoon')} ({filterCounts.deadlineSoon})
            </button>
          )}

          {filterCounts.todaysTours > 0 && (
            <button
              onClick={() => setTimeFilter('today')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                timeFilter === 'today' 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              {t('bookings.quickActions.todaysTours')} ({filterCounts.todaysTours})
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingsHeader