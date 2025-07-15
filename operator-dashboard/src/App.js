// operator-dashboard/src/App.js - Enhanced Booking Management System
import React, { useState, useEffect } from 'react'
import './i18n/config'
import { 
  CheckCircle, XCircle, AlertCircle, Clock3, Award
} from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import Login from './components/Login'
import { operatorService } from './lib/supabase'
import Navigation from './components/Navigation'
import Header from './components/Header'
import DashboardTab from './components/DashboardTab'
import CreateTab from './components/CreateTab'
import BookingsTab from './components/BookingsTab'
import ProfileTab from './components/ProfileTab'
import { supabase } from './lib/supabase'
import { polynesianNow, toPolynesianISO } from './utils/timezone'


const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

  // Helper Function Round Up
  const roundUpToNearestHundred = (price) => {
    return Math.ceil(price / 100) * 100
  }

  // Function to lock commission rate when booking is confirmed

  const lockBookingCommission = async (bookingId) => {
    try {
      // First, check if commission is already locked
      const checkResponse = await fetch(`${supabaseUrl}/rest/v1/bookings?select=commission_locked_at&id=eq.${bookingId}`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      })
      
      const bookingData = await checkResponse.json()
      
      // Only lock if not already locked
      if (!bookingData[0]?.commission_locked_at) {
        const updateData = {
          commission_locked_at: new Date().toISOString()
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

        if (!response.ok) {
          throw new Error('Failed to lock commission rate')
        }

        console.log('✅ Commission rate locked for booking:', bookingId)
      } else {
        console.log('ℹ️ Commission already locked for booking:', bookingId)
      }
      
      return true
    } catch (error) {
      console.error('Error locking commission rate:', error)
      return false
    }
  }

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
    totalRevenue: 0,
    operator_revenue: 0,     
    total_commission: 0,     
    avg_response_time_hours: 2
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
  const [expandedBookings, setExpandedBookings] = useState({})
  const [sortBy, setSortBy] = useState('created_at')

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
    fitness_level: 'easy',
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
      compliance: false,
      allTours: false,
      recentActivity: false,
      insights: false
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
    // Handle invalid inputs to prevent NaN
    if (!original || !discounted || isNaN(original) || isNaN(discounted) || original <= 0) {
      return 0
    }
    
    // Calculate percentage safely
    const percentage = ((original - discounted) / original) * 100
    
    // Return rounded percentage, ensuring it's not NaN
    return Math.round(percentage) || 0
  }

    const getTodayInPolynesia = () => {
    const polynesiaTZ = 'Pacific/Tahiti'
    const today = new Date()
    const polynesiaToday = new Date(today.toLocaleString("en-US", {timeZone: polynesiaTZ}))
    
    const year = polynesiaToday.getFullYear()
    const month = String(polynesiaToday.getMonth() + 1).padStart(2, '0')
    const day = String(polynesiaToday.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  }

  const generateBookingDeadline = (tourDate, timeSlot, autoCloseHours) => {
    if (!tourDate || !timeSlot) return null
    const tourDateTime = new Date(`${tourDate}T${timeSlot}:00`)
    return new Date(tourDateTime.getTime() - (autoCloseHours * 60 * 60 * 1000))
  }

  const getQuickDates = () => {
    const dates = []
    
    // FIXED: Use French Polynesia timezone consistently
    const polynesiaTZ = 'Pacific/Tahiti' // UTC-10
    
    // Get current date in French Polynesia timezone
    const today = new Date()
    const polynesiaToday = new Date(today.toLocaleString("en-US", {timeZone: polynesiaTZ}))
    
    for (let i = 0; i < 7; i++) {
      // Create date in Polynesia timezone
      const date = new Date(polynesiaToday)
      date.setDate(polynesiaToday.getDate() + i)
      
      // Format date as YYYY-MM-DD in local Polynesia timezone
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateString = `${year}-${month}-${day}`
      
      // Create label
      let label
      if (i === 0) {
        label = 'Today'
      } else if (i === 1) {
        label = 'Tomorrow'
      } else {
        // Format as "Mon, Jun 30"
        label = date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          timeZone: polynesiaTZ
        })
      }
      
      dates.push({
        date: dateString,
        label: label
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
      loadDashboardStats()  // ✅ ADD this line
      
      // Set up polling for real-time updates
      const interval = setInterval(() => {
        fetchAllBookings() // This will call loadDashboardStats internally, so no duplication
      }, 60000) // Poll every 60 seconds 

      return () => clearInterval(interval)
    }
  }, [isAuthenticated, operator?.id])

  // Filter bookings when filters change
    useEffect(() => {
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
  }, [allBookings, bookingFilter, timeFilter, searchTerm])

  // 🆕 ADD THIS: Handle auth success messages from email links
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const message = urlParams.get('message')
    
    if (message === 'welcome') {
      console.log('🎉 Welcome! Your email has been confirmed.')
      // Optional: You can add a visual notification here later
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
    }
    if (message === 'signin') {
      console.log('📧 Please sign in to continue.')
      window.history.replaceState({}, '', window.location.pathname)
    }
    if (message === 'reset') {
      console.log('🔑 Password reset successful! You can now sign in.')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

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

    const startTime = Date.now()
    
    setBookingsLoading(true)
    try {
      // Use Supabase client instead of fetch API 
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, booking_reference, booking_status, created_at, 
          customer_name, customer_email, customer_whatsapp,
          num_adults, num_children, subtotal, total_amount, commission_amount,
          tours:tour_id(tour_name, tour_date, time_slot, meeting_point, tour_type)
        `)
        .eq('operator_id', operator.id)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.warn('Error fetching bookings:', error)
        setAllBookings([])
      } else {
        setAllBookings(data || [])
      }
      
      // Call loadDashboardStats but it will be optimized to use existing data
      await loadDashboardStats()
      
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setAllBookings([])
    } finally {
      setBookingsLoading(false)
      // Log total timing
      console.log(`🏁 Total fetchAllBookings completed in ${Date.now() - startTime}ms`)
    }
  }

  /*
  const calculateStats = (bookings) => {
    const stats = {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(b => b.booking_status === 'pending').length,
      confirmedBookings: bookings.filter(b => b.booking_status === 'confirmed').length,
      declinedBookings: bookings.filter(b => b.booking_status === 'declined').length,
      completedBookings: bookings.filter(b => b.booking_status === 'completed').length,
      activeTours: tours.filter(t => t.status === 'active' && new Date(t.tour_date) >= new Date()).length,
      totalRevenue: bookings
        .filter(b => b.booking_status === 'confirmed' || b.booking_status === 'completed')
        .reduce((sum, b) => sum + (b.subtotal || 0), 0)
    }
    return stats
  }
    */

  // Dashboard Stats
  const loadDashboardStats = async () => {
    if (!operator?.id) return

    try {
      // First try to use existing allBookings data to avoid duplicate query
      let bookingsData = allBookings

      //  Only query if no existing data (like on initial load)
      if (!bookingsData || bookingsData.length === 0) {
        const { data, error: bookingsError } = await supabase
          .from('bookings')
          .select('booking_status, subtotal, commission_amount') //  needed for stats
          .eq('operator_id', operator.id)

        if (bookingsError) {
          console.warn('No bookings found:', bookingsError)
          bookingsData = []
        } else {
          bookingsData = data || []
        }
      }

      // all existing calculation logic EXACTLY the same
      const totalBookings = bookingsData?.length || 0
      const confirmedBookings = bookingsData?.filter(b => b.booking_status === 'confirmed').length || 0
      const completedBookings = bookingsData?.filter(b => ['confirmed', 'completed'].includes(b.booking_status)).length || 0
      const pendingBookings = bookingsData?.filter(b => b.booking_status === 'pending').length || 0
      const declinedBookings = bookingsData?.filter(b => b.booking_status === 'declined').length || 0
      const cancelledBookings = bookingsData?.filter(b => b.booking_status === 'cancelled').length || 0
      
      //  revenue calculation EXACTLY the same
      const operatorRevenue = bookingsData
        ?.filter(b => ['confirmed', 'completed'].includes(b.booking_status))
        ?.reduce((sum, b) => sum + (b.subtotal || 0), 0) || 0

      const totalCommission = bookingsData
        ?.filter(b => ['confirmed', 'completed'].includes(b.booking_status))
        ?.reduce((sum, b) => sum + (b.commission_amount || 0), 0) || 0

      //  stats object structure EXACTLY the same
      setStats({
        totalBookings,
        pendingBookings,
        confirmedBookings,
        declinedBookings,
        cancelledBookings,
        completedBookings,
        activeTours: tours.filter(t => t.status === 'active' && new Date(t.tour_date) >= new Date()).length,
        totalRevenue: operatorRevenue, //  field for compatibility
        operator_revenue: operatorRevenue,  // operator revenue
        total_commission: totalCommission,  // Commission amount
        avg_response_time_hours: 2
      })

    } catch (error) {
      console.error('Error loading dashboard stats:', error)
      // Error fallback
      setStats({
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        declinedBookings: 0,
        cancelledBookings: 0,
        completedBookings: 0,
        activeTours: 0,
        totalRevenue: 0,
        operator_revenue: 0,
        total_commission: 0,
        avg_response_time_hours: 0
      })
    }
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
        operator_response_received_at: toPolynesianISO(new Date()),
        operator_response_method: 'dashboard'
      }

      if (action === 'confirmed') {
        updateData.confirmed_at = toPolynesianISO(new Date())
        
        // Lock commission rate when confirming
        await lockBookingCommission(bookingId)
        
      } else if (action === 'completed') {
        updateData.completed_at = toPolynesianISO(new Date())
        
        // Lock commission rate when marking complete
        await lockBookingCommission(bookingId)
        
      } else if (action === 'declined') {
        updateData.cancelled_at = toPolynesianISO(new Date())
        updateData.decline_reason = reason
      
      } else if (action === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString()
        // Customer-initiated cancellation - no decline_reason needed
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
        await loadDashboardStats()  
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
    // Show details only for active business relationships
    // Hide for: pending, declined, cancelled (privacy protection)
    return ['confirmed', 'completed'].includes(booking.booking_status)
  }

  // Form handlers 
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      // Handle numeric fields properly to avoid NaN
      let processedValue = value
      
      // Handle numeric fields - prevent NaN
      const numericFields = ['max_capacity', 'available_spots', 'original_price_adult', 'discount_price_adult', 'duration_hours', 'min_age', 'max_age', 'max_whale_group_size', 'auto_close_hours']
      
      if (numericFields.includes(field)) {
        // If value is empty string or NaN, set to null or appropriate default
        if (value === '' || value === null || value === undefined || isNaN(value)) {
          processedValue = ['min_age', 'max_age'].includes(field) ? null : 
                          field === 'duration_hours' ? 3 :
                          field === 'max_capacity' ? 8 :
                          field === 'available_spots' ? 8 :
                          field === 'original_price_adult' ? 8000 :
                          field === 'discount_price_adult' ? 8000 :
                          field === 'max_whale_group_size' ? 6 :
                          field === 'auto_close_hours' ? 2 : 0
        } else {
          // Convert to number for numeric fields
          processedValue = Number(value)
          // Double-check it's not NaN after conversion
          if (isNaN(processedValue)) {
            processedValue = ['min_age', 'max_age'].includes(field) ? null : 
                            field === 'duration_hours' ? 3 :
                            field === 'max_capacity' ? 8 :
                            field === 'available_spots' ? 8 :
                            field === 'original_price_adult' ? 8000 :
                            field === 'discount_price_adult' ? 8000 :
                            field === 'max_whale_group_size' ? 6 :
                            field === 'auto_close_hours' ? 2 : 0
          }
        }
      }

      const newData = { ...prev, [field]: processedValue }
      
      // Auto-calculate related fields (only if values are valid numbers)
      if (field === 'original_price_adult' || field === 'discount_price_adult') {
        const originalPrice = field === 'original_price_adult' ? processedValue : newData.original_price_adult
        const discountPrice = field === 'discount_price_adult' ? processedValue : newData.discount_price_adult
        
        if (originalPrice && discountPrice && !isNaN(originalPrice) && !isNaN(discountPrice)) {
          const percentage = calculateDiscountPercentage(originalPrice, discountPrice)
          newData.discount_percentage = percentage
          
          // Auto-calculate child price (70% of adult discount price)
          if (field === 'discount_price_adult') {
            newData.discount_price_child = Math.round(processedValue * 0.7)
          }
        }
      }

      if (field === 'discount_percentage' && processedValue >= 0 && !isNaN(processedValue)) {
        const rawDiscountPrice = Math.round(newData.original_price_adult * (1 - processedValue / 100))
        // Round UP to nearest 100
        const roundedDiscountPrice = roundUpToNearestHundred(rawDiscountPrice)
        
        newData.discount_price_adult = roundedDiscountPrice
        newData.discount_price_child = Math.round(roundedDiscountPrice * 0.7)
      }

      if (field === 'original_price_adult' && processedValue && !isNaN(processedValue)) {
        const rawDiscountPrice = Math.round(processedValue * (1 - newData.discount_percentage / 100))
        
        // Round UP to nearest 100
        const roundedDiscountPrice = roundUpToNearestHundred(rawDiscountPrice)
        
        newData.discount_price_adult = roundedDiscountPrice
        newData.discount_price_child = Math.round(roundedDiscountPrice * 0.7)
        
        // Recalculate actual discount percentage based on rounded price
        const actualDiscountPercentage = Math.round(((processedValue - roundedDiscountPrice) / processedValue) * 100)
        newData.discount_percentage = actualDiscountPercentage
      }
      
      if (field === 'max_capacity' && processedValue && !isNaN(processedValue)) {
        newData.available_spots = processedValue
      }
      
      if (['tour_date', 'time_slot', 'auto_close_hours'].includes(field)) {
        newData.booking_deadline = generateBookingDeadline(
          field === 'tour_date' ? processedValue : newData.tour_date,
          field === 'time_slot' ? processedValue : newData.time_slot,
          field === 'auto_close_hours' ? processedValue : newData.auto_close_hours
        )
      }
      
      // Auto-check whale compliance for whale watching tours
      if (field === 'tour_type' && processedValue === 'Whale Watching') {
        newData.whale_regulation_compliant = true
      }
      
      return newData
    })
    
    // Clear validation error for this field when user types
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }))
    }

  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Run full validation using the main validateForm function
    const isValid = validateForm()
    
    if (!isValid) {
      return
    }
    
    try {
      setLoading(true)

      // Remove id and discount_percentage (generated columns)
      const { id, discount_percentage, ...cleanTourData } = formData
      
      const tourData = {
        ...cleanTourData,
        operator_id: operator.id,
        status: 'active',
        created_by_operator: true
      }

      if (editingTour) {
        await operatorService.updateTour(editingTour.id, tourData)
        alert('✅ Tour updated successfully! Your changes are now live on the platform.')
      } else {
        await operatorService.createTour(tourData)
        alert('🎉 Tour created successfully! It will appear on VAI Tickets within 2 minutes.')
      }
        
      resetForm()
      fetchTours()
      fetchAllBookings()
      loadDashboardStats()  
    } 
    catch (error) {
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
      fitness_level: tour.fitness_level || 'easy',
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
        await loadDashboardStats() 
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

  const validateForm = (specificField = null) => {
    const errors = {}
    
    // Only validate specific field if provided, otherwise validate all
    const fieldsToValidate = specificField ? [specificField] : [
      'tour_name', 'description', 'tour_date', 'meeting_point', 
      'max_capacity', 'original_price_adult', 'duration_hours',
      'min_age', 'max_age' // ADD AGE VALIDATION
    ]
    
    fieldsToValidate.forEach(field => {
      switch (field) {
        case 'tour_name':
          if (!formData.tour_name.trim()) {
            errors.tour_name = 'Tour name is required - make it descriptive for customers'
          } else if (formData.tour_name.length < 5) {
            errors.tour_name = 'Tour name too short - minimum 5 characters for better marketing'
          } else if (formData.tour_name.length > 100) {
            errors.tour_name = 'Tour name too long - maximum 100 characters'
          }
          break
          
        case 'description':
          if (!formData.description.trim()) {
            errors.description = 'Description is required - help customers understand your tour'
          } else if (formData.description.length < 20) {
            errors.description = 'Description too short - add more details to attract bookings (minimum 20 characters)'
          } else if (formData.description.length > 500) {
            errors.description = 'Description too long - maximum 500 characters'
          }
          break
          
        case 'tour_date':
          if (!formData.tour_date) {
            errors.tour_date = 'Tour date is required - when will this tour happen?'
          } else {
            const today = new Date().toISOString().split('T')[0]
            if (formData.tour_date < today) {
              errors.tour_date = 'Tour date cannot be in the past - please select today or a future date'
            }

            if (formData.tour_date === today) {
              const now = new Date()
              const tourTime = new Date(`${formData.tour_date}T${formData.time_slot}:00`)
              const hoursUntilTour = (tourTime - now) / (1000 * 60 * 60)
              
              if (hoursUntilTour <= formData.auto_close_hours) {
                errors.tour_date = `Cannot create - tour starts in ${hoursUntilTour.toFixed(1)}h but auto-closes ${formData.auto_close_hours}h before. Reduce auto-close hours or schedule for tomorrow.`
              }
            }
            
            const selectedDate = new Date(formData.tour_date)
            const maxDate = new Date()
            maxDate.setDate(maxDate.getDate() + 14) // 14 days from now
            if (selectedDate > maxDate) {
              errors.tour_date = 'Tours can only be scheduled up to 14 days in advance'
            }
          }
          break
          
        case 'meeting_point':
          if (!formData.meeting_point.trim()) {
            errors.meeting_point = 'Meeting point is required - where will customers meet you?'
          }
          break
          
        case 'max_capacity':
          if (formData.max_capacity < 1) {
            errors.max_capacity = 'Capacity must be at least 1 person'
          } else if (formData.max_capacity > 50) {
            errors.max_capacity = 'Maximum capacity is 50 people for safety reasons'
          }
          
          if (formData.available_spots > formData.max_capacity) {
            errors.available_spots = 'Available spots cannot exceed maximum capacity'
          }
          break
          
        case 'original_price_adult':
          if (formData.original_price_adult < 1000) {
            errors.original_price_adult = 'Minimum price is 1,000 XPF - French Polynesia tourism standards'
          } else if (formData.original_price_adult > 50000) {
            errors.original_price_adult = 'Maximum price is 50,000 XPF - contact support for premium tours'
          } else if (formData.original_price_adult % 100 !== 0) {
            errors.original_price_adult = 'Price must end in 00 (e.g., 5600, 7200) for professional appearance'
          }
          
          // Discount Logic Validation
          if (formData.discount_percentage > 0 && formData.discount_price_adult >= formData.original_price_adult) {
            errors.discount_price_adult = 'Discount price must be lower than regular price'
          }
          
          if (formData.discount_percentage > 60) {
            errors.discount_percentage = 'Maximum discount is 60% - higher discounts may seem suspicious to customers'
          }
          break
          
        case 'duration_hours':
          if (formData.duration_hours < 0.5) {
            errors.duration_hours = 'Minimum duration is 30 minutes'
          } else if (formData.duration_hours > 12) {
            errors.duration_hours = 'Maximum duration is 12 hours - split longer experiences into multiple tours'
          }
          break

        case 'min_age':
          if (formData.min_age !== null && formData.min_age < 0) {
            errors.min_age = 'Minimum age cannot be negative'
          } else if (formData.min_age !== null && formData.min_age > 100) {
            errors.min_age = 'Minimum age seems too high - please verify'
          }
          
          // Cross-validation with max_age
          if (formData.min_age !== null && formData.max_age !== null && formData.min_age >= formData.max_age) {
            errors.min_age = 'Minimum age must be less than maximum age'
          }
          break
          
        case 'max_age':
          if (formData.max_age !== null && formData.max_age < 0) {
            errors.max_age = 'Maximum age cannot be negative'
          } else if (formData.max_age !== null && formData.max_age > 100) {
            errors.max_age = 'Maximum age seems too high - please verify'
          }
          
          // Cross-validation with min_age
          if (formData.min_age !== null && formData.max_age !== null && formData.max_age <= formData.min_age) {
            errors.max_age = 'Maximum age must be greater than minimum age'
          }
          break  
      }
    })
    
    // Whale Watching Specific Validation
    if (formData.tour_type === 'Whale Watching') {
      if (formData.max_whale_group_size > 8) {
        errors.max_whale_group_size = 'French Polynesia regulations: maximum 8 people per whale watching group'
      }
      if (!formData.whale_regulation_compliant) {
        errors.whale_regulation_compliant = 'Whale regulation compliance is required for whale watching tours'
      }
    }
    
    // Update validation errors state
    if (specificField) {
      // Only update the specific field error
      setValidationErrors(prev => ({
        ...prev,
        [specificField]: errors[specificField] || null
      }))
    } else {
      // Update all validation errors
      setValidationErrors(errors)
    }
    
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
      discount_price_adult: 6400, // Consistent with edit default  
      discount_price_child: 5600,
      discount_percentage: 20, // Standard last-minute discount
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-6 pb-24 md:pb-20">
      <div className="max-w-7xl mx-auto">

        <Header operator={operator} logout={logout} />



    {/* Booking Management Tab */}

    {activeTab === 'bookings' && (
      <BookingsTab 
        stats={stats}
        bookingFilter={bookingFilter}
        setBookingFilter={setBookingFilter}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredBookings={filteredBookings}
        allBookings={allBookings}
        bookingsLoading={bookingsLoading}
        fetchAllBookings={fetchAllBookings}
        processingBooking={processingBooking}
        handleBookingAction={handleBookingAction}
        handleDeclineBooking={handleDeclineBooking}
        formatDate={formatDate}
        formatPrice={formatPrice}
        getTimeUntilDeadline={getTimeUntilDeadline}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
        shouldShowCustomerDetails={shouldShowCustomerDetails}
        setActiveTab={setActiveTab}
      />
    )}

        

     {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
      <DashboardTab 
        tours={tours}
        stats={stats}
        allBookings={allBookings}
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        fetchTours={fetchTours}
        setActiveTab={setActiveTab}
        bookingsLoading={bookingsLoading}
        loading={loading}
        operator={operator}
        setEditingTour={setEditingTour}     
        setFormData={setFormData}       
        setShowForm={setShowForm}            
      />
    )}
        

        {/* Create Tab */}
        {activeTab === 'create' && (
          <CreateTab 
            showForm={showForm}
            setShowForm={setShowForm}
            editingTour={editingTour}
            setEditingTour={setEditingTour}
            formData={formData}
            setFormData={setFormData}
            operator={operator}
            handleSubmit={handleSubmit}
            loading={loading}
            handleDelete={handleDelete}
            showPreview={showPreview}
            setShowPreview={setShowPreview}
            resetForm={resetForm}
            toggleSection={toggleSection}
            expandedSections={expandedSections}
            handleInputChange={handleInputChange}
            validationErrors={validationErrors}
            validateForm={validateForm}
            handleInputChangeWithValidation={handleInputChange}
            tourTypes={tourTypes}
            getQuickDates={getQuickDates}
            timeSlots={timeSlots}
            formatPrice={formatPrice}
            handlePickupLocationAdd={handlePickupLocationAdd}
            handlePickupLocationRemove={handlePickupLocationRemove}
            availableLanguages={availableLanguages}
            handleLanguageToggle={handleLanguageToggle}
            handleDuplicate={handleDuplicate}
            tours={tours}
            handleEdit={handleEdit}
            getTodayInPolynesia={getTodayInPolynesia}
          />
        )}
          


        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <ProfileTab 
          setActiveTab={setActiveTab}
          />
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