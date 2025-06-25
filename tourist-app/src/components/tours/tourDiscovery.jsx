// src/components/tours/TourDiscovery.jsx
import React, { useState, useEffect } from 'react'
import { 
  MapPin, Clock, Users, Star, Heart, Share2, 
  ChevronDown, Timer, Bell, MessageCircle, Phone,
  Filter, Search, Wifi, Camera, Utensils
} from 'lucide-react'
import { tourService } from '../../services/supabase'
import { useBookingStore } from '../../stores/bookingStore'
import BookingModal from '../booking/BookingModal'
import toast from 'react-hot-toast'

const TourDiscovery = () => {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    island: 'all',
    tourType: 'all',
    timeframe: 'today',
    priceRange: 'all'
  })
  const [selectedTour, setSelectedTour] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  // Real-time updates
  useEffect(() => {
    let subscription

    const fetchTours = async () => {
      try {
        setLoading(true)
        const data = await tourService.getActiveTours(filters)
        setTours(data)
        
        // Setup real-time subscription
     //   subscription = tourService.subscribeToursUpdates((payload) => {
     //     console.log('Tour update received:', payload)
     //     // Refresh tours when updates occur
     //     fetchTours()
     //   })
        
      } catch (error) {
        console.error('Error fetching tours:', error)
        toast.error('Failed to load tours')
      } finally {
        setLoading(false)
      }
    }

    fetchTours()

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [filters])

  const formatPrice = (price) => new Intl.NumberFormat('fr-FR').format(price) + ' XPF'
  
  const getUrgencyColor = (hoursLeft) => {
    if (hoursLeft < 1) return 'text-red-400 bg-red-500/20 border-red-500/30'
    if (hoursLeft < 2) return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
    return 'text-green-400 bg-green-500/20 border-green-500/30'
  }

  const handleBookNow = (tour) => {
    setSelectedTour(tour)
    setShowBookingModal(true)
  }

  const handleCloseModal = () => {
    setShowBookingModal(false)
    setSelectedTour(null)
  }

  const TourCard = ({ tour }) => (
    <div className="bg-gradient-to-br from-vai-deep-ocean to-vai-lagoon rounded-2xl overflow-hidden border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-vai-float">
      {/* Card Header */}
      <div className="relative p-4 pb-0">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-vai-coral/20 text-blue-300 rounded-full text-xs font-medium border border-vai-coral/30">
              🏝️ {tour.operator_island}
            </div>
            {tour.whale_regulation_compliant && (
              <div className="px-3 py-1 bg-vai-bamboo/20 text-green-300 rounded-full text-xs font-medium border border-vai-bamboo/30">
                🐋 Certified
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-slate-400 hover:text-vai-hibiscus hover:bg-vai-hibiscus/10 rounded-lg transition-colors">
              <Heart size={16} />
            </button>
            <button className="p-2 text-slate-400 hover:text-vai-coral hover:bg-vai-coral/10 rounded-lg transition-colors">
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Tour Title & Company */}
        <h3 className="text-xl font-bold text-vai-pearl mb-1">{tour.tour_name}</h3>
        <p className="text-slate-300 text-sm flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          {tour.operator_rating || '4.8'} • {tour.company_name}
        </p>
      </div>

      {/* Tour Details */}
      <div className="p-4 space-y-3">
        {/* Time & Availability with Urgency */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 text-sm text-slate-300">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{tour.time_slot}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{tour.available_spots}/{tour.max_capacity} spots</span>
            </div>
          </div>
          {tour.hours_until_deadline && (
            <div className={`px-2 py-1 rounded-lg text-xs font-medium border ${getUrgencyColor(tour.hours_until_deadline)}`}>
              <Timer className="w-3 h-3 inline mr-1" />
              {Math.ceil(tour.hours_until_deadline)}h left
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <MapPin className="w-4 h-4 text-vai-teal" />
          <span>{tour.meeting_point}</span>
          {tour.pickup_available && (
            <span className="px-2 py-0.5 bg-vai-teal/20 text-vai-teal rounded text-xs">Pickup Available</span>
          )}
        </div>

        {/* Features */}
        <div className="flex gap-2 flex-wrap">
          {tour.equipment_included && (
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-xs">
              <Camera className="w-3 h-3" />
              Equipment
            </div>
          )}
          {tour.food_included && (
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-xs">
              <Utensils className="w-3 h-3" />
              Food
            </div>
          )}
          {tour.languages && tour.languages.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-700/50 text-slate-300 rounded-lg text-xs">
              <Wifi className="w-3 h-3" />
              {tour.languages.join(' • ')}
            </div>
          )}
        </div>

        {/* Price & Book Button */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 line-through text-sm">{formatPrice(tour.original_price_adult)}</span>
              {tour.discount_percentage && (
                <span className="px-2 py-0.5 bg-vai-bamboo/20 text-vai-bamboo rounded text-xs font-medium">
                  -{tour.discount_percentage}%
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-vai-pearl">{formatPrice(tour.discount_price_adult)}</div>
            <div className="text-slate-400 text-xs">per adult</div>
          </div>
          
          <button 
            onClick={() => handleBookNow(tour)}
            className="bg-vai-coral hover:shadow-vai-glow text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-vai-gradient">
      {/* Header */}
      <div className="bg-vai-lagoon/50 backdrop-blur-vai border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-vai-pearl">🌴 VAI Tickets</h1>
              <p className="text-slate-300 text-sm">Discover French Polynesia</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-400 hover:text-vai-pearl hover:bg-slate-700 rounded-lg transition-colors">
                <MessageCircle className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-400 hover:text-vai-pearl hover:bg-slate-700 rounded-lg transition-colors">
                <Phone className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            <select 
              className="px-4 py-2 bg-slate-700/50 text-white rounded-lg border border-slate-600 text-sm min-w-32"
              value={filters.island}
              onChange={(e) => setFilters({...filters, island: e.target.value})}
            >
              <option value="all">🏝️ All Islands</option>
              <option value="Moorea">Moorea</option>
              <option value="Tahiti">Tahiti</option>
              <option value="Bora Bora">Bora Bora</option>
              <option value="Huahine">Huahine</option>
            </select>
            
            <select 
              className="px-4 py-2 bg-slate-700/50 text-white rounded-lg border border-slate-600 text-sm min-w-32"
              value={filters.tourType}
              onChange={(e) => setFilters({...filters, tourType: e.target.value})}
            >
              <option value="all">🎯 All Tours</option>
              <option value="Adrenalin">🪂 Adrenalin</option>
              <option value="Cultural">🌺 Cultural</option>
              <option value="Diving">🤿 Diving</option>
              <option value="Hike">🥾 Hike</option>
              <option value="Lagoon Tour">🚤 Lagoon Tour</option>
              <option value="Mindfulness">🧘 Mindfulness</option>
              <option value="Whale Watching">🐋 Whale Watching</option>
              <option value="Snorkeling">🐢 Snorkeling</option>
            </select>
            
            <select 
              className="px-4 py-2 bg-slate-700/50 text-white rounded-lg border border-slate-600 text-sm min-w-32"
              value={filters.timeframe}
              onChange={(e) => setFilters({...filters, timeframe: e.target.value})}
            >
              <option value="today">📅 Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="week">This Week</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tour Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-800 rounded-2xl h-80"></div>
              </div>
            ))}
          </div>
        ) : tours.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No tours found</h3>
            <p className="text-slate-500 mb-4">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map(tour => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedTour && (
        <BookingModal 
          tour={selectedTour}
          isOpen={showBookingModal}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default TourDiscovery