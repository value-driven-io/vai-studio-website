// src/components/journey/FavoritesSection.jsx
import React, { useState, useEffect } from 'react'
import { 
  Heart, Calendar, Clock, MapPin, Users, Star, 
  RefreshCw, ExternalLink, Trash2
} from 'lucide-react'
import { journeyService } from '../../services/supabase'
import { useAppStore } from '../../stores/bookingStore'
import { TOUR_TYPE_EMOJIS } from '../../constants/moods'
import BookingModal from '../booking/BookingModal'
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
      toast.error('Failed to load favorite tours')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = (tourId) => {
    toggleFavorite(tourId)
    toast.success('Removed from favorites')
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
          <div key={i} className="bg-slate-800 rounded-xl h-40 animate-pulse"></div>
        ))}
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-400 mb-2">No saved tours</h3>
        <p className="text-slate-500 mb-6">
          Save tours you're interested in for quick access. Look for the ❤️ icon on tour cards.
        </p>
        <button
          onClick={() => setActiveTab('discover')}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors"
        >
          Discover Tours
        </button>
      </div>
    )
  }

  if (favoriteTours.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-400 mb-2">Saved tours unavailable</h3>
        <p className="text-slate-500 mb-6">
          Your saved tours are no longer available or have expired. Discover new adventures!
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={loadFavoriteTours}
            className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors"
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
          <h3 className="text-lg font-semibold text-white">Saved Tours</h3>
          <p className="text-slate-400 text-sm">
            {favoriteTours.length} tour{favoriteTours.length !== 1 ? 's' : ''} you've saved for later
          </p>
        </div>
        <button
          onClick={loadFavoriteTours}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
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
      <BookingModal 
        tour={selectedTour}
        isOpen={showBookingModal}
        onClose={handleCloseBookingModal}
      />
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
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{tourEmoji}</span>
            <h4 className="text-lg font-semibold text-white">{tour.tour_name}</h4>
          </div>
          
          <div className="text-slate-400 text-sm mb-2">
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
          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Remove from favorites"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Tour Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2 text-slate-300">
          <Calendar className="w-4 h-4 text-slate-400" />
          <div>
            <div className="text-sm font-medium">
              {formatDate(tour.tour_date)}
            </div>
            <div className="text-xs text-slate-400">
              {formatTime(tour.time_slot)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <MapPin className="w-4 h-4 text-slate-400" />
          <div>
            <div className="text-sm font-medium">
              {tour.meeting_point || 'TBD'}
            </div>
            <div className="text-xs text-slate-400">Meeting Point</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <Users className="w-4 h-4 text-slate-400" />
          <div>
            <div className="text-sm font-medium">
              {tour.available_spots} spots left
            </div>
            <div className="text-xs text-slate-400">of {tour.max_capacity}</div>
          </div>
        </div>
      </div>

      {/* Description */}
      {tour.description && (
        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
          {tour.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
        {/* Pricing */}
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

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onBookTour(tour)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Low Availability Warning */}
      {tour.available_spots <= 3 && tour.available_spots > 0 && (
        <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-orange-400 text-xs">
            <ExternalLink className="w-3 h-3" />
            Only {tour.available_spots} spot{tour.available_spots !== 1 ? 's' : ''} left!
          </div>
        </div>
      )}
    </div>
  )
}

export default FavoritesSection