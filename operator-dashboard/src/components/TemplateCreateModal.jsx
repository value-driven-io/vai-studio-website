// TemplateCreateModal.jsx - Using exact CreateTab form structure
import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  X, Save, DollarSign, Users, Clock, MapPin, Globe, Activity, AlertCircle, CheckCircle, 
  Info, HelpCircle, Camera, Utensils, Waves, Car, Shield, Cloud, FileText, Package, 
  ChevronDown, ChevronUp, Calendar, Heart, Plus, Minus, Trash2, Eye, EyeOff, Settings
} from 'lucide-react'
import templateService from '../services/templateService'
import toast from 'react-hot-toast'

// Tooltip Component (copied from CreateTab)
const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [actualPosition, setActualPosition] = useState(position)
  const [tooltipStyle, setTooltipStyle] = useState({})
  const tooltipRef = useRef(null)
  const triggerRef = useRef(null)

  const calculatePosition = () => {
    if (!triggerRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipElement = tooltipRef.current
    if (!tooltipElement) return

    const tooltipRect = tooltipElement.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    let newPosition = position
    let style = {}

    // Check if tooltip fits in the preferred position
    if (position === 'top' && triggerRect.top - tooltipRect.height < 10) {
      newPosition = 'bottom'
    } else if (position === 'bottom' && triggerRect.bottom + tooltipRect.height > viewport.height - 10) {
      newPosition = 'top'
    } else if (position === 'left' && triggerRect.left - tooltipRect.width < 10) {
      newPosition = 'right'
    } else if (position === 'right' && triggerRect.right + tooltipRect.width > viewport.width - 10) {
      newPosition = 'left'
    }

    setActualPosition(newPosition)
    setTooltipStyle(style)
  }

  useEffect(() => {
    if (isVisible) {
      setTimeout(calculatePosition, 0) // Let the tooltip render first
    }
  }, [isVisible])

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      ref={triggerRef}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 px-3 py-2 text-xs text-white bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-w-xs whitespace-nowrap ${
            actualPosition === 'top' ? 'bottom-full mb-2 left-1/2 transform -translate-x-1/2' :
            actualPosition === 'bottom' ? 'top-full mt-2 left-1/2 transform -translate-x-1/2' :
            actualPosition === 'left' ? 'right-full mr-2 top-1/2 transform -translate-y-1/2' :
            'left-full ml-2 top-1/2 transform -translate-y-1/2'
          }`}
          style={tooltipStyle}
        >
          {content}
          <div className={`absolute w-2 h-2 bg-slate-800 border-slate-600 transform rotate-45 ${
            actualPosition === 'top' ? 'top-full left-1/2 transform -translate-x-1/2 -mt-1 border-b border-r' :
            actualPosition === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2 -mb-1 border-t border-l' :
            actualPosition === 'left' ? 'left-full top-1/2 transform -translate-y-1/2 -ml-1 border-t border-r' :
            'right-full top-1/2 transform -translate-y-1/2 -mr-1 border-b border-l'
          }`} />
        </div>
      )}
    </div>
  )
}

// ContextualTooltip Component (from CreateTab)
const ContextualTooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false)
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 px-3 py-2 text-xs text-white bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-w-xs ${
          position === 'top' ? 'bottom-full mb-2 left-1/2 transform -translate-x-1/2' :
          position === 'bottom' ? 'top-full mt-2 left-1/2 transform -translate-x-1/2' :
          position === 'left' ? 'right-full mr-2 top-1/2 transform -translate-y-1/2' :
          'left-full ml-2 top-1/2 transform -translate-y-1/2'
        }`}>
          {content}
          <div className={`absolute w-2 h-2 bg-slate-800 border-slate-600 transform rotate-45 ${
            position === 'top' ? 'top-full left-1/2 transform -translate-x-1/2 -mt-1 border-b border-r' :
            position === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2 -mb-1 border-t border-l' :
            position === 'left' ? 'left-full top-1/2 transform -translate-y-1/2 -ml-1 border-t border-r' :
            'right-full top-1/2 transform -translate-y-1/2 -mr-1 border-b border-l'
          }`} />
        </div>
      )}
    </div>
  )
}

const TemplateCreateModal = ({
  isOpen,
  onClose,
  onSuccess,
  operator,
  formatPrice,
  existingTemplate = null
}) => {
  const { t } = useTranslation()
  
  // Form state (exact copy from CreateTab)
  const [formData, setFormData] = useState({
    tour_name: '',
    tour_type: 'Lagoon Tour',
    description: '',
    duration_hours: 3,
    max_capacity: 8,
    available_spots: 6, // Strategic availability (less than max capacity)
    original_price_adult: 12000,
    discount_price_adult: 12000,
    discount_price_child: 8400, // Will be auto-calculated: 12000 * 70% = 8400
    discount_percentage: 0, // No discount by default
    max_age_child: 11,
    discount_percentage_child: 30, // 30% off = 70% of adult price
    meeting_point: '',
    location: 'Moorea',
    languages: ['French'],
    equipment_included: false,
    food_included: false,
    drinks_included: false,
    pickup_available: false,
    pickup_locations: [],
    whale_regulation_compliant: false,
    max_whale_group_size: 6,
    min_age: null,
    max_age: null,
    fitness_level: 'easy',
    requirements: '',
    restrictions: '',
    weather_dependent: true,
    backup_plan: '',
    special_notes: '',
    auto_close_hours: 2,
    tour_date: null, // Templates don't have specific dates
    time_slot: null, // Templates don't have specific times
    status: 'active',
    is_template: true
  })

  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [showOptionalSections, setShowOptionalSections] = useState({
    location: false,
    inclusions: false,
    requirements: false,
    compliance: false
  })

  // Data from CreateTab
  const tourTypes = [
    { value: 'Whale Watching', icon: '🐋', color: 'bg-blue-500' },
    { value: 'Snorkeling', icon: '🤿', color: 'bg-cyan-500' },
    { value: 'Lagoon Tour', icon: '🏝️', color: 'bg-teal-500' },
    { value: 'Hike', icon: '🥾', color: 'bg-green-500' },
    { value: 'Cultural', icon: '🗿', color: 'bg-amber-500' },
    { value: 'Adrenalin', icon: '🪂', color: 'bg-red-500' },
    { value: 'Mindfulness', icon: '🧘', color: 'bg-purple-500' },
    { value: 'Culinary Experience', icon: '🍽️', color: 'bg-orange-500' },
    { value: 'Diving', icon: '🤿', color: 'bg-indigo-500' },
    { value: 'Private Charter', icon: '⛵', color: 'bg-slate-500' },
    { value: 'Sunset Cruise', icon: '🌅', color: 'bg-orange-500' }
  ]
  
  const ISLAND_LOCATIONS = [
    'Bora Bora',
    'Moorea', 
    'Tahiti',
    'Huahine',
    'Taha\'a',
    'Raiatea',
    'Maupiti',
    'Fakarava',
    'Rangiroa',
    'Tikehau'
  ]
  
  const availableLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'ty', name: 'Tahitian', flag: '🇵🇫' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' }
  ]

  // Initialize form when editing (exact copy from CreateTab)
  useEffect(() => {
    if (existingTemplate && isOpen) {
      setFormData({
        ...existingTemplate,
        languages: existingTemplate.languages || ['French'],
        pickup_locations: existingTemplate.pickup_locations || [],
        tour_date: null, // Templates don't have dates
        time_slot: null, // Templates don't have times
        is_template: true
      })
      
      // Auto-expand sections with data
      setShowOptionalSections({
        location: !!(existingTemplate.location || existingTemplate.meeting_point || existingTemplate.pickup_available),
        inclusions: !!(existingTemplate.equipment_included || existingTemplate.food_included || existingTemplate.drinks_included),
        requirements: !!(existingTemplate.fitness_level !== 'easy' || existingTemplate.min_age || existingTemplate.max_age || existingTemplate.requirements || existingTemplate.restrictions),
        compliance: !!(existingTemplate.whale_regulation_compliant || existingTemplate.weather_dependent || existingTemplate.special_notes)
      })
    }
  }, [existingTemplate, isOpen])

  // Initialize child pricing calculation
  useEffect(() => {
    if (formData.discount_price_adult > 0 && formData.discount_percentage_child >= 0) {
      const childDiscountMultiplier = (100 - formData.discount_percentage_child) / 100
      const calculatedChildPrice = Math.round(formData.discount_price_adult * childDiscountMultiplier)
      
      if (formData.discount_price_child !== calculatedChildPrice) {
        setFormData(prev => ({ 
          ...prev, 
          discount_price_child: calculatedChildPrice 
        }))
      }
    }
  }, [formData.discount_price_adult, formData.discount_percentage_child])

  // Field change handler (exact copy from CreateTab logic)
  const handleFieldChange = (field, value) => {
    let processedValue = value
    const numericFields = ['max_capacity', 'available_spots', 'original_price_adult', 'discount_price_adult', 'discount_price_child', 'duration_hours', 'min_age', 'max_age', 'max_whale_group_size', 'auto_close_hours', 'max_age_child', 'discount_percentage_child']
    
    if (numericFields.includes(field)) {
      if (value === '' || value === null || value === undefined) {
        processedValue = ''
      } else {
        const numValue = Number(value)
        if (!isNaN(numValue)) {
          processedValue = numValue
        } else {
          return // Don't update if invalid number
        }
      }
    }
    
    // Auto-calculate discount percentage and child pricing
    if (field === 'original_price_adult' || field === 'discount_price_adult' || field === 'discount_percentage_child') {
      const updated = { ...formData, [field]: processedValue }
      
      // For templates: When original price changes, auto-sync discount price (maintain no discount initially)
      if (field === 'original_price_adult' && updated.discount_percentage === 0) {
        updated.discount_price_adult = updated.original_price_adult
      }
      
      // Calculate adult discount percentage
      if (updated.original_price_adult > 0 && updated.discount_price_adult > 0) {
        const discountPercentage = Math.round(((updated.original_price_adult - updated.discount_price_adult) / updated.original_price_adult) * 100)
        updated.discount_percentage = discountPercentage
      }
      
      // Calculate child price (child gets percentage off adult price)
      if (updated.discount_price_adult > 0 && updated.discount_percentage_child >= 0) {
        const childDiscountMultiplier = (100 - updated.discount_percentage_child) / 100
        updated.discount_price_child = Math.round(updated.discount_price_adult * childDiscountMultiplier)
      }
      
      setFormData(prev => ({ ...prev, ...updated }))
    } else {
      setFormData(prev => ({ ...prev, [field]: processedValue }))
    }
    
    // For templates, allow independent available_spots control
    // (Available spots can be less than max_capacity for strategic availability)
    
    // Clear validation errors
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleLanguageToggle = (languageCode) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(languageCode)
        ? prev.languages.filter(l => l !== languageCode)
        : [...prev.languages, languageCode]
    }))
  }

  const handlePickupLocationAdd = () => {
    if (formData.pickup_locations.length < 5) {
      setFormData(prev => ({
        ...prev,
        pickup_locations: [...prev.pickup_locations, '']
      }))
    }
  }

  const handlePickupLocationRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      pickup_locations: prev.pickup_locations.filter((_, i) => i !== index)
    }))
  }

  const handlePickupLocationChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      pickup_locations: prev.pickup_locations.map((loc, i) => i === index ? value : loc)
    }))
  }

  const toggleSection = (section) => {
    setShowOptionalSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.tour_name?.trim()) {
      errors.tour_name = 'Activity name is required'
    }
    
    if (!formData.description?.trim()) {
      errors.description = 'Description is required'
    }
    
    if (!formData.meeting_point?.trim()) {
      errors.meeting_point = 'Meeting point is required'
    }
    
    if (formData.max_capacity < 1) {
      errors.max_capacity = 'Capacity must be at least 1'
    }
    
    if (formData.original_price_adult < 1000) {
      errors.original_price_adult = 'Price must be at least 1000 XPF'
    }
    
    if (formData.discount_price_adult > formData.original_price_adult) {
      errors.discount_price_adult = 'Discount price cannot be higher than original price'
    }

    if (formData.tour_type === 'Whale Watching' && !formData.whale_regulation_compliant) {
      errors.whale_regulation_compliant = 'Whale watching compliance is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting')
      return
    }

    try {
      setLoading(true)
      
      // Remove discount_percentage since it's auto-calculated by database
      const { discount_percentage, ...formDataWithoutCalculated } = formData
      
      const templateData = {
        ...formDataWithoutCalculated,
        operator_id: operator.id,
        activity_type: 'template',
        is_template: true,
        status: 'active'
      }

      let result
      if (existingTemplate) {
        result = await templateService.updateTemplate(existingTemplate.id, templateData)
      } else {
        result = await templateService.createTemplate(templateData)
      }

      if (result.success) {
        toast.success(existingTemplate ? 'Template updated successfully!' : 'Template created successfully!')
        onSuccess?.(result.data)
        onClose()
      } else {
        throw new Error(result.error)
      }
      
    } catch (error) {
      console.error('❌ Error saving template:', error)
      toast.error(`Failed to ${existingTemplate ? 'update' : 'create'} template: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Fixed Header */}
        <div className="bg-slate-700 px-6 py-4 border-b border-slate-600 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5" />
                {existingTemplate ? 'Edit Template' : 'Create New Template'}
              </h2>
              <p className="text-slate-400 mt-1">
                {existingTemplate 
                  ? 'Update your reusable activity template' 
                  : 'Create a reusable activity template for scheduling'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form wrapper */}
        <form id="template-form" onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              
<div className="max-w-4xl mx-auto space-y-6">
  
  {/* ESSENTIAL SECTIONS - Always Visible */}
  
  {/* Basic Information */}
  <div className="border border-slate-600 rounded-lg overflow-hidden">
    <div className="p-4 bg-slate-700/30">
      <div className="flex items-center gap-3">
        <Info className="w-5 h-5 text-blue-400" />
        <h4 className="text-md font-medium text-slate-300">Basic Information</h4>
        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Required</span>
      </div>
    </div>
    <div className="p-4 bg-slate-800/20 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            Activity Name *
            <ContextualTooltip content="Give your activity a clear, descriptive name that guests will see">
                <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded cursor-help hover:bg-slate-600 transition-colors">
                💡
                </span>
            </ContextualTooltip>
            </label>
          <input
            type="text"
            value={formData.tour_name}
            onChange={(e) => handleFieldChange('tour_name', e.target.value)}
            className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white transition-colors ${
                validationErrors.tour_name ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
            }`}
            placeholder="e.g., Lagoon Discovery Adventure"
          />
          <p className="text-slate-500 text-sm mt-1">
            {formData.tour_name?.length || 0}/100
            </p>
          {validationErrors.tour_name && (
            <div className="flex items-center gap-2 mt-1">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{validationErrors.tour_name}</p>
            </div>
          )}
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Activity Type</label>
            <select
                value={formData.tour_type}
                onChange={(e) => handleFieldChange('tour_type', e.target.value)}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500"
            >
                {tourTypes.map(type => (
                <option key={type.value} value={type.value}>{type.icon} {type.value}</option>
                ))}
            </select>
            <p className="text-slate-400 text-xs mt-1">
                Choose the category that best describes your activity
            </p>
            </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
          Description *
          <ContextualTooltip content="Describe what makes this activity special and what guests can expect">
            <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded cursor-help hover:bg-slate-600 transition-colors">
              💡
            </span>
          </ContextualTooltip>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 transition-colors ${
            validationErrors.description ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
          }`}
          rows="4"
          placeholder="Describe your activity experience, what makes it special, and what guests will enjoy..."
        />
        {validationErrors.description && (
          <div className="flex items-center gap-2 mt-1">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{validationErrors.description}</p>
          </div>
        )}
        <p className="text-slate-500 text-sm mt-1">
        {formData.description?.length || 0}/500
        </p>
      </div>
    </div>
  </div>

  {/* Activity Duration */}
  <div className="border border-slate-600 rounded-lg overflow-hidden">
    <div className="p-4 bg-slate-700/30">
      <div className="flex items-center gap-3">
        <Clock className="w-5 h-5 text-green-400" />
        <h4 className="text-md font-medium text-slate-300">Activity Duration</h4>
        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Required</span>
      </div>
      <p className="text-slate-400 text-sm mt-2">
        How long does this activity typically take? This will be used when scheduling.
      </p>
    </div>
    <div className="p-4 bg-slate-800/20 space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
          Duration (hours) *
          <Tooltip content="Typical duration for this activity including setup and travel time">
              <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded cursor-help">
              ⏱️
              </span>
          </Tooltip>
          </label>
          <input
            type="number"
            value={formData.duration_hours}
            onChange={(e) => handleFieldChange('duration_hours', e.target.value)}
            className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500"
            min="0.5"
            max="12"
            step="0.5"
            placeholder="e.g., 3.5"
          />
          <p className="text-slate-400 text-xs mt-1">
            Include travel time and activity time • Popular: 2-4 hours
          </p>
        </div>
      </div>
    </div>
  

  {/* Base Pricing & Capacity */}
  <div className="border border-slate-600 rounded-lg overflow-hidden">
    <div className="p-4 bg-slate-700/30">
      <div className="flex items-center gap-3">
        <DollarSign className="w-5 h-5 text-yellow-400" />
        <h4 className="text-md font-medium text-slate-300">Base Pricing & Capacity</h4>
        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Required</span>
      </div>
      <p className="text-slate-400 text-sm mt-2">
        Set your base price and maximum capacity. Pricing adjustments can be applied when scheduling.
      </p>
    </div>
    <div className="p-4 bg-slate-800/20 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Max Capacity *</label>
          <input
            type="number"
            value={formData.max_capacity}
            onChange={(e) => handleFieldChange('max_capacity', e.target.value)}
            className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500"
            min="1"
            max="50"
          />
          <p className="text-slate-400 text-xs mt-1">
            Keep group sizes manageable for better guest experience
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Available Spots</label>
          <input
            type="number"
            value={formData.available_spots}
            onChange={(e) => handleFieldChange('available_spots', e.target.value)}
            className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500"
            min="0"
            max={formData.max_capacity}
          />
        </div>
      </div>

      {/* Whale Watching Regulation Reminder */}
      {formData.tour_type === 'Whale Watching' && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-400 text-sm">
            <span>🐋</span>
            <span className="font-medium">Whale Watching Regulation Reminder</span>
          </div>
          <p className="text-slate-300 text-sm mt-1 ml-6">
            Maximum 8 guests per whale watching activity as per French Polynesia regulations
          </p>
        </div>
      )}

      {/* Base Pricing */}
      <div className="bg-slate-700/30 rounded-lg p-4">
        <div className="w-full">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                Base Price *
                <ContextualTooltip content="This is your standard price before any promotional discounts. Guests will see this as the original price">
                    <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded cursor-help hover:bg-slate-600 transition-colors">
                    💰
                    </span>
                </ContextualTooltip>
                </label>
            <input
              type="number"
              value={formData.original_price_adult}
              onChange={(e) => handleFieldChange('original_price_adult', e.target.value)}
              className="w-full p-3 bg-slate-600/50 border border-slate-500 rounded-lg text-white focus:border-blue-400"
              min="1000"
              step="100"
            />
            <p className="text-slate-400 text-xs mt-1">
              {formatPrice ? formatPrice(formData.original_price_adult) : `${formData.original_price_adult} XPF`} • Your revenue: {formatPrice ? formatPrice(Math.round(formData.original_price_adult * (1 - (operator?.commission_rate || 10) / 100))) : `${Math.round(formData.original_price_adult * (1 - (operator?.commission_rate || 10) / 100))} XPF`}
            </p>
            <p className="text-slate-500 text-xs mt-2 mb-2">
              💡 Pricing adjustments and promotions can be applied when scheduling activities
            </p>
          </div>

          {/* Child Pricing Configuration */}
          <div className="space-y-4 border-t border-slate-600 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-amber-400" />
              <h5 className="text-sm font-medium text-slate-300">Child Pricing</h5>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Child Age Definition */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Child Max Age  
                  <ContextualTooltip content="Ages 0 to this age pay child price. Activity participation limits are set by Min/Max Age fields above.">
                    <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded cursor-help hover:bg-slate-600 transition-colors ml-1">
                    💡
                    </span>
                  </ContextualTooltip>
                </label>
                <input
                  type="number"
                  value={formData.max_age_child}
                  onChange={(e) => handleFieldChange('max_age_child', e.target.value)}
                  className="w-full p-2 bg-slate-600/50 border border-slate-500 rounded-lg text-white focus:border-blue-400"
                  min="1"
                  max="17"
                />
                <p className="text-slate-400 text-xs mt-1">
                  Ages 0-{formData.max_age_child} pay child price
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Child Discount %
                  <ContextualTooltip content="Percentage discount for children from adult price (30% = child pays 70% of adult price)">
                    <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded cursor-help hover:bg-slate-600 transition-colors ml-1">
                    💡
                    </span>
                  </ContextualTooltip>
                </label>
                <input
                  type="number"
                  value={formData.discount_percentage_child}
                  onChange={(e) => handleFieldChange('discount_percentage_child', e.target.value)}
                  className="w-full p-2 bg-slate-600/50 border border-slate-500 rounded-lg text-white focus:border-blue-400"
                  min="0"
                  max="100"
                  step="5"
                />
                <p className="text-slate-400 text-xs mt-1">
                  Child Price: {formatPrice ? formatPrice(formData.discount_price_child) : `${formData.discount_price_child} XPF`}
                </p>
              </div>
            </div>

            <p className="text-slate-500 text-xs mt-2">
              💡 Child definition: Ages 0-{formData.max_age_child} pay {100 - formData.discount_percentage_child}% of adult price
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  {/* Location & Pickup - Required */}
  <div className="border border-slate-600 rounded-lg overflow-hidden">
    <div className="p-4 bg-slate-700/30">
      <div className="flex items-center gap-3">
        <MapPin className="w-5 h-5 text-red-400" />
        <h4 className="text-md font-medium text-slate-300">Location & Pickup</h4>
        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Required</span>
      </div>
    </div>
    <div className="p-4 bg-slate-800/20 space-y-4">
      {/* Island Location Selection */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
          Island Location *
          <ContextualTooltip content="Select the island where this activity takes place">
            <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded cursor-help hover:bg-slate-600 transition-colors">
              🏝️
            </span>
          </ContextualTooltip>
        </label>
        <select
          value={formData.location || ''}
          onChange={(e) => handleFieldChange('location', e.target.value)}
          className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white transition-colors ${
            validationErrors.location ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
          }`}
        >
          <option value="">Select an island...</option>
          {ISLAND_LOCATIONS.map(location => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
        {validationErrors.location && (
          <div className="flex items-center gap-2 mt-1">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{validationErrors.location}</p>
          </div>
        )}
        {!validationErrors.location && (
          <p className="text-slate-400 text-xs mt-1">
            This helps guests know where the activity is located
          </p>
        )}
      </div>

      {/* Meeting Point */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
          Meeting Point *
          <ContextualTooltip content="Where guests should meet for the activity start">
            <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded cursor-help hover:bg-slate-600 transition-colors">
              📍
            </span>
          </ContextualTooltip>
        </label>
        <input
          type="text"
          value={formData.meeting_point}
          onChange={(e) => handleFieldChange('meeting_point', e.target.value)}
          className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white transition-colors ${
            validationErrors.meeting_point ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
          }`}
          placeholder="e.g., Vaiare Ferry Terminal, Hotel InterContinental Lobby"
        />
        {validationErrors.meeting_point && (
          <div className="flex items-center gap-2 mt-1">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{validationErrors.meeting_point}</p>
          </div>
        )}
      </div>

      {/* Optional Pickup */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.pickup_available}
          onChange={(e) => handleFieldChange('pickup_available', e.target.checked)}
          className="w-4 h-4 rounded border-slate-600"
        />
        <span className="text-slate-300">Offer pickup service</span>
      </label>

      {formData.pickup_available && (
        <div className="ml-6 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add pickup location (e.g., Hotel Sofitel)"
              className="flex-1 p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (e.target.value.trim()) {
                    handleFieldChange('pickup_locations', [...formData.pickup_locations, e.target.value.trim()])
                    e.target.value = ''
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = e.target.parentElement.querySelector('input')
                if (input.value.trim()) {
                  handleFieldChange('pickup_locations', [...formData.pickup_locations, input.value.trim()])
                  input.value = ''
                }
              }}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
          {formData.pickup_locations?.length > 0 && (
            <div className="space-y-2">
              {formData.pickup_locations.map((location, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-600/30 rounded">
                  <span className="text-slate-200">{location}</span>
                  <button
                    type="button"
                    onClick={() => handlePickupLocationRemove(index)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  </div>

  {/* OPTIONAL SECTIONS - Toggleable */}

  <div className="bg-slate-700/30 rounded-lg p-4">
    <h4 className="text-white font-medium mb-2 flex items-center gap-2">
        <Settings className="w-5 h-5 text-slate-400" />
        Optional Sections
    </h4>
    <p className="text-slate-400 text-sm mb-4">
        Add more details to make your activity stand out and provide guests with complete information.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-600/20 transition-colors">
        <input
            type="checkbox"
            checked={showOptionalSections.inclusions}
            onChange={(e) => setShowOptionalSections(prev => ({...prev, inclusions: e.target.checked}))}
            className="w-4 h-4 rounded border-slate-600"
        />
        <div>
            <span className="text-slate-300 text-sm font-medium">What's Included</span>
            <p className="text-slate-400 text-xs">Equipment, food, drinks, and languages offered</p>
        </div>
        </label>
        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-600/20 transition-colors">
        <input
            type="checkbox"
            checked={showOptionalSections.requirements}
            onChange={(e) => setShowOptionalSections(prev => ({...prev, requirements: e.target.checked}))}
            className="w-4 h-4 rounded border-slate-600"
        />
        <div>
            <span className="text-slate-300 text-sm font-medium">Requirements & Restrictions</span>
            <p className="text-slate-400 text-xs">Fitness level, age limits, and special requirements</p>
        </div>
        </label>
        <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-600/20 transition-colors">
        <input
            type="checkbox"
            checked={showOptionalSections.compliance}
            onChange={(e) => setShowOptionalSections(prev => ({...prev, compliance: e.target.checked}))}
            className="w-4 h-4 rounded border-slate-600"
        />
        <div>
            <span className="text-slate-300 text-sm font-medium">Safety & Compliance</span>
            <p className="text-slate-400 text-xs">Weather dependency, regulations, and special notes</p>
        </div>
        </label>
    </div>
  </div>

  {/* Inclusions (Optional) */}
    {showOptionalSections.inclusions && (
      <div className="border border-slate-600 rounded-lg overflow-hidden">
        <div className="p-4 bg-slate-700/30">
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-pink-400" />
            <h4 className="text-md font-medium text-slate-300">What's Included</h4>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Optional</span>
          </div>
        </div>
        <div className="p-4 bg-slate-800/20 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.equipment_included}
                  onChange={(e) => handleFieldChange('equipment_included', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600"
                />
                <Camera className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300">Equipment & Gear</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.food_included}
                  onChange={(e) => handleFieldChange('food_included', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600"
                />
                <Utensils className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300">Food & Snacks</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.drinks_included}
                  onChange={(e) => handleFieldChange('drinks_included', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600"
                />
                <Waves className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300">Drinks & Refreshments</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Languages Offered</label>
              <div className="grid grid-cols-2 gap-2">
                {availableLanguages.map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageToggle(lang.code)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-sm transition-all ${
                      formData.languages?.includes(lang.code)
                        ? 'bg-green-500/20 border-green-500/50 text-green-300'
                        : 'bg-slate-700/30 border-slate-600 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Helpful Hint for Inclusions */}
          {(formData.equipment_included || formData.food_included || formData.drinks_included) && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/20 rounded-full p-2 flex-shrink-0">
                  <Info className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h6 className="text-blue-400 font-medium mb-2">Add specific details in your description!</h6>
                  <p className="text-slate-300 text-sm mb-2">
                    Consider mentioning specific items to set guest expectations:
                  </p>
                  <div className="text-slate-400 text-xs space-y-1">
                    {formData.equipment_included && (
                      <p>▶︎ What equipment: snorkeling gear, life jackets, waterproof bags, etc.</p>
                    )}
                    {formData.food_included && (
                      <p>▶︎ Food details: local fruits, sandwiches, traditional Polynesian snacks, etc.</p>
                    )}
                    {formData.drinks_included && (
                      <p>▶︎ Beverage types: fresh water, local fruit juices, coconut water, etc.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )}

  {/* Requirements (Optional) */}
    {showOptionalSections.requirements && (
      <div className="border border-slate-600 rounded-lg overflow-hidden">
        <div className="p-4 bg-slate-700/30">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-orange-400" />
            <h4 className="text-md font-medium text-slate-300">Requirements & Restrictions</h4>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Optional</span>
          </div>
        </div>
        <div className="p-4 bg-slate-800/20 space-y-6">
          {/* Clean organized layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Fitness Level</label>
              <select
                value={formData.fitness_level || 'easy'}
                onChange={(e) => handleFieldChange('fitness_level', e.target.value)}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500"
              >
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="challenging">Challenging</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Min Age</label>
              <input
                type="number"
                value={formData.min_age || ''}
                onChange={(e) => handleFieldChange('min_age', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                placeholder="No limit"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Max Age</label>
              <input
                type="number"
                value={formData.max_age || ''}
                onChange={(e) => handleFieldChange('max_age', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                placeholder="No limit"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Requirements</label>
              <textarea
                value={formData.requirements || ''}
                onChange={(e) => handleFieldChange('requirements', e.target.value)}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                rows="3"
                placeholder="What participants need to bring or know..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Restrictions</label>
              <textarea
                value={formData.restrictions || ''}
                onChange={(e) => handleFieldChange('restrictions', e.target.value)}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                rows="3"
                placeholder="Who cannot participate..."
              />
            </div>
          </div>
        </div>
      </div>
    )}

  {/* Safety & Compliance (Optional) */}
    {showOptionalSections.compliance && (
      <div className="border border-slate-600 rounded-lg overflow-hidden">
        <div className="p-4 bg-slate-700/30">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-400" />
            <h4 className="text-md font-medium text-slate-300">Safety & Compliance</h4>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Optional</span>
          </div>
        </div>
        <div className="p-4 bg-slate-800/20 space-y-6">
          {/* Whale Watching Specific */}
          {formData.tour_type === 'Whale Watching' && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h6 className="text-blue-400 font-medium mb-3">🐋 Whale Watching Compliance</h6>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.whale_regulation_compliant}
                    onChange={(e) => handleFieldChange('whale_regulation_compliant', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600"
                  />
                  <span className="text-slate-200">Compliant with French Polynesia whale watching regulations</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Max Group Size for Whale Watching</label>
                  <input
                    type="number"
                    value={formData.max_whale_group_size}
                    onChange={(e) => handleFieldChange('max_whale_group_size', e.target.value)}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                    min="1"
                    max="8"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Weather & Safety */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-3 mb-3">
                  <input
                  type="checkbox"
                  checked={formData.weather_dependent}
                  onChange={(e) => handleFieldChange('weather_dependent', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600"
                  />
                  <span className="text-slate-200">Weather dependent activity</span>
              </label>
              
              {/* CONDITIONAL: Only show backup plan if weather dependent */}
              {formData.weather_dependent && (
                  <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Backup Plan</label>
                  <textarea
                      value={formData.backup_plan || ''}
                      onChange={(e) => handleFieldChange('backup_plan', e.target.value)}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                      rows="3"
                      placeholder="What happens if weather doesn't cooperate?"
                  />
                  <p className="text-slate-400 text-xs mt-1">
                      Describe alternative plans or refund policy for weather cancellations
                  </p>
                  </div>
              )}
              </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Auto-close Booking Hours</label>
              <select
                value={formData.auto_close_hours}
                onChange={(e) => handleFieldChange('auto_close_hours', parseInt(e.target.value))}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 mb-4"
              >
                <option value={2}>2 hours before</option>
                <option value={4}>4 hours before</option>
                <option value={6}>6 hours before</option>
                <option value={8}>8 hours before</option>
              </select>

              <label className="block text-sm font-medium text-slate-300 mb-2">Special Notes</label>
              <textarea
                value={formData.special_notes || ''}
                onChange={(e) => handleFieldChange('special_notes', e.target.value)}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                rows="3"
                placeholder="Additional safety notes, special instructions, etc."
              />
            </div>
          </div>
        </div>
      </div>
    )}
</div>
            </div>
          </div>
        </form>

        {/* Fixed Footer */}
        <div className="bg-slate-700 px-6 py-4 border-t border-slate-600 flex items-center justify-between flex-shrink-0">
          <div className="text-sm text-slate-400">
            * Required fields
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="template-form"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? 'Saving...' : existingTemplate ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemplateCreateModal