import { useTranslation } from 'react-i18next'
import { useClientStore } from '../../store/clientStore'
import { 
  Package, 
  Globe, 
  Calendar, 
  CreditCard, 
  Search, 
  Users,
  CheckCircle,
  Plus
} from 'lucide-react'

const ScopeTab = () => {
  const { t } = useTranslation()
  const { clientData, proposalData } = useClientStore()

  const formatCurrency = (amount) => {
    if (!amount) return '0 F'
    return new Intl.NumberFormat('fr-PF', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' F'
  }

  // Base services included in every package
  const baseServices = [
    {
      icon: Globe,
      name: t('scope.services.website'),
      description: t('scope.services.website_desc'),
      cost: 180000,
      included: true,
      color: 'text-vai-coral'
    },
    {
      icon: Calendar,
      name: t('scope.services.booking'),
      description: t('scope.services.booking_desc'),
      cost: 25000,
      included: true,
      color: 'text-vai-teal'
    },
    {
      icon: CreditCard,
      name: t('scope.services.payment'),
      description: t('scope.services.payment_desc'),
      cost: 15000,
      included: true,
      color: 'text-vai-sunset'
    },
    {
      icon: Search,
      name: t('scope.services.google'),
      description: t('scope.services.google_desc'),
      cost: 10000,
      included: true,
      color: 'text-vai-hibiscus'
    },
    {
      icon: Users,
      name: t('scope.services.platforms'),
      description: t('scope.services.platforms_desc'),
      cost: 15000,
      included: true,
      color: 'text-vai-bamboo'
    }
  ]

  // Get add-on services from proposal data
  const getAddonServices = () => {
    if (!proposalData?.pricing?.add_ons) return []
    
    return proposalData.pricing.add_ons.map(addon => ({
      name: addon.name,
      description: addon.description,
      cost: addon.cost,
      included: true,
      color: 'text-vai-vanilla'
    }))
  }

  const addonServices = getAddonServices()
  const totalBaseCost = baseServices.reduce((sum, service) => sum + service.cost, 0)
  const totalAddonCost = addonServices.reduce((sum, service) => sum + service.cost, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="vai-card">
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-6 h-6 text-vai-coral" />
          <h1 className="text-2xl font-bold text-vai-pearl">
            {t('scope.title')}
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-vai-muted mb-2">Package sélectionné</h3>
            <p className="text-lg font-semibold text-vai-pearl">Smart Setup Package</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-vai-muted mb-2">Coût de base</h3>
            <p className="text-lg font-semibold text-vai-coral">
              {formatCurrency(totalBaseCost)}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-vai-muted mb-2">Services additionnels</h3>
            <p className="text-lg font-semibold text-vai-sunset">
              {formatCurrency(totalAddonCost)}
            </p>
          </div>
        </div>
      </div>

      {/* Base Package Services */}
      <div className="vai-card">
        <h2 className="text-xl font-semibold text-vai-pearl mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-vai-bamboo" />
          {t('scope.services.title')}
        </h2>
        
        <div className="grid gap-4">
          {baseServices.map((service, index) => {
            const Icon = service.icon
            
            return (
              <div key={index} className="flex items-start gap-4 p-4 bg-vai-lagoon/30 rounded-lg border border-slate-700/30">
                <div className={`p-2 rounded-lg bg-current/20 ${service.color}`}>
                  <Icon className={`w-5 h-5 ${service.color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-vai-pearl">{service.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-vai-muted">
                        {formatCurrency(service.cost)}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-vai-bamboo bg-vai-bamboo/20 px-2 py-1 rounded">
                        <CheckCircle className="w-3 h-3" />
                        {t('common.included')}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-vai-muted leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Package total */}
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-vai-pearl">Package de base - Total</span>
            <span className="text-xl font-bold text-vai-coral">
              {formatCurrency(totalBaseCost)}
            </span>
          </div>
        </div>
      </div>

      {/* Additional Services */}
      {addonServices.length > 0 ? (
        <div className="vai-card">
          <h2 className="text-xl font-semibold text-vai-pearl mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-vai-sunset" />
            {t('scope.addons.title')}
          </h2>
          
          <div className="grid gap-4">
            {addonServices.map((service, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-vai-sunset/10 rounded-lg border border-vai-sunset/20">
                <div className="p-2 rounded-lg bg-vai-sunset/20">
                  <Plus className="w-5 h-5 text-vai-sunset" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-vai-pearl">{service.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-vai-sunset">
                        {formatCurrency(service.cost)}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-vai-sunset bg-vai-sunset/20 px-2 py-1 rounded">
                        <CheckCircle className="w-3 h-3" />
                        {t('scope.addons.selected')}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-vai-muted leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Addons total */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-vai-pearl">Services additionnels - Total</span>
              <span className="text-xl font-bold text-vai-sunset">
                {formatCurrency(totalAddonCost)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="vai-card">
          <h2 className="text-xl font-semibold text-vai-pearl mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-vai-muted" />
            {t('scope.addons.title')}
          </h2>
          
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-vai-muted/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Plus className="w-6 h-6 text-vai-muted" />
            </div>
            <p className="text-vai-muted">
              {t('scope.addons.none')}
            </p>
          </div>
        </div>
      )}

      {/* Total Investment Summary */}
      <div className="vai-card bg-gradient-to-br from-vai-deep-ocean to-vai-lagoon border-vai-coral/20">
        <h2 className="text-xl font-semibold text-vai-pearl mb-6">Résumé de l'investissement</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-vai-pearl">Package de base</span>
            <span className="font-semibold text-vai-pearl">{formatCurrency(totalBaseCost)}</span>
          </div>
          
          {totalAddonCost > 0 && (
            <div className="flex items-center justify-between py-2">
              <span className="text-vai-pearl">Services additionnels</span>
              <span className="font-semibold text-vai-pearl">{formatCurrency(totalAddonCost)}</span>
            </div>
          )}
          
          <div className="border-t border-slate-700/50 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-vai-pearl">Total VAI Studio</span>
              <span className="text-2xl font-bold text-gradient-coral">
                {formatCurrency(totalBaseCost + totalAddonCost)}
              </span>
            </div>
          </div>
        </div>

        {/* Next steps hint */}
        <div className="mt-6 p-4 bg-vai-coral/10 rounded-lg border border-vai-coral/20">
          <p className="text-sm text-vai-coral">
            💡 <strong>Astuce:</strong> Consultez l'onglet "Finances" pour voir les détails de paiement et les coûts mensuels.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ScopeTab