/* ========================================
   VAI PLATFORM - INDEPENDENT SCRIPT
   Self-contained, no dependencies on businessplan
   ======================================== */

let platformData = null;
let currentLang = 'en';

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('VAI Platform initializing...');
    initPlatform();
});

async function initPlatform() {
    try {
        // Fix: Ensure body is visible (loading screen may have hidden it)
        document.body.style.opacity = '1';
        document.body.style.visibility = 'visible';

        // Load content
        await loadPlatformContent();

        // Initialize interactive features
        initTabNavigation();
        initHeroCounters();
        initFeatureCards();
        initFilterSystem();
        initScrollAnimations();

        // Hide loading screen
        const loadingScreen = document.querySelector('.loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => loadingScreen.style.display = 'none', 300);
            }, 500);
        }

        console.log('VAI Platform initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize platform:', error);
    }
}

/* ========================================
   CONTENT LOADING
   ======================================== */
async function loadPlatformContent() {
    try {
        console.log('Loading platform content...');
        const response = await fetch(`/presentation/VAI/platform/${currentLang}.json`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        platformData = await response.json();
        console.log('Platform data loaded successfully');

        // Render content
        updateMetaData();
        renderAllTabs();

    } catch (error) {
        console.error('Error loading platform content:', error);
        showErrorMessage(error.message);
        throw error;
    }
}

function updateMetaData() {
    if (!platformData) return;

    // Update page title
    document.title = platformData.meta.title;

    // Update hero content
    const updates = {
        'platform-tagline': platformData.hero.tagline,
        'platform-subtitle': platformData.hero.subtitle,
        'stat-features': platformData.hero.stats.features.label,
        'stat-languages': platformData.hero.stats.languages.label,
        'stat-islands': platformData.hero.stats.islands.label,
        'stat-status': platformData.hero.stats.status.label,
        'cta-register-operator': platformData.hero.cta.register_operator,
        'cta-preregister': platformData.hero.cta.preregister,
        'cta-contact': platformData.hero.cta.contact
    };

    Object.entries(updates).forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    });

    // Update tab labels
    platformData.tabs.forEach(tab => {
        const tabElement = document.getElementById(`tab-${tab.id}`);
        if (tabElement) tabElement.textContent = tab.title;
    });
}

function renderAllTabs() {
    const tabContentContainer = document.getElementById('tab-content');
    if (!tabContentContainer) {
        console.error('Tab content container not found');
        return;
    }

    // Clear existing content (but keep the element intact)
    while (tabContentContainer.firstChild) {
        tabContentContainer.removeChild(tabContentContainer.firstChild);
    }

    platformData.tabs.forEach((tab, index) => {
        const tabPanel = document.createElement('div');
        tabPanel.id = tab.id;
        tabPanel.className = 'tab-panel';

        // Render each section in the tab
        let sectionsRendered = 0;
        tab.sections.forEach(section => {
            try {
                const sectionElement = renderSection(section);
                if (sectionElement) {
                    tabPanel.appendChild(sectionElement);
                    sectionsRendered++;
                }
            } catch (error) {
                console.error(`Error rendering section "${section.type}":`, error, section);
            }
        });

        tabContentContainer.appendChild(tabPanel);
    });
}

function showErrorMessage(message) {
    const tabContentContainer = document.getElementById('tab-content');
    if (tabContentContainer) {
        tabContentContainer.innerHTML = `
            <div style="padding: 3rem; text-align: center; color: #d32f2f;">
                <h2>⚠️ Error Loading Content</h2>
                <p>${message}</p>
                <p style="font-family: monospace; font-size: 0.9rem; margin-top: 1rem;">
                    Check the browser console for details.
                </p>
            </div>
        `;
    }
}

/* ========================================
   SECTION RENDERING ROUTER
   ======================================== */
function renderSection(section) {
    if (!section || !section.type) {
        console.warn('Invalid section:', section);
        return null;
    }

    // Route to appropriate renderer based on type
    const renderers = {
        'intro': renderIntro,
        'application-cards': renderApplicationCards,
        'technology-stack': renderTechnologyStack,
        'statistics': renderStatistics,
        'filter-system': renderFilterSystem,
        'feature-cards': renderFeatureCards,
        'workflow': renderWorkflows,
        'problem-solution-cards': renderProblemSolutionCards,
        'comparison-table': renderComparisonTable,
        'competitive-moat': renderCompetitiveMoat,
        'capability-metrics': renderCapabilityMetrics,
        'benchmark-table': renderBenchmarkTable,
        'architecture-overview': renderArchitectureOverview,
        'tech-stack-detailed': renderTechStackDetailed,
        'integration-ecosystem': renderIntegrationEcosystem,
        'expandable-warning': renderExpandableWarning,
        'cta-cards': renderCTACards,
        'founder-profile': renderFounderProfile,
        'social-media': renderSocialMedia
    };

    const renderer = renderers[section.type];
    if (renderer) {
        return renderer(section);
    } else {
        console.warn(`No renderer for section type: ${section.type}`);
        return null;
    }
}

/* ========================================
   SECTION RENDERERS
   ======================================== */

function renderIntro(section) {
    const div = document.createElement('div');
    div.className = 'intro-section';
    div.innerHTML = `
        <h2 class="section-title">${section.title || ''}</h2>
        ${section.subtitle ? `<p class="section-subtitle">${section.subtitle}</p>` : ''}
    `;
    return div;
}

function renderApplicationCards(section) {
    const div = document.createElement('div');
    div.className = 'application-cards-section';

    const grid = document.createElement('div');
    grid.className = 'application-grid';

    (section.applications || []).forEach(app => {
        const card = document.createElement('div');
        card.className = 'application-card';
        card.innerHTML = `
            <div class="app-card-header">
                <i class="fas ${app.icon}"></i>
                <h3>${app.name}</h3>
                ${app.status ? `<span class="status-badge ${app.status}">${app.status}</span>` : ''}
            </div>
            <p class="app-tagline">${app.description || app.tagline || ''}</p>
            ${app.url ? `<a href="https://${app.url}" target="_blank" class="app-url">${app.url}</a>` : ''}
            ${app.features ? `
                <div class="app-features">
                    <h4>Key Features:</h4>
                    <ul>${app.features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}</ul>
                </div>
            ` : ''}
        `;
        grid.appendChild(card);
    });

    div.appendChild(grid);
    return div;
}

function renderTechnologyStack(section) {
    const div = document.createElement('div');
    div.className = 'tech-stack-section';
    if (section.title) {
        div.innerHTML = `<h3>${section.title}</h3>`;
    }

    const grid = document.createElement('div');
    grid.className = 'tech-stack-grid';

    (section.stack || []).forEach(tech => {
        grid.innerHTML += `
            <div class="tech-item">
                <i class="fab ${tech.icon}"></i>
                <span>${tech.name}</span>
            </div>
        `;
    });

    div.appendChild(grid);
    return div;
}

function renderStatistics(section) {
    const div = document.createElement('div');
    div.className = 'statistics-section';
    if (section.title) {
        div.innerHTML = `<h3>${section.title}</h3>`;
    }

    const grid = document.createElement('div');
    grid.className = 'stats-grid';

    (section.items || []).forEach(stat => {
        grid.innerHTML += `
            <div class="stat-card">
                <i class="fas ${stat.icon}"></i>
                <div class="stat-number" data-target="${stat.value}">${stat.value}</div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `;
    });

    div.appendChild(grid);
    return div;
}

function renderFilterSystem(section) {
    const div = document.createElement('div');
    div.className = 'filter-system-section';

    const filterBar = document.createElement('div');
    filterBar.className = 'filter-controls';

    const buttons = (section.categories || []).map(cat =>
        `<button class="filter-btn" data-filter="${cat.id}">
            <i class="fas ${cat.icon}"></i> ${cat.name}
        </button>`
    ).join('');

    filterBar.innerHTML = `
        <div class="filter-buttons">
            ${buttons}
            <button class="clear-filters">Clear All</button>
        </div>
    `;

    div.appendChild(filterBar);
    return div;
}

function renderFeatureCards(section) {
    const div = document.createElement('div');
    div.className = 'feature-cards-section';

    const grid = document.createElement('div');
    grid.className = 'feature-grid';

    (section.features || []).forEach(feature => {
        const card = document.createElement('div');
        card.className = 'feature-card';
        card.setAttribute('data-filter-category', feature.category || '');

        card.innerHTML = `
            <div class="feature-card-header">
                <i class="fas ${feature.icon}"></i>
                <h4>${feature.title}</h4>
                ${feature.status ? `<span class="status-badge ${feature.status}">${feature.status}</span>` : ''}
            </div>
            <div class="feature-card-body">
                <p>${feature.description}</p>
                ${feature.capabilities ? `
                    <ul class="feature-capabilities">
                        ${feature.capabilities.map(c => `<li>${c}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        `;

        grid.appendChild(card);
    });

    div.appendChild(grid);
    return div;
}

function renderWorkflows(section) {
    const div = document.createElement('div');
    div.className = 'workflows-section';

    (section.workflows || []).forEach(workflow => {
        const items = workflow.steps || workflow.phases || [];

        const workflowDiv = document.createElement('div');
        workflowDiv.className = 'workflow-container';

        workflowDiv.innerHTML = `
            <div class="workflow-header">
                <i class="fas ${workflow.icon}"></i>
                <h3>${workflow.title}</h3>
            </div>
            <div class="workflow-steps">
                ${items.map((item, idx) => `
                    <div class="workflow-step">
                        <div class="step-number">${item.number || item.phase || (idx + 1)}</div>
                        <div class="step-content">
                            <i class="fas ${item.icon || 'fa-circle'}"></i>
                            <h4>${item.title || ''}</h4>
                            <p>${item.description || ''}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        div.appendChild(workflowDiv);
    });

    return div;
}

function renderProblemSolutionCards(section) {
    const div = document.createElement('div');
    div.className = 'problem-solution-section';

    const grid = document.createElement('div');
    grid.className = 'problem-solution-grid';

    // Handle 'categories' structure (from JSON)
    const items = section.cards || section.categories || [];

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = `ps-card ${item.type || ''}`;

        card.innerHTML = `
            <div class="ps-header">
                <i class="fas ${item.icon}"></i>
                <h3>${item.title || item.category}</h3>
            </div>
            <ul class="ps-points">
                ${(item.points || item.items || []).map(p => `<li>${p}</li>`).join('')}
            </ul>
        `;

        grid.appendChild(card);
    });

    div.appendChild(grid);
    return div;
}

function renderComparisonTable(section) {
    const div = document.createElement('div');
    div.className = 'comparison-section';
    if (section.title) {
        div.innerHTML = `<h3>${section.title}</h3>`;
    }

    const table = document.createElement('table');
    table.className = 'comparison-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Feature / Metric</th>
                <th>VAI Platform</th>
                <th>Global OTAs</th>
            </tr>
        </thead>
        <tbody>
            ${(section.rows || []).map(row => `
                <tr>
                    <td><strong>${row.feature}</strong></td>
                    <td class="${row.advantage === 'vai' ? 'advantage' : ''}">${row.vai}</td>
                    <td class="${row.advantage === 'ota' ? 'advantage' : ''}">${row.ota}</td>
                </tr>
            `).join('')}
        </tbody>
    `;

    div.appendChild(table);
    return div;
}

function renderCompetitiveMoat(section) {
    const div = document.createElement('div');
    div.className = 'competitive-moat-section';
    if (section.title) {
        div.innerHTML = `<h3>${section.title}</h3>`;
    }

    const grid = document.createElement('div');
    grid.className = 'moat-grid';

    // Handle 'advantages' instead of 'moats'
    const items = section.moats || section.advantages || [];

    items.forEach(item => {
        grid.innerHTML += `
            <div class="moat-card">
                <i class="fas ${item.icon}"></i>
                <h4>${item.title || item.advantage}</h4>
                <p>${item.description || item.detail || ''}</p>
            </div>
        `;
    });

    div.appendChild(grid);
    return div;
}

function renderCapabilityMetrics(section) {
    const div = document.createElement('div');
    div.className = 'capability-metrics-section';

    if (section.intro) {
        div.innerHTML = `<p class="metrics-intro">${section.intro}</p>`;
    }

    const grid = document.createElement('div');
    grid.className = 'metrics-grid';

    // Handle 'categories' structure
    const items = section.metrics || [];
    if (section.categories) {
        section.categories.forEach(cat => {
            if (cat.metrics) items.push(...cat.metrics);
        });
    }

    items.forEach(metric => {
        grid.innerHTML += `
            <div class="metric-card">
                <i class="fas ${metric.icon}"></i>
                <div class="metric-value" data-count="${metric.target || metric.value}">${metric.target || metric.value}</div>
                <div class="metric-label">${metric.label || metric.metric}</div>
                ${metric.description ? `<div class="metric-description">${metric.description}</div>` : ''}
            </div>
        `;
    });

    div.appendChild(grid);
    return div;
}

function renderBenchmarkTable(section) {
    const div = document.createElement('div');
    div.className = 'benchmark-section';
    if (section.title) {
        div.innerHTML = `<h3>${section.title}</h3>`;
    }

    (section.categories || []).forEach(category => {
        const catDiv = document.createElement('div');
        catDiv.className = 'benchmark-category';
        catDiv.innerHTML = `<h4>${category.name}</h4>`;

        const table = document.createElement('table');
        table.className = 'benchmark-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>VAI Target</th>
                    <th>Industry Baseline</th>
                    <th>Expected Improvement</th>
                </tr>
            </thead>
            <tbody>
                ${(category.benchmarks || []).map(b => `
                    <tr>
                        <td><strong>${b.metric}</strong></td>
                        <td class="highlight">${b.vai_target}</td>
                        <td>${b.industry}</td>
                        <td class="improvement ${b.direction}">
                            <i class="fas fa-arrow-${b.direction}"></i>
                            ${b.improvement}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        catDiv.appendChild(table);
        div.appendChild(catDiv);
    });

    return div;
}

function renderArchitectureOverview(section) {
    const div = document.createElement('div');
    div.className = 'architecture-section';
    if (section.title) {
        div.innerHTML = `<h3>${section.title}</h3>`;
    }

    const diagram = document.createElement('div');
    diagram.className = 'architecture-diagram';

    // Handle 'components' structure
    const items = section.layers || section.components || [];

    items.forEach(item => {
        const layerDiv = document.createElement('div');
        layerDiv.className = 'architecture-layer';

        layerDiv.innerHTML = `
            <h4>${item.name || item.layer}</h4>
            ${item.description ? `<p>${item.description}</p>` : ''}
            ${item.components ? `
                <div class="layer-components">
                    ${item.components.map(c => `
                        <div class="component-box">
                            <i class="fas ${c.icon}"></i>
                            <span>${c.name}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;

        diagram.appendChild(layerDiv);
    });

    div.appendChild(diagram);
    return div;
}

function renderTechStackDetailed(section) {
    const div = document.createElement('div');
    div.className = 'tech-stack-detailed-section';
    if (section.title) {
        div.innerHTML = `<h3>${section.title}</h3>`;
    }

    const grid = document.createElement('div');
    grid.className = 'tech-detail-grid';

    // Handle 'layers' structure
    const items = section.categories || section.layers || [];

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'tech-category-card';

        const technologies = item.technologies || item.components || [];

        card.innerHTML = `
            <h4><i class="fas ${item.icon}"></i> ${item.name || item.layer}</h4>
            <ul>
                ${technologies.map(t =>
                    `<li><strong>${t.name}:</strong> ${t.purpose || t.description || ''}</li>`
                ).join('')}
            </ul>
        `;

        grid.appendChild(card);
    });

    div.appendChild(grid);
    return div;
}

function renderIntegrationEcosystem(section) {
    const div = document.createElement('div');
    div.className = 'integration-ecosystem-section';
    if (section.title) {
        div.innerHTML = `<h3>${section.title}</h3>`;
    }

    const grid = document.createElement('div');
    grid.className = 'integration-grid';

    // Handle structure with current/in_development/planned
    const allIntegrations = [
        ...(section.integrations || []),
        ...(section.current || []),
        ...(section.in_development || []),
        ...(section.planned || [])
    ];

    allIntegrations.forEach(integration => {
        grid.innerHTML += `
            <div class="integration-card">
                <i class="fas ${integration.icon}"></i>
                <h4>${integration.name}</h4>
                <p>${integration.purpose || integration.description || ''}</p>
                ${integration.status ? `<span class="status-badge ${integration.status}">${integration.status}</span>` : ''}
            </div>
        `;
    });

    div.appendChild(grid);
    return div;
}

function renderExpandableWarning(section) {
    const div = document.createElement('div');
    div.className = 'expandable-warning';
    div.innerHTML = `
        <div class="warning-header">
            <i class="fas ${section.icon}"></i>
            <h4>${section.title}</h4>
        </div>
        <p>${section.message}</p>
    `;
    return div;
}

function renderCTACards(section) {
    const div = document.createElement('div');
    div.className = 'cta-cards-section';

    const grid = document.createElement('div');
    grid.className = 'cta-cards-grid';

    (section.cards || []).forEach(card => {
        const ctaCard = document.createElement('div');
        ctaCard.className = `cta-card gradient-${card.gradient || 'primary'}`;

        ctaCard.innerHTML = `
            <i class="fas ${card.icon}"></i>
            <h3>${card.title}</h3>
            <p>${card.description}</p>
            ${card.benefits ? `
                <ul class="cta-benefits">
                    ${card.benefits.map(b => `<li><i class="fas fa-check"></i> ${b}</li>`).join('')}
                </ul>
            ` : ''}
            <a href="${card.cta_link}" class="cta-button">${card.cta_text}</a>
        `;

        grid.appendChild(ctaCard);
    });

    div.appendChild(grid);
    return div;
}

function renderFounderProfile(section) {
    const div = document.createElement('div');
    div.className = 'founder-profile-section';

    div.innerHTML = `
        <div class="founder-card">
            ${section.photo ? `
                <div class="founder-image">
                    <img src="${section.photo}" alt="${section.name}" onerror="this.style.display='none'">
                </div>
            ` : ''}
            <div class="founder-info">
                <h3>${section.name}</h3>
                <p class="founder-title">${section.title}</p>
                <p class="founder-bio">${section.bio}</p>
                ${section.email ? `
                    <div class="founder-contact">
                        <a href="mailto:${section.email}"><i class="fas fa-envelope"></i> ${section.email}</a>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    return div;
}

function renderSocialMedia(section) {
    const div = document.createElement('div');
    div.className = 'social-media-section';
    if (section.title) {
        div.innerHTML = `<h3>${section.title}</h3>`;
    }

    const linksDiv = document.createElement('div');
    linksDiv.className = 'social-links';

    (section.links || []).forEach(link => {
        linksDiv.innerHTML += `
            <a href="${link.url}" target="_blank" class="social-link">
                <i class="fab ${link.icon}"></i> ${link.platform}
            </a>
        `;
    });

    div.appendChild(linksDiv);
    return div;
}

/* ========================================
   INTERACTIVE FEATURES
   ======================================== */

function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    console.log(`Found ${tabButtons.length} tab buttons and ${tabPanels.length} tab panels`);

    if (tabButtons.length === 0 || tabPanels.length === 0) {
        console.error('No tabs found! Cannot initialize tab navigation.');
        return;
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            console.log(`Tab clicked: ${targetTab}`);

            // Remove active from all
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            // Add active to selected
            button.classList.add('active');
            const targetPanel = document.getElementById(targetTab);
            if (targetPanel) {
                targetPanel.classList.add('active');

                // Smooth scroll to tab content
                setTimeout(() => {
                    targetPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            } else {
                console.error(`Tab panel not found: ${targetTab}`);
            }

            // Update URL hash
            history.pushState(null, null, `#${targetTab}`);
        });
    });

    // Handle initial hash or activate first tab
    const hash = window.location.hash.substring(1);
    if (hash) {
        const targetButton = document.querySelector(`[data-tab="${hash}"]`);
        if (targetButton) {
            console.log(`Activating tab from hash: ${hash}`);
            targetButton.click();
        }
    } else if (tabButtons.length > 0) {
        console.log('Activating first tab by default');
        tabButtons[0].click();
    }

    // Handle browser back/forward
    window.addEventListener('hashchange', () => {
        const newHash = window.location.hash.substring(1);
        const targetButton = document.querySelector(`[data-tab="${newHash}"]`);
        if (targetButton) targetButton.click();
    });
}

function initHeroCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                animateCounter(entry.target);
                entry.target.classList.add('counted');
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => observer.observe(stat));
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    if (isNaN(target)) return;

    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + (target > 100 ? '+' : '');
        }
    };

    updateCounter();
}

function initFeatureCards() {
    const featureCards = document.querySelectorAll('.feature-card');

    featureCards.forEach(card => {
        const header = card.querySelector('.feature-card-header');
        if (header) {
            header.addEventListener('click', () => {
                card.classList.toggle('expanded');
            });
        }
    });
}

function initFilterSystem() {
    const searchInput = document.querySelector('.search-input');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const clearFilters = document.querySelector('.clear-filters');
    const filterableItems = document.querySelectorAll('[data-filter-category]');

    let activeFilters = new Set();
    let searchTerm = '';

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.toLowerCase();
            applyFilters();
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterValue = button.getAttribute('data-filter');

            if (activeFilters.has(filterValue)) {
                activeFilters.delete(filterValue);
                button.classList.remove('active');
            } else {
                activeFilters.add(filterValue);
                button.classList.add('active');
            }

            applyFilters();
        });
    });

    if (clearFilters) {
        clearFilters.addEventListener('click', () => {
            activeFilters.clear();
            searchTerm = '';
            if (searchInput) searchInput.value = '';
            filterButtons.forEach(btn => btn.classList.remove('active'));
            applyFilters();
        });
    }

    function applyFilters() {
        filterableItems.forEach(item => {
            const categories = item.getAttribute('data-filter-category').split(',').map(c => c.trim());
            const searchableText = item.textContent.toLowerCase();

            const matchesFilter = activeFilters.size === 0 || categories.some(cat => activeFilters.has(cat));
            const matchesSearch = !searchTerm || searchableText.includes(searchTerm);

            if (matchesFilter && matchesSearch) {
                item.style.display = '';
                item.style.animation = 'fadeInUp 0.3s ease-out';
            } else {
                item.style.display = 'none';
            }
        });
    }
}

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    animatedElements.forEach(element => observer.observe(element));
}

// Mobile menu toggle (if needed)
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
    }
}

console.log('VAI Platform script loaded');
