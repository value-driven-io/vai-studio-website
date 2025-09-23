// operator-dashboard/src/components/BookingsList.jsx
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Calendar, Clock, User, Eye, MessageCircle, 
  AlertCircle, CheckCircle, XCircle, Timer,
  TrendingUp, ArrowUpDown, Filter
} from 'lucide-react'
import PaymentStatusIndicator from './PaymentStatusIndicator'

const BookingsList = ({
  filteredBookings,
  allBookings,
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

  // 🎯 PRIORITY CALCULATION (8h/16h windows)
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

    // For pending bookings, check tour deadline
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

  // 💰 NET REVENUE CALCULATION
  const calculateNetRevenue = (booking) => {
    return booking.subtotal || 0
  }

  // 📋 BOOKINGS TO DISPLAY
  const bookingsToDisplay = filteredBookings.length > 0 ? filteredBookings : allBookings

  // 📱 RESPONSIVE LAYOUT DETECTOR
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

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

  if (bookingsToDisplay.length === 0) {
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
      {/* 📊 LIST HEADER */}
      <div className="p-4 border-b border-slate-700 bg-slate-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-medium text-white">
              {t('bookings.list.title')}
            </h3>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
              {bookingsToDisplay.length}
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span>{t('bookings.list.sortedBy')}</span>
            <ArrowUpDown className="w-3 h-3" />
            <span>{t('bookings.list.priority')}</span>
          </div>
        </div>
      </div>

      {/* 🖥️ DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700/20">
            <tr className="text-left">
              <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                {t('bookings.list.headers.status')}
              </th>
              <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                {t('bookings.list.headers.customer')}
              </th>
              <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                {t('bookings.list.headers.tour')}
              </th>
              <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                {t('bookings.list.headers.date')}
              </th>
              <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">
                {t('bookings.list.headers.netRevenue')}
              </th>
              <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider text-center">
                Payment
              </th>
              <th className="px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider text-center">
                {t('bookings.list.headers.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {bookingsToDisplay.map((booking) => {
              const priority = getBookingPriority(booking)
              const netRevenue = calculateNetRevenue(booking)
              const showDetails = shouldShowCustomerDetails(booking)
              const totalParticipants = (booking.num_adults || 0) + (booking.num_children || 0)

              return (
                <tr 
                  key={booking.id}
                  className="hover:bg-slate-700/20 transition-colors cursor-pointer"
                  onClick={() => onBookingClick(booking)}
                >
                  {/* Status Column */}
                  <td className="px-4 py-4">
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
                      
                      <span className={`text-xs font-medium ${
                        priority.color === 'red' ? 'text-red-400' :
                        priority.color === 'orange' ? 'text-orange-400' :
                        priority.color === 'yellow' ? 'text-yellow-400' :
                        priority.color === 'green' ? 'text-green-400' :
                        priority.color === 'blue' ? 'text-blue-400' : 'text-slate-400'
                      }`}>
                        {priority.level === 'critical' ? t('bookings.priority.critical') :
                         priority.level === 'high' ? t('bookings.priority.high') :
                         priority.level === 'medium' ? t('bookings.priority.medium') :
                         t(`common.${priority.level}`)}
                      </span>
                    </div>
                  </td>

                  {/* Customer Column */}
                  <td className="px-4 py-4">
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
                  </td>

                  {/* Tour Column */}
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-white font-medium truncate max-w-[200px]">
                        {booking.tours?.tour_name || t('bookings.labels.unknownTour')}
                      </div>
                      <div className="text-xs text-slate-400">
                        {totalParticipants} {totalParticipants === 1 ? t('bookings.labels.participant') : t('bookings.labels.participants')}
                      </div>
                    </div>
                  </td>

                  {/* Date Column */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-white">
                          {formatDate(booking.tours?.tour_date)}
                        </div>
                        <div className="text-xs text-slate-400">
                          {booking.tours?.time_slot || t('bookings.labels.timeTbd')}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Net Revenue Column */}
                  <td className="px-4 py-4 text-right">
                    <div className="text-white font-semibold">
                      {formatPrice(netRevenue)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {t('bookings.list.netEarnings')}
                    </div>
                  </td>

                  {/* 💰 Payment Status Column */}
                  <td className="px-4 py-4 text-center">
                    <PaymentStatusIndicator booking={booking} compact={true} />
                  </td>

                  {/* Actions Column */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
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
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 📱 MOBILE CARD LAYOUT */}
      <div className="md:hidden">
        <div className="divide-y divide-slate-700/50">
          {bookingsToDisplay.map((booking) => {
            const priority = getBookingPriority(booking)
            const netRevenue = calculateNetRevenue(booking)
            const showDetails = shouldShowCustomerDetails(booking)
            const totalParticipants = (booking.num_adults || 0) + (booking.num_children || 0)

            return (
              <div 
                key={booking.id}
                className="p-4 hover:bg-slate-700/20 transition-colors cursor-pointer"
                onClick={() => onBookingClick(booking)}
              >
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
                      {formatPrice(netRevenue)}
                    </div>
                    <div className="text-xs text-slate-400">{t('bookings.list.net')}</div>
                  </div>
                </div>

                {/* Mobile Card Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">{t('bookings.list.tour')}</span>
                    <span className="text-white text-sm truncate max-w-[180px]">
                      {booking.tours?.tour_name || t('bookings.labels.unknownTour')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">{t('bookings.list.date')}</span>
                    <span className="text-white text-sm">
                      {formatDate(booking.tours?.tour_date)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">{t('bookings.list.reference')}</span>
                    <span className="text-white text-sm">{booking.booking_reference}</span>
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
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BookingsList