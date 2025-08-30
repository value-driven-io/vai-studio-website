// French Polynesia Interactive Map - WOW Factor Discovery
import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useTours } from '../../../hooks/useTours'
import { Zap, MapPin, Clock } from 'lucide-react'

// Island positions and data (simplified coordinates for SVG)
const ISLAND_DATA = [
  {
    id: 'Tahiti',
    nameKey: 'islands.tahiti',
    position: { x: 300, y: 280 },
    emoji: '🌋',
    size: 'large', // Main island
    archipelago: 'Society'
  },
  {
    id: 'Moorea', 
    nameKey: 'islands.moorea',
    position: { x: 280, y: 265 },
    emoji: '🌺',
    size: 'medium',
    archipelago: 'Society'
  },
  {
    id: 'Bora Bora',
    nameKey: 'islands.boraBora', 
    position: { x: 200, y: 250 },
    emoji: '🏖️',
    size: 'medium',
    archipelago: 'Society'
  },
  {
    id: 'Huahine',
    nameKey: 'islands.huahine',
    position: { x: 230, y: 270 },
    emoji: '🌸',
    size: 'small',
    archipelago: 'Society'
  },
  {
    id: 'Raiatea',
    nameKey: 'islands.raiatea',
    position: { x: 210, y: 280 },
    emoji: '⛵',
    size: 'medium',
    archipelago: 'Society'
  },
  {
    id: 'Taha\'a',
    nameKey: 'islands.tahaa',
    position: { x: 205, y: 270 },
    emoji: '🥥',
    size: 'small',
    archipelago: 'Society'
  },
  {
    id: 'Tikehau',
    nameKey: 'islands.tikehau',
    position: { x: 150, y: 200 },
    emoji: '🐚',
    size: 'small',
    archipelago: 'Tuamotu'
  },
  {
    id: 'Rangiroa',
    nameKey: 'islands.rangiroa',
    position: { x: 180, y: 180 },
    emoji: '🌊',
    size: 'medium',
    archipelago: 'Tuamotu'
  },
  {
    id: 'Fakarava',
    nameKey: 'islands.fakarava',
    position: { x: 220, y: 160 },
    emoji: '🐠',
    size: 'small',
    archipelago: 'Tuamotu'
  },
  {
    id: 'Nuku Hiva',
    nameKey: 'islands.nukuHiva',
    position: { x: 400, y: 80 },
    emoji: '🗿',
    size: 'medium',
    archipelago: 'Marquesas'
  }
]

const FrenchPolynesiaMap = ({ onIslandSelect }) => {
  const { t } = useTranslation()
  const { discoverTours = [] } = useTours()
  const [hoveredIsland, setHoveredIsland] = useState(null)
  const [selectedIsland, setSelectedIsland] = useState(null)

  // Calculate tour counts per island
  const islandTourCounts = useMemo(() => {
    const counts = {}
    ISLAND_DATA.forEach(island => {
      counts[island.id] = discoverTours.filter(tour => tour.location === island.id).length
    })
    counts['all'] = discoverTours.length
    return counts
  }, [discoverTours])

  // Calculate urgent tours per island
  const islandUrgentCounts = useMemo(() => {
    const counts = {}
    ISLAND_DATA.forEach(island => {
      counts[island.id] = discoverTours.filter(tour => 
        tour.location === island.id && tour.hours_until_deadline && tour.hours_until_deadline < 8
      ).length
    })
    return counts
  }, [discoverTours])

  const handleIslandClick = (island) => {
    const tourCount = islandTourCounts[island.id] || 0
    setSelectedIsland(island.id)
    
    if (tourCount > 0) {
      onIslandSelect(island.id)
    }
    // If no tours, just show the island info (coming soon effect)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {t('discovery.title')}
        </h1>
        <p className="text-slate-400 text-lg">
          {t('discovery.mapSubtitle', 'Choose your paradise island')}
        </p>
      </div>

      {/* Map Container */}
      <div className="relative bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-2xl p-8 border border-slate-700/50">
        {/* SVG Map */}
        <svg
          viewBox="0 0 500 400"
          className="w-full h-auto max-h-96"
          style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
        >
          {/* Background ocean gradient */}
          <defs>
            <radialGradient id="oceanGradient" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#0891b2" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.3" />
            </radialGradient>
            
            {/* Island glow effects */}
            <filter id="islandGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
          </defs>

          {/* Ocean background */}
          <rect width="500" height="400" fill="url(#oceanGradient)" rx="12" />

          {/* Archipelago labels */}
          <text x="250" y="40" className="fill-slate-400 text-sm font-medium" textAnchor="middle">
            Marquesas Islands
          </text>
          <text x="180" y="140" className="fill-slate-400 text-sm font-medium" textAnchor="middle">
            Tuamotu Atolls
          </text>
          <text x="250" y="320" className="fill-slate-400 text-sm font-medium" textAnchor="middle">
            Society Islands
          </text>

          {/* Islands */}
          {ISLAND_DATA.map((island) => {
            const tourCount = islandTourCounts[island.id] || 0
            const urgentCount = islandUrgentCounts[island.id] || 0
            const isHovered = hoveredIsland === island.id
            const isSelected = selectedIsland === island.id
            const hasActiveTours = tourCount > 0

            const baseSize = island.size === 'large' ? 16 : island.size === 'medium' ? 12 : 10
            const size = isHovered ? baseSize * 1.2 : baseSize

            return (
              <g key={island.id}>
                {/* Island dot */}
                <circle
                  cx={island.position.x}
                  cy={island.position.y}
                  r={size}
                  fill={hasActiveTours ? '#10b981' : '#64748b'}
                  stroke={isHovered || isSelected ? '#3b82f6' : hasActiveTours ? '#065f46' : '#374151'}
                  strokeWidth={isHovered || isSelected ? 3 : 2}
                  className={`cursor-pointer transition-all duration-300 ${
                    hasActiveTours ? 'animate-pulse' : ''
                  }`}
                  filter={hasActiveTours ? 'url(#islandGlow)' : 'none'}
                  onMouseEnter={() => setHoveredIsland(island.id)}
                  onMouseLeave={() => setHoveredIsland(null)}
                  onClick={() => handleIslandClick(island)}
                />

                {/* Active tours indicator */}
                {hasActiveTours && (
                  <circle
                    cx={island.position.x + 8}
                    cy={island.position.y - 8}
                    r={4}
                    fill="#f59e0b"
                    stroke="#ffffff"
                    strokeWidth={1}
                    className="animate-bounce"
                  />
                )}

                {/* Urgent indicator */}
                {urgentCount > 0 && (
                  <circle
                    cx={island.position.x - 8}
                    cy={island.position.y - 8}
                    r={3}
                    fill="#ef4444"
                    className="animate-ping"
                  />
                )}
              </g>
            )
          })}
        </svg>

        {/* Island Tooltip/Info Panel */}
        {hoveredIsland && (
          <IslandInfoPanel
            island={ISLAND_DATA.find(i => i.id === hoveredIsland)}
            tourCount={islandTourCounts[hoveredIsland]}
            urgentCount={islandUrgentCounts[hoveredIsland]}
            position="floating"
          />
        )}
      </div>

      {/* Selected Island Details */}
      {selectedIsland && (
        <div className="mt-6">
          <IslandInfoPanel
            island={ISLAND_DATA.find(i => i.id === selectedIsland)}
            tourCount={islandTourCounts[selectedIsland]}
            urgentCount={islandUrgentCounts[selectedIsland]}
            position="fixed"
            onExplore={() => onIslandSelect(selectedIsland)}
          />
        </div>
      )}

      {/* Map Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span>{t('discovery.mapLegend.available', 'Tours available')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
          <span>{t('discovery.mapLegend.comingSoon', 'Coming soon')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
          <span>{t('discovery.mapLegend.urgent', 'Urgent deals')}</span>
        </div>
      </div>
    </div>
  )
}

// Island Info Panel Component
const IslandInfoPanel = ({ 
  island, 
  tourCount = 0, 
  urgentCount = 0, 
  position = 'floating',
  onExplore 
}) => {
  const { t } = useTranslation()
  const hasActiveTours = tourCount > 0

  const panelClass = position === 'floating' 
    ? 'absolute top-4 right-4 max-w-xs bg-slate-800/95 backdrop-blur-sm rounded-xl p-4 border border-slate-600 shadow-xl z-10'
    : 'bg-slate-800 rounded-xl p-6 border border-slate-700'

  return (
    <div className={panelClass}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{island.emoji}</span>
        <div>
          <h3 className="font-semibold text-white">{t(island.nameKey)}</h3>
          <p className="text-xs text-slate-400">{island.archipelago} Islands</p>
        </div>
      </div>

      {hasActiveTours ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">{tourCount} tours available</span>
            {urgentCount > 0 && (
              <span className="flex items-center gap-1 text-orange-400">
                <Zap className="w-3 h-3" />
                {urgentCount} urgent
              </span>
            )}
          </div>
          
          {position === 'fixed' && onExplore && (
            <button
              onClick={onExplore}
              className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg 
                       transition-colors font-medium flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              {t('discovery.exploreIsland', 'Explore {{island}}', { island: t(island.nameKey) })}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-sm text-slate-400 mb-2">
            {t('discovery.comingSoon', 'Coming soon')}
          </div>
          <div className="text-xs text-slate-500">
            {t('discovery.comingSoonDesc', 'Amazing tours are being prepared for this island')}
          </div>
          
          {position === 'fixed' && (
            <button
              className="w-full mt-3 bg-slate-700 text-slate-300 py-2 px-4 rounded-lg 
                       cursor-not-allowed flex items-center justify-center gap-2"
              disabled
            >
              <Clock className="w-4 h-4" />
              {t('discovery.notifyMe', 'Notify me when available')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default FrenchPolynesiaMap