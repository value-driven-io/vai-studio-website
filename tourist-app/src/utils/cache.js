// src/utils/cache.js
// Simple in-memory cache for operator data to improve performance

class SimpleCache {
  constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map()
    this.defaultTTL = defaultTTL
  }

  /**
   * Set data in cache with optional TTL
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, data, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl
    this.cache.set(key, {
      data,
      expiry
    })
  }

  /**
   * Get data from cache
   * @param {string} key - Cache key
   * @returns {any|null} Cached data or null if expired/not found
   */
  get(key) {
    const cached = this.cache.get(key)

    if (!cached) {
      return null
    }

    // Check if expired
    if (Date.now() > cached.expiry) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  /**
   * Delete specific cache entry
   * @param {string} key - Cache key to delete
   */
  delete(key) {
    this.cache.delete(key)
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear()
  }

  /**
   * Get cache size
   * @returns {number} Number of cached items
   */
  size() {
    return this.cache.size
  }

  /**
   * Clean expired entries
   */
  cleanup() {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

// Create cache instances for different data types
export const operatorCache = new SimpleCache(5 * 60 * 1000) // 5 minutes
export const activityCache = new SimpleCache(3 * 60 * 1000) // 3 minutes
export const searchCache = new SimpleCache(1 * 60 * 1000) // 1 minute

// Cache key generators for consistency
export const CACHE_KEYS = {
  operator: (id) => `operator:${id}`,
  operatorBySlug: (slug) => `operator:slug:${slug}`,
  operatorActivities: (id) => `operator:activities:${id}`,
  operatorStats: (id) => `operator:stats:${id}`,
  operatorSearch: (query, filters = {}) => {
    const filtersStr = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join('|')
    return `search:operators:${query}:${filtersStr}`
  }
}

// Auto cleanup every 5 minutes
setInterval(() => {
  operatorCache.cleanup()
  activityCache.cleanup()
  searchCache.cleanup()
}, 5 * 60 * 1000)

/**
 * Cache wrapper function for async operations
 * @param {SimpleCache} cache - Cache instance to use
 * @param {string} key - Cache key
 * @param {Function} fetchFunction - Function to call if cache miss
 * @param {number} ttl - Time to live override
 * @returns {Promise<any>} Cached or fetched data
 */
export const withCache = async (cache, key, fetchFunction, ttl) => {
  // Try to get from cache first
  const cached = cache.get(key)
  if (cached !== null) {
    console.log(`Cache HIT: ${key}`)
    return cached
  }

  console.log(`Cache MISS: ${key}`)

  try {
    // Fetch data
    const data = await fetchFunction()

    // Cache the result
    cache.set(key, data, ttl)

    return data
  } catch (error) {
    console.error(`Cache fetch error for ${key}:`, error)
    throw error
  }
}

// Export default cache instance for general use
export default operatorCache