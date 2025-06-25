// src/components/layout/Navigation.jsx
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Calendar, User, Heart, MessageCircle } from 'lucide-react'
import { useBookingStore } from '../../stores/bookingStore'

const Navigation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentBookings, notifications } = useBookingStore()

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Discover',
      badge: null
    },
    {
      path: '/bookings',
      icon: Calendar,
      label: 'Bookings',
      badge: currentBookings.length > 0 ? currentBookings.length : null
    },
    {
      path: '/favorites',
      icon: Heart,
      label: 'Favorites',
      badge: null
    },
    {
      path: '/support',
      icon: MessageCircle,
      label: 'Support',
      badge: notifications.length > 0 ? notifications.length : null
    },
    {
      path: '/profile',
      icon: User,
      label: 'Profile',
      badge: null
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-vai-lagoon/90 backdrop-blur-vai border-t border-slate-700 z-50">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors relative ${
                isActive 
                  ? 'text-vai-coral' 
                  : 'text-slate-400 hover:text-vai-pearl'
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-vai-sunset text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-vai-coral rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Navigation