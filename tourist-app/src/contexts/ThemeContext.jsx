import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

const THEMES = {
  DARK: 'dark',
  LIGHT: 'light'
}

const STORAGE_KEY = 'vai-theme-preference'

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && Object.values(THEMES).includes(stored)) {
      return stored
    }

    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return THEMES.LIGHT
    }

    // Default to dark
    return THEMES.DARK
  })

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement

    // Remove existing theme classes
    root.removeAttribute('data-theme')

    // Apply new theme
    if (theme === THEMES.LIGHT) {
      root.setAttribute('data-theme', 'light')
    }
    // Dark theme is default (no attribute needed)

    // Store preference
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')

    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const storedPreference = localStorage.getItem(STORAGE_KEY)
      if (!storedPreference) {
        setTheme(e.matches ? THEMES.LIGHT : THEMES.DARK)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    setTheme(current => current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK)
  }

  const setLightTheme = () => setTheme(THEMES.LIGHT)
  const setDarkTheme = () => setTheme(THEMES.DARK)

  const value = {
    theme,
    isDark: theme === THEMES.DARK,
    isLight: theme === THEMES.LIGHT,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    THEMES
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext