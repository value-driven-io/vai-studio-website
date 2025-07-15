// operator-dashboard/src/services/chatService.js
import { supabase } from '../lib/supabase'

class ChatService {
  constructor() {
    this.subscriptions = new Map()
    this.messageCallbacks = new Map()
    this.unreadCallbacks = new Map()
  }

  /**
   * Get conversation messages for a specific booking
   * @param {string} bookingId - The booking ID
   * @returns {Promise<Array>} Array of messages
   */
  async getConversation(bookingId) {
    try {
      const { data, error } = await supabase
        .from('booking_conversations')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching conversation:', error)
        throw error
      }

      // Enrich messages with sender info separately (since joins aren't working)
      if (data && data.length > 0) {
        const enrichedMessages = await Promise.all(
          data.map(async (message) => {
            let senderInfo = null
            
            if (message.sender_type === 'tourist') {
              const { data: touristData } = await supabase
                .from('tourist_users')
                .select('first_name, last_name')
                .eq('auth_user_id', message.sender_id) // 🔧 FIXED: Use auth_user_id to match sender_id
                .single()
              senderInfo = touristData
            } else if (message.sender_type === 'operator') {
              const { data: operatorData } = await supabase
                .from('operators')
                .select('company_name')
                .eq('auth_user_id', message.sender_id) // 🔧 FIXED: Use auth_user_id to match sender_id
                .single()
              senderInfo = operatorData
            }
            
            return {
              ...message,
              sender_info: senderInfo
            }
          })
        )
        return enrichedMessages
      }

      return data || []
    } catch (error) {
      console.error('Error in getConversation:', error)
      throw error
    }
  }

  /**
   * Send a message in a booking conversation
   * @param {string} bookingId - The booking ID
   * @param {string} messageText - The message content
   * @param {string} senderType - 'tourist' | 'operator' | 'admin'
   * @param {string} senderId - The sender's auth_user_id (from Supabase auth)
   * @returns {Promise<Object>} The created message
   */
  async sendMessage(bookingId, messageText, senderType, senderId) {
    try {
      const messageData = {
        booking_id: bookingId,
        sender_type: senderType,
        sender_id: senderId, // This should be the auth_user_id
        message_text: messageText.trim(),
        is_read: false,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('booking_conversations')
        .insert(messageData)
        .select()
        .single()

      if (error) {
        console.error('Error sending message:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in sendMessage:', error)
      throw error
    }
  }

  /**
   * Mark messages as read for a user
   * @param {string} bookingId - The booking ID
   * @param {string} userType - 'tourist' | 'operator'
   * @returns {Promise<void>}
   */
  async markAsRead(bookingId, userType) {
    try {
      // Mark all messages in this booking as read, except those sent by the current user type
      const { error } = await supabase
        .from('booking_conversations')
        .update({ is_read: true })
        .eq('booking_id', bookingId)
        .neq('sender_type', userType)
        .eq('is_read', false)

      if (error) {
        console.error('Error marking messages as read:', error)
        throw error
      }
    } catch (error) {
      console.error('Error in markAsRead:', error)
      throw error
    }
  }

  /**
   * Get unread message count for a user
   * @param {string} userId - Tourist auth_user_id or operator auth_user_id
   * @param {string} userType - 'tourist' | 'operator'
   * @returns {Promise<number>} Number of unread messages
   */
  async getUnreadCount(userId, userType) {
    try {
      let bookingIds = []

      if (userType === 'tourist') {
        // Get tourist_users.id from auth_user_id, then find bookings
        const { data: tourists } = await supabase
          .from('tourist_users')
          .select('id')
          .eq('auth_user_id', userId)
        
        if (tourists && tourists.length > 0) {
          const touristId = tourists[0].id
          const { data: bookings } = await supabase
            .from('bookings')
            .select('id')
            .eq('tourist_user_id', touristId)
          bookingIds = bookings ? bookings.map(b => b.id) : []
        }
      } else {
        // Get bookings where operator.auth_user_id matches userId
        const { data: operators } = await supabase
          .from('operators')
          .select('id')
          .eq('auth_user_id', userId)
        
        if (operators && operators.length > 0) {
          const operatorId = operators[0].id
          const { data: bookings } = await supabase
            .from('bookings')
            .select('id')
            .eq('operator_id', operatorId)
          bookingIds = bookings ? bookings.map(b => b.id) : []
        }
      }

      if (bookingIds.length === 0) {
        return 0
      }

      // Count unread messages in those bookings where sender is not this user type
      const { count, error } = await supabase
        .from('booking_conversations')
        .select('id', { count: 'exact', head: true })
        .eq('is_read', false)
        .neq('sender_type', userType)
        .in('booking_id', bookingIds)

      if (error) {
        console.error('Error getting unread count:', error)
        throw error
      }

      return count || 0
    } catch (error) {
      console.error('Error in getUnreadCount:', error)
      return 0
    }
  }

  /**
   * Subscribe to real-time message updates for a specific booking
   * 🔧 FIXED: No longer calls loadMessages() - uses optimistic updates
   * @param {string} bookingId - The booking ID
   * @param {Function} callback - Function to call when messages are updated
   * @returns {Function} Unsubscribe function
   */
  subscribeToConversation(bookingId, callback) {
    const subscriptionKey = `conversation_${bookingId}`
    
    // Unsubscribe existing subscription if any
    if (this.subscriptions.has(subscriptionKey)) {
      this.unsubscribeFromConversation(bookingId)
    }

    const subscription = supabase
      .channel(`booking_conversations_${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'booking_conversations',
          filter: `booking_id=eq.${bookingId}`
        },
        (payload) => {
          console.log('Real-time new message:', payload)
          // 🔧 FIXED: Pass the new message directly, don't reload all messages
          callback({
            type: 'INSERT',
            message: payload.new
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'booking_conversations',
          filter: `booking_id=eq.${bookingId}`
        },
        (payload) => {
          console.log('Real-time message update:', payload)
          // Handle message updates (like marking as read)
          callback({
            type: 'UPDATE',
            message: payload.new
          })
        }
      )
      .subscribe()

    this.subscriptions.set(subscriptionKey, subscription)
    this.messageCallbacks.set(subscriptionKey, callback)

    // Return unsubscribe function
    return () => this.unsubscribeFromConversation(bookingId)
  }

  /**
   * Subscribe to real-time unread count updates for a user
   * @param {string} userId - Tourist user ID or operator ID
   * @param {string} userType - 'tourist' | 'operator'  
   * @param {Function} callback - Function to call when unread count changes
   * @returns {Function} Unsubscribe function
   */
  subscribeToUnreadCount(userId, userType, callback) {
    const subscriptionKey = `unread_${userType}_${userId}`
    
    // Unsubscribe existing subscription if any
    if (this.subscriptions.has(subscriptionKey)) {
      this.unsubscribeFromUnreadCount(userId, userType)
    }

    const subscription = supabase
      .channel(`unread_count_${userType}_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'booking_conversations'
        },
        async (payload) => {
          console.log('Real-time unread count update:', payload)
          // 🔧 FIXED: Add debouncing to prevent excessive recalculations
          if (this.unreadCountTimeout) {
            clearTimeout(this.unreadCountTimeout)
          }
          
          this.unreadCountTimeout = setTimeout(async () => {
            const newCount = await this.getUnreadCount(userId, userType)
            callback(newCount)
          }, 500) // 500ms debounce
        }
      )
      .subscribe()

    this.subscriptions.set(subscriptionKey, subscription)
    this.unreadCallbacks.set(subscriptionKey, callback)

    // Return unsubscribe function
    return () => this.unsubscribeFromUnreadCount(userId, userType)
  }

  /**
   * Unsubscribe from conversation updates
   * @param {string} bookingId - The booking ID
   */
  unsubscribeFromConversation(bookingId) {
    const subscriptionKey = `conversation_${bookingId}`
    const subscription = this.subscriptions.get(subscriptionKey)
    
    if (subscription) {
      supabase.removeChannel(subscription)
      this.subscriptions.delete(subscriptionKey)
      this.messageCallbacks.delete(subscriptionKey)
    }
  }

  /**
   * Unsubscribe from unread count updates
   * @param {string} userId - User ID
   * @param {string} userType - 'tourist' | 'operator'
   */
  unsubscribeFromUnreadCount(userId, userType) {
    const subscriptionKey = `unread_${userType}_${userId}`
    const subscription = this.subscriptions.get(subscriptionKey)
    
    if (subscription) {
      supabase.removeChannel(subscription)
      this.subscriptions.delete(subscriptionKey)
      this.unreadCallbacks.delete(subscriptionKey)
    }
  }

  /**
   * Clean up all subscriptions
   */
  cleanup() {
    // Clear timeout if exists
    if (this.unreadCountTimeout) {
      clearTimeout(this.unreadCountTimeout)
    }
    
    this.subscriptions.forEach((subscription) => {
      supabase.removeChannel(subscription)
    })
    this.subscriptions.clear()
    this.messageCallbacks.clear()
    this.unreadCallbacks.clear()
  }

  /**
   * 🔧 NEW: Enhanced error handling with retry mechanism
   */
  async withRetry(operation, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        if (attempt === maxRetries) {
          throw error
        }
        
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  /**
   * Check if a booking allows chat (must be confirmed)
   * @param {string} bookingStatus - The booking status
   * @returns {boolean} Whether chat is allowed
   */
  canChat(bookingStatus) {
    return bookingStatus === 'confirmed'
  }

  /**
   * Format message timestamp for display
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Formatted time
   */
  formatMessageTime(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString()
  }
}

// Export singleton instance
export const chatService = new ChatService()
export default chatService