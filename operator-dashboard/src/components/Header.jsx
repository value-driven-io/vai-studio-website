import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LogOut, User, Settings, MessageCircle, Bell } from 'lucide-react'
import LanguageDropdown from './LanguageDropdown'
import chatService from '../services/chatService'

const Header = ({ operator, logout, setActiveTab }) => {
  const { t } = useTranslation()
  
  // Notification state
  const [unreadChatCount, setUnreadChatCount] = useState(0)

  // Load unread chat count
  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!operator?.auth_user_id) return
      
      try {
        const count = await chatService.getUnreadCount(operator.auth_user_id, 'operator')
        setUnreadChatCount(count)
        console.log(`📬 Unread chat count: ${count}`) // Temporary debug
      } catch (error) {
        console.error('Error loading unread count:', error)
      }
    }

    // Initial load
    loadUnreadCount()

    // 🔧 SIMPLE POLLING: Refresh every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000)
    
    return () => clearInterval(interval)
  }, [operator?.auth_user_id])

  return (
    <header className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* Left side - Branding */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          
          <div>
            <h1 className="text-xl font-bold text-white">
              {t('header.title')}
            </h1>
            <p className="text-slate-400 text-sm">
              {t('header.greeting', { 
                companyName: operator?.company_name || operator?.contact_person || 'Operator' 
              })}
            </p>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">

          {/* Chat Messages Badge */}
            <button
              onClick={() => {
                setActiveTab && setActiveTab('bookings')
                // Optional: Add filter for bookings with messages in the future
              }}
              className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
              title={unreadChatCount > 0 ? `${unreadChatCount} unread messages - Click to view bookings` : 'No unread messages'}
            >
              <MessageCircle className="w-5 h-5" />
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {unreadChatCount > 99 ? '99+' : unreadChatCount}
                </span>
              )}
            </button>

          {/* Future Notification Center */}
          <button
            className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
            title="Notifications (Coming Soon)"
            disabled
          >
            <Bell className="w-5 h-5 opacity-50" />
          </button>

          {/* User info */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 text-sm hidden sm:inline">
              {operator?.email}
            </span>
          </div>
          
          
          {/* Language Dropdown - Portal handles z-index automatically */}
          <LanguageDropdown />
          

          {/* Logout button */}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-colors"
            title={t('common.logout')}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t('common.logout')}</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header