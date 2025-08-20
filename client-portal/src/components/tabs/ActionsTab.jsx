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
          text: 'Suivez mon projet de transformation digitale avec VAI Studio',
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
        alert('Impossible de partager le lien')
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
          Actions rapides pour gérer votre projet et contacter VAI Studio
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
          Informations de votre projet
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-vai-muted mb-2">Entreprise</h3>
            <p className="text-vai-pearl font-semibold">{clientData?.company_name}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-vai-muted mb-2">Contact principal</h3>
            <p className="text-vai-pearl">{clientData?.client_name}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-vai-muted mb-2">Email</h3>
            <p className="text-vai-pearl">{clientData?.email}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-vai-muted mb-2">Localisation</h3>
            <p className="text-vai-pearl">{clientData?.island || 'French Polynesia'}</p>
          </div>
          
          {clientData?.whatsapp && (
            <div>
              <h3 className="text-sm font-medium text-vai-muted mb-2">WhatsApp</h3>
              <p className="text-vai-pearl">{clientData.whatsapp}</p>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium text-vai-muted mb-2">Statut du projet</h3>
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
              {clientData?.project_status === 'completed' ? 'Terminé' :
               clientData?.project_status === 'active' ? 'En cours' :
               clientData?.project_status === 'proposal' ? 'Proposition' :
               clientData?.project_status || 'Non défini'}
            </div>
          </div>
        </div>
      </div>

      {/* Support Information */}
      <div className="vai-card bg-gradient-to-br from-vai-hibiscus/10 to-vai-coral/10 border-vai-hibiscus/20">
        <div className="text-center">
          <MessageCircle className="w-8 h-8 text-vai-hibiscus mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-vai-pearl mb-2">
            Support VAI Studio
          </h3>
          <p className="text-vai-muted mb-4">
            Besoin d'aide ? Notre équipe est disponible pour vous accompagner
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <p className="text-sm font-medium text-vai-muted">Heures d'ouverture</p>
              <p className="text-vai-pearl">Lun-Ven: 8h-17h (GMT-10)</p>
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium text-vai-muted">Temps de réponse</p>
              <p className="text-vai-pearl">Moins de 24h</p>
            </div>
          </div>
          
          <div className="text-xs text-vai-muted">
            VAI Studio • Moorea, French Polynesia • International Quality. Island Style.
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
              Se déconnecter du portail client
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
        VAI Client Portal v1.0.0 • {new Date().getFullYear()} VAI Studio
      </div>
    </div>
  )
}

export default ActionsTab