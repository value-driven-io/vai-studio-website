import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Building2, MapPin, Phone, Mail, ChevronDown, ChevronUp,
  Award, CheckCircle, Info, Plus, Shield, Star, HelpCircle, 
  TrendingUp, Target, Edit3, Save, X, Globe, Loader, MessageCircle,
  Zap, CreditCard, RefreshCw, Search, Users, DollarSign, 
  Lightbulb, Clock, Key, AlertTriangle, Building
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import ChangePasswordModal from './auth/ChangePasswordModal'
import StripeConnectCard from './StripeConnectCard'

//  ExpandableSection OUTSIDE of ProfileTab component
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

//  Tooltip OUTSIDE of ProfileTab component as well
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
  const { t } = useTranslation()
  const { operator } = useAuth()
  const [expandedSections, setExpandedSections] = useState({
    business: false,
    credentials: false,
    security: false,
    billing: false,
    businessHealth: true,
    marketingInsights: true,
    growthOpportunities: true
  })
  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false)
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

    // Track Performance Timer Start
    const startTime = Date.now()


    try {
        setLoading(true)

        // Use direct queries instead of booking_summary table
        const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('booking_status, subtotal, commission_amount, total_amount') // Only essential fields
        .eq('operator_id', operator.id)

        if (bookingsError) console.warn('No bookings found:', bookingsError)

        // Calculate stats from real data
        const totalBookings = bookingsData?.length || 0
        const confirmedBookings = bookingsData?.filter(b => b.booking_status === 'confirmed').length || 0
        const completedBookings = bookingsData?.filter(b => ['confirmed', 'completed'].includes(b.booking_status)).length || 0
        
        // subtotal IS the operator revenue, don't subtract commission again
        const operatorRevenue = bookingsData
        ?.filter(b => ['confirmed', 'completed'].includes(b.booking_status))
        ?.reduce((sum, b) => sum + (b.subtotal || 0), 0) || 0

        const totalCommission = bookingsData
        ?.filter(b => ['confirmed', 'completed'].includes(b.booking_status))
        ?.reduce((sum, b) => sum + (b.commission_amount || 0), 0) || 0

        // Total amount is what customers actually paid
        const totalCustomerPayments = bookingsData
        ?.filter(b => ['confirmed', 'completed'].includes(b.booking_status))
        ?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0
        
        const calculatedStats = {
        total_bookings: totalBookings,
        confirmed_bookings: confirmedBookings,
        completed_bookings: completedBookings,
        operator_revenue: operatorRevenue,  // ✅ What operator earned
        total_commission: totalCommission,   // ✅ What VAI earned
        total_customer_payments: totalCustomerPayments,  // ✅ What customers paid
        avg_response_time_hours: 2
        }

        setStats(calculatedStats)

        const responseTime = calculatedStats.avg_response_time_hours
        const completionRate = totalBookings > 0 ? 
        Math.round((confirmedBookings / totalBookings) * 100) : 0
        const monthlyBookings = totalBookings
        const monthlyRevenue = operatorRevenue

        setPerformance({
        responseTime,
        completionRate,
        monthlyBookings,
        monthlyRevenue,
        businessHealthScore
        })

        // Console Log ProfileTab Performance
          console.log(`📊 Profile data loaded in ${Date.now() - startTime}ms`)

    } catch (error) {
        console.error('Error loading dashboard data:', error)
        // Console Log ProfileTab Performance Error
        console.log(`❌ Profile data failed after ${Date.now() - startTime}ms`)
        // Set empty stats if error
        setStats({
        total_bookings: 0,
        confirmed_bookings: 0,
        total_revenue: 0,
        total_commission: 0,
        operator_revenue: 0,
        avg_response_time_hours: 0
        })
    } finally {
        setLoading(false)
    }
    }, [operator?.id, businessHealthScore])



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


  // Handle password change success
  const handlePasswordChangeSuccess = () => {
    setShowPasswordModal(false)
  }

  // Optimized save without causing re-renders
  const handleSave = async () => {
    try {
      setSaving(true)
      setSaveMessage('')

      // Client-side validation only
      const errors = []
      if (!editData.company_name?.trim()) errors.push(t('profile.validation.companyNameRequired'))
      if (!editData.whatsapp_number?.trim()) errors.push(t('profile.validation.whatsappRequired')) 
      if (!editData.island?.trim()) errors.push(t('profile.validation.islandRequired'))

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
          throw new Error(t('profile.messages.profileNotFound'))
        } else if (error.code === '23505') {
          throw new Error(t('profile.messages.conflictingInfo'))
        } else if (error.message.includes('permission')) {
          throw new Error(t('profile.messages.noPermission'))
        } else {
          throw new Error(t('profile.messages.updateError'))
        }
      }

      if (!updateResult || updateResult.length === 0) {
        throw new Error(t('profile.messages.securityPolicyError'))
      }

      // Update localStorage without calling login() to prevent re-render
      //if (updateResult[0]) {
      //  localStorage.setItem('vai_operator', JSON.stringify(updateResult[0]))
      //  await new Promise(resolve => setTimeout(resolve, 100))
      //}

      // let auth system handle state updates naturally:
      // The auth system will pick up the database changes automatically
      // No manual localStorage manipulation needed

      setIsEditing(false)
      setSaveMessage(t('profile.messages.profileUpdated'))
      setTimeout(() => setSaveMessage(''), 3000)
      
    } catch (error) {
      console.error('Error updating profile:', error)
      setSaveMessage(t('profile.messages.updateFailed', { error: error.message }))
      
      if (error.message.includes('support')) {
        setSaveMessage(prev => prev + ' ' + t('profile.messages.contactSupport'))
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
    if (!operator.company_name?.trim()) missing.push(t('profile.businessInfo.companyName'))
    if (!operator.whatsapp_number?.trim()) missing.push(t('profile.businessInfo.whatsappNumber')) 
    if (!operator.island?.trim()) missing.push(t('profile.businessInfo.operatingIsland'))
    return missing
  }, [operator, t])

  const getAchievementBadges = () => {
    const badges = []
    
    if (operator.whale_tour_certified) {
      badges.push({
        icon: Award,
        text: t('profile.achievements.whaleTourCertified'),
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20'
      })
    }
    
    if (operator.average_rating >= 4.8) {
      badges.push({
        icon: Star,
        text: t('profile.achievements.premiumOperator'),
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20'
      })
    }
    
    if (operator.total_bookings >= 100) {
      badges.push({
        icon: CheckCircle,
        text: t('profile.achievements.experiencedHost'),
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
          <h3 className="text-lg font-bold text-white">{t('profile.quickActionsModal.title')}</h3>
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
              <p className="text-white font-medium">{t('profile.quickActionsModal.whatsappSupport')}</p>
              <p className="text-slate-400 text-sm">{t('profile.quickActionsModal.whatsappDescription')}</p>
            </div>
          </a>
          
          <a
            href="mailto:hello@vai.studio"
            className="flex items-center gap-3 p-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-colors"
          >
            <Mail className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-white font-medium">{t('profile.quickActionsModal.emailSupport')}</p>
              <p className="text-slate-400 text-sm">{t('profile.quickActionsModal.emailDescription')}</p>
            </div>
          </a>
          
          <button
            onClick={() => {
              setShowQuickActions(false)
              if (setActiveTab) {
                setActiveTab('templates')
              }
            }}
            className="w-full flex items-center gap-3 p-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-white font-medium">{t('profile.quickActionsModal.createNewTour')}</p>
              <p className="text-slate-400 text-sm">{t('profile.quickActionsModal.createTourDescription')}</p>
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
                {operator.company_name || t('profile.header.unnamedCompany')}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-slate-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{operator.island || t('profile.header.locationNotSet')}</span>
                </div>
                {operator.average_rating && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{operator.average_rating.toFixed(1)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>{t('profile.header.vaiVerified')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Completeness */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 font-medium">{t('profile.header.profileCompleteness')}</span>
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
                  ? t('profile.header.missingRequiredFields', { fields: getMissingRequiredFields.join(', ') })
                  : t('profile.header.addOptionalDetails')
                }
              </p>
            )}
          </div>

          {/* Achievement Badges */}
          {getAchievementBadges().length > 0 && (
            <div className="flex flex-wrap gap-2">
              {getAchievementBadges().map((badge, index) => (
                <Tooltip key={index} content={t('profile.achievements.earnedBadge', { badgeName: badge.text })}>
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
              {t('profile.actions.quickActions')}
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-800 text-white rounded-lg transition-colors"
              title={t('profile.actions.refreshData')}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{t('profile.actions.refresh')}</span>
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
            title={t('profile.sections.businessInformation')}
            icon={Building2}
            iconColor="text-blue-400"
            isExpanded={isEditing || expandedSections.business}
            onToggle={() => !isEditing && toggleSection('business')}
            badge={getMissingRequiredFields.length > 0 ? t('profile.badges.requiredFieldsMissing') : (profileCompleteness < 80 ? t('profile.badges.incomplete') : null)}
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
                    {saving ? t('profile.actions.saving') : t('profile.actions.save')}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    {t('profile.actions.cancel')}
                  </button>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company Name - REQUIRED */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('profile.businessInfo.companyName')} *
                    {isEditing && (
                      <Tooltip content={t('profile.businessInfo.companyNameTooltip')}>
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
                      placeholder={t('profile.businessInfo.companyNamePlaceholder')}
                      autoComplete="organization"
                    />
                  ) : (
                    <p className={`px-3 py-2 rounded-lg ${
                      operator.company_name ? 'text-white bg-slate-700/50' : 'text-red-400 bg-red-500/10 border border-red-500/30'
                    }`}>
                      {operator.company_name || t('profile.businessInfo.companyNameRequired')}
                    </p>
                  )}
                </div>

                {/* Contact Person - Optional */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('profile.businessInfo.contactPerson')}
                    {isEditing && (
                      <Tooltip content={t('profile.businessInfo.contactPersonTooltip')}>
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
                      placeholder={t('profile.businessInfo.contactPersonPlaceholder')}
                      autoComplete="name"
                    />
                  ) : (
                    <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg">{operator.contact_person || t('profile.businessInfo.notSpecified')}</p>
                  )}
                </div>

                {/* Email - Required but not editable */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('profile.businessInfo.emailAddress')} *
                    {isEditing && (
                      <Tooltip content={t('profile.businessInfo.emailTooltip')}>
                        <Info className="w-3 h-3 text-slate-400 inline ml-1" />
                      </Tooltip>
                    )}
                  </label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg flex-1">{operator.email}</p>
                    {isEditing && (
                      <Tooltip content={t('profile.businessInfo.emailChangeTooltip')}>
                        <HelpCircle className="w-4 h-4 text-yellow-400" />
                      </Tooltip>
                    )}
                  </div>
                </div>

                {/* Phone - Optional */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('profile.businessInfo.phoneNumber')}
                    {isEditing && (
                      <Tooltip content={t('profile.businessInfo.phoneTooltip')}>
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
                      placeholder={t('profile.businessInfo.phonePlaceholder')}
                      autoComplete="tel"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg flex-1">{operator.phone || t('profile.businessInfo.notSpecified')}</p>
                    </div>
                  )}
                </div>

                {/* WhatsApp - REQUIRED */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('profile.businessInfo.whatsappNumber')} *
                    {isEditing && (
                      <Tooltip content={t('profile.businessInfo.whatsappTooltip')}>
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
                      placeholder={t('profile.businessInfo.whatsappPlaceholder')}
                      autoComplete="tel"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-400" />
                      <p className={`px-3 py-2 rounded-lg flex-1 ${
                        operator.whatsapp_number ? 'text-white bg-slate-700/50' : 'text-red-400 bg-red-500/10 border border-red-500/30'
                      }`}>
                        {operator.whatsapp_number || t('profile.businessInfo.companyNameRequired')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Island - REQUIRED */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('profile.businessInfo.operatingIsland')} *
                    {isEditing && (
                      <Tooltip content={t('profile.businessInfo.islandTooltip')}>
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
                      <option value="">{t('profile.businessInfo.selectIsland')}</option>
                      <option value="Tahiti">{t('profile.islands.tahiti')}</option>
                      <option value="Moorea">{t('profile.islands.moorea')}</option>
                      <option value="Bora Bora">{t('profile.islands.boraBora')}</option>
                      <option value="Huahine">{t('profile.islands.huahine')}</option>
                      <option value="Raiatea">{t('profile.islands.raiatea')}</option>
                      <option value="Taha'a">{t('profile.islands.tahaa')}</option>
                      <option value="Maupiti">{t('profile.islands.maupiti')}</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <p className={`px-3 py-2 rounded-lg flex-1 ${
                        operator.island ? 'text-white bg-slate-700/50' : 'text-red-400 bg-red-500/10 border border-red-500/30'
                      }`}>
                        {operator.island || t('profile.businessInfo.companyNameRequired')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Address - Optional */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('profile.businessInfo.businessAddress')}
                    {isEditing && (
                      <Tooltip content={t('profile.businessInfo.addressTooltip')}>
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
                      placeholder={t('profile.businessInfo.addressPlaceholder')}
                      autoComplete="street-address"
                    />
                  ) : (
                    <p className="text-white bg-slate-700/50 px-3 py-2 rounded-lg">{operator.address || t('profile.businessInfo.notSpecified')}</p>
                  )}
                </div>
              </div>
            </div>
          </ExpandableSection>

          {/* 1.2 Security & Authentication */}
          <ExpandableSection
            title={t('passwordSecurity.profile.sectionTitle')}
            icon={Shield}
            iconColor="text-green-400"
            isExpanded={expandedSections.security}
            onToggle={() => toggleSection('security')}
            badge={operator.auth_setup_completed ? null : t('passwordSecurity.profile.setupRequiredBadge')}
            urgent={!operator.auth_setup_completed}
          >
            <div className="space-y-4 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Password Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('passwordSecurity.profile.passwordStatus')}
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-lg">
                    {operator.auth_setup_completed ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">{t('passwordSecurity.profile.passwordSecure')}</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 text-sm">{t('passwordSecurity.profile.passwordNotSecure')}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Account Security */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('passwordSecurity.profile.accountSecurity')}
                  </label>
                  <div className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="text-slate-300 text-sm">
                      {operator.auth_setup_completed ? (
                        t('passwordSecurity.profile.passwordLastUpdated')
                      ) : (
                        t('passwordSecurity.profile.passwordSetupRequired')
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Actions */}
              <div className="pt-4 border-t border-slate-600">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Key className="w-4 h-4" />
                    {operator.auth_setup_completed ? t('passwordSecurity.profile.changePassword') : t('passwordSecurity.profile.setupNewPassword')}
                  </button>
                  
                  {operator.auth_setup_completed && (
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Info className="w-4 h-4" />
                      <span>{t('passwordSecurity.profile.regularUpdatesInfo')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Tips */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-blue-400 font-medium mb-1">{t('passwordSecurity.profile.securityBestPractices')}</h4>
                    <ul className="text-slate-300 text-sm space-y-1">
                      {t('passwordSecurity.profile.securityTips', { returnObjects: true }).map((tip, index) => (
                        <li key={index}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </ExpandableSection>

          {/* 2. Business Credentials */}
          <ExpandableSection
            title={t('profile.sections.businessCredentials')}
            icon={Building}
            iconColor="text-orange-400"
            isExpanded={expandedSections.credentials}
            onToggle={() => toggleSection('credentials')}
          >
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{t('profile.credentials.businessLicense')}</p>
                    <p className="text-sm text-slate-400">{operator.business_license || t('profile.credentials.businessLicenseStatus')}</p>
                  </div>
                  <CheckCircle className={`w-5 h-5 ${operator.business_license ? 'text-green-400' : 'text-slate-500'}`} />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{t('profile.credentials.insuranceCertificate')}</p>
                    <p className="text-sm text-slate-400">{operator.insurance_certificate || t('profile.credentials.insuranceStatus')}</p>
                  </div>
                  <CheckCircle className={`w-5 h-5 ${operator.insurance_certificate ? 'text-green-400' : 'text-slate-500'}`} />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{t('profile.credentials.whaleTourCertified')}</p>
                    <p className="text-sm text-slate-400">{t('profile.credentials.whaleTourDescription')}</p>
                  </div>
                  <CheckCircle className={`w-5 h-5 ${operator.whale_tour_certified ? 'text-green-400' : 'text-slate-500'}`} />
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-blue-400 font-medium">{t('profile.credentials.missingCredentials')}</p>
                    <p className="text-slate-300 text-sm mt-1">
                      {t('profile.credentials.missingCredentialsText')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ExpandableSection>

          {/* 2.5. Stripe Connect Payment Setup */}
          <StripeConnectCard 
            operator={operator} 
            onStatusUpdate={() => {
              // Refresh operator data after Connect status changes
              loadDashboardData()
            }}
          />

          {/* 3. Enhanced Billing & Commission */}
          <ExpandableSection
            title={t('profile.sections.billingRevenue')}
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
                        <span className="text-slate-400">{t('profile.billing.commissionRate')}</span>
                        <span className="text-white font-semibold">{operator.commission_rate}%</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400">{t('profile.billing.commissionOwed')}</span>
                        <span className="text-orange-400 font-semibold">{formatCurrency(stats?.total_commission || 0)}</span>
                    </div>
                    <div className="w-full bg-slate-600 h-px my-3"></div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-400">{t('profile.billing.yourRevenue')}</span>
                        <span className="text-green-400 font-bold text-lg">
                        {formatCurrency(stats?.operator_revenue || 0)}
                        </span>
                    </div>
                </div>

                {/* Recent Tour Performance */}
                <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg p-4 border border-green-500/20">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    {t('profile.billing.recentTourPerformance')}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                        <p className="text-slate-400 text-sm">{t('profile.billing.vaiBookings')}</p>
                        <p className="text-white font-bold">{stats?.completed_bookings || 0}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">{t('profile.billing.yourRevenue')}</p>
                        <p className="text-green-400 font-bold">{formatCurrency(stats?.operator_revenue || 0)}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">{t('profile.billing.avgPerBooking')}</p>
                        <p className="text-white font-bold">
                        {stats?.completed_bookings > 0 ? 
                            formatCurrency((stats?.operator_revenue || 0) / stats.completed_bookings) : 
                            formatCurrency(0)
                        }
                        </p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">{t('profile.billing.commissionPaid')}</p>
                        <p className="text-slate-400 font-bold">{formatCurrency(stats?.total_commission || 0)}</p>
                    </div>
                    </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-blue-400 font-medium">{t('profile.billing.paymentInformation')}</p>
                      <p className="text-slate-300 text-sm mt-1">
                        {t('profile.billing.paymentInfoText')}
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
            title={t('profile.sections.businessHealthDashboard')}
            icon={TrendingUp}
            iconColor="text-green-400"
            isExpanded={expandedSections.businessHealth}
            onToggle={() => toggleSection('businessHealth')}
            badge={businessHealthScore >= 80 ? t('profile.badges.excellent') : businessHealthScore >= 60 ? t('profile.badges.good') : t('profile.badges.needsAttention')}
          >
            <div className="p-6 space-y-6">
              {/* Health Score Card */}
              <div className="bg-gradient-to-br from-green-500/10 to-blue-600/10 rounded-lg p-4 border border-green-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-medium">{t('profile.health.overallHealthScore')}</h3>
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
                  {businessHealthScore >= 80 ? t('profile.health.healthDescriptions.excellent') :
                   businessHealthScore >= 60 ? t('profile.health.healthDescriptions.good') :
                   t('profile.health.healthDescriptions.needsImprovement')}
                </p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300 text-sm">{t('profile.health.responseTime')}</span>
                  </div>
                  <p className="text-white font-bold text-lg">{performance?.responseTime || 0}h</p>
                  <p className="text-slate-400 text-xs">{t('profile.health.average')}</p>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300 text-sm">{t('profile.health.successRate')}</span>
                  </div>
                  <p className="text-white font-bold text-lg">{performance?.completionRate || 0}%</p>
                  <p className="text-slate-400 text-xs">{t('profile.health.confirmedBookings')}</p>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-300 text-sm">{t('profile.health.monthlyBookings')}</span>
                  </div>
                  <p className="text-white font-bold text-lg">{performance?.monthlyBookings || 0}</p>
                  <p className="text-slate-400 text-xs">{t('profile.health.thisMonth')}</p>
                </div>

                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-slate-300 text-sm">{t('profile.health.customerRating')}</span>
                  </div>
                  <p className="text-white font-bold text-lg">{operator.average_rating?.toFixed(1) || 'N/A'}</p>
                  <p className="text-slate-400 text-xs">{t('profile.health.averageScore')}</p>
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
            <p>{t('profile.footer.vaiTickets')}</p>
            <p>{t('profile.footer.copyright')}</p>
          </div>
          
          <div className="flex gap-4">
            <a
              href="https://vai.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg transition-colors"
            >
              <Globe className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400">{t('profile.footer.needWebsite')}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <ChangePasswordModal
          context="voluntary"
          operator={operator}
          onSuccess={handlePasswordChangeSuccess}
          onCancel={() => setShowPasswordModal(false)}
          canDismiss={true}
        />
      )}
    </div>
  )
}

export default ProfileTab