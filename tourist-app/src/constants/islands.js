// Islands available in French Polynesia
// Based on database location field constraints

export const ISLANDS = [
  { 
    id: 'all', 
    nameKey: 'islands.all', 
    emoji: '🏝️',
    description: 'All available islands' 
  },
  { 
    id: 'Tahiti', 
    nameKey: 'islands.tahiti', 
    emoji: '🌋',
    description: 'The main island - urban adventures and culture'
  },
  { 
    id: 'Moorea', 
    nameKey: 'islands.moorea', 
    emoji: '🌺',
    description: 'Sister island - lush mountains and lagoons'
  },
  { 
    id: 'Bora Bora', 
    nameKey: 'islands.boraBora', 
    emoji: '🏖️',
    description: 'Romantic paradise - luxury and overwater experiences'
  },
  { 
    id: 'Huahine', 
    nameKey: 'islands.huahine', 
    emoji: '🌸',
    description: 'Garden island - authentic and peaceful'
  },
  { 
    id: 'Raiatea', 
    nameKey: 'islands.raiatea', 
    emoji: '⛵',
    description: 'Sacred island - sailing and cultural heritage'
  },
  { 
    id: 'Taha\'a', 
    nameKey: 'islands.tahaa', 
    emoji: '🥥',
    description: 'Vanilla island - culinary and aromatic experiences'
  },
  { 
    id: 'Maupiti', 
    nameKey: 'islands.maupiti', 
    emoji: '🏔️',
    description: 'Hidden gem - untouched beauty'
  },
  { 
    id: 'Tikehau', 
    nameKey: 'islands.tikehau', 
    emoji: '🐚',
    description: 'Pink sand atoll - diving and marine life'
  },
  { 
    id: 'Rangiroa', 
    nameKey: 'islands.rangiroa', 
    emoji: '🌊',
    description: 'Infinite lagoon - world-class diving'
  },
  { 
    id: 'Fakarava', 
    nameKey: 'islands.fakarava', 
    emoji: '🐠',
    description: 'UNESCO biosphere - pristine diving'
  },
  { 
    id: 'Nuku Hiva', 
    nameKey: 'islands.nukuHiva', 
    emoji: '🗿',
    description: 'Marquesas adventure - wild and remote'
  }
]

// Helper function to get island by ID
export const getIslandById = (id) => {
  return ISLANDS.find(island => island.id === id)
}

// Helper function to get available islands from tours data
export const getAvailableIslands = (tours) => {
  const availableIslandIds = [...new Set(tours.map(tour => tour.location).filter(Boolean))]
  const availableIslands = ISLANDS.filter(island => 
    island.id === 'all' || availableIslandIds.includes(island.id)
  )
  return availableIslands
}