// src/hooks/useCurrency.js
// Currency state management hook for VAI platform
// Manages currency selection with localStorage persistence

import { useState, useEffect, useCallback } from 'react'
import { getSupportedCurrencies } from '../utils/currency'

const CURRENCY_STORAGE_KEY = 'vai-selected-currency'
const DEFAULT_CURRENCY = 'XPF'

/**
 * Currency state management hook
 * Provides currency selection with persistence and validation
 */
export const useCurrency = () => {
  const [selectedCurrency, setSelectedCurrency] = useState(DEFAULT_CURRENCY)
  const [isLoading, setIsLoading] = useState(true)

  // Load currency preference from localStorage on mount
  useEffect(() => {
    try {
      const storedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY)
      const supportedCurrencies = getSupportedCurrencies()
      
      // Validate stored currency
      if (storedCurrency && supportedCurrencies.includes(storedCurrency)) {
        setSelectedCurrency(storedCurrency)
      } else {
        // Invalid or missing currency, use default
        setSelectedCurrency(DEFAULT_CURRENCY)
        localStorage.setItem(CURRENCY_STORAGE_KEY, DEFAULT_CURRENCY)
      }
    } catch (error) {
      console.warn('Failed to load currency preference:', error)
      setSelectedCurrency(DEFAULT_CURRENCY)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Change currency with validation and persistence
  const changeCurrency = useCallback((newCurrency) => {
    const supportedCurrencies = getSupportedCurrencies()
    
    if (!supportedCurrencies.includes(newCurrency)) {
      console.warn(`Unsupported currency: ${newCurrency}`)
      return false
    }

    try {
      setSelectedCurrency(newCurrency)
      localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency)
      
      // Analytics tracking (if available)
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'currency_change', {
          currency: newCurrency,
          previous_currency: selectedCurrency
        })
      }
      
      return true
    } catch (error) {
      console.error('Failed to save currency preference:', error)
      return false
    }
  }, [selectedCurrency])

  // Get currency display info
  const getCurrencyInfo = useCallback(() => {
    const currencies = getSupportedCurrencies()
    return {
      current: selectedCurrency,
      supported: currencies,
      isXPF: selectedCurrency === 'XPF',
      isUSD: selectedCurrency === 'USD', 
      isEUR: selectedCurrency === 'EUR'
    }
  }, [selectedCurrency])

  // Reset to default currency
  const resetCurrency = useCallback(() => {
    changeCurrency(DEFAULT_CURRENCY)
  }, [changeCurrency])

  return {
    // Current state
    selectedCurrency,
    isLoading,
    
    // Actions
    changeCurrency,
    resetCurrency,
    
    // Computed values
    currencyInfo: getCurrencyInfo(),
    
    // Convenience checks
    isXPF: selectedCurrency === 'XPF',
    isUSD: selectedCurrency === 'USD',
    isEUR: selectedCurrency === 'EUR'
  }
}

/**
 * Context-based currency provider for app-wide currency state
 * Use this if you need currency state in multiple unrelated components
 */
import React, { createContext, useContext } from 'react'

const CurrencyContext = createContext(null)

export const CurrencyProvider = ({ children }) => {
  const currencyState = useCurrency()
  
  return (
    <CurrencyContext.Provider value={currencyState}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrencyContext = () => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrencyContext must be used within a CurrencyProvider')
  }
  return context
}

export default useCurrency