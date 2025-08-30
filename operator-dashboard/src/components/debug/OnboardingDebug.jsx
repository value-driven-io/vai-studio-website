// OnboardingDebug.jsx - Debug panel for testing onboarding system
import React, { useState, useEffect } from 'react'
import onboardingStateManager from '../../services/onboardingStateManager'
import { Bug, RotateCcw, CheckCircle, XCircle } from 'lucide-react'

const OnboardingDebug = ({ operator }) => {
  const [onboardingState, setOnboardingState] = useState({})
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    if (!operator) return

    const unsubscribe = onboardingStateManager.addListener((newState) => {
      setOnboardingState(newState)
    })

    // Initialize
    onboardingStateManager.initialize(operator)

    return unsubscribe
  }, [operator])

  const resetOnboarding = () => {
    onboardingStateManager.reset()
    localStorage.removeItem(`vai-tour-completed-${operator?.id}`)
    alert('Onboarding state reset! Refresh the page to see changes.')
  }

  const simulateNewOperator = async () => {
    // Temporarily override operator data to simulate new operator
    onboardingStateManager.initialize({
      ...operator,
      auth_setup_completed: false,
      stripe_onboarding_complete: false,
      stripe_charges_enabled: false,
      stripe_payouts_enabled: false,
      tours_created: 0
    })
    localStorage.removeItem(`vai-tour-completed-${operator?.id}`)
    alert('Simulated new operator state! Check the dashboard.')
  }

  const forceShowTour = () => {
    localStorage.removeItem(`vai-tour-completed-${operator?.id}`)
    window.location.reload()
  }

  if (!operator) return null

  return (
    <>
      {/* Debug Toggle Button */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="fixed bottom-20 right-4 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg z-50"
        title="Toggle Onboarding Debug"
      >
        <Bug className="w-4 h-4" />
      </button>

      {/* Debug Panel */}
      {showDebug && (
        <div className="fixed bottom-32 right-4 bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-xl z-50 w-80 max-h-96 overflow-y-auto">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Bug className="w-4 h-4" />
            Onboarding Debug
          </h3>

          {/* Current State */}
          <div className="mb-4">
            <h4 className="text-slate-300 font-medium mb-2">Current State:</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Progress:</span>
                <span className="text-white">{onboardingState.progress || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Step:</span>
                <span className="text-white">{onboardingState.currentStep || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Complete:</span>
                <span className="text-white">{onboardingState.isComplete ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Steps Status */}
          <div className="mb-4">
            <h4 className="text-slate-300 font-medium mb-2">Steps:</h4>
            <div className="space-y-1 text-xs">
              {Object.entries(onboardingState.completedSteps || {}).map(([step, completed]) => (
                <div key={step} className="flex justify-between items-center">
                  <span className="text-slate-400 capitalize">{step}:</span>
                  <div className="flex items-center gap-1">
                    {completed ? (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-400" />
                    )}
                    <span className="text-white">{completed ? 'Done' : 'Pending'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operator Info */}
          <div className="mb-4">
            <h4 className="text-slate-300 font-medium mb-2">Operator Info:</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-white">{operator.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Auth Setup:</span>
                <span className="text-white">{operator.auth_setup_completed ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stripe Setup:</span>
                <span className="text-white">{operator.stripe_onboarding_complete ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tours Created:</span>
                <span className="text-white">{operator.tours_created || 0}</span>
              </div>
            </div>
          </div>

          {/* Debug Actions */}
          <div className="space-y-2">
            <button
              onClick={resetOnboarding}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-xs flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Onboarding
            </button>
            
            <button
              onClick={simulateNewOperator}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-xs"
            >
              Simulate New Operator
            </button>
            
            <button
              onClick={forceShowTour}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-xs"
            >
              Force Show Tour
            </button>
          </div>

          {/* Recommended Steps */}
          {onboardingState.recommendedSteps?.length > 0 && (
            <div className="mt-4">
              <h4 className="text-slate-300 font-medium mb-2">Next Steps:</h4>
              <div className="space-y-1">
                {onboardingState.recommendedSteps.map((step, index) => (
                  <div key={step.id} className="text-xs text-slate-400">
                    {index + 1}. {step.id} ({step.priority})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default OnboardingDebug