// services/index.js - Centralized Service Initialization with Standardized Error Handling
import { serviceRegistry, registerCommonServices } from './serviceRegistry'
import { 
  createErrorResponse, 
  createSuccessResponse, 
  ERROR_CODES 
} from '../utils/serviceResponse'

// Import existing services
import { supabase } from '../lib/supabase'

/**
 * Initialize all services with consistent error handling patterns
 */
export const initializeServices = async () => {
  console.log('🚀 Initializing application services...')

  try {
    // Test Supabase connection first
    const { data, error } = await supabase
      .from('operators')
      .select('id')
      .limit(1)

    if (error) {
      console.error('❌ Database connection failed:', error)
      throw new Error('Database connection failed')
    }

    // Register standardized services
    await registerCommonServices()

    // Register additional services with error handling
    await registerLegacyServices()
    await registerUtilityServices()

    console.log('✅ All services initialized successfully')
    console.log('📊 Service registry stats:', serviceRegistry.getStats())

    return createSuccessResponse({
      registeredServices: serviceRegistry.getServiceNames(),
      stats: serviceRegistry.getStats()
    }, 'Services initialized successfully')

  } catch (error) {
    console.error('❌ Service initialization failed:', error)
    return createErrorResponse(
      ERROR_CODES.SERVICE_UNAVAILABLE,
      'Failed to initialize services',
      error
    )
  }
}

/**
 * Register legacy services with standardized wrappers
 */
const registerLegacyServices = async () => {
  console.log('🔄 Wrapping legacy services...')

  try {
    // Schedule Service (wrap existing implementation)
    const { scheduleService: legacyScheduleService } = await import('./scheduleService')
    
    const wrappedScheduleService = {
      // Wrap key methods with standardized responses
      getSchedules: async (operatorId) => {
        try {
          const result = await legacyScheduleService.getSchedules(operatorId)
          return createSuccessResponse(result, 'Schedules retrieved successfully')
        } catch (error) {
          return createErrorResponse(ERROR_CODES.DATABASE_ERROR, error.message, error)
        }
      },

      createActivityTemplateSchedule: async (scheduleData) => {
        try {
          const result = await legacyScheduleService.createActivityTemplateSchedule(scheduleData)
          return createSuccessResponse(result, 'Template schedule created successfully')
        } catch (error) {
          return createErrorResponse(ERROR_CODES.VALIDATION_FAILED, error.message, error)
        }
      },

      updateSchedule: async (scheduleId, updateData, operatorId) => {
        try {
          const result = await legacyScheduleService.updateSchedule(scheduleId, updateData, operatorId)
          return createSuccessResponse(result, 'Schedule updated successfully')
        } catch (error) {
          return createErrorResponse(ERROR_CODES.BUSINESS_RULE_VIOLATION, error.message, error)
        }
      },

      deleteSchedule: async (scheduleId, operatorId) => {
        try {
          const result = await legacyScheduleService.deleteSchedule(scheduleId, operatorId)
          return createSuccessResponse({ deleted: true }, 'Schedule deleted successfully')
        } catch (error) {
          return createErrorResponse(ERROR_CODES.DEPENDENCY_VIOLATION, error.message, error)
        }
      },

      // Wrap other important methods
      getOperatorActivityTemplates: legacyScheduleService.getOperatorActivityTemplates?.bind(legacyScheduleService),
      validateScheduleData: legacyScheduleService.validateScheduleData?.bind(legacyScheduleService),
      generateSchedulePreview: legacyScheduleService.generateSchedulePreview?.bind(legacyScheduleService),

      // Health check for this service
      healthCheck: async () => {
        try {
          // Test basic functionality
          const testValidation = legacyScheduleService.validateScheduleData({
            recurrence_type: 'once',
            start_date: '2025-02-01',
            end_date: '2025-02-01',
            start_time: '10:00'
          })
          
          return createSuccessResponse({
            status: 'healthy',
            validationWorking: testValidation.valid !== undefined
          })
        } catch (error) {
          return createErrorResponse(ERROR_CODES.SERVICE_UNAVAILABLE, 'Schedule service health check failed', error)
        }
      }
    }

    serviceRegistry.register('scheduleService', wrappedScheduleService, {
      wrapMethods: true,
      validateResponses: true
    })

    console.log('✅ Legacy schedule service wrapped and registered')

  } catch (error) {
    console.warn('⚠️ Could not register legacy schedule service:', error.message)
  }

  try {
    // Template Service (use existing if new one not available)
    let templateServiceToUse
    
    try {
      const { default: newTemplateService } = await import('./templateServiceStandardized')
      templateServiceToUse = newTemplateService
      console.log('✅ Using new standardized template service')
    } catch {
      // Fall back to legacy template service
      const { default: legacyTemplateService } = await import('./templateService')
      
      // Wrap legacy service methods to return standardized responses
      templateServiceToUse = {
        createTemplate: async (templateData) => {
          const result = await legacyTemplateService.createTemplate(templateData)
          return result.success ? 
            createSuccessResponse(result.data, 'Template created successfully') :
            createErrorResponse(ERROR_CODES.VALIDATION_FAILED, result.error)
        },
        
        getOperatorTemplates: async (operatorId) => {
          const result = await legacyTemplateService.getOperatorTemplates(operatorId)
          return createSuccessResponse(result, 'Templates retrieved successfully')
        },
        
        updateTemplate: async (templateId, updateData) => {
          const result = await legacyTemplateService.updateTemplate(templateId, updateData)
          return result.success ? 
            createSuccessResponse(result.data, 'Template updated successfully') :
            createErrorResponse(ERROR_CODES.BUSINESS_RULE_VIOLATION, result.error)
        },
        
        deleteTemplate: async (templateId) => {
          const result = await legacyTemplateService.deleteTemplate(templateId)
          return result.success ? 
            createSuccessResponse(result.data, 'Template deleted successfully') :
            createErrorResponse(ERROR_CODES.DEPENDENCY_VIOLATION, result.error)
        },

        healthCheck: async () => {
          return createSuccessResponse({ status: 'healthy', version: 'legacy' })
        }
      }
      
      console.log('✅ Using wrapped legacy template service')
    }

    serviceRegistry.register('templateService', templateServiceToUse, {
      wrapMethods: false, // Already wrapped
      validateResponses: true
    })

  } catch (error) {
    console.warn('⚠️ Could not register template service:', error.message)
  }
}

/**
 * Register utility services
 */
const registerUtilityServices = async () => {
  console.log('🛠️ Registering utility services...')

  // Database Service
  const databaseService = {
    async testConnection() {
      try {
        const { data, error } = await supabase
          .from('operators')
          .select('id')
          .limit(1)

        if (error) throw error

        return createSuccessResponse({
          connected: true,
          timestamp: new Date().toISOString()
        }, 'Database connection successful')
      } catch (error) {
        return createErrorResponse(
          ERROR_CODES.CONNECTION_FAILED,
          'Database connection failed',
          error
        )
      }
    },

    async getTableInfo(tableName) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        return createSuccessResponse({
          tableName,
          accessible: !error,
          sampleRecord: data?.[0] || null
        })
      } catch (error) {
        return createErrorResponse(
          ERROR_CODES.DATABASE_ERROR,
          `Error accessing table ${tableName}`,
          error
        )
      }
    },

    healthCheck: async () => {
      const connectionTest = await this.testConnection()
      return connectionTest
    }
  }

  serviceRegistry.register('databaseService', databaseService)

  // Validation Service
  const validationService = {
    validateUUID(uuid) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      return {
        valid: uuidRegex.test(uuid),
        message: uuidRegex.test(uuid) ? 'Valid UUID' : 'Invalid UUID format'
      }
    },

    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return {
        valid: emailRegex.test(email),
        message: emailRegex.test(email) ? 'Valid email' : 'Invalid email format'
      }
    },

    validateRequired(value, fieldName = 'field') {
      const isValid = value !== null && value !== undefined && value !== ''
      return {
        valid: isValid,
        message: isValid ? `${fieldName} is provided` : `${fieldName} is required`
      }
    },

    healthCheck: async () => {
      return createSuccessResponse({
        status: 'healthy',
        methods: ['validateUUID', 'validateEmail', 'validateRequired']
      })
    }
  }

  serviceRegistry.register('validationService', validationService)

  console.log('✅ Utility services registered')
}

/**
 * Get service health status for all registered services
 */
export const getServicesHealth = async () => {
  return await serviceRegistry.getHealthStatus()
}

/**
 * Get a specific service (with error handling)
 */
export const getService = (serviceName) => {
  try {
    return serviceRegistry.get(serviceName)
  } catch (error) {
    console.error(`❌ Service '${serviceName}' not found:`, error.message)
    return null
  }
}

/**
 * Check if a service is available
 */
export const hasService = (serviceName) => {
  return serviceRegistry.has(serviceName)
}

/**
 * Get all available service names
 */
export const getAvailableServices = () => {
  return serviceRegistry.getServiceNames()
}

/**
 * Service health monitoring (for development)
 */
export const startServiceMonitoring = () => {
  if (process.env.NODE_ENV !== 'development') return

  console.log('🔍 Starting service monitoring...')
  
  setInterval(async () => {
    const health = await getServicesHealth()
    const unhealthyServices = Object.entries(health.data).filter(
      ([name, status]) => status.status !== 'healthy' && status.status !== 'available'
    )
    
    if (unhealthyServices.length > 0) {
      console.warn('⚠️ Unhealthy services detected:', unhealthyServices)
    }
  }, 30000) // Check every 30 seconds
}

// Export the service registry for advanced usage
export { serviceRegistry }

// Export utility functions
export * from '../utils/serviceResponse'

// Auto-initialize in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Initialize services when this module is loaded
  initializeServices().then((result) => {
    if (result.success) {
      console.log('🎉 Services auto-initialized for development')
      startServiceMonitoring()
    }
  })
}