import React, { useState } from 'react'
import { 
  Plus, Calendar, Clock, Users, MapPin,
  DollarSign, CheckCircle, AlertCircle,
  Save, X, Eye, EyeOff, Calculator, Percent, 
  Globe, Utensils, Camera, Heart, 
  Copy, RotateCcw, Info, 
  ChevronDown, ChevronUp, Waves, Edit2, Trash2,
  Filter, Search, Shield, Activity, Settings, FileText
} from 'lucide-react'

// Tooltip component 
const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [actualPosition, setActualPosition] = useState(position)
  const [tooltipStyle, setTooltipStyle] = useState({})

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    
    // Calculate available space in each direction
    const spaceTop = rect.top
    const spaceBottom = viewport.height - rect.bottom
    const spaceLeft = rect.left
    const spaceRight = viewport.width - rect.right
    
    let newPosition = position
    let style = {}
    
    // Determine best position based on available space
    if (position === 'top' && spaceTop < 120) {
      newPosition = spaceBottom > 120 ? 'bottom' : 'right'
    }
    if (position === 'bottom' && spaceBottom < 120) {
      newPosition = spaceTop > 120 ? 'top' : 'right'
    }
    if (position === 'left' && spaceLeft < 250) {
      newPosition = spaceRight > 250 ? 'right' : 'top'
    }
    if (position === 'right' && spaceRight < 250) {
      newPosition = spaceLeft > 250 ? 'left' : 'top'
    }
    
    // Adjust horizontal position for top/bottom tooltips to prevent edge cutoff
    if (newPosition === 'top' || newPosition === 'bottom') {
      const tooltipWidth = 280 // Approximate width
      const elementCenter = rect.left + rect.width / 2
      const tooltipLeft = elementCenter - tooltipWidth / 2
      
      if (tooltipLeft < 10) {
        style.left = '10px'
        style.transform = 'translateY(-100%)'
      } else if (tooltipLeft + tooltipWidth > viewport.width - 10) {
        style.right = '10px'
        style.transform = 'translateY(-100%)'
      }
    }
    
    setActualPosition(newPosition)
    setTooltipStyle(style)
    setIsVisible(true)
  }

  const getTooltipClasses = () => {
    const baseClasses = "absolute bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg z-[9999] max-w-[280px] min-w-[200px] whitespace-normal break-words"
    
    switch (actualPosition) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-1`
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 translate-y-2 mt-1`
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 -translate-x-2 mr-1`
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 translate-x-2 ml-1`
      default:
        return baseClasses
    }
  }

  const getArrowClasses = () => {
    const baseArrowClasses = "absolute w-0 h-0 border-solid z-[9999]"
    
    switch (actualPosition) {
      case 'top':
        return `${baseArrowClasses} top-full left-1/2 transform -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-900`
      case 'bottom':
        return `${baseArrowClasses} bottom-full left-1/2 transform -translate-x-1/2 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-gray-900`
      case 'left':
        return `${baseArrowClasses} left-full top-1/2 transform -translate-y-1/2 border-t-[6px] border-b-[6px] border-l-[6px] border-t-transparent border-b-transparent border-l-gray-900`
      case 'right':
        return `${baseArrowClasses} right-full top-1/2 transform -translate-y-1/2 border-t-[6px] border-b-[6px] border-r-[6px] border-t-transparent border-b-transparent border-r-gray-900`
      default:
        return ''
    }
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div 
          className={getTooltipClasses()}
          style={tooltipStyle}
        >
          {content}
          <div className={getArrowClasses()}></div>
        </div>
      )}
    </div>
  )
}


// NEW: Preview Modal Component
const PreviewModal = ({ isOpen, onClose, formData, tourTypes, availableLanguages, formatPrice }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Tourist View Preview</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          {/* Mock tour card preview */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-4 border border-slate-600">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {tourTypes.find(t => t.value === formData.tour_type)?.icon || '🎯'}
                </span>
                <span className="text-xs text-slate-400 uppercase tracking-wide">
                  {formData.tour_type}
                </span>
              </div>
              <div className="text-right">
                {formData.discount_percentage > 0 && (
                  <div className="text-xs text-slate-400 line-through">
                    {formatPrice(formData.original_price_adult)}
                  </div>
                )}
                <div className="text-green-400 font-bold">
                  {formatPrice(formData.discount_price_adult)}
                </div>
                {formData.discount_percentage > 0 && (
                  <div className="text-xs text-orange-400">
                    -{formData.discount_percentage}% OFF
                  </div>
                )}
              </div>
            </div>
            
            <h5 className="text-white font-semibold mb-2 line-clamp-2">
              {formData.tour_name || 'Tour Name'}
            </h5>
            
            <p className="text-slate-300 text-sm mb-3 line-clamp-3">
              {formData.description || 'Tour description will appear here...'}
            </p>
            
            <div className="space-y-2 text-xs text-slate-400 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                {formData.tour_date ? new Date(formData.tour_date).toLocaleDateString() : 'Date TBD'}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                {formData.time_slot} • {formData.duration_hours}h
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3" />
                {formData.available_spots}/{formData.max_capacity} spots
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                {formData.meeting_point || 'Meeting point TBD'}
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3" />
                Fitness: {formData.fitness_level?.charAt(0).toUpperCase() + formData.fitness_level?.slice(1) || 'Easy'}
                {(formData.min_age || formData.max_age) && (
                  <span className="text-slate-400">
                    • Age: {formData.min_age || '0'}-{formData.max_age || '∞'}
                  </span>
                )}
              </div>
            </div>
            
            {/* Inclusions badges */}
            <div className="flex flex-wrap gap-1 mb-3">
              {formData.equipment_included && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">Equipment</span>
              )}
              {formData.food_included && (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Food</span>
              )}
              {formData.drinks_included && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">Drinks</span>
              )}
              {formData.pickup_available && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">Pickup</span>
              )}
            </div>
            
            {/* Languages */}
            {formData.languages && formData.languages.length > 0 && (
              <div className="flex gap-1 mb-3">
                {formData.languages.slice(0, 4).map(lang => (
                  <span key={lang} className="text-sm">
                    {availableLanguages.find(l => l.code === lang)?.flag}
                  </span>
                ))}
                {formData.languages.length > 4 && (
                  <span className="text-xs text-slate-400">+{formData.languages.length - 4}</span>
                )}
              </div>
            )}
            
            <div className="pt-3 border-t border-slate-600">
              <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg font-medium">
                Book Now
              </button>
            </div>
          </div>

          {/* Form Status */}
          <div className="mt-4 p-3 rounded-lg bg-slate-700/30">
            <h6 className="text-white text-sm font-medium mb-2">Form Completion</h6>
            <div className="space-y-1 text-xs">
              <div className={`flex items-center gap-2 ${formData.tour_name ? 'text-green-400' : 'text-red-400'}`}>
                {formData.tour_name ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                Tour name {formData.tour_name ? 'set' : 'missing'}
              </div>
              <div className={`flex items-center gap-2 ${formData.description ? 'text-green-400' : 'text-red-400'}`}>
                {formData.description ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                Description {formData.description ? 'provided' : 'missing'}
              </div>
              <div className={`flex items-center gap-2 ${formData.tour_date ? 'text-green-400' : 'text-red-400'}`}>
                {formData.tour_date ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                Date {formData.tour_date ? 'selected' : 'missing'}
              </div>
              <div className={`flex items-center gap-2 ${formData.meeting_point ? 'text-green-400' : 'text-red-400'}`}>
                {formData.meeting_point ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                Meeting point {formData.meeting_point ? 'set' : 'missing'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Logic for editing tours (keep existing)
const canEditTour = (tour) => {
  if (tour.status === 'cancelled') return false
  const tourDateTime = new Date(`${tour.tour_date}T${tour.time_slot}:00`)
  const now = new Date()
  const isPastTour = tourDateTime < now
  if (isPastTour) return false
  const hoursUntilTour = (tourDateTime - now) / (1000 * 60 * 60)
  if (hoursUntilTour < 24) return false
  const hasBookings = tour.available_spots < tour.max_capacity
  if (hasBookings) return false
  return true
}

const CreateTab = ({ 
  showForm,
  setShowForm,
  editingTour,
  setEditingTour,
  formData,
  setFormData,
  operator,
  handleSubmit,
  loading,
  handleDelete,
  showPreview,
  setShowPreview,
  resetForm,
  toggleSection,
  expandedSections,
  handleInputChange,
  validationErrors,
  tourTypes,
  getQuickDates,
  timeSlots,
  formatPrice,
  handlePickupLocationAdd,
  handlePickupLocationRemove,
  availableLanguages,
  handleLanguageToggle,
  handleDuplicate,
  validateForm,
  tours,
  handleEdit,
  getTodayInPolynesia
}) => {

  // NEW: State for optional sections
  const [showOptionalSections, setShowOptionalSections] = useState({
    location: false,
    inclusions: false,
    requirements: false,
    compliance: false
  })

  const handleFieldChange = (field, value) => {
    let processedValue = value
    const numericFields = ['max_capacity', 'available_spots', 'original_price_adult', 'discount_price_adult', 'duration_hours', 'min_age', 'max_age']
    
    if (numericFields.includes(field)) {
      if (value === '' || value === null || value === undefined) {
        processedValue = ''
      } else {
        const numValue = Number(value)
        if (!isNaN(numValue)) {
          processedValue = numValue
        } else {
          processedValue = ''
        }
      }
    }
    
    handleInputChange(field, processedValue)
    
    if (validationErrors[field]) {
      setTimeout(() => {
        if (validateForm) {
          validateForm(field)
        }
      }, 300)
    }
  }

  // Tour management state (keep existing)
  const [tourFilter, setTourFilter] = useState('all')
  const [tourSearch, setTourSearch] = useState('')

  const filteredTours = tours.filter(tour => {
    const matchesFilter = 
      tourFilter === 'all' || 
      (tourFilter === 'upcoming' && new Date(tour.tour_date) >= new Date()) ||
      (tourFilter === 'past' && new Date(tour.tour_date) < new Date())
    
    const matchesSearch = !tourSearch || 
      tour.tour_name.toLowerCase().includes(tourSearch.toLowerCase()) ||
      tour.tour_type.toLowerCase().includes(tourSearch.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Preview Modal */}
      <PreviewModal 
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        formData={formData}
        tourTypes={tourTypes}
        availableLanguages={availableLanguages}
        formatPrice={formatPrice}
      />

      {/* Create Tab Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Create & Manage Tours</h2>
          <p className="text-slate-400">Create new tours or manage your existing ones</p>
        </div>
        <div className="flex gap-3">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Start Creating Tour
            </button>
          )}
        </div>
      </div>

      {/* Tour Creation Form */}
      {showForm ? (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
          {/* Form Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700">
            <div>
              <h3 className="text-xl font-semibold text-white">
                {editingTour ? 'Edit Tour' : 'Create New Tour'}
              </h3>
              <p className="text-slate-400 mt-1">
                {editingTour ? 'Update your existing tour details' : 'Set up a new tour experience for travelers'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              <button
                onClick={resetForm}
                className="text-slate-400 hover:text-white transition-colors p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* SINGLE COLUMN FORM */}
          <form onSubmit={handleSubmit} className="p-6">
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
                        Tour Name *
                        <Tooltip content="Make it catchy! That's in the spotlight!">
                            <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded cursor-help">
                            💡
                            </span>
                        </Tooltip>
                        </label>
                      <input
                        type="text"
                        value={formData.tour_name}
                        onChange={(e) => handleFieldChange('tour_name', e.target.value)}
                        className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white transition-colors ${
                            validationErrors.tour_name ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
                        }`}
                        placeholder="e.g., Morning Whale Watching Adventure"
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
                        <label className="block text-sm font-medium text-slate-300 mb-2">Tour Type</label>
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
                            Select the category that best describes your tour experience
                        </p>
                        </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 transition-colors ${
                        validationErrors.description ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
                      }`}
                      rows="4"
                      placeholder="Describe your tour experience in detail. What makes it special? What will participants see and do?"
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

              {/* Schedule & Duration */}
              <div className="border border-slate-600 rounded-lg overflow-hidden">
                <div className="p-4 bg-slate-700/30">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-400" />
                    <h4 className="text-md font-medium text-slate-300">Schedule & Duration</h4>
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Required</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-800/20 space-y-4">
                  {/* Quick Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Quick Date Selection</label>
                    <div className="grid grid-cols-3 lg:grid-cols-7 gap-2 mb-4">
                      {getQuickDates().map(({ date, label }) => (
                        <button
                          key={date}
                          type="button"
                          onClick={() => handleFieldChange('tour_date', date)}
                          className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                            formData.tour_date === date
                              ? 'bg-blue-500 border-blue-500 text-white'
                              : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Custom Date *</label>
                      <input
                        type="date"
                        value={formData.tour_date}
                        onChange={(e) => handleFieldChange('tour_date', e.target.value)}
                        min={getTodayInPolynesia()}
                        className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white transition-colors ${
                          validationErrors.tour_date ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
                        }`}
                      />
                      {validationErrors.tour_date && (
                        <div className="flex items-center gap-2 mt-1">
                          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                          <p className="text-red-400 text-sm">{validationErrors.tour_date}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Time Slot *</label>
                      <select
                        value={formData.time_slot}
                        onChange={(e) => handleFieldChange('time_slot', e.target.value)}
                        className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                      >
                        {timeSlots.map(slot => (
                          <option key={slot.value} value={slot.value}>
                            {slot.label} {slot.popular ? '⭐' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                        Duration (hours)
                        <Tooltip content="Include travel time to/from activity location. Half-day tours: 3-4h, Full-day: 6-8h">
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
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Strategy */}
              <div className="border border-slate-600 rounded-lg overflow-hidden">
                <div className="p-4 bg-slate-700/30">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-yellow-400" />
                    <h4 className="text-md font-medium text-slate-300">Pricing & Capacity</h4>
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Required</span>
                  </div>
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

                  {/* Simplified Pricing */}
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                            Regular Price (Adult) *
                            <Tooltip content="Set your standard price. Only values ending in 00 allowed (e.g., 5600, 7200, 8500)">
                                <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded cursor-help">
                                💰
                                </span>
                            </Tooltip>
                            </label>
                        <input
                          type="number"
                          value={formData.original_price_adult}
                          onChange={(e) => handleFieldChange('original_price_adult', e.target.value)}
                          className="w-full p-3 bg-slate-600/50 border border-slate-500 rounded-lg text-white focus:border-blue-400"
                          min="1000"
                          step="100"
                        />
                        <p className="text-slate-400 text-xs mt-1">{formatPrice(formData.original_price_adult)}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Discount %</label>
                        <input
                          type="range"
                          min="0"
                          max="60"
                          step="5"
                          value={formData.discount_percentage}
                          onChange={(e) => handleFieldChange('discount_percentage', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-center text-white font-medium">{formData.discount_percentage}%</div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Final Price</label>
                        <div className="p-3 bg-slate-600/30 rounded-lg">
                          <div className="text-green-400 font-bold text-lg">{formatPrice(formData.discount_price_adult)}</div>
                          <div className="text-slate-400 text-xs">Your revenue: {formatPrice(Math.round(formData.discount_price_adult * (1 - (operator?.commission_rate || 10) / 100)))}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    Meeting Point *
                    <Tooltip content="Be specific! Include known places for easy finding. Examples: 'Vaiare Ferry Terminal - Main Entrance'">
                        <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded cursor-help">
                        📍
                        </span>
                    </Tooltip>
                    </label>
                    <input
                      type="text"
                      value={formData.meeting_point}
                      onChange={(e) => handleFieldChange('meeting_point', e.target.value)}
                      className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white transition-colors ${
                        validationErrors.meeting_point ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
                      }`}
                      placeholder="e.g., Vaiare Ferry Terminal - Main Entrance"
                    />
                    {validationErrors.meeting_point && (
                      <div className="flex items-center gap-2 mt-1">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <p className="text-red-400 text-sm">{validationErrors.meeting_point}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* OPTIONAL SECTIONS - Toggleable */}

              <div className="bg-slate-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-400" />
                    Optional Settings
                </h4>
                <p className="text-slate-400 text-sm mb-4">
                    Add these sections to provide more detailed information about your tour
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-600/20 transition-colors">
                    <input
                        type="checkbox"
                        checked={showOptionalSections.location}
                        onChange={(e) => setShowOptionalSections(prev => ({...prev, location: e.target.checked}))}
                        className="w-4 h-4 rounded border-slate-600"
                    />
                    <div>
                        <span className="text-slate-300 text-sm font-medium">Location & Pickup</span>
                        <p className="text-slate-400 text-xs">Pickup locations and meeting details</p>
                    </div>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-600/20 transition-colors">
                    <input
                        type="checkbox"
                        checked={showOptionalSections.inclusions}
                        onChange={(e) => setShowOptionalSections(prev => ({...prev, inclusions: e.target.checked}))}
                        className="w-4 h-4 rounded border-slate-600"
                    />
                    <div>
                        <span className="text-slate-300 text-sm font-medium">What's Included</span>
                        <p className="text-slate-400 text-xs">Equipment, food, drinks, languages</p>
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
                        <span className="text-slate-300 text-sm font-medium">Requirements</span>
                        <p className="text-slate-400 text-xs">Fitness level, age limits, restrictions</p>
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
                        <p className="text-slate-400 text-xs">Weather plans, regulations, special notes</p>
                    </div>
                    </label>
                </div>
                </div>

              {/* Location & Pickup (Optional) */}
              {showOptionalSections.location && (
                <div className="border border-slate-600 rounded-lg overflow-hidden">
                  <div className="p-4 bg-slate-700/30">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-red-400" />
                      <h4 className="text-md font-medium text-slate-300">Location & Pickup</h4>
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Optional</span>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-800/20 space-y-4">
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
                            placeholder="Add pickup location..."
                            className="flex-1 p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handlePickupLocationAdd(e.target.value)
                                e.target.value = ''
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = e.target.parentElement.querySelector('input')
                              handlePickupLocationAdd(input.value)
                              input.value = ''
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
              )}

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
                          <span className="text-slate-300">Equipment Included</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.food_included}
                            onChange={(e) => handleFieldChange('food_included', e.target.checked)}
                            className="w-4 h-4 rounded border-slate-600"
                          />
                          <Utensils className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-300">Food Included</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.drinks_included}
                            onChange={(e) => handleFieldChange('drinks_included', e.target.checked)}
                            className="w-4 h-4 rounded border-slate-600"
                          />
                          <Waves className="w-5 h-5 text-slate-400" />
                          <span className="text-slate-300">Drinks Included</span>
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
                          <option value="easy">Easy - Everyone</option>
                          <option value="moderate">Moderate - Some activity</option>
                          <option value="challenging">Challenging - Good fitness</option>
                          <option value="expert">Expert - Excellent fitness</option>
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
                          placeholder="Safety restrictions and limitations..."
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
                            <span className="text-slate-200">French Polynesia regulations compliant</span>
                          </label>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Max Group Size</label>
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
                                placeholder="What happens if weather prevents the tour?"
                            />
                            <p className="text-slate-400 text-xs mt-1">
                                Describe alternative activities or refund policy for bad weather
                            </p>
                            </div>
                        )}
                        </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Auto-Close Hours</label>
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
                          placeholder="Additional information for customers..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-700">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                  {editingTour && (
                    <button
                      type="button"
                      onClick={() => handleDuplicate(editingTour)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Duplicate
                    </button>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {editingTour ? 'Update Tour' : 'Create Tour'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* Tour Management Section (keep existing) */
        <div className="space-y-6">
          {/* Quick Tour Templates */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Start Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setFormData({
                    ...formData,
                    tour_type: 'Whale Watching',
                    tour_name: 'Whale Watching Experience',
                    duration_hours: 3,
                    whale_regulation_compliant: true
                  })
                  setShowForm(true)
                }}
                className="p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors text-left"
              >
                <div className="text-2xl mb-2">🐋</div>
                <h4 className="text-white font-medium">Whale Watching</h4>
                <p className="text-slate-400 text-sm">3-hour certified experience</p>
              </button>
              
              <button
                onClick={() => {
                  setFormData({
                    ...formData,
                    tour_type: 'Lagoon Tour',
                    tour_name: 'Lagoon Discovery',
                    duration_hours: 4
                  })
                  setShowForm(true)
                }}
                className="p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors text-left"
              >
                <div className="text-2xl mb-2">🏝️</div>
                <h4 className="text-white font-medium">Lagoon Tour</h4>
                <p className="text-slate-400 text-sm">4-hour island exploration</p>
              </button>
              
              <button
                onClick={() => {
                  setFormData({
                    ...formData,
                    tour_type: 'Cultural',
                    tour_name: 'Sunset Cruise',
                    duration_hours: 2.5
                  })
                  setShowForm(true)
                }}
                className="p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors text-left"
              >
                <div className="text-2xl mb-2">🌅</div>
                <h4 className="text-white font-medium">Sunset Tour</h4>
                <p className="text-slate-400 text-sm">2.5-hour romantic cruise</p>
              </button>
            </div>
          </div>

          {/* Tour Management (keep existing tours list) */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Your Tours</h3>
                  <p className="text-slate-400 text-sm">Manage and edit your existing tours</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{tours.length}</div>
                  <div className="text-slate-400 text-sm">Total Tours</div>
                </div>
              </div>

              {/* Filter and Search */}
              <div className="flex gap-4 mb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setTourFilter('all')}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      tourFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    All ({tours.length})
                  </button>
                  <button
                    onClick={() => setTourFilter('upcoming')}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      tourFilter === 'upcoming' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Upcoming ({tours.filter(t => new Date(t.tour_date) >= new Date()).length})
                  </button>
                  <button
                    onClick={() => setTourFilter('past')}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      tourFilter === 'past' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Past ({tours.filter(t => new Date(t.tour_date) < new Date()).length})
                  </button>
                </div>
                
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search tours..."
                      value={tourSearch}
                      onChange={(e) => setTourSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tours List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredTours.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-slate-400 mb-2">No tours found</div>
                  <button
                    onClick={() => setShowForm(true)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Create your first tour
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-700">
                  {filteredTours.map((tour) => {
                    const bookedSpots = tour.max_capacity - tour.available_spots
                    const occupancyRate = Math.round((bookedSpots / tour.max_capacity) * 100)
                    const isUpcoming = new Date(tour.tour_date) >= new Date()
                    
                    return (
                      <div key={tour.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-lg">
                                {tourTypes.find(t => t.value === tour.tour_type)?.icon || '🎯'}
                              </span>
                              <div>
                                <h4 className="text-white font-medium">{tour.tour_name}</h4>
                                <p className="text-slate-400 text-sm">
                                  {new Date(tour.tour_date).toLocaleDateString()} • {tour.time_slot} • {tour.duration_hours}h
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-slate-400" />
                                <span className="text-slate-300">{bookedSpots}/{tour.max_capacity}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-slate-400" />
                                <span className="text-slate-300">{formatPrice(tour.discount_price_adult)}</span>
                              </div>
                              <div className={`px-2 py-1 rounded text-xs ${
                                isUpcoming ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
                              }`}>
                                {isUpcoming ? 'Upcoming' : 'Completed'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              occupancyRate >= 90 ? 'bg-red-500/20 text-red-400' :
                              occupancyRate >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                              occupancyRate >= 40 ? 'bg-blue-500/20 text-blue-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {occupancyRate}%
                            </div>
                            
                            <div className="flex gap-1">
                              <Tooltip content="Duplicate this tour">
                                <button
                                  onClick={() => handleDuplicate(tour)}
                                  className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                              </Tooltip>
                              
                              {canEditTour(tour) ? (
                                <Tooltip content="Edit tour">
                                  <button 
                                    onClick={() => handleEdit(tour)} 
                                    className="p-2 text-slate-400 hover:text-green-400 transition-colors"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                </Tooltip>
                              ) : (
                                <Tooltip content={`Cannot edit: ${
                                  tour.status === 'cancelled' ? 'Tour cancelled' :
                                  new Date(`${tour.tour_date}T${tour.time_slot}:00`) < new Date() ? 'Tour completed' :
                                  (new Date(`${tour.tour_date}T${tour.time_slot}:00`) - new Date()) / (1000 * 60 * 60) < 24 ? 'Within 24h of tour' :
                                  'Has bookings'
                                }`}>
                                  <span className="p-2 text-slate-400 opacity-50 cursor-not-allowed inline-block">
                                    <Edit2 className="w-4 h-4" />
                                  </span>
                                </Tooltip>
                              )}
                              
                              {isUpcoming && (
                                <Tooltip content="Delete tour">
                                  <button
                                    onClick={() => handleDelete(tour.id)}
                                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateTab