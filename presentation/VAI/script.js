document.addEventListener('DOMContentLoaded', () => {
    const contentSectionsContainer = document.getElementById('content-sections');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const loadingScreen = document.querySelector('.loading-screen');
    const mainHeader = document.querySelector('.main-header');
    const body = document.body;

    let allData = {};
    let currentLang = 'en'; // Default language

    async function init() {
        try {
            await loadLanguage(currentLang);
            
            // Preload the hero image before starting animations
            const heroImageUrl = allData.sections[0].subsections[0].image_placeholder;
            preloadImage(heroImageUrl, () => {
                initAnimations();
                finalizeSetup();
            });

        } catch (error) {
            console.error("Failed to initialize website:", error);
            // If something goes wrong, still hide loader and show content
            finalizeSetup(); 
        }
    }

    async function loadLanguage(lang) {
        const response = await fetch(`${lang}.json`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        allData = await response.json();
        
        // Clear existing content and navigation
        contentSectionsContainer.innerHTML = '';
        navLinks.innerHTML = '';
        navActions.innerHTML = '';

        renderInitialStructure();
        renderContent();
        renderContactSection(); // Add multilingual contact section
        addLanguageSwitcher(); // Re-add switcher after clearing nav
        initMobileMenu(); // Initialize mobile menu functionality
    }

    function preloadImage(url, callback) {
        const img = new Image();
        img.src = url;
        // Always call callback, even on error, to not block the site
        img.onload = () => callback();
        img.onerror = () => callback();
    }

    // Enhanced Markdown to HTML converter
    // Intelligent image placeholder system
    function getImagePlaceholder(sectionIndex, subsectionTitle) {
        const imageMappings = {
            // Part I - Opportunity
            0: {
                "1. Executive Summary": {
                    containerClass: "image-hero",
                    html: `<img src="/via-studio-images/pitches/presentations/Activities in French Polynesia.png" alt="VAI Platform Overview" class="hero-image" loading="lazy">`
                },
                "1. Résumé Exécutif": {
                    containerClass: "image-hero",
                    html: `<img src="/via-studio-images/pitches/presentations/Activities in French Polynesia.png" alt="VAI Platform Overview" class="hero-image" loading="lazy">`
                },
                "2. The Paradise Paradox": {
                    containerClass: "image-problem-illustration",
                    html: `<img src="/via-studio-images/pitches/presentations/Tourism_Broken_Ecosystem.jpg" alt="Current Market Fragmentation" class="problem-image" loading="lazy">
                    <p class="image-caption">Current fragmented landscape: 4,500+ operators struggling with multiple platforms</p>`
                },
                "2. Le Paradoxe du Paradis": {
                    containerClass: "image-problem-illustration",
                    html: `<img src="/via-studio-images/pitches/presentations/Tourism_Broken_Ecosystem.jpg" alt="Fragmentation Actuelle du Marché" class="problem-image" loading="lazy">
                    <p class="image-caption">Paysage fragmenté actuel : 4 500+ opérateurs en difficulté avec plusieurs plateformes</p>`
                },
                "3. Stakeholder Analysis": {
                    containerClass: "image-stakeholder-analysis",
                    html: `<img src="/via-studio-images/pitches/presentations/Une vision partagée - Tahiti Tourisme.png" alt="Stakeholder Analysis - Shared Vision with Tahiti Tourisme" class="stakeholder-image" loading="lazy">
                    <p class="image-caption">A Shared Vision for the Development of Tourisme</p>`
                },
                "3. Analyse des Parties Prenantes": {
                    containerClass: "image-stakeholder-analysis",
                    html: `<img src="/via-studio-images/pitches/presentations/Une vision partagée - Tahiti Tourisme.png" alt="Analyse des Parties Prenantes - Vision Partagée avec Tahiti Tourisme" class="stakeholder-image" loading="lazy">
                    <p class="image-caption">Une vision partagée pour le développement du tourisme</p>`
                },
                "4. The Financial Opportunity: Sizing the Market": {
                    containerClass: "image-placeholder market-size",
                    html: `<div class="placeholder-box">
                        <i class="fas fa-chart-pie placeholder-icon"></i>
                        <p class="placeholder-text">Market Size Infographic</p>
                        <p class="placeholder-note">📊 TAM: 15B XPF | SAM: 5-7B XPF | SOM: 525M XPF</p>
                    </div>`
                }
            },
            // Part II - Solution
            1: {
                "4. Theory of Change": {
                    containerClass: "image-theory-change",
                    html: `<img src="/via-studio-images/pitches/presentations/intervention,output,resultat,impact.png" alt="Theory of Change: Intervention → Output → Results → Impact" class="theory-change-image" loading="lazy">
                    <p class="image-caption">VAI's Theory of Change: From intervention to sustainable impact</p>`
                },
                "4. Théorie du Changement": {
                    containerClass: "image-theory-change",
                    html: `<img src="/via-studio-images/pitches/presentations/intervention,output,resultat,impact.png" alt="Théorie du Changement : Intervention → Résultats → Impact" class="theory-change-image" loading="lazy">
                    <p class="image-caption">Théorie du Changement de VAI : De l'intervention à l'impact durable</p>`
                },
                "5. The VAI Ecosystem": {
                    containerClass: "image-product-showcase",
                    html: `<div class="product-showcase">
                        <div class="device-mockup tablet">
                            <img src="/via-studio-images/pitches/presentations/VAI Tickets and VAI Operator_280925.png" alt="VAI Tickets & VAI Operator" loading="lazy">
                            <p class="device-label">VAI Tickets & VAI Operator</p>
                        </div>
                    </div>`
                },
                "5. L'Écosystème VAI": {
                    containerClass: "image-product-showcase",
                    html: `<div class="product-showcase">
                        <div class="device-mockup tablet">
                            <img src="/via-studio-images/pitches/presentations/VAI Tickets and VAI Operator_280925.png" alt="VAI Tickets & VAI Operator" loading="lazy">
                            <p class="device-label">VAI Tickets & VAI Operator</p>
                        </div>
                    </div>`
                },
                "6. Economic Model": {
                    containerClass: "image-business-model",
                    html: `<img src="/via-studio-images/pitches/presentations/Cooperative Business Modell.png" alt="Cooperative Business Model - VAI's Value Retention Framework" class="business-model-image" loading="lazy">
                    <p class="image-caption">VAI's cooperative model: 11% commission vs 20-30% | 7-day vs 30-60 day payouts</p>`
                },
                "6. Modèle Économique": {
                    containerClass: "image-business-model",
                    html: `<img src="/via-studio-images/pitches/presentations/Cooperative Business Modell.png" alt="Modèle d'Affaires Coopératif - Cadre de Rétention de Valeur VAI" class="business-model-image" loading="lazy">
                    <p class="image-caption">Modèle coopératif VAI : commission 11% vs 20-30% | paiements 7 jours vs 30-60 jours</p>`
                },
                "7. Strategic Go-to-Market Plan": {
                    containerClass: "image-placeholder strategy-map",
                    html: `<div class="placeholder-box">
                        <i class="fas fa-map-marked-alt placeholder-icon"></i>
                        <p class="placeholder-text">French Polynesia Expansion Map</p>
                        <p class="placeholder-note">🏝️ Phase 1: Moorea & Tahiti → Phase 2: Organic Growth → Phase 3: All Archipelagos</p>
                    </div>`
                },
                "8. The Growth Plan: A Roadmap for Team & Platform Scaling": {
                    containerClass: "image-placeholder growth-timeline",
                    html: `<div class="placeholder-box">
                        <i class="fas fa-rocket placeholder-icon"></i>
                        <p class="placeholder-text">Growth Timeline & Milestones</p>
                        <p class="placeholder-note">📈 18 months to market fit | 36 months to profitability</p>
                    </div>`
                }
            },
            // Part III - Impact
            2: {
                "7. Policy Alignment": {
                    containerClass: "image-policy-alignment",
                    html: `<img src="/via-studio-images/pitches/presentations/Policy Framework Alignment VAI.png" alt="Policy Framework Alignment - VAI Integration with National and International Strategies" class="policy-alignment-image" loading="lazy">
                    <p class="image-caption">VAI's alignment with FM27, GSTC, and SPTO policy frameworks</p>`
                },
                "8. Partnership Framework": {
                    containerClass: "image-placeholder partnership-framework",
                    html: `<div class="placeholder-box">
                        <i class="fas fa-network-wired placeholder-icon"></i>
                        <p class="placeholder-text">Public-Private Partnership Model</p>
                        <p class="placeholder-note">🏛️ Governance Board | 📊 Data Sovereignty | 🤝 Advisory Council</p>
                    </div>`
                },
                "7. Alignement Politique": {
                    containerClass: "image-policy-alignment",
                    html: `<img src="/via-studio-images/pitches/presentations/Policy Framework Alignment VAI.png" alt="Alignement des Cadres Politiques - Intégration VAI avec les Stratégies Nationales et Internationales" class="policy-alignment-image" loading="lazy">
                    <p class="image-caption">Alignement de VAI avec les cadres politiques FM27, GSTC et SPTO</p>`
                },
                "8. Cadre de Partenariat": {
                    containerClass: "image-placeholder partnership-framework",
                    html: `<div class="placeholder-box">
                        <i class="fas fa-network-wired placeholder-icon"></i>
                        <p class="placeholder-text">Modèle de Partenariat Public-Privé</p>
                        <p class="placeholder-note">🏛️ Conseil de Gouvernance | 📊 Souveraineté des Données | 🤝 Conseil Consultatif</p>
                    </div>`
                },
            },
            // Part IV - Future
            3: {
                "9. Strategic Position & Viability": {
                    containerClass: "image-placeholder strategic-position",
                    html: `<div class="placeholder-box">
                        <i class="fas fa-chess-king placeholder-icon"></i>
                        <p class="placeholder-text">Strategic Competitive Position</p>
                        <p class="placeholder-note">🏆 Local Legitimacy | 🔧 System Solution | 💚 Sustainable Model</p>
                    </div>`
                },
                "10. Success Metrics": {
                    containerClass: "image-placeholder success-metrics",
                    html: `<div class="placeholder-box">
                        <i class="fas fa-chart-line placeholder-icon"></i>
                        <p class="placeholder-text">Success Measurement Framework</p>
                        <p class="placeholder-note">📊 Economic Sovereignty | 🌱 Sustainable Tourism | 🏛️ Governance</p>
                    </div>`
                },
                "11. Long-Term Vision": {
                    containerClass: "image-future-vision",
                    html: `<div class="vision-showcase">
                        <img src="/via-studio-images/landingpage/VAI Skill Share - Educational Platform.png" alt="VAI Skills Platform" class="vision-image" loading="lazy">
                        <p class="image-caption">VAI Skills: Educational platform for local entrepreneurs</p>
                        <div class="ecosystem-grid">
                            <div class="ecosystem-item">
                                <i class="fas fa-chart-bar"></i>
                                <span>VAI Insights</span>
                            </div>
                            <div class="ecosystem-item">
                                <i class="fas fa-graduation-cap"></i>
                                <span>VAI Skills</span>
                            </div>
                            <div class="ecosystem-item">
                                <i class="fas fa-home"></i>
                                <span>VAI Homes</span>
                            </div>
                            <div class="ecosystem-item">
                                <i class="fas fa-truck"></i>
                                <span>VAI Supply</span>
                            </div>
                        </div>
                    </div>`
                },
                "9. Position Stratégique et Viabilité": {
                    containerClass: "image-placeholder strategic-position",
                    html: `<div class="placeholder-box">
                        <i class="fas fa-chess-king placeholder-icon"></i>
                        <p class="placeholder-text">Position Concurrentielle Stratégique</p>
                        <p class="placeholder-note">🏆 Légitimité Locale | 🔧 Solution Système | 💚 Modèle Durable</p>
                    </div>`
                },
                "10. Métriques de Succès": {
                    containerClass: "image-placeholder success-metrics",
                    html: `<div class="placeholder-box">
                        <i class="fas fa-chart-line placeholder-icon"></i>
                        <p class="placeholder-text">Cadre de Mesure du Succès</p>
                        <p class="placeholder-note">📊 Souveraineté Économique | 🌱 Tourisme Durable | 🏛️ Gouvernance</p>
                    </div>`
                },
                "11. Vision à Long Terme": {
                    containerClass: "image-future-vision",
                    html: `<div class="vision-showcase">
                        <img src="/via-studio-images/landingpage/VAI Skill Share - Educational Platform.png" alt="Plateforme VAI Skills" class="vision-image" loading="lazy">
                        <p class="image-caption">VAI Skills : Plateforme éducative pour les entrepreneurs locaux</p>
                        <div class="ecosystem-grid">
                            <div class="ecosystem-item">
                                <i class="fas fa-chart-bar"></i>
                                <span>VAI Insights</span>
                            </div>
                            <div class="ecosystem-item">
                                <i class="fas fa-graduation-cap"></i>
                                <span>VAI Skills</span>
                            </div>
                            <div class="ecosystem-item">
                                <i class="fas fa-home"></i>
                                <span>VAI Homes</span>
                            </div>
                            <div class="ecosystem-item">
                                <i class="fas fa-truck"></i>
                                <span>VAI Supply</span>
                            </div>
                        </div>
                    </div>`
                },
                "12. The Founder's Philosophy": {
                    containerClass: "image-founder",
                    html: `<div class="founder-section">
                        <img src="/via-studio-images/personal/kevin-polynesian.jpg" alt="Kevin De Silva, Founder" class="founder-image" loading="lazy">
                        <div class="founder-quote">
                            <p class="quote-text">"Technology should enhance human capability and connect business success with positive, sustainable impact."</p>
                            <p class="quote-author">— Kevin De Silva, Founder</p>
                        </div>
                    </div>`
                },
                "12. La Philosophie du Fondateur": {
                    containerClass: "image-founder",
                    html: `<div class="founder-section">
                        <img src="/via-studio-images/personal/kevin-polynesian.jpg" alt="Kevin De Silva, Fondateur" class="founder-image" loading="lazy">
                        <div class="founder-quote">
                            <p class="quote-text">"La technologie doit améliorer les capacités humaines et lier le succès commercial à un impact positif et durable."</p>
                            <p class="quote-author">— Kevin De Silva, Fondateur</p>
                        </div>
                    </div>`
                },
                "13. Team & Implementation": {
                    containerClass: "image-placeholder team-culture",
                    html: `<div class="placeholder-box">
                        <i class="fas fa-users placeholder-icon"></i>
                        <p class="placeholder-text">Team & Culture Photo</p>
                        <p class="placeholder-note">👥 Local team building the future of Polynesian tourism</p>
                    </div>`
                },
                "13. Équipe et Mise en Œuvre": {
                    containerClass: "image-placeholder team-culture",
                    html: `<div class="placeholder-box">
                        <i class="fas fa-users placeholder-icon"></i>
                        <p class="placeholder-text">Photo Équipe & Culture</p>
                        <p class="placeholder-note">👥 Équipe locale construisant l'avenir du tourisme polynésien</p>
                    </div>`
                },
                "11. Long-Term Vision": {
                    containerClass: "image-future-vision",
                    html: `<div class="vision-showcase">
                        <img src="/via-studio-images/landingpage/VAI Skill Share - Educational Platform.png" alt="VAI Skills Platform" class="vision-image" loading="lazy">
                        <p class="image-caption">VAI Skills: Educational platform for local entrepreneurs</p>
                        <div class="ecosystem-grid">
                            <div class="ecosystem-item">
                                <i class="fas fa-chart-bar"></i>
                                <span>VAI Insights</span>
                            </div>
                            <div class="ecosystem-item">
                                <i class="fas fa-graduation-cap"></i>
                                <span>VAI Skills</span>
                            </div>
                            <div class="ecosystem-item">
                                <i class="fas fa-home"></i>
                                <span>VAI Homes</span>
                            </div>
                            <div class="ecosystem-item">
                                <i class="fas fa-truck"></i>
                                <span>VAI Supply</span>
                            </div>
                        </div>
                    </div>`
                }
            }
        };

        return imageMappings[sectionIndex]?.[subsectionTitle] || null;
    }

    function markdownToHtml(markdown) {
        if (!markdown || typeof markdown !== 'string') {
            return '';
        }

        let html = markdown.trim();

        // First, handle bold and italic formatting
        // Bold: **text** to <strong>text</strong>
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic: *text* to <em>text</em> (avoiding ** patterns)
        html = html.replace(/\*([^*]+)\*/g, function(match, content) {
            // Skip if this is part of a ** pattern (already processed)
            if (html.indexOf('**' + content + '**') !== -1) return match;
            return '<em>' + content + '</em>';
        });

        // Handle bullet points
        const lines = html.split('\n');
        let inList = false;
        let processedLines = [];

        lines.forEach(line => {
            const trimmedLine = line.trim();
            
            if (trimmedLine.startsWith('- ')) {
                if (!inList) {
                    processedLines.push('<ul>');
                    inList = true;
                }
                let listContent = trimmedLine.substring(2);
                processedLines.push(`<li>${listContent}</li>`);
            } else {
                if (inList) {
                    processedLines.push('</ul>');
                    inList = false;
                }
                if (trimmedLine) {
                    processedLines.push(trimmedLine);
                }
            }
        });

        if (inList) {
            processedLines.push('</ul>');
        }

        html = processedLines.join('\n');

        // For single line content, wrap in paragraph
        if (!html.includes('<ul>') && !html.includes('<li>') && !html.includes('<p>')) {
            html = `<p>${html}</p>`;
        }

        return html;
    }

    function renderInitialStructure() {
        // Set main title
        document.title = allData.title || 'VAI Business Plan';

        // Create Hero Section
        const heroSection = document.createElement('section');
        heroSection.id = 'section-hero';
        heroSection.className = 'section hero-section';
        heroSection.style.backgroundImage = `url(${allData.sections[0].subsections[0].image_placeholder})`;

        const heroContent = document.createElement('div');
        heroContent.className = 'hero-content';

        const heroTitle = document.createElement('h1');
        heroTitle.className = 'hero-title';
        heroTitle.textContent = allData.title;
        heroContent.appendChild(heroTitle);

        const heroSubtitle = document.createElement('p');
        heroSubtitle.className = 'hero-subtitle';
        heroSubtitle.textContent = allData.subtitle;
        heroContent.appendChild(heroSubtitle);

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'hero-buttons-container';

        const button1 = document.createElement('a');
        button1.href = '/presentation/VAI/finances/index.html';
        button1.className = 'hero-button';
        button1.textContent = 'Financial Projection';
        buttonContainer.appendChild(button1);

        //const button2 = document.createElement('a');
        //button2.href = '/presentation/VAI/funding-strategy/index.html';
        //button2.className = 'hero-button';
        //button2.textContent = 'Funding Strategy';
        //buttonContainer.appendChild(button2);

        heroContent.appendChild(buttonContainer);

        heroSection.appendChild(heroContent);
        contentSectionsContainer.appendChild(heroSection);
    }

    function renderContent() {
        // Populate navigation with meaningful keywords (multilingual)
        const sectionKeywords = {
            'en': ['Diagnosis', 'Solution', 'Implementation', 'Vision'],
            'fr': ['Diagnostic', 'Solution', 'Mise en Œuvre', 'Vision']
        };
        
        const keywords = sectionKeywords[currentLang] || sectionKeywords['en'];
        allData.sections.forEach((_, index) => {
            const a = document.createElement('a');
            a.href = `#section-${index}`;
            a.textContent = keywords[index] || `Section ${index + 1}`;
            a.className = 'nav-link';
            navLinks.appendChild(a);
        });

        // Add Contact link (multilingual)
        const contactText = {
            'en': 'Contact',
            'fr': 'Contact'
        };
        
        const contactLink = document.createElement('a');
        contactLink.href = '#contact';
        contactLink.textContent = contactText[currentLang] || 'Contact';
        contactLink.className = 'nav-link';
        navLinks.appendChild(contactLink);

        // Populate content sections
        allData.sections.forEach((sectionData, index) => {
            const section = document.createElement('section');
            section.id = `section-${index}`;
            section.className = 'section content-section';

            const header = document.createElement('h2');
            header.className = 'section-header';
            header.textContent = sectionData.title;
            section.appendChild(header);

            const contentDiv = document.createElement('div');
            contentDiv.className = 'section-content';

            // Handle different content types: grids, lists, tables
            sectionData.subsections.forEach(subsection => {
                const subContainer = document.createElement('div');
                subContainer.className = 'subsection-container';

                const card = document.createElement('div');
                card.className = 'info-card';

                const cardTitle = document.createElement('h3');
                cardTitle.textContent = subsection.title;
                card.appendChild(cardTitle);

                // Add intelligent image placeholders
                const imagePlaceholder = getImagePlaceholder(index, subsection.title);
                if (imagePlaceholder) {
                    const imageContainer = document.createElement('div');
                    imageContainer.className = imagePlaceholder.containerClass;
                    imageContainer.innerHTML = imagePlaceholder.html;
                    card.appendChild(imageContainer);
                }

                // Process content with markdownToHtml
                if (subsection.content && subsection.content.length > 0) {
                    subsection.content.forEach(paragraph => {
                        if (paragraph.trim()) {
                            const processedContent = markdownToHtml(paragraph);
                            const contentDiv = document.createElement('div');
                            contentDiv.innerHTML = processedContent;
                            card.appendChild(contentDiv);
                        }
                    });
                }

                // Handle tables
                if (subsection.table) {
                    card.appendChild(createTable(subsection.table));
                }

                // Handle SWOT lists (these are already structured, no markdown needed here)
                if (subsection.lists) {
                    card.appendChild(createListGrid(subsection.lists));
                }

                subContainer.appendChild(card);
                contentDiv.appendChild(subContainer);
            });

            section.appendChild(contentDiv);
            contentSectionsContainer.appendChild(section);
        });
    }

    function renderContactSection() {
        const contactTexts = {
            'en': {
                header: {
                    title: 'Ready to Shape the Future of Tourism?',
                    subtitle: 'Multiple ways to get involved with VAI\'s mission'
                },
                cards: [
                    { icon: '💰', title: 'Investor', text: 'Ready to invest in the future of Polynesian tourism?' },
                    { icon: '🤝', title: 'Strategic Partner', text: 'Looking to partner with VAI for mutual growth?' },
                    { icon: '🚀', title: 'Co-Founder', text: 'Ready to co-found and build this vision together?' },
                    { icon: '👥', title: 'Join Our Team', text: 'Want to be part of the VAI team and mission?' },
                    { icon: '🌐', title: 'VAI Community', text: 'Stay updated with VAI\'s journey and progress?' },
                    { icon: '💡', title: 'Learn More', text: 'Curious about VAI and want to know more?' }
                ],
                founder: {
                    name: 'Kevin De Silva',
                    role: 'Founder VAI | Engineer | Organisational Developer | AI Product Strategist',
                    location: '📍 Moorea, French Polynesia - Operating Globally'
                },
                methods: [
                    { icon: '💬', label: 'WhatsApp' },
                    { icon: '✉️', label: 'Email' },
                    { icon: '🌏', label: 'LinkedIn' },
                    { icon: '🔗', label: 'VAI Studio Website' }
                ]
            },
            'fr': {
                header: {
                    title: 'Prêt à façonner l\'avenir du tourisme ?',
                    subtitle: 'Plusieurs façons de s\'impliquer dans la mission VAI'
                },
                cards: [
                    { icon: '💰', title: 'Investisseur', text: 'Prêt à investir dans l\'avenir du tourisme polynésien ?' },
                    { icon: '🤝', title: 'Partenaire Stratégique', text: 'Cherchez à vous associer avec VAI pour une croissance mutuelle ?' },
                    { icon: '🚀', title: 'Co-Fondateur', text: 'Prêt à co-fonder et construire cette vision ensemble ?' },
                    { icon: '👥', title: 'Rejoindre l\'Équipe', text: 'Voulez faire partie de l\'équipe et de la mission VAI ?' },
                    { icon: '🌐', title: 'Communauté VAI', text: 'Restez informé du parcours et des progrès de VAI ?' },
                    { icon: '💡', title: 'En Savoir Plus', text: 'Curieux de VAI et voulez en savoir plus ?' }
                ],
                founder: {
                    name: 'Kevin De Silva',
                    role: 'Fondateur VAI | Ingénieur | Développeur Organisationnel | Stratège Produit IA',
                    location: '📍 Moorea, Polynésie française - Opérant mondialement'
                },
                methods: [
                    { icon: '💬', label: 'WhatsApp' },
                    { icon: '✉️', label: 'Email' },
                    { icon: '🌏', label: 'LinkedIn' },
                    { icon: '🔗', label: 'Site Web VAI Studio' }
                ]
            }
        };

        const texts = contactTexts[currentLang] || contactTexts['en'];
        const contactSection = document.querySelector('#contact');
        
        if (contactSection) {
            // Update header
            const headerTitle = contactSection.querySelector('.contact-header h2');
            const headerSubtitle = contactSection.querySelector('.contact-header p');
            if (headerTitle) headerTitle.textContent = texts.header.title;
            if (headerSubtitle) headerSubtitle.textContent = texts.header.subtitle;

            // Update engagement cards
            const cards = contactSection.querySelectorAll('.engagement-card');
            cards.forEach((card, index) => {
                if (texts.cards[index]) {
                    const title = card.querySelector('h3');
                    const text = card.querySelector('p');
                    if (title) title.textContent = texts.cards[index].title;
                    if (text) text.textContent = texts.cards[index].text;
                }
            });

            // Update founder info
            const founderName = contactSection.querySelector('.founder-info h3');
            const founderRole = contactSection.querySelector('.founder-role');
            const founderLocation = contactSection.querySelector('.founder-location');
            if (founderName) founderName.textContent = texts.founder.name;
            if (founderRole) founderRole.textContent = texts.founder.role;
            if (founderLocation) founderLocation.textContent = texts.founder.location;

            // Update contact method labels
            const methods = contactSection.querySelectorAll('.contact-method .method-label');
            methods.forEach((method, index) => {
                if (texts.methods[index]) {
                    method.textContent = texts.methods[index].label;
                }
            });
        }
    }

    function createTable(tableData) {
        const container = document.createElement('div');
        container.className = 'table-container';
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        
        const headerRow = document.createElement('tr');
        tableData.headers.forEach(headerText => {
            const th = document.createElement('th');
            // Process markdown in table headers too
            const processedHeaderText = markdownToHtml(headerText);
            th.innerHTML = processedHeaderText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        tableData.rows.forEach(rowData => {
            const row = document.createElement('tr');
            rowData.forEach(cellData => {
                const td = document.createElement('td');
                // Process markdown in table cells
                const processedCellData = markdownToHtml(cellData);
                td.innerHTML = processedCellData;
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        container.appendChild(table);
        return container;
    }

    function createListGrid(listsData) {
        const grid = document.createElement('div');
        grid.className = 'list-grid';
        for (const key in listsData) {
            const listCard = document.createElement('div');
            listCard.className = 'list-card';
            const title = document.createElement('h3');
            title.textContent = key;
            listCard.appendChild(title);
            const ul = document.createElement('ul');
            listsData[key].forEach(item => {
                const li = document.createElement('li');
                // Process markdown in list items
                const processedItem = markdownToHtml(item);
                li.innerHTML = processedItem;
                ul.appendChild(li);
            });
            listCard.appendChild(ul);
            grid.appendChild(listCard);
        }
        return grid;
    }

    function initMobileMenu() {
        // Mobile menu toggle functionality
        mobileToggle.addEventListener('click', () => {
            mainNav.classList.toggle('mobile-open');
            mobileToggle.classList.toggle('active');
        });

        // Close mobile menu when clicking nav links
        navLinks.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                mainNav.classList.remove('mobile-open');
                mobileToggle.classList.remove('active');
            }
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mainNav.contains(e.target)) {
                mainNav.classList.remove('mobile-open');
                mobileToggle.classList.remove('active');
            }
        });
    }

    function addLanguageSwitcher() {
        const langSwitcher = document.createElement('div');
        langSwitcher.className = 'language-switcher';

        const enBtn = document.createElement('button');
        enBtn.innerHTML = `
            <span class="flag-icon">🇺🇸</span>
            <span class="lang-text">EN</span>
        `;
        enBtn.classList.add('lang-btn');
        enBtn.setAttribute('data-lang', 'en');
        enBtn.setAttribute('title', 'English');
        if (currentLang === 'en') enBtn.classList.add('active');
        enBtn.addEventListener('click', () => switchLanguage('en'));

        const frBtn = document.createElement('button');
        frBtn.innerHTML = `
            <span class="flag-icon">🇫🇷</span>
            <span class="lang-text">FR</span>
        `;
        frBtn.classList.add('lang-btn');
        frBtn.setAttribute('data-lang', 'fr');
        frBtn.setAttribute('title', 'Français');
        if (currentLang === 'fr') frBtn.classList.add('active');
        frBtn.addEventListener('click', () => switchLanguage('fr'));

        langSwitcher.appendChild(enBtn);
        langSwitcher.appendChild(frBtn);
        navActions.appendChild(langSwitcher);
    }

    async function switchLanguage(lang) {
        if (currentLang === lang) return;
        currentLang = lang;
        // Re-render content with new language
        await loadLanguage(currentLang);
        // Re-initialize animations for new content
        initAnimations();
        // Update active class on buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            }
        });
    }

    function initAnimations() {
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

        // Animate header in
        gsap.to(mainHeader, { y: 0, duration: 1, ease: 'power2.out', delay: 0.5 });

        // Hero section parallax and fade-in
        gsap.from('.hero-title', { opacity: 0, y: 50, duration: 1.5, ease: 'power3.out', delay: 1 });
        gsap.from('.hero-subtitle', { opacity: 0, y: 30, duration: 1.5, ease: 'power3.out', delay: 1.2 });
        gsap.to('.hero-section', {
            backgroundPositionY: '30%',
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero-section',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });

        // General section fade-in animation
        gsap.utils.toArray('.section').forEach(section => {
            gsap.fromTo(section, 
                { autoAlpha: 0, y: 50 }, 
                {
                    autoAlpha: 1, 
                    y: 0, 
                    duration: 1.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });

        // Card entrance animation
        gsap.utils.toArray('.info-card').forEach(card => {
            gsap.from(card, {
                opacity: 0,
                scale: 0.95,
                y: 30,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            });
        });

        // Smooth scrolling for nav links
        document.querySelectorAll('.main-nav a').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                gsap.to(window, { 
                    duration: 1.5, 
                    scrollTo: { y: targetId, offsetY: 100 }, 
                    ease: 'power3.inOut' 
                });
            });
        });

        // Update nav active state on scroll
        gsap.utils.toArray('.content-section').forEach(section => {
            ScrollTrigger.create({
                trigger: section,
                start: 'top center',
                end: 'bottom center',
                onToggle: self => {
                    const link = document.querySelector(`a[href=\"#${section.id}\"]`);
                    if (link) {
                        if (self.isActive) {
                            document.querySelectorAll('.main-nav a').forEach(a => a.classList.remove('active'));
                            link.classList.add('active');
                        }
                    }
                }
            });
        });
    }

    function finalizeSetup() {
        // Fade out loader and fade in content
        gsap.to(loadingScreen, { 
            opacity: 0, 
            duration: 0.5, 
            onComplete: () => loadingScreen.style.display = 'none' 
        });
        gsap.to(body, { opacity: 1, duration: 1 });
    }

    init();
});