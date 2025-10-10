// src/components/operator/website/WebsiteNavbar.jsx
import { useTranslation } from 'react-i18next'
import { Share2 } from 'lucide-react'
import LanguageDropdown from '../../shared/LanguageDropdown'

const WebsiteNavbar = ({ operator, onShare }) => {
  const { t } = useTranslation()

  // Smooth scroll to sections
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Get initials for logo fallback
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <nav className="sticky top-0 z-50 bg-ui-surface-primary/95 backdrop-blur-sm border-b border-ui-border-primary shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-interactive-primary/20 rounded-lg flex items-center justify-center overflow-hidden">
              {operator.operator_logo ? (
                <img
                  src={operator.operator_logo}
                  alt={`${operator.company_name} logo`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full flex items-center justify-center ${operator.operator_logo ? 'hidden' : 'flex'}`}
                style={{ display: operator.operator_logo ? 'none' : 'flex' }}
              >
                <span className="text-sm font-bold text-interactive-primary">
                  {getInitials(operator.company_name)}
                </span>
              </div>
            </div>
            <span className="font-bold text-ui-text-primary text-lg hidden sm:inline">
              {operator.company_name}
            </span>
          </div>

          {/* Navigation Links */}
          <ul className="hidden md:flex items-center gap-8">
            <li>
              <button
                onClick={() => scrollToSection('tours')}
                className="text-ui-text-secondary hover:text-ui-text-primary transition-colors font-medium"
              >
                {t('operatorProfile.website.tours')}
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('about')}
                className="text-ui-text-secondary hover:text-ui-text-primary transition-colors font-medium"
              >
                {t('operatorProfile.website.about')}
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection('contact')}
                className="text-ui-text-secondary hover:text-ui-text-primary transition-colors font-medium"
              >
                {t('operatorProfile.website.contact')}
              </button>
            </li>
          </ul>

          {/* Language Switcher */}
          <LanguageDropdown />

          {/* Share Button */}
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-4 py-2 text-ui-text-secondary hover:text-ui-text-primary hover:bg-ui-surface-secondary rounded-lg transition-colors"
            title={t('operatorProfile.shareProfile')}
          >
            <Share2 className="w-5 h-5" />
            <span className="hidden sm:inline">{t('operatorProfile.website.share')}</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default WebsiteNavbar
