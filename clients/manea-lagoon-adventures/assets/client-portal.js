/**
 * VAI Studio - Client Portal JavaScript Functionality
 * 
 * This file handles all interactive functionality for the client portal.
 * It integrates with the Supabase client, manages authentication flow,
 * handles tab navigation, and populates dynamic content.
 * 
 * Dependencies: global.js, supabase-client.js
 * Integration: VAI Studio language system, authentication flow
 */

// =================================================================
// TRANSLATION SYSTEM FOR DYNAMIC CONTENT
// =================================================================

/**
 * Translation dictionary for client portal
 */
const portalTranslations = {
    fr: {
        // Overview translations
        'package_title': 'Package Smart Setup - Ce Que Vous Obtenez',
        'package_intro': 'Tout ce dont vous avez besoin pour commencer à prendre des réservations rentables - expliqué simplement',
        'investment_summary': 'Résumé de l\'Investissement',
        'one_time_investment': 'Investissement unique',
        'per_month': 'par mois',
        'savings_vs_traditional': 'Économies vs traditionnel:',
        'project_progress': 'Progression du Projet',
        'why_choose_vai': 'Pourquoi Choisir VAI Studio ?',
        
        // Services
        'professional_website': 'Site Web Professionnel',
        'website_summary': 'Votre présence en ligne professionnelle',
        'domain_email': 'Domaine & Email Professionnel',
        'domain_summary': 'Votre adresse web et email personnalisés',
        'booking_system': 'Système de Réservation (JotForm Professional)',
        'booking_summary': 'Formulaires en ligne pour les réservations touristiques',
        'payment_processing': 'Traitement des Paiements (OSB PayZen)',
        'payment_summary': 'Système sécurisé pour accepter les paiements par carte',
        'google_business': 'Profil Google Business',
        'google_summary': 'Vos infos business dans les recherches Google',
        'platform_assistance': 'Assistance Inscription Plateformes',
        'platform_summary': 'Aide pour TripAdvisor, Viator, GetYourGuide',
        
        // Milestones
        'proposal_sent': 'Proposition Envoyée',
        'client_acceptance': 'Acceptation Client',
        'development': 'Développement',
        'launch': 'Lancement',
        'training': 'Formation',
        'completed': 'Terminé',
        'pending': 'En cours',
        'upcoming': 'À venir',
        
        // Value proposition
        'polynesia_specialist': 'Spécialisé Polynésie',
        'polynesia_desc': 'Conçu spécifiquement pour le marché touristique polynésien',
        'massive_savings': 'Économies Massives',
        'savings_desc': '-417,200 XPF d\'économies par an vs approche traditionnelle',
        'quick_launch': 'Démarrage Rapide',
        'launch_desc': '3 semaines pour être opérationnel vs 6-8 semaines traditionnel',
        
        // Investment
        'investment_breakdown': 'Détail de l\'Investissement',
        'your_total_investment': 'Votre Investissement Total',
        'one_time_payment': 'Paiement unique pour lancer votre transformation digitale',
        'option_1': 'Option 1: Paiement complet',
        'option_2': 'Option 2: 50% maintenant, 50% à mi-projet',
        'recommended': 'Recommandé',
        'monthly_operating_costs': 'Coûts d\'Exploitation Mensuels',
        'recurring_fees': 'Frais récurrents pour maintenir votre système en ligne',
        'hosting_domain': 'Hébergement & Domaine',
        'what_included_details': 'Ce Qui Est Inclus - Détail',
        'savings_vs_traditional_approach': 'Vos Économies vs Approche Traditionnelle',
        'item': 'Élément',
        'traditional': 'Traditionnel',
        'vai_smart': 'VAI Smart',
        'initial_setup': 'Setup initial',
        'monthly_costs': 'Coûts mensuels',
        'annual_savings': 'Économies la première année',
        'return_on_investment': 'Retour sur Investissement',
        'break_even': 'Break-even',
        'break_even_desc': '1 réservation toutes les 2 semaines',
        'typical_profitability': 'Rentabilité typique',
        'profitability_desc': '2-3 mois',
        
        // Timeline
        'development_timeline': 'Planning de Développement',
        'total_duration': 'Durée totale',
        'proposed_start_date': 'Date de début proposée',
        'weeks': 'semaines',
        'key_milestones': 'Étapes Clés',
        'week_1_foundation': 'Semaine 1: Fondation',
        'week_2_development': 'Semaine 2: Développement',
        'week_3_launch': 'Semaine 3: Lancement & Optimisation',
        'tasks': 'Tâches',
        'deliverables': 'Livrables',
        
        // Add-ons
        'available_addons': 'Options Disponibles',
        'enhance_package': 'Améliorez votre package Smart Setup avec ces options supplémentaires professionnelles',
        'addon_note': 'Toutes les options peuvent être ajoutées maintenant ou plus tard selon vos besoins',
        'options_summary': 'Résumé des Options',
        'available_options': 'Options disponibles',
        'weeks_timeline': 'semaines délai',
        'total_options_price': 'XPF prix total options',
        'interested_in_addons': 'Intéressé par une ou plusieurs options ?',
        'discuss_options_desc': 'Contactez Kevin pour discuter des options qui conviennent le mieux à vos objectifs et personnaliser votre package',
        'discuss_options': 'Discuter des Options',
        'request_custom_quote': 'Demander Devis Personnalisé',
        
        // Next steps
        'next_steps': 'Prochaines Étapes',
        'current_status': 'Statut Actuel',
        'proposal_sent_status': 'Proposition envoyée',
        'awaiting_confirmation': 'En attente de votre confirmation',
        'immediate_actions': 'Actions Immédiates Requises',
        'content_preparation': 'Préparation du Contenu',
        'ready_to_start': 'Prêt à Commencer ?',
        'contact_kevin_desc': 'Contactez Kevin pour confirmer votre participation et planifier le démarrage',
        'confirm_and_start': 'Confirmer et Démarrer',
        'download_proposal': 'Télécharger la Proposition'
    },
    en: {
        // Overview translations
        'package_title': 'Smart Setup Package - What You Get',
        'package_intro': 'Everything you need to start taking profitable bookings - explained simply',
        'investment_summary': 'Investment Summary',
        'one_time_investment': 'One-time investment',
        'per_month': 'per month',
        'savings_vs_traditional': 'Savings vs traditional:',
        'project_progress': 'Project Progress',
        'why_choose_vai': 'Why Choose VAI Studio?',
        
        // Services
        'professional_website': 'Professional Website',
        'website_summary': 'Your professional online presence',
        'domain_email': 'Domain & Professional Email',
        'domain_summary': 'Your custom web address and email',
        'booking_system': 'Booking System (JotForm Professional)',
        'booking_summary': 'Online forms for tourist bookings',
        'payment_processing': 'Payment Processing (OSB PayZen)',
        'payment_summary': 'Secure system to accept card payments',
        'google_business': 'Google Business Profile',
        'google_summary': 'Your business info in Google searches',
        'platform_assistance': 'Platform Listing Assistance',
        'platform_summary': 'Help with TripAdvisor, Viator, GetYourGuide',
        
        // Milestones
        'proposal_sent': 'Proposal Sent',
        'client_acceptance': 'Client Acceptance',
        'development': 'Development',
        'launch': 'Launch',
        'training': 'Training',
        'completed': 'Completed',
        'pending': 'In Progress',
        'upcoming': 'Upcoming',
        
        // Value proposition
        'polynesia_specialist': 'Polynesia Specialist',
        'polynesia_desc': 'Designed specifically for the Polynesian tourism market',
        'massive_savings': 'Massive Savings',
        'savings_desc': '-417,200 XPF savings per year vs traditional approach',
        'quick_launch': 'Quick Launch',
        'launch_desc': '3 weeks to be operational vs 6-8 weeks traditional',
        
        // Investment
        'investment_breakdown': 'Investment Breakdown',
        'your_total_investment': 'Your Total Investment',
        'one_time_payment': 'One-time payment to launch your digital transformation',
        'option_1': 'Option 1: Full payment',
        'option_2': 'Option 2: 50% now, 50% mid-project',
        'recommended': 'Recommended',
        'monthly_operating_costs': 'Monthly Operating Costs',
        'recurring_fees': 'Recurring fees to keep your system online',
        'hosting_domain': 'Hosting & Domain',
        'what_included_details': 'What\'s Included - Details',
        'savings_vs_traditional_approach': 'Your Savings vs Traditional Approach',
        'item': 'Item',
        'traditional': 'Traditional',
        'vai_smart': 'VAI Smart',
        'initial_setup': 'Initial setup',
        'monthly_costs': 'Monthly costs',
        'annual_savings': 'Savings in first year',
        'return_on_investment': 'Return on Investment',
        'break_even': 'Break-even',
        'break_even_desc': '1 booking every 2 weeks',
        'typical_profitability': 'Typical profitability',
        'profitability_desc': '2-3 months',
        
        // Timeline
        'development_timeline': 'Development Timeline',
        'total_duration': 'Total duration',
        'proposed_start_date': 'Proposed start date',
        'weeks': 'weeks',
        'key_milestones': 'Key Milestones',
        'week_1_foundation': 'Week 1: Foundation',
        'week_2_development': 'Week 2: Development',
        'week_3_launch': 'Week 3: Launch & Optimization',
        'tasks': 'Tasks',
        'deliverables': 'Deliverables',
        
        // Add-ons
        'available_addons': 'Available Add-ons',
        'enhance_package': 'Enhance your Smart Setup package with these additional professional options',
        'addon_note': 'All options can be added now or later according to your needs',
        'options_summary': 'Options Summary',
        'available_options': 'Available options',
        'weeks_timeline': 'weeks timeline',
        'total_options_price': 'XPF total options price',
        'interested_in_addons': 'Interested in one or more add-ons?',
        'discuss_options_desc': 'Contact Kevin to discuss which options best fit your goals and customize your package',
        'discuss_options': 'Discuss Options',
        'request_custom_quote': 'Request Custom Quote',
        
        // Next steps
        'next_steps': 'Next Steps',
        'current_status': 'Current Status',
        'proposal_sent_status': 'Proposal sent',
        'awaiting_confirmation': 'Awaiting your confirmation',
        'immediate_actions': 'Immediate Actions Required',
        'content_preparation': 'Content Preparation',
        'ready_to_start': 'Ready to Start?',
        'contact_kevin_desc': 'Contact Kevin to confirm your participation and schedule the start',
        'confirm_and_start': 'Confirm and Start',
        'download_proposal': 'Download Proposal'
    }
};

/**
 * Get translated text for current language
 */
function t(key) {
    const currentLang = document.body.getAttribute('data-current-lang') || 'fr';
    return portalTranslations[currentLang][key] || portalTranslations.fr[key] || key;
}

class ClientPortalState {
    constructor() {
        this.currentTab = 'overview';
        this.isAuthenticated = false;
        this.clientData = null;
        this.proposalData = null;
        this.currentLanguage = 'fr';
        this.loadingStates = {
            authentication: false,
            contentLoading: false,
            tabSwitching: false
        };
    }

    setTab(tabName) {
        this.currentTab = tabName;
        this.notifyTabChange();
    }

    setAuthenticated(status) {
        this.isAuthenticated = status;
        this.notifyAuthChange();
    }

    setClientData(data) {
        this.clientData = data;
        this.proposalData = data ? window.clientPortalAPI.getProposalData() : null;
        this.notifyDataChange();
    }

    setLanguage(lang) {
        this.currentLanguage = lang;
        this.notifyLanguageChange();
    }

    setLoading(type, state) {
        this.loadingStates[type] = state;
        this.notifyLoadingChange();
    }

    // Event notification methods (can be extended for reactive UI)
    notifyTabChange() {
        document.dispatchEvent(new CustomEvent('portalTabChange', { detail: this.currentTab }));
    }

    notifyAuthChange() {
        document.dispatchEvent(new CustomEvent('portalAuthChange', { detail: this.isAuthenticated }));
    }

    notifyDataChange() {
        document.dispatchEvent(new CustomEvent('portalDataChange', { detail: this.proposalData }));
    }

    notifyLanguageChange() {
        document.dispatchEvent(new CustomEvent('portalLanguageChange', { detail: this.currentLanguage }));
    }

    notifyLoadingChange() {
        document.dispatchEvent(new CustomEvent('portalLoadingChange', { detail: this.loadingStates }));
    }
}

// Global state instance
const portalState = new ClientPortalState();

// =================================================================
// AUTHENTICATION MANAGEMENT
// =================================================================

/**
 * Toggle password visibility so user can see what they're typing
 */
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('clientPassword');
    const toggleButton = document.querySelector('.password-toggle');
    const eyeIcon = toggleButton.querySelector('.toggle-eye');
    
    if (passwordInput.type === 'password') {
        // Show the password text
        passwordInput.type = 'text';
        eyeIcon.textContent = '🙈'; // Hide icon when password is visible
        toggleButton.setAttribute('aria-label', 'Hide password');
        toggleButton.setAttribute('title', 'Masquer le mot de passe');
    } else {
        // Hide the password text (show dots)
        passwordInput.type = 'password';
        eyeIcon.textContent = '👁'; // Show icon when password is hidden
        toggleButton.setAttribute('aria-label', 'Show password');
        toggleButton.setAttribute('title', 'Afficher le mot de passe');
    }
}

/**
 * Handle client password authentication
 */
async function checkClientAccess() {
    const passwordInput = document.getElementById('clientPassword');
    const passwordError = document.getElementById('passwordError');
    const password = passwordInput.value.trim();

    // Clear previous errors
    passwordError.style.display = 'none';
    
    if (!password) {
        showPasswordError('Veuillez entrer votre code d\'accès');
        return;
    }

    // Show loading state
    portalState.setLoading('authentication', true);
    const submitButton = document.querySelector('.password-form button');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Vérification...';
    submitButton.disabled = true;

    try {
        // Authenticate with API
        const result = await window.clientPortalAPI.authenticate(password);
        
        if (result.success) {
            // Authentication successful
            portalState.setAuthenticated(true);
            portalState.setClientData(result.data);
            
            // Hide password screen and show dashboard
            document.getElementById('passwordScreen').style.display = 'none';
            document.getElementById('dashboardContent').style.display = 'block';
            
            // Initialize dashboard content
            await initializeDashboard();
            
            // Track successful authentication
            if (typeof gtag !== 'undefined') {
                gtag('event', 'client_portal_access', {
                    'event_category': 'Authentication',
                    'event_label': 'manea-lagoon-adventures',
                    'value': 1
                });
            }

        } else {
            // Authentication failed
            showPasswordError(result.error || 'Code d\'accès incorrect');
        }

    } catch (error) {
        console.error('Authentication error:', error);
        showPasswordError('Erreur de connexion. Veuillez réessayer.');
    } finally {
        // Reset button state
        portalState.setLoading('authentication', false);
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

/**
 * Show password error message
 */
function showPasswordError(message) {
    const passwordError = document.getElementById('passwordError');
    const currentLang = document.body.getAttribute('data-current-lang') || 'fr';
    
    // Get translated error message if available
    const translations = {
        'Veuillez entrer votre code d\'accès': {
            fr: 'Veuillez entrer votre code d\'accès',
            en: 'Please enter your access code'
        },
        'Code d\'accès incorrect': {
            fr: 'Code d\'accès incorrect',
            en: 'Incorrect access code'
        },
        'Erreur de connexion. Veuillez réessayer.': {
            fr: 'Erreur de connexion. Veuillez réessayer.',
            en: 'Connection error. Please try again.'
        }
    };

    const translatedMessage = translations[message] ? translations[message][currentLang] : message;
    passwordError.querySelector('span').textContent = translatedMessage;
    passwordError.style.display = 'block';
}

/**
 * Handle Enter key in password input
 */
function handlePasswordKeyPress(event) {
    if (event.key === 'Enter') {
        checkClientAccess();
    }
}

// =================================================================
// DASHBOARD INITIALIZATION
// =================================================================

/**
 * Initialize dashboard after successful authentication
 */
async function initializeDashboard() {
    try {
        portalState.setLoading('contentLoading', true);
        
        // Get client and proposal data
        const clientInfo = window.clientPortalAPI.getClientInfo();
        const proposalData = window.clientPortalAPI.getProposalData();
        const projectStatus = window.clientPortalAPI.getProjectStatus();

        // Update hero section
        updateHeroSection(clientInfo, projectStatus);
        
        // Populate all tab content
        await populateOverviewTab(proposalData, projectStatus);
        await populateInvestmentTab(proposalData);
        await populateTimelineTab(proposalData, projectStatus);
        await populateAddonsTab(proposalData);
        await populateNextStepsTab(proposalData, projectStatus);
        
        // Initialize tab navigation
        initializeTabNavigation();
        
        // Update language-specific content
        updateLanguageContent();
        
        console.log('✅ Dashboard initialized successfully');
        
    } catch (error) {
        console.error('❌ Dashboard initialization failed:', error);
        showErrorMessage('Erreur lors du chargement des données');
    } finally {
        portalState.setLoading('contentLoading', false);
    }
}

/**
 * Update hero section with client data
 */
function updateHeroSection(clientInfo, projectStatus) {
    if (!clientInfo) return;

    // Update project value and timeline
    const projectValue = document.querySelector('.project-value');
    const projectTimeline = document.querySelector('.project-timeline');
    
    if (projectValue) {
        projectValue.textContent = ProposalDataHelpers.formatCurrency(clientInfo.investment);
    }
    
    if (projectTimeline) {
        const currentLang = document.body.getAttribute('data-current-lang') || 'fr';
        const timelineText = currentLang === 'fr' ? '3 semaines' : '3 weeks';
        projectTimeline.textContent = timelineText;
    }

    // Update status badge
    const statusBadge = document.querySelector('.status-badge');
    if (statusBadge) {
        statusBadge.className = `status-badge ${ProposalDataHelpers.getStatusClass(clientInfo.status)}`;
    }
}

// =================================================================
// TAB CONTENT POPULATION
// =================================================================

/**
 * Populate Overview Tab
 */
async function populateOverviewTab(proposalData, projectStatus) {
    const overviewTab = document.getElementById('overview-tab');
    if (!overviewTab || !proposalData) return;

    // Replace the existing content with detailed overview
    overviewTab.innerHTML = `
        <!-- Project Status Indicator - Top Right -->
        <div class="project-status-indicator">
            <div class="status-header">
                <h3>${t('project_progress')}</h3>
                <div class="status-badge status-proposal">${t('proposal_sent_status')}</div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 20%"></div>
            </div>
            <div class="progress-steps">
                ${generateCompactMilestones(projectStatus)}
            </div>
        </div>

        <div class="content-grid">
            <!-- Smart Setup Package Details -->
            <div class="package-details-card">
                <h3>${t('package_title')}</h3>
                <p class="package-intro">${t('package_intro')}</p>
                
                <div class="detailed-services">
                    ${generateDetailedServicesSections()}
                </div>
            </div>

            <!-- Investment Summary -->
            <!--
            <div class="summary-card">
                <h3>${t('investment_summary')}</h3>
                <div class="investment-highlight">
                    <div class="price-display">
                        <span class="price-amount">250,000 XPF</span>
                        <span class="price-label">${t('one_time_investment')}</span>
                    </div>
                    <div class="monthly-display">
                        <span class="monthly-amount">5,400 XPF</span>
                        <span class="monthly-label">${t('per_month')}</span>
                    </div>
                </div>
                <div class="savings-highlight">
                    <span class="savings-label">${t('savings_vs_traditional')}</span>
                    <span class="savings-amount">-417,200 XPF/an</span>
                </div>
            </div>
            -->

        </div>

        <!-- What Makes This Special -->
        <div class="value-proposition">
            <h3>${t('why_choose_vai')}</h3>
            <div class="value-grid">
                <div class="value-item">
                    <div class="value-icon">🎯</div>
                    <h4>${t('polynesia_specialist')}</h4>
                    <p>${t('polynesia_desc')}</p>
                </div>
                <div class="value-item">
                    <div class="value-icon">💰</div>
                    <h4>${t('massive_savings')}</h4>
                    <p>${t('savings_desc')}</p>
                </div>
                <div class="value-item">
                    <div class="value-icon">🚀</div>
                    <h4>${t('quick_launch')}</h4>
                    <p>${t('launch_desc')}</p>
                </div>
            </div>
        </div>
    `;
}

/**
 * Populate Investment Tab
 */
async function populateInvestmentTab(proposalData) {
    const investmentTab = document.getElementById('investment-tab');
    if (!investmentTab || !proposalData) return;

    const investmentContent = investmentTab.querySelector('.investment-content');
    if (!investmentContent) return;

    const costBreakdown = proposalData.costs;
    const monthlyCosts = proposalData.monthly;

    investmentContent.innerHTML = `
        <h2>${t('investment_breakdown')}</h2>
        
        <!-- Clear Investment Summary -->
        <div class="investment-summary-hero">
            <div class="summary-hero-card">
                <h3>${t('your_total_investment')}</h3>
                <div class="hero-price">${ProposalDataHelpers.formatCurrency(250000)}</div>
                <p>${t('one_time_payment')}</p>
                <div class="payment-options">
                    <div class="payment-option">
                        <span class="option-label">${t('option_1')}</span>
                        <span class="option-value">${ProposalDataHelpers.formatCurrency(250000)}</span>
                    </div>
                    <div class="payment-option recommended">
                        <span class="option-label">${t('option_2')}</span>
                        <span class="option-value">${ProposalDataHelpers.formatCurrency(125000)} + ${ProposalDataHelpers.formatCurrency(125000)}</span>
                        <span class="recommended-badge">${t('recommended')}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Monthly Operating Costs -->
        <div class="monthly-costs-section">
            <div class="monthly-card">
                <h3>${t('monthly_operating_costs')}</h3>
                <div class="monthly-price">${ProposalDataHelpers.formatCurrency(5400)}</div>
                <p>${t('recurring_fees')}</p>
                <div class="monthly-breakdown">
                    <div class="monthly-item">
                        <span>${t('hosting_domain')}</span>
                        <span>${ProposalDataHelpers.formatCurrency(1400)}</span>
                    </div>
                    <div class="monthly-item">
                        <span>JotForm Professional</span>
                        <span>${ProposalDataHelpers.formatCurrency(4000)}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="content-grid">
            <div class="investment-card">
                <h3>${t('what_included_details')}</h3>
                <div class="investment-breakdown">
                    ${generateDetailedInvestmentItems(costBreakdown)}
                </div>
            </div>
            
            <div class="savings-comparison-card">
                <h3>${t('savings_vs_traditional_approach')}</h3>
                <div class="comparison-table">
                    <div class="comparison-row header">
                        <span>${t('item')}</span>
                        <span>${t('traditional')}</span>
                        <span>${t('vai_smart')}</span>
                    </div>
                    <div class="comparison-row">
                        <span>${t('initial_setup')}</span>
                        <span class="old-price">450,000 XPF</span>
                        <span class="new-price">250,000 XPF</span>
                    </div>
                    <div class="comparison-row">
                        <span>${t('monthly_costs')}</span>
                        <span class="old-price">23,500 XPF</span>
                        <span class="new-price">5,400 XPF</span>
                    </div>
                    <div class="comparison-row total">
                        <span>${t('annual_savings')}</span>
                        <span class="savings-amount">-417,200 XPF</span>
                        <span class="checkmark">✅</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="roi-section">
            <div class="roi-card">
                <h3>${t('return_on_investment')}</h3>
                <div class="roi-stats">
                    <div class="roi-item">
                        <span class="roi-label">${t('break_even')}</span>
                        <span class="roi-value">${t('break_even_desc')}</span>
                    </div>
                    <div class="roi-item">
                        <span class="roi-label">${t('typical_profitability')}</span>
                        <span class="roi-value">${t('profitability_desc')}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Populate Next Steps Tab
 */
async function populateNextStepsTab(proposalData, projectStatus) {
    const nextStepsTab = document.getElementById('nextsteps-tab');
    if (!nextStepsTab || !proposalData) return;

    const nextStepsContent = nextStepsTab.querySelector('.nextsteps-content');
    if (!nextStepsContent) return;

    const nextSteps = proposalData.nextSteps;
    
    nextStepsContent.innerHTML = `
        <h2>${t('next_steps')}</h2>
        
        <div class="next-steps-overview">
            <div class="status-summary">
                <h3>${t('current_status')}</h3>
                <div class="status-card ${ProposalDataHelpers.getStatusClass(projectStatus.status)}">
                    <span class="status-label">${t('proposal_sent_status')}</span>
                    <span class="status-description">${t('awaiting_confirmation')}</span>
                </div>
            </div>
        </div>
        
        <div class="immediate-actions">
            <h3>${t('immediate_actions')}</h3>
            <div class="actions-grid">
                ${generateImmediateActions(nextSteps.immediate_actions)}
            </div>
        </div>
        
        <div class="content-requirements">
            <h3>${t('content_preparation')}</h3>
            <div class="requirements-grid">
                ${generateContentRequirements(nextSteps.content_requirements)}
            </div>
        </div>
        
        <div class="confirmation-section">
            <div class="confirmation-card">
                <h3>${t('ready_to_start')}</h3>
                <p>${t('contact_kevin_desc')}</p>
                <div class="confirmation-actions">
                    <button onclick="openWhatsApp()" class="primary-action-btn">
                        🚀 <span>${t('confirm_and_start')}</span>
                    </button>
                    <button onclick="downloadProposal()" class="secondary-action-btn">
                        📄 <span>${t('download_proposal')}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generate detailed investment items HTML with descriptions
 */
function generateDetailedInvestmentItems(costs) {
    if (!costs) return '';
    const currentLang = document.body.getAttribute('data-current-lang') || 'fr';
    
    const detailedDescriptions = {
        website_development: {
            fr: 'Site web professionnel responsive avec design sur mesure',
            en: 'Professional responsive website with custom design'
        },
        booking_system_setup: {
            fr: 'Configuration complète du système de réservation JotForm',
            en: 'Complete JotForm booking system configuration'
        },
        payment_gateway_config: {
            fr: 'Intégration sécurisée des paiements OSB PayZen',
            en: 'Secure OSB PayZen payment integration'
        },
        google_business_optimization: {
            fr: 'Configuration et optimisation Google Business Profile',
            en: 'Google Business Profile setup and optimization'
        },
        domain_email_setup: {
            fr: 'Nom de domaine + email professionnel personnalisé',
            en: 'Domain name + custom professional email'
        },
        platform_listing_assistance: {
            fr: 'Aide à l\'inscription sur TripAdvisor, Viator, etc.',
            en: 'Assistance with TripAdvisor, Viator listings'
        },
        training_documentation: {
            fr: 'Formation complète + documentation utilisateur',
            en: 'Complete training + user documentation'
        }
    };
    
    return Object.entries(costs)
        .filter(([key]) => key !== 'total')
        .map(([key, item]) => {
            const label = typeof item.label === 'object' ? 
                (currentLang === 'fr' ? item.label.fr : item.label.en) : 
                key;
            const description = detailedDescriptions[key] ? 
                detailedDescriptions[key][currentLang] : '';
            const amount = item.amount || item;
            
            return `
                <div class="detailed-investment-item">
                    <div class="item-header">
                        <span class="investment-label">${label}</span>
                        <span class="investment-amount">${ProposalDataHelpers.formatCurrency(amount)}</span>
                    </div>
                    <div class="item-description">${description}</div>
                </div>
            `;
        }).join('') + 
        `<div class="investment-item total">
            <span class="investment-label">${currentLang === 'fr' ? 'Total des Services' : 'Total Services'}</span>
            <span class="investment-amount">${ProposalDataHelpers.formatCurrency(costs.total)}</span>
        </div>`;
}

/**
 * Generate detailed services sections with all proposal information
 */
function generateDetailedServicesSections() {
    const currentLang = document.body.getAttribute('data-current-lang') || 'fr';
    
    const services = [
        {
            id: 'website',
            icon: '🌐',
            title: t('professional_website'),
            summary: t('website_summary'),
            details: currentLang === 'fr' ? `
                <p><strong>Ce que c'est :</strong> Votre vitrine d'entreprise en ligne (comme une vitrine numérique)</p>
                <p><strong>Exemple :</strong> manea-lagoon-adventures.com <em>(vérifié - ce domaine est disponible !)</em></p>
                <p><strong>Inclus :</strong> Page d'accueil, à propos de vos excursions, galerie photo, informations de contact</p>
                <p><strong>Mobile-friendly :</strong> Fonctionne parfaitement sur téléphones (où 80% des touristes naviguent)</p>
            ` : `
                <p><strong>What it is:</strong> Your online business presence (like a digital storefront)</p>
                <p><strong>Example:</strong> manea-lagoon-adventures.com <em>(checked - this domain is available!)</em></p>
                <p><strong>Includes:</strong> Home page, about your tours, photo gallery, contact information</p>
                <p><strong>Mobile-friendly:</strong> Works perfectly on phones (where 80% of tourists browse)</p>
            `
        },
        {
            id: 'domain',
            icon: '📧',
            title: t('domain_email'),
            summary: t('domain_summary'),
            details: currentLang === 'fr' ? `
                <p><strong>Exemple de domaine :</strong> lagoon-adventures.com (votre adresse web)</p>
                <p><strong>Exemple d'email :</strong> manea@lagoon-adventures.com (email professionnel)</p>
                <p><strong>Pourquoi important :</strong> Crée la confiance avec les clients vs adresses Gmail</p>
                <p><strong>Suggestions alternatives :</strong> tahiti-lagoon-tours.com, manea-excursions.com</p>
            ` : `
                <p><strong>Domain example:</strong> lagoon-adventures.com (your web address)</p>
                <p><strong>Email example:</strong> manea@lagoon-adventures.com (professional business email)</p>
                <p><strong>Why important:</strong> Builds trust with customers vs Gmail addresses</p>
                <p><strong>Alternative suggestions:</strong> tahiti-lagoon-tours.com, manea-excursions.com</p>
            `
        },
        {
            id: 'booking',
            icon: '📋',
            title: t('booking_system'),
            summary: t('booking_summary'),
            details: currentLang === 'fr' ? `
                <p><strong>Ce que c'est :</strong> Formulaires en ligne où les touristes peuvent demander des réservations</p>
                <p><strong>Comment ça marche :</strong> Touriste remplit formulaire → vous recevez email → vous confirmez disponibilité</p>
                <p><strong>Exemple :</strong> Bouton "Réserver Votre Aventure Lagon" sur votre site web</p>
                <p><strong>Inclus :</strong> Sélecteur de date, nombre de personnes, demandes spéciales</p>
                <p><strong>Mobile-optimisé :</strong> Réservation facile depuis les téléphones</p>
            ` : `
                <p><strong>What it is:</strong> Online forms where tourists can request bookings</p>
                <p><strong>How it works:</strong> Tourist fills form → you receive email → you confirm availability</p>
                <p><strong>Example:</strong> "Book Your Lagoon Adventure" button on your website</p>
                <p><strong>Includes:</strong> Date picker, group size selector, special requests field</p>
                <p><strong>Mobile-optimized:</strong> Easy booking from phones</p>
            `
        },
        {
            id: 'payment',
            icon: '💳',
            title: t('payment_processing'),
            summary: t('payment_summary'),
            details: currentLang === 'fr' ? `
                <p><strong>Ce que c'est :</strong> Système sécurisé pour accepter les paiements par carte de crédit</p>
                <p><strong>Comment ça marche :</strong> Touriste réserve → paie en ligne → argent va sur votre compte</p>
                <p><strong>Standard local :</strong> Utilisé par la plupart des entreprises polynésiennes</p>
                <p><strong>Frais de transaction :</strong> 2,9% + 30 XPF par paiement (standard de l'industrie)</p>
            ` : `
                <p><strong>What it is:</strong> Secure system to accept credit card payments</p>
                <p><strong>How it works:</strong> Tourist books → pays online → money goes to your account</p>
                <p><strong>Local standard:</strong> Used by most French Polynesian businesses</p>
                <p><strong>Transaction fees:</strong> 2.9% + 30 XPF per payment (industry standard)</p>
            `
        },
        {
            id: 'google',
            icon: '📍',
            title: t('google_business'),
            summary: t('google_summary'),
            details: currentLang === 'fr' ? `
                <p><strong>Ce que c'est :</strong> Vos informations d'entreprise quand les gens recherchent sur Google</p>
                <p><strong>Exemple :</strong> Quand les touristes recherchent "excursions lagon Tahiti" vous apparaissez</p>
                <p><strong>Inclus :</strong> Photos, avis, informations de contact, carte de localisation</p>
                <p><strong>Marketing gratuit :</strong> Augmente la visibilité en ligne</p>
            ` : `
                <p><strong>What it is:</strong> Your business info when people search Google</p>
                <p><strong>Example:</strong> When tourists search "Tahiti lagoon tours" you appear</p>
                <p><strong>Includes:</strong> Photos, reviews, contact info, location map</p>
                <p><strong>Free marketing:</strong> Increases online visibility</p>
            `
        },
        {
            id: 'platforms',
            icon: '🌟',
            title: t('platform_assistance'),
            summary: t('platform_summary'),
            details: currentLang === 'fr' ? `
                <p><strong>Configuration TripAdvisor :</strong> Création profil entreprise avec photos et descriptions</p>
                <p><strong>Inscription Viator :</strong> Candidature partenaire avec présentation professionnelle</p>
                <p><strong>Soumission GetYourGuide :</strong> Candidature complète avec informations de réservation</p>
                <p><strong>Contacts agences locales :</strong> Introductions aux agences de voyage tahitiennes</p>
            ` : `
                <p><strong>TripAdvisor setup:</strong> Create business profile with photos and descriptions</p>
                <p><strong>Viator listing:</strong> Partner application with professional presentation</p>
                <p><strong>GetYourGuide submission:</strong> Complete application with booking information</p>
                <p><strong>Local agency contacts:</strong> Introductions to Tahitian travel agencies</p>
            `
        }
    ];

    return services.map(service => `
        <div class="service-item">
            <div class="service-header" onclick="toggleServiceDetails('${service.id}')">
                <div class="service-icon">${service.icon}</div>
                <div class="service-title-area">
                    <h4 class="service-title">${service.title}</h4>
                    <p class="service-summary">${service.summary}</p>
                </div>
                <div class="service-toggle">
                    <span class="toggle-icon">▼</span>
                </div>
            </div>
            <div class="service-details" id="service-${service.id}" style="display: none;">
                <div class="service-content">
                    ${service.details}
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Generate compact milestones for status indicator
 */
function generateCompactMilestones(projectStatus) {
    const milestones = [
        { id: 'proposal', icon: '📝', name: t('proposal_sent'), status: 'completed' },
        { id: 'acceptance', icon: '✅', name: t('client_acceptance'), status: 'pending' },
        { id: 'development', icon: '🏗️', name: t('development'), status: 'upcoming' },
        { id: 'launch', icon: '🚀', name: t('launch'), status: 'upcoming' },
        { id: 'training', icon: '🎓', name: t('training'), status: 'upcoming' }
    ];

    return milestones.map(milestone => `
        <div class="compact-milestone ${milestone.status}">
            <div class="milestone-dot"></div>
            <span class="milestone-name">${milestone.name}</span>
        </div>
    `).join('');
}

/**
 * Toggle service details visibility
 */
function toggleServiceDetails(serviceId) {
    const detailsElement = document.getElementById(`service-${serviceId}`);
    const toggleIcon = detailsElement.parentElement.querySelector('.toggle-icon');
    
    if (detailsElement.style.display === 'none') {
        detailsElement.style.display = 'block';
        toggleIcon.textContent = '▲';
        detailsElement.classList.add('fade-in');
    } else {
        detailsElement.style.display = 'none';
        toggleIcon.textContent = '▼';
        detailsElement.classList.remove('fade-in');
    }
}

/**
 * Generate project milestones display
 */
function generateProjectMilestones(projectStatus) {
    const milestones = [
        { id: 'proposal', icon: '📝', name: { fr: 'Proposition Envoyée', en: 'Proposal Sent' }, status: 'completed' },
        { id: 'acceptance', icon: '✅', name: { fr: 'Acceptation Client', en: 'Client Acceptance' }, status: 'pending' },
        { id: 'development', icon: '🏗️', name: { fr: 'Développement', en: 'Development' }, status: 'upcoming' },
        { id: 'launch', icon: '🚀', name: { fr: 'Lancement', en: 'Launch' }, status: 'upcoming' },
        { id: 'training', icon: '🎓', name: { fr: 'Formation', en: 'Training' }, status: 'upcoming' }
    ];

    return milestones.map(milestone => `
        <div class="milestone-step ${milestone.status}">
            <div class="milestone-icon">${milestone.icon}</div>
            <div class="milestone-content">
                <h4>${milestone.name.fr}</h4>
                <span class="milestone-status-badge">${milestone.status === 'completed' ? 'Terminé' : milestone.status === 'pending' ? 'En cours' : 'À venir'}</span>
            </div>
        </div>
    `).join('');
}
function generateInvestmentItems(costs) {
    if (!costs) return '';
    
    return Object.entries(costs)
        .filter(([key]) => key !== 'total')
        .map(([key, item]) => {
            const label = typeof item.label === 'object' ? item.label.fr : key;
            const amount = item.amount || item;
            
            return `
                <div class="investment-item">
                    <span class="investment-label">${label}</span>
                    <span class="investment-amount">${ProposalDataHelpers.formatCurrency(amount)}</span>
                </div>
            `;
        }).join('') + 
        `<div class="investment-item total">
            <span class="investment-label" data-fr="Total" data-en="Total">Total</span>
            <span class="investment-amount">${ProposalDataHelpers.formatCurrency(costs.total)}</span>
        </div>`;
}

/**
 * Populate Timeline Tab
 */
async function populateTimelineTab(proposalData, projectStatus) {
    const timelineTab = document.getElementById('timeline-tab');
    if (!timelineTab || !proposalData) return;

    const timelineContent = timelineTab.querySelector('.timeline-content');
    if (!timelineContent) return;

    const timeline = proposalData.timeline;
    
    timelineContent.innerHTML = `
        <h2>${t('development_timeline')}</h2>
        
        <div class="timeline-overview">
            <div class="timeline-stats">
                <div class="stat-item">
                    <span class="stat-label">${t('total_duration')}</span>
                    <span class="stat-value">${timeline.total_weeks} ${t('weeks')}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">${t('proposed_start_date')}</span>
                    <span class="stat-value">${ProposalDataHelpers.formatDate('2025-08-20')}</span>
                </div>
            </div>
        </div>
        
        <div class="timeline-weeks">
            ${generateTimelineWeeks(timeline)}
        </div>
        
        <div class="milestones-section">
            <h3>${t('key_milestones')}</h3>
            <div class="milestones-grid">
                ${generateMilestones(projectStatus.milestones)}
            </div>
        </div>
    `;
}

/**
 * Generate timeline weeks HTML with translations
 */
function generateTimelineWeeks(timeline) {
    const currentLang = document.body.getAttribute('data-current-lang') || 'fr';
    const weeks = ['week_1', 'week_2', 'week_3'];
    
    return weeks.map((weekKey, index) => {
        const week = timeline[weekKey];
        if (!week) return '';
        
        const weekTitle = currentLang === 'fr' ? week.title.fr : week.title.en;
        
        return `
            <div class="timeline-week">
                <div class="week-header">
                    <h4>${weekTitle}</h4>
                    <span class="week-number">${currentLang === 'fr' ? 'Semaine' : 'Week'} ${index + 1}</span>
                </div>
                <div class="week-content">
                    <div class="week-tasks">
                        <h5>${t('tasks')}</h5>
                        <ul>
                            ${week.tasks.map(task => `<li>${task}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="week-deliverables">
                        <h5>${t('deliverables')}</h5>
                        <ul>
                            ${week.deliverables.map(deliverable => `<li>${deliverable}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Generate milestones HTML with translations
 */
function generateMilestones(milestones) {
    if (!milestones) return '';
    const currentLang = document.body.getAttribute('data-current-lang') || 'fr';
    
    return milestones.map(milestone => {
        const description = currentLang === 'fr' ? milestone.description.fr : milestone.description.en;
        const statusText = milestone.status === 'completed' ? t('completed') : 
                          milestone.status === 'pending' ? t('pending') : t('upcoming');
        
        return `
            <div class="milestone-item ${milestone.status}">
                <div class="milestone-icon">${ProposalDataHelpers.getMilestoneIcon(milestone.status)}</div>
                <div class="milestone-content">
                    <h4>${description}</h4>
                    <span class="milestone-status">${statusText}</span>
                    ${milestone.date ? `<span class="milestone-date">${ProposalDataHelpers.formatDate(milestone.date)}</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Generate timeline weeks HTML
 */
function generateTimelineWeeks(timeline) {
    const weeks = ['week_1', 'week_2', 'week_3'];
    
    return weeks.map((weekKey, index) => {
        const week = timeline[weekKey];
        if (!week) return '';
        
        return `
            <div class="timeline-week">
                <div class="week-header">
                    <h4>${week.title.fr}</h4>
                    <span class="week-number">Semaine ${index + 1}</span>
                </div>
                <div class="week-content">
                    <div class="week-tasks">
                        <h5 data-fr="Tâches" data-en="Tasks">Tâches</h5>
                        <ul>
                            ${week.tasks.map(task => `<li>${task}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="week-deliverables">
                        <h5 data-fr="Livrables" data-en="Deliverables">Livrables</h5>
                        <ul>
                            ${week.deliverables.map(deliverable => `<li>${deliverable}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Generate milestones HTML
 */
function generateMilestones(milestones) {
    if (!milestones) return '';
    
    return milestones.map(milestone => `
        <div class="milestone-item ${milestone.status}">
            <div class="milestone-icon">${ProposalDataHelpers.getMilestoneIcon(milestone.status)}</div>
            <div class="milestone-content">
                <h4>${milestone.description.fr}</h4>
                <span class="milestone-status">${milestone.status}</span>
                ${milestone.date ? `<span class="milestone-date">${ProposalDataHelpers.formatDate(milestone.date)}</span>` : ''}
            </div>
        </div>
    `).join('');
}

/**
 * Populate Add-ons Tab
 */
async function populateAddonsTab(proposalData) {
    const addonsTab = document.getElementById('addons-tab');
    if (!addonsTab || !proposalData) return;

    const addonsContent = addonsTab.querySelector('.addons-content');
    if (!addonsContent) return;

    const addons = proposalData.addons;
    
    addonsContent.innerHTML = `
        <h2>${t('available_addons')}</h2>
        
        <div class="addons-intro">
            <p>${t('enhance_package')}</p>
            <div class="addon-note">
                <span class="note-icon">💡</span>
                <span>${t('addon_note')}</span>
            </div>
        </div>
        
        <div class="addons-grid">
            ${generateAddonsCards(addons)}
        </div>
        
        <div class="addons-summary">
            <div class="summary-card">
                <h3>${t('options_summary')}</h3>
                <div class="summary-stats">
                    <div class="stat">
                        <span class="stat-number">6</span>
                        <span class="stat-label">${t('available_options')}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">+1-2</span>
                        <span class="stat-label">${t('weeks_timeline')}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">150,000</span>
                        <span class="stat-label">${t('total_options_price')}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="addons-contact">
            <div class="contact-card">
                <h3>${t('interested_in_addons')}</h3>
                <p>${t('discuss_options_desc')}</p>
                <div class="contact-actions">
                    <button onclick="openWhatsApp()" class="addon-contact-btn primary">
                        💬 <span>${t('discuss_options')}</span>
                    </button>
                    <button onclick="openWhatsApp()" class="addon-contact-btn secondary">
                        📋 <span>${t('request_custom_quote')}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generate add-ons cards HTML with translations
 */
function generateAddonsCards(addons) {
    if (!addons) return '';
    const currentLang = document.body.getAttribute('data-current-lang') || 'fr';
    
    return Object.entries(addons).map(([key, addon]) => {
        const title = currentLang === 'fr' ? addon.title.fr : addon.title.en;
        const description = currentLang === 'fr' ? addon.description.fr : addon.description.en;
        const timelineText = currentLang === 'fr' ? 'Délai supplémentaire:' : 'Additional timeline:';
        const weekText = currentLang === 'fr' ? 'semaine' : 'week';
        const weeksText = currentLang === 'fr' ? 'semaines' : 'weeks';
        
        return `
            <div class="addon-card">
                <div class="addon-header">
                    <h4 class="addon-title">${title}</h4>
                    <span class="addon-price">+${ProposalDataHelpers.formatCurrency(addon.price)}</span>
                </div>
                <p class="addon-description">${description}</p>
                <div class="addon-timeline">
                    <span>${timelineText}</span>
                    <strong>${addon.timeline_weeks} ${addon.timeline_weeks > 1 ? weeksText : weekText}</strong>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Generate add-ons cards HTML
 */
function generateAddonsCards(addons) {
    if (!addons) return '';
    
    return Object.entries(addons).map(([key, addon]) => `
        <div class="addon-card">
            <div class="addon-header">
                <h4 class="addon-title">${addon.title.fr}</h4>
                <span class="addon-price">+${ProposalDataHelpers.formatCurrency(addon.price)}</span>
            </div>
            <p class="addon-description">${addon.description.fr}</p>
            <div class="addon-timeline">
                <span data-fr="Délai supplémentaire:" data-en="Additional timeline:">Délai supplémentaire:</span>
                <strong>${addon.timeline_weeks} semaine${addon.timeline_weeks > 1 ? 's' : ''}</strong>
            </div>
        </div>
    `).join('');
}

/**
 * Populate Next Steps Tab
 */
async function populateNextStepsTab(proposalData, projectStatus) {
    const nextStepsTab = document.getElementById('nextsteps-tab');
    if (!nextStepsTab || !proposalData) return;

    const nextStepsContent = nextStepsTab.querySelector('.nextsteps-content');
    if (!nextStepsContent) return;

    const nextSteps = proposalData.nextSteps;
    
    nextStepsContent.innerHTML = `
        <h2 data-fr="Prochaines Étapes" data-en="Next Steps">Prochaines Étapes</h2>
        
        <div class="next-steps-overview">
            <div class="status-summary">
                <h3 data-fr="Statut Actuel" data-en="Current Status">Statut Actuel</h3>
                <div class="status-card ${ProposalDataHelpers.getStatusClass(projectStatus.status)}">
                    <span class="status-label" data-fr="Proposition envoyée" data-en="Proposal sent">Proposition envoyée</span>
                    <span class="status-description" data-fr="En attente de votre confirmation" data-en="Awaiting your confirmation">En attente de votre confirmation</span>
                </div>
            </div>
        </div>
        
        <div class="immediate-actions">
            <h3 data-fr="Actions Immédiates Requises" data-en="Immediate Actions Required">Actions Immédiates Requises</h3>
            <div class="actions-grid">
                ${generateImmediateActions(nextSteps.immediate_actions)}
            </div>
        </div>
        
        <div class="content-requirements">
            <h3 data-fr="Préparation du Contenu" data-en="Content Preparation">Préparation du Contenu</h3>
            <div class="requirements-grid">
                ${generateContentRequirements(nextSteps.content_requirements)}
            </div>
        </div>
        
        <div class="confirmation-section">
            <div class="confirmation-card">
                <h3 data-fr="Prêt à Commencer ?" data-en="Ready to Start?">Prêt à Commencer ?</h3>
                <p data-fr="Contactez Kevin pour confirmer votre participation et planifier le démarrage" data-en="Contact Kevin to confirm your participation and schedule the start">
                    Contactez Kevin pour confirmer votre participation et planifier le démarrage
                </p>
                <div class="confirmation-actions">
                    <button onclick="openWhatsApp()" class="primary-action-btn">
                        🚀 <span data-fr="Confirmer et Démarrer" data-en="Confirm and Start">Confirmer et Démarrer</span>
                    </button>
                    <button onclick="downloadProposal()" class="secondary-action-btn">
                        📄 <span data-fr="Télécharger la Proposition" data-en="Download Proposal">Télécharger la Proposition</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generate immediate actions HTML
 */
function generateImmediateActions(actions) {
    if (!actions) return '';
    
    const actionLabels = {
        domain_choice: { fr: 'Choisir le nom de domaine', en: 'Choose domain name' },
        business_information_gathering: { fr: 'Rassembler les informations business', en: 'Gather business information' },
        visual_content_preparation: { fr: 'Préparer le contenu visuel', en: 'Prepare visual content' },
        payment_processing_setup: { fr: 'Configuration du paiement', en: 'Payment setup' }
    };
    
    return actions.map(action => {
        const label = actionLabels[action.task]?.fr || action.task;
        const completed = action.completed;
        
        return `
            <div class="action-item ${completed ? 'completed' : 'pending'}">
                <div class="action-icon">${completed ? '✅' : '📋'}</div>
                <div class="action-content">
                    <h4>${label}</h4>
                    <span class="action-status">${completed ? 'Terminé' : 'À faire'}</span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Generate content requirements HTML
 */
function generateContentRequirements(requirements) {
    if (!requirements) return '';
    
    const reqLabels = {
        logo_available: { fr: 'Logo disponible', en: 'Logo available' },
        photos_ready: { fr: 'Photos prêtes', en: 'Photos ready' },
        business_registration_info: { fr: 'Informations d\'enregistrement', en: 'Registration info' },
        bank_account_details: { fr: 'Détails du compte bancaire', en: 'Bank account details' }
    };
    
    return Object.entries(requirements).map(([key, status]) => {
        const label = reqLabels[key]?.fr || key;
        
        return `
            <div class="requirement-item ${status ? 'ready' : 'needed'}">
                <div class="requirement-icon">${status ? '✅' : '📋'}</div>
                <div class="requirement-content">
                    <h4>${label}</h4>
                    <span class="requirement-status">${status ? 'Prêt' : 'Requis'}</span>
                </div>
            </div>
        `;
    }).join('');
}

// =================================================================
// TAB NAVIGATION SYSTEM
// =================================================================

/**
 * Initialize tab navigation functionality
 */
function initializeTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    // Set initial active tab
    switchTab('overview');
}

/**
 * Switch to specific tab
 */
function switchTab(tabName) {
    portalState.setLoading('tabSwitching', true);
    
    // Update state
    portalState.setTab(tabName);
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });
    
    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === `${tabName}-tab`);
    });
    
    // Track tab switch
    if (typeof gtag !== 'undefined') {
        gtag('event', 'tab_switch', {
            'event_category': 'Client Portal',
            'event_label': tabName,
            'value': 1
        });
    }
    
    setTimeout(() => {
        portalState.setLoading('tabSwitching', false);
    }, 150);
}

// =================================================================
// QUICK ACTIONS
// =================================================================

/**
 * Open WhatsApp chat with Kevin
 */
function openWhatsApp() {
    const message = encodeURIComponent('Bonjour Kevin, je souhaite discuter de ma proposition Manea Lagoon Adventures.');
    const whatsappUrl = `https://wa.me/message/KV63JSQ3YRHFC1?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Track WhatsApp contact
    if (typeof gtag !== 'undefined') {
        gtag('event', 'whatsapp_contact', {
            'event_category': 'Client Portal',
            'event_label': 'Quick Action',
            'value': 1
        });
    }
}

/**
 * Download proposal as PDF (placeholder - would integrate with PDF generation)
 */
function downloadProposal() {
    const currentLang = document.body.getAttribute('data-current-lang') || 'fr';
    const messages = {
        fr: 'La fonction de téléchargement PDF sera bientôt disponible. En attendant, contactez Kevin via WhatsApp pour recevoir votre proposition en PDF.',
        en: 'PDF download feature will be available soon. Meanwhile, contact Kevin via WhatsApp to receive your proposal as PDF.'
    };
    
    alert(messages[currentLang]);
    
    // Track download attempt
    if (typeof gtag !== 'undefined') {
        gtag('event', 'pdf_download_attempt', {
            'event_category': 'Client Portal',
            'event_label': 'Quick Action',
            'value': 1
        });
    }
}

/**
 * Share proposal (placeholder - would integrate with Web Share API)
 */
function shareProposal() {
    const currentLang = document.body.getAttribute('data-current-lang') || 'fr';
    
    const shareData = {
        fr: {
            title: 'Manea Lagoon Adventures - Proposition VAI Studio',
            text: 'Découvrez ma proposition de transformation digitale avec VAI Studio'
        },
        en: {
            title: 'Manea Lagoon Adventures - VAI Studio Proposal', 
            text: 'Discover my digital transformation proposal with VAI Studio'
        }
    };
    
    const clipboardMessages = {
        fr: 'Lien copié dans le presse-papiers!',
        en: 'Link copied to clipboard!'
    };
    
    const errorMessages = {
        fr: 'Impossible de copier le lien. URL: ',
        en: 'Unable to copy link. URL: '
    };
    
    if (navigator.share) {
        navigator.share({
            title: shareData[currentLang].title,
            text: shareData[currentLang].text,
            url: window.location.href
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: copy URL to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert(clipboardMessages[currentLang]);
        }).catch(() => {
            alert(errorMessages[currentLang] + window.location.href);
        });
    }
    
    // Track share
    if (typeof gtag !== 'undefined') {
        gtag('event', 'proposal_share', {
            'event_category': 'Client Portal',
            'event_label': 'Quick Action',
            'value': 1
        });
    }
}

// =================================================================
// LANGUAGE INTEGRATION
// =================================================================

/**
 * Update language-specific content
 */
function updateLanguageContent() {
    const currentLang = document.body.getAttribute('data-current-lang') || 'fr';
    portalState.setLanguage(currentLang);
    
    // Update all elements with language attributes
    document.querySelectorAll('[data-fr][data-en]').forEach(element => {
        const text = element.getAttribute(`data-${currentLang}`);
        if (text) {
            element.textContent = text;
        }
    });
    
    // Update placeholder texts
    document.querySelectorAll('[data-fr-placeholder][data-en-placeholder]').forEach(element => {
        const placeholder = element.getAttribute(`data-${currentLang}-placeholder`);
        if (placeholder) {
            element.placeholder = placeholder;
        }
    });
}

/**
 * Generate immediate actions HTML with translations
 */
function generateImmediateActions(actions) {
    if (!actions) return '';
    const currentLang = document.body.getAttribute('data-current-lang') || 'fr';
    
    const actionLabels = {
        domain_choice: { 
            fr: 'Choisir le nom de domaine', 
            en: 'Choose domain name' 
        },
        business_information_gathering: { 
            fr: 'Rassembler les informations business', 
            en: 'Gather business information' 
        },
        visual_content_preparation: { 
            fr: 'Préparer le contenu visuel', 
            en: 'Prepare visual content' 
        },
        payment_processing_setup: { 
            fr: 'Configuration du paiement', 
            en: 'Payment setup' 
        }
    };
    
    return actions.map(action => {
        const label = actionLabels[action.task] ? actionLabels[action.task][currentLang] : action.task;
        const completed = action.completed;
        const statusText = currentLang === 'fr' ? 
            (completed ? 'Terminé' : 'À faire') : 
            (completed ? 'Completed' : 'To do');
        
        return `
            <div class="action-item ${completed ? 'completed' : 'pending'}">
                <div class="action-icon">${completed ? '✅' : '📋'}</div>
                <div class="action-content">
                    <h4>${label}</h4>
                    <span class="action-status">${statusText}</span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Generate content requirements HTML with translations
 */
function generateContentRequirements(requirements) {
    if (!requirements) return '';
    const currentLang = document.body.getAttribute('data-current-lang') || 'fr';
    
    const reqLabels = {
        logo_available: { 
            fr: 'Logo disponible', 
            en: 'Logo available' 
        },
        photos_ready: { 
            fr: 'Photos prêtes', 
            en: 'Photos ready' 
        },
        business_registration_info: { 
            fr: 'Informations d\'enregistrement', 
            en: 'Registration info' 
        },
        bank_account_details: { 
            fr: 'Détails du compte bancaire', 
            en: 'Bank account details' 
        }
    };
    
    return Object.entries(requirements).map(([key, status]) => {
        const label = reqLabels[key] ? reqLabels[key][currentLang] : key;
        const statusText = currentLang === 'fr' ? 
            (status ? 'Prêt' : 'Requis') : 
            (status ? 'Ready' : 'Required');
        
        return `
            <div class="requirement-item ${status ? 'ready' : 'needed'}">
                <div class="requirement-icon">${status ? '✅' : '📋'}</div>
                <div class="requirement-content">
                    <h4>${label}</h4>
                    <span class="requirement-status">${statusText}</span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Refresh all dynamic content when language changes
 */
async function refreshDynamicContent() {
    try {
        if (!window.clientPortalAPI || !window.clientPortalAPI.isAuthenticated) {
            return;
        }
        
        const clientData = window.clientPortalAPI.clientData;
        const proposalData = window.clientPortalAPI.getProposalData();
        const projectStatus = window.clientPortalAPI.getProjectStatus();
        
        if (!proposalData) return;
        
        // Refresh all tabs with new language
        await populateOverviewTab(proposalData, projectStatus);
        await populateInvestmentTab(proposalData);
        await populateTimelineTab(proposalData, projectStatus);
        await populateAddonsTab(proposalData);
        await populateNextStepsTab(proposalData, projectStatus);
        
        console.log('✅ Dynamic content refreshed for language change');
    } catch (error) {
        console.error('❌ Error refreshing dynamic content:', error);
    }
}

/**
 * Override global language switch to update portal content
 */
const originalSwitchLanguage = window.switchLanguage;
window.switchLanguage = function(lang) {
    // Call original function
    if (originalSwitchLanguage) {
        originalSwitchLanguage(lang);
    }
    
    // Update portal-specific content
    setTimeout(() => {
        refreshDynamicContent();
    }, 100); // Small delay to ensure language attribute is updated
};

// =================================================================
// UTILITY FUNCTIONS
// =================================================================

/**
 * Show error message to user
 */
function showErrorMessage(message) {
    // Create or update error notification
    let errorDiv = document.getElementById('portal-error');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'portal-error';
        errorDiv.className = 'portal-notification error';
        document.body.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

/**
 * Update progress timeline with real milestone data
 */
function updateProgressTimeline(container, milestones) {
    if (!container || !milestones) return;
    
    container.innerHTML = milestones.map(milestone => `
        <div class="progress-step ${milestone.status}">
            <div class="step-icon">${ProposalDataHelpers.getMilestoneIcon(milestone.status)}</div>
            <div class="step-content">
                <h4>${milestone.description.fr}</h4>
                <p>${milestone.status === 'completed' ? 'Terminé' : 'En attente'}</p>
            </div>
        </div>
    `).join('');
}

// =================================================================
// INITIALIZATION
// =================================================================

/**
 * Initialize portal when DOM is ready
 */
function initializePortal() {
    console.log('🚀 Initializing VAI Studio Client Portal...');
    
    // Add event listeners
    const passwordInput = document.getElementById('clientPassword');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', handlePasswordKeyPress);
    }
    
    // Check if client is already authenticated
    if (window.clientPortalAPI && window.clientPortalAPI.isAuthenticated) {
        document.getElementById('passwordScreen').style.display = 'none';
        document.getElementById('dashboardContent').style.display = 'block';
        initializeDashboard();
    }
    
    // Update initial language content
    updateLanguageContent();
    
    console.log('✅ Client Portal initialized successfully');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePortal);
} else {
    initializePortal();
}

// =================================================================
// GLOBAL EXPORTS
// =================================================================

// Export functions for global access
window.togglePasswordVisibility = togglePasswordVisibility;
window.toggleServiceDetails = toggleServiceDetails;
window.checkClientAccess = checkClientAccess;
window.switchTab = switchTab;
window.openWhatsApp = openWhatsApp;
window.downloadProposal = downloadProposal;
window.shareProposal = shareProposal;
window.portalState = portalState;

console.log('📱 VAI Studio Client Portal functionality loaded successfully');