// src/components/booking/BookingModal.jsx
import React, { useState } from 'react'
import { X, Calendar, Clock, Users, MapPin, CheckCircle, Loader2, Phone, Mail, MessageCircle } from 'lucide-react'
import { bookingService } from '../../services/supabase'
import toast from 'react-hot-toast'

const BookingModal = ({ tour, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_whatsapp: '',
    num_adults: 1,
    num_children: 0,
    special_requirements: '',
    dietary_restrictions: '',
    accessibility_needs: ''
  })
  const [loading, setLoading] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [bookingResult, setBookingResult] = useState(null)

  if (!isOpen || !tour) return null

  const calculateTotal = () => {
    const adultTotal = formData.num_adults * tour.discount_price_adult
    const childPrice = tour.discount_price_child || Math.round(tour.discount_price_adult * 0.7)
    const childTotal = formData.num_children * childPrice
    const subtotal = adultTotal + childTotal
    const commission = Math.round(subtotal * 0.10)
    return {
      subtotal,
      commission,
      total: subtotal + commission
    }
  }

  const totals = calculateTotal()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Prepare booking data for your database structure
      const bookingData = {
        tour_id: tour.id,
        operator_id: tour.operator_id,
        adult_price: tour.discount_price_adult,
        child_price: tour.discount_price_child || Math.round(tour.discount_price_adult * 0.7),
        ...formData
      }

      // This will trigger your n8n workflow
      const result = await bookingService.createBooking(bookingData)
      
      setBookingResult(result)
      setBookingComplete(true)
      
      toast.success('Booking request sent! You\'ll receive confirmation shortly.')
      
      // Optional: Start listening for status updates
      const subscription = bookingService.subscribeToBookingUpdates(
        formData.customer_email,
        (update) => {
          if (update.new.booking_status === 'confirmed') {
            toast.success('Your booking has been confirmed!')
          } else if (update.new.booking_status === 'declined') {
            toast.error(`Booking declined: ${update.new.decline_reason || 'No reason provided'}`)
          }
        }
      )

      // Clean up subscription after 5 minutes
      setTimeout(() => {
        subscription.unsubscribe()
      }, 5 * 60 * 1000)

    } catch (error) {
      console.error('Booking error:', error)
      toast.error('Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Success view after booking is submitted
  if (bookingComplete && bookingResult) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-slate-700">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Booking Request Sent!</h3>
            <p className="text-slate-300 mb-4">
              Your booking reference: <span className="font-mono text-blue-400">{bookingResult.booking_reference}</span>
            </p>
            <div className="bg-slate-700/50 rounded-lg p-4 mb-4 text-left">
              <h4 className="font-semibold text-white mb-2">What happens next?</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• You'll receive a confirmation email within minutes</li>
                <li>• The operator has 60 minutes to confirm your booking</li>
                <li>• Once confirmed, you'll get operator contact details</li>
                <li>• Check your email for updates</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setBookingComplete(false)
                  setBookingResult(null)
                  onClose()
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
              <a
                href={`https://wa.me/68987269065?text=Hi! I have a question about my booking ${bookingResult.booking_reference}`}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Book Your Tour</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tour Info */}
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-2">{tour.tour_name}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(tour.tour_date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {tour.time_slot}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {tour.meeting_point}
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {tour.available_spots} spots available
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Contact Information */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-white mb-3">Contact Information</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.customer_email}
                  onChange={(e) => handleInputChange('customer_email', e.target.value)}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.customer_phone}
                    onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="+689..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.customer_whatsapp}
                    onChange={(e) => handleInputChange('customer_whatsapp', e.target.value)}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="+689..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-white mb-3">Participants</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Adults
                </label>
                <select
                  value={formData.num_adults}
                  onChange={(e) => handleInputChange('num_adults', parseInt(e.target.value))}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {[...Array(tour.available_spots)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Children
                </label>
                <select
                  value={formData.num_children}
                  onChange={(e) => handleInputChange('num_children', parseInt(e.target.value))}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {[...Array(Math.max(0, tour.available_spots - formData.num_adults + 1))].map((_, i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Special Requirements */}
          <div className="mb-6">
            <h4 className="text-md font-semibold text-white mb-3">Special Requirements (Optional)</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Special Requirements
                </label>
                <textarea
                  value={formData.special_requirements}
                  onChange={(e) => handleInputChange('special_requirements', e.target.value)}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows="2"
                  placeholder="Any special needs or requests..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Dietary Restrictions
                </label>
                <input
                  type="text"
                  value={formData.dietary_restrictions}
                  onChange={(e) => handleInputChange('dietary_restrictions', e.target.value)}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Allergies, vegetarian, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Accessibility Needs
                </label>
                <input
                  type="text"
                  value={formData.accessibility_needs}
                  onChange={(e) => handleInputChange('accessibility_needs', e.target.value)}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Mobility aids, assistance needed, etc."
                />
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="mb-6 bg-slate-700/30 rounded-lg p-4">
            <h4 className="text-md font-semibold text-white mb-3">Price Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>{formData.num_adults} Adult{formData.num_adults > 1 ? 's' : ''} × {new Intl.NumberFormat('fr-FR').format(tour.discount_price_adult)} XPF</span>
                <span>{new Intl.NumberFormat('fr-FR').format(formData.num_adults * tour.discount_price_adult)} XPF</span>
              </div>
              {formData.num_children > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>{formData.num_children} Child{formData.num_children > 1 ? 'ren' : ''} × {new Intl.NumberFormat('fr-FR').format(tour.discount_price_child || Math.round(tour.discount_price_adult * 0.7))} XPF</span>
                  <span>{new Intl.NumberFormat('fr-FR').format(formData.num_children * (tour.discount_price_child || Math.round(tour.discount_price_adult * 0.7)))} XPF</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300 border-t border-slate-600 pt-2">
                <span>Subtotal</span>
                <span>{new Intl.NumberFormat('fr-FR').format(totals.subtotal)} XPF</span>
              </div>
              <div className="flex justify-between text-slate-400 text-xs">
                <span>Platform fee (10%)</span>
                <span>{new Intl.NumberFormat('fr-FR').format(totals.commission)} XPF</span>
              </div>
              <div className="flex justify-between text-white font-semibold text-lg border-t border-slate-600 pt-2">
                <span>Total</span>
                <span>{new Intl.NumberFormat('fr-FR').format(totals.total)} XPF</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || formData.num_adults + formData.num_children > tour.available_spots}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending Request...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Request Booking
              </>
            )}
          </button>

          <p className="text-xs text-slate-400 mt-3 text-center">
            By booking, you agree to our terms and conditions. 
            You'll receive confirmation within 60 minutes.
          </p>
        </form>
      </div>
    </div>
  )
}

export default BookingModal