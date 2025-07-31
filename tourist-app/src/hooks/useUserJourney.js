// src/hooks/useUserJourney.js 
import { useState, useEffect, useCallback, useRef } from 'react'
import { journeyService } from '../services/supabase'
import { useAppStore } from '../stores/bookingStore'
import { useAuth } from '../contexts/AuthContext'  
import toast from 'react-hot-toast'

export const useUserJourney = () => {

  const { user } = useAuth()  

  const { 
    bookings: storeBookings, 
    favorites, 
    userProfile, 
    updateUserProfile,
    addBooking 
  } = useAppStore()
  
  const [userBookings, setUserBookings] = useState({
    active: [],
    upcoming: [],
    past: [],
    cancelled: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [subscription, setSubscription] = useState(null)

  // Use ref to prevent infinite loops
  const lastFetchRef = useRef({ email: '', whatsapp: '', timestamp: 0 })

  // Performance monitoring
  const performanceTracker = useRef({
    startTime: null,
    
    start(operation) {
      this.startTime = performance.now()
      console.log(`⏱️ Starting ${operation}`)
    },
    
    end(operation) {
      if (this.startTime) {
        const duration = performance.now() - this.startTime
        const status = duration < 100 ? '🚀 ULTRA-FAST' : duration < 200 ? '⚡ FAST' : duration < 500 ? '🟡 GOOD' : '🐌 SLOW'
        console.log(`${status} ${operation} completed in ${duration.toFixed(2)}ms`)
        this.startTime = null
        return duration
      }
    }
  })

  // Use ref to get latest store values without dependencies
  const storeRef = useRef()
  storeRef.current = { userProfile, storeBookings, updateUserProfile }

  // Remove dependencies that cause infinite loop + ADD AUTH INTEGRATION
  const getUserContactInfo = useCallback(() => {
    // 🔧 FIX: FIRST check authenticated user's email
    if (user?.email) {
      return {
        email: user.email,
        whatsapp: storeRef.current.userProfile?.whatsapp || null
      }
    }

    // Use ref to get current values without dependency chain
    const { userProfile, storeBookings } = storeRef.current
    
    // First try user profile from store (most recent)
    if (userProfile?.email || userProfile?.whatsapp) {
      return {
        email: userProfile.email,
        whatsapp: userProfile.whatsapp
      }
    }
    
    // Then try last booking
    const lastBooking = storeBookings[storeBookings.length - 1]
    if (lastBooking) {
      return {
        email: lastBooking.customer_email,
        whatsapp: lastBooking.customer_whatsapp
      }
    }
    
    // Finally try localStorage
    const savedEmail = localStorage.getItem('vai_user_email')
    const savedWhatsApp = localStorage.getItem('vai_user_whatsapp')
    
    return {
      email: savedEmail,
      whatsapp: savedWhatsApp
    }
  }, [user]) // 🔧 FIXED: Add user as dependency

  // 🔧 ONLY FIX: Remove updateUserProfile dependency
  const saveUserContactInfo = useCallback((email, whatsapp) => {
    if (email) localStorage.setItem('vai_user_email', email)
    if (whatsapp) localStorage.setItem('vai_user_whatsapp', whatsapp)
    
    // Use ref to avoid dependency
    const { updateUserProfile } = storeRef.current
    updateUserProfile({ email, whatsapp })
  }, []) // 🔧 FIXED: No dependencies

  // Categorize bookings by status and date - 
  const categorizeBookings = useCallback((bookings) => {
    const now = new Date()
    const categorized = {
      active: [],
      upcoming: [],
      past: [],
      cancelled: []
    }

    bookings.forEach(booking => {
      const tourDate = new Date(booking.tours?.tour_date)
      
      switch (booking.booking_status) {
        case 'pending':
          categorized.active.push(booking)
          break
        case 'confirmed':
          if (tourDate >= now) {
            categorized.upcoming.push(booking)
          } else {
            categorized.past.push(booking)
          }
          break
        case 'completed':
          categorized.past.push(booking)
          break
        case 'declined':
        case 'cancelled':
          categorized.cancelled.push(booking)
          break
        default:
          categorized.active.push(booking)
      }
    })

    // Sort each category
    categorized.active.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    categorized.upcoming.sort((a, b) => new Date(a.tours?.tour_date) - new Date(b.tours?.tour_date))
    categorized.past.sort((a, b) => new Date(b.tours?.tour_date) - new Date(a.tours?.tour_date))
    categorized.cancelled.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    return categorized
  }, [])

  // Fetch user bookings with deduplication 
  const fetchUserBookings = useCallback(async (email, whatsapp, silent = false) => {
    // Clean and validate inputs
    const cleanEmail = email?.trim()
    const cleanWhatsApp = whatsapp?.trim()
  
    if (!cleanEmail && !cleanWhatsApp) {
      console.log('No email or WhatsApp provided for booking lookup')
      return
    }

    // Prevent duplicate calls
    const now = Date.now()
    const lastFetch = lastFetchRef.current
    const isSameParams = lastFetch.email === cleanEmail && lastFetch.whatsapp === cleanWhatsApp
    const isRecentCall = (now - lastFetch.timestamp) < 1000 // 1 second debounce

    if (isSameParams && isRecentCall) {
      console.log('🚫 Skipping duplicate fetchUserBookings call')
      return
    }

    // Update last fetch tracking
    lastFetchRef.current = { email: cleanEmail, whatsapp: cleanWhatsApp, timestamp: now }

    if (!silent) setLoading(true)
    setError(null)

    try {
      performanceTracker.current.start('fetchUserBookings')
      console.log('🔄 fetchUserBookings called with:', { email: cleanEmail, whatsapp: cleanWhatsApp, silent })
      console.log('Fetching bookings for:', { email: cleanEmail, whatsapp: cleanWhatsApp })
      
      const bookings = await journeyService.getUserBookings(cleanEmail, cleanWhatsApp)
      console.log('Fetched bookings:', bookings)
      performanceTracker.current.end('fetchUserBookings')
      
      // Save contact info if bookings found
      if (bookings.length > 0) {
        saveUserContactInfo(cleanEmail, cleanWhatsApp)
      }
      
      // Categorize bookings
      const categorized = categorizeBookings(bookings)
      setUserBookings(categorized)
      
      // DISABLED: Setup real-time subscription
      console.log('Realtime subscriptions disabled - using manual refresh only')
      
      return bookings
    } catch (error) {
      performanceTracker.current.end('fetchUserBookings (with error)')
      console.error('Error fetching user bookings:', error)
      setError(error.message)
      toast.error('Failed to load your bookings')
      return []
    } finally {
      if (!silent) setLoading(false)
    }
  }, [categorizeBookings, saveUserContactInfo]) // Now stable functions

  // Setup real-time subscription for booking updates (DISABLED)
  const setupBookingSubscription = useCallback((email, whatsapp) => {
    // DISABLED: Realtime subscriptions disabled to prevent WebSocket errors
    console.log('Realtime subscriptions disabled - using manual refresh only')
    
    // Cleanup existing subscription
    if (subscription) {
      try {
        subscription.unsubscribe()
      } catch (error) {
        console.log('No subscription to cleanup')
      }
    }
    
    setSubscription(null)
    return null
  }, [subscription])

  // Remove fetchUserBookings dependency to prevent infinite loop
  useEffect(() => {
    console.log('🔄 Auto-fetch useEffect triggered')
    const contactInfo = getUserContactInfo()
    console.log('📞 Contact info:', contactInfo)
    
    if (contactInfo.email || contactInfo.whatsapp) {
      console.log('📞 Calling fetchUserBookings from useEffect')
      fetchUserBookings(contactInfo.email, contactInfo.whatsapp)
    }
  }, []) // 🔧 FIXED: Removed all dependencies

  // 🔧 ONLY FIX: Remove fetchUserBookings dependency from auto-discovery
  useEffect(() => {
    const checkForNewBookings = async () => {
      if (storeBookings.length === 0) return
      
      const latestBooking = storeBookings[storeBookings.length - 1]
      if (!latestBooking) return

      // Auto-fetch bookings if we have new booking data
      const email = latestBooking.customer_email
      const whatsapp = latestBooking.customer_whatsapp
      
      if (email || whatsapp) {
        console.log('Auto-discovering bookings after new booking:', latestBooking.booking_reference)
        await fetchUserBookings(email, whatsapp, true)
        
        // Show success message
        toast.success('Booking added to your journey! 🌴')
      }
    }

    checkForNewBookings()
  }, [storeBookings.length]) // 🔧 FIXED: Removed fetchUserBookings dependency

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (subscription) {
        try {
          subscription.unsubscribe()
        } catch (error) {
          console.log('No subscription to cleanup on unmount')
        }
      }
    }
  }, [subscription])

  // Refresh bookings manually
  const refreshBookings = useCallback(async () => {
    const contactInfo = getUserContactInfo()
    if (contactInfo.email || contactInfo.whatsapp) {
      // Reset debounce to allow immediate refresh
      lastFetchRef.current = { email: '', whatsapp: '', timestamp: 0 }
      await fetchUserBookings(contactInfo.email, contactInfo.whatsapp)
      toast.success('Bookings refreshed')
    } else {
      toast.error('No contact info found. Please use "Find My Bookings" first.')
    }
  }, [getUserContactInfo, fetchUserBookings])

  // Smart polling for booking updates (replaces real-time subscriptions)
    const setupSmartPolling = useCallback(() => {
    const contactInfo = getUserContactInfo()
    
    // Only poll if user has contact info (meaning they have bookings to check)
    if (!contactInfo.email && !contactInfo.whatsapp) {
      console.log('❌ No contact info - skipping smart polling')
      return null
    }

    console.log('🚀 Starting smart polling for booking updates')
    
    // Track last update timestamp to only fetch changes
    let lastUpdateTimestamp = new Date().toISOString()
    
    const pollInterval = setInterval(async () => {
      try {
        // Check if user is still on Journey tab before polling
        const { activeTab } = useAppStore.getState()
        
        if (activeTab !== 'journey') {
          console.log('📍 User left Journey tab - smart polling paused')
          return
        }
        
        // 🚀 STEP 1: Ultra-lightweight status check (4 columns only)
        performanceTracker.current.start('Smart Polling Status Check')
        const statusUpdates = await journeyService.getUserBookingStatusUpdates(
          contactInfo.email, 
          contactInfo.whatsapp, 
          lastUpdateTimestamp
        )
        performanceTracker.current.end('Smart Polling Status Check')
        
        if (statusUpdates && statusUpdates.length > 0) {
          console.log(`📊 ${statusUpdates.length} booking status changes detected`)
          
          // 🚀 STEP 2: Only fetch full data if there are actual changes
          await fetchUserBookings(contactInfo.email, contactInfo.whatsapp, true)
          
          // Update timestamp
          lastUpdateTimestamp = new Date().toISOString()
          
          // Show notifications for important changes
          statusUpdates.forEach(update => {
            if (update.booking_status === 'confirmed') {
              toast.success(`Booking ${update.booking_reference} confirmed! 🎉`)
            } else if (update.booking_status === 'cancelled') {
              toast.error(`Booking ${update.booking_reference} was cancelled`)
            }
          })
        } else {
          console.log('📊 Smart polling: No updates (ultra-fast check)')
        }
        
      } catch (error) {
        console.warn('⚠️ Smart polling error:', error)
      }
    }, 30000) // Poll every 30 seconds

    return pollInterval
  }, [getUserContactInfo, fetchUserBookings])

  // Smart polling when user has bookings
  useEffect(() => {
    const contactInfo = getUserContactInfo()
    
    // Only start polling if user has contact info
    if (!contactInfo.email && !contactInfo.whatsapp) {
      return
    }
    
    const pollInterval = setupSmartPolling()
    
    // Cleanup interval on unmount
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
        console.log('🔄 Smart polling stopped')
      }
    }
  }, [setupSmartPolling])

  // Get booking details by reference
  const getBookingDetails = useCallback(async (bookingReference) => {
    try {
      setLoading(true)
      const booking = await journeyService.getBookingByReference(bookingReference)
      setLoading(false)
      return booking
    } catch (error) {
      console.error('Error fetching booking details:', error)
      setError(error.message)
      setLoading(false)
      return null
    }
  }, [])

  // Helper functions (stable - no dependencies)
  const getTotalBookings = useCallback(() => {
    return userBookings.active.length + 
           userBookings.upcoming.length + 
           userBookings.past.length + 
           userBookings.cancelled.length
  }, [userBookings])

  const getNextUpcomingTour = useCallback(() => {
    if (userBookings.upcoming.length === 0) return null
    
    // Already sorted by date in categorizeBookings
    return userBookings.upcoming[0]
  }, [userBookings.upcoming])

  const getBookingStatusColor = useCallback((status) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'confirmed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'declined':
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }, [])

  const getBookingStatusIcon = useCallback((status) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'confirmed':
        return '✅'
      case 'completed':
        return '🎉'
      case 'declined':
      case 'cancelled':
        return '❌'
      default:
        return '📋'
    }
  }, [])

  const canContactOperator = useCallback((booking) => {
    return booking.booking_status === 'confirmed' && 
           (booking.operators?.whatsapp_number || booking.operators?.phone)
  }, [])

  const canRebook = useCallback((booking) => {
    return ['declined', 'cancelled', 'completed'].includes(booking.booking_status)
  }, [])

  // Format price
  const formatPrice = useCallback((price) => {
    if (!price) return '0 XPF'
    return new Intl.NumberFormat('fr-FR').format(price) + ' XPF'
  }, [])

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }, [])

  const formatTime = useCallback((timeSlot) => {
    return timeSlot || ''
  }, [])

  // Return exactly the same interface
  return {
    // Data
    userBookings,
    loading,
    error,
    favorites,
    
    // Actions
    fetchUserBookings,
    refreshBookings,
    getBookingDetails,
    
    // Helpers
    getTotalBookings,
    getNextUpcomingTour,
    getBookingStatusColor,
    getBookingStatusIcon,
    canContactOperator,
    canRebook,
    formatPrice,
    formatDate,
    formatTime,
    getUserContactInfo,
    saveUserContactInfo
  }
}