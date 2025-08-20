import { useTranslation } from 'react-i18next'
import { useClientStore } from '../../store/clientStore'
import { User, LogOut } from 'lucide-react'
import LanguageSwitcher from '../ui/LanguageSwitcher'

const MobileHeader = () => {
  const { t } = useTranslation()
  const { clientData, logout } = useClientStore()

  const handleLogout = () => {
    if (window.confirm(t('actions.logout.confirm'))) {
      logout()
    }
  }

  return (
    <header className="mobile-sticky-header">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Client info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 bg-vai-coral/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-vai-coral" />
          </div>
          
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold text-vai-pearl truncate">
              {clientData?.company_name || 'Client Portal'}
            </h1>
            <p className="text-xs text-vai-muted truncate">
              {clientData?.client_name || 'VAI Studio'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Language switcher */}
          <LanguageSwitcher />
          
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="p-2 text-vai-muted hover:text-red-400 transition-colors"
            title={t('actions.logout.button')}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default MobileHeader