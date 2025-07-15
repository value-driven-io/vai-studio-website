// ==============================================
// FILE: tourist-app/src/App.jsx
// ==============================================

import React, { useState } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'

// Import our main components 
import Navigation from './components/shared/Navigation'
import DiscoverTab from './components/discovery/DiscoverTab'
import ExploreTab from './components/explore/ExploreTab'
import JourneyTab from './components/journey/JourneyTab'
import ProfileTab from './components/profile/ProfileTab'
import AuthModal from './components/auth/AuthModal'

import VAILogo from './components/shared/VAILogo'

// Import our store
import { useAppStore } from './stores/bookingStore'

// NEW: Header Component with Login
const AppHeader = () => {
  const { user, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 px-4 py-3 sticky top-0 z-40">
      {/*<div className="flex items-center justify-between max-w-md mx-auto">*/}
      <div className="flex items-center justify-between mx-auto">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <VAILogo size="sm" />
        </div>

        {/* Login/User Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-slate-300 text-sm">
                Hi, {user.user_metadata?.first_name || 'User'}!
              </span>
              <button
                onClick={signOut}
                className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Login
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

// Main App Component
function AppContent() {
  const { activeTab } = useAppStore()

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
            border: '1px solid #334155'
          }
        }}
      />
    </div>
  )
}

// Wrapper with AuthProvider
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App