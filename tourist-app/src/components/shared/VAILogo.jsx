// VAI Logo Component - Uses your actual logo file
// File: src/components/shared/VAILogo.jsx

import React from 'react'

const VAILogo = ({ 
  size = 'sm', 
  className = '',
  showText = false // Option to show "VAI" text next to logo
}) => {
  const sizes = {
    xs: { height: 'h-6', width: 'w-auto' },    // 24px height
    sm: { height: 'h-8', width: 'w-auto' },    // 32px height - DEFAULT
    md: { height: 'h-10', width: 'w-auto' },   // 40px height
    lg: { height: 'h-12', width: 'w-auto' },   // 48px height
    xl: { height: 'h-16', width: 'w-auto' }    // 64px height
  }

  const currentSize = sizes[size] || sizes.sm

  return (
    <a 
      href="https://vai.studio/app/" 
      target="_blank" 
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 hover:scale-105 transition-transform duration-200 ${className}`}
      aria-label="VAI Studio"
    >
      {/* Your actual logo */}
      <img 
        src="/logos/vai-logo-2025.png"
        alt="VAI Logo"
        className={`${currentSize.height} ${currentSize.width} object-contain`}
      />
      
      {/* Optional text label */}
      {showText && (
        <span className="text-white font-medium text-sm">
          VAI
        </span>
      )}
    </a>
  )
}

export default VAILogo