// src/hooks/useUserJourney.js
import { useState, useEffect, useCallback } from 'react'
import { tourService } from '../services/tourService'
import { useAppStore } from '../stores/bookingStore'
import toast from 'react-hot-toast'

export const useUserJourney = () => {
  const { bookings: storeBookings, favorites, userProfile } = useAppStore()
  
  const [userBookings, setUserBookings] = useState({
    active: [],
    upcoming: [],
    past: [],
    cancelled: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Get user contact info from store, localStorage, or last booking
  const getUserContactInfo = () => {
    // First try user profile from store (most recent)
    if (userProfile?.email || userProfile?.whatsapp) {
      // console.log('Found contact info from user profile:', { email: userProfile.email, whatsapp: userProfile.whatsapp })
      return {
        email: userProfile.email,
        whatsapp: userProfile.whatsapp
      }
    }
    
    // Then try last booking
    const lastBooking = storeBookings[storeBookings.length - 1]
    if (lastBooking) {
      // console.log('Found contact info from last booking:', { email: lastBooking.customer_email, whatsapp: lastBooking.customer_whatsapp })
      return {
        email: lastBooking.customer_email,
        whatsapp: lastBooking.customer_whatsapp
      }
    }
    
    // Finally try localStorage
    const savedEmail = localStorage.getItem('vai_user_email')
    const savedWhatsApp = localStorage.getItem('vai_user_whatsapp')
    
    // console.log('Contact info from localStorage:', { email: savedEmail, whatsapp: savedWhatsApp })
    
    return {
      email: savedEmail,
      whatsapp: savedWhatsApp
    }
  }

  // Save user contact info for future lookups
  const saveUserContactInfo = (email, whatsapp) => {
    if (email) localStorage.setItem('vai_user_email', email)
    if (whatsapp) localStorage.setItem('vai_user_whatsapp', whatsapp)
  }

  // Fetch user bookings
  const fetchUserBookings = useCallback(async (email, whatsapp) => {
    // Clean and validate inputs
    const cleanEmail = email?.trim()
    const cleanWhatsApp = whatsapp?.trim()
    
    if (!cleanEmail && !cleanWhatsApp) {
      console.log('No email or WhatsApp provided, clearing bookings')
      setUserBookings({ active: [], upcoming: [], past: [], cancelled: [] })
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching bookings for:', { email: cleanEmail, whatsapp: cleanWhatsApp })
      
      const bookings = await tourService.getUserBookings(cleanEmail, cleanWhatsApp)
      setUserBookings(bookings)
      
      // Save contact info for future use
      saveUserContactInfo(cleanEmail, cleanWhatsApp)
      
      const totalBookings = bookings.active.length + bookings.upcoming.length + bookings.past.length + bookings.cancelled.length
      console.log(`Bookings fetched successfully: ${totalBookings} total bookings found`)
      
      // Show success message for manual searches with results
      if ((cleanEmail || cleanWhatsApp) && totalBookings > 0) {
        toast.success(`Found ${totalBookings} booking${totalBookings > 1 ? 's' : ''}!`)
      }
      
    } catch (err) {
      console.error('Error fetching user bookings:', err)
      setError(err.message)
      
      // Only show toast for manual searches, not auto-loads
      const isManualSearch = cleanEmail || cleanWhatsApp
      if (isManualSearch) {
        toast.error('Failed to load bookings. Please check your email/WhatsApp and try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-fetch bookings when component mounts
  useEffect(() => {
    const { email, whatsapp } = getUserContactInfo()
    const cleanEmail = email?.trim()
    const cleanWhatsApp = whatsapp?.trim()
    
    // Only auto-fetch if we have valid user contact info
    if (cleanEmail || cleanWhatsApp) {
      console.log('Auto-fetching bookings with saved contact info')
      fetchUserBookings(cleanEmail, cleanWhatsApp)
    } else {
      console.log('No valid saved contact info found, skipping auto-fetch')
    }
  }, [fetchUserBookings])

  // Refresh bookings manually
  const refreshBookings = useCallback(() => {
    const { email, whatsapp } = getUserContactInfo()
    fetchUserBookings(email, whatsapp)
  }, [fetchUserBookings])

  // Get booking by reference
  const getBookingDetails = useCallback(async (bookingReference) => {
    try {
      const booking = await tourService.getBookingByReference(bookingReference)
      return booking
    } catch (err) {
      console.error('Error fetching booking details:', err)
      toast.error('Failed to load booking details')
      return null
    }
  }, [])

  // Helper functions
  const getTotalBookings = () => {
    return userBookings.active.length + 
           userBookings.upcoming.length + 
           userBookings.past.length + 
           userBookings.cancelled.length
  }

  const getNextUpcomingTour = () => {
    if (userBookings.upcoming.length === 0) return null
    
    // Sort by tour date and return the soonest
    const sorted = [...userBookings.upcoming].sort((a, b) => 
      new Date(a.tours?.tour_date) - new Date(b.tours?.tour_date)
    )
    
    return sorted[0]
  }

  const getBookingStatusColor = (status) => {
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
  }

  const getBookingStatusIcon = (status) => {
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
  }

  const canContactOperator = (booking) => {
    return booking.booking_status === 'confirmed' && 
           (booking.operators?.whatsapp_number || booking.operators?.phone)
  }

  const canRebook = (booking) => {
    return ['declined', 'cancelled', 'completed'].includes(booking.booking_status)
  }

  // Format price
  const formatPrice = (price) => {
    if (!price) return '0 XPF'
    return new Intl.NumberFormat('fr-FR').format(price) + ' XPF'
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeSlot) => {
    return timeSlot || ''
  }

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