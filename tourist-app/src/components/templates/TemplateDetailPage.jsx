// src/components/templates/TemplateDetailPage.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Clock, Users, MapPin, Star, Calendar, Heart, Share2, Globe, Shield, Coffee, Car, Activity, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { templateService } from '../../services/templateService'
import { TOUR_TYPE_EMOJIS } from '../../constants/moods'
import CalendarView from './CalendarView'
import toast from 'react-hot-toast'

const TemplateDetailPage = ({ template, onBack, onInstanceSelect }) => {
  const { t } = useTranslation()
  const [templateWithAvailability, setTemplateWithAvailability] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [expandedLanguages, setExpandedLanguages] = useState(false)

  // Helper functions from TourDetailModal
  const getFormattedLanguages = (languages) => {
    if (!languages || !Array.isArray(languages)) return []
    const languageMap = {
      'English': '🇬🇧 English',
      'French': '🇫🇷 French',
      'Tahitian': '🇵🇫 Tahitian',
      'German': '🇩🇪 German',
      'Spanish': '🇪🇸 Spanish',
      'Chinese': '🇨🇳 Chinese',
      'Italian': '🇮🇹 Italian',
      'Japanese': '🇯🇵 Japanese',
      // Handle language codes
      'en': '🇬🇧 English',
      'fr': '🇫🇷 French',
      'de': '🇩🇪 German',
      'es': '🇪🇸 Spanish',
      'zh': '🇨🇳 Chinese',
      'ta': '🇵🇫 Tahitian',
      'it': '🇮🇹 Italian',
      'ja': '🇯🇵 Japanese',
      'ty': '🇵🇫 Tahitian'
    }

    // Filter out duplicates and format
    const uniqueLanguages = [...new Set(languages.map(lang => {
      const mappedLang = languageMap[lang]
      return mappedLang || `🗣️ ${lang}` // Fallback for unmapped languages
    }))]

    return uniqueLanguages
  }

  const formatAgeRequirements = (minAge, maxAge) => {
    if (minAge && maxAge) {
      return t('tourDetail.age.ageRange', { min: minAge, max: maxAge })
    } else if (minAge) {
      return t('tourDetail.age.minimumAge', { min: minAge })
    } else if (maxAge) {
      return t('tourDetail.age.maximumAge', { max: maxAge })
    }
    return t('tourDetail.age.suitableForAll')
  }

  const getFitnessDisplay = (level) => {
    const fitnessMap = {
      'easy': { label: t('tourDetail.fitness.easy'), color: 'text-status-success', icon: '😊' },
      'moderate': { label: t('tourDetail.fitness.moderate'), color: 'text-status-caution', icon: '🚶' },
      'challenging': { label: t('tourDetail.fitness.challenging'), color: 'text-status-warning', icon: '🏃' },
      'expert': { label: t('tourDetail.fitness.expert'), color: 'text-status-error', icon: '🏔️' }
    }
    return fitnessMap[level] || { label: t('tourDetail.fitness.tbd'), color: 'text-ui-text-secondary', icon: '❓' }
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/template/${template.template_id}`
    const shareData = {
      title: template.tour_name,
      text: `Check out this amazing activity: ${template.tour_name}`,
      url: shareUrl
    }

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(shareUrl)
          toast.success('Activity link copied to clipboard!')
        } else {
          const textArea = document.createElement('textarea')
          textArea.value = shareUrl
          textArea.style.position = 'fixed'
          textArea.style.left = '-999999px'
          textArea.style.top = '-999999px'
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          toast.success(t('tourCard.share.copylink'))
        }
      }
    } catch (error) {
      console.error('Error sharing:', error)
      toast.success(t('tourCard.share.copylink'))
    }
  }

  // Load template details with availability
  useEffect(() => {
    const loadTemplateDetails = async () => {
      if (!template?.template_id) return

      setLoading(true)
      try {
        const data = await templateService.getTemplateWithAvailability(template.template_id)
        setTemplateWithAvailability(data)
      } catch (error) {
        console.error('Error loading template details:', error)
        toast.error(t('templates.loadError', 'Failed to load activity details'))
      } finally {
        setLoading(false)
      }
    }

    loadTemplateDetails()
  }, [template?.template_id, t])

  if (loading) {
    return (
      <div className="min-h-screen bg-ui-surface-overlay">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-ui-surface-secondary rounded-lg w-1/3"></div>
            <div className="h-48 bg-ui-surface-secondary rounded-xl"></div>
            <div className="space-y-4">
              <div className="h-6 bg-ui-surface-secondary rounded w-3/4"></div>
              <div className="h-4 bg-ui-surface-secondary rounded w-full"></div>
              <div className="h-4 bg-ui-surface-secondary rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!templateWithAvailability) {
    return (
      <div className="min-h-screen bg-ui-surface-overlay flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-ui-text-primary mb-2">
            {t('templates.notFound', 'Activity not found')}
          </h2>
          <button
            onClick={onBack}
            className="text-interactive-primary hover:text-interactive-primary-hover"
          >
            {t('common.back', 'Back')}
          </button>
        </div>
      </div>
    )
  }

  const { template: templateDetails, instances, availability } = templateWithAvailability
  const tourEmoji = TOUR_TYPE_EMOJIS[templateDetails.tour_type] || '🌴'
  const fitness = getFitnessDisplay(templateDetails.fitness_level)

  return (
    <div className="min-h-screen bg-ui-surface-overlay">
      {/* Cover Image */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-interactive-primary/20 to-mood-luxury/20 border-b border-ui-border-primary overflow-hidden">
        {/* Cover Image with Fallback */}
        <img
          src={templateDetails.template_cover_image || '/images/VAI Banner Cover_Placeholder1.png'}
          alt={templateDetails.tour_name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            // Fallback to placeholder image if custom image fails to load
            if (e.target.src !== '/images/VAI Banner Cover_Placeholder1.png') {
              e.target.src = '/images/VAI Banner Cover_Placeholder1.png'
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="absolute top-4 left-4">
          <button
            onClick={onBack}
            className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleShare}
            className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
            title={t('templates.shareActivity')}
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>
          <button
            className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-colors"
            title={t('templates.addToFavorites')}
          >
            <Heart className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                {templateDetails.tour_name}
              </h1>
              <p className="text-white/80 text-sm">
                {templateDetails.operator_name || t('templates.premiumOperator')} • 📍 {templateDetails.location}
              </p>
              <div className="flex items-center gap-3 mt-1">
                {templateDetails.average_rating && (
                  <div className="flex items-center gap-1 text-white/90">
                    <Star className="w-4 h-4 fill-current text-yellow-400" />
                    <span className="font-medium">{templateDetails.average_rating}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-white/80">
                  <span className={`w-2 h-2 rounded-full ${fitness.color.includes('success') ? 'bg-green-400' : fitness.color.includes('caution') ? 'bg-yellow-400' : fitness.color.includes('warning') ? 'bg-orange-400' : 'bg-gray-400'}`}></span>
                  <span className="text-xs">{fitness.label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* Key Details Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DetailCard icon={Clock} label={t('tourDetail.details.duration')}>
            <div className="font-semibold">{templateDetails.duration_hours}h {t('templates.experience', 'experience')}</div>
            <div className="text-ui-text-secondary">{t('tourDetail.details.fullAdventure')}</div>
          </DetailCard>

          <DetailCard icon={Users} label={t('tourDetail.details.availability')}>
            <div className="font-semibold">{availability.total_spots} {t('tourDetail.details.spotsTotal')}</div>
            <div className="text-ui-text-secondary">{availability.instance_count} {t('templates.dates', 'dates')}</div>
          </DetailCard>

          <DetailCard icon={MapPin} label={t('tourDetail.details.fitnessLevel')}>
            <div className={`font-semibold ${fitness.color}`}>
              {fitness.icon} {fitness.label}
            </div>
            <div className="text-ui-text-secondary">{formatAgeRequirements(templateDetails.min_age, templateDetails.max_age)}</div>
          </DetailCard>

          {/* Languages Card - Expandable */}
          <div className="bg-ui-surface-secondary/50 rounded-lg p-4 border border-ui-border-primary hover:border-interactive-primary/30 transition-all duration-200">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-ui-text-muted" />
              <span className="text-xs font-medium text-ui-text-secondary uppercase tracking-wide">
                {t('tourDetail.details.languages')}
              </span>
            </div>
            <div className="space-y-1">
              {(() => {
                const allLanguages = getFormattedLanguages(templateDetails.languages)
                const displayLanguages = expandedLanguages ? allLanguages : allLanguages.slice(0, 2)
                const hasMore = allLanguages.length > 2

                return (
                  <>
                    <div className="font-semibold text-sm">
                      {displayLanguages.length > 0 ? displayLanguages.join(', ') : t('tourDetail.languages.tbd')}
                      {!expandedLanguages && hasMore && (
                        <span className="text-ui-text-muted"> +{allLanguages.length - 2}</span>
                      )}
                    </div>
                    {hasMore && (
                      <button
                        onClick={() => setExpandedLanguages(!expandedLanguages)}
                        className="flex items-center gap-1 text-xs text-interactive-primary hover:text-interactive-primary-hover transition-colors"
                      >
                        {expandedLanguages ? (
                          <>
                            <ChevronUp className="w-3 h-3" />
                            {t('common.showLess', 'Show less')}
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3 h-3" />
                            {t('common.showAll', 'Show all')}
                          </>
                        )}
                      </button>
                    )}
                    <div className="text-ui-text-secondary text-xs">{t('templates.multiLanguage')}</div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>

        {/* Template Overview */}
        <div className="bg-ui-surface-secondary/50 rounded-xl p-4 sm:p-6 border border-ui-border-primary">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Main Info */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-ui-text-primary mb-2">
                  {t('tourDetail.sections.aboutExperience', 'About This Experience')}
                </h2>
                <p className="text-ui-text-secondary leading-relaxed">
                  {templateDetails.description || t('templates.noDescription', 'This amazing activity offers an authentic French Polynesian experience. Description will be provided upon booking confirmation.')}
                </p>
              </div>

              {/* Operator Section */}
              <div className="bg-ui-surface-primary/50 rounded-lg p-4 border border-ui-border-primary">
                <h3 className="text-md font-semibold text-ui-text-primary mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {t('templates.operatorInfo', 'Operator Information')}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-interactive-primary/20 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold">{(templateDetails.operator_name || 'OP').substring(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                      <div className="font-medium text-ui-text-primary">{templateDetails.operator_name || t('templates.premiumLocalOperator')}</div>
                      <div className="text-sm text-ui-text-secondary">{t('templates.licensedOperator')}</div>
                    </div>
                  </div>
                  {templateDetails.operator_total_tours_completed && (
                    <div className="text-sm text-ui-text-secondary">
                      {templateDetails.operator_total_tours_completed} {t('tourDetail.details.toursCompleted')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing & Availability */}
            <div className="space-y-4">
              <div className="bg-ui-surface-primary rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-ui-text-primary">
                    {template.price_from?.toLocaleString()} XPF
                  </div>
                  <div className="text-sm text-ui-text-secondary">
                    {t('templates.fromPrice', 'from')} / {t('common.adults', 'adult')}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ui-text-secondary">{t('templates.available', 'Available')}</span>
                  <span className="text-ui-text-primary font-medium">
                    {availability.instance_count} {t('templates.dates', 'dates')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ui-text-secondary">{t('templates.totalSpots', 'Total spots')}</span>
                  <span className="text-ui-text-primary font-medium">
                    {availability.total_spots}
                  </span>
                </div>
                {availability.next_available && (
                  <div className="flex justify-between">
                    <span className="text-ui-text-secondary">{t('templates.nextDate', 'Next available')}</span>
                    <span className="text-ui-text-primary font-medium">
                      {new Date(availability.next_available).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowCalendar(true)}
                className="w-full bg-interactive-primary hover:bg-interactive-primary-hover text-ui-text-primary font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 touch-manipulation active:scale-[0.98]"
              >
                <Calendar className="w-5 h-5" />
                {t('templates.viewAvailability', 'View Availability')}
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        {(templateDetails.equipment_included || templateDetails.food_included || templateDetails.pickup_available) && (
          <div className="bg-ui-surface-secondary/50 rounded-xl p-4 sm:p-6 border border-ui-border-primary">
            <h3 className="text-lg font-semibold text-ui-text-primary mb-4">
              {t('templates.whatsIncluded', 'What\'s Included')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templateDetails.equipment_included && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-status-success rounded-full"></div>
                  <span className="text-ui-text-secondary text-sm">
                    {t('templates.equipment', 'Professional Equipment')}
                  </span>
                </div>
              )}
              {templateDetails.food_included && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-status-success rounded-full"></div>
                  <span className="text-ui-text-secondary text-sm">
                    {t('templates.food', 'Food & Refreshments')}
                  </span>
                </div>
              )}
              {templateDetails.pickup_available && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-status-success rounded-full"></div>
                  <span className="text-ui-text-secondary text-sm">
                    {t('templates.pickup', 'Hotel Pickup')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Important Information */}
        {(templateDetails.requirements || templateDetails.restrictions || templateDetails.special_notes || templateDetails.weather_dependent) && (
          <div className="bg-ui-surface-secondary/50 rounded-xl p-4 sm:p-6 border border-ui-border-primary">
            <h3 className="text-lg font-semibold text-ui-text-primary mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" />
              {t('templates.importantInfo', 'Important Information')}
            </h3>
            <div className="space-y-4">
              {templateDetails.requirements && (
                <div>
                  <h4 className="font-medium text-ui-text-primary mb-2">{t('templates.requirements', 'Requirements')}</h4>
                  <p className="text-ui-text-secondary text-sm">{templateDetails.requirements}</p>
                </div>
              )}
              {templateDetails.restrictions && (
                <div>
                  <h4 className="font-medium text-ui-text-primary mb-2">{t('templates.restrictions', 'Restrictions')}</h4>
                  <p className="text-ui-text-secondary text-sm">{templateDetails.restrictions}</p>
                </div>
              )}
              {templateDetails.weather_dependent && templateDetails.backup_plan && (
                <div>
                  <h4 className="font-medium text-ui-text-primary mb-2">{t('templates.weatherPolicy', 'Weather Policy')}</h4>
                  <p className="text-ui-text-secondary text-sm">
                    {t('templates.weatherDependent', 'This activity is weather dependent.')} {templateDetails.backup_plan}
                  </p>
                </div>
              )}
              {templateDetails.special_notes && (
                <div>
                  <h4 className="font-medium text-ui-text-primary mb-2">{t('templates.specialNotes', 'Special Notes')}</h4>
                  <p className="text-ui-text-secondary text-sm">{templateDetails.special_notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pickup Information */}
        {templateDetails.pickup_available && templateDetails.pickup_locations && templateDetails.pickup_locations.length > 0 && (
          <div className="bg-ui-surface-secondary/50 rounded-xl p-4 sm:p-6 border border-ui-border-primary">
            <h3 className="text-lg font-semibold text-ui-text-primary mb-4 flex items-center gap-2">
              <Car className="w-5 h-5" />
              {t('templates.pickupLocations', 'Pickup Locations')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {templateDetails.pickup_locations.map((location, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-ui-text-secondary">
                  <MapPin className="w-4 h-4 text-ui-text-muted" />
                  {location}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meeting Point */}
        {templateDetails.meeting_point && (
          <div className="bg-ui-surface-secondary/50 rounded-xl p-4 sm:p-6 border border-ui-border-primary">
            <h3 className="text-lg font-semibold text-ui-text-primary mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {t('templates.meetingPoint', 'Meeting Point')}
            </h3>
            <p className="text-ui-text-secondary">{templateDetails.meeting_point}</p>
            {templateDetails.meeting_point_gps && (
              <button
                onClick={() => window.open(`https://maps.google.com/?q=${templateDetails.meeting_point_gps}`, '_blank')}
                className="mt-2 text-interactive-primary hover:text-interactive-primary-hover text-sm transition-colors"
              >
                {t('templates.openInMaps', 'Open in Maps')}
              </button>
            )}
          </div>
        )}

        {/* Special Whale Watching Info */}
        {templateDetails.whale_regulation_compliant && (
          <div className="bg-status-success/10 rounded-xl p-4 sm:p-6 border border-status-success/20">
            <h3 className="text-lg font-semibold text-status-success mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {t('templates.whaleRegulation', 'Whale Watching Certified')}
            </h3>
            <p className="text-status-success-light text-sm mb-2">
              {t('templates.whaleCompliant', 'This operator follows official whale watching regulations for your safety and marine conservation.')}
            </p>
            {templateDetails.max_whale_group_size && (
              <p className="text-status-success-light text-sm">
                {t('templates.maxWhaleGroup', 'Maximum group size for whale encounters')}: {templateDetails.max_whale_group_size} {t('common.people', 'people')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Calendar Modal */}
      {showCalendar && (
        <CalendarView
          template={templateDetails}
          instances={instances}
          availability={availability}
          isOpen={showCalendar}
          onClose={() => setShowCalendar(false)}
          onInstanceSelect={onInstanceSelect}
        />
      )}
    </div>
  )
}

// DetailCard component similar to TourDetailModal
const DetailCard = ({ icon: Icon, label, children, highlight = false }) => (
  <div className={`bg-ui-surface-secondary/50 rounded-lg p-4 border transition-all duration-200 ${
    highlight
      ? 'border-status-warning bg-status-warning/10'
      : 'border-ui-border-primary hover:border-interactive-primary/30'
  }`}>
    <div className="flex items-center gap-2 mb-2">
      <Icon className={`w-4 h-4 ${highlight ? 'text-status-warning' : 'text-ui-text-muted'}`} />
      <span className={`text-xs font-medium ${highlight ? 'text-status-warning' : 'text-ui-text-secondary'} uppercase tracking-wide`}>
        {label}
      </span>
    </div>
    <div className="space-y-1">
      {children}
    </div>
  </div>
)

export default TemplateDetailPage