// src/components/operator/OperatorProfilePage.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Share2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { operatorService } from '../../services/operatorService'
import { useOperatorDisplay } from '../../hooks/useOperatorDisplay'

// Website-style components
import WebsiteNavbar from './website/WebsiteNavbar'
import WebsiteHero from './website/WebsiteHero'
import WebsiteTours from './website/WebsiteTours'
import WebsiteAbout from './website/WebsiteAbout'
import WebsiteContact from './website/WebsiteContact'
import WebsiteFooter from './website/WebsiteFooter'

// Old app-style components (keeping as backup)
import OperatorHero from './sections/OperatorHero'
import OperatorTrust from './sections/OperatorTrust'
import OperatorAbout from './sections/OperatorAbout'
import OperatorStats from './sections/OperatorStats'
import OperatorServices from './sections/OperatorServices'
import OperatorContact from './sections/OperatorContact'
import OperatorShare from './sections/OperatorShare'

const OperatorProfilePage = () => {
  const { operatorSlug } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [operator, setOperator] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Use our custom display logic hook
  const {
    visibleSections,
    shouldShow,
    isNewOperator,
    contactMethods,
    activityStats
  } = useOperatorDisplay(operator)

  // Load operator data
  useEffect(() => {
    const loadOperator = async () => {
      if (!operatorSlug) {
        setError('No operator specified')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const operatorData = await operatorService.getOperatorBySlug(operatorSlug)

        if (!operatorData) {
          setError('Operator not found')
          setLoading(false)
          return
        }

        setOperator(operatorData)
        setError(null)
      } catch (err) {
        console.error('Error loading operator:', err)
        setError('Failed to load operator profile')
      } finally {
        setLoading(false)
      }
    }

    loadOperator()
  }, [operatorSlug])

  // Handle share functionality
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/profile/${operatorSlug}`
    const shareData = {
      title: `${operator.company_name} - ${t('operatorProfile.shareTitle')}`,
      text: `${t('operatorProfile.shareText', { name: operator.company_name, island: operator.island })}`,
      url: shareUrl
    }

    // Detect if device is mobile/touch device
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)

    try {
      // On mobile: prefer native share, fallback to copy
      if (isMobile && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        // On desktop or mobile fallback: always copy to clipboard
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(shareUrl)
          toast.success(t('operatorProfile.linkCopied'))
        } else {
          // Fallback for insecure contexts
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
          toast.success(t('operatorProfile.linkCopied'))
        }
      }
    } catch (error) {
      console.error('Error sharing:', error)
      toast.error(t('operatorProfile.shareFailed'))
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-ui-surface-overlay">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-ui-surface-secondary rounded-lg w-1/3"></div>
            <div className="h-32 bg-ui-surface-secondary rounded-xl"></div>
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

  // Error state
  if (error || !operator) {
    return (
      <div className="min-h-screen bg-ui-surface-overlay flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-xl font-semibold text-ui-text-primary mb-2">
            {t('operatorProfile.notFound')}
          </h2>
          <p className="text-ui-text-secondary mb-4">
            {error || t('operatorProfile.notFoundDescription')}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-interactive-primary hover:bg-interactive-primary-hover text-ui-text-primary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </button>
        </div>
      </div>
    )
  }

  // Generate meta description
  const metaDescription = operator.business_description?.slice(0, 160) ||
    t('operatorProfile.defaultMetaDescription', {
      name: operator.company_name,
      island: operator.island,
      tours: operator.total_tours_completed || 0
    })

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{t('operatorProfile.pageTitle', { name: operator.company_name, island: operator.island })}</title>
        <meta name="description" content={metaDescription} />

        {/* OpenGraph for social sharing */}
        <meta property="og:title" content={`${operator.company_name} - ${t('operatorProfile.ogTitle', { island: operator.island })}`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={operator.operator_logo || `${window.location.origin}/images/VAI Placeholder Cover Banner.png`} />
        <meta property="og:url" content={`${window.location.origin}/profile/${operatorSlug}`} />
        <meta property="og:type" content="business.business" />

        {/* Business-specific meta */}
        <meta property="business:contact_data:locality" content={operator.island} />
        <meta property="business:contact_data:country_name" content="French Polynesia" />

        {/* WhatsApp/social sharing */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${operator.company_name} - ${operator.island}`} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={operator.operator_logo || `${window.location.origin}/images/VAI Placeholder Cover Banner.png`} />

        {/* Additional SEO */}
        <link rel="canonical" href={`${window.location.origin}/profile/${operatorSlug}`} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* NEW WEBSITE-STYLE LAYOUT */}
      <div className="min-h-screen bg-ui-surface-primary">
        {/* Navigation Bar */}
        <WebsiteNavbar
          operator={operator}
          onShare={handleShare}
        />

        {/* Hero Section */}
        <WebsiteHero
          operator={operator}
          isNewOperator={isNewOperator}
          contactMethods={contactMethods}
        />

        {/* Tours/Activities Section */}
        {shouldShow('activities') && operator.activities && operator.activities.length > 0 && (
          <WebsiteTours
            operator={operator}
            activities={operator.activities}
          />
        )}

        {/* About Section */}
        {shouldShow('about') && (
          <WebsiteAbout
            operator={operator}
            activityStats={activityStats}
            isNewOperator={isNewOperator}
          />
        )}

        {/* Contact Section */}
        {shouldShow('contact') && (
          <WebsiteContact
            operator={operator}
            contactMethods={contactMethods}
          />
        )}

        {/* Footer */}
        <WebsiteFooter operator={operator} />
      </div>
    </>
  )
}

export default OperatorProfilePage