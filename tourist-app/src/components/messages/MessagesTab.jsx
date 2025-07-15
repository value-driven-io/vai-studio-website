// tourist-app/src/components/messages/MessagesTab.jsx
import React, { useState, useEffect, useRef } from 'react'
import { 
  MessageCircle, Send, ArrowLeft, Calendar, MapPin, Building2, 
  Clock, CheckCircle2, Circle, Loader2, RefreshCw, User, Users,
  ChevronRight, MessageSquare, AlertCircle
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import chatService from '../../services/chatService'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'

const MessagesTab = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
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
      toast.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  // Load messages for selected conversation
  const loadMessages = async (bookingId) => {
    try {
      const msgs = await chatService.getConversation(bookingId)
      setMessages(msgs)
      
      // Mark messages as read
      await chatService.markAsRead(bookingId, 'tourist')
      
      // Refresh conversations to update unread counts
      loadConversations()
    } catch (error) {
      console.error('Error loading messages:', error)
      toast.error('Failed to load messages')
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !touristUserId) return
    
    try {
      setSending(true)
      await chatService.sendMessage(
        selectedConversation.id,
        newMessage.trim(),
        'tourist',
        touristUserId
      )
      
      setNewMessage('')
      
      // Reload messages and conversations
      loadMessages(selectedConversation.id)
      loadConversations()
      
      toast.success('Message sent!')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [touristUserId])

  // Real-time updates for selected conversation
  useEffect(() => {
    if (!selectedConversation) return

    const unsubscribe = chatService.subscribeToConversation(
      selectedConversation.id,
      (payload) => {
        console.log('Real-time message update:', payload)
        // Reload messages when we get real-time updates
        loadMessages(selectedConversation.id)
      }
    )

    return unsubscribe
  }, [selectedConversation])

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
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  // Auth check
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Sign in to view messages</h2>
          <p className="text-slate-400">Connect with your tour operators</p>
        </div>
      </div>
    )
  }

  // Mobile: Show conversation detail view
  if (selectedConversation) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        {/* Chat Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center gap-3">
          <button
            onClick={() => setSelectedConversation(null)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-white truncate">
              {selectedConversation.tours?.tour_name || 'Tour Chat'}
            </h2>
            <div className="flex items-center gap-2 text-sm text-slate-400">
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

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">No messages yet</p>
              <p className="text-slate-500 text-sm">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_type === 'tourist' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.sender_type === 'tourist'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-slate-700 text-white rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm">{message.message_text}</p>
                  <div
                    className={`text-xs mt-1 ${
                      message.sender_type === 'tourist' ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {chatService.formatMessageTime(message.created_at)}
                    {message.sender_type !== 'tourist' && message.sender_info && (
                      <span className="ml-2">• {message.sender_info.company_name || 'Operator'}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-slate-800 border-t border-slate-700 p-4">
          <div className="flex gap-3">
            <input
              ref={messageInputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
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

  // Main conversations list view
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">Messages</h1>
            <p className="text-slate-400 text-sm">Chat with your tour operators</p>
          </div>
          <button
            onClick={loadConversations}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-800/50 rounded-xl h-20 animate-pulse"></div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No conversations yet</h3>
            <p className="text-slate-400 mb-6">
              Messages will appear here after you have confirmed bookings
            </p>
            <div className="bg-slate-800/50 rounded-lg p-4 text-left max-w-md mx-auto">
              <h4 className="font-medium text-white mb-2">💡 How it works:</h4>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• Book a tour through the app</li>
                <li>• Wait for operator confirmation</li>
                <li>• Start chatting once confirmed!</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => {
                  setSelectedConversation(conversation)
                  loadMessages(conversation.id)
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl p-4 text-left transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-white truncate">
                        {conversation.tours?.tour_name || 'Tour Chat'}
                      </h3>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                      <Building2 className="w-3 h-3" />
                      <span className="truncate">{conversation.operators?.company_name}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(conversation.tours?.tour_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{conversation.tours?.meeting_point}</span>
                      </div>
                    </div>

                    {conversation.latestMessage && (
                      <div className="mt-2 text-sm text-slate-400">
                        <span className="font-medium">
                          {conversation.latestMessage.sender_type === 'tourist' ? 'You: ' : 'Operator: '}
                        </span>
                        <span className="truncate">
                          {conversation.latestMessage.message_text}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-3 flex flex-col items-end">
                    <div className="text-xs text-slate-500 mb-2">
                      {formatConversationDate(conversation.latestMessage?.created_at || conversation.created_at)}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MessagesTab