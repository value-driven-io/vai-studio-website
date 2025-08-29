// OnboardingProgress.jsx - Dynamic todo list and progress tracking for operator onboarding
import React, { useState, useEffect, useMemo } from 'react'
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
  ChevronDown,
  ChevronUp,
  Target,
  TrendingUp,
  Sparkles,
  PartyPopper,
  X
} from 'lucide-react'

const OnboardingProgress = ({ 
  operator, 
  onStartPasswordSetup,
  onStartTour, 
  onStartPaymentSetup,
  onNavigateToCreate,
  onDismiss,
  compact = false
}) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(!compact)
  const [completedSteps, setCompletedSteps] = useState({})
  const [showCelebration, setShowCelebration] = useState(false)
  const [justCompleted, setJustCompleted] = useState(null)

  // Calculate onboarding status based on operator data
  const calculateStepStatus = () => {
    const hasSecurePassword = operator?.auth_setup_completed || false
    const hasCompletedTour = localStorage.getItem(`vai-tour-completed-${operator?.id}`) === 'true'
    const hasPaymentSetup = operator?.stripe_onboarding_complete || false
    const hasFirstActivity = operator?.tours_created > 0 || false

    return {
      password: hasSecurePassword,
      tour: hasCompletedTour,
      payment: hasPaymentSetup,
      firstActivity: hasFirstActivity
    }
  }

  // Memoize stepStatus to prevent infinite re-renders
  const stepStatus = useMemo(() => calculateStepStatus(), [
    operator?.auth_setup_completed,
    operator?.stripe_onboarding_complete,
    operator?.tours_created,
    operator?.id
  ])
  
  const totalSteps = 4
  const completedCount = Object.values(stepStatus).filter(Boolean).length

  // Watch for step completion to trigger celebration - Fixed to prevent infinite loops
  useEffect(() => {
    // Only run if we have valid step status and it's different from current completedSteps
    if (!stepStatus) return
    
    // Check if any step was just completed
    Object.entries(stepStatus).forEach(([stepId, isCompleted]) => {
      if (isCompleted && !completedSteps[stepId]) {
        // This step was just completed!
        setJustCompleted(stepId)
        setShowCelebration(true)
        // Removed auto-timeout - user must manually dismiss
      }
    })
    
    // Only update if there's actually a change
    const hasChanged = Object.entries(stepStatus).some(([stepId, isCompleted]) => 
      completedSteps[stepId] !== isCompleted
    )
    
    if (hasChanged) {
      setCompletedSteps(stepStatus)
    }
  }, [
    stepStatus.password,
    stepStatus.tour, 
    stepStatus.payment,
    stepStatus.firstActivity
  ])

  // Define the onboarding steps with dynamic status
  const steps = [
    {
      id: 'password',
      icon: Shield,
      priority: 'high',
      required: true,
      completed: stepStatus.password,
      action: onStartPasswordSetup,
      order: 1
    },
    {
      id: 'tour', 
      icon: BookOpen,
      priority: 'medium',
      required: false,
      completed: stepStatus.tour,
      action: onStartTour,
      order: 2
    },
    {
      id: 'payment',
      icon: CreditCard, 
      priority: 'high',
      required: true,
      completed: stepStatus.payment,
      action: onStartPaymentSetup,
      order: 3
    },
    {
      id: 'firstActivity',
      icon: Plus,
      priority: 'high', 
      required: true,
      completed: stepStatus.firstActivity,
      action: onNavigateToCreate,
      order: 4
    }
  ]

  // Generate dynamic todo items based on incomplete steps
  const generateTodoItems = () => {
    const todos = []
    
    steps
      .filter(step => !step.completed)
      .sort((a, b) => {
        // Sort by priority first (high > medium > low), then by order
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        return priorityDiff !== 0 ? priorityDiff : a.order - b.order
      })
      .forEach(step => {
        todos.push({
          ...step,
          title: t(`onboarding.steps.${step.id}.title`),
          description: t(`onboarding.steps.${step.id}.description`),
          reason: t(`onboarding.steps.${step.id}.reason`),
          importance: t(`onboarding.steps.${step.id}.importance`)
        })
      })

    return todos
  }

  const todoItems = generateTodoItems()
  const isFullyOnboarded = completedCount === totalSteps

  // Don't show if operator is fully onboarded and it's been more than a day
  const shouldHideCompletely = isFullyOnboarded && compact

  if (shouldHideCompletely) {
    return null
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-blue-500/30 bg-blue-500/5' // Changed from red to blue
      case 'medium': return 'border-yellow-500/30 bg-yellow-500/5'
      case 'low': return 'border-slate-500/30 bg-slate-500/5'
      default: return 'border-slate-500/30 bg-slate-500/5'
    }
  }

  const getPriorityDot = (priority) => {
    switch (priority) {
      case 'high': return 'bg-blue-400' // Changed from red to blue
      case 'medium': return 'bg-yellow-400'
      case 'low': return 'bg-slate-400'
      default: return 'bg-slate-400'
    }
  }

  if (isFullyOnboarded) {
    return (
      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <Star className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-400 mb-1">
              {t('onboarding.completion.title')}
            </h3>
            <p className="text-green-300 text-sm">
              {t('onboarding.completion.subtitle')}
            </p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-green-300 hover:text-green-200 text-xs px-2 py-1 rounded"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-green-300">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {t('onboarding.motivation.earnPotential')}
          </div>
          <span>•</span>
          <div>{t('onboarding.completion.nextSteps')}</div>
          <span>•</span>
          <button
            onClick={onNavigateToCreate}
            className="text-green-200 hover:text-white underline"
          >
            {t('onboarding.completion.startCreating')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Celebration Overlay - Manually dismissible */}
      {showCelebration && justCompleted && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-8 mx-4 max-w-md w-full text-center animate-bounce relative">
            {/* Close button */}
            <button
              onClick={() => {
                setShowCelebration(false)
                setJustCompleted(null)
              }}
              className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              aria-label="Close celebration"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <PartyPopper className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              🎉 Great Job!
            </h3>
            <p className="text-green-100 mb-4">
              You've completed: {t(`onboarding.steps.${justCompleted}.title`)}
            </p>
            <div className="flex items-center justify-center gap-2 text-green-200 mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Keep it up! You're making great progress.</span>
              <Sparkles className="w-4 h-4" />
            </div>
            
            {/* Continue button */}
            <button
              onClick={() => {
                setShowCelebration(false)
                setJustCompleted(null)
              }}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

    <div className="bg-slate-800 rounded-lg border border-slate-700 mb-6">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {t('onboarding.progress.title')}
              </h3>
              <p className="text-slate-400 text-sm">
                {t('onboarding.progress.stepsCompleted', { 
                  completed: completedCount, 
                  total: totalSteps 
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              <div className="w-20 bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / totalSteps) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {Math.round((completedCount / totalSteps) * 100)}%
              </span>
            </div>
            
            {compact && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {(!compact || isExpanded) && (
        <div className="p-4">
          {/* Steps Overview with improved visual indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`p-4 rounded-lg border transition-all cursor-pointer hover:border-opacity-60 ${
                  step.completed 
                    ? 'border-green-500/30 bg-green-500/10' 
                    : getPriorityColor(step.priority)
                }`}
                onClick={step.action}
              >
                <div className="flex items-start gap-3">
                  {/* Improved checkbox/checkmark visual */}
                  <div className="flex-shrink-0 mt-1">
                    {step.completed ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        step.priority === 'high' ? 'border-blue-400' :
                        step.priority === 'medium' ? 'border-yellow-400' :
                        'border-slate-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${getPriorityDot(step.priority)}`} />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <step.icon className={`w-4 h-4 ${
                        step.completed ? 'text-green-400' : 'text-slate-400'
                      }`} />
                      <span className={`text-xs font-medium ${
                        step.completed ? 'text-green-400' : 'text-slate-300'
                      }`}>
                        {t('onboarding.progress.step', { number: step.order })}
                      </span>
                      {step.required && !step.completed && (
                        <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">
                          Required
                        </span>
                      )}
                    </div>
                    
                    <h4 className={`text-sm font-medium mb-2 ${
                      step.completed ? 'text-green-300' : 'text-white'
                    }`}>
                      {t(`onboarding.steps.${step.id}.title`)}
                    </h4>
                    
                    {step.completed ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-green-400">
                          ✓ {t('onboarding.progress.completed')}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400">
                        {t(`onboarding.steps.${step.id}.description`)}
                      </div>
                    )}
                  </div>
                  
                  {!step.completed && (
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4 text-blue-400" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Next Steps - Dynamic Todo List */}
          {todoItems.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                {t('onboarding.todoList.title')}
              </h4>
              
              <div className="space-y-3">
                {todoItems.slice(0, 3).map((todo, index) => (
                  <div
                    key={todo.id}
                    className={`p-3 rounded-lg border ${getPriorityColor(todo.priority)} hover:border-opacity-50 transition-all cursor-pointer group`}
                    onClick={todo.action}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        todo.priority === 'high' ? 'bg-blue-500/20' :
                        todo.priority === 'medium' ? 'bg-yellow-500/20' :
                        'bg-slate-500/20'
                      }`}>
                        <todo.icon className={`w-4 h-4 ${
                          todo.priority === 'high' ? 'text-blue-400' :
                          todo.priority === 'medium' ? 'text-yellow-400' :
                          'text-slate-400'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-white group-hover:text-blue-300 transition-colors">
                            {todo.title}
                          </h5>
                          {todo.required && (
                            <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">
                              {t('onboarding.progress.required')}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-slate-400 mb-2">
                          {todo.description}
                        </p>
                        
                        <p className="text-xs text-slate-500 italic">
                          💡 {todo.reason}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-slate-400">
                          {t(`onboarding.steps.${todo.id}.action`)}
                        </span>
                        <ArrowRight className="w-4 h-4 text-blue-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {todoItems.length > 3 && (
                <p className="text-xs text-slate-500 text-center mt-3">
                  +{todoItems.length - 3} more steps to complete
                </p>
              )}
            </div>
          )}

          {/* Motivation section */}
          <div className="mt-6 pt-4 border-t border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <div>{t('onboarding.motivation.earnPotential')}</div>
                <div>{t('onboarding.motivation.quickSetup')}</div>
                <div>{t('onboarding.motivation.freeToStart')}</div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={onDismiss}
                  className="px-3 py-1 text-slate-400 hover:text-white transition-colors"
                >
                  {t('onboarding.progress.finishLater')}
                </button>
                {todoItems.length > 0 && (
                  <button
                    onClick={todoItems[0]?.action}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                  >
                    {t('onboarding.progress.continueSetup')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

export default OnboardingProgress