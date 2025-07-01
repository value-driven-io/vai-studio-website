// Enhanced DiscoverTab Integration
// File: src/components/discovery/DiscoverTab.jsx

import React, { useState, useEffect } from 'react'
import { RefreshCw, ArrowRight, Sparkles, Zap, Filter } from 'lucide-react'
import { useTours } from '../../hooks/useTours'
import { useAppStore } from '../../stores/bookingStore'
import { MOOD_CATEGORIES } from '../../constants/moods'
import TourCard from '../shared/TourCard' // Import our enhanced component
import BookingModal from '../booking/BookingModal'
import AuthModal from '../auth/AuthModal'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import VAILogo from '../shared/VAILogo'

const DiscoverTab = () => {
  const { selectedMood, setMood, setActiveTab, favorites, toggleFavorite } = useAppStore()
  const { 
    urgentTours = [], 
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

  // Modal states
  const [selectedTour, setSelectedTour] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  
  // Animation state
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const { user, isAuthenticated } = useAuth()

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

  const handleFavoriteToggle = (tourId) => {
    toggleFavorite(tourId)
    const isFavorite = favorites.includes(tourId)
    toast.success(
      isFavorite ? '💔 Removed from favorites' : '❤️ Added to favorites',
      {
        duration: 2000,
        style: {
          background: isFavorite ? '#dc2626' : '#16a34a',
          color: 'white'
        }
      }
    )
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshTours()
      toast.success('Tours updated!', {
        icon: '🌴',
        duration: 2000
      })
    } catch (error) {
      toast.error('Failed to refresh tours')
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="flex items-center justify-center py-4 border-b border-slate-700">
        {/* Wrapping the VAILogo with an anchor tag */}
        <a href="https://vai.studio/app/" target="_blank" rel="noopener noreferrer">
          <VAILogo size="sm" />
        </a>
      </div>
      {/* Header with Gradient */}
      <div className="bg-gradient-to-br from-blue-600 via-teal-700 to-yellow-600 px-4 pt-8 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                🌴 Discover French Polynesia
              </h1>
              <p className="text-blue-100 text-sm">
                Last-minute adventures with amazing discounts
              </p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white 
                       px-4 py-2 rounded-lg transition-colors duration-200 backdrop-blur-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        
        {/* Mood Selection */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            What's your mood today?
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {MOOD_CATEGORIES.map((mood) => (
              <MoodCard
                key={mood.id}
                mood={mood}
                isSelected={selectedMood === mood.id}
                onClick={() => handleMoodSelect(mood.id)}
              />
            ))}
          </div>
          
          {selectedMood && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                onClick={() => setMood(null)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 
                         rounded-lg transition-colors duration-200"
              >
                Clear Mood
              </button>
              <button
                onClick={() => setActiveTab('explore')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                         rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                Browse All Tours
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Urgent Deals Section */}
        {urgentTours && urgentTours.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-400" />
                Last-Minute Deals
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  URGENT
                </span>
              </h2>
              <div className="text-sm text-slate-400">
                {urgentTours.length} tour{urgentTours.length !== 1 ? 's' : ''} ending soon
              </div>
            </div>
            
            <div className="space-y-4">
              {urgentTours.slice(0, 3).map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  isUrgent={true}
                  onBookingClick={handleBookTour}
                  onFavoriteToggle={handleFavoriteToggle}
                  isFavorite={favorites.includes(tour.id)}
                  formatPrice={formatPrice}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  calculateSavings={calculateSavings}
                  getUrgencyColor={getUrgencyColor}
                  className="animate-in slide-in-from-left duration-500"
                />
              ))}
              
              {urgentTours.length > 3 && (
                <button
                  onClick={() => setActiveTab('explore')}
                  className="w-full p-4 bg-slate-800 hover:bg-slate-700 text-white 
                           rounded-lg transition-colors duration-200 flex items-center justify-center gap-2
                           border border-slate-700 hover:border-slate-600"
                >
                  View {urgentTours.length - 3} More Urgent Deals
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mood-Based Tours */}
        {selectedMood && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              Perfect for Your {MOOD_CATEGORIES.find(m => m.id === selectedMood)?.title} Mood
            </h2>
            
            {loading ? (
              <TourCardSkeleton count={3} />
            ) : moodTours && moodTours.length > 0 ? (
              <div className="space-y-4">
                {moodTours.slice(0, 4).map((tour, index) => (
                  <TourCard
                    key={tour.id}
                    tour={tour}
                    onBookingClick={handleBookTour}
                    onFavoriteToggle={handleFavoriteToggle}
                    isFavorite={favorites.includes(tour.id)}
                    formatPrice={formatPrice}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    calculateSavings={calculateSavings}
                    getUrgencyColor={getUrgencyColor}
                    className={`animate-in slide-in-from-right duration-500`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  />
                ))}
                
                {moodTours.length > 4 && (
                  <button
                    onClick={() => setActiveTab('explore')}
                    className="w-full p-3 bg-slate-800 hover:bg-slate-700 text-white 
                             rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    See {moodTours.length - 4} More Tours
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <EmptyState 
                title="No tours found for this mood"
                description="Try a different mood or check back later for new adventures"
                onActionClick={() => setMood(null)}
                actionText="Clear Mood"
              />
            )}
          </div>
        )}

        {/* General Tours (when no mood selected) */}
        {!selectedMood && discoverTours && discoverTours.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center justify-between">
              <span>🌴 Available Adventures</span>
              <button
                onClick={() => setActiveTab('explore')}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors 
                         flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-3 h-3" />
              </button>
            </h2>
            
            <div className="space-y-4">
              {discoverTours.slice(0, 5).map((tour, index) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  onBookingClick={handleBookTour}
                  onFavoriteToggle={handleFavoriteToggle}
                  isFavorite={favorites.includes(tour.id)}
                  formatPrice={formatPrice}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  calculateSavings={calculateSavings}
                  getUrgencyColor={getUrgencyColor}
                  className="animate-in fade-in duration-500"
                  style={{ animationDelay: `${index * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        {!loading && (
          <CallToActionSection 
            onExploreClick={() => setActiveTab('explore')}
            onRefreshClick={handleRefresh}
            isRefreshing={isRefreshing}
          />
        )}
      </div>

      {/* Modals */}
      <BookingModal 
        tour={selectedTour}
        isOpen={showBookingModal}
        onClose={handleCloseBookingModal}
      />

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="register"
      />
    </div>
  )
}

// Mood Card Component
const MoodCard = ({ mood, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
      isSelected
        ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/25'
        : 'border-slate-700 bg-slate-800 hover:border-slate-600 hover:bg-slate-700'
    }`}
  >
    <div className="text-center">
      <div className="text-3xl mb-2" role="img" aria-label={mood.title}>
        {mood.emoji}
      </div>
      <div className={`font-semibold mb-1 ${
        isSelected ? 'text-blue-300' : 'text-white'
      }`}>
        {mood.title}
      </div>
      <div className="text-xs text-slate-400 leading-tight">
        {mood.subtitle}
      </div>
    </div>
  </button>
)

// Tour Card Skeleton Loader
const TourCardSkeleton = ({ count = 3 }) => (
  <div className="space-y-4">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            </div>
            <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="h-12 bg-slate-700 rounded"></div>
            <div className="h-12 bg-slate-700 rounded"></div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="h-6 bg-slate-700 rounded w-1/3"></div>
            <div className="h-10 bg-slate-700 rounded w-24"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
)

// Empty State Component
const EmptyState = ({ title, description, onActionClick, actionText }) => (
  <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700">
    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
      <span className="text-2xl">🌴</span>
    </div>
    <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
    <p className="text-slate-500 mb-4 max-w-md mx-auto">{description}</p>
    {onActionClick && (
      <button
        onClick={onActionClick}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg 
                 transition-colors duration-200"
      >
        {actionText}
      </button>
    )}
  </div>
)

// Call to Action Section
const CallToActionSection = ({ onExploreClick, onRefreshClick, isRefreshing }) => (
  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 
                  rounded-xl p-6 text-center">
    <h3 className="text-lg font-semibold text-white mb-2">
      Didn't find what you're looking for?
    </h3>
    <p className="text-slate-400 mb-4">
      Explore our complete collection of tours or refresh for new last-minute deals
    </p>
    
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <button
        onClick={onExploreClick}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg 
                 font-medium transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <Filter className="w-4 h-4" />
        Browse All Tours
      </button>
      
      <button
        onClick={onRefreshClick}
        disabled={isRefreshing}
        className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-6 py-3 rounded-lg 
                 font-medium transition-colors duration-200 flex items-center justify-center gap-2
                 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh Tours
      </button>
    </div>
  </div>
)

export default DiscoverTab