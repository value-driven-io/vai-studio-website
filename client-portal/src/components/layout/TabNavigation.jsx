import { useTranslation } from 'react-i18next'
import { useClientStore } from '../../store/clientStore'
import { 
  Home, 
  User,
  Package,
  FileText, 
  DollarSign, 
  HelpCircle, 
  Zap 
} from 'lucide-react'

const TabNavigation = () => {
  const { t } = useTranslation()
  const { activeTab, setActiveTab } = useClientStore()

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
    {
      id: 'scope',
      label: t('tabs.scope'),
      icon: FileText,
      color: 'text-vai-hibiscus'
    },
    {
      id: 'finances',
      label: t('tabs.finances'),
      icon: DollarSign,
      color: 'text-vai-sunset'
    }
  // {
   //   id: 'faq',
   //   label: t('tabs.faq'),
    //  icon: HelpCircle,
   //   color: 'text-vai-hibiscus'
   // },
   // {
   //   id: 'actions',
   //   label: t('tabs.actions'),
   //   icon: Zap,
   //   color: 'text-vai-bamboo'
  //   }
  ]

  const handleTabClick = (tabId) => {
    setActiveTab(tabId)
    
    // Scroll to top on mobile
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <nav className="bg-vai-deep-ocean/95 backdrop-blur-xl border-t border-slate-700/50">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg
                transition-all duration-200 touch-target min-w-0 flex-1
                ${isActive 
                  ? 'text-vai-coral bg-vai-coral/10' 
                  : 'text-vai-muted hover:text-vai-pearl hover:bg-vai-lagoon/30'
                }
              `}
              aria-label={tab.label}
            >
              <Icon 
                className={`
                  w-5 h-5 mb-1 transition-all duration-200
                  ${isActive ? 'scale-110' : ''}
                `} 
              />
              
              <span className={`
                text-xs font-medium leading-tight text-center
                ${isActive ? 'text-vai-coral' : 'text-vai-muted'}
              `}>
                {tab.label}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-vai-coral rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default TabNavigation