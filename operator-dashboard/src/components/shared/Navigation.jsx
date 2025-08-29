// src/components/Navigation.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart3, Plus, Calendar, User, TrendingUp, Rocket, Target } from 'lucide-react'

const Navigation = ({ activeTab, setActiveTab, stats, showSetupTab = false }) => {
  const { t } = useTranslation()
  
  const navItems = [
    // Setup tab - conditionally included as first item
    ...(showSetupTab ? [{
      id: 'setup',
      icon: Target,
      label: 'Setup',
      badge: null,
      priority: true
    }] : []),
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
      icon: Rocket,
      label: t('common.bookings'),
      badge: stats?.pendingBookings > 0 ? stats.pendingBookings : null
    },

    //{
     // id: 'schedules',
     // icon: Calendar, // You can import a different icon if preferred
     // label: t('common.schedules'), 
     // badge: null
    //},

    {
      id: 'profile',
      icon: User,
      label: t('common.profile'),
      badge: null
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm border-t border-slate-700 z-50">
      <div className={`grid ${showSetupTab ? 'grid-cols-5' : 'grid-cols-4'} h-16 max-w-7xl mx-auto`}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors relative ${
                isActive 
                  ? item.priority ? 'text-green-400' : 'text-blue-400'
                  : item.priority ? 'text-green-300 hover:text-green-200' : 'text-slate-400 hover:text-slate-200'
              }`}
              data-tour={item.id === 'bookings' ? 'bookings-tab' : item.id === 'profile' ? 'profile-tab' : undefined}
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
                <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 rounded-full ${
                  item.priority ? 'bg-green-400' : 'bg-blue-400'
                }`} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Navigation