// src/constants/moods.js

export const MOOD_CATEGORIES = [
  {
    id: 'adventure',
    emoji: '🏃‍♀️',
    title: 'Adventure',
    subtitle: 'Get your adrenaline pumping',
    description: 'Thrilling experiences that challenge your limits',
    tourTypes: ['Adrenalin', 'Hike', 'Diving'],
    colors: {
      bg: 'bg-orange-500',
      hover: 'hover:bg-orange-600',
      text: 'text-orange-100',
      border: 'border-orange-400'
    }
  },
  {
    id: 'relax',
    emoji: '🧘‍♀️',
    title: 'Relax',
    subtitle: 'Find your inner peace',
    description: 'Peaceful experiences to restore your energy',
    tourTypes: ['Mindfulness', 'Lagoon Tour', 'Cultural'],
    colors: {
      bg: 'bg-blue-500',
      hover: 'hover:bg-blue-600', 
      text: 'text-blue-100',
      border: 'border-blue-400'
    }
  },
  {
    id: 'culture',
    emoji: '🌺',
    title: 'Culture',
    subtitle: 'Connect with traditions',
    description: 'Authentic local experiences and heritage',
    tourTypes: ['Cultural'],
    colors: {
      bg: 'bg-purple-500',
      hover: 'hover:bg-purple-600',
      text: 'text-purple-100', 
      border: 'border-purple-400'
    }
  },
  {
    id: 'ocean',
    emoji: '🐠',
    title: 'Ocean',
    subtitle: 'Dive into paradise',
    description: 'Explore the incredible underwater world',
    tourTypes: ['Diving', 'Snorkeling', 'Whale Watching', 'Lagoon Tour'],
    colors: {
      bg: 'bg-cyan-500',
      hover: 'hover:bg-cyan-600',
      text: 'text-cyan-100',
      border: 'border-cyan-400'
    }
  }
]

export const TOUR_TYPE_EMOJIS = {
  'Adrenalin': '🪂',
  'Cultural': '🌺', 
  'Diving': '🤿',
  'Hike': '🥾',
  'Lagoon Tour': '🚤',
  'Mindfulness': '🧘',
  'Whale Watching': '🐋',
  'Snorkeling': '🐢'
}

export const ISLAND_EMOJIS = {
  'Moorea': '🏝️',
  'Tahiti': '🌋',
  'Bora Bora': '🏖️',
  'Huahine': '🌺',
  'Raiatea': '⛵',
  'Taha\'a': '🥥',
  'Tikehau': '🐚',
  'Rangiroa': '🌊',
  'Fakarava': '🐠',
  'Maupiti': '🏔️'
}