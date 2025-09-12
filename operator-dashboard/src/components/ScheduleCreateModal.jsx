// operator-dashboard/src/components/ScheduleCreateModal.jsx - SUB-STEP 2.1
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  X, Save, RotateCcw, Calendar, Clock, RefreshCw, 
  Info, AlertCircle, Eye, EyeOff,
  ChevronDown, ChevronUp, Repeat
} from 'lucide-react'
import { scheduleService } from '../services/scheduleService'
// Local helper for dd.mm.yyyy format

const parsePolynesianDate = (dateString) => {
  if (!dateString) return null
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day) // month is 0-indexed
}

const formatPolynesianDateDMY = (date) => {
  if (!date) return ''
  
  try {
    const dateObj = typeof date === 'string' ? parsePolynesianDate(date) : date
    if (!dateObj) return ''
    
    const day = String(dateObj.getDate()).padStart(2, '0')
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const year = dateObj.getFullYear()
    
    return `${day}.${month}.${year}`
  } catch {
    return date?.toString() || ''
  }
}

const ScheduleCreateModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  operator,
  existingSchedule = null // For edit mode
}) => {
  const { t } = useTranslation()
  
  // ==================== FORM STATE - TEMPLATE-FIRST ONLY ====================
  const [formData, setFormData] = useState({
    template_id: '', // Only activity templates allowed
    recurrence_type: 'weekly',
    days_of_week: [],
    start_time: '09:00',
    start_date: '',
    end_date: '',
    exceptions: []
  })
  
  const [validationErrors, setValidationErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [, setLoadingMessage] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState([])
  const [generatingPreview, setGeneratingPreview] = useState(false)
  const [userHidPreview, setUserHidPreview] = useState(false) // Track if user manually hid preview
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    recurrence: true,
    dates: true,
    exceptions: false,
    preview: false
  })
  
  // Available templates for selection (TEMPLATE-FIRST ONLY)
  const [availableTemplates, setAvailableTemplates] = useState([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  
  // Exception dates management
  const [newExceptionDate, setNewExceptionDate] = useState('')

  // ==================== LIFECYCLE ====================
  useEffect(() => {
    if (isOpen) {
      loadAvailableTemplates()
      
      // Pre-populate for edit mode
      if (existingSchedule) {
        // Only template-based schedules are supported
        setFormData({
          template_id: existingSchedule.template_id || existingSchedule.activity_templates?.id || '',
          recurrence_type: existingSchedule.recurrence_type || 'weekly',
          days_of_week: existingSchedule.days_of_week || [],
          start_time: existingSchedule.start_time ? existingSchedule.start_time.substring(0, 5) : '09:00',
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
  }, [isOpen, existingSchedule]) // loadAvailableTemplates is stable

  // Auto-generate preview when form data changes
  useEffect(() => {
    if (showPreview && formData.template_id && formData.start_date && formData.end_date) {
      generatePreview()
    }
  }, [formData, showPreview]) // generatePreview is stable

  // Auto-show preview when form has enough data (but respect user's manual hide)
  useEffect(() => {
    const hasMinimalData = formData.template_id && formData.start_date && formData.end_date && formData.recurrence_type
    const shouldAutoShowPreview = hasMinimalData && !showPreview && !userHidPreview
    
    if (shouldAutoShowPreview) {
      // Add a slight delay for better UX
      const timer = setTimeout(() => {
        setShowPreview(true)
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [formData.template_id, formData.start_date, formData.end_date, formData.recurrence_type, showPreview, userHidPreview])

  // ==================== DATA LOADING - TEMPLATE-FIRST ONLY ====================
  const loadAvailableTemplates = async () => {
    if (!operator?.id) return
    
    try {
      setLoadingTemplates(true)
      
      // Get activity templates for this operator (TEMPLATE-FIRST APPROACH)
      const { data: templates, error: templatesError } = await scheduleService.getOperatorActivityTemplates(operator.id)
      if (templatesError) throw templatesError
      setAvailableTemplates(templates || [])
      
    } catch (error) {
      console.error('Error loading activity templates:', error)
      setAvailableTemplates([])
    } finally {
      setLoadingTemplates(false)
    }
  }

  const generatePreview = async () => {
    try {
      setGeneratingPreview(true)
      let preview = []
      
      // Generate preview for activity template schedule (TEMPLATE-FIRST ONLY)
      preview = await scheduleService.generateActivityTemplateSchedulePreview(formData)
      
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
    
    // Clear existing errors for this field and validate
    setValidationErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      
      // Add new validation errors if any
      const fieldErrors = validateFormField(field, value)
      return { ...newErrors, ...fieldErrors }
    })
  }

  const handleDayToggle = (day) => {
    const newDaysOfWeek = formData.days_of_week.includes(day)
      ? formData.days_of_week.filter(d => d !== day)
      : [...formData.days_of_week, day].sort()
    
    handleFieldChange('days_of_week', newDaysOfWeek)
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
      template_id: '',
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
    setUserHidPreview(false) // Reset user hide preference
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
        setLoadingMessage('Updating schedule...')
        result = await scheduleService.updateSchedule(existingSchedule.id, schedulePayload, operator.id)
      } else {
        // Create schedule from activity template (TEMPLATE-FIRST ONLY)
        setLoadingMessage('Creating schedule from template...')
        result = await scheduleService.createActivityTemplateSchedule(schedulePayload)
        
        // Add progress indicator for tour generation
        if (result && result.generated_tours_count > 0) {
          setLoadingMessage(`Generated ${result.generated_tours_count} bookable tours...`)
          // Small delay to show the message
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      setLoadingMessage('Schedule saved successfully!')
      
      // Success!
      onSuccess?.(result)
      onClose()
      resetForm()
      
    } catch (error) {
      console.error('Error saving schedule:', error)
      
      // Map service errors to specific form fields
      const fieldErrors = mapErrorsToFields(error.message)
      setValidationErrors(fieldErrors)
      
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
      // Use dd.mm.yyyy format for consistent display
      return formatPolynesianDateDMY(dateString)
    } catch {
      return dateString
    }
  }

  // Map service error codes to form field errors
  const mapErrorsToFields = (errorMessage) => {
    const fieldErrors = {}
    
    if (errorMessage.includes('|')) {
      const [errorCode] = errorMessage.split('|')
      
      // Map specific error codes to form fields
      const errorFieldMap = {
        'TOUR_ID_REQUIRED': 'template_id', // Legacy error code mapped to template
        'TEMPLATE_ID_REQUIRED': 'template_id',
        'START_TIME_REQUIRED': 'start_time',
        'START_DATE_REQUIRED': 'start_date',
        'END_DATE_REQUIRED': 'end_date',
        'RECURRENCE_TYPE_REQUIRED': 'recurrence_type',
        'WEEKLY_REQUIRES_DAYS': 'days_of_week',
        'INVALID_TIME_FORMAT': 'start_time',
        'INVALID_START_DATE_FORMAT': 'start_date',
        'INVALID_END_DATE_FORMAT': 'end_date',
        'START_DATE_IN_PAST': 'start_date',
        'END_DATE_BEFORE_START': 'end_date',
        'DATE_RANGE_TOO_LARGE': 'end_date',
        'INVALID_DAYS_OF_WEEK': 'days_of_week',
        'BOOKING_DEADLINE_PASSED': 'start_date'
      }
      
      const field = errorFieldMap[errorCode]
      if (field) {
        fieldErrors[field] = t(`schedules.errors.${errorCode}`, { defaultValue: errorCode.replace(/_/g, ' ').toLowerCase() })
      } else {
        fieldErrors.general = t(`schedules.errors.${errorCode}`, { defaultValue: errorMessage })
      }
    } else {
      fieldErrors.general = errorMessage
    }
    
    return fieldErrors
  }

  // Helper function for date+time validation with auto-close hours
  const validateDateTimeWithAutoClose = (dateValue, timeValue, templateId) => {
    if (!dateValue || !timeValue || !templateId) return null
    
    const startDate = parsePolynesianDate(dateValue)
    const selectedTemplate = availableTemplates.find(t => t.id === templateId)
    
    console.log('🔍 DateTime validation:', { 
      dateValue,
      timeValue,
      templateId, 
      template: selectedTemplate, 
      autoCloseHours: selectedTemplate?.auto_close_hours 
    })
    
    if (selectedTemplate && selectedTemplate.auto_close_hours !== undefined) {
      const [hours, minutes] = timeValue.split(':').map(Number)
      const activityDateTime = new Date(startDate)
      activityDateTime.setHours(hours, minutes, 0, 0)
      
      const autoCloseHours = selectedTemplate.auto_close_hours || 2
      const bookingDeadline = new Date(activityDateTime.getTime() - (autoCloseHours * 60 * 60 * 1000))
      const currentDateTime = new Date()
      
      console.log('📅 Booking deadline check:', {
        activityDateTime: activityDateTime.toLocaleString(),
        bookingDeadline: bookingDeadline.toLocaleString(),
        currentDateTime: currentDateTime.toLocaleString(),
        autoCloseHours,
        isPastDeadline: currentDateTime >= bookingDeadline
      })
      
      if (currentDateTime >= bookingDeadline) {
        return t('schedules.errors.BOOKING_DEADLINE_PASSED', { 
          defaultValue: `Too late to schedule - booking closes ${autoCloseHours} hours before activity`,
          hours: autoCloseHours 
        })
      }
    }
    
    return null
  }

  // Client-side validation for immediate feedback
  const validateFormField = (field, value) => {
    const errors = {}
    
    switch (field) {
      case 'template_id':
        if (!value) {
          errors[field] = t('schedules.errors.TEMPLATE_REQUIRED', { defaultValue: 'Please select an activity template' })
        }
        break
        
      case 'start_time':
        if (!value) {
          errors[field] = t('schedules.errors.START_TIME_REQUIRED', { defaultValue: 'Start time is required' })
        } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
          errors[field] = t('schedules.errors.INVALID_TIME_FORMAT', { defaultValue: 'Invalid time format (HH:MM)' })
        } else {
          // Check auto-close hours validation when time changes
          const dateTimeError = validateDateTimeWithAutoClose(
            formData.start_date, 
            value, 
            formData.template_id
          )
          if (dateTimeError) {
            errors['start_date'] = dateTimeError // Show error on date field for consistency
          }
        }
        break
        
      case 'start_date':
        if (!value) {
          errors[field] = t('schedules.errors.START_DATE_REQUIRED', { defaultValue: 'Start date is required' })
        } else {
          // Use timezone-safe date parsing
          const startDate = parsePolynesianDate(value)
          
          // Try auto-close hours validation first
          const dateTimeError = validateDateTimeWithAutoClose(
            value, 
            formData.start_time, 
            formData.template_id
          )
          
          if (dateTimeError) {
            errors[field] = dateTimeError
          } else {
            // Fallback to basic past date check if no template/time data
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            if (startDate < today) {
              errors[field] = t('schedules.errors.START_DATE_IN_PAST', { defaultValue: 'Start date cannot be in the past' })
            }
          }
        }
        break
        
      case 'end_date':
        if (!value) {
          errors[field] = t('schedules.errors.END_DATE_REQUIRED', { defaultValue: 'End date is required' })
        } else if (formData.start_date) {
          const startDate = new Date(formData.start_date)
          const endDate = new Date(value)
          if (endDate <= startDate) {
            errors[field] = t('schedules.errors.END_DATE_BEFORE_START', { defaultValue: 'End date must be after start date' })
          }
        }
        break
        
      case 'days_of_week':
        if (formData.recurrence_type === 'weekly' && (!value || value.length === 0)) {
          errors[field] = t('schedules.errors.WEEKLY_REQUIRES_DAYS', { defaultValue: 'Select at least one day for weekly recurrence' })
        }
        break
      
      default:
        // No validation for other fields
        break
    }
    
    return errors
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
              onClick={() => {
                const newShowState = !showPreview
                setShowPreview(newShowState)
                // Track if user manually hid the preview
                if (!newShowState) {
                  setUserHidPreview(true)
                } else {
                  setUserHidPreview(false)
                }
              }}
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
                      
                      {/* Activity Template Selection - TEMPLATE-FIRST ONLY */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                          📋 {t('schedules.form.selectTemplate')} *
                        </label>
                        <select
                          value={formData.template_id || ''}
                          onChange={(e) => {
                            const templateId = e.target.value
                            handleFieldChange('template_id', templateId)
                          }}
                          className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white transition-colors ${
                            validationErrors.template_id
                              ? 'border-red-500 focus:border-red-500' 
                              : 'border-slate-600 focus:border-blue-500'
                          }`}
                          disabled={loadingTemplates}
                        >
                          <option value="">
                            {loadingTemplates ? t('common.loading') : t('schedules.form.chooseTemplate')}
                          </option>
                          
                          {availableTemplates.map((template) => (
                            <option key={template.id} value={template.id}>
                              🟣 {template.activity_name} - {template.activity_type} 
                              {template.island_location && ` (${template.island_location})`}
                            </option>
                          ))}
                        </select>
                        {validationErrors.template_id && (
                          <p className="text-red-400 text-sm mt-1">{validationErrors.template_id}</p>
                        )}
                        
                        {/* Template Info */}
                        {formData.template_id && (
                          <div className="mt-2 p-2 bg-slate-700/30 rounded-lg border border-slate-600">
                            {(() => {
                              const selectedTemplate = availableTemplates.find(t => t.id === formData.template_id)
                              if (selectedTemplate) {
                                return (
                                  <div className="text-xs text-slate-300 space-y-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-400">Capacity:</span>
                                      <span>{selectedTemplate.max_capacity} people</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-400">Price:</span>
                                      <span>{selectedTemplate.discount_price_adult} XPF</span>
                                    </div>
                                    {selectedTemplate.auto_close_hours && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-slate-400">Booking deadline:</span>
                                        <span>{selectedTemplate.auto_close_hours}h before activity</span>
                                      </div>
                                    )}
                                  </div>
                                )
                              }
                              return null
                            })()} 
                          </div>
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
                {formData.template_id && (
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