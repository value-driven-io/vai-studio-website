import { useState, useEffect } from 'react'
import { 
  RefreshCw, Search, Plus, AlertCircle, Home, Activity, Trophy
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useUserJourney } from '../../hooks/useUserJourney'
import { useAppStore } from '../../stores/bookingStore'
import BookingModal from '../booking/BookingModal'
import BookingLookup from './BookingLookup'
import SimplifiedBookingView from './SimplifiedBookingView'
import NextTourCard from './NextTourCard'
import toast from 'react-hot-toast'

const JourneyTab = () => {
  const { t } = useTranslation()
  const { 
    userBookings, 
    loading, 
    refreshBookings, 
    fetchUserBookings,
    canContactOperator,
    canRebook,
    formatPrice,
    formatDate,
    formatTime,
    getTotalBookings,
    getNextUpcomingTour
  } = useUserJourney()

  const { setActiveTab, journeyStage, setJourneyStage } = useAppStore()
  
  // Simplified state - only 3 main views
  const [activeView, setActiveView] = useState(journeyStage || 'dashboard')
  const [showRebookModal, setShowRebookModal] = useState(false)
  const [rebookTour, setRebookTour] = useState(null)
  const [showLookupModal, setShowLookupModal] = useState(false)
  
  // Simplified stats - focus on practical information
  const [userStats, setUserStats] = useState({
    totalBookings: 0,
    completedTours: 0,
    upcomingTours: 0,
    pendingActions: 0
  })


  // Respond to external navigation changes
  useEffect(() => {
    if (journeyStage && journeyStage !== activeView) {
      setActiveView(journeyStage)
      setJourneyStage(null)
    }
  }, [journeyStage, activeView, setJourneyStage])

  // Safe data access
  const safeUserBookings = userBookings || { active: [], upcoming: [], past: [] }

  // Simplified 3-category system with Lucide icons
  const journeyViews = [
    {
      id: 'dashboard',
      label: t('journeyTab.navigation.dashboard', { default: 'Dashboard' }),
      shortLabel: t('journeyTab.navigation.dashboardShort', { default: 'Home' }),
      icon: Home,
      description: t('journeyTab.navigation.dashboardDesc', { default: 'Overview of your bookings' })
    },
    {
      id: 'active',
      label: t('journeyTab.navigation.active', { default: 'Active' }),
      shortLabel: t('journeyTab.navigation.activeShort', { default: 'Active' }),
      icon: Activity,
      description: t('journeyTab.navigation.activeDesc', { default: 'Pending and upcoming tours' }),
      count: safeUserBookings.active.length + safeUserBookings.upcoming.length,
      urgent: safeUserBookings.active.length > 0
    },
    {
      id: 'completed',
      label: t('journeyTab.navigation.completed', { default: 'Completed' }),
      shortLabel: t('journeyTab.navigation.completedShort', { default: 'Done' }),
      icon: Trophy,
      description: t('journeyTab.navigation.completedDesc', { default: 'Your travel memories' }),
      count: safeUserBookings.past.length
    }
  ]

  // Calculate simplified user statistics
  useEffect(() => {
    if (!safeUserBookings) return

    const pendingActions = safeUserBookings.active.filter(booking => 
      booking?.booking_status === 'pending' || booking?.operator_response
    ).length

    setUserStats({
      totalBookings: getTotalBookings(),
      completedTours: safeUserBookings.past.length,
      upcomingTours: safeUserBookings.upcoming.length,
      pendingActions
    })
  }, [safeUserBookings, getTotalBookings])


  // Get next tour for display
  const nextTour = getNextUpcomingTour ? getNextUpcomingTour() : null

  // Get bookings for current view
  const getViewBookings = () => {
    switch (activeView) {
      case 'active':
        return [...safeUserBookings.active, ...safeUserBookings.upcoming]
      case 'completed':
        return safeUserBookings.past
      default:
        return []
    }
  }

  // Simplified contact operator handler
  const handleContactOperator = (booking) => {
    if (booking.booking_status === 'confirmed') {
      setActiveTab('messages')
      toast.success(t('journey.messages.openingChat', { 
        operator: booking.operators?.company_name || 'operator',
        default: 'Opening chat with {{operator}}'
      }))
    } else {
      if (booking.operators?.whatsapp_number) {
        const message = `Hi! I have a booking request: ${booking.booking_reference}. When will you confirm?`
        const url = `https://wa.me/${booking.operators.whatsapp_number}?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
      } else if (booking.operators?.phone) {
        window.open(`tel:${booking.operators.phone}`, '_self')
      }
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


  const handleGetSupport = (booking) => {
    const message = `Hi! I need help with my booking ${booking.booking_reference}. Please assist me.`
    const url = `https://wa.me/68987269065?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const handleLookupBookings = async (email, whatsapp) => {
    try {
      const bookings = await fetchUserBookings(email, whatsapp)
      if (bookings && bookings.length > 0) {
        toast.success(t('journey.messages.bookingsFound', { count: bookings.length }))
        setActiveView('dashboard') // Switch to dashboard to show results
      } else {
        toast.error(t('journey.messages.noBookingsFound'))
      }
    } catch (error) {
      toast.error(t('journey.messages.bookingSearchFailed'))
    }
  }


  return (
    <div className="min-h-screen">
      
      {/* Simplified Header */}
      <div className="backdrop-blur-md border-b border-ui-border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl font-bold text-ui-text-primary">
                  {t('journeyTab.header.yourBookings', { default: 'Your Bookings' })}
                </h1>
                <p className="text-sm text-ui-text-tertiary">
                  {userStats.totalBookings > 0 
                    ? t('journeyTab.header.bookingsCount', { 
                        count: userStats.totalBookings, 
                        default: '{{count}} total bookings'
                      })
                    : t('journeyTab.header.noBookings', { default: 'No bookings yet' })
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Pending Actions Indicator */}
              {userStats.pendingActions > 0 && (
                <div className="flex items-center gap-2 bg-status-warning-subtle px-3 py-1.5 rounded-full">
                  <AlertCircle className="w-4 h-4 text-status-warning" />
                  <span className="text-sm text-status-warning font-medium">
                    {userStats.pendingActions} {t('journeyTab.header.actionNeeded', { default: 'action needed' })}
                  </span>
                </div>
              )}

              {/* Find Bookings */}
              <button
                onClick={() => setShowLookupModal(true)}
                className="flex items-center gap-2 bg-ui-surface-secondary hover:bg-ui-surface-tertiary text-ui-text-primary px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">{t('journeyTab.navigation.findBookings', { default: 'Find Bookings' })}</span>
              </button>

              {/* Refresh */}
              <button
                onClick={refreshBookings}
                className="p-2 bg-ui-surface-secondary hover:bg-ui-surface-tertiary rounded-lg transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 text-ui-text-primary ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Optimized Mobile-First Navigation */}
        <div className="px-4 sm:px-6 py-4 border-t border-ui-border-primary">
          <div className="grid grid-cols-3 gap-3">
            {journeyViews.map((view) => {
              const isActive = activeView === view.id
              const hasUrgent = view.urgent && view.count > 0
              const IconComponent = view.icon
              
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={`relative flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-interactive-primary text-ui-text-primary shadow-lg transform scale-105'
                      : hasUrgent
                      ? 'bg-status-warning-subtle text-status-warning border border-status-warning/30'
                      : 'bg-ui-surface-secondary/40 text-ui-text-secondary'
                  } journey-stage-button`}
                  title={view.description}
                >
                  {/* Icon with urgent indicator */}
                  <div className="relative">
                    <IconComponent className={`w-6 h-6 ${
                      isActive ? 'text-ui-text-primary' : hasUrgent ? 'text-status-warning' : 'text-ui-text-tertiary'
                    }`} />
                    {hasUrgent && !isActive && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-status-warning rounded-full animate-pulse"></div>
                    )}
                  </div>
                  
                  {/* Label - hidden on very small screens, shown on mobile+ */}
                  <div className="text-center">
                    <div className={`font-semibold text-xs sm:text-sm ${
                      view.id === 'dashboard' ? 'hidden xs:block' : ''
                    }`}>
                      {view.label}
                    </div>
                    
                    {/* Count badge */}
                    {view.count !== undefined && view.count > 0 && (
                      <div className={`text-xs mt-1 ${
                        isActive ? 'text-interactive-secondary' : hasUrgent ? 'text-status-warning/80' : 'text-ui-text-tertiary'
                      }`}>
                        {view.count}
                      </div>
                    )}
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-ui-text-primary rounded-t-full"></div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-ui-surface-primary/50 rounded-xl h-32 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Dashboard View */}
            {activeView === 'dashboard' && (
              <div className="space-y-6">

                {/* Next Tour Card */}
                {nextTour && (
                  <NextTourCard 
                    tour={nextTour}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    formatPrice={formatPrice}
                    onContact={handleContactOperator}
                    t={t}
                  />
                )}

                {/* Empty State for Dashboard */}
                {getTotalBookings() === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🌴</div>
                    <h3 className="text-xl font-semibold text-ui-text-primary mb-2">
                      {t('journeyTab.welcome.title', { default: 'Welcome to Your Journey!' })}
                    </h3>
                    <p className="text-ui-text-tertiary mb-6">
                      {t('journeyTab.welcome.subtitle', { default: 'Start exploring French Polynesia' })}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => setActiveTab && setActiveTab('explore')}
                        className="bg-interactive-primary hover:bg-interactive-secondary text-ui-text-primary px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        {t('journeyTab.welcome.exploreTours', { default: 'Explore Tours' })}
                      </button>
                      <button
                        onClick={() => setShowLookupModal(true)}
                        className="bg-ui-surface-secondary hover:bg-ui-surface-tertiary text-ui-text-primary px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        {t('journeyTab.welcome.findMyBookings', { default: 'Find My Bookings' })}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}


            {/* Active and Completed Views */}
            {(activeView === 'active' || activeView === 'completed') && (
              <SimplifiedBookingView
                viewType={activeView}
                bookings={getViewBookings()}
                loading={loading}
                formatPrice={formatPrice}
                formatDate={formatDate}
                formatTime={formatTime}
                onContactOperator={handleContactOperator}
                onRebook={handleRebook}
                onGetSupport={handleGetSupport}
                canContactOperator={canContactOperator}
                canRebook={canRebook}
                onRefresh={refreshBookings}
                onExplore={() => setActiveTab && setActiveTab('explore')}
                t={t}
              />
            )}

          </>
        )}
      </div>

      {/* Simplified Floating Action Button - Only show when no bookings */}
      {activeView === 'dashboard' && getTotalBookings() === 0 && (
        <div className="fixed bottom-20 right-6 z-50">
          <button
            onClick={() => setActiveTab && setActiveTab('explore')}
            className="bg-interactive-primary hover:bg-interactive-secondary text-ui-text-primary p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center gap-2 group floating-button"
          >
            <Plus className="w-6 h-6" />
            <span className="hidden group-hover:block text-sm font-medium pr-2">
              {t('journeyTab.bookTour', { default: 'Book Tour' })}
            </span>
          </button>
        </div>
      )}

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
