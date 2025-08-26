// Notification Service for managing operator notifications
// Handles booking notifications and integrates with NotificationCenter

class NotificationService {
  constructor() {
    this.storageKey = 'vai-operator-notifications'
    this.readNotificationsKey = 'vai-read-notifications'
  }

  // Get all notifications for an operator
  getNotifications(operatorId) {
    if (!operatorId) return []
    
    const stored = localStorage.getItem(`${this.storageKey}-${operatorId}`)
    return stored ? JSON.parse(stored) : []
  }

  // Add a new booking notification
  addBookingNotification(operatorId, booking, title, message) {
    if (!operatorId || !booking) return

    // Use provided title and message, or fallback to English defaults
    const notificationTitle = title || 'New Booking Request'
    const notificationMessage = message || `New booking for ${booking.tours?.tour_name || 'your activity'}`

    const notification = {
      id: `booking-${booking.id}-${Date.now()}`,
      type: 'booking',
      title: notificationTitle,
      message: notificationMessage,
      read: false,
      createdAt: new Date(booking.created_at || Date.now()),
      data: {
        bookingId: booking.id,
        activityName: booking.tours?.tour_name,
        bookingReference: booking.booking_reference
      }
    }

    // Get existing notifications
    const existing = this.getNotifications(operatorId)
    
    // Check if this booking notification already exists
    const alreadyExists = existing.some(n => 
      n.type === 'booking' && n.data.bookingId === booking.id
    )
    
    if (!alreadyExists) {
      // Add to beginning of array (most recent first)
      existing.unshift(notification)
      
      // Keep only the last 50 notifications to prevent storage bloat
      const limited = existing.slice(0, 50)
      
      // Save to localStorage
      localStorage.setItem(`${this.storageKey}-${operatorId}`, JSON.stringify(limited))
      
      // Dispatch custom event to notify components of new notification
      window.dispatchEvent(new CustomEvent('newNotification', { 
        detail: { operatorId, notification } 
      }))
      
      console.log(`📬 Added booking notification for booking ${booking.id}`)
      return notification
    }
    
    return null
  }

  // Mark notification as read
  markAsRead(operatorId, notificationId) {
    if (!operatorId || !notificationId) return

    // Update notifications
    const notifications = this.getNotifications(operatorId)
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    )
    localStorage.setItem(`${this.storageKey}-${operatorId}`, JSON.stringify(updated))

    // Update read notifications list (for compatibility with existing system)
    const readNotifications = this.getReadNotifications(operatorId)
    if (!readNotifications.includes(notificationId)) {
      readNotifications.push(notificationId)
      localStorage.setItem(`${this.readNotificationsKey}-${operatorId}`, JSON.stringify(readNotifications))
    }
  }

  // Mark all notifications as read
  markAllAsRead(operatorId) {
    if (!operatorId) return

    const notifications = this.getNotifications(operatorId)
    const updated = notifications.map(n => ({ ...n, read: true }))
    localStorage.setItem(`${this.storageKey}-${operatorId}`, JSON.stringify(updated))

    // Update read notifications list
    const allNotificationIds = notifications.map(n => n.id)
    localStorage.setItem(`${this.readNotificationsKey}-${operatorId}`, JSON.stringify(allNotificationIds))
  }

  // Get read notifications (for compatibility with existing system)
  getReadNotifications(operatorId) {
    if (!operatorId) return []
    const readNotifications = localStorage.getItem(`${this.readNotificationsKey}-${operatorId}`)
    return readNotifications ? JSON.parse(readNotifications) : []
  }

  // Get unread count
  getUnreadCount(operatorId) {
    const notifications = this.getNotifications(operatorId)
    return notifications.filter(n => !n.read).length
  }

  // Clear old notifications (optional cleanup method)
  clearOldNotifications(operatorId, daysOld = 30) {
    if (!operatorId) return

    const notifications = this.getNotifications(operatorId)
    const cutoffDate = new Date(Date.now() - (daysOld * 24 * 60 * 60 * 1000))
    
    const filtered = notifications.filter(n => 
      new Date(n.createdAt) > cutoffDate
    )
    
    localStorage.setItem(`${this.storageKey}-${operatorId}`, JSON.stringify(filtered))
  }
}

// Create and export singleton instance
const notificationService = new NotificationService()
export default notificationService