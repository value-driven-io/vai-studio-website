// src/components/booking/Bookings.jsx
import React, { useState, useEffect } from 'react'
import { 
  Calendar, Clock, MapPin, Users, Phone, MessageCircle, Mail,
  CheckCircle, XCircle, AlertCircle, Loader2, Search, RefreshCw,
  ExternalLink, Copy, Eye, EyeOff
} from 'lucide-react'
import { bookingService, formatPrice, formatDate } from '../../services/supabase'
import toast from 'react-hot-toast'

const Bookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [subscriptions, setSubscriptions] = useState([])
  const [showEmail, setShowEmail] = useState(false)

  // Check if email is stored in localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('vai_user_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setEmailSubmitted(true)
      fetchBookings(savedEmail)
    }
  }, [])

  const fetchBookings = async (userEmail) => {
    if (!userEmail) return
    
    setLoading(true)
    try {
      const data = await bookingService.getUserBookings(userEmail)
      setBookings(data)
      
      // Setup real-time subscriptions for each booking
      const newSubscriptions = data.map(booking => 
        bookingService.subscribeToBookingByReference(
          booking.booking_reference,
          (update) => {
            setBookings(prev => prev.map(b => 
              b.id === update.new.id ? { ...b, ...update.new } : b
            ))
            
            // Show notification for status changes
            if (update.new.booking_status === 'confirmed') {
              toast.success(`Booking ${booking.booking_reference} confirmed!`)
            } else if (update.new.booking_status === 'declined') {
              toast.error(`Booking ${booking.booking_reference} declined`)
            }
          }
        )
      )
      
      setSubscriptions(newSubscriptions)
      
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSubmit = (e) => {
    e.preventDefault()
    if (!email) return
    
    localStorage.setItem('vai_user_email', email)
    setEmailSubmitted(true)
    fetchBookings(email)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const refreshBookings = () => {
    if (email) {
      fetchBookings(email)
    }
  }

  const clearEmail = () => {
    localStorage.removeItem('vai_user_email')
    setEmail('')
    setEmailSubmitted(false)
    setBookings([])
    // Cleanup subscriptions
    subscriptions.forEach(sub => sub.unsubscribe())
    setSubscriptions([])
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'declined':
        return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      default:
        return 'text-slate-400 bg-slate-500/20 border-slate-500/30'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />
      case 'declined':
        return <XCircle className="w-4 h-4" />
      case 'pending':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const isBookingExpired = (booking) => {
    if (booking.booking_status !== 'pending') return false
    return new Date(booking.confirmation_deadline) < new Date()
  }

  const getTimeUntilDeadline = (deadline) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffMs = deadlineDate - now
    
    if (diffMs <= 0) return 'Expired'
    
    const minutes = Math.floor(diffMs / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m left`
    }
    return `${minutes}m left`
  }

  // Email input screen
  if (!emailSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-md mx-auto pt-20">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Your Bookings</h1>
              <p className="text-slate-300">Enter your email to view your booking history</p>
            </div>
            
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                View My Bookings
              </button>
            </form>
            
            <p className="text-xs text-slate-400 mt-4 text-center">
              We'll store your email locally to make future visits easier
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Your Bookings</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-300">Email:</span>
                <span className="text-blue-400 font-mono">
                  {showEmail ? email : email.replace(/(.{2}).*(@.*)/, '$1***$2')}
                </span>
                <button
                  onClick={() => setShowEmail(!showEmail)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {showEmail ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={refreshBookings}
                disabled={loading}
                className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                title="Refresh bookings"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={clearEmail}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
              >
                Change Email
              </button>
            </div>
          </div>
          
          {bookings.length > 0 && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-slate-700/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-400">{bookings.length}</div>
                <div className="text-xs text-slate-400">Total Bookings</div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-400">
                  {bookings.filter(b => b.booking_status === 'confirmed').length}
                </div>
                <div className="text-xs text-slate-400">Confirmed</div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-400">
                  {bookings.filter(b => b.booking_status === 'pending').length}
                </div>
                <div className="text-xs text-slate-400">Pending</div>
              </div>
            </div>
          )}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-slate-300">Loading your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 text-center">
            <div className="text-slate-400 mb-4">No bookings found</div>
            <p className="text-sm text-slate-500">
              Start exploring tours to make your first booking!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
                {/* Booking Header */}
                <div className="p-6 border-b border-slate-700">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {booking.tours?.tour_name || 'Unknown Tour'}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Reference:</span>
                        <span className="font-mono text-blue-400">{booking.booking_reference}</span>
                        <button
                          onClick={() => copyToClipboard(booking.booking_reference)}
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(booking.booking_status)}`}>
                      {getStatusIcon(booking.booking_status)}
                      {booking.booking_status?.charAt(0).toUpperCase() + booking.booking_status?.slice(1)}
                    </div>
                  </div>

                  {/* Tour Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {booking.tours?.tour_date ? formatDate(booking.tours.tour_date) : 'Date TBD'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {booking.tours?.time_slot || 'Time TBD'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {booking.num_adults} adult{booking.num_adults > 1 ? 's' : ''}
                      {booking.num_children > 0 && `, ${booking.num_children} child${booking.num_children > 1 ? 'ren' : ''}`}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {booking.tours?.meeting_point || 'Location TBD'}
                    </div>
                  </div>
                </div>

                {/* Status-specific content */}
                <div className="p-6">
                  {booking.booking_status === 'pending' && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-yellow-400 font-medium mb-2">
                        <AlertCircle className="w-5 h-5" />
                        Waiting for Confirmation
                      </div>
                      <p className="text-slate-300 text-sm mb-2">
                        Your booking request has been sent to the operator. They have up to 60 minutes to confirm.
                      </p>
                      <div className="text-sm text-yellow-400">
                        {isBookingExpired(booking) ? (
                          <span className="text-red-400">⚠️ Confirmation deadline expired</span>
                        ) : (
                          <span>⏰ {getTimeUntilDeadline(booking.confirmation_deadline)}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {booking.booking_status === 'confirmed' && booking.operators && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-400 font-medium mb-3">
                        <CheckCircle className="w-5 h-5" />
                        Booking Confirmed!
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-white font-medium mb-2">Operator Contact</h4>
                          <div className="space-y-2 text-sm">
                            <div className="text-slate-300">
                              <strong>{booking.operators.company_name}</strong>
                            </div>
                            {booking.operators.contact_person && (
                              <div className="text-slate-300">
                                Contact: {booking.operators.contact_person}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-white font-medium mb-2">Communication</h4>
                          <div className="flex gap-2">
                            {booking.operators.whatsapp_number && (
                              <a
                                href={`https://wa.me/${booking.operators.whatsapp_number}?text=Hi! I have a confirmed booking: ${booking.booking_reference}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                              >
                                <MessageCircle className="w-4 h-4" />
                                WhatsApp
                              </a>
                            )}
                            {booking.operators.phone && (
                              <a
                                href={`tel:${booking.operators.phone}`}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                              >
                                <Phone className="w-4 h-4" />
                                Call
                              </a>
                            )}
                          </div>
                        </div>
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
                        Unfortunately, this booking was declined by the operator.
                      </p>
                      {booking.decline_reason && (
                        <div className="text-sm text-slate-400">
                          <strong>Reason:</strong> {booking.decline_reason}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Booking Details */}
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="text-white font-medium mb-2">Booking Details</h4>
                        <div className="space-y-1 text-slate-300">
                          <div>Booked: {new Date(booking.created_at).toLocaleString()}</div>
                          <div>Total: {formatPrice(booking.subtotal + booking.commission_amount)}</div>
                          {booking.special_requirements && (
                            <div>Special requirements: {booking.special_requirements}</div>
                          )}
                        </div>
                      </div>
                      {(booking.dietary_restrictions || booking.accessibility_needs) && (
                        <div>
                          <h4 className="text-white font-medium mb-2">Additional Info</h4>
                          <div className="space-y-1 text-slate-300 text-sm">
                            {booking.dietary_restrictions && (
                              <div>Dietary: {booking.dietary_restrictions}</div>
                            )}
                            {booking.accessibility_needs && (
                              <div>Accessibility: {booking.accessibility_needs}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Support */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 mt-6 text-center">
          <h3 className="text-white font-medium mb-2">Need Help?</h3>
          <div className="flex justify-center gap-4">
            <a
              href="https://wa.me/68987269065"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Support
            </a>
            <a
              href="mailto:hello@vai.studio"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Bookings