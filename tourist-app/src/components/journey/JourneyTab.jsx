// src/components/journey/JourneyTab.jsx
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
      setRebookTour(booking.tours)
      setShowRebookModal(true)
    }
  }

  const copyBookingReference = (reference) => {
    navigator.clipboard.writeText(reference)
    toast.success('Booking reference copied!')
  }

  const handleGetSupport = (booking) => {
    const message = `Hi! I need help with my booking ${booking.booking_reference}. Can you assist me?`
    const url = `https://wa.me/68987269065?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const handleLookupBookings = (email, whatsapp) => {
    fetchUserBookings(email, whatsapp)
    toast.success('Searching for your bookings...')
  }

  const BookingCard = ({ booking, showActions = true }) => {
    const statusColor = getBookingStatusColor(booking.booking_status)
    const statusIcon = getBookingStatusIcon(booking.booking_status)
    
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-all">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">
                {TOUR_TYPE_EMOJIS[booking.tours?.tour_type] || '🌴'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {booking.tours?.tour_name || 'Tour Information Unavailable'}
                </h3>
                <p className="text-slate-400 text-sm">
                  {booking.operators?.company_name || 'Unknown Operator'}
                </p>
              </div>
            </div>
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
              <span>{statusIcon}</span>
              <span className="capitalize">{booking.booking_status}</span>
            </div>
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-300 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(booking.tours?.tour_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{formatTime(booking.tours?.time_slot)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{booking.operators?.island || 'Unknown location'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{(booking.num_adults || 0) + (booking.num_children || 0)} guests</span>
            </div>
          </div>

          {/* Reference & Price */}
          <div className="flex items-center justify-between mb-4 p-3 bg-slate-900 rounded-lg">
            <div>
              <p className="text-xs text-slate-400">Booking Reference</p>
              <div className="flex items-center gap-2">
                <span className="text-white font-mono text-sm">{booking.booking_reference}</span>
                <button
                  onClick={() => copyBookingReference(booking.booking_reference)}
                  className="text-slate-400 hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Total Paid</p>
              <p className="text-lg font-semibold text-white">
                {formatPrice(booking.total_amount || (booking.subtotal + booking.commission_amount))}
              </p>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2">
              {canContactOperator(booking) && (
                <button
                  onClick={() => handleContactOperator(booking)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact Operator
                </button>
              )}
              
              {canRebook(booking) && (
                <button
                  onClick={() => handleRebook(booking)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  Rebook
                </button>
              )}
              
              <button
                onClick={() => handleGetSupport(booking)}
                className="bg-slate-600 hover:bg-slate-700 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
              >
                <Mail className="w-4 h-4" />
                Support
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const OverviewSection = () => {
    const nextTour = getNextUpcomingTour()
    const totalBookings = getTotalBookings()
    const { email, whatsapp } = getUserContactInfo()

    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🌴 Your Polynesian Journey</h2>
              <p className="opacity-90">
                {totalBookings > 0 
                  ? `You have ${totalBookings} booking${totalBookings > 1 ? 's' : ''} with us`
                  : 'Start your adventure by booking your first tour!'
                }
              </p>
            </div>
            <div className="text-4xl opacity-80">
              {nextTour ? '🎫' : '🏝️'}
            </div>
          </div>
        </div>

        {/* Next Tour Alert */}
        {nextTour && (
          <div className="bg-slate-800 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Next Adventure Coming Up!
                </h3>
                <p className="text-slate-300 mb-3">
                  {nextTour.tours?.tour_name} • {formatDate(nextTour.tours?.tour_date)} at {formatTime(nextTour.tours?.time_slot)}
                </p>
                <button
                  onClick={() => handleContactOperator(nextTour)}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact Operator
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">{userBookings.active.length}</div>
            <div className="text-slate-400 text-sm">Pending</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{userBookings.upcoming.length}</div>
            <div className="text-slate-400 text-sm">Upcoming</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{userBookings.past.length}</div>
            <div className="text-slate-400 text-sm">Completed</div>
          </div>
          <div className="bg-slate-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{favorites.length}</div>
            <div className="text-slate-400 text-sm">Favorites</div>
          </div>
        </div>

        {/* Recent Activity */}
        {totalBookings > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[...userBookings.active, ...userBookings.upcoming]
                .slice(0, 2)
                .map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
            </div>
          </div>
        )}

        {/* No Bookings State */}
        {totalBookings === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No bookings found</h3>
            <p className="text-slate-500 mb-6">Start your French Polynesian adventure or find existing bookings</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setActiveTab('discover')}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors"
              >
                Discover Tours
              </button>
              <button
                onClick={() => setShowLookupModal(true)}
                className="bg-slate-600 hover:bg-slate-700 text-white py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Find My Bookings
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const BookingSection = ({ title, bookings, emptyMessage, emptyIcon: EmptyIcon }) => {
    const filteredBookings = filterBookings(bookings)
    
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <span className="text-slate-400 text-sm">{filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}</span>
        </div>
        
        {filteredBookings.length === 0 ? (
          <div className="text-center py-8">
            <EmptyIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="pt-8 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                📅 My Journey
              </h1>
              <p className="text-slate-400">
                Your bookings and adventures
              </p>
            </div>
            
            <button
              onClick={refreshBookings}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
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

        {/* Content */}
        <div className="pb-20">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-800 rounded-xl h-32 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <>
              {activeSection === 'overview' && <OverviewSection />}
              
              {activeSection === 'active' && (
                <BookingSection
                  title="Active Bookings"
                  bookings={userBookings.active}
                  emptyMessage="No pending bookings"
                  emptyIcon={Timer}
                />
              )}
              
              {activeSection === 'upcoming' && (
                <BookingSection
                  title="Upcoming Adventures"
                  bookings={userBookings.upcoming}
                  emptyMessage="No upcoming tours"
                  emptyIcon={Calendar}
                />
              )}
              
              {activeSection === 'past' && (
                <BookingSection
                  title="Past Experiences"
                  bookings={userBookings.past}
                  emptyMessage="No completed adventures yet"
                  emptyIcon={Award}
                />
              )}
              
              {activeSection === 'favorites' && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Saved Tours</h3>
                  {favorites.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-400 mb-2">No saved tours</h3>
                      <p className="text-slate-500 mb-6">Save tours you're interested in for quick access</p>
                      <button
                        onClick={() => setActiveTab('discover')}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors"
                      >
                        Explore Tours
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-400">Favorites feature coming soon!</p>
                      <p className="text-slate-500 text-sm mt-2">We're working on showing your saved tours here</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
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