// src/components/shared/Navigation.jsx
import React, { useState, useEffect } from 'react'
import { Home, Search, Calendar, User } from 'lucide-react'
import { useAppStore } from '../../stores/bookingStore'
import { MessageCircle } from 'lucide-react' // Add MessageCircle to your existing lucide import
import { useAuth } from '../../contexts/AuthContext'
import chatService from '../../services/chatService'
import { supabase } from '../../services/supabase'

const Navigation = () => {
  const { activeTab, setActiveTab } = useAppStore()
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [touristUserId, setTouristUserId] = useState(null)

  // Get tourist user ID
  useEffect(() => {
    const getTouristUserId = async () => {
      if (user) {
        try {
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

  // Load unread count
  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!touristUserId) return
      
      try {
        const count = await chatService.getUnreadCount(touristUserId, 'tourist')
        setUnreadCount(count)
      } catch (error) {
        console.error('Error loading unread count:', error)
      }
    }

    loadUnreadCount()

    // Subscribe to real-time unread count updates
    if (touristUserId) {
      const unsubscribe = chatService.subscribeToUnreadCount(
        touristUserId,
        'tourist',
        (newCount) => {
          setUnreadCount(newCount)
        }
      )
      return unsubscribe
    }
  }, [touristUserId])

  const tabs = [
  { id: 'discover', icon: Home, label: 'Discover' },
  { id: 'explore', icon: Search, label: 'Explore' },
  { id: 'journey', icon: Calendar, label: 'Journey' },
  { 
    id: 'messages', 
    icon: MessageCircle, 
    label: 'Messages',
    badge: unreadCount > 0 ? unreadCount : null
  },
  { id: 'profile', icon: User, label: 'Support' }
]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 z-50 pb-safe">
      <div className="grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => {
              // Only clean up conversation subscriptions, keep Navigation's unread subscription
              if (activeTab === 'messages' && tab.id !== 'messages') {
                console.log('🧹 Navigation cleanup: Leaving Messages tab, cleaning up conversation subscriptions only')
                
                // ✅ SELECTIVE CLEANUP: Only remove conversation subscriptions
                chatService.subscriptions.forEach((subscription, key) => {
                  if (key.startsWith('conversation_')) {
                    console.log(`🧹 Removing conversation subscription: ${key}`)
                    if (Array.isArray(subscription)) {
                      subscription.forEach(sub => supabase.removeChannel(sub))
                    } else {
                      supabase.removeChannel(subscription)
                    }
                    chatService.subscriptions.delete(key)
                    chatService.messageCallbacks.delete(key)
                  }
                })
                
                // ✅ KEEP: Unread subscriptions (for Navigation badge)
                console.log('✅ Keeping unread subscriptions for Navigation badge')
              }
              
              setActiveTab(tab.id)
            }}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                isActive 
                  ? 'text-blue-400' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon size={18} />
                {tab.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-400 rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default Navigation