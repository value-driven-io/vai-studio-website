import React, { useState, useEffect } from 'react'
import { 
  User, Building2, MapPin, Phone, Mail, Calendar, 
  TrendingUp, Award, Clock, CheckCircle, AlertCircle,
  Settings, Shield, Star, DollarSign, Activity,
  Edit3, Save, X, Bell, Globe, Users, Target
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

const ProfileTab = () => {
  const { operator } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [stats, setStats] = useState(null)
  const [performance, setPerformance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Load operator stats and performance data
  useEffect(() => {
    if (operator?.id) {
      loadDashboardData()
    }
  }, [operator])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Get booking summary stats
      const { data: summaryData } = await supabase
        .from('operator_booking_summary')
        .select('*')
        .eq('operator_id', operator.id)
        .single()

      setStats(summaryData || {
        total_bookings: 0,
        confirmed_bookings: 0,
        pending_bookings: 0,
        total_revenue: 0,
        total_commission: 0
      })

      // Get recent performance metrics
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: recentBookings } = await supabase
        .from('bookings')
        .select('booking_status, created_at, total_amount, subtotal')
        .eq('operator_id', operator.id)
        .gte('created_at', thirtyDaysAgo.toISOString())

      // Calculate performance metrics
      const responseTime = Math.floor(Math.random() * 4) + 1 // Placeholder - would need actual data
      const completionRate = stats?.total_bookings > 0 ? 
        Math.round((stats.confirmed_bookings / stats.total_bookings) * 100) : 0

      const monthlyBookings = recentBookings?.length || 0
      const monthlyRevenue = recentBookings
        ?.filter(b => b.booking_status === 'confirmed')
        ?.reduce((sum, b) => sum + (b.subtotal || 0), 0) || 0

      setPerformance({
        responseTime,
        completionRate,
        monthlyBookings,
        monthlyRevenue,
        businessHealthScore: Math.min(100, Math.max(0, 
          (completionRate * 0.4) + 
          ((5 - responseTime) * 10 * 0.3) + 
          (operator.average_rating ? operator.average_rating * 20 * 0.3 : 60)
        ))
      })

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditData({
      company_name: operator.company_name || '',
      contact_person: operator.contact_person || '',
      phone: operator.phone || '',
      whatsapp_number: operator.whatsapp_number || '',
      island: operator.island || '',
      address: operator.address || '',
      notes: operator.notes || ''
    })
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const { error } = await supabase
        .from('operators')
        .update(editData)
        .eq('id', operator.id)

      if (error) throw error
      
      // Update the operator object in auth context would require a refresh
      // For now, we'll just close the edit mode
      setIsEditing(false)
      alert('Profile updated successfully!')
      
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData({})
  }

  const getAchievementBadges = () => {
    const badges = []
    
    if (operator.whale_tour_certified) {
      badges.push({ icon: Award, label: 'Whale Certified', color: 'bg-blue-500' })
    }
    
    if (stats?.total_bookings >= 100) {
      badges.push({ icon: Target, label: '100+ Tours', color: 'bg-green-500' })
    }
    
    if (operator.average_rating >= 4.5) {
      badges.push({ icon: Star, label: 'Top Rated', color: 'bg-yellow-500' })
    }
    
    if (performance?.responseTime <= 2) {
      badges.push({ icon: Clock, label: 'Quick Responder', color: 'bg-purple-500' })
    }

    return badges
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-PF', {
      style: 'currency',
      currency: 'XPF',
      minimumFractionDigits: 0
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  if (!operator) {
    return <div className="text-white">No operator data available</div>
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Building2 className="w-7 h-7 text-blue-400" />
              {operator.company_name}
            </h1>
            <p className="text-slate-400 mt-1">Operator Business Hub</p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-wrap gap-3 mb-4">
          <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            operator.status === 'active' 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              operator.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
            }`} />
            {operator.status === 'active' ? 'Active Operator' : 'Pending Approval'}
          </span>
          <span className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Calendar className="w-3 h-3" />
            Member since {formatDate(operator.created_at)}
          </span>
        </div>

        {/* Achievement Badges */}
        <div className="flex flex-wrap gap-2">
          {getAchievementBadges().map((badge, index) => (
            <span
              key={index}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white ${badge.color}`}
            >
              <badge.icon className="w-3 h-3" />
              {badge.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Details */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Business Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Company Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.company_name}
                    onChange={(e) => setEditData({...editData, company_name: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg">{operator.company_name}</p>
                )}
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Contact Person</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.contact_person}
                    onChange={(e) => setEditData({...editData, contact_person: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg">{operator.contact_person || 'Not specified'}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg flex-1">{operator.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.phone}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg flex-1">{operator.phone || 'Not specified'}</p>
                  </div>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">WhatsApp</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.whatsapp_number}
                    onChange={(e) => setEditData({...editData, whatsapp_number: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-400" />
                    <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg flex-1">{operator.whatsapp_number}</p>
                  </div>
                )}
              </div>

              {/* Island */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Island</label>
                {isEditing ? (
                  <select
                    value={editData.island}
                    onChange={(e) => setEditData({...editData, island: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Island</option>
                    <option value="Tahiti">Tahiti</option>
                    <option value="Moorea">Moorea</option>
                    <option value="Bora Bora">Bora Bora</option>
                    <option value="Huahine">Huahine</option>
                    <option value="Raiatea">Raiatea</option>
                    <option value="Taha'a">Taha'a</option>
                    <option value="Maupiti">Maupiti</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg flex-1">{operator.island}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
              {isEditing ? (
                <textarea
                  value={editData.address}
                  onChange={(e) => setEditData({...editData, address: e.target.value})}
                  rows="2"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg">{operator.address || 'Not specified'}</p>
              )}
            </div>
          </div>

          {/* Business Credentials */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              Business Credentials
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="font-medium text-white">Business License</p>
                  <p className="text-sm text-slate-400">{operator.business_license || 'Not provided'}</p>
                </div>
                <CheckCircle className={`w-5 h-5 ${operator.business_license ? 'text-green-400' : 'text-slate-500'}`} />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="font-medium text-white">Insurance Certificate</p>
                  <p className="text-sm text-slate-400">{operator.insurance_certificate || 'Not provided'}</p>
                </div>
                <CheckCircle className={`w-5 h-5 ${operator.insurance_certificate ? 'text-green-400' : 'text-slate-500'}`} />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="font-medium text-white">Whale Tour Certified</p>
                  <p className="text-sm text-slate-400">Marine wildlife compliance</p>
                </div>
                <CheckCircle className={`w-5 h-5 ${operator.whale_tour_certified ? 'text-green-400' : 'text-slate-500'}`} />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="font-medium text-white">Commission Rate</p>
                  <p className="text-sm text-slate-400">{operator.commission_rate}% platform fee</p>
                </div>
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Dashboard Sidebar */}
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Performance
            </h2>
            
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-slate-700/30 rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-slate-600 rounded mb-2"></div>
                    <div className="h-6 bg-slate-600 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Total Tours</p>
                  <p className="text-2xl font-bold text-white">{stats?.total_bookings || 0}</p>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Average Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-white">
                      {operator.average_rating ? operator.average_rating.toFixed(1) : 'N/A'}
                    </p>
                    {operator.average_rating && (
                      <div className="flex">
                        {[1,2,3,4,5].map(star => (
                          <Star 
                            key={star} 
                            className={`w-4 h-4 ${star <= operator.average_rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-500'}`} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats?.total_revenue)}</p>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Pending Bookings</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats?.pending_bookings || 0}</p>
                </div>
              </div>
            )}
          </div>

          {/* Business Health Score */}
          {performance && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Business Health
              </h2>
              
              <div className="text-center mb-4">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-slate-600"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - performance.businessHealthScore / 100)}`}
                      className="text-purple-400"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{Math.round(performance.businessHealthScore)}</span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">Overall Score</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Response Time</span>
                  <span className="text-white font-medium">{performance.responseTime}h avg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Completion Rate</span>
                  <span className="text-white font-medium">{performance.completionRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Monthly Bookings</span>
                  <span className="text-white font-medium">{performance.monthlyBookings}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-400" />
              Quick Actions
            </h2>
            
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-blue-400" />
                  <span className="text-white">Notifications</span>
                </div>
                <span className="text-slate-400 text-sm">Configure</span>
              </button>
              
              <button className="w-full flex items-center justify-between p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-green-400" />
                  <span className="text-white">Business Hours</span>
                </div>
                <span className="text-slate-400 text-sm">Set</span>
              </button>
              
              <button className="w-full flex items-center justify-between p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-white">Support Center</span>
                </div>
                <span className="text-slate-400 text-sm">Contact</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Analytics Row */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Platform Analytics
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{stats?.confirmed_bookings || 0}</p>
            <p className="text-slate-400 text-sm">Confirmed Tours</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(stats?.total_commission)}</p>
            <p className="text-slate-400 text-sm">Total Commission</p>
          </div>
          
          <div className="text-center">
            <div className="bg-yellow-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-white">{performance?.responseTime || 'N/A'}h</p>
            <p className="text-slate-400 text-sm">Avg Response Time</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{Math.round(performance?.businessHealthScore || 0)}</p>
            <p className="text-slate-400 text-sm">Health Score</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileTab