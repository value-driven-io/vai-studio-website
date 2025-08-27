// Notification Service for managing operator notifications
// Now uses Supabase for cross-device notification sync
// Timezone: UTC storage, frontend handles local timezone display

import { supabase } from '../lib/supabase'

class NotificationService {
  constructor() {
    // Keep localStorage keys for backward compatibility during migration
    this.storageKey = 'vai-operator-notifications'
    this.readNotificationsKey = 'vai-read-notifications'
  }

  // Helper method to get localized notification content
  getLocalizedContent(notification, language = 'en') {
    // Priority: 1. User's language 2. English fallback 3. Original content
    const title = notification.title_i18n?.[language] || 
                  notification.title_i18n?.['en'] || 
                  notification.title

    const message = notification.message_i18n?.[language] || 
                    notification.message_i18n?.['en'] || 
                    notification.message

    return { title, message }
  }

  // Enhanced method to process notifications with localization
  processNotificationsWithLocalization(notifications, language = 'en') {
    return notifications.map(notification => {
      const localized = this.getLocalizedContent(notification, language)
      return {
        ...notification,
        title: localized.title,
        message: localized.message,
        // Keep original i18n data for reference
        original_title_i18n: notification.title_i18n,
        original_message_i18n: notification.message_i18n
      }
    })
  }

  // Get all notifications for an operator from Supabase (with localization)
  async getNotifications(operatorId, language = 'en') {
    if (!operatorId) {
      console.log('❌ No operatorId provided to getNotifications')
      return []
    }
    
    try {
      console.log('🔍 Fetching notifications for operator:', operatorId)
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`operator_id.eq.${operatorId},recipient_type.eq.all`)
        .order('created_at', { ascending: false })
        .limit(50) // Limit to recent 50 notifications
      
      if (error) {
        console.error('❌ Error fetching notifications:', error)
        console.log('🔄 Falling back to localStorage')
        // Fallback to localStorage if Supabase fails
        return this.getNotificationsFromLocalStorage(operatorId)
      }
      
      console.log('✅ Successfully fetched notifications:', data?.length || 0)
      
      // Process notifications with localization
      const localizedNotifications = this.processNotificationsWithLocalization(data || [], language)
      
      return localizedNotifications
    } catch (error) {
      console.error('❌ Error in getNotifications:', error)
      console.log('🔄 Falling back to localStorage')
      // Fallback to localStorage
      return this.getNotificationsFromLocalStorage(operatorId)
    }
  }

  // Fallback method for localStorage (backward compatibility)
  getNotificationsFromLocalStorage(operatorId) {
    if (!operatorId) return []
    
    const stored = localStorage.getItem(`${this.storageKey}-${operatorId}`)
    return stored ? JSON.parse(stored) : []
  }

  // Add a new booking notification (now using Supabase)
  async addBookingNotification(operatorId, booking, title, message) {
    if (!operatorId || !booking) return null

    // Use provided title and message, or fallback to English defaults
    const notificationTitle = title || 'New Booking Request'
    const notificationMessage = message || `New booking for ${booking.tours?.tour_name || 'your activity'}`

    try {
      // Check if notification already exists for this booking
      const { data: existingNotifications } = await supabase
        .from('notifications')
        .select('id')
        .eq('operator_id', operatorId)
        .eq('type', 'booking')
        .eq("data->>'bookingId'", booking.id.toString())
        .limit(1)

      if (existingNotifications && existingNotifications.length > 0) {
        console.log(`📬 Notification already exists for booking ${booking.id}`)
        return null
      }

      // Create new notification in Supabase
      const { data: newNotification, error } = await supabase
        .from('notifications')
        .insert({
          operator_id: operatorId,
          type: 'booking',
          title: notificationTitle,
          message: notificationMessage,
          data: {
            bookingId: booking.id,
            tourId: booking.tour_id,
            activityName: booking.tours?.tour_name,
            bookingReference: booking.booking_reference,
            customerName: booking.customer_name
          }
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating notification:', error)
        // Fallback to localStorage method
        return this.addBookingNotificationToLocalStorage(operatorId, booking, title, message)
      }

      // Dispatch custom event to notify components of new notification
      window.dispatchEvent(new CustomEvent('newNotification', { 
        detail: { operatorId, notification: newNotification } 
      }))
      
      console.log(`📬 Created Supabase notification for booking ${booking.id}`)
      return newNotification

    } catch (error) {
      console.error('Error in addBookingNotification:', error)
      // Fallback to localStorage
      return this.addBookingNotificationToLocalStorage(operatorId, booking, title, message)
    }
  }

  // Fallback method for localStorage
  addBookingNotificationToLocalStorage(operatorId, booking, title, message) {
    const notificationTitle = title || 'New Booking Request'
    const notificationMessage = message || `New booking for ${booking.tours?.tour_name || 'your activity'}`

    const notification = {
      id: `booking-${booking.id}-${Date.now()}`,
      type: 'booking',
      title: notificationTitle,
      message: notificationMessage,
      read: false,
      created_at: new Date(booking.created_at || Date.now()).toISOString(),
      data: {
        bookingId: booking.id,
        activityName: booking.tours?.tour_name,
        bookingReference: booking.booking_reference
      }
    }

    const existing = this.getNotificationsFromLocalStorage(operatorId)
    const alreadyExists = existing.some(n => 
      n.type === 'booking' && n.data.bookingId === booking.id
    )
    
    if (!alreadyExists) {
      existing.unshift(notification)
      const limited = existing.slice(0, 50)
      localStorage.setItem(`${this.storageKey}-${operatorId}`, JSON.stringify(limited))
      
      window.dispatchEvent(new CustomEvent('newNotification', { 
        detail: { operatorId, notification } 
      }))
      
      return notification
    }
    
    return null
  }

  // Mark notification as read (now using Supabase)
  async markAsRead(operatorId, notificationId) {
    if (!operatorId || !notificationId) return false

    try {
      console.log('📖 Marking notification as read:', notificationId)
      
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId)
        .or(`operator_id.eq.${operatorId},recipient_type.eq.all`)

      if (error) {
        console.error('❌ Error marking notification as read:', error)
        console.log('🔄 Falling back to localStorage')
        // Fallback to localStorage (for sample notifications)
        this.markAsReadInLocalStorage(operatorId, notificationId)
        return false
      }

      console.log('✅ Notification marked as read successfully')
      return true
    } catch (error) {
      console.error('❌ Error in markAsRead:', error)
      console.log('🔄 Falling back to localStorage')
      this.markAsReadInLocalStorage(operatorId, notificationId)
      return false
    }
  }

  // Mark all notifications as read (now using Supabase)
  async markAllAsRead(operatorId) {
    if (!operatorId) return 0

    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ 
          read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('operator_id', operatorId)
        .eq('read', false)
        .select('id')

      if (error) {
        console.error('Error marking all notifications as read:', error)
        // Fallback to localStorage
        this.markAllAsReadInLocalStorage(operatorId)
        return 0
      }

      return data?.length || 0
    } catch (error) {
      console.error('Error in markAllAsRead:', error)
      this.markAllAsReadInLocalStorage(operatorId)
      return 0
    }
  }

  // Fallback methods for localStorage
  markAsReadInLocalStorage(operatorId, notificationId) {
    const notifications = this.getNotificationsFromLocalStorage(operatorId)
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    )
    localStorage.setItem(`${this.storageKey}-${operatorId}`, JSON.stringify(updated))

    const readNotifications = this.getReadNotifications(operatorId)
    if (!readNotifications.includes(notificationId)) {
      readNotifications.push(notificationId)
      localStorage.setItem(`${this.readNotificationsKey}-${operatorId}`, JSON.stringify(readNotifications))
    }
  }

  markAllAsReadInLocalStorage(operatorId) {
    const notifications = this.getNotificationsFromLocalStorage(operatorId)
    const updated = notifications.map(n => ({ ...n, read: true }))
    localStorage.setItem(`${this.storageKey}-${operatorId}`, JSON.stringify(updated))

    const allNotificationIds = notifications.map(n => n.id)
    localStorage.setItem(`${this.readNotificationsKey}-${operatorId}`, JSON.stringify(allNotificationIds))
  }

  // Get read notifications (for compatibility with existing system)
  getReadNotifications(operatorId) {
    if (!operatorId) return []
    const readNotifications = localStorage.getItem(`${this.readNotificationsKey}-${operatorId}`)
    return readNotifications ? JSON.parse(readNotifications) : []
  }

  // Get unread count (now using Supabase)
  async getUnreadCount(operatorId) {
    if (!operatorId) return 0

    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('operator_id', operatorId)
        .eq('read', false)

      if (error) {
        console.error('Error getting unread count:', error)
        // Fallback to localStorage
        const notifications = this.getNotificationsFromLocalStorage(operatorId)
        return notifications.filter(n => !n.read).length
      }

      return count || 0
    } catch (error) {
      console.error('Error in getUnreadCount:', error)
      // Fallback to localStorage
      const notifications = this.getNotificationsFromLocalStorage(operatorId)
      return notifications.filter(n => !n.read).length
    }
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