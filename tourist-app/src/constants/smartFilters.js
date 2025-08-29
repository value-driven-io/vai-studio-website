// Smart filters that appear based on selected mood
import { Clock, Users, Crown, Heart, DollarSign } from 'lucide-react'

export const SMART_FILTERS_BY_MOOD = {
  adventure: [
    {
      id: 'quick',
      icon: Clock,
      labelKey: 'discovery.quick',
      filter: (tour) => tour.duration_hours <= 3,
      description: '1-3 hours'
    },
    {
      id: 'family',
      icon: Users,
      labelKey: 'discovery.family',
      filter: (tour) => !tour.min_age || tour.min_age <= 8,
      description: 'Kid-friendly adventures'
    },
    {
      id: 'luxury',
      icon: Crown,
      labelKey: 'discovery.luxury',
      filter: (tour) => tour.equipment_included && tour.discount_price_adult > 15000,
      description: 'Premium gear & service'
    }
  ],

  relax: [
    {
      id: 'romantic',
      icon: Heart,
      labelKey: 'discovery.romantic',
      filter: (tour) => tour.max_capacity <= 8 && tour.pickup_available,
      description: 'Intimate experiences'
    },
    {
      id: 'luxury',
      icon: Crown,
      labelKey: 'discovery.luxury',
      filter: (tour) => tour.food_included && tour.pickup_available,
      description: 'Full service included'
    },
    {
      id: 'budget',
      icon: DollarSign,
      labelKey: 'discovery.budget',
      filter: (tour) => tour.discount_price_adult < 8000,
      description: 'Under 8,000 XPF'
    }
  ],

  culture: [
    {
      id: 'family',
      icon: Users,
      labelKey: 'discovery.family',
      filter: (tour) => !tour.min_age,
      description: 'All ages welcome'
    },
    {
      id: 'romantic',
      icon: Heart,
      labelKey: 'discovery.romantic',
      filter: (tour) => {
        // Culinary experiences with intimate setting or cultural experiences for couples
        return (tour.tour_type === 'Culinary Experience' && tour.max_capacity <= 10) ||
               (tour.tour_type === 'Cultural' && tour.max_capacity <= 6)
      },
      description: 'Intimate cultural moments'
    },
    {
      id: 'quick',
      icon: Clock,
      labelKey: 'discovery.quick',
      filter: (tour) => tour.duration_hours <= 2.5,
      description: 'Quick cultural immersion'
    }
  ],

  ocean: [
    {
      id: 'family',
      icon: Users,
      labelKey: 'discovery.family',
      filter: (tour) => {
        // Snorkeling and lagoon tours are more family-friendly than diving
        return tour.tour_type === 'Snorkeling' || 
               tour.tour_type === 'Lagoon Tour' ||
               (!tour.min_age || tour.min_age <= 8)
      },
      description: 'Safe for kids'
    },
    {
      id: 'luxury',
      icon: Crown,
      labelKey: 'discovery.luxury',
      filter: (tour) => tour.equipment_included && tour.food_included,
      description: 'Full-service marine experience'
    },
    {
      id: 'quick',
      icon: Clock,
      labelKey: 'discovery.quick',
      filter: (tour) => tour.duration_hours <= 3,
      description: 'Half-day ocean fun'
    }
  ]
}

// Helper function to get filters for a specific mood
export const getFiltersForMood = (moodId) => {
  return SMART_FILTERS_BY_MOOD[moodId] || []
}

// Helper function to apply multiple filters to tours
export const applySmartFilters = (tours, activeFilterIds, moodId) => {
  if (!activeFilterIds.length) return tours
  
  const availableFilters = getFiltersForMood(moodId)
  
  return tours.filter(tour => {
    return activeFilterIds.every(filterId => {
      const filter = availableFilters.find(f => f.id === filterId)
      return filter ? filter.filter(tour) : true
    })
  })
}