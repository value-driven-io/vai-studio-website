// src/hooks/useRegistration.js
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { operatorRegistrationService } from '../services/operatorRegistration'
import toast from 'react-hot-toast'

export const useRegistration = () => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const registerOperator = async (formData) => {
    try {
      setLoading(true)
      setError(null)

      console.log('🚀 Starting registration process...')

      // Call the registration service
      const result = await operatorRegistrationService.registerOperator(formData)

      if (result.success) {
        console.log('✅ Registration successful:', result.operator.company_name)
        
        // Show success toast with i18n
        toast.success(t('registration.messages.success'), {
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #059669'
          }
        })

        return result
      } else {
        console.error('❌ Registration failed:', result.error)
        
        // Set error with i18n fallback
        const errorMessage = getLocalizedError(result.error)
        setError(errorMessage)
        
        // Show error toast
        toast.error(errorMessage, {
          duration: 6000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #dc2626'
          }
        })

        return result
      }

    } catch (error) {
      console.error('❌ Registration hook error:', error)
      const errorMessage = getLocalizedError(error.message)
      
      setError(errorMessage)
      toast.error(errorMessage, {
        duration: 6000,
        style: {
          background: '#1e293b',
          color: '#f1f5f9',
          border: '1px solid #dc2626'
        }
      })

      return {
        success: false,
        error: errorMessage
      }

    } finally {
      setLoading(false)
    }
  }

  const checkApprovalStatus = async (email) => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 Checking approval status for:', email)
      const result = await operatorRegistrationService.checkApprovalStatus(email)
      
      console.log('📊 Status check result:', result)
      return result

    } catch (error) {
      console.error('❌ Approval status check error:', error)
      const errorMessage = getLocalizedError(error.message)
      setError(errorMessage)
      
      return { 
        found: false, 
        status: null, 
        error: errorMessage 
      }

    } finally {
      setLoading(false)
    }
  }

  // Helper function to get localized error messages
  const getLocalizedError = (errorString) => {
    if (!errorString) return t('registration.messages.failed')

    // Map common errors to translation keys
    if (errorString.includes('already exists')) {
      return t('registration.messages.duplicateEmail')
    }
    
    if (errorString.includes('Company name is required')) {
      return t('registration.validation.companyNameRequired')
    }
    
    if (errorString.includes('Contact person is required')) {
      return t('registration.validation.contactPersonRequired')
    }
    
    if (errorString.includes('Email is required')) {
      return t('registration.validation.emailRequired')
    }
    
    if (errorString.includes('WhatsApp number is required')) {
      return t('registration.validation.whatsappRequired')
    }
    
    if (errorString.includes('Island selection is required')) {
      return t('registration.validation.islandRequired')
    }
    
    if (errorString.includes('Business description is required')) {
      return t('registration.validation.descriptionRequired')
    }
    
    if (errorString.includes('At least one tour type')) {
      return t('registration.validation.tourTypesRequired')
    }
    
    if (errorString.includes('Target bookings selection')) {
      return t('registration.validation.targetBookingsRequired')
    }
    
    if (errorString.includes('Customer type preference')) {
      return t('registration.validation.customerTypeRequired')
    }
    
    if (errorString.includes('Terms of service')) {
      return t('registration.validation.termsRequired')
    }
    
    if (errorString.includes('Valid email address')) {
      return t('registration.validation.emailInvalid')
    }
    
    if (errorString.includes('Valid WhatsApp number')) {
      return t('registration.validation.phoneInvalid')
    }
    
    if (errorString.includes('Company name must be at least')) {
      return t('registration.validation.companyNameTooShort')
    }

    // Network/system errors
    if (errorString.includes('Failed to fetch') || errorString.includes('network')) {
      return 'Network error. Please check your connection and try again.'
    }

    if (errorString.includes('timeout')) {
      return 'Request timed out. Please try again.'
    }

    // Default fallback - return original message for unhandled errors
    return errorString || t('registration.messages.failed')
  }

  const clearError = () => {
    setError(null)
  }

  // Return the hook interface
  return {
    loading,
    error,
    registerOperator,
    checkApprovalStatus,
    clearError
  }
}