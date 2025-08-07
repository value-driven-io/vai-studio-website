// src/components/auth/RegistrationForm.jsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Building2, User, Mail, Phone, MapPin, 
  FileText, Target, Users, Check, ArrowLeft,
  Loader2, AlertCircle, CheckCircle
} from 'lucide-react'
import { useRegistration } from '../../hooks/useRegistration'
import LanguageDropdown from '../LanguageDropdown'

// 🔧 FIELD COMPONENTS DEFINED OUTSIDE TO PREVENT FOCUS LOSS
const InputField = ({ 
  label, 
  name, 
  type = 'text', 
  required = false, 
  value, 
  onChange, 
  onBlur,
  placeholder,
  fieldErrors = {},
  touchedFields = {},
  ...props 
}) => {
  const hasError = touchedFields[name] && fieldErrors[name]
  
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
        {!required && <span className="text-slate-500 text-xs ml-1">(optional)</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        onBlur={(e) => onBlur && onBlur(name, e.target.value)}
        className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none transition-colors ${
          hasError 
            ? 'border-red-500 focus:border-red-400' 
            : 'border-slate-600 focus:border-blue-500'
        }`}
        placeholder={placeholder}
        pattern={type === 'tel' ? '[+]?[0-9\\s\\-\\(\\)]{8,}' : undefined}
        {...props}
      />
      {hasError && (
        <p className="text-red-400 text-sm mt-1">{fieldErrors[name]}</p>
      )}
      {type === 'tel' && !hasError && (
        <p className="text-slate-500 text-xs mt-1">
          Format: +689 12 34 56 78 (French Polynesia) or +33 6 12 34 56 78 (International)
        </p>
      )}
    </div>
  )
}

const SelectField = ({ 
  label, 
  name, 
  required = false, 
  value, 
  onChange, 
  onBlur,
  children,
  placeholder,
  fieldErrors = {},
  touchedFields = {}
}) => {
  const hasError = touchedFields[name] && fieldErrors[name]
  
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
        {!required && <span className="text-slate-500 text-xs ml-1">(optional)</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        onBlur={(e) => onBlur && onBlur(name, e.target.value)}
        className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none transition-colors ${
          hasError 
            ? 'border-red-500 focus:border-red-400' 
            : 'border-slate-600 focus:border-blue-500'
        }`}
      >
        <option value="">{placeholder}</option>
        {children}
      </select>
      {hasError && (
        <p className="text-red-400 text-sm mt-1">{fieldErrors[name]}</p>
      )}
    </div>
  )
}

const TextareaField = ({ 
  label, 
  name, 
  required = false, 
  value, 
  onChange, 
  onBlur,
  placeholder,
  rows = 3,
  fieldErrors = {},
  touchedFields = {}
}) => {
  const hasError = touchedFields[name] && fieldErrors[name]
  
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
        {!required && <span className="text-slate-500 text-xs ml-1">(optional)</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        onBlur={(e) => onBlur && onBlur(name, e.target.value)}
        rows={rows}
        className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white focus:outline-none transition-colors resize-none ${
          hasError 
            ? 'border-red-500 focus:border-red-400' 
            : 'border-slate-600 focus:border-blue-500'
        }`}
        placeholder={placeholder}
      />
      {hasError && (
        <p className="text-red-400 text-sm mt-1">{fieldErrors[name]}</p>
      )}
    </div>
  )
}

const RegistrationForm = ({ onBack, onSuccess }) => {
  const { t } = useTranslation()
  const { registerOperator, loading, error } = useRegistration()
  
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Company Information
    company_name: '',
    contact_person: '',
    email: '',
    whatsapp_number: '',
    island: '',
    
    // Business Details
    business_description: '',
    tour_types: [],
    languages: ['French'],
    target_bookings_monthly: '',
    customer_type_preference: '',
    
    // Legal
    terms_accepted: false,
    marketing_emails: false
  })

  // 🆕 FIELD-LEVEL VALIDATION STATE
  const [fieldErrors, setFieldErrors] = useState({})
  const [touchedFields, setTouchedFields] = useState({})

  // 🆕 FORM STATE PRESERVATION
  useEffect(() => {
    // Load saved form data on component mount
    const savedData = sessionStorage.getItem('vai_registration_form')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setFormData(parsedData)
      } catch (error) {
        console.warn('Failed to load saved form data:', error)
      }
    }
  }, [])

  // Save form data whenever it changes
  useEffect(() => {
    sessionStorage.setItem('vai_registration_form', JSON.stringify(formData))
  }, [formData])

  // Clear saved data on successful submission
  const clearSavedData = () => {
    sessionStorage.removeItem('vai_registration_form')
  }

  // Static data arrays with i18n
  const islands = [
    'tahiti', 'moorea', 'boraBora', 'huahine', 
    'raiatea', 'tahaa', 'maupiti', 'tikehau', 
    'rangiroa', 'fakarava', 'nukuHiva', 'other'
  ]

  const tourTypes = [
    'whaleWatching', 'snorkeling', 'diving', 'lagoonTours',
    'islandTours', 'hiking', 'cultural', 'fishing',
    'sunset', 'mindfulness', 'other'
  ]

  const targetBookings = [
    '1-5', '6-15', '16-30', '31+'
  ]

  const customerTypes = [
    'families', 'couples', 'solo', 'groups', 'luxury', 'budget', 'mixed'
  ]

  // 🆕 ENHANCED VALIDATION HELPERS
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  // 🆕 ENHANCED PHONE VALIDATION (ITU E.164 compliant but user-friendly)
  const isValidPhone = (phone) => {
    if (!phone) return true // Optional field - empty is valid
    
    // Remove all non-digit characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, '')
    
    // Must be 8-15 digits (international standard)
    const digitCount = cleanPhone.replace(/\+/g, '').length
    
    // French Polynesia: +689 followed by 8 digits, or local 8 digits
    const polynesianPattern = /^(\+689|689)?\d{8}$/
    // International pattern: + followed by country code and number
    const internationalPattern = /^\+\d{8,15}$/
    // Local pattern: 8+ digits
    const localPattern = /^\d{8,15}$/
    
    return polynesianPattern.test(cleanPhone) || 
           internationalPattern.test(cleanPhone) || 
           localPattern.test(cleanPhone)
  }

  // 🆕 GENTLER FIELD VALIDATION (Less aggressive)
  const validateField = (fieldName, value) => {
    let error = null

    // Only validate if field has been interacted with meaningfully
    if (!touchedFields[fieldName]) return null

    switch (fieldName) {
      case 'company_name':
        if (!value.trim()) {
          error = t('registration.validation.companyNameRequired')
        } else if (value.trim().length < 2) {
          error = t('registration.validation.companyNameTooShort')
        }
        break
      
      case 'contact_person':
        if (!value.trim()) {
          error = t('registration.validation.contactPersonRequired')
        }
        break
      
      case 'email':
        if (!value.trim()) {
          error = t('registration.validation.emailRequired')
        } else if (value.trim().length > 3 && !isValidEmail(value)) {
          // Only validate format if user has typed more than 3 characters
          error = t('registration.validation.emailInvalid')
        }
        break
      
      case 'whatsapp_number':
        // WhatsApp is now optional - only validate format if provided
        if (value.trim() && value.trim().length > 5 && !isValidPhone(value)) {
          error = t('registration.validation.phoneInvalid')
        }
        break
      
      case 'island':
        if (!value) {
          error = t('registration.validation.islandRequired')
        }
        break
      
      case 'business_description':
        if (!value.trim()) {
          error = t('registration.validation.descriptionRequired')
        }
        break
      
      case 'tour_types':
        if (!Array.isArray(value) || value.length === 0) {
          error = t('registration.validation.tourTypesRequired')
        }
        break
      
      case 'terms_accepted':
        if (!value) {
          error = t('registration.validation.termsRequired')
        }
        break
      
      default:
        break
    }

    return error
  }

  // 🆕 HANDLE FIELD BLUR (Validation on field exit)
  const handleFieldBlur = (fieldName, value) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }))
    
    const error = validateField(fieldName, value)
    setFieldErrors(prev => ({ ...prev, [fieldName]: error }))
  }

  // 🆕 OPTIMIZED INPUT CHANGE (Prevents unnecessary re-renders)
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Only clear error if there is one (prevent unnecessary re-renders)
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleTourTypeToggle = (tourType) => {
    const newTourTypes = formData.tour_types.includes(tourType)
      ? formData.tour_types.filter(t => t !== tourType)
      : [...formData.tour_types, tourType]
    
    setFormData(prev => ({ ...prev, tour_types: newTourTypes }))
    
    // Only clear error if there is one
    if (fieldErrors.tour_types) {
      setFieldErrors(prev => ({ ...prev, tour_types: null }))
    }
  }

  // 🆕 ENHANCED STEP VALIDATION
  const validateStep = (stepNumber) => {
    let isValid = true
    const errors = {}

    switch (stepNumber) {
      case 1:
        // Required fields for step 1 (WhatsApp now optional)
        const step1Fields = ['company_name', 'contact_person', 'email', 'island']
        step1Fields.forEach(field => {
          const error = validateField(field, formData[field])
          if (error) {
            errors[field] = error
            isValid = false
          }
        })
        break
      
      case 2:
        // Required fields for step 2
        const error1 = validateField('business_description', formData.business_description)
        const error2 = validateField('tour_types', formData.tour_types)
        
        if (error1) {
          errors.business_description = error1
          isValid = false
        }
        if (error2) {
          errors.tour_types = error2
          isValid = false
        }
        break
      
      case 3:
        const error3 = validateField('terms_accepted', formData.terms_accepted)
        if (error3) {
          errors.terms_accepted = error3
          isValid = false
        }
        break
      
      default:
        break
    }

    // Update field errors if validation failed
    if (!isValid) {
      setFieldErrors(prev => ({ ...prev, ...errors }))
      // Mark fields as touched so errors show
      const touchedUpdates = {}
      Object.keys(errors).forEach(field => {
        touchedUpdates[field] = true
      })
      setTouchedFields(prev => ({ ...prev, ...touchedUpdates }))
    }

    return isValid
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1)
    }
  }

  // 🆕 ENHANCED SUBMIT WITH CLEANUP
  const handleSubmit = async () => {
    if (!validateStep(3)) return
    
    try {
      // Island mapping for database constraint values
      const islandMapping = {
        'tahiti': 'Tahiti',
        'moorea': 'Moorea', 
        'boraBora': 'Bora Bora',
        'huahine': 'Huahine',
        'raiatea': 'Raiatea',
        'tahaa': 'Taha\'a',
        'maupiti': 'Maupiti',
        'tikehau': 'Tikehau',
        'rangiroa': 'Rangiroa',
        'fakarava': 'Fakarava',
        'nukuHiva': 'Nuku Hiva',
        'other': 'Other'
      }

      // Tour type mapping
      const tourTypeMapping = {
        'whaleWatching': 'Whale Watching',
        'snorkeling': 'Snorkeling',
        'diving': 'Diving',
        'lagoonTours': 'Lagoon Tours',
        'islandTours': 'Island Tours',
        'hiking': 'Hiking',
        'cultural': 'Cultural Activities',
        'fishing': 'Fishing',
        'sunset': 'Sunset Tours',
        'mindfulness': 'Mindful Events',
        'other': 'Other'
      }

      // Prepare data for backend service
      const submissionData = {
        ...formData,
        island: islandMapping[formData.island] || formData.island,
        tour_types: formData.tour_types.map(type => 
          tourTypeMapping[type] || type.charAt(0).toUpperCase() + type.slice(1)
        )
      }

      console.log('🎯 Submitting registration:', submissionData)
      
      const result = await registerOperator(submissionData)
      
      if (result.success) {
        console.log('✅ Registration successful:', result)
        clearSavedData() // Clear form data on success
        onSuccess(result)
      } else {
        console.error('❌ Registration failed:', result.error)
      }
      
    } catch (error) {
      console.error('❌ Registration submission error:', error)
    }
  }



  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((stepNum) => (
        <React.Fragment key={stepNum}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
            stepNum === step 
              ? 'bg-blue-500 text-white' 
              : stepNum < step 
                ? 'bg-green-500 text-white' 
                : 'bg-slate-700 text-slate-400'
          }`}>
            {stepNum < step ? <Check size={16} /> : stepNum}
          </div>
          {stepNum < 3 && (
            <div className={`w-8 h-0.5 transition-colors ${
              stepNum < step ? 'bg-green-500' : 'bg-slate-700'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Building2 className="w-12 h-12 text-blue-400 mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-white">{t('registration.companyInfo.title')}</h3>
        <p className="text-slate-400">{t('registration.companyInfo.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label={t('registration.companyInfo.companyName')}
          name="company_name"
          required={true}
          value={formData.company_name}
          onChange={handleInputChange}
          onBlur={handleFieldBlur}
          placeholder={t('registration.companyInfo.companyNamePlaceholder')}
          fieldErrors={fieldErrors}
          touchedFields={touchedFields}
        />

        <InputField
          label={t('registration.companyInfo.contactPerson')}
          name="contact_person"
          required={true}
          value={formData.contact_person}
          onChange={handleInputChange}
          onBlur={handleFieldBlur}
          placeholder={t('registration.companyInfo.contactPersonPlaceholder')}
          fieldErrors={fieldErrors}
          touchedFields={touchedFields}
        />

        <InputField
          label={t('registration.companyInfo.email')}
          name="email"
          type="email"
          required={true}
          value={formData.email}
          onChange={handleInputChange}
          onBlur={handleFieldBlur}
          placeholder={t('registration.companyInfo.emailPlaceholder')}
          fieldErrors={fieldErrors}
          touchedFields={touchedFields}
        />

        <InputField
          label={t('registration.companyInfo.whatsapp')}
          name="whatsapp_number"
          type="tel"
          required={false}
          value={formData.whatsapp_number}
          onChange={handleInputChange}
          onBlur={handleFieldBlur}
          placeholder="+689 12 34 56 78"
          fieldErrors={fieldErrors}
          touchedFields={touchedFields}
        />

        <div className="md:col-span-2">
          <SelectField
            label={t('registration.companyInfo.island')}
            name="island"
            required={true}
            value={formData.island}
            onChange={handleInputChange}
            onBlur={handleFieldBlur}
            placeholder={t('registration.companyInfo.islandPlaceholder')}
            fieldErrors={fieldErrors}
            touchedFields={touchedFields}
          >
            {islands.map(island => (
              <option key={island} value={island}>
                {t(`registration.islands.${island}`)}
              </option>
            ))}
          </SelectField>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Target className="w-12 h-12 text-blue-400 mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-white">{t('registration.businessDetails.title')}</h3>
        <p className="text-slate-400">{t('registration.businessDetails.subtitle')}</p>
      </div>

      <TextareaField
        label={t('registration.businessDetails.description')}
        name="business_description"
        required={true}
        value={formData.business_description}
        onChange={handleInputChange}
        onBlur={handleFieldBlur}
        placeholder={t('registration.businessDetails.descriptionPlaceholder')}
        fieldErrors={fieldErrors}
        touchedFields={touchedFields}
      />

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          {t('registration.businessDetails.tourTypes')} <span className="text-red-400">*</span>
          <span className="block text-xs text-slate-500 mt-1">
            {t('registration.businessDetails.tourTypesSubtitle')}
          </span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {tourTypes.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => handleTourTypeToggle(type)}
              className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                formData.tour_types.includes(type)
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {t(`registration.tourTypes.${type}`)}
            </button>
          ))}
        </div>
        {touchedFields.tour_types && fieldErrors.tour_types && (
          <p className="text-red-400 text-sm mt-2">{fieldErrors.tour_types}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label={t('registration.businessDetails.targetBookings')}
          name="target_bookings_monthly"
          required={false}
          value={formData.target_bookings_monthly}
          onChange={handleInputChange}
          placeholder={t('registration.businessDetails.targetBookingsPlaceholder')}
          fieldErrors={fieldErrors}
          touchedFields={touchedFields}
        >
          {targetBookings.map(option => (
            <option key={option} value={option}>
              {t(`registration.targetBookings.${option}`)}
            </option>
          ))}
        </SelectField>

        <SelectField
          label={t('registration.businessDetails.customerType')}
          name="customer_type_preference"
          required={false}
          value={formData.customer_type_preference}
          onChange={handleInputChange}
          placeholder={t('registration.businessDetails.customerTypePlaceholder')}
          fieldErrors={fieldErrors}
          touchedFields={touchedFields}
        >
          {customerTypes.map(option => (
            <option key={option} value={option}>
              {t(`registration.customerTypes.${option}`)}
            </option>
          ))}
        </SelectField>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CheckCircle className="w-12 h-12 text-blue-400 mx-auto mb-3" />
        <h3 className="text-xl font-semibold text-white">{t('registration.terms.title')}</h3>
        <p className="text-slate-400">{t('registration.terms.subtitle')}</p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={formData.terms_accepted}
              onChange={(e) => {
                handleInputChange('terms_accepted', e.target.checked)
              }}
              onBlur={() => handleFieldBlur('terms_accepted', formData.terms_accepted)}
              className="mt-1 w-4 h-4 text-blue-500 border-slate-600 rounded focus:ring-blue-500 bg-slate-700"
            />
            <label htmlFor="terms" className="text-slate-300 text-sm">
              {t('registration.terms.acceptTerms')} <span className="text-red-400">*</span>
            </label>
          </div>
          {touchedFields.terms_accepted && fieldErrors.terms_accepted && (
            <p className="text-red-400 text-sm mt-1 ml-7">{fieldErrors.terms_accepted}</p>
          )}
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="marketing"
            checked={formData.marketing_emails}
            onChange={(e) => handleInputChange('marketing_emails', e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-500 border-slate-600 rounded focus:ring-blue-500 bg-slate-700"
          />
          <label htmlFor="marketing" className="text-slate-300 text-sm">
            {t('registration.terms.marketingEmails')} <span className="text-slate-500 text-xs">(optional)</span>
          </label>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-blue-400 font-medium">{t('registration.terms.foundingMember')}</p>
            <p className="text-slate-300 text-sm mt-1">
              {t('registration.terms.foundingMemberText')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="mx-auto min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">{t('registration.title')}</h2>
            <p className="text-slate-400">{t('registration.subtitle')}</p>
          </div>
        </div>
        
        <div className="flex-shrink-0">
          <LanguageDropdown />
        </div>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep(prev => prev - 1)}
            disabled={step === 1 || loading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              step === 1 || loading
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
          >
            {t('registration.navigation.previous')}
          </button>

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                loading
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {t('registration.navigation.next')}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                loading
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? t('registration.navigation.creating') : t('registration.navigation.complete')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegistrationForm