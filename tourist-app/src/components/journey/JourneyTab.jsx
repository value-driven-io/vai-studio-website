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
import VAILogo from '../shared/VAILogo'

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
  const [showFavoritesInOverview, setShowFavoritesInOverview] = useState(false)
  
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
      id: 'urgent',
      label: 'Pending',
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
      emoji: '📸',
      description: 'Completed experiences',
      count: safeUserBookings.past.length
    }
    // Wishlist removed - functionality moved to Overview
  ]

  // Calculate user statistics
  useEffect(() => {
  // Add safety check to prevent execution during invalid states
  if (!safeUserBookings || !safeFavorites) return

  try {
    const uniqueActivityTypes = new Set([
      ...(safeUserBookings.active || []).map(b => b?.tours?.tour_type).filter(Boolean),
      ...(safeUserBookings.upcoming || []).map(b => b?.tours?.tour_type).filter(Boolean),
      ...(safeUserBookings.past || []).map(b => b?.tours?.tour_type).filter(Boolean)
    ]).size

    const achievements = []
    const pastLength = (safeUserBookings.past || []).length
    const favLength = (safeFavorites || []).length
    
    if (pastLength >= 1) achievements.push('🏆 First Adventure')
    if (uniqueActivityTypes >= 3) achievements.push('🤿 Activity Explorer')
    if (pastLength >= 5) achievements.push('🌴 Island Hopper')
    if (favLength >= 10) achievements.push('💕 Wishlist Master')

    const unreadMessages = (safeUserBookings.active || []).filter(booking => 
      booking?.operator_response && booking.operator_response !== ''
    ).length

    setUserStats(prev => ({
      activitiesExplored: uniqueActivityTypes,
      totalActivities: 8,
      currentLevel: uniqueActivityTypes >= 5 ? 'Adventurer' : uniqueActivityTypes >= 3 ? 'Explorer' : 'Beginner',
      streak: Math.min(pastLength, 30),
      achievements,
      unreadMessages
    }))
  } catch (error) {
    console.warn('Error calculating stats:', error)
    // Don't update stats if there's an error
  }
  }, [safeUserBookings?.active?.length, safeUserBookings?.upcoming?.length, safeUserBookings?.past?.length, safeFavorites?.length])


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
        return 'from-slate-900 to-slate-800'
      case 'sunset':
      case 'cruise':
        return 'from-slate-900 to-slate-800'
      case 'hiking':
      case 'adventure':
        return 'from-slate-900 to-slate-800'
      default:
        return 'from-slate-900 to-slate-800'
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
      
      {/* Header */}
      <div className="bg-slate-800/90 backdrop-blur-md border-b border-slate-700 top-0 z-40">
        <div className="max-w-7xl mx-auto">
          
          {/* Progress Strip */}
          <div className="px-4 sm:px-6 py-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">🌏</span>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white">My Journey</h1>
                    <p className="text-sm text-slate-400">
                      Level: {userStats.currentLevel}<br></br>{userStats.activitiesExplored}/{userStats.totalActivities} activities explored
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

          {/* Responsive 4-Button Filter Navigation */}
          <div className="px-4 sm:px-6 py-4">
            {/* Mobile: 2x2 Grid | Desktop: 1x4 Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {journeyStages.map((stage) => {
                const isActive = activeStage === stage.id
                const hasUrgent = stage.urgent && stage.count > 0
                
                return (
                  <button
                    key={stage.id}
                    onClick={() => setActiveStage(stage.id)}
                    className="group relative transition-all duration-300 hover:scale-[1.02]"
                    title={stage.description} // Tooltip for desktop
                  >
                    {/* Urgent pulse background */}
                    {hasUrgent && !isActive && (
                      <div className="absolute inset-0 bg-red-500/20 rounded-xl animate-pulse"></div>
                    )}
                    
                    {/* Main card */}
                    <div className={`relative rounded-xl backdrop-blur-sm border transition-all duration-300 p-3 lg:p-4 ${
                      isActive
                        ? 'border-blue-400 bg-slate-700/60 shadow-lg shadow-blue-500/20'
                        : hasUrgent
                        ? 'border-red-400/60 bg-slate-700/40 hover:border-red-400'
                        : 'border-slate-600/40 bg-slate-700/40 hover:border-slate-500'
                    }`}>
                      
                      {/* Urgent dot indicator */}
                      {hasUrgent && !isActive && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-slate-800"></div>
                      )}
                      
                      {/* Content */}
                      <div className="flex flex-col items-center text-center space-y-2">
                        
                        {/* Emoji */}
                        <div className={`transition-transform duration-300 ${
                          isActive ? 'scale-110' : 'group-hover:scale-105'
                        }`}>
                          <span className="text-2xl lg:text-3xl">{stage.emoji}</span>
                        </div>
                        
                        {/* Label and count row */}
                        <div className="space-y-1">
                          <div className={`font-semibold text-sm lg:text-base transition-colors ${
                            isActive ? 'text-blue-300' : hasUrgent ? 'text-red-300' : 'text-slate-200'
                          }`}>
                            {stage.label}
                          </div>
                          
                          {/* Count badge */}
                          {stage.count > 0 && (
                            <div className={`inline-flex items-center justify-center min-w-[20px] h-5 rounded-full transition-all duration-300 ${
                              hasUrgent
                                ? 'bg-red-500 text-white text-xs font-bold px-1.5'
                                : isActive
                                ? 'bg-blue-500 text-white text-xs font-bold px-1.5'
                                : 'bg-slate-600 text-slate-300 text-xs font-bold px-1.5 group-hover:bg-slate-500'
                            }`}>
                              {stage.count}
                            </div>
                          )}
                        </div>
                        
                        {/* Description - visible on larger screens */}
                        <div className={`hidden sm:block text-xs transition-colors leading-tight ${
                          isActive 
                            ? 'text-blue-200' 
                            : hasUrgent 
                            ? 'text-red-300/80' 
                            : 'text-slate-400 group-hover:text-slate-300'
                        }`}>
                          {stage.description}
                        </div>
                      </div>

                      {/* Active indicator line */}
                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-blue-400 rounded-t-full"></div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
            
            {/* Mobile description tooltip */}
            <div className="sm:hidden mt-3 text-center">
              {journeyStages.find(stage => stage.id === activeStage) && (
                <div className="inline-block bg-slate-800/60 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-slate-700/50">
                  <span className="text-xs text-slate-400">
                    {journeyStages.find(stage => stage.id === activeStage).description}
                  </span>
                </div>
              )}
            </div>
          </div>
          

          {/* Search Bar for non-overview stages */}
          {activeStage !== 'overview' && (
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

          {/* Interactive Quick Stats - Clickable counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Upcoming Tours - Links to "Ready to Go" filter */}
            <button
              onClick={() => setActiveStage('confirmed')}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 group"
            >
              <div className="text-2xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
                {safeUserBookings.upcoming.length}
              </div>
              <div className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Upcoming</div>
              <div className="text-xs text-slate-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to view →
              </div>
            </button>

            {/* Completed Tours - Links to "Memories" filter */}
            <button
              onClick={() => setActiveStage('memories')}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 group"
            >
              <div className="text-2xl font-bold text-green-400 group-hover:text-green-300 transition-colors">
                {safeUserBookings.past.length}
              </div>
              <div className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Completed</div>
              <div className="text-xs text-slate-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to view →
              </div>
            </button>

            {/* Favorites - Toggle inline favorites display */}
            <button
              onClick={() => setShowFavoritesInOverview(!showFavoritesInOverview)}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 group relative"
            >
              <div className="text-2xl font-bold text-purple-400 group-hover:text-purple-300 transition-colors">
                {safeFavorites.length}
              </div>
              <div className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Favorites</div>
              <div className="text-xs text-slate-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {showFavoritesInOverview ? 'Hide favorites ↑' : 'Show favorites ↓'}
              </div>
              {/* Heart icon for favorites */}
              <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-40 transition-opacity">
                <Heart className="w-4 h-4 text-purple-400 fill-current" />
              </div>
            </button>

            {/* Achievements - Scroll to achievements section */}
            <button
              onClick={() => {
                // Scroll to achievements section if it exists
                const achievementsSection = document.querySelector('[data-section="achievements"]');
                if (achievementsSection) {
                  achievementsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-slate-700/50 transition-all duration-300 hover:scale-105 group"
            >
              <div className="text-2xl font-bold text-orange-400 group-hover:text-orange-300 transition-colors">
                {userStats.achievements.length}
              </div>
              <div className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Achievements</div>
              <div className="text-xs text-slate-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                View achievements →
              </div>
            </button>
          </div>

          
          {/* Expandable Favorites Section */}
                {showFavoritesInOverview && safeFavorites.length > 0 && (
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 animate-in slide-in-from-top duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Heart className="w-5 h-5 text-purple-400 fill-current" />
                        <h3 className="text-lg font-semibold text-white">Your Favorites</h3>
                      </div>
                      <button
                        onClick={() => setActiveTab && setActiveTab('explore')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        Manage All
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {safeFavorites.slice(0, 6).map((tourId) => (
                        <div key={tourId} className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-white font-medium text-sm">Favorited Tour</div>
                              <div className="text-xs text-slate-400">ID: {tourId}</div>
                            </div>
                            <button
                              onClick={() => toggleFavorite(tourId)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <Heart className="w-4 h-4 fill-current" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {safeFavorites.length > 6 && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={() => setActiveTab && setActiveTab('explore')}
                          className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                        >
                          View all {safeFavorites.length} favorites →
                        </button>
                      </div>
                    )}
                  </div>
                )}


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
                  <div data-section="achievements" className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6">
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