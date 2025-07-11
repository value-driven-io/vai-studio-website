// src/components/Navigation.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart3, Plus, Calendar, User } from 'lucide-react'

const Navigation = ({ activeTab, setActiveTab, stats }) => {
  const { t } = useTranslation()
  
  const navItems = [
    {
      id: 'dashboard',
      icon: BarChart3,
      label: t('common.dashboard'),
      badge: null
    },
    {
      id: 'create',
      icon: Plus,
      label: t('common.create'),
      badge: null
    },
    {
      id: 'bookings',
      icon: Calendar,
      label: t('common.bookings'),
      badge: stats?.pendingBookings > 0 ? stats.pendingBookings : null
    },
    {
      id: 'profile',
      icon: User,
      label: t('common.profile'),
      badge: null
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm border-t border-slate-700 z-50">
      <div className="grid grid-cols-4 h-16 max-w-7xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors relative ${
                isActive 
                  ? 'text-blue-400' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-400 rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Navigation