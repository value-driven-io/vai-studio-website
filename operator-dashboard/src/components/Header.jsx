import React from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'

const Header = ({ operator, logout }) => {
  const { t } = useTranslation()

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src="https://vai.studio/via-studio-images/logo/VAI - Logo Multicolor 2025.png" 
            alt="VAI Studio Logo" 
            className="w-12 h-12 md:w-16 md:h-16 object-contain"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {t('header.title')}
            </h1>
            <p className="text-slate-400">
              {t('header.greeting', { companyName: operator?.company_name })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <button
            onClick={logout}
            className="px-4 py-2 text-slate-400 hover:text-white transition-colors border border-slate-600 rounded-lg"
          >
            {t('common.logout')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Header