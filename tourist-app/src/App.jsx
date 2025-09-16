// ==============================================
// FILE: tourist-app/src/App.jsx (ENHANCED WITH i18n)
// ==============================================

import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
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
import BookingModal from './components/booking/BookingModal'
import { CurrencyProvider } from './hooks/useCurrency'
import { useCurrencyContext } from './hooks/useCurrency'
import CurrencySelector from './components/shared/CurrencySelector'
import AuthCallback from './components/auth/AuthCallback'

import VAILogo from './components/shared/VAILogo'
import LanguageDropdown from './components/shared/LanguageDropdown'
import ThemeToggle from './components/shared/ThemeToggle'

import { useAppStore } from './stores/bookingStore'
import TourPage from './components/tours/TourPage'

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
        <header className="bg-ui-surface-secondary/50 backdrop-blur-sm rounded-xl p-4 border border-ui-border-primary mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            
            {/* Left side - Branding */}
            <div className="flex items-center gap-4">
              {/* Logo/Brand */}
              <div className="app-logo-container flex items-center gap-2">
                <VAILogo size="sm" />
              </div>
              
              <div>
                <h1 className="text-lg font-bold text-ui-text-primary">
                  {t('header.title', 'VAI Tickets')}
                </h1>
                <p className="text-ui-text-secondary text-sm">
                  {user 
                    ? t('header.greeting', { name: user.user_metadata?.first_name || 'Explorer' })
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
                <div className="flex items-center gap-2 px-3 py-2 bg-ui-surface-primary/50 rounded-lg hidden">
                  <span className="text-ui-text-muted text-sm hidden sm:inline">
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
              
              {/* Theme Toggle */}
              <ThemeToggle size="small" variant="ghost" />

              {/* Language Selector */}
              <LanguageDropdown />
              
              {/* Login/Logout Section */}
              {user ? (
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 px-3 py-2 bg-status-error-bg hover:bg-status-error-bg/70 border border-status-error/30 text-status-error-light hover:text-status-error rounded-lg transition-colors"
                  title={t('common.logout')}
                >
                  <span className="hidden sm:inline">{t('common.signOut')}</span>
                  <span className="sm:hidden">🚪</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-interactive-primary hover:bg-interactive-primary-hover text-ui-text-primary px-4 py-2 rounded-lg font-medium transition-colors"
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

  // Main App Component (ENHANCED - Added bookTour URL parameter handling)
function AppContent() {
  const { activeTab } = useAppStore()
  const [selectedTourForBooking, setSelectedTourForBooking] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  const { t } = useTranslation()

  // Handle auth success messages and bookTour parameter from deep links
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const message = urlParams.get('message')
    const bookTourId = urlParams.get('bookTour')
    
    if (message === 'welcome') {
      toast.success(t('app.notifications.emailConfirmed'))
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
    }
    if (message === 'signin') {
      toast.info('📧 Please sign in to continue.')
      window.history.replaceState({}, '', window.location.pathname)
    }
    if (message === 'reset') {
      toast.success(t('app.notifications.passwordResetSuccess'))
      window.history.replaceState({}, '', window.location.pathname)
    }

    // Handle bookTour parameter from deep links
    if (bookTourId) {
      const fetchTourForBooking = async () => {
        try {
          // Dynamic import to avoid static loading issues
          const { supabase } = await import('./services/supabase')
          const { data: tourData, error } = await supabase
            .from('tours')
            .select(`
              *,
              operators (
                id,
                company_name,
                island,
                whatsapp_number,
                phone,
                contact_person
              )
            `)
            .eq('id', bookTourId)
            .eq('status', 'active')
            .single()

          if (error) {
            console.error('Error fetching tour for booking:', error)
            toast.error(t('app.notifications.tourNotFound'))
            return
          }

          if (tourData) {
            setSelectedTourForBooking(tourData)
            setShowBookingModal(true)
            // Clean URL to remove bookTour parameter
            const newUrl = new URL(window.location)
            newUrl.searchParams.delete('bookTour')
            window.history.replaceState({}, '', newUrl.pathname + newUrl.search)
          }
        } catch (err) {
          console.error('Unexpected error fetching tour:', err)
          toast.error(t('app.notifications.tourLoadFailed'))
        }
      }

      fetchTourForBooking()
    }
  }, [])

  // Handle booking modal close
  const handleCloseBookingModal = () => {
    setShowBookingModal(false)
    setSelectedTourForBooking(null)
  }

  return (
    <div className="min-h-screen bg-ui-surface-overlay text-ui-text-primary">
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

      {/* Deep-link Booking Modal */}
      {showBookingModal && selectedTourForBooking && (
        <BookingModal 
          tour={selectedTourForBooking}
          isOpen={showBookingModal}
          onClose={handleCloseBookingModal}
        />
      )}

      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-surface-secondary)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-primary)',
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

        {/* Tour/Activity Deep Link */}
        <Route path="/tour/:tourId" element={
          <CurrencyProvider>
            <div className="bg-ui-surface-overlay min-h-screen text-ui-text-primary">
              <TourPage />
            </div>
          </CurrencyProvider>
        } />

        {/* Main App Route - All existing functionality */}
        <Route path="/*" element={
          <CurrencyProvider>
            <div className="bg-ui-surface-overlay min-h-screen text-ui-text-primary">
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
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />

        {/* Global Toast Notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--color-surface-secondary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-primary)',
              zIndex: 100000
            }
          }}
          containerStyle={{
            zIndex: 100000
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App