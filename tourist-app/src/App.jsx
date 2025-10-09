// ==============================================
// FILE: tourist-app/src/App.jsx (ENHANCED WITH i18n)
// ==============================================

import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
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
import LearnTab from './components/learn/LearnTab'
import { BookingPage } from './components/booking/BookingPage'
import { CurrencyProvider } from './hooks/useCurrency'
import { useCurrencyContext } from './hooks/useCurrency'
import CurrencySelector from './components/shared/CurrencySelector'
import AuthCallback from './components/auth/AuthCallback'

import VAILogo from './components/shared/VAILogo'
import LanguageDropdown from './components/shared/LanguageDropdown'
import ThemeToggle from './components/shared/ThemeToggle'
import WelcomeScreen from './components/shared/WelcomeScreen'

import { useAppStore } from './stores/bookingStore'
import TourPage from './components/tours/TourPage'
import TemplatePage from './components/templates/TemplatePage'
import OperatorProfilePage from './components/operator/OperatorProfilePage'
import BookingRoute from './components/booking/BookingRoute'
import useEmbedMode from './hooks/useEmbedMode'

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
        <header className="relative bg-ui-surface-secondary/50 backdrop-blur-sm rounded-xl p-4 border border-ui-border-primary mx-auto overflow-hidden">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12] pointer-events-none transform rotate-180 scale-110 md:scale-125"
            style={{
              backgroundImage: 'url(/images/pattern-3-tahiti-tourism.svg)',
              backgroundSize: 'auto 120%',
              backgroundPosition: 'center top',
              backgroundRepeat: 'no-repeat',
              filter: 'brightness(0) saturate(100%) invert(27%) sepia(76%) saturate(1654%) hue-rotate(186deg) brightness(96%) contrast(97%)',
            }}
          ></div>
          {/* Dark mode pattern overlay */}
          <div
            className="absolute inset-0 opacity-0 dark:opacity-[0.15] pointer-events-none transform rotate-180 scale-110 md:scale-125"
            style={{
              backgroundImage: 'url(/images/pattern-3-tahiti-tourism.svg)',
              backgroundSize: 'auto 120%',
              backgroundPosition: 'center top',
              backgroundRepeat: 'no-repeat',
              filter: 'brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(7500%) hue-rotate(327deg) brightness(108%) contrast(108%)',
            }}
          ></div>
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            
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
                  className="bg-interactive-primary hover:bg-interactive-primary-hover text-ui-text-primary px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer relative z-10"
                  style={{ pointerEvents: 'auto' }}
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

  // Main App Component (ENHANCED - Added bookTour URL parameter handling + Embed Mode)
function AppContent() {
  const { activeTab } = useAppStore()
  const [selectedTourForBooking, setSelectedTourForBooking] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true)

  const { t } = useTranslation()
  const { isEmbedMode } = useEmbedMode()

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
      toast.info(t('app.notifications.pleaseSignIn'))
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

          // Try both tours table (old system) and active_tours_with_operators (new template system)
          let tourData = null
          let error = null

          // First try the tours table for backward compatibility
          const { data: toursData, error: toursError } = await supabase
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

          if (toursData && !toursError) {
            tourData = toursData
          } else {
            // If not found in tours, try active_tours_with_operators (template instances)
            const { data: instanceData, error: instanceError } = await supabase
              .from('active_tours_with_operators')
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
              .single()

            if (instanceData && !instanceError) {
              // Transform instance data to match expected tour structure for booking modal
              tourData = {
                ...instanceData,
                // Map instance fields to tour fields for compatibility
                discount_price_adult: instanceData.effective_discount_price_adult,
                discount_price_child: instanceData.effective_discount_price_child,
                original_price_adult: instanceData.original_price_adult,
                status: 'active' // instances from this view are always active
              }
            } else {
              error = instanceError || toursError
            }
          }

          if (error && !tourData) {
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

  // Handle welcome screen completion
  const handleWelcomeComplete = () => {
    setShowWelcomeScreen(false)
  }

  return (
    <div className="min-h-screen bg-ui-surface-overlay text-ui-text-primary">
      {/* Welcome Screen - Hidden in embed mode */}
      {!isEmbedMode && showWelcomeScreen && (
        <WelcomeScreen onComplete={handleWelcomeComplete} />
      )}

      {/* Skip Links for Accessibility - Hidden in embed mode */}
      {!isEmbedMode && (
        <>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-interactive-primary text-ui-text-primary px-4 py-2 rounded-lg z-[100001] font-medium transition-all"
          >
            {t('accessibility.skipToMain')}
          </a>
          <a
            href="#navigation"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32 bg-interactive-primary text-ui-text-primary px-4 py-2 rounded-lg z-[100001] font-medium transition-all"
          >
            {t('accessibility.skipToNavigation')}
          </a>
        </>
      )}

      {/* Header with Login - Hidden in embed mode */}
      {!isEmbedMode && <AppHeader />}

      {/* Main Content Area */}
      <main id="main-content" className={`pb-20 ${activeTab !== 'learn' ? 'px-4' : ''}`}> {/* pb-20 keeps space for bottom navigation */}
        <div style={{ display: activeTab === 'discover' ? 'block' : 'none' }}>
          <DiscoverTab />
        </div>
        <div style={{ display: activeTab === 'explore' ? 'block' : 'none' }}>
          <ExploreTab />
        </div>
        <div style={{ display: activeTab === 'journey' ? 'block' : 'none' }}>
          <JourneyTab />
        </div>
        <div style={{ display: activeTab === 'messages' ? 'block' : 'none' }}>
          <MessagesTab />
        </div>
        <div style={{ display: activeTab === 'learn' ? 'block' : 'none' }}>
          <LearnTab />
        </div>
        <div style={{ display: activeTab === 'profile' ? 'block' : 'none' }}>
          <ProfileTab />
        </div>
      </main>

      {/* Bottom Navigation - Hidden in embed mode */}
      {!isEmbedMode && <Navigation />}

      {/* Deep-link Booking Modal */}
      {showBookingModal && selectedTourForBooking && (
        <BookingPage
          tour={selectedTourForBooking}
          mode="modal"
          onClose={handleCloseBookingModal}
        />
      )}

      {/* Toast Notifications with ARIA Live Region */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          ariaProps: {
            role: 'status',
            'aria-live': 'polite',
            'aria-atomic': 'true'
          },
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

        {/* Booking Route - For embed mode and direct booking */}
        <Route path="/booking" element={
          <CurrencyProvider>
            <BookingRoute />
          </CurrencyProvider>
        } />

        {/* Tour/Activity Deep Link */}
        <Route path="/tour/:tourId" element={
          <CurrencyProvider>
            <div className="bg-ui-surface-overlay min-h-screen text-ui-text-primary">
              <TourPage />
            </div>
          </CurrencyProvider>
        } />

        {/* Template Deep Link */}
        <Route path="/template/:templateId" element={
          <CurrencyProvider>
            <div className="bg-ui-surface-overlay min-h-screen text-ui-text-primary">
              <TemplatePage />
            </div>
          </CurrencyProvider>
        } />

        {/* Operator Profile Deep Link */}
        <Route path="/profile/:operatorSlug" element={
          <CurrencyProvider>
            <div className="bg-ui-surface-overlay min-h-screen text-ui-text-primary">
              <OperatorProfilePage />
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
    <HelmetProvider>
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
    </HelmetProvider>
  )
}

export default App