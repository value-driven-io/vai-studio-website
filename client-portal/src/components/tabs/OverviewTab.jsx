import { useTranslation } from 'react-i18next'
import { useClientStore } from '../../store/clientStore'
import { 
  Calendar, 
  MapPin, 
  Building, 
  DollarSign, 
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react'

const OverviewTab = () => {
  const { t } = useTranslation()
  const { clientData, proposalData } = useClientStore()

  if (!clientData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-vai-muted mx-auto mb-2" />
          <p className="text-vai-muted">{t('common.error')}</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount) => {
    if (!amount) return '0 F'
    return new Intl.NumberFormat('fr-PF', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' F'
  }

  const formatDate = (dateString) => {
    if (!dateString) return t('overview.date.not_defined')
    return new Date(dateString).toLocaleDateString(t('overview.date.locale'), {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-vai-bamboo'
      case 'active':
        return 'text-vai-coral'
      case 'proposal':
        return 'text-vai-sunset'
      default:
        return 'text-vai-muted'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return t('overview.status.completed')
      case 'active':
        return t('overview.status.active')
      case 'proposal':
        return t('overview.status.proposal')
      case 'paused':
        return t('overview.status.paused')
      case 'cancelled':
        return t('overview.status.cancelled')
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="vai-card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-vai-pearl mb-2">
              {t('overview.welcome', { clientName: clientData.company_name })}
            </h1>
            <p className="text-vai-muted">
              {t('overview.subtitle')}
            </p>
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            clientData.project_status === 'completed' ? 'vai-status-completed' :
            clientData.project_status === 'active' ? 'vai-status-current' :
            'vai-status-upcoming'
          }`}>
            <div className={`w-2 h-2 rounded-full ${getStatusColor(clientData.project_status)}`} />
            {getStatusLabel(clientData.project_status)}
          </div>
        </div>
      </div>

      {/* Configuration Status */}
      <div className="vai-card">
        <h2 className="text-xl font-semibold text-vai-pearl mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-vai-coral" />
          {t('overview.configuration.title')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${
              proposalData?.client_intake ? 'bg-vai-bamboo/20' : 'bg-vai-muted/20'
            }`}>
              <CheckCircle className={`w-8 h-8 ${
                proposalData?.client_intake ? 'text-vai-bamboo' : 'text-vai-muted'
              }`} />
            </div>
            <h3 className="font-semibold text-vai-pearl mb-1">{t('overview.configuration.profile_complete')}</h3>
            <p className="text-sm text-vai-muted">
              {proposalData?.client_intake ? 
                t('overview.configuration.profile_filled') : 
                t('overview.configuration.complete_profile')
              }
            </p>
          </div>
          
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${
              proposalData?.package_configuration ? 'bg-vai-bamboo/20' : 'bg-vai-muted/20'
            }`}>
              <CheckCircle className={`w-8 h-8 ${
                proposalData?.package_configuration ? 'text-vai-bamboo' : 'text-vai-muted'
              }`} />
            </div>
            <h3 className="font-semibold text-vai-pearl mb-1">{t('overview.configuration.package_configured')}</h3>
            <p className="text-sm text-vai-muted">
              {proposalData?.package_configuration ? 
                t('overview.configuration.services_selected') : 
                t('overview.configuration.choose_package')
              }
            </p>
          </div>
          
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${
              proposalData?.submission_status?.status === 'submitted' ? 'bg-vai-bamboo/20' : 'bg-vai-muted/20'
            }`}>
              <CheckCircle className={`w-8 h-8 ${
                proposalData?.submission_status?.status === 'submitted' ? 'text-vai-bamboo' : 'text-vai-muted'
              }`} />
            </div>
            <h3 className="font-semibold text-vai-pearl mb-1">{t('overview.configuration.submitted')}</h3>
            <p className="text-sm text-vai-muted">
              {proposalData?.submission_status?.status === 'submitted' ? 
                t('overview.configuration.under_review') : 
                t('overview.configuration.ready_submit')
              }
            </p>
          </div>
        </div>
        
        {proposalData?.submission_status?.status === 'submitted' && (
          <div className="mt-6 p-4 bg-vai-coral/10 rounded-lg border border-vai-coral/20">
            <div className="flex items-center gap-2 text-vai-coral">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{t('overview.configuration.submitted_title')}</span>
            </div>
            <p className="text-sm text-vai-muted mt-1">
              {t('overview.configuration.submitted_description', { 
                date: formatDate(proposalData.submission_status.submitted_at) 
              })}
            </p>
          </div>
        )}
      </div>

      {/* Project Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Business Info */}
        <div className="vai-card-compact">
          <div className="flex items-center gap-3 mb-3">
            <Building className="w-5 h-5 text-vai-teal" />
            <span className="text-sm font-medium text-vai-muted">{t('overview.summary.business_type')}</span>
          </div>
          <p className="text-lg font-semibold text-vai-pearl">
            {proposalData?.client_info?.business_type || t('overview.summary.tourism')}
          </p>
        </div>

        {/* Location */}
        <div className="vai-card-compact">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-5 h-5 text-vai-hibiscus" />
            <span className="text-sm font-medium text-vai-muted">{t('overview.summary.location')}</span>
          </div>
          <p className="text-lg font-semibold text-vai-pearl">
            {clientData.island || 'French Polynesia'}
          </p>
        </div>

        {/* Investment */}
        <div className="vai-card-compact">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-5 h-5 text-vai-sunset" />
            <span className="text-sm font-medium text-vai-muted">{t('overview.summary.investment')}</span>
          </div>
          <p className="text-lg font-semibold text-vai-pearl">
            {formatCurrency(clientData.total_investment_xpf)}
          </p>
        </div>

        {/* Monthly Costs */}
        <div className="vai-card-compact">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-vai-bamboo" />
            <span className="text-sm font-medium text-vai-muted">{t('overview.summary.monthly_costs')}</span>
          </div>
          <p className="text-lg font-semibold text-vai-pearl">
            {formatCurrency(clientData.monthly_costs_xpf)}
          </p>
        </div>
      </div>

      {/* Project Timeline */}
      <div className="vai-card">
        <h2 className="text-xl font-semibold text-vai-pearl mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-vai-coral" />
          {t('overview.timeline.title')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-vai-muted mb-2">{t('overview.timeline.proposed_start')}</h3>
            <p className="text-vai-pearl">
              {formatDate(clientData.proposed_start_date)}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-vai-muted mb-2">{t('overview.timeline.estimated_completion')}</h3>
            <p className="text-vai-pearl">
              {formatDate(clientData.estimated_completion_date)}
            </p>
          </div>
          
          {clientData.actual_start_date && (
            <div>
              <h3 className="text-sm font-medium text-vai-muted mb-2">{t('overview.timeline.actual_start')}</h3>
              <p className="text-vai-pearl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-vai-bamboo" />
                {formatDate(clientData.actual_start_date)}
              </p>
            </div>
          )}
          
          {clientData.actual_completion_date && (
            <div>
              <h3 className="text-sm font-medium text-vai-muted mb-2">{t('overview.timeline.actual_completion')}</h3>
              <p className="text-vai-pearl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-vai-bamboo" />
                {formatDate(clientData.actual_completion_date)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Next Steps - Placeholder */}
      <div className="vai-card">
        <h2 className="text-xl font-semibold text-vai-pearl mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-vai-sunset" />
          {t('overview.next_steps.title')}
        </h2>
        
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-vai-muted/20 rounded-lg flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-vai-muted" />
          </div>
          <p className="text-vai-muted">
            {t('overview.next_steps.no_steps')}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="vai-card">
        <h2 className="text-xl font-semibold text-vai-pearl mb-4">{t('overview.stats.title')}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-vai-coral">
              {clientData.portal_views || 0}
            </p>
            <p className="text-sm text-vai-muted">{t('overview.stats.portal_views')}</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-vai-teal">
              {clientData.last_accessed_at ? 
                Math.floor((Date.now() - new Date(clientData.last_accessed_at)) / (1000 * 60 * 60 * 24)) : 0
              }
            </p>
            <p className="text-sm text-vai-muted">{t('overview.stats.days_since_visit')}</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-vai-sunset">
              {clientData.project_status === 'active' ? '✓' : '⏳'}
            </p>
            <p className="text-sm text-vai-muted">{t('overview.stats.project_active')}</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-vai-bamboo">100%</p>
            <p className="text-sm text-vai-muted">{t('overview.stats.satisfaction')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverviewTab