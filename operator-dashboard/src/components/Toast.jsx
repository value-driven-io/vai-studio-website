import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X, Lock } from 'lucide-react'

const Toast = ({ 
  type = 'success', 
  title, 
  message, 
  details = null,
  duration = 6000, 
  showProgress = true,
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Allow animation to complete
  }

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  }

  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-400',
      title: 'text-green-900',
      text: 'text-green-700'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200', 
      icon: 'text-red-400',
      title: 'text-red-900',
      text: 'text-red-700'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-400',
      title: 'text-amber-900', 
      text: 'text-amber-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-400',
      title: 'text-blue-900',
      text: 'text-blue-700'
    }
  }

  const Icon = icons[type]
  const style = styles[type]

  if (!isVisible) return null

  return (
    <div className={`toast-container ${isVisible ? 'toast-enter' : 'toast-exit'}`}>
      <div className={`
        max-w-md w-full ${style.bg} ${style.border} border rounded-lg shadow-lg p-4
        transform transition-all duration-300 ease-out relative overflow-hidden
      `}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Icon className={`w-5 h-5 ${style.icon}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className={`text-sm font-semibold ${style.title} mb-1`}>
                {title}
              </h4>
            )}
            
            {message && (
              <p className={`text-sm ${style.text}`}>
                {message}
              </p>
            )}
            
            {details && (
              <div className={`mt-2 text-xs ${style.text} space-y-1`}>
                {Array.isArray(details) ? (
                  <ul className="space-y-1">
                    {details.map((detail, index) => (
                      <li key={index} className="flex items-center gap-1">
                        {detail.icon && <span className="flex-shrink-0">{detail.icon}</span>}
                        {detail.text}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>{details}</p>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={handleClose}
            className={`flex-shrink-0 ${style.text} hover:opacity-75 transition-opacity`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Progress bar for timed toasts */}
        {showProgress && duration > 0 && (
          <div 
            className={`toast-progress ${style.icon}`}
            style={{ animationDuration: `${duration}ms` }}
          />
        )}
      </div>
    </div>
  )
}

// Schedule Update Success Toast Component
export const ScheduleUpdateSuccessToast = ({ results, onClose }) => {
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

  return (
    <Toast
      type="success"
      title="Schedule Updated Successfully!"
      message={results.preserved > 0 ? "Your customizations are safe!" : "All changes applied successfully"}
      details={details}
      duration={8000} // Longer for complex updates
      onClose={onClose}
    />
  )
}

// Toast Container Component
export const ToastContainer = ({ children }) => (
  <div className="toast-wrapper fixed top-4 right-4 z-50 space-y-2">
    {children}
  </div>
)

export default Toast