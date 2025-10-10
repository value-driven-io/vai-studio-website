// src/components/operator/website/WebsiteAbout.jsx
import { useTranslation } from 'react-i18next'
import { Award, Users, Star } from 'lucide-react'

const WebsiteAbout = ({ operator, activityStats, isNewOperator }) => {
  const { t } = useTranslation()

  // Check if we have enough content to show this section
  const hasDescription = operator.business_description && operator.business_description.length > 50
  const hasStats = !isNewOperator && (operator.total_tours_completed > 0 || operator.average_rating > 0)

  if (!hasDescription && !hasStats) {
    return null
  }

  return (
    <section id="about" className="py-16 sm:py-20 bg-ui-surface-secondary">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text Content */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-ui-text-primary mb-6" style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>
              {t('operatorProfile.website.aboutTitle', { name: operator.company_name })}
            </h2>

            {hasDescription && (
              <div className="prose prose-lg max-w-none text-ui-text-secondary mb-6">
                <p className="text-lg leading-relaxed whitespace-pre-line">
                  {operator.business_description}
                </p>
              </div>
            )}

            {operator.years_in_business && (
              <p className="text-lg text-ui-text-secondary mb-4">
                <strong className="text-interactive-primary">
                  {operator.years_in_business}+ {t('operatorProfile.website.yearsExperience')}
                </strong>{' '}
                {t('operatorProfile.website.sharingMagic')}
              </p>
            )}

            {/* Call to action */}
            <p className="text-lg text-ui-text-secondary">
              {t('operatorProfile.website.bookingInfo')}
            </p>
          </div>

          {/* Stats or Image Placeholder */}
          <div>
            {hasStats ? (
              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                {/* Years in Business */}
                {operator.years_in_business && (
                  <div className="bg-ui-surface-primary rounded-xl p-6 text-center border border-ui-border-primary">
                    <Award className="w-10 h-10 text-interactive-primary mx-auto mb-3" />
                    <div className="text-3xl font-bold text-ui-text-primary mb-1">
                      {operator.years_in_business}+
                    </div>
                    <div className="text-sm text-ui-text-secondary">
                      {t('operatorProfile.website.yearsExperience')}
                    </div>
                  </div>
                )}

                {/* Tours Completed */}
                {operator.total_tours_completed > 0 && (
                  <div className="bg-ui-surface-primary rounded-xl p-6 text-center border border-ui-border-primary">
                    <Users className="w-10 h-10 text-interactive-primary mx-auto mb-3" />
                    <div className="text-3xl font-bold text-ui-text-primary mb-1">
                      {operator.total_tours_completed.toLocaleString()}+
                    </div>
                    <div className="text-sm text-ui-text-secondary">
                      {t('operatorProfile.website.happyGuests')}
                    </div>
                  </div>
                )}

                {/* Average Rating */}
                {operator.average_rating > 0 && (
                  <div className="bg-ui-surface-primary rounded-xl p-6 text-center border border-ui-border-primary">
                    <Star className="w-10 h-10 text-yellow-400 fill-current mx-auto mb-3" />
                    <div className="text-3xl font-bold text-ui-text-primary mb-1">
                      {operator.average_rating.toFixed(1)}
                    </div>
                    <div className="text-sm text-ui-text-secondary">
                      {t('operatorProfile.website.averageRating')}
                    </div>
                  </div>
                )}

                {/* Activities Offered */}
                {activityStats?.total > 0 && (
                  <div className="bg-ui-surface-primary rounded-xl p-6 text-center border border-ui-border-primary">
                    <div className="text-4xl mb-3">🌴</div>
                    <div className="text-3xl font-bold text-ui-text-primary mb-1">
                      {activityStats.total}
                    </div>
                    <div className="text-sm text-ui-text-secondary">
                      {t('operatorProfile.website.uniqueTours')}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Decorative image placeholder if no stats (can be replaced with actual image)
              <div className="h-96 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl flex items-center justify-center text-7xl overflow-hidden">
                {operator.about_image ? (
                  <img
                    src={operator.about_image}
                    alt={`${operator.company_name} about`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to emoji placeholder if image fails to load
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full flex items-center justify-center ${operator.about_image ? 'hidden' : 'flex'}`}
                  style={{ display: operator.about_image ? 'none' : 'flex' }}
                >
                  🌸
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default WebsiteAbout
