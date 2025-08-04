// ==============================================
// FILE: tourist-app/src/App.jsx (ENHANCED WITH i18n)
// ==============================================

import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import './i18n/config'
// 🌍 NEW: Import useTranslation
import { useTranslation } from 'react-i18next'

// Import our main components 
import Navigation from './components/shared/Navigation'
import DiscoverTab from './components/discovery/DiscoverTab'
import ExploreTab from './components/explore/ExploreTab'
import JourneyTab from './components/journey/JourneyTab'
import ProfileTab from './components/profile/ProfileTab'
import AuthModal from './components/auth/AuthModal'
import LaunchingSoonModal from './components/shared/LaunchingSoonModal';
// Import Chat and Messages components
import MessagesTab from './components/messages/MessagesTab'

import VAILogo from './components/shared/VAILogo'
import LanguageSelector from './components/shared/LanguageSelector'

// Import our store
import { useAppStore } from './stores/bookingStore'

// 2. CHECK THE ENVIRONMENT VARIABLE
// This variable will control whether the app is "live" or shows the "coming soon" screen.
// You will set this in your .env file.
const isAppLaunched = import.meta.env.VITE_APP_LAUNCHED === 'true';

// Header Component with Login (ENHANCED with Cultural Translations)
const AppHeader = () => {
  const { user, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  // 🌍 NEW: Add translation hook
  const { t } = useTranslation()

  return (
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 px-4 py-3 sticky top-0 z-40">
      {/*<div className="flex items-center justify-between max-w-md mx-auto">*/}
      <div className="flex items-center justify-between mx-auto">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <VAILogo size="sm" />
        </div>

        {/* Language Selector + Login/User Section */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <LanguageSelector size="sm" />

        {/* Login/User Section */}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-slate-300 text-sm">
                {/* 🌍 ENHANCED: Cultural Polynesian greeting */}
                {t('common.hi')}, {user.user_metadata?.first_name || 'User'}!
              </span>
              <button
                onClick={signOut}
                className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                {/* 🌍 ENHANCED: Translated sign out */}
                {t('common.signOut')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {/* 🌍 ENHANCED: Translated login */}
              {t('common.login')}
            </button>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </header>
  )
}

  // Main App Component (UNCHANGED - Preserving ALL existing functionality)
function AppContent() {
  const { activeTab } = useAppStore()

  // 🆕 ADD THIS: Handle auth success messages from email links
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
      {/* NEW: Header with Login */}
      <AppHeader />

      {/* Main Content Area */}
      <main className="pb-20"> {/* pb-20 keeps space for bottom navigation */}
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

// Wrapper with AuthProvider (UNCHANGED)
function App() {

    return (
      <AuthProvider>
        <Router>
          <div className="bg-vai-deep-ocean min-h-screen text-white">
            {/* 3. CONDITIONAL RENDERING LOGIC */}
            {!isAppLaunched ? (
              <LaunchingSoonModal />
            ) : (
              <>
                <main className="pb-20">
                  <Routes>
                    <Route path="/" element={<DiscoverTab />} />
                    <Route path="/explore" element={<ExploreTab />} />
                    <Route path="/journey" element={<JourneyTab />} />
                    <Route path="/messages" element={<MessagesTab />} />
                    <Route path="/profile" element={<ProfileTab />} />
                  </Routes>
                </main>
                <Navigation />
              </>
            )}
          </div>
        </Router>
      </AuthProvider>
    );
  }
  

export default App