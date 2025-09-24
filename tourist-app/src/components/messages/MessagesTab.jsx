// tourist-app/src/components/messages/MessagesTab.jsx
import React, { useState, useEffect, useRef } from 'react'
import { 
  MessageCircle, Send, ArrowLeft, Calendar, MapPin, Building2, 
  Clock, CheckCircle2, Circle, Loader2, RefreshCw, User, Users,
  ChevronRight, MessageSquare, AlertCircle
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { useAppStore } from '../../stores/bookingStore'
import { useUserJourney } from '../../hooks/useUserJourney'
import chatService from '../../services/chatService'
import { supabase } from '../../services/supabase'
import { TOUR_TYPE_EMOJIS } from '../../constants/moods'
import toast from 'react-hot-toast'

const MessagesTab = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { setActiveTab } = useAppStore()
  const { userBookings, getTotalBookings } = useUserJourney()
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [touristUserId, setTouristUserId] = useState(null)
  const messagesEndRef = useRef(null)
  const messageInputRef = useRef(null)

  // Get tourist user ID from auth user
  useEffect(() => {
    const getTouristUserId = async () => {
      if (user) {
        try {
          // Get tourist user record linked to this auth user
          const { data: touristUser } = await supabase
            .from('tourist_users')
            .select('id')
            .eq('auth_user_id', user.id)
            .single()
          
          if (touristUser) {
            setTouristUserId(touristUser.id)
          }
        } catch (error) {
          console.error('Error getting tourist user ID:', error)
        }
      }
    }
    getTouristUserId()
  }, [user])

  // Load conversations
  const loadConversations = async () => {
    if (!touristUserId) return
    
    try {
      setLoading(true)
      const convos = await chatService.getUserConversations(touristUserId, 'tourist')
      setConversations(convos)
      
      // Calculate total unread count
      const totalUnread = convos.reduce((sum, convo) => sum + (convo.unreadCount || 0), 0)
      setUnreadCount(totalUnread)
    } catch (error) {
      console.error('Error loading conversations:', error)
      toast.error(t('messages.notifications.loadConversationsFailed'))
    } finally {
      setLoading(false)
    }
  }

  // Load messages for selected conversation
  const loadMessages = async (bookingId) => {
    try {
      setLoadingMessages(true)
      const msgs = await chatService.getConversation(bookingId)
      setMessages(msgs)
      
      // Mark messages as read
      await chatService.markAsRead(bookingId, 'tourist')
      
      // Refresh conversations to update unread counts
      loadConversations()
    } catch (error) {
      console.error('Error loading messages:', error)
      toast.error(t('messages.notifications.loadMessagesFailed'))
    } finally {
      setLoadingMessages(false)
    }
  }

  // Send message with optimistic updates
    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || !touristUserId) return
        
        const messageText = newMessage.trim()
        const tempId = `temp_${Date.now()}`
        
        // Add message immediately to UI
        const optimisticMessage = {
        id: tempId,
        booking_id: selectedConversation.id,
        sender_type: 'tourist',
        sender_id: touristUserId,
        message_text: messageText,
        is_read: false,
        created_at: new Date().toISOString(),
        sender_info: null, // Tourist messages don't need sender info
        _optimistic: true
        }
        
        setMessages(prevMessages => [...prevMessages, optimisticMessage])
        setNewMessage('')
        
        try {
        setSending(true)
        
        const sentMessage = await chatService.sendMessage(
            selectedConversation.id,
            messageText,
            'tourist',
            touristUserId
        )
        
        // ✅ REPLACE: Replace optimistic message with real message
        setMessages(prevMessages =>
            prevMessages.map(msg =>
            msg.id === tempId 
                ? { ...sentMessage, sender_info: null }
                : msg
            )
        )
        
        // ✅ BACKGROUND: Update conversations without loading spinner
        loadConversations()
        
        // Scroll to new message
        scrollToBottom()
        
        toast.success(t('messages.notifications.messageSent'))
        } catch (error) {
        console.error('Error sending message:', error)
        toast.error(t('messages.notifications.sendMessageFailed'))
        
        // ✅ ROLLBACK: Remove optimistic message on error
        setMessages(prevMessages =>
            prevMessages.filter(msg => msg.id !== tempId)
        )
        
        // Restore message text so user can retry
        setNewMessage(messageText)
        } finally {
        setSending(false)
        }
    }

  // Simple auto-scroll only for conversation switches
  useEffect(() => {
    if (selectedConversation) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
      }, 200)
    }
  }, [selectedConversation?.id]) // Only on conversation change

  // Scroll to bottom when sending a message
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [touristUserId])

  
    // Real-time updates for selected conversation
    useEffect(() => {
    if (!selectedConversation) return

    // ✅ ADD: Event deduplication tracking
    const processedEvents = new Set()

    const unsubscribe = chatService.subscribeToConversation(
        selectedConversation.id,
        async (payload) => {
        console.log('Real-time message update:', payload)
        
        // ✅ DEDUPLICATE: Create unique event ID to prevent duplicates
        const eventId = `${payload.commit_timestamp}_${payload.eventType}_${payload.new?.id || payload.old?.id}`
        
        if (processedEvents.has(eventId)) {
            console.log('🚫 Duplicate event ignored:', eventId)
            return
        }
        
        processedEvents.add(eventId)
        
        // ✅ HANDLE: Only process INSERT events for new messages
        if (payload.eventType === 'INSERT' && payload.new) {
            const newMessage = payload.new
            
            // Skip if message is from current user (already optimistically added)
            if (newMessage.sender_type === 'tourist' && newMessage.sender_id === touristUserId) {
            console.log('🚫 Skipping own message from real-time')
            return
            }
            
            // Add new message from operator
            setMessages(prevMessages => {
            // Check if message already exists
            const messageExists = prevMessages.some(msg => msg.id === newMessage.id)
            if (messageExists) {
                console.log('🚫 Message already exists, skipping')
                return prevMessages
            }
            
            console.log('✅ Adding new operator message')
            const enrichedMessage = {
                ...newMessage,
                sender_info: newMessage.sender_type === 'operator' 
                ? { company_name: selectedConversation.operators?.company_name }
                : null
            }
            
            return [...prevMessages, enrichedMessage]
            })
            
            // Mark as read in background
            try {
            await chatService.markAsRead(selectedConversation.id, 'tourist')
            } catch (error) {
            console.error('Error marking message as read:', error)
            }
            
            // Auto-scroll to new message
            scrollToBottom()
        }
        
        // ✅ IGNORE: UPDATE events completely - no logging needed
        if (payload.eventType === 'UPDATE') {
            // Silent ignore - unread count handled separately
            return
        }
        }
    )

    return unsubscribe
    }, [selectedConversation?.id, touristUserId])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey && selectedConversation) {
        e.preventDefault()
        sendMessage()
      }
    }

    if (messageInputRef.current) {
      messageInputRef.current.addEventListener('keypress', handleKeyPress)
    }

    return () => {
      if (messageInputRef.current) {
        messageInputRef.current.removeEventListener('keypress', handleKeyPress)
      }
    }
  }, [newMessage, selectedConversation, touristUserId])

  // Format date for conversation list
  const formatConversationDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return t('messages.interface.today')
    if (diffDays === 1) return t('messages.interface.yesterday')
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  // Enhanced loading skeleton component
  const ConversationSkeleton = () => (
    <div className="bg-ui-surface-secondary/30 rounded-xl p-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-5 h-5 bg-ui-surface-primary rounded"></div>
            <div className="h-4 bg-ui-surface-primary rounded w-32"></div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-ui-surface-primary rounded"></div>
            <div className="h-3 bg-ui-surface-primary rounded w-24"></div>
          </div>
          <div className="h-3 bg-ui-surface-primary rounded w-40"></div>
        </div>
        <div className="w-4 h-4 bg-ui-surface-primary rounded"></div>
      </div>
    </div>
  )

  // Check if user has any bookings (regardless of auth status)
  const totalBookings = getTotalBookings()
  const hasBookings = totalBookings > 0

  // If no bookings, show enhanced empty state with booking encouragement
  if (!hasBookings) {
    return (
      <div className="min-h-screen bg-ui-surface-overlay pt-4 pb-20">
        {/* Enhanced Header - Learn Tab Style */}
        <div className="mb-6">
          <div className="bg-ui-surface-secondary/50 backdrop-blur-sm rounded-xl p-6 border border-ui-border-primary relative overflow-hidden">
            {/* Background Pattern */}
            <div
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage: 'url(/images/pattern-3-tahiti-tourism.svg)',
                backgroundSize: 'auto 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-interactive-primary/20 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-interactive-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-ui-text-primary">
                      {t('messages.interface.title', 'Messages')}
                    </h1>
                    <p className="text-ui-text-secondary">
                      {t('messages.interface.subtitle', 'Chat with tour operators')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* No Bookings State */}
        <div>
          <div className="bg-ui-surface-secondary/50 backdrop-blur-sm rounded-xl p-6 border border-ui-border-primary relative overflow-hidden">
            {/* Background Pattern */}
            {/*
            <div
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage: 'url(/images/pattern-3-tahiti-tourism.svg)',
                backgroundSize: 'auto 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />
             */}

            <div className="relative z-10 text-center py-8">
              {/* Modern Icon */}
              <div className="w-20 h-20 bg-interactive-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <MessageCircle className="w-10 h-10 text-interactive-primary" />
              </div>

              {/* Title and Description */}
              <h3 className="text-2xl font-bold text-ui-text-primary mb-3">
                {t('messages.noBookings.title', 'Book a tour to start chatting')}
              </h3>
              <p className="text-ui-text-secondary mb-8 max-w-md mx-auto leading-relaxed">
                {t('messages.noBookings.description', 'Once you book a tour, you\'ll be able to chat directly with operators for any questions or assistance.')}
              </p>

              {/* Call to Action Button */}
              <button
                onClick={() => setActiveTab('discover')}
                className="bg-interactive-primary hover:bg-interactive-primary-hover text-ui-text-primary font-semibold py-3 px-6 rounded-lg transition-all hover:shadow-lg mb-8 inline-flex items-center gap-2"
              >
                <span>{t('messages.noBookings.exploreTours', 'Explore Tours')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* How it Works - Improved Layout */}
              <div className="bg-gradient-to-r from-ui-surface-secondary/30 to-ui-surface-tertiary/30 backdrop-blur-sm rounded-xl p-8 max-w-2xl mx-auto border border-ui-border-primary/30">
                <h4 className="font-bold text-ui-text-primary mb-6 text-lg flex items-center justify-center gap-3">
                  {t('messages.howItWorks.title', 'How messaging works')}
                </h4>

                <div className="grid gap-4 text-left">
                  <div className="flex items-start gap-4 rounded-2xl bg-ui-surface-primary/50">
                    <div className="w-8 h-8 bg-interactive-primary rounded-full flex items-center justify-center text-white font-bold text-sm mt-1">
                      1
                    </div>
                    <div>
                      <h5 className="font-semibold text-ui-text-primary mb-1">
                        {t('messages.howItWorks.step1Title', 'Book a Tour')}
                      </h5>
                      <p className="text-sm text-ui-text-secondary">
                        {t('messages.howItWorks.step1', 'Choose from amazing tours across French Polynesia')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-2xl bg-ui-surface-primary/50">
                    <div className="w-8 h-8 bg-interactive-primary rounded-full flex items-center justify-center text-white font-bold text-sm mt-1">
                      2
                    </div>
                    <div>
                      <h5 className="font-semibold text-ui-text-primary mb-1">
                        {t('messages.howItWorks.step2Title', 'Get Confirmation')}
                      </h5>
                      <p className="text-sm text-ui-text-secondary">
                        {t('messages.howItWorks.step2', 'Operators will confirm your booking and provide details')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-2xl bg-ui-surface-primary/50">
                    <div className="w-8 h-8 bg-interactive-primary rounded-full flex items-center justify-center text-white font-bold text-sm mt-1">
                      3
                    </div>
                    <div>
                      <h5 className="font-semibold text-ui-text-primary mb-1">
                        {t('messages.howItWorks.step3Title', 'Chat & Enjoy')}
                      </h5>
                      <p className="text-sm text-ui-text-secondary">
                        {t('messages.howItWorks.step3', 'Message directly with tour operators for any questions')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Mobile: Show conversation detail view
  if (selectedConversation) {
    const tourEmoji = TOUR_TYPE_EMOJIS[selectedConversation.tours?.tour_type] || '🌴'
    
    return (
      <div className="bg-ui-surface-overlay">
        {/* Enhanced Chat Header */}
        <div className="border-b border-ui-border-primary p-4 shadow-lg sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedConversation(null)}
              className="text-ui-text-secondary hover:text-ui-text-primary transition-colors p-1 hover:bg-ui-surface-primary rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-ui-text-primary truncate text-lg">
                {selectedConversation.tours?.tour_name || t('messages.interface.tourChat')}
              </h2>
              <div className="flex items-center gap-2 text-sm text-ui-text-secondary">
                <span className="text-base">{tourEmoji}</span>
                <Building2 className="w-3 h-3" />
                <span className="truncate">{selectedConversation.operators?.company_name}</span>
              </div>
            </div>
            
            <div className="text-right text-sm text-ui-text-secondary">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(selectedConversation.tours?.tour_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Messages Area */}
        <div 
          className="overflow-y-auto p-4 space-y-3 pb-28"
          style={{ height: 'calc(100vh - 160px)' }}
        >
          {loadingMessages ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-ui-text-secondary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-ui-surface-primary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-ui-text-secondary" />
              </div>
              <p className="text-ui-text-muted font-medium mb-1">{t('messages.emptyChat.noMessages')}</p>
              <p className="text-ui-text-disabled text-sm">{t('messages.emptyChat.startConversation')}</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isFromTourist = message.sender_type === 'tourist'
              const previousMessage = messages[index - 1]
              const isConsecutive = previousMessage && previousMessage.sender_type === message.sender_type
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isFromTourist ? 'justify-end' : 'justify-start'} ${
                    isConsecutive ? 'mt-1' : 'mt-4'
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-sm lg:max-w-md px-4 py-3 shadow-sm ${
                    isFromTourist
                        ? `bg-interactive-primary text-ui-text-primary ${
                            isConsecutive ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-br-sm'
                        } ${message._optimistic ? 'opacity-70' : ''}`
                        : `bg-ui-surface-primary text-ui-text-primary border border-ui-border-secondary/50 ${
                            isConsecutive ? 'rounded-2xl rounded-bl-md' : 'rounded-2xl rounded-bl-sm'
                          }`
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.message_text}</p>
                    <div
                      className={`text-xs mt-2 flex items-center gap-1 ${
                        isFromTourist ? 'text-interactive-primary-light justify-end' : 'text-ui-text-secondary'
                      }`}
                    >
                      <span>{chatService.formatMessageTime(message.created_at)}</span>
                        {message._optimistic && (
                        <span className="ml-1">⏳</span>
                        )}
                        {!isFromTourist && message.sender_info && (
                        <>
                          <span>•</span>
                          <span>{message.sender_info.company_name || t('messages.interface.operator')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Message Input */}
        <div className="bg-ui-surface-secondary border-t border-ui-border-primary p-4 shadow-lg fixed bottom-20 left-0 right-0 z-40">
          <div className="flex gap-3">
            <input
              ref={messageInputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t('messages.interface.typeMessage')}
              className="flex-1 bg-ui-surface-primary text-ui-text-primary rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-interactive-focus focus:bg-ui-surface-tertiary transition-all border border-ui-border-secondary"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="bg-interactive-primary hover:bg-interactive-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-ui-text-primary p-4 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Enhanced Main conversations list view
  return (
    <div className="min-h-screen bg-ui-surface-overlay pt-4 pb-20">
      {/* Enhanced Header - Learn Tab Style */}
      <div className="mb-6">
        <div className="bg-ui-surface-secondary/50 backdrop-blur-sm rounded-xl p-6 border border-ui-border-primary relative overflow-hidden">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage: 'url(/images/pattern-3-tahiti-tourism.svg)',
              backgroundSize: 'auto 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-interactive-primary/20 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-interactive-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-ui-text-primary">
                    {t('messages.interface.title', 'Messages')}
                  </h1>
                  <p className="text-ui-text-secondary">
                    {conversations.length > 0
                      ? `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}${unreadCount > 0 ? ` • ${unreadCount} unread` : ''}`
                      : t('messages.interface.subtitle', 'Chat with tour operators')
                    }
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={loadConversations}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-ui-surface-primary/50 hover:bg-ui-surface-primary text-ui-text-secondary hover:text-ui-text-primary rounded-lg transition-colors"
                title="Refresh conversations"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="px-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-ui-surface-secondary/30 backdrop-blur-sm rounded-xl h-20 animate-pulse border border-ui-border-primary" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="bg-ui-surface-secondary/50 backdrop-blur-sm rounded-xl p-8 border border-ui-border-primary relative overflow-hidden">
            {/* Background Pattern */}
            {/*
            <div
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage: 'url(/images/pattern-3-tahiti-tourism.svg)',
                backgroundSize: 'auto 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />
            */}

            <div className="relative z-10 text-center py-12">
              {/* Modern Icon */}
              <div className="w-20 h-20 bg-interactive-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <MessageCircle className="w-10 h-10 text-interactive-primary" />
              </div>

              {/* Title and Description */}
              <h3 className="text-2xl font-bold text-ui-text-primary mb-3">
                {t('messages.interface.noConversations', 'No conversations yet')}
              </h3>
              <p className="text-ui-text-secondary mb-8 max-w-md mx-auto leading-relaxed">
                {t('messages.interface.startBooking', 'Book a tour to start chatting with operators and get real-time assistance for your adventure.')}
              </p>

              {/* Call to Action Button */}
              <button
                onClick={() => setActiveTab('discover')}
                className="bg-interactive-primary hover:bg-interactive-primary-hover text-ui-text-primary font-semibold py-3 px-6 rounded-lg transition-all hover:shadow-lg mb-8 inline-flex items-center gap-2"
              >
                <span>{t('messages.interface.exploreTours', 'Explore Tours')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* How it Works - Improved Layout */}
              <div className="bg-gradient-to-r from-ui-surface-secondary/30 to-ui-surface-tertiary/30 backdrop-blur-sm rounded-xl p-8 max-w-2xl mx-auto border border-ui-border-primary/30">
              <h4 className="font-bold text-ui-text-primary mb-6 text-lg flex items-center justify-center gap-3">
                <div className="w-8 h-8 bg-interactive-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-interactive-primary text-sm">💬</span>
                </div>
                {t('messages.howItWorks.title', { default: 'How messaging works' })}
              </h4>

              <div className="grid gap-4 text-left">
                <div className="flex items-start gap-4 rounded-2xl bg-ui-surface-primary/50">
                  <div className="w-8 h-8 bg-interactive-primary rounded-full flex items-center justify-center text-white font-bold text-sm mt-1">
                    1
                  </div>
                  <div>
                    <h5 className="font-semibold text-ui-text-primary mb-1">
                      {t('messages.howItWorks.step1Title', { default: 'Book a Tour' })}
                    </h5>
                    <p className="text-sm text-ui-text-secondary">
                      {t('messages.howItWorks.step1', { default: 'Choose from amazing tours across French Polynesia' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl bg-ui-surface-primary/50">
                  <div className="w-8 h-8 bg-interactive-primary rounded-full flex items-center justify-center text-white font-bold text-sm mt-1">
                    2
                  </div>
                  <div>
                    <h5 className="font-semibold text-ui-text-primary mb-1">
                      {t('messages.howItWorks.step2Title', { default: 'Get Confirmation' })}
                    </h5>
                    <p className="text-sm text-ui-text-secondary">
                      {t('messages.howItWorks.step2', { default: 'Operators will confirm your booking and provide details' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl bg-ui-surface-primary/50">
                  <div className="w-8 h-8 bg-interactive-primary rounded-full flex items-center justify-center text-white font-bold text-sm mt-1">
                    3
                  </div>
                  <div>
                    <h5 className="font-semibold text-ui-text-primary mb-1">
                      {t('messages.howItWorks.step3Title', { default: 'Chat & Enjoy' })}
                    </h5>
                    <p className="text-sm text-ui-text-secondary">
                      {t('messages.howItWorks.step3', { default: 'Message directly with tour operators for any questions' })}
                    </p>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => {
              const tourEmoji = TOUR_TYPE_EMOJIS[conversation.tours?.tour_type] || '🌴'
              
              return (
                <button
                  key={conversation.id}
                  onClick={() => {
                    setSelectedConversation(conversation)
                    loadMessages(conversation.id)
                  }}
                  className="w-full bg-ui-surface-secondary/50 backdrop-blur-sm rounded-xl p-5 text-left transition-all duration-200 border border-ui-border-primary hover:border-interactive-primary/50 hover:bg-ui-surface-secondary/70 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-ui-text-primary truncate text-lg">
                          {conversation.tours?.tour_name || t('messages.interface.tourChat')}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-interactive-primary text-ui-text-primary text-xs px-2.5 py-1 rounded-full font-medium shadow-lg message-notification">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-ui-text-secondary mb-3">
                        <span className="text-lg">{tourEmoji}</span>
                        <Building2 className="w-4 h-4" />
                        <span className="truncate font-medium">{conversation.operators?.company_name}</span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-ui-text-disabled mb-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(conversation.tours?.tour_date).toLocaleDateString()}</span>
                        </div>
                        {conversation.tours?.meeting_point && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">{conversation.tours.meeting_point}</span>
                          </div>
                        )}
                      </div>

                      {conversation.latestMessage && (
                        <div className="text-sm text-ui-text-secondary bg-ui-surface-secondary/50 rounded-lg p-3 border border-ui-border-primary/30">
                          <span className="font-medium text-ui-text-muted">
                            {conversation.latestMessage.sender_type === 'tourist' ? t('messages.interface.you') : t('messages.interface.operatorLabel')}
                          </span>
                          <span className="line-clamp-2">
                            {conversation.latestMessage.message_text}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex flex-col items-end">
                      <div className="text-xs text-ui-text-disabled mb-3">
                        {formatConversationDate(conversation.latestMessage?.created_at || conversation.created_at)}
                      </div>
                      <ChevronRight className="w-5 h-5 text-ui-text-disabled group-hover:text-ui-text-secondary transition-colors" />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MessagesTab