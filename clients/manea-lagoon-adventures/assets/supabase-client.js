/**
 * VAI Studio - Client Portal Supabase Integration
 * 
 * This file handles all database interactions for the client portal.
 * It connects to the VAI Studio Supabase database and provides functions
 * to authenticate clients and fetch proposal data.
 * 
 * Database: vai_studio_clients table
 * Authentication: Password-based with RLS policies
 * Data: Comprehensive proposal_data JSON structure
 */

// =================================================================
// SUPABASE CONFIGURATION
// =================================================================

// Production Supabase Configuration (from operator-dashboard)
const SUPABASE_CONFIG = {
    //url: 'https://wewwhxhtpqjqhxfxbzyz.supabase.co',
    //anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indld3doeGh0cHFqcWh4Znhienl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzk1NjEsImV4cCI6MjA2OTcxNTU2MX0.jtI3EHf22p5UEwa4kHzs3RzNmfzgzHH2pIU3aLGRFYo'

url: 'https://rizqwxcmpzhdmqjjqgyw.supabase.co', // Production
anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpenF3eGNtcHpoZG1xampxZ3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MDM3MTIsImV4cCI6MjA2NjI3OTcxMn0.dlNpxINvs2yzlFQndTZIrfQTBgWpQ5Ee0aPGVwRPHo0' // Replace with your actual key

};

// Initialize Supabase client
let supabase;

// Dynamic import for Supabase (supports both CDN and module loading)
async function initializeSupabase() {
    try {
        // Try to use CDN version first (for static hosting)
        if (typeof createClient !== 'undefined') {
            supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        } else {
            // Fallback to dynamic import (for modern environments)
            const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        }
        console.log('✅ Supabase client initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Supabase client:', error);
        return false;
    }
}

// =================================================================
// CLIENT AUTHENTICATION & DATA RETRIEVAL
// =================================================================

/**
 * Client Portal API - Main interface for client data operations
 */
class ClientPortalAPI {
    constructor() {
        this.clientSlug = 'manea-lagoon-adventures';
        this.clientData = null;
        this.isAuthenticated = false;
        this.loadingState = {
            initializing: false,
            authenticating: false,
            fetchingData: false
        };
    }

    /**
     * Initialize the API and Supabase connection
     */
    async initialize() {
        this.loadingState.initializing = true;
        
        try {
            const initialized = await initializeSupabase();
            if (!initialized) {
                throw new Error('Failed to initialize database connection');
            }
            
            // Check if client is already authenticated
            const savedAuth = this.getStoredAuth();
            if (savedAuth) {
                this.isAuthenticated = true;
                await this.fetchClientData();
            }
            
            this.loadingState.initializing = false;
            return true;
        } catch (error) {
            this.loadingState.initializing = false;
            console.error('Initialization failed:', error);
            return false;
        }
    }

    /**
     * Authenticate client with access password
     */
    async authenticate(password) {
        this.loadingState.authenticating = true;

        try {
            // Fetch client data with password verification
            const { data, error } = await supabase
                .from('vai_studio_clients')
                .select('*')
                .eq('slug', this.clientSlug)
                .eq('access_password', password)
                .eq('is_active', true)
                .single();

            if (error) {
                console.error('Authentication query error:', error);
                throw new Error('Invalid access code or client not found');
            }

            if (!data) {
                throw new Error('Invalid access code');
            }

            // Store authentication and client data
            this.clientData = data;
            this.isAuthenticated = true;
            this.storeAuth(password);
            
            // Track portal access
            await this.trackPortalAccess();
            
            this.loadingState.authenticating = false;
            return {
                success: true,
                data: this.clientData
            };

        } catch (error) {
            this.loadingState.authenticating = false;
            console.error('Authentication failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Fetch client data (after authentication)
     */
    async fetchClientData() {
        if (!this.isAuthenticated) {
            throw new Error('Client not authenticated');
        }

        this.loadingState.fetchingData = true;

        try {
            const { data, error } = await supabase
                .from('vai_studio_clients')
                .select('*')
                .eq('slug', this.clientSlug)
                .eq('is_active', true)
                .single();

            if (error) {
                throw new Error('Failed to fetch client data');
            }

            this.clientData = data;
            this.loadingState.fetchingData = false;
            return data;

        } catch (error) {
            this.loadingState.fetchingData = false;
            console.error('Data fetch failed:', error);
            throw error;
        }
    }

    /**
     * Track portal access for analytics
     */
    async trackPortalAccess() {
        try {
            await supabase
                .from('vai_studio_clients')
                .update({ 
                    last_accessed_at: new Date().toISOString(),
                    portal_views: this.clientData.portal_views + 1
                })
                .eq('slug', this.clientSlug);
        } catch (error) {
            console.warn('Failed to track portal access:', error);
        }
    }

    /**
     * Get structured proposal data for UI consumption
     */
    getProposalData() {
        if (!this.clientData || !this.clientData.proposal_data) {
            return null;
        }

        return {
            meta: this.clientData.proposal_data.proposal_meta,
            client: this.clientData.proposal_data.client_business,
            package: this.clientData.proposal_data.package_selection,
            costs: this.clientData.proposal_data.cost_breakdown,
            monthly: this.clientData.proposal_data.monthly_costs,
            addons: this.clientData.proposal_data.addons_available,
            timeline: this.clientData.proposal_data.timeline,
            roi: this.clientData.proposal_data.roi_analysis,
            nextSteps: this.clientData.proposal_data.next_steps,
            milestones: this.clientData.proposal_data.milestones
        };
    }

    /**
     * Get client basic information
     */
    getClientInfo() {
        if (!this.clientData) return null;

        return {
            name: this.clientData.client_name,
            company: this.clientData.company_name,
            contact: this.clientData.primary_contact,
            email: this.clientData.email,
            island: this.clientData.island,
            status: this.clientData.project_status,
            investment: this.clientData.total_investment_xpf,
            monthly: this.clientData.monthly_costs_xpf,
            startDate: this.clientData.proposed_start_date,
            completionDate: this.clientData.estimated_completion_date
        };
    }

    /**
     * Get current project status and progress
     */
    getProjectStatus() {
        if (!this.clientData) return null;

        const milestones = this.clientData.proposal_data?.milestones || [];
        const completedMilestones = milestones.filter(m => m.status === 'completed').length;
        const totalMilestones = milestones.length;

        return {
            status: this.clientData.project_status,
            progress: totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0,
            milestones: milestones,
            lastUpdate: this.clientData.updated_at
        };
    }

    /**
     * Local storage management for authentication
     */
    storeAuth(password) {
        try {
            const authData = {
                slug: this.clientSlug,
                timestamp: Date.now(),
                // Store hashed password for security
                hash: btoa(password) // Basic encoding - can be enhanced
            };
            localStorage.setItem('vai_client_auth', JSON.stringify(authData));
        } catch (error) {
            console.warn('Failed to store authentication:', error);
        }
    }

    getStoredAuth() {
        try {
            const authData = localStorage.getItem('vai_client_auth');
            if (!authData) return null;

            const parsed = JSON.parse(authData);
            
            // Check if auth is for current client and not expired (24 hours)
            const isValid = parsed.slug === this.clientSlug && 
                           (Date.now() - parsed.timestamp) < 24 * 60 * 60 * 1000;

            return isValid ? parsed : null;
        } catch (error) {
            console.warn('Failed to retrieve stored authentication:', error);
            return null;
        }
    }

    clearAuth() {
        try {
            localStorage.removeItem('vai_client_auth');
            this.isAuthenticated = false;
            this.clientData = null;
        } catch (error) {
            console.warn('Failed to clear authentication:', error);
        }
    }

    /**
     * Utility methods for loading states
     */
    isLoading() {
        return Object.values(this.loadingState).some(state => state);
    }

    getLoadingState() {
        return { ...this.loadingState };
    }
}

// =================================================================
// PROPOSAL DATA HELPERS
// =================================================================

/**
 * Helper functions to format and display proposal data
 */
class ProposalDataHelpers {
    /**
     * Format currency for display
     */
    static formatCurrency(amount, currency = 'XPF') {
        if (!amount) return '0 XPF';
        return new Intl.NumberFormat('fr-PF', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount);
    }

    /**
     * Format date for display
     */
    static formatDate(dateString) {
        if (!dateString) return 'Date à déterminer';
        
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }

    /**
     * Get status badge class for styling
     */
    static getStatusClass(status) {
        const statusClasses = {
            proposal: 'status-proposal',
            active: 'status-active',
            completed: 'status-completed',
            paused: 'status-paused',
            cancelled: 'status-cancelled'
        };
        return statusClasses[status] || 'status-default';
    }

    /**
     * Get milestone status icon
     */
    static getMilestoneIcon(status) {
        const icons = {
            completed: '✅',
            pending: '⏳',
            in_progress: '🔄',
            blocked: '🚫'
        };
        return icons[status] || '📋';
    }

    /**
     * Calculate timeline progress percentage
     */
    static calculateProgress(startDate, endDate, currentDate = new Date()) {
        if (!startDate || !endDate) return 0;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        const current = new Date(currentDate);
        
        if (current <= start) return 0;
        if (current >= end) return 100;
        
        const total = end - start;
        const elapsed = current - start;
        
        return Math.round((elapsed / total) * 100);
    }
}

// =================================================================
// ERROR HANDLING
// =================================================================

/**
 * Custom error class for client portal errors
 */
class ClientPortalError extends Error {
    constructor(message, code = 'PORTAL_ERROR', details = null) {
        super(message);
        this.name = 'ClientPortalError';
        this.code = code;
        this.details = details;
    }
}

// =================================================================
// GLOBAL EXPORTS
// =================================================================

// Global instance for use throughout the portal
window.ClientPortalAPI = ClientPortalAPI;
window.ProposalDataHelpers = ProposalDataHelpers;
window.ClientPortalError = ClientPortalError;

// Initialize global API instance
window.clientPortalAPI = new ClientPortalAPI();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.clientPortalAPI.initialize();
    });
} else {
    window.clientPortalAPI.initialize();
}

console.log('🌐 VAI Studio Client Portal API loaded successfully');