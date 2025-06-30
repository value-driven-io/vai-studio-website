// src/lib/utils.js

/**
 * Utility functions for the VAI Tickets app
 */

// Price formatting for French Polynesia (XPF)
export const formatPrice = (price) => {
  if (!price || price === 0) return '0 XPF'
  return new Intl.NumberFormat('fr-FR').format(price) + ' XPF'
}

// Date formatting for tour dates
export const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short', 
    day: 'numeric'
  })
}

// Full date formatting
export const formatFullDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Time formatting
export const formatTime = (timeSlot) => {
  if (!timeSlot) return ''
  return timeSlot
}

// Hours until deadline calculation
export const getHoursUntilDeadline = (deadline) => {
  if (!deadline) return null
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const hoursLeft = (deadlineDate - now) / (1000 * 60 * 60)
  return Math.max(0, hoursLeft)
}

// Urgency level determination
export const getUrgencyLevel = (hoursLeft) => {
  if (!hoursLeft) return { level: 'normal', color: 'green', text: 'Available' }
  
  if (hoursLeft <= 1) return { 
    level: 'critical', 
    color: 'red', 
    text: 'Booking closes in 1h!',
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/30'
  }
  if (hoursLeft <= 2) return { 
    level: 'high', 
    color: 'orange', 
    text: 'Booking closes in 2h!',
    bgColor: 'bg-orange-500/20',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/30'
  }
  if (hoursLeft <= 4) return { 
    level: 'medium', 
    color: 'yellow', 
    text: 'Booking closes soon!',
    bgColor: 'bg-yellow-500/20',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/30'
  }
  return { 
    level: 'normal', 
    color: 'green', 
    text: 'Available',
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400',
    borderColor: 'border-green-500/30'
  }
}

// Calculate savings between original and discount price
export const calculateSavings = (originalPrice, discountPrice) => {
  if (!originalPrice || !discountPrice) return 0
  return Math.max(0, originalPrice - discountPrice)
}

// Calculate savings percentage
export const calculateSavingsPercentage = (originalPrice, discountPrice) => {
  if (!originalPrice || !discountPrice || originalPrice <= discountPrice) return 0
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
}

// Generate booking reference
export const generateBookingReference = () => {
  const timestamp = Date.now()
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, '')
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `VAI-${timestamp}-${date}-${random}`
}

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number (basic)
export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/
  return phoneRegex.test(phone)
}

// Format phone number for WhatsApp
export const formatPhoneForWhatsApp = (phone) => {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '')
  
  // If starts with 689 (French Polynesia), add country code
  if (digitsOnly.startsWith('689')) {
    return digitsOnly
  }
  
  // If doesn't start with country code, assume French Polynesia
  if (digitsOnly.length === 8) {
    return '689' + digitsOnly
  }
  
  return digitsOnly
}

// Truncate text with ellipsis
export const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

// Check if date is today
export const isToday = (dateString) => {
  if (!dateString) return false
  const date = new Date(dateString)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

// Check if date is tomorrow
export const isTomorrow = (dateString) => {
  if (!dateString) return false
  const date = new Date(dateString)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return date.toDateString() === tomorrow.toDateString()
}

// Get relative date text (Today, Tomorrow, or formatted date)
export const getRelativeDateText = (dateString) => {
  if (!dateString) return ''
  
  if (isToday(dateString)) return 'Today'
  if (isTomorrow(dateString)) return 'Tomorrow'
  
  return formatDate(dateString)
}

// Debounce function for search inputs
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Class names utility (simple version of clsx)
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}