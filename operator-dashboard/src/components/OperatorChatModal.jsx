// operator-dashboard/src/components/OperatorChatModal.jsx
import React, { useState, useEffect, useRef } from 'react'
import { 
  X, Send, MessageCircle, Calendar, MapPin, User, Loader2, AlertCircle
} from 'lucide-react'

import chatService from '../services/chatService'

const OperatorChatModal = ({ isOpen, onClose, booking, operator }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load messages when modal opens
  useEffect(() => {
    if (isOpen && booking) {
      loadMessages()
    }
  }, [isOpen, booking?.id]) 

  // 🔧 FIXED: Real-time subscription with optimistic updates
  useEffect(() => {
    if (!isOpen || !booking) return

    const unsubscribe = chatService.subscribeToConversation(
      booking.id,
      (payload) => {
        console.log('Operator real-time message:', payload)
        
        if (payload.type === 'INSERT') {
          // 🔧 FIXED: Add new message to existing messages instead of reloading
          setMessages(prevMessages => {
            // Check if message already exists to prevent duplicates
            const messageExists = prevMessages.some(msg => msg.id === payload.message.id)
            if (messageExists) return prevMessages
            
            // Add new message with sender info
            const newMessageWithInfo = {
              ...payload.message,
              sender_info: payload.message.sender_type === 'operator' 
                ? { company_name: operator?.company_name }
                : null
            }
            
            return [...prevMessages, newMessageWithInfo]
          })
          
          // Mark as read if not from operator
          if (payload.message.sender_type !== 'operator') {
            chatService.markAsRead(booking.id, 'operator')
          }
        } else if (payload.type === 'UPDATE') {
          // Handle message updates (like marking as read)
          setMessages(prevMessages =>
            prevMessages.map(msg =>
              msg.id === payload.message.id ? { ...msg, ...payload.message } : msg
            )
          )
        }
      }
    )

    return unsubscribe
  }, [isOpen, booking?.id, operator?.id])

  // 🔧 NEW: Enhanced error handling with retry
  const loadMessages = async () => {
    if (!booking) return
    
    try {
      setLoading(true)
      setError(null)
      
      const msgs = await chatService.withRetry(
        () => chatService.getConversation(booking.id),
        3
      )
      
      setMessages(msgs)
      setRetryCount(0)
      
      // Mark messages as read for operator
      await chatService.markAsRead(booking.id, 'operator')
    } catch (error) {
      console.error('Error loading messages:', error)
      setError('Failed to load messages. Please try again.')
      setRetryCount(prev => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  // 🔧 NEW: Enhanced send message with optimistic updates
  const sendMessage = async () => {
    if (!newMessage.trim() || !booking || !operator) return
    
    const messageText = newMessage.trim()
    const tempId = `temp_${Date.now()}`
    
    // 🔧 FIXED: Optimistic update - add message immediately
    const optimisticMessage = {
      id: tempId,
      booking_id: booking.id,
      sender_type: 'operator',
      sender_id: operator.auth_user_id, // 🔧 FIXED: Use auth_user_id
      message_text: messageText,
      is_read: false,
      created_at: new Date().toISOString(),
      sender_info: { company_name: operator.company_name },
      _optimistic: true
    }
    
    setMessages(prevMessages => [...prevMessages, optimisticMessage])
    setNewMessage('')
    
    try {
      setSending(true)
      setError(null)
      
      const sentMessage = await chatService.withRetry(
        () => chatService.sendMessage(
          booking.id,
          messageText,
          'operator',
          operator.auth_user_id // 🔧 FIXED: Use auth_user_id
        ),
        3
      )
      
      // 🔧 FIXED: Replace optimistic message with real message
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === tempId 
            ? { ...sentMessage, sender_info: optimisticMessage.sender_info }
            : msg
        )
      )
      
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Failed to send message. Please try again.')
      
      // 🔧 FIXED: Remove optimistic message on error
      setMessages(prevMessages =>
        prevMessages.filter(msg => msg.id !== tempId)
      )
      
      // Restore message text
      setNewMessage(messageText)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleRetry = () => {
    loadMessages()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] border border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white mb-2">
                Chat with {booking.customer_name}
              </h2>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{booking.tours?.tour_name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{booking.tours?.tour_date}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 bg-red-900/50 border-b border-red-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-200 flex-1">{error}</span>
            <button
              onClick={handleRetry}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_type === 'operator' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl ${
                      message.sender_type === 'operator'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-slate-700 text-white rounded-bl-sm'
                    } ${message._optimistic ? 'opacity-70' : ''}`}
                  >
                    <p className="text-sm">{message.message_text}</p>
                    <div
                      className={`text-xs mt-1 ${
                        message.sender_type === 'operator' 
                          ? 'text-blue-100' 
                          : 'text-slate-400'
                      }`}
                    >
                      {chatService.formatMessageTime(message.created_at)}
                      {message._optimistic && (
                        <span className="ml-1">⏳</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-slate-700 flex-shrink-0">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OperatorChatModal