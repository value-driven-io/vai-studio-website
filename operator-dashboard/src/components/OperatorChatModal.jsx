// operator-dashboard/src/components/OperatorChatModal.jsx
import React, { useState, useEffect, useRef } from 'react'
import { 
  X, Send, MessageCircle, Calendar, MapPin, User, Loader2
} from 'lucide-react'

//  chatService.js at operator-dashboard/src/services/
import chatService from '../services/chatService'

const OperatorChatModal = ({ isOpen, onClose, booking, operator }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
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
  }, [isOpen, booking])

  // Real-time subscription
  useEffect(() => {
    if (!isOpen || !booking) return

    const unsubscribe = chatService.subscribeToConversation(
      booking.id,
      (payload) => {
        console.log('Operator real-time message:', payload)
        loadMessages()
      }
    )

    return unsubscribe
  }, [isOpen, booking])

  const loadMessages = async () => {
    if (!booking) return
    
    try {
      setLoading(true)
      const msgs = await chatService.getConversation(booking.id)
      setMessages(msgs)
      
      // Mark messages as read for operator
      await chatService.markAsRead(booking.id, 'operator')
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !booking || !operator) return
    
    try {
      setSending(true)
      await chatService.sendMessage(
        booking.id,
        newMessage.trim(),
        'operator',
        operator.id
      )
      
      setNewMessage('')
      loadMessages()
    } catch (error) {
      console.error('Error sending message:', error)
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] border border-slate-700">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 max-h-96">
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
                    }`}
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
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-slate-700">
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
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-colors"
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
    </div>
  )
}

export default OperatorChatModal