// operator-dashboard/src/App.js - Enhanced Booking Management System
import React, { useState, useEffect } from 'react'
import { 
  Plus, Calendar, Clock, Users, MapPin, Trash2, Edit2, 
  DollarSign, CheckCircle, XCircle, AlertCircle,
  MessageCircle, Phone, Timer, RefreshCw,
  User, Loader2, Filter, Search, Star,
  Clock3, Award, Lock, Unlock, BarChart3,
  
  // NEW ICONS:
  Save, X, Eye, EyeOff, Calculator, Percent, 
  Globe, Shield, Utensils, Camera, Heart, 
  Sun, Moon, Copy, RotateCcw, Settings, Info, 
  ChevronDown, ChevronUp, Waves, Mountain
} from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import Login from './components/Login'
import { operatorService } from './lib/supabase'
import Navigation from './components/Navigation'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

function App() {
  // ALL HOOKS MUST BE AT THE TOP
  const { operator, loading: authLoading, login, logout, isAuthenticated } = useAuth()
  
  // State management
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTour, setEditingTour] = useState(null)
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    declinedBookings: 0,
    completedBookings: 0,
    totalRevenue: 0
  })
  
  // Enhanced booking management
  const [allBookings, setAllBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [bookingFilter, setBookingFilter] = useState('all') // 'all', 'pending', 'confirmed', 'declined', 'completed'
  const [timeFilter, setTimeFilter] = useState('all') // 'all', 'today', 'tomorrow', 'week'
  const [searchTerm, setSearchTerm] = useState('')
  const [processingBooking, setProcessingBooking] = useState(null)
  const [showDeclineModal, setShowDeclineModal] = useState(null)
  const [declineReason, setDeclineReason] = useState('')

  // Form data state
  const [formData, setFormData] = useState({
    // Basic Info
    tour_name: '',
    tour_type: 'Whale Watching',
    description: '',
    
    // Schedule & Duration  
    tour_date: '',
    time_slot: '09:00',
    duration_hours: 3,
    
    // Capacity & Pricing
    max_capacity: 8,
    available_spots: 8,
    original_price_adult: 8000,
    discount_price_adult: 8000, // Start with no discount
    discount_price_child: 5600, // 70% of adult price
    discount_percentage: 0, // Start with no discount
    
    // Location & Pickup
    meeting_point: '',
    pickup_available: false,
    pickup_locations: [],
    
    // Inclusions & Services
    equipment_included: false,
    food_included: false,
    drinks_included: false,
    languages: ['French'],
    
    // Requirements & Restrictions - FIX THE FITNESS LEVEL
    min_age: null,
    max_age: null,
    fitness_level: 'easy', // Change from 'All levels' to 'easy' (lowercase)
    requirements: '',
    restrictions: '',
    
    // Compliance & Safety
    whale_regulation_compliant: true,
    max_whale_group_size: 6,
    weather_dependent: true,
    backup_plan: '',
    
    // Booking Settings
    auto_close_hours: 2,
    booking_deadline: null,
    special_notes: ''
  })

    // Enhanced tour form
    const [showPreview, setShowPreview] = useState(false)
    const [validationErrors, setValidationErrors] = useState({})
    const [expandedSections, setExpandedSections] = useState({
      basic: true,
      schedule: true,
      pricing: true,
      location: false,
      inclusions: false,
      requirements: false,
      compliance: false
    })

    // Constants
    const tourTypes = [
    { value: 'Whale Watching', icon: '🐋', color: 'bg-blue-500' },
    { value: 'Snorkeling', icon: '🤿', color: 'bg-cyan-500' },
    { value: 'Lagoon Tour', icon: '🏝️', color: 'bg-teal-500' },
    { value: 'Hike', icon: '🥾', color: 'bg-green-500' },
    { value: 'Cultural', icon: '🗿', color: 'bg-amber-500' },
    { value: 'Adrenalin', icon: '🪂', color: 'bg-red-500' },
    { value: 'Diving', icon: '🤿', color: 'bg-indigo-500' },
    { value: 'Mindfulness', icon: '🧘', color: 'bg-purple-500' }
  ]

  const timeSlots = [
    { value: '06:00', label: '06:00 - Sunrise', popular: true },
    { value: '09:00', label: '09:00 - Morning', popular: true },
    { value: '12:00', label: '12:00 - Midday' },
    { value: '14:00', label: '14:00 - Afternoon', popular: true },
    { value: '17:30', label: '17:30 - Sunset', popular: true },
    { value: '20:00', label: '20:00 - Night' }
  ]

  const fitnessLevels = [
  { value: 'easy', description: 'Suitable for everyone', color: 'text-green-400' },
  { value: 'moderate', description: 'Some physical activity required', color: 'text-yellow-400' },
  { value: 'challenging', description: 'Good fitness required', color: 'text-orange-400' },
  { value: 'expert', description: 'Excellent fitness needed', color: 'text-red-400' }
]

  const availableLanguages = [
    { code: 'French', flag: '🇫🇷', name: 'Français' },
    { code: 'English', flag: '🇬🇧', name: 'English' },
    { code: 'German', flag: '🇩🇪', name: 'Deutsch' },
    { code: 'Spanish', flag: '🇪🇸', name: 'Español' },
    { code: 'Italian', flag: '🇮🇹', name: 'Italiano' },
    { code: 'Japanese', flag: '🇯🇵', name: '日本語' }
  ]

  // Enhanced utility functions
  const calculateDiscountPercentage = (original, discounted) => {
    if (!original || !discounted) return 0
    return Math.round(((original - discounted) / original) * 100)
  }

  const generateBookingDeadline = (tourDate, timeSlot, autoCloseHours) => {
    if (!tourDate || !timeSlot) return null
    const tourDateTime = new Date(`${tourDate}T${timeSlot}:00`)
    return new Date(tourDateTime.getTime() - (autoCloseHours * 60 * 60 * 1000))
  }

  const getQuickDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      dates.push({
        date: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      })
    }
    return dates
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // useEffect hook
  useEffect(() => {
    if (isAuthenticated && operator?.id) {
      fetchTours()
      fetchAllBookings()
      
      // Set up polling for real-time updates
      const interval = setInterval(() => {
        fetchAllBookings()
      }, 30000) // Poll every 30 seconds

      return () => clearInterval(interval)
    }
  }, [isAuthenticated, operator?.id])

  // Filter bookings when filters change
  useEffect(() => {
    applyFilters()
  }, [allBookings, bookingFilter, timeFilter, searchTerm])

  // API Functions
  const fetchTours = async () => {
    if (!operator?.id) return
    
    setLoading(true)
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/tours?operator_id=eq.${operator.id}&select=*`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      })
      const data = await response.json()
      setTours(data || [])
    } catch (error) {
      console.error('Error fetching tours:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllBookings = async () => {
    if (!operator?.id) return
    
    setBookingsLoading(true)
    try {
      // Fetch all bookings (not just pending)
      const response = await fetch(`${supabaseUrl}/rest/v1/bookings?operator_id=eq.${operator.id}&select=*,tours:tour_id(tour_name,tour_date,time_slot,meeting_point,tour_type)&order=created_at.desc`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      })
      const data = await response.json()
      setAllBookings(data || [])
      
      // Calculate enhanced stats
      const stats = calculateStats(data || [])
      setStats(stats)
      
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setBookingsLoading(false)
    }
  }

  const calculateStats = (bookings) => {
    const stats = {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(b => b.booking_status === 'pending').length,
      confirmedBookings: bookings.filter(b => b.booking_status === 'confirmed').length,
      declinedBookings: bookings.filter(b => b.booking_status === 'declined').length,
      completedBookings: bookings.filter(b => b.booking_status === 'completed').length,
      totalRevenue: bookings
        .filter(b => b.booking_status === 'confirmed' || b.booking_status === 'completed')
        .reduce((sum, b) => sum + (b.subtotal || 0), 0)
    }
    return stats
  }

  const applyFilters = () => {
    let filtered = [...allBookings]
    
    // Status filter
    if (bookingFilter !== 'all') {
      filtered = filtered.filter(booking => booking.booking_status === bookingFilter)
    }
    
    // Time filter
    if (timeFilter !== 'all') {
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      switch (timeFilter) {
        case 'today':
          filtered = filtered.filter(b => b.tours?.tour_date === today)
          break
        case 'tomorrow':
          filtered = filtered.filter(b => b.tours?.tour_date === tomorrow)
          break
        case 'week':
          filtered = filtered.filter(b => b.tours?.tour_date <= weekFromNow)
          break
      }
    }
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.booking_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.tours?.tour_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredBookings(filtered)
  }

  const handleBookingAction = async (bookingId, action, reason = null) => {
    setProcessingBooking(bookingId)
    try {
      const updateData = {
        booking_status: action,
        operator_response: action.toUpperCase(),
        operator_response_received_at: new Date().toISOString(),
        operator_response_method: 'dashboard'
      }

      if (action === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString()
      } else if (action === 'declined') {
        updateData.cancelled_at = new Date().toISOString()
        updateData.decline_reason = reason
      }

      const response = await fetch(`${supabaseUrl}/rest/v1/bookings?id=eq.${bookingId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        // Refresh all bookings to update the UI
        await fetchAllBookings()
        alert(`Booking ${action} successfully!`)
      } else {
        throw new Error('Failed to update booking')
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('Failed to update booking. Please try again.')
    } finally {
      setProcessingBooking(null)
      setShowDeclineModal(null)
      setDeclineReason('')
    }
  }

  const handleDeclineBooking = (bookingId) => {
    setShowDeclineModal(bookingId)
  }

  const confirmDecline = () => {
    if (declineReason.trim()) {
      handleBookingAction(showDeclineModal, 'declined', declineReason.trim())
    } else {
      alert('Please provide a reason for declining the booking.')
    }
  }

  // Utility functions
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Date TBD'
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price || 0) + ' XPF'
  }

  const getTimeUntilDeadline = (deadline) => {
    if (!deadline) return { text: 'No deadline', urgent: false }
    
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffMs = deadlineDate - now
    
    if (diffMs <= 0) return { text: 'EXPIRED', urgent: true }
    
    const minutes = Math.floor(diffMs / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return { 
        text: `${hours}h ${minutes % 60}m left`, 
        urgent: hours < 1 
      }
    }
    return { 
      text: `${minutes}m left`, 
      urgent: minutes < 30 
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'declined':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />
      case 'declined':
        return <XCircle className="w-4 h-4" />
      case 'pending':
        return <Clock3 className="w-4 h-4" />
      case 'completed':
        return <Award className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const shouldShowCustomerDetails = (booking) => {
    return booking.booking_status === 'confirmed' || booking.booking_status === 'completed'
  }

  // Form handlers 
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Auto-calculate related fields
      if (field === 'original_price_adult' || field === 'discount_price_adult') {
        const percentage = calculateDiscountPercentage(
          field === 'original_price_adult' ? value : newData.original_price_adult,
          field === 'discount_price_adult' ? value : newData.discount_price_adult
        )
        newData.discount_percentage = percentage
        
        // Auto-calculate child price (70% of adult discount price)
        if (field === 'discount_price_adult') {
          newData.discount_price_child = Math.round(value * 0.7)
        }
      }
      
      if (field === 'discount_percentage') {
        const discountPrice = Math.round(newData.original_price_adult * (1 - value / 100))
        newData.discount_price_adult = discountPrice
        newData.discount_price_child = Math.round(discountPrice * 0.7)
      }
      
      if (field === 'max_capacity') {
        newData.available_spots = value
      }
      
      if (['tour_date', 'time_slot', 'auto_close_hours'].includes(field)) {
        newData.booking_deadline = generateBookingDeadline(
          field === 'tour_date' ? value : newData.tour_date,
          field === 'time_slot' ? value : newData.time_slot,
          field === 'auto_close_hours' ? value : newData.auto_close_hours
        )
      }
      
      // Auto-check whale compliance for whale watching tours
      if (field === 'tour_type' && value === 'Whale Watching') {
        newData.whale_regulation_compliant = true
      }
      
      return newData
    })
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      alert('Please fix the errors in the form')
      return
    }
    
    try {
      setLoading(true)
      
      const tourData = {
        ...formData,
        operator_id: operator.id,
        status: 'active',
        created_by_operator: true
      }

      if (editingTour) {
        await operatorService.updateTour(editingTour.id, tourData)
        alert('Tour updated successfully!')
      } else {
        await operatorService.createTour(tourData)
        alert('Tour created successfully!')
      }
      
      resetForm()
      fetchTours()
      fetchAllBookings() // Refresh stats too
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
      duration_hours: tour.duration_hours || 3,
      max_capacity: tour.max_capacity || 8,
      available_spots: tour.available_spots || 8,
      original_price_adult: tour.original_price_adult || 8000,
      discount_price_adult: tour.discount_price_adult || 6400,
      discount_price_child: tour.discount_price_child || 4480,
      discount_percentage: tour.discount_percentage || 20,
      meeting_point: tour.meeting_point || '',
      pickup_available: tour.pickup_available || false,
      pickup_locations: tour.pickup_locations || [],
      equipment_included: tour.equipment_included || false,
      food_included: tour.food_included || false,
      drinks_included: tour.drinks_included || false,
      languages: tour.languages || ['French'],
      min_age: tour.min_age || null,
      max_age: tour.max_age || null,
      fitness_level: tour.fitness_level || 'All levels',
      requirements: tour.requirements || '',
      restrictions: tour.restrictions || '',
      whale_regulation_compliant: tour.whale_regulation_compliant ?? true,
      max_whale_group_size: tour.max_whale_group_size || 6,
      weather_dependent: tour.weather_dependent ?? true,
      backup_plan: tour.backup_plan || '',
      auto_close_hours: tour.auto_close_hours || 2,
      booking_deadline: tour.booking_deadline || null,
      special_notes: tour.special_notes || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (tourId) => {
    if (window.confirm('Are you sure you want to delete this tour? This action cannot be undone.')) {
      try {
        setLoading(true)
        await operatorService.deleteTour(tourId)
        await fetchTours() // Refresh the list
        alert('Tour deleted successfully!')
      } catch (error) {
        console.error('Error deleting tour:', error)
        alert('Error deleting tour. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  // Enhanced form handlers
  const handleLanguageToggle = (languageCode) => {
    const currentLanguages = formData.languages || []
    if (currentLanguages.includes(languageCode)) {
      if (currentLanguages.length > 1) {
        handleInputChange('languages', currentLanguages.filter(lang => lang !== languageCode))
      }
    } else {
      handleInputChange('languages', [...currentLanguages, languageCode])
    }
  }

  const handlePickupLocationAdd = (location) => {
    if (location.trim() && !formData.pickup_locations.includes(location.trim())) {
      handleInputChange('pickup_locations', [...formData.pickup_locations, location.trim()])
    }
  }

  const handlePickupLocationRemove = (index) => {
    const newLocations = formData.pickup_locations.filter((_, i) => i !== index)
    handleInputChange('pickup_locations', newLocations)
  }

const validateForm = () => {
  const errors = {}
  
  if (!formData.tour_name.trim()) errors.tour_name = 'Tour name is required'
  if (!formData.description.trim()) errors.description = 'Description is required'
  if (!formData.tour_date) errors.tour_date = 'Tour date is required'
  if (!formData.meeting_point.trim()) errors.meeting_point = 'Meeting point is required'
  if (formData.max_capacity < 1) errors.max_capacity = 'Capacity must be at least 1'
  if (formData.original_price_adult < 1000) errors.original_price_adult = 'Price too low'
  
  // Fix the discount price validation for 0% discount
  if (formData.discount_percentage > 0 && formData.discount_price_adult >= formData.original_price_adult) {
    errors.discount_price_adult = 'Discount price must be less than original price'
  }
  
  const today = new Date().toISOString().split('T')[0]
  if (formData.tour_date && formData.tour_date < today) {
    errors.tour_date = 'Tour date cannot be in the past'
  }
  
  setValidationErrors(errors)
  return Object.keys(errors).length === 0
}

  const handleDuplicate = (tour) => {
    const duplicatedTour = {
      ...tour,
      tour_name: `${tour.tour_name} (Copy)`,
      tour_date: '',
      id: `tour_${Date.now()}_copy`
    }
    setEditingTour(null)
    setFormData(duplicatedTour)
    setShowForm(true)
  }

  // resetForm FUNCTION

  const resetForm = () => {
    setFormData({
      tour_name: '',
      tour_type: 'Whale Watching',
      description: '',
      tour_date: '',
      time_slot: '09:00',
      duration_hours: 3,
      max_capacity: 8,
      available_spots: 8,
      original_price_adult: 8000,
      discount_price_adult: 8000, // No discount by default
      discount_price_child: 5600,
      discount_percentage: 0, // No discount by default
      meeting_point: '',
      pickup_available: false,
      pickup_locations: [],
      equipment_included: false,
      food_included: false,
      drinks_included: false,
      languages: ['French'],
      min_age: null,
      max_age: null,
      fitness_level: 'easy', // Use database-compatible value
      requirements: '',
      restrictions: '',
      whale_regulation_compliant: true,
      max_whale_group_size: 6,
      weather_dependent: true,
      backup_plan: '',
      auto_close_hours: 2,
      booking_deadline: null,
      special_notes: ''
    })
    setEditingTour(null)
    setShowForm(false)
    setValidationErrors({})
    setShowPreview(false)
  }

// EARLY RETURNS - ONLY AFTER ALL HOOKS
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login onLogin={login} loading={authLoading} />
  }

  // MAIN COMPONENT RENDER
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-6 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">VAI Tickets - Operator Dashboard</h1>
              <p className="text-slate-400">Welcome back, {operator?.company_name}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors border border-slate-600 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>


        {/* Booking Management Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Enhanced Clickable Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <button
                onClick={() => setBookingFilter('all')}
                className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border transition-all hover:scale-105 ${
                  bookingFilter === 'all' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-slate-300 font-medium text-sm">Total</h3>
                </div>
                <p className="text-xl font-bold text-white">{stats.totalBookings}</p>
              </button>

              <button
                onClick={() => setBookingFilter('pending')}
                className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border transition-all hover:scale-105 ${
                  bookingFilter === 'pending' ? 'border-yellow-500 bg-yellow-500/10' : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <Clock3 className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-slate-300 font-medium text-sm">Pending</h3>
                </div>
                <p className="text-xl font-bold text-white">{stats.pendingBookings}</p>
              </button>

              <button
                onClick={() => setBookingFilter('confirmed')}
                className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border transition-all hover:scale-105 ${
                  bookingFilter === 'confirmed' ? 'border-green-500 bg-green-500/10' : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-slate-300 font-medium text-sm">Confirmed</h3>
                </div>
                <p className="text-xl font-bold text-white">{stats.confirmedBookings}</p>
              </button>

              <button
                onClick={() => setBookingFilter('declined')}
                className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border transition-all hover:scale-105 ${
                  bookingFilter === 'declined' ? 'border-red-500 bg-red-500/10' : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-slate-300 font-medium text-sm">Declined</h3>
                </div>
                <p className="text-xl font-bold text-white">{stats.declinedBookings}</p>
              </button>

              <button
                onClick={() => setBookingFilter('completed')}
                className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border transition-all hover:scale-105 ${
                  bookingFilter === 'completed' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-slate-300 font-medium text-sm">Completed</h3>
                </div>
                <p className="text-xl font-bold text-white">{stats.completedBookings}</p>
              </button>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-slate-300 font-medium text-sm">Revenue</h3>
                </div>
                <p className="text-lg font-bold text-white">{formatPrice(stats.totalRevenue)}</p>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <select
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value)}
                      className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="tomorrow">Tomorrow</option>
                      <option value="week">This Week</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search bookings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm w-full sm:w-64"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">
                    Showing {filteredBookings.length} of {allBookings.length} bookings
                  </span>
                  <button
                    onClick={fetchAllBookings}
                    disabled={bookingsLoading}
                    className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                    title="Refresh bookings"
                  >
                    <RefreshCw className={`w-5 h-5 ${bookingsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              
              {bookingFilter !== 'all' && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-slate-400">Filtered by:</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(bookingFilter)}`}>
                    {getStatusIcon(bookingFilter)}
                    <span className="capitalize">{bookingFilter}</span>
                  </span>
                  <button
                    onClick={() => setBookingFilter('all')}
                    className="text-xs text-slate-400 hover:text-white ml-2"
                  >
                    Clear filter
                  </button>
                </div>
              )}
            </div>

            {/* Bookings List */}
            {bookingsLoading ? (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
                <p className="text-slate-300">Loading bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 text-center">
                <div className="text-slate-400 mb-4">
                  {bookingFilter === 'all' ? 'No bookings found' : `No ${bookingFilter} bookings found`}
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => {
                  const deadline = getTimeUntilDeadline(booking.confirmation_deadline)
                  const showDetails = shouldShowCustomerDetails(booking)
                  
                  return (
                    <div key={booking.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
                      {/* Booking Header */}
                      <div className="p-6 border-b border-slate-700">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-white">
                                {booking.tours?.tour_name || 'Unknown Tour'}
                              </h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.booking_status)}`}>
                                {getStatusIcon(booking.booking_status)}
                                <span className="capitalize">{booking.booking_status}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-300">
                              <span>Ref: {booking.booking_reference}</span>
                              <span>•</span>
                              <span>{(booking.num_adults || 0) + (booking.num_children || 0)} participant{((booking.num_adults || 0) + (booking.num_children || 0)) > 1 ? 's' : ''}</span>
                              <span>•</span>
                              <span>{formatPrice((booking.subtotal || 0) + (booking.commission_amount || 0))}</span>
                            </div>
                          </div>
                          
                          {booking.booking_status === 'pending' && (
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                              deadline.urgent 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              <Timer className="w-4 h-4" />
                              {deadline.text}
                            </div>
                          )}
                        </div>

                        {/* Tour Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-300">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(booking.tours?.tour_date)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {booking.tours?.time_slot || 'Time TBD'}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {booking.tours?.meeting_point || 'Location TBD'}
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {showDetails ? booking.customer_name : '*** ***'}
                            {!showDetails && <Lock className="w-3 h-3 text-slate-500" />}
                          </div>
                        </div>
                      </div>

                      {/* Customer Information - Progressive Disclosure */}
                      <div className="p-6 bg-slate-700/30">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-medium flex items-center gap-2">
                            Customer Details
                            {showDetails ? (
                              <Unlock className="w-4 h-4 text-green-400" />
                            ) : (
                              <Lock className="w-4 h-4 text-slate-500" />
                            )}
                          </h4>
                          {!showDetails && (
                            <div className="text-xs text-slate-400 bg-slate-600/30 px-2 py-1 rounded">
                              🔒 Details unlock after confirmation
                            </div>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="text-slate-400">Name:</span>
                              <span className="text-white ml-2">
                                {showDetails ? booking.customer_name : '*** ***'}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-slate-400">Contact:</span>
                              <span className="text-white ml-2">
                                {showDetails ? booking.customer_whatsapp : '+*** *** ***'}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-slate-400">Email:</span>
                              <span className="text-white ml-2">
                                {showDetails ? booking.customer_email : '***@***.***'}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-slate-400">Participants:</span>
                              <span className="text-white ml-2">
                                {booking.num_adults} adult{booking.num_adults > 1 ? 's' : ''}
                                {booking.num_children > 0 && `, ${booking.num_children} child${booking.num_children > 1 ? 'ren' : ''}`}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {booking.special_requirements && (
                              <div className="text-sm">
                                <span className="text-slate-400">Special Requirements:</span>
                                <span className="text-white ml-2">{booking.special_requirements}</span>
                              </div>
                            )}
                            {booking.dietary_restrictions && (
                              <div className="text-sm">
                                <span className="text-slate-400">Dietary:</span>
                                <span className="text-white ml-2">{booking.dietary_restrictions}</span>
                              </div>
                            )}
                            {booking.accessibility_needs && (
                              <div className="text-sm">
                                <span className="text-slate-400">Accessibility:</span>
                                <span className="text-white ml-2">{booking.accessibility_needs}</span>
                              </div>
                            )}
                            <div className="text-sm">
                              <span className="text-slate-400">Booked:</span>
                              <span className="text-white ml-2">{new Date(booking.created_at).toLocaleString()}</span>
                            </div>
                            {booking.booking_status === 'declined' && booking.decline_reason && (
                              <div className="text-sm">
                                <span className="text-slate-400">Decline Reason:</span>
                                <span className="text-red-300 ml-2">{booking.decline_reason}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons - Context Sensitive */}
                      <div className="p-6 border-t border-slate-700">
                        {booking.booking_status === 'pending' && (
                          <div className="space-y-4">
                            <div className="flex gap-4">
                              <button
                                onClick={() => handleBookingAction(booking.id, 'confirmed')}
                                disabled={processingBooking === booking.id}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                              >
                                {processingBooking === booking.id ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-5 h-5" />
                                )}
                                CONFIRM BOOKING
                              </button>
                              <button
                                onClick={() => handleDeclineBooking(booking.id)}
                                disabled={processingBooking === booking.id}
                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                              >
                                <XCircle className="w-5 h-5" />
                                DECLINE
                              </button>
                            </div>
                            <div className="text-xs text-center text-slate-400">
                              Customer contact details will be unlocked after confirmation
                            </div>
                          </div>
                        )}

                        {booking.booking_status === 'confirmed' && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <a
                                href={`https://wa.me/${booking.customer_whatsapp}?text=Hi ${booking.customer_name}! This is regarding your confirmed booking ${booking.booking_reference}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                              >
                                <MessageCircle className="w-4 h-4" />
                                WhatsApp Customer
                              </a>
                              <a
                                href={`tel:${booking.customer_phone}`}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                              >
                                <Phone className="w-4 h-4" />
                                Call Customer
                              </a>
                              <button
                                onClick={() => handleBookingAction(booking.id, 'completed')}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                              >
                                <Award className="w-4 h-4" />
                                Mark Complete
                              </button>
                            </div>
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                              <p className="text-green-300 text-sm">
                                ✅ Booking confirmed! Customer contact details are now available. 
                                You can communicate directly with {booking.customer_name}.
                              </p>
                            </div>
                          </div>
                        )}

                        {booking.booking_status === 'declined' && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
                              <XCircle className="w-5 h-5" />
                              Booking Declined
                            </div>
                            <p className="text-slate-300 text-sm mb-2">
                              This booking was declined on {new Date(booking.cancelled_at).toLocaleString()}.
                            </p>
                            {booking.decline_reason && (
                              <div className="text-sm">
                                <strong className="text-slate-300">Reason provided:</strong>
                                <span className="text-red-300 ml-2">"{booking.decline_reason}"</span>
                              </div>
                            )}
                          </div>
                        )}

                        {booking.booking_status === 'completed' && (
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-blue-400 font-medium mb-2">
                              <Award className="w-5 h-5" />
                              Tour Completed
                            </div>
                            <p className="text-slate-300 text-sm mb-3">
                              Great job! This tour was completed successfully.
                            </p>
                            <div className="flex gap-2">
                              <a
                                href={`https://wa.me/${booking.customer_whatsapp}?text=Hi ${booking.customer_name}! Thank you for joining our ${booking.tours?.tour_name}! We hope you had an amazing experience. Please share your feedback!`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-xs"
                              >
                                <MessageCircle className="w-3 h-3" />
                                Follow Up
                              </a>
                              <button className="flex items-center gap-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-xs">
                                <Star className="w-3 h-3" />
                                Request Review
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Enhanced Tours Management Tab */}
{activeTab === 'dashboard' && (
  <div className="space-y-6">
    {/* Enhanced Header */}
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Tour Management</h2>
        <p className="text-slate-400">Create and manage your tour offerings</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Create New Tour
        </button>
      </div>
    </div>

    {/* Enhanced Tour Creation Form */}
    {showForm && (
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
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Tour Name *
                        </label>
                        <input
                          type="text"
                          value={formData.tour_name}
                          onChange={(e) => handleInputChange('tour_name', e.target.value)}
                          className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 transition-colors ${
                            validationErrors.tour_name ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
                          }`}
                          placeholder="e.g., Whale Watching Sunset Adventure"
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
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Duration (hours)
                        </label>
                        <input
                          type="number"
                          value={formData.duration_hours}
                          onChange={(e) => handleInputChange('duration_hours', parseFloat(e.target.value))}
                          className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500"
                          min="0.5"
                          max="12"
                          step="0.5"
                        />
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
                            step="500"
                          />
                          <p className="text-slate-400 text-xs mt-1">{formatPrice(formData.original_price_adult)}</p>
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
                          <span className="text-slate-300">Your Revenue (per adult, after 10% commission):</span>
                          <span className="text-blue-400 font-medium">{formatPrice(Math.round(formData.discount_price_adult * 0.9))}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-slate-300">Potential Revenue (if full):</span>
                          <span className="text-purple-400 font-medium">{formatPrice(Math.round(formData.discount_price_adult * 0.9 * formData.max_capacity))}</span>
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
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Meeting Point *
                      </label>
                      <input
                        type="text"
                        value={formData.meeting_point}
                        onChange={(e) => handleInputChange('meeting_point', e.target.value)}
                        className={`w-full p-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 transition-colors ${
                          validationErrors.meeting_point ? 'border-red-500' : 'border-slate-600 focus:border-blue-500'
                        }`}
                        placeholder="e.g., Marina de Moorea, Dock 3"
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
      </div>
    )}
    

    {/* Enhanced Tours List - keep your existing tours list here */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">Your Tours</h3>
                <p className="text-slate-400 mt-1">Manage your tour offerings and track performance</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-400">
                  {tours.length} tour{tours.length !== 1 ? 's' : ''} total
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <div className="text-slate-400">Loading tours...</div>
              </div>
            ) : tours.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="text-white font-medium mb-2">No tours created yet</h4>
                <p className="text-slate-400 mb-4">Start by creating your first tour experience</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Create Your First Tour
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {tours.map((tour) => {
                  const tourType = tourTypes.find(t => t.value === tour.tour_type) || tourTypes[0]
                  const isUpcoming = new Date(tour.tour_date) >= new Date()
                  const bookedSpots = tour.max_capacity - tour.available_spots
                  const occupancyRate = Math.round((bookedSpots / tour.max_capacity) * 100)
                  
                  return (
                    <div key={tour.id} className="bg-slate-700/30 rounded-xl p-6 border border-slate-600 hover:border-slate-500 transition-all">
                      {/* Tour Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 ${tourType.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                              {tourType.icon}
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-white">{tour.tour_name}</h4>
                              <div className="flex items-center gap-3 text-sm text-slate-400">
                                <span className="capitalize">{tour.tour_type}</span>
                                <span>•</span>
                                <span>{tour.duration_hours}h duration</span>
                                {!isUpcoming && (
                                  <>
                                    <span>•</span>
                                    <span className="text-red-400">Past tour</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleDuplicate(tour)}
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-600/50 rounded-lg transition-all"
                            title="Duplicate tour"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(tour)}
                            className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-600/50 rounded-lg transition-all"
                            title="Edit tour"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tour.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-600/50 rounded-lg transition-all"
                            title="Delete tour"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Tour Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-slate-400" />
                          <div>
                            <div className="text-white font-medium">
                              {new Date(tour.tour_date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                            <div className="text-slate-400 text-sm">{tour.time_slot}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-slate-400" />
                          <div>
                            <div className="text-white font-medium">
                              {bookedSpots}/{tour.max_capacity} booked
                            </div>
                            <div className="text-slate-400 text-sm">
                              {occupancyRate}% occupancy
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-slate-400" />
                          <div>
                            <div className="text-white font-medium">
                              {formatPrice(tour.discount_price_adult)}
                            </div>
                            <div className="text-slate-400 text-sm">
                              -{tour.discount_percentage || 0}% off
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-slate-400" />
                          <div>
                            <div className="text-white font-medium truncate">
                              {tour.meeting_point}
                            </div>
                            <div className="text-slate-400 text-sm">
                              {tour.pickup_available ? 'Pickup available' : 'No pickup'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tour Features */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tour.equipment_included && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                            <Camera className="w-3 h-3" />
                            Equipment
                          </span>
                        )}
                        {tour.food_included && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                            <Utensils className="w-3 h-3" />
                            Food
                          </span>
                        )}
                        {tour.drinks_included && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs">
                            <Waves className="w-3 h-3" />
                            Drinks
                          </span>
                        )}
                        {tour.whale_regulation_compliant && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs">
                            <Shield className="w-3 h-3" />
                            Compliant
                          </span>
                        )}
                        {tour.languages && tour.languages.length > 1 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                            <Globe className="w-3 h-3" />
                            {tour.languages.length} languages
                          </span>
                        )}
                      </div>

                      {/* Occupancy Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-400">Booking Progress</span>
                          <span className="text-sm text-slate-300">{occupancyRate}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              occupancyRate >= 90 ? 'bg-red-500' :
                              occupancyRate >= 70 ? 'bg-yellow-500' :
                              occupancyRate >= 40 ? 'bg-blue-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${occupancyRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Revenue Projection */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-slate-400">
                          Revenue: {formatPrice(bookedSpots * tour.discount_price_adult * 0.9)} / {formatPrice(tour.max_capacity * tour.discount_price_adult * 0.9)}
                        </div>
                        <div className="flex items-center gap-4">
                          {tour.status === 'active' && isUpcoming && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </span>
                          )}
                          {!isUpcoming && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-500/20 text-slate-400 rounded-full text-xs">
                              <Clock className="w-3 h-3" />
                              Completed
                            </span>
                          )}
                          <span className="text-slate-500 text-xs">
                            Updated {new Date(tour.updated_at || tour.created_at).toLocaleDateString()}
                          </span>
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

  // CREATE TAB

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Create New Tour</h2>
              <p className="text-slate-400">Tour creation form will go here...</p>
            </div>
          </div>
        )}

  // PROFILE TAB

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Profile & Settings</h2>
              <p className="text-slate-400">Profile management coming soon...</p>
            </div>
          </div>
        )}
    

        {/* Decline Modal */}
        {showDeclineModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Decline Booking</h3>
                  <p className="text-sm text-slate-400">Please provide a reason for declining</p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Reason for declining *
                </label>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  rows="3"
                  placeholder="e.g., Tour is fully booked, weather conditions, equipment issues..."
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  This reason will be sent to the customer to explain the decline.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeclineModal(null)
                    setDeclineReason('')
                  }}
                  className="flex-1 px-4 py-2 text-slate-300 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDecline}
                  disabled={!declineReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                >
                  Decline Booking
                </button>
              </div>
            </div>
          </div>
        )}

        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />
        
      </div>
    </div>
  )
}

export default App