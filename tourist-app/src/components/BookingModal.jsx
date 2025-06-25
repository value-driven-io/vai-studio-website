import React, { useState } from 'react'
import { X, Calendar, Clock, Users, MapPin } from 'lucide-react'

const BookingModal = ({ tour, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_whatsapp: '',
    num_adults: 1,
    num_children: 0,
    special_requirements: '',
    dietary_restrictions: '',
    accessibility_needs: ''   
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const totalParticipants = formData.num_adults + formData.num_children
  const totalPrice = (formData.num_adults * tour?.discount_price_adult) + 
                     (formData.num_children * (tour?.discount_price_child || tour?.discount_price_adult * 0.7))

  if (!isOpen || !tour) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Book Tour</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {/* Tour Info */}
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-bold text-lg mb-2">{tour.tour_name}</h3>
          <div className="space-y-1 text-sm text-gray-600">
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
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={formData.customer_name}
              onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={formData.customer_email}
              onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp Number *
            </label>
            <input
              type="tel"
              required
              placeholder="+689 87 12 34 56"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={formData.customer_whatsapp}
              onChange={(e) => setFormData({...formData, customer_whatsapp: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adults
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={formData.num_adults}
                onChange={(e) => setFormData({...formData, num_adults: parseInt(e.target.value)})}
              >
                {[1,2,3,4,5,6].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Children
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={formData.num_children}
                onChange={(e) => setFormData({...formData, num_children: parseInt(e.target.value)})}
              >
                {[0,1,2,3,4,5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Requirements (Optional)
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
              placeholder="Dietary restrictions, accessibility needs, etc."
              value={formData.special_requirements}
              onChange={(e) => setFormData({...formData, special_requirements: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Dietary Restrictions (Optional)
            </label>
            <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-16"
                placeholder="Allergies, vegetarian, vegan, etc."
                value={formData.dietary_restrictions}
                onChange={(e) => setFormData({...formData, dietary_restrictions: e.target.value})}
            />
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Accessibility Needs (Optional)
            </label>
            <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 h-16"
                placeholder="Mobility assistance, visual/hearing needs, etc."
                value={formData.accessibility_needs}
                onChange={(e) => setFormData({...formData, accessibility_needs: e.target.value})}
            />
            </div>

          {/* Price Summary */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Adults ({formData.num_adults})</span>
              <span>{(formData.num_adults * tour.discount_price_adult).toLocaleString()} XPF</span>
            </div>
            {formData.num_children > 0 && (
              <div className="flex justify-between text-sm">
                <span>Children ({formData.num_children})</span>
                <span>{(formData.num_children * (tour.discount_price_child || tour.discount_price_adult * 0.7)).toLocaleString()} XPF</span>
              </div>
            )}
            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
              <span>Total</span>
              <span>{totalPrice.toLocaleString()} XPF</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Request Booking
          </button>
        </form>
      </div>
    </div>
  )
}

export default BookingModal