// src/contexts/AuthContext.jsx - STABILIZED VERSION
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { authService } from '../services/authService'
import { supabase } from '../services/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    authService.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
    async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        
        console.log('Auth event:', event)
        
        // 🧹 Clear user-specific data on auth changes to prevent cross-contamination
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          console.log('🧹 Clearing user-specific data for auth change:', event)
          
          // Clear localStorage user data
          localStorage.removeItem('vai_user_email')
          localStorage.removeItem('vai_user_whatsapp')
          
          // Clear any cached booking data that might be user-specific
          // This ensures clean slate for each user session
          console.log('🧹 Cleared localStorage user data')
        }
        
        // Auto-link existing bookings when user signs in
        if (event === 'SIGNED_IN' && session?.user?.email) {
          console.log('🔗 Attempting to link bookings for:', session.user.email, 'User ID:', session.user.id)

          try {
            // First, ensure the user exists in tourist_users table
            const { data: existingUser, error: userCheckError } = await supabase
              .from('tourist_users')
              .select('id')
              .eq('auth_user_id', session.user.id)
              .single()

            if (!existingUser && userCheckError?.code === 'PGRST116') {
              // PGRST116 = row not found, which is expected for new users
              console.log('🆕 Creating tourist_user record for:', session.user.email)

              const { data: newUser, error: createError } = await supabase
                .from('tourist_users')
                .insert([{
                  auth_user_id: session.user.id,
                  email: session.user.email,
                  first_name: session.user.user_metadata?.first_name || '',
                  last_name: session.user.user_metadata?.last_name || '',
                  preferred_language: 'en'
                }])
                .select()
                .single()

              if (createError) {
                console.error('❌ Error creating tourist_user:', createError)
                return // Don't proceed with linking if user creation failed
              } else {
                console.log('✅ Tourist user created successfully:', newUser.id)
              }
            } else if (existingUser) {
              console.log('✅ Tourist user already exists:', existingUser.id)
            }

            // Now try to link existing bookings
            const { data, error } = await supabase.rpc('link_existing_bookings_to_user', {
              user_email: session.user.email,
              user_uuid: session.user.id
            })

            console.log('🔗 Link result:', { data, error })

            if (error) {
              console.error('❌ Error linking existing bookings:', error)
            } else if (data > 0) {
              console.log(`✅ Linked ${data} existing bookings to user`)
            } else {
              console.log('ℹ️ No bookings to link')
            }
          } catch (error) {
              console.error('❌ Exception linking existing bookings:', error)
          }
        }
    }
    )

    return () => subscription?.unsubscribe()
    }, [])

  // 🔧 THE FIX: Make functions stable with useCallback
  const signUp = useCallback(async (email, password, userData) => {
    setLoading(true)
    try {
      const result = await authService.signUp(email, password, userData)
      return result
    } finally {
      setLoading(false)
    }
  }, [])

  const signIn = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const result = await authService.signIn(email, password)
      return result
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      await authService.signOut()
    } finally {
      setLoading(false)
    }
  }, [])

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user
  }), [user, session, loading, signUp, signIn, signOut]) 

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}