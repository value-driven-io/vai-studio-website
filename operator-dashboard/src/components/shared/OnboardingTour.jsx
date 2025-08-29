import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Sparkles, 
  TrendingUp, 
  Users, 
  CreditCard, 
  BookOpen,
  Target,
  Clock,
  DollarSign
} from 'lucide-react'
import onboardingStateManager from '../../services/onboardingStateManager'

const OnboardingTour = ({ operator, onComplete }) => {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const tourSteps = [
    {
      id: 'welcome',
      title: t('onboarding.onboardingTour.welcome.title'),
      message: t('onboarding.onboardingTour.welcome.message'),
      target: null,
      position: 'center',
      icon: Sparkles,
      businessValue: null,
      proTip: null
    },
    {
      id: 'dashboard',
      title: 'Your Dashboard Tab',
      message: 'This is your main dashboard where you can see booking statistics, revenue, and overall performance metrics.',
      target: '[data-tour="dashboard-stats"]',
      position: 'bottom',
      icon: TrendingUp,
      businessValue: 'Data-driven decisions increase revenue by 30%',
      proTip: 'Check your dashboard daily to spot booking trends'
    },
    {
      id: 'createActivity',
      title: 'Your Create Tab',
      message: 'This is where you create and manage your tours and activities. Good descriptions and photos lead to more bookings.',
      target: '[data-tour="create-button"]',
      position: 'bottom',
      icon: BookOpen,
      businessValue: 'Activities with good descriptions get 3x more bookings',
      proTip: 'Include photos and detailed meeting points for best results'
    },
    {
      id: 'manageBookings',
      title: 'Your Bookings Tab',
      message: 'This is your booking management center where you handle customer requests, confirmations, and communication.',
      target: '[data-tour="bookings-tab"]',
      position: 'top',
      icon: Users,
      businessValue: 'Fast responses (under 30 min) increase conversion by 65%',
      proTip: 'Quick responses lead to better reviews and more bookings'
    },
    {
      id: 'revenueStream',
      title: 'Your Profile Tab',
      message: 'This is where you manage your business profile, payment settings, and account information.',
      target: '[data-tour="profile-tab"]',
      position: 'top',
      icon: CreditCard,
      businessValue: 'You keep 89% of every booking - industry leading',
      proTip: 'Payouts arrive 48h after activity completion'
    },
    {
      id: 'complete',
      title: t('onboarding.onboardingTour.complete.title'),
      message: t('onboarding.onboardingTour.complete.message'),
      target: null,
      position: 'center',
      icon: Target,
      businessValue: 'Operators following this system earn €2,400/month average',
      proTip: 'Start with one activity and scale based on demand'
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

  // Handle tab highlighting when step changes
  useEffect(() => {
    if (isVisible) {
      highlightRelevantTab()
    } else {
      removeTabHighlights()
    }

    return () => {
      removeTabHighlights()
    }
  }, [isVisible, currentStep])

  const highlightRelevantTab = () => {
    // Remove any existing highlights first
    removeTabHighlights()
    
    const currentStepData = tourSteps[currentStep]
    if (!currentStepData) return
    
    let tabSelector = null
    
    // Map tour steps to navigation tabs using exact data-tour attributes
    switch (currentStepData.id) {
      case 'dashboard':
        tabSelector = '[data-tour="dashboard-stats"]'
        break
      case 'createActivity':
        tabSelector = '[data-tour="create-button"]'
        break
      case 'manageBookings':
        tabSelector = '[data-tour="bookings-tab"]'
        break
      case 'revenueStream':
        tabSelector = '[data-tour="profile-tab"]'
        break
      default:
        return // No tab highlighting for welcome or completion steps
    }
    
    if (tabSelector) {
      // Find the navigation element and add highlight
      const targetElement = document.querySelector(tabSelector)
      if (targetElement) {
        // Find the parent navigation button
        const navButton = targetElement.closest('button') || targetElement
        if (navButton) {
          navButton.classList.add('tour-highlighted')
          navButton.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.8)'
          navButton.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'
          navButton.style.borderRadius = '12px'
          navButton.style.transition = 'all 0.3s ease'
          navButton.style.zIndex = '9998' // Just below the tour modal
        }
      }
    }
  }

  const removeTabHighlights = () => {
    const highlightedElements = document.querySelectorAll('.tour-highlighted')
    highlightedElements.forEach(element => {
      element.classList.remove('tour-highlighted')
      element.style.boxShadow = ''
      element.style.backgroundColor = ''
      element.style.borderRadius = ''
      element.style.transition = ''
      element.style.zIndex = ''
    })
  }

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
      // Mark tour step as completed in onboarding state
      onboardingStateManager.markStepCompleted('tour', false) // Don't sync to DB, localStorage only
    }
    onComplete?.()
  }

  const getTargetElement = () => {
    if (!currentStepData.target) return null
    return document.querySelector(currentStepData.target)
  }

  const getTooltipPosition = () => {
    // Always center the tooltip for better UX - addresses positioning issues
    return { 
      position: 'fixed', 
      top: '50%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)',
      maxWidth: window.innerWidth < 768 ? 'calc(100vw - 32px)' : '28rem',
      margin: window.innerWidth < 768 ? '16px' : '0',
      zIndex: 9999
    }
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
        className="fixed z-50 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-2xl border border-blue-400/30 p-4 md:p-6 max-w-md w-full mx-4 md:mx-0"
        style={tooltipStyle}
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <currentStepData.icon className="w-4 h-4 text-yellow-300" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">{currentStepData.title}</h3>
            <p className="text-blue-100 text-sm leading-relaxed mb-3">{currentStepData.message}</p>
            
            {/* Business Value */}
            {currentStepData.businessValue && (
              <div className="bg-white/10 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-3 h-3 text-green-300" />
                  <span className="text-xs font-semibold text-green-300">Business Impact</span>
                </div>
                <p className="text-xs text-green-200">{currentStepData.businessValue}</p>
              </div>
            )}
            
            {/* Pro Tip */}
            {currentStepData.proTip && (
              <div className="bg-yellow-400/10 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-3 h-3 text-yellow-300" />
                  <span className="text-xs font-semibold text-yellow-300">Pro Tip</span>
                </div>
                <p className="text-xs text-yellow-200">{currentStepData.proTip}</p>
              </div>
            )}
            
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