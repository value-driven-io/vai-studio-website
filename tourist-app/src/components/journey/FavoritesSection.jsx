// src/components/journey/FavoritesSection.jsx
import React, { useState, useEffect } from 'react'
import { 
  Heart, Calendar, Clock, MapPin, Users, Star, 
  RefreshCw, ExternalLink, Trash2
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { journeyService } from '../../services/supabase'
import { useAppStore } from '../../stores/bookingStore'
import { TOUR_TYPE_EMOJIS } from '../../constants/moods'
import { BookingPage } from '../booking/BookingPage'
import toast from 'react-hot-toast'

const FavoritesSection = ({ 
  favorites, 
  toggleFavorite, 
  setActiveTab,
  formatPrice,
  formatDate,
  formatTime,
  calculateSavings,
  getUrgencyColor
}) => {
  const { t } = useTranslation()
  const [favoriteTours, setFavoriteTours] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedTour, setSelectedTour] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Load favorite tours from database
  useEffect(() => {
    loadFavoriteTours()
  }, [favorites])

  const loadFavoriteTours = async () => {
    if (favorites.length === 0) {
      setFavoriteTours([])
      return
    }

    setLoading(true)
    try {
      const tours = await journeyService.getFavoriteTours(favorites)
      setFavoriteTours(tours)
    } catch (error) {
      console.error('Error loading favorite tours:', error)
      toast.error(t('toastNotifications.favoritesLoadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = (tourId) => {
    toggleFavorite(tourId)
    toast.success(t('toastNotifications.favoriteRemoved'))
  }

  const handleBookTour = (tour) => {
    setSelectedTour(tour)
    setShowBookingModal(true)
  }

  const handleCloseBookingModal = () => {
    setShowBookingModal(false)
    setSelectedTour(null)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-ui-surface-primary rounded-xl h-40 animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 text-ui-text-tertiary mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-ui-text-tertiary mb-2">No saved tours</h3>
        <p className="text-ui-text-disabled mb-6">
          Save tours you're interested in for quick access. Look for the ❤️ icon on tour cards.
        </p>
        <button
          onClick={() => setActiveTab('discover')}
          className="bg-interactive-primary hover:bg-interactive-secondary text-ui-text-primary py-2 px-6 rounded-lg transition-colors"
        >
          Discover Tours
        </button>
      </div>
    )
  }

  if (favoriteTours.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 text-ui-text-tertiary mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-ui-text-tertiary mb-2">Saved tours unavailable</h3>
        <p className="text-ui-text-disabled mb-6">
          Your saved tours are no longer available or have expired. Discover new adventures!
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={loadFavoriteTours}
            className="flex items-center gap-2 bg-ui-surface-secondary hover:bg-ui-surface-tertiary text-ui-text-primary py-2 px-4 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className="bg-interactive-primary hover:bg-interactive-secondary text-ui-text-primary py-2 px-6 rounded-lg transition-colors"
          >
            Discover Tours
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-ui-text-primary">Saved Tours</h3>
          <p className="text-ui-text-tertiary text-sm">
            {favoriteTours.length} tour{favoriteTours.length !== 1 ? 's' : ''} you've saved for later
          </p>
        </div>
        <button
          onClick={loadFavoriteTours}
          className="flex items-center gap-2 text-ui-text-tertiary hover:text-ui-text-primary transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Favorite Tours Grid */}
      <div className="grid gap-4">
        {favoriteTours.map(tour => (
          <FavoriteTourCard
            key={tour.id}
            tour={tour}
            onRemoveFavorite={handleRemoveFavorite}
            onBookTour={handleBookTour}
            formatPrice={formatPrice}
            formatDate={formatDate}
            formatTime={formatTime}
            calculateSavings={calculateSavings}
            getUrgencyColor={getUrgencyColor}
          />
        ))}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingPage
          tour={selectedTour}
          mode="modal"
          onClose={handleCloseBookingModal}
        />
      )}
    </div>
  )
}

// Individual Favorite Tour Card
const FavoriteTourCard = ({ 
  tour, 
  onRemoveFavorite, 
  onBookTour,
  formatPrice,
  formatDate,
  formatTime,
  calculateSavings,
  getUrgencyColor
}) => {
  const tourEmoji = TOUR_TYPE_EMOJIS[tour.tour_type] || '🌴'
  const savings = calculateSavings(tour.original_price_adult, tour.discount_price_adult)
  const urgencyColor = getUrgencyColor(tour.hours_until_deadline)
  const isUrgent = tour.hours_until_deadline && tour.hours_until_deadline <= 4

  return (
    <div className="bg-ui-surface-primary border border-ui-border-primary rounded-xl p-6 hover:border-ui-border-secondary transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{tourEmoji}</span>
            <h4 className="text-lg font-semibold text-ui-text-primary">{tour.tour_name}</h4>
          </div>

          <div className="text-ui-text-tertiary text-sm mb-2">
            with {tour.company_name} • {tour.operator_island}
          </div>

          {/* Urgency Badge */}
          {isUrgent && (
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-2 ${urgencyColor}`}>
              <Clock className="w-3 h-3" />
              {tour.hours_until_deadline < 1 
                ? `${Math.round(tour.hours_until_deadline * 60)} min left`
                : `${Math.round(tour.hours_until_deadline)}h left`
              }
            </div>
          )}
        </div>

        {/* Remove from Favorites */}
        <button
          onClick={() => onRemoveFavorite(tour.id)}
          className="p-2 text-status-error hover:text-red-300 hover:bg-status-error-subtle rounded-lg transition-colors"
          title="Remove from favorites"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Tour Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2 text-ui-text-secondary">
          <Calendar className="w-4 h-4 text-ui-text-tertiary" />
          <div>
            <div className="text-sm font-medium">
              {formatDate(tour.tour_date)}
            </div>
            <div className="text-xs text-ui-text-tertiary">
              {formatTime(tour.time_slot)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-ui-text-secondary">
          <MapPin className="w-4 h-4 text-ui-text-tertiary" />
          <div>
            <div className="text-sm font-medium">
              {tour.meeting_point || 'TBD'}
            </div>
            <div className="text-xs text-ui-text-tertiary">Meeting Point</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-ui-text-secondary">
          <Users className="w-4 h-4 text-ui-text-tertiary" />
          <div>
            <div className="text-sm font-medium">
              {tour.available_spots} spots left
            </div>
            <div className="text-xs text-ui-text-tertiary">of {tour.max_capacity}</div>
          </div>
        </div>
      </div>

      {/* Description */}
      {tour.description && (
        <p className="text-ui-text-tertiary text-sm mb-4 line-clamp-2">
          {tour.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-ui-border-primary">
        {/* Pricing */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-ui-text-primary">
              {formatPrice(tour.discount_price_adult)}
            </span>
            {savings > 0 && (
              <span className="text-sm text-ui-text-tertiary line-through">
                {formatPrice(tour.original_price_adult)}
              </span>
            )}
          </div>
          {savings > 0 && (
            <div className="text-xs text-status-success">
              Save {formatPrice(savings)}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onBookTour(tour)}
            className="bg-interactive-primary hover:bg-interactive-secondary text-ui-text-primary px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Low Availability Warning */}
      {tour.available_spots <= 3 && tour.available_spots > 0 && (
        <div className="mt-3 p-2 bg-status-warning-subtle border border-status-warning/20 rounded-lg">
          <div className="flex items-center gap-2 text-status-warning text-xs">
            <ExternalLink className="w-3 h-3" />
            Only {tour.available_spots} spot{tour.available_spots !== 1 ? 's' : ''} left!
          </div>
        </div>
      )}
    </div>
  )
}

export default FavoritesSection