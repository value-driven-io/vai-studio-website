// Modern JourneyTab - Industry gold standard UX/UI
import { useState, useEffect } from 'react'
import {
  Calendar, MapPin, Users, Clock, ChevronRight, Plus, RefreshCw, Search,
  Bookmark, MessageCircle, Phone, RotateCcw, ExternalLink, Filter,
  CheckCircle, Timer, XCircle, Award, AlertTriangle, TrendingUp
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useUserJourney } from '../../hooks/useUserJourney'
import { useAppStore } from '../../stores/bookingStore'
import { BookingPage } from '../booking/BookingPage'
import BookingLookup from './BookingLookup'
import ModernBookingView from './ModernBookingView'
import BookingDetailModal from './BookingDetailModal'
import { TOUR_TYPE_EMOJIS } from '../../constants/moods'
import toast from 'react-hot-toast'

const ModernJourneyTab = () => {
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

  const { setActiveTab } = useAppStore()

  // Modern state management
  const [activeView, setActiveView] = useState('overview')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRebookModal, setShowRebookModal] = useState(false)
  const [rebookTour, setRebookTour] = useState(null)
  const [showLookupModal, setShowLookupModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Safe data access
  const safeUserBookings = userBookings || { active: [], upcoming: [], past: [], cancelled: [] }

  // Calculate comprehensive stats
  const stats = {
    total: getTotalBookings(),
    active: safeUserBookings.active.length,
    upcoming: safeUserBookings.upcoming.length,
    completed: safeUserBookings.past.length,
    cancelled: safeUserBookings.cancelled?.length || 0,
    nextTour: getNextUpcomingTour(),
    pendingActions: safeUserBookings.active.filter(b => b.booking_status === 'pending').length
  }

  // Modern navigation with clear purpose
  const navigationItems = [
    {
      id: 'overview',
      label: t('journey.nav.overview'),
      icon: TrendingUp,
      description: 'Dashboard overview',
      badge: stats.pendingActions > 0 ? stats.pendingActions : null,
      badgeColor: 'bg-status-warning'
    },
    {
      id: 'active',
      label: t('journey.nav.active'),
      icon: Timer,
      description: 'Pending & upcoming',
      count: stats.active + stats.upcoming,
      badge: stats.active > 0 ? stats.active : null,
      badgeColor: 'bg-status-caution'
    },
    {
      id: 'completed',
      label: t('journey.nav.completed'),
      icon: Award,
      description: 'Your memories',
      count: stats.completed
    }
  ]

  // Event handlers
  const handleContactOperator = (booking) => {
    const operatorData = booking.active_tours_with_operators || booking.operators

    if (operatorData?.operator_whatsapp_number || operatorData?.whatsapp_number) {
      const whatsapp = operatorData.operator_whatsapp_number || operatorData.whatsapp_number
      const message = `Hi! Regarding booking ${booking.booking_reference}. ${
        booking.booking_status === 'confirmed'
          ? 'Looking forward to the tour!'
          : 'Could you please update the booking status?'
      }`
      const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`
      window.open(url, '_blank')
    } else if (operatorData?.phone) {
      window.open(`tel:${operatorData.phone}`, '_self')
    } else {
      toast.error(t('journey.errors.noContactInfo'))
    }
  }

  const handleRebook = (booking) => {
    const tourData = booking.active_tours_with_operators || booking.tours
    if (tourData) {
      // Convert booking to tour format
      const rebookData = {
        ...tourData,
        id: booking.tour_id || tourData.id,
        operator_id: booking.operator_id,
        discount_price_adult: booking.adult_price || tourData.effective_discount_price_adult,
        discount_price_child: booking.child_price || tourData.effective_discount_price_child,
        available_spots: 10, // Default for rebook
        max_capacity: 10
      }

      setRebookTour(rebookData)
      setShowRebookModal(true)
    }
  }

  const handleGetSupport = (booking) => {
    const message = `Hi! I need assistance with booking ${booking.booking_reference}. Please help.`
    const url = `https://wa.me/68987269065?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const handleShowDetails = (booking) => {
    setSelectedBooking(booking)
    setShowDetailModal(true)
  }

  const handleLookupBookings = async (email, whatsapp) => {
    try {
      const bookings = await fetchUserBookings(email, whatsapp)
      setShowLookupModal(false)
      if (bookings && bookings.length > 0) {
        toast.success(t('journey.messages.bookingsFound', { count: bookings.length }))
        setActiveView('overview')
      } else {
        toast.error(t('journey.messages.noBookingsFound'))
      }
    } catch (error) {
      toast.error(t('journey.messages.bookingSearchFailed'))
    }
  }

  // Modern empty state component
  const EmptyState = ({ type }) => {
    const states = {
      overview: {
        icon: Calendar,
        title: t('journey.empty.overview.title'),
        description: t('journey.empty.overview.description'),
        action: t('journey.empty.overview.action'),
        actionIcon: Plus,
        onAction: () => setActiveTab('discover')
      },
      active: {
        icon: Timer,
        title: t('journey.empty.active.title'),
        description: t('journey.empty.active.description'),
        action: t('journey.empty.active.action'),
        actionIcon: Search,
        onAction: () => setShowLookupModal(true)
      },
      completed: {
        icon: Award,
        title: t('journey.empty.completed.title'),
        description: t('journey.empty.completed.description'),
        action: t('journey.empty.completed.action'),
        actionIcon: Plus,
        onAction: () => setActiveTab('discover')
      }
    }

    const state = states[type] || states.overview
    const Icon = state.icon
    const ActionIcon = state.actionIcon

    return (
      <div className="text-center py-16 px-6">
        <div className="w-20 h-20 bg-ui-surface-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon className="w-10 h-10 text-ui-text-disabled" />
        </div>
        <h3 className="text-xl font-semibold text-ui-text-primary mb-3">{state.title}</h3>
        <p className="text-ui-text-secondary mb-8 max-w-md mx-auto leading-relaxed">
          {state.description}
        </p>
        <button
          onClick={state.onAction}
          className="inline-flex items-center gap-2 px-6 py-3 bg-interactive-primary hover:bg-interactive-primary-hover text-ui-text-primary font-medium rounded-lg transition-colors"
        >
          <ActionIcon className="w-4 h-4" />
          {state.action}
        </button>
      </div>
    )
  }

  // Modern overview dashboard
  const OverviewDashboard = () => (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-ui-surface-primary border border-ui-border-primary rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-interactive-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-interactive-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ui-text-primary">{stats.total}</div>
              <div className="text-sm text-ui-text-secondary">Total Bookings</div>
            </div>
          </div>
        </div>

        <div className="bg-ui-surface-primary border border-ui-border-primary rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-status-caution/10 rounded-lg flex items-center justify-center">
              <Timer className="w-5 h-5 text-status-caution" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ui-text-primary">{stats.active}</div>
              <div className="text-sm text-ui-text-secondary">Pending</div>
            </div>
          </div>
        </div>

        <div className="bg-ui-surface-primary border border-ui-border-primary rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-status-success/10 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-status-success" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ui-text-primary">{stats.upcoming}</div>
              <div className="text-sm text-ui-text-secondary">Upcoming</div>
            </div>
          </div>
        </div>

        <div className="bg-ui-surface-primary border border-ui-border-primary rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-status-info/10 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-status-info" />
            </div>
            <div>
              <div className="text-2xl font-bold text-ui-text-primary">{stats.completed}</div>
              <div className="text-sm text-ui-text-secondary">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Tour Highlight */}
      {stats.nextTour && (
        <div className="bg-gradient-to-r from-interactive-primary/5 to-mood-culture/5 border border-interactive-primary/20 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-ui-text-primary mb-1">Next Adventure</h3>
              <p className="text-sm text-ui-text-secondary">Your upcoming confirmed tour</p>
            </div>
            <div className="text-3xl">
              {TOUR_TYPE_EMOJIS[stats.nextTour.active_tours_with_operators?.tour_type] || '🌴'}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-ui-text-primary">
              {stats.nextTour.active_tours_with_operators?.tour_name || 'Tour'}
            </h4>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-ui-text-disabled" />
                <span className="text-ui-text-secondary">
                  {formatDate(stats.nextTour.active_tours_with_operators?.tour_date)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-ui-text-disabled" />
                <span className="text-ui-text-secondary">
                  {formatTime(stats.nextTour.active_tours_with_operators?.time_slot)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-ui-text-disabled" />
                <span className="text-ui-text-secondary">
                  {stats.nextTour.active_tours_with_operators?.operator_island || 'TBD'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-ui-text-disabled" />
                <span className="text-ui-text-secondary">
                  {stats.nextTour.num_adults + (stats.nextTour.num_children || 0)} people
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleContactOperator(stats.nextTour)}
                className="flex items-center gap-2 px-4 py-2 bg-interactive-primary hover:bg-interactive-primary-hover text-ui-text-primary rounded-lg transition-colors text-sm font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                Contact Operator
              </button>
              <button
                onClick={() => handleShowDetails(stats.nextTour)}
                className="flex items-center gap-2 px-4 py-2 bg-ui-surface-secondary hover:bg-ui-surface-tertiary text-ui-text-primary rounded-lg transition-colors text-sm font-medium"
              >
                View Details
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Actions */}
      {stats.pendingActions > 0 && (
        <div className="bg-status-caution/5 border border-status-caution/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-status-caution" />
            <div>
              <h3 className="font-semibold text-ui-text-primary">Action Required</h3>
              <p className="text-sm text-ui-text-secondary">
                {stats.pendingActions} booking{stats.pendingActions !== 1 ? 's' : ''} need your attention
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('active')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-status-caution hover:bg-status-caution-hover text-white rounded-lg transition-colors text-sm font-medium"
          >
            Review Bookings
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('discover')}
          className="flex items-center gap-3 p-4 bg-ui-surface-primary border border-ui-border-primary rounded-xl hover:border-interactive-primary/30 transition-colors text-left"
        >
          <div className="w-10 h-10 bg-interactive-primary/10 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-interactive-primary" />
          </div>
          <div>
            <div className="font-medium text-ui-text-primary">Book New Tour</div>
            <div className="text-sm text-ui-text-secondary">Discover amazing experiences</div>
          </div>
        </button>

        <button
          onClick={() => setShowLookupModal(true)}
          className="flex items-center gap-3 p-4 bg-ui-surface-primary border border-ui-border-primary rounded-xl hover:border-interactive-primary/30 transition-colors text-left"
        >
          <div className="w-10 h-10 bg-mood-culture/10 rounded-lg flex items-center justify-center">
            <Search className="w-5 h-5 text-mood-culture" />
          </div>
          <div>
            <div className="font-medium text-ui-text-primary">Find Bookings</div>
            <div className="text-sm text-ui-text-secondary">Search by email or phone</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className="flex items-center gap-3 p-4 bg-ui-surface-primary border border-ui-border-primary rounded-xl hover:border-interactive-primary/30 transition-colors text-left"
        >
          <div className="w-10 h-10 bg-mood-adventure/10 rounded-lg flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-mood-adventure" />
          </div>
          <div>
            <div className="font-medium text-ui-text-primary">Saved Tours</div>
            <div className="text-sm text-ui-text-secondary">Your favorite experiences</div>
          </div>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-ui-surface-overlay">
      {/* Modern Header */}
      <div className="bg-ui-surface-primary border-b border-ui-border-primary sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-ui-text-primary">Your Journey</h1>
              <p className="text-sm text-ui-text-secondary">
                {stats.total > 0
                  ? `${stats.total} booking${stats.total !== 1 ? 's' : ''} • ${stats.completed} completed`
                  : 'Start your adventure today'
                }
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLookupModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-interactive-primary hover:bg-interactive-primary-hover text-ui-text-primary rounded-lg transition-colors text-sm font-medium"
                title="Find my bookings"
              >
                <Search className="w-4 h-4" />
                Find Bookings
              </button>
              <button
                onClick={refreshBookings}
                disabled={loading}
                className="p-2 text-ui-text-secondary hover:text-ui-text-primary transition-colors"
                title="Refresh bookings"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Modern Navigation */}
          <div className="mt-6">
            <nav className="flex space-x-1 bg-ui-surface-secondary p-1 rounded-lg">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = activeView === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
                      isActive
                        ? 'bg-ui-surface-primary text-ui-text-primary shadow-sm'
                        : 'text-ui-text-secondary hover:text-ui-text-primary hover:bg-ui-surface-primary/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>

                    {item.badge && (
                      <div className={`absolute -top-1 -right-1 w-5 h-5 ${item.badgeColor} text-white text-xs rounded-full flex items-center justify-center`}>
                        {item.badge}
                      </div>
                    )}

                    {item.count !== undefined && !item.badge && (
                      <span className="text-xs text-ui-text-disabled">({item.count})</span>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading && stats.total === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-ui-surface-primary rounded-xl h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {activeView === 'overview' && (
              stats.total === 0 ? <EmptyState type="overview" /> : <OverviewDashboard />
            )}

            {activeView === 'active' && (
              stats.active + stats.upcoming === 0 ? (
                <EmptyState type="active" />
              ) : (
                <ModernBookingView
                  userBookings={{
                    active: safeUserBookings.active,
                    upcoming: safeUserBookings.upcoming,
                    past: []
                  }}
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
                />
              )
            )}

            {activeView === 'completed' && (
              stats.completed === 0 ? (
                <EmptyState type="completed" />
              ) : (
                <ModernBookingView
                  userBookings={{
                    active: [],
                    upcoming: [],
                    past: safeUserBookings.past
                  }}
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
                />
              )
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showDetailModal && selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedBooking(null)
          }}
          formatPrice={formatPrice}
          formatDate={formatDate}
          formatTime={formatTime}
          onContactOperator={handleContactOperator}
          onRebook={handleRebook}
          onGetSupport={handleGetSupport}
          canContactOperator={canContactOperator}
          canRebook={canRebook}
        />
      )}

      {showRebookModal && rebookTour && (
        <BookingPage
          tour={rebookTour}
          mode="modal"
          onClose={() => {
            setShowRebookModal(false)
            setRebookTour(null)
          }}
          onSuccess={() => {
            setShowRebookModal(false)
            setRebookTour(null)
            refreshBookings()
            toast.success(t('journey.messages.rebookingSuccess'))
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

export default ModernJourneyTab