import React from 'react'
import { 
  Plus, Calendar, Clock, Users, MapPin,
  DollarSign, CheckCircle, AlertCircle,
  Save, X, Eye, EyeOff, Calculator, Percent, 
  Globe, Utensils, Camera, Heart, 
  Copy, RotateCcw, Info, 
  ChevronDown, ChevronUp, Waves
} from 'lucide-react'

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
  handleDuplicate
}) => {
  return (
    
    <div className="space-y-6">
              {/* Create Tab Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Create New Tour</h2>
                  <p className="text-slate-400">Set up a new tour experience for travelers</p>
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
                                        <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded cursor-help" title="Make it catchy! Examples: 'Sunset Whale Watching', 'Secret Lagoon Snorkel Adventure'">
                                        💡
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.tour_name}
                                        onChange={(e) => handleInputChange('tour_name', e.target.value)}
                                        className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white transition-colors ${
                                        validationErrors.tour_name ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
                                        }`}
                                        placeholder="e.g., Morning Whale Watching Adventure"
                                    />
                                    {validationErrors.tour_name && (
                                        <p className="text-red-400 text-sm mt-1">{validationErrors.tour_name}</p>
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
                                        onClick={() => handleInputChange('tour_type', type.value)}
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
                                  onChange={(e) => handleInputChange('description', e.target.value)}
                                  className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 transition-colors ${
                                    validationErrors.description ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
                                  }`}
                                  rows="4"
                                  placeholder="Describe your tour experience in detail. What makes it special? What will participants see and do?"
                                />
                                {validationErrors.description && (
                                  <p className="text-red-400 text-sm mt-1">{validationErrors.description}</p>
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
                                      onClick={() => handleInputChange('tour_date', date)}
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
                                    onChange={(e) => handleInputChange('tour_date', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white transition-colors ${
                                      validationErrors.tour_date ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
                                    }`}
                                  />
                                  {validationErrors.tour_date && (
                                    <p className="text-red-400 text-sm mt-1">{validationErrors.tour_date}</p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Time Slot *
                                  </label>
                                  <select
                                    value={formData.time_slot}
                                    onChange={(e) => handleInputChange('time_slot', e.target.value)}
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
                                        <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded cursor-help" title="Include travel time to/from activity location. Half-day tours: 3-4h, Full-day: 6-8h">
                                        ⏱️
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.duration_hours}
                                        onChange={(e) => handleInputChange('duration_hours', parseFloat(e.target.value))}
                                        className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white transition-colors ${
                                        validationErrors.duration_hours ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
                                        }`}
                                        min="0.5"
                                        max="12"
                                        step="0.5"
                                        placeholder="e.g., 3.5"
                                    />
                                    {validationErrors.duration_hours && (
                                        <p className="text-red-400 text-sm mt-1">{validationErrors.duration_hours}</p>
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
                                    onChange={(e) => handleInputChange('max_capacity', parseInt(e.target.value))}
                                    className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white transition-colors ${
                                      validationErrors.max_capacity ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
                                    }`}
                                    min="1"
                                    max="50"
                                  />
                                  {validationErrors.max_capacity && (
                                    <p className="text-red-400 text-sm mt-1">{validationErrors.max_capacity}</p>
                                  )}
                                </div>

                                <div>
                                  <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Available Spots
                                  </label>
                                  <input
                                    type="number"
                                    value={formData.available_spots}
                                    onChange={(e) => handleInputChange('available_spots', parseInt(e.target.value))}
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
                                        onChange={(e) => handleInputChange('original_price_adult', parseInt(e.target.value))}
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
                                        <p className="text-red-400 text-sm mt-1">{validationErrors.original_price_adult}</p>
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
                                        step="5"          // ← Add this line
                                        value={formData.discount_percentage}
                                        onChange={(e) => handleInputChange('discount_percentage', parseInt(e.target.value))}
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
                                      onChange={(e) => handleInputChange('discount_price_adult', parseInt(e.target.value))}
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
                                      <p className="text-red-400 text-sm mt-1">{validationErrors.discount_price_adult}</p>
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
                                    <span className="text-xs text-slate-500 bg-slate-700 px-2 py-1 rounded cursor-help" title="Be specific! Include GPS coordinates or hotel names for easy finding">
                                    📍
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.meeting_point}
                                    onChange={(e) => handleInputChange('meeting_point', e.target.value)}
                                    className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white transition-colors ${
                                    validationErrors.meeting_point ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
                                    }`}
                                    placeholder="e.g., Vaiare Ferry Terminal - Main Entrance, or InterContinental Thalasso Spa Dock"
                                />
                                {validationErrors.meeting_point && (
                                    <p className="text-red-400 text-sm mt-1">{validationErrors.meeting_point}</p>
                                )}
                                </div>

                              <div>
                                <label className="flex items-center gap-2 mb-3">
                                  <input
                                    type="checkbox"
                                    checked={formData.pickup_available}
                                    onChange={(e) => handleInputChange('pickup_available', e.target.checked)}
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
                                      onChange={(e) => handleInputChange('equipment_included', e.target.checked)}
                                      className="w-4 h-4 rounded border-slate-600"
                                    />
                                    <Camera className="w-5 h-5 text-slate-400" />
                                    <span className="text-slate-300">Equipment Included</span>
                                  </label>

                                  <label className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={formData.food_included}
                                      onChange={(e) => handleInputChange('food_included', e.target.checked)}
                                      className="w-4 h-4 rounded border-slate-600"
                                    />
                                    <Utensils className="w-5 h-5 text-slate-400" />
                                    <span className="text-slate-300">Food Included</span>
                                  </label>

                                  <label className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={formData.drinks_included}
                                      onChange={(e) => handleInputChange('drinks_included', e.target.checked)}
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

                              {/* Validation Status */}
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
                          disabled={loading}
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
                  
                  {/* THIS IS WHERE YOU PASTE YOUR COMPLETE FORM */}

                </div>
              ) : (
                /* Show this when no form is open */
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8 text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Ready to Create a Tour?</h3>
                  <p className="text-slate-400 mb-6">Click the button above to start creating your next tour experience</p>
                  
                  {/* Quick Tour Templates */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
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
              )}
            </div>

  )
}

export default CreateTab