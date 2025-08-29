// Discovery service for smart filtering and tour recommendations
import { ENHANCED_MOOD_CATEGORIES } from '../constants/enhancedMoods'
import { applySmartFilters } from '../constants/smartFilters'

export class DiscoveryService {
  
  /**
   * Get tours filtered by island, mood, and smart filters
   */
  static getDiscoveryTours(allTours, island, moodId, smartFilterIds = []) {
    let filtered = [...allTours]
    
    // Step 1: Filter by island (most restrictive first)
    if (island && island !== 'all') {
      filtered = filtered.filter(tour => tour.location === island)
    }
    
    // Step 2: Filter by mood with smart scoring
    if (moodId) {
      filtered = this.applyMoodFilter(filtered, moodId)
    }
    
    // Step 3: Apply smart filters
    if (smartFilterIds.length > 0) {
      filtered = applySmartFilters(filtered, smartFilterIds, moodId)
    }
    
    return filtered
  }
  
  /**
   * Apply mood-based filtering with smart scoring
   */
  static applyMoodFilter(tours, moodId) {
    const moodProfile = ENHANCED_MOOD_CATEGORIES.find(m => m.id === moodId)
    if (!moodProfile) return tours
    
    // Basic filter by tour types
    let filtered = tours.filter(tour => 
      moodProfile.tourTypes.includes(tour.tour_type)
    )
    
    // Apply smart scoring and sort by best matches
    const scored = filtered.map(tour => ({
      ...tour,
      moodScore: this.calculateMoodScore(tour, moodProfile)
    }))
    
    return scored
      .sort((a, b) => b.moodScore - a.moodScore)
      .slice(0, 20) // Top 20 best matches
  }
  
  /**
   * Calculate mood compatibility score
   */
  static calculateMoodScore(tour, moodProfile) {
    let score = 100 // Base score
    
    const { smartFilters } = moodProfile
    if (!smartFilters) return score
    
    // Apply fitness level preferences
    if (smartFilters.preferredFitnessLevels?.includes(tour.fitness_level)) {
      score += 20
    }
    
    // Apply duration preferences
    if (smartFilters.minDuration && tour.duration_hours >= smartFilters.minDuration) {
      score += 15
    }
    if (smartFilters.maxDuration && tour.duration_hours <= smartFilters.maxDuration) {
      score += 15
    }
    
    // Apply score boosts
    if (smartFilters.scoreBoosts) {
      Object.entries(smartFilters.scoreBoosts).forEach(([field, boostValue]) => {
        if (typeof boostValue === 'function') {
          score += boostValue(tour[field]) || 0
        } else if (tour[field]) {
          score += boostValue
        }
      })
    }
    
    return Math.max(0, score) // Ensure non-negative score
  }
  
  /**
   * Get preview data for mood cards
   */
  static getMoodPreviewData(tours, moodId) {
    const moodTours = this.applyMoodFilter(tours, moodId)
    
    if (!moodTours.length) {
      return {
        tourCount: 0,
        durationRange: '',
        priceRange: '',
        highlights: [],
        urgentCount: 0
      }
    }
    
    const durations = moodTours.map(t => t.duration_hours).filter(Boolean)
    const prices = moodTours.map(t => t.discount_price_adult).filter(Boolean)
    const urgentTours = moodTours.filter(t => t.hours_until_deadline && t.hours_until_deadline < 6)
    
    return {
      tourCount: moodTours.length,
      durationRange: durations.length > 0 
        ? `${Math.min(...durations)}-${Math.max(...durations)}h`
        : '',
      priceRange: this.getPriceRangeDisplay(prices),
      highlights: this.getTopHighlights(moodTours, moodId),
      urgentCount: urgentTours.length
    }
  }
  
  /**
   * Get top highlights for a mood
   */
  static getTopHighlights(tours, moodId) {
    const highlights = []
    
    // Count features across tours
    const equipmentIncluded = tours.filter(t => t.equipment_included).length
    const foodIncluded = tours.filter(t => t.food_included).length
    const pickupAvailable = tours.filter(t => t.pickup_available).length
    const ecoCompliant = tours.filter(t => t.whale_regulation_compliant).length
    
    // Add highlights based on mood and frequency
    if (equipmentIncluded > 0) {
      highlights.push(`🎿 ${equipmentIncluded} with gear`)
    }
    if (foodIncluded > 0) {
      highlights.push(`🍽️ ${foodIncluded} with food`)
    }
    if (ecoCompliant > 0 && moodId === 'ocean') {
      highlights.push(`🌱 ${ecoCompliant} eco-certified`)
    }
    if (pickupAvailable > 0 && moodId === 'relax') {
      highlights.push(`🚐 ${pickupAvailable} with pickup`)
    }
    
    return highlights.slice(0, 3) // Max 3 highlights
  }
  
  /**
   * Get price range display
   */
  static getPriceRangeDisplay(prices) {
    if (!prices.length) return ''
    
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    
    if (min === max) {
      return this.formatPrice(min)
    }
    
    return `${this.formatPrice(min)} - ${this.formatPrice(max)}`
  }
  
  /**
   * Format price for display
   */
  static formatPrice(price) {
    if (price < 5000) return '💰'
    if (price < 12000) return '💰💰'
    return '💰💰💰'
  }
}

export default DiscoveryService