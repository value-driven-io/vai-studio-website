import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Calendar, Clock, MapPin, 
  CheckCircle, XCircle, AlertCircle,
  MessageCircle, Phone, Timer, RefreshCw,
  User, Loader2, Filter, Search, Star,
  Clock3, Award, Lock, Unlock
} from 'lucide-react'
import OperatorChatModal from './OperatorChatModal' 
import BookingsHeader from './BookingsHeader'
import BookingsList from './BookingsList'
import BookingDetailModal from './BookingDetailModal'

const BookingsTab = ({
  allBookings, 
  operator, 
  stats,
  bookingFilter,
  setBookingFilter,
  timeFilter,
  setTimeFilter,
  searchTerm,
  setSearchTerm,
  filteredBookings,
  bookingsLoading,
  fetchAllBookings,
  processingBooking,
  handleBookingAction,
  handleDeclineBooking,
  formatDate,
  formatPrice,
  getTimeUntilDeadline,
  getStatusColor,
  getStatusIcon,
  shouldShowCustomerDetails,
  setActiveTab   
}) => {
  const { t } = useTranslation()

  const [selectedChatBooking, setSelectedChatBooking] = useState(null)
  const [showChatModal, setShowChatModal] = useState(false)
  const [selectedDetailBooking, setSelectedDetailBooking] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Handle booking row click
  const handleBookingClick = (booking) => {
    setSelectedDetailBooking(booking)
    setShowDetailModal(true)
  }

  // Handle chat button click  
  const handleChatClick = (booking) => {
    setSelectedChatBooking(booking)
    setShowChatModal(true)
  }

  return (
    
              <div className="space-y-6">

                {/* Enhanced Header replaces old stats section */}
                <BookingsHeader
                  allBookings={allBookings}
                  operator={operator}
                  stats={stats}
                  bookingFilter={bookingFilter}
                  setBookingFilter={setBookingFilter}
                  timeFilter={timeFilter}
                  setTimeFilter={setTimeFilter}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  fetchAllBookings={fetchAllBookings}
                  formatPrice={formatPrice}
                  bookingsLoading={bookingsLoading}
                />

                {/* Optional Compact List View */}
                <div className="mb-6">
                  <BookingsList
                    filteredBookings={filteredBookings}
                    allBookings={allBookings}
                    bookingsLoading={bookingsLoading}
                    operator={operator}
                    formatDate={formatDate}
                    formatPrice={formatPrice}
                    getTimeUntilDeadline={getTimeUntilDeadline}
                    shouldShowCustomerDetails={shouldShowCustomerDetails}
                    onBookingClick={handleBookingClick}
                    onChatClick={(booking) => {
                      setSelectedChatBooking(booking)
                      setShowChatModal(true)
                    }}
                    setActiveTab={setActiveTab}
                  />
                </div>

            {/* Enhanced Clickable Stats */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {/* Total */}
                  <button
                    onClick={() => setBookingFilter('all')}
                    className={`text-center p-3 rounded-lg transition-all hover:scale-105 ${
                      bookingFilter === 'all' 
                        ? 'bg-blue-500/20 border border-blue-500/30' 
                        : 'bg-slate-700/30 border border-transparent hover:border-slate-600'
                    }`}
                  >
                    <div className="text-lg font-bold text-white">{stats.totalBookings || 0}</div>
                    <div className="text-xs text-slate-400">{t('bookings.stats.total')}</div>
                  </button>

                  {/* Pending */}
                  <button
                    onClick={() => setBookingFilter('pending')}
                    className={`text-center p-3 rounded-lg transition-all hover:scale-105 ${
                      bookingFilter === 'pending' 
                        ? 'bg-orange-500/20 border border-orange-500/30' 
                        : 'bg-slate-700/30 border border-transparent hover:border-slate-600'
                    }`}
                  >
                    <div className="text-lg font-bold text-white">{stats.pendingBookings || 0}</div>
                    <div className="text-xs text-orange-400">{t('bookings.stats.pending')}</div>
                  </button>

                  {/* Confirmed */}
                  <button
                    onClick={() => setBookingFilter('confirmed')}
                    className={`text-center p-3 rounded-lg transition-all hover:scale-105 ${
                      bookingFilter === 'confirmed' 
                        ? 'bg-green-500/20 border border-green-500/30' 
                        : 'bg-slate-700/30 border border-transparent hover:border-slate-600'
                    }`}
                  >
                    <div className="text-lg font-bold text-white">{stats.confirmedBookings || 0}</div>
                    <div className="text-xs text-green-400">{t('bookings.stats.confirmed')}</div>
                  </button>

                  {/* Declined */}
                  <button
                    onClick={() => setBookingFilter('declined')}
                    className={`text-center p-3 rounded-lg transition-all hover:scale-105 ${
                      bookingFilter === 'declined' 
                        ? 'bg-red-500/20 border border-red-500/30' 
                        : 'bg-slate-700/30 border border-transparent hover:border-slate-600'
                    }`}
                  >
                    <div className="text-lg font-bold text-white">{stats.declinedBookings || 0}</div>
                    <div className="text-xs text-red-400">{t('bookings.stats.declined')}</div>
                  </button>

                  {/* Completed */}
                  <button
                    onClick={() => setBookingFilter('completed')}
                    className={`text-center p-3 rounded-lg transition-all hover:scale-105 ${
                      bookingFilter === 'completed' 
                        ? 'bg-blue-500/20 border border-blue-500/30' 
                        : 'bg-slate-700/30 border border-transparent hover:border-slate-600'
                    }`}
                  >
                    <div className="text-lg font-bold text-white">{stats.completedBookings || 0}</div>
                    <div className="text-xs text-blue-400">{t('bookings.stats.completed')}</div>
                  </button>

                  {/* Active Tours */}
                    <button
                      onClick={() => {
                        if (stats.activeTours > 0) {
                          setActiveTab('tours')
                        } else {
                          setActiveTab('create')
                        }
                      }}
                      className="text-center p-3 rounded-lg bg-slate-700/30 border border-transparent hover:border-slate-600 transition-all hover:scale-105"
                    >
                      <div className="text-lg font-bold text-white">{stats.activeTours || 0}</div>
                      <div className="text-xs text-purple-400">{t('bookings.stats.active')}</div>
                    </button>
                </div>
              </div>
            

            {/* Chat Modal */}
            <OperatorChatModal
              isOpen={showChatModal}
              onClose={() => {
                setShowChatModal(false)
                setSelectedChatBooking(null)
              }}
              booking={selectedChatBooking}
              operator={operator} // Pass operator from props
            />

            {/* Booking Detail Modal */}
            <BookingDetailModal
              isOpen={showDetailModal}
              onClose={() => {
                setShowDetailModal(false)
                setSelectedDetailBooking(null)
              }}
              booking={selectedDetailBooking}
              operator={operator}
              formatDate={formatDate}
              formatPrice={formatPrice}
              getTimeUntilDeadline={getTimeUntilDeadline}
              shouldShowCustomerDetails={shouldShowCustomerDetails}
              handleBookingAction={handleBookingAction}
              handleDeclineBooking={handleDeclineBooking}
              processingBooking={processingBooking}
              onChatClick={handleChatClick}
              getStatusColor={getStatusColor} 
              getStatusIcon={getStatusIcon}
            />

          </div>

  )
}

export default BookingsTab