// operator-dashboard/src/App.js
import React, { useState, useEffect } from 'react'
import { 
  Plus, Calendar, Clock, Users, MapPin, Trash2, Edit2, 
  DollarSign, CheckCircle, XCircle, AlertCircle, Bell,
  MessageCircle, Phone, Mail, Timer, RefreshCw, Eye,
  User, Loader2
} from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import Login from './components/Login'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

function App() {
  // ALL HOOKS MUST BE AT THE TOP - BEFORE ANY EARLY RETURNS
  const { operator, loading: authLoading, login, logout, isAuthenticated } = useAuth()
  
  // All state hooks
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTour, setEditingTour] = useState(null)
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0
  })
  const [pendingBookings, setPendingBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('tours') // 'tours' or 'bookings'
  const [processingBooking, setProcessingBooking] = useState(null)
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

  // Constants and arrays
  const tourTypes = [
    'Whale Watching', 'Snorkeling', 'Lagoon Tour', 'Hike', 
    'Cultural', 'Adrenalin', 'Mindfulness', 'Diving'
  ]

  const timeSlots = [
    { value: '06:00', label: '06:00 - Sunrise' },
    { value: '09:00', label: '09:00 - Morning' },
    { value: '14:00', label: '14:00 - Afternoon' },
    { value: '17:30', label: '17:30 - Sunset' },
    { value: '20:00', label: '20:00 - Night' }
  ]

  // useEffect hook - must be with other hooks
  useEffect(() => {
    if (isAuthenticated && operator?.id) {
      fetchTours()
      fetchStats()
      fetchPendingBookings()
      
      // Set up polling for real-time updates
      const interval = setInterval(() => {
        fetchPendingBookings()
        fetchStats()
      }, 30000) // Poll every 30 seconds

      return () => clearInterval(interval)
    }
  }, [isAuthenticated, operator?.id])

  // Function definitions
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

  const fetchStats = async () => {
    if (!operator?.id) return
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/operator_booking_summary?operator_id=eq.${operator.id}&select=*`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      })
      const data = await response.json()
      if (data && data[0]) {
        setStats({
          totalBookings: data[0].total_bookings || 0,
          pendingBookings: data[0].pending_bookings || 0,
          confirmedBookings: data[0].confirmed_bookings || 0,
          totalRevenue: data[0].total_revenue || 0
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchPendingBookings = async () => {
    if (!operator?.id) return
    
    setBookingsLoading(true)
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/pending_bookings_for_workflow?operator_id=eq.${operator.id}&booking_status=eq.pending&select=*`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      })
      const data = await response.json()
      setPendingBookings(data || [])
    } catch (error) {
      console.error('Error fetching pending bookings:', error)
    } finally {
      setBookingsLoading(false)
    }
  }

  const handleBookingAction = async (bookingId, action, declineReason = null) => {
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
        updateData.decline_reason = declineReason
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
        // Remove booking from pending list
        setPendingBookings(prev => prev.filter(b => b.id !== bookingId))
        // Refresh stats
        fetchStats()
        alert(`Booking ${action} successfully!`)
      } else {
        throw new Error('Failed to update booking')
      }
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('Failed to update booking. Please try again.')
    } finally {
      setProcessingBooking(null)
    }
  }

  const handleConfirmBooking = (bookingId) => {
    if (window.confirm('Are you sure you want to CONFIRM this booking?')) {
      handleBookingAction(bookingId, 'confirmed')
    }
  }

  const handleDeclineBooking = (bookingId) => {
    const reason = prompt('Please provide a reason for declining (optional):')
    if (reason !== null) { // User didn't cancel the prompt
      handleBookingAction(bookingId, 'declined', reason || 'No reason provided')
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' XPF'
  }

  const getTimeUntilDeadline = (deadline) => {
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Your existing tour creation logic...
    console.log('Creating tour:', formData)
  }

  const handleEdit = (tour) => {
    setEditingTour(tour)
    setFormData(tour)
    setShowForm(true)
  }

  const handleDelete = (tourId) => {
    if (window.confirm('Are you sure you want to delete this tour?')) {
      // Your existing delete logic...
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">VAI Tickets - Operator Dashboard</h1>
              <p className="text-slate-400">Welcome, {operator?.company_name}</p>
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
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('tours')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'tours'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Tours Management
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-3 rounded-lg font-medium transition-all relative ${
              activeTab === 'bookings'
                ? 'bg-orange-600 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Booking Requests
            {pendingBookings.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {pendingBookings.length}
              </span>
            )}
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-slate-300 font-medium">Total Revenue</h3>
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

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-slate-300 font-medium">Confirmed</h3>
            </div>
            <p className="text-2xl font-bold text-white">{stats.confirmedBookings}</p>
          </div>
        </div>

        {/* Booking Requests Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Booking Requests Header */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-400" />
                  Pending Booking Requests
                </h2>
                <button
                  onClick={fetchPendingBookings}
                  disabled={bookingsLoading}
                  className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                  title="Refresh bookings"
                >
                  <RefreshCw className={`w-5 h-5 ${bookingsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {pendingBookings.length > 0 && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                  <p className="text-orange-300 text-sm">
                    ⚠️ You have {pendingBookings.length} booking request{pendingBookings.length > 1 ? 's' : ''} waiting for your response. 
                    Please confirm or decline within 60 minutes to maintain good customer service.
                  </p>
                </div>
              )}
            </div>

            {/* Pending Bookings List */}
            {bookingsLoading ? (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
                <p className="text-slate-300">Loading booking requests...</p>
              </div>
            ) : pendingBookings.length === 0 ? (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">All caught up!</h3>
                <p className="text-slate-400">No pending booking requests at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingBookings.map((booking) => {
                  const deadline = getTimeUntilDeadline(booking.confirmation_deadline)
                  return (
                    <div key={booking.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
                      {/* Booking Header */}
                      <div className="p-6 border-b border-slate-700">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-1">
                              {booking.tour_name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-slate-300">
                              <span>Ref: {booking.booking_reference}</span>
                              <span>•</span>
                              <span>{booking.num_adults + booking.num_children} participant{(booking.num_adults + booking.num_children) > 1 ? 's' : ''}</span>
                              <span>•</span>
                              <span>{formatPrice((booking.subtotal || 0) + (booking.commission_amount || 0))}</span>
                            </div>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                            deadline.urgent 
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            <Timer className="w-4 h-4" />
                            {deadline.text}
                          </div>
                        </div>

                        {/* Tour Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-300">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {booking.tour_date ? formatDate(booking.tour_date) : 'Date TBD'}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {booking.time_slot || 'Time TBD'}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {booking.meeting_point || 'Location TBD'}
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {booking.customer_name}
                          </div>
                        </div>
                      </div>

                      {/* Customer Information */}
                      <div className="p-6 bg-slate-700/30">
                        <h4 className="text-white font-medium mb-3">Customer Details</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="text-sm">
                              <span className="text-slate-400">Name:</span>
                              <span className="text-white ml-2">{booking.customer_name}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-slate-400">Participants:</span>
                              <span className="text-white ml-2">
                                {booking.num_adults} adult{booking.num_adults > 1 ? 's' : ''}
                                {booking.num_children > 0 && `, ${booking.num_children} child${booking.num_children > 1 ? 'ren' : ''}`}
                              </span>
                            </div>
                            {booking.special_requirements && (
                              <div className="text-sm">
                                <span className="text-slate-400">Special Requirements:</span>
                                <span className="text-white ml-2">{booking.special_requirements}</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
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
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="p-6 border-t border-slate-700">
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleConfirmBooking(booking.id)}
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
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <a
                            href={`https://wa.me/${booking.customer_whatsapp}?text=Hi ${booking.customer_name}! This is regarding your booking ${booking.booking_reference}`}
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
                        </div>
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
      </div>
    </div>
  )
}

export default App