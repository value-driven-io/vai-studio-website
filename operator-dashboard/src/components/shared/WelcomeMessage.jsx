import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  X, 
  Sparkles, 
  ChevronRight,
  Users,
  TrendingUp,
  DollarSign
} from 'lucide-react'

const WelcomeMessage = ({ operator, onDismiss, onStartOnboarding }) => {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  const handleStartOnboarding = () => {
    setIsVisible(false)
    onStartOnboarding?.()
  }

  return (
    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6 mb-6 relative">
      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 w-8 h-8 bg-blue-500/20 hover:bg-blue-500/30 rounded-full flex items-center justify-center transition-colors"
        aria-label="Close welcome message"
      >
        <X className="w-4 h-4 text-blue-300" />
      </button>

      {/* Welcome content */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-blue-400" />
        </div>
        
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white mb-2">
            🌸 Ia ora na, {operator?.company_name || 'Welcome'}!
          </h2>
          
          <p className="text-blue-100 mb-4">
            Welcome to VAI Tickets - French Polynesia's premier tour booking platform. 
            You're now part of a community of operators connecting travelers with authentic island experiences.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-green-300">Keep 89% of revenue</div>
                <div className="text-xs text-green-400/80">Industry-leading commission</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-purple-300">Global reach</div>
                <div className="text-xs text-purple-400/80">Connect with worldwide travelers</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-blue-300">Free to start</div>
                <div className="text-xs text-blue-400/80">No setup or monthly fees</div>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleStartOnboarding}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Start Setup Guide
              <ChevronRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleDismiss}
              className="flex items-center justify-center px-6 py-3 border border-blue-500/30 text-blue-300 hover:bg-blue-500/10 rounded-lg font-medium transition-colors"
            >
              I'll explore on my own
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeMessage