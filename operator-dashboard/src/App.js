// src/App.js - Enhanced with complete tour form
import React, { useState, useEffect } from 'react'
import { Plus, Calendar, Users, MapPin, Clock, Edit2, Trash2, X } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import { operatorService } from './lib/supabase'
import Login from './components/Login'
import './App.css'

function App() {
  const { operator, loading: authLoading, login, logout, isAuthenticated } = useAuth()
  const [tours, setTours] = useState([])
  const [stats, setStats] = useState({ totalRevenue: 0, totalBookings: 0, pendingBookings: 0 })
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingTour, setEditingTour] = useState(null)

  // Enhanced formData state with all fields
  const [formData, setFormData] = useState({
    // Basic Info
    tour_name: '',
    tour_type: 'Whale Watching',
    description: '',
    tour_date: '',
    time_slot: '09:00',
    duration_hours: 2,
    
    // Capacity & Pricing
    max_capacity: 8,
    original_price_adult: 8000,
    discount_price_adult: 6400,
    discount_price_child: 3200,
    
    // Location
    meeting_point: '',
    pickup_available: false,
    pickup_locations: '',
    
    // Inclusions
    equipment_included: false,
    food_included: false,
    drinks_included: false,
    languages: ['French'],
    
    // Restrictions & Requirements
    min_age: null,
    max_age: null,
    fitness_level: 'All levels',
    requirements: '',
    restrictions: '',
    
    // Compliance & Weather
    whale_regulation_compliant: false,
    max_whale_group_size: 6,
    weather_dependent: true,
    backup_plan: '',
    
    // Booking Settings
    auto_close_hours: 2,
    special_notes: ''
  })

  // Enhanced tour types with all categories
  const tourTypes = [
    'Whale Watching',
    'Snorkeling', 
    'Lagoon',
    'Hike',
    'Cultural',
    'Adrenalin',
    'Diving',
    'Mindfulness'
  ]

  // Time slots with better options
  const timeSlots = [
    { value: '06:00', label: '06:00 - Sunrise' },
    { value: '09:00', label: '09:00 - Morning' },
    { value: '12:00', label: '12:00 - Midday' },
    { value: '14:00', label: '14:00 - Afternoon' },
    { value: '17:30', label: '17:30 - Sunset' },
    { value: '20:00', label: '20:00 - Night' }
  ]

  // Fitness levels
  const fitnessLevels = [
    'All levels',
    'Easy',
    'Moderate', 
    'Challenging',
    'Expert only'
  ]

  // Available languages
  const availableLanguages = [
    { code: 'French', flag: '🇫🇷' },
    { code: 'English', flag: '🇬🇧' },
    { code: 'German', flag: '🇩🇪' },
    { code: 'Spanish', flag: '🇪🇸' }
  ]

  // Load tours and stats when operator is authenticated
  useEffect(() => {
    if (isAuthenticated && operator) {
      loadTours()
      loadStats()
    }
  }, [isAuthenticated, operator])

  const loadTours = async () => {
    try {
      setLoading(true)
      const data = await operatorService.getOperatorTours(operator.id)
      setTours(data)
    } catch (error) {
      console.error('Error loading tours:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await operatorService.getOperatorStats(operator.id)
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      
      // Prepare data for submission
      const tourData = {
        ...formData,
        operator_id: operator.id,
        available_spots: formData.max_capacity, // Initialize available spots
        status: 'active'
      }

      if (editingTour) {
        await operatorService.updateTour(editingTour.id, tourData)
      } else {
        await operatorService.createTour(tourData)
      }

      resetForm()
      loadTours()
    } catch (error) {
      console.error('Error saving tour:', error)
      alert('Error saving tour. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (tour) => {
    setEditingTour(tour)
    setFormData({
      tour_name: tour.tour_name || '',
      tour_type: tour.tour_type || 'Whale Watching',
      description: tour.description || '',
      tour_date: tour.tour_date || '',
      time_slot: tour.time_slot || '09:00',
      duration_hours: tour.duration_hours || 2,
      max_capacity: tour.max_capacity || 8,
      original_price_adult: tour.original_price_adult || 8000,
      discount_price_adult: tour.discount_price_adult || 6400,
      discount_price_child: tour.discount_price_child || 3200,
      meeting_point: tour.meeting_point || '',
      pickup_available: tour.pickup_available || false,
      pickup_locations: tour.pickup_locations || '',
      equipment_included: tour.equipment_included || false,
      food_included: tour.food_included || false,
      drinks_included: tour.drinks_included || false,
      languages: tour.languages || ['French'],
      min_age: tour.min_age || null,
      max_age: tour.max_age || null,
      fitness_level: tour.fitness_level || 'All levels',
      requirements: tour.requirements || '',
      restrictions: tour.restrictions || '',
      whale_regulation_compliant: tour.whale_regulation_compliant || false,
      max_whale_group_size: tour.max_whale_group_size || 6,
      weather_dependent: tour.weather_dependent !== false,
      backup_plan: tour.backup_plan || '',
      auto_close_hours: tour.auto_close_hours || 2,
      special_notes: tour.special_notes || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (tourId) => {
    if (window.confirm('Are you sure you want to delete this tour?')) {
      try {
        await operatorService.deleteTour(tourId)
        loadTours()
      } catch (error) {
        console.error('Error deleting tour:', error)
        alert('Error deleting tour. Please try again.')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      tour_name: '',
      tour_type: 'Whale Watching',
      description: '',
      tour_date: '',
      time_slot: '09:00',
      duration_hours: 2,
      max_capacity: 8,
      original_price_adult: 8000,
      discount_price_adult: 6400,
      discount_price_child: 3200,
      meeting_point: '',
      pickup_available: false,
      pickup_locations: '',
      equipment_included: false,
      food_included: false,
      drinks_included: false,
      languages: ['French'],
      min_age: null,
      max_age: null,
      fitness_level: 'All levels',
      requirements: '',
      restrictions: '',
      whale_regulation_compliant: false,
      max_whale_group_size: 6,
      weather_dependent: true,
      backup_plan: '',
      auto_close_hours: 2,
      special_notes: ''
    })
    setEditingTour(null)
    setShowForm(false)
  }

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('fr-PF', {
      style: 'currency',
      currency: 'XPF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login onLogin={login} loading={loading} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">🏝️ VAI Tickets</h1>
              <p className="text-slate-300">Welcome back, {operator.company_name}</p>
            </div>
            <button
              onClick={logout}
              className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">€</span>
              </div>
              <h3 className="text-slate-300 font-medium">Monthly Revenue</h3>
            </div>
            <p className="text-2xl font-bold text-white">{formatPrice(stats.totalRevenue)}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-slate-300 font-medium">Total Bookings</h3>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalBookings}</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-slate-300 font-medium">Pending Bookings</h3>
            </div>
            <p className="text-2xl font-bold text-white">{stats.pendingBookings}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create New Tour
          </button>
        </div>

        {/* Enhanced Tour Form */}
        {showForm && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {editingTour ? 'Edit Tour' : 'Create New Tour'}
              </h3>
              <button
                onClick={resetForm}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-md font-medium text-slate-300 mb-3 border-b border-slate-600 pb-2">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Tour Name *</label>
                    <input
                      type="text"
                      value={formData.tour_name}
                      onChange={(e) => handleInputChange('tour_name', e.target.value)}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                      placeholder="e.g., Whale Watching Sunset"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Tour Type</label>
                    <select
                      value={formData.tour_type}
                      onChange={(e) => handleInputChange('tour_type', e.target.value)}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                    >
                      {tourTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                      rows="3"
                      placeholder="Describe your tour experience..."
                    />
                  </div>
                </div>
              </div>

              {/* Schedule & Duration */}
              <div>
                <h4 className="text-md font-medium text-slate-300 mb-3 border-b border-slate-600 pb-2">Schedule & Duration</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Date *</label>
                    <input
                      type="date"
                      value={formData.tour_date}
                      onChange={(e) => handleInputChange('tour_date', e.target.value)}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Time</label>
                    <select
                      value={formData.time_slot}
                      onChange={(e) => handleInputChange('time_slot', e.target.value)}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                    >
                      {timeSlots.map(slot => (
                        <option key={slot.value} value={slot.value}>{slot.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Duration (hours)</label>
                    <input
                      type="number"
                      value={formData.duration_hours}
                      onChange={(e) => handleInputChange('duration_hours', parseFloat(e.target.value))}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                      min="0.5"
                      max="12"
                      step="0.5"
                    />
                  </div>
                </div>
              </div>

              {/* Capacity & Pricing */}
              <div>
                <h4 className="text-md font-medium text-slate-300 mb-3 border-b border-slate-600 pb-2">Capacity & Pricing</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Max Capacity</label>
                    <input
                      type="number"
                      value={formData.max_capacity}
                      onChange={(e) => handleInputChange('max_capacity', parseInt(e.target.value))}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                      min="1"
                      max="50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Original Price Adult (XPF)</label>
                    <input
                      type="number"
                      value={formData.original_price_adult}
                      onChange={(e) => handleInputChange('original_price_adult', parseInt(e.target.value))}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                      min="1000"
                      step="500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Discounted Price Adult (XPF)</label>
                    <input
                      type="number"
                      value={formData.discount_price_adult}
                      onChange={(e) => handleInputChange('discount_price_adult', parseInt(e.target.value))}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                      min="1000"
                      step="500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Child Price (XPF)</label>
                    <input
                      type="number"
                      value={formData.discount_price_child}
                      onChange={(e) => handleInputChange('discount_price_child', parseInt(e.target.value))}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                      min="1000"
                      step="500"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Pickup */}
              <div>
                <h4 className="text-md font-medium text-slate-300 mb-3 border-b border-slate-600 pb-2">Location & Pickup</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Meeting Point *</label>
                    <input
                      type="text"
                      value={formData.meeting_point}
                      onChange={(e) => handleInputChange('meeting_point', e.target.value)}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                      placeholder="e.g., Marina de Moorea"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Pickup Locations (optional)</label>
                    <input
                      type="text"
                      value={formData.pickup_locations}
                      onChange={(e) => handleInputChange('pickup_locations', e.target.value)}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                      placeholder="Hotel pickup areas (comma separated)"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.pickup_available}
                      onChange={(e) => handleInputChange('pickup_available', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-600"
                    />
                    <span className="text-sm text-slate-300">Pickup service available</span>
                  </label>
                </div>
              </div>

              {/* Inclusions */}
              <div>
                <h4 className="text-md font-medium text-slate-300 mb-3 border-b border-slate-600 pb-2">What's Included</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.equipment_included}
                        onChange={(e) => handleInputChange('equipment_included', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-600"
                      />
                      <span className="text-sm text-slate-300">Equipment included</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.food_included}
                        onChange={(e) => handleInputChange('food_included', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-600"
                      />
                      <span className="text-sm text-slate-300">Food included</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.drinks_included}
                        onChange={(e) => handleInputChange('drinks_included', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-600"
                      />
                      <span className="text-sm text-slate-300">Drinks included</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Languages Offered</label>
                    <div className="space-y-2 max-h-24 overflow-y-auto">
                      {availableLanguages.map(lang => (
                        <label key={lang.code} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.languages.includes(lang.code)}
                            onChange={(e) => {
                              const newLanguages = e.target.checked
                                ? [...formData.languages, lang.code]
                                : formData.languages.filter(l => l !== lang.code)
                              handleInputChange('languages', newLanguages)
                            }}
                            className="w-4 h-4 rounded border-slate-600"
                          />
                          <span className="text-sm text-slate-300">{lang.flag} {lang.code}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements & Restrictions */}
              <div>
                <h4 className="text-md font-medium text-slate-300 mb-3 border-b border-slate-600 pb-2">Requirements & Restrictions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Min Age</label>
                    <input
                      type="number"
                      value={formData.min_age || ''}
                      onChange={(e) => handleInputChange('min_age', e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                      min="0"
                      max="100"
                      placeholder="No limit"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Max Age</label>
                    <input
                      type="number"
                      value={formData.max_age || ''}
                      onChange={(e) => handleInputChange('max_age', e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                      min="0"
                      max="100"
                      placeholder="No limit"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Fitness Level</label>
                    <select
                      value={formData.fitness_level}
                      onChange={(e) => handleInputChange('fitness_level', e.target.value)}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                    >
                      {fitnessLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Requirements</label>
                    <textarea
                      value={formData.requirements}
                      onChange={(e) => handleInputChange('requirements', e.target.value)}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                      rows="3"
                      placeholder="What to bring, dress code..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Restrictions</label>
                    <textarea
                      value={formData.restrictions}
                      onChange={(e) => handleInputChange('restrictions', e.target.value)}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                      rows="3"
                      placeholder="Medical conditions, pregnancy..."
                    />
                  </div>
                </div>
              </div>

              {/* Compliance & Weather */}
              <div>
                <h4 className="text-md font-medium text-slate-300 mb-3 border-b border-slate-600 pb-2">Compliance & Weather</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.whale_regulation_compliant}
                        onChange={(e) => handleInputChange('whale_regulation_compliant', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-600"
                      />
                      <span className="text-sm text-slate-300">✅ Whale Regulation Compliant (2025)</span>
                    </label>

                    {formData.whale_regulation_compliant && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-300">Max group size:</label>
                        <input
                          type="number"
                          value={formData.max_whale_group_size}
                          onChange={(e) => handleInputChange('max_whale_group_size', parseInt(e.target.value))}
                          className="w-16 p-2 bg-slate-700/50 border border-slate-600 rounded text-white"
                          min="1"
                          max="6"
                        />
                      </div>
                    )}
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.weather_dependent}
                      onChange={(e) => handleInputChange('weather_dependent', e.target.checked)}
                      className="w-4 h-4 rounded border-slate-600"
                    />
                    <span className="text-sm text-slate-300">Weather dependent</span>
                  </label>

                  {formData.weather_dependent && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Backup Plan</label>
                      <textarea
                        value={formData.backup_plan}
                        onChange={(e) => handleInputChange('backup_plan', e.target.value)}
                        className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                        rows="2"
                        placeholder="What happens if weather is bad..."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Settings */}
              <div>
                <h4 className="text-md font-medium text-slate-300 mb-3 border-b border-slate-600 pb-2">Booking Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Auto-close hours before tour</label>
                    <input
                      type="number"
                      value={formData.auto_close_hours}
                      onChange={(e) => handleInputChange('auto_close_hours', parseInt(e.target.value))}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                      min="1"
                      max="48"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Special Notes</label>
                    <textarea
                      value={formData.special_notes}
                      onChange={(e) => handleInputChange('special_notes', e.target.value)}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                      rows="3"
                      placeholder="Additional information for customers..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4 border-t border-slate-600">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingTour ? 'Update Tour' : 'Create Tour')}
                </button>
                <button
                  onClick={resetForm}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition-all"
                >
                  Cancel
                </button>
                {editingTour && (
                  <div className="ml-auto text-xs text-slate-400">
                    Last updated: {editingTour.updated_at ? new Date(editingTour.updated_at).toLocaleString() : 'Never'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tours List */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-6">Your Tours</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="text-slate-400">Loading tours...</div>
            </div>
          ) : tours.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-slate-400 mb-4">No tours created yet</div>
              <button
                onClick={() => setShowForm(true)}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Create your first tour
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {tours.map((tour) => (
                <div key={tour.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{tour.tour_name}</h3>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm">
                          {tour.tour_type}
                        </span>
                        {tour.whale_regulation_compliant && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-sm">
                            ✅ Compliant
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDate(tour.tour_date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {tour.time_slot} ({tour.duration_hours}h)
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {tour.available_spots}/{tour.max_capacity} spots
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {tour.meeting_point}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-lg font-bold text-green-400">
                          {formatPrice(tour.discount_price_adult)}
                        </span>
                        <span className="text-sm text-slate-400 line-through">
                          {formatPrice(tour.original_price_adult)}
                        </span>
                        <span className="text-sm text-orange-400">
                          -{Math.round(tour.discount_percentage)}%
                        </span>
                      </div>

                      {tour.description && (
                        <p className="text-slate-400 text-sm mt-2 line-clamp-2">{tour.description}</p>
                      )}

                      <div className="flex flex-wrap gap-2 mt-3">
                        {tour.languages?.map(lang => (
                          <span key={lang} className="px-2 py-1 bg-slate-600/50 text-slate-300 rounded text-xs">
                            {availableLanguages.find(l => l.code === lang)?.flag} {lang}
                          </span>
                        ))}
                        {tour.pickup_available && (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                            🚐 Pickup
                          </span>
                        )}
                        {tour.equipment_included && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                            ⚙️ Equipment
                          </span>
                        )}
                        {tour.food_included && (
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-xs">
                            🍽️ Food
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(tour)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-600/50 rounded transition-all"
                        title="Edit tour"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tour.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-600/50 rounded transition-all"
                        title="Delete tour"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App