import React from 'react'
import { useTranslation } from 'react-i18next'
import { LogOut, User, Settings } from 'lucide-react'
import LanguageDropdown from './LanguageDropdown'

const Header = ({ operator, logout }) => {
  const { t } = useTranslation()

  return (
    <header className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* Left side - Branding */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          
          <div>
            <h1 className="text-xl font-bold text-white">
              {t('header.title')}
            </h1>
            <p className="text-slate-400 text-sm">
              {t('header.greeting', { 
                companyName: operator?.company_name || operator?.contact_person || 'Operator' 
              })}
            </p>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          
          {/* Language Dropdown - Portal handles z-index automatically */}
          <LanguageDropdown />
          
          {/* User info */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 text-sm hidden sm:inline">
              {operator?.email}
            </span>
          </div>

          {/* Logout button */}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-colors"
            title={t('common.logout')}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t('common.logout')}</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header