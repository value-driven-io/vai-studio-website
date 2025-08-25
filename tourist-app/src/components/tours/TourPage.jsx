// src/components/tours/TourPage.jsx
// New component to handle tour deep links without breaking existing functionality

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import TourDetailModal from '../shared/TourDetailModal'
import { useAppStore } from '../../stores/bookingStore'
import { RefreshCw } from 'lucide-react'
import { formatPrice, formatDate, formatTime } from '../../lib/utils'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

const TourPage = () => {
  const { tourId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { favorites, toggleFavorite } = useAppStore()
  
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Local helper function for calculating savings
  const calculateSavings = (original, discount) => {
    if (!original || !discount || original <= discount) return 0
    return Math.round(((original - discount) / original) * 100)
  }

  // Fetch tour data based on URL parameter
  useEffect(() => {
    const fetchTour = async () => {
      if (!tourId) {
        setError('Activity ID not provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Fetch tour with operator data (same as existing queries)
        const { data: tourData, error: tourError } = await supabase
          .from('tours')
          .select(`
            *,
            operators (
              id,
              company_name,
              island,
              whatsapp_number,
              phone,
              contact_person
            )
          `)
          .eq('id', tourId)
          .eq('status', 'active') // Only show active tours
          .single()

        if (tourError) {
          console.error('Error fetching tour:', tourError)
          if (tourError.code === 'PGRST116') {
            setError('Activity not found or no longer available')
          } else {
            setError('Failed to load activity details')
          }
          return
        }

        if (!tourData) {
          setError('Activity not found')
          return
        }

        setTour(tourData)
        
        // Update page title for SEO
        document.title = `${tourData.tour_name} - VAI Tickets`
        
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchTour()
  }, [tourId])

  // Handle modal close - navigate back to app
  const handleClose = () => {
    // Navigate to main app instead of just closing modal
    navigate('/')
  }

  // Handle booking click - preserve existing functionality
  const handleBookingClick = () => {
    // This would trigger the existing booking modal
    // Implementation will depend on existing booking flow
    toast(t('booking.processingBooking'), { 
      icon: '🎫',
      style: {
        background: '#1e293b',
        color: '#f1f5f9',
        border: '1px solid #334155'
      }
    })
    navigate('/?bookTour=' + tourId)
  }

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    if (tour) {
      const wasAlreadyFavorite = favorites.includes(tour.id)
      toggleFavorite(tour.id)
      
      // Show toast notification
      if (wasAlreadyFavorite) {
        toast(t('explore.favorites.removed'), {
          icon: '➖',
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155'
          }
        })
      } else {
        toast(t('explore.favorites.added'), {
          icon: '➕',
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155'
          }
        })
      }
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="text-lg">{t('common.loading')}</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{t('errors.activityNotAvailable', 'Activity Not Available')}</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            {t('discovery.browseAllTours')}
          </button>
        </div>
      </div>
    )
  }

  // Render existing TourDetailModal in full-screen mode
  return (
    <div className="min-h-screen bg-slate-900">
      {tour && (
        <TourDetailModal
          tour={tour}
          isOpen={true}
          onClose={handleClose}
          onBookingClick={handleBookingClick}
          onFavoriteToggle={handleFavoriteToggle}
          isFavorite={favorites.includes(tour.id)}
          formatPrice={formatPrice}
          formatDate={formatDate}
          formatTime={formatTime}
          calculateSavings={calculateSavings}
          hideBookButton={false}
        />
      )}
    </div>
  )
}

export default TourPage