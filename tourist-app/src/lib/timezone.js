// src/lib/timezone.js
// French Polynesia Timezone Utility
// French Polynesia uses Tahiti Time (TAHT) = UTC-10

const FRENCH_POLYNESIA_TIMEZONE = 'Pacific/Tahiti' // UTC-10

/**
 * Get current date in French Polynesia timezone
 */
export const getCurrentDateInFP = () => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: FRENCH_POLYNESIA_TIMEZONE }))
}

/**
 * Get today's date string in French Polynesia (YYYY-MM-DD format)
 */
export const getTodayInFP = () => {
  const today = getCurrentDateInFP()
  return today.toISOString().split('T')[0]
}

/**
 * Get tomorrow's date string in French Polynesia (YYYY-MM-DD format)
 */
export const getTomorrowInFP = () => {
  const today = getCurrentDateInFP()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}

/**
 * Get date X days from today in French Polynesia (YYYY-MM-DD format)
 */
export const getDaysFromTodayInFP = (days) => {
  const today = getCurrentDateInFP()
  const targetDate = new Date(today)
  targetDate.setDate(today.getDate() + days)
  return targetDate.toISOString().split('T')[0]
}

/**
 * Check if a date string is today in French Polynesia
 */
export const isTodayInFP = (dateString) => {
  if (!dateString) return false
  return dateString === getTodayInFP()
}

/**
 * Check if a date string is tomorrow in French Polynesia
 */
export const isTomorrowInFP = (dateString) => {
  if (!dateString) return false
  return dateString === getTomorrowInFP()
}

/**
 * Get relative date text for French Polynesia timezone
 */
export const getRelativeDateTextFP = (dateString) => {
  if (!dateString) return ''
  
  if (isTodayInFP(dateString)) return 'Today'
  if (isTomorrowInFP(dateString)) return 'Tomorrow'
  
  // For other dates, format nicely
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format date for display (with timezone awareness)
 */
export const formatDateFP = (dateString) => {
  if (!dateString) return ''
  
  // Add timezone info to ensure correct parsing
  const date = new Date(dateString + 'T00:00:00')
  
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Get date range for filtering (with French Polynesia timezone)
 */
export const getDateRangeForFilter = (timeframe) => {
  const today = getTodayInFP()
  
  switch (timeframe) {
    case 'today':
      return {
        start: today,
        end: today
      }
    case 'tomorrow':
      const tomorrow = getTomorrowInFP()
      return {
        start: tomorrow,
        end: tomorrow
      }
    case 'week':
      return {
        start: today,
        end: getDaysFromTodayInFP(7)
      }
    default:
      return null
  }
}

/**
 * Debug function to check current timezone info
 */
export const getTimezoneDebugInfo = () => {
  const now = new Date()
  const fpTime = getCurrentDateInFP()
  
  return {
    browserTime: now.toISOString(),
    browserTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    frenchPolynesiaTime: fpTime.toISOString(),
    todayInFP: getTodayInFP(),
    tomorrowInFP: getTomorrowInFP()
  }
}