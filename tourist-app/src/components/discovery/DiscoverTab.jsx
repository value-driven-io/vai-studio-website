// Enhanced DiscoverTab Integration (CONVERTED TO i18n)
// File: src/components/discovery/DiscoverTab.jsx

import React, { useState, useEffect } from 'react'
import { RefreshCw, ArrowRight, Sparkles, Zap, Filter } from 'lucide-react'
import { useTours } from '../../hooks/useTours'
import { useAppStore } from '../../stores/bookingStore'
import { MOOD_CATEGORIES } from '../../constants/moods'
import TourCard from '../shared/TourCard'
import BookingModal from '../booking/BookingModal'
import AuthModal from '../auth/AuthModal'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import VAILogo from '../shared/VAILogo'
// 🌍 NEW: Import useTranslation
import { useTranslation } from 'react-i18next'

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
  // 🌍 NEW: Initialize translation hook
  const { t } = useTranslation()

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
      toast.success(t('toastNotifications.tourUpdated'))
    } catch (error) {
      toast.error(t('toastNotifications.refreshFailed'))
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000)
    }
  }

  // 🌍 HELPER: Get translated mood data
  const getTranslatedMood = (moodId) => {
    const originalMood = MOOD_CATEGORIES.find(m => m.id === moodId)
    if (!originalMood) return null
    
    return {
      ...originalMood,
      title: t(`moods.${moodId}.title`),
      subtitle: t(`moods.${moodId}.subtitle`),
      description: t(`moods.${moodId}.description`)
    }
  }

  // 🌍 HELPER: Get all moods with translations
  const getTranslatedMoods = () => {
    return MOOD_CATEGORIES.map(mood => ({
      ...mood,
      title: t(`moods.${mood.id}.title`),
      subtitle: t(`moods.${mood.id}.subtitle`),
      description: t(`moods.${mood.id}.description`)
    }))
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              {/* 🌍 TRANSLATED: Page title and subtitle */}
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            {t('discovery.moodQuestion')}
          </h2>
              <p className="text-slate-400">
                {t('discovery.subtitle')}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading || isRefreshing}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white 
                         px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${(loading || isRefreshing) ? 'animate-spin' : ''}`} />
                {/* 🌍 TRANSLATED: Refresh button */}
                <span className="hidden sm:inline">{t('discovery.refreshTours')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        
        {/* Mood Selection */}
        <div className="space-y-4">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* 🌍 TRANSLATED: Use translated moods */}
            {getTranslatedMoods().map((mood) => (
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
                {/* 🌍 TRANSLATED: Clear mood button */}
                {t('discovery.clearMood')}
              </button>
              <button
                onClick={() => setActiveTab('explore')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                         rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                {/* 🌍 TRANSLATED: Browse all tours button */}
                {t('discovery.browseAllTours')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Urgent Deals Section */}
        {urgentTours && urgentTours.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              {/* 🌍 TRANSLATED: Last minute deals section */}
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-400" />
                {t('discovery.lastMinuteDeals')}
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {t('discovery.urgent')}
                </span>
              </h2>
              <div className="text-sm text-slate-400">
                {/* 🌍 TRANSLATED: Dynamic plural handling */}
                {urgentTours.length} {urgentTours.length === 1 ? t('discovery.tours') : t('discovery.toursPlural')} {t('discovery.endingSoon')}
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
                  {/* 🌍 TRANSLATED: More deals button with interpolation */}
                  {t('discovery.moreUrgentDeals', { count: urgentTours.length - 3 })}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mood-Based Tours */}
        {selectedMood && (
          <div className="space-y-4">
            {/* 🌍 TRANSLATED: Perfect for mood section */}
            <h2 className="text-xl font-semibold text-white">
              {t('discovery.perfectForMood', { 
                mood: getTranslatedMood(selectedMood)?.title || selectedMood 
              })}
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
                    {/* 🌍 TRANSLATED: See more tours with interpolation */}
                    {t('discovery.seeMoreTours', { count: moodTours.length - 4 })}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <EmptyState 
                title={t('discovery.noToursFound')}
                description={t('discovery.tryDifferentMood')}
                onActionClick={() => setMood(null)}
                actionText={t('discovery.clearMood')}
              />
            )}
          </div>
        )}

        {/* General Tours (when no mood selected) */}
        {!selectedMood && discoverTours && discoverTours.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center justify-between">
              {/* 🌍 TRANSLATED: Available adventures */}
              <span>{t('discovery.availableAdventures')}</span>
              <button
                onClick={() => setActiveTab('explore')}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors 
                         flex items-center gap-1"
              >
                {/* 🌍 TRANSLATED: View all button */}
                {t('discovery.viewAll')}
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
                  className="animate-in slide-in-from-bottom duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <CallToActionSection 
          onExploreClick={() => setActiveTab('explore')}
          onRefreshClick={handleRefresh}
          isRefreshing={isRefreshing}
          t={t} // Pass translation function
        />
      </div>

      {/* Modals */}
      {selectedTour && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={handleCloseBookingModal}
          tour={selectedTour}
          formatPrice={formatPrice}
          formatDate={formatDate}
          formatTime={formatTime}
        />
      )}

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  )
}

// 🌍 HELPER COMPONENTS (keeping existing structure, no translation needed)

// Mood Card Component (receives translated mood data)
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

// Tour Card Skeleton Loader (no changes needed)
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

// Empty State Component (receives translated strings)
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

// Call to Action Section (now receives translation function)
const CallToActionSection = ({ onExploreClick, onRefreshClick, isRefreshing, t }) => (
  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 
                  rounded-xl p-6 text-center">
    {/* 🌍 TRANSLATED: CTA question */}
    <h3 className="text-lg font-semibold text-white mb-2">
      {t('discovery.didntFindQuestion')}
    </h3>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <button
        onClick={onExploreClick}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg 
                 font-medium transition-colors"
      >
        {t('discovery.browseAllTours')}
      </button>
      <button
        onClick={onRefreshClick}
        disabled={isRefreshing}
        className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg 
                 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        {t('discovery.refreshTours')}
      </button>
    </div>
  </div>
)

export default DiscoverTab