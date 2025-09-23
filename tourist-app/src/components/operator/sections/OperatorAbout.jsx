// src/components/operator/sections/OperatorAbout.jsx
import { useTranslation } from 'react-i18next'
import { User, MapPin, Calendar } from 'lucide-react'

const OperatorAbout = ({ operator }) => {
  const { t } = useTranslation()

  // Don't show if no substantial description
  if (!operator.business_description?.trim() || operator.business_description.trim().length < 20) {
    return null
  }

  // Calculate years in business
  const yearsInBusiness = operator.created_at ?
    new Date().getFullYear() - new Date(operator.created_at).getFullYear() : null

  return (
    <div className="bg-ui-surface-secondary/50 rounded-xl p-6 border border-ui-border-primary">
      <h2 className="text-lg font-semibold text-ui-text-primary mb-4 flex items-center gap-2">
        <User className="w-5 h-5" />
        {t('operatorProfile.about.title')}
      </h2>

      <div className="space-y-4">
        {/* Main description */}
        <div>
          <p className="text-ui-text-secondary leading-relaxed">
            {operator.business_description}
          </p>
        </div>

        {/* Additional details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-ui-border-primary">
          {/* Contact person */}
          {operator.contact_person && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-interactive-primary/20 rounded-lg">
                <User className="w-4 h-4 text-interactive-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-ui-text-secondary uppercase tracking-wide">
                  {t('operatorProfile.about.contactPerson')}
                </p>
                <p className="font-medium text-ui-text-primary">
                  {operator.contact_person}
                </p>
              </div>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-interactive-primary/20 rounded-lg">
              <MapPin className="w-4 h-4 text-interactive-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-ui-text-secondary uppercase tracking-wide">
                {t('operatorProfile.about.basedIn')}
              </p>
              <p className="font-medium text-ui-text-primary">
                {operator.island}, French Polynesia
              </p>
            </div>
          </div>

          {/* Years in business (only if meaningful) */}
          {yearsInBusiness && yearsInBusiness > 0 && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-interactive-primary/20 rounded-lg">
                <Calendar className="w-4 h-4 text-interactive-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-ui-text-secondary uppercase tracking-wide">
                  {t('operatorProfile.about.established')}
                </p>
                <p className="font-medium text-ui-text-primary">
                  {yearsInBusiness === 1 ?
                    t('operatorProfile.about.thisYear') :
                    t('operatorProfile.about.yearsAgo', { years: yearsInBusiness })
                  }
                </p>
              </div>
            </div>
          )}

          {/* Island expertise */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-interactive-primary/20 rounded-lg">
              <MapPin className="w-4 h-4 text-interactive-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-ui-text-secondary uppercase tracking-wide">
                {t('operatorProfile.about.expertise')}
              </p>
              <p className="font-medium text-ui-text-primary">
                {t('operatorProfile.about.localExpert', { island: operator.island })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OperatorAbout