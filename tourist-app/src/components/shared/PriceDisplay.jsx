// src/components/shared/PriceDisplay.jsx
// Multi-currency price display component for VAI platform
// Shows prices in selected currency with conversion notes

import React, { useState, useEffect } from 'react'
import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next';
import CurrencySelector from './CurrencySelector'
import { 
  formatPrice, 
  getConversionNote, 
  calculateBookingTotal,
  convertFromXPF 
} from '../../utils/currency'

/**
 * Single Price Display - for individual tour prices
 */
export const SinglePriceDisplay = ({ 
  xpfAmount, 
  label = '',
  showCurrencySelector = true,
  selectedCurrency = 'XPF',
  onCurrencyChange = () => {},
  className = '',
  size = 'default' // 'small', 'default', 'large'
}) => {
  const conversionNote = getConversionNote(xpfAmount, selectedCurrency)

// Initialize translation hook
  const { t } = useTranslation()
  
  // Size variants
  const sizeClasses = {
    small: 'text-lg',
    default: 'text-xl', 
    large: 'text-2xl'
  }
  
  const priceSize = sizeClasses[size] || sizeClasses.default

  return (
    <div className={`price-display ${className}`}>
      {/* Currency Selector */}
      {showCurrencySelector && (
        <div className="mb-2">
          <CurrencySelector 
            selectedCurrency={selectedCurrency}
            onCurrencyChange={onCurrencyChange}
            size="small"
          />
        </div>
      )}
      
      {/* Price */}
      <div className="flex items-center gap-2">
        <span className={`${priceSize} font-bold text-ui-text-primary`}>
          {formatPrice(xpfAmount, selectedCurrency)}
        </span>
        {label && (
          <span className="vai-text-secondary text-sm">
            {label}
          </span>
        )}
      </div>
      
      {/* Conversion Note */}
      {conversionNote && (
        <div className="flex items-center gap-1 mt-1 text-xs vai-text-disabled">
          <Info className="w-3 h-3" />
          <span>{conversionNote}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Booking Price Breakdown - for detailed booking calculations
 */
export const BookingPriceBreakdown = ({
  adultPrice,
  childPrice = 0,
  numAdults,
  numChildren,
  selectedCurrency = 'XPF',
  onCurrencyChange = () => {},
  showCurrencySelector = true,
  className = ''
}) => {
  const totals = calculateBookingTotal(
    adultPrice, 
    childPrice, 
    numAdults, 
    numChildren, 
    selectedCurrency
  )

  return (
    <div className={`booking-price-breakdown ${className}`}>
      {/* Currency Selector */}
      {showCurrencySelector && (
        <div className="mb-3">
          <CurrencySelector 
            selectedCurrency={selectedCurrency}
            onCurrencyChange={onCurrencyChange}
            size="small"
          />
        </div>
      )}
      
      {/* Price Breakdown */}
      <div className="space-y-2">
        {/* Adults */}
        {numAdults > 0 && (
          <div className="flex justify-between vai-text-secondary">
            <span>{numAdults} adult{numAdults > 1 ? 's' : ''}</span>
            <span>{totals.formatted.adultTotal}</span>
          </div>
        )}
        
        {/* Children */}
        {numChildren > 0 && childPrice > 0 && (
          <div className="flex justify-between vai-text-secondary">
            <span>{numChildren} child{numChildren > 1 ? 'ren' : ''}</span>
            <span>{totals.formatted.childTotal}</span>
          </div>
        )}
        
        {/* Total */}
        <div className="border-t border-ui-border-secondary pt-2">
          <div className="flex justify-between items-center">
            <span className="text-ui-text-primary font-medium">Total</span>
            <span className="text-xl font-bold text-ui-text-primary">
              {totals.formatted.total}
            </span>
          </div>
        </div>
      </div>
      
      {/* Conversion Note */}
      {totals.conversionNote && (
        <div className="flex items-center gap-1 mt-3 p-2 bg-status-info-bg rounded-lg border border-status-info">
          <Info className="w-4 h-4 text-status-info-light flex-shrink-0" />
          <span className="text-xs text-status-info-light">{totals.conversionNote}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Tour Card Price - for tour listing cards
 */
export const TourCardPrice = ({
  originalPrice,
  discountPrice,
  selectedCurrency = 'XPF',
  onCurrencyChange = () => {},
  showCurrencySelector = false, // Usually controlled at parent level
  className = ''
}) => {
  const hasDiscount = originalPrice && originalPrice > discountPrice
  const conversionNote = getConversionNote(discountPrice, selectedCurrency)
  const savings = hasDiscount ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100) : 0

  return (
    <div className={`tour-card-price ${className}`}>
      {/* Currency Selector */}
      {showCurrencySelector && (
        <div className="mb-2">
          <CurrencySelector 
            selectedCurrency={selectedCurrency}
            onCurrencyChange={onCurrencyChange}
            size="small"
          />
        </div>
      )}
      
      {/* Price Display */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Current Price */}
        <span className="text-xl font-bold text-ui-text-primary">
          {formatPrice(discountPrice, selectedCurrency)}
        </span>
        
        {/* Original Price */}
        {hasDiscount && (
          <span className="text-status-warning-light line-through text-sm">
            {formatPrice(originalPrice, selectedCurrency)}
          </span>
        )}
        
        {/* Savings Badge */}
        {/*
         {savings > 0 && (
          <span className="bg-status-success text-white text-xs px-2 py-1 rounded-full font-semibold">
            Save {savings}%
          </span>
        )}
          */}
      </div>
      
      {/* Per Adult Label >> already shown in TourCardPrice component */}
      {/* 
      <div className="text-xs vai-text-disabled mt-1">per adult</div>
      */}
      
      {/* Conversion Note */}
      {conversionNote && (
        <div className="flex items-center gap-1 mt-1">
          <Info className="w-3 h-3 vai-text-disabled" />
          <span className="text-xs vai-text-disabled">{conversionNote}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Compact Price Display - for minimal space usage
 */
export const CompactPriceDisplay = ({
  xpfAmount,
  selectedCurrency = 'XPF',
  showCurrency = true,
  className = ''
}) => {
  const convertedAmount = convertFromXPF(xpfAmount, selectedCurrency)
  const currencySymbol = selectedCurrency === 'XPF' ? 'F' : selectedCurrency === 'USD' ? '$' : '€'
  
  return (
    <div className={`compact-price ${className}`}>
      <span className="font-semibold text-ui-text-primary">
        {selectedCurrency === 'USD' || selectedCurrency === 'EUR' 
          ? `${currencySymbol}${convertedAmount}`
          : `${convertedAmount} ${currencySymbol}`
        }
      </span>
      {showCurrency && selectedCurrency !== 'XPF' && (
        <span className="text-xs vai-text-disabled ml-1">{selectedCurrency}</span>
      )}
    </div>
  )
}

// Export default as SinglePriceDisplay for backwards compatibility
export default SinglePriceDisplay