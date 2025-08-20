import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useClientStore } from '../../store/clientStore'
import { 
  Package, 
  Calculator, 
  CheckCircle, 
  DollarSign,
  CreditCard,
  Calendar,
  Plus,
  Minus,
  Star,
  Save,
  Send,
  Lock,
  AlertCircle,
  Info
} from 'lucide-react'
import SelectedItemsSummary from '../ui/SelectedItemsSummary'

const getPricingConfig = (proposalData) => {
  // Get pricing config from database, with fallbacks to worksheet values
  const config = proposalData?.pricing_config || {}
  
  return {
    base_package: config.base_package || {
      cost: 250000,
      name: "Smart Setup Package",
      description: "Complete Digital Foundation"
    },
    add_on_services: config.add_on_services || {
      dual_payment: { cost: 15000, name: "Dual Payment Gateway", description: "Accept both PayZen and PayPal payments" },
      enhanced_design: { cost: 35000, name: "Enhanced Design Package", description: "Premium visual design and custom branding" },
      advanced_seo: { cost: 25000, name: "Advanced SEO Package", description: "Professional SEO optimization and content strategy" },
      social_media: { cost: 15000, name: "Social Media Setup", description: "Professional social media profiles and content" },
      email_marketing: { cost: 20000, name: "Email Marketing System", description: "Automated email campaigns and newsletters" },
      analytics_dashboard: { cost: 25000, name: "Advanced Analytics Dashboard", description: "Detailed analytics and reporting tools" }
    },
    package_deals: config.package_deals || {
      growth_package: {
        services: ['advanced_seo', 'social_media', 'email_marketing'],
        regular_price: 60000,
        package_price: 55000,
        savings: 5000,
        name: "Growth Package",
        description: "SEO + Social Media + Email Marketing"
      },
      premium_package: {
        services: ['enhanced_design', 'analytics_dashboard', 'advanced_seo'],
        regular_price: 85000,
        package_price: 80000,
        savings: 5000,
        name: "Premium Package", 
        description: "Enhanced Design + Analytics + Advanced SEO"
      }
    },
    external_costs: config.external_costs || {
      payzen_setup: { average_cost: 35000 },
      paypal_setup: { cost: 0 },
      hosting_annual: { cost: 16800 },
      booking_system_annual: { cost: 48000 }
    },
    monthly_operating: config.monthly_operating || {
      hosting: 1400,
      booking_system: 4000,
      total: 5400
    }
  }
}

const PackageTab = () => {
  const { t } = useTranslation()
  const { clientData, proposalData } = useClientStore()
  
  // Get store functions
  const savePackageConfig = useClientStore(state => state.savePackageConfig)
  const submitConfiguration = useClientStore(state => state.submitConfiguration)
  const [packageConfig, setPackageConfig] = useState({})
  const [isCalculating, setIsCalculating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [calculatedPricing, setCalculatedPricing] = useState(null)

  // Check if editing is allowed
  const canEdit = clientData?.project_status === 'draft' || clientData?.project_status === 'proposal'
  
  // Initialize package configuration with defaults
  useEffect(() => {
    if (proposalData?.package_configuration) {
      setPackageConfig(proposalData.package_configuration)
      setCalculatedPricing(proposalData.calculated_pricing)
    } else {
      // Default configuration - always provide complete structure
      const defaultConfig = {
        base_package: { selected: true, cost: 250000 },
        add_ons: [],
        payment_gateway: { payzen: true, paypal: false, dual_gateway: false },
        platforms: ['tripadvisor', 'viator', 'getyourguide'],
        package_deals: [],
        external_costs: { payzen: 35000 }
      }
      setPackageConfig(defaultConfig)
    }
  }, [proposalData])

  const formatCurrency = (amount) => {
    if (!amount) return '0 F'
    return new Intl.NumberFormat('fr-PF', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' F'
  }

  // Available add-on services
  const availableAddOns = [
    {
      id: 'dual_payment',
      name: t('package.addons.dual_payment.name'),
      description: t('package.addons.dual_payment.description'),
      cost: 15000,
      icon: CreditCard,
      category: 'payment'
    },
    {
      id: 'enhanced_design',
      name: t('package.addons.enhanced_design.name'),
      description: t('package.addons.enhanced_design.description'),
      cost: 35000,
      icon: Package,
      category: 'design'
    },
    {
      id: 'advanced_seo',
      name: t('package.addons.advanced_seo.name'), 
      description: t('package.addons.advanced_seo.description'),
      cost: 25000,
      icon: Calculator,
      category: 'marketing'
    },
    {
      id: 'social_media',
      name: t('package.addons.social_media.name'),
      description: t('package.addons.social_media.description'),
      cost: 15000,
      icon: Star,
      category: 'marketing'
    },
    {
      id: 'email_marketing',
      name: t('package.addons.email_marketing.name'),
      description: t('package.addons.email_marketing.description'),
      cost: 20000,
      icon: Calendar,
      category: 'marketing'
    },
    {
      id: 'analytics_dashboard',
      name: t('package.addons.analytics_dashboard.name'),
      description: t('package.addons.analytics_dashboard.description'),
      cost: 25000,
      icon: Calculator,
      category: 'analytics'
    }
  ]

  // Package deals
  const packageDeals = [
    {
      id: 'growth_package',
      name: t('package.deals.growth.name'),
      description: t('package.deals.growth.description'),
      services: ['advanced_seo', 'social_media', 'email_marketing'],
      regular_price: 60000,
      package_price: 55000,
      savings: 5000
    },
    {
      id: 'premium_package', 
      name: t('package.deals.premium.name'),
      description: t('package.deals.premium.description'),
      services: ['enhanced_design', 'analytics_dashboard', 'advanced_seo'],
      regular_price: 85000,
      package_price: 80000,
      savings: 5000
    }
  ]

  const handleAddOnToggle = (addonId) => {
    if (!canEdit) return
    
    setPackageConfig(prev => {
      const addOns = prev.add_ons || []
      const existingIndex = addOns.findIndex(addon => addon.id === addonId)
      
      let newAddOns
      if (existingIndex >= 0) {
        // Remove addon
        newAddOns = addOns.filter(addon => addon.id !== addonId)
      } else {
        // Add addon - but check if it's not already in a package deal
        const isInPackageDeal = (prev.package_deals || []).some(deal => 
          deal.services.includes(addonId)
        )
        
        if (!isInPackageDeal) {
          const addonInfo = availableAddOns.find(addon => addon.id === addonId)
          newAddOns = [...addOns, {
            id: addonId,
            name: addonInfo.name,
            cost: addonInfo.cost,
            selected: true
          }]
        } else {
          // Don't add individual addon if it's part of a selected package deal
          newAddOns = addOns
        }
      }
      
      const newConfig = { ...prev, add_ons: newAddOns }
      setHasChanges(true)
      return newConfig
    })
  }

  const handlePackageDealToggle = (dealId) => {
    if (!canEdit) return
    
    setPackageConfig(prev => {
      const currentPackageDeals = prev.package_deals || []
      const existingIndex = currentPackageDeals.findIndex(deal => deal.id === dealId)
      
      if (existingIndex >= 0) {
        // Remove package deal - allow individual services to be selected again
        const newPackageDeals = currentPackageDeals.filter(d => d.id !== dealId)
        
        setHasChanges(true)
        return { ...prev, package_deals: newPackageDeals }
      } else {
        // Add package deal - remove individual add-ons that are included in this package
        const dealInfo = packageDeals.find(deal => deal.id === dealId)
        const newPackageDeals = [...currentPackageDeals, {
          id: dealId,
          name: dealInfo.name,
          cost: dealInfo.package_price,
          savings: dealInfo.savings,
          services: dealInfo.services
        }]
        
        // Remove individual add-ons that are part of this package
        const newAddOns = (prev.add_ons || []).filter(addon => 
          !dealInfo.services.includes(addon.id)
        )
        
        setHasChanges(true)
        return { ...prev, package_deals: newPackageDeals, add_ons: newAddOns }
      }
    })
  }

  // FIXED CALCULATION LOGIC
  const calculatePricing = () => {
    setIsCalculating(true)
    
    // Simulate calculation delay
    setTimeout(() => {
      const baseCost = packageConfig.base_package?.cost || 250000
      
      // Calculate add-on costs (only for standalone add-ons, not in package deals)
      const addonCost = (packageConfig.add_ons || []).reduce((sum, addon) => sum + addon.cost, 0)
      
      // Calculate package deal costs
      const packageDealCost = (packageConfig.package_deals || []).reduce((sum, deal) => sum + deal.cost, 0)
      
      // Calculate total savings from package deals
      const packageSavings = (packageConfig.package_deals || []).reduce((sum, deal) => sum + deal.savings, 0)
      
      // CORRECTED: No double counting, and savings are properly applied
      const totalVaiCost = baseCost + addonCost + packageDealCost // Package deals already have discounted prices
      
      // DYNAMIC external costs based on payment gateway selection
      let externalCosts = 0
      if (packageConfig.payment_gateway?.payzen) {
        externalCosts += 35000 // PayZen setup
      }
      if (packageConfig.payment_gateway?.paypal) {
        externalCosts += 25000 // PayPal setup (example)
      }
      if (packageConfig.payment_gateway?.dual_gateway) {
        externalCosts = 50000 // Both gateways with slight discount
      }
      
      // Fallback if no gateway selected
      if (externalCosts === 0) {
        externalCosts = 35000 // Default PayZen
      }
      
      const totalInvestment = totalVaiCost + externalCosts
      const monthlyOperating = 5400
      
      // ROI calculation
      const averageTourPrice = proposalData?.client_intake?.business_details?.average_tour_price || 15000
      const targetBookings = proposalData?.client_intake?.business_details?.target_monthly_bookings || 20
      const monthlyRevenue = averageTourPrice * targetBookings
      const monthlyProfit = monthlyRevenue - monthlyOperating
      const roiMonths = monthlyProfit > 0 ? Math.ceil(totalInvestment / monthlyProfit) : 0
      
      const pricing = {
        base_cost: baseCost,
        addon_cost: addonCost,
        package_deal_cost: packageDealCost,
        package_savings: packageSavings,
        total_vai_cost: totalVaiCost,
        external_costs: externalCosts,
        total_investment: totalInvestment,
        monthly_operating: monthlyOperating,
        roi_months: roiMonths,
        monthly_revenue: monthlyRevenue,
        monthly_profit: monthlyProfit
      }
      
      setCalculatedPricing(pricing)
      setIsCalculating(false)
    }, 800)
  }

  // Auto-calculate when package configuration changes
  useEffect(() => {
    if (packageConfig.base_package) {
      calculatePricing()
    }
  }, [packageConfig])

  const handleSave = async () => {
    if (!savePackageConfig) {
      console.error('❌ savePackageConfig function not available')
      alert(t('package.errors.save_function_unavailable'))
      return
    }
    
    setIsSaving(true)
    try {
      console.log('💾 Saving package configuration:', packageConfig)
      await savePackageConfig(packageConfig, calculatedPricing)
      setHasChanges(false)
      console.log('✅ Package configuration saved')
      alert(t('package.messages.save_success'))
    } catch (error) {
      console.error('❌ Failed to save package configuration:', error)
      alert(t('package.errors.save_failed'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!submitConfiguration) {
      console.error('❌ submitConfiguration function not available')
      alert(t('package.errors.submit_function_unavailable'))
      return
    }
    
    try {
      if (hasChanges) {
        // Save first if there are unsaved changes
        await handleSave()
      }
      
      console.log('📤 Submitting configuration...')
      await submitConfiguration()
      console.log('✅ Configuration submitted successfully')
      
      alert(t('package.messages.submit_success'))
    } catch (error) {
      console.error('❌ Failed to submit configuration:', error)
      alert(t('package.errors.submit_failed'))
    }
  }

  const isAddonSelected = (addonId) => {
    return (packageConfig.add_ons || []).some(addon => addon.id === addonId) ||
           (packageConfig.package_deals || []).some(deal => deal.services.includes(addonId))
  }

  const isPackageDealSelected = (dealId) => {
    return (packageConfig.package_deals || []).some(deal => deal.id === dealId)
  }

  const isAddonInPackageDeal = (addonId) => {
    return (packageConfig.package_deals || []).some(deal => deal.services.includes(addonId))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="vai-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-vai-sunset" />
            <div>
              <h1 className="text-2xl font-bold text-vai-pearl">{t('package.title')}</h1>
              <p className="text-vai-muted">{t('package.subtitle')}</p>
            </div>
          </div>
          
          {!canEdit && (
            <div className="flex items-center gap-2 text-vai-muted">
              <Lock className="w-4 h-4" />
              <span className="text-sm">{t('package.status.locked')}</span>
            </div>
          )}
        </div>
        
        {!canEdit && (
          <div className="mt-4 p-3 bg-vai-sunset/10 rounded-lg border border-vai-sunset/20">
            <div className="flex items-center gap-2 text-vai-sunset">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{t('package.messages.locked_explanation')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Base Package */}
      <div className="vai-card">
        <h2 className="text-xl font-semibold text-vai-pearl mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-vai-bamboo" />
          {t('package.base.title')}
        </h2>
        
        <div className="p-4 bg-vai-bamboo/10 rounded-lg border border-vai-bamboo/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-vai-pearl">{t('package.base.name')}</h3>
              <p className="text-vai-muted">{t('package.base.description')}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-vai-bamboo">{formatCurrency(250000)}</div>
              <div className="text-sm text-vai-muted">{t('package.base.always_included')}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-vai-muted">
              <CheckCircle className="w-4 h-4 text-vai-bamboo" />
              {t('package.base.features.website')}
            </div>
            <div className="flex items-center gap-2 text-vai-muted">
              <CheckCircle className="w-4 h-4 text-vai-bamboo" />
              {t('package.base.features.booking')}
            </div>
            <div className="flex items-center gap-2 text-vai-muted">
              <CheckCircle className="w-4 h-4 text-vai-bamboo" />
              {t('package.base.features.payment')}
            </div>
            <div className="flex items-center gap-2 text-vai-muted">
              <CheckCircle className="w-4 h-4 text-vai-bamboo" />
              {t('package.base.features.google')}
            </div>
            <div className="flex items-center gap-2 text-vai-muted">
              <CheckCircle className="w-4 h-4 text-vai-bamboo" />
              {t('package.base.features.platforms')}
            </div>
            <div className="flex items-center gap-2 text-vai-muted">
              <CheckCircle className="w-4 h-4 text-vai-bamboo" />
              {t('package.base.features.training')}
            </div>
          </div>
        </div>
      </div>

      {/* Package Deals - Show First */}
      <div className="vai-card">
        <h2 className="text-xl font-semibold text-vai-pearl mb-6 flex items-center gap-2">
          <Star className="w-5 h-5 text-vai-hibiscus" />
          {t('package.deals.title')} ({t('package.deals.save_money')})
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packageDeals.map(deal => (
            <div key={deal.id} className={`
              p-4 rounded-lg border-2 transition-all cursor-pointer relative
              ${isPackageDealSelected(deal.id) 
                ? 'border-vai-hibiscus bg-vai-hibiscus/10' 
                : 'border-slate-700/50 hover:border-slate-600'
              }
              ${!canEdit ? 'cursor-not-allowed opacity-75' : ''}
            `}
            onClick={() => canEdit && handlePackageDealToggle(deal.id)}
            >
              <div className="absolute top-2 right-2">
                <div className="bg-vai-sunset text-white text-xs px-2 py-1 rounded-full">
                  {t('package.deals.save')} {formatCurrency(deal.savings)}
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  isPackageDealSelected(deal.id) 
                    ? 'bg-vai-hibiscus border-vai-hibiscus' 
                    : 'border-slate-600'
                }`}>
                  {isPackageDealSelected(deal.id) && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <h3 className="font-semibold text-vai-pearl">{deal.name}</h3>
              </div>
              
              <p className="text-sm text-vai-muted mb-3">{deal.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-vai-muted">
                  <span className="line-through">{formatCurrency(deal.regular_price)}</span>
                  <span className="ml-2 text-vai-hibiscus font-semibold">{formatCurrency(deal.package_price)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Add-On Services */}
      <div className="vai-card">
        <h2 className="text-xl font-semibold text-vai-pearl mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-vai-coral" />
          {t('package.addons.title')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableAddOns.map(addon => {
            const Icon = addon.icon
            const isSelected = isAddonSelected(addon.id)
            const isInPackageDeal = isAddonInPackageDeal(addon.id)
            
            return (
              <div key={addon.id} className={`
                p-4 rounded-lg border-2 transition-all cursor-pointer
                ${isSelected 
                  ? 'border-vai-coral bg-vai-coral/10' 
                  : 'border-slate-700/50 hover:border-slate-600'
                }
                ${!canEdit || isInPackageDeal ? 'cursor-not-allowed opacity-75' : ''}
              `}
              onClick={() => canEdit && !isInPackageDeal && handleAddOnToggle(addon.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-vai-coral text-white' : 'bg-vai-coral/20 text-vai-coral'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-vai-pearl">{addon.name}</h3>
                      <div className="text-right">
                        <div className="font-semibold text-vai-pearl">{formatCurrency(addon.cost)}</div>
                        {isInPackageDeal && (
                          <div className="text-xs text-vai-hibiscus">{t('package.addons.in_package_deal')}</div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-vai-muted">{addon.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pricing Calculator */}
      {/*
      <div className="vai-card">
        <h2 className="text-xl font-semibold text-vai-pearl mb-6 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-vai-teal" />
          Investment Calculator
        </h2>
        
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={calculatePricing}
            disabled={isCalculating}
            className="vai-button-primary flex items-center gap-2"
          >
            {isCalculating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Calculator className="w-4 h-4" />
            )}
            {isCalculating ? 'Calculating...' : 'Calculate Pricing'}
          </button>
          
          <div className="text-sm text-vai-muted">
            Click to calculate your total investment based on selected options
          </div>
        </div>
        
        
        {calculatedPricing && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-vai-coral/10 rounded-lg border border-vai-coral/20 text-center">
              <div className="text-2xl font-bold text-vai-coral">{formatCurrency(calculatedPricing.total_vai_cost)}</div>
              <div className="text-sm text-vai-muted">VAI Studio Total</div>
            </div>
            
            <div className="p-4 bg-vai-sunset/10 rounded-lg border border-vai-sunset/20 text-center">
              <div className="text-2xl font-bold text-vai-sunset">{formatCurrency(calculatedPricing.external_costs)}</div>
              <div className="text-sm text-vai-muted">External Costs</div>
            </div>
            
            <div className="p-4 bg-vai-teal/10 rounded-lg border border-vai-teal/20 text-center">
              <div className="text-2xl font-bold text-vai-teal">{formatCurrency(calculatedPricing.total_investment)}</div>
              <div className="text-sm text-vai-muted">Total Investment</div>
            </div>
            
            <div className="p-4 bg-vai-hibiscus/10 rounded-lg border border-vai-hibiscus/20 text-center">
              <div className="text-2xl font-bold text-vai-hibiscus">{calculatedPricing.roi_months}</div>
              <div className="text-sm text-vai-muted">Months to ROI</div>
            </div>
          </div>
        )}
      </div>
      */}
      

      {/* Selected items summary */}
      <SelectedItemsSummary 
        packageConfig={packageConfig} 
        calculatedPricing={calculatedPricing} 
      />

      {/* Pricing Summary - Always Visible */}
      {calculatedPricing && (
        <div className="vai-card bg-gradient-to-br from-vai-hibiscus/10 to-vai-teal/10 border-vai-coral/20">
          <h2 className="text-xl font-semibold text-vai-pearl mb-6 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-vai-coral" />
            {t('package.pricing.title')}
          </h2>
          
          {/*<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"> */}
          <div className="grid grid-cols-1"> 
            <div className="p-4 bg-vai-coral/10 rounded-lg border border-vai-coral/20 text-center">
              <div className="text-2xl font-bold text-vai-coral">{formatCurrency(calculatedPricing.total_vai_cost)}</div>
              <div className="text-sm text-vai-muted">{t('package.pricing.vai_total')}</div>
            </div>
            
            {/*
            <div className="p-4 bg-vai-sunset/10 rounded-lg border border-vai-sunset/20 text-center">
              <div className="text-2xl font-bold text-vai-sunset">{formatCurrency(calculatedPricing.external_costs)}</div>
              <div className="text-sm text-vai-muted">{t('package.pricing.external_costs')}</div>
            </div>

            <div className="p-4 bg-vai-teal/10 rounded-lg border border-vai-teal/20 text-center">
              <div className="text-2xl font-bold text-vai-teal">{formatCurrency(calculatedPricing.total_investment)}</div>
              <div className="text-sm text-vai-muted">{t('package.pricing.total_investment')}</div>
            </div>
            
            
            <div className="p-4 bg-vai-hibiscus/10 rounded-lg border border-vai-hibiscus/20 text-center">
              <div className="text-2xl font-bold text-vai-hibiscus">{calculatedPricing.roi_months}</div>
              <div className="text-sm text-vai-muted">{t('package.pricing.roi_months')}</div>
            </div>
            */}

          </div>
          

          {/* Detailed Breakdown */}
          <div className="mt-6 p-4 bg-vai-lagoon/30 rounded-lg">
            <h3 className="font-semibold text-vai-pearl mb-3">{t('package.pricing.breakdown')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-vai-muted">{t('package.pricing.base_package')}</span>
                <span className="text-vai-pearl">{formatCurrency(calculatedPricing.base_cost)}</span>
              </div>
              
              {calculatedPricing.addon_cost > 0 && (
                <div className="flex justify-between">
                  <span className="text-vai-muted">{t('package.pricing.individual_addons')}</span>
                  <span className="text-vai-pearl">{formatCurrency(calculatedPricing.addon_cost)}</span>
                </div>
              )}
              
              {calculatedPricing.package_deal_cost > 0 && (
                <div className="flex justify-between">
                  <span className="text-vai-muted">{t('package.pricing.package_deals')}</span>
                  <span className="text-vai-pearl">{formatCurrency(calculatedPricing.package_deal_cost)}</span>
                </div>
              )}
              
              {calculatedPricing.package_savings > 0 && (
                <div className="flex justify-between text-vai-bamboo">
                  <span>{t('package.pricing.total_savings')}</span>
                  <span>-{formatCurrency(calculatedPricing.package_savings)}</span>
                </div>
              )}
              
              <div className="border-t border-vai-muted/20 pt-2 flex justify-between font-semibold">
                <span className="text-vai-pearl">{t('package.pricing.subtotal')}</span>
                <span className="text-vai-coral">{formatCurrency(calculatedPricing.total_vai_cost)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {canEdit && (
        <div className="vai-card">
          <div className="flex items-center justify-center">
            {/*
            <div className="flex items-center gap-2 text-vai-muted">
              <Info className="w-4 h-4" />
              <span className="text-sm">{t('package.actions.instruction')}</span>
            </div>
            */}
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="vai-button-secondary flex items-center gap-2"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? t('package.actions.saving') : t('package.actions.save')}
              </button>
              
              <button
                onClick={handleSubmit}
                className="vai-button-primary flex items-center gap-2"
                disabled={!calculatedPricing}
              >
                <Send className="w-4 h-4" />
                {t('package.actions.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PackageTab