// src/hooks/useAuth.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [operator, setOperator] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if operator is already logged in (from localStorage)
    const savedOperator = localStorage.getItem('vai_operator')
    if (savedOperator) {
      try {
        setOperator(JSON.parse(savedOperator))
      } catch (error) {
        console.error('Error parsing saved operator data:', error)
        localStorage.removeItem('vai_operator')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email) => {
    try {
      setLoading(true)
      
      // Debug: log what we're searching for
      console.log('Searching for operator with email:', email)
      
      const { data, error } = await supabase
        .from('operators')
        .select('*')
        .eq('email', email.toLowerCase().trim()) // Normalize email
        .eq('status', 'active')  // Only active operators
        .maybeSingle()  // Use maybeSingle instead of single
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      if (!data) {
        console.error('No operator found with email:', email)
        return { 
          success: false, 
          error: 'No active operator found with this email address. Please contact support.' 
        }
      }
      
      console.log('Found operator:', data.company_name)
      setOperator(data)
      localStorage.setItem('vai_operator', JSON.stringify(data))
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: 'Login failed. Please check your email address and try again.' 
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setOperator(null)
    localStorage.removeItem('vai_operator')
    console.log('Operator logged out')
  }

  return {
    operator,
    loading,
    login,
    logout,
    isAuthenticated: !!operator
  }
}