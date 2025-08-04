// operator-dashboard/src/components/ScheduleCreateModal.jsx - SUB-STEP 2.1
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  X, Save, RotateCcw, Calendar, Clock, RefreshCw, 
  Info, AlertCircle, CheckCircle, Eye, EyeOff,
  ChevronDown, ChevronUp, Repeat, MapPin
} from 'lucide-react'
import { scheduleService } from '../services/scheduleService'

const ScheduleCreateModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  operator,
  existingSchedule = null // For edit mode
}) => {
  const { t } = useTranslation()
  
  // ==================== FORM STATE ====================
  const [formData, setFormData] = useState({
    tour_id: '',
    recurrence_type: 'weekly',
    days_of_week: [],
    start_time: '09:00',
    start_date: '',
    end_date: '',
    exceptions: []
  })
  
  const [validationErrors, setValidationErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState([])
  const [generatingPreview, setGeneratingPreview] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    recurrence: true,
    dates: true,
    exceptions: false,
    preview: false
  })
  
  // Available tours for selection
  const [availableTours, setAvailableTours] = useState([])
  const [loadingTours, setLoadingTours] = useState(true)
  
  // Exception dates management
  const [newExceptionDate, setNewExceptionDate] = useState('')

  // ==================== LIFECYCLE ====================
  useEffect(() => {
    if (isOpen) {
      loadAvailableTours()
      
      // Pre-populate for edit mode
      if (existingSchedule) {
        setFormData({
          tour_id: existingSchedule.tour_id || '',
          recurrence_type: existingSchedule.recurrence_type || 'weekly',
          days_of_week: existingSchedule.days_of_week || [],
          start_time: existingSchedule.start_time || '09:00',
          start_date: existingSchedule.start_date || '',
          end_date: existingSchedule.end_date || '',
          exceptions: existingSchedule.exceptions || []
        })
        setExpandedSections({
          basic: true,
          recurrence: true,
          dates: true,
          exceptions: existingSchedule.exceptions?.length > 0,
          preview: false
        })
      } else {
        resetForm()
      }
    }
  }, [isOpen, existingSchedule])

  // Auto-generate preview when form data changes
  useEffect(() => {
    if (showPreview && formData.tour_id && formData.start_date && formData.end_date) {
      generatePreview()
    }
  }, [formData, showPreview])

  // Auto-show preview when form has enough data
  useEffect(() => {
    const hasMinimalData = formData.tour_id && formData.start_date && formData.end_date && formData.recurrence_type
    const shouldAutoShowPreview = hasMinimalData && !showPreview
    
    if (shouldAutoShowPreview) {
      // Add a slight delay for better UX
      const timer = setTimeout(() => {
        setShowPreview(true)
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [formData.tour_id, formData.start_date, formData.end_date, formData.recurrence_type, showPreview])

  // ==================== DATA LOADING ====================
  const loadAvailableTours = async () => {
    if (!operator?.id) return
    
    try {
      setLoadingTours(true)
      // Get active tours for this operator
      const { data: tours, error } = await scheduleService.getOperatorTours(operator.id)
      
      if (error) throw error
      setAvailableTours(tours || [])
    } catch (error) {
      console.error('Error loading tours:', error)
      setAvailableTours([])
    } finally {
      setLoadingTours(false)
    }
  }

  const generatePreview = async () => {
    try {
      setGeneratingPreview(true)
      const preview = await scheduleService.generateSchedulePreview(formData)
      setPreviewData(preview)
    } catch (error) {
      console.error('Error generating preview:', error)
      setPreviewData([])
    } finally {
      setGeneratingPreview(false)
    }
  }

  // ==================== FORM HANDLERS ====================
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day].sort()
    }))
  }

  const addExceptionDate = () => {
    if (!newExceptionDate || formData.exceptions.includes(newExceptionDate)) return
    
    setFormData(prev => ({
      ...prev,
      exceptions: [...prev.exceptions, newExceptionDate].sort()
    }))
    setNewExceptionDate('')
  }

  const removeExceptionDate = (dateToRemove) => {
    setFormData(prev => ({
      ...prev,
      exceptions: prev.exceptions.filter(date => date !== dateToRemove)
    }))
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const resetForm = () => {
    setFormData({
      tour_id: '',
      recurrence_type: 'weekly',
      days_of_week: [],
      start_time: '09:00',
      start_date: '',
      end_date: '',
      exceptions: []
    })
    setValidationErrors({})
    setPreviewData([])
    setShowPreview(false)
    setNewExceptionDate('')
    setGeneratingPreview(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!operator?.id) {
      console.error('No operator ID available')
      return
    }

    try {
      setLoading(true)
      setValidationErrors({})
      
      const schedulePayload = {
        ...formData,
        operator_id: operator.id
      }
      
      let result
      if (existingSchedule) {
        result = await scheduleService.updateSchedule(existingSchedule.id, schedulePayload)
      } else {
        result = await scheduleService.createSchedule(schedulePayload)
      }
      
      // Success!
      onSuccess?.(result)
      onClose()
      resetForm()
      
    } catch (error) {
      console.error('Error saving schedule:', error)
      
      // Handle validation errors from service
      if (error.message.includes('|')) {
        const [errorCode, ...params] = error.message.split('|')
        // For now, show generic error - can be enhanced with specific field mapping
        setValidationErrors({ general: t(`schedules.errors.${errorCode}`, { params: params.join('|') }) })
      } else {
        setValidationErrors({ general: error.message || t('schedules.errors.UNEXPECTED_ERROR') })
      }
    } finally {
      setLoading(false)
    }
  }

  // Don't render if modal is closed
  if (!isOpen) return null

  // ==================== RENDER HELPERS ====================
  const getDayName = (dayNum) => {
    const days = [
      t('schedules.days.monday'),
      t('schedules.days.tuesday'), 
      t('schedules.days.wednesday'),
      t('schedules.days.thursday'),
      t('schedules.days.friday'),
      t('schedules.days.saturday'),
      t('schedules.days.sunday')
    ]
    return days[dayNum - 1] || ''
  }

  const getRecurrenceOptions = () => [
    { value: 'once', label: t('schedules.recurrence.once') },
    { value: 'daily', label: t('schedules.recurrence.daily') },
    { value: 'weekly', label: t('schedules.recurrence.weekly') },
    { value: 'monthly', label: t('schedules.recurrence.monthly') }
  ]

  const formatDisplayDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short', 
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const getRecurrenceIcon = (type) => {
    const icons = {
      once: '1️⃣',
      daily: '📅',
      weekly: '🔄',
      monthly: '📆'
    }
    return icons[type] || '📅'
  }

  // ==================== COMPONENT RENDER ====================
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700">
          <div>
            <h3 className="text-xl font-semibold text-white">
              {existingSchedule ? t('schedules.management.editSchedule') : t('schedules.management.createSchedule')}
            </h3>
            <p className="text-slate-400 mt-1">
              {t('schedules.management.setupRecurring')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? t('schedules.management.hidePreview') : t('schedules.management.showPreview')}
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* MODAL CONTENT */}
        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-120px)]">
          
          {/* FORM SECTION */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                
                {/* GENERAL ERROR */}
                {validationErrors.general && (
                  <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {validationErrors.general}
                    </div>

                {/* EXCEPTION DATES SECTION */}
                <div className="border border-slate-600 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('exceptions')}
                    className="w-full p-4 bg-slate-700/30 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-400" />
                      <h4 className="text-md font-medium text-slate-300">{t('schedules.sections.exceptions')}</h4>
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">{t('common.optional')}</span>
                    </div>
                    {expandedSections.exceptions ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>
                  
                  {expandedSections.exceptions && (
                    <div className="p-4 bg-slate-800/20 space-y-4">
                      
                      {/* Exception Date Input */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          {t('schedules.form.addExceptionDate')}
                        </label>
                        <p className="text-xs text-slate-400 mb-3">
                          {t('schedules.form.exceptionDescription')}
                        </p>
                        
                        <div className="flex gap-2">
                          <input
                            type="date"
                            value={newExceptionDate}
                            onChange={(e) => setNewExceptionDate(e.target.value)}
                            min={formData.start_date}
                            max={formData.end_date}
                            className="flex-1 p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={addExceptionDate}
                            disabled={!newExceptionDate || formData.exceptions.includes(newExceptionDate)}
                            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                          >
                            {t('schedules.form.addDate')}
                          </button>
                        </div>
                      </div>

                      {/* Exception Dates List */}
                      {formData.exceptions.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-3">
                            {t('schedules.form.exceptionDates')} ({formData.exceptions.length})
                          </label>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {formData.exceptions.map((date, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-lg border border-slate-600">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-orange-400" />
                                  <span className="text-slate-300 font-medium">{formatDisplayDate(date)}</span>
                                  <span className="text-xs text-slate-400">
                                    ({new Date(date).toLocaleDateString('en-US', { weekday: 'long' })})
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeExceptionDate(date)}
                                  className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                                  title={t('schedules.form.removeDate')}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                    </div>
                  )}
                </div>
                  </div>
                )}
                
                {/* BASIC INFORMATION SECTION */}
                <div className="border border-slate-600 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('basic')}
                    className="w-full p-4 bg-slate-700/30 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-blue-400" />
                      <h4 className="text-md font-medium text-slate-300">{t('schedules.sections.basicInfo')}</h4>
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">{t('common.required')}</span>
                    </div>
                    {expandedSections.basic ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>
                  
                  {expandedSections.basic && (
                    <div className="p-4 bg-slate-800/20 space-y-4">
                      
                      {/* Tour Selection */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                          {t('schedules.form.selectTour')} *
                        </label>
                        <select
                          value={formData.tour_id}
                          onChange={(e) => handleFieldChange('tour_id', e.target.value)}
                          className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white transition-colors ${
                            validationErrors.tour_id 
                              ? 'border-red-500 focus:border-red-500' 
                              : 'border-slate-600 focus:border-blue-500'
                          }`}
                          disabled={loadingTours}
                        >
                          <option value="">{loadingTours ? t('common.loading') : t('schedules.form.chooseTour')}</option>
                          {availableTours.map((tour) => (
                            <option key={tour.id} value={tour.id}>
                              {tour.tour_name} - {tour.tour_type}
                            </option>
                          ))}
                        </select>
                        {validationErrors.tour_id && (
                          <p className="text-red-400 text-sm mt-1">{validationErrors.tour_id}</p>
                        )}
                      </div>

                      {/* Start Time */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          {t('schedules.form.startTime')} *
                        </label>
                        <input
                          type="time"
                          value={formData.start_time}
                          onChange={(e) => handleFieldChange('start_time', e.target.value)}
                          className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white transition-colors ${
                            validationErrors.start_time 
                              ? 'border-red-500 focus:border-red-500' 
                              : 'border-slate-600 focus:border-blue-500'
                          }`}
                        />
                        {validationErrors.start_time && (
                          <p className="text-red-400 text-sm mt-1">{validationErrors.start_time}</p>
                        )}
                      </div>
                      
                    </div>
                  )}
                </div>

                {/* RECURRENCE PATTERN SECTION */}
                <div className="border border-slate-600 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('recurrence')}
                    className="w-full p-4 bg-slate-700/30 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Repeat className="w-5 h-5 text-purple-400" />
                      <h4 className="text-md font-medium text-slate-300">{t('schedules.sections.recurrencePattern')}</h4>
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">{t('common.required')}</span>
                    </div>
                    {expandedSections.recurrence ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>
                  
                  {expandedSections.recurrence && (
                    <div className="p-4 bg-slate-800/20 space-y-4">
                      
                      {/* Recurrence Type */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-3">
                          {t('schedules.form.recurrenceType')} *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {getRecurrenceOptions().map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleFieldChange('recurrence_type', option.value)}
                              className={`p-3 rounded-lg border transition-all text-sm font-medium ${
                                formData.recurrence_type === option.value
                                  ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                                  : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Enhanced Days of Week Selection (only for weekly) */}
                      {formData.recurrence_type === 'weekly' && (
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-3">
                            {t('schedules.form.daysOfWeek')} *
                          </label>
                          
                          {/* Enhanced Day Selection with Icons */}
                          <div className="grid grid-cols-7 gap-2 mb-3">
                            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                              const isSelected = formData.days_of_week.includes(day)
                              const dayName = getDayName(day)
                              
                              return (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => handleDayToggle(day)}
                                  className={`relative p-3 rounded-xl border-2 transition-all text-xs font-medium min-h-[60px] flex flex-col items-center justify-center group hover:scale-105 ${
                                    isSelected
                                      ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-blue-600/30 text-blue-300 shadow-lg shadow-blue-500/20'
                                      : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500 hover:bg-slate-600/30'
                                  }`}
                                  title={dayName}
                                >
                                  {/* Day Abbreviation */}
                                  <span className="text-xs font-bold mb-1">{dayName.substring(0, 3)}</span>
                                  
                                  {/* Selection Indicator */}
                                  <div className={`w-2 h-2 rounded-full transition-all ${
                                    isSelected ? 'bg-blue-400' : 'bg-transparent border border-slate-500'
                                  }`} />
                                  
                                  {/* Hover effect */}
                                  <div className={`absolute inset-0 rounded-xl border-2 transition-opacity ${
                                    isSelected ? 'border-blue-400/50' : 'border-transparent group-hover:border-slate-400/50'
                                  } opacity-0 group-hover:opacity-100`} />
                                </button>
                              )
                            })}
                          </div>
                          
                          {/* Quick Selection Buttons */}
                          <div className="flex gap-2 mb-3">
                            <button
                              type="button"
                              onClick={() => handleFieldChange('days_of_week', [1, 2, 3, 4, 5])}
                              className="px-3 py-1.5 text-xs bg-slate-600 hover:bg-slate-500 text-slate-300 rounded-lg transition-colors"
                            >
                              {t('schedules.quickSelect.weekdays')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFieldChange('days_of_week', [6, 7])}
                              className="px-3 py-1.5 text-xs bg-slate-600 hover:bg-slate-500 text-slate-300 rounded-lg transition-colors"
                            >
                              {t('schedules.quickSelect.weekends')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFieldChange('days_of_week', [1, 2, 3, 4, 5, 6, 7])}
                              className="px-3 py-1.5 text-xs bg-slate-600 hover:bg-slate-500 text-slate-300 rounded-lg transition-colors"
                            >
                              {t('schedules.quickSelect.allDays')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFieldChange('days_of_week', [])}
                              className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                            >
                              {t('schedules.quickSelect.clear')}
                            </button>
                          </div>
                          
                          {/* Selected Days Summary */}
                          {formData.days_of_week.length > 0 && (
                            <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                              <p className="text-xs text-blue-300">
                                <span className="font-medium">{t('schedules.form.selectedDays')}: </span>
                                {formData.days_of_week.map(day => getDayName(day)).join(', ')}
                              </p>
                            </div>
                          )}
                          
                          {validationErrors.days_of_week && (
                            <p className="text-red-400 text-sm mt-1">{validationErrors.days_of_week}</p>
                          )}
                        </div>
                      )}
                      
                    </div>
                  )}
                </div>

                {/* DATE RANGE SECTION */}
                <div className="border border-slate-600 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('dates')}
                    className="w-full p-4 bg-slate-700/30 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-green-400" />
                      <h4 className="text-md font-medium text-slate-300">{t('schedules.sections.dateRange')}</h4>
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">{t('common.required')}</span>
                    </div>
                    {expandedSections.dates ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>
                  
                  {expandedSections.dates && (
                    <div className="p-4 bg-slate-800/20 space-y-4">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Start Date */}
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            {t('schedules.form.startDate')} *
                          </label>
                          <input
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => handleFieldChange('start_date', e.target.value)}
                            className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white transition-colors ${
                              validationErrors.start_date 
                                ? 'border-red-500 focus:border-red-500' 
                                : 'border-slate-600 focus:border-blue-500'
                            }`}
                          />
                          {validationErrors.start_date && (
                            <p className="text-red-400 text-sm mt-1">{validationErrors.start_date}</p>
                          )}
                        </div>

                        {/* End Date */}
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            {t('schedules.form.endDate')} *
                          </label>
                          <input
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => handleFieldChange('end_date', e.target.value)}
                            className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white transition-colors ${
                              validationErrors.end_date 
                                ? 'border-red-500 focus:border-red-500' 
                                : 'border-slate-600 focus:border-blue-500'
                            }`}
                          />
                          {validationErrors.end_date && (
                            <p className="text-red-400 text-sm mt-1">{validationErrors.end_date}</p>
                          )}
                        </div>
                      </div>
                      
                    </div>
                  )}
                </div>

                {/* FORM ACTIONS */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-700">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      {t('common.reset')}
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {t('common.saving')}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          {existingSchedule ? t('common.update') : t('common.create')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
              </div>
            </form>
          </div>

          {/* ENHANCED PREVIEW SECTION */}
          {showPreview && (
            <div className="w-full lg:w-96 border-l border-slate-700 bg-slate-800/30">
              <div className="p-6">
                
                {/* Preview Header */}
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-blue-400" />
                  <h4 className="text-lg font-semibold text-white">{t('schedules.preview.title')}</h4>
                  {generatingPreview && (
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin ml-2" />
                  )}
                  {previewData.length > 0 && !generatingPreview && (
                    <span className="ml-auto text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                      {previewData.length} {t('schedules.preview.instances')}
                    </span>
                  )}
                </div>

                {/* Schedule Summary */}
                {formData.tour_id && (
                  <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getRecurrenceIcon(formData.recurrence_type)}
                      <span className="text-white font-medium">
                        {getRecurrenceOptions().find(opt => opt.value === formData.recurrence_type)?.label}
                      </span>
                    </div>
                    
                    {formData.recurrence_type === 'weekly' && formData.days_of_week.length > 0 && (
                      <div className="text-xs text-slate-300 mb-1">
                        <span className="text-slate-400">{t('schedules.preview.onDays')}: </span>
                        {formData.days_of_week.map(day => getDayName(day).substring(0, 3)).join(', ')}
                      </div>
                    )}
                    
                    <div className="text-xs text-slate-400">
                      {formData.start_date} → {formData.end_date}
                    </div>
                    
                    {formData.exceptions.length > 0 && (
                      <div className="text-xs text-orange-300 mt-1">
                        {t('schedules.preview.excluding')} {formData.exceptions.length} {t('schedules.preview.dates')}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Preview Instances */}
                {previewData.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                    {previewData.map((instance, index) => (
                      <div key={index} className="group p-3 bg-gradient-to-r from-slate-700/30 to-slate-600/20 rounded-lg border border-slate-600/50 hover:border-slate-500 transition-all hover:bg-slate-600/30">
                        
                        {/* Date and Day */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span className="text-white font-medium">{formatDisplayDate(instance.date)}</span>
                          </div>
                          <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                            #{index + 1}
                          </span>
                        </div>
                        
                        {/* Day Name */}
                        <div className="text-slate-300 text-sm mb-2 flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                          {instance.dayName}
                        </div>
                        
                        {/* Time */}
                        <div className="flex items-center gap-1 text-slate-400 text-sm">
                          <Clock className="w-3 h-3" />
                          <span>{instance.time}</span>
                          
                          {/* Tour will be created indicator */}
                          <span className="ml-auto text-xs text-green-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            ✓ {t('schedules.preview.willCreate')}
                          </span>
                        </div>
                        
                      </div>
                    ))}
                    
                    {/* Pagination indicator */}
                    {previewData.length >= 10 && (
                      <div className="text-center py-4 border-t border-slate-600/50">
                        <p className="text-slate-400 text-sm">
                          {t('schedules.preview.showingFirst10')}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {t('schedules.preview.moreWillBeGenerated')}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-400 mb-2">{t('schedules.preview.fillFormToSee')}</p>
                    <p className="text-xs text-slate-500">
                      {t('schedules.preview.completeFormHint')}
                    </p>
                  </div>
                )}
                
                {/* Quick Actions */}
                {previewData.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-600/50">
                    <button
                      type="button"
                      onClick={generatePreview}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-600/50 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      {t('schedules.preview.refresh')}
                    </button>
                  </div>
                )}
                
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}

export default ScheduleCreateModal