// src/components/journey/OverviewSection.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const nextTour = getNextUpcomingTour()
  const totalBookings = getTotalBookings()

  const stats = [
    {
      label: t('overviewSection.stats.activeBookings'),
      value: userBookings.active.length,
      icon: Timer,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      section: 'active'
    },
    {
      label: t('overviewSection.stats.upcomingTours'),
      value: userBookings.upcoming.length,
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      section: 'upcoming'
    },
    {
      label: t('overviewSection.stats.completed'),
      value: userBookings.past.length,
      icon: Award,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      section: 'past'
    },
    {
      label: t('overviewSection.stats.savedTours'),
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
          {t('overviewSection.welcome.title')}
        </h2>
        <p className="text-slate-300">
          {totalBookings > 0 
            ? t('overviewSection.welcome.withBookings', { count: totalBookings, plural: totalBookings !== 1 ? 's' : '' })
            : t('overviewSection.welcome.noBookings')
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
            <h3 className="text-lg font-semibold text-white">{t('overviewSection.nextAdventure.title')}</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">
                  {nextTour.tours?.tour_name || 'Tour'}
                </h4>
                <p className="text-slate-400 text-sm">
                  {t('overviewSection.nextAdventure.with', { operator: nextTour.operators?.company_name || 'Operator' })}
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
                {nextTour.tours?.meeting_point || t('overviewSection.nextAdventure.tbd')}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {nextTour.num_adults + (nextTour.num_children || 0)} {t('overviewSection.nextAdventure.participants')}
              </div>
            </div>
            
            <div className="pt-3 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{t('overviewSection.nextAdventure.totalPaid')}</span>
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
            <h3 className="text-lg font-semibold text-white">{t('overviewSection.awaitingConfirmation.title')}</h3>
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
                  <div className="text-orange-400 text-sm font-medium">{t('overviewSection.awaitingConfirmation.pending')}</div>
                  <div className="text-xs text-slate-400">
                    {t('overviewSection.awaitingConfirmation.responseTime')}
                  </div>
                </div>
              </div>
            ))}
            
            {userBookings.active.length > 2 && (
              <button
                onClick={() => setActiveSection('active')}
                className="w-full text-center text-blue-400 text-sm hover:text-blue-300 transition-colors"
              >
                {t('overviewSection.awaitingConfirmation.viewAll', { count: userBookings.active.length })}
              </button>
            )}
          </div>
        </div>
      )}


      {/* Empty State */}
      {totalBookings === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-400 mb-2">{t('overviewSection.emptyState.title')}</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            {t('overviewSection.emptyState.message')}
          </p>
          <button
            onClick={() => setActiveTab('discover')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            {t('overviewSection.emptyState.exploreTours')}
          </button>
        </div>
      )}
    </div>
  )
}

export default OverviewSection