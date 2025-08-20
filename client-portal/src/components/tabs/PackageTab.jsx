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
      name: 'Dual Payment Gateway',
      description: 'Accept both PayZen and PayPal payments',
      cost: 15000,
      icon: CreditCard,
      category: 'payment'
    },
    {
      id: 'enhanced_design',
      name: 'Enhanced Design Package',
      description: 'Premium visual design and custom branding',
      cost: 35000,
      icon: Package,
      category: 'design'
    },
    {
      id: 'advanced_seo',
      name: 'Advanced SEO Package', 
      description: 'Professional SEO optimization and content strategy',
      cost: 25000,
      icon: Calculator,
      category: 'marketing'
    },
    {
      id: 'social_media',
      name: 'Social Media Setup',
      description: 'Professional social media profiles and content',
      cost: 15000,
      icon: Star,
      category: 'marketing'
    },
    {
      id: 'email_marketing',
      name: 'Email Marketing System',
      description: 'Automated email campaigns and newsletters',
      cost: 20000,
      icon: Calendar,
      category: 'marketing'
    },
    {
      id: 'analytics_dashboard',
      name: 'Advanced Analytics Dashboard',
      description: 'Detailed analytics and reporting tools',
      cost: 25000,
      icon: Calculator,
      category: 'analytics'
    }
  ]

  // Package deals
  const packageDeals = [
    {
      id: 'growth_package',
      name: 'Growth Package',
      description: 'SEO + Social Media + Email Marketing',
      services: ['advanced_seo', 'social_media', 'email_marketing'],
      regular_price: 60000,
      package_price: 55000,
      savings: 5000
    },
    {
      id: 'premium_package', 
      name: 'Premium Package',
      description: 'Enhanced Design + Analytics + Advanced SEO',
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
        // Add addon
        const addonInfo = availableAddOns.find(addon => addon.id === addonId)
        newAddOns = [...addOns, {
          id: addonId,
          name: addonInfo.name,
          cost: addonInfo.cost,
          selected: true
        }]
      }
      
      const newConfig = { ...prev, add_ons: newAddOns }
      setHasChanges(true)
      return newConfig
    })
  }

  const handlePackageDealToggle = (dealId) => {
    if (!canEdit) return
    
    setPackageConfig(prev => {
      const packageDeals = prev.package_deals || []
      const existingIndex = packageDeals.findIndex(deal => deal.id === dealId)
      
      if (existingIndex >= 0) {
        // Remove package deal and individual add-ons
        const deal = packageDeals[existingIndex]
        const newPackageDeals = packageDeals.filter(d => d.id !== dealId)
        const newAddOns = (prev.add_ons || []).filter(addon => 
          !deal.services.includes(addon.id)
        )
        
        setHasChanges(true)
        return { ...prev, package_deals: newPackageDeals, add_ons: newAddOns }
      } else {
        // Add package deal and remove individual add-ons if they exist
        const dealInfo = packageDeals.find(deal => deal.id === dealId)
        const newPackageDeals = [...packageDeals, {
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

  const calculatePricing = () => {
    setIsCalculating(true)
    
    // Simulate calculation delay
    setTimeout(() => {
      const baseCost = packageConfig.base_package?.cost || 250000
      const addonCost = (packageConfig.add_ons || []).reduce((sum, addon) => sum + addon.cost, 0)
      const packageDealCost = (packageConfig.package_deals || []).reduce((sum, deal) => sum + deal.cost, 0)
      const packageSavings = (packageConfig.package_deals || []).reduce((sum, deal) => sum + deal.savings, 0)
      
      const totalVaiCost = baseCost + addonCost + packageDealCost
      const externalCosts = packageConfig.external_costs?.payzen || 35000
      const totalInvestment = totalVaiCost + externalCosts
      const monthlyOperating = 5400
      
      // Simple ROI calculation
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

  const handleSave = async () => {
    if (!savePackageConfig) {
      console.error('❌ savePackageConfig function not available')
      alert('Error: Save function not available. Please refresh the page.')
      return
    }
    
    setIsSaving(true)
    try {
      console.log('💾 Saving package configuration:', packageConfig)
      await savePackageConfig(packageConfig, calculatedPricing)
      setHasChanges(false)
      console.log('✅ Package configuration saved')
      alert('Package configuration saved successfully!')
    } catch (error) {
      console.error('❌ Failed to save package configuration:', error)
      alert('Failed to save package configuration. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!submitConfiguration) {
      console.error('❌ submitConfiguration function not available')
      alert('Error: Submit function not available. Please refresh the page.')
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
      
      alert('Configuration submitted successfully! VAI Studio will review your selections and contact you soon.')
    } catch (error) {
      console.error('❌ Failed to submit configuration:', error)
      alert('Failed to submit configuration. Please try again.')
    }
  }

  const isAddonSelected = (addonId) => {
    return (packageConfig.add_ons || []).some(addon => addon.id === addonId) ||
           (packageConfig.package_deals || []).some(deal => deal.services.includes(addonId))
  }

  const isPackageDealSelected = (dealId) => {
    return (packageConfig.package_deals || []).some(deal => deal.id === dealId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="vai-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-vai-sunset" />
            <div>
              <h1 className="text-2xl font-bold text-vai-pearl">Package Configuration</h1>
              <p className="text-vai-muted">Customize your digital transformation package</p>
            </div>
          </div>
          
          {!canEdit && (
            <div className="flex items-center gap-2 text-vai-muted">
              <Lock className="w-4 h-4" />
              <span className="text-sm">Configuration locked</span>
            </div>
          )}
        </div>
        
        {!canEdit && (
          <div className="mt-4 p-3 bg-vai-sunset/10 rounded-lg border border-vai-sunset/20">
            <div className="flex items-center gap-2 text-vai-sunset">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Your package configuration is locked because it has been submitted. Contact VAI Studio if you need to make changes.</span>
            </div>
          </div>
        )}
      </div>

      {/* Base Package */}
      <div className="vai-card">
        <h2 className="text-xl font-semibold text-vai-pearl mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-vai-bamboo" />
          Smart Setup Package (Base)
        </h2>
        
        <div className="p-4 bg-vai-bamboo/10 rounded-lg border border-vai-bamboo/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-vai-pearl">Complete Digital Foundation</h3>
              <p className="text-vai-muted">Everything you need for professional online presence</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-vai-bamboo">{formatCurrency(250000)}</div>
              <div className="text-sm text-vai-muted">Always included</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-vai-muted">
              <CheckCircle className="w-4 h-4 text-vai-bamboo" />
              Professional bilingual website
            </div>
            <div className="flex items-center gap-2 text-vai-muted">
              <CheckCircle className="w-4 h-4 text-vai-bamboo" />
              Integrated booking system
            </div>
            <div className="flex items-center gap-2 text-vai-muted">
              <CheckCircle className="w-4 h-4 text-vai-bamboo" />
              Payment gateway setup
            </div>
            <div className="flex items-center gap-2 text-vai-muted">
              <CheckCircle className="w-4 h-4 text-vai-bamboo" />
              Google Business optimization
            </div>
            <div className="flex items-center gap-2 text-vai-muted">
              <CheckCircle className="w-4 h-4 text-vai-bamboo" />
              3 platform listings
            </div>
            <div className="flex items-center gap-2 text-vai-muted">
              <CheckCircle className="w-4 h-4 text-vai-bamboo" />
              Training & documentation
            </div>
          </div>
        </div>
      </div>

      {/* Package Deals */}
      <div className="vai-card">
        <h2 className="text-xl font-semibold text-vai-pearl mb-6 flex items-center gap-2">
          <Star className="w-5 h-5 text-vai-hibiscus" />
          Package Deals (Save Money!)
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
                  Save {formatCurrency(deal.savings)}
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

      {/* Individual Add-Ons */}
      <div className="vai-card">
        <h2 className="text-xl font-semibold text-vai-pearl mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-vai-coral" />
          Additional Services
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableAddOns.map(addon => {
            const Icon = addon.icon
            const isSelected = isAddonSelected(addon.id)
            const isInPackageDeal = (packageConfig.package_deals || []).some(deal => 
              deal.services.includes(addon.id)
            )
            
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
                          <div className="text-xs text-vai-hibiscus">In package deal</div>
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

      {/* Action Buttons */}
      {canEdit && (
        <div className="vai-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-vai-muted">
              <Info className="w-4 h-4" />
              <span className="text-sm">Save your configuration or submit for review when ready</span>
            </div>
            
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
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </button>
              
              <button
                onClick={handleSubmit}
                className="vai-button-primary flex items-center gap-2"
                disabled={!calculatedPricing}
              >
                <Send className="w-4 h-4" />
                Submit for Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PackageTab