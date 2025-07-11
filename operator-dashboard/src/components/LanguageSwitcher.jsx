import React from 'react'
import { useTranslation } from 'react-i18next'

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }
  
  return (
    <div className="flex gap-2">
      <button 
        onClick={() => changeLanguage('fr')}
        className={`px-3 py-2 rounded text-sm ${
          i18n.language === 'fr' 
            ? 'bg-blue-500 text-white' 
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        🇫🇷 Français
      </button>
      <button 
        onClick={() => changeLanguage('en')}
        className={`px-3 py-2 rounded text-sm ${
          i18n.language === 'en' 
            ? 'bg-blue-500 text-white' 
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        🇺🇸 English
      </button>
    </div>
  )
}

export default LanguageSwitcher