// Clean logging system with configurable levels and production filtering
// Replaces scattered console.log statements with organized, controllable logging

class Logger {
  constructor() {
    // Log levels (higher number = more verbose)
    this.LEVELS = {
      ERROR: 0,    // Always shown
      WARN: 1,     // Important warnings
      INFO: 2,     // General information  
      DEBUG: 3,    // Debug information
      VERBOSE: 4   // Very detailed logs
    }

    // Current log level based on environment
    this.currentLevel = this.getCurrentLogLevel()
    
    // Feature flags for specific logging categories
    this.categories = {
      AUTH: this.isDevelopment(),
      DATABASE: this.isDevelopment(),
      PERFORMANCE: this.isDevelopment(),
      CACHE: this.isDevelopment(),
      PAYMENT: true, // Always log payment issues
      BOOKING: this.isDevelopment(),
      NOTIFICATION: false, // Usually too noisy
      CHAT: false,
      UI: false
    }
  }

  // Determine log level based on environment
  getCurrentLogLevel() {
    if (this.isProduction()) return this.LEVELS.ERROR
    if (this.isStaging()) return this.LEVELS.WARN  
    return this.LEVELS.DEBUG // Development
  }

  // Environment detection
  isProduction() {
    return window.location.hostname.includes('vai-operator-dashboard.onrender.com') ||
           window.location.hostname.includes('operator.vai.studio')
  }

  isStaging() {
    return window.location.hostname.includes('staging') ||
           window.location.hostname.includes('vai-operator-staging')
  }

  isDevelopment() {
    return window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1'
  }

  // Check if we should log based on level and category
  shouldLog(level, category = null) {
    if (level > this.currentLevel) return false
    if (category && this.categories[category] === false) return false
    return true
  }

  // Format log messages consistently
  formatMessage(level, category, message, data = null) {
    const timestamp = new Date().toLocaleTimeString()
    const prefix = this.getPrefix(level, category)
    
    if (data) {
      return [`${prefix} ${message}`, data]
    }
    return [`${prefix} ${message}`]
  }

  // Get emoji prefix for log level and category
  getPrefix(level, category) {
    const levelEmojis = {
      [this.LEVELS.ERROR]: '❌',
      [this.LEVELS.WARN]: '⚠️', 
      [this.LEVELS.INFO]: 'ℹ️',
      [this.LEVELS.DEBUG]: '🔍',
      [this.LEVELS.VERBOSE]: '📝'
    }

    const categoryEmojis = {
      AUTH: '🔐',
      DATABASE: '🗄️',
      PERFORMANCE: '⏱️',
      CACHE: '💾',
      PAYMENT: '💳',
      BOOKING: '📅',
      NOTIFICATION: '📬',
      CHAT: '💬',
      UI: '🎨'
    }

    const levelEmoji = levelEmojis[level] || '📝'
    const categoryEmoji = category ? categoryEmojis[category] || '🔸' : ''
    
    return `${levelEmoji}${categoryEmoji}`
  }

  // Main logging methods
  error(message, data = null, category = null) {
    if (!this.shouldLog(this.LEVELS.ERROR, category)) return
    const formatted = this.formatMessage(this.LEVELS.ERROR, category, message, data)
    console.error(...formatted)
  }

  warn(message, data = null, category = null) {
    if (!this.shouldLog(this.LEVELS.WARN, category)) return
    const formatted = this.formatMessage(this.LEVELS.WARN, category, message, data)
    console.warn(...formatted)
  }

  info(message, data = null, category = null) {
    if (!this.shouldLog(this.LEVELS.INFO, category)) return
    const formatted = this.formatMessage(this.LEVELS.INFO, category, message, data)
    console.log(...formatted)
  }

  debug(message, data = null, category = null) {
    if (!this.shouldLog(this.LEVELS.DEBUG, category)) return
    const formatted = this.formatMessage(this.LEVELS.DEBUG, category, message, data)
    console.log(...formatted)
  }

  verbose(message, data = null, category = null) {
    if (!this.shouldLog(this.LEVELS.VERBOSE, category)) return
    const formatted = this.formatMessage(this.LEVELS.VERBOSE, category, message, data)
    console.log(...formatted)
  }

  // Specialized logging methods
  auth(message, data = null, level = 'INFO') {
    this[level.toLowerCase()](message, data, 'AUTH')
  }

  database(message, data = null, level = 'DEBUG') {
    this[level.toLowerCase()](message, data, 'DATABASE')
  }

  performance(message, data = null, level = 'DEBUG') {
    this[level.toLowerCase()](message, data, 'PERFORMANCE')
  }

  cache(message, data = null, level = 'DEBUG') {
    this[level.toLowerCase()](message, data, 'CACHE')
  }

  payment(message, data = null, level = 'INFO') {
    this[level.toLowerCase()](message, data, 'PAYMENT')
  }

  booking(message, data = null, level = 'DEBUG') {
    this[level.toLowerCase()](message, data, 'BOOKING')
  }

  // Development-only group logging
  group(title, callback, category = null) {
    if (!this.shouldLog(this.LEVELS.DEBUG, category)) return
    
    console.group(`🔍${category ? this.getPrefix(this.LEVELS.DEBUG, category) : ''} ${title}`)
    try {
      callback()
    } finally {
      console.groupEnd()
    }
  }

  // Performance timing helper
  time(label, category = 'PERFORMANCE') {
    const timerLabel = `⏱️ ${label}`
    const shouldStart = this.shouldLog(this.LEVELS.DEBUG, category)
    
    if (shouldStart) {
      console.time(timerLabel)
    }
    
    return () => {
      // Always end timer if it was started, regardless of current log level
      if (shouldStart) {
        console.timeEnd(timerLabel)
      }
    }
  }

  // Toggle category logging at runtime (for debugging)
  toggleCategory(category, enabled = null) {
    if (enabled === null) {
      this.categories[category] = !this.categories[category]
    } else {
      this.categories[category] = enabled
    }
    console.log(`🔧 Logging for ${category}: ${this.categories[category] ? 'ON' : 'OFF'}`)
  }

  // Debug info
  getDebugInfo() {
    return {
      environment: this.isProduction() ? 'production' : this.isStaging() ? 'staging' : 'development',
      currentLevel: Object.keys(this.LEVELS)[this.currentLevel],
      categories: this.categories
    }
  }
}

// Create singleton instance
const logger = new Logger()

// Development helper - expose on window for runtime debugging
if (logger.isDevelopment()) {
  window.logger = logger
  logger.debug('Logger initialized - use window.logger to control logging')
}

export default logger