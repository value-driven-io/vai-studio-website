// ================================
// SUPABASE SERVICE - CDN VERSION
// File: app/welcome/services/supabase.js
// ================================

// Supabase will be loaded via CDN in HTML
// No imports needed - using global window.supabase

let supabase;

// Initialize Supabase client
function initSupabase() {
  // Check if Supabase is loaded from CDN
  if (typeof window.supabase === 'undefined') {
    console.error('❌ Supabase not loaded! Make sure to include Supabase CDN in your HTML');
    return null;
  }

  const supabaseUrl = 'https://rizqwxcmpzhdmqjjqgyw.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpenF3eGNtcHpoZG1xampxZ3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MDM3MTIsImV4cCI6MjA2NjI3OTcxMn0.dlNpxINvs2yzlFQndTZIrfQTBgWpQ5Ee0aPGVwRPHo0';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    return null;
  }

  try {
    supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });

    console.log('✅ Supabase client initialized successfully');
    return supabase;

  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
    return null;
  }
}

// Get or initialize Supabase client
function getSupabase() {
  if (!supabase) {
    supabase = initSupabase();
  }
  return supabase;
}

// Export for use in other files
window.getSupabase = getSupabase;

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
  initSupabase();
});