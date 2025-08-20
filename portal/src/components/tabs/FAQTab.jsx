import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Search, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle,
  Smartphone,
  Settings,
  DollarSign,
  Clock
} from 'lucide-react'

const FAQTab = () => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedItems, setExpandedItems] = useState(new Set())

  // FAQ Categories
  const categories = [
    { id: 'all', label: 'Toutes', icon: HelpCircle, color: 'text-vai-coral' },
    { id: 'technical', label: t('faq.categories.technical'), icon: Settings, color: 'text-vai-teal' },
    { id: 'pricing', label: t('faq.categories.pricing'), icon: DollarSign, color: 'text-vai-sunset' },
    { id: 'process', label: t('faq.categories.process'), icon: Clock, color: 'text-vai-hibiscus' },
    { id: 'support', label: t('faq.categories.support'), icon: MessageCircle, color: 'text-vai-bamboo' }
  ]

  // FAQ Data (based on project knowledge)
  const faqData = [
    {
      id: 1,
      category: 'technical',
      question: 'Le site web fonctionne-t-il bien sur tablettes et mobiles ?',
      answer: 'Absolument ! L\'optimisation mobile et tablette complète est incluse en standard dans chaque projet. Votre site web s\'adapte automatiquement à toutes les tailles d\'écran et orientations. Tous les formulaires de réservation, galeries photos et traitements de paiement fonctionnent parfaitement sur tous les appareils. C\'est essentiel car 80% des touristes recherchent et réservent des tours sur appareils mobiles.'
    },
    {
      id: 2,
      category: 'technical',
      question: 'Puis-je collecter des informations clients illimitées dans les formulaires ?',
      answer: 'Oui ! Votre système de réservation peut collecter toutes les informations dont vous avez besoin : noms, emails, numéros WhatsApp, dates préférées, nombre de participants, demandes spéciales, et plus encore. Toutes ces données sont stockées de manière sécurisée et vous appartiennent entièrement.'
    },
    {
      id: 3,
      category: 'pricing',
      question: 'Y a-t-il des frais cachés après le lancement ?',
      answer: 'Non, aucun frais caché ! Vos seuls coûts continus sont clairement définis : 5,400 F par mois pour l\'hébergement et le système de réservation. Pas de frais de maintenance cachés, pas de commissions supplémentaires. Tout est transparent dès le départ.'
    },
    {
      id: 4,
      category: 'pricing',
      question: 'Que se passe-t-il si je veux arrêter les services mensuels ?',
      answer: 'Vous gardez votre site web ! Si vous décidez d\'arrêter les services mensuels, votre site reste votre propriété. Vous devrez juste organiser votre propre hébergement. Aucun engagement long terme - vous contrôlez vos coûts.'
    },
    {
      id: 5,
      category: 'process',
      question: 'Combien de temps prend le projet complet ?',
      answer: 'Le projet standard prend 4-5 semaines du démarrage au lancement. Cela inclut le développement du site, l\'intégration du système de réservation, la configuration des paiements, et votre formation. Des services additionnels peuvent ajouter 1-2 semaines.'
    },
    {
      id: 6,
      category: 'process',
      question: 'Que dois-je fournir pour démarrer le projet ?',
      answer: 'Vous devez fournir : vos photos d\'activités, descriptions de vos tours, informations de contact, et tout contenu écrit. VAI Studio optimisera et améliorera tout le contenu fourni pour une utilisation web. Plus vous fournissez de matériel de qualité, meilleur sera le résultat final.'
    },
    {
      id: 7,
      category: 'process',
      question: 'Puis-je modifier le site après le lancement ?',
      answer: 'Absolument ! Vous recevrez une formation complète pour gérer votre site. Vous pourrez modifier les textes, ajouter/remplacer des photos, mettre à jour les prix et horaires. Pour des modifications plus complexes, VAI Studio reste disponible pour assistance.'
    },
    {
      id: 8,
      category: 'support',
      question: 'Quel support est inclus après le lancement ?',
      answer: 'Vous bénéficiez de 30 jours de support email/WhatsApp inclus après le lancement. Cela couvre l\'assistance technique, les questions sur l\'utilisation, et les petites modifications. Après cette période, le support reste disponible selon nos tarifs standards.'
    },
    {
      id: 9,
      category: 'support',
      question: 'Le support est-il disponible en français ?',
      answer: 'Oui ! VAI Studio est basé à Moorea et fournit un support complet en français. Kevin De Silva parle couramment français et comprend les spécificités du marché polynésien. Le support est aussi disponible en anglais si nécessaire.'
    },
    {
      id: 10,
      category: 'technical',
      question: 'Les réservations peuvent-elles être automatiquement confirmées ?',
      answer: 'Oui ! Le système peut envoyer des confirmations automatiques par email dès qu\'une réservation est soumise. Vous recevez aussi une notification immédiate pour pouvoir contacter le client rapidement via WhatsApp. Le processus est entièrement automatisé mais vous gardez le contrôle.'
    },
    {
      id: 11,
      category: 'pricing',
      question: 'Les commissions sur les plateformes sont-elles vraiment plus basses ?',
      answer: 'Oui ! VAI Operator applique seulement 11% de commission vs 20-30% sur les autres plateformes. De plus, vous gardez 100% des réservations directes via votre site web. Cette économie peut représenter des milliers de francs par mois selon votre volume d\'activité.'
    },
    {
      id: 12,
      category: 'process',
      question: 'Que se passe-t-il si je ne suis pas satisfait du résultat ?',
      answer: 'VAI Studio s\'engage à votre satisfaction. Pendant le développement, vous avez plusieurs points de révision pour donner votre feedback. Si quelque chose ne correspond pas à vos attentes, nous le corrigeons jusqu\'à ce que vous soyez satisfait. La qualité et votre succès sont nos priorités.'
    }
  ]

  // Filter FAQ based on search and category
  const filteredFAQ = useMemo(() => {
    return faqData.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      const matchesSearch = searchTerm === '' || 
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesCategory && matchesSearch
    })
  }, [searchTerm, selectedCategory])

  const toggleExpanded = (id) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="vai-card">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="w-6 h-6 text-vai-hibiscus" />
          <h1 className="text-2xl font-bold text-vai-pearl">
            {t('faq.title')}
          </h1>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-vai-muted" />
          <input
            type="text"
            placeholder={t('faq.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="vai-input pl-12"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="vai-card">
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = selectedCategory === category.id
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                  ${isActive 
                    ? 'bg-vai-coral text-white shadow-vai-glow' 
                    : 'bg-vai-lagoon/50 text-vai-muted hover:text-vai-pearl hover:bg-vai-lagoon'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{category.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* FAQ Items */}
      {filteredFAQ.length > 0 ? (
        <div className="space-y-4">
          {filteredFAQ.map((item) => {
            const isExpanded = expandedItems.has(item.id)
            const categoryInfo = categories.find(cat => cat.id === item.category)
            
            return (
              <div key={item.id} className="vai-card">
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {categoryInfo && (
                          <span className={`text-xs px-2 py-1 rounded ${categoryInfo.color} bg-current/20`}>
                            {categoryInfo.label}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-vai-pearl mb-2">
                        {item.question}
                      </h3>
                    </div>
                    
                    <div className="flex-shrink-0 p-1">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-vai-muted" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-vai-muted" />
                      )}
                    </div>
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-700/30 animate-slide-down">
                    <p className="text-vai-muted leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* No Results */
        <div className="vai-card">
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-vai-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-vai-pearl mb-2">
              {t('faq.no_results')}
            </h3>
            <p className="text-vai-muted mb-6">
              Essayez d'autres mots-clés ou sélectionnez une catégorie différente
            </p>
            
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
              }}
              className="vai-button-secondary"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      )}

      {/* Contact Support */}
      <div className="vai-card bg-gradient-to-br from-vai-hibiscus/10 to-vai-coral/10 border-vai-hibiscus/20">
        <div className="text-center">
          <MessageCircle className="w-8 h-8 text-vai-hibiscus mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-vai-pearl mb-2">
            {t('faq.contact')}
          </h3>
          <p className="text-vai-muted mb-6">
            Votre question n'est pas dans la liste ? Kevin est là pour vous aider !
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/68987269065"
              target="_blank"
              rel="noopener noreferrer"
              className="vai-button-primary flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              WhatsApp (+689 87 26 90 65)
            </a>
            
            <a
              href="mailto:hello@vai.studio"
              className="vai-button-secondary flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Email
            </a>
          </div>
        </div>
      </div>

      {/* FAQ Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="vai-card-compact text-center">
          <p className="text-2xl font-bold text-vai-coral">{faqData.length}</p>
          <p className="text-sm text-vai-muted">Questions disponibles</p>
        </div>
        
        <div className="vai-card-compact text-center">
          <p className="text-2xl font-bold text-vai-teal">{categories.length - 1}</p>
          <p className="text-sm text-vai-muted">Catégories</p>
        </div>
        
        <div className="vai-card-compact text-center">
          <p className="text-2xl font-bold text-vai-sunset">24h</p>
          <p className="text-sm text-vai-muted">Temps de réponse moyen</p>
        </div>
      </div>
    </div>
  )
}

export default FAQTab