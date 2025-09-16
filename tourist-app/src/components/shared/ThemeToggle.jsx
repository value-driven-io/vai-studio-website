import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

const ThemeToggle = ({
  size = 'default',
  variant = 'default',
  className = ''
}) => {
  const { theme, toggleTheme, isDark, isLight } = useTheme()

  const sizeClasses = {
    small: 'h-8 w-8 p-1.5',
    default: 'h-10 w-10 p-2',
    large: 'h-12 w-12 p-2.5'
  }

  const variantClasses = {
    default: 'bg-ui-surface-secondary hover:bg-ui-surface-tertiary border border-ui-border-primary',
    ghost: 'bg-transparent hover:bg-ui-surface-tertiary',
    primary: 'bg-interactive-primary hover:bg-interactive-primary-hover text-ui-text-primary border-0'
  }

  const iconSize = {
    small: 16,
    default: 20,
    large: 24
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-lg
        text-ui-text-primary
        transition-all
        duration-300
        hover:scale-105
        focus:outline-none
        focus:ring-2
        focus:ring-interactive-focus
        focus:ring-offset-2
        focus:ring-offset-ui-surface-overlay
        relative
        overflow-hidden
        group
        ${className}
      `}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Sun Icon - visible in dark mode */}
      <Sun
        size={iconSize[size]}
        className={`
          absolute
          inset-0
          m-auto
          transition-all
          duration-500
          transform
          ${isDark
            ? 'rotate-0 scale-100 opacity-100'
            : 'rotate-90 scale-0 opacity-0'
          }
        `}
      />

      {/* Moon Icon - visible in light mode */}
      <Moon
        size={iconSize[size]}
        className={`
          absolute
          inset-0
          m-auto
          transition-all
          duration-500
          transform
          ${isLight
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0'
          }
        `}
      />

      {/* Ripple effect on click */}
      <span className="absolute inset-0 rounded-lg bg-white/20 scale-0 group-active:scale-100 transition-transform duration-300" />
    </button>
  )
}

export default ThemeToggle