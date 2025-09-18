// src/components/templates/TemplatePage.jsx
// New component to handle template deep links

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { templateService } from '../../services/templateService'
import TemplateDetailPage from './TemplateDetailPage'
import { useAppStore } from '../../stores/bookingStore'
import { RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

const TemplatePage = () => {
  const { templateId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [templateWithAvailability, setTemplateWithAvailability] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch template data based on URL parameter
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) {
        setError('Template ID not provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Fetch template with availability data
        const templateData = await templateService.getTemplateWithAvailability(templateId)

        if (!templateData || !templateData.template) {
          setError('Template not found or no longer available')
          return
        }

        setTemplateWithAvailability(templateData)

        // Update page title for SEO
        document.title = `${templateData.template.tour_name} - VAI Tickets`

      } catch (err) {
        console.error('Unexpected error:', err)
        setError('Failed to load activity details')
      } finally {
        setLoading(false)
      }
    }

    fetchTemplate()
  }, [templateId])

  // Handle back navigation - navigate back to app
  const handleBack = () => {
    navigate('/')
  }

  // Handle instance selection from template calendar
  const handleInstanceSelect = (selectedInstance) => {
    // Navigate to main app with booking parameter
    navigate(`/?bookTour=${selectedInstance.id}`)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-ui-surface-overlay flex items-center justify-center">
        <div className="flex items-center gap-3 text-ui-text-secondary">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="text-lg">{t('common.loading')}</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-ui-surface-overlay flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-ui-text-primary mb-4">
            {t('errors.activityNotAvailable', 'Activity Not Available')}
          </h1>
          <p className="text-ui-text-secondary mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="vai-button-primary px-6 py-3 rounded-lg transition-colors"
          >
            {t('discovery.browseAllTours')}
          </button>
        </div>
      </div>
    )
  }

  // Render TemplateDetailPage in full-screen mode
  return (
    <div className="min-h-screen bg-ui-surface-overlay">
      {templateWithAvailability && (
        <TemplateDetailPage
          template={{
            ...templateWithAvailability.template,
            is_template: true,
            template_id: templateId
          }}
          templateWithAvailability={templateWithAvailability}
          onBack={handleBack}
          onInstanceSelect={handleInstanceSelect}
        />
      )}
    </div>
  )
}

export default TemplatePage