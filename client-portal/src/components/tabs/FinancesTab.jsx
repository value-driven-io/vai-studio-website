import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useClientStore } from '../../store/clientStore'
import { 
  DollarSign, 
  Calculator, 
  TrendingUp, 
  CreditCard,
  Building,
  Calendar,
  Star,
  ArrowRight,
  Info, 
  Globe
} from 'lucide-react'

// GET PRICING CONFIGURATION FROM DATABASE WITH FALLBACKS
const getPricingConfigForFinances = (proposalData) => {
  const config = proposalData?.pricing_config || {}
  
  return {
    monthly_operating: config.monthly_operating || {
      hosting: 1400,
      booking_system: 4000,
      total: 5400
    },
    external_costs: config.external_costs || {
      payzen_setup: { average_cost: 35000 },
      hosting_annual: { cost: 16800 },
      booking_system_annual: { cost: 48000 }
    },
    base_package: config.base_package || {
      cost: 250000
    }
  }
}

const FinancesTab = () => {
  const { t } = useTranslation()
  const { clientData, proposalData } = useClientStore()
  const [selectedPaymentOption, setSelectedPaymentOption] = useState('split')
  
  // GET PRICING CONFIGURATION FROM DATABASE
  const pricingConfig = getPricingConfigForFinances(proposalData)
  
  const [roiData, setRoiData] = useState({
    averageTourPrice: proposalData?.client_intake?.business_details?.average_tour_price || 15000,
    targetMonthlyBookings: proposalData?.client_intake?.business_details?.target_monthly_bookings || 20,
    currentMonthlyBookings: proposalData?.client_intake?.business_details?.current_monthly_bookings || 0
  })

  const formatCurrency = (amount) => {
    if (!amount) return '0 F'
    return new Intl.NumberFormat('fr-PF', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' F'
  }

  // GET FINANCIAL DATA FROM DATABASE WITH PRIORITY ORDER
  const totalInvestment = clientData?.total_investment_xpf || 
                         proposalData?.calculated_pricing?.total_investment || 
                         pricingConfig.base_package.cost // USE DATABASE CONFIG FALLBACK
  
  // USE DATABASE VALUE FOR MONTHLY OPERATING COSTS
  const monthlyOperating = clientData?.monthly_costs_xpf || 
                          proposalData?.calculated_pricing?.monthly_operating ||
                          pricingConfig.monthly_operating.total

  // GET EXTERNAL COSTS FROM DATABASE CONFIGURATION  
  const externalCosts = proposalData?.calculated_pricing?.external_costs || 
                       proposalData?.pricing?.external_costs || 
                       pricingConfig.external_costs.payzen_setup.average_cost
  
  // Calculate payment options with safety checks
  const paymentOptions = useMemo(() => ({
    full: {
      amount: totalInvestment,
      discount: 0,
      label: t('finances.payment.full_payment')
    },
    split: {
      deposit: Math.floor(totalInvestment * 0.5),
      final: Math.ceil(totalInvestment * 0.5),
      label: t('finances.payment.split_payment'),
      recommended: true
    }
  }), [totalInvestment, t])

  // MONTHLY COST BREAKDOWN USING DATABASE VALUES
  const monthlyBreakdown = useMemo(() => [
    {
      name: t('finances.monthly.hosting'),
      cost: pricingConfig.monthly_operating.hosting, // FROM DATABASE
      description: 'Hébergement web professionnel & nom de domaine'
    },
    {
      name: t('finances.monthly.booking_system'),
      cost: pricingConfig.monthly_operating.booking_system, // FROM DATABASE
      description: 'JotForm Professional pour réservations en ligne'
    }
  ], [t, pricingConfig])

  // ROI calculations using database monthly operating costs
  const roi = useMemo(() => {
    const monthlyRevenue = roiData.averageTourPrice * roiData.targetMonthlyBookings
    const monthlyProfit = monthlyRevenue - monthlyOperating // USE DATABASE VALUE
    const breakEvenMonths = monthlyProfit > 0 ? Math.ceil(totalInvestment / monthlyProfit) : 0
    const directBookingsNeeded = roiData.averageTourPrice > 0 ? 
      Math.ceil(monthlyOperating / roiData.averageTourPrice) : 0

    return {
      monthlyRevenue,
      monthlyProfit,
      breakEvenMonths,
      directBookingsNeeded
    }
  }, [roiData, monthlyOperating, totalInvestment]) // USE DATABASE monthlyOperating

  // GET INVESTMENT BREAKDOWN WITH DATABASE FALLBACKS
  const getInvestmentBreakdown = () => {
    const pricingData = proposalData?.calculated_pricing || {}
    return {
      // USE DATABASE VALUES WITH PRICING CONFIG FALLBACKS
      baseCost: pricingData.base_cost || pricingConfig.base_package.cost,
      addonCost: pricingData.addon_cost || 0,
      packageDealCost: pricingData.package_deal_cost || 0,
      packageSavings: pricingData.package_savings || 0,
      totalVaiCost: pricingData.total_vai_cost || pricingConfig.base_package.cost,
      externalCosts: pricingData.external_costs || pricingConfig.external_costs.payzen_setup.average_cost
    }
  }

  const breakdown = getInvestmentBreakdown()

  return (
    <div className="space-y-6">
      {/* Investment Breakdown */}
      <div className="vai-card">
        <h2 className="text-xl font-semibold text-vai-pearl mb-6 flex items-center gap-2">
          <Building className="w-5 h-5 text-vai-coral" />
          {t('finances.investment.title')}
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-700/30">
            <span className="text-vai-pearl">{t('finances.investment.base')}</span>
            <span className="font-semibold text-vai-pearl">{formatCurrency(breakdown.baseCost)}</span>
          </div>
          
          {breakdown.addonCost > 0 && (
            <div className="flex items-center justify-between py-3 border-b border-slate-700/30">
              <span className="text-vai-pearl">{t('finances.investment.addons')}</span>
              <span className="font-semibold text-vai-pearl">{formatCurrency(breakdown.addonCost)}</span>
            </div>
          )}

          {breakdown.packageDealCost > 0 && (
            <div className="flex items-center justify-between py-3 border-b border-slate-700/30">
              <span className="text-vai-pearl">Packages groupés</span>
              <span className="font-semibold text-vai-pearl">{formatCurrency(breakdown.packageDealCost)}</span>
            </div>
          )}

          {breakdown.packageSavings > 0 && (
            <div className="flex items-center justify-between py-3 border-b border-slate-700/30">
              <span className="text-vai-bamboo">Économies totales</span>
              <span className="font-semibold text-vai-bamboo">-{formatCurrency(breakdown.packageSavings)}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between py-3 font-bold text-lg border-t-2 border-vai-coral/30">
            <span className="text-vai-pearl">{t('finances.investment.total')}</span>
            <span className="text-vai-coral">{formatCurrency(totalInvestment)}</span>
          </div>
        </div>

        {/* External costs */}
        {typeof externalCosts === 'object' && Object.keys(externalCosts).length > 0 && (
          <div className="mt-6 p-4 bg-vai-lagoon/30 rounded-lg">
            <h3 className="font-semibold text-vai-pearl mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-vai-muted" />
              {t('finances.investment.external')}
            </h3>
            <div className="space-y-2">
              {Object.entries(externalCosts).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-vai-muted capitalize">{key} setup</span>
                  <span className="text-vai-pearl">{formatCurrency(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payment Options */}
      <div className="vai-card">
        <h2 className="text-xl font-semibold text-vai-pearl mb-6 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-vai-teal" />
          {t('finances.payment.title')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full payment option */}
          <div 
            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
              selectedPaymentOption === 'full' 
                ? 'bg-vai-coral/10 border-vai-coral'
                : 'bg-vai-lagoon/20 border-slate-600 hover:border-slate-500'
            }`}
            onClick={() => setSelectedPaymentOption('full')}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-vai-pearl">{paymentOptions.full.label}</h3>
              <div className={`w-4 h-4 rounded-full border-2 ${
                selectedPaymentOption === 'full' 
                  ? 'bg-vai-coral border-vai-coral' 
                  : 'border-slate-600'
              }`} />
            </div>
            <div className="text-2xl font-bold text-vai-coral mb-2">
              {formatCurrency(paymentOptions.full.amount)}
            </div>
            <p className="text-sm text-vai-muted">Paiement intégral à la signature</p>
          </div>

          {/* Split payment option */}
          <div 
            className={`p-4 rounded-lg border-2 transition-all cursor-pointer relative ${
              selectedPaymentOption === 'split' 
                ? 'bg-vai-teal/10 border-vai-teal'
                : 'bg-vai-lagoon/20 border-slate-600 hover:border-slate-500'
            }`}
            onClick={() => setSelectedPaymentOption('split')}
          >
            {paymentOptions.split.recommended && (
              <div className="absolute -top-2 left-4 bg-vai-bamboo text-vai-deep-ocean px-2 py-1 rounded text-xs font-bold">
                {t('finances.payment.recommended')}
              </div>
            )}
            
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-vai-pearl">{paymentOptions.split.label}</h3>
              <div className={`w-4 h-4 rounded-full border-2 ${
                selectedPaymentOption === 'split' 
                  ? 'bg-vai-teal border-vai-teal' 
                  : 'border-slate-600'
              }`} />
            </div>
            
            <div className="space-y-2 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-vai-muted">{t('finances.payment.deposit')}</span>
                <span className="font-semibold text-vai-pearl">
                  {formatCurrency(paymentOptions.split.deposit)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-vai-muted">{t('finances.payment.final')}</span>
                <span className="font-semibold text-vai-pearl">
                  {formatCurrency(paymentOptions.split.final)}
                </span>
              </div>
            </div>
            <p className="text-sm text-vai-muted">50% au démarrage, 50% à la livraison</p>
          </div>
        </div>
      </div>

      {/* Monthly Operating Costs */}
      {/*
      <div className="vai-card">
        <h2 className="text-xl font-semibold text-vai-pearl mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-vai-bamboo" />
          {t('finances.monthly.title')}
        </h2>
        
        <div className="space-y-4">
          {monthlyBreakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-slate-700/30">
              <div>
                <h3 className="font-medium text-vai-pearl">{item.name}</h3>
                <p className="text-sm text-vai-muted">{item.description}</p>
              </div>
              <span className="font-semibold text-vai-pearl">{formatCurrency(item.cost)}</span>
            </div>
          ))}
          
          <div className="flex items-center justify-between py-3 font-bold text-lg border-t-2 border-vai-bamboo/30">
            <span className="text-vai-pearl">{t('finances.monthly.total')}</span>
            <span className="text-vai-bamboo">{formatCurrency(monthlyOperating)}</span>
          </div>
        </div>
      </div>
      */}

      {/* External Cost Estimator - Info Box */}
        <div className="vai-card">
          <h2 className="text-xl font-semibold text-vai-pearl mb-6 flex items-center gap-2">
            <Info className="w-5 h-5 text-vai-sunset" />
            {t('finances.external.title')}
          </h2>
          
          <div className="space-y-6">
            {/* Payment Gateway Setup */}
            <div>
              <h3 className="text-lg font-semibold text-vai-pearl mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-vai-coral" />
                {t('finances.external.payment_gateway.title')}
                <span className="text-xs bg-vai-coral/20 text-vai-coral px-2 py-1 rounded-full ml-2">
                  {t('finances.external.payment_gateway.client_pays')}
                </span>
              </h3>
              
              <div className="bg-vai-lagoon/30 rounded-lg p-4">
                {/*
                <div className="text-sm text-vai-sunset mb-3 font-medium">
                  {t('finances.external.payment_gateway.timing_note')}
                </div>
                */}
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-slate-700/30">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border border-slate-500 rounded"></div>
                      <span className="text-vai-pearl font-medium">PayZen Setup:</span>
                    </div>
                    <div className="text-right">
                      <div className="text-vai-pearl">20,000-49,900 F</div>
                      <div className="text-sm text-vai-muted">{t('finances.external.average')}: 35,000 F</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-slate-700/30">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border border-slate-500 rounded"></div>
                      <span className="text-vai-pearl font-medium">PayPal Setup:</span>
                    </div>
                    <div className="text-right">
                      <div className="text-vai-bamboo">0 F</div>
                      <div className="text-sm text-vai-muted">{t('finances.external.free')}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border border-slate-500 rounded"></div>
                      <span className="text-vai-pearl font-medium">{t('finances.external.dual_gateway')}:</span>
                    </div>
                    <div className="text-right">
                      <div className="text-vai-pearl">PayZen + 0 F</div>
                      <div className="text-sm text-vai-muted">{t('finances.external.recommended')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Domain & Hosting */}
            <div>
              <h3 className="text-lg font-semibold text-vai-pearl mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-vai-teal" />
                {t('finances.external.hosting.title')}
              </h3>
              
              <div className="bg-vai-teal/10 rounded-lg p-4 border border-vai-teal/20">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-vai-pearl font-medium">{t('finances.external.hosting.domain')}:</span>
                    <div className="text-right">
                      <div className="text-vai-teal">1,500 F/an</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-vai-pearl font-medium">{t('finances.external.hosting.hosting')}:</span>
                    <div className="text-right">
                      <div className="text-vai-teal">16,800 F/an</div>
                      <div className="text-sm text-vai-muted">(1,400 F/mois)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking System */}
            <div>
              <h3 className="text-lg font-semibold text-vai-pearl mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-vai-hibiscus" />
                {t('finances.external.booking.title')}
              </h3>
              
              <div className="bg-vai-hibiscus/10 rounded-lg p-4 border border-vai-hibiscus/20">
                <div className="flex items-center justify-between">
                  <span className="text-vai-pearl font-medium">{t('finances.external.booking.system')}:</span>
                  <div className="text-right">
                    <div className="text-vai-hibiscus">48,000 F/an</div>
                    <div className="text-sm text-vai-muted">(4,000 F/mois)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Note */}
            <div className="bg-gradient-to-r from-vai-sunset/10 to-vai-coral/10 rounded-lg p-4 border border-vai-sunset/20">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-vai-sunset flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-vai-pearl mb-2">{t('finances.external.summary.title')}</h4>
                  <p className="text-sm text-vai-muted leading-relaxed">
                    {t('finances.external.summary.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* ROI Calculator */}
      <div className="vai-card">
        <h2 className="text-xl font-semibold text-vai-pearl mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-vai-hibiscus" />
          {t('finances.roi.title')}
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ROI Metrics */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-vai-lagoon/30 rounded-lg">
                <h3 className="text-sm font-medium text-vai-muted mb-2">{t('finances.roi.breakeven')}</h3>
                <p className="text-xl font-bold text-vai-hibiscus">
                  {roi.breakEvenMonths > 0 ? `${roi.breakEvenMonths} ${t('finances.roi.months')}` : 'N/A'}
                </p>
              </div>
              
              <div className="p-4 bg-vai-lagoon/30 rounded-lg">
                <h3 className="text-sm font-medium text-vai-muted mb-2">{t('finances.roi.direct_bookings')}</h3>
                <p className="text-xl font-bold text-vai-coral">{roi.directBookingsNeeded}</p>
              </div>
              
              <div className="p-4 bg-vai-lagoon/30 rounded-lg">
                <h3 className="text-sm font-medium text-vai-muted mb-2">{t('finances.roi.monthly_revenue')}</h3>
                <p className="text-xl font-bold text-vai-bamboo">
                  {formatCurrency(roi.monthlyRevenue)}
                </p>
              </div>
              
              <div className="p-4 bg-vai-lagoon/30 rounded-lg">
                <h3 className="text-sm font-medium text-vai-muted mb-2">{t('finances.roi.monthly_profit')}</h3>
                <p className="text-xl font-bold text-vai-teal">
                  {formatCurrency(roi.monthlyProfit)}
                </p>
              </div>
            </div>

            {/* ROI Insights */}
            <div className="p-4 bg-gradient-to-r from-vai-hibiscus/10 to-vai-coral/10 rounded-lg border border-vai-hibiscus/20">
              <h3 className="font-semibold text-vai-pearl mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-vai-hibiscus" />
                Perspectives de rentabilité
              </h3>
              
              {roi.monthlyProfit > 0 ? (
                <div className="space-y-2 text-sm">
                  <p className="text-vai-pearl">
                    Avec {roiData.targetMonthlyBookings} réservations à {formatCurrency(roiData.averageTourPrice)} chacune:
                  </p>
                  <div className="flex items-center gap-2 text-vai-bamboo">
                    <ArrowRight className="w-4 h-4" />
                    <span>Profit mensuel: {formatCurrency(roi.monthlyProfit)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-vai-hibiscus">
                    <ArrowRight className="w-4 h-4" />
                    <span>Retour sur investissement en {roi.breakEvenMonths} mois</span>
                  </div>
                </div>
              ) : (
                <p className="text-vai-muted text-sm">
                  Ajustez vos paramètres pour voir les projections de rentabilité
                </p>
              )}
            </div>
          </div>

          {/* Quick Calculator */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-vai-muted mb-2">
                {t('finances.roi.average_price')}
              </label>
              <input
                type="number"
                value={roiData.averageTourPrice}
                onChange={(e) => setRoiData({...roiData, averageTourPrice: parseInt(e.target.value) || 0})}
                className="vai-input"
                placeholder="15000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-vai-muted mb-2">
                {t('finances.roi.target_bookings')}
              </label>
              <input
                type="number"
                value={roiData.targetMonthlyBookings}
                onChange={(e) => setRoiData({...roiData, targetMonthlyBookings: parseInt(e.target.value) || 0})}
                className="vai-input"
                placeholder="20"
              />
            </div>
            
            <button
              onClick={() => setRoiData({...roiData})} // Trigger re-calculation
              className="vai-button-primary w-full flex items-center justify-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              {t('finances.roi.calculate')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FinancesTab