// src/components/profile/ProfileTab.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import VAILogo from '../shared/VAILogo'

const ProfileTab = () => {
  const { t } = useTranslation()
  
  return (
    <div className="min-h-screen bg-ui-surface-overlay">
      
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="pt-8 mb-6">
          <p className="text-ui-text-disabled text-sm p-2">
            {t('profile.support.description')}
          </p>
        </div>

        {/* Support Section */}
        <div className="vai-surface-secondary rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-ui-text-primary mb-4">
            {t('profile.support.title')}
          </h2>
          <div className="space-y-3">
            <a 
              href="https://wa.me/68987269065" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full vai-button-success rounded-lg px-4 py-3 transition-colors"
            >
              {t('profile.support.whatsappButton')}
            </a>
            <a 
              href="mailto:contact@vai.studio"
              className="flex items-center justify-center w-full vai-button-primary rounded-lg px-4 py-3 transition-colors"
            >
              {t('profile.support.emailButton')}
            </a>
          </div>
        </div>

        {/* How It Works */}
        <div className="vai-surface-secondary rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-ui-text-primary mb-4">
            {t('profile.howItWorks.title')}
          </h2>
          <div className="vai-text-secondary text-sm space-y-2">
            <p>{t('profile.howItWorks.step1')}</p>
            <p>{t('profile.howItWorks.step2')}</p>
            <p>{t('profile.howItWorks.step3')}</p>
            <p>{t('profile.howItWorks.step4')}</p>
            <p>{t('profile.howItWorks.step5')}</p>
            <p>{t('profile.howItWorks.step6')}</p>
            <p>{t('profile.howItWorks.step7')}</p>
          </div>
        </div>

              {/* Footer */}
          <div>
            <p className="text-center vai-text-disabled text-sm mt-4" dangerouslySetInnerHTML={{__html: t('profile.footer')}} />
       </div> 
      </div>
    </div>
  )
}

export default ProfileTab