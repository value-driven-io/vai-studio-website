// src/components/auth/RegistrationForm.jsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Building2, User, Mail, Phone, MapPin, 
  FileText, Target, Users, Check, ArrowLeft,
  Loader2, AlertCircle, CheckCircle
} from 'lucide-react'
import { useRegistration } from '../../hooks/useRegistration'

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTourTypeToggle = (tourType) => {
    setFormData(prev => ({
      ...prev,
      tour_types: prev.tour_types.includes(tourType)
        ? prev.tour_types.filter(t => t !== tourType)
        : [...prev.tour_types, tourType]
    }))
  }

  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return formData.company_name.trim() && 
               formData.contact_person.trim() && 
               formData.email.trim() && 
               formData.whatsapp_number.trim() && 
               formData.island
      case 2:
        return formData.business_description.trim() && 
               formData.tour_types.length > 0 &&
               formData.target_bookings_monthly &&
               formData.customer_type_preference
      case 3:
        return formData.terms_accepted
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return
    
    // Convert tour_types and island from translation keys to actual values
    const submissionData = {
      ...formData,
      // Convert island from translation key to actual value
      island: formData.island === 'boraBora' ? 'Bora Bora' : 
              formData.island === 'nukuHiva' ? 'Nuku Hiva' : 
              formData.island.charAt(0).toUpperCase() + formData.island.slice(1),
      // Convert tour_types from translation keys to actual values  
      tour_types: formData.tour_types.map(type => {
        switch(type) {
          case 'whaleWatching': return 'Whale Watching'
          case 'lagoonTours': return 'Lagoon Tours'
          case 'islandTours': return 'Island Tours'
          case 'cultural': return 'Cultural Activities'
          case 'sunset': return 'Sunset Tours'
          case 'mindfulness': return 'Mindful Events'
          default: return type.charAt(0).toUpperCase() + type.slice(1)
        }
      })
    }
    
    const result = await registerOperator(submissionData)
    if (result.success) {
      onSuccess(result)
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
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {t('registration.companyInfo.companyName')} *
          </label>
          <input
            type="text"
            value={formData.company_name}
            onChange={(e) => handleInputChange('company_name', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder={t('registration.companyInfo.companyNamePlaceholder')}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {t('registration.companyInfo.contactPerson')} *
          </label>
          <input
            type="text"
            value={formData.contact_person}
            onChange={(e) => handleInputChange('contact_person', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder={t('registration.companyInfo.contactPersonPlaceholder')}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {t('registration.companyInfo.email')} *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder={t('registration.companyInfo.emailPlaceholder')}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {t('registration.companyInfo.whatsapp')} *
          </label>
          <input
            type="tel"
            value={formData.whatsapp_number}
            onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            placeholder={t('registration.companyInfo.whatsappPlaceholder')}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {t('registration.companyInfo.island')} *
          </label>
          <select
            value={formData.island}
            onChange={(e) => handleInputChange('island', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            required
          >
            <option value="">{t('registration.companyInfo.islandPlaceholder')}</option>
            {islands.map(island => (
              <option key={island} value={island}>
                {t(`registration.islands.${island}`)}
              </option>
            ))}
          </select>
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

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {t('registration.businessDetails.description')} *
        </label>
        <textarea
          value={formData.business_description}
          onChange={(e) => handleInputChange('business_description', e.target.value)}
          rows="3"
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          placeholder={t('registration.businessDetails.descriptionPlaceholder')}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          {t('registration.businessDetails.tourTypes')} * ({t('registration.businessDetails.tourTypesSubtitle')})
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {t('registration.businessDetails.targetBookings')} *
          </label>
          <select
            value={formData.target_bookings_monthly}
            onChange={(e) => handleInputChange('target_bookings_monthly', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            required
          >
            <option value="">{t('registration.businessDetails.targetBookingsPlaceholder')}</option>
            {targetBookings.map(option => (
              <option key={option} value={option}>
                {t(`registration.targetBookings.${option}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {t('registration.businessDetails.customerType')} *
          </label>
          <select
            value={formData.customer_type_preference}
            onChange={(e) => handleInputChange('customer_type_preference', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            required
          >
            <option value="">{t('registration.businessDetails.customerTypePlaceholder')}</option>
            {customerTypes.map(option => (
              <option key={option} value={option}>
                {t(`registration.customerTypes.${option}`)}
              </option>
            ))}
          </select>
        </div>
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
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            checked={formData.terms_accepted}
            onChange={(e) => handleInputChange('terms_accepted', e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-500 border-slate-600 rounded focus:ring-blue-500 bg-slate-700"
            required
          />
          <label htmlFor="terms" className="text-slate-300 text-sm">
            {t('registration.terms.acceptTerms')} *
          </label>
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
            {t('registration.terms.marketingEmails')}
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
      <div className="flex items-center gap-3 mb-6">
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
            disabled={step === 1}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              step === 1
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
          >
            {t('registration.navigation.previous')}
          </button>

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={!validateStep(step)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                validateStep(step)
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {t('registration.navigation.next')}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !validateStep(3)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                loading || !validateStep(3)
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