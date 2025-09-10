// operator-dashboard/src/components/SchedulesTab.jsx - Enhanced with Activity Templates & Calendar View
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Calendar, Clock, RefreshCw, AlertCircle, Plus, Edit, Trash2, 
  Grid, List, ChevronLeft, ChevronRight, Activity,
  Users, DollarSign, Settings
} from 'lucide-react'
import { scheduleService } from '../services/scheduleService'
import { supabase } from '../lib/supabase'
// import { instanceService } from '../services/instanceService' // Removed: Using unified table approach
import ScheduleCreateModal from './ScheduleCreateModal'
import TourCustomizationModal from './TourCustomizationModal'

const SchedulesTab = ({ operator, formatPrice }) => {
  const { t } = useTranslation()
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  
  // View state
  const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Calendar state
  const [calendarInstances, setCalendarInstances] = useState([])
  
  // Tour customization state
  const [showTourCustomization, setShowTourCustomization] = useState(false)
  const [selectedTour, setSelectedTour] = useState(null)

  // Load schedules on component mount
  useEffect(() => {
    if (operator?.id) {
      loadSchedules()
    }
  }, [operator])

  const loadSchedules = async () => {
    try {
      setLoading(true)
      setError(null)
      // Load schedules with both tours and activity templates
      const data = await scheduleService.getSchedulesWithTemplates(operator.id)
      setSchedules(data)
      
      // Load instances for calendar view
      if (viewMode === 'calendar') {
        await loadCalendarInstances()
      }
    } catch (err) {
      console.error('Error loading schedules:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Load scheduled tours for calendar view
  const loadCalendarInstances = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      console.log('📅 Loading scheduled tours for calendar:', {
        month: startOfMonth.toISOString().split('T')[0],
        operator: operator.id
      })
      
      // Debug: Check ALL tours for this operator first
      const { data: allTours, error: allToursError } = await supabase
        .from('tours')
        .select('id, tour_name, activity_type, tour_date, time_slot, status, is_template')
        .eq('operator_id', operator.id)
        
      console.log('🔍 ALL tours for this operator:', allTours)
      console.log('🔍 Scheduled tours only:', allTours?.filter(t => t.activity_type === 'scheduled'))
      
      const { data: scheduledTours, error } = await supabase
        .from('tours')
        .select('*')
        .eq('operator_id', operator.id)
        .eq('activity_type', 'scheduled')
        .gte('tour_date', startOfMonth.toISOString().split('T')[0])
        .lte('tour_date', endOfMonth.toISOString().split('T')[0])
        .eq('status', 'active')
        .order('tour_date')
        
      if (error) {
        console.error('Error loading scheduled tours:', error)
      } else {
        console.log('📅 Found scheduled tours:', scheduledTours?.length || 0)
      }
      
      setCalendarInstances(scheduledTours || [])
    } catch (err) {
      console.error('Error loading calendar instances:', err)
    }
  }

  // Load scheduled tours when calendar view is activated or month changes
  useEffect(() => {
    if (operator?.id && viewMode === 'calendar') {
      loadCalendarInstances()
    }
  }, [operator, viewMode, currentDate])

  // Removed obsolete instance generation - scheduled tours are created automatically when schedule is created

  const formatDaysOfWeek = (daysArray) => {
    if (!daysArray || daysArray.length === 0) return 'No days set'
    
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return daysArray.map(day => dayNames[day - 1] || '?').join(', ')
  }

  const formatRecurrenceType = (type) => {
    const types = {
      'once': t('schedules.recurrence.once'),
      'daily': t('schedules.recurrence.daily'),
      'weekly': t('schedules.recurrence.weekly'),
      'monthly': t('schedules.recurrence.monthly')
    }
    return types[type] || type
  }

  const handleScheduleCreated = (newSchedule) => {
    setSchedules(prev => [newSchedule, ...prev])
    setShowCreateModal(false)
    setEditingSchedule(null)
    
    // Show success message with tour generation info
    if (newSchedule.generated_tours_count > 0) {
      alert(`✅ Schedule created successfully! Generated ${newSchedule.generated_tours_count} bookable tours from ${newSchedule.first_tour_date} to ${newSchedule.last_tour_date}. Customers can now book these activities!`)
      
      // Reload calendar if in calendar view
      if (viewMode === 'calendar') {
        loadCalendarInstances()
      }
    }
  }

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule)
    setShowCreateModal(true)
  }

  const handleScheduleUpdated = (updatedSchedule) => {
    setSchedules(prev => prev.map(s => s.id === updatedSchedule.id ? updatedSchedule : s))
    setShowCreateModal(false)
    setEditingSchedule(null)
  }
  
  const handleDeleteSchedule = async (schedule) => {
    const activityName = schedule.activity_templates?.activity_name || schedule.tours?.tour_name
    if (!window.confirm(t('schedules.actions.confirmDelete') + ` for "${activityName}"?`)) {
      return
    }
    
    try {
      await scheduleService.deleteSchedule(schedule.id, operator.id)
      // Refresh the schedules list
      await loadSchedules()
    } catch (error) {
      console.error('Error deleting schedule:', error)
      alert(`❌ Failed to delete schedule: ${error.message}`)
    }
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setEditingSchedule(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center gap-3 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading schedules...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Error Loading Schedules</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={loadSchedules}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Calendar navigation helpers
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay() // 0 = Sunday
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getScheduledToursForDate = (date) => {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return calendarInstances.filter(tour => tour.tour_date === dateStr)
  }

  // Handle tour customization
  const handleCustomizeTour = (tour) => {
    setSelectedTour(tour)
    setShowTourCustomization(true)
  }

  const handleTourCustomizationSuccess = (updatedTour) => {
    // Refresh calendar instances to show updated data
    if (viewMode === 'calendar') {
      loadCalendarInstances()
    }
    
    // Show success message
    if (updatedTour) {
      alert('✅ Tour customization saved successfully!')
    } else {
      alert('✅ Tour customizations reset successfully!')
    }
    
    setShowTourCustomization(false)
    setSelectedTour(null)
  }

  const handleCloseTourCustomization = () => {
    setShowTourCustomization(false)
    setSelectedTour(null)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{t('schedules.management.title')}</h1>
          <p className="text-slate-400">Create schedules for your activity templates to generate bookable tours</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
              Calendar
            </button>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('schedules.management.createSchedule')}
          </button>
          <button
            onClick={loadSchedules}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {t('schedules.management.refresh')}
          </button>
        </div>
      </div>

      {/* Content Area */}
      {schedules.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">{t('schedules.management.noSchedulesYet')}</h3>
          <p className="text-slate-400 mb-6">
            {t('schedules.management.noSchedulesMessage')}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus className="w-5 h-5" />
            {t('schedules.management.createSchedule')}
          </button>
        </div>
      ) : viewMode === 'calendar' ? (
        /* Calendar View */
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-white">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="text-sm text-slate-400">
              {calendarInstances.length} scheduled tours this month
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-px mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-slate-400">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-px bg-slate-700 rounded-lg overflow-hidden">
              {getDaysInMonth(currentDate).map((date, index) => {
                const scheduledTours = date ? getScheduledToursForDate(date) : []
                const isToday = date && date.toDateString() === new Date().toDateString()
                
                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 bg-slate-800 ${
                      !date ? 'opacity-30' : ''
                    } ${
                      isToday ? 'bg-blue-900/30 border-2 border-blue-500' : ''
                    }`}
                  >
                    {date && (
                      <>
                        <div className={`text-sm mb-1 ${
                          isToday ? 'text-blue-400 font-semibold' : 'text-slate-300'
                        }`}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {scheduledTours.slice(0, 3).map(tour => (
                            <div
                              key={tour.id}
                              onClick={() => handleCustomizeTour(tour)}
                              className={`text-xs p-1 rounded truncate cursor-pointer transition-colors ${
                                tour.is_customized 
                                  ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              }`}
                              title={`${tour.tour_name} at ${tour.time_slot}${tour.is_customized ? ' (Customized)' : ''} - Click to customize`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="truncate">
                                  {tour.time_slot} {tour.tour_name}
                                </span>
                                {tour.is_customized && (
                                  <Settings className="w-2 h-2 ml-1 flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          ))}
                          {scheduledTours.length > 3 && (
                            <div className="text-xs text-slate-400">
                              +{scheduledTours.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        /* List View - Enhanced */
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">{t('schedules.table.tour')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">{t('schedules.table.recurrence')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">{t('schedules.table.days')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">{t('schedules.table.time')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">{t('schedules.table.period')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">{t('schedules.table.created')}</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          schedule.activity_templates 
                            ? 'bg-purple-500/20 text-purple-400' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {schedule.activity_templates ? <Activity className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {schedule.activity_templates?.activity_name || schedule.tours?.tour_name || 'Unknown Activity'}
                          </div>
                          <div className="text-sm text-slate-400 flex items-center gap-2">
                            {schedule.activity_templates ? (
                              <>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400">
                                  Template
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {schedule.activity_templates.max_capacity} max
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  {formatPrice(schedule.activity_templates.price_adult)}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                                  Legacy Tour
                                </span>
                                <span>{schedule.tours?.tour_type} • {schedule.tours?.max_capacity} max</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                        {formatRecurrenceType(schedule.recurrence_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {formatDaysOfWeek(schedule.days_of_week)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-4 h-4" />
                        {schedule.start_time}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <div className="text-sm">
                        <div>{schedule.start_date}</div>
                        <div className="text-slate-500">to {schedule.end_date}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {new Date(schedule.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* Dynamic status indicator based on schedule type and activity */}
                        {schedule.activity_templates && (
                          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600/20 text-blue-400 rounded-lg">
                            <Activity className="w-3 h-3" />
                            Template Schedule
                          </span>
                        )}
                        {schedule.tours && !schedule.activity_templates && (
                          <span className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600/20 text-green-400 rounded-lg">
                            <Calendar className="w-3 h-3" />
                            Tour Schedule
                          </span>
                        )}
                        
                        <button
                          onClick={() => handleEditSchedule(schedule)}
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title={t('common.edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-6 text-center text-slate-500 text-sm">
        {t('schedules.management.showing', { count: schedules.length })}
      </div>

      {/* Schedule Create/Edit Modal */}
      <ScheduleCreateModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSuccess={editingSchedule ? handleScheduleUpdated : handleScheduleCreated}
        operator={operator}
        existingSchedule={editingSchedule}
      />

      {/* Tour Customization Modal */}
      <TourCustomizationModal
        isOpen={showTourCustomization}
        onClose={handleCloseTourCustomization}
        onSuccess={handleTourCustomizationSuccess}
        tour={selectedTour}
        formatPrice={formatPrice}
      />
    </div>
  )
}

export default SchedulesTab