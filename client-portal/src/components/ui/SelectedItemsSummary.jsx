import { useTranslation } from 'react-i18next'
import { CheckCircle, Package, Tag, Calculator, Star } from 'lucide-react'

const SelectedItemsSummary = ({ packageConfig, calculatedPricing }) => {
  const { t } = useTranslation()
  
  const formatCurrency = (amount) => {
    if (!amount) return '0 F'
    return new Intl.NumberFormat('fr-PF', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' F'
  }

  const hasSelections = () => {
    return (packageConfig.add_ons?.length > 0) || 
           (packageConfig.package_deals?.length > 0)
  }

  if (!hasSelections()) {
    return (
      <div className="vai-card">
        <h3 className="text-lg font-semibold text-vai-pearl mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-vai-coral" />
          {t('package.selected_items.title')}
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-vai-lagoon/30 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-vai-muted" />
          </div>
          <p className="text-vai-muted">{t('package.selected_items.none_selected')}</p>
          <p className="text-sm text-vai-muted mt-2">
            {t('package.selected_items.selection_hint')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="vai-card">
      <h3 className="text-lg font-semibold text-vai-pearl mb-6 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-vai-bamboo" />
        {t('package.selected_items.title')}
      </h3>
      
      <div className="space-y-6">
        {/* Base Package - Always Shown */}
        <div className="p-4 bg-vai-coral/10 rounded-lg border border-vai-coral/20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-vai-pearl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-vai-bamboo" />
              {t('package.selected_items.base_package')}
            </h4>
            <span className="font-bold text-vai-coral">{formatCurrency(250000)}</span>
          </div>
          <p className="text-sm text-vai-muted">
            {t('package.selected_items.base_description')}
          </p>
        </div>

        {/* Package Deals - Show First (Higher Value) */}
        {packageConfig.package_deals?.length > 0 && (
          <div>
            <h4 className="font-medium text-vai-pearl mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-vai-hibiscus" />
              {t('package.selected_items.package_deals')} ({packageConfig.package_deals.length})
            </h4>
            <div className="space-y-3">
              {packageConfig.package_deals.map((deal, index) => (
                <div key={index} className="p-4 bg-vai-hibiscus/10 rounded-lg border border-vai-hibiscus/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-vai-bamboo" />
                      <span className="font-semibold text-vai-pearl">{deal.name}</span>
                      <span className="text-xs bg-vai-sunset text-white px-2 py-1 rounded-full">
                        {t('package.selected_items.savings_label')} {formatCurrency(deal.savings)}
                      </span>
                    </div>
                    <span className="font-bold text-vai-hibiscus">{formatCurrency(deal.cost)}</span>
                  </div>
                  <div className="text-sm text-vai-muted ml-7">
                    {t('package.selected_items.includes')}: {deal.services?.join(', ') || t('package.selected_items.not_specified')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Individual Add-on Services */}
        {packageConfig.add_ons?.length > 0 && (
          <div>
            <h4 className="font-medium text-vai-pearl mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-vai-sunset" />
              {t('package.selected_items.individual_addons')} ({packageConfig.add_ons.length})
            </h4>
            <div className="space-y-2">
              {packageConfig.add_ons.map((addon, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-vai-lagoon/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-vai-bamboo" />
                    <span className="text-vai-pearl">{addon.name}</span>
                  </div>
                  <span className="font-semibold text-vai-sunset">{formatCurrency(addon.cost)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Financial Summary */}
        {calculatedPricing && (
          <div className="p-4 bg-gradient-to-r from-vai-hibiscus/10 to-vai-coral/10 rounded-lg border border-vai-hibiscus/20">
            <h4 className="font-semibold text-vai-pearl mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-vai-hibiscus" />
              {t('package.selected_items.financial_summary')}
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-vai-muted">{t('package.selected_items.base_package')}</span>
                <span className="text-vai-pearl">{formatCurrency(calculatedPricing.base_cost)}</span>
              </div>
              
              {calculatedPricing.package_deal_cost > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-vai-muted">{t('package.selected_items.package_deals_cost')}</span>
                  <span className="text-vai-pearl">{formatCurrency(calculatedPricing.package_deal_cost)}</span>
                </div>
              )}
              
              {calculatedPricing.addon_cost > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-vai-muted">{t('package.selected_items.individual_addons_cost')}</span>
                  <span className="text-vai-pearl">{formatCurrency(calculatedPricing.addon_cost)}</span>
                </div>
              )}
              
              {calculatedPricing.package_savings > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-vai-bamboo">{t('package.selected_items.total_savings')}</span>
                  <span className="text-vai-bamboo font-semibold">-{formatCurrency(calculatedPricing.package_savings)}</span>
                </div>
              )}
              
              <div className="h-px bg-vai-muted/20 my-2"></div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-vai-muted">{t('package.selected_items.subtotal_vai')}</span>
                <span className="text-vai-pearl">{formatCurrency(calculatedPricing.total_vai_cost)}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-vai-muted">{t('package.selected_items.external_costs')}</span>
                <span className="text-vai-pearl">{formatCurrency(calculatedPricing.external_costs)}</span>
              </div>
              
              <div className="h-px bg-vai-coral/30 my-2"></div>
              
              <div className="flex items-center justify-between font-bold">
                <span className="text-vai-pearl">{t('package.selected_items.total_investment')}</span>
                <span className="text-vai-coral text-lg">{formatCurrency(calculatedPricing.total_investment)}</span>
              </div>
              
              {calculatedPricing.roi_months > 0 && (
                <div className="text-center pt-2">
                  <span className="text-sm text-vai-hibiscus">
                    {t('package.selected_items.roi_estimate', { months: calculatedPricing.roi_months })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Selection Benefits */}
        <div className="p-4 bg-vai-bamboo/10 rounded-lg border border-vai-bamboo/20">
          <h4 className="font-semibold text-vai-pearl mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-vai-bamboo" />
            {t('package.selected_items.benefits_title')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-vai-muted">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-vai-bamboo" />
              {t('package.selected_items.benefit_1')}
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-vai-bamboo" />
              {t('package.selected_items.benefit_2')}
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-vai-bamboo" />
              {t('package.selected_items.benefit_3')}
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-vai-bamboo" />
              {t('package.selected_items.benefit_4')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SelectedItemsSummary