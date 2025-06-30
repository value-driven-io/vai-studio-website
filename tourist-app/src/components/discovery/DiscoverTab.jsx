// src/components/discovery/DiscoverTab.jsx
import React, { useState } from 'react'
import { RefreshCw, Clock, Users, MapPin, Star, ArrowRight } from 'lucide-react'
import { useTours } from '../../hooks/useTours'
import { useAppStore } from '../../stores/bookingStore'
import { MOOD_CATEGORIES, TOUR_TYPE_EMOJIS } from '../../constants/moods'
import BookingModal from '../booking/BookingModal'

const DiscoverTab = () => {
  const { selectedMood, setMood, setActiveTab } = useAppStore()
  const { 
    urgentTours = [], // Default to empty array
    moodTours = [], 
    discoverTours = [], 
    loading, 
    refreshTours, 
    formatPrice, 
    formatDate, 
    formatTime,
    getUrgencyColor,
    calculateSavings 
  } = useTours()

  // Booking modal state
  const [selectedTour, setSelectedTour] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  const handleMoodSelect = (moodId) => {
    if (selectedMood === moodId) {
      setMood(null) // Deselect if already selected
    } else {
      setMood(moodId)
    }
  }

  const handleBookTour = (tour) => {
    setSelectedTour(tour)
    setShowBookingModal(true)
  }

  const handleCloseBookingModal = () => {
    setShowBookingModal(false)
    setSelectedTour(null)
  }

  const TourCard = ({ tour, isUrgent = false }) => {
    if (!tour) return null // Safety check
    
    const savings = calculateSavings(tour.original_price_adult, tour.discount_price_adult)
    const urgencyColor = getUrgencyColor(tour.hours_until_deadline)
    
    return (
      <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-all">
        {/* Tour Header */}
        <div className="p-4">
          {/* Urgency Badge */}
          {isUrgent && tour.hours_until_deadline && (
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-3 ${urgencyColor}`}>
              <Clock className="w-3 h-3" />
              {tour.hours_until_deadline < 1 
                ? `${Math.round(tour.hours_until_deadline * 60)}min left!`
                : `${Math.round(tour.hours_until_deadline)}h left!`
              }
            </div>
          )}

          {/* Tour Info */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
                {TOUR_TYPE_EMOJIS[tour.tour_type] || '🌴'} {tour.tour_name}
              </h3>
              <p className="text-slate-400 text-sm">
                with {tour.company_name}
              </p>
            </div>
            {tour.operator_rating && (
              <div className="flex items-center gap-1 ml-3">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-slate-300">{tour.operator_rating}</span>
              </div>
            )}
          </div>

          {/* Tour Details */}
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-300 mb-4">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{tour.operator_island}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(tour.tour_date)} {formatTime(tour.time_slot)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{tour.available_spots} spots left</span>
            </div>
            {tour.duration_hours && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{tour.duration_hours}h duration</span>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xl font-bold text-white">
                  {formatPrice(tour.discount_price_adult)}
                </span>
                {savings > 0 && (
                  <span className="text-sm text-slate-400 line-through ml-2">
                    {formatPrice(tour.original_price_adult)}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <span className="text-sm font-medium text-green-400">
                  Save {formatPrice(savings)}
                </span>
              )}
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={() => handleBookTour(tour)}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Reserve Spot
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="text-center pt-8 pb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            🌴 VAI Tickets
          </h1>
          <p className="text-slate-400">
            Discover French Polynesia
          </p>
          

          
          {/* Refresh Button */}
          <button
            onClick={refreshTours}
            disabled={loading}
            className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Tours
          </button>
        </div>

        {/* Mood Selector */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            What's your mood today?
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {MOOD_CATEGORIES.map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
                className={`p-4 rounded-lg text-white transition-all ${
                  selectedMood === mood.id
                    ? `${mood.colors.bg} ring-2 ${mood.colors.border}`
                    : `bg-slate-700 ${mood.colors.hover}`
                }`}
              >
                <div className="text-2xl mb-1">{mood.emoji}</div>
                <div className="font-medium">{mood.title}</div>
                <div className="text-xs opacity-80">{mood.subtitle}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Mood-Based Results */}
        {selectedMood && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Perfect for {MOOD_CATEGORIES.find(m => m.id === selectedMood)?.title}
              </h3>
              {moodTours && moodTours.length > 0 && (
                <span className="text-sm text-slate-400">
                  {moodTours.length} found
                </span>
              )}
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="bg-slate-800 rounded-xl h-48 animate-pulse"></div>
                ))}
              </div>
            ) : moodTours && moodTours.length > 0 ? (
              <div className="space-y-4">
                {moodTours.slice(0, 3).map(tour => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
                {moodTours.length > 3 && (
                  <button
                    onClick={() => setActiveTab('explore')}
                    className="w-full p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    See {moodTours.length - 3} more tours
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl p-6 text-center">
                <p className="text-slate-400">No tours found for this mood</p>
                <p className="text-slate-500 text-sm mt-1">Try a different mood or check back later</p>
              </div>
            )}
          </div>
        )}

        {/* Urgent Deals */}
        {urgentTours && urgentTours.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              ⚡ Last-Minute Deals
              <span className="text-sm bg-red-500 text-white px-2 py-1 rounded-full">
                Urgent
              </span>
            </h3>
            <div className="space-y-4">
              {urgentTours.slice(0, 2).map(tour => (
                <TourCard key={tour.id} tour={tour} isUrgent={true} />
              ))}
            </div>
          </div>
        )}

        {/* Available Tours (when no mood selected) */}
        {!selectedMood && discoverTours && discoverTours.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              🌴 Available Tours
            </h3>
            <div className="space-y-4">
              {discoverTours.slice(0, 4).map(tour => (
                <TourCard key={tour.id} tour={tour} />
              ))}
              {discoverTours.length > 4 && (
                <button
                  onClick={() => setActiveTab('explore')}
                  className="w-full p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  See {discoverTours.length - 4} more tours
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Didn't Find Section - Only show if no tours at all */}
        {(!urgentTours || urgentTours.length === 0) && 
         (!discoverTours || discoverTours.length === 0) && 
         (!moodTours || moodTours.length === 0) && (
          <div className="bg-slate-800 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              No tours available right now
            </h3>
            <div className="space-y-3">
              <p className="text-slate-400 text-sm">
                Check back later or try browsing all tours including future dates.
              </p>
              <button
                onClick={() => setActiveTab('explore')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Browse All Tours
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Didn't Find Section - Show if tours exist but none match mood */}
        {((urgentTours && urgentTours.length > 0) || (discoverTours && discoverTours.length > 0)) && 
         selectedMood && (!moodTours || moodTours.length === 0) && (
          <div className="bg-slate-800 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              No {selectedMood} tours available
            </h3>
            <div className="space-y-3">
              <p className="text-slate-400 text-sm">
                Try a different mood or browse all available tours.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setMood(null)}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Clear Mood
                </button>
                <button
                  onClick={() => setActiveTab('explore')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Browse All
                </button>
              </div>
            </div>
          </div>
        )}
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

export default DiscoverTab