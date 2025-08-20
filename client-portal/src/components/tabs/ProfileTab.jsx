import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useClientStore } from '../../store/clientStore'
import { 
  User, 
  Building, 
  MapPin, 
  Calendar, 
  Globe, 
  Smartphone,
  Mail,
  Save,
  Edit,
  Lock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const ProfileTab = () => {
  const { t } = useTranslation()
  const { clientData, proposalData } = useClientStore()
  
  // Get store functions - with debug logging
  const saveProfile = useClientStore(state => state.saveProfile)
  
  // Debug: Log to see what functions are available
  useEffect(() => {
    const store = useClientStore.getState()
    console.log('Available store functions:', Object.keys(store).filter(key => typeof store[key] === 'function'))
    console.log('saveProfile function:', typeof saveProfile)
  }, [])
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({})
  const [hasChanges, setHasChanges] = useState(false)

  // Check if editing is allowed based on project status
  const canEdit = clientData?.project_status === 'draft' || clientData?.project_status === 'proposal'
  
  // Initialize form data with default values to avoid controlled/uncontrolled warning
  useEffect(() => {
    if (clientData) {
      const intake = proposalData?.client_intake || {}
      const defaultFormData = {
        // Basic client info - always provide defaults
        company_name: clientData.company_name || '',
        client_name: clientData.client_name || '', 
        email: clientData.email || '',
        whatsapp: clientData.whatsapp || '',
        phone: clientData.phone || '',
        island: clientData.island || '',
        
        // Business details - provide defaults
        business_type: intake.business_details?.business_type || '',
        years_in_operation: intake.business_details?.years_in_operation || '',
        business_registration: intake.business_details?.business_registration || '',
        target_monthly_bookings: intake.business_details?.target_monthly_bookings || '',
        average_tour_price: intake.business_details?.average_tour_price || '',
        peak_season_months: intake.business_details?.peak_season_months || '',
        
        // Current digital presence - provide defaults
        website_status: intake.current_digital_presence?.website || 'none',
        social_media: intake.current_digital_presence?.social_media || [],
        online_booking: intake.current_digital_presence?.online_booking || 'none',
        google_business: intake.current_digital_presence?.google_business || 'none',
        current_booking_volume: intake.current_digital_presence?.current_booking_volume || '',
        lost_booking_estimate: intake.current_digital_presence?.lost_booking_estimate || '',
        
        // Content materials - provide defaults
        professional_photos: intake.content_materials?.professional_photos || '',
        logo_status: intake.content_materials?.logo || '',
        business_description: intake.content_materials?.business_description || '',
        tour_descriptions: intake.content_materials?.tour_descriptions || ''
      }
      
      setFormData(defaultFormData)
    } else {
      // If no client data, set empty defaults
      const emptyFormData = {
        company_name: '', client_name: '', email: '', whatsapp: '', phone: '', island: '',
        business_type: '', years_in_operation: '', business_registration: '', 
        target_monthly_bookings: '', average_tour_price: '', peak_season_months: '',
        website_status: 'none', social_media: [], online_booking: 'none', 
        google_business: 'none', current_booking_volume: '', lost_booking_estimate: '',
        professional_photos: '', logo_status: '', business_description: '', tour_descriptions: ''
      }
      setFormData(emptyFormData)
    }
  }, [clientData, proposalData])

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!saveProfile) {
      console.error('❌ saveProfile function not available')
      alert(t('profile.errors.save_function_unavailable'))
      return
    }
    
    setIsSaving(true)
    try {
      console.log('💾 Saving profile data:', formData)
      await saveProfile(formData)
      setHasChanges(false)
      setIsEditing(false)
      
      // Show success message
      console.log('✅ Profile saved successfully')
      alert(t('profile.messages.save_success'))
    } catch (error) {
      console.error('❌ Failed to save profile:', error)
      alert(t('profile.errors.save_failed'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original values
    setIsEditing(false)
    setHasChanges(false)
    // Re-initialize form data
    // (useEffect will handle this)
  }

  const businessTypes = [
    t('profile.business_types.whale_watching'),
    t('profile.business_types.lagoon_excursions'), 
    t('profile.business_types.diving'),
    t('profile.business_types.cultural_tours'),
    t('profile.business_types.island_hopping'),
    t('profile.business_types.adventure_tours'),
    t('profile.business_types.other')
  ]

  const islands = [
    'Tahiti',
    'Moorea', 
    'Bora Bora',
    'Huahine',
    'Raiatea',
    'Taha\'a',
    'Rangiroa',
    t('profile.islands.other')
  ]

  const yearsOptions = [
    t('profile.years_options.startup'),
    t('profile.years_options.1_2_years'),
    t('profile.years_options.3_5_years'), 
    t('profile.years_options.5_plus_years')
  ]

  const websiteOptions = [
    { value: 'none', label: t('profile.website_options.none') },
    { value: 'basic', label: t('profile.website_options.basic') },
    { value: 'professional', label: t('profile.website_options.professional') }
  ]

  const photoOptions = [
    { value: '20+ available', label: t('profile.photo_options.20_plus') },
    { value: '10-20 available', label: t('profile.photo_options.10_20') },
    { value: '5-10 available', label: t('profile.photo_options.5_10') },
    { value: 'none', label: t('profile.photo_options.none') }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="vai-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-vai-coral" />
            <div>
              <h1 className="text-2xl font-bold text-vai-pearl">{t('profile.title')}</h1>
              <p className="text-vai-muted">{t('profile.subtitle')}</p>
            </div>
          </div>
          
          {/* Edit/Save Controls */}
          <div className="flex items-center gap-3">
            {canEdit ? (
              <>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="vai-button-secondary flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    {t('profile.actions.edit')}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCancel}
                      className="vai-button-ghost"
                      disabled={isSaving}
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!hasChanges || isSaving}
                      className="vai-button-primary flex items-center gap-2"
                    >
                      {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {isSaving ? t('profile.actions.saving') : t('profile.actions.save')}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-vai-muted">
                <Lock className="w-4 h-4" />
                <span className="text-sm">{t('profile.status.locked')}</span>
              </div>
            )}
          </div>
        </div>
        
        {!canEdit && (
          <div className="mt-4 p-3 bg-vai-sunset/10 rounded-lg border border-vai-sunset/20">
            <div className="flex items-center gap-2 text-vai-sunset">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{t('profile.messages.locked_explanation')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div className="vai-card">
        <h2 className="text-xl font-semibold text-vai-pearl mb-6 flex items-center gap-2">
          <Building className="w-5 h-5 text-vai-coral" />
          {t('profile.sections.basic_info')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-vai-muted mb-2">{t('profile.fields.company_name')} *</label>
            <input
              type="text"
              value={formData.company_name || ''}
              onChange={(e) => handleFieldChange('company_name', e.target.value)}
              disabled={!isEditing}
              className="vai-input"
              placeholder={t('profile.placeholders.company_name')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-vai-muted mb-2">{t('profile.fields.contact_person')} *</label>
            <input
              type="text"
              value={formData.client_name || ''}
              onChange={(e) => handleFieldChange('client_name', e.target.value)}
              disabled={!isEditing}
              className="vai-input"
              placeholder={t('profile.placeholders.contact_person')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-vai-muted mb-2">{t('profile.fields.email')} *</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              disabled={!isEditing}
              className="vai-input"
              placeholder={t('profile.placeholders.email')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-vai-muted mb-2">{t('profile.fields.whatsapp')}</label>
            <input
              type="tel"
              value={formData.whatsapp || ''}
              onChange={(e) => handleFieldChange('whatsapp', e.target.value)}
              disabled={!isEditing}
              className="vai-input"
              placeholder={t('profile.placeholders.phone')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-vai-muted mb-2">{t('profile.fields.phone')}</label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              disabled={!isEditing}
              className="vai-input"
              placeholder={t('profile.placeholders.phone')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-vai-muted mb-2">{t('profile.fields.primary_island')} *</label>
            <select
              value={formData.island || ''}
              onChange={(e) => handleFieldChange('island', e.target.value)}
              disabled={!isEditing}
              className="vai-input"
            >
              <option value="">{t('profile.placeholders.select_island')}</option>
              {islands.map(island => (
                <option key={island} value={island}>{island}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Business Details */}
      <div className="vai-card">
        <h2 className="text-xl font-semibold text-vai-pearl mb-6 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-vai-teal" />
          {t('profile.sections.business_details')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-vai-muted mb-2">{t('profile.fields.business_type')} *</label>
            <select
              value={formData.business_type || ''}
              onChange={(e) => handleFieldChange('business_type', e.target.value)}
              disabled={!isEditing}
              className="vai-input"
            >
              <option value="">{t('profile.placeholders.select_business_type')}</option>
              {businessTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-vai-muted mb-2">{t('profile.fields.years_operation')}</label>
            <select
              value={formData.years_in_operation || ''}
              onChange={(e) => handleFieldChange('years_in_operation', e.target.value)}
              disabled={!isEditing}
              className="vai-input"
            >
              <option value="">{t('profile.placeholders.select_experience')}</option>
              {yearsOptions.map(years => (
                <option key={years} value={years}>{years}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-vai-muted mb-2">{t('profile.fields.target_bookings')}</label>
            <input
              type="number"
              value={formData.target_monthly_bookings || ''}
              onChange={(e) => handleFieldChange('target_monthly_bookings', e.target.value)}
              disabled={!isEditing}
              className="vai-input"
              placeholder="20"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-vai-muted mb-2">{t('profile.fields.average_price')}</label>
            <input
              type="number"
              value={formData.average_tour_price || ''}
              onChange={(e) => handleFieldChange('average_tour_price', e.target.value)}
              disabled={!isEditing}
              className="vai-input"
              placeholder="15000"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-vai-muted mb-2">{t('profile.fields.peak_season')}</label>
            <input
              type="text"
              value={formData.peak_season_months || ''}
              onChange={(e) => handleFieldChange('peak_season_months', e.target.value)}
              disabled={!isEditing}
              className="vai-input"
              placeholder={t('profile.placeholders.peak_season')}
            />
          </div>
        </div>
      </div>

      {/* Current Digital Presence */}
      <div className="vai-card">
        <h2 className="text-xl font-semibold text-vai-pearl mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-vai-sunset" />
          {t('profile.sections.digital_presence')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-vai-muted mb-2">{t('profile.fields.website_status')}</label>
            <select
              value={formData.website_status || 'none'}
              onChange={(e) => handleFieldChange('website_status', e.target.value)}
              disabled={!isEditing}
              className="vai-input"
            >
              {websiteOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-vai-muted mb-2">{t('profile.fields.google_business')}</label>
            <select
              value={formData.google_business || 'none'}
              onChange={(e) => handleFieldChange('google_business', e.target.value)}
              disabled={!isEditing}
              className="vai-input"
            >
              <option value="none">{t('profile.google_options.none')}</option>
              <option value="basic">{t('profile.google_options.basic')}</option>
              <option value="optimized">{t('profile.google_options.optimized')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-vai-muted mb-2">{t('profile.fields.booking_volume')}</label>
            <input
              type="number"
              value={formData.current_booking_volume || ''}
              onChange={(e) => handleFieldChange('current_booking_volume', e.target.value)}
              disabled={!isEditing}
              className="vai-input"
              placeholder="10"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-vai-muted mb-2">{t('profile.fields.lost_bookings')}</label>
            <input
              type="number"
              value={formData.lost_booking_estimate || ''}
              onChange={(e) => handleFieldChange('lost_booking_estimate', e.target.value)}
              disabled={!isEditing}
              className="vai-input"
              placeholder="30"
            />
          </div>
        </div>
      </div>

      {/* Content Materials */}
      <div className="vai-card">
        <h2 className="text-xl font-semibold text-vai-pearl mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-vai-hibiscus" />
          {t('profile.sections.content_materials')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-vai-muted mb-2">{t('profile.fields.professional_photos')}</label>
            <select
              value={formData.professional_photos || ''}
              onChange={(e) => handleFieldChange('professional_photos', e.target.value)}
              disabled={!isEditing}
              className="vai-input"
            >
              <option value="">{t('profile.placeholders.select_photos')}</option>
              {photoOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-vai-muted mb-2">{t('profile.fields.logo_status')}</label>
            <select
              value={formData.logo_status || ''}
              onChange={(e) => handleFieldChange('logo_status', e.target.value)}
              disabled={!isEditing}
              className="vai-input"
            >
              <option value="">{t('profile.placeholders.select_logo')}</option>
              <option value="professional">{t('profile.logo_options.professional')}</option>
              <option value="basic">{t('profile.logo_options.basic')}</option>
              <option value="none">{t('profile.logo_options.none')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-vai-muted mb-2">{t('profile.fields.business_description')}</label>
            <select
              value={formData.business_description || ''}
              onChange={(e) => handleFieldChange('business_description', e.target.value)}
              disabled={!isEditing}
              className="vai-input"
            >
              <option value="">{t('profile.placeholders.select_description')}</option>
              <option value="ready">{t('profile.description_options.ready')}</option>
              <option value="draft available">{t('profile.description_options.draft')}</option>
              <option value="need help writing">{t('profile.description_options.need_help')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-vai-muted mb-2">{t('profile.fields.tour_descriptions')}</label>
            <select
              value={formData.tour_descriptions || ''}
              onChange={(e) => handleFieldChange('tour_descriptions', e.target.value)}
              disabled={!isEditing}
              className="vai-input"
            >
              <option value="">{t('profile.placeholders.select_tour_descriptions')}</option>
              <option value="detailed">{t('profile.tour_options.detailed')}</option>
              <option value="basic">{t('profile.tour_options.basic')}</option>
              <option value="need creation">{t('profile.tour_options.need_creation')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Profile Completion Status */}
      <div className="vai-card bg-gradient-to-br from-vai-coral/10 to-vai-teal/10 border-vai-coral/20">
        <h2 className="text-xl font-semibold text-vai-pearl mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-vai-coral" />
          {t('profile.completion.title')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-vai-coral mb-1">85%</div>
            <div className="text-sm text-vai-muted">{t('profile.completion.overall')}</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-vai-teal mb-1">12</div>
            <div className="text-sm text-vai-muted">{t('profile.completion.completed')}</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-vai-sunset mb-1">3</div>
            <div className="text-sm text-vai-muted">{t('profile.completion.remaining')}</div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="vai-progress-bar h-3">
            <div className="vai-progress-fill" style={{ width: '85%' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileTab