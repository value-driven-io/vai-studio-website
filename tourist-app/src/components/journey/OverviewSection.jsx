// src/components/journey/OverviewSection.jsx
import React from 'react'
import { 
  Calendar, Clock, MapPin, Users, Star, Award, TrendingUp,
  AlertCircle, CheckCircle, Timer, Heart
} from 'lucide-react'

const OverviewSection = ({ 
  userBookings, 
  favorites, 
  getTotalBookings, 
  getNextUpcomingTour, 
  formatDate, 
  formatTime,
  formatPrice,
  setActiveSection,
  setActiveTab 
}) => {
  const nextTour = getNextUpcomingTour()
  const totalBookings = getTotalBookings()

  const stats = [
    {
      label: 'Active Bookings',
      value: userBookings.active.length,
      icon: Timer,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      section: 'active'
    },
    {
      label: 'Upcoming Tours',
      value: userBookings.upcoming.length,
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      section: 'upcoming'
    },
    {
      label: 'Completed',
      value: userBookings.past.length,
      icon: Award,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      section: 'past'
    },
    {
      label: 'Saved Tours',
      value: favorites.length,
      icon: Heart,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20',
      section: 'favorites'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">
          🌴 Your French Polynesia Journey
        </h2>
        <p className="text-slate-300">
          {totalBookings > 0 
            ? `Track your ${totalBookings} booking${totalBookings !== 1 ? 's' : ''} and discover more amazing adventures`
            : 'Ready to start your adventure? Discover amazing tours below!'
          }
        </p>
      </div>

      {/* Quick Stats Deactivated */}
      {/*<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <button
              key={stat.label}
              onClick={() => setActiveSection(stat.section)}
              className={`p-4 rounded-xl border transition-all hover:scale-105 ${
                stat.bgColor
              } border-slate-600 hover:border-slate-500`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <div className="text-left">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-slate-400">{stat.label}</div>
                </div>
              </div>
            </button>
          )
        })}
      </div> */}

      {/* Next Upcoming Tour */}
      {nextTour && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Next Adventure</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">
                  {nextTour.tours?.tour_name || 'Tour'}
                </h4>
                <p className="text-slate-400 text-sm">
                  with {nextTour.operators?.company_name || 'Operator'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">
                  {formatDate(nextTour.tours?.tour_date)}
                </div>
                <div className="text-slate-400 text-sm">
                  {formatTime(nextTour.tours?.time_slot)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {nextTour.tours?.meeting_point || 'TBD'}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {nextTour.num_adults + (nextTour.num_children || 0)} participants
              </div>
            </div>
            
            <div className="pt-3 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Paid:</span>
                <span className="text-white font-medium">
                  {formatPrice(nextTour.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {userBookings.active.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Awaiting Confirmation</h3>
          </div>
          
          <div className="space-y-3">
            {userBookings.active.slice(0, 2).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div>
                  <div className="font-medium text-white">
                    {booking.tours?.tour_name || 'Tour'}
                  </div>
                  <div className="text-sm text-slate-400">
                    {booking.booking_reference}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-orange-400 text-sm font-medium">Pending</div>
                  <div className="text-xs text-slate-400">
                    Response within 60 min
                  </div>
                </div>
              </div>
            ))}
            
            {userBookings.active.length > 2 && (
              <button
                onClick={() => setActiveSection('active')}
                className="w-full text-center text-blue-400 text-sm hover:text-blue-300 transition-colors"
              >
                View all {userBookings.active.length} pending bookings →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setActiveTab('discover')}
          className="p-4 bg-blue-600 hover:bg-blue-700 rounded-xl transition-all"
        >
          <div className="text-white font-medium">Discover Tours</div>
          <div className="text-blue-200 text-sm">Find new adventures</div>
        </button>
        
        <button
          onClick={() => setActiveSection('favorites')}
          className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
        >
          <div className="text-white font-medium">My Favorites</div>
          <div className="text-slate-400 text-sm">{favorites.length} saved</div>
        </button>
      </div>

      {/* Empty State */}
      {totalBookings === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-400 mb-2">Start Your Journey</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            You haven't made any bookings yet. Discover amazing tours and start your French Polynesia adventure!
          </p>
          <button
            onClick={() => setActiveTab('discover')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Explore Tours
          </button>
        </div>
      )}
    </div>
  )
}

export default OverviewSection