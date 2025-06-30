// REPLACE: src/components/journey/JourneyTab.jsx
import React, { useState } from 'react'
import { 
  Calendar, Clock, MapPin, Users, Star, Heart, Phone, MessageCircle,
  RefreshCw, Search, Mail, Copy, ExternalLink, RotateCcw, BookOpen,
  CheckCircle, XCircle, AlertCircle, Timer, Award, TrendingUp
} from 'lucide-react'
import { useUserJourney } from '../../hooks/useUserJourney'
import { useAppStore } from '../../stores/bookingStore'
import { TOUR_TYPE_EMOJIS } from '../../constants/moods'
import BookingModal from '../booking/BookingModal'
import BookingLookup from './BookingLookup'
import OverviewSection from './OverviewSection'
import BookingSection from './BookingSection'
import FavoritesSection from './FavoritesSection'
import toast from 'react-hot-toast'

const JourneyTab = () => {
  const { 
    userBookings, 
    loading, 
    refreshBookings, 
    fetchUserBookings,
    getBookingStatusColor, 
    getBookingStatusIcon,
    canContactOperator,
    canRebook,
    formatPrice,
    formatDate,
    formatTime,
    getTotalBookings,
    getNextUpcomingTour,
    getUserContactInfo
  } = useUserJourney()

  const { favorites, toggleFavorite, setActiveTab } = useAppStore()
  
  // Local state
  const [activeSection, setActiveSection] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showRebookModal, setShowRebookModal] = useState(false)
  const [rebookTour, setRebookTour] = useState(null)
  const [showLookupModal, setShowLookupModal] = useState(false)

  // Filter bookings by search
  const filterBookings = (bookingsList) => {
    if (!searchQuery.trim()) return bookingsList
    
    const query = searchQuery.toLowerCase()
    return bookingsList.filter(booking => 
      booking.tours?.tour_name?.toLowerCase().includes(query) ||
      booking.operators?.company_name?.toLowerCase().includes(query) ||
      booking.booking_reference?.toLowerCase().includes(query) ||
      booking.operators?.island?.toLowerCase().includes(query)
    )
  }

  const handleContactOperator = (booking) => {
    if (booking.operators?.whatsapp_number) {
      const message = `Hi! I have a confirmed booking: ${booking.booking_reference}. Looking forward to the tour!`
      const url = `https://wa.me/${booking.operators.whatsapp_number}?text=${encodeURIComponent(message)}`
      window.open(url, '_blank')
    } else if (booking.operators?.phone) {
      window.open(`tel:${booking.operators.phone}`, '_self')
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

  const copyBookingReference = (reference) => {
    navigator.clipboard.writeText(reference)
    toast.success('Booking reference copied!')
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
        toast.success(`Found ${bookings.length} booking${bookings.length !== 1 ? 's' : ''}!`)
        setActiveSection('overview') // Switch to overview to show results
      } else {
        toast.error('No bookings found for this email/WhatsApp')
      }
    } catch (error) {
      toast.error('Failed to find bookings. Please try again.')
    }
  }

  // Helper functions for Savings calculation (for favorites)
  const calculateSavings = (originalPrice, discountPrice) => {
    if (!originalPrice || !discountPrice || originalPrice <= discountPrice) return 0
    return originalPrice - discountPrice
  }

  const getUrgencyColor = (hoursUntilDeadline) => {
    if (!hoursUntilDeadline) return 'bg-slate-500/20 text-slate-400'
    if (hoursUntilDeadline <= 2) return 'bg-red-500/20 text-red-400'
    if (hoursUntilDeadline <= 4) return 'bg-orange-500/20 text-orange-400'
    if (hoursUntilDeadline <= 8) return 'bg-yellow-500/20 text-yellow-400'
    return 'bg-green-500/20 text-green-400'
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">My Journey</h1>
              <p className="text-slate-400">
                {getTotalBookings() > 0 
                  ? `Track your ${getTotalBookings()} booking${getTotalBookings() !== 1 ? 's' : ''} and adventures`
                  : 'Your French Polynesia adventure starts here'
                }
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Find Bookings Button */}
              {getTotalBookings() === 0 && (
                <button
                  onClick={() => setShowLookupModal(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Find My Bookings
                </button>
              )}
              
              {/* Refresh Button */}
              <button
                onClick={refreshBookings}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'active', label: 'Active', icon: Timer, count: userBookings.active.length },
              { id: 'upcoming', label: 'Upcoming', icon: Calendar, count: userBookings.upcoming.length },
              { id: 'past', label: 'Past', icon: Award, count: userBookings.past.length },
              { id: 'favorites', label: 'Favorites', icon: Heart, count: favorites.length }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                    activeSection === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="bg-slate-600 text-white text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Search Bar */}
          {activeSection !== 'overview' && activeSection !== 'favorites' && (
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bookings..."
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-20">
          {/* REFRESH REMINDER */}
          {getTotalBookings() > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-6">
              <div className="flex items-center gap-2 text-blue-400 text-sm">
                <RefreshCw className="w-4 h-4" />
                <span>Click refresh for latest status updates on bookings</span>
              </div>
            </div>
          )}
        {loading && activeSection === 'overview' ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-800 rounded-xl h-32 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            {activeSection === 'overview' && (
              <OverviewSection 
                userBookings={userBookings}
                favorites={favorites}
                getTotalBookings={getTotalBookings}
                getNextUpcomingTour={getNextUpcomingTour}
                formatDate={formatDate}
                formatTime={formatTime}
                formatPrice={formatPrice}
                setActiveSection={setActiveSection}
                setActiveTab={setActiveTab}
              />
            )}
            
            {activeSection === 'active' && (
              <BookingSection
                title="Active Bookings"
                bookings={userBookings.active}
                filteredBookings={filterBookings(userBookings.active)}
                emptyMessage="No pending bookings"
                emptyIcon={Timer}
                handleContactOperator={handleContactOperator}
                handleRebook={handleRebook}
                copyBookingReference={copyBookingReference}
                handleGetSupport={handleGetSupport}
                canContactOperator={canContactOperator}
                canRebook={canRebook}
                formatPrice={formatPrice}
                formatDate={formatDate}
                formatTime={formatTime}
                getBookingStatusColor={getBookingStatusColor}
                getBookingStatusIcon={getBookingStatusIcon}
              />
            )}
            
            {activeSection === 'upcoming' && (
              <BookingSection
                title="Upcoming Adventures"
                bookings={userBookings.upcoming}
                filteredBookings={filterBookings(userBookings.upcoming)}
                emptyMessage="No upcoming tours"
                emptyIcon={Calendar}
                handleContactOperator={handleContactOperator}
                handleRebook={handleRebook}
                copyBookingReference={copyBookingReference}
                handleGetSupport={handleGetSupport}
                canContactOperator={canContactOperator}
                canRebook={canRebook}
                formatPrice={formatPrice}
                formatDate={formatDate}
                formatTime={formatTime}
                getBookingStatusColor={getBookingStatusColor}
                getBookingStatusIcon={getBookingStatusIcon}
              />
            )}
            
            {activeSection === 'past' && (
              <BookingSection
                title="Past Experiences"
                bookings={userBookings.past}
                filteredBookings={filterBookings(userBookings.past)}
                emptyMessage="No completed adventures yet"
                emptyIcon={Award}
                handleContactOperator={handleContactOperator}
                handleRebook={handleRebook}
                copyBookingReference={copyBookingReference}
                handleGetSupport={handleGetSupport}
                canContactOperator={canContactOperator}
                canRebook={canRebook}
                formatPrice={formatPrice}
                formatDate={formatDate}
                formatTime={formatTime}
                getBookingStatusColor={getBookingStatusColor}
                getBookingStatusIcon={getBookingStatusIcon}
              />
            )}
            
            {activeSection === 'favorites' && (
              <FavoritesSection
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                setActiveTab={setActiveTab}
                formatPrice={formatPrice}
                formatDate={formatDate}
                formatTime={formatTime}
                calculateSavings={calculateSavings}
                getUrgencyColor={getUrgencyColor}
              />
            )}
          </>
        )}
      </div>

      {/* Rebook Modal */}
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

      {/* Booking Lookup Modal */}
      <BookingLookup 
        isOpen={showLookupModal}
        onClose={() => setShowLookupModal(false)}
        onSearch={handleLookupBookings}
      />
    </div>
  )
}

export default JourneyTab