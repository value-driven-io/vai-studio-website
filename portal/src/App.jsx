import { useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { useClientStore } from './store/clientStore'
import { useTranslation } from 'react-i18next'

// Components
import LoginScreen from './components/auth/LoginScreen'
import PortalLayout from './components/layout/PortalLayout'
import LoadingScreen from './components/ui/LoadingScreen'

// Styles
import './styles/index.css'

function App() {
  const { i18n } = useTranslation()
  const { 
    isAuthenticated, 
    isLoading, 
    clientData,
    initializePortal,
    checkUrlParams 
  } = useClientStore()

  useEffect(() => {
    // Initialize portal and check for URL parameters
    const init = async () => {
      await initializePortal()
      checkUrlParams()
    }
    
    init()
  }, [initializePortal, checkUrlParams])

  useEffect(() => {
    // Set page title based on client data
    if (clientData) {
      document.title = `${clientData.company_name} - VAI Studio Portal`
    } else {
      document.title = 'VAI Studio Client Portal'
    }
  }, [clientData])

  useEffect(() => {
    // Apply theme class to body
    document.body.className = 'bg-vai-gradient text-vai-pearl antialiased'
  }, [])

  // Loading state
  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <Router 
      basename={import.meta.env.PROD ? "/portal" : ""}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="min-h-screen bg-vai-gradient">
        {/* PWA Install Prompt - will be added later */}
        
        {/* Main App Content */}
        {!isAuthenticated ? (
          <LoginScreen />
        ) : (
          <PortalLayout />
        )}
        
        {/* Global Modals Container */}
        <div id="modal-root" />
        
        {/* Service Worker Update Notification - will be added later */}
      </div>
    </Router>
  )
}

export default App