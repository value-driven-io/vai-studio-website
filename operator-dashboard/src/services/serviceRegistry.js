// serviceRegistry.js - Centralized Service Management with Consistent Error Handling
import { 
  createErrorResponse, 
  createSuccessResponse, 
  ERROR_CODES,
  wrapServiceFunction,
  isValidServiceResponse
} from '../utils/serviceResponse'

/**
 * Service Registry - Manages all application services with consistent patterns
 */
class ServiceRegistry {
  constructor() {
    this.services = new Map()
    this.middleware = []
    this.config = {
      enablePerformanceMonitoring: true,
      enableErrorHandling: true,
      enableLogging: true,
      logSensitiveData: false
    }
  }

  /**
   * Register a service with automatic standardization
   * @param {string} serviceName - Name of the service
   * @param {Object} serviceImplementation - Service object with methods
   * @param {Object} options - Registration options
   */
  register(serviceName, serviceImplementation, options = {}) {
    console.log(`📝 Registering service: ${serviceName}`)
    
    const {
      wrapMethods = true,
      validateResponses = true,
      customErrorHandling = null
    } = options

    let processedService = serviceImplementation

    if (wrapMethods) {
      processedService = this.wrapServiceMethods(serviceName, serviceImplementation)
    }

    if (validateResponses) {
      processedService = this.addResponseValidation(serviceName, processedService)
    }

    if (customErrorHandling) {
      processedService = this.addCustomErrorHandling(processedService, customErrorHandling)
    }

    // Add service metadata
    processedService.__serviceName = serviceName
    processedService.__registeredAt = new Date().toISOString()
    processedService.__options = options

    this.services.set(serviceName, processedService)
    console.log(`✅ Service registered: ${serviceName}`)

    return processedService
  }

  /**
   * Get a registered service
   * @param {string} serviceName - Name of the service
   * @returns {Object} Service implementation
   */
  get(serviceName) {
    const service = this.services.get(serviceName)
    if (!service) {
      throw new Error(`Service '${serviceName}' not found. Available services: ${Array.from(this.services.keys()).join(', ')}`)
    }
    return service
  }

  /**
   * Check if a service is registered
   * @param {string} serviceName - Name of the service
   * @returns {boolean} Whether the service exists
   */
  has(serviceName) {
    return this.services.has(serviceName)
  }

  /**
   * Get all registered service names
   * @returns {Array<string>} Array of service names
   */
  getServiceNames() {
    return Array.from(this.services.keys())
  }

  /**
   * Get service health status
   * @param {string} serviceName - Name of the service (optional)
   * @returns {Object} Health status
   */
  async getHealthStatus(serviceName = null) {
    const results = {}

    const servicesToCheck = serviceName ? [serviceName] : this.getServiceNames()

    for (const name of servicesToCheck) {
      try {
        const service = this.get(name)
        
        // Try to call a health check method if available
        if (typeof service.healthCheck === 'function') {
          const healthResult = await service.healthCheck()
          results[name] = {
            status: healthResult.success ? 'healthy' : 'unhealthy',
            details: healthResult
          }
        } else {
          // Basic availability check
          results[name] = {
            status: 'available',
            registeredAt: service.__registeredAt,
            methodCount: Object.keys(service).filter(key => typeof service[key] === 'function').length
          }
        }
      } catch (error) {
        results[name] = {
          status: 'error',
          error: error.message
        }
      }
    }

    return createSuccessResponse(results, 'Health check completed')
  }

  /**
   * Wrap all methods of a service with standardized error handling
   * @param {string} serviceName - Name of the service
   * @param {Object} serviceImplementation - Service object
   * @returns {Object} Service with wrapped methods
   */
  wrapServiceMethods(serviceName, serviceImplementation) {
    const wrappedService = {}

    Object.keys(serviceImplementation).forEach(methodName => {
      const method = serviceImplementation[methodName]

      if (typeof method === 'function') {
        // Skip special methods
        if (methodName.startsWith('__') || methodName === 'constructor') {
          wrappedService[methodName] = method
          return
        }

        wrappedService[methodName] = wrapServiceFunction(
          method.bind(serviceImplementation),
          `${serviceName}.${methodName}`,
          {
            withErrorHandling: this.config.enableErrorHandling,
            withPerformanceMonitoring: this.config.enablePerformanceMonitoring
          }
        )
      } else {
        // Copy non-function properties as-is
        wrappedService[methodName] = method
      }
    })

    return wrappedService
  }

  /**
   * Add response validation to service methods
   * @param {string} serviceName - Name of the service
   * @param {Object} service - Service object
   * @returns {Object} Service with response validation
   */
  addResponseValidation(serviceName, service) {
    const validatedService = {}

    Object.keys(service).forEach(methodName => {
      const method = service[methodName]

      if (typeof method === 'function' && !methodName.startsWith('__')) {
        validatedService[methodName] = async (...args) => {
          const result = await method(...args)

          // Validate that the response follows our standard format
          if (!isValidServiceResponse(result)) {
            console.warn(`⚠️ ${serviceName}.${methodName} returned non-standard response:`, result)
            
            // Auto-correct if possible
            if (result && typeof result === 'object' && !result.hasOwnProperty('success')) {
              return createSuccessResponse(result, `${methodName} completed`)
            }
          }

          return result
        }
      } else {
        validatedService[methodName] = method
      }
    })

    return validatedService
  }

  /**
   * Add custom error handling to a service
   * @param {Object} service - Service object
   * @param {Function} errorHandler - Custom error handler
   * @returns {Object} Service with custom error handling
   */
  addCustomErrorHandling(service, errorHandler) {
    const customService = {}

    Object.keys(service).forEach(methodName => {
      const method = service[methodName]

      if (typeof method === 'function' && !methodName.startsWith('__')) {
        customService[methodName] = async (...args) => {
          try {
            return await method(...args)
          } catch (error) {
            return errorHandler(error, methodName, args)
          }
        }
      } else {
        customService[methodName] = method
      }
    })

    return customService
  }

  /**
   * Add middleware to be applied to all services
   * @param {Function} middlewareFunction - Middleware function
   */
  addMiddleware(middlewareFunction) {
    this.middleware.push(middlewareFunction)
  }

  /**
   * Update registry configuration
   * @param {Object} newConfig - New configuration options
   */
  configure(newConfig) {
    this.config = { ...this.config, ...newConfig }
    console.log('🔧 Service registry configured:', this.config)
  }

  /**
   * Bulk register multiple services
   * @param {Object} serviceMap - Map of service names to implementations
   * @param {Object} globalOptions - Options to apply to all services
   */
  registerMultiple(serviceMap, globalOptions = {}) {
    Object.entries(serviceMap).forEach(([name, implementation]) => {
      this.register(name, implementation, globalOptions)
    })
  }

  /**
   * Unregister a service
   * @param {string} serviceName - Name of the service to remove
   */
  unregister(serviceName) {
    if (this.services.has(serviceName)) {
      this.services.delete(serviceName)
      console.log(`🗑️ Service unregistered: ${serviceName}`)
    }
  }

  /**
   * Clear all registered services
   */
  clear() {
    this.services.clear()
    console.log('🧹 All services cleared from registry')
  }

  /**
   * Get registry statistics
   * @returns {Object} Registry statistics
   */
  getStats() {
    const services = this.getServiceNames()
    const methodCounts = {}
    
    services.forEach(serviceName => {
      const service = this.get(serviceName)
      methodCounts[serviceName] = Object.keys(service).filter(
        key => typeof service[key] === 'function' && !key.startsWith('__')
      ).length
    })

    return {
      totalServices: services.length,
      serviceNames: services,
      methodCounts,
      config: this.config,
      middlewareCount: this.middleware.length
    }
  }

  /**
   * Create a service proxy that provides enhanced features
   * @param {string} serviceName - Name of the service
   * @returns {Proxy} Enhanced service proxy
   */
  createProxy(serviceName) {
    const service = this.get(serviceName)
    
    return new Proxy(service, {
      get(target, property, receiver) {
        const value = Reflect.get(target, property, receiver)
        
        // Add call logging for functions
        if (typeof value === 'function' && !property.startsWith('__')) {
          return function(...args) {
            console.log(`🔧 ${serviceName}.${property} called with:`, args)
            return value.apply(target, args)
          }
        }
        
        return value
      }
    })
  }
}

// Create singleton instance
export const serviceRegistry = new ServiceRegistry()

// Configure default settings
serviceRegistry.configure({
  enablePerformanceMonitoring: process.env.NODE_ENV === 'development',
  enableErrorHandling: true,
  enableLogging: true
})

/**
 * Decorator function for registering services
 * @param {string} serviceName - Name of the service
 * @param {Object} options - Registration options
 */
export const registerService = (serviceName, options = {}) => {
  return (serviceClass) => {
    const instance = typeof serviceClass === 'function' ? new serviceClass() : serviceClass
    return serviceRegistry.register(serviceName, instance, options)
  }
}

/**
 * Helper function to get a service (shorthand)
 * @param {string} serviceName - Name of the service
 * @returns {Object} Service implementation
 */
export const getService = (serviceName) => {
  return serviceRegistry.get(serviceName)
}

/**
 * Batch register common services
 */
export const registerCommonServices = async () => {
  console.log('📦 Registering common services...')
  
  try {
    // Register services with dynamic imports to avoid circular dependencies
    const services = {}
    
    // Only import and register services that exist
    try {
      const { default: templateService } = await import('./templateServiceStandardized')
      services.templateService = templateService
    } catch (e) {
      console.warn('Template service not available for registration')
    }
    
    try {
      const { default: bookingValidationService } = await import('./bookingValidationService')
      services.bookingValidationService = bookingValidationService
    } catch (e) {
      console.warn('Booking validation service not available for registration')
    }
    
    // Register all available services
    serviceRegistry.registerMultiple(services, {
      wrapMethods: true,
      validateResponses: true
    })
    
    console.log('✅ Common services registered:', Object.keys(services))
    
  } catch (error) {
    console.error('❌ Error registering common services:', error)
  }
}

export default serviceRegistry