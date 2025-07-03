// ================================
// DATABASE UTILITIES
// File: app/welcome/services/databaseUtils.js
// ================================

import { supabase } from './supabase.js'

export const databaseUtils = {
  
  // ===========================
  // USER MANAGEMENT
  // ===========================
  
  async getTouristByEmail(email) {
    const { data, error } = await supabase
      .from('tourist_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()
    
    return { data, error }
  },

  async getOperatorById(operatorId) {
    const { data, error } = await supabase
      .from('operators')
      .select('*')
      .eq('id', operatorId)
      .single()
    
    return { data, error }
  },

  async getPendingOperators() {
    const { data, error } = await supabase
      .from('operators')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    
    return { data, error }
  },

  // ===========================
  // TOUR PERSONALIZATION
  // ===========================
  
  async getPersonalizedTours(userPreferences, filters = {}) {
    let query = supabase
      .from('active_tours_with_operators')
      .select('*')
      .eq('status', 'active')
      .gt('available_spots', 0)
      .gte('booking_deadline', new Date().toISOString())
    
    // Apply user preferences
    if (userPreferences.islands_interested?.length && !userPreferences.is_local) {
      query = query.in('operator_island', userPreferences.islands_interested)
    }
    
    if (userPreferences.tour_types_preferred?.length) {
      query = query.in('tour_type', userPreferences.tour_types_preferred)
    }
    
    // Apply budget filtering
    if (userPreferences.budget_range === 'budget') {
      query = query.lt('discount_price_adult', 8000)
    } else if (userPreferences.budget_range === 'luxury') {
      query = query.gt('discount_price_adult', 15000)
    } else {
      // mid range
      query = query.gte('discount_price_adult', 3000).lte('discount_price_adult', 15000)
    }
    
    // Apply additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        query = query.eq(key, value)
      }
    })
    
    const { data, error } = await query
      .order('tour_date', { ascending: true })
      .limit(50)
    
    return { data, error }
  },

  // ===========================
  // ANALYTICS & INSIGHTS
  // ===========================
  
  async getRegistrationStats() {
    try {
      const [touristStats, operatorStats] = await Promise.all([
        supabase
          .from('tourist_users')
          .select('created_at, status, favorites')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        
        supabase
          .from('operators')
          .select('created_at, status, island')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ])
      
      return {
        tourists: {
          total: touristStats.data?.length || 0,
          active: touristStats.data?.filter(u => u.status === 'active').length || 0,
          onboarded: touristStats.data?.filter(u => 
            u.favorites?.preferences?.onboarding_completed
          ).length || 0
        },
        operators: {
          total: operatorStats.data?.length || 0,
          pending: operatorStats.data?.filter(o => o.status === 'pending').length || 0,
          active: operatorStats.data?.filter(o => o.status === 'active').length || 0
        }
      }
    } catch (error) {
      console.error('Failed to get registration stats:', error)
      return null
    }
  },

  // ===========================
  // DATA VALIDATION
  // ===========================
  
  async validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  async checkDuplicateUser(email, userType = 'tourist') {
    const table = userType === 'tourist' ? 'tourist_users' : 'operators'
    
    const { data, error } = await supabase
      .from(table)
      .select('id, email, status')
      .eq('email', email.toLowerCase().trim())
      .single()
    
    return {
      exists: !!data,
      user: data,
      error
    }
  },

  // ===========================
  // BULK OPERATIONS
  // ===========================
  
  async bulkUpdateOperatorStatus(operatorIds, status) {
    const { data, error } = await supabase
      .from('operators')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .in('id', operatorIds)
      .select()
    
    return { data, error }
  },

  async getOperatorsByIsland(island) {
    const { data, error } = await supabase
      .from('operators')
      .select('*')
      .eq('island', island)
      .eq('status', 'active')
      .order('company_name', { ascending: true })
    
    return { data, error }
  },

  // ===========================
  // SEARCH & FILTERING
  // ===========================
  
  async searchTourists(searchTerm, limit = 50) {
    const { data, error } = await supabase
      .from('tourist_users')
      .select('*')
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    return { data, error }
  },

  async searchOperators(searchTerm, limit = 50) {
    const { data, error } = await supabase
      .from('operators')
      .select('*')
      .or(`company_name.ilike.%${searchTerm}%,contact_person.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    return { data, error }
  },

  // ===========================
  // CLEANUP & MAINTENANCE
  // ===========================
  
  async cleanupIncompleteRegistrations(daysOld = 7) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    
    // Remove tourist users who never completed onboarding
    const { data: cleanedTourists, error: touristError } = await supabase
      .from('tourist_users')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .eq('status', 'registered')
      .select()
    
    // Remove operators who were never approved
    const { data: cleanedOperators, error: operatorError } = await supabase
      .from('operators')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .eq('status', 'pending')
      .select()
    
    return {
      tourists_cleaned: cleanedTourists?.length || 0,
      operators_cleaned: cleanedOperators?.length || 0,
      errors: {
        tourist: touristError,
        operator: operatorError
      }
    }
  }
}