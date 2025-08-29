import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  Star, 
  Shield, 
  CreditCard, 
  BookOpen,
  Plus,
  Target,
  TrendingUp,
  Sparkles,
  PartyPopper,
  X,
  ChevronRight
} from 'lucide-react'

const SetupTab = ({ 
  operator,
  onboardingState,
  onStartPasswordSetup,
  onStartTour, 
  onStartPaymentSetup,
  onNavigateToCreate,
  onCompleteOnboarding
}) => {
  const { t } = useTranslation()
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [justCompleted, setJustCompleted] = useState(null)
  const [completedSteps, setCompletedSteps] = useState({})

  // Calculate onboarding status based on operator data
  const calculateStepStatus = () => {
    const hasSecurePassword = operator?.auth_setup_completed || false
    const hasCompletedTour = localStorage.getItem(`vai-tour-completed-${operator?.id}`) === 'true'
    const hasPaymentSetup = operator?.stripe_onboarding_complete && operator?.stripe_charges_enabled && operator?.stripe_payouts_enabled || false
    const hasFirstActivity = operator?.tours_created > 0 || false

    return {
      password: hasSecurePassword,
      tour: hasCompletedTour,
      payment: hasPaymentSetup,
      firstActivity: hasFirstActivity
    }
  }

  const stepStatus = calculateStepStatus()
  const totalSteps = 4
  const completedCount = Object.values(stepStatus).filter(Boolean).length
  const progressPercentage = Math.round((completedCount / totalSteps) * 100)
  const isFullyCompleted = completedCount === totalSteps

  // Watch for completion
  useEffect(() => {
    if (isFullyCompleted && !operator?.onboarding_completed_at) {
      // Mark as completed but don't dismiss yet - let user manually dismiss
      setShowCompletionModal(true)
    }
  }, [isFullyCompleted, operator?.onboarding_completed_at])

  // Define handler functions first (before they're used in steps array)
  const handleNavigateToCreate = () => {
    // Check if payment setup is required first
    const hasPaymentSetup = operator?.stripe_onboarding_complete && 
                           operator?.stripe_charges_enabled && 
                           operator?.stripe_payouts_enabled

    if (!hasPaymentSetup) {
      // Show payment setup required message
      alert('Payment setup required! Please complete your Stripe account setup before creating activities.')
      // Navigate to payment setup instead
      onStartPaymentSetup()
      return
    }

    // Payment is set up, proceed to create tab
    onNavigateToCreate()
  }

  const handleCompleteOnboarding = () => {
    setShowCompletionModal(false)
    onCompleteOnboarding() // This will update database and hide the Setup tab
  }

  // Define the onboarding steps
  const steps = [
    {
      id: 'password',
      icon: Shield,
      title: t('setupTab.steps.password.title'),
      description: t('setupTab.steps.password.description'),
      reason: t('setupTab.steps.password.reason'),
      priority: 'high',
      required: true,
      completed: stepStatus.password,
      action: onStartPasswordSetup,
      order: 1
    },
    {
      id: 'tour', 
      icon: BookOpen,
      title: t('setupTab.steps.tour.title'),
      description: t('setupTab.steps.tour.description'),
      reason: t('setupTab.steps.tour.reason'),
      priority: 'medium',
      required: false,
      completed: stepStatus.tour,
      action: onStartTour,
      order: 2
    },
    {
      id: 'payment',
      icon: CreditCard, 
      title: t('setupTab.steps.payment.title'),
      description: t('setupTab.steps.payment.description'),
      reason: t('setupTab.steps.payment.reason'),
      priority: 'high',
      required: true,
      completed: stepStatus.payment,
      action: onStartPaymentSetup,
      order: 3
    },
    {
      id: 'firstActivity',
      icon: Plus,
      title: t('setupTab.steps.firstActivity.title'),
      description: t('setupTab.steps.firstActivity.description'),
      reason: t('setupTab.steps.firstActivity.reason'),
      priority: 'high', 
      required: true,
      completed: stepStatus.firstActivity,
      action: handleNavigateToCreate,
      order: 4
    }
  ]

  const getPriorityColor = (priority, completed) => {
    if (completed) return 'border-green-500/30 bg-green-500/10'
    switch (priority) {
      case 'high': return 'border-blue-500/30 bg-blue-500/5'
      case 'medium': return 'border-yellow-500/30 bg-yellow-500/5'
      case 'low': return 'border-slate-500/30 bg-slate-500/5'
      default: return 'border-slate-500/30 bg-slate-500/5'
    }
  }

  const getPriorityDot = (priority) => {
    switch (priority) {
      case 'high': return 'bg-blue-400'
      case 'medium': return 'bg-yellow-400'
      case 'low': return 'bg-slate-400'
      default: return 'bg-slate-400'
    }
  }


  const nextSteps = steps.filter(step => !step.completed).slice(0, 2) // Show top 2 next steps

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {t('setupTab.title')}
        </h1>
        <p className="text-slate-300 text-lg">
          {t('setupTab.subtitle')}
        </p>
      </div>

      {/* Progress Overview */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">
              {t('setupTab.progress.title')}
            </h2>
            <p className="text-slate-400">
              {t('setupTab.progress.completed', { completed: completedCount, total: totalSteps })}
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-white mb-1">
              {progressPercentage}%
            </div>
            <div className="w-32 bg-slate-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Benefits reminder */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-700/30 rounded-lg">
          <div className="flex items-center gap-3 text-green-300">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">Growth in French Polynesia</span>
          </div>
          <div className="flex items-center gap-3 text-blue-300">
            <Target className="w-5 h-5" />
            <span className="text-sm font-medium">International reach</span>
          </div>
          <div className="flex items-center gap-3 text-purple-300">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">Free to start</span>
          </div>
        </div>
      </div>

      {/* Setup Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`p-6 rounded-xl border transition-all cursor-pointer hover:border-opacity-60 group ${
              getPriorityColor(step.priority, step.completed)
            }`}
            onClick={step.action}
          >
            <div className="flex items-start gap-4">
              {/* Status indicator */}
              <div className="flex-shrink-0 mt-1">
                {step.completed ? (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    step.priority === 'high' ? 'border-blue-400' :
                    step.priority === 'medium' ? 'border-yellow-400' :
                    'border-slate-400'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${getPriorityDot(step.priority)}`} />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <step.icon className={`w-5 h-5 ${
                    step.completed ? 'text-green-400' : 'text-slate-400'
                  }`} />
                  <span className={`text-sm font-medium ${
                    step.completed ? 'text-green-400' : 'text-slate-300'
                  }`}>
                    Step {step.order}
                  </span>
                  {step.required && !step.completed && (
                    <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">
                      Required
                    </span>
                  )}
                </div>
                
                <h3 className={`text-lg font-semibold mb-2 ${
                  step.completed ? 'text-green-300' : 'text-white'
                }`}>
                  {step.title}
                </h3>
                
                <p className="text-slate-400 text-sm mb-3">
                  {step.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500 italic">
                    💡 {step.reason}
                  </div>
                  
                  {!step.completed && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">
                      <span className="text-xs font-medium">
                        {step.id === 'password' ? 'Secure Account' :
                         step.id === 'tour' ? 'Take Tour' :
                         step.id === 'payment' ? 'Setup Payments' :
                         'Create Activity'}
                      </span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {step.completed && (
                  <div className="mt-2 text-green-400 text-xs font-medium">
                    ✓ Completed
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Next Steps Section */}
      {nextSteps.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Next Steps
          </h3>
          
          <div className="space-y-3">
            {nextSteps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg cursor-pointer hover:bg-blue-500/20 transition-colors"
                onClick={step.action}
              >
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-300 text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{step.title}</div>
                  <div className="text-blue-200 text-sm">{step.description}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-8 max-w-md w-full text-center relative">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <PartyPopper className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">
              🎉 Setup Complete!
            </h3>
            
            <p className="text-green-100 mb-6">
              Congratulations! You've completed all setup steps and are ready to start earning from your tours.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleCompleteOnboarding}
                className="w-full bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Start Using VAI Tickets
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SetupTab