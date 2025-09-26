// src/components/learn/LearnTab.jsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Play, BookOpen, Map, Users, Compass, ExternalLink, Clock, Grid, List } from 'lucide-react'
import YouTube from 'react-youtube'

const LearnTab = () => {
  const { t } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState('featured')
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [playerReady, setPlayerReady] = useState(false)
  const [playerError, setPlayerError] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'grid'

  // Set responsive default view mode
  useEffect(() => {
    const handleResize = () => {
      const isLargeScreen = window.innerWidth >= 768 // md breakpoint
      setViewMode(isLargeScreen ? 'grid' : 'list')
    }

    // Set initial view mode
    handleResize()

    // Listen for window resize
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Sample educational content - in a real app, this would come from a CMS or API
  const educationalContent = {
    featured: [
      {
        id: 'tahiti-overview',
        title: 'Welcome to French Polynesia',
        titleFr: 'Bienvenue en Polynésie Française',
        description: 'An introduction to the islands, culture, and what makes this destination special',
        descriptionFr: 'Une introduction aux îles, à la culture et à ce qui rend cette destination spéciale',
        videoId: 'Gy8xsnLUyNY', // Tahiti Tourism official video
        duration: '1:30',
        category: 'islands',
        isNew: true
      },
      
      {
        id: 'tahiti-inclusive-tourism',
        title: 'Inclusive and sustainable tourism',
        titleFr: 'Tourisme inclusif et durable',
        description: 'Towards an inclusive and sustainable tourism in The Islands of Tahiti',
        descriptionFr: 'Vers un tourisme inclusif et durable dans les îles de Tahiti',
        videoId: 'bPwPU-pL9-k', // Tahiti Tourism Inclusive official video
        duration: '4:12',
        category: 'culture',
        isNew: true
      },

      {
        id: 'tahiti-sustainable-tourism',
        title: 'Global Sustainable Tourism',
        titleFr: 'Tourisme Durable Mondial',
        description: 'Travel Redefined: Tourism for People and Planet.',
        descriptionFr: 'Le voyage redéfini : le tourisme au service des personnes et de la planète.',
        videoId: 'nCmYf-QPKp8', // Tahiti Sustainable Tourism
        duration: '3:23',
        category: 'culture',
        isNew: true
      },

      {
        id: 'tahitian-culture',
        title: 'Tahitian Culture & Traditions',
        titleFr: 'Culture et Traditions Tahitiennes',
        description: 'Learn about Polynesian culture, traditions, and way of life',
        descriptionFr: 'Découvrez la culture polynésienne, les traditions et le mode de vie',
        videoId: 'yDgUC1vAIEc', // Cultural video
        duration: '1:46',
        category: 'culture',
        isPopular: true
      }
    ],
    islands: [
      
      {
        id: 'bora-bora-guide',
        title: 'Bora Bora: The Pearl of the Pacific',
        titleFr: 'Bora Bora : La Perle du Pacifique',
        description: 'Discover the most famous island of French Polynesia',
        descriptionFr: 'Découvrez l\'île la plus célèbre de Polynésie française',
        videoId: '7c4Jg3D_oSE',
        duration: '0:16',
        category: 'islands'
      },
      {
        id: 'moorea-magic',
        title: 'Moorea: Sister Island of Tahiti',
        titleFr: 'Moorea : Île Sœur de Tahiti',
        description: 'Explore the magical landscapes of Moorea',
        descriptionFr: 'Explorez les paysages magiques de Moorea',
        videoId: 'zT1Br9rObrQ',
        duration: '0:15',
        category: 'islands'
      },
      {
        id: 'huahine-life',
        title: 'Huahine: Discover the life below',
        titleFr: 'Huahine : Découvrez la vie en dessous',
        description: 'Covered in a thick jungle, the island of Huahine is surrounded by the deepest of blue waters making it a very beautiful diving destination. ',
        descriptionFr: 'Recouverte d\'une épaisse jungle, l\'île de Huahine est entourée des eaux les plus profondes, ce qui en fait une destination de plongée très belle.',
        videoId: 'v5XkDf2jsBc',
        duration: '0:15',
        category: 'islands'
      },
      {
        id: 'island-guide',
        title: 'Discover The Islands of Tahiti',
        titleFr: 'Découvrez Les Îles de Tahiti',
        description: 'Explore The Islands of Tahiti : 5 archipelagos, 118 islands',
        descriptionFr: 'Explorez Les Îles de Tahiti : 5 archipels, 118 îles',
        videoId: 'bPPUMZekJe8',
        duration: '3:07',
        category: 'islands'
      },
    ],
    culture: [
      {
        id: 'tahitian-dance',
        title: 'Traditional Tahitian Dance',
        titleFr: 'Danse Traditionnelle Tahitienne',
        description: 'The story and meaning behind Tahitian dance',
        descriptionFr: 'L\'histoire et la signification de la danse tahitienne',
        videoId: 'zvFKm2gGl4w',
        duration: '1:48',
        category: 'culture'
      },
      {
        id: 'polynesian-donations',
        title: 'Support sustainable initiatives',
        titleFr: 'Soutenir les initiatives durables',
        description: 'This participatory tool directly funds four sustainable tourism projects, carefully selected to address the social, economic, cultural, and environmental challenges of our destination.',
        descriptionFr: 'Cet outil participatif finance directement quatre projets de tourisme durable, soigneusement sélectionnés pour répondre aux enjeux sociaux, économiques, culturels et environnementaux de notre destination.',
        videoId: 'B2Z1H_LT0UM',
        duration: '1:00',
        category: 'culture'
      },

      {
        id: 'polynesian-legends',
        title: 'Polynesian Legends & Mythology',
        titleFr: 'Légendes et Mythologie Polynésiennes',
        description: 'Ancient stories and beliefs of the Polynesian people',
        descriptionFr: 'Histoires anciennes et croyances du peuple polynésien',
        videoId: 'rVgD86zBRRM',
        duration: '4:45',
        category: 'culture'
      }
    ],
    activities: [
      {
        id: 'lagoon-activities',
        title: 'Lagoon Activities Guide',
        titleFr: 'Guide des Activités Lagonaires',
        description: 'Everything you need to know about water activities',
        descriptionFr: 'Tout ce que vous devez savoir sur les activités aquatiques',
        videoId: '9pYuEa2OkWs',
        duration: '5:30',
        category: 'activities'
      }
    ],
    tips: [
      {
        id: 'travel-etiquette',
        title: 'Respectful Tourism in French Polynesia',
        titleFr: 'Tourisme Respectueux en Polynésie Française',
        description: 'How to be a responsible and respectful visitor',
        descriptionFr: 'Comment être un visiteur responsable et respectueux',
        videoId: '1WZDlUpwkaM',
        duration: '0:59',
        category: 'tips'
      },

      {
        id: 'packing-tips',
        title: 'What to Pack for French Polynesia',
        titleFr: 'Que Prendre pour la Polynésie Française',
        description: 'Essential items and packing tips for your trip',
        descriptionFr: 'Articles essentiels et conseils pour votre voyage',
        videoId: 'TcLMBuLMhIo',
        duration: '4:20',
        category: 'tips'
      }
    ]
  }

  const categories = [
    { id: 'featured', icon: BookOpen, label: t('learn.sections.featured') },
    { id: 'islands', icon: Map, label: t('learn.sections.islands') },
    { id: 'culture', icon: Users, label: t('learn.sections.culture') },
    { id: 'activities', icon: Compass, label: t('learn.sections.activities') },
    { id: 'tips', icon: ExternalLink, label: t('learn.sections.tips') }
  ]

  const getCurrentContent = () => {
    if (selectedCategory === 'featured') {
      return educationalContent.featured
    }
    return educationalContent[selectedCategory] || []
  }

  const openVideo = (video) => {
    setSelectedVideo(video)
  }

  const closeVideo = () => {
    setSelectedVideo(null)
    setPlayerReady(false)
    setPlayerError(null)
  }

  // YouTube player event handlers
  const onPlayerReady = (event) => {
    setPlayerReady(true)
    setPlayerError(null)
  }

  const onPlayerError = (event) => {
    setPlayerError(event.data)
    console.error('YouTube player error:', event.data)
  }

  const onPlayerStateChange = (event) => {
    // Handle player state changes if needed
    // YouTube.PlayerState.ENDED, PLAYING, PAUSED, etc.
  }

  // YouTube player options
  const getYouTubeOptions = () => ({
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      rel: 0,
      modestbranding: 1,
      fs: 1,
      cc_load_policy: 1,
      iv_load_policy: 3,
      autohide: 0,
    },
  })

  const getVideoTitle = (video, language) => {
    return language === 'fr' ? (video.titleFr || video.title) : video.title
  }

  const getVideoDescription = (video, language) => {
    return language === 'fr' ? (video.descriptionFr || video.description) : video.description
  }

  const toggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'grid' : 'list')
  }

  return (
    <div className="min-h-screen bg-ui-surface-overlay pt-4 pb-20">
      {/* Header */}
      <div className="px-4 mb-6">
        <div className="bg-ui-surface-secondary/50 backdrop-blur-sm rounded-xl p-6 border border-ui-border-primary relative overflow-hidden">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage: 'url(/images/pattern-3-tahiti-tourism.svg)',
              backgroundSize: 'auto 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-interactive-primary/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-interactive-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-ui-text-primary">
                    {t('learn.title')}
                  </h1>
                  <p className="text-ui-text-secondary">
                    {t('learn.subtitle')}
                  </p>
                </div>
              </div>

              {/* View Toggle */}
              <div className="hidden md:flex bg-ui-surface-primary/50 rounded-lg p-1">
                <button
                  onClick={toggleViewMode}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-interactive-primary text-ui-text-primary shadow-sm'
                      : 'text-ui-text-secondary hover:text-ui-text-primary'
                  }`}
                  title={t('ui.viewTitles.listView')}
                >
                  <List size={18} />
                </button>
                <button
                  onClick={toggleViewMode}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-interactive-primary text-ui-text-primary shadow-sm'
                      : 'text-ui-text-secondary hover:text-ui-text-primary'
                  }`}
                  title={t('ui.viewTitles.gridView')}
                >
                  <Grid size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="px-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = selectedCategory === category.id

            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
                  isActive
                    ? 'bg-interactive-primary text-ui-text-primary shadow-sm'
                    : 'bg-ui-surface-secondary text-ui-text-secondary hover:bg-ui-surface-secondary/70 border border-ui-border-primary'
                }`}
              >
                <Icon size={16} />
                <span>{category.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {getCurrentContent().length > 0 ? (
          <div className={`grid gap-4 ${
            viewMode === 'grid'
              ? 'md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}>
            {getCurrentContent().map((video) => (
              <div
                key={video.id}
                className="bg-ui-surface-secondary border border-ui-border-primary rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-video bg-ui-surface-primary/20">
                  <img
                    src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
                    alt={getVideoTitle(video, 'en')}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`
                    }}
                  />

                  {/* Play Button Overlay */}
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer group"
                    onClick={() => openVideo(video)}
                  >
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-white transition-colors shadow-lg">
                      <Play className="w-7 h-7 text-gray-800 ml-1" fill="currentColor" />
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {video.isNew && (
                      <span className="px-2 py-1 bg-status-success text-white text-xs font-semibold rounded">
                        {t('learn.content.newContent')}
                      </span>
                    )}
                    {video.isPopular && (
                      <span className="px-2 py-1 bg-interactive-primary text-white text-xs font-semibold rounded">
                        {t('learn.content.popular')}
                      </span>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white text-sm px-2 py-1 rounded flex items-center gap-1">
                    <Clock size={12} />
                    {video.duration}
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className={`font-semibold text-ui-text-primary mb-2 ${
                    viewMode === 'grid' ? 'text-sm md:text-base' : ''
                  }`}>
                    {getVideoTitle(video, 'en')}
                  </h3>
                  <p className={`text-sm text-ui-text-secondary mb-3 ${
                    viewMode === 'grid'
                      ? 'line-clamp-2 overflow-hidden'
                      : ''
                  }`}>
                    {getVideoDescription(video, 'en')}
                  </p>
                  <div className={`flex items-center justify-between text-xs text-ui-text-muted ${
                    viewMode === 'grid' ? 'flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-0' : ''
                  }`}>
                    <span>{t(`learn.categories.${video.category}`)}</span>
                    <span>{t('learn.content.watchTime', { duration: video.duration })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-ui-surface-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-ui-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-ui-text-primary mb-2">
              {t('learn.empty.title')}
            </h3>
            <p className="text-ui-text-secondary max-w-md mx-auto">
              {t('learn.empty.message')}
            </p>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-ui-surface-secondary rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh]">
            {/* Header */}
            <div className="p-4 border-b border-ui-border-primary flex items-center justify-between">
              <h3 className="font-semibold text-ui-text-primary">
                {getVideoTitle(selectedVideo, 'en')}
              </h3>
              <button
                onClick={closeVideo}
                className="p-2 hover:bg-ui-surface-primary rounded-lg transition-colors"
              >
                <span className="text-ui-text-secondary text-lg">×</span>
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-video relative">
              {playerError && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <div className="text-center text-white">
                    <p className="mb-2">{t('learn.videoPlayer.error')}</p>
                    <button
                      onClick={() => setPlayerError(null)}
                      className="px-4 py-2 bg-interactive-primary rounded text-ui-text-primary"
                    >
                      {t('learn.videoPlayer.retry')}
                    </button>
                  </div>
                </div>
              )}

              {!playerReady && !playerError && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <div className="text-white">{t('learn.videoPlayer.loading')}</div>
                </div>
              )}

              <YouTube
                key={selectedVideo.videoId} // Force re-render for different videos
                videoId={selectedVideo.videoId}
                opts={getYouTubeOptions()}
                onReady={onPlayerReady}
                onError={onPlayerError}
                onStateChange={onPlayerStateChange}
                className="w-full h-full"
              />
            </div>

            {/* Video Description */}
            <div className="p-4">
              <p className="text-ui-text-secondary">
                {getVideoDescription(selectedVideo, 'en')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LearnTab