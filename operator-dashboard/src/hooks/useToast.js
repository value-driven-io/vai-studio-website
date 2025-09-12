import { useState, useCallback } from 'react'

let toastId = 0

const useToast = () => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = ++toastId
    const newToast = {
      id,
      ...toast,
      createdAt: Date.now()
    }
    
    setToasts(prev => [...prev, newToast])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  // Convenience methods
  const showSuccess = useCallback((title, message, details) => {
    return addToast({
      type: 'success',
      title,
      message,
      details
    })
  }, [addToast])

  const showError = useCallback((title, message, details) => {
    return addToast({
      type: 'error', 
      title,
      message,
      details
    })
  }, [addToast])

  const showWarning = useCallback((title, message, details) => {
    return addToast({
      type: 'warning',
      title, 
      message,
      details
    })
  }, [addToast])

  const showInfo = useCallback((title, message, details) => {
    return addToast({
      type: 'info',
      title,
      message, 
      details
    })
  }, [addToast])

  // Schedule-specific convenience method
  const showScheduleUpdateSuccess = useCallback((results) => {
    const details = []
    
    if (results.updated > 0) {
      details.push({
        icon: '✅',
        text: `${results.updated} activities updated with new schedule`
      })
    }
    
    if (results.preserved > 0) {
      details.push({
        icon: '🔒', 
        text: `${results.preserved} customizations preserved unchanged`
      })
    }
    
    if (results.added > 0) {
      details.push({
        icon: '➕',
        text: `${results.added} new activities added`
      })
    }
    
    if (results.removed > 0) {
      details.push({
        icon: '➖',
        text: `${results.removed} obsolete activities removed`
      })
    }

    return addToast({
      type: 'success',
      title: 'Schedule Updated Successfully!', 
      message: results.preserved > 0 ? "Your customizations are safe!" : "All changes applied successfully",
      details,
      duration: 8000 // Longer for complex updates
    })
  }, [addToast])

  const showTemplateCreatedSuccess = useCallback((templateName) => {
    return addToast({
      type: 'success',
      title: 'Template Created Successfully!',
      message: `Ready to schedule your "${templateName}"?`,
      details: [
        { icon: '📅', text: 'Create a schedule to make it bookable' },
        { icon: '✏️', text: 'Edit anytime from Templates tab' }
      ]
    })
  }, [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showScheduleUpdateSuccess,
    showTemplateCreatedSuccess
  }
}

export default useToast