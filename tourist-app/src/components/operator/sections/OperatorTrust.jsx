// src/components/operator/sections/OperatorTrust.jsx
import { useTranslation } from 'react-i18next'
import { Shield, Award, CheckCircle, Waves } from 'lucide-react'

const OperatorTrust = ({ operator, isNewOperator }) => {
  const { t } = useTranslation()

  const trustIndicators = []

  // Licensed & Insured
  if (operator.business_license) {
    trustIndicators.push({
      icon: Shield,
      label: t('operatorProfile.trust.licensed'),
      description: t('operatorProfile.trust.licensedDesc'),
      verified: true
    })
  }

  if (operator.insurance_certificate) {
    trustIndicators.push({
      icon: CheckCircle,
      label: t('operatorProfile.trust.insured'),
      description: t('operatorProfile.trust.insuredDesc'),
      verified: true
    })
  }

  // Whale watching certification
  if (operator.whale_tour_certified) {
    trustIndicators.push({
      icon: Waves,
      label: t('operatorProfile.trust.whaleCertified'),
      description: t('operatorProfile.trust.whaleCertifiedDesc'),
      verified: true,
      special: true
    })
  }

  // Experience indicators
  if (!isNewOperator && operator.total_tours_completed > 0) {
    trustIndicators.push({
      icon: Award,
      label: t('operatorProfile.trust.experienced'),
      description: t('operatorProfile.trust.experiencedDesc', { count: operator.total_tours_completed }),
      verified: true
    })
  }

  // New operator specific indicators
  if (isNewOperator) {
    trustIndicators.push({
      icon: Award,
      label: t('operatorProfile.trust.localExpert'),
      description: t('operatorProfile.trust.localExpertDesc', { island: operator.island }),
      verified: true,
      new: true
    })

    trustIndicators.push({
      icon: CheckCircle,
      label: t('operatorProfile.trust.freshPerspective'),
      description: t('operatorProfile.trust.freshPerspectiveDesc'),
      verified: true,
      new: true
    })
  }

  if (trustIndicators.length === 0) {
    return null
  }

  return (
    <div className="bg-ui-surface-secondary/50 rounded-xl p-6 border border-ui-border-primary">
      <h2 className="text-lg font-semibold text-ui-text-primary mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5" />
        {t('operatorProfile.trust.title')}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {trustIndicators.map((indicator, index) => {
          const Icon = indicator.icon

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                indicator.special
                  ? 'bg-status-success/10 border-status-success/20'
                  : indicator.new
                  ? 'bg-interactive-primary/10 border-interactive-primary/20'
                  : 'bg-ui-surface-primary/50 border-ui-border-primary hover:border-interactive-primary/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  indicator.special
                    ? 'bg-status-success/20'
                    : indicator.new
                    ? 'bg-interactive-primary/20'
                    : 'bg-interactive-primary/20'
                }`}>
                  <Icon className={`w-4 h-4 ${
                    indicator.special
                      ? 'text-status-success'
                      : indicator.new
                      ? 'text-interactive-primary'
                      : 'text-interactive-primary'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-medium text-sm ${
                      indicator.special
                        ? 'text-status-success'
                        : indicator.new
                        ? 'text-interactive-primary'
                        : 'text-ui-text-primary'
                    }`}>
                      {indicator.label}
                    </h3>
                    {indicator.verified && (
                      <CheckCircle className={`w-3 h-3 ${
                        indicator.special
                          ? 'text-status-success'
                          : indicator.new
                          ? 'text-interactive-primary'
                          : 'text-status-success'
                      }`} />
                    )}
                  </div>
                  <p className="text-xs text-ui-text-secondary leading-relaxed">
                    {indicator.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Additional trust message for new operators */}
      {isNewOperator && (
        <div className="mt-4 p-3 bg-interactive-primary/10 rounded-lg border border-interactive-primary/20">
          <p className="text-sm text-interactive-primary text-center">
            {t('operatorProfile.trust.newOperatorMessage')}
          </p>
        </div>
      )}
    </div>
  )
}

export default OperatorTrust