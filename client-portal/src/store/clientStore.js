import { create } from 'zustand'
import { supabase } from '../utils/supabase'

// PRICING CONFIGURATION BASED ON WORKSHEET
const getDefaultPricingConfig = () => ({
  pricing_config: {
    base_package: {
      cost: 250000,
      name: "Smart Setup Package",
      description: "Website Development + Booking System + Payment Gateway + Google Business + Platform Listing + Training"
    },
    add_on_services: {
      dual_payment: {
        cost: 15000,
        name: "Dual Payment Gateway", 
        description: "Accept both PayZen and PayPal payments"
      },
      enhanced_design: {
        cost: 35000,
        name: "Enhanced Design Package",
        description: "Premium visual design and custom branding"
      },
      advanced_seo: {
        cost: 25000,
        name: "Advanced SEO Package", 
        description: "Professional SEO optimization and content strategy"
      },
      social_media: {
        cost: 15000,
        name: "Social Media Setup",
        description: "Professional social media profiles and content"
      },
      email_marketing: {
        cost: 20000,
        name: "Email Marketing System",
        description: "Automated email campaigns and newsletters"
      },
      analytics_dashboard: {
        cost: 25000,
        name: "Advanced Analytics Dashboard",
        description: "Detailed analytics and reporting tools"
      },
      premium_training: {
        cost: 20000,
        name: "Premium Training Program",
        description: "Extended training and support"
      },
      // NEW COUNTER-BASED ADD-ONS
      additional_platform: {
        cost: 5000,
        name: "Additional Platform Integration",
        description: "Per additional OTA platform integration",
        per_unit: true,
        min_quantity: 1,
        max_quantity: 10
      },
      additional_language: {
        cost: 25000,
        name: "Additional Language Support",
        description: "Per additional language implementation",
        per_unit: true,
        min_quantity: 1,
        max_quantity: 5
      }
    },
    package_deals: {
      growth_package: {
        services: ['advanced_seo', 'social_media', 'email_marketing'],
        regular_price: 60000,
        package_price: 55000,
        savings: 5000,
        name: "Growth Package",
        description: "SEO + Social Media + Email Marketing"
      },
      premium_package: {
        services: ['enhanced_design', 'analytics_dashboard', 'premium_training'],
        regular_price: 80000,
        package_price: 75000,
        savings: 5000,
        name: "Premium Package",
        description: "Enhanced Design + Analytics + Premium Training"
      },
      international_package: {
        services: ['additional_language', 'additional_platform', 'analytics_dashboard'],
        regular_price: 55000,
        package_price: 50000,
        savings: 5000,
        name: "International Package",
        description: "English + Additional Platform + Analytics"
      }
    },
    external_costs: {
      payzen_setup: {
        cost_range: [20000, 49900],
        average_cost: 35000,
        description: "PayZen payment gateway setup"
      },
      paypal_setup: {
        cost: 0,
        description: "PayPal payment gateway setup"
      },
      domain_annual: {
        cost: 1500,
        description: "Domain renewal per year"
      },
      hosting_annual: {
        cost: 16800,
        description: "Professional hosting per year (1,400/month)"
      },
      booking_system_annual: {
        cost: 48000,
        description: "Professional booking system per year (4,000/month)"
      }
    },
    monthly_operating: {
      hosting: 1400,
      booking_system: 4000,
      total: 5400
    },
    last_updated: new Date().toISOString(),
    version: "1.1"
  }
})

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
  isMobile: window.innerWidth < 768,
  language: navigator.language.startsWith('en') ? 'en' : 'fr',
  
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
      
      // Detect mobile device properly
      const isMobile = window.innerWidth < 768 || 
                      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      // Get browser language preference (English priority)
      const browserLang = navigator.language.startsWith('en') ? 'en' : 
                         navigator.language.startsWith('fr') ? 'fr' : 'en'
      
      // Add resize listener for responsive updates
      const handleResize = () => {
        const newIsMobile = window.innerWidth < 768
        if (newIsMobile !== get().isMobile) {
          set({ isMobile: newIsMobile })
        }
      }
      
      window.addEventListener('resize', handleResize)
      
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
  
  // Update mobile state (for window resize)
  updateMobileState: () => {
    const isMobile = window.innerWidth < 768
    set({ isMobile })
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
  },
  
  // Save profile data
  saveProfile: async (profileData) => {
    const { clientData } = get()
    if (!clientData) throw new Error('No client data available')
    
    try {
      // Update basic client fields
      const clientUpdates = {
        company_name: profileData.company_name,
        client_name: profileData.client_name,
        email: profileData.email,
        whatsapp: profileData.whatsapp,
        phone: profileData.phone,
        island: profileData.island,
        updated_at: new Date().toISOString()
      }
      
      // Update proposal_data with intake information
      const proposalData = clientData.proposal_data || {}
      const updatedProposalData = {
        ...proposalData,
        client_intake: {
          business_details: {
            business_type: profileData.business_type,
            years_in_operation: profileData.years_in_operation,
            target_monthly_bookings: parseInt(profileData.target_monthly_bookings) || null,
            average_tour_price: parseInt(profileData.average_tour_price) || null,
            peak_season_months: profileData.peak_season_months
          },
          current_digital_presence: {
            website: profileData.website_status,
            online_booking: profileData.online_booking,
            google_business: profileData.google_business,
            current_booking_volume: parseInt(profileData.current_booking_volume) || null,
            lost_booking_estimate: profileData.lost_booking_estimate
          },
          content_materials: {
            professional_photos: profileData.professional_photos,
            logo: profileData.logo_status,
            business_description: profileData.business_description,
            tour_descriptions: profileData.tour_descriptions
          }
        }
      }
      
      const { error } = await supabase
        .from('vai_studio_clients')
        .update({
          ...clientUpdates,
          proposal_data: updatedProposalData
        })
        .eq('id', clientData.id)
      
      if (error) throw error
      
      // Update local state
      set({
        clientData: { ...clientData, ...clientUpdates, proposal_data: updatedProposalData },
        proposalData: updatedProposalData
      })
      
      return { success: true }
    } catch (error) {
      console.error('Failed to save profile:', error)
      throw error
    }
  },
  
  // Save package configuration
  savePackageConfig: async (packageConfig, calculatedPricing) => {
    const { clientData } = get()
    if (!clientData) throw new Error('No client data available')
    
    try {
      const proposalData = clientData.proposal_data || {}
      const updatedProposalData = {
        ...proposalData,
        package_configuration: packageConfig,
        calculated_pricing: calculatedPricing,
        submission_status: {
          status: 'draft',
          last_modified: new Date().toISOString(),
          version: (proposalData.submission_status?.version || 0) + 1
        }
      }
      
      const { error } = await supabase
        .from('vai_studio_clients')
        .update({
          proposal_data: updatedProposalData,
          total_investment_xpf: calculatedPricing?.total_investment || null,
          monthly_costs_xpf: calculatedPricing?.monthly_operating || 5400,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientData.id)
      
      if (error) throw error
      
      // Update local state
      set({
        clientData: { 
          ...clientData, 
          proposal_data: updatedProposalData,
          total_investment_xpf: calculatedPricing?.total_investment || null
        },
        proposalData: updatedProposalData
      })
      
      return { success: true }
    } catch (error) {
      console.error('Failed to save package configuration:', error)
      throw error
    }
  },
  
  // Submit configuration for review
  submitConfiguration: async () => {
    const { clientData } = get()
    if (!clientData) throw new Error('No client data available')
    
    try {
      const proposalData = clientData.proposal_data || {}
      const updatedProposalData = {
        ...proposalData,
        submission_status: {
          ...proposalData.submission_status,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          last_modified: new Date().toISOString()
        }
      }
      
      // Update database
      const { error } = await supabase
        .from('vai_studio_clients')
        .update({
          proposal_data: updatedProposalData,
          project_status: 'submitted',
          updated_at: new Date().toISOString()
        })
        .eq('id', clientData.id)
      
      if (error) throw error
      
      // Send n8n webhook notification
      try {
        const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
        if (webhookUrl) {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              event: 'configuration_submitted',
              client_id: clientData.id,
              client_name: clientData.company_name,
              client_email: clientData.email,
              submission_time: new Date().toISOString(),
              total_investment: clientData.total_investment_xpf,
              proposal_data: updatedProposalData
            })
          })
        }
      } catch (webhookError) {
        console.error('Failed to send webhook notification:', webhookError)
        // Don't fail the whole operation if webhook fails
      }
      
      // Update local state
      set({
        clientData: { 
          ...clientData, 
          proposal_data: updatedProposalData,
          project_status: 'submitted'
        },
        proposalData: updatedProposalData
      })
      
      return { success: true }
    } catch (error) {
      console.error('Failed to submit configuration:', error)
      throw error
    }
  },

  // NEW PRICING CONFIGURATION FUNCTIONS

  // Initialize pricing configuration for a client (called when needed)
  initializePricingConfig: async () => {
    const { clientData } = get()
    if (!clientData) throw new Error('No client data available')
    
    try {
      const proposalData = clientData.proposal_data || {}
      
      // Only initialize if pricing_config doesn't exist
      if (!proposalData.pricing_config) {
        const defaultPricingConfig = getDefaultPricingConfig()
        
        const updatedProposalData = {
          ...proposalData,
          ...defaultPricingConfig
        }
        
        const { error } = await supabase
          .from('vai_studio_clients')
          .update({
            proposal_data: updatedProposalData,
            monthly_costs_xpf: defaultPricingConfig.pricing_config.monthly_operating.total,
            updated_at: new Date().toISOString()
          })
          .eq('id', clientData.id)
        
        if (error) throw error
        
        // Update local state
        set({
          clientData: { 
            ...clientData, 
            proposal_data: updatedProposalData,
            monthly_costs_xpf: defaultPricingConfig.pricing_config.monthly_operating.total
          },
          proposalData: updatedProposalData
        })
        
        console.log('✅ Pricing configuration initialized')
        return { success: true }
      }
      
      return { success: true, message: 'Pricing config already exists' }
    } catch (error) {
      console.error('Failed to initialize pricing config:', error)
      throw error
    }
  },

  // Update pricing configuration (for admin use)
  updatePricingConfig: async (newPricingConfig) => {
    const { clientData } = get()
    if (!clientData) throw new Error('No client data available')
    
    try {
      const proposalData = clientData.proposal_data || {}
      const updatedProposalData = {
        ...proposalData,
        pricing_config: {
          ...newPricingConfig,
          last_updated: new Date().toISOString(),
          version: (proposalData.pricing_config?.version || "1.0")
        }
      }
      
      const { error } = await supabase
        .from('vai_studio_clients')
        .update({
          proposal_data: updatedProposalData,
          monthly_costs_xpf: newPricingConfig.monthly_operating?.total || 5400,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientData.id)
      
      if (error) throw error
      
      // Update local state
      set({
        clientData: { 
          ...clientData, 
          proposal_data: updatedProposalData
        },
        proposalData: updatedProposalData
      })
      
      return { success: true }
    } catch (error) {
      console.error('Failed to update pricing config:', error)
      throw error
    }
  },

  // Get current pricing configuration
  getPricingConfig: () => {
    const { proposalData } = get()
    return proposalData?.pricing_config || getDefaultPricingConfig().pricing_config
  }
}))

export { useClientStore }