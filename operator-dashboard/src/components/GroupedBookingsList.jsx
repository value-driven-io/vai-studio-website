// operator-dashboard/src/components/GroupedBookingsList.jsx
import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Calendar, Clock, User, Eye, MessageCircle, 
  AlertCircle, CheckCircle, XCircle, Timer,
  TrendingUp, ChevronDown, ChevronRight, 
  Users, MapPin, DollarSign, Activity
} from 'lucide-react'
import PaymentStatusIndicator from './PaymentStatusIndicator'

const GroupedBookingsList = ({
  filteredBookings,
  allBookings,
  tours,
  bookingsLoading,
  operator,
  formatDate,
  formatPrice,
  getTimeUntilDeadline,
  shouldShowCustomerDetails,
  onBookingClick,
  onChatClick,
  setActiveTab
}) => {
  const { t } = useTranslation()
  const [expandedTour, setExpandedTour] = useState(null)

  // Group bookings by tour (REVERT TO ORIGINAL WORKING APPROACH)
  const groupedTours = useMemo(() => {
    // Use filteredBookings directly - if empty due to filters, show empty results
    const bookingsToGroup = filteredBookings
    
    // Group bookings by tour
    
    // Start with the original working logic - group bookings first
    const groups = bookingsToGroup.reduce((acc, booking) => {
      // FIXED: Use tour name as the primary key to match bookings with tours
      const tourName = booking.tours?.tour_name || 'Unknown Tour'
      
      // Try to find the corresponding tour from the tours array by name
      const matchingTour = tours?.find(t => t.tour_name === tourName)
      const tourId = matchingTour?.id || booking.tours?.id || 'unknown'
      const tourKey = `${tourId}-${tourName}`
      
      // Processing booking for tour: ${tourName}
      
      if (!acc[tourKey]) {
        acc[tourKey] = {
          tour: matchingTour || booking.tours || { 
            id: tourId, 
            tour_name: tourName,
            tour_date: null,
            time_slot: null,
            meeting_point: null
          },
          bookings: [],
          totalRevenue: 0,
          pendingCount: 0,
          confirmedCount: 0,
          completedCount: 0,
          declinedCount: 0,
          urgentCount: 0,
          occupancyRate: 0,
          spotsBooked: 0
        }
      }
      
      acc[tourKey].bookings.push(booking)
      acc[tourKey].totalRevenue += (booking.subtotal || 0)
      
      // Count by status
      switch (booking.booking_status) {
        case 'pending':
          acc[tourKey].pendingCount++
          break
        case 'confirmed':
          acc[tourKey].confirmedCount++
          break
        case 'completed':
          acc[tourKey].completedCount++
          break
        case 'declined':
          acc[tourKey].declinedCount++
          break
        default:
          break
      }
      
      // Count urgent bookings
      if (booking.booking_status === 'pending' && booking.tours?.booking_deadline) {
        const deadline = new Date(booking.tours.booking_deadline)
        const now = new Date()
        const hoursUntil = (deadline - now) / (1000 * 60 * 60)
        if (hoursUntil <= 16 && hoursUntil > 0) {
          acc[tourKey].urgentCount++
        }
      }
      
      return acc
    }, {})

    // NOW add tours with no bookings (only if we have tours data)
    if (tours && tours.length > 0) {
      tours.forEach(tour => {
        const tourKey = `${tour.id}-${tour.tour_name}`
        
        // Only add if this tour doesn't already exist in booking groups
        if (!groups[tourKey]) {
          // Adding empty tour slot
          groups[tourKey] = {
            tour: tour,
            bookings: [],
            totalRevenue: 0,
            pendingCount: 0,
            confirmedCount: 0,
            completedCount: 0,
            declinedCount: 0,
            urgentCount: 0,
            occupancyRate: 0,
            spotsBooked: 0
          }
        } else {
          // Tour already has bookings
        }
      })
    }
    
    // Calculate occupancy rates and spots booked
    Object.values(groups).forEach(group => {
      if (group.tour.max_capacity && group.tour.available_spots !== undefined) {
        group.spotsBooked = group.tour.max_capacity - group.tour.available_spots
        group.occupancyRate = Math.round((group.spotsBooked / group.tour.max_capacity) * 100)
      }
    })
    
    // Sort groups for display
    
    // Sort by urgency and revenue
    const sortedEntries = Object.entries(groups).sort(([, a], [, b]) => {
      if (a.urgentCount !== b.urgentCount) return b.urgentCount - a.urgentCount
      if (a.bookings.length !== b.bookings.length) return b.bookings.length - a.bookings.length
      return b.totalRevenue - a.totalRevenue
    })
    
    // Entries sorted by priority
    return sortedEntries
  }, [tours, filteredBookings])

  // Get booking priority
  const getBookingPriority = (booking) => {
    if (booking.booking_status !== 'pending') {
      return {
        level: booking.booking_status,
        color: booking.booking_status === 'confirmed' ? 'green' : 
               booking.booking_status === 'completed' ? 'blue' :
               booking.booking_status === 'declined' ? 'red' : 'gray',
        icon: booking.booking_status === 'confirmed' ? CheckCircle :
              booking.booking_status === 'completed' ? CheckCircle :
              booking.booking_status === 'declined' ? XCircle : AlertCircle,
        urgent: false
      }
    }

    if (!booking.tours?.booking_deadline) {
      return { level: 'medium', color: 'yellow', icon: AlertCircle, urgent: false }
    }

    const deadline = new Date(booking.tours.booking_deadline)
    const now = new Date()
    const hoursUntil = (deadline - now) / (1000 * 60 * 60)

    if (hoursUntil <= 8 && hoursUntil > 0) {
      return { level: 'critical', color: 'red', icon: Timer, urgent: true }
    }
    if (hoursUntil <= 16 && hoursUntil > 0) {
      return { level: 'high', color: 'orange', icon: Timer, urgent: true }
    }
    return { level: 'medium', color: 'yellow', icon: AlertCircle, urgent: false }
  }

  // Handle tour toggle
  const handleTourToggle = (tourId) => {
    const newExpanded = expandedTour === tourId ? null : tourId
    setExpandedTour(newExpanded)
  }

  if (bookingsLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400">{t('bookings.messages.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (groupedTours.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            {t('bookings.list.noBookings')}
          </h3>
          <p className="text-slate-400 mb-6">
            {t('bookings.list.createFirstTour')}
          </p>
          <button
            onClick={() => setActiveTab('templates')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {t('bookings.list.createTour')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-medium text-white">
              {t('bookings.grouped.title')}
            </h3>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
              {groupedTours.length} {t('bookings.grouped.activities')}
            </span>
          </div>
          
          <div className="text-xs text-slate-400">
            {t('bookings.grouped.clickToExpand')}
          </div>
        </div>
      </div>

      {/* Grouped Tours */}
      <div className="divide-y divide-slate-700/50">
        {groupedTours.map(([tourId, group]) => {
          const isExpanded = expandedTour === tourId
          const totalBookings = group.bookings.length
          const hasUrgentBookings = group.urgentCount > 0
          
          // Rendering tour ${tourId}: expanded=${isExpanded}, bookings count=${totalBookings}
          
          return (
            <div key={tourId} className="bg-slate-800/20">
              {/* Tour Header */}
              <button
                onClick={() => handleTourToggle(tourId)}
                className="w-full p-4 hover:bg-slate-700/30 transition-colors text-left"
              >
                {/* Desktop Layout */}
                <div className="hidden md:flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-white font-medium text-lg">
                          {group.tour.tour_name}
                        </h4>
                        {hasUrgentBookings && (
                          <div className="flex items-center gap-1 bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">
                            <Timer className="w-3 h-3" />
                            <span>{group.urgentCount} urgent</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(group.tour.tour_date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{group.tour.time_slot || 'TBD'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate max-w-[200px]">
                            {group.tour.meeting_point || 'TBD'}
                          </span>
                        </div>
                        {/* Occupancy Rate for tours with capacity */}
                        {group.tour.max_capacity && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>
                              {group.spotsBooked}/{group.tour.max_capacity} ({group.occupancyRate}%)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {/* Booking Status Summary */}
                    <div className="flex items-center gap-3 text-sm">
                      {totalBookings === 0 ? (
                        <div className="flex items-center gap-1 text-slate-500">
                          <div className="w-2 h-2 bg-slate-500 rounded-full" />
                          <span className="text-xs">{t('bookings.grouped.noBookings')}</span>
                        </div>
                      ) : (
                        <>
                          {group.pendingCount > 0 && (
                            <div className="flex items-center gap-1 text-orange-400">
                              <div className="w-2 h-2 bg-orange-400 rounded-full" />
                              <span>{group.pendingCount}</span>
                            </div>
                          )}
                          {group.confirmedCount > 0 && (
                            <div className="flex items-center gap-1 text-green-400">
                              <div className="w-2 h-2 bg-green-400 rounded-full" />
                              <span>{group.confirmedCount}</span>
                            </div>
                          )}
                          {group.completedCount > 0 && (
                            <div className="flex items-center gap-1 text-blue-400">
                              <div className="w-2 h-2 bg-blue-400 rounded-full" />
                              <span>{group.completedCount}</span>
                            </div>
                          )}
                          {group.declinedCount > 0 && (
                            <div className="flex items-center gap-1 text-red-400">
                              <div className="w-2 h-2 bg-red-400 rounded-full" />
                              <span>{group.declinedCount}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    {/* Total Revenue and Bookings Info */}
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        {group.totalRevenue > 0 ? formatPrice(group.totalRevenue) : 
                          <span className="text-slate-500">No revenue</span>
                        }
                      </div>
                      <div className="text-xs text-slate-400">
                        {totalBookings === 0 ? 
                          t('bookings.grouped.availableSpots', { spots: group.tour.available_spots || group.tour.max_capacity || 0 }) :
                          `${totalBookings} ${totalBookings === 1 ? 'booking' : 'bookings'}`
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden">
                  <div className="flex items-start gap-3 mb-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-slate-400 mt-0.5" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400 mt-0.5" />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium text-lg truncate">
                            {group.tour.tour_name}
                          </h4>
                          {hasUrgentBookings && (
                            <div className="flex items-center gap-1 bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs mt-1 w-fit">
                              <Timer className="w-3 h-3" />
                              <span>{group.urgentCount} urgent</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right ml-3">
                          <div className="text-white font-semibold">
                            {group.totalRevenue > 0 ? formatPrice(group.totalRevenue) : 
                              <span className="text-slate-500">No revenue</span>
                            }
                          </div>
                          <div className="text-xs text-slate-400">
                            {totalBookings === 0 ? 
                              t('bookings.grouped.availableSpots', { spots: group.tour.available_spots || group.tour.max_capacity || 0 }) :
                              `${totalBookings} ${totalBookings === 1 ? 'booking' : 'bookings'}`
                            }
                          </div>
                        </div>
                      </div>
                      
                      {/* Mobile Tour Details */}
                      <div className="space-y-1 mt-2 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(group.tour.tour_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>{group.tour.time_slot || 'TBD'}</span>
                        </div>
                        {group.tour.max_capacity && (
                          <div className="flex items-center gap-2">
                            <Users className="w-3 h-3" />
                            <span>{group.spotsBooked}/{group.tour.max_capacity} ({group.occupancyRate}%)</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Mobile Booking Status */}
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        {totalBookings === 0 ? (
                          <div className="flex items-center gap-1 text-slate-500">
                            <div className="w-2 h-2 bg-slate-500 rounded-full" />
                            <span className="text-xs">{t('bookings.grouped.noBookings')}</span>
                          </div>
                        ) : (
                          <>
                            {group.pendingCount > 0 && (
                              <div className="flex items-center gap-1 text-orange-400">
                                <div className="w-2 h-2 bg-orange-400 rounded-full" />
                                <span className="text-xs">{group.pendingCount} pending</span>
                              </div>
                            )}
                            {group.confirmedCount > 0 && (
                              <div className="flex items-center gap-1 text-green-400">
                                <div className="w-2 h-2 bg-green-400 rounded-full" />
                                <span className="text-xs">{group.confirmedCount} confirmed</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
              
              {/* Expanded Bookings */}
              {isExpanded && (
                <div className="border-t border-slate-700/50 bg-slate-900/50">
                  {group.bookings.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="text-slate-400 mb-2">
                        <Users className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">{t('bookings.grouped.noBookingsForTour')}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {group.tour.max_capacity && group.tour.available_spots !== undefined
                            ? t('bookings.grouped.spotsAvailable', { 
                                available: group.tour.available_spots, 
                                total: group.tour.max_capacity 
                              })
                            : t('bookings.grouped.readyForBookings')
                          }
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-700/30">
                      {/* Rendering bookings for ${group.tour.tour_name} */}
                      {group.bookings.map((booking) => {
                        const priority = getBookingPriority(booking)
                        const showDetails = shouldShowCustomerDetails(booking)
                        const totalParticipants = (booking.num_adults || 0) + (booking.num_children || 0)
                        
                        return (
                          <div
                            key={booking.id}
                            className="p-4 hover:bg-slate-700/20 transition-colors cursor-pointer"
                            onClick={() => onBookingClick(booking)}
                          >
                            {/* Desktop Layout */}
                            <div className="hidden md:flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                {/* Status Indicator */}
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${
                                    priority.color === 'red' ? 'bg-red-400' :
                                    priority.color === 'orange' ? 'bg-orange-400' :
                                    priority.color === 'yellow' ? 'bg-yellow-400' :
                                    priority.color === 'green' ? 'bg-green-400' :
                                    priority.color === 'blue' ? 'bg-blue-400' : 'bg-slate-400'
                                  } ${priority.urgent ? 'animate-pulse' : ''}`} />
                                  
                                  {priority.urgent && (
                                    <Timer className="w-4 h-4 text-red-400" />
                                  )}
                                </div>
                                
                                {/* Customer Info */}
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-slate-400" />
                                  <div>
                                    <div className="text-white font-medium">
                                      {showDetails ? booking.customer_name : '***'}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                      {booking.booking_reference}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Participants */}
                                <div className="text-sm text-slate-400">
                                  {totalParticipants} {totalParticipants === 1 ? 'participant' : 'participants'}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4">
                                {/* Payment Status */}
                                <PaymentStatusIndicator booking={booking} compact={true} />
                                
                                {/* Revenue */}
                                <div className="text-right">
                                  <div className="text-white font-semibold">
                                    {formatPrice(booking.subtotal || 0)}
                                  </div>
                                </div>
                                
                                {/* Actions */}
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onBookingClick(booking)
                                    }}
                                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition-colors"
                                    title={t('bookings.actions.viewDetails')}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  
                                  {booking.booking_status === 'confirmed' && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onChatClick(booking)
                                      }}
                                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                                      title={t('bookings.actions.chat')}
                                    >
                                      <MessageCircle className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Mobile Layout */}
                            <div className="md:hidden">
                              {/* Mobile Card Header */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${
                                    priority.color === 'red' ? 'bg-red-400' :
                                    priority.color === 'orange' ? 'bg-orange-400' :
                                    priority.color === 'yellow' ? 'bg-yellow-400' :
                                    priority.color === 'green' ? 'bg-green-400' :
                                    priority.color === 'blue' ? 'bg-blue-400' : 'bg-slate-400'
                                  } ${priority.urgent ? 'animate-pulse' : ''}`} />
                                  
                                  <span className="text-white font-medium">
                                    {showDetails ? booking.customer_name : '***'}
                                  </span>
                                  
                                  {priority.urgent && (
                                    <Timer className="w-4 h-4 text-red-400" />
                                  )}
                                </div>
                                
                                <div className="text-right">
                                  <div className="text-white font-semibold">
                                    {formatPrice(booking.subtotal || 0)}
                                  </div>
                                </div>
                              </div>

                              {/* Mobile Card Details */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-400 text-sm">Reference</span>
                                  <span className="text-white text-sm">{booking.booking_reference}</span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-400 text-sm">Participants</span>
                                  <span className="text-white text-sm">
                                    {totalParticipants} {totalParticipants === 1 ? 'person' : 'people'}
                                  </span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-400 text-sm">Payment</span>
                                  <PaymentStatusIndicator booking={booking} compact={true} />
                                </div>
                              </div>

                              {/* Mobile Actions */}
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onBookingClick(booking)
                                  }}
                                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors"
                                >
                                  {t('bookings.actions.viewDetails')}
                                </button>
                                
                                {booking.booking_status === 'confirmed' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onChatClick(booking)
                                    }}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                      )
                    })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default GroupedBookingsList