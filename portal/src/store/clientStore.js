import { create } from 'zustand'
import { supabase } from '../utils/supabase'

const useClientStore = create((set, get) => ({
  // Authentication state
  isAuthenticated: false,
  isLoading: true,
  error: null,
  
  // Client data
  clientData: null,
  proposalData: null,
  
  // UI state
  activeTab: 'overview',
  isMobile: false,
  language: 'fr',
  
  // URL parameters
  urlClientSlug: null,
  
  // Actions
  initializePortal: async () => {
    set({ isLoading: true, error: null })
    
    try {
      // Check for saved authentication
      const savedAuth = localStorage.getItem('vai_portal_auth')
      if (savedAuth) {
        const authData = JSON.parse(savedAuth)
        const isValid = await get().validateStoredAuth(authData)
        if (isValid) {
          set({ isLoading: false })
          return
        }
      }
      
      // Detect mobile device
      const isMobile = window.innerWidth < 768
      
      // Get browser language preference
      const browserLang = navigator.language.startsWith('fr') ? 'fr' : 'en'
      
      set({ 
        isLoading: false, 
        isMobile,
        language: browserLang 
      })
      
    } catch (error) {
      console.error('Portal initialization failed:', error)
      set({ 
        isLoading: false, 
        error: 'Failed to initialize portal' 
      })
    }
  },
  
  checkUrlParams: () => {
    const urlParams = new URLSearchParams(window.location.search)
    const clientSlug = urlParams.get('client')
    const lang = urlParams.get('lang')
    
    if (clientSlug) {
      set({ urlClientSlug: clientSlug })
    }
    
    if (lang && ['en', 'fr'].includes(lang)) {
      set({ language: lang })
    }
  },
  
  authenticate: async (password) => {
    set({ isLoading: true, error: null })
    
    try {
      // Query for client with matching password
      const { data, error } = await supabase
        .from('vai_studio_clients')
        .select('*')
        .eq('access_password', password)
        .eq('is_active', true)
        .single()
      
      if (error || !data) {
        throw new Error('Invalid access code')
      }
      
      // Update last accessed timestamp
      await supabase
        .from('vai_studio_clients')
        .update({ 
          last_accessed_at: new Date().toISOString(),
          portal_views: (data.portal_views || 0) + 1
        })
        .eq('id', data.id)
      
      // Store authentication
      const authData = {
        clientId: data.id,
        slug: data.slug,
        timestamp: Date.now()
      }
      
      localStorage.setItem('vai_portal_auth', JSON.stringify(authData))
      
      // Update state
      set({
        isAuthenticated: true,
        clientData: data,
        proposalData: data.proposal_data,
        isLoading: false
      })
      
      // Update URL with client slug if not present
      if (!get().urlClientSlug) {
        const url = new URL(window.location)
        url.searchParams.set('client', data.slug)
        window.history.replaceState({}, '', url)
      }
      
      return { success: true }
      
    } catch (error) {
      console.error('Authentication failed:', error)
      set({ 
        isLoading: false, 
        error: error.message || 'Authentication failed' 
      })
      return { success: false, error: error.message }
    }
  },
  
  validateStoredAuth: async (authData) => {
    try {
      // Check if auth is not too old (7 days)
      const sevenDays = 7 * 24 * 60 * 60 * 1000
      if (Date.now() - authData.timestamp > sevenDays) {
        localStorage.removeItem('vai_portal_auth')
        return false
      }
      
      // Verify client still exists and is active
      const { data, error } = await supabase
        .from('vai_studio_clients')
        .select('*')
        .eq('id', authData.clientId)
        .eq('is_active', true)
        .single()
      
      if (error || !data) {
        localStorage.removeItem('vai_portal_auth')
        return false
      }
      
      // Update state with valid client data
      set({
        isAuthenticated: true,
        clientData: data,
        proposalData: data.proposal_data
      })
      
      return true
      
    } catch (error) {
      console.error('Auth validation failed:', error)
      localStorage.removeItem('vai_portal_auth')
      return false
    }
  },
  
  logout: () => {
    localStorage.removeItem('vai_portal_auth')
    set({
      isAuthenticated: false,
      clientData: null,
      proposalData: null,
      activeTab: 'overview',
      error: null
    })
    
    // Clear URL parameters
    const url = new URL(window.location)
    url.searchParams.delete('client')
    window.history.replaceState({}, '', url)
  },
  
  setActiveTab: (tab) => {
    set({ activeTab: tab })
  },
  
  setLanguage: (language) => {
    set({ language })
    // Update URL parameter
    const url = new URL(window.location)
    url.searchParams.set('lang', language)
    window.history.replaceState({}, '', url)
  },
  
  setError: (error) => {
    set({ error })
  },
  
  clearError: () => {
    set({ error: null })
  },
  
  refreshClientData: async () => {
    const { clientData } = get()
    if (!clientData) return
    
    try {
      const { data, error } = await supabase
        .from('vai_studio_clients')
        .select('*')
        .eq('id', clientData.id)
        .single()
      
      if (!error && data) {
        set({
          clientData: data,
          proposalData: data.proposal_data
        })
      }
    } catch (error) {
      console.error('Failed to refresh client data:', error)
    }
  }
}))

export { useClientStore }