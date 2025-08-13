// src/components/shared/CurrencySelector.jsx
// Currency selector component for VAI platform
// Allows tourists to switch between XPF, USD, EUR display

import React from 'react'
import { getSupportedCurrencies, getCurrencyInfo } from '../../utils/currency'

const CurrencySelector = ({ 
  selectedCurrency, 
  onCurrencyChange, 
  className = '',
  size = 'default' // 'small', 'default', 'large'
}) => {
  const currencies = getSupportedCurrencies()
  
  // Size variants
  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    default: 'text-sm px-3 py-2', 
    large: 'text-base px-4 py-3'
  }
  
  const buttonSize = sizeClasses[size] || sizeClasses.default

  return (
    <div className={`currency-selector ${className}`}>
      <div className="flex bg-slate-800 rounded-lg border border-slate-600 overflow-hidden">
        {currencies.map((currency) => {
          const isSelected = currency === selectedCurrency
          const currencyInfo = getCurrencyInfo(currency)
          
          return (
            <button
              key={currency}
              onClick={() => onCurrencyChange(currency)}
              className={`
                ${buttonSize}
                font-medium transition-all duration-200
                border-r border-slate-600 last:border-r-0
                ${isSelected 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }
              `}
              title={currencyInfo.name}
            >
              {currency}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CurrencySelector