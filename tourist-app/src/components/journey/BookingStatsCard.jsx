// BookingStatsCard.jsx - Simplified stats overview for dashboard
import { CheckCircle, Clock, Award, AlertCircle } from 'lucide-react'

const BookingStatsCard = ({ 
  userStats, 
  safeUserBookings, 
  onViewChange, 
  formatPrice, 
  t 
}) => {
  const statsCards = [
    {
      id: 'active',
      label: t('bookingStats.active', { default: 'Active Bookings' }),
      value: userStats.upcomingTours + safeUserBookings.active.length,
      icon: Clock,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      actionText: t('bookingStats.viewActive', { default: 'View Active' }),
      urgent: safeUserBookings.active.length > 0
    },
    {
      id: 'completed',
      label: t('bookingStats.completed', { default: 'Completed Tours' }),
      value: userStats.completedTours,
      icon: Award,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      actionText: t('bookingStats.viewMemories', { default: 'View Memories' })
    },
    {
      id: 'total',
      label: t('bookingStats.totalSpent', { default: 'Total Spent' }),
      value: formatPrice(
        [...safeUserBookings.active, ...safeUserBookings.upcoming, ...safeUserBookings.past]
          .reduce((sum, booking) => sum + (booking.total_amount || 0), 0)
      ),
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      isPrice: true
    }
  ]

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">
          {t('bookingStats.title', { default: 'Your Booking Overview' })}
        </h2>
        
        {/* Pending Actions Badge */}
        {userStats.pendingActions > 0 && (
          <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-1.5 rounded-full border border-orange-500/30">
            <AlertCircle className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-300">
              {userStats.pendingActions} {t('bookingStats.actionsNeeded', { default: 'actions needed' })}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.id}
              className={`relative rounded-xl p-4 border transition-all ${stat.bgColor} ${stat.borderColor} ${
                stat.id !== 'total' ? 'cursor-pointer group' : ''
              }`}
              onClick={stat.id !== 'total' ? () => onViewChange(stat.id) : undefined}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor} border ${stat.borderColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <div className={`text-2xl font-bold text-white ${stat.isPrice ? 'text-lg' : ''}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              </div>
              
              {/* Urgent Indicator */}
              {stat.urgent && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
              )}
              
              {/* Hover Action */}
              {stat.id !== 'total' && (
                <div className="mt-2 text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                  {stat.actionText}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Quick Summary */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <div className="text-sm text-slate-400 text-center">
          {userStats.totalBookings > 0 
            ? t('bookingStats.summary', { 
                total: userStats.totalBookings,
                completed: userStats.completedTours,
                default: '{{total}} total bookings • {{completed}} completed'
              })
            : t('bookingStats.noBookings', { default: 'No bookings yet - start exploring!' })
          }
        </div>
      </div>
    </div>
  )
}

export default BookingStatsCard