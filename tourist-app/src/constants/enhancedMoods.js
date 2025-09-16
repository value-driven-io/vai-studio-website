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
      bg: 'bg-mood-adventure',
      hover: 'hover:bg-mood-adventure',
      text: 'text-white',
      border: 'border-mood-adventure'
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
      bg: 'bg-mood-relax',
      hover: 'hover:bg-mood-relax',
      text: 'text-white',
      border: 'border-mood-relax'
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
      bg: 'bg-mood-culture',
      hover: 'hover:bg-mood-culture',
      text: 'text-white',
      border: 'border-mood-culture'
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
      bg: 'bg-mood-ocean',
      hover: 'hover:bg-mood-ocean',
      text: 'text-white',
      border: 'border-mood-ocean'
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