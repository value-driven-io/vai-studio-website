// src/components/operator/sections/OperatorHero.jsx
import { useTranslation } from 'react-i18next'
import { Phone, MessageCircle, Star, MapPin } from 'lucide-react'

const OperatorHero = ({ operator, isNewOperator, contactMethods }) => {
  const { t } = useTranslation()

  const handleContact = (method) => {
    if (method.type === 'whatsapp') {
      const message = encodeURIComponent(t('operatorProfile.whatsappMessage', { name: operator.company_name }))
      window.open(`https://wa.me/${method.value.replace(/[^\d]/g, '')}?text=${message}`, '_blank')
    } else if (method.type === 'phone') {
      window.open(`tel:${method.value}`, '_self')
    }
  }

  // Generate company initials for fallback
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="bg-ui-surface-secondary/50 rounded-xl p-6 border border-ui-border-primary">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Logo/Avatar */}
        <div className="flex-shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-interactive-primary/20 rounded-xl flex items-center justify-center border border-ui-border-primary overflow-hidden">
            {operator.operator_logo ? (
              <img
                src={operator.operator_logo}
                alt={`${operator.company_name} logo`}
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  // Fallback to initials if logo fails to load
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
            ) : null}
            <div
              className={`w-full h-full flex items-center justify-center ${operator.operator_logo ? 'hidden' : 'flex'}`}
              style={{ display: operator.operator_logo ? 'none' : 'flex' }}
            >
              <span className="text-xl sm:text-2xl font-bold text-interactive-primary">
                {getInitials(operator.company_name)}
              </span>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="flex-1 min-w-0">
          <div className="mb-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-ui-text-primary leading-tight">
              {operator.company_name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4 text-ui-text-muted" />
              <span className="text-ui-text-secondary">
                {t('operatorProfile.licensedOperator')} • {operator.island}
              </span>
            </div>
          </div>

          {/* Rating & Stats */}
          <div className="flex items-center gap-4 mb-4">
            {!isNewOperator && operator.average_rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-current text-yellow-400" />
                <span className="font-medium text-ui-text-primary">
                  {operator.average_rating.toFixed(1)}
                </span>
              </div>
            )}

            {!isNewOperator && operator.total_tours_completed > 0 && (
              <span className="text-sm text-ui-text-secondary">
                {t('operatorProfile.toursCompleted', { count: operator.total_tours_completed })}
              </span>
            )}

            {isNewOperator && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-interactive-primary/20 text-interactive-primary rounded-full text-sm font-medium">
                {t('operatorProfile.newLocalExpert')}
              </span>
            )}
          </div>

          {/* Contact Buttons */}
          {contactMethods.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {contactMethods.map((method, index) => {
                const isPrimary = method.primary
                const Icon = method.type === 'whatsapp' ? MessageCircle : Phone

                return (
                  <button
                    key={index}
                    onClick={() => handleContact(method)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors touch-manipulation active:scale-[0.98] ${
                      isPrimary
                        ? 'bg-interactive-primary hover:bg-interactive-primary-hover text-ui-text-primary'
                        : 'bg-ui-surface-primary hover:bg-ui-surface-secondary text-ui-text-primary border border-ui-border-primary'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {method.type === 'whatsapp' && t('operatorProfile.whatsapp')}
                    {method.type === 'phone' && t('operatorProfile.call')}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OperatorHero