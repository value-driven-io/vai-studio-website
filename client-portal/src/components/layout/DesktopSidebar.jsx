import { useTranslation } from 'react-i18next'
import { useClientStore } from '../../store/clientStore'
import { 
  Home, 
  User,
  Package,
  FileText, 
  DollarSign, 
  HelpCircle, 
  Zap,
  LogOut,
  ExternalLink
} from 'lucide-react'
import LanguageSwitcher from '../ui/LanguageSwitcher'

const DesktopSidebar = () => {
  const { t } = useTranslation()
  const { activeTab, setActiveTab, clientData, logout } = useClientStore()

  const tabs = [
    {
      id: 'overview',
      label: t('tabs.overview'),
      icon: Home,
      color: 'text-vai-coral'
    },
    {
      id: 'profile',
      label: t('tabs.profile'),
      icon: User,
      color: 'text-vai-teal'
    },
    {
      id: 'package',
      label: t('tabs.package'),
      icon: Package,
      color: 'text-vai-sunset'
    },
    //{
     // id: 'scope',
    //  label: t('tabs.scope'),
    //  icon: FileText,
    //  color: 'text-vai-hibiscus'
    //},
    {
      id: 'finances',
      label: t('tabs.finances'),
      icon: DollarSign,
      color: 'text-vai-sunset'
    },
    {
      id: 'faq',
      label: t('tabs.faq'),
      icon: HelpCircle,
      color: 'text-vai-hibiscus'
    },
    // {
    //  id: 'actions',
     // label: t('tabs.actions'),
     // icon: Zap,
     // color: 'text-vai-bamboo'
    //}
  ]

  const handleLogout = () => {
    if (window.confirm(t('actions.logout.confirm'))) {
      logout()
    }
  }

  return (
    <aside className="h-screen bg-vai-deep-ocean border-r border-slate-700/50 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        {/* VAI Studio Logo/Brand */}
        <div className="mb-6">
          <h1 className="text-lg font-bold text-vai-pearl">VAI Studio</h1>
          <p className="text-sm text-vai-muted">Client Portal</p>
        </div>

        {/* Client info */}
        <div className="flex items-center gap-3 p-3 bg-vai-lagoon/30 rounded-lg">
          <div className="w-10 h-10 bg-vai-coral/20 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-vai-coral" />
          </div>
          
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-vai-pearl truncate">
              {clientData?.company_name}
            </h2>
            <p className="text-xs text-vai-muted truncate">
              {clientData?.client_name}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6">
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200 text-left
                  ${isActive 
                    ? 'bg-vai-coral text-white shadow-vai-glow' 
                    : 'text-vai-muted hover:text-vai-pearl hover:bg-vai-lagoon/30'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-slate-700/50 space-y-4">
        {/* Language switcher */}
        <div className="flex justify-center">
          <LanguageSwitcher />
        </div>

        {/* Quick links */}
        <div className="space-y-2">
          <a
            href="https://vai.studio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-vai-muted hover:text-vai-coral transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>VAI Studio</span>
          </a>
          
          <a
            href="https://wa.me/68987269065"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-vai-muted hover:text-vai-coral transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>WhatsApp Support</span>
          </a>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-vai-muted hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('actions.logout.button')}</span>
        </button>

        {/* Version */}
        <div className="text-xs text-vai-muted/60 text-center">
          v1.0.0 • VAI Studio
        </div>
      </div>
    </aside>
  )
}

export default DesktopSidebar