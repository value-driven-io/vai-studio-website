// Enhanced Tour Data Service
// File: src/services/enhancedTourService.js

import { supabase } from './supabase'

class EnhancedTourService {
  
  // Main tour discovery query with rich data
  async getDiscoveryTours(filters = {}) {
    try {
      let query = supabase
        .from('active_tours_with_operators')
        .select(`
          id,
          created_at,
          updated_at,
          tour_name,
          tour_type,
          description,
          tour_date,
          time_slot,
          duration_hours,
          max_capacity,
          available_spots,
          original_price_adult,
          discount_price_adult,
          discount_price_child,
          discount_percentage,
          meeting_point,
          meeting_point_gps,
          pickup_available,
          pickup_locations,
          languages,
          equipment_included,
          food_included,
          drinks_included,
          whale_regulation_compliant,
          max_whale_group_size,
          min_age,
          max_age,
          fitness_level,
          requirements,
          restrictions,
          booking_deadline,
          auto_close_hours,
          status,
          weather_dependent,
          backup_plan,
          special_notes,
          operator_id,
          company_name,
          operator_island,
          operator_whatsapp_number,
          operator_average_rating,
          operator_total_tours_completed
        `)
        .eq('status', 'active')
        .gt('available_spots', 0)
        .gte('booking_deadline', new Date().toISOString())
        .order('tour_date', { ascending: true })

      // Apply filters
      if (filters.island && filters.island !== 'all') {
        query = query.eq('operator_island', filters.island)
      }

      if (filters.tourType && filters.tourType !== 'all') {
        query = query.eq('tour_type', filters.tourType)
      }

      if (filters.dateRange) {
        query = query
          .gte('tour_date', filters.dateRange.start)
          .lte('tour_date', filters.dateRange.end)
      }

      if (filters.priceRange) {
        if (filters.priceRange.min) {
          query = query.gte('discount_price_adult', filters.priceRange.min)
        }
        if (filters.priceRange.max) {
          query = query.lte('discount_price_adult', filters.priceRange.max)
        }
      }

      if (filters.search) {
        query = query.or(`
          tour_name.ilike.%${filters.search}%,
          description.ilike.%${filters.search}%,
          company_name.ilike.%${filters.search}%
        `)
      }

      const { data: tours, error } = await query

      if (error) throw error

      // Enrich tours with calculated fields
      return this.enrichTours(tours)

    } catch (error) {
      console.error('Error fetching discovery tours:', error)
      throw new Error('Failed to load tours')
    }
  }

  // Get urgent tours (booking deadline within 8 hours)
  async getUrgentTours() {
    try {
      const urgentDeadline = new Date()
      urgentDeadline.setHours(urgentDeadline.getHours() + 8)

      const { data: tours, error } = await supabase
        .from('active_tours_with_operators')
        .select('*')
        .eq('status', 'active')
        .gt('available_spots', 0)
        .gte('booking_deadline', new Date().toISOString())
        .lte('booking_deadline', urgentDeadline.toISOString())
        .order('booking_deadline', { ascending: true })
        .limit(10)

      if (error) throw error

      return this.enrichTours(tours)

    } catch (error) {
      console.error('Error fetching urgent tours:', error)
      return []
    }
  }

  // Get tours by mood categories
  async getToursByMood(moodId) {
    const moodTypeMapping = {
      adventure: ['Adrenalin', 'Hiking', 'Diving'],
      relax: ['Mindfulness', 'Lagoon Tour', 'Cultural'],
      culture: ['Cultural', 'Traditional'],
      ocean: ['Diving', 'Snorkeling', 'Whale Watching', 'Lagoon Tour']
    }

    const tourTypes = moodTypeMapping[moodId]
    if (!tourTypes) return []

    try {
      const { data: tours, error } = await supabase
        .from('active_tours_with_operators')
        .select('*')
        .eq('status', 'active')
        .gt('available_spots', 0)
        .gte('booking_deadline', new Date().toISOString())
        .in('tour_type', tourTypes)
        .order('discount_percentage', { ascending: false })
        .limit(20)

      if (error) throw error

      return this.enrichTours(tours)

    } catch (error) {
      console.error('Error fetching mood tours:', error)
      return []
    }
  }

  // Get tours by specific IDs (for favorites)
  async getToursByIds(tourIds) {
    if (!tourIds || tourIds.length === 0) return []

    try {
      const { data: tours, error } = await supabase
        .from('active_tours_with_operators')
        .select('*')
        .in('id', tourIds)
        .order('tour_date', { ascending: true })

      if (error) throw error

      return this.enrichTours(tours)

    } catch (error) {
      console.error('Error fetching tours by IDs:', error)
      return []
    }
  }

  // Enrich tours with calculated fields and formatting
  enrichTours(tours) {
    return tours.map(tour => ({
      ...tour,
      
      // Calculate hours until booking deadline
      hours_until_deadline: this.calculateHoursUntilDeadline(tour.booking_deadline),
      
      // Format pricing
      savings_amount: tour.original_price_adult - tour.discount_price_adult,
      savings_percentage: Math.round(
        ((tour.original_price_adult - tour.discount_price_adult) / tour.original_price_adult) * 100
      ),
      
      // Urgency indicators
      urgency_level: this.getUrgencyLevel(tour.booking_deadline),
      
      // Availability indicators
      availability_status: this.getAvailabilityStatus(tour.available_spots, tour.max_capacity),
      
      // Inclusion summary
      inclusions_count: this.countInclusions(tour),
      
      // Experience indicators
      is_premium: tour.original_price_adult > 15000, // XPF
      is_beginner_friendly: tour.min_age <= 8 && tour.fitness_level !== 'high',
      is_family_friendly: tour.min_age <= 12 && tour.max_capacity >= 6,
      
      // Language flags
      language_flags: this.getLanguageFlags(tour.languages),
      
      // Special badges
      special_badges: this.getSpecialBadges(tour)
    }))
  }

  // Helper: Calculate hours until booking deadline
  calculateHoursUntilDeadline(deadline) {
    if (!deadline) return null
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffMs = deadlineDate - now
    return Math.max(0, diffMs / (1000 * 60 * 60)) // Hours
  }

  // Helper: Get urgency level
  getUrgencyLevel(deadline) {
    const hours = this.calculateHoursUntilDeadline(deadline)
    if (hours === null) return null
    
    if (hours <= 2) return { level: 'critical', color: 'red', priority: 3 }
    if (hours <= 4) return { level: 'high', color: 'orange', priority: 2 }
    if (hours <= 8) return { level: 'medium', color: 'yellow', priority: 1 }
    return { level: 'normal', color: 'green', priority: 0 }
  }

  // Helper: Get availability status
  getAvailabilityStatus(available, max) {
    const percentage = (available / max) * 100
    
    if (percentage <= 20) return { status: 'limited', text: 'Almost full', color: 'red' }
    if (percentage <= 50) return { status: 'moderate', text: 'Filling up', color: 'orange' }
    return { status: 'available', text: 'Available', color: 'green' }
  }

  // Helper: Count inclusions
  countInclusions(tour) {
    let count = 0
    if (tour.equipment_included) count++
    if (tour.food_included) count++
    if (tour.drinks_included) count++
    if (tour.pickup_available) count++
    return count
  }

  // Helper: Get language flags
  getLanguageFlags(languages) {
    if (!languages || !Array.isArray(languages)) return []
    
    const flagMap = {
      'en': '🇬🇧',
      'fr': '🇫🇷', 
      'de': '🇩🇪',
      'es': '🇪🇸',
      'it': '🇮🇹',
      'ja': '🇯🇵',
      'zh': '🇨🇳'
    }

    return languages.map(lang => flagMap[lang.toLowerCase()]).filter(Boolean)
  }

  // Helper: Get special badges
  getSpecialBadges(tour) {
    const badges = []

    if (tour.whale_regulation_compliant) {
      badges.push({ type: 'eco', text: 'Eco-Certified', color: 'green' })
    }

    if (tour.discount_percentage >= 30) {
      badges.push({ type: 'discount', text: 'Great Deal', color: 'blue' })
    }

    if (tour.operator_average_rating >= 4.5) {
      badges.push({ type: 'quality', text: 'Top Rated', color: 'purple' })
    }

    if (tour.operator_total_tours_completed >= 100) {
      badges.push({ type: 'experience', text: 'Experienced', color: 'gold' })
    }

    if (tour.weather_dependent && tour.backup_plan) {
      badges.push({ type: 'flexible', text: 'Backup Plan', color: 'teal' })
    }

    return badges
  }

  // Advanced filtering for explore tab
  async getFilteredTours(filters = {}) {
    let tours = await this.getDiscoveryTours(filters)

    // Apply additional client-side filters
    if (filters.inclusions) {
      tours = tours.filter(tour => {
        if (filters.inclusions.equipment && !tour.equipment_included) return false
        if (filters.inclusions.food && !tour.food_included) return false
        if (filters.inclusions.pickup && !tour.pickup_available) return false
        return true
      })
    }

    if (filters.experience) {
      tours = tours.filter(tour => {
        if (filters.experience === 'beginner' && !tour.is_beginner_friendly) return false
        if (filters.experience === 'family' && !tour.is_family_friendly) return false
        if (filters.experience === 'premium' && !tour.is_premium) return false
        return true
      })
    }

    if (filters.urgency) {
      tours = tours.filter(tour => {
        if (!tour.urgency_level) return false
        return tour.urgency_level.priority >= (filters.urgency === 'urgent' ? 1 : 0)
      })
    }

    // Apply sorting
    if (filters.sortBy) {
      tours = this.sortTours(tours, filters.sortBy)
    }

    return tours
  }

  // Sort tours by different criteria
  sortTours(tours, sortBy) {
    switch (sortBy) {
      case 'price_low':
        return tours.sort((a, b) => a.discount_price_adult - b.discount_price_adult)
      
      case 'price_high':
        return tours.sort((a, b) => b.discount_price_adult - a.discount_price_adult)
      
      case 'discount':
        return tours.sort((a, b) => b.savings_percentage - a.savings_percentage)
      
      case 'urgency':
        return tours.sort((a, b) => {
          const aPriority = a.urgency_level?.priority || 0
          const bPriority = b.urgency_level?.priority || 0
          return bPriority - aPriority
        })
      
      case 'rating':
        return tours.sort((a, b) => (b.operator_average_rating || 0) - (a.operator_average_rating || 0))
      
      case 'availability':
        return tours.sort((a, b) => a.available_spots - b.available_spots)
      
      case 'date':
      default:
        return tours.sort((a, b) => new Date(a.tour_date) - new Date(b.tour_date))
    }
  }

  // Get tour statistics for dashboard
  async getTourStatistics() {
    try {
      const [
        { count: totalActive },
        { count: urgentCount },
        { data: priceStats }
      ] = await Promise.all([
        supabase
          .from('active_tours_with_operators')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .gt('available_spots', 0),
        
        supabase
          .from('active_tours_with_operators')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .gt('available_spots', 0)
          .lte('booking_deadline', new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()),
        
        supabase
          .from('active_tours_with_operators')
          .select('discount_price_adult, discount_percentage')
          .eq('status', 'active')
          .gt('available_spots', 0)
      ])

      const averagePrice = priceStats?.length 
        ? Math.round(priceStats.reduce((sum, tour) => sum + tour.discount_price_adult, 0) / priceStats.length)
        : 0

      const averageDiscount = priceStats?.length
        ? Math.round(priceStats.reduce((sum, tour) => sum + tour.discount_percentage, 0) / priceStats.length)
        : 0

      return {
        totalActiveTours: totalActive || 0,
        urgentDeals: urgentCount || 0,
        averagePrice,
        averageDiscount,
        lastUpdated: new Date().toISOString()
      }

    } catch (error) {
      console.error('Error fetching tour statistics:', error)
      return {
        totalActiveTours: 0,
        urgentDeals: 0,
        averagePrice: 0,
        averageDiscount: 0,
        lastUpdated: new Date().toISOString()
      }
    }
  }

  // Get tour recommendations based on user behavior
  async getRecommendedTours(userPreferences = {}) {
    try {
      let query = supabase
        .from('active_tours_with_operators')
        .select('*')
        .eq('status', 'active')
        .gt('available_spots', 0)
        .gte('booking_deadline', new Date().toISOString())

      // Apply user preferences
      if (userPreferences.preferredIslands?.length) {
        query = query.in('operator_island', userPreferences.preferredIslands)
      }

      if (userPreferences.preferredTourTypes?.length) {
        query = query.in('tour_type', userPreferences.preferredTourTypes)
      }

      if (userPreferences.maxPrice) {
        query = query.lte('discount_price_adult', userPreferences.maxPrice)
      }

      if (userPreferences.minDiscount) {
        query = query.gte('discount_percentage', userPreferences.minDiscount)
      }

      const { data: tours, error } = await query
        .order('operator_average_rating', { ascending: false })
        .limit(10)

      if (error) throw error

      return this.enrichTours(tours)

    } catch (error) {
      console.error('Error fetching recommended tours:', error)
      return []
    }
  }
}

// Export singleton instance
export const enhancedTourService = new EnhancedTourService()

// Utility functions for tour data formatting
export const tourUtils = {
  formatPrice: (price, currency = 'XPF') => {
    if (!price) return 'Price TBD'
    return new Intl.NumberFormat('fr-FR').format(price) + ` ${currency}`
  },

  formatDate: (dateString) => {
    if (!dateString) return 'Date TBD'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  },

  formatTime: (timeString) => {
    if (!timeString) return 'Time TBD'
    return timeString.replace(/:\d{2}$/, '') // Remove seconds
  },

  calculateSavings: (original, discounted) => {
    if (!original || !discounted || original <= discounted) return 0
    return Math.round(((original - discounted) / original) * 100)
  },

  getUrgencyColor: (hoursLeft) => {
    if (!hoursLeft) return 'text-ui-text-disabled bg-ui-surface-tertiary'

    if (hoursLeft <= 2) return 'text-white bg-status-error border-status-error'
    if (hoursLeft <= 4) return 'text-white bg-status-warning border-status-warning'
    if (hoursLeft <= 8) return 'text-white bg-status-caution border-status-caution'
    return 'text-white bg-status-success border-status-success'
  },

  getDurationText: (hours) => {
    if (!hours) return 'Duration TBD'
    if (hours < 1) return `${Math.round(hours * 60)} minutes`
    if (hours === 1) return '1 hour'
    return `${hours} hours`
  },

  getCapacityStatus: (available, max) => {
    const percentage = (available / max) * 100
    
    if (percentage <= 20) return { text: 'Almost full', color: 'text-status-error-light' }
    if (percentage <= 50) return { text: 'Filling up', color: 'text-status-warning-light' }
    return { text: 'Available', color: 'text-status-success-light' }
  }
}