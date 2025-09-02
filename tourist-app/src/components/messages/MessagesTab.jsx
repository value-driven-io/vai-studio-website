// tourist-app/src/components/messages/MessagesTab.jsx
import React, { useState, useEffect, useRef } from 'react'
import { 
  MessageCircle, Send, ArrowLeft, Calendar, MapPin, Building2, 
  Clock, CheckCircle2, Circle, Loader2, RefreshCw, User, Users,
  ChevronRight, MessageSquare, AlertCircle
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import chatService from '../../services/chatService'
import { supabase } from '../../services/supabase'
import { TOUR_TYPE_EMOJIS } from '../../constants/moods'
import toast from 'react-hot-toast'

const MessagesTab = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
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
    <div className="bg-slate-800/30 rounded-xl p-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-5 h-5 bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-700 rounded w-32"></div>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-slate-700 rounded"></div>
            <div className="h-3 bg-slate-700 rounded w-24"></div>
          </div>
          <div className="h-3 bg-slate-700 rounded w-40"></div>
        </div>
        <div className="w-4 h-4 bg-slate-700 rounded"></div>
      </div>
    </div>
  )

  // Auth check
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">{t('messages.auth.signInTitle')}</h2>
          <p className="text-slate-400">{t('messages.auth.signInDescription')}</p>
        </div>
      </div>
    )
  }

  // Mobile: Show conversation detail view
  if (selectedConversation) {
    const tourEmoji = TOUR_TYPE_EMOJIS[selectedConversation.tours?.tour_type] || '🌴'
    
    return (
      <div className="bg-slate-900">
        {/* Enhanced Chat Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-4 shadow-lg sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedConversation(null)}
              className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-white truncate text-lg">
                {selectedConversation.tours?.tour_name || t('messages.interface.tourChat')}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span className="text-base">{tourEmoji}</span>
                <Building2 className="w-3 h-3" />
                <span className="truncate">{selectedConversation.operators?.company_name}</span>
              </div>
            </div>
            
            <div className="text-right text-sm text-slate-400">
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
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-300 font-medium mb-1">{t('messages.emptyChat.noMessages')}</p>
              <p className="text-slate-500 text-sm">{t('messages.emptyChat.startConversation')}</p>
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
                        ? `bg-blue-600 text-white ${
                            isConsecutive ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-br-sm'
                        } ${message._optimistic ? 'opacity-70' : ''}`
                        : `bg-slate-700 text-white border border-slate-600/50 ${
                            isConsecutive ? 'rounded-2xl rounded-bl-md' : 'rounded-2xl rounded-bl-sm'
                          }`
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.message_text}</p>
                    <div
                      className={`text-xs mt-2 flex items-center gap-1 ${
                        isFromTourist ? 'text-blue-100 justify-end' : 'text-slate-400'
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
        <div className="bg-slate-800 border-t border-slate-700 p-4 shadow-lg fixed bottom-20 left-0 right-0 z-40">
          <div className="flex gap-3">
            <input
              ref={messageInputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t('messages.interface.typeMessage')}
              className="flex-1 bg-slate-700 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-600 transition-all border border-slate-600"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-4 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg"
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
    <div className="min-h-screen bg-slate-900">
      {/* Enhanced Header */}
      <div className="border-b border-slate-700 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">{t('messages.interface.title')}</h1>
            <p className="text-slate-400 text-sm">{t('messages.interface.subtitle')}</p>
          </div>
          <button
            onClick={loadConversations}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <ConversationSkeleton key={i} />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <MessageCircle className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">{t('messages.interface.noConversations')}</h3>
            <p className="text-slate-400 mb-8 max-w-sm mx-auto">
              {t('messages.interface.startBooking')}
            </p>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 text-left max-w-md mx-auto border border-slate-700/50">
              <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                <span>{t('messages.howItWorks.title')}</span>
              </h4>
              <ul className="text-sm text-slate-400 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  {t('messages.howItWorks.step1')}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  {t('messages.howItWorks.step2')}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  {t('messages.howItWorks.step3')}
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation) => {
              const tourEmoji = TOUR_TYPE_EMOJIS[conversation.tours?.tour_type] || '🌴'
              
              return (
                <button
                  key={conversation.id}
                  onClick={() => {
                    setSelectedConversation(conversation)
                    loadMessages(conversation.id)
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 rounded-2xl p-5 text-left transition-all duration-200 border border-slate-700/50 hover:border-slate-600 hover:shadow-lg group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white truncate text-lg">
                          {conversation.tours?.tour_name || t('messages.interface.tourChat')}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-lg">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                        <span className="text-lg">{tourEmoji}</span>
                        <Building2 className="w-4 h-4" />
                        <span className="truncate font-medium">{conversation.operators?.company_name}</span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
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
                        <div className="text-sm text-slate-400 bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                          <span className="font-medium text-slate-300">
                            {conversation.latestMessage.sender_type === 'tourist' ? t('messages.interface.you') : t('messages.interface.operatorLabel')}
                          </span>
                          <span className="line-clamp-2">
                            {conversation.latestMessage.message_text}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex flex-col items-end">
                      <div className="text-xs text-slate-500 mb-3">
                        {formatConversationDate(conversation.latestMessage?.created_at || conversation.created_at)}
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-400 transition-colors" />
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