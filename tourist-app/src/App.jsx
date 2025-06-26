// src/App.jsx
import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import TourDiscovery from './components/tours/tourDiscovery'
import Bookings from './components/booking/Bookings'
import UserProfile from './components/user/UserProfile'
import Navigation from './components/layout/Navigation'
import { useBookingStore } from './stores/bookingStore'
import { notificationService } from './services/supabase'

function App() {
  const { setOfflineStatus, addNotification } = useBookingStore()

  useEffect(() => {
    // Setup offline detection
    const handleOnline = () => setOfflineStatus(false)
    const handleOffline = () => setOfflineStatus(true)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Request notification permission
    notificationService.requestPermission()

    // Setup PWA install prompt
    let deferredPrompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      deferredPrompt = e
      addNotification({
        type: 'pwa_install',
        title: 'Install VAI-Tickets',
        message: 'Add to home screen for faster access',
        action: () => {
          if (deferredPrompt) {
            deferredPrompt.prompt()
          }
        }
      })
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [setOfflineStatus, addNotification])

  return (
    <Router>
      <div className="min-h-screen bg-vai-gradient">
        <Routes>
          <Route path="/" element={<TourDiscovery />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Navigation />
        
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #475569'
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#f8fafc'
              }
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f8fafc'
              }
            }
          }}
        />
      </div>
    </Router>
  )
}

export default App