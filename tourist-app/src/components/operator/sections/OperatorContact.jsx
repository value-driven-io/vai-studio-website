// src/components/operator/sections/OperatorContact.jsx
import { useTranslation } from 'react-i18next'
import { Phone, MessageCircle, Mail, MapPin } from 'lucide-react'

const OperatorContact = ({ operator, contactMethods }) => {
  const { t } = useTranslation()

  // Don't show if no contact methods
  if (!contactMethods || contactMethods.length === 0) {
    return null
  }

  const handleContact = (method) => {
    if (method.type === 'whatsapp') {
      const message = encodeURIComponent(
        t('operatorProfile.contact.whatsappMessage', {
          name: operator.company_name
        })
      )
      window.open(`https://wa.me/${method.value.replace(/[^\d]/g, '')}?text=${message}`, '_blank')
    } else if (method.type === 'phone') {
      window.open(`tel:${method.value}`, '_self')
    }
  }

  const handleEmailInquiry = () => {
    // For now, we'll use WhatsApp or phone as primary contact
    // In the future, this could open a contact form modal
    const primaryMethod = contactMethods.find(m => m.primary) || contactMethods[0]
    if (primaryMethod) {
      handleContact(primaryMethod)
    }
  }

  return (
    <div className="bg-ui-surface-secondary/50 rounded-xl p-6 border border-ui-border-primary">
      <h2 className="text-lg font-semibold text-ui-text-primary mb-4 flex items-center gap-2">
        <Phone className="w-5 h-5" />
        {t('operatorProfile.contact.title')}
      </h2>

      <div className="space-y-4">
        {/* Direct Contact Methods */}
        <div>
          <h3 className="text-sm font-medium text-ui-text-secondary mb-3 uppercase tracking-wide">
            {t('operatorProfile.contact.directContact')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {contactMethods.map((method, index) => {
              const Icon = method.type === 'whatsapp' ? MessageCircle : Phone
              const isPrimary = method.primary

              return (
                <button
                  key={index}
                  onClick={() => handleContact(method)}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 text-left touch-manipulation active:scale-[0.98] ${
                    isPrimary
                      ? 'bg-interactive-primary/10 border-interactive-primary/30 hover:bg-interactive-primary/20'
                      : 'bg-ui-surface-primary/50 border-ui-border-primary hover:border-interactive-primary/30 hover:bg-ui-surface-primary'
                  }`}
                >
                  <div className={`p-3 rounded-lg ${
                    isPrimary
                      ? 'bg-interactive-primary/20'
                      : 'bg-interactive-primary/10'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      isPrimary
                        ? 'text-interactive-primary'
                        : 'text-interactive-primary/70'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${
                        isPrimary
                          ? 'text-interactive-primary'
                          : 'text-ui-text-primary'
                      }`}>
                        {method.type === 'whatsapp' && t('operatorProfile.contact.whatsapp')}
                        {method.type === 'phone' && t('operatorProfile.contact.phone')}
                      </p>
                      {isPrimary && (
                        <span className="text-xs bg-interactive-primary/20 text-interactive-primary px-2 py-1 rounded-full">
                          {t('operatorProfile.contact.preferred')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-ui-text-secondary">
                      {method.value}
                    </p>
                    <p className="text-xs text-ui-text-muted">
                      {method.type === 'whatsapp' && t('operatorProfile.contact.whatsappDesc')}
                      {method.type === 'phone' && t('operatorProfile.contact.phoneDesc')}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Email Inquiry Option */}
        <div>
          <h3 className="text-sm font-medium text-ui-text-secondary mb-3 uppercase tracking-wide">
            {t('operatorProfile.contact.inquiry')}
          </h3>

          <button
            onClick={handleEmailInquiry}
            className="w-full flex items-center gap-3 p-4 bg-ui-surface-primary/50 border border-ui-border-primary rounded-lg hover:border-interactive-primary/30 hover:bg-ui-surface-primary transition-all duration-200 text-left"
          >
            <div className="p-3 bg-interactive-primary/10 rounded-lg">
              <Mail className="w-5 h-5 text-interactive-primary/70" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-ui-text-primary">
                {t('operatorProfile.contact.sendInquiry')}
              </p>
              <p className="text-sm text-ui-text-secondary">
                {t('operatorProfile.contact.inquiryDesc')}
              </p>
            </div>
          </button>
        </div>

        {/* Location Info */}
        <div>
          <h3 className="text-sm font-medium text-ui-text-secondary mb-3 uppercase tracking-wide">
            {t('operatorProfile.contact.location')}
          </h3>

          <div className="flex items-center gap-3 p-4 bg-ui-surface-primary/30 rounded-lg border border-ui-border-primary">
            <div className="p-3 bg-interactive-primary/10 rounded-lg">
              <MapPin className="w-5 h-5 text-interactive-primary/70" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-ui-text-primary">
                {operator.island}, French Polynesia
              </p>
              <p className="text-sm text-ui-text-secondary">
                {t('operatorProfile.contact.localOperator')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Tips */}
      <div className="mt-4 p-3 bg-interactive-primary/10 rounded-lg border border-interactive-primary/20">
        <p className="text-sm text-interactive-primary">
          💡 {t('operatorProfile.contact.tip')}
        </p>
      </div>
    </div>
  )
}

export default OperatorContact