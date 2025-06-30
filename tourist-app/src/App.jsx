// src/App.jsx
import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'

// Import our main components (we'll create these next)
import Navigation from './components/shared/Navigation'
import DiscoverTab from './components/discovery/DiscoverTab'
import ExploreTab from './components/explore/ExploreTab'
import JourneyTab from './components/journey/JourneyTab'
import ProfileTab from './components/profile/ProfileTab'

// Import our store
import { useAppStore } from './stores/bookingStore'

function App() {
  const { activeTab } = useAppStore()

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'discover':
        return <DiscoverTab />
      case 'explore':
        return <ExploreTab />
      case 'journey':
        return <JourneyTab />
      case 'profile':
        return <ProfileTab />
      default:
        return <DiscoverTab />
    }
  }

  return (
  <AuthProvider>
    <Router>
      <div className="min-h-screen bg-slate-900 text-white">
        {/* Main Content Area */}
        <main className="pb-20">
          {renderActiveTab()}
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
    </Router>
  </AuthProvider>
) 
}

export default App