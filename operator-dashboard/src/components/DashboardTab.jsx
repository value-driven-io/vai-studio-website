import React from 'react'
import { 
  RefreshCw, 
  Award, 
  BarChart3, 
  Clock, 
  Calendar, 
  ChevronUp, 
  ChevronDown,
  TrendingUp,
  Users,
  DollarSign,
  MessageCircle,
  Phone,
  Plus,           
  AlertCircle,   
  Star,          
  Edit2           
} from 'lucide-react'

const DashboardTab = ({ 
  tours, 
  stats, 
  allBookings, 
  expandedSections, 
  setExpandedSections,
  fetchTours,
  setActiveTab,
  bookingsLoading,
  loading,
  operator,
  setEditingTour,    
  setFormData,      
  setShowForm       
}) => {
    const formatPrice = (amount) => {
        if (!amount) return '0 XPF'
        return new Intl.NumberFormat('fr-PF', {
        style: 'currency',
        currency: 'XPF',
        minimumFractionDigits: 0
        }).format(amount)
    }

  return (
    <div className="space-y-6">
     

    <div className="space-y-6">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Dashboard Overview</h2>
                <p className="text-slate-400">Monitor your tours and performance</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => fetchTours()}
                  className="p-2 text-slate-400 hover:text-white border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
                  title="Refresh data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTab('create')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  Create Tour
                </button>
              </div>
            </div>

            {/* Revenue & Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Revenue Card */}
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{formatPrice(stats.operator_revenue)}</p>
                    <p className="text-green-400 text-sm">Your Revenue</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-400">↗ +12%</span>
                  <span className="text-slate-400">vs last month</span>
                </div>
              </div>

              {/* Total Bookings Card */}
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{stats.totalBookings}</p>
                    <p className="text-blue-400 text-sm">Total Bookings</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-blue-400">↗ +{stats.confirmedBookings}</span>
                  <span className="text-slate-400">confirmed</span>
                </div>
              </div>

              {/* Pending Actions Card */}
              <button
                onClick={() => setActiveTab('bookings')}
                className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-6 hover:scale-105 transition-transform text-left"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{stats.pendingBookings}</p>
                    <p className="text-orange-400 text-sm">Pending Actions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {stats.pendingBookings > 0 ? (
                    <span className="text-orange-400">⚠ Needs attention</span>
                  ) : (
                    <span className="text-green-400">✓ All caught up</span>
                  )}
                </div>
              </button>

              {/* Active Tours Card */}
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{tours.filter(t => t.status === 'active').length}</p>
                    <p className="text-purple-400 text-sm">Active Tours</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-purple-400">📅 {tours.filter(t => new Date(t.tour_date) >= new Date()).length}</span>
                  <span className="text-slate-400">upcoming</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('create')}
                  className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Create Tour</h4>
                    <p className="text-slate-400 text-sm">Add new tour experience</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('bookings')}
                  className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Manage Bookings</h4>
                    <p className="text-slate-400 text-sm">{stats.pendingBookings} pending requests</p>
                  </div>
                </button>

                <button
                  onClick={() => window.open('https://wa.me/68987269065', '_blank')}
                  className="flex items-center gap-3 p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Get Support</h4>
                    <p className="text-slate-400 text-sm">Contact VAI Tickets</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Expandable Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* All Tours Overview - Expandable */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
                <button
                  onClick={() => setExpandedSections(prev => ({ ...prev, allTours: !prev.allTours }))}
                  className="w-full p-6 border-b border-slate-700 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-white">All Tours</h3>
                      <p className="text-slate-400 text-sm">{tours.length} total tours created</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <div className="text-green-400">{tours.filter(t => new Date(t.tour_date) >= new Date()).length} upcoming</div>
                      <div className="text-slate-400">{tours.filter(t => new Date(t.tour_date) < new Date()).length} completed</div>
                    </div>
                    {expandedSections.allTours ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>
                
                {expandedSections.allTours && (
                  <div className="p-6 max-h-96 overflow-y-auto">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <div className="text-slate-400 text-sm">Loading tours...</div>
                      </div>
                    ) : (
                      <>
                        {/* Upcoming Tours */}
                        {tours.filter(t => new Date(t.tour_date) >= new Date()).length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-green-400" />
                              Upcoming Tours ({tours.filter(t => new Date(t.tour_date) >= new Date()).length})
                            </h4>
                            <div className="space-y-3">
                              {tours.filter(t => new Date(t.tour_date) >= new Date()).map((tour) => {
                                const bookedSpots = tour.max_capacity - tour.available_spots
                                const occupancyRate = Math.round((bookedSpots / tour.max_capacity) * 100)
                                
                                return (
                                  <div key={tour.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                                    <div className="flex-1">
                                      <h5 className="text-white font-medium text-sm">{tour.tour_name}</h5>
                                      <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                                        <span>{new Date(tour.tour_date).toLocaleDateString()}</span>
                                        <span>{tour.time_slot}</span>
                                        <span className="text-slate-400">•</span>
                                        <span>{bookedSpots}/{tour.max_capacity} booked</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        occupancyRate >= 90 ? 'bg-red-500/20 text-red-400' :
                                        occupancyRate >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                                        occupancyRate >= 40 ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-green-500/20 text-green-400'
                                      }`}>
                                        {occupancyRate}%
                                      </div>
                                      <button
                                        onClick={() => {
                                          setEditingTour(tour)
                                          setFormData(tour)
                                          setActiveTab('create')
                                          setShowForm(true)
                                        }}
                                        className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Past Tours */}
                        {tours.filter(t => new Date(t.tour_date) < new Date()).length > 0 && (
                          <div>
                            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                              <Award className="w-4 h-4 text-slate-400" />
                              Completed Tours ({tours.filter(t => new Date(t.tour_date) < new Date()).length})
                            </h4>
                            <div className="space-y-3">
                              {tours.filter(t => new Date(t.tour_date) < new Date()).slice(0, 5).map((tour) => {
                                const bookedSpots = tour.max_capacity - tour.available_spots
                                const occupancyRate = Math.round((bookedSpots / tour.max_capacity) * 100)
                                
                                return (
                                  <div key={tour.id} className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg">
                                    <div className="flex-1">
                                      <h5 className="text-slate-300 font-medium text-sm">{tour.tour_name}</h5>
                                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                        <span>{new Date(tour.tour_date).toLocaleDateString()}</span>
                                        <span>{tour.time_slot}</span>
                                        <span>•</span>
                                        <span>{bookedSpots}/{tour.max_capacity} attended</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        occupancyRate >= 90 ? 'bg-green-500/20 text-green-400' :
                                        occupancyRate >= 70 ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-slate-500/20 text-slate-400'
                                      }`}>
                                        {occupancyRate}%
                                      </div>
                                      <div className="text-xs text-slate-400">
                                        {formatPrice(
                                            allBookings
                                            .filter(b => b.tour_id === tour.id && ['confirmed', 'completed'].includes(b.booking_status))
                                            .reduce((sum, b) => sum + (b.subtotal || 0), 0)
                                        )}
                                        </div>
                                    </div>
                                  </div>
                                )
                              })}
                              {tours.filter(t => new Date(t.tour_date) < new Date()).length > 5 && (
                                <p className="text-slate-400 text-xs text-center py-2">
                                  + {tours.filter(t => new Date(t.tour_date) < new Date()).length - 5} more completed tours
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {tours.length === 0 && (
                          <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-400">No tours created yet</p>
                            <button
                              onClick={() => setActiveTab('create')}
                              className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
                            >
                              Create your first tour →
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Recent Activity - Expandable */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
                <button
                  onClick={() => setExpandedSections(prev => ({ ...prev, recentActivity: !prev.recentActivity }))}
                  className="w-full p-6 border-b border-slate-700 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-orange-400" />
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                      <p className="text-slate-400 text-sm">Latest bookings and updates</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <div className="text-blue-400">{allBookings.length} total</div>
                      <div className="text-slate-400">this month</div>
                    </div>
                    {expandedSections.recentActivity ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>
                
                {expandedSections.recentActivity && (
                  <div className="p-6 max-h-96 overflow-y-auto">
                    {bookingsLoading ? (
                      <div className="text-center py-8">
                        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <div className="text-slate-400 text-sm">Loading activity...</div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {allBookings.slice(0, 10).map((booking) => (
                          <div key={booking.id} className="flex items-center gap-3 p-3 bg-slate-700/20 rounded-lg hover:bg-slate-700/40 transition-colors">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                              booking.booking_status === 'confirmed' ? 'bg-green-400' :
                              booking.booking_status === 'pending' ? 'bg-orange-400' :
                              booking.booking_status === 'declined' ? 'bg-red-400' :
                              'bg-slate-400'
                            }`} />
                            <div className="flex-1">
                              <p className="text-white text-sm">
                                New booking for <span className="font-medium">{booking.tours?.tour_name}</span>
                              </p>
                              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                <span>{new Date(booking.created_at).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{booking.num_adults + booking.num_children} participants</span>
                                <span>•</span>
                                <span>{formatPrice(booking.subtotal)}</span>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                              booking.booking_status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                              booking.booking_status === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                              booking.booking_status === 'declined' ? 'bg-red-500/20 text-red-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>
                              {booking.booking_status}
                            </span>
                          </div>
                        ))}
                        {allBookings.length === 0 && (
                          <div className="text-center py-8">
                            <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-400">No recent activity</p>
                          </div>
                        )}
                        {allBookings.length > 10 && (
                          <button
                            onClick={() => setActiveTab('bookings')}
                            className="w-full text-blue-400 hover:text-blue-300 text-sm py-2"
                          >
                            View all {allBookings.length} bookings →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Performance Insights - Optional Expandable */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
              <button
                onClick={() => setExpandedSections(prev => ({ ...prev, insights: !prev.insights }))}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white">Performance Insights</h3>
                    <p className="text-slate-400 text-sm">Quick tips to improve your bookings</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {expandedSections.insights ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>
              
              {expandedSections.insights && (
                <div className="px-6 pb-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <h4 className="text-green-400 font-medium text-sm mb-2">💡 Quick Tip</h4>
                      <p className="text-slate-300 text-sm">Tours posted 4-6 hours before departure get 40% more bookings</p>
                    </div>
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <h4 className="text-blue-400 font-medium text-sm mb-2">📈 Trending</h4>
                      <p className="text-slate-300 text-sm">Sunset tours are in high demand this week</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>


    </div>
  )
}

export default DashboardTab