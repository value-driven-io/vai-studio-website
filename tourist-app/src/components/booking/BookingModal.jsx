// src/components/booking/BookingModal.jsx
import React, { useState } from 'react'
import { X, Calendar, Clock, Users, MapPin, CheckCircle, Loader2 } from 'lucide-react'
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

  const totalParticipants = formData.num_adults + formData.num_children
  const adultTotal = formData.num_adults * tour.discount_price_adult
  const childTotal = formData.num_children * (tour.discount_price_child || Math.round(tour.discount_price_adult * 0.7))
  const subtotal = adultTotal + childTotal
  const commission = Math.round(subtotal * 0.10)
  const totalPrice = subtotal + commission

  if (!isOpen || !tour) return null

  // Booking Success Screen
  if (bookingComplete && bookingResult) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-vai-lagoon rounded-2xl max-w-md w-full border border-slate-700">
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-vai-bamboo/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-vai-bamboo" />
            </div>
            
            <h3 className="text-2xl font-bold text-vai-pearl mb-2">Booking Requested!</h3>
            <p className="text-slate-300 mb-4">
              Your booking request has been sent to the operator. You'll receive confirmation within 60 minutes.
            </p>
            
            <div className="bg-slate-800/50 rounded-lg p-4 mb-6 text-left">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Booking Reference:</span>
                  <span className="text-vai-pearl font-mono">{bookingResult.booking_reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tour:</span>
                  <span className="text-vai-pearl">{tour.tour_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date & Time:</span>
                  <span className="text-vai-pearl">
                    {new Date(tour.tour_date).toLocaleDateString('fr-FR')} at {tour.time_slot}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Amount:</span>
                  <span className="text-vai-pearl font-bold">
                    {new Intl.NumberFormat('fr-FR').format(totalPrice)} XPF
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-vai-coral/10 border border-vai-coral/30 rounded-lg p-3">
                <p className="text-vai-coral text-sm">
                  📱 The operator will contact you via WhatsApp at {formData.customer_whatsapp}
                </p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-300 text-sm">
                  ⏰ If no response within 60 minutes, our team will assist you automatically
                </p>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full bg-vai-coral hover:shadow-vai-glow text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 mt-6"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-vai-lagoon rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-vai-pearl">Book Your Adventure</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-vai-pearl">
            <X size={24} />
          </button>
        </div>

        {/* Tour Info */}
        <div className="p-4 border-b bg-slate-800/30">
          <h3 className="font-bold text-lg mb-2 text-vai-pearl">{tour.tour_name}</h3>
          <div className="space-y-1 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{new Date(tour.tour_date).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{tour.time_slot}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{tour.meeting_point}</span>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-bold text-vai-pearl">Contact Information</h4>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                className="w-full border border-slate-600 bg-slate-800/50 text-vai-pearl rounded-lg px-3 py-2 focus:border-vai-coral focus:ring-1 focus:ring-vai-coral"
                value={formData.customer_name}
                onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                className="w-full border border-slate-600 bg-slate-800/50 text-vai-pearl rounded-lg px-3 py-2 focus:border-vai-coral focus:ring-1 focus:ring-vai-coral"
                value={formData.customer_email}
                onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                WhatsApp Number *
              </label>
              <input
                type="tel"
                required
                placeholder="+689 87 12 34 56"
                className="w-full border border-slate-600 bg-slate-800/50 text-vai-pearl rounded-lg px-3 py-2 focus:border-vai-coral focus:ring-1 focus:ring-vai-coral"
                value={formData.customer_whatsapp}
                onChange={(e) => setFormData({...formData, customer_whatsapp: e.target.value})}
              />
              <p className="text-xs text-slate-400 mt-1">Operator will contact you here for confirmation</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                className="w-full border border-slate-600 bg-slate-800/50 text-vai-pearl rounded-lg px-3 py-2 focus:border-vai-coral focus:ring-1 focus:ring-vai-coral"
                value={formData.customer_phone}
                onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
              />
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-4">
            <h4 className="font-bold text-vai-pearl">Participants</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Adults
                </label>
                <select
                  className="w-full border border-slate-600 bg-slate-800/50 text-vai-pearl rounded-lg px-3 py-2 focus:border-vai-coral focus:ring-1 focus:ring-vai-coral"
                  value={formData.num_adults}
                  onChange={(e) => setFormData({...formData, num_adults: parseInt(e.target.value)})}
                >
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Children
                </label>
                <select
                  className="w-full border border-slate-600 bg-slate-800/50 text-vai-pearl rounded-lg px-3 py-2 focus:border-vai-coral focus:ring-1 focus:ring-vai-coral"
                  value={formData.num_children}
                  onChange={(e) => setFormData({...formData, num_children: parseInt(e.target.value)})}
                >
                  {[0,1,2,3,4,5,6].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>

            {totalParticipants > tour.available_spots && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">
                  ⚠️ Only {tour.available_spots} spots available. Please reduce participants.
                </p>
              </div>
            )}
          </div>

          {/* Special Requirements */}
          <div className="space-y-4">
            <h4 className="font-bold text-vai-pearl">Additional Information</h4>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Special Requirements (Optional)
              </label>
              <textarea
                className="w-full border border-slate-600 bg-slate-800/50 text-vai-pearl rounded-lg px-3 py-2 h-20 focus:border-vai-coral focus:ring-1 focus:ring-vai-coral"
                placeholder="Any special requests or requirements..."
                value={formData.special_requirements}
                onChange={(e) => setFormData({...formData, special_requirements: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Dietary Restrictions (Optional)
              </label>
              <textarea
                className="w-full border border-slate-600 bg-slate-800/50 text-vai-pearl rounded-lg px-3 py-2 h-16 focus:border-vai-coral focus:ring-1 focus:ring-vai-coral"
                placeholder="Allergies, vegetarian, vegan, etc."
                value={formData.dietary_restrictions}
                onChange={(e) => setFormData({...formData, dietary_restrictions: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Accessibility Needs (Optional)
              </label>
              <textarea
                className="w-full border border-slate-600 bg-slate-800/50 text-vai-pearl rounded-lg px-3 py-2 h-16 focus:border-vai-coral focus:ring-1 focus:ring-vai-coral"
                placeholder="Mobility assistance, visual/hearing needs, etc."
                value={formData.accessibility_needs}
                onChange={(e) => setFormData({...formData, accessibility_needs: e.target.value})}
              />
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-slate-800/50 p-4 rounded-lg space-y-2">
            <h4 className="font-bold text-vai-pearl">Price Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Adults ({formData.num_adults} × {new Intl.NumberFormat('fr-FR').format(tour.discount_price_adult)} XPF)</span>
                <span>{new Intl.NumberFormat('fr-FR').format(adultTotal)} XPF</span>
              </div>
              {formData.num_children > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>Children ({formData.num_children} × {new Intl.NumberFormat('fr-FR').format(tour.discount_price_child || Math.round(tour.discount_price_adult * 0.7))} XPF)</span>
                  <span>{new Intl.NumberFormat('fr-FR').format(childTotal)} XPF</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Platform Fee (10%)</span>
                <span>{new Intl.NumberFormat('fr-FR').format(commission)} XPF</span>
              </div>
              <div className="border-t border-slate-600 pt-2 flex justify-between font-bold text-vai-pearl">
                <span>Total</span>
                <span>{new Intl.NumberFormat('fr-FR').format(totalPrice)} XPF</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || totalParticipants > tour.available_spots}
            className="w-full bg-vai-coral hover:shadow-vai-glow text-white py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending Request...
              </>
            ) : (
              'Request Booking'
            )}
          </button>

          <div className="text-center">
            <p className="text-xs text-slate-400">
              By booking, you agree to our terms of service. Payment is collected by the operator upon confirmation.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookingModal