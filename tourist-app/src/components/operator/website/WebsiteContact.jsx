// src/components/operator/website/WebsiteContact.jsx
import { useTranslation } from 'react-i18next'
import { Mail, Phone, MessageCircle, MapPin } from 'lucide-react'

const WebsiteContact = ({ operator, contactMethods }) => {
  const { t } = useTranslation()

  const handleContact = (method) => {
    if (method.type === 'whatsapp') {
      const message = encodeURIComponent(t('operatorProfile.whatsappMessage', { name: operator.company_name }))
      window.open(`https://wa.me/${method.value.replace(/[^\d]/g, '')}?text=${message}`, '_blank')
    } else if (method.type === 'phone') {
      window.open(`tel:${method.value}`, '_self')
    } else if (method.type === 'email') {
      window.open(`mailto:${method.value}`, '_self')
    }
  }

  // Check if we have contact info to show
  const hasContactMethods = contactMethods && contactMethods.length > 0
  const hasEmail = operator.contact_email
  const hasLocation = operator.island

  if (!hasContactMethods && !hasEmail && !hasLocation) {
    return null
  }

  return (
    <section id="contact" className="py-16 sm:py-20 bg-ui-surface-primary">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-ui-text-primary mb-4" style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>
          {t('operatorProfile.website.getInTouch')}
        </h2>
        <p className="text-lg text-ui-text-secondary mb-12">
          {t('operatorProfile.website.contactDescription')}
        </p>

        {/* Contact Cards - Centered and symmetric */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Email */}
          {hasEmail && (
            <div className="bg-ui-surface-secondary rounded-xl p-8 border border-ui-border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <Mail className="w-12 h-12 text-interactive-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-ui-text-primary mb-2">
                {t('operatorProfile.website.email')}
              </h3>
              <a
                href={`mailto:${operator.contact_email}`}
                className="text-ui-text-secondary hover:text-interactive-primary transition-colors break-all"
              >
                {operator.contact_email}
              </a>
            </div>
          )}

          {/* WhatsApp */}
          {contactMethods.find(m => m.type === 'whatsapp') && (
            <div
              onClick={() => handleContact(contactMethods.find(m => m.type === 'whatsapp'))}
              className="bg-ui-surface-secondary rounded-xl p-8 border border-ui-border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <MessageCircle className="w-12 h-12 text-interactive-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-ui-text-primary mb-2">
                {t('operatorProfile.whatsapp')}
              </h3>
              <p className="text-ui-text-secondary">
                {contactMethods.find(m => m.type === 'whatsapp').value}
              </p>
            </div>
          )}

          {/* Phone */}
          {contactMethods.find(m => m.type === 'phone') && (
            <div
              onClick={() => handleContact(contactMethods.find(m => m.type === 'phone'))}
              className="bg-ui-surface-secondary rounded-xl p-8 border border-ui-border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <Phone className="w-12 h-12 text-interactive-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-ui-text-primary mb-2">
                {t('operatorProfile.call')}
              </h3>
              <p className="text-ui-text-secondary">
                {contactMethods.find(m => m.type === 'phone').value}
              </p>
            </div>
          )}

          {/* Location */}
          {hasLocation && (
            <div className="bg-ui-surface-secondary rounded-xl p-8 border border-ui-border-primary hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <MapPin className="w-12 h-12 text-interactive-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-ui-text-primary mb-2">
                {t('operatorProfile.website.location')}
              </h3>
              <p className="text-ui-text-secondary">
                {operator.island}, {t('operatorProfile.website.frenchPolynesia')}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default WebsiteContact
