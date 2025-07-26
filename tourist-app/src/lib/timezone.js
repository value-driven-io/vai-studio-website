// src/lib/timezone.js
// French Polynesia Timezone Utility
// French Polynesia uses Tahiti Time (TAHT) = UTC-10

const FRENCH_POLYNESIA_TIMEZONE = 'Pacific/Tahiti' // UTC-10

/**
 * Get current date in French Polynesia timezone
 */
export const getCurrentDateInFP = () => {
  const now = new Date()
  
  // French Polynesia is UTC-10, so subtract 10 hours from current time
  const fpTime = new Date(now.getTime() - (10 * 60 * 60 * 1000))
  
  return fpTime
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
  
  // For other dates, format nicely with timezone awareness
  const date = new Date(dateString + 'T00:00:00-10:00')  // Specify FP timezone!
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
  
  // TEMPORARY DEBUG
  console.log('=== FORMAT DATE DEBUG ===')
  console.log('Input dateString:', dateString)
  
  // Parse date string as if it's in French Polynesia timezone
  const date = new Date(dateString + 'T00:00:00-10:00')
  console.log('Parsed date object:', date)
  console.log('Date toISOString:', date.toISOString())
  
  const result = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
  
  console.log('Final formatted result:', result)
  console.log('========================')
  
  return result
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