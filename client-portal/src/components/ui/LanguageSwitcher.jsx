import { useTranslation } from 'react-i18next'
import { useClientStore } from '../../store/clientStore'
import { Globe } from 'lucide-react'

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const { language, setLanguage } = useClientStore()

  const languages = [
    { code: 'fr', label: 'FR', name: 'Français' },
    { code: 'en', label: 'EN', name: 'English' }
  ]

  const handleLanguageChange = async (langCode) => {
    try {
      await i18n.changeLanguage(langCode)
      setLanguage(langCode)
    } catch (error) {
      console.error('Failed to change language:', error)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-vai-muted" />
      
      <div className="flex bg-vai-lagoon/50 rounded-lg p-1 border border-slate-700/50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`
              px-3 py-1 rounded text-sm font-medium transition-all duration-200
              ${language === lang.code
                ? 'bg-vai-coral text-white shadow-sm'
                : 'text-vai-muted hover:text-vai-pearl hover:bg-vai-lagoon/30'
              }
            `}
            title={lang.name}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default LanguageSwitcher