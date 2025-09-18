// src/hooks/useTours.js

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { tourService } from '../services/tourService'
import { useAppStore } from '../stores/bookingStore'
import toast from 'react-hot-toast'
import { formatDate as formatDateUtil } from '../lib/utils'

export const useTours = () => {
  const { t } = useTranslation()
  const { 
    tours, 
    setTours, 
    loading, 
    setLoading, 
    filters, 
    selectedMood 
  } = useAppStore()

  const [urgentTours, setUrgentTours] = useState([])
  const [moodTours, setMoodTours] = useState([])
  const [discoverTours, setDiscoverTours] = useState([])
  const [error, setError] = useState(null)

  // ✨ ENHANCED: Add calculated fields to tours
  const enrichTours = useCallback((tours) => {
    return tours.map(tour => ({
      ...tour,
      // Calculate hours until booking deadline
      hours_until_deadline: calculateHoursUntilDeadline(tour.booking_deadline),
      // Calculate savings
      savings_amount: tour.original_price_adult - tour.discount_price_adult,
      savings_percentage: Math.round(
        ((tour.original_price_adult - tour.discount_price_adult) / tour.original_price_adult) * 100
      ),
      // Add special badges
      special_badges: getSpecialBadges(tour),
      // Add language flags  
      language_flags: getLanguageFlags(tour.languages)
    }))
  }, [])

  // ✨ ENHANCED: Helper functions (keep your existing ones + add new ones)
  const calculateHoursUntilDeadline = useCallback((deadline) => {
    if (!deadline) return null
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffMs = deadlineDate - now
    return Math.max(0, diffMs / (1000 * 60 * 60))
  }, [])

  const getSpecialBadges = useCallback((tour) => {
    const badges = []
    if (tour.whale_regulation_compliant) {
      badges.push({ type: 'eco', text: t('useTours.badges.ecoCertified'), color: 'green' })
    }
    if (tour.discount_percentage >= 30) {
      badges.push({ type: 'discount', text: t('useTours.badges.greatDeal'), color: 'blue' })
    }
    return badges
  }, [])

  const getLanguageFlags = useCallback((languages) => {
    if (!languages || !Array.isArray(languages)) return []
    const flagMap = {
      'en': '🇬🇧', 'fr': '🇫🇷', 'de': '🇩🇪', 'es': '🇪🇸'
    }
    return languages.map(lang => flagMap[lang.toLowerCase()]).filter(Boolean)
  }, [])

  // EXISTING: Fetch all tours (keep your existing logic)
  const fetchTours = useCallback(async (showToast = false) => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await tourService.getActiveTours(filters)
      const enrichedData = enrichTours(data) // ✨ ENHANCED: Add enrichment
      setTours(enrichedData)
      
      if (showToast) {
        // Tours fetched and enriched successfully
      }
    } catch (err) {
      console.error('Error fetching tours:', err)
      setError(err.message)
      if (showToast) {
        toast.error(t('useTours.toasts.loadFailed'))
      }
    } finally {
      setLoading(false)
    }
  }, [filters, setTours, setLoading, enrichTours, t])

  // EXISTING: Fetch general discover tours (keep your existing logic)
  const fetchDiscoverTours = useCallback(async () => {
    try {
      const data = await tourService.getDiscoverTours()
      const enrichedData = enrichTours(data) // ✨ ENHANCED: Add enrichment
      setDiscoverTours(enrichedData)
    } catch (err) {
      console.error('Error fetching discover tours:', err)
    }
  }, [enrichTours, t])

  // EXISTING: Fetch urgent tours (keep your existing logic)
  const fetchUrgentTours = useCallback(async () => {
    try {
      const data = await tourService.getUrgentTours()
      const enrichedData = enrichTours(data) // ✨ ENHANCED: Add enrichment
      setUrgentTours(enrichedData)
    } catch (err) {
      console.error('Error fetching urgent tours:', err)
    }
  }, [enrichTours, t])

  // EXISTING: Fetch tours by mood (keep your existing logic)
  const fetchMoodTours = useCallback(async (mood) => {
    try {
      setLoading(true)
      
      const allDiscoverTours = await tourService.getDiscoverTours()
      
      const moodMapping = {
        adventure: ['Adrenalin', 'Hike', 'Diving'],
        relax: ['Mindfulness', 'Lagoon Tour', 'Cultural'],
        culture: ['Cultural'],
        ocean: ['Diving', 'Snorkeling', 'Whale Watching', 'Lagoon Tour']
      }
      
      const relevantTypes = moodMapping[mood] || []
      const filtered = allDiscoverTours.filter(tour => 
        relevantTypes.includes(tour.tour_type)
      )
      
      const enrichedData = enrichTours(filtered) // ✨ ENHANCED: Add enrichment
      setMoodTours(enrichedData)
    } catch (err) {
      console.error('Error fetching mood tours:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [setLoading, enrichTours, t])

  // EXISTING: Auto-fetch effects (keep your existing logic)
  useEffect(() => {
    fetchTours()
  }, [fetchTours])

  useEffect(() => {
    fetchUrgentTours()
    fetchDiscoverTours()
    const interval = setInterval(() => {
      fetchUrgentTours()
      fetchDiscoverTours()
    }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchUrgentTours, fetchDiscoverTours])

  useEffect(() => {
    if (selectedMood) {
      fetchMoodTours(selectedMood)
    } else {
      setMoodTours([])
    }
  }, [selectedMood, fetchMoodTours])

  // EXISTING: Manual refresh function (keep your existing logic + enhance)
  const refreshTours = useCallback(async () => {
    try {
      setLoading(true)
      
      const [allTours, urgentData, discoverData] = await Promise.all([
        tourService.getActiveTours(filters),
        tourService.getUrgentTours(),
        tourService.getDiscoverTours()
      ])
      
      // ✨ ENHANCED: Enrich all data
      const enrichedAllTours = enrichTours(allTours)
      const enrichedUrgentTours = enrichTours(urgentData)
      const enrichedDiscoverTours = enrichTours(discoverData)
      
      setTours(enrichedAllTours)
      setUrgentTours(enrichedUrgentTours)
      setDiscoverTours(enrichedDiscoverTours)
      
      if (selectedMood) {
        const moodMapping = {
          adventure: ['Adrenalin', 'Hike', 'Diving'],
          relax: ['Mindfulness', 'Lagoon Tour', 'Cultural'],
          culture: ['Cultural'],
          ocean: ['Diving', 'Snorkeling', 'Whale Watching', 'Lagoon Tour']
        }
        
        const relevantTypes = moodMapping[selectedMood] || []
        const filtered = enrichedDiscoverTours.filter(tour => 
          relevantTypes.includes(tour.tour_type)
        )
        setMoodTours(filtered)
      }
      
      // EXISTING: Keep your existing toast logic
      const moodCount = selectedMood ? moodTours.length : 0
      const moodInfo = selectedMood ? `, ${moodCount} ${selectedMood} tours` : ''
      toast.success(t('useTours.toasts.refreshSuccess', { 
        urgentCount: enrichedUrgentTours.length, 
        totalCount: enrichedDiscoverTours.length,
        moodInfo 
      }))
      
    } catch (err) {
      console.error('Error refreshing tours:', err)
      toast.error(t('useTours.toasts.refreshFailed'))
    } finally {
      setLoading(false)
    }
  }, [filters, selectedMood, moodTours.length, setTours, setLoading, enrichTours, t])

  // EXISTING: Helper functions (keep your existing ones)
  const formatPrice = (price, currency = 'XPF') => {
    if (!price) return currency === 'XPF' ? '0 XPF' : '0'
    return currency === 'XPF' 
      ? new Intl.NumberFormat('fr-FR').format(price) + ' XPF'
      : new Intl.NumberFormat('en-US').format(price)
  }

  const formatDate = formatDateUtil  // Use the timezone-aware version

  const formatTime = (timeSlot) => {
    if (!timeSlot) return ''
    return timeSlot
  }

  // ✨ ENHANCED: Improved urgency color logic
  const getUrgencyColor = (hoursLeft) => {
    if (!hoursLeft) return 'text-ui-text-disabled bg-ui-surface-tertiary border-ui-border-secondary'
    if (hoursLeft <= 2) return 'text-white bg-status-error border-status-error'
    if (hoursLeft <= 4) return 'text-white bg-status-warning border-status-warning'
    if (hoursLeft <= 8) return 'text-white bg-status-caution border-status-caution'
    return 'text-white bg-status-success border-status-success'
  }

  // ✨ ENHANCED: Better savings calculation
  const calculateSavings = (original, discount) => {
    if (!original || !discount || original <= discount) return 0
    return Math.round(((original - discount) / original) * 100)
  }

  // EXISTING: Return the same interface your components expect
  return {
    // Data
    tours,
    urgentTours,
    moodTours,
    discoverTours,
    loading,
    error,
    
    // Actions
    fetchTours,
    fetchUrgentTours,
    fetchMoodTours,
    fetchDiscoverTours,
    refreshTours,
    
    // Helpers (existing + enhanced)
    formatPrice,
    formatDate,
    formatTime,
    getUrgencyColor,
    calculateSavings
  }
}