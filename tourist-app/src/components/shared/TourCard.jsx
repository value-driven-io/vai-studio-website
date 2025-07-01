import React, { useState } from 'react'
import { 
  Heart, Clock, Users, MapPin, Star, ArrowRight, Calendar,
  Zap, Shield, Coffee, Car, Globe, AlertTriangle, ChevronDown,
  ChevronUp, X
} from 'lucide-react'
import { TOUR_TYPE_EMOJIS } from '../../constants/moods'

// Enhanced TourCard with progressive disclosure
const TourCard = ({ 
  tour, 
  isUrgent = false, 
  mode = 'compact', // 'compact', 'expanded', 'detailed'
  onBookingClick,
  onFavoriteToggle,
  isFavorite = false,
  formatPrice,
  formatDate,
  formatTime,
  calculateSavings,
  getUrgencyColor,
  hideBookButton = false, // 👈 NEW: Hide book button for journey bookings
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showFullScreen, setShowFullScreen] = useState(false)
  
  if (!tour) return null

  const tourEmoji = TOUR_TYPE_EMOJIS[tour.tour_type] || '🌴'
  const savings = calculateSavings?.(tour.original_price_adult, tour.discount_price_adult)
  const urgencyInfo = getUrgencyColor?.(tour.hours_until_deadline)
  
  // Calculate urgency level
  const getUrgencyLevel = () => {
    if (!tour.hours_until_deadline) return null
    const hours = tour.hours_until_deadline
    if (hours <= 2) return { level: 'critical', text: 'Booking ends soon!', color: 'bg-red-500' }
    if (hours <= 4) return { level: 'high', text: 'Limited time', color: 'bg-orange-500' }
    if (hours <= 8) return { level: 'medium', text: 'Book today', color: 'bg-yellow-500' }
    return null
  }

  const urgency = getUrgencyLevel()

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    onFavoriteToggle?.(tour.id)
  }

  const handleCardClick = () => {
    if (mode === 'compact') {
      setIsExpanded(!isExpanded)
    } else if (mode === 'expanded') {
      setShowFullScreen(true)
    }
  }

  // 👈 FIXED: Proper handleBookingClick function
  const handleBookingClick = (e) => {
    e.stopPropagation()
    if (onBookingClick && !hideBookButton) {
      onBookingClick(tour)
    }
  }

  return (
    <>
      {/* Main Card */}
      <div 
        className={`bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 
                    transition-all duration-300 overflow-hidden cursor-pointer mobile-card
                   ${isExpanded ? 'border-blue-500/50' : ''} ${className}`}
        onClick={handleCardClick}
      >
        {/* Compact View */}
        <div className="relative">
          {/* Urgency Banner */}
          {urgency && (
            <div className={`absolute top-0 left-0 right-0 ${urgency.color} text-white 
                           text-xs font-medium py-1 px-3 flex items-center gap-1 z-10`}>
              <Zap className="w-3 h-3" />
              {urgency.text}
              {tour.hours_until_deadline && (
                <span className="ml-auto">
                  {tour.hours_until_deadline < 1 
                    ? `${Math.round(tour.hours_until_deadline * 60)}m left`
                    : `${Math.round(tour.hours_until_deadline)}h left`
                  }
                </span>
              )}
            </div>
          )}

          {/* Card Content */}
          <div className={`p-4 ${urgency ? 'pt-10' : ''}`}>
            {/* Header Row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl" role="img" aria-label={tour.tour_type}>
                    {tourEmoji}
                  </span>
                  <h3 className="text-lg font-semibold text-white truncate">
                    {tour.tour_name}
                  </h3>
                </div>
                <p className="text-slate-400 text-sm">
                  {tour.company_name} • {tour.operator_island || tour.island}
                </p>
              </div>

              {/* Favorite Button */}
              <button
                onClick={handleFavoriteClick}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isFavorite 
                    ? 'bg-red-500 text-white hover:bg-pink-600 scale-110' 
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-red-400'
                }`}
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Key Info Row */}
            <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="font-medium">{formatDate?.(tour.tour_date) || tour.tour_date}</div>
                  <div className="text-xs text-slate-400">
                    {formatTime?.(tour.time_slot) || tour.time_slot}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-300">
                <Users className="w-4 h-4 text-slate-400" />
                <div>
                  <div className="font-medium">{tour.available_spots} spots left</div>
                  <div className="text-xs text-slate-400">Max {tour.max_capacity}</div>
                </div>
              </div>
            </div>

            {/* Pricing Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {tour.original_price_adult > tour.discount_price_adult && (
                  <span className="text-slate-400 line-through text-sm">
                    {formatPrice?.(tour.original_price_adult) || `${tour.original_price_adult} XPF`}
                  </span>
                )}
                <span className="text-xl font-bold text-white">
                  {formatPrice?.(tour.discount_price_adult) || `${tour.discount_price_adult} XPF`}
                </span>
                {savings && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Save {savings}%
                  </span>
                )}
              </div>
              
              {/* Quick Inclusions */}
              <div className="flex gap-1">
                {tour.equipment_included && (
                  <div className="w-6 h-6 bg-blue-500/20 rounded text-blue-400 flex items-center justify-center" title="Equipment included">
                    <Shield className="w-3 h-3" />
                  </div>
                )}
                {tour.food_included && (
                  <div className="w-6 h-6 bg-green-500/20 rounded text-green-400 flex items-center justify-center" title="Food included">
                    <Coffee className="w-3 h-3" />
                  </div>
                )}
                {tour.pickup_available && (
                  <div className="w-6 h-6 bg-purple-500/20 rounded text-purple-400 flex items-center justify-center" title="Pickup available">
                    <Car className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {/* 👈 FIXED: Conditional Book Button with proper function */}
              {!hideBookButton && (
                <button
                  onClick={handleBookingClick}
                  className="flex-1 bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 border-slate-700 rounded-lg
                           font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  Book Now
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(!isExpanded)
                }}
                className={`px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 
                         rounded-lg transition-colors duration-200 ${
                           hideBookButton ? 'flex-1' : ''  // 👈 FIXED: Expand when book button hidden
                         }`}
                aria-label={isExpanded ? 'Show less' : 'Show more'}
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-slate-700 p-4 bg-slate-800/50 animate-in slide-in-from-top duration-300">
            {/* Meeting Point */}
            <div className="flex items-start gap-2 mb-3 text-sm">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <div className="text-slate-300 font-medium">
                  {tour.meeting_point || 'Meeting point TBD'}
                </div>
                <div className="text-slate-400 text-xs">Meeting location</div>
              </div>
            </div>

            {/* Description */}
            {tour.description && (
              <div className="mb-3">
                <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">
                  {tour.description}
                </p>
              </div>
            )}

            {/* Inclusions Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <InclusionItem 
                included={tour.equipment_included} 
                icon={Shield}
                label="Equipment provided"
              />
              <InclusionItem 
                included={tour.food_included} 
                icon={Coffee}
                label="Food & drinks"
              />
              <InclusionItem 
                included={tour.pickup_available} 
                icon={Car}
                label="Hotel pickup"
              />
              <InclusionItem 
                included={tour.languages?.includes('en')} 
                icon={Globe}
                label="English guide"
              />
            </div>

            {/* Requirements & Restrictions */}
            {(tour.requirements || tour.restrictions || tour.min_age) && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 text-orange-400 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Important Info</span>
                </div>
                <div className="space-y-1 text-xs text-slate-300">
                  {tour.min_age && (
                    <div>• Minimum age: {tour.min_age} years</div>
                  )}
                  {tour.fitness_level && (
                    <div>• Fitness level: {tour.fitness_level}</div>
                  )}
                  {tour.requirements && (
                    <div>• {tour.requirements}</div>
                  )}
                </div>
              </div>
            )}

            {/* View Full Details Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowFullScreen(true)
              }}
              className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 
                       rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-2"
            >
              View Complete Details
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Full Screen Modal */}
      {showFullScreen && (
        <TourDetailModal 
          tour={tour}
          isOpen={showFullScreen}
          onClose={() => setShowFullScreen(false)}
          onBookingClick={hideBookButton ? null : onBookingClick}  // 👈 FIXED: Pass null if hidden
          onFavoriteToggle={onFavoriteToggle}
          isFavorite={isFavorite}
          formatPrice={formatPrice}
          formatDate={formatDate}
          formatTime={formatTime}
          calculateSavings={calculateSavings}
          hideBookButton={hideBookButton}  // 👈 FIXED: Pass hideBookButton prop
        />
      )}
    </>
  )
}

// Inclusion Item Component
const InclusionItem = ({ included, icon: Icon, label }) => (
  <div className={`flex items-center gap-2 text-xs ${
    included ? 'text-green-400' : 'text-slate-500'
  }`}>
    <Icon className="w-3 h-3" />
    <span className={included ? '' : 'line-through'}>{label}</span>
    {included && <span className="text-green-400">✓</span>}
  </div>
)

// 👈 FIXED: Full Screen Tour Detail Modal with hideBookButton support
const TourDetailModal = ({ 
  tour, 
  isOpen, 
  onClose, 
  onBookingClick, 
  onFavoriteToggle,
  isFavorite,
  formatPrice,
  formatDate,
  formatTime,
  calculateSavings,
  hideBookButton = false  // 👈 FIXED: Add hideBookButton prop
}) => {
  if (!isOpen) return null

  const tourEmoji = TOUR_TYPE_EMOJIS[tour.tour_type] || '🌴'
  const savings = calculateSavings?.(tour.original_price_adult, tour.discount_price_adult)

  // 👈 FIXED: Safe booking click handler
  const handleModalBookingClick = () => {
    if (onBookingClick && !hideBookButton) {
      onBookingClick(tour)
      onClose() // Close modal after booking
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full border border-slate-700 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{tourEmoji}</span>
            <div>
              <h2 className="text-xl font-bold text-white">{tour.tour_name}</h2>
              <p className="text-slate-400">{tour.company_name} • {tour.operator_island}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => onFavoriteToggle?.(tour.id)}
              className={`p-2 rounded-full transition-all ${
                isFavorite 
                  ? 'bg-red-500 text-white' 
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-700 text-slate-400 hover:bg-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DetailItem icon={Calendar} label="Date & Time">
              <div>{formatDate?.(tour.tour_date) || tour.tour_date}</div>
              <div className="text-slate-400">{formatTime?.(tour.time_slot) || tour.time_slot}</div>
            </DetailItem>
            
            <DetailItem icon={Users} label="Capacity">
              <div>{tour.available_spots} spots available</div>
              <div className="text-slate-400">Max {tour.max_capacity} people</div>
            </DetailItem>
            
            <DetailItem icon={Clock} label="Duration">
              <div>{tour.duration_hours}h experience</div>
              <div className="text-slate-400">Full adventure</div>
            </DetailItem>
          </div>

          {/* Description */}
          {tour.description && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">About This Experience</h3>
              <p className="text-slate-300 leading-relaxed">{tour.description}</p>
            </div>
          )}

          {/* What's Included */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">What's Included</h3>
            <div className="grid grid-cols-2 gap-3">
              <InclusionDetailItem 
                included={tour.equipment_included}
                title="Professional Equipment"
                description="All necessary gear provided"
              />
              <InclusionDetailItem 
                included={tour.food_included}
                title="Food & Beverages"
                description="Refreshments during tour"
              />
              <InclusionDetailItem 
                included={tour.pickup_available}
                title="Hotel Transfer"
                description="Convenient pickup service"
              />
              <InclusionDetailItem 
                included={tour.languages?.includes('en')}
                title="English Guide"
                description="Professional local guide"
              />
            </div>
          </div>

          {/* Meeting Point */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Meeting Point</h3>
            <div className="flex items-start gap-3 bg-slate-700/50 rounded-lg p-4">
              <MapPin className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <div className="text-white font-medium">
                  {tour.meeting_point || 'Meeting point will be confirmed'}
                </div>
                <div className="text-slate-400 text-sm mt-1">
                  Exact location details provided after booking confirmation
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white text-lg font-semibold">
                  {formatPrice?.(tour.discount_price_adult) || `${tour.discount_price_adult} XPF`}
                  <span className="text-slate-400 text-sm ml-2">per adult</span>
                </div>
                {tour.original_price_adult > tour.discount_price_adult && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-400 line-through text-sm">
                      {formatPrice?.(tour.original_price_adult) || `${tour.original_price_adult} XPF`}
                    </span>
                    {savings && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        {savings}% OFF
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* 👈 FIXED: Conditional Book Button in Modal */}
              {!hideBookButton && (
                <button
                  onClick={handleModalBookingClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg 
                           font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  Book This Experience
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Detail Item Component for Modal
const DetailItem = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3">
    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
      <Icon className="w-5 h-5 text-blue-400" />
    </div>
    <div>
      <div className="text-slate-400 text-sm font-medium">{label}</div>
      <div className="text-white">{children}</div>
    </div>
  </div>
)

// Detailed Inclusion Item for Modal
const InclusionDetailItem = ({ included, title, description }) => (
  <div className={`p-3 rounded-lg border ${
    included 
      ? 'bg-green-500/10 border-green-500/20 text-green-400' 
      : 'bg-slate-700/50 border-slate-600 text-slate-500'
  }`}>
    <div className="flex items-center gap-2 mb-1">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
        included ? 'bg-green-500' : 'bg-slate-600'
      }`}>
        {included && <span className="text-white text-xs">✓</span>}
      </div>
      <span className="font-medium text-sm">{title}</span>
    </div>
    <p className="text-xs opacity-80">{description}</p>
  </div>
)

export default TourCard