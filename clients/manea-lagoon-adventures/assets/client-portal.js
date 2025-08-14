// VAI Studio Client Portal JavaScript
// Handles authentication, data loading, and interactions

// =================================================================
// 1. CONFIGURATION & CONSTANTS
// =================================================================

const CLIENT_SLUG = 'manea-lagoon-adventures';
const CORRECT_PASSWORD = 'maneaVAI2025';
const SUPABASE_URL = 'https://rizqwxcmpzhdmqjjqgyw.supabase.co'; // Replace with your actual URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpenF3eGNtcHpoZG1xampxZ3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MDM3MTIsImV4cCI6MjA2NjI3OTcxMn0.dlNpxINvs2yzlFQndTZIrfQTBgWpQ5Ee0aPGVwRPHo0'; // Replace with your actual key

// Global state
let clientData = null;
let isAuthenticated = false;

// =================================================================
// 2. AUTHENTICATION SYSTEM
// =================================================================

/**
 * Check if user is already authenticated
 */
function checkExistingAuth() {
    const savedAuth = localStorage.getItem(`client_auth_${CLIENT_SLUG}`);
    const authTimestamp = localStorage.getItem(`client_auth_timestamp_${CLIENT_SLUG}`);
    
    // Check if auth is less than 24 hours old
    if (savedAuth && authTimestamp) {
        const now = Date.now();
        const authTime = parseInt(authTimestamp);
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (now - authTime < twentyFourHours && savedAuth === 'authenticated') {
            isAuthenticated = true;
            hidePasswordModal();
            loadClientData();
            return true;
        }
    }
    
    return false;
}

/**
 * Check password and authenticate user
 */
function checkPassword() {
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    const enteredPassword = passwordInput.value.trim();
    
    if (enteredPassword === CORRECT_PASSWORD) {
        // Store authentication
        localStorage.setItem(`client_auth_${CLIENT_SLUG}`, 'authenticated');
        localStorage.setItem(`client_auth_timestamp_${CLIENT_SLUG}`, Date.now().toString());
        
        isAuthenticated = true;
        hidePasswordModal();
        loadClientData();
        
        // Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'client_portal_access', {
                'event_category': 'Client Portal',
                'event_label': CLIENT_SLUG,
                'value': 1
            });
        }
    } else {
        passwordError.classList.add('show');
        passwordInput.value = '';
        passwordInput.focus();
        
        // Shake animation
        passwordInput.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            passwordInput.style.animation = '';
        }, 500);
    }
}

/**
 * Hide password modal and show main content
 */
function hidePasswordModal() {
    const modal = document.getElementById('passwordModal');
    const mainContent = document.getElementById('mainContent');
    
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.display = 'none';
        mainContent.style.display = 'block';
        mainContent.style.opacity = '0';
        setTimeout(() => {
            mainContent.style.opacity = '1';
        }, 50);
    }, 300);
}

/**
 * Handle Enter key in password input
 */
function setupPasswordInput() {
    const passwordInput = document.getElementById('passwordInput');
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
    
    // Clear error on input
    passwordInput.addEventListener('input', function() {
        const passwordError = document.getElementById('passwordError');
        passwordError.classList.remove('show');
    });
}

// =================================================================
// 3. DATA LOADING & SUPABASE INTEGRATION
// =================================================================

/**
 * Load client data from Supabase
 */
async function loadClientData() {
    try {
        showLoadingState();
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/vai_studio_clients?slug=eq.${CLIENT_SLUG}&select=*`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            clientData = data[0];
            populateClientData();
            hideLoadingState();
            
            // Track portal view
            updatePortalView();
        } else {
            throw new Error('Client data not found');
        }
        
    } catch (error) {
        console.error('Error loading client data:', error);
        showErrorState();
    }
}

/**
 * Update portal view count
 */
async function updatePortalView() {
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/vai_studio_clients?slug=eq.${CLIENT_SLUG}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                portal_views: (clientData.portal_views || 0) + 1,
                last_accessed_at: new Date().toISOString(),
                last_updated_by: 'client'
            })
        });
    } catch (error) {
        console.error('Error updating portal view:', error);
    }
}

/**
 * Show loading state
 */
function showLoadingState() {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 4rem; color: var(--text-secondary);">
                <div style="font-size: 2rem; margin-bottom: 1rem;">🌺</div>
                <p>Chargement de ton portail personnalisé...</p>
                <p style="font-size: 0.9rem;">Loading your personalized portal...</p>
            </div>
        `;
        mainContent.style.display = 'block';
    }
}

/**
 * Show error state
 */
function showErrorState() {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 4rem; color: var(--text-secondary);">
                <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
                <p><span data-lang="fr">Erreur de chargement des données</span><span data-lang="en">Error loading data</span></p>
                <p style="font-size: 0.9rem;"><span data-lang="fr">Contacte VAI Studio si le problème persiste</span><span data-lang="en">Contact VAI Studio if the problem persists</span></p>
                <a href="https://wa.me/68987269065" style="color: var(--primary-blue); text-decoration: none;">WhatsApp VAI Studio</a>
            </div>
        `;
        mainContent.style.display = 'block';
    }
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    // Content is populated, loading state is replaced
}

// =================================================================
// 4. CONTENT POPULATION
// =================================================================

/**
 * Populate all dynamic content from database
 */
function populateClientData() {
    if (!clientData || !clientData.proposal_data) {
        showErrorState();
        return;
    }
    
    const data = clientData.proposal_data;
    const currentLang = document.body.getAttribute('data-current-lang') || 'fr';
    
    // Update investment overview
    populateInvestmentOverview();
    
    // Populate cost breakdown
    populateCostBreakdown(data.cost_breakdown, data.monthly_costs);
    
    // Populate add-ons
    populateAddons(data.addons_available);
    
    // Populate timeline
    populateTimeline(data.timeline);
    
    // Populate domain suggestions
    populateDomainSuggestions(data.technical_specifications.domain_suggestions);
    
    // Auto-expand first section
    setTimeout(() => {
        const firstSection = document.querySelector('.proposal-section');
        if (firstSection) {
            toggleSection(firstSection.id);
        }
    }, 500);
}

/**
 * Populate investment overview cards
 */
function populateInvestmentOverview() {
    const totalInvestmentEl = document.getElementById('totalInvestment');
    const monthlyCostsEl = document.getElementById('monthlyCosts');
    
    if (totalInvestmentEl) {
        totalInvestmentEl.textContent = `${clientData.total_investment_xpf.toLocaleString()} XPF`;
    }
    
    if (monthlyCostsEl) {
        monthlyCostsEl.textContent = `${clientData.monthly_costs_xpf.toLocaleString()} XPF`;
    }
}

/**
 * Populate cost breakdown section
 */
function populateCostBreakdown(costBreakdown, monthlyCosts) {
    const currentLang = document.body.getAttribute('data-current-lang') || 'fr';
    
    // One-time costs
    const oneTimeCostsEl = document.getElementById('oneTimeCosts');
    if (oneTimeCostsEl && costBreakdown) {
        let html = '';
        
        Object.entries(costBreakdown).forEach(([key, item]) => {
            if (key !== 'total' && item.amount) {
                const label = item.label && item.label[currentLang] ? item.label[currentLang] : key;
                html += `
                    <div class="cost-item">
                        <span class="cost-label">${label}</span>
                        <span class="cost-amount">${item.amount.toLocaleString()} XPF</span>
                    </div>
                `;
            }
        });
        
        // Add total
        if (costBreakdown.total) {
            html += `
                <div class="cost-item">
                    <span class="cost-label"><strong>
                        <span data-lang="fr">Total</span>
                        <span data-lang="en">Total</span>
                    </strong></span>
                    <span class="cost-amount"><strong>${costBreakdown.total.toLocaleString()} XPF</strong></span>
                </div>
            `;
        }
        
        oneTimeCostsEl.innerHTML = html;
    }
    
    // Monthly costs
    const monthlyCostsListEl = document.getElementById('monthlyCostsList');
    if (monthlyCostsListEl && monthlyCosts) {
        let html = '';
        
        Object.entries(monthlyCosts).forEach(([key, item]) => {
            if (key !== 'total' && item.amount) {
                const label = item.label && item.label[currentLang] ? item.label[currentLang] : key;
                html += `
                    <div class="cost-item">
                        <span class="cost-label">${label}</span>
                        <span class="cost-amount">${item.amount.toLocaleString()} XPF</span>
                    </div>
                `;
            }
        });
        
        // Add total
        if (monthlyCosts.total) {
            html += `
                <div class="cost-item">
                    <span class="cost-label"><strong>
                        <span data-lang="fr">Total Mensuel</span>
                        <span data-lang="en">Monthly Total</span>
                    </strong></span>
                    <span class="cost-amount"><strong>${monthlyCosts.total.toLocaleString()} XPF</strong></span>
                </div>
            `;
        }
        
        monthlyCostsListEl.innerHTML = html;
    }
}

/**
 * Populate add-ons section
 */
function populateAddons(addons) {
    const currentLang = document.body.getAttribute('data-current-lang') || 'fr';
    const addonsGridEl = document.getElementById('addonsGrid');
    
    if (addonsGridEl && addons) {
        let html = '';
        
        Object.entries(addons).forEach(([key, addon]) => {
            const title = addon.title && addon.title[currentLang] ? addon.title[currentLang] : key;
            const description = addon.description && addon.description[currentLang] ? addon.description[currentLang] : '';
            
            html += `
                <div class="addon-card">
                    <div class="addon-header">
                        <h3 class="addon-title">${title}</h3>
                        <div class="addon-price">+${addon.price.toLocaleString()} XPF</div>
                    </div>
                    <p class="addon-description">${description}</p>
                    <div class="addon-timeline">
                        <small style="color: var(--text-light);">
                            <span data-lang="fr">Délai: ${addon.timeline_weeks} semaine${addon.timeline_weeks > 1 ? 's' : ''}</span>
                            <span data-lang="en">Timeline: ${addon.timeline_weeks} week${addon.timeline_weeks > 1 ? 's' : ''}</span>
                        </small>
                    </div>
                </div>
            `;
        });
        
        addonsGridEl.innerHTML = html;
    }
}

/**
 * Populate timeline section
 */
function populateTimeline(timeline) {
    const currentLang = document.body.getAttribute('data-current-lang') || 'fr';
    const timelineContainerEl = document.getElementById('timelineContainer');
    
    if (timelineContainerEl && timeline) {
        let html = '';
        
        ['week_1', 'week_2', 'week_3'].forEach(weekKey => {
            const week = timeline[weekKey];
            if (week) {
                const title = week.title && week.title[currentLang] ? week.title[currentLang] : week.title;
                
                html += `
                    <div class="timeline-week">
                        <h3 class="week-title">${title}</h3>
                        <ul class="week-tasks">
                `;
                
                if (week.tasks && Array.isArray(week.tasks)) {
                    week.tasks.forEach(task => {
                        html += `<li>${task}</li>`;
                    });
                }
                
                html += `</ul>`;
                
                if (week.deliverables && Array.isArray(week.deliverables)) {
                    html += `
                        <div class="week-deliverables">
                            <h4>
                                <span data-lang="fr">Livrables:</span>
                                <span data-lang="en">Deliverables:</span>
                            </h4>
                            <ul>
                    `;
                    
                    week.deliverables.forEach(deliverable => {
                        html += `<li>${deliverable}</li>`;
                    });
                    
                    html += `</ul></div>`;
                }
                
                html += `</div>`;
            }
        });
        
        timelineContainerEl.innerHTML = html;
    }
}

/**
 * Populate domain suggestions
 */
function populateDomainSuggestions(domains) {
    const currentLang = document.body.getAttribute('data-current-lang') || 'fr';
    const domainSuggestionsEl = document.getElementById('domainSuggestions');
    
    if (domainSuggestionsEl && domains && Array.isArray(domains)) {
        let html = '';
        
        domains.forEach(domain => {
            const notes = domain.notes && domain.notes[currentLang] ? domain.notes[currentLang] : '';
            const recommended = domain.recommended ? 'recommended' : '';
            
            html += `
                <div class="domain-suggestion ${recommended}">
                    <div class="domain-name">${domain.name}</div>
                    <div class="domain-status">
                        <span data-lang="fr">Disponible</span>
                        <span data-lang="en">Available</span>
                    </div>
                    ${notes ? `<div class="domain-recommendation">${notes}</div>` : ''}
                    ${domain.recommended ? `
                        <div style="margin-top: 0.5rem;">
                            <span style="background: var(--accent-green); color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.7rem; font-weight: 600;">
                                <span data-lang="fr">RECOMMANDÉ</span>
                                <span data-lang="en">RECOMMENDED</span>
                            </span>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        domainSuggestionsEl.innerHTML = html;
    }
}

// =================================================================
// 5. INTERACTIVE FEATURES
// =================================================================

/**
 * Toggle proposal section expand/collapse
 */
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.toggle('expanded');
        
        // Analytics
        if (typeof gtag !== 'undefined') {
            const isExpanded = section.classList.contains('expanded');
            gtag('event', 'section_toggle', {
                'event_category': 'Client Portal',
                'event_label': sectionId,
                'value': isExpanded ? 1 : 0
            });
        }
    }
}

/**
 * Handle language switching updates
 */
function updateContentForLanguage() {
    if (clientData && clientData.proposal_data) {
        // Re-populate dynamic content that depends on language
        populateClientData();
    }
}

// =================================================================
// 6. INITIALIZATION & EVENT HANDLERS
// =================================================================

/**
 * Initialize the portal
 */
function initPortal() {
    // Check for existing authentication
    if (!checkExistingAuth()) {
        // Setup password input handlers
        setupPasswordInput();
        
        // Focus password input
        setTimeout(() => {
            const passwordInput = document.getElementById('passwordInput');
            if (passwordInput) {
                passwordInput.focus();
            }
        }, 100);
    }
    
    // Setup global event listeners
    setupEventListeners();
    
    // Override language switch function to update content
    if (typeof window.switchLanguage === 'function') {
        const originalSwitchLanguage = window.switchLanguage;
        window.switchLanguage = function(lang) {
            originalSwitchLanguage(lang);
            // Wait for DOM update then refresh content
            setTimeout(updateContentForLanguage, 100);
        };
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Handle browser back/forward
    window.addEventListener('popstate', function() {
        // Maintain authentication state
    });
    
    // Handle page unload
    window.addEventListener('beforeunload', function() {
        // Could save any form data here
    });
    
    // Handle visibility change
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && isAuthenticated) {
            // Update last accessed time when user returns to tab
            updatePortalView();
        }
    });
}

/**
 * Add shake animation to CSS dynamically
 */
function addShakeAnimation() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
}

// =================================================================
// 7. START APPLICATION
// =================================================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPortal);
} else {
    initPortal();
}

// Add shake animation CSS
addShakeAnimation();

// Make functions globally available
window.checkPassword = checkPassword;
window.toggleSection = toggleSection;