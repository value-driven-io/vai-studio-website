// SimplifiedBookingView.jsx - Clean booking list for active/completed views
import { useState } from 'react'
import { Search, RefreshCw } from 'lucide-react'
import StatusCard from './StatusCard'
import BookingDetailModal from './BookingDetailModal'

const SimplifiedBookingView = ({ 
  viewType,
  bookings,
  loading,
  formatPrice,
  formatDate,
  formatTime,
  onContactOperator,
  onRebook,
  onGetSupport,
  canContactOperator,
  canRebook,
  onRefresh,
  onExplore,
  t 
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Filter bookings by search
  const filteredBookings = bookings.filter(booking => 
    !searchQuery.trim() || 
    booking.tours?.tour_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.operators?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.booking_reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.operators?.island?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const viewConfig = {
    active: {
      title: t('simplifiedView.active.title', { default: 'Active Bookings' }),
      subtitle: t('simplifiedView.active.subtitle', { default: 'Pending and upcoming tours' }),
      emptyTitle: t('simplifiedView.active.emptyTitle', { default: 'No Active Bookings' }),
      emptyMessage: t('simplifiedView.active.emptyMessage', { default: 'All your bookings are complete. Time for new adventures!' }),
      icon: '⚡'
    },
    completed: {
      title: t('simplifiedView.completed.title', { default: 'Your Travel Memories' }),
      subtitle: t('simplifiedView.completed.subtitle', { default: 'Completed tours and experiences' }),
      emptyTitle: t('simplifiedView.completed.emptyTitle', { default: 'No Completed Tours Yet' }),
      emptyMessage: t('simplifiedView.completed.emptyMessage', { default: 'Your completed tours will appear here after your adventures.' }),
      icon: '🏆'
    }
  }

  const config = viewConfig[viewType] || viewConfig.active

  // Handle showing booking details
  const handleShowDetails = (booking) => {
    setSelectedBooking(booking)
    setShowDetailModal(true)
  }

  const handleCloseDetails = () => {
    setShowDetailModal(false)
    setSelectedBooking(null)
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="vai-surface-elevated rounded-xl p-6 border border-ui-border-primary">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{config.icon}</span>
            <div>
              <h2 className="text-xl font-semibold text-ui-text-primary">{config.title}</h2>
              <p className="text-sm vai-text-secondary">{config.subtitle}</p>
            </div>
          </div>
          
          {/* Summary */}
          <div className="text-right">
            <div className="text-2xl font-bold text-ui-text-primary">{filteredBookings.length}</div>
            <div className="text-sm vai-text-secondary">
              {filteredBookings.length === 1 ? 'booking' : 'bookings'}
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 vai-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('simplifiedView.searchPlaceholder', { default: 'Search bookings...' })}
              className="w-full pl-10 pr-4 py-2.5 vai-surface-secondary border border-ui-border-primary rounded-lg text-ui-text-primary placeholder-ui-text-disabled focus:border-interactive-primary focus:ring-1 focus:ring-interactive-primary"
            />
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2.5 vai-surface-secondary hover:vai-surface-tertiary text-ui-text-primary rounded-lg transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t('simplifiedView.refresh', { default: 'Refresh' })}</span>
          </button>
        </div>

        {/* Search Results Summary */}
        {searchQuery && (
          <div className="mt-3 text-sm vai-text-secondary">
            {t('simplifiedView.searchResults', { 
              count: filteredBookings.length, 
              total: bookings.length,
              default: '{{count}} of {{total}} bookings shown'
            })}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="vai-surface-elevated rounded-xl h-48 animate-pulse border border-ui-border-primary"></div>
          ))}
        </div>
      )}

      {/* Booking List */}
      {!loading && (
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 vai-surface-secondary rounded-xl border border-ui-border-primary">
              <div className="text-6xl mb-4">{config.icon}</div>
              <h3 className="text-xl font-semibold text-ui-text-primary mb-2">
                {searchQuery ? t('simplifiedView.noMatches', { default: 'No matching bookings' }) : config.emptyTitle}
              </h3>
              <p className="vai-text-secondary mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? t('simplifiedView.tryDifferentSearch', { default: 'Try a different search term or clear the search.' })
                  : config.emptyMessage
                }
              </p>
              
              <div className="flex gap-3 justify-center">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="vai-button-secondary text-ui-text-primary px-4 py-2 rounded-lg transition-colors"
                  >
                    {t('simplifiedView.clearSearch', { default: 'Clear Search' })}
                  </button>
                )}
                <button
                  onClick={onExplore}
                  className="bg-interactive-primary hover:bg-interactive-secondary text-ui-text-primary px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {t('simplifiedView.exploreMore', { default: 'Explore More Tours' })}
                </button>
              </div>
            </div>
          ) : (
            // Booking Cards
            filteredBookings.map((booking) => (
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
      )}

      {/* Summary Footer */}
      {!loading && filteredBookings.length > 0 && (
        <div className="vai-surface-secondary rounded-xl p-4 border border-ui-border-primary">
          <div className="text-center text-sm vai-text-secondary">
            {viewType === 'active' && (
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <span>{t('simplifiedView.pendingCount', { 
                    count: filteredBookings.filter(b => b.booking_status === 'pending').length,
                    default: '{{count}} pending'
                  })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>{t('simplifiedView.confirmedCount', { 
                    count: filteredBookings.filter(b => b.booking_status === 'confirmed').length,
                    default: '{{count}} confirmed'
                  })}</span>
                </div>
              </div>
            )}
            {viewType === 'completed' && (
              <span>{t('simplifiedView.completedSummary', { 
                count: filteredBookings.length,
                default: '{{count}} amazing adventures completed!'
              })}</span>
            )}
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        isOpen={showDetailModal}
        onClose={handleCloseDetails}
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

export default SimplifiedBookingView