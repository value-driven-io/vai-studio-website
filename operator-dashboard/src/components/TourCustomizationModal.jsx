// TourCustomizationModal.jsx - Individual Tour Customization Interface
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  X, Save, AlertCircle, DollarSign, Users, Clock, MapPin, 
  FileText, Percent, Settings, Trash2, RotateCcw, Lock,
  Unlock, Info, Calendar, Activity, Zap
} from 'lucide-react'
import { scheduleService } from '../services/scheduleService'

const TourCustomizationModal = ({
  isOpen,
  onClose,
  tour,
  onSuccess,
  formatPrice
}) => {
  const { t } = useTranslation()
  
  // Form state
  const [formData, setFormData] = useState({
    discount_price_adult: '',
    discount_price_child: '',
    max_capacity: '',
    meeting_point: '',
    special_notes: '',
    instance_note: '',
    promo_discount_percent: '',
    promo_discount_value: '',
    status: ''
  })
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [frozenFields, setFrozenFields] = useState([])
  const [activeTab, setActiveTab] = useState('pricing')
  const [promoType, setPromoType] = useState('none') // 'none', 'percent', 'value'
  
  // Helper function to get effective value (override > original)
  const getEffectiveValue = (fieldName) => {
    return tour.overrides?.[fieldName] ?? tour[fieldName]
  }

  // Initialize form when tour changes
  useEffect(() => {
    if (tour && isOpen) {
      setFormData({
        discount_price_adult: getEffectiveValue('discount_price_adult')?.toString() || '',
        discount_price_child: getEffectiveValue('discount_price_child')?.toString() || '',
        max_capacity: getEffectiveValue('max_capacity')?.toString() || '',
        meeting_point: getEffectiveValue('meeting_point') || '',
        time_slot: getEffectiveValue('time_slot') || '',
        special_notes: getEffectiveValue('special_notes') || '',
        instance_note: getEffectiveValue('instance_note') || '',
        promo_discount_percent: tour.promo_discount_percent?.toString() || '',
        promo_discount_value: tour.promo_discount_value?.toString() || '',
        status: getEffectiveValue('status') || ''
      })
      
      // Set promo type based on existing values
      if (tour.promo_discount_percent) {
        setPromoType('percent')
      } else if (tour.promo_discount_value) {
        setPromoType('value')
      } else {
        setPromoType('none')
      }
      
      setFrozenFields(tour.frozen_fields || [])
      setError(null)
    }
  }, [tour, isOpen])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
  }

  const handlePromoTypeChange = (type) => {
    setPromoType(type)
    if (type === 'none') {
      setFormData(prev => ({
        ...prev,
        promo_discount_percent: '',
        promo_discount_value: ''
      }))
    } else if (type === 'percent') {
      setFormData(prev => ({
        ...prev,
        promo_discount_value: ''
      }))
    } else if (type === 'value') {
      setFormData(prev => ({
        ...prev,
        promo_discount_percent: ''
      }))
    }
  }

  const toggleFrozenField = (fieldName) => {
    setFrozenFields(prev => {
      if (prev.includes(fieldName)) {
        return prev.filter(f => f !== fieldName)
      } else {
        return [...prev, fieldName]
      }
    })
  }

  const calculateEffectivePrice = () => {
    const originalPrice = tour?.original_price_adult || 0
    const currentPrice = parseInt(formData.discount_price_adult) || originalPrice
    
    if (promoType === 'percent' && formData.promo_discount_percent) {
      const discount = originalPrice * (parseInt(formData.promo_discount_percent) / 100)
      return originalPrice - discount
    } else if (promoType === 'value' && formData.promo_discount_value) {
      return originalPrice - parseInt(formData.promo_discount_value)
    }
    
    return currentPrice
  }

  const validateForm = () => {
    const validation = scheduleService.validateTourCustomizations({
      discount_price_adult: formData.discount_price_adult ? parseInt(formData.discount_price_adult) : undefined,
      discount_price_child: formData.discount_price_child ? parseInt(formData.discount_price_child) : null,
      max_capacity: formData.max_capacity ? parseInt(formData.max_capacity) : undefined,
      promo_discount_percent: formData.promo_discount_percent ? parseInt(formData.promo_discount_percent) : null,
      promo_discount_value: formData.promo_discount_value ? parseInt(formData.promo_discount_value) : null,
      status: formData.status || undefined,
      instance_note: formData.instance_note || undefined,
      meeting_point: formData.meeting_point || undefined
    })
    
    return validation
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!tour) return
    
    // Validate form
    const validation = validateForm()
    if (!validation.valid) {
      setError(`Validation failed: ${validation.errors.join(', ')}`)
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      // Prepare customizations (only include changed fields)
      const customizations = {}
      const changedFields = []
      
      // Check each field for changes
      if (formData.discount_price_adult && formData.discount_price_adult !== tour.discount_price_adult?.toString()) {
        customizations.discount_price_adult = parseInt(formData.discount_price_adult)
        changedFields.push('discount_price_adult')
      }
      
      if (formData.discount_price_child !== (tour.discount_price_child?.toString() || '')) {
        customizations.discount_price_child = formData.discount_price_child ? parseInt(formData.discount_price_child) : null
        changedFields.push('discount_price_child')
      }
      
      if (formData.max_capacity && formData.max_capacity !== tour.max_capacity?.toString()) {
        customizations.max_capacity = parseInt(formData.max_capacity)
        changedFields.push('max_capacity')
      }
      
      if (formData.meeting_point !== (tour.meeting_point || '')) {
        customizations.meeting_point = formData.meeting_point
        changedFields.push('meeting_point')
      }

      if (formData.time_slot !== (tour.time_slot || '')) {
        customizations.time_slot = formData.time_slot
        changedFields.push('time_slot')
      }
      
      if (formData.special_notes !== (tour.special_notes || '')) {
        customizations.special_notes = formData.special_notes
        changedFields.push('special_notes')
      }
      
      if (formData.instance_note !== (tour.instance_note || '')) {
        customizations.instance_note = formData.instance_note
        changedFields.push('instance_note')
      }
      
      if (formData.status && formData.status !== tour.status) {
        customizations.status = formData.status
        changedFields.push('status')
      }
      
      // Handle promotional discounts
      if (promoType === 'percent' && formData.promo_discount_percent) {
        customizations.promo_discount_percent = parseInt(formData.promo_discount_percent)
        changedFields.push('promo_discount_percent')
      } else if (promoType === 'value' && formData.promo_discount_value) {
        customizations.promo_discount_value = parseInt(formData.promo_discount_value)
        changedFields.push('promo_discount_value')
      } else if (promoType === 'none') {
        customizations.promo_discount_percent = null
        customizations.promo_discount_value = null
        changedFields.push('promo_discount_percent', 'promo_discount_value')
      }
      
      if (Object.keys(customizations).length === 0) {
        setError('No changes detected')
        return
      }
      
      // Apply customization
      const result = await scheduleService.customizeTour(
        tour.id,
        customizations,
        frozenFields
      )
      
      console.log('✅ Tour customization result:', result)
      
      // Notify parent component
      if (onSuccess) {
        onSuccess(result.tour)
      }
      
      // Close modal
      onClose()
      
    } catch (error) {
      console.error('❌ Error customizing tour:', error)
      setError(error.message || 'Failed to customize tour')
    } finally {
      setLoading(false)
    }
  }

  const handleResetCustomizations = async () => {
    if (!window.confirm('Are you sure you want to reset all customizations? This will make the tour follow its schedule again.')) {
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      await scheduleService.resetTourCustomizations(tour.id)
      
      if (onSuccess) {
        onSuccess(null) // Signal that customizations were reset
      }
      
      onClose()
      
    } catch (error) {
      console.error('❌ Error resetting tour customizations:', error)
      setError(error.message || 'Failed to reset customizations')
    } finally {
      setLoading(false)
    }
  }

  const handleDetachTour = async () => {
    if (!window.confirm('Are you sure you want to detach this tour from its schedule? This will make it completely independent.')) {
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      await scheduleService.detachTourFromSchedule(tour.id)
      
      if (onSuccess) {
        onSuccess(null) // Signal that tour was detached
      }
      
      onClose()
      
    } catch (error) {
      console.error('❌ Error detaching tour:', error)
      setError(error.message || 'Failed to detach tour')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !tour) return null

  const tabs = [
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'details', label: 'Details', icon: Settings },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'advanced', label: 'Advanced', icon: Zap }
  ]

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'text-green-400' },
    { value: 'sold_out', label: 'Sold Out', color: 'text-yellow-400' },
    { value: 'cancelled', label: 'Cancelled', color: 'text-red-400' },
    { value: 'paused', label: 'Paused (Temporarily Unavailable)', color: 'text-amber-400' },
    { value: 'hidden', label: 'Hidden (Not Visible to Customers)', color: 'text-slate-400' }
  ]

  const effectivePrice = calculateEffectivePrice()
  const hasPromoDiscount = effectivePrice !== (parseInt(formData.discount_price_adult) || tour.original_price_adult)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-700 px-6 py-4 border-b border-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Customize Tour
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-300">{tour.tour_name}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{tour.tour_date}</span>
                <span className="text-slate-400">{tour.time_slot}</span>
                {tour.is_customized && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400 ml-2">
                    <Settings className="w-3 h-3 mr-1" />
                    Customized
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-700/50 px-6 py-3 border-b border-slate-600">
          <div className="flex space-x-1">
            {tabs.map(tab => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-600'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-6 py-4 bg-red-500/10 border-b border-red-500/20">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            
            {/* Pricing Tab */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                {/* Regular Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Adult Price (XPF)
                      {frozenFields.includes('discount_price_adult') && (
                        <Lock className="w-3 h-3 text-yellow-400" />
                      )}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.discount_price_adult}
                        onChange={(e) => handleInputChange('discount_price_adult', e.target.value)}
                        className="flex-1 p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={tour.original_price_adult?.toString()}
                      />
                      <button
                        type="button"
                        onClick={() => toggleFrozenField('discount_price_adult')}
                        className={`p-2 rounded-lg transition-colors ${
                          frozenFields.includes('discount_price_adult')
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-slate-600 text-slate-400 hover:text-white'
                        }`}
                        title={frozenFields.includes('discount_price_adult') ? 'Unfreeze field' : 'Freeze field from bulk updates'}
                      >
                        {frozenFields.includes('discount_price_adult') ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Original: {formatPrice(tour.original_price_adult)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                      Child Price (XPF)
                      {frozenFields.includes('discount_price_child') && (
                        <Lock className="w-3 h-3 text-yellow-400" />
                      )}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.discount_price_child}
                        onChange={(e) => handleInputChange('discount_price_child', e.target.value)}
                        className="flex-1 p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Optional"
                      />
                      <button
                        type="button"
                        onClick={() => toggleFrozenField('discount_price_child')}
                        className={`p-2 rounded-lg transition-colors ${
                          frozenFields.includes('discount_price_child')
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-slate-600 text-slate-400 hover:text-white'
                        }`}
                      >
                        {frozenFields.includes('discount_price_child') ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Promotional Pricing */}
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 border border-purple-500/20">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Percent className="w-5 h-5" />
                    Promotional Discount
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-slate-300">
                        <input
                          type="radio"
                          value="none"
                          checked={promoType === 'none'}
                          onChange={(e) => handlePromoTypeChange(e.target.value)}
                          className="text-purple-500"
                        />
                        No Promotion
                      </label>
                      <label className="flex items-center gap-2 text-slate-300">
                        <input
                          type="radio"
                          value="percent"
                          checked={promoType === 'percent'}
                          onChange={(e) => handlePromoTypeChange(e.target.value)}
                          className="text-purple-500"
                        />
                        Percentage Discount
                      </label>
                      <label className="flex items-center gap-2 text-slate-300">
                        <input
                          type="radio"
                          value="value"
                          checked={promoType === 'value'}
                          onChange={(e) => handlePromoTypeChange(e.target.value)}
                          className="text-purple-500"
                        />
                        Fixed Amount Discount
                      </label>
                    </div>

                    {promoType === 'percent' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Discount Percentage (0-100%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.promo_discount_percent}
                          onChange={(e) => handleInputChange('promo_discount_percent', e.target.value)}
                          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g., 20 for 20% off"
                        />
                      </div>
                    )}

                    {promoType === 'value' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Discount Amount (XPF)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.promo_discount_value}
                          onChange={(e) => handleInputChange('promo_discount_value', e.target.value)}
                          className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="e.g., 5000 for 5,000 XPF off"
                        />
                      </div>
                    )}
                  </div>

                  {/* Effective Price Preview */}
                  <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Effective Customer Price:</span>
                      <div className="flex items-center gap-2">
                        {hasPromoDiscount && (
                          <span className="text-slate-500 line-through">
                            {formatPrice(parseInt(formData.discount_price_adult) || tour.original_price_adult)}
                          </span>
                        )}
                        <span className={`font-bold ${hasPromoDiscount ? 'text-green-400' : 'text-white'}`}>
                          {formatPrice(effectivePrice)}
                        </span>
                        {hasPromoDiscount && (
                          <span className="text-green-400 text-xs">
                            PROMO!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Max Capacity
                      {frozenFields.includes('max_capacity') && (
                        <Lock className="w-3 h-3 text-yellow-400" />
                      )}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.max_capacity}
                        onChange={(e) => handleInputChange('max_capacity', e.target.value)}
                        className="flex-1 p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={tour.max_capacity?.toString()}
                      />
                      <button
                        type="button"
                        onClick={() => toggleFrozenField('max_capacity')}
                        className={`p-2 rounded-lg transition-colors ${
                          frozenFields.includes('max_capacity')
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-slate-600 text-slate-400 hover:text-white'
                        }`}
                      >
                        {frozenFields.includes('max_capacity') ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Keep Current ({tour.status})</option>
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Meeting Point
                    {frozenFields.includes('meeting_point') && (
                      <Lock className="w-3 h-3 text-yellow-400" />
                    )}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.meeting_point}
                      onChange={(e) => handleInputChange('meeting_point', e.target.value)}
                      className="flex-1 p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={tour.meeting_point}
                    />
                    <button
                      type="button"
                      onClick={() => toggleFrozenField('meeting_point')}
                      className={`p-2 rounded-lg transition-colors ${
                        frozenFields.includes('meeting_point')
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-slate-600 text-slate-400 hover:text-white'
                      }`}
                    >
                      {frozenFields.includes('meeting_point') ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time Slot
                    {frozenFields.includes('time_slot') && (
                      <Lock className="w-3 h-3 text-yellow-400" />
                    )}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={formData.time_slot}
                      onChange={(e) => handleInputChange('time_slot', e.target.value)}
                      className="flex-1 p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => toggleFrozenField('time_slot')}
                      className={`p-2 rounded-lg transition-colors ${
                        frozenFields.includes('time_slot')
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-slate-600 text-slate-400 hover:text-white'
                      }`}
                      title={frozenFields.includes('time_slot') ? 'Unfreeze time from schedule updates' : 'Freeze time from schedule updates'}
                    >
                      {frozenFields.includes('time_slot') ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    When unfrozen, time will update with schedule changes. When frozen, keeps custom time.
                  </p>
                </div>
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Instance Note
                    <span className="text-slate-500 text-xs">(visible to customers)</span>
                  </label>
                  <textarea
                    value={formData.instance_note}
                    onChange={(e) => handleInputChange('instance_note', e.target.value)}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="e.g., 'Humpback season peak - best viewing conditions'"
                    maxLength="1000"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.instance_note.length}/1000 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    Special Notes
                    <span className="text-slate-500 text-xs">(internal use)</span>
                    {frozenFields.includes('special_notes') && (
                      <Lock className="w-3 h-3 text-yellow-400" />
                    )}
                  </label>
                  <div className="space-y-2">
                    <textarea
                      value={formData.special_notes}
                      onChange={(e) => handleInputChange('special_notes', e.target.value)}
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="4"
                      placeholder="Internal notes, special preparations, etc."
                    />
                    <button
                      type="button"
                      onClick={() => toggleFrozenField('special_notes')}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                        frozenFields.includes('special_notes')
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-slate-600 text-slate-400 hover:text-white'
                      }`}
                    >
                      {frozenFields.includes('special_notes') ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      {frozenFields.includes('special_notes') ? 'Frozen' : 'Freeze from bulk updates'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === 'advanced' && (
              <div className="space-y-6">
                {/* Frozen Fields Summary */}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Frozen Fields
                  </h3>
                  <p className="text-slate-400 text-sm mb-3">
                    Frozen fields will not be updated when bulk changes are applied to the schedule.
                  </p>
                  {frozenFields.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {frozenFields.map(field => (
                        <span
                          key={field}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs"
                        >
                          <Lock className="w-3 h-3" />
                          {field.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No fields are currently frozen.</p>
                  )}
                </div>

                {/* Tour Information */}
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Tour Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Template:</span>
                      <span className="text-white ml-2">{tour.template?.tour_name || tour.template_name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Schedule:</span>
                      <span className="text-white ml-2">{tour.parent_schedule?.recurrence_type || tour.recurrence_type || (tour.is_detached ? 'Detached' : 'N/A')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Customized:</span>
                      <span className={`ml-2 ${tour.is_customized ? 'text-blue-400' : 'text-slate-500'}`}>
                        {tour.is_customized ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Detached:</span>
                      <span className={`ml-2 ${tour.is_detached ? 'text-red-400' : 'text-slate-500'}`}>
                        {tour.is_detached ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dangerous Actions */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-red-400 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Dangerous Actions
                  </h3>
                  <div className="space-y-3">
                    {tour.is_customized && (
                      <button
                        type="button"
                        onClick={handleResetCustomizations}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset All Customizations
                      </button>
                    )}
                    {!tour.is_detached && tour.parent_schedule_id && (
                      <button
                        type="button"
                        onClick={handleDetachTour}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Detach from Schedule
                      </button>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mt-3">
                    These actions cannot be undone. Use with caution.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-700 px-6 py-4 border-t border-slate-600 flex items-center justify-between">
            <div className="text-sm text-slate-400">
              {tour.is_customized ? (
                <span className="flex items-center gap-1">
                  <Settings className="w-4 h-4" />
                  This tour has custom settings
                </span>
              ) : (
                <span>This tour follows its schedule</span>
              )}
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
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {loading ? 'Saving...' : 'Save Customizations'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TourCustomizationModal