import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useClientStore } from '../../store/clientStore'
import { 
  Zap, 
  MessageCircle, 
  Download, 
  Share2, 
  LogOut, 
  ExternalLink,
  Smartphone,
  Mail,
  Globe,
  FileText,
  Copy,
  Check
} from 'lucide-react'

const ActionsTab = () => {
  const { t } = useTranslation()
  const { clientData, logout } = useClientStore()
  const [copiedLink, setCopiedLink] = useState(false)

  const handleLogout = () => {
    if (window.confirm(t('actions.logout.confirm'))) {
      logout()
    }
  }

  const handleSharePortal = async () => {
    const currentUrl = window.location.href
    
    try {
      if (navigator.share) {
        // Use native share API if available
        await navigator.share({
          title: `${clientData?.company_name} - VAI Studio Portal`,
          text: t('actions.share.description'),
          url: currentUrl
        })
      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(currentUrl)
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
      }
    } catch (error) {
      console.error('Failed to share:', error)
      // Try clipboard as fallback
      try {
        await navigator.clipboard.writeText(currentUrl)
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
      } catch (clipboardError) {
        alert(t('actions.share.failed'))
      }
    }
  }

  const handleDownloadProposal = () => {
    // Placeholder for future PDF generation
    alert(t('actions.downloads.soon'))
  }

  const actionGroups = [
    {
      title: t('actions.contact.title'),
      icon: MessageCircle,
      color: 'text-vai-coral',
      actions: [
        {
          label: t('actions.contact.whatsapp'),
          icon: Smartphone,
          href: 'https://wa.me/68987269065',
          color: 'bg-green-600 hover:bg-green-700',
          external: true
        },
        {
          label: t('actions.contact.email'),
          icon: Mail,
          href: 'mailto:hello@vai.studio',
          color: 'bg-vai-teal hover:bg-vai-teal/80',
          external: true
        },
        {
          label: t('actions.contact.website'),
          icon: Globe,
          href: 'https://vai.studio',
          color: 'bg-vai-sunset hover:bg-vai-sunset/80',
          external: true
        }
      ]
    },
    {
      title: t('actions.downloads.title'),
      icon: Download,
      color: 'text-vai-teal',
      actions: [
        {
          label: t('actions.downloads.proposal'),
          icon: FileText,
          onClick: handleDownloadProposal,
          color: 'bg-vai-lagoon hover:bg-vai-ocean-light',
          disabled: true
        }
      ]
    },
    {
      title: t('actions.share.title'),
      icon: Share2,
      color: 'text-vai-sunset',
      actions: [
        {
          label: t('actions.share.portal'),
          icon: copiedLink ? Check : Copy,
          onClick: handleSharePortal,
          color: copiedLink ? 'bg-vai-bamboo hover:bg-vai-bamboo/80' : 'bg-vai-hibiscus hover:bg-vai-hibiscus/80'
        }
      ]
    }
  ]

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return t('actions.project_status.completed')
      case 'active':
        return t('actions.project_status.active')
      case 'proposal':
        return t('actions.project_status.proposal')
      case 'paused':
        return t('actions.project_status.paused')
      case 'cancelled':
        return t('actions.project_status.cancelled')
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="vai-card">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="w-6 h-6 text-vai-bamboo" />
          <h1 className="text-2xl font-bold text-vai-pearl">
            {t('actions.title')}
          </h1>
        </div>
        
        <p className="text-vai-muted">
          {t('actions.subtitle')}
        </p>
      </div>

      {/* Action Groups */}
      {actionGroups.map((group, groupIndex) => {
        const GroupIcon = group.icon
        
        return (
          <div key={groupIndex} className="vai-card">
            <h2 className="text-xl font-semibold text-vai-pearl mb-6 flex items-center gap-2">
              <GroupIcon className={`w-5 h-5 ${group.color}`} />
              {group.title}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.actions.map((action, actionIndex) => {
                const ActionIcon = action.icon
                
                if (action.href) {
                  return (
                    <a
                      key={actionIndex}
                      href={action.href}
                      target={action.external ? "_blank" : "_self"}
                      rel={action.external ? "noopener noreferrer" : undefined}
                      className={`
                        flex items-center gap-3 p-4 rounded-lg text-white font-medium
                        transition-all duration-200 hover:scale-105 hover:shadow-lg
                        ${action.color}
                        ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <ActionIcon className="w-5 h-5" />
                      <span>{action.label}</span>
                      {action.external && <ExternalLink className="w-4 h-4 ml-auto" />}
                    </a>
                  )
                } else {
                  return (
                    <button
                      key={actionIndex}
                      onClick={action.onClick}
                      disabled={action.disabled}
                      className={`
                        flex items-center gap-3 p-4 rounded-lg text-white font-medium
                        transition-all duration-200 hover:scale-105 hover:shadow-lg
                        ${action.color}
                        ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <ActionIcon className="w-5 h-5" />
                      <span>{action.label}</span>
                    </button>
                  )
                }
              })}
            </div>
          </div>
        )
      })}

      {/* Client Information Card */}
      <div className="vai-card bg-gradient-to-br from-vai-lagoon to-vai-ocean-light">
        <h2 className="text-xl font-semibold text-vai-pearl mb-4">
          {t('actions.project_info.title')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-vai-muted mb-2">{t('actions.project_info.company')}</h3>
            <p className="text-vai-pearl font-semibold">{clientData?.company_name}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-vai-muted mb-2">{t('actions.project_info.contact')}</h3>
            <p className="text-vai-pearl">{clientData?.client_name}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-vai-muted mb-2">{t('actions.project_info.email')}</h3>
            <p className="text-vai-pearl">{clientData?.email}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-vai-muted mb-2">{t('actions.project_info.location')}</h3>
            <p className="text-vai-pearl">{clientData?.island || 'French Polynesia'}</p>
          </div>
          
          {clientData?.whatsapp && (
            <div>
              <h3 className="text-sm font-medium text-vai-muted mb-2">{t('actions.project_info.whatsapp')}</h3>
              <p className="text-vai-pearl">{clientData.whatsapp}</p>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium text-vai-muted mb-2">{t('actions.project_info.status')}</h3>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              clientData?.project_status === 'completed' ? 'vai-status-completed' :
              clientData?.project_status === 'active' ? 'vai-status-current' :
              'vai-status-upcoming'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                clientData?.project_status === 'completed' ? 'bg-vai-bamboo' :
                clientData?.project_status === 'active' ? 'bg-vai-coral' :
                'bg-vai-muted'
              }`} />
              {getStatusLabel(clientData?.project_status)}
            </div>
          </div>
        </div>
      </div>

      {/* Support Information */}
      <div className="vai-card bg-gradient-to-br from-vai-hibiscus/10 to-vai-coral/10 border-vai-hibiscus/20">
        <div className="text-center">
          <MessageCircle className="w-8 h-8 text-vai-hibiscus mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-vai-pearl mb-2">
            {t('actions.support.title')}
          </h3>
          <p className="text-vai-muted mb-4">
            {t('actions.support.description')}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <p className="text-sm font-medium text-vai-muted">{t('actions.support.hours_label')}</p>
              <p className="text-vai-pearl">{t('actions.support.hours_value')}</p>
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-vai-muted">{t('actions.support.response_label')}</p>
              <p className="text-vai-pearl">{t('actions.support.response_value')}</p>
            </div>
          </div>
          
          <div className="text-xs text-vai-muted">
            {t('actions.support.footer')}
          </div>
        </div>
      </div>

      {/* Logout Section */}
      <div className="vai-card border-red-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-vai-pearl mb-1">
              {t('actions.logout.title')}
            </h3>
            <p className="text-sm text-vai-muted">
              {t('actions.logout.description')}
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t('actions.logout.button')}
          </button>
        </div>
      </div>

      {/* Version Info */}
      <div className="text-center text-xs text-vai-muted/60">
        {t('actions.version', { year: new Date().getFullYear() })}
      </div>
    </div>
  )
}

export default ActionsTab