import { useTranslation } from 'react-i18next'
import { CheckCircle, Package, Tag, Calculator } from 'lucide-react'

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
            Sélectionnez des services additionnels ou des packages groupés pour voir le résumé
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
        {/* Base Package */}
        <div className="p-4 bg-vai-coral/10 rounded-lg border border-vai-coral/20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-vai-pearl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-vai-bamboo" />
              {t('package.selected_items.base_package')}
            </h4>
            <span className="font-bold text-vai-coral">{formatCurrency(250000)}</span>
          </div>
          <p className="text-sm text-vai-muted">
            Site web professionnel + Système de réservation + Optimisation Google Business
          </p>
        </div>

        {/* Selected Add-ons */}
        {packageConfig.add_ons?.length > 0 && (
          <div>
            <h4 className="font-medium text-vai-pearl mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-vai-sunset" />
              {t('package.selected_items.addons')} ({packageConfig.add_ons.length})
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

        {/* Selected Package Deals */}
        {packageConfig.package_deals?.length > 0 && (
          <div>
            <h4 className="font-medium text-vai-pearl mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-vai-teal" />
              {t('package.selected_items.package_deals')} ({packageConfig.package_deals.length})
            </h4>
            <div className="space-y-2">
              {packageConfig.package_deals.map((deal, index) => (
                <div key={index} className="p-3 bg-vai-teal/10 rounded-lg border border-vai-teal/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-vai-bamboo" />
                      <span className="font-semibold text-vai-pearl">{deal.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-vai-teal">{formatCurrency(deal.cost)}</span>
                      {deal.savings > 0 && (
                        <div className="text-xs text-vai-bamboo">
                          Économies: {formatCurrency(deal.savings)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-vai-muted ml-7">
                    Services inclus: {deal.services?.join(', ') || 'Non spécifié'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Summary */}
        {calculatedPricing && (
          <div className="p-4 bg-gradient-to-r from-vai-hibiscus/10 to-vai-coral/10 rounded-lg border border-vai-hibiscus/20">
            <h4 className="font-semibold text-vai-pearl mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-vai-hibiscus" />
              Résumé Financier
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-vai-muted">Package de base</span>
                <span className="text-vai-pearl">{formatCurrency(calculatedPricing.base_cost)}</span>
              </div>
              
              {calculatedPricing.addon_cost > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-vai-muted">Services additionnels</span>
                  <span className="text-vai-pearl">{formatCurrency(calculatedPricing.addon_cost)}</span>
                </div>
              )}
              
              {calculatedPricing.package_deal_cost > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-vai-muted">Packages groupés</span>
                  <span className="text-vai-pearl">{formatCurrency(calculatedPricing.package_deal_cost)}</span>
                </div>
              )}
              
              {calculatedPricing.package_savings > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-vai-bamboo">Économies totales</span>
                  <span className="text-vai-bamboo">-{formatCurrency(calculatedPricing.package_savings)}</span>
                </div>
              )}
              
              <div className="h-px bg-vai-muted/20 my-2"></div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-vai-muted">Sous-total VAI Studio</span>
                <span className="text-vai-pearl">{formatCurrency(calculatedPricing.total_vai_cost)}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-vai-muted">Coûts externes</span>
                <span className="text-vai-pearl">{formatCurrency(calculatedPricing.external_costs)}</span>
              </div>
              
              <div className="h-px bg-vai-coral/30 my-2"></div>
              
              <div className="flex items-center justify-between font-bold">
                <span className="text-vai-pearl">Investissement Total</span>
                <span className="text-vai-coral text-lg">{formatCurrency(calculatedPricing.total_investment)}</span>
              </div>
              
              {calculatedPricing.roi_months > 0 && (
                <div className="text-center pt-2">
                  <span className="text-sm text-vai-hibiscus">
                    Retour sur investissement estimé: {calculatedPricing.roi_months} mois
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SelectedItemsSummary