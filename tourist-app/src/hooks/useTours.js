// src/hooks/useTours.js
import { useState, useEffect, useCallback } from 'react'
import { tourService } from '../services/tourService'
import { useAppStore } from '../stores/bookingStore'
import toast from 'react-hot-toast'

export const useTours = () => {
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
  const [discoverTours, setDiscoverTours] = useState([]) // Ensure it's initialized
  const [error, setError] = useState(null)

  // Fetch all tours
  const fetchTours = useCallback(async (showToast = false) => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await tourService.getActiveTours(filters)
      setTours(data)
      
      // Only show toast if explicitly requested (not on auto-refresh)
      if (showToast) {
        console.log(`Fetched ${data.length} tours with current filters:`, filters)
      }
    } catch (err) {
      console.error('Error fetching tours:', err)
      setError(err.message)
      if (showToast) {
        toast.error('Failed to load tours. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [filters, setTours, setLoading])

  // Fetch general discover tours (today + next 3 days)
  const fetchDiscoverTours = useCallback(async () => {
    try {
      const data = await tourService.getDiscoverTours()
      setDiscoverTours(data)
    } catch (err) {
      console.error('Error fetching discover tours:', err)
    }
  }, [])

  // Fetch urgent tours (separate from main tours)
  const fetchUrgentTours = useCallback(async () => {
    try {
      const data = await tourService.getUrgentTours()
      setUrgentTours(data)
    } catch (err) {
      console.error('Error fetching urgent tours:', err)
    }
  }, [])

  // Fetch tours by mood (using discover date range)
  const fetchMoodTours = useCallback(async (mood) => {
    try {
      setLoading(true)
      
      // First get all discover tours (today + next 3 days)
      const allDiscoverTours = await tourService.getDiscoverTours()
      
      // Then filter by mood
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
      
      setMoodTours(filtered)
    } catch (err) {
      console.error('Error fetching mood tours:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [setLoading])

  // Auto-fetch tours when filters change
  useEffect(() => {
    fetchTours()
  }, [fetchTours])

  // Auto-fetch urgent tours and discover tours on mount and every 5 minutes
  useEffect(() => {
    fetchUrgentTours()
    fetchDiscoverTours()
    const interval = setInterval(() => {
      fetchUrgentTours()
      fetchDiscoverTours()
    }, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
  }, [fetchUrgentTours, fetchDiscoverTours])

  // Fetch mood tours when mood changes
  useEffect(() => {
    if (selectedMood) {
      fetchMoodTours(selectedMood)
    } else {
      setMoodTours([])
    }
  }, [selectedMood, fetchMoodTours])

  // Manual refresh function
  const refreshTours = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch all tour types simultaneously
      const [allTours, urgentData, discoverData] = await Promise.all([
        tourService.getActiveTours(filters),
        tourService.getUrgentTours(),
        tourService.getDiscoverTours()
      ])
      
      setTours(allTours)
      setUrgentTours(urgentData)
      setDiscoverTours(discoverData)
      
      // Re-fetch mood tours if mood is selected
      if (selectedMood) {
        const moodMapping = {
          adventure: ['Adrenalin', 'Hike', 'Diving'],
          relax: ['Mindfulness', 'Lagoon Tour', 'Cultural'],
          culture: ['Cultural'],
          ocean: ['Diving', 'Snorkeling', 'Whale Watching', 'Lagoon Tour']
        }
        
        const relevantTypes = moodMapping[selectedMood] || []
        const filtered = discoverData.filter(tour => 
          relevantTypes.includes(tour.tour_type)
        )
        setMoodTours(filtered)
      }
      
      // Show comprehensive toast
      const moodCount = selectedMood ? moodTours.length : 0
      toast.success(`Refreshed! Found ${urgentData.length} urgent deals, ${discoverData.length} total tours${selectedMood ? `, ${moodCount} ${selectedMood} tours` : ''}`)
      
    } catch (err) {
      console.error('Error refreshing tours:', err)
      toast.error('Failed to refresh tours')
    } finally {
      setLoading(false)
    }
  }, [filters, selectedMood, moodTours.length, setTours, setLoading])

  // Helper function to format price
  const formatPrice = (price) => {
    if (!price) return '0 XPF'
    return new Intl.NumberFormat('fr-FR').format(price) + ' XPF'
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  // Helper function to format time
  const formatTime = (timeSlot) => {
    if (!timeSlot) return ''
    return timeSlot
  }

  // Helper function to get urgency color
  const getUrgencyColor = (hoursLeft) => {
    if (!hoursLeft) return 'text-green-400 bg-green-500/20'
    if (hoursLeft < 1) return 'text-red-400 bg-red-500/20'
    if (hoursLeft < 2) return 'text-orange-400 bg-orange-500/20'
    if (hoursLeft < 4) return 'text-yellow-400 bg-yellow-500/20'
    return 'text-green-400 bg-green-500/20'
  }

  // Helper function to calculate savings
  const calculateSavings = (original, discount) => {
    if (!original || !discount) return 0
    return original - discount
  }

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
    
    // Helpers
    formatPrice,
    formatDate,
    formatTime,
    getUrgencyColor,
    calculateSavings
  }
}