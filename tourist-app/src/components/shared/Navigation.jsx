// src/components/shared/Navigation.jsx
import React from 'react'
import { Home, Search, Calendar, User } from 'lucide-react'
import { useAppStore } from '../../stores/bookingStore'

const Navigation = () => {
  const { activeTab, setActiveTab } = useAppStore()

  const tabs = [
    { id: 'discover', icon: Home, label: 'Discover' },
    { id: 'explore', icon: Search, label: 'Explore' },
    { id: 'journey', icon: Calendar, label: 'Journey' },
    { id: 'profile', icon: User, label: 'Profile' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 z-50 pb-safe">
      <div className="grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                isActive 
                  ? 'text-blue-400' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={20} />
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