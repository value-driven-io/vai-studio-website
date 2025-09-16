// src/constants/moods.js

export const MOOD_CATEGORIES = [
  {
    id: 'adventure',
    emoji: '⛰️',
    title: 'Adventure',
    subtitle: 'Get your adrenaline pumping',
    description: 'Thrilling experiences that challenge your limits',
    tourTypes: ['Adrenalin', 'Hike', 'Diving'],
    colors: {
      bg: 'bg-mood-adventure',
      hover: 'hover:bg-mood-adventure',
      text: 'text-white',
      border: 'border-mood-adventure'
    }
  },
  {
    id: 'relax',
    emoji: '🧘‍♀️',
    title: 'Chill',
    subtitle: 'Find your inner peace',
    description: 'Peaceful experiences to restore your energy',
    tourTypes: ['Mindfulness', 'Lagoon Tour', 'Cultural'],
    colors: {
      bg: 'bg-mood-relax',
      hover: 'hover:bg-mood-relax',
      text: 'text-white',
      border: 'border-mood-relax'
    }
  },
  {
    id: 'culture',
    emoji: '🗿',
    title: 'Culture',
    subtitle: 'Connect with traditions',
    description: 'Authentic local experiences and heritage',
    tourTypes: ['Cultural'],
    colors: {
      bg: 'bg-mood-culture',
      hover: 'hover:bg-mood-culture',
      text: 'text-white',
      border: 'border-mood-culture'
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
      bg: 'bg-mood-ocean',
      hover: 'hover:bg-mood-ocean',
      text: 'text-white',
      border: 'border-mood-ocean'
    }
  }
]

export const TOUR_TYPE_EMOJIS = {
  'Adrenalin': '🪂',
  'Cultural': '🗿', 
  'Diving': '🤿',
  'Hike': '🥾',
  'Lagoon Tour': '🏝️',
  'Relax': '🧘',
  'Whale Watching': '🐋',
  'Snorkeling': '🐢',
  'Culinary Experience': '🍽️',
  'Mindfulness': '🧘'
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