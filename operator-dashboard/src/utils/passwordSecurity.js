// operator-dashboard/src/utils/passwordSecurity.js
/**
 * Password Security Utilities
 * Centralized logic for password change detection and validation
 */

/**
 * Determines if an operator needs to change their password
 * @param {Object} operator - Operator object from database
 * @returns {boolean} - True if password change is required
 */
export const needsPasswordChange = (operator) => {
  if (!operator) return false
  
  // Check if operator has not completed auth setup AND has a temp password
  return !operator.auth_setup_completed && operator.temp_password
}

/**
 * Enhanced status-based password change logic with edge case handling
 * @param {Object} operator - Operator object from database
 * @returns {Object} - Password change requirements and context
 */
export const getPasswordChangeRequirement = (operator) => {
  if (!operator) {
    return { required: false, context: null, reason: 'No operator data' }
  }

  const hasAuthSetup = operator.auth_setup_completed
  const hasTempPassword = operator.temp_password
  const status = operator.status

  // Edge Case 1: Status pending + auth_setup false
  if (status === 'pending' && !hasAuthSetup) {
    return {
      required: true,
      context: 'pending_forced',
      reason: 'Pending approval with temporary password',
      showPasswordModal: false, // Don't show until approved
      message: 'Password setup will be required after approval'
    }
  }

  // Edge Case 2: Status active + auth_setup false (CRITICAL - Force change)
  if (status === 'active' && !hasAuthSetup) {
    return {
      required: true,
      context: 'forced',
      reason: 'Active operator with temporary password',
      showPasswordModal: true,
      priority: 'high'
    }
  }

  // Edge Case 3: Status suspended/inactive + auth_setup false
  if ((status === 'suspended' || status === 'inactive') && !hasAuthSetup) {
    return {
      required: true,
      context: 'suspended_forced',
      reason: 'Suspended/inactive with temporary password',
      showPasswordModal: false, // Don't show for suspended accounts
      message: 'Password setup required when account is reactivated'
    }
  }

  // Normal cases
  if (hasAuthSetup) {
    return {
      required: false,
      context: 'voluntary',
      reason: 'Password already configured',
      showPasswordModal: false
    }
  }

  if (hasTempPassword && !hasAuthSetup) {
    return {
      required: true,
      context: 'forced',
      reason: 'Temporary password needs to be changed',
      showPasswordModal: true
    }
  }

  return {
    required: false,
    context: null,
    reason: 'No password change needed'
  }
}

/**
 * Validates password strength according to industry standards
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with requirements breakdown
 */
export const validatePasswordStrength = (password) => {
  const requirements = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
  
  const allMet = Object.values(requirements).every(Boolean)
  const score = Object.values(requirements).filter(Boolean).length
  
  return { 
    valid: allMet, 
    requirements,
    score,
    strength: getPasswordStrength(score)
  }
}

/**
 * Gets password strength level based on requirements met
 * @param {number} score - Number of requirements met (0-5)
 * @returns {string} - Strength level
 */
const getPasswordStrength = (score) => {
  if (score <= 2) return 'weak'
  if (score <= 3) return 'fair'
  if (score <= 4) return 'good'
  return 'strong'
}

/**
 * Checks if operator is using a temporary password pattern
 * @param {Object} operator - Operator object
 * @returns {boolean} - True if likely using temp password
 */
export const isUsingTempPassword = (operator) => {
  if (!operator) return false
  
  // Check for temp password field existence
  if (operator.temp_password) return true
  
  // Additional checks could be added here for temp password patterns
  // e.g., checking if password follows VAI_email@domain.com pattern
  
  return false
}

/**
 * Gets password change context based on operator state
 * @param {Object} operator - Operator object
 * @param {boolean} isVoluntary - Whether this is a voluntary change
 * @returns {string} - Context: 'forced', 'voluntary', or 'reset'
 */
export const getPasswordChangeContext = (operator, isVoluntary = false) => {
  if (isVoluntary) return 'voluntary'
  
  const requirement = getPasswordChangeRequirement(operator)
  return requirement.context || 'voluntary'
}

/**
 * Determines if password change can be dismissed
 * @param {string} context - Password change context
 * @returns {boolean} - True if user can dismiss the modal
 */
export const canDismissPasswordChange = (context) => {
  return !['forced', 'pending_forced', 'suspended_forced'].includes(context)
}

/**
 * Gets appropriate messaging for different password change scenarios
 * @param {Object} operator - Operator object
 * @returns {Object} - Messaging and UI guidance
 */
export const getPasswordChangeMessaging = (operator) => {
  const requirement = getPasswordChangeRequirement(operator)
  
  const messages = {
    forced: {
      title: 'Security Setup Required',
      subtitle: 'Please create your secure password to continue using the platform.',
      urgency: 'high',
      icon: 'shield'
    },
    voluntary: {
      title: 'Change Password',
      subtitle: 'Update your account password for enhanced security.',
      urgency: 'low',
      icon: 'lock'
    },
    pending_forced: {
      title: 'Password Setup Pending',
      subtitle: 'You will need to create a secure password after approval.',
      urgency: 'medium',
      icon: 'clock'
    },
    suspended_forced: {
      title: 'Password Setup Required',
      subtitle: 'A secure password will be required when your account is reactivated.',
      urgency: 'medium',
      icon: 'shield'
    }
  }
  
  return messages[requirement.context] || messages.voluntary
}

/**
 * Edge case detector for debugging and monitoring
 * @param {Object} operator - Operator object
 * @returns {Array} - List of detected edge cases
 */
export const detectPasswordEdgeCases = (operator) => {
  if (!operator) return []
  
  const edgeCases = []
  const requirement = getPasswordChangeRequirement(operator)
  
  // Detect unusual combinations
  if (operator.status === 'pending' && !operator.auth_setup_completed) {
    edgeCases.push('PENDING_NO_AUTH_SETUP')
  }
  
  if (operator.status === 'active' && !operator.auth_setup_completed) {
    edgeCases.push('ACTIVE_NO_AUTH_SETUP') // Critical case
  }
  
  if (operator.status === 'suspended' && !operator.auth_setup_completed) {
    edgeCases.push('SUSPENDED_NO_AUTH_SETUP')
  }
  
  if (operator.auth_setup_completed && operator.temp_password) {
    edgeCases.push('AUTH_SETUP_BUT_TEMP_PASSWORD_EXISTS') // Data inconsistency
  }
  
  if (!operator.auth_setup_completed && !operator.temp_password) {
    edgeCases.push('NO_AUTH_SETUP_NO_TEMP_PASSWORD') // Missing temp password
  }
  
  return edgeCases
}