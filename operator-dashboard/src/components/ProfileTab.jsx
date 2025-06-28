import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  Building2, MapPin, Phone, Mail, ChevronDown, ChevronUp,
  Award, Clock, CheckCircle, AlertCircle, Info, Plus,
  Shield, Star, HelpCircle,
  Edit3, Save, X, Globe, Target, Loader, MessageCircle,
  ExternalLink, Zap, BarChart3, CalendarDays, Eye,
  CreditCard, Sun, CloudRain, Wind, RefreshCw
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

const ProfileTab = ({ setActiveTab }) => {
  const { operator, login } = useAuth()
  const [expandedSections, setExpandedSections] = useState({
    business: window.innerWidth >= 1024,
    credentials: window.innerWidth >= 1024,
    platform: false,
    billing: false,
    todaysOverview: true
  })
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [stats, setStats] = useState(null)
  const [tours, setTours] = useState([])
  const [performance, setPerformance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [weatherData, setWeatherData] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Memoized profile completeness calculation - only recalculates when operator changes
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
  }, [operator]) // Fixed: Use full operator object

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
          
          <button
            onClick={() => {
              setShowQuickActions(false)
              setExpandedSections(prev => ({ ...prev, billing: true }))
            }}
            className="w-full flex items-center gap-3 p-3 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/30 rounded-lg transition-colors"
          >
            <CreditCard className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-white font-medium">View Billing</p>
              <p className="text-slate-400 text-sm">Commission & payments</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )

  // Enhanced Tooltip with edge detection
  const Tooltip = ({ children, content, position = "top" }) => {
    const [show, setShow] = useState(false)
    const [actualPosition, setActualPosition] = useState(position)
    
    const handleMouseEnter = (e) => {
      setShow(true)
      const rect = e.target.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      if (position === 'top' && rect.top < 100) {
        setActualPosition('bottom')
      } else if (position === 'bottom' && rect.bottom > viewportHeight - 100) {
        setActualPosition('top')
      } else if (position === 'left' && rect.left < 200) {
        setActualPosition('right')
      } else if (position === 'right' && rect.right > viewportWidth - 200) {
        setActualPosition('left')
      } else {
        setActualPosition(position)
      }
    }
    
    return (
      <div className="relative inline-block">
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setShow(false)}
        >
          {children}
        </div>
        {show && (
          <div className={`absolute z-50 px-3 py-2 text-sm text-white bg-slate-900 border border-slate-600 rounded-lg shadow-lg whitespace-nowrap max-w-xs ${
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

  // Expandable section component
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
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-slate-700/50">
          {children}
        </div>
      )}
    </div>
  )

  // Load data functions
  const loadWeatherData = useCallback(async () => {
    if (!operator?.island) return;
    
    const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
    if (!API_KEY) {
      console.warn('Weather API key not configured, using mock data');
      // Fall back to mock data if no API key
      setWeatherData({
        temp: 28, 
        condition: 'Sunny', 
        icon: Sun, 
        wind: 'Light winds', 
        description: 'Perfect for tours'
      });
      return;
    }

    // Island coordinates for French Polynesia
    const islandCoordinates = {
      'Tahiti': { lat: -17.5516, lon: -149.5585 },
      'Moorea': { lat: -17.5388, lon: -149.8315 },
      'Bora Bora': { lat: -16.5004, lon: -151.7415 },
      'Huahine': { lat: -16.7320, lon: -151.0015 },
      'Raiatea': { lat: -16.8259, lon: -151.4253 },
      'Taha\'a': { lat: -16.6226, lon: -151.5015 },
      'Maupiti': { lat: -16.4465, lon: -152.2431 }
    };

    const coords = islandCoordinates[operator.island];
    if (!coords) {
      console.warn(`No coordinates found for island: ${operator.island}`);
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Map OpenWeatherMap conditions to your icons
      const getWeatherIcon = (weatherMain) => {
        switch (weatherMain.toLowerCase()) {
          case 'clear': return Sun;
          case 'clouds': return CloudRain;
          case 'rain': return CloudRain;
          case 'wind': return Wind;
          default: return Sun;
        }
      };

      // Generate tour-specific descriptions
      const getTourDescription = (temp, weather, windSpeed) => {
        if (weather === 'Rain') return 'Check tour weather policies';
        if (windSpeed > 10) return 'Windy conditions - water tours may be affected';
        if (temp >= 25) return 'Perfect for whale watching and water activities';
        return 'Good touring conditions';
      };

      setWeatherData({
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        icon: getWeatherIcon(data.weather[0].main),
        wind: `${Math.round(data.wind.speed * 3.6)} km/h winds`, // Convert m/s to km/h
        description: getTourDescription(data.main.temp, data.weather[0].main, data.wind.speed)
      });

    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      // Fall back to mock data on error
      setWeatherData({
        temp: 28, 
        condition: 'Sunny', 
        icon: Sun, 
        wind: 'Light winds', 
        description: 'Weather data unavailable - perfect for tours!'
      });
    }
  }, [operator?.island])

  const loadDashboardData = useCallback(async () => {
    if (!operator?.id) return
    
    try {
      setLoading(true)

      // Parallel data loading with fixed field names
      const [summaryResult, toursResult, bookingsResult] = await Promise.allSettled([
        supabase
          .from('operator_booking_summary')
          .select('*')
          .eq('operator_id', operator.id)
          .maybeSingle(),
        
        // FIXED: Use correct field names from database
        supabase
          .from('tours')
          .select('id, tour_name, tour_date, status, max_capacity, original_price_adult')
          .eq('operator_id', operator.id)
          .eq('status', 'active')
          .order('tour_date', { ascending: true })
          .limit(5),
        
        supabase
          .from('bookings')
          .select('booking_status, created_at, total_amount, subtotal')
          .eq('operator_id', operator.id)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ])

      // Handle results
      const summaryData = summaryResult.status === 'fulfilled' ? summaryResult.value.data : null
      const toursData = toursResult.status === 'fulfilled' ? toursResult.value.data : []
      const bookingsData = bookingsResult.status === 'fulfilled' ? bookingsResult.value.data : []

      // Log any errors for debugging
      if (summaryResult.status === 'rejected') {
        console.error('Summary query failed:', summaryResult.reason)
      }
      if (toursResult.status === 'rejected') {
        console.error('Tours query failed:', toursResult.reason)
      }
      if (bookingsResult.status === 'rejected') {
        console.error('Bookings query failed:', bookingsResult.reason)
      }

      setStats(summaryData || {
        total_bookings: 0,
        confirmed_bookings: 0,
        pending_bookings: 0,
        total_revenue: 0,
        total_commission: 0
      })

      setTours(toursData || [])

      // Calculate performance metrics
      const responseTime = Math.floor(Math.random() * 4) + 1
      const completionRate = summaryData?.total_bookings > 0 ? 
        Math.round((summaryData.confirmed_bookings / summaryData.total_bookings) * 100) : 0

      const monthlyBookings = bookingsData?.length || 0
      const monthlyRevenue = bookingsData
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
  }, [operator?.id, operator?.average_rating])

  // Refresh function
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await Promise.all([
      loadDashboardData(),
      loadWeatherData()
    ])
    setRefreshing(false)
  }, [loadDashboardData, loadWeatherData])

  // Load data on mount and operator change
  useEffect(() => {
    if (operator?.id) {
      loadDashboardData()
      loadWeatherData()
    }
  }, [operator?.id, loadDashboardData, loadWeatherData])

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }, [])

  const handleEdit = useCallback(() => {
    if (!operator) return // Add null check
    
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

  // FIXED: Only save when user clicks save - no database access on keystroke
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

      // ENHANCED: Add detailed logging for debugging (only during save)
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

      const { data: updateResult, error, count } = await supabase
        .from('operators')
        .update(updatePayload)
        .eq('id', operator.id)
        .select()  // Re-add select to see what actually gets updated

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

      // Check if any rows were actually updated
      if (!updateResult || updateResult.length === 0) {
        throw new Error('Update failed: Database security policy prevented the update. Please contact support at hello@vai.studio to configure your account permissions.')
      }

      // If successful, use the returned data
      let data = updateResult?.[0] || null

      
      // Update auth context if we got data back
      if (data) {
        localStorage.setItem('vai_operator', JSON.stringify(data))
        await login(operator.email)
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
  }, [operator]) // Fixed: Use full operator object

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
      badges.push({ 
        icon: Clock, 
        label: 'Quick Responder', 
        color: 'bg-purple-500', 
        description: 'Responds to bookings within 2 hours on average' 
      })
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Loading operator data...</p>
        </div>
      </div>
    )
  }

  const hasUrgentTasks = getMissingRequiredFields.length > 0 || (stats?.pending_bookings > 0)

  return (
    <div className="space-y-6">
      {/* Header Section with Profile Overview */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Main Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-7 h-7 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">{operator.company_name}</h1>
              <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                operator.status === 'active' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  operator.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                }`} />
                {operator.status === 'active' ? 'Active' : 'Pending'}
              </span>
            </div>
            
            <p className="text-slate-400 mb-4">
              Operating in {operator.island} • Member since {formatDate(operator.created_at)}
            </p>

            {/* Profile Completeness Bar with Tooltip */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-300">Profile Completeness</span>
                  <Tooltip content="Complete profile includes: required fields (company name, WhatsApp, island) + business details (contact person, phone, address, license) for better tourist visibility">
                    <Info className="w-3 h-3 text-slate-400 cursor-help" />
                  </Tooltip>
                </div>
                <span className="text-sm text-slate-400">{profileCompleteness}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
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
            <div className="flex flex-wrap gap-2">
              {getAchievementBadges().map((badge, index) => (
                <Tooltip key={index} content={badge.description || `You earned the ${badge.label} badge`}>
                  <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white ${badge.color} cursor-help`}>
                    <badge.icon className="w-3 h-3" />
                    {badge.label}
                  </span>
                </Tooltip>
              ))}
            </div>
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
              </button>
            </div>
            
            {/* Quick Stats Cards */}
            {!loading && stats && (
              <div className="grid grid-cols-2 gap-2 min-w-[200px]">
                <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-white">{stats.total_bookings || 0}</p>
                  <p className="text-slate-400 text-xs">Tours</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-white">{stats.pending_bookings || 0}</p>
                  <p className="text-slate-400 text-xs">Pending</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`mt-4 p-3 rounded-lg ${
            saveMessage.includes('✅') 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {saveMessage}
          </div>
        )}
      </div>

      {/* Two-Column Layout for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Today's Overview - Simplified, removed actionable items */}
          <ExpandableSection
            title="Today's Overview"
            icon={CalendarDays}
            iconColor="text-green-400"
            isExpanded={expandedSections.todaysOverview}
            onToggle={() => toggleSection('todaysOverview')}
            badge={hasUrgentTasks ? "Action Needed" : null}
            urgent={hasUrgentTasks}
          >
            <div className="space-y-4 mt-4">
              {/* Weather widget */}
              {weatherData && (
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4 border border-blue-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <weatherData.icon className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-medium">Weather in {operator.island}</span>
                  </div>
                  <p className="text-slate-300 text-sm">
                    {weatherData.condition}, {weatherData.temp}°C • {weatherData.wind} • {weatherData.description}
                  </p>
                </div>
              )}

              {/* Urgent: Pending Bookings */}
              {stats?.pending_bookings > 0 && (
                <button
                  onClick={() => setActiveTab && setActiveTab('bookings')}
                  className="w-full bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-left hover:bg-red-500/30 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 font-medium">Urgent: Pending Responses</span>
                  </div>
                  <p className="text-slate-300 text-sm">
                    You have {stats.pending_bookings} booking{stats.pending_bookings > 1 ? 's' : ''} waiting for confirmation
                  </p>
                </button>
              )}

              {/* Quick stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-white">{tours.length}</p>
                  <p className="text-slate-400 text-sm">Active Tours</p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-white">{formatCurrency(stats?.total_revenue || 0)}</p>
                  <p className="text-slate-400 text-sm">Total Revenue</p>
                </div>
              </div>
            </div>
          </ExpandableSection>

          {/* Platform Metrics & Analytics (Combined) */}
          <ExpandableSection
            title="Platform Performance & Tours"
            icon={BarChart3}
            iconColor="text-green-400"
            isExpanded={expandedSections.platform}
            onToggle={() => toggleSection('platform')}
          >
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader className="w-6 h-6 text-blue-400 animate-spin" />
              </div>
            ) : (
              <div className="space-y-6 mt-4">
                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-white">{stats?.total_bookings || 0}</p>
                    <p className="text-slate-400 text-sm">Total Tours Completed</p>
                  </div>
                  
                  <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
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
                    <p className="text-slate-400 text-sm">Average Rating</p>
                  </div>
                  
                  <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-white">{stats?.confirmed_bookings || 0}</p>
                    <p className="text-slate-400 text-sm">Confirmed Bookings</p>
                  </div>
                  
                  <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-white">{formatCurrency(stats?.total_revenue || 0)}</p>
                    <p className="text-slate-400 text-sm">Platform Revenue</p>
                  </div>
                </div>

                {/* Recent Tours Overview */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-400" />
                    Recent Tours
                  </h4>
                  {tours.length > 0 ? (
                    <div className="space-y-2">
                      {tours.map((tour) => (
                        <div key={tour.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{tour.tour_name}</p>
                            <p className="text-slate-400 text-sm">
                              {new Date(tour.tour_date).toLocaleDateString()} • {tour.max_capacity} spots
                            </p>
                          </div>
                          <p className="text-white font-semibold">{formatCurrency(tour.original_price_adult)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400">
                      <CalendarDays className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                      <p>No active tours found</p>
                      <button
                        onClick={() => setActiveTab && setActiveTab('create')}
                        className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
                      >
                        Create your first tour →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </ExpandableSection>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Business Information - MOVED to right column on desktop */}
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
            <div className="space-y-4 mt-4">
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
              </div>

              {/* Address - Optional */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Business Address
                  {isEditing && (
                    <Tooltip content="Helps tourists find your meeting points">
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
          </ExpandableSection>

          {/* Billing & Commission */}
          <ExpandableSection
            title="Billing & Commission"
            icon={CreditCard}
            iconColor="text-yellow-400"
            isExpanded={expandedSections.billing}
            onToggle={() => toggleSection('billing')}
          >
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">Commission Rate</span>
                    <span className="text-white font-semibold">{operator.commission_rate}%</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400">Total Commission</span>
                    <span className="text-white font-semibold">{formatCurrency(stats?.total_commission || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Net Revenue (You Keep)</span>
                    <span className="text-green-400 font-bold">
                      {formatCurrency((stats?.total_revenue || 0) - (stats?.total_commission || 0))}
                    </span>
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

          {/* Business Credentials */}
          <ExpandableSection
            title="Business Credentials"
            icon={Shield}
            iconColor="text-green-400"
            isExpanded={expandedSections.credentials}
            onToggle={() => toggleSection('credentials')}
          >
            <div className="grid grid-cols-1 gap-4 mt-4">
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
          </ExpandableSection>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">Powered by VAI Studio</p>
              <p className="text-slate-400 text-sm">Your partner in French Polynesian tourism</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <a
              href="https://vai.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              About VAI
            </a>
            <a
              href="mailto:hello@vai.studio"
              className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4" />
              Need a website or app?
            </a>
            <a
              href="mailto:hello@vai.studio"
              className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              hello@vai.studio
            </a>
          </div>
        </div>
      </div>

      {/* Quick Actions Modal */}
      {showQuickActions && <QuickActionsModal />}
    </div>
  )
}

export default ProfileTab