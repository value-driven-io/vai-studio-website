import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  Building2, MapPin, Phone, Mail, ChevronDown, ChevronUp,
  Award, CheckCircle, Info, Plus, Shield, Star, HelpCircle, 
  TrendingUp, Target, Edit3, Save, X, Globe, Loader, MessageCircle,
  Zap, CreditCard, RefreshCw, Search, Users, DollarSign, 
  Lightbulb, Clock
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

// FIXED: Move ExpandableSection OUTSIDE of ProfileTab component
const ExpandableSection = ({ 
  title, 
  icon: Icon, 
  iconColor, 
  isExpanded, 
  onToggle, 
  badge,
  urgent,
  children,
  className = "",
  showEditButton = false,
  onEdit
}) => (
  <div className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden ${className}`}>
    <div className="p-6 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
      <button
        onClick={onToggle}
        className="flex items-center gap-3 flex-1"
      >
        <Icon className={`w-6 h-6 ${iconColor}`} />
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {badge && (
          <span className={`px-2 py-1 text-xs rounded-full border ${
            urgent 
              ? 'bg-red-500/20 text-red-400 border-red-500/30' 
              : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
          }`}>
            {badge}
          </span>
        )}
      </button>
      
      <div className="flex items-center gap-2">
        {showEditButton && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            <Edit3 className="w-3 h-3" />
            Edit
          </button>
        )}
        <button onClick={onToggle}>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>
      </div>
    </div>
    {isExpanded && (
      <div className="border-t border-slate-700">
        {children}
      </div>
    )}
  </div>
)

// FIXED: Move Tooltip OUTSIDE of ProfileTab component as well
const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [actualPosition, setActualPosition] = useState(position)

  const handleMouseEnter = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    
    // Auto-adjust position based on viewport
    let newPosition = position
    if (position === 'top' && rect.top < 100) newPosition = 'bottom'
    if (position === 'bottom' && rect.bottom > viewport.height - 100) newPosition = 'top'
    if (position === 'left' && rect.left < 200) newPosition = 'right'
    if (position === 'right' && rect.right > viewport.width - 200) newPosition = 'left'
    
    setActualPosition(newPosition)
    setIsVisible(true)
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className={`absolute z-50 px-3 py-2 text-sm bg-slate-900 text-slate-200 rounded-lg border border-slate-600 shadow-lg whitespace-nowrap ${
          actualPosition === 'top' ? 'bottom-full mb-2 left-1/2 transform -translate-x-1/2' :
          actualPosition === 'bottom' ? 'top-full mt-2 left-1/2 transform -translate-x-1/2' :
          actualPosition === 'left' ? 'right-full mr-2 top-1/2 transform -translate-y-1/2' :
          'left-full ml-2 top-1/2 transform -translate-y-1/2'
        }`}>
          {content}
          <div className={`absolute w-2 h-2 bg-slate-900 border-r border-b border-slate-600 transform rotate-45 ${
            actualPosition === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
            actualPosition === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
            actualPosition === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
            'right-full top-1/2 -translate-y-1/2 -mr-1'
          }`} />
        </div>
      )}
    </div>
  )
}

const ProfileTab = ({ setActiveTab }) => {
  const { operator } = useAuth()
  const [expandedSections, setExpandedSections] = useState({
    business: window.innerWidth >= 1024,
    credentials: window.innerWidth >= 1024,
    billing: window.innerWidth >= 1024,
    businessHealth: true,
    marketingInsights: true,
    growthOpportunities: true
  })
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [stats, setStats] = useState(null)
  const [performance, setPerformance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  // Memoized profile completeness calculation
  const profileCompleteness = useMemo(() => {
    if (!operator) return 0
    
    // Required fields (database NOT NULL constraints)
    const requiredFields = [
      operator.company_name,
      operator.email, 
      operator.whatsapp_number,
      operator.island
    ]

    // Important optional fields for business credibility
    const optionalFields = [
      operator.contact_person,
      operator.phone,
      operator.address,
      operator.business_license
    ]

    const requiredFilled = requiredFields.filter(field => field?.trim()).length
    const optionalFilled = optionalFields.filter(field => field?.trim()).length

    // 70% weight for required, 30% for optional
    const completeness = Math.round(
      (requiredFilled / requiredFields.length) * 70 + 
      (optionalFilled / optionalFields.length) * 30
    )

    return completeness
  }, [operator])

  // Business Health Score calculation
  const businessHealthScore = useMemo(() => {
    if (!operator || !stats) return 0
    
    let score = 0
    
    // Profile completeness (30%)
    score += (profileCompleteness / 100) * 30
    
    // Response time (25%) - lower is better
    const avgResponseHours = stats.avg_response_time_hours || 24
    const responseScore = Math.max(0, (24 - avgResponseHours) / 24)
    score += responseScore * 25
    
    // Booking completion rate (25%)
    const completionRate = stats.total_bookings > 0 ? 
      (stats.confirmed_bookings / stats.total_bookings) : 0
    score += completionRate * 25
    
    // Rating (20%)
    const ratingScore = operator.average_rating ? (operator.average_rating / 5) : 0.6
    score += ratingScore * 20
    
    return Math.round(score)
  }, [operator, stats, profileCompleteness])

  // Dashboard data loading
    const loadDashboardData = useCallback(async () => {
    if (!operator?.id) return

    try {
        setLoading(true)

        // Use direct queries instead of booking_summary table
        const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('operator_id', operator.id)

        if (bookingsError) console.warn('No bookings found:', bookingsError)

        // Calculate stats from real data
        const totalBookings = bookingsData?.length || 0
        const confirmedBookings = bookingsData?.filter(b => b.booking_status === 'confirmed').length || 0
        const totalRevenue = bookingsData
        ?.filter(b => ['confirmed', 'completed'].includes(b.booking_status))
        ?.reduce((sum, b) => sum + (b.subtotal || 0), 0) || 0
        
        // Use operator data for other fields
        const calculatedStats = {
        total_bookings: totalBookings,
        confirmed_bookings: confirmedBookings,
        completed_bookings: bookingsData?.filter(b => ['confirmed', 'completed'].includes(b.booking_status)).length || 0,
        total_revenue: totalRevenue, // Keep for commission calculation
        total_commission: totalRevenue * ((operator.commission_rate || 10) / 100),
        operator_revenue: totalRevenue * (1 - ((operator.commission_rate || 10) / 100)), // ADD THIS - what operator actually keeps
        avg_response_time_hours: 2
        }

        setStats(calculatedStats)

        const responseTime = calculatedStats.avg_response_time_hours
        const completionRate = totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0
        const monthlyBookings = totalBookings
        const monthlyRevenue = totalRevenue

        setPerformance({
        responseTime,
        completionRate,
        monthlyBookings,
        monthlyRevenue,
        businessHealthScore
        })

    } catch (error) {
        console.error('Error loading dashboard data:', error)
        // Set empty stats if error
        setStats({
        total_bookings: 0,
        confirmed_bookings: 0,
        total_revenue: 0,
        total_commission: 0,
        avg_response_time_hours: 0
        })
    } finally {
        setLoading(false)
    }
    }, [operator?.id, operator?.commission_rate, businessHealthScore])


  // Refresh function
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }, [loadDashboardData])

  // Load data on mount and operator change
  useEffect(() => {
    if (operator?.id) {
      loadDashboardData()
    }
  }, [operator?.id, loadDashboardData])

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }, [])

  const handleEdit = useCallback(() => {
    if (!operator) return
    
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
    setSaveMessage('')
  }, [operator])

  // FIXED: Optimized save without causing re-renders
  const handleSave = async () => {
    try {
      setSaving(true)
      setSaveMessage('')

      // Client-side validation only
      const errors = []
      if (!editData.company_name?.trim()) errors.push('Company name is required')
      if (!editData.whatsapp_number?.trim()) errors.push('WhatsApp number is required') 
      if (!editData.island?.trim()) errors.push('Island is required')

      if (errors.length > 0) {
        throw new Error(errors.join(', '))
      }

      const updatePayload = {
        company_name: editData.company_name.trim(),
        contact_person: editData.contact_person?.trim() || null,
        phone: editData.phone?.trim() || null,
        whatsapp_number: editData.whatsapp_number.trim(),
        island: editData.island.trim(),
        address: editData.address?.trim() || null,
        notes: editData.notes?.trim() || null,
        updated_at: new Date().toISOString()
      }

      const { data: updateResult, error } = await supabase
        .from('operators')
        .update(updatePayload)
        .eq('id', operator.id)
        .select()

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Profile not found. Please contact support.')
        } else if (error.code === '23505') {
          throw new Error('This information conflicts with another account. Please check your data.')
        } else if (error.message.includes('permission')) {
          throw new Error('You don\'t have permission to update this profile. Contact support.')
        } else {
          throw new Error('Unable to save changes. Please try again or contact support if the problem persists.')
        }
      }

      if (!updateResult || updateResult.length === 0) {
        throw new Error('Update failed: Database security policy prevented the update. Please contact support at hello@vai.studio to configure your account permissions.')
      }

      // FIXED: Update localStorage without calling login() to prevent re-render
      if (updateResult[0]) {
        localStorage.setItem('vai_operator', JSON.stringify(updateResult[0]))
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      setIsEditing(false)
      setSaveMessage('✅ Profile updated successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
      
    } catch (error) {
      console.error('Error updating profile:', error)
      setSaveMessage(`❌ ${error.message}`)
      
      if (error.message.includes('support')) {
        setSaveMessage(prev => prev + ' Contact: hello@vai.studio')
      }
      
      setTimeout(() => setSaveMessage(''), 8000)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    setEditData({})
    setSaveMessage('')
  }, [])

  // Check which required fields are missing
  const getMissingRequiredFields = useMemo(() => {
    if (!operator) return []
    const missing = []
    if (!operator.company_name?.trim()) missing.push('Company name')
    if (!operator.whatsapp_number?.trim()) missing.push('WhatsApp number') 
    if (!operator.island?.trim()) missing.push('Operating island')
    return missing
  }, [operator])

  const getAchievementBadges = () => {
    const badges = []
    
    if (operator.whale_tour_certified) {
      badges.push({
        icon: Award,
        text: 'Whale Tour Certified',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20'
      })
    }
    
    if (operator.average_rating >= 4.8) {
      badges.push({
        icon: Star,
        text: 'Premium Operator',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20'
      })
    }
    
    if (operator.total_bookings >= 100) {
      badges.push({
        icon: CheckCircle,
        text: 'Experienced Host',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20'
      })
    }
    
    return badges
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-PF', {
      style: 'currency',
      currency: 'XPF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Quick Actions Modal
  const QuickActionsModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Quick Actions</h3>
          <button
            onClick={() => setShowQuickActions(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-3">
          <a
            href="https://wa.me/68987269065"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-white font-medium">WhatsApp Support</p>
              <p className="text-slate-400 text-sm">Get instant help</p>
            </div>
          </a>
          
          <a
            href="mailto:hello@vai.studio"
            className="flex items-center gap-3 p-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-colors"
          >
            <Mail className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-white font-medium">Email Support</p>
              <p className="text-slate-400 text-sm">hello@vai.studio</p>
            </div>
          </a>
          
          <button
            onClick={() => {
              setShowQuickActions(false)
              if (setActiveTab) {
                setActiveTab('create')
              }
            }}
            className="w-full flex items-center gap-3 p-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-white font-medium">Create New Tour</p>
              <p className="text-slate-400 text-sm">Add last-minute availability</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
                {operator.company_name || 'Unnamed Company'}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{operator.island || 'Location not set'}</span>
                </div>
                {operator.average_rating && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{operator.average_rating.toFixed(1)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>VAI Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Completeness */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 font-medium">Profile Completeness</span>
              <span className="text-white font-bold">{profileCompleteness}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  profileCompleteness >= 80 ? 'bg-green-500' : 
                  profileCompleteness >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${profileCompleteness}%` }}
              />
            </div>
            {profileCompleteness < 100 && (
              <p className="text-xs text-slate-400 mt-1">
                {getMissingRequiredFields.length > 0 
                  ? `Missing required fields: ${getMissingRequiredFields.join(', ')}`
                  : 'Add optional business details to reach 100%'
                }
              </p>
            )}
          </div>

          {/* Achievement Badges */}
          {getAchievementBadges().length > 0 && (
            <div className="flex flex-wrap gap-2">
              {getAchievementBadges().map((badge, index) => (
                <Tooltip key={index} content={`You earned the ${badge.text} badge`}>
                  <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white ${badge.bgColor} cursor-help`}>
                    <badge.icon className="w-3 h-3" />
                    {badge.text}
                  </span>
                </Tooltip>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setShowQuickActions(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Zap className="w-4 h-4" />
              Quick Actions
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-800 text-white rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-4 rounded-lg border ${
          saveMessage.includes('✅') 
            ? 'bg-green-500/10 border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* Quick Actions Modal */}
      {showQuickActions && <QuickActionsModal />}

      {/* Two-Column Layout for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Right Column */}
        <div className="space-y-6">
          {/* 1. Business Information */}
          <ExpandableSection
            title="Business Information"
            icon={Building2}
            iconColor="text-blue-400"
            isExpanded={isEditing || expandedSections.business}
            onToggle={() => !isEditing && toggleSection('business')}
            badge={getMissingRequiredFields.length > 0 ? 'Required fields missing' : (profileCompleteness < 80 ? 'Incomplete' : null)}
            urgent={getMissingRequiredFields.length > 0}
            showEditButton={!isEditing}
            onEdit={handleEdit}
          >
            <div className="space-y-4 p-6">
              {isEditing && (
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors"
                  >
                    {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company Name - REQUIRED */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Company Name *
                    {isEditing && (
                      <Tooltip content="This is how tourists will see your business">
                        <Info className="w-3 h-3 text-slate-400 inline ml-1" />
                      </Tooltip>
                    )}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.company_name || ''}
                      onChange={(e) => setEditData(prev => ({...prev, company_name: e.target.value}))}
                      className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                        !editData.company_name?.trim() ? 'border-red-500' : 'border-slate-600'
                      }`}
                      placeholder="Enter your company name"
                      autoComplete="organization"
                    />
                  ) : (
                    <p className={`px-3 py-2 rounded-lg ${
                      operator.company_name ? 'text-white bg-slate-700/50' : 'text-red-400 bg-red-500/10 border border-red-500/30'
                    }`}>
                      {operator.company_name || 'Required field missing'}
                    </p>
                  )}
                </div>

                {/* Contact Person - Optional */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Contact Person
                    {isEditing && (
                      <Tooltip content="Primary contact for booking confirmations">
                        <Info className="w-3 h-3 text-slate-400 inline ml-1" />
                      </Tooltip>
                    )}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.contact_person || ''}
                      onChange={(e) => setEditData(prev => ({...prev, contact_person: e.target.value}))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="Primary contact name"
                      autoComplete="name"
                    />
                  ) : (
                    <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg">{operator.contact_person || 'Not specified'}</p>
                  )}
                </div>

                {/* Email - Required but not editable */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address *
                    {isEditing && (
                      <Tooltip content="Contact VAI Support to change email address">
                        <Info className="w-3 h-3 text-slate-400 inline ml-1" />
                      </Tooltip>
                    )}
                  </label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg flex-1">{operator.email}</p>
                    {isEditing && (
                      <Tooltip content="Email changes require VAI Support verification">
                        <HelpCircle className="w-4 h-4 text-yellow-400" />
                      </Tooltip>
                    )}
                  </div>
                </div>

                {/* Phone - Optional */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number
                    {isEditing && (
                      <Tooltip content="Include country code (e.g., +689 for French Polynesia)">
                        <Info className="w-3 h-3 text-slate-400 inline ml-1" />
                      </Tooltip>
                    )}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.phone || ''}
                      onChange={(e) => setEditData(prev => ({...prev, phone: e.target.value}))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="+689 XX XX XX XX"
                      autoComplete="tel"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg flex-1">{operator.phone || 'Not specified'}</p>
                    </div>
                  )}
                </div>

                {/* WhatsApp - REQUIRED */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    WhatsApp Number *
                    {isEditing && (
                      <Tooltip content="Used for instant booking notifications and customer communication">
                        <Info className="w-3 h-3 text-slate-400 inline ml-1" />
                      </Tooltip>
                    )}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.whatsapp_number || ''}
                      onChange={(e) => setEditData(prev => ({...prev, whatsapp_number: e.target.value}))}
                      className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                        !editData.whatsapp_number?.trim() ? 'border-red-500' : 'border-slate-600'
                      }`}
                      placeholder="+689 XX XX XX XX"
                      autoComplete="tel"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-400" />
                      <p className={`px-3 py-2 rounded-lg flex-1 ${
                        operator.whatsapp_number ? 'text-white bg-slate-700/50' : 'text-red-400 bg-red-500/10 border border-red-500/30'
                      }`}>
                        {operator.whatsapp_number || 'Required field missing'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Island - REQUIRED */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Operating Island *
                    {isEditing && (
                      <Tooltip content="Primary island where you operate tours">
                        <Info className="w-3 h-3 text-slate-400 inline ml-1" />
                      </Tooltip>
                    )}
                  </label>
                  {isEditing ? (
                    <select
                      value={editData.island || ''}
                      onChange={(e) => setEditData(prev => ({...prev, island: e.target.value}))}
                      className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none focus:border-blue-500 ${
                        !editData.island?.trim() ? 'border-red-500' : 'border-slate-600'
                      }`}
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
                      <p className={`px-3 py-2 rounded-lg flex-1 ${
                        operator.island ? 'text-white bg-slate-700/50' : 'text-red-400 bg-red-500/10 border border-red-500/30'
                      }`}>
                        {operator.island || 'Required field missing'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Address - Optional */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Business Address
                    {isEditing && (
                      <Tooltip content="Physical location of your business">
                        <Info className="w-3 h-3 text-slate-400 inline ml-1" />
                      </Tooltip>
                    )}
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editData.address || ''}
                      onChange={(e) => setEditData(prev => ({...prev, address: e.target.value}))}
                      rows="2"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="Enter your business address or primary meeting point"
                      autoComplete="street-address"
                    />
                  ) : (
                    <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg">{operator.address || 'Not specified'}</p>
                  )}
                </div>
              </div>
            </div>
          </ExpandableSection>

          {/* 2. Business Credentials */}
          <ExpandableSection
            title="Business Credentials"
            icon={Shield}
            iconColor="text-green-400"
            isExpanded={expandedSections.credentials}
            onToggle={() => toggleSection('credentials')}
          >
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
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
                    <p className="text-sm text-slate-400">2025 marine wildlife compliance</p>
                  </div>
                  <CheckCircle className={`w-5 h-5 ${operator.whale_tour_certified ? 'text-green-400' : 'text-slate-500'}`} />
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-blue-400 font-medium">Missing Credentials?</p>
                    <p className="text-slate-300 text-sm mt-1">
                      Contact VAI Support to upload business license, insurance certificate, or apply for whale tour certification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ExpandableSection>

          {/* 3. Enhanced Billing & Commission */}
          <ExpandableSection
            title="Billing & Revenue"
            icon={CreditCard}
            iconColor="text-yellow-400"
            isExpanded={expandedSections.billing}
            onToggle={() => toggleSection('billing')}
          >
            <div className="p-6">
              <div className="space-y-4">
                {/* Commission Overview */}
                <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400">Commission Rate</span>
                        <span className="text-white font-semibold">{operator.commission_rate}%</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400">Commission Owed</span>
                        <span className="text-orange-400 font-semibold">{formatCurrency(stats?.total_commission || 0)}</span>
                    </div>
                    <div className="w-full bg-slate-600 h-px my-3"></div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400">Your Revenue</span>
                        <span className="text-green-400 font-bold text-lg">
                        {formatCurrency(stats?.operator_revenue || 0)}
                        </span>
                    </div>
                </div>

                {/* Recent Tour Performance */}
                <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg p-4 border border-green-500/20">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    Recent Tour Performance
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                        <p className="text-slate-400 text-sm">VAI Bookings</p>
                        <p className="text-white font-bold">{stats?.completed_bookings || 0}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Your Revenue</p>
                        <p className="text-green-400 font-bold">{formatCurrency(stats?.operator_revenue || 0)}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Avg per Booking</p>
                        <p className="text-white font-bold">
                        {stats?.completed_bookings > 0 ? 
                            formatCurrency((stats?.operator_revenue || 0) / stats.completed_bookings) : 
                            formatCurrency(0)
                        }
                        </p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Commission Paid</p>
                        <p className="text-slate-400 font-bold">{formatCurrency(stats?.total_commission || 0)}</p>
                    </div>
                    </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-blue-400 font-medium">Payment Information</p>
                      <p className="text-slate-300 text-sm mt-1">
                        Payments are processed monthly. Contact VAI Support for payment setup and invoicing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ExpandableSection>
        </div>

        {/* Left Column - Business Insights */}
        <div className="space-y-6">
          {/* Business Health Dashboard */}
          <ExpandableSection
            title="Business Health Dashboard"
            icon={TrendingUp}
            iconColor="text-green-400"
            isExpanded={expandedSections.businessHealth}
            onToggle={() => toggleSection('businessHealth')}
            badge={businessHealthScore >= 80 ? 'Excellent' : businessHealthScore >= 60 ? 'Good' : 'Needs Attention'}
          >
            <div className="p-6 space-y-6">
              {/* Health Score Card */}
              <div className="bg-gradient-to-br from-green-500/10 to-blue-600/10 rounded-lg p-4 border border-green-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">Overall Health Score</h3>
                  <span className={`text-2xl font-bold ${
                    businessHealthScore >= 80 ? 'text-green-400' : 
                    businessHealthScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {businessHealthScore}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      businessHealthScore >= 80 ? 'bg-green-500' : 
                      businessHealthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${businessHealthScore}%` }}
                  />
                </div>
                <p className="text-slate-300 text-sm">
                  {businessHealthScore >= 80 ? 'Your business is thriving! Keep up the excellent work.' :
                   businessHealthScore >= 60 ? 'Good performance. Small improvements can boost your score.' :
                   'Focus on response time and profile completion to improve your ranking.'}
                </p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300 text-sm">Response Time</span>
                  </div>
                  <p className="text-white font-bold text-lg">{performance?.responseTime || 0}h</p>
                  <p className="text-slate-400 text-xs">Average</p>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300 text-sm">Success Rate</span>
                  </div>
                  <p className="text-white font-bold text-lg">{performance?.completionRate || 0}%</p>
                  <p className="text-slate-400 text-xs">Confirmed bookings</p>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-300 text-sm">Monthly Bookings</span>
                  </div>
                  <p className="text-white font-bold text-lg">{performance?.monthlyBookings || 0}</p>
                  <p className="text-slate-400 text-xs">This month</p>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-slate-300 text-sm">Customer Rating</span>
                  </div>
                  <p className="text-white font-bold text-lg">{operator.average_rating?.toFixed(1) || 'N/A'}</p>
                  <p className="text-slate-400 text-xs">Average score</p>
                </div>
              </div>
            </div>
          </ExpandableSection>

          {/* Marketing & Visibility */}
          <ExpandableSection
            title="Marketing & Visibility"
            icon={Search}
            iconColor="text-purple-400"
            isExpanded={expandedSections.marketingInsights}
            onToggle={() => toggleSection('marketingInsights')}
          >
            <div className="p-6 space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-4 relative">
                <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full">
                    Coming Soon
                    </span>
                </div>
                <h4 className="text-white font-medium mb-3">How Tourists Find You</h4>
                <div className="space-y-2 opacity-50">
                    <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">VAI Platform Search</span>
                    <span className="text-slate-400 font-medium">--</span>
                    </div>
                    <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Direct Referrals</span>
                    <span className="text-slate-400 font-medium">--</span>
                    </div>
                    <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Repeat Customers</span>
                    <span className="text-slate-400 font-medium">--</span>
                    </div>
                </div>
                </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-blue-400 font-medium">Visibility Tip</p>
                    <p className="text-slate-300 text-sm mt-1">
                      Add more photos and respond faster to boost your search ranking by up to 30%.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ExpandableSection>

          {/* Growth Opportunities */}
          <ExpandableSection
            title="Growth Opportunities"
            icon={Target}
            iconColor="text-orange-400"
            isExpanded={expandedSections.growthOpportunities}
            onToggle={() => toggleSection('growthOpportunities')}
            badge="Coming Soon"
            >
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h4 className="text-green-400 font-medium text-sm mb-2">🚀 Quick Win</h4>
                  <p className="text-slate-300 text-sm mb-2">Enable whale tour certification</p>
                  <p className="text-slate-400 text-xs">+25% visibility in whale watching searches</p>
                </div>
                
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <h4 className="text-purple-400 font-medium text-sm mb-2">💎 Premium Feature</h4>
                  <p className="text-slate-300 text-sm mb-2">Upgrade to premium photos</p>
                  <p className="text-slate-400 text-xs">Professional photos increase bookings by 40%</p>
                </div>
                
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="text-blue-400 font-medium text-sm mb-2">📈 Expansion</h4>
                  <p className="text-slate-300 text-sm mb-2">Add sunset tours to your offerings</p>
                  <p className="text-slate-400 text-xs">High demand on {operator.island || 'your island'}</p>
                </div>
              </div>
            </div>
          </ExpandableSection>
        </div>
      </div>


      

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-slate-700">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-slate-400 text-sm">
            <p>VAI Tickets - Operator Dashboard</p>
            <p>© 2025 All rights reserved</p>
          </div>
          
          <div className="flex gap-4">
            <a
              href="https://vai.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg transition-colors"
            >
              <Globe className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400">Need a website or app?</span>
            </a>
            
            <a
              href="mailto:hello@vai.studio"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400">hello@vai.studio</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileTab