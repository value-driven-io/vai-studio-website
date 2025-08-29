// onboardingStateManager.js - Centralized state management for operator onboarding flow
import { supabase } from '../lib/supabase'

class OnboardingStateManager {
  constructor() {
    this.listeners = new Set()
    this.currentStep = null
    this.completedSteps = {}
    this.operatorId = null
  }

  // Initialize with operator data
  initialize(operator) {
    if (!operator) return

    this.operatorId = operator.id
    this.completedSteps = this.calculateCompletedSteps(operator)
    this.currentStep = this.determineCurrentStep()
    this.notifyListeners()
  }

  // Calculate which steps are completed based on operator data
  calculateCompletedSteps(operator) {
    const hasSecurePassword = operator.auth_setup_completed || false
    const hasCompletedTour = localStorage.getItem(`vai-tour-completed-${operator.id}`) === 'true'
    const hasPaymentSetup = (operator.stripe_onboarding_complete && operator.stripe_charges_enabled && operator.stripe_payouts_enabled) || false
    const hasFirstActivity = (operator.tours_created && operator.tours_created > 0) || false

    return {
      password: hasSecurePassword,
      tour: hasCompletedTour,
      payment: hasPaymentSetup,
      firstActivity: hasFirstActivity
    }
  }

  // Determine what step the user should focus on next
  determineCurrentStep() {
    const steps = ['password', 'tour', 'payment', 'firstActivity']
    
    // Find first incomplete step
    for (const step of steps) {
      if (!this.completedSteps[step]) {
        return step
      }
    }
    
    return null // All steps completed
  }

  // Get onboarding progress percentage
  getProgressPercentage() {
    const totalSteps = 4
    const completedCount = Object.values(this.completedSteps).filter(Boolean).length
    return Math.round((completedCount / totalSteps) * 100)
  }

  // Check if onboarding is complete
  isOnboardingComplete() {
    return Object.values(this.completedSteps).every(Boolean)
  }

  // Get next priority action for the user
  getNextAction() {
    if (this.isOnboardingComplete()) {
      return {
        type: 'completed',
        message: 'All onboarding steps completed!',
        action: null
      }
    }

    const currentStep = this.currentStep
    const priorities = {
      password: { priority: 'high', required: true },
      payment: { priority: 'high', required: true },
      firstActivity: { priority: 'high', required: true },
      tour: { priority: 'medium', required: false }
    }

    return {
      type: 'action_required',
      step: currentStep,
      priority: priorities[currentStep]?.priority || 'medium',
      required: priorities[currentStep]?.required || false,
      message: this.getStepMessage(currentStep)
    }
  }

  // Get contextual message for current step
  getStepMessage(step) {
    const messages = {
      password: 'Secure your account with a strong password',
      tour: 'Take a quick tour to learn the platform',
      payment: 'Set up payments to receive money from bookings',
      firstActivity: 'Create your first activity to start earning'
    }
    return messages[step] || 'Continue with your setup'
  }

  // Mark a step as completed and update state
  async markStepCompleted(stepId, updateDatabase = true) {
    this.completedSteps[stepId] = true
    this.currentStep = this.determineCurrentStep()

    // Update localStorage for tour completion
    if (stepId === 'tour' && this.operatorId) {
      localStorage.setItem(`vai-tour-completed-${this.operatorId}`, 'true')
    }

    // Update database if needed
    if (updateDatabase && this.operatorId) {
      try {
        await this.syncToDatabase(stepId)
      } catch (error) {
        console.error('Failed to sync onboarding step to database:', error)
      }
    }

    this.notifyListeners()
  }

  // Sync step completion to database
  async syncToDatabase(stepId) {
    const updates = {}
    
    console.log(`📝 Attempting to sync step "${stepId}" to database for operator ${this.operatorId}`)
    
    switch (stepId) {
      case 'password':
        updates.auth_setup_completed = true
        // Remove temp_password update as it might not exist or have constraints
        // updates.temp_password = null
        break
      case 'payment':
        // Payment setup is handled by stripe webhooks
        break
      case 'firstActivity':
        // Activity creation is handled by tour creation
        break
      case 'tour':
        // Tour completion is stored in localStorage only
        return
    }

    if (Object.keys(updates).length > 0) {
      console.log('📝 Database updates to apply:', updates)
      
      const { error } = await supabase
        .from('operators')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.operatorId)

      if (error) {
        console.error('❌ Database sync error:', error)
        console.error('❌ Attempted updates:', updates)
        console.error('❌ Operator ID:', this.operatorId)
        throw error
      } else {
        console.log('✅ Database sync successful for step:', stepId)
      }
    } else {
      console.log('📝 No database updates needed for step:', stepId)
    }
  }

  // Check if operator needs immediate onboarding attention
  needsImmediateAttention() {
    // Password setup is critical and blocks other functionality
    return !this.completedSteps.password
  }

  // Check if operator can dismiss onboarding
  canDismissOnboarding() {
    // Can only dismiss if non-critical steps remain
    const criticalSteps = ['password', 'payment']
    const hasCriticalIncomplete = criticalSteps.some(step => !this.completedSteps[step])
    return !hasCriticalIncomplete
  }

  // Get recommended next steps as a prioritized list
  getRecommendedSteps(limit = 3) {
    const allSteps = [
      { id: 'password', priority: 'high', order: 1, required: true },
      { id: 'payment', priority: 'high', order: 3, required: true },
      { id: 'firstActivity', priority: 'high', order: 4, required: true },
      { id: 'tour', priority: 'medium', order: 2, required: false }
    ]

    const incompleteSteps = allSteps
      .filter(step => !this.completedSteps[step.id])
      .sort((a, b) => {
        // Sort by priority first, then by order
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
        return priorityDiff !== 0 ? priorityDiff : a.order - b.order
      })

    return incompleteSteps.slice(0, limit)
  }

  // Add listener for state changes
  addListener(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  // Notify all listeners of state changes
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener({
          completedSteps: { ...this.completedSteps },
          currentStep: this.currentStep,
          progress: this.getProgressPercentage(),
          isComplete: this.isOnboardingComplete(),
          nextAction: this.getNextAction(),
          recommendedSteps: this.getRecommendedSteps()
        })
      } catch (error) {
        console.error('Error notifying onboarding listener:', error)
      }
    })
  }

  // Reset onboarding state (for testing/debugging)
  reset() {
    this.completedSteps = {
      password: false,
      tour: false,
      payment: false,
      firstActivity: false
    }
    this.currentStep = 'password'
    if (this.operatorId) {
      localStorage.removeItem(`vai-tour-completed-${this.operatorId}`)
    }
    this.notifyListeners()
  }

  // Get current state snapshot
  getState() {
    return {
      completedSteps: { ...this.completedSteps },
      currentStep: this.currentStep,
      progress: this.getProgressPercentage(),
      isComplete: this.isOnboardingComplete(),
      nextAction: this.getNextAction(),
      recommendedSteps: this.getRecommendedSteps(),
      operatorId: this.operatorId
    }
  }

  // Update specific operator data without full reinitialization
  updateOperatorData(updates) {
    if (!this.operatorId) return

    // Check for relevant changes that affect onboarding
    let hasChanges = false

    if (updates.auth_setup_completed !== undefined) {
      const newValue = updates.auth_setup_completed
      if (this.completedSteps.password !== newValue) {
        this.completedSteps.password = newValue
        hasChanges = true
      }
    }

    if (updates.stripe_onboarding_complete !== undefined || 
        updates.stripe_charges_enabled !== undefined || 
        updates.stripe_payouts_enabled !== undefined) {
      const hasFullPaymentSetup = updates.stripe_onboarding_complete && 
                                  updates.stripe_charges_enabled && 
                                  updates.stripe_payouts_enabled
      if (this.completedSteps.payment !== hasFullPaymentSetup) {
        this.completedSteps.payment = hasFullPaymentSetup
        hasChanges = true
      }
    }

    if (updates.tours_created !== undefined) {
      const hasActivities = updates.tours_created > 0
      if (this.completedSteps.firstActivity !== hasActivities) {
        this.completedSteps.firstActivity = hasActivities
        hasChanges = true
      }
    }

    if (hasChanges) {
      this.currentStep = this.determineCurrentStep()
      this.notifyListeners()
    }
  }
}

// Create singleton instance
const onboardingStateManager = new OnboardingStateManager()

export default onboardingStateManager