// src/components/templates/CalendarView.jsx
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { X, ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react'
import { getTodayInFP, isTodayInFP, getCurrentDateInFP, formatDateFP } from '../../lib/timezone'
import { useCurrencyContext } from '../../hooks/useCurrency'
import { formatPrice } from '../../utils/currency'

const CalendarView = ({ template, instances, availability, isOpen, onClose, onInstanceSelect }) => {
  const { t } = useTranslation()
  const { selectedCurrency } = useCurrencyContext()
  const [currentDate, setCurrentDate] = useState(getCurrentDateInFP())
  const [selectedInstance, setSelectedInstance] = useState(null)

  // Group instances by date for calendar display
  const instancesByDate = useMemo(() => {
    const grouped = {}
    instances.forEach(instance => {
      const dateKey = instance.tour_date
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(instance)
    })
    return grouped
  }, [instances])

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // Start from Sunday

    const days = []
    const current = new Date(startDate)

    // Generate 6 weeks (42 days) to fill calendar grid
    for (let i = 0; i < 42; i++) {
      const dateString = current.toISOString().split('T')[0]
      const isCurrentMonth = current.getMonth() === month
      const isToday = isTodayInFP(dateString)
      const fpToday = getCurrentDateInFP()
      const fpTodayDate = new Date(fpToday.getFullYear(), fpToday.getMonth(), fpToday.getDate())
      const isPast = current < fpTodayDate
      const instances = instancesByDate[dateString] || []
      const hasInstances = instances.length > 0

      days.push({
        date: new Date(current),
        dateString,
        day: current.getDate(),
        isCurrentMonth,
        isToday,
        isPast,
        hasInstances,
        instances,
        minPrice: hasInstances ? Math.min(...instances.map(i => i.effective_discount_price_adult)) : null
      })

      current.setDate(current.getDate() + 1)
    }

    return days
  }, [currentDate, instancesByDate])

  const monthNames = [
    t('calendar.months.january'),
    t('calendar.months.february'),
    t('calendar.months.march'),
    t('calendar.months.april'),
    t('calendar.months.may'),
    t('calendar.months.june'),
    t('calendar.months.july'),
    t('calendar.months.august'),
    t('calendar.months.september'),
    t('calendar.months.october'),
    t('calendar.months.november'),
    t('calendar.months.december')
  ]

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    setCurrentDate(newDate)
  }

  const goToNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    setCurrentDate(newDate)
  }

  const handleDateClick = (day) => {
    if (day.isPast || !day.hasInstances) return
    setSelectedInstance(day.instances[0]) // Select first instance, or show time picker
  }

  const handleInstanceSelect = (instance) => {
    onInstanceSelect(instance)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-ui-surface-secondary rounded-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-ui-border-primary">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-ui-text-primary">
              {t('calendar.selectDate', 'Select Date')}
            </h2>
            <p className="text-ui-text-secondary text-sm truncate">
              {template.tour_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-ui-surface-primary rounded-lg transition-colors ml-2"
          >
            <X className="w-5 h-5 text-ui-text-primary" />
          </button>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 h-full">
          {/* Calendar */}
          <div className="lg:col-span-2 p-4 sm:p-6 flex-1 min-h-0 overflow-auto">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-ui-surface-primary rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-ui-text-primary" />
              </button>
              <h3 className="text-lg font-semibold text-ui-text-primary">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-ui-surface-primary rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-ui-text-primary" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {[t('calendar.days.sun'), t('calendar.days.mon'), t('calendar.days.tue'), t('calendar.days.wed'), t('calendar.days.thu'), t('calendar.days.fri'), t('calendar.days.sat')].map(day => (
                <div key={day} className="p-2 text-center text-xs font-medium text-ui-text-muted">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDateClick(day)}
                  disabled={day.isPast || !day.hasInstances}
                  className={`
                    p-1 sm:p-2 text-sm rounded-lg transition-all duration-200 min-h-[2.5rem] sm:min-h-[3rem] flex flex-col items-center justify-center touch-manipulation
                    ${!day.isCurrentMonth
                      ? 'text-ui-text-disabled cursor-default'
                      : day.isPast || !day.hasInstances
                        ? 'text-ui-text-muted cursor-not-allowed'
                        : 'text-ui-text-primary hover:bg-ui-surface-primary cursor-pointer active:scale-95'
                    }
                    ${day.isToday ? 'ring-2 ring-interactive-primary' : ''}
                    ${day.hasInstances && !day.isPast ? 'bg-interactive-primary/10 hover:bg-interactive-primary/20' : ''}
                    ${selectedInstance?.tour_date === day.dateString ? 'bg-interactive-primary text-white' : ''}
                  `}
                >
                  <span className="font-medium">{day.day}</span>
                  {day.hasInstances && !day.isPast && (
                    <span className="text-xs text-interactive-primary font-medium leading-tight">
                      {formatPrice(day.minPrice, selectedCurrency, true)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Instance Details Sidebar */}
          <div className="lg:col-span-1 lg:border-l border-t lg:border-t-0 border-ui-border-primary p-4 sm:p-6 bg-ui-surface-primary/30 lg:min-h-0 lg:overflow-auto">
            {selectedInstance ? (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-ui-text-primary mb-2">
                    {new Date(selectedInstance.tour_date + 'T00:00:00-10:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h4>
                  <p className="text-ui-text-secondary text-sm">
                    {t('calendar.selectTime', 'Choose your preferred time')}
                  </p>
                </div>

                {/* Time Slots */}
                <div className="space-y-3">
                  {instancesByDate[selectedInstance.tour_date]?.map((instance, index) => (
                    <button
                      key={instance.id}
                      onClick={() => handleInstanceSelect(instance)}
                      className="w-full p-3 sm:p-4 bg-ui-surface-secondary hover:bg-ui-surface-tertiary border border-ui-border-primary rounded-lg transition-colors text-left touch-manipulation active:scale-[0.98]"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-ui-text-muted" />
                            <span className="font-medium text-ui-text-primary">
                              {instance.time_slot}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-ui-text-muted" />
                            <span className="text-sm text-ui-text-secondary">
                              {instance.available_spots} {t('calendar.spotsLeft', 'spots left')}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-ui-text-primary text-sm">
                            {formatPrice(instance.effective_discount_price_adult, selectedCurrency, true)}
                          </div>
                          <div className="text-xs text-ui-text-secondary">
                            {t('calendar.perAdult', 'per adult')}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-ui-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-ui-text-muted" />
                </div>
                <h4 className="font-medium text-ui-text-primary mb-2">
                  {t('calendar.selectDateFirst', 'Select a Date')}
                </h4>
                <p className="text-sm text-ui-text-secondary">
                  {t('calendar.selectDateDescription', 'Choose an available date to see time options')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-ui-border-primary p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
            <div className="text-sm text-ui-text-secondary text-center sm:text-left">
              {t('calendar.availableDates', 'Available dates')} • {availability.instance_count} {t('calendar.dates', 'dates')}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-ui-text-secondary hover:text-ui-text-primary transition-colors w-full sm:w-auto"
            >
              {t('common.cancel', 'Cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarView