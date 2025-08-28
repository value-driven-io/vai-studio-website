// Operator data caching service to prevent cold database lookups
// Provides instant operator data retrieval with smart background refresh

class OperatorCache {
  constructor() {
    this.CACHE_KEY = 'vai-operator-cache'
    this.CACHE_EXPIRY_MINUTES = 30 // Cache for 30 minutes
  }

  // Get cached operator data if available and not expired
  getCachedOperator(authUserId) {
    if (!authUserId) return null

    try {
      const cached = localStorage.getItem(`${this.CACHE_KEY}-${authUserId}`)
      if (!cached) return null

      const { data, timestamp } = JSON.parse(cached)
      const now = Date.now()
      const expiryTime = timestamp + (this.CACHE_EXPIRY_MINUTES * 60 * 1000)

      if (now > expiryTime) {
        console.log('🗄️ Cached operator data expired, will fetch fresh data')
        this.clearCache(authUserId)
        return null
      }

      console.log('🗄️ Using cached operator data:', data.company_name)
      return data
    } catch (error) {
      console.warn('⚠️ Failed to read cached operator data:', error.message)
      return null
    }
  }

  // Cache operator data with timestamp
  cacheOperator(authUserId, operatorData) {
    if (!authUserId || !operatorData) return

    try {
      const cacheData = {
        data: operatorData,
        timestamp: Date.now()
      }

      localStorage.setItem(
        `${this.CACHE_KEY}-${authUserId}`,
        JSON.stringify(cacheData)
      )

      console.log('🗄️ Cached operator data:', operatorData.company_name)
    } catch (error) {
      console.warn('⚠️ Failed to cache operator data:', error.message)
    }
  }

  // Clear cache for specific user
  clearCache(authUserId) {
    if (!authUserId) return

    try {
      localStorage.removeItem(`${this.CACHE_KEY}-${authUserId}`)
      console.log('🗄️ Cleared operator cache')
    } catch (error) {
      console.warn('⚠️ Failed to clear operator cache:', error.message)
    }
  }

  // Clear all operator caches (for cleanup)
  clearAllCaches() {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_KEY)) {
          localStorage.removeItem(key)
        }
      })
      console.log('🗄️ Cleared all operator caches')
    } catch (error) {
      console.warn('⚠️ Failed to clear all operator caches:', error.message)
    }
  }

  // Check if we have cached data (regardless of expiry)
  hasCachedData(authUserId) {
    if (!authUserId) return false
    return localStorage.getItem(`${this.CACHE_KEY}-${authUserId}`) !== null
  }

  // Get cache stats for debugging
  getCacheInfo(authUserId) {
    if (!authUserId) return null

    try {
      const cached = localStorage.getItem(`${this.CACHE_KEY}-${authUserId}`)
      if (!cached) return { exists: false }

      const { timestamp } = JSON.parse(cached)
      const now = Date.now()
      const age = now - timestamp
      const expiryTime = timestamp + (this.CACHE_EXPIRY_MINUTES * 60 * 1000)
      const timeUntilExpiry = expiryTime - now

      return {
        exists: true,
        ageMinutes: Math.floor(age / 60000),
        minutesUntilExpiry: Math.floor(timeUntilExpiry / 60000),
        isExpired: timeUntilExpiry <= 0
      }
    } catch (error) {
      return { exists: false, error: error.message }
    }
  }
}

// Create and export singleton instance
const operatorCache = new OperatorCache()
export default operatorCache