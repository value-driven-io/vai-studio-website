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

  return (
    
              <div className="space-y-6">
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
            

            {/* Filters and Search */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <select
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value)}
                      className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="all">{t('bookings.filters.allTime')}</option>
                      <option value="today">{t('bookings.filters.today')}</option>
                      <option value="tomorrow">{t('bookings.filters.tomorrow')}</option>
                      <option value="week">{t('bookings.filters.thisWeek')}</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder={t('bookings.filters.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm w-full sm:w-64"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">
                    {t('bookings.filters.showingResults', { 
                      filtered: filteredBookings.length, 
                      total: allBookings.length 
                    })}
                  </span>
                  <button
                    onClick={fetchAllBookings}
                    disabled={bookingsLoading}
                    className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                    title={t('bookings.filters.refreshBookings')}
                  >
                    <RefreshCw className={`w-5 h-5 ${bookingsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              
              {bookingFilter !== 'all' && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-slate-400">{t('bookings.filters.filteredBy')}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(bookingFilter)}`}>
                    {getStatusIcon(bookingFilter)}
                    <span className="capitalize">{bookingFilter}</span>
                  </span>
                  <button
                    onClick={() => setBookingFilter('all')}
                    className="text-xs text-slate-400 hover:text-white ml-2"
                  >
                    {t('bookings.filters.clearFilter')}
                  </button>
                </div>
              )}
            </div>

            {/* Bookings List */}
            {bookingsLoading ? (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
                <p className="text-slate-300">{t('bookings.messages.loading')}</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 text-center">
                <div className="text-slate-400 mb-4">
                  {bookingFilter === 'all' 
                    ? t('bookings.messages.noBookings')
                    : t('bookings.messages.noFilteredBookings', { status: bookingFilter })
                  }
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    {t('bookings.filters.clearSearch')}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {(filteredBookings.length > 0 ? filteredBookings : allBookings).map((booking) => {
                  const deadline = getTimeUntilDeadline(booking.confirmation_deadline)
                  const showDetails = shouldShowCustomerDetails(booking)
                  const totalParticipants = (booking.num_adults || 0) + (booking.num_children || 0)
                  
                  return (
                    <div key={booking.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
                      {/* Booking Header */}
                      <div className="p-6 border-b border-slate-700">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-white">
                                {booking.tours?.tour_name || t('bookings.labels.unknownTour')}
                              </h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.booking_status)}`}>
                                {getStatusIcon(booking.booking_status)}
                                <span className="capitalize">{booking.booking_status}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-300">
                              <span>{t('bookings.labels.ref')} {booking.booking_reference}</span>
                              <span>•</span>
                              <span>
                                {totalParticipants} {totalParticipants > 1 
                                  ? t('bookings.labels.participants') 
                                  : t('bookings.labels.participant')
                                }
                              </span>
                              <span>•</span>
                              <span>{formatPrice(booking.subtotal || 0)}</span>
                            </div>
                          </div>
                          
                          {booking.booking_status === 'pending' && (
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                              deadline.urgent 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              <Timer className="w-4 h-4" />
                              {deadline.text}
                            </div>
                          )}
                        </div>

                        {/* Tour Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-300">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(booking.tours?.tour_date)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {booking.tours?.time_slot || t('bookings.labels.timeTbd')}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {booking.tours?.meeting_point || t('bookings.labels.locationTbd')}
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {showDetails ? booking.customer_name : '*** ***'}
                            {!showDetails && <Lock className="w-3 h-3 text-slate-500" />}
                          </div>
                        </div>
                      </div>

                      {/* Customer Information - Progressive Disclosure */}
                      <div className="p-6 bg-slate-700/30">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-medium flex items-center gap-2">
                            {t('bookings.labels.customerDetails')}
                            {showDetails ? (
                              <Unlock className="w-4 h-4 text-green-400" />
                            ) : (
                              <Lock className="w-4 h-4 text-slate-500" />
                            )}
                          </h4>
                          {!showDetails && (
                            <div className="text-xs text-slate-400 bg-slate-600/30 px-2 py-1 rounded">
                              {t('bookings.labels.detailsUnlock')}
                            </div>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="text-slate-400">{t('bookings.labels.name')}</span>
                              <span className="text-white ml-2">
                                {showDetails ? booking.customer_name : '*** ***'}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-slate-400">{t('bookings.labels.contact')}</span>
                              <span className="text-white ml-2">
                                {showDetails ? booking.customer_whatsapp : '+*** *** ***'}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-slate-400">{t('bookings.labels.email')}</span>
                              <span className="text-white ml-2">
                                {showDetails ? booking.customer_email : '***@***.***'}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-slate-400">{t('bookings.labels.participantsLabel')}</span>
                              <span className="text-white ml-2">
                                {booking.num_adults} {booking.num_adults > 1 
                                  ? t('bookings.labels.adults') 
                                  : t('bookings.labels.adult')
                                }
                                {booking.num_children > 0 && 
                                  `, ${booking.num_children} ${booking.num_children > 1 
                                    ? t('bookings.labels.children') 
                                    : t('bookings.labels.child')
                                  }`
                                }
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {booking.special_requirements && (
                              <div className="text-sm">
                                <span className="text-slate-400">{t('bookings.labels.specialRequirements')}</span>
                                <span className="text-white ml-2">{booking.special_requirements}</span>
                              </div>
                            )}
                            {booking.dietary_restrictions && (
                              <div className="text-sm">
                                <span className="text-slate-400">{t('bookings.labels.dietary')}</span>
                                <span className="text-white ml-2">{booking.dietary_restrictions}</span>
                              </div>
                            )}
                            {booking.accessibility_needs && (
                              <div className="text-sm">
                                <span className="text-slate-400">{t('bookings.labels.accessibility')}</span>
                                <span className="text-white ml-2">{booking.accessibility_needs}</span>
                              </div>
                            )}
                            <div className="text-sm">
                              <span className="text-slate-400">{t('bookings.labels.booked')}</span>
                              <span className="text-white ml-2">{new Date(booking.created_at).toLocaleString()}</span>
                            </div>
                            {booking.booking_status === 'declined' && booking.decline_reason && (
                              <div className="text-sm">
                                <span className="text-slate-400">{t('bookings.labels.declineReason')}</span>
                                <span className="text-red-300 ml-2">{booking.decline_reason}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons - Context Sensitive */}
                      <div className="p-6 border-t border-slate-700">
                        {booking.booking_status === 'pending' && (
                          <div className="space-y-4">
                            <div className="flex gap-4">
                              <button
                                onClick={() => handleBookingAction(booking.id, 'confirmed')}
                                disabled={processingBooking === booking.id}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                              >
                                {processingBooking === booking.id ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-5 h-5" />
                                )}
                                {t('bookings.actions.confirmBooking')}
                              </button>
                              <button
                                onClick={() => handleDeclineBooking(booking.id)}
                                disabled={processingBooking === booking.id}
                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                              >
                                <XCircle className="w-5 h-5" />
                                {t('bookings.actions.decline')}
                              </button>
                            </div>
                            <div className="text-xs text-center text-slate-400">
                              {t('bookings.actions.unlockNotice')}
                            </div>
                          </div>
                        )}

                        {booking.booking_status === 'confirmed' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/*
                              <a
                                href={`https://wa.me/${booking.customer_whatsapp}?text=Hi ${booking.customer_name}! This is regarding your confirmed booking ${booking.booking_reference}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                              >
                                <MessageCircle className="w-4 h-4" />
                                {t('bookings.actions.whatsappCustomer')}
                              </a>
                              */}

                              {/* CHAT button */}
                                <button
                                  onClick={() => {
                                    setSelectedChatBooking(booking)
                                    setShowChatModal(true)
                                  }}
                                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  <span>Chat</span>
                                </button>

                              {/*    
                              <a
                                href={`tel:${booking.customer_phone}`}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                              >
                                <Phone className="w-4 h-4" />
                                {t('bookings.actions.callCustomer')}
                              </a>
                              */}

                              <button
                                onClick={() => handleBookingAction(booking.id, 'completed')}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                              >
                                
                                <Award className="w-4 h-4" />
                                {t('bookings.actions.markComplete')}
                              </button>
                            </div>
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                              <p className="text-green-300 text-sm">
                                {t('bookings.statusMessages.confirmed.title')} {' '}
                                {t('bookings.statusMessages.confirmed.message', { 
                                  customerName: booking.customer_name 
                                })}
                              </p>
                            </div>
                          </div>
                        )}

                        {booking.booking_status === 'declined' && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
                              <XCircle className="w-5 h-5" />
                              {t('bookings.statusMessages.declined.title')}
                            </div>
                            <p className="text-slate-300 text-sm mb-2">
                              {t('bookings.statusMessages.declined.message', { 
                                date: new Date(booking.cancelled_at).toLocaleString() 
                              })}
                            </p>
                            {booking.decline_reason && (
                              <div className="text-sm">
                                <strong className="text-slate-300">{t('bookings.statusMessages.declined.reasonProvided')}</strong>
                                <span className="text-red-300 ml-2">"{booking.decline_reason}"</span>
                              </div>
                            )}
                          </div>
                        )}

                        {booking.booking_status === 'completed' && (
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-blue-400 font-medium mb-2">
                              <Award className="w-5 h-5" />
                              {t('bookings.statusMessages.completed.title')}
                            </div>
                            <p className="text-slate-300 text-sm mb-3">
                              {t('bookings.statusMessages.completed.message')}
                            </p>
                            <div className="flex gap-2">
                              <a
                                href={`https://wa.me/${booking.customer_whatsapp}?text=${encodeURIComponent(
                                  t('bookings.statusMessages.completed.whatsappFollowUp', { 
                                    customerName: booking.customer_name,
                                    tourName: booking.tours?.tour_name 
                                  })
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-xs"
                              >
                                <MessageCircle className="w-3 h-3" />
                                {t('bookings.actions.followUp')}
                              </a>
                              <button className="flex items-center gap-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-xs">
                                <Star className="w-3 h-3" />
                                {t('bookings.actions.requestReview')}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

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

          </div>

  )
}

export default BookingsTab