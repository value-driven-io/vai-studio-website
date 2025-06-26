// operator-dashboard/src/App.js - Enhanced Booking Management System
import React, { useState, useEffect } from 'react'
import { 
  Plus, Calendar, Clock, Users, MapPin, Trash2, Edit2, 
  DollarSign, CheckCircle, XCircle, AlertCircle,
  MessageCircle, Phone, Timer, RefreshCw,
  User, Loader2, Filter, Search, Star,
  Clock3, Award, Lock, Unlock, BarChart3
} from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import Login from './components/Login'

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
  const [activeTab, setActiveTab] = useState('tours')
  const [bookingFilter, setBookingFilter] = useState('all') // 'all', 'pending', 'confirmed', 'declined', 'completed'
  const [timeFilter, setTimeFilter] = useState('all') // 'all', 'today', 'tomorrow', 'week'
  const [searchTerm, setSearchTerm] = useState('')
  const [processingBooking, setProcessingBooking] = useState(null)
  const [showDeclineModal, setShowDeclineModal] = useState(null)
  const [declineReason, setDeclineReason] = useState('')

  // Form data state
  const [formData, setFormData] = useState({
    tour_name: '',
    tour_type: 'Whale Watching',
    description: '',
    tour_date: '',
    time_slot: '09:00',
    duration_hours: 3,
    max_capacity: 8,
    available_spots: 8,
    original_price_adult: 8000,
    discount_price_adult: 6400,
    discount_price_child: 4480,
    discount_percentage: 20,
    meeting_point: '',
    pickup_available: false,
    equipment_included: false,
    food_included: false,
    whale_regulation_compliant: true,
    requirements: '',
    restrictions: ''
  })

  // Constants
  const tourTypes = ['Whale Watching', 'Snorkeling', 'Lagoon Tour', 'Hike', 'Cultural', 'Adrenalin', 'Mindfulness', 'Diving']
  const timeSlots = [
    { value: '06:00', label: '06:00 - Sunrise' },
    { value: '09:00', label: '09:00 - Morning' },
    { value: '14:00', label: '14:00 - Afternoon' },
    { value: '17:30', label: '17:30 - Sunset' },
    { value: '20:00', label: '20:00 - Night' }
  ]

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

  // Form handlers (simplified for this example)
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('Creating tour:', formData)
  }

  const handleEdit = (tour) => {
    setEditingTour(tour)
    setFormData(tour)
    setShowForm(true)
  }

  const handleDelete = (tourId) => {
    if (window.confirm('Are you sure you want to delete this tour?')) {
      console.log('Deleting tour:', tourId)
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-6">
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

        {/* Navigation Tabs */}
        <div className="flex gap-2 md:gap-4 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('tours')}
            className={`px-4 md:px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'tours'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Tours Management
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 md:px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap relative ${
              activeTab === 'bookings'
                ? 'bg-orange-600 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Booking Management
            {stats.pendingBookings > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {stats.pendingBookings}
              </span>
            )}
          </button>
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

        {/* Tours Management Tab */}
        {activeTab === 'tours' && (
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all"
              >
                <Plus className="w-5 h-5" />
                Create New Tour
              </button>
            </div>

            {/* Tours List */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-6">Your Tours</h2>
              
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
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
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-slate-300">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {formatDate(tour.tour_date)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {tour.time_slot}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              {tour.available_spots}/{tour.max_capacity} spots
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              {formatPrice(tour.discount_price_adult)}
                            </div>
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
      </div>
    </div>
  )
}

export default App