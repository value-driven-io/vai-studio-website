// operator-dashboard/src/components/SchedulesTab.jsx - Enhanced with Activity Templates & Calendar View
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Calendar, Clock, RefreshCw, AlertCircle, Plus, 
  Grid, List, ChevronLeft, ChevronRight, Activity,
  Users, DollarSign, Settings, CheckSquare, Square,
  Pause, Play, Trash2, BarChart3, Target, CheckCircle
} from 'lucide-react'
import { scheduleService } from '../services/scheduleService'
import { supabase } from '../lib/supabase'
// import { instanceService } from '../services/instanceService' // Removed: Using unified table approach
import ScheduleCreateModal from './ScheduleCreateModal'
import TourCustomizationModal from './TourCustomizationModal'
import ScheduleUpdateWarningModal from './ScheduleUpdateWarningModal'

// Template-Based Schedule Card Component (CLEAN BREAK)
const ScheduleCard = ({ schedule, formatPrice, onEdit, onDelete, onViewCalendar, t, bulkMode, isSelected, onToggleSelect }) => {
  // TEMPLATE-FIRST: All schedules are template-based
  const template = schedule.activity_templates
  const activityName = template?.activity_name || 'Unknown Activity'
  const activityType = template?.activity_type || 'Unknown Type'
  
  // Template schedule status
  const getStatusInfo = () => {
    if (template?.status === 'active') {
      return { color: 'green', text: 'Active', dot: 'bg-green-500' }
    }
    return { color: 'red', text: 'Inactive', dot: 'bg-red-500' }
  }
  
  const status = getStatusInfo()
  
  // Format recurrence pattern
  const formatRecurrencePattern = () => {
    if (schedule.recurrence_type === 'once') {
      return `One-time on ${formatDate(schedule.start_date)}`
    }
    if (schedule.recurrence_type === 'daily') {
      return `Daily ${schedule.start_time}`
    }
    if (schedule.recurrence_type === 'weekly') {
      const days = schedule.days_of_week?.join(', ') || 'No days'
      return `${days} ${schedule.start_time}`
    }
    return `${schedule.recurrence_type} ${schedule.start_time}`
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const formatDateRange = () => {
    const start = formatDate(schedule.start_date)
    const end = formatDate(schedule.end_date)
    if (start === end) return start
    return `${start} - ${end}`
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="p-6">
        {/* Header Line - Activity Name + Template */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {bulkMode && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(schedule.id)}
                className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
              />
            )}
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">{activityName}</h3>
              <p className="text-sm text-slate-400">Template: {activityType}</p>
            </div>
          </div>
          <div className={`w-3 h-3 ${status.dot} rounded-full`} title={status.text}></div>
        </div>

        {/* Schedule Pattern Line */}
        <div className="flex items-center gap-2 mb-2 text-slate-300">
          <Clock className="w-4 h-4" />
          <span className="font-mono">{formatRecurrencePattern()} | {formatDateRange()}</span>
        </div>

        {/* Capacity & Pricing Line */}
        <div className="flex items-center gap-4 mb-2 text-slate-300">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{template?.max_capacity || 0} spots each</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span>{formatPrice(template?.discount_price_adult || 0)}</span>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            status.color === 'green' 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-blue-500/20 text-blue-400'
          }`}>
            <CheckCircle className="w-3 h-3" />
            {status.text}
          </div>
        </div>

        {/* Statistics Line - Real Analytics */}
        <div className="flex items-center gap-4 mb-4 text-slate-400 text-sm">
          <span className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            {schedule.total_instances || 0} instances
          </span>
          <span className="flex items-center gap-1">
            <Settings className="w-3 h-3" />
            {schedule.customized_instances || 0} customized
          </span>
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            {schedule.total_bookings || 0} bookings
          </span>
          {schedule.revenue && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {formatPrice(schedule.revenue)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
          <button
            onClick={() => onEdit(schedule)}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors text-sm font-medium"
          >
            Edit Schedule
          </button>
          <button
            onClick={() => {/* TODO: Implement pause/resume */}}
            className="px-3 py-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 hover:text-yellow-300 rounded-lg transition-colors text-sm font-medium"
          >
            Pause
          </button>
          <button
            onClick={onViewCalendar}
            className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 rounded-lg transition-colors text-sm font-medium"
          >
            View Calendar
          </button>
          <button
            onClick={() => onDelete(schedule)}
            className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg transition-colors text-sm font-medium ml-auto"
          >
            Archive
          </button>
        </div>
      </div>
    </div>
  )
}

const SchedulesTab = ({ operator, formatPrice }) => {
  const { t } = useTranslation()
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [pendingEditSchedule, setPendingEditSchedule] = useState(null)
  
  // View state
  const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarFilter, setCalendarFilter] = useState('all') // 'all' or specific schedule ID
  
  // Calendar state
  const [calendarInstances, setCalendarInstances] = useState([])
  
  // Tour customization state
  const [showTourCustomization, setShowTourCustomization] = useState(false)
  const [selectedTour, setSelectedTour] = useState(null)
  
  // Bulk operations state
  const [selectedSchedules, setSelectedSchedules] = useState(new Set())
  const [bulkMode, setBulkMode] = useState(false)

  // Load schedules on component mount
  useEffect(() => {
    if (operator?.id) {
      loadSchedules()
    }
  }, [operator]) // loadSchedules is stable

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
      const { data: allTours } = await supabase
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
  }, [operator, viewMode, currentDate]) // loadCalendarInstances is stable

  // Removed obsolete instance generation - scheduled tours are created automatically when schedule is created

  // eslint-disable-next-line no-unused-vars
  const formatDaysOfWeek = (daysArray) => {
    if (!daysArray || daysArray.length === 0) return 'No days set'
    
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return daysArray.map(day => dayNames[day - 1] || '?').join(', ')
  }

  // eslint-disable-next-line no-unused-vars
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

  const handleEditSchedule = async (schedule) => {
    try {
      // Fetch existing tours for this schedule to show accurate warning
      const { data: existingTours, error } = await supabase
        .from('tours')
        .select('id, tour_date, time_slot, is_customized, customization_timestamp')
        .eq('parent_schedule_id', schedule.id)
        .eq('activity_type', 'scheduled')
        .order('tour_date', { ascending: true })

      if (error) {
        console.error('Error fetching existing tours:', error)
        // Still show modal but with basic info
        setPendingEditSchedule(schedule)
        setShowWarningModal(true)
        return
      }

      // Create analysis for the warning modal
      const customizedTours = existingTours.filter(t => t.is_customized)
      const standardTours = existingTours.filter(t => !t.is_customized)
      
      const updateAnalysis = {
        customizedCount: customizedTours.length,
        standardCount: standardTours.length,
        existingTours: existingTours,
        newDates: [],
        removedDates: [],
        timeChange: null
      }

      setPendingEditSchedule({ ...schedule, updateAnalysis })
      setShowWarningModal(true)
    } catch (err) {
      console.error('Error preparing schedule edit:', err)
      // Fallback to basic modal
      setPendingEditSchedule(schedule)
      setShowWarningModal(true)
    }
  }

  const handleConfirmEdit = () => {
    setEditingSchedule(pendingEditSchedule)
    setShowCreateModal(true)
    setShowWarningModal(false)
    setPendingEditSchedule(null)
  }

  const handleCancelEdit = () => {
    setShowWarningModal(false)
    setPendingEditSchedule(null)
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
    let filteredTours = calendarInstances.filter(tour => tour.tour_date === dateStr)
    
    // Apply calendar filter by schedule
    if (calendarFilter !== 'all') {
      filteredTours = filteredTours.filter(tour => tour.parent_schedule_id === calendarFilter)
    }
    
    return filteredTours
  }
  
  // Helper function for calendar filter count
  const getFilteredToursCount = () => {
    if (calendarFilter === 'all') {
      return calendarInstances.length
    }
    return calendarInstances.filter(tour => tour.parent_schedule_id === calendarFilter).length
  }

  // Bulk operations handlers
  const toggleScheduleSelection = (scheduleId) => {
    const newSelected = new Set(selectedSchedules)
    if (newSelected.has(scheduleId)) {
      newSelected.delete(scheduleId)
    } else {
      newSelected.add(scheduleId)
    }
    setSelectedSchedules(newSelected)
  }

  const selectAllSchedules = () => {
    setSelectedSchedules(new Set(schedules.map(s => s.id)))
  }

  const clearSelection = () => {
    setSelectedSchedules(new Set())
    setBulkMode(false)
  }

  const handleBulkAction = async (action) => {
    if (selectedSchedules.size === 0) return
    
    try {
      const scheduleIds = Array.from(selectedSchedules)
      let successCount = 0
      
      for (const scheduleId of scheduleIds) {
        // For now, we'll implement pause/resume via template status update
        // This could be expanded to proper schedule status management
        const schedule = schedules.find(s => s.id === scheduleId)
        if (schedule) {
          const newStatus = action === 'pause' ? 'inactive' : 'active'
          
          // Update template status (affects all future tours from this schedule)
          const { error } = await supabase
            .from('tours')
            .update({ status: newStatus })
            .eq('id', schedule.template_id)
            .eq('is_template', true)
          
          if (!error) {
            successCount++
          }
        }
      }
      
      if (successCount > 0) {
        alert(`✅ ${action === 'pause' ? 'Paused' : 'Resumed'} ${successCount} schedule(s) successfully!`)
        loadSchedules() // Refresh the list
        clearSelection()
      }
    } catch (error) {
      console.error('Bulk operation error:', error)
      alert('❌ Error performing bulk operation: ' + error.message)
    }
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

          {/* Bulk Operations Toggle (only in list view) */}
          {viewMode === 'list' && (
            <button
              onClick={() => setBulkMode(!bulkMode)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                bulkMode 
                  ? 'bg-orange-600 text-white hover:bg-orange-700' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {bulkMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              {bulkMode ? 'Exit Bulk' : 'Bulk Select'}
            </button>
          )}
          
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

      {/* Bulk Actions Bar */}
      {bulkMode && selectedSchedules.size > 0 && (
        <div className="mb-6 p-4 bg-slate-800/50 border border-slate-600 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-slate-300">
                {selectedSchedules.size} schedule{selectedSchedules.size > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={selectAllSchedules}
                className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                Select All ({schedules.length})
              </button>
              <button
                onClick={clearSelection}
                className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
              >
                Clear Selection
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('pause')}
                className="flex items-center gap-2 px-3 py-1 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-sm"
              >
                <Pause className="w-4 h-4" />
                Pause Selected
              </button>
              <button
                onClick={() => handleBulkAction('resume')}
                className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                <Play className="w-4 h-4" />
                Resume Selected
              </button>
            </div>
          </div>
        </div>
      )}

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
            
            {/* Calendar Filter */}
            <div className="flex items-center gap-4">
              <select
                value={calendarFilter}
                onChange={(e) => setCalendarFilter(e.target.value)}
                className="px-3 py-1 bg-slate-700 border border-slate-600 rounded-md text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Schedules</option>
                {schedules.map(schedule => {
                  const template = schedule.activity_templates
                  const activityName = template?.activity_name || 'Unknown Activity'
                  return (
                    <option key={schedule.id} value={schedule.id}>
                      {activityName} ({schedule.recurrence_type})
                    </option>
                  )
                })}
              </select>
              
              <div className="text-sm text-slate-400">
                {getFilteredToursCount()} tours {calendarFilter !== 'all' ? 'in filtered view' : 'this month'}
              </div>
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
                          {scheduledTours.slice(0, 3).map(tour => {
                            // Determine promo badge
                            const hasPromoDiscount = tour.promo_discount_percent || tour.promo_discount_value
                            const hasCustomPricing = tour.discount_price_adult && tour.discount_price_adult !== tour.original_price_adult
                            const showPromoBadge = hasPromoDiscount || hasCustomPricing
                            
                            return (
                            <div
                              key={tour.id}
                              onClick={() => handleCustomizeTour(tour)}
                              className={`text-xs p-1 rounded truncate cursor-pointer transition-colors ${
                                tour.is_customized 
                                  ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' 
                                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              }`}
                              title={`${tour.tour_name} at ${tour.time_slot}${tour.is_customized ? ' (Customized)' : ''}${hasPromoDiscount ? ' - Promo Applied' : hasCustomPricing ? ' - Custom Pricing' : ''} - Click to customize`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="truncate">
                                  {tour.time_slot} {tour.tour_name}
                                </span>
                                <div className="flex items-center gap-0.5 flex-shrink-0">
                                  {showPromoBadge && (
                                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" title={hasPromoDiscount ? 'Promotional discount applied' : 'Custom pricing set'} />
                                  )}
                                  {tour.is_customized && (
                                    <Settings className="w-2 h-2" title="Tour has customizations" />
                                  )}
                                </div>
                              </div>
                            </div>
                            )
                          })}
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

          {/* Calendar Status Legend */}
          <div className="p-4 border-t border-slate-700 bg-slate-900/30">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Calendar Legend</h4>
            <div className="flex flex-wrap gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500/20 border border-green-500/40 rounded"></div>
                <span className="text-slate-400">Standard Tours</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500/20 border border-blue-500/40 rounded"></div>
                <span className="text-slate-400">Customized Tours</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                <span className="text-slate-400">Promotional Pricing</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="w-3 h-3 text-slate-400" />
                <span className="text-slate-400">Has Customizations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-900/30 border-2 border-blue-500 rounded"></div>
                <span className="text-slate-400">Today</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Enhanced Card-Based List View */
        <div className="space-y-4">
          {/* Status Legend */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Status Legend</h3>
            <div className="flex flex-wrap gap-6 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span className="text-slate-400">Active Schedule</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="w-3 h-3 text-blue-400" />
                <span className="text-slate-400">Customized Tours</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                <span className="text-slate-400">Promotional Pricing</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-3 h-3 text-purple-400" />
                <span className="text-slate-400">Analytics Available</span>
              </div>
              {bulkMode && (
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-3 h-3 text-orange-400" />
                  <span className="text-slate-400">Bulk Selection Mode</span>
                </div>
              )}
            </div>
          </div>

          {/* Schedule Cards */}
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <ScheduleCard 
                key={schedule.id} 
                schedule={schedule} 
                formatPrice={formatPrice}
                onEdit={handleEditSchedule}
                onDelete={handleDeleteSchedule}
                onViewCalendar={() => {
                  setViewMode('calendar')
                  setCalendarFilter(schedule.id) // Filter calendar by this schedule
                }}
                t={t}
                bulkMode={bulkMode}
                isSelected={selectedSchedules.has(schedule.id)}
                onToggleSelect={toggleScheduleSelection}
              />
            ))}
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

      {/* Schedule Update Warning Modal */}
      <ScheduleUpdateWarningModal
        isOpen={showWarningModal}
        onClose={handleCancelEdit}
        onConfirm={handleConfirmEdit}
        schedule={pendingEditSchedule}
        updateAnalysis={pendingEditSchedule?.updateAnalysis}
      />
    </div>
  )
}

export default SchedulesTab