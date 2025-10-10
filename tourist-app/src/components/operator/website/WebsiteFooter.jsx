// src/components/operator/website/WebsiteFooter.jsx
import { useTranslation } from 'react-i18next'

const WebsiteFooter = ({ operator }) => {
  const { t } = useTranslation()

  // Get initials for logo fallback
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-ui-surface-secondary border-t border-ui-border-primary py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-interactive-primary/20 rounded-lg flex items-center justify-center overflow-hidden">
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
                <span className="text-lg font-bold text-interactive-primary">
                  {getInitials(operator.company_name)}
                </span>
              </div>
            </div>
            <span className="font-bold text-ui-text-primary text-xl">
              {operator.company_name}
            </span>
          </div>

          {/* Description */}
          <p className="text-ui-text-secondary mb-6 max-w-2xl mx-auto">
            {operator.business_tagline || t('operatorProfile.website.footerDescription', {
              name: operator.company_name,
              island: operator.island
            })}
          </p>

          {/* Powered by VAI */}
          <p className="text-ui-text-muted text-sm">
            {t('operatorProfile.website.poweredBy')}{' '}
            <a
              href="https://vai.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-interactive-primary hover:text-interactive-primary-hover font-semibold hover:underline"
            >
              VAI
            </a>
          </p>

          {/* Copyright */}
          <p className="text-ui-text-muted text-xs mt-2">
            © {currentYear} {operator.company_name}. {t('operatorProfile.website.allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default WebsiteFooter
