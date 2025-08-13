// src/utils/currency.js
// Currency conversion utility for VAI platform
// Handles XPF ↔ USD ↔ EUR conversions for display while maintaining XPF backend storage

/**
 * Fixed exchange rates for French Polynesia
 * XPF is pegged to EUR: 1 EUR = 119.33 XPF
 * USD rates fluctuate but we'll use approximate rates for display
 */
const EXCHANGE_RATES = {
  XPF: 1,
  USD: 0.0095, // 1 XPF = ~0.0095 USD (approximate)
  EUR: 0.0084  // 1 XPF = ~0.0084 EUR (pegged rate)
}

/**
 * Currency symbols and formatting
 */
const CURRENCY_CONFIG = {
  XPF: {
    symbol: 'F',
    name: 'CFP Franc',
    decimals: 0,
    position: 'after' // 1,000 F
  },
  USD: {
    symbol: '$',
    name: 'US Dollar', 
    decimals: 0, // For tourism, whole dollars are cleaner
    position: 'before' // $95
  },
  EUR: {
    symbol: '€',
    name: 'Euro',
    decimals: 0, // For tourism, whole euros are cleaner
    position: 'after' // 85€
  }
}

/**
 * Convert amount from XPF to target currency
 * @param {number} xpfAmount - Amount in XPF (base currency)
 * @param {string} targetCurrency - Target currency (XPF, USD, EUR)
 * @returns {number} Converted amount
 */
export const convertFromXPF = (xpfAmount, targetCurrency = 'XPF') => {
  if (!xpfAmount || xpfAmount <= 0) return 0
  
  const rate = EXCHANGE_RATES[targetCurrency]
  if (!rate) {
    console.warn(`Unknown currency: ${targetCurrency}`)
    return xpfAmount
  }
  
  return Math.round(xpfAmount * rate)
}

/**
 * Convert amount from any currency to XPF
 * @param {number} amount - Amount in source currency  
 * @param {string} sourceCurrency - Source currency
 * @returns {number} Amount in XPF
 */
export const convertToXPF = (amount, sourceCurrency = 'XPF') => {
  if (!amount || amount <= 0) return 0
  
  if (sourceCurrency === 'XPF') return amount
  
  const rate = EXCHANGE_RATES[sourceCurrency]
  if (!rate) {
    console.warn(`Unknown currency: ${sourceCurrency}`)
    return amount
  }
  
  return Math.round(amount / rate)
}

/**
 * Format currency amount with proper symbol and positioning
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'XPF') => {
  if (!amount && amount !== 0) return '—'
  
  const config = CURRENCY_CONFIG[currency]
  if (!config) {
    console.warn(`Unknown currency config: ${currency}`)
    return `${amount} ${currency}`
  }
  
  // Format number with appropriate decimals
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals
  })
  
  // Position symbol
  return config.position === 'before' 
    ? `${config.symbol}${formattedAmount}`
    : `${formattedAmount} ${config.symbol}`
}

/**
 * Get currency display info
 * @param {string} currency - Currency code
 * @returns {object} Currency configuration
 */
export const getCurrencyInfo = (currency) => {
  return CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.XPF
}

/**
 * Get all supported currencies
 * @returns {array} Array of currency codes
 */
export const getSupportedCurrencies = () => {
  return Object.keys(CURRENCY_CONFIG)
}

/**
 * Convert and format price for display
 * @param {number} xpfAmount - Base amount in XPF
 * @param {string} displayCurrency - Currency to display
 * @returns {string} Formatted price string
 */
export const formatPrice = (xpfAmount, displayCurrency = 'XPF') => {
  const convertedAmount = convertFromXPF(xpfAmount, displayCurrency)
  return formatCurrency(convertedAmount, displayCurrency)
}

/**
 * Get conversion note for non-USD currencies
 * Used to show "You'll be charged $XX USD" message
 * @param {number} xpfAmount - Base amount in XPF
 * @param {string} displayCurrency - Current display currency
 * @returns {string|null} Conversion note or null if USD
 */
export const getConversionNote = (xpfAmount, displayCurrency) => {
  if (displayCurrency === 'USD') return null
  
  const usdAmount = convertFromXPF(xpfAmount, 'USD')
  return `You'll be charged ${formatCurrency(usdAmount, 'USD')}`
}

/**
 * Calculate total booking amount with currency conversion
 * @param {number} adultPrice - Adult price in XPF
 * @param {number} childPrice - Child price in XPF  
 * @param {number} numAdults - Number of adults
 * @param {number} numChildren - Number of children
 * @param {string} displayCurrency - Display currency
 * @returns {object} Booking totals in display currency
 */
export const calculateBookingTotal = (adultPrice, childPrice, numAdults, numChildren, displayCurrency = 'XPF') => {
  // Calculate in XPF (backend logic unchanged)
  const adultTotal = numAdults * adultPrice
  const childTotal = numChildren * (childPrice || 0)
  const totalXPF = adultTotal + childTotal
  
  // Convert for display
  const convertedAdultTotal = convertFromXPF(adultTotal, displayCurrency)
  const convertedChildTotal = convertFromXPF(childTotal, displayCurrency)
  const convertedTotal = convertFromXPF(totalXPF, displayCurrency)
  
  return {
    adultTotal: convertedAdultTotal,
    childTotal: convertedChildTotal, 
    total: convertedTotal,
    totalXPF, // Keep XPF amount for backend processing
    formatted: {
      adultTotal: formatCurrency(convertedAdultTotal, displayCurrency),
      childTotal: formatCurrency(convertedChildTotal, displayCurrency),
      total: formatCurrency(convertedTotal, displayCurrency)
    },
    conversionNote: getConversionNote(totalXPF, displayCurrency)
  }
}

/**
 * Real-time exchange rate fetching (future enhancement)
 * For now, returns static rates but ready for API integration
 */
export const updateExchangeRates = async () => {
  try {
    // TODO: Integrate with currency API when needed
    // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    // const data = await response.json()
    // Update EXCHANGE_RATES object
    
    console.log('Exchange rates updated (using static rates for now)')
    return EXCHANGE_RATES
  } catch (error) {
    console.warn('Failed to update exchange rates, using static rates:', error)
    return EXCHANGE_RATES
  }
}