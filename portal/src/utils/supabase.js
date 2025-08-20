import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable auth for client portal (we use custom password authentication)
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'vai-client-portal'
    }
  }
})

// Database helper functions
export const dbHelpers = {
  // Get client by slug (for deep linking)
  getClientBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('vai_studio_clients')
      .select('id, slug, company_name, is_active')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    
    return { data, error }
  },
  
  // Verify client access password
  verifyPassword: async (password) => {
    const { data, error } = await supabase
      .from('vai_studio_clients')
      .select('*')
      .eq('access_password', password)
      .eq('is_active', true)
      .single()
    
    return { data, error }
  },
  
  // Update client portal access stats
  updatePortalAccess: async (clientId, portalViews = 1) => {
    const { error } = await supabase
      .from('vai_studio_clients')
      .update({
        last_accessed_at: new Date().toISOString(),
        portal_views: portalViews
      })
      .eq('id', clientId)
    
    return { error }
  },
  
  // Get client proposal data
  getProposalData: async (clientId) => {
    const { data, error } = await supabase
      .from('vai_studio_clients')
      .select('proposal_data, project_status, total_investment_xpf, monthly_costs_xpf')
      .eq('id', clientId)
      .single()
    
    return { data, error }
  }
}

// Connection test helper
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('vai_studio_clients')
      .select('count')
      .limit(1)
    
    if (error) throw error
    
    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
    return false
  }
}