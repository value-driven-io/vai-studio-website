// tourist-app/src/services/chatService.js
import { supabase } from './supabase'

class ChatService {
  constructor() {
    this.subscriptions = new Map()
    this.messageCallbacks = new Map()
    this.unreadCallbacks = new Map()
    
    // Connection health monitoring
    this.connectionHealthy = true
    this.healthCheckInterval = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    
    // Start health monitoring
    this.startHealthMonitoring()
  }


  // ✅ NEW: Health monitoring methods
  startHealthMonitoring() {
    // Check connection health every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.checkConnectionHealth()
    }, 30000)
    
    // Listen for browser online/offline events
    window.addEventListener('online', () => {
      console.log('🌐 Browser back online, reconnecting...')
      this.handleReconnection()
    })
    
    window.addEventListener('offline', () => {
      console.log('📵 Browser offline detected')
      this.connectionHealthy = false
    })
  }

  checkConnectionHealth() {
    // Simple health check: try to query Supabase
    supabase
      .from('booking_conversations')
      .select('id')
      .limit(1)
      .then(() => {
        if (!this.connectionHealthy) {
          console.log('✅ Connection restored')
          this.connectionHealthy = true
          this.reconnectAttempts = 0
          this.handleReconnection()
        }
      })
      .catch((error) => {
        console.warn('⚠️ Connection health check failed:', error)
        this.connectionHealthy = false
        this.handleConnectionFailure()
      })
  }

  handleConnectionFailure() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
      
      // Exponential backoff
      const delay = Math.pow(2, this.reconnectAttempts) * 1000
      setTimeout(() => {
        this.handleReconnection()
      }, delay)
    } else {
      console.error('❌ Max reconnection attempts reached. Manual refresh may be needed.')
      // Optionally show user notification here
    }
  }

  handleReconnection() {
    console.log('🔄 Reconnecting subscriptions...')
    
    // Store current subscriptions info
    const activeSubscriptions = []
    this.subscriptions.forEach((subscription, key) => {
      if (key.startsWith('conversation_')) {
        const bookingId = key.replace('conversation_', '')
        const callback = this.messageCallbacks.get(key)
        if (callback) {
          activeSubscriptions.push({ bookingId, callback })
        }
      }
    })
    
    // Clean up old subscriptions
    this.cleanup()
    
    // Recreate subscriptions
    activeSubscriptions.forEach(({ bookingId, callback }) => {
      console.log(`🔄 Reconnecting subscription for booking ${bookingId}`)
      this.subscribeToConversation(bookingId, callback)
    })
  }

  // ✅ ENHANCED: Cleanup method with health monitoring cleanup
    cleanup() {
    console.log('🧹 ChatService cleanup started')
    
    // Clear health monitoring
    if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval)
        this.healthCheckInterval = null
        console.log('🧹 Health monitoring cleared')
    }
    
    // Clear unread count timeout
    if (this.unreadCountTimeout) {
        clearTimeout(this.unreadCountTimeout)
        this.unreadCountTimeout = null
        console.log('🧹 Unread count timeout cleared')
    }
    
    // Enhanced subscription cleanup with logging
    let cleanupCount = 0
    this.subscriptions.forEach((subscription, key) => {
        if (Array.isArray(subscription)) {
        // Handle multiple subscriptions (for unread count)
        subscription.forEach(sub => {
            supabase.removeChannel(sub)
            cleanupCount++
        })
        } else {
        // Handle single subscription
        supabase.removeChannel(subscription)
        cleanupCount++
        }
    })
    
    console.log(`🧹 Cleaned up ${cleanupCount} subscriptions`)
    
    this.subscriptions.clear()
    this.messageCallbacks.clear()
    this.unreadCallbacks.clear()
    
    console.log('🧹 ChatService cleanup completed')
    }

    // ✅ ALSO ADD: Debug method to check active subscriptions
    getActiveSubscriptionsCount() {
    let totalCount = 0
    this.subscriptions.forEach((subscription) => {
        if (Array.isArray(subscription)) {
        totalCount += subscription.length
        } else {
        totalCount += 1
        }
    })
    return {
        subscriptionKeys: this.subscriptions.size,
        totalSubscriptions: totalCount,
        messageCallbacks: this.messageCallbacks.size,
        unreadCallbacks: this.unreadCallbacks.size
    }
    }

    // ✅ ADD: Method to log subscription status
    logSubscriptionStatus() {
    const status = this.getActiveSubscriptionsCount()
    console.log('📊 Subscription Status:', status)
    console.log('🔑 Active Keys:', Array.from(this.subscriptions.keys()))
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
                .eq('id', message.sender_id)
                .single()
              senderInfo = touristData
            } else if (message.sender_type === 'operator') {
              const { data: operatorData } = await supabase
                .from('operators')
                .select('company_name')
                .eq('id', message.sender_id)
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
   * @param {string} senderId - The sender's ID (tourist_users.id or operators.id)
   * @returns {Promise<Object>} The created message
   */
  async sendMessage(bookingId, messageText, senderType, senderId) {
    try {
      const messageData = {
        booking_id: bookingId,
        sender_type: senderType,
        sender_id: senderId,
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
   * Mark messages as read for a specific booking and sender type
   * @param {string} bookingId - The booking ID
   * @param {string} readerType - 'tourist' | 'operator'
   * @returns {Promise<void>}
   */
  async markAsRead(bookingId, readerType) {
    try {
      // Mark messages as read where the reader is NOT the sender
      const { error } = await supabase
        .from('booking_conversations')
        .update({ is_read: true })
        .eq('booking_id', bookingId)
        .neq('sender_type', readerType)

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
   * Get unread message count for a user across all their bookings
   * @param {string} userId - Tourist user ID or operator ID
   * @param {string} userType - 'tourist' | 'operator'
   * @returns {Promise<number>} Unread message count
   */
  async getUnreadCount(userId, userType) {
    try {
      // First get all booking IDs for this user
      let bookingIds = []
      
      if (userType === 'tourist') {
        const { data: bookings } = await supabase
          .from('bookings')
          .select('id')
          .eq('tourist_user_id', userId)
        bookingIds = bookings ? bookings.map(b => b.id) : []
      } else {
        const { data: bookings } = await supabase
          .from('bookings')
          .select('id')
          .eq('operator_id', userId)
        bookingIds = bookings ? bookings.map(b => b.id) : []
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
   * Get all conversations for a user with latest message and unread count
   * @param {string} userId - Tourist user ID or operator ID  
   * @param {string} userType - 'tourist' | 'operator'
   * @returns {Promise<Array>} Array of conversations with metadata
   */
  async getUserConversations(userId, userType) {
    try {
      let bookingsQuery

      if (userType === 'tourist') {
        bookingsQuery = supabase
          .from('bookings')
          .select(`
            id,
            booking_status,
            created_at,
            tours:tour_id(tour_name, meeting_point, tour_date),
            operators:operator_id(company_name)
          `)
          .eq('tourist_user_id', userId)
          .eq('booking_status', 'confirmed') // Only confirmed bookings can chat
          .order('created_at', { ascending: false })
      } else {
        bookingsQuery = supabase
          .from('bookings')
          .select(`
            id,
            booking_status,
            created_at,
            customer_name,
            tours:tour_id(tour_name, meeting_point, tour_date),
            tourist_users:tourist_user_id(first_name, last_name)
          `)
          .eq('operator_id', userId)
          .eq('booking_status', 'confirmed') // Only confirmed bookings can chat
          .order('created_at', { ascending: false })
      }

      const { data: bookings, error: bookingsError } = await bookingsQuery

      if (bookingsError) {
        console.error('Error fetching user bookings:', bookingsError)
        throw bookingsError
      }

      if (!bookings || bookings.length === 0) {
        return []
      }

      // Get latest message and unread count for each booking
      const conversations = await Promise.all(
        bookings.map(async (booking) => {
          // Get latest message (handle case where no messages exist)
            const { data: latestMessage, error: messageError } = await supabase
            .from('booking_conversations')
            .select('message_text, created_at, sender_type')
            .eq('booking_id', booking.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          // Get unread count for this booking
          const { count: unreadCount } = await supabase
            .from('booking_conversations')
            .select('id', { count: 'exact', head: true })
            .eq('booking_id', booking.id)
            .eq('is_read', false)
            .neq('sender_type', userType)

          return {
            ...booking,
            latestMessage: latestMessage || null,
            unreadCount: unreadCount || 0
          }
        })
      )

      // Sort by latest activity (latest message or booking creation)
      return conversations.sort((a, b) => {
        const aDate = a.latestMessage?.created_at || a.created_at
        const bDate = b.latestMessage?.created_at || b.created_at
        return new Date(bDate) - new Date(aDate)
      })

    } catch (error) {
      console.error('Error in getUserConversations:', error)
      throw error
    }
  }

  /**
   * Subscribe to real-time message updates for a specific booking
   * @param {string} bookingId - The booking ID
   * @param {Function} callback - Function to call when messages are updated
   * @returns {Function} Unsubscribe function
   */
    subscribeToConversation(bookingId, callback) {
    const subscriptionKey = `conversation_${bookingId}`
    
    // 🔧 FIXED: Force immediate cleanup with short delay
    if (this.subscriptions.has(subscriptionKey)) {
        const oldSubscription = this.subscriptions.get(subscriptionKey)
        supabase.removeChannel(oldSubscription)
        this.subscriptions.delete(subscriptionKey)
        this.messageCallbacks.delete(subscriptionKey)
        
        // Small synchronous delay to reduce race condition likelihood
        const start = Date.now()
        while (Date.now() - start < 10) {
        // Busy wait for 10ms to allow cleanup
        }
    }

    const subscription = supabase
      .channel(`booking_conversations_${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'booking_conversations',
          filter: `booking_id=eq.${bookingId}`
        },
        (payload) => {
          console.log('Real-time message update:', payload)
          callback(payload)
        }
      )
      .subscribe()

    this.subscriptions.set(subscriptionKey, subscription)
    this.messageCallbacks.set(subscriptionKey, callback)

    // Return unsubscribe function
    return () => this.unsubscribeFromConversation(bookingId)
  }


  // Add async unsubscribe methods
    async unsubscribeFromConversationAsync(bookingId) {
    const subscriptionKey = `conversation_${bookingId}`
    const subscription = this.subscriptions.get(subscriptionKey)
    
    if (subscription) {
        // Wait for channel removal to complete
        await new Promise((resolve) => {
        supabase.removeChannel(subscription)
        // Small delay to ensure WebSocket cleanup completes
        setTimeout(resolve, 100)
        })
        
        this.subscriptions.delete(subscriptionKey)
        this.messageCallbacks.delete(subscriptionKey)
    }
    }

    async unsubscribeFromUnreadCountAsync(userId, userType) {
    const subscriptionKey = `unread_${userType}_${userId}`
    const subscription = this.subscriptions.get(subscriptionKey)
    
    if (subscription) {
        await new Promise((resolve) => {
        supabase.removeChannel(subscription)
        setTimeout(resolve, 100)
        })
        
        this.subscriptions.delete(subscriptionKey)
        this.unreadCallbacks.delete(subscriptionKey)
    }
    }

    // 🔧 ENHANCED: Async cleanup method
    async cleanupAsync() {
    // Clear timeout if exists
    if (this.unreadCountTimeout) {
        clearTimeout(this.unreadCountTimeout)
    }
    
    // Wait for all channels to be properly removed
    const cleanupPromises = []
    this.subscriptions.forEach((subscription) => {
        cleanupPromises.push(
        new Promise((resolve) => {
            supabase.removeChannel(subscription)
            setTimeout(resolve, 50) // Shorter delay for bulk cleanup
        })
        )
    })
    
    await Promise.all(cleanupPromises)
    
    this.subscriptions.clear()
    this.messageCallbacks.clear()
    this.unreadCallbacks.clear()
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

    // ✅ FIXED: Handle async booking fetch in a non-blocking way
    const setupSubscriptions = async () => {
        let bookingIds = []
        try {
        if (userType === 'tourist') {
            const { data: bookings } = await supabase
            .from('bookings')
            .select('id')
            .eq('tourist_user_id', userId)
            bookingIds = bookings ? bookings.map(b => b.id) : []
        } else {
            const { data: bookings } = await supabase
            .from('bookings')
            .select('id')
            .eq('operator_id', userId)
            bookingIds = bookings ? bookings.map(b => b.id) : []
        }
        } catch (error) {
        console.error('Error getting booking IDs for subscription:', error)
        return
        }

        if (bookingIds.length === 0) {
        console.log('No bookings found for unread subscription')
        return
        }

        // ✅ FIXED: Create separate subscription for each booking to avoid global events
        const subscriptions = []
        
        bookingIds.forEach(bookingId => {
        const subscription = supabase
            .channel(`unread_${userType}_${userId}_${bookingId}`)
            .on(
            'postgres_changes',
            {
                event: 'UPDATE', // ✅ Only listen to UPDATE events (read status changes)
                schema: 'public',
                table: 'booking_conversations',
                filter: `booking_id=eq.${bookingId}` // ✅ FILTER: Only this booking
            },
            async (payload) => {
                console.log(`Real-time unread update for booking ${bookingId}:`, payload)
                
                // ✅ DEBOUNCE: Prevent multiple rapid calls
                if (this.unreadCountTimeout) {
                clearTimeout(this.unreadCountTimeout)
                }
                
                this.unreadCountTimeout = setTimeout(async () => {
                const newCount = await this.getUnreadCount(userId, userType)
                callback(newCount)
                }, 300) // 300ms debounce
            }
            )
            .subscribe()
        
        subscriptions.push(subscription)
        })

        // Store all subscriptions
        this.subscriptions.set(subscriptionKey, subscriptions)
    }

    // ✅ FIXED: Call async setup without blocking
    setupSubscriptions().catch(console.error)

    // Return synchronous unsubscribe function
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
    const subscriptions = this.subscriptions.get(subscriptionKey)
    
    if (subscriptions) {
        // Handle both single subscription (old) and array (new)
        if (Array.isArray(subscriptions)) {
        subscriptions.forEach(subscription => {
            supabase.removeChannel(subscription)
        })
        } else {
        supabase.removeChannel(subscriptions)
        }
        
        this.subscriptions.delete(subscriptionKey)
        this.unreadCallbacks.delete(subscriptionKey)
    }
    
    // Clear timeout if exists
    if (this.unreadCountTimeout) {
        clearTimeout(this.unreadCountTimeout)
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

// Global access for debugging (development only)
if (typeof window !== 'undefined') {
  window.chatService = chatService
}
