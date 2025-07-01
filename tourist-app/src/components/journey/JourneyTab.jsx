import React, { useState, useEffect, useRef } from 'react'
import { 
  Calendar, Clock, MapPin, Users, Star, Heart, Phone, MessageCircle,
  RefreshCw, Search, Mail, Copy, ExternalLink, RotateCcw, BookOpen,
  CheckCircle, XCircle, AlertCircle, Timer, Award, TrendingUp,
  Plus, Zap, Flame, Trophy, Rocket, Target, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useUserJourney } from '../../hooks/useUserJourney'
import { useAppStore } from '../../stores/bookingStore'
import { TOUR_TYPE_EMOJIS } from '../../constants/moods'
import BookingModal from '../booking/BookingModal'
import BookingLookup from './BookingLookup'
import OverviewSection from './OverviewSection'
import BookingSection from './BookingSection'
import FavoritesSection from './FavoritesSection'
import toast from 'react-hot-toast'

const JourneyTab = () => {
  const { 
    userBookings, 
    loading, 
    refreshBookings, 
    fetchUserBookings,
    getBookingStatusColor, 
    getBookingStatusIcon,
    canContactOperator,
    canRebook,
    formatPrice,
    formatDate,
    formatTime,
    getTotalBookings,
    getNextUpcomingTour,
    getUserContactInfo
  } = useUserJourney()

  const { favorites, toggleFavorite, setActiveTab } = useAppStore()
  
  // Enhanced state for journey stages
  const [activeStage, setActiveStage] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showRebookModal, setShowRebookModal] = useState(false)
  const [rebookTour, setRebookTour] = useState(null)
  const [showLookupModal, setShowLookupModal] = useState(false)
  
  // Gamification state
  const [userStats, setUserStats] = useState({
    activitiesExplored: 0,
    totalActivities: 8,
    currentLevel: 'Explorer',
    streak: 0,
    achievements: [],
    unreadMessages: 0
  })

  // Swipe navigation
  const stageContainerRef = useRef(null)
  // Scroll Navigation Filter
  const [canScrollLeft, setCanScrollLeft] = useState(false)
 const [canScrollRight, setCanScrollRight] = useState(true)

  // Safe data access
  const safeUserBookings = userBookings || { active: [], upcoming: [], past: [] }
  const safeFavorites = favorites || []

  // Enhanced journey stages
  const journeyStages = [
    {
      id: 'overview',
      label: 'Overview',
      emoji: '📊',
      description: 'Your journey at a glance'
    },
    {
      id: 'planning',
      label: 'Planning',
      emoji: '🎯',
      description: 'Draft & saved tours',
      count: safeFavorites.length
    },
    {
      id: 'urgent',
      label: 'Action Needed',
      emoji: '⚡',
      description: 'Needs confirmation',
      count: safeUserBookings.active.filter(booking => 
        booking?.booking_status === 'pending' || 
        booking?.booking_status === 'awaiting_confirmation'
      ).length,
      urgent: true
    },
    {
      id: 'confirmed',
      label: 'Ready to Go',
      emoji: '🚀',
      description: 'Confirmed adventures',
      count: safeUserBookings.upcoming.length
    },
    {
      id: 'memories',
      label: 'Memories',
      emoji: '🌺',
      description: 'Completed experiences',
      count: safeUserBookings.past.length
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      emoji: '💕',
      description: 'Favorited tours',
      count: safeFavorites.length
    }
  ]

  // Calculate user statistics
  useEffect(() => {
    try {
      const uniqueActivityTypes = new Set([
        ...safeUserBookings.active.map(b => b?.tours?.tour_type).filter(Boolean),
        ...safeUserBookings.upcoming.map(b => b?.tours?.tour_type).filter(Boolean),
        ...safeUserBookings.past.map(b => b?.tours?.tour_type).filter(Boolean)
      ]).size

      const achievements = []
      if (safeUserBookings.past.length >= 1) achievements.push('🏆 First Adventure')
      if (uniqueActivityTypes >= 3) achievements.push('🤿 Activity Explorer')
      if (safeUserBookings.past.length >= 5) achievements.push('🌴 Island Hopper')
      if (safeFavorites.length >= 5) achievements.push('💕 Wishlist Master')

      const unreadMessages = safeUserBookings.active.filter(booking => 
        booking?.operator_response && booking.operator_response !== ''
      ).length

      setUserStats({
        activitiesExplored: uniqueActivityTypes,
        totalActivities: 8,
        currentLevel: uniqueActivityTypes >= 5 ? 'Adventurer' : uniqueActivityTypes >= 3 ? 'Explorer' : 'Beginner',
        streak: Math.min(safeUserBookings.past.length, 30),
        achievements,
        unreadMessages
      })

      useEffect(() => {
      checkScrollPosition()
      window.addEventListener('resize', checkScrollPosition)
      return () => window.removeEventListener('resize', checkScrollPosition)
    }, [])
    } catch (error) {
      console.warn('Error calculating stats:', error)
    }
  }, [safeUserBookings, safeFavorites])

  // Get next tour for countdown
  const nextTour = getNextUpcomingTour ? getNextUpcomingTour() : null
  const getCountdownDisplay = () => {
    if (!nextTour?.tour_date) return null
    
    try {
      const tourDate = new Date(nextTour.tour_date)
      const now = new Date()
      const diffMs = tourDate - now
      
      if (diffMs <= 0) return 'Starting soon!'
      
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      
      if (days > 0) return `${days}d ${hours}h until next adventure`
      return `${hours}h until next adventure`
    } catch (error) {
      return null
    }
  }

  // Get background gradient
  const getBackgroundGradient = () => {
    if (!nextTour) return 'from-slate-900 to-slate-800'
    
    switch (nextTour.tour_type) {
      case 'diving':
      case 'snorkeling':
        return 'from-blue-900/40 to-slate-800'
      case 'sunset':
      case 'cruise':
        return 'from-orange-900/40 to-slate-800'
      case 'hiking':
      case 'adventure':
        return 'from-green-900/40 to-slate-800'
      default:
        return 'from-teal-900/40 to-slate-800'
    }
  }

  // Scroll Filter left right 
  const checkScrollPosition = () => {
  if (stageContainerRef.current) {
    const { scrollLeft, scrollWidth, clientWidth } = stageContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }
}

  // Filter bookings by search
  const filterBookings = (bookingsList) => {
    if (!searchQuery.trim()) return bookingsList
    
    const query = searchQuery.toLowerCase()
    return bookingsList.filter(booking => 
      booking.tours?.tour_name?.toLowerCase().includes(query) ||
      booking.operators?.company_name?.toLowerCase().includes(query) ||
      booking.booking_reference?.toLowerCase().includes(query) ||
      booking.operators?.island?.toLowerCase().includes(query)
    )
  }

  // Get filtered bookings for enhanced stages
  const getFilteredBookings = () => {
    switch (activeStage) {
      case 'urgent':
        return safeUserBookings.active.filter(booking => 
          booking?.booking_status === 'pending' || 
          booking?.booking_status === 'awaiting_confirmation'
        )
      case 'confirmed':
        return safeUserBookings.upcoming
      case 'memories':
        return safeUserBookings.past
      default:
        return []
    }
  }

  const handleContactOperator = (booking) => {
    if (booking.operators?.whatsapp_number) {
      const message = `Hi! I have a confirmed booking: ${booking.booking_reference}. Looking forward to the tour!`
      const url = `https://wa.me/${booking.operators.whatsapp_number}?text=${encodeURIComponent(message)}`
      window.open(url, '_blank')
    } else if (booking.operators?.phone) {
      window.open(`tel:${booking.operators.phone}`, '_self')
    }
  }

  const handleRebook = (booking) => {
    if (booking.tours) {
      // Convert booking tour data to tour format for BookingModal
      const tourData = {
        ...booking.tours,
        id: booking.tour_id,
        operator_id: booking.operator_id,
        company_name: booking.operators?.company_name,
        operator_island: booking.operators?.island,
        whatsapp_number: booking.operators?.whatsapp_number,
        discount_price_adult: booking.adult_price,
        discount_price_child: booking.child_price,
        available_spots: 10, // Default since we don't have this data
        max_capacity: 10
      }
      
      setRebookTour(tourData)
      setShowRebookModal(true)
    }
  }

  const copyBookingReference = (reference) => {
    navigator.clipboard.writeText(reference)
    toast.success('Booking reference copied!')
  }

  const handleGetSupport = (booking) => {
    const message = `Hi! I need help with my booking ${booking.booking_reference}. Please assist me.`
    const url = `https://wa.me/68987269065?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const handleLookupBookings = async (email, whatsapp) => {
    try {
      const bookings = await fetchUserBookings(email, whatsapp)
      if (bookings && bookings.length > 0) {
        toast.success(`Found ${bookings.length} booking${bookings.length !== 1 ? 's' : ''}!`)
        setActiveStage('overview') // Switch to overview to show results
      } else {
        toast.error('No bookings found for this email/WhatsApp')
      }
    } catch (error) {
      toast.error('Failed to find bookings. Please try again.')
    }
  }

  // Helper functions for Savings calculation (for favorites)
  const calculateSavings = (originalPrice, discountPrice) => {
    if (!originalPrice || !discountPrice || originalPrice <= discountPrice) return 0
    return originalPrice - discountPrice
  }

  const getUrgencyColor = (hoursUntilDeadline) => {
    if (!hoursUntilDeadline) return 'bg-slate-500/20 text-slate-400'
    if (hoursUntilDeadline <= 2) return 'bg-red-500/20 text-red-400'
    if (hoursUntilDeadline <= 4) return 'bg-orange-500/20 text-orange-400'
    if (hoursUntilDeadline <= 8) return 'bg-yellow-500/20 text-yellow-400'
    return 'bg-green-500/20 text-green-400'
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient()} transition-all duration-1000`}>
      {/* Enhanced Header */}
      <div className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          
          {/* Progress Strip */}
          <div className="px-4 sm:px-6 py-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🗺️</span>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white">My Journey</h1>
                    <p className="text-sm text-slate-400">
                      Level: {userStats.currentLevel} • {userStats.activitiesExplored}/{userStats.totalActivities} activities explored
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-1000 rounded-full"
                      style={{ width: `${(userStats.activitiesExplored / userStats.totalActivities) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {Math.round((userStats.activitiesExplored / userStats.totalActivities) * 100)}%
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 ml-4">
                {/* Achievements */}
                {userStats.achievements.length > 0 && (
                  <div className="hidden sm:flex items-center gap-1">
                    {userStats.achievements.slice(0, 2).map((achievement, index) => (
                      <span key={index} className="text-lg" title={achievement}>
                        {achievement.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                )}

                {/* Streak */}
                {userStats.streak > 0 && (
                  <div className="flex items-center gap-1 bg-orange-500/20 px-2 py-1 rounded-full">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span className="text-xs text-orange-400 font-bold">{userStats.streak}</span>
                  </div>
                )}

                {/* Messages */}
                {userStats.unreadMessages > 0 && (
                  <div className="relative">
                    <MessageCircle className="w-5 h-5 text-blue-400" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {userStats.unreadMessages}
                    </span>
                  </div>
                )}

                {/* Find Bookings Button */}
                <button
                  onClick={() => setShowLookupModal(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Find Bookings</span>
                </button>

                {/* Refresh */}
                <button
                  onClick={refreshBookings}
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Countdown */}
            {getCountdownDisplay() && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-medium">{getCountdownDisplay()}</span>
                {nextTour && (
                  <span className="text-slate-400">• {nextTour.tour_name}</span>
                )}
              </div>
            )}
          </div>

          {/* Enhanced Stage Navigation with Scroll Indicators */}
          <div className="px-4 sm:px-6 py-3 relative">
            {/* Left Scroll Indicator */}
            {canScrollLeft && (
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                <div className="bg-gradient-to-r from-slate-800 to-transparent w-8 h-full flex items-center">
                  <ChevronLeft className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            )}
            
            {/* Right Scroll Indicator */}
            {canScrollRight && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                <div className="bg-gradient-to-l from-slate-800 to-transparent w-8 h-full flex items-center justify-end">
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            )}

            <div 
              ref={stageContainerRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
              onScroll={checkScrollPosition}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >

              {journeyStages.map((stage) => {
                const isActive = activeStage === stage.id
                const hasUrgent = stage.urgent && stage.count > 0
                
                return (
                  <button
                    key={stage.id}
                    onClick={() => setActiveStage(stage.id)}
                    className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 min-w-max ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 scale-105'
                        : hasUrgent
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{stage.emoji}</span>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span>{stage.label}</span>
                        {stage.count > 0 && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            hasUrgent
                              ? 'bg-red-500 text-white'
                              : isActive
                              ? 'bg-white text-blue-600'
                              : 'bg-slate-600 text-slate-300'
                          }`}>
                            {stage.count}
                          </span>
                        )}
                      </div>
                      <div className="text-xs opacity-75">{stage.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Search Bar for non-overview stages */}
          {activeStage !== 'overview' && activeStage !== 'planning' && activeStage !== 'wishlist' && (
            <div className="px-4 sm:px-6 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bookings..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-base text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {/* Refresh Reminder */}
        {getTotalBookings() > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-6">
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <RefreshCw className="w-4 h-4" />
              <span>Click refresh for latest status updates on bookings</span>
            </div>
          </div>
        )}

        {loading && activeStage === 'overview' ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-800/50 rounded-xl h-32 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Overview Section */}
            {activeStage === 'overview' && (
              <div className="space-y-6">
                {/* Original Overview Section if available */}
                {getTotalBookings() > 0 && OverviewSection && getTotalBookings && getNextUpcomingTour && (
                  <OverviewSection 
                    userBookings={safeUserBookings}
                    favorites={safeFavorites}
                    getTotalBookings={getTotalBookings}
                    getNextUpcomingTour={getNextUpcomingTour}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    formatPrice={formatPrice}
                    setActiveSection={setActiveStage}
                    setActiveTab={setActiveTab}
                  />
                )}
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{safeUserBookings.upcoming.length}</div>
                    <div className="text-sm text-slate-400">Upcoming</div>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{safeUserBookings.past.length}</div>
                    <div className="text-sm text-slate-400">Completed</div>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">{safeFavorites.length}</div>
                    <div className="text-sm text-slate-400">Favorites</div>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-orange-400">{userStats.achievements.length}</div>
                    <div className="text-sm text-slate-400">Achievements</div>
                  </div>
                </div>

                {/* Add missing booking */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-md font-medium text-white mb-1">Missing Bookings?</h4>
                      <p className="text-sm text-slate-400">Find bookings by email or WhatsApp</p>
                    </div>
                    <button
                      onClick={() => setShowLookupModal(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Find
                    </button>
                  </div>
                </div>

                {/* Achievements */}
                {userStats.achievements.length > 0 && (
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">🏆 Your Achievements</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {userStats.achievements.map((achievement, index) => (
                        <div key={index} className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-3">
                          <span className="text-white font-medium">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No bookings state */}
                {getTotalBookings() === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🌴</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Welcome to Your Journey</h3>
                    <p className="text-slate-400 mb-6">Your French Polynesia adventure starts here</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">

                      <button
                        onClick={() => setActiveTab && setActiveTab('explore')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        Explore Tours
                      </button>
                      <button
                        onClick={() => setShowLookupModal(true)}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        Find My Bookings
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Favorites/Wishlist */}
            {(activeStage === 'planning' || activeStage === 'wishlist') && (
              <FavoritesSection
                favorites={safeFavorites}
                toggleFavorite={toggleFavorite}
                setActiveTab={setActiveTab}
                formatPrice={formatPrice}
                formatDate={formatDate}
                formatTime={formatTime}
                calculateSavings={calculateSavings}
                getUrgencyColor={getUrgencyColor}
              />
            )}

            {/* Enhanced Booking Stages */}
            {(activeStage === 'urgent' || activeStage === 'confirmed' || activeStage === 'memories') && (
              <div className="space-y-4">
                {getFilteredBookings().length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">
                      {activeStage === 'urgent' ? '⚡' : activeStage === 'confirmed' ? '🚀' : '🌺'}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {activeStage === 'urgent' && 'No action needed'}
                      {activeStage === 'confirmed' && 'No confirmed tours yet'}
                      {activeStage === 'memories' && 'No completed adventures yet'}
                    </h3>
                    <p className="text-slate-400 mb-6">
                      {activeStage === 'urgent' && 'All your bookings are up to date!'}
                      {activeStage === 'confirmed' && 'Book your first adventure to get started'}
                      {activeStage === 'memories' && 'Your completed tours will appear here'}
                    </p>
                    <button
                      onClick={() => setActiveTab && setActiveTab('explore')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Explore Tours
                    </button>
                  </div>
                ) : (
                  <BookingSection
                    title={
                      activeStage === 'urgent' ? 'Action Needed' :
                      activeStage === 'confirmed' ? 'Ready to Go' : 'Your Memories'
                    }
                    bookings={getFilteredBookings()}
                    filteredBookings={filterBookings(getFilteredBookings())}
                    emptyMessage="No bookings in this category"
                    emptyIcon={Timer}
                    handleContactOperator={handleContactOperator}
                    handleRebook={handleRebook}
                    copyBookingReference={copyBookingReference}
                    handleGetSupport={handleGetSupport}
                    canContactOperator={canContactOperator}
                    canRebook={canRebook}
                    formatPrice={formatPrice}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    getBookingStatusColor={getBookingStatusColor}
                    getBookingStatusIcon={getBookingStatusIcon}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Fixed Floating Book Tour Button - Positioned above navigation */}
      <div className="fixed bottom-20 right-6 z-50">
        <button
          onClick={() => setActiveTab && setActiveTab('explore')}
          className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white p-4 rounded-full shadow-lg shadow-blue-600/25 transition-all duration-300 hover:scale-110 flex items-center gap-2 group"
        >
          <Plus className="w-6 h-6" />
          <span className="hidden group-hover:block text-sm font-medium pr-2 animate-in fade-in duration-200">
            Book Tour
          </span>
        </button>
      </div>

      {/* Modals */}
      {showRebookModal && rebookTour && (
        <BookingModal 
          tour={rebookTour}
          isOpen={showRebookModal}
          onClose={() => {
            setShowRebookModal(false)
            setRebookTour(null)
          }}
        />
      )}

      <BookingLookup 
        isOpen={showLookupModal}
        onClose={() => setShowLookupModal(false)}
        onSearch={handleLookupBookings}
      />
    </div>
  )
}

export default JourneyTab