import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react'

const OnboardingTour = ({ operator, onComplete }) => {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const tourSteps = [
    {
      id: 'welcome',
      title: t('onboarding.onboardingTour.welcome.title'),
      message: t('onboarding.onboardingTour.welcome.message'),
      target: null, // No specific target, just a welcome message
      position: 'center'
    },
    {
      id: 'dashboard',
      title: t('onboarding.onboardingTour.dashboard.title'),
      message: t('onboarding.onboardingTour.dashboard.message'),
      target: '[data-tour="dashboard-stats"]',
      position: 'bottom'
    },
    {
      id: 'createActivity',
      title: t('onboarding.onboardingTour.createActivity.title'),
      message: t('onboarding.onboardingTour.createActivity.message'),
      target: '[data-tour="create-button"]',
      position: 'bottom'
    },
    {
      id: 'manageBookings',
      title: t('onboarding.onboardingTour.manageBookings.title'),
      message: t('onboarding.onboardingTour.manageBookings.message'),
      target: '[data-tour="bookings-tab"]',
      position: 'top'
    },
    {
      id: 'complete',
      title: t('onboarding.onboardingTour.complete.title'),
      message: t('onboarding.onboardingTour.complete.message'),
      target: null,
      position: 'center'
    }
  ]

  // Check if user should see onboarding tour
  useEffect(() => {
    if (!operator) return

    const hasSeenTour = localStorage.getItem(`vai-tour-completed-${operator.id}`)
    const isNewOperator = !operator.tours_created || operator.tours_created === 0
    
    if (!hasSeenTour && isNewOperator) {
      // Show tour after a brief delay to let the UI settle
      setTimeout(() => setIsVisible(true), 1500)
    }
  }, [operator])

  const currentStepData = tourSteps[currentStep]

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const skipTour = () => {
    completeTour()
  }

  const completeTour = () => {
    setIsVisible(false)
    if (operator) {
      localStorage.setItem(`vai-tour-completed-${operator.id}`, 'true')
    }
    onComplete?.()
  }

  const getTargetElement = () => {
    if (!currentStepData.target) return null
    return document.querySelector(currentStepData.target)
  }

  const getTooltipPosition = () => {
    const target = getTargetElement()
    const isMobile = window.innerWidth < 768
    
    // For mobile, always center the tooltip
    if (isMobile) {
      return { 
        position: 'fixed', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        maxWidth: 'calc(100vw - 32px)',
        margin: '16px'
      }
    }
    
    if (!target) return { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }

    const rect = target.getBoundingClientRect()
    const gap = 16
    const tooltipWidth = 384 // max-w-sm = 24rem = 384px
    const tooltipHeight = 200 // estimated height
    
    let position = {}
    
    switch (currentStepData.position) {
      case 'bottom':
        position = {
          position: 'fixed',
          top: rect.bottom + gap,
          left: rect.left + (rect.width / 2),
          transform: 'translateX(-50%)'
        }
        
        // Prevent going off right edge
        if (rect.left + (rect.width / 2) + tooltipWidth / 2 > window.innerWidth - gap) {
          position.left = window.innerWidth - tooltipWidth - gap
          position.transform = 'translateX(0)'
        }
        // Prevent going off left edge
        if (rect.left + (rect.width / 2) - tooltipWidth / 2 < gap) {
          position.left = gap
          position.transform = 'translateX(0)'
        }
        // If no room below, move above
        if (rect.bottom + tooltipHeight + gap > window.innerHeight) {
          position.top = rect.top - tooltipHeight - gap
        }
        break
        
      case 'top':
        position = {
          position: 'fixed',
          bottom: window.innerHeight - rect.top + gap,
          left: rect.left + (rect.width / 2),
          transform: 'translateX(-50%)'
        }
        
        // Prevent going off edges
        if (rect.left + (rect.width / 2) + tooltipWidth / 2 > window.innerWidth - gap) {
          position.left = window.innerWidth - tooltipWidth - gap
          position.transform = 'translateX(0)'
        }
        if (rect.left + (rect.width / 2) - tooltipWidth / 2 < gap) {
          position.left = gap
          position.transform = 'translateX(0)'
        }
        break
        
      default: // center for mobile or fallback
        position = {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }
    }
    
    return position
  }

  if (!isVisible) return null

  const targetElement = getTargetElement()
  const tooltipStyle = getTooltipPosition()

  return (
    <>
      {/* Simple backdrop without blur */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={skipTour} />
      
      {/* Clean highlight for target element */}
      {targetElement && (
        <div
          className="fixed border-4 border-blue-400 rounded-lg z-42 pointer-events-none animate-pulse"
          style={{
            top: targetElement.getBoundingClientRect().top - 6,
            left: targetElement.getBoundingClientRect().left - 6,
            width: targetElement.getBoundingClientRect().width + 12,
            height: targetElement.getBoundingClientRect().height + 12,
            background: 'rgba(59, 130, 246, 0.1)',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
            zIndex: 99,
          }}
        />
      )}
      
      {/* Tour tooltip */}
      <div
        className="fixed z-50 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-2xl border border-blue-400/30 p-4 md:p-6 max-w-sm w-full mx-4 md:mx-0"
        style={tooltipStyle}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">{currentStepData.title}</h3>
            <p className="text-blue-100 text-sm leading-relaxed">{currentStepData.message}</p>
            {window.innerWidth < 768 && (
              <p className="text-blue-200/80 text-xs mt-2 italic">
                💡 For the best experience, try this tour on a tablet or desktop
              </p>
            )}
          </div>
          <button
            onClick={skipTour}
            className="text-blue-200 hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-blue-200 mb-2">
            <span>Step {currentStep + 1} of {tourSteps.length}</span>
            <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-yellow-300 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('onboarding.controls.previous')}
          </button>

          <button
            onClick={skipTour}
            className="text-sm text-blue-200 hover:text-white transition-colors px-2"
          >
            {t('onboarding.controls.skip')}
          </button>

          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors"
          >
            {currentStep === tourSteps.length - 1 ? (
              t('onboarding.controls.dismiss')
            ) : (
              <>
                {t('onboarding.controls.next')}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}

// Utility to reset tour for testing
export const resetOnboardingTour = (operatorId) => {
  localStorage.removeItem(`vai-tour-completed-${operatorId}`)
}

export default OnboardingTour