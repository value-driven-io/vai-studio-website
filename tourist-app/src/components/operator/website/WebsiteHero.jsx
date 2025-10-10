// src/components/operator/website/WebsiteHero.jsx
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Phone, MessageCircle, MapPin, Star } from 'lucide-react'

const WebsiteHero = ({ operator, isNewOperator, contactMethods }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleContact = (method) => {
    if (method.type === 'chat') {
      // Navigate to messages/chat (will be functional once chat is available for non-confirmed bookings)
      navigate('/messages')
    } else if (method.type === 'whatsapp') {
      const message = encodeURIComponent(t('operatorProfile.whatsappMessage', { name: operator.company_name }))
      window.open(`https://wa.me/${method.value.replace(/[^\d]/g, '')}?text=${message}`, '_blank')
    } else if (method.type === 'phone') {
      window.open(`tel:${method.value}`, '_self')
    }
  }

  // Scroll to tours section
  const scrollToTours = () => {
    const toursSection = document.getElementById('tours')
    if (toursSection) {
      toursSection.scrollIntoView({ behavior: 'smooth' })
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
    <div className="hero min-h-[500px] bg-gradient-to-br from-[#667eea] to-[#764ba2] relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `
            radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
          `,
          animation: 'shimmer 15s infinite'
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 sm:py-24 text-center text-white">
        {/* Logo */}
        {operator.operator_logo ? (
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/20 overflow-hidden shadow-xl">
              <img
                src={operator.operator_logo}
                alt={`${operator.company_name} logo`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="w-full h-full hidden items-center justify-center">
                <span className="text-3xl sm:text-4xl font-bold">
                  {getInitials(operator.company_name)}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Company Name */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-shadow-lg" style={{ fontFamily: 'var(--font-display), Georgia, serif', textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}>
          {operator.company_name}
        </h1>

        {/* Tagline */}
        <p className="text-xl sm:text-2xl mb-2 opacity-95">
          {operator.business_tagline || t('operatorProfile.website.defaultTagline')}
        </p>

        {/* Location */}
        <div className="flex items-center justify-center gap-2 mb-6 text-white/90">
          <MapPin className="w-5 h-5" />
          <span className="text-lg">
            {operator.island}, {t('operatorProfile.website.frenchPolynesia')}
          </span>
        </div>

        {/* Rating & Stats */}
        {!isNewOperator && (operator.average_rating > 0 || operator.total_tours_completed > 0) && (
          <div className="flex items-center justify-center gap-6 mb-8 text-white/90">
            {operator.average_rating > 0 && (
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-current text-yellow-300" />
                <span className="text-lg font-medium">
                  {operator.average_rating.toFixed(1)} {t('operatorProfile.website.rating')}
                </span>
              </div>
            )}
            {operator.total_tours_completed > 0 && (
              <span className="text-lg">
                {operator.total_tours_completed}+ {t('operatorProfile.website.happyGuests')}
              </span>
            )}
          </div>
        )}

        {isNewOperator && (
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-lg font-medium border border-white/30">
              ✨ {t('operatorProfile.newLocalExpert')}
            </span>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Primary: Explore Tours */}
          <button
            onClick={scrollToTours}
            className="inline-block bg-white text-[#667eea] px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            {t('operatorProfile.website.exploreTours')}
          </button>

          {/* Secondary: Chat Button */}
          <button
            onClick={() => handleContact({ type: 'chat' })}
            className="inline-flex items-center gap-2 px-6 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/30 text-white rounded-full font-medium transition-all duration-300 hover:scale-105"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="hidden sm:inline">
              {t('operatorProfile.website.chat')}
            </span>
          </button>
        </div>
      </div>

      {/* Keyframes for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default WebsiteHero
