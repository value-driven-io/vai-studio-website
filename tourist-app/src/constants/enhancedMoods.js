// Enhanced mood categories with smart filtering
import { Mountain, Heart, Compass, Waves } from 'lucide-react'

export const ENHANCED_MOOD_CATEGORIES = [
  {
    id: 'adventure',
    icon: Mountain,
    titleKey: 'moods.adventure.title',
    subtitleKey: 'moods.adventure.subtitle', 
    descriptionKey: 'moods.adventure.description',
    tourTypes: ['Adrenalin', 'Hike', 'Diving'],
    colors: {
      bg: 'bg-orange-500',
      hover: 'hover:bg-orange-600',
      text: 'text-orange-100',
      border: 'border-orange-400'
    },
    smartFilters: {
      preferredFitnessLevels: ['moderate', 'challenging', 'expert'],
      minDuration: 2,
      scoreBoosts: {
        equipment_included: +15,
        weather_dependent: +5,
        fitness_level: (level) => ['challenging', 'expert'].includes(level) ? +10 : 0
      }
    }
  },
  {
    id: 'relax',
    icon: Heart,
    titleKey: 'moods.relax.title',
    subtitleKey: 'moods.relax.subtitle',
    descriptionKey: 'moods.relax.description', 
    tourTypes: ['Mindfulness', 'Lagoon Tour', 'Cultural'],
    colors: {
      bg: 'bg-blue-500',
      hover: 'hover:bg-blue-600',
      text: 'text-blue-100',
      border: 'border-blue-400'
    },
    smartFilters: {
      preferredFitnessLevels: ['easy'],
      maxDuration: 4,
      scoreBoosts: {
        pickup_available: +10,
        food_included: +8,
        min_age: (age) => !age || age <= 5 ? +5 : 0
      }
    }
  },
  {
    id: 'culture',
    icon: Compass,
    titleKey: 'moods.culture.title',
    subtitleKey: 'moods.culture.subtitle',
    descriptionKey: 'moods.culture.description',
    // ENHANCED: Now includes culinary experiences
    tourTypes: ['Cultural', 'Culinary Experience'],
    colors: {
      bg: 'bg-purple-500',
      hover: 'hover:bg-purple-600',
      text: 'text-purple-100',
      border: 'border-purple-400'
    },
    smartFilters: {
      scoreBoosts: {
        food_included: +15, // Bonus for culinary experiences
        drinks_included: +10,
        min_age: (age) => !age ? +10 : 0, // Family-friendly bonus
        languages: (langs) => langs?.includes('English') ? +8 : +5
      }
    }
  },
  {
    id: 'ocean',
    icon: Waves,
    titleKey: 'moods.ocean.title',
    subtitleKey: 'moods.ocean.subtitle',
    descriptionKey: 'moods.ocean.description',
    tourTypes: ['Diving', 'Snorkeling', 'Whale Watching', 'Lagoon Tour'],
    colors: {
      bg: 'bg-cyan-500',
      hover: 'hover:bg-cyan-600',
      text: 'text-cyan-100',
      border: 'border-cyan-400'
    },
    smartFilters: {
      scoreBoosts: {
        equipment_included: +20, // Critical for water activities
        whale_regulation_compliant: +25, // Premium eco-experience
        weather_dependent: +5
      }
    }
  }
]