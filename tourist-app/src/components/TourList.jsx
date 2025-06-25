import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Users, MapPin } from 'lucide-react'
import { tourService } from '../services/supabaseService'
import BookingModal from './BookingModal'

const TourList = () => {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dateFilter, setDateFilter] = useState('')
  const [selectedTour, setSelectedTour] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  const handleBookNow = (tour) => {
  setSelectedTour(tour)
  setShowBookingModal(true)
}

const handleCloseModal = () => {
  setShowBookingModal(false)
  setSelectedTour(null)
}

const handleBookingSubmit = async (formData) => {
  try {
    console.log('Submitting booking for tour:', selectedTour.id)
    
    const booking = await tourService.createBooking(selectedTour.id, formData)
    
    alert(`Booking submitted successfully! 
Reference: ${booking.booking_reference}

You will receive a confirmation email shortly.`)
    
    handleCloseModal()
    
    // Reload tours to update available spots
    const data = await tourService.getAvailableTours()
    setTours(data)
    
  } catch (error) {
    console.error('Booking error:', error)
    alert('Error submitting booking. Please try again.')
  }
}

  const getFilteredTours = () => {
  if (!dateFilter) return tours

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const oneWeek = new Date(today)
  oneWeek.setDate(oneWeek.getDate() + 7)

  return tours.filter(tour => {
    const tourDate = new Date(tour.tour_date)
    
    switch(dateFilter) {
      case 'today':
        return tourDate.toDateString() === today.toDateString()
      case 'tomorrow':
        return tourDate.toDateString() === tomorrow.toDateString()
      case 'week':
        tourDate.setHours(0, 0, 0, 0)
        today.setHours(0, 0, 0, 0)
        return tourDate >= today && tourDate <= oneWeek
      default:
        return true
    }
  })
}

  useEffect(() => {
    const loadTours = async () => {
      try {
        const data = await tourService.getAvailableTours()
        setTours(data)
      } catch (err) {
        setError(err.message)
        console.error('Error loading tours:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTours()
  }, [])

  if (loading) return <div className="p-4">Loading tours...</div>
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>

return (
  <div className="min-h-screen bg-gray-50 p-4">
    <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">🏝️ VAI Tickets</h1>
    
    {/* Simple Filter */}
    <div className="max-w-4xl mx-auto mb-6">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex gap-4 items-center">
          <label className="font-semibold text-gray-700">Filter by date:</label>
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
        >
            <option value="">All dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="week">This week</option>
          </select>
        </div>
      </div>
    </div>
    
    <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {getFilteredTours().map((tour) => (
          <div key={tour.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* Tour Type Header */}
            <div className="h-32 bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
              <span className="text-white text-xl font-bold">{tour.tour_type}</span>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-3">{tour.tour_name}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} />
                  <span>{new Date(tour.tour_date).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock size={16} />
                  <span>{tour.time_slot}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={16} />
                  <span>{tour.available_spots} spots available</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} />
                  <span>{tour.operators?.company_name}</span>
                </div>
              </div>
              
              {/* Price */}
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xl font-bold text-blue-600">
                    {tour.discount_price_adult?.toLocaleString()} XPF
                  </div>
                  <span className="text-gray-500 text-sm">per adult</span>
                </div>
                
                <button 
                    onClick={() => handleBookNow(tour)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                    Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <BookingModal
      tour={selectedTour}
      isOpen={showBookingModal}
      onClose={handleCloseModal}
      onSubmit={handleBookingSubmit}
    />
    </div>
  )
}

export default TourList