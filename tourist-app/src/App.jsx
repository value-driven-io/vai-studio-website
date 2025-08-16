// ==============================================
// FILE: tourist-app/src/App.jsx (ENHANCED WITH i18n)
// ==============================================

import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import './i18n/config'
import { useTranslation } from 'react-i18next'

// Import our main components 
import Navigation from './components/shared/Navigation'
import DiscoverTab from './components/discovery/DiscoverTab'
import ExploreTab from './components/explore/ExploreTab'
import JourneyTab from './components/journey/JourneyTab'
import ProfileTab from './components/profile/ProfileTab'
import AuthModal from './components/auth/AuthModal'
import LaunchingSoonModal from './components/shared/LaunchingSoonModal';
import MessagesTab from './components/messages/MessagesTab'
import { CurrencyProvider } from './hooks/useCurrency'
import { useCurrencyContext } from './hooks/useCurrency'
import CurrencySelector from './components/shared/CurrencySelector'
import AuthCallback from './components/auth/AuthCallback'

import VAILogo from './components/shared/VAILogo'
import LanguageDropdown from './components/shared/LanguageDropdown'

import { useAppStore } from './stores/bookingStore'

// 2. CHECK THE ENVIRONMENT VARIABLE
// This variable will control whether the app is "live" or shows the "coming soon" screen.
// You will set this in your .env file.
const isAppLaunched = import.meta.env.VITE_APP_LAUNCHED === 'true';

// Header Component with Login (ENHANCED with Cultural Translations)
const AppHeader = () => {
  const { user, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { t } = useTranslation()
  // Currency context for global control
  const { selectedCurrency, changeCurrency } = useCurrencyContext()

  return (
    <>
      {/* Sticky container with spacing */}
      <div className="top-0 z-40 px-4 pt-4">
        <header className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700 mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            
            {/* Left side - Branding */}
            <div className="flex items-center gap-4">
              {/* Logo/Brand */}
              <div className="app-logo-container flex items-center gap-2">
                <VAILogo size="sm" />
              </div>
              
              <div>
                <h1 className="text-lg font-bold text-white">
                  {t('header.title', 'VAI Tickets')}
                </h1>
                <p className="text-slate-400 text-sm">
                  {user 
                    ? t('header.greeting', `Welcome back, ${user.user_metadata?.first_name || 'Explorer'}!`)
                    : t('header.subtitle', 'Discover French Polynesia')
                  }
                </p>
              </div>
            </div>
            {/* Global Currency Selector */}
              <CurrencySelector 
                selectedCurrency={selectedCurrency}
                onCurrencyChange={changeCurrency}
                size="small"
                className="sm:hidden"
              />

            {/* Right side - Actions */}
            <div className="flex items-center gap-3">
              
              {/* User info when logged in */}
              {user && (
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg">
                  <span className="text-slate-300 text-sm hidden sm:inline">
                    {user.email}
                  </span>
                </div>
              )}

              {/* Global Currency Selector */}
              <CurrencySelector 
                selectedCurrency={selectedCurrency}
                onCurrencyChange={changeCurrency}
                size="small"
                className="hidden sm:flex"
              />
              
              {/* Language Selector */}
              <LanguageDropdown />
              
              {/* Login/Logout Section */}
              {user ? (
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                  title={t('common.logout')}
                >
                  <span className="hidden sm:inline">{t('common.signOut')}</span>
                  <span className="sm:hidden">🚪</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {t('common.login')}
                </button>
              )}
            </div>
          </div>
        </header>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  )
}

  // Main App Component (UNCHANGED - Preserving ALL existing functionality)
function AppContent() {
  const { activeTab } = useAppStore()

  // Handle auth success messages from email links
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const message = urlParams.get('message')
    
    if (message === 'welcome') {
      toast.success('🎉 Welcome! Your email has been confirmed.')
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
    }
    if (message === 'signin') {
      toast.info('📧 Please sign in to continue.')
      window.history.replaceState({}, '', window.location.pathname)
    }
    if (message === 'reset') {
      toast.success('🔑 Password reset successful! You can now sign in.')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header with Login */}
      <AppHeader />

      {/* Main Content Area */}
      <main className="pb-20 px-4"> {/* pb-20 keeps space for bottom navigation */}
        <div style={{ display: activeTab === 'discover' ? 'block' : 'none' }}>
          <DiscoverTab />
        </div>
        <div style={{ display: activeTab === 'explore' ? 'block' : 'none' }}>
          <ExploreTab />
        </div>
        <div style={{ display: activeTab === 'journey' ? 'block' : 'none' }}>
          <JourneyTab />
        </div>
        <div style={{ display: activeTab === 'profile' ? 'block' : 'none' }}>
          <ProfileTab />
        </div>
        <div style={{ display: activeTab === 'messages' ? 'block' : 'none' }}>
          <MessagesTab />
        </div>
      </main>

      {/* Bottom Navigation */}
      <Navigation />

      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            zIndex: 100000 // 🔧 HIGHEST z-index
          }
        }}
        containerStyle={{
          zIndex: 100000
        }}
      />
    </div>
  )
}

// Router Component (Minimal routing integration)
function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Auth Callback Route */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Main App Route - All existing functionality */}
        <Route path="/*" element={
          <CurrencyProvider>
            <div className="bg-vai-deep-ocean min-h-screen text-white">
              {/* Conditional rendering logic - UNCHANGED */}
              {!isAppLaunched ? (
                <LaunchingSoonModal />
              ) : (
                <AppContent />
              )}
            </div>
          </CurrencyProvider>
        } />
      </Routes>
    </Router>
  )
}

// Main App Component (UPDATED - Wrapped with Router)
function App() {
  return (
    <AuthProvider>
      <AppRouter />
      
      {/* Global Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            zIndex: 100000
          }
        }}
        containerStyle={{
          zIndex: 100000
        }}
      />
    </AuthProvider>
  )
}

export default App