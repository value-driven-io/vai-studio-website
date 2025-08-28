// src/components/profile/ProfileTab.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import VAILogo from '../shared/VAILogo'

const ProfileTab = () => {
  const { t } = useTranslation()
  
  return (
    <div className="min-h-screen bg-slate-900">
      
      {/*
      <div className="flex items-center justify-center py-4 border-b border-slate-700">
        {/* Wrapping the VAILogo with an anchor tag */}
        {/* 
        <a href="https://vai.studio/app/" target="_blank" rel="noopener noreferrer">
          <VAILogo size="sm" />
        </a>
      </div> 
      */}
      
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="pt-8 mb-6">
          <p className="text-slate-500 text-sm p-2">
            {t('profile.support.description')}
          </p>
        </div>

        {/* Support Section */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            {t('profile.support.title')}
          </h2>
          <div className="space-y-3">
            <a 
              href="https://wa.me/68987269065" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-3 transition-colors"
            >
              {t('profile.support.whatsappButton')}
            </a>
            <a 
              href="mailto:contact@vai.studio"
              className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 transition-colors"
            >
              {t('profile.support.emailButton')}
            </a>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            {t('profile.howItWorks.title')}
          </h2>
          <div className="text-slate-300 text-sm space-y-2">
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
            <p className="text-center text-slate-500 text-sm mt-4" dangerouslySetInnerHTML={{__html: t('profile.footer')}} />
       </div> 
      </div>
    </div>
  )
}

export default ProfileTab