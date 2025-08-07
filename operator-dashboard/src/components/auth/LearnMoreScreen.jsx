// src/components/auth/LearnMoreScreen.jsx
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  ArrowLeft, 
  DollarSign, 
  Zap, 
  Target, 
  MessageCircle,
  Clock,
  TrendingUp,
  Users,
  Star,
  ExternalLink
} from 'lucide-react'
import VAILogo from '../VAILogo'
import LanguageDropdown from '../LanguageDropdown'

const LearnMoreScreen = ({ onBack, onGetAccess, campaignSource }) => {
  const { t } = useTranslation()

  // Track page view
  useEffect(() => {
    // Get URL parameters for tracking
    const urlParams = new URLSearchParams(window.location.search)
    const source = urlParams.get('utm_source') || urlParams.get('source') || 'direct'
    const medium = urlParams.get('utm_medium') || urlParams.get('medium') || 'organic'
    const campaign = urlParams.get('utm_campaign') || urlParams.get('campaign') || campaignSource || 'learn-more'
    const content = urlParams.get('utm_content') || urlParams.get('content') || 'default'

    // Track with Facebook Pixel and Google Analytics
    if (typeof window !== 'undefined') {
      // Facebook Pixel tracking
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'ViewContent', {
          content_type: 'learn_more_screen',
          campaign_source: source,
          campaign_medium: medium,
          campaign_name: campaign,
          campaign_content: content
        })
      }

      // Google Analytics tracking
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'learn_more_viewed', {
          campaign_source: source,
          campaign_medium: medium,
          campaign_name: campaign,
          campaign_content: content,
          page_title: 'VAI Operator Learn More',
          page_location: window.location.href
        })
      }

      // Console log for debugging
      console.log('📊 Learn More Screen Tracking:', {
        source,
        medium,
        campaign,
        content,
        url: window.location.href
      })
    }
  }, [campaignSource])

  const handleGetAccess = () => {
    // Track CTA click
    const urlParams = new URLSearchParams(window.location.search)
    const source = urlParams.get('utm_source') || 'direct'
    const campaign = urlParams.get('utm_campaign') || campaignSource || 'learn-more'

    if (typeof window !== 'undefined') {
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Lead', {
          content_type: 'get_access_click',
          campaign_source: source,
          campaign_name: campaign
        })
      }

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'cta_clicked', {
          campaign_source: source,
          campaign_name: campaign,
          cta_type: 'get_access'
        })
      }
    }

    onGetAccess()
  }

  const handleLearnMore = () => {
    // Track external link click
    const urlParams = new URLSearchParams(window.location.search)
    const source = urlParams.get('utm_source') || 'direct'
    const campaign = urlParams.get('utm_campaign') || campaignSource || 'learn-more'

    if (typeof window !== 'undefined') {
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Lead', {
          content_type: 'learn_more_click',
          campaign_source: source,
          campaign_name: campaign
        })
      }

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'cta_clicked', {
          campaign_source: source,
          campaign_name: campaign,
          cta_type: 'learn_more_external'
        })
      }
    }

    // Open operator welcome page
    window.open('https://vai.studio/app/operator-welcome/', '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {/* Left side - Back button and branding */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <VAILogo size="sm" />
            <div>
              <p className="text-slate-300">{t('learnMore.subtitle')}</p>
            </div>
          </div>
          
          {/* Right side - Language switcher */}
          <div className="flex-shrink-0">
            <LanguageDropdown />
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl p-8 mb-8 border border-blue-500/30">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
            {t('learnMore.hero.title')}
          </h2>
          <p className="text-xl text-slate-300 text-center mb-6">
            {t('learnMore.hero.subtitle')}
          </p>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-lg font-semibold">
              <Star className="w-5 h-5" />
              {t('learnMore.hero.commission')}
            </span>
          </div>
        </div>

        {/* Three Value Propositions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Revenue Recovery */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-orange-500/50 transition-all">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              {t('learnMore.valueProp.revenue.title')}
            </h3>
            <p className="text-slate-300 mb-4">
              {t('learnMore.valueProp.revenue.description')}
            </p>
            <div className="text-orange-400 text-sm font-medium">
              {t('learnMore.valueProp.revenue.benefit')}
            </div>
          </div>

          {/* Instant Discovery */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              {t('learnMore.valueProp.instant.title')}
            </h3>
            <p className="text-slate-300 mb-4">
              {t('learnMore.valueProp.instant.description')}
            </p>
            <div className="text-blue-400 text-sm font-medium">
              {t('learnMore.valueProp.instant.benefit')}
            </div>
          </div>

          {/* Mood-Based Matching */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              {t('learnMore.valueProp.mood.title')}
            </h3>
            <p className="text-slate-300 mb-4">
              {t('learnMore.valueProp.mood.description')}
            </p>
            <div className="text-purple-400 text-sm font-medium">
              {t('learnMore.valueProp.mood.benefit')}
            </div>
          </div>
        </div>

        {/* Key Benefits Grid */}
        <div className="bg-slate-800/30 rounded-xl p-6 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            {t('learnMore.benefits.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">{t('learnMore.benefits.commission.title')}</h4>
                <p className="text-slate-300 text-sm">{t('learnMore.benefits.commission.description')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Clock className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">{t('learnMore.benefits.noSetup.title')}</h4>
                <p className="text-slate-300 text-sm">{t('learnMore.benefits.noSetup.description')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <MessageCircle className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">{t('learnMore.benefits.liveChat.title')}</h4>
                <p className="text-slate-300 text-sm">{t('learnMore.benefits.liveChat.description')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Users className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">{t('learnMore.benefits.realTime.title')}</h4>
                <p className="text-slate-300 text-sm">{t('learnMore.benefits.realTime.description')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-8 border border-green-500/30 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            {t('learnMore.cta.title')}
          </h3>
          <p className="text-slate-300 mb-6">
            {t('learnMore.cta.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetAccess}
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
            >
              <Star className="w-5 h-5" />
              {t('learnMore.cta.getAccess')}
            </button>
            
            <button
              onClick={handleLearnMore}
              className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-6 rounded-lg transition-colors border border-slate-600"
            >
              <ExternalLink className="w-4 h-4" />
              {t('learnMore.cta.learnMore')}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-slate-700">
          <p className="text-slate-500 text-sm">
            {t('learnMore.footer.madeIn')} ❤️ {t('learnMore.footer.polynesia')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default LearnMoreScreen