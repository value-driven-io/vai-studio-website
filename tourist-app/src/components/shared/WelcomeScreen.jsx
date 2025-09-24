import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const WelcomeScreen = ({ onComplete }) => {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Start fade-out animation after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 2500)

    // Complete loading after fade-out animation (500ms)
    const completeTimer = setTimeout(() => {
      setIsVisible(false)
      onComplete?.()
    }, 3000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-[100002] flex items-center justify-center bg-ui-surface-overlay transition-all duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-interactive-primary/5 via-ui-surface-overlay to-mood-luxury/5"></div>

      {/* Logo Container */}
      <div className="relative flex flex-col items-center justify-center space-y-6">
        {/* VAI Logo with Elegant Glow */}
        <div className="relative">
          {/* Main Logo */}
          <img
            src="/logos/vai-logo-2025.png"
            alt="VAI Logo"
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain animate-pulse-subtle"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))',
            }}
          />

          {/* Glowing Orb Behind Logo */}
          <div className="absolute inset-0 -z-10">
            <div className="w-full h-full rounded-full animate-glow-pulse bg-gradient-radial from-interactive-primary/20 via-interactive-primary/10 to-transparent blur-xl"></div>
          </div>

          {/* Subtle Ring Animation */}
          <div className="absolute inset-0 -z-5">
            <div className="w-full h-full rounded-full border border-interactive-primary/20 animate-ping-slow"></div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="text-center space-y-2 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-ui-text-primary">
            {t('welcome.title', 'Welcome to VAI')}
          </h1>
          <p className="text-ui-text-secondary text-sm sm:text-base max-w-xs sm:max-w-sm">
            {t('welcome.subtitle', 'Your French Polynesia Adventure Begins')}
          </p>
        </div>

        {/* Loading Dots */}
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-interactive-primary rounded-full animate-bounce-dot delay-0"></div>
          <div className="w-2 h-2 bg-interactive-primary rounded-full animate-bounce-dot delay-100"></div>
          <div className="w-2 h-2 bg-interactive-primary rounded-full animate-bounce-dot delay-200"></div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeScreen