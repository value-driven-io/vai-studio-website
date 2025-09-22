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
      color: 'text-status-warning-light',
      bgColor: 'bg-status-warning-bg',
      section: 'active'
    },
    {
      label: t('overviewSection.stats.upcomingTours'),
      value: userBookings.upcoming.length,
      icon: Calendar,
      color: 'text-interactive-primary',
      bgColor: 'bg-interactive-primary/10',
      section: 'upcoming'
    },
    {
      label: t('overviewSection.stats.completed'),
      value: userBookings.past.length,
      icon: Award,
      color: 'text-status-success-light',
      bgColor: 'bg-status-success-bg',
      section: 'past'
    },
    {
      label: t('overviewSection.stats.savedTours'),
      value: favorites.length,
      icon: Heart,
      color: 'text-mood-culture',
      bgColor: 'bg-mood-culture/10',
      section: 'favorites'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-interactive-primary/20 to-mood-culture/20 border border-interactive-primary/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-ui-text-primary mb-2">
          {t('overviewSection.welcome.title')}
        </h2>
        <p className="text-ui-text-secondary">
          {totalBookings > 0 
            ? t('overviewSection.welcome.withBookings', { count: totalBookings, plural: totalBookings !== 1 ? 's' : '' })
            : t('overviewSection.welcome.noBookings')
          }
        </p>
      </div>

      {/* Next Upcoming Tour */}
      {nextTour && (
        <div className="bg-ui-surface-primary border border-ui-border-primary rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-interactive-primary" />
            <h3 className="text-lg font-semibold text-ui-text-primary">{t('overviewSection.nextAdventure.title')}</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-ui-text-primary">
                  {nextTour.active_tours_with_operators?.tour_name || 'Tour'}
                </h4>
                {nextTour.active_tours_with_operators?.template_name && nextTour.active_tours_with_operators?.tour_name !== nextTour.active_tours_with_operators?.template_name && (
                  <div className="text-xs text-ui-text-tertiary">
                    Part of: {nextTour.active_tours_with_operators.template_name}
                  </div>
                )}
                {nextTour.schedule_id && (
                  <div className="text-xs text-ui-text-tertiary flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Recurring Schedule
                  </div>
                )}
                <p className="text-ui-text-tertiary text-sm">
                  {t('overviewSection.nextAdventure.with', { operator: nextTour.active_tours_with_operators?.company_name || 'Operator' })}
                </p>
              </div>
              <div className="text-right">
                <div className="text-ui-text-primary font-medium">
                  {formatDate(nextTour.active_tours_with_operators?.tour_date)}
                </div>
                <div className="text-ui-text-tertiary text-sm">
                  {formatTime(nextTour.active_tours_with_operators?.time_slot)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-ui-text-tertiary">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {nextTour.active_tours_with_operators?.effective_meeting_point || t('overviewSection.nextAdventure.tbd')}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {nextTour.num_adults + (nextTour.num_children || 0)} {t('overviewSection.nextAdventure.participants')}
              </div>
            </div>
            
            <div className="pt-3 border-t border-ui-border-primary">
              <div className="flex items-center justify-between">
                <span className="text-ui-text-tertiary">{t('overviewSection.nextAdventure.totalPaid')}</span>
                <span className="text-ui-text-primary font-medium">
                  {formatPrice(nextTour.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {userBookings.active.length > 0 && (
        <div className="bg-ui-surface-primary border border-ui-border-primary rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-status-warning" />
            <h3 className="text-lg font-semibold text-ui-text-primary">{t('overviewSection.awaitingConfirmation.title')}</h3>
          </div>
          
          <div className="space-y-3">
            {userBookings.active.slice(0, 2).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-ui-surface-secondary/50 rounded-lg">
                <div>
                  <div className="font-medium text-ui-text-primary">
                    {booking.active_tours_with_operators?.tour_name || 'Tour'}
                  </div>
                  {booking.active_tours_with_operators?.template_name && booking.active_tours_with_operators?.tour_name !== booking.active_tours_with_operators?.template_name && (
                    <div className="text-xs text-ui-text-tertiary">
                      Part of: {booking.active_tours_with_operators.template_name}
                    </div>
                  )}
                  <div className="text-sm text-ui-text-tertiary">
                    {booking.booking_reference}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-status-warning text-sm font-medium">{t('overviewSection.awaitingConfirmation.pending')}</div>
                  <div className="text-xs text-ui-text-tertiary">
                    {t('overviewSection.awaitingConfirmation.responseTime')}
                  </div>
                </div>
              </div>
            ))}
            
            {userBookings.active.length > 2 && (
              <button
                onClick={() => setActiveSection('active')}
                className="w-full text-center text-interactive-primary text-sm hover:text-interactive-secondary transition-colors"
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
          <div className="w-16 h-16 bg-ui-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-ui-text-tertiary" />
          </div>
          <h3 className="text-lg font-semibold text-ui-text-tertiary mb-2">{t('overviewSection.emptyState.title')}</h3>
          <p className="text-ui-text-disabled mb-6 max-w-md mx-auto">
            {t('overviewSection.emptyState.message')}
          </p>
          <button
            onClick={() => setActiveTab('discover')}
            className="bg-interactive-primary hover:bg-interactive-secondary text-ui-text-primary px-6 py-3 rounded-lg transition-colors"
          >
            {t('overviewSection.emptyState.exploreTours')}
          </button>
        </div>
      )}
    </div>
  )
}

export default OverviewSection