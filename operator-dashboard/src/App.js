// src/App.js
import React, { useState, useEffect } from 'react'
import { Calendar, Plus, Edit3, Trash2, DollarSign, Users, MapPin, LogOut } from 'lucide-react'
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
  const [formData, setFormData] = useState({
    tour_name: '',
    tour_type: 'Whale Watching',
    tour_date: '',
    time_slot: '09:00',
    max_capacity: 8,
    original_price_adult: 8000,
    discount_price_adult: 6400,
    meeting_point: '',
    requirements: ''
  })

  const tourTypes = [
    'Whale Watching',
    'Snorkeling',
    'Lagoon',
    'Hike',
    'Cultural',
    'Adrenalin'
  ]

  const timeSlots = [
    '06:00',
    '09:00',
    '14:00',
    '17:30',
    '20:00'
  ]

  // Load data when operator is authenticated
  useEffect(() => {
    if (operator) {
      loadData()
    }
  }, [operator])

  const loadData = async () => {
    if (!operator) return
    
    setLoading(true)
    try {
      const [toursData, statsData] = await Promise.all([
        operatorService.getOperatorTours(operator.id),
        operatorService.getOperatorStats(operator.id)
      ])
      
      setTours(toursData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error loading data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.tour_name || !formData.tour_date || !formData.meeting_point) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const tourData = {
        ...formData,
        operator_id: operator.id,
        discount_percentage: Math.round((1 - formData.discount_price_adult / formData.original_price_adult) * 100)
      }

      if (editingTour) {
        await operatorService.updateTour(editingTour.id, tourData)
      } else {
        await operatorService.createTour(tourData)
      }
      
      await loadData() // Reload data
      resetForm()
      alert(editingTour ? 'Tour updated successfully!' : 'Tour created successfully!')
    } catch (error) {
      console.error('Error saving tour:', error)
      alert('Error saving tour. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (tour) => {
    setFormData({
      tour_name: tour.tour_name,
      tour_type: tour.tour_type,
      tour_date: tour.tour_date,
      time_slot: tour.time_slot,
      max_capacity: tour.max_capacity,
      original_price_adult: tour.original_price_adult,
      discount_price_adult: tour.discount_price_adult,
      meeting_point: tour.meeting_point,
      requirements: tour.requirements || ''
    })
    setEditingTour(tour)
    setShowForm(true)
  }

  const handleDelete = async (tourId) => {
    if (!window.confirm('Are you sure you want to delete this tour?')) return
    
    setLoading(true)
    try {
      await operatorService.deleteTour(tourId)
      await loadData()
      alert('Tour deleted successfully!')
    } catch (error) {
      console.error('Error deleting tour:', error)
      alert('Error deleting tour. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      tour_name: '',
      tour_type: 'Whale Watching',
      tour_date: '',
      time_slot: '09:00',
      max_capacity: 8,
      original_price_adult: 8000,
      discount_price_adult: 6400,
      meeting_point: '',
      requirements: ''
    })
    setEditingTour(null)
    setShowForm(false)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' XPF'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    })
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={login} loading={authLoading} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">🏝️ VAI Tickets</h1>
              <p className="text-slate-300">Ia ora na {operator.company_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-left sm:text-right">
                <p className="text-sm text-slate-400">📧 {operator.email}</p>
                <p className="text-sm text-slate-400">📱 {operator.phone}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-slate-800 rounded-lg p-6 flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-white">Loading...</span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-400">{formatPrice(stats.totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Bookings</p>
                <p className="text-2xl font-bold text-blue-400">{stats.totalBookings}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Tours</p>
                <p className="text-2xl font-bold text-purple-400">{tours.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-white">My Tours</h2>
          <button
            onClick={() => {
              resetForm()
              setShowForm(!showForm)
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            New Tour
          </button>
        </div>

        {/* Tour Form */}
        {showForm && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingTour ? 'Edit Tour' : 'Create New Tour'}
            </h3>
            
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
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Max Capacity</label>
                <input
                  type="number"
                  value={formData.max_capacity}
                  onChange={(e) => handleInputChange('max_capacity', parseInt(e.target.value))}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                  min="1"
                  max="20"
                />
              </div>

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
                <label className="block text-sm font-medium text-slate-300 mb-2">Original Price (XPF)</label>
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
                <label className="block text-sm font-medium text-slate-300 mb-2">Discounted Price (XPF)</label>
                <input
                  type="number"
                  value={formData.discount_price_adult}
                  onChange={(e) => handleInputChange('discount_price_adult', parseInt(e.target.value))}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                  min="1000"
                  step="500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Requirements / Notes</label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                  rows="3"
                  placeholder="e.g., Bring swimwear, sunscreen..."
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-lg transition-all"
                >
                  {editingTour ? 'Update Tour' : 'Create Tour'}
                </button>
                <button
                  onClick={resetForm}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tours List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tours.map(tour => (
            <div key={tour.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{tour.tour_name}</h3>
                  <p className="text-slate-400 text-sm">{tour.tour_type}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(tour)}
                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tour.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4" />
                  {formatDate(tour.tour_date)} at {tour.time_slot}
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4" />
                  {tour.meeting_point}
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Users className="w-4 h-4" />
                  {tour.available_spots} / {tour.max_capacity} spots available
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-slate-400 line-through text-sm">{formatPrice(tour.original_price_adult)}</span>
                    <span className="text-green-400 font-semibold ml-2">{formatPrice(tour.discount_price_adult)}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm">{tour.bookings?.length || 0} bookings</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {tours.length === 0 && !loading && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No tours created yet</h3>
            <p className="text-slate-500 mb-4">Start by creating your first tour</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all"
            >
              Create my first tour
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App