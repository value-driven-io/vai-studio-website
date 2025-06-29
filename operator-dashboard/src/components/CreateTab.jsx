import React, { useState } from 'react'
import { 
  Plus, Calendar, Clock, Users, MapPin,
  DollarSign, CheckCircle, AlertCircle,
  Save, X, Eye, EyeOff, Calculator, Percent, 
  Globe, Utensils, Camera, Heart, 
  Copy, RotateCcw, Info, 
  ChevronDown, ChevronUp, Waves, Edit2, Trash2,
  Filter, Search
} from 'lucide-react'

// Logic for editing tours
const canEditTour = (tour) => {
  // Cannot edit cancelled tours
  if (tour.status === 'cancelled') return false
  
  // Cannot edit past tours
  const tourDateTime = new Date(`${tour.tour_date}T${tour.time_slot}:00`)
  const now = new Date()
  const isPastTour = tourDateTime < now
  if (isPastTour) return false
  
  // GRACE PERIOD: Cannot edit if tour is within 24 hours
  const hoursUntilTour = (tourDateTime - now) / (1000 * 60 * 60)
  if (hoursUntilTour < 24) return false
  
  // Cannot edit if tour has bookings (available_spots < max_capacity means bookings exist)
  const hasBookings = tour.available_spots < tour.max_capacity
  if (hasBookings) return false
  
  return true
}

// FIXED: Add proper Tooltip component
const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [actualPosition, setActualPosition] = useState(position)

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    
    let newPosition = position
    if (position === 'top' && rect.top < 100) newPosition = 'bottom'
    if (position === 'bottom' && rect.bottom > viewport.height - 100) newPosition = 'top'
    if (position === 'left' && rect.left < 200) newPosition = 'right'
    if (position === 'right' && rect.right > viewport.width - 200) newPosition = 'left'
    
    setActualPosition(newPosition)
    setIsVisible(true)
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
        <div className={`absolute z-50 px-3 py-2 text-sm bg-slate-900 text-slate-200 rounded-lg border border-slate-600 shadow-lg whitespace-nowrap max-w-xs ${
          actualPosition === 'top' ? 'bottom-full mb-2 left-1/2 transform -translate-x-1/2' :
          actualPosition === 'bottom' ? 'top-full mt-2 left-1/2 transform -translate-x-1/2' :
          actualPosition === 'left' ? 'right-full mr-2 top-1/2 transform -translate-y-1/2' :
          'left-full ml-2 top-1/2 transform -translate-y-1/2'
        }`}>
          {content}
          <div className={`absolute w-2 h-2 bg-slate-900 border-r border-b border-slate-600 transform rotate-45 ${
            actualPosition === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
            actualPosition === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
            actualPosition === 'left' ? 'top-1/2 right-full -translate-y-1/2 -mr-1' :
            'top-1/2 left-full -translate-y-1/2 -ml-1'
          }`}></div>
        </div>
      )}
    </div>
  )
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

  // FIXED: Enhanced input change handler with real-time validation

    const handleFieldChange = (field, value) => {
    // Properly handle numeric inputs to prevent NaN
    let processedValue = value
    
    // Handle numeric fields specifically
    const numericFields = ['max_capacity', 'available_spots', 'original_price_adult', 'discount_price_adult', 'duration_hours', 'min_age', 'max_age']
    
    if (numericFields.includes(field)) {
        // Convert to number, but handle empty/invalid values
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
    
    // Call the parent handleInputChange with processed value
    handleInputChange(field, processedValue)
    
    // For date field, validate immediately without delay
    if (field === 'tour_date') {
        if (processedValue && validationErrors.tour_date) {
        setTimeout(() => {
            if (validateForm) {
            validateForm(field)
            }
        }, 100)
        }
    } else {
        // Other fields use normal delay
        setTimeout(() => {
        if (validateForm) {
            validateForm(field)
        }
        }, 300)
    }
    }

  // NEW: State for tour management
  const [tourFilter, setTourFilter] = useState('all') // 'all', 'upcoming', 'past'
  const [tourSearch, setTourSearch] = useState('')

  // NEW: Filter tours based on filter and search
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
                {showPreview ? 'Hide Preview' : 'Preview'}
              </button>
              <button
                onClick={resetForm}
                className="text-slate-400 hover:text-white transition-colors p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* CREATE FORM */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form Content */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Basic Information Section */}
                <div className="border border-slate-600 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('basic')}
                    className="w-full flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-blue-400" />
                      <h4 className="text-md font-medium text-slate-300">Basic Information</h4>
                    </div>
                    {expandedSections.basic ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  {expandedSections.basic && (
                    <div className="p-4 bg-slate-800/20 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                            Tour Name *
                            <Tooltip content="Make it catchy! Examples: 'Sunset Whale Watching', 'Secret Lagoon Snorkel Adventure'">
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
                          {validationErrors.tour_name && (
                            <div className="flex items-center gap-2 mt-1">
                              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                              <p className="text-red-400 text-sm">{validationErrors.tour_name}</p>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Tour Type
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {tourTypes.map(type => (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => handleFieldChange('tour_type', type.value)}
                                className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                                  formData.tour_type === type.value
                                    ? `${type.color} border-transparent text-white`
                                    : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500'
                                }`}
                              >
                                <span className="text-lg">{type.icon}</span>
                                <span className="text-sm font-medium">{type.value}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Description *
                        </label>
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
                          {formData.description.length}/500 characters
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Schedule & Duration Section */}
                <div className="border border-slate-600 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('schedule')}
                    className="w-full flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-green-400" />
                      <h4 className="text-md font-medium text-slate-300">Schedule & Duration</h4>
                    </div>
                    {expandedSections.schedule ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  {expandedSections.schedule && (
                    <div className="p-4 bg-slate-800/20 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Quick Date Selection
                        </label>
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
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Custom Date *
                          </label>
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
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Time Slot *
                          </label>
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
                            className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white transition-colors ${
                              validationErrors.duration_hours ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
                            }`}
                            min="0.5"
                            max="12"
                            step="0.5"
                            placeholder="e.g., 3.5"
                          />
                          {validationErrors.duration_hours && (
                            <div className="flex items-center gap-2 mt-1">
                              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                              <p className="text-red-400 text-sm">{validationErrors.duration_hours}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing Strategy Section */}
                <div className="border border-slate-600 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('pricing')}
                    className="w-full flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-yellow-400" />
                      <h4 className="text-md font-medium text-slate-300">Pricing Strategy</h4>
                    </div>
                    {expandedSections.pricing ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  {expandedSections.pricing && (
                    <div className="p-4 bg-slate-800/20 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Max Capacity *
                          </label>
                          <input
                            type="number"
                            value={formData.max_capacity}
                            onChange={(e) => handleFieldChange('max_capacity', e.target.value)}
                            className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white transition-colors ${
                              validationErrors.max_capacity ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
                            }`}
                            min="1"
                            max="50"
                          />
                          {validationErrors.max_capacity && (
                            <div className="flex items-center gap-2 mt-1">
                              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                              <p className="text-red-400 text-sm">{validationErrors.max_capacity}</p>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Available Spots
                          </label>
                          <input
                            type="number"
                            value={formData.available_spots}
                            onChange={(e) => handleFieldChange('available_spots', e.target.value)}
                            className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                            min="0"
                            max={formData.max_capacity}
                          />
                          <p className="text-slate-400 text-sm mt-1">
                            Spots available for this specific tour instance
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-700/30 rounded-lg p-4">
                        <h5 className="text-white font-medium mb-3 flex items-center gap-2">
                          <Calculator className="w-4 h-4" />
                          Smart Pricing Calculator
                        </h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Regular Price (Adult) *
                            </label>
                            <input
                              type="number"
                              value={formData.original_price_adult}
                              onChange={(e) => handleFieldChange('original_price_adult', e.target.value)}
                              className={`w-full p-3 bg-slate-600/50 border rounded-lg text-white transition-colors ${
                                validationErrors.original_price_adult ? 'border-red-500' : 'border-slate-500 focus:border-blue-400'
                              }`}
                              min="1000"
                              step="100"
                              placeholder="e.g., 5600, 7200, 8500"
                            />
                            <p className="text-slate-400 text-xs mt-1">{formatPrice(formData.original_price_adult)}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              💡 Only values ending in 00 allowed (e.g., 5600, 7200, 8500)
                            </p>
                            {validationErrors.original_price_adult && (
                              <div className="flex items-center gap-2 mt-1">
                                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                <p className="text-red-400 text-sm">{validationErrors.original_price_adult}</p>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Discount %
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="0"
                                max="60"
                                step="5"
                                value={formData.discount_percentage}
                                onChange={(e) => handleFieldChange('discount_percentage', parseInt(e.target.value))}
                                className="flex-1"
                              />
                              <span className="text-white font-medium w-12 text-center">
                                {formData.discount_percentage}%
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Percent className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-300 text-sm">
                                {formData.discount_percentage === 0 ? 'No discount (Regular price)' :
                                formData.discount_percentage < 20 ? 'Conservative discount' : 
                                formData.discount_percentage < 35 ? 'Moderate discount' : 
                                formData.discount_percentage < 50 ? 'Aggressive discount' : 'Deep discount'}
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              {formData.discount_percentage === 0 ? 'Final Price (Adult) *' : 'Discount Price (Adult) *'}
                            </label>
                            <input
                              type="number"
                              value={formData.discount_price_adult}
                              onChange={(e) => handleFieldChange('discount_price_adult', parseInt(e.target.value))}
                              className={`w-full p-3 bg-slate-600/50 border rounded-lg text-white transition-colors ${
                                validationErrors.discount_price_adult ? 'border-red-500' : 'border-slate-500 focus:border-blue-400'
                              }`}
                              min="500"
                              step="100"
                            />
                            <p className="text-slate-400 text-xs mt-1">{formatPrice(formData.discount_price_adult)}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              💡 Prices automatically rounded up to nearest 100 XPF for professional appearance
                            </p>
                            {validationErrors.discount_price_adult && (
                              <div className="flex items-center gap-2 mt-1">
                                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                <p className="text-red-400 text-sm">{validationErrors.discount_price_adult}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-slate-600/30 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-300">Child Price (Auto-calculated):</span>
                            <span className="text-green-400 font-medium">{formatPrice(formData.discount_price_child)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-slate-300">Your Revenue (per adult, after {operator?.commission_rate || 10}% commission):</span>
                            <span className="text-blue-400 font-medium">
                              {formatPrice(Math.round(formData.discount_price_adult * (1 - (operator?.commission_rate || 10) / 100)))}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-slate-300">Potential Revenue (if full):</span>
                            <span className="text-purple-400 font-medium">
                              {formatPrice(Math.round(
                                formData.discount_price_adult * (1 - (operator?.commission_rate || 10) / 100) * formData.max_capacity
                              ))}
                            </span>
                          </div>
                          {formData.discount_percentage === 0 && (
                            <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded">
                              <p className="text-blue-300 text-xs">
                                💡 No discount applied - showing regular pricing
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location & Pickup Section */}
                <div className="border border-slate-600 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('location')}
                    className="w-full flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-red-400" />
                      <h4 className="text-md font-medium text-slate-300">Location & Pickup</h4>
                    </div>
                    {expandedSections.location ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  {expandedSections.location && (
                    <div className="p-4 bg-slate-800/20 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                          Meeting Point *
                          <Tooltip content="Be specific! Include GPS coordinates or hotel names for easy finding">
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
                          placeholder="e.g., Vaiare Ferry Terminal - Main Entrance, or InterContinental Thalasso Spa Dock"
                        />
                        {validationErrors.meeting_point && (
                          <div className="flex items-center gap-2 mt-1">
                            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                            <p className="text-red-400 text-sm">{validationErrors.meeting_point}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center gap-2 mb-3">
                          <input
                            type="checkbox"
                            checked={formData.pickup_available}
                            onChange={(e) => handleFieldChange('pickup_available', e.target.checked)}
                            className="w-4 h-4 rounded border-slate-600"
                          />
                          <span className="text-sm text-slate-300 font-medium">Offer pickup service</span>
                        </label>

                        {formData.pickup_available && (
                          <div className="space-y-3 pl-6 border-l-2 border-blue-500/30">
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Pickup Locations
                              </label>
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
                            </div>

                            {formData.pickup_locations.length > 0 && (
                              <div>
                                <h6 className="text-sm font-medium text-slate-300 mb-2">Current Pickup Locations:</h6>
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
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Inclusions & Services Section */}
                <div className="border border-slate-600 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('inclusions')}
                    className="w-full flex items-center justify-between p-4 bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-pink-400" />
                      <h4 className="text-md font-medium text-slate-300">Inclusions & Services</h4>
                    </div>
                    {expandedSections.inclusions ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  {expandedSections.inclusions && (
                    <div className="p-4 bg-slate-800/20 space-y-4">
                      <div>
                        <h6 className="text-sm font-medium text-slate-300 mb-3">What's Included</h6>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <label className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.equipment_included}
                              onChange={(e) => handleFieldChange('equipment_included', e.target.checked)}
                              className="w-4 h-4 rounded border-slate-600"
                            />
                            <Camera className="w-5 h-5 text-slate-400" />
                            <span className="text-slate-300">Equipment Included</span>
                          </label>

                          <label className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                            <input
                              type="checkbox"
                              checked={formData.food_included}
                              onChange={(e) => handleFieldChange('food_included', e.target.checked)}
                              className="w-4 h-4 rounded border-slate-600"
                            />
                            <Utensils className="w-5 h-5 text-slate-400" />
                            <span className="text-slate-300">Food Included</span>
                          </label>

                          <label className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
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
                      </div>

                      <div>
                        <h6 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Languages Offered
                        </h6>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {availableLanguages.map(lang => (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => handleLanguageToggle(lang.code)}
                              className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                                formData.languages.includes(lang.code)
                                  ? 'bg-green-500/20 border-green-500/50 text-green-300'
                                  : 'bg-slate-700/30 border-slate-600 text-slate-300 hover:border-slate-500'
                              }`}
                            >
                              <span className="text-lg">{lang.flag}</span>
                              <span className="text-sm font-medium">{lang.name}</span>
                            </button>
                          ))}
                        </div>
                        <p className="text-slate-400 text-xs mt-2">
                          Select all languages your guide can communicate in
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Sidebar */}
              {showPreview && (
                <div className="lg:col-span-1">
                  <div className="sticky top-6">
                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
                      <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Tourist View Preview
                      </h4>
                      
                      {/* Mock tour card preview */}
                      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-slate-600">
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
                            <div className="text-xs text-slate-400 line-through">
                              {formatPrice(formData.original_price_adult)}
                            </div>
                            <div className="text-green-400 font-bold">
                              {formatPrice(formData.discount_price_adult)}
                            </div>
                          </div>
                        </div>
                        
                        <h5 className="text-white font-semibold mb-2 line-clamp-2">
                          {formData.tour_name || 'Tour Name'}
                        </h5>
                        
                        <p className="text-slate-300 text-sm mb-3 line-clamp-3">
                          {formData.description || 'Tour description will appear here...'}
                        </p>
                        
                        <div className="space-y-2 text-xs text-slate-400">
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
                        </div>
                        
                        {formData.languages.length > 0 && (
                          <div className="flex gap-1 mt-3">
                            {formData.languages.slice(0, 3).map(lang => (
                              <span key={lang} className="text-xs">
                                {availableLanguages.find(l => l.code === lang)?.flag}
                              </span>
                            ))}
                            {formData.languages.length > 3 && (
                              <span className="text-xs text-slate-400">+{formData.languages.length - 3}</span>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-3 pt-3 border-t border-slate-600">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">
                              -{formData.discount_percentage}% discount
                            </span>
                            <span className="text-xs text-green-400 font-medium">
                              Last minute deal!
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* FIXED: Enhanced Validation Status */}
                      <div className="mt-4 p-3 rounded-lg bg-slate-600/30">
                        <h6 className="text-white text-sm font-medium mb-2">Form Status</h6>
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
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-700">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Form
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
                  disabled={loading || Object.keys(validationErrors).length > 0}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all transform hover:scale-105"
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
          </form>
        </div>
      ) : (
        /* NEW: Tour Management Section when no form is open */
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
                    tour_type: 'Sunset Tour',
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

          {/* NEW: Existing Tours Management */}
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
                                    <button onClick={() => handleEdit(tour)} className="p-2 text-slate-400 hover:text-green-400 transition-colors">
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