import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, HelpCircle, Lightbulb } from 'lucide-react'

const ContextualTooltip = ({ 
  children, 
  tooltipKey, 
  placement = 'top',
  type = 'info', // 'info', 'onboarding', 'help'
  className = '',
  disabled = false,
  persistent = false, // If true, tooltip doesn't auto-dismiss after first view
  delay = 0,
  maxWidth = 'max-w-sm'
}) => {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const tooltipRef = useRef(null)
  const timeoutRef = useRef(null)

  // Check if this tooltip has been dismissed before
  useEffect(() => {
    if (!persistent) {
      const dismissedTooltips = JSON.parse(localStorage.getItem('vai-dismissed-tooltips') || '[]')
      if (dismissedTooltips.includes(tooltipKey)) {
        setIsDismissed(true)
      }
    }
  }, [tooltipKey, persistent])

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const viewport = { width: window.innerWidth, height: window.innerHeight }
    
    let top = 0
    let left = 0
    const gap = 8
    
    // Calculate position based on placement preference
    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - gap
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
        
        // Adjust if tooltip goes off screen
        if (top < gap) {
          top = triggerRect.bottom + gap // Flip to bottom
        }
        if (left < gap) {
          left = gap
        } else if (left + tooltipRect.width > viewport.width - gap) {
          left = viewport.width - tooltipRect.width - gap
        }
        break
        
      case 'bottom':
        top = triggerRect.bottom + gap
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)
        
        if (top + tooltipRect.height > viewport.height - gap) {
          top = triggerRect.top - tooltipRect.height - gap // Flip to top
        }
        if (left < gap) {
          left = gap
        } else if (left + tooltipRect.width > viewport.width - gap) {
          left = viewport.width - tooltipRect.width - gap
        }
        break
        
      case 'left':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
        left = triggerRect.left - tooltipRect.width - gap
        
        if (left < gap) {
          left = triggerRect.right + gap // Flip to right
        }
        if (top < gap) {
          top = gap
        } else if (top + tooltipRect.height > viewport.height - gap) {
          top = viewport.height - tooltipRect.height - gap
        }
        break
        
      case 'right':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)
        left = triggerRect.right + gap
        
        if (left + tooltipRect.width > viewport.width - gap) {
          left = triggerRect.left - tooltipRect.width - gap // Flip to left
        }
        if (top < gap) {
          top = gap
        } else if (top + tooltipRect.height > viewport.height - gap) {
          top = viewport.height - tooltipRect.height - gap
        }
        break
    }
    
    setPosition({ top, left })
  }

  const showTooltip = () => {
    if (disabled || isDismissed) return
    
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true)
      }, delay)
    } else {
      setIsVisible(true)
    }
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const dismissTooltip = (permanent = false) => {
    setIsVisible(false)
    
    if (permanent && !persistent) {
      setIsDismissed(true)
      const dismissedTooltips = JSON.parse(localStorage.getItem('vai-dismissed-tooltips') || '[]')
      if (!dismissedTooltips.includes(tooltipKey)) {
        dismissedTooltips.push(tooltipKey)
        localStorage.setItem('vai-dismissed-tooltips', JSON.stringify(dismissedTooltips))
      }
    }
  }

  useEffect(() => {
    if (isVisible) {
      // Small delay to ensure DOM is ready
      setTimeout(calculatePosition, 10)
    }
  }, [isVisible, placement])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (disabled || isDismissed) {
    return <div ref={triggerRef}>{children}</div>
  }

  const tooltipContent = t(`onboarding.tooltips.${tooltipKey}`)
  if (!tooltipContent || tooltipContent.includes('onboarding.tooltips.')) {
    // Fallback if translation key doesn't exist
    return <div ref={triggerRef}>{children}</div>
  }

  const getTypeStyles = () => {
    switch (type) {
      case 'onboarding':
        return {
          background: 'bg-gradient-to-r from-blue-600 to-purple-600',
          border: 'border-blue-500/30',
          text: 'text-white',
          icon: <Lightbulb className="w-4 h-4 text-yellow-300" />
        }
      case 'help':
        return {
          background: 'bg-slate-800',
          border: 'border-slate-600',
          text: 'text-slate-200',
          icon: <HelpCircle className="w-4 h-4 text-blue-400" />
        }
      default: // 'info'
        return {
          background: 'bg-slate-900/95',
          border: 'border-slate-700',
          text: 'text-slate-200',
          icon: <HelpCircle className="w-4 h-4 text-slate-400" />
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <>
      <div 
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="relative"
      >
        {children}
      </div>
      
      {isVisible && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 z-[9997] sm:hidden" 
            onClick={() => dismissTooltip()} 
          />
          
          {/* Tooltip */}
          <div
            ref={tooltipRef}
            className={`fixed z-[10000] ${maxWidth} p-4 rounded-lg shadow-xl border backdrop-blur-sm ${styles.background} ${styles.border} ${styles.text} ${className}`}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              {styles.icon}
              <div className="flex-1">
                <p className="text-sm leading-relaxed">{tooltipContent}</p>
                
                <div className="flex items-center justify-between mt-3 gap-2">
                  <button
                    onClick={() => dismissTooltip(false)}
                    className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    {t('onboarding.controls.dismiss')}
                  </button>
                  
                  {!persistent && (
                    <button
                      onClick={() => dismissTooltip(true)}
                      className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {t('onboarding.controls.dismissAll')}
                    </button>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => dismissTooltip()}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

// Utility function to reset all dismissed tooltips (useful for testing/onboarding reset)
export const resetAllTooltips = () => {
  localStorage.removeItem('vai-dismissed-tooltips')
}

// Hook to check if user has dismissed many tooltips (experienced user)
export const useTooltipExperience = () => {
  const [isExperienced, setIsExperienced] = useState(false)
  
  useEffect(() => {
    const dismissedTooltips = JSON.parse(localStorage.getItem('vai-dismissed-tooltips') || '[]')
    setIsExperienced(dismissedTooltips.length > 5)
  }, [])
  
  return isExperienced
}

export default ContextualTooltip