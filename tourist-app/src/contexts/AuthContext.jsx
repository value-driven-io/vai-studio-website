// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
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
        
        // Auto-link existing bookings when user signs in
        if (event === 'SIGNED_IN' && session?.user?.email) {
        console.log('🔗 Attempting to link bookings for:', session.user.email, 'User ID:', session.user.id)
        
        try {
            const { data, error } = await supabase.rpc('link_existing_bookings_to_user', {
            user_email: session.user.email,
            user_uuid: session.user.id  // ← Changed parameter name
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

  const signUp = async (email, password, userData) => {
    setLoading(true)
    try {
      const result = await authService.signUp(email, password, userData)
      return result
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    setLoading(true)
    try {
      const result = await authService.signIn(email, password)
      return result
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await authService.signOut()
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}