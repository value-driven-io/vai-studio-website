import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck,
  Calendar,
  DollarSign,
  MessageCircle,
  AlertTriangle,
  Settings,
  ExternalLink,
  Sparkles
} from 'lucide-react'
import notificationService from '../../services/notificationService'
import { polynesianNow, formatPolynesianDate } from '../../utils/timezone'

const NotificationCenter = ({ 
  operator, 
  isOpen, 
  onClose, 
  onNavigateToBooking,
  onNavigateToTab,
  triggerButtonRef,
  onUnreadCountChange // New callback to update parent component
}) => {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 })
  const panelRef = useRef(null)

  // Check if user has completed onboarding tour
  const hasCompletedTour = operator && localStorage.getItem(`vai-tour-completed-${operator.id}`)

  // Get read notification states from localStorage
  const getReadNotifications = () => {
    if (!operator) return []
    const readNotifications = localStorage.getItem(`vai-read-notifications-${operator.id}`)
    return readNotifications ? JSON.parse(readNotifications) : []
  }

  // Helper function to generate UUID (compatible with all browsers)
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  // Educational sample notifications (will be replaced by real data from backend)
  const sampleNotifications = [
    // Test notification to verify system is working
    {
      id: 'sample-welcome-test', // Static ID so localStorage read state persists
      type: 'system',
      title: t('notifications.messages.welcome.title'),
      message: t('notifications.messages.welcome.content'),
      read: getReadNotifications().includes('sample-welcome-test'),
      created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      data: {},
      source: 'sample'
    }
  ]
  
  // Create onboarding restart notification (always show for testing, will be conditional in production)
  const onboardingNotification = {
    id: 'sample-onboarding-restart', // Static ID so localStorage read state persists
    type: 'system',
    title: t('notifications.messages.onboardingRestart.title'),
    message: hasCompletedTour 
      ? t('notifications.messages.onboardingRestart.completed')
      : t('notifications.messages.onboardingRestart.notCompleted'),
    read: getReadNotifications().includes('sample-onboarding-restart'),
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    data: { action: 'restart-tour' },
    source: 'sample'
  }

  useEffect(() => {
    if (operator) {
      loadNotifications()
    }
  }, [operator, hasCompletedTour, i18n.language]) // Reload when language changes

  // Listen for new notification events
  useEffect(() => {
    const handleNewNotification = (event) => {
      const { operatorId, notification } = event.detail
      if (operatorId === operator?.id) {
        console.log('📬 NotificationCenter: New notification event received, refreshing...')
        loadNotifications() // Refresh notifications
      }
    }

    window.addEventListener('newNotification', handleNewNotification)
    return () => {
      window.removeEventListener('newNotification', handleNewNotification)
    }
  }, [operator?.id])

  // Update parent component when unread count changes (avoid render timing issues)
  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount)
    }
  }, [unreadCount, onUnreadCountChange])

  // Update panel position when opened
  const updatePanelPosition = () => {
    if (triggerButtonRef.current) {
      const rect = triggerButtonRef.current.getBoundingClientRect()
      const scrollY = window.scrollY || document.documentElement.scrollTop
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      // Mobile detection
      const isMobile = viewportWidth < 640
      
      // Panel dimensions
      const panelWidth = isMobile ? Math.min(viewportWidth - 32, 320) : 320
      const estimatedPanelHeight = 384 // max-h-96
      
      // Calculate positions
      let top = rect.bottom + scrollY + 8
      let left = rect.right - panelWidth
      
      // Mobile positioning adjustments
      if (isMobile) {
        // On mobile, center the panel with padding
        left = Math.max(16, Math.min(
          (viewportWidth - panelWidth) / 2,
          viewportWidth - panelWidth - 16
        ))
        top = rect.bottom + scrollY + 8
      } else {
        // Desktop positioning - align to right edge of trigger
        left = Math.max(16, rect.right - panelWidth)
        
        // Prevent panel from going off the bottom
        if (top + estimatedPanelHeight > viewportHeight + scrollY - 16) {
          top = rect.top + scrollY - estimatedPanelHeight - 8
        }
      }
      
      // Final boundary checks
      top = Math.max(scrollY + 16, top)
      
      setPanelPosition({
        top,
        left,
        width: panelWidth
      })
    }
  }

  useEffect(() => {
    if (isOpen) {
      updatePanelPosition()
    }
  }, [isOpen])

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const loadNotifications = async () => {
    setIsLoading(true)
    try {
      // Get current language from i18n
      const currentLanguage = i18n.language || 'en'
      
      // Get real notifications from service (now async with localization)
      const realNotifications = await notificationService.getNotifications(operator?.id, currentLanguage)
      console.log('📬 Real notifications from DB:', realNotifications.length, realNotifications)
      
      // Combine real notifications with sample/onboarding notifications
      const allNotifications = [...realNotifications, ...sampleNotifications]
      console.log('📬 All notifications (real + sample):', allNotifications.length, allNotifications)
      
      // Always add onboarding restart notification for testing
      allNotifications.unshift(onboardingNotification) // Add to beginning
      
      setNotifications(allNotifications)
      const newUnreadCount = allNotifications.filter(n => !n.read).length
      setUnreadCount(newUnreadCount)
      
      setIsLoading(false)
      
    } catch (error) {
      console.error('Error loading notifications:', error)
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      // Use real notification service (now async)
      await notificationService.markAsRead(operator?.id, notificationId)
      
      // Update local state
      setNotifications(prev => {
        const updated = prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
        const newUnreadCount = updated.filter(n => !n.read).length
        setUnreadCount(newUnreadCount)
        
        return updated
      })
      
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      // Use real notification service (now async)
      await notificationService.markAllAsRead(operator?.id)
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      markAsRead(notification.id)
    }

    // Handle navigation based on notification type and data
    if (notification.data?.action === 'restart-tour' && operator) {
      // Restart onboarding tour - first navigate to dashboard, then restart tour
      localStorage.removeItem(`vai-tour-completed-${operator.id}`)
      onClose()
      
      // Navigate to dashboard tab first, then reload to start tour
      if (onNavigateToTab) {
        onNavigateToTab('dashboard')
      }
      
      // Small delay to ensure tab navigation completes, then reload to retrigger tour logic
      setTimeout(() => {
        window.location.reload()
      }, 100)
      return
    }

    // Handle other navigation based on notification type
    switch (notification.type) {
      case 'booking':
        if (notification.data.bookingId && onNavigateToBooking) {
          console.log(`📋 Navigating to booking ${notification.data.bookingId}`)
          onNavigateToBooking(notification.data.bookingId)
          onClose()
        } else if (onNavigateToTab) {
          // Fallback to bookings tab if no specific booking ID
          onNavigateToTab('bookings')
          onClose()
        }
        break
      case 'payment':
        if (notification.data.bookingId && onNavigateToBooking) {
          onNavigateToBooking(notification.data.bookingId)
          onClose()
        } else if (onNavigateToTab) {
          onNavigateToTab('bookings')
          onClose()
        }
        break
      case 'message':
        if (onNavigateToTab) {
          onNavigateToTab('bookings')
          onClose()
        }
        break
      case 'tour':
        if (onNavigateToTab) {
          onNavigateToTab('create')
          onClose()
        }
        break
      default:
        break
    }
  }

  const getNotificationIcon = (notification) => {
    // Special icon for onboarding tutorial
    if (notification.data?.action === 'restart-tour') {
      return <Sparkles className="w-4 h-4 text-yellow-400" />
    }
    
    switch (notification.type) {
      case 'booking':
        return <Calendar className="w-4 h-4 text-blue-400" />
      case 'payment':
        return <DollarSign className="w-4 h-4 text-green-400" />
      case 'message':
        return <MessageCircle className="w-4 h-4 text-purple-400" />
      case 'system':
        return <Settings className="w-4 h-4 text-slate-400" />
      case 'tour':
        return <AlertTriangle className="w-4 h-4 text-orange-400" />
      default:
        return <Bell className="w-4 h-4 text-slate-400" />
    }
  }

  const formatTimeAgo = (date) => {
    // Use your existing timezone utility - works for any country expansion
    const now = new Date(polynesianNow()) // Current time in operator's timezone
    const notificationDate = new Date(date) // UTC from database
    
    // Calculate difference in operator's local timezone  
    const diffInMs = now - notificationDate
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const diffInWeeks = Math.floor(diffInDays / 7)

    if (diffInMinutes < 1) {
      return t('notifications.timeAgo.now')
    } else if (diffInMinutes < 60) {
      return t('notifications.timeAgo.minutes', { count: diffInMinutes })
    } else if (diffInHours < 24) {
      return t('notifications.timeAgo.hours', { count: diffInHours })
    } else if (diffInDays < 7) {
      return t('notifications.timeAgo.days', { count: diffInDays })
    } else {
      return t('notifications.timeAgo.weeks', { count: diffInWeeks })
    }
  }

  // Notification Panel Component
  const NotificationPanel = () => (
    <div
      ref={panelRef}
      className="fixed bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-[9999] max-h-96 flex flex-col"
      style={{
        top: `${panelPosition.top}px`,
        left: `${panelPosition.left}px`,
        width: `${panelPosition.width}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-medium">{t('notifications.title')}</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-slate-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto"></div>
              <p className="mt-2 text-sm">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <h4 className="font-medium text-slate-300 mb-1">{t('notifications.noNotifications')}</h4>
              <p className="text-sm">{t('notifications.noNotificationsMessage')}</p>
            </div>
          ) : (
            <div className="py-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-l-2 transition-colors cursor-pointer hover:bg-slate-700/30 ${
                    notification.read 
                      ? 'border-transparent bg-slate-800/20' 
                      : 'border-blue-400 bg-blue-500/5'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${
                            notification.read ? 'text-slate-300' : 'text-white'
                          }`}>
                            {notification.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-500">
                          {formatTimeAgo(notification.created_at || notification.createdAt)}
                        </span>
                        
                        {['booking', 'payment', 'message'].includes(notification.type) && (
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-slate-700 bg-slate-800/50">
            <button 
              onClick={markAllAsRead}
              className="w-full text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              {t('notifications.markAllRead')}
            </button>
          </div>
        )}
    </div>
  )

  if (!isOpen) return null

  return (
    <>
      {/* Mobile backdrop */}
      <div className="fixed inset-0 bg-black/20 z-[9998] sm:hidden" onClick={onClose} />
      
      {/* Portal Panel */}
      {typeof document !== 'undefined' && createPortal(
        <NotificationPanel />,
        document.body
      )}
    </>
  )
}

export default NotificationCenter