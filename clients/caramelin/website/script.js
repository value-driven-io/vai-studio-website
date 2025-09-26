// Caramel'in Digital Menu with StPageFlip

class CaramelinMenu {
    constructor() {
        this.currentLanguage = 'fr';
        this.currentPage = 'welcome';
        this.currentPageIndex = 0;
        this.menuData = this.initializeMenuData();
        this.pageFlip = null;
        this.pages = ['welcome', 'contents', 'drinks', 'breakfast', 'lunch', 'pastries', 'tapas', 'contact'];
        this.flipbookEnabled = false;
        this.init();
    }

    init() {
        this.setupLanguageToggle();
        this.setupArrowNavigation();
        this.setupDateDisplay();
        this.hideAllFallbackContent(); // Hide immediately
        this.initializeFlipbook();
        this.setupImagePlaceholders();
    }

    hideAllFallbackContent() {
        console.log('Hiding all fallback content immediately...');
        // Hide all fallback content immediately
        const fallbackMenu = document.querySelector('.menu-pages.fallback-menu');
        const allMenuPages = document.querySelectorAll('.menu-pages');

        if (fallbackMenu) {
            fallbackMenu.style.display = 'none !important';
            fallbackMenu.style.visibility = 'hidden';
            fallbackMenu.style.height = '0';
            fallbackMenu.style.overflow = 'hidden';
        }

        allMenuPages.forEach(menu => {
            menu.style.display = 'none !important';
            menu.style.visibility = 'hidden';
            menu.style.height = '0';
            menu.style.overflow = 'hidden';
        });

        console.log('All fallback content hidden immediately');
    }

    async initializeFlipbook() {
        console.log('Starting flipbook initialization...');

        // Check if mobile device - use fallback on mobile
        if (this.isMobileDevice()) {
            console.log('Mobile device detected - using fallback mode');
            this.setupFallbackMode();
            return;
        }

        try {
            // Check if StPageFlip is available
            if (typeof St === 'undefined' || !St.PageFlip) {
                console.warn('StPageFlip not available, using fallback mode');
                this.setupFallbackMode();
                return;
            }

            console.log('StPageFlip library found');

            const flipbookElement = document.getElementById('flipbook');
            if (!flipbookElement) {
                console.warn('Flipbook element not found, using fallback mode');
                this.setupFallbackMode();
                return;
            }

            console.log('Flipbook element found');

            // Create page elements first
            const pageElements = [];
            this.pages.forEach((page, index) => {
                const pageDiv = document.createElement('div');
                pageDiv.className = 'flipbook-page';
                pageDiv.setAttribute('data-page', page);

                // Generate content immediately
                const pageData = this.menuData[page][this.currentLanguage];
                if (pageData) {
                    pageDiv.innerHTML = this.generatePageContent(page, pageData);
                }

                pageElements.push(pageDiv);
            });

            // Get the container dimensions for full-height layout
            const container = flipbookElement.parentElement;
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;

            // Calculate page dimensions to use full available space
            const pageWidth = Math.max(350, Math.min(containerWidth * 0.45, 500));
            const pageHeight = Math.max(500, Math.min(containerHeight * 0.9, 800));

            console.log('Container width:', containerWidth, 'Page size:', pageWidth, 'x', pageHeight);

            // Initialize PageFlip with responsive settings
            this.pageFlip = new St.PageFlip(flipbookElement, {
                width: pageWidth,
                height: pageHeight,
                size: 'stretch',
                minWidth: 300,
                maxWidth: 600,
                minHeight: 500,
                maxHeight: 900,
                drawShadow: true,
                flippingTime: 500,
                usePortrait: true,
                startPage: 0,
                autoSize: true,
                maxShadowOpacity: 0.15,
                showCover: false,
                mobileScrollSupport: true,
                swipeDistance: 30,
                clickEventForward: true,
                useMouseEvents: true,
                disableFlipByClick: false
            });

            console.log('Loading', pageElements.length, 'pages into flipbook...');

            // Load pages into flipbook
            this.pageFlip.loadFromHTML(pageElements);

            console.log('Pages loaded into flipbook');

            // Set up event listeners
            this.pageFlip.on('flip', (e) => {
                this.currentPageIndex = e.data;
                this.currentPage = this.pages[this.currentPageIndex] || 'welcome';
                this.updatePageIndicator();
            });

            this.pageFlip.on('init', () => {
                console.log('✅ Flipbook initialized successfully!');
                this.flipbookEnabled = true;

                // Add class to completely hide fallback content
                document.body.classList.add('flipbook-active');
                console.log('Added flipbook-active class to body');

                // Ensure fallback is completely hidden
                const fallbackMenu = document.querySelector('.menu-pages.fallback-menu');
                const allMenuPages = document.querySelectorAll('.menu-pages');

                console.log('Found fallback menu:', !!fallbackMenu);
                console.log('Found menu pages:', allMenuPages.length);

                if (fallbackMenu) {
                    fallbackMenu.style.display = 'none';
                    fallbackMenu.style.visibility = 'hidden';
                    fallbackMenu.style.height = '0';
                    console.log('Hidden fallback menu');
                }

                allMenuPages.forEach((menu, index) => {
                    menu.style.display = 'none';
                    menu.style.visibility = 'hidden';
                    menu.style.height = '0';
                    console.log('Hidden menu page', index);
                });

                console.log('All fallback content should now be hidden');

                // Prevent scroll animations from running
                this.cleanupScrollAnimations();

                // Update page indicator
                this.updatePageIndicator();
            });

            this.pageFlip.on('update', () => {
                console.log('Flipbook updated');
            });

            // Add resize handler for responsiveness
            this.setupResizeHandler();

        } catch (error) {
            console.error('❌ Error initializing flipbook:', error);
            this.setupFallbackMode();
        }
    }

    setupFallbackMode() {
        this.flipbookEnabled = false;
        console.log('⚠️ Flipbook failed - using fallback mode');

        // Hide flipbook container
        const flipbookContainer = document.querySelector('.flipbook-container');
        if (flipbookContainer) {
            flipbookContainer.style.display = 'none';
        }

        // Enable fallback mode
        document.body.classList.add('use-fallback');

        // Generate fallback content
        this.generateAllMenuPages();

        console.log('Fallback mode activated');
    }

    setupResizeHandler() {
        if (!this.flipbookEnabled || !this.pageFlip) return;

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (this.pageFlip) {
                    // Update flipbook size on window resize
                    const flipbookElement = document.getElementById('flipbook');
                    if (flipbookElement) {
                        const container = flipbookElement.parentElement;
                        const containerWidth = container.offsetWidth;
                        const containerHeight = container.offsetHeight;
                        const pageWidth = Math.max(350, Math.min(containerWidth * 0.45, 500));
                        const pageHeight = Math.max(500, Math.min(containerHeight * 0.9, 800));

                        // The flipbook will automatically adjust due to autoSize: true
                        console.log('Flipbook resized for responsive layout');
                    }
                }
            }, 250);
        });
    }


    generatePageContent(page, pageData) {
        // Special handling for welcome page
        if (page === 'welcome') {
            return this.generateWelcomePage();
        }

        // Special handling for contents page
        if (page === 'contents') {
            return this.generateContentsPage();
        }

        // Special handling for contact page
        if (page === 'contact') {
            return this.generateContactPage();
        }

        const illustrations = {
            drinks: { emoji: '☕', name: 'coffee' },
            breakfast: { emoji: '🥐', name: 'croissant' },
            lunch: { emoji: '🐟', name: 'fish' },
            pastries: { emoji: '🧁', name: 'pastry' },
            tapas: { emoji: '🍍', name: 'pineapple' }
        };

        return `
            <div class="page-header">
                <div class="page-illustration">
                    <div class="illustration-placeholder" data-name="${illustrations[page]?.name || 'image'}">
                        ${illustrations[page]?.emoji || '🖼️'}
                    </div>
                </div>
                <h2 class="page-title">${pageData.title}</h2>
                <p class="page-subtitle">${pageData.subtitle}</p>
            </div>
            <div class="menu-columns">
                ${pageData.sections.map(section => this.generateMenuSection(section)).join('')}
            </div>
        `;
    }

    generateWelcomePage() {
        const isEnglish = this.currentLanguage === 'en';
        const title = isEnglish ? 'A Note from the Publishers' : 'Mot des Éditeurs';
        const welcome1 = isEnglish
            ? 'Welcome to Caramel\'in. For years, this cafe has been a meeting point for our community. Our dream is to honor that history by turning this place into a living storybook of Moorea.'
            : 'Bienvenue au Caramel\'in. Depuis des années, ce café est un point de rencontre pour notre communauté. Notre rêve est d\'honorer cette histoire en transformant cet endroit en un livre d\'histoires vivant de Moorea.';
        const welcome2 = isEnglish
            ? 'Everything we serve has a story, from the local fisherman who brings us our tuna to the family that grows our pineapples. Mauruuru, and enjoy today\'s edition.'
            : 'Tout ce que nous servons a une histoire, du pêcheur local qui nous apporte notre thon à la famille qui cultive nos ananas. Mauruuru, et profitez de l\'édition d\'aujourd\'hui.';

        return `
            <div class="welcome-page">
                <div class="decorative-line"></div>
                <h2 class="welcome-title">${title}</h2>
                <div class="decorative-line"></div>

                <div class="welcome-content">
                    <div class="welcome-image">
                        <img src="/clients/caramelin/resources/media/nicoleandjerome1.jpg" alt="Nicole and Jerome" class="publisher-photo" />
                    </div>
                    <div class="welcome-text">
                        <p class="welcome-paragraph">${welcome1}</p>
                        <p class="welcome-paragraph">${welcome2}</p>
                        <p class="signature">– Nicole & Jerome</p>
                    </div>
                </div>
            </div>
        `;
    }

    generateContentsPage() {
        const isEnglish = this.currentLanguage === 'en';
        const title = isEnglish ? 'Table of Contents' : 'Table des Matières';

        const menuPages = [
            {
                page: 'drinks',
                titleFr: 'Les Boissons',
                titleEn: 'Beverages',
                subtitleFr: 'Toute la journée',
                subtitleEn: 'All Day',
                emoji: '☕',
                pageNum: 3
            },
            {
                page: 'breakfast',
                titleFr: 'L\'Édition du Matin',
                titleEn: 'The Morning Edition',
                subtitleFr: '6h30 - 11h00',
                subtitleEn: '6:30am - 11:00am',
                emoji: '🥐',
                pageNum: 4
            },
            {
                page: 'lunch',
                titleFr: 'Spéciaux de Midi',
                titleEn: 'Midday Specials',
                subtitleFr: '11h00 - 15h00',
                subtitleEn: '11:00am - 3:00pm',
                emoji: '🐟',
                pageNum: 5
            },
            {
                page: 'pastries',
                titleFr: 'La Section Sucrée',
                titleEn: 'The Sweet Section',
                subtitleFr: 'Toute la journée',
                subtitleEn: 'All Day',
                emoji: '🧁',
                pageNum: 6
            },
            {
                page: 'tapas',
                titleFr: 'Coucher de Soleil Social',
                titleEn: 'Social Sunset',
                subtitleFr: '15h00 - 18h00',
                subtitleEn: '3:00pm - 6:00pm',
                emoji: '🍍',
                pageNum: 7
            }
        ];

        const contentsItems = menuPages.map(item => {
            const title = isEnglish ? item.titleEn : item.titleFr;
            const subtitle = isEnglish ? item.subtitleEn : item.subtitleFr;
            return `
                <div class="contents-item" onclick="caramelinMenu.navigateToPageIndex(${item.pageNum - 1})">
                    <div class="contents-icon">${item.emoji}</div>
                    <div class="contents-text">
                        <h4 class="contents-title">${title}</h4>
                        <p class="contents-subtitle">${subtitle}</p>
                    </div>
                    <div class="contents-dots"></div>
                    <div class="contents-page-num">${item.pageNum}</div>
                </div>
            `;
        }).join('');

        return `
            <div class="contents-page">
                <div class="decorative-line"></div>
                <h2 class="contents-main-title">${title}</h2>
                <div class="decorative-line"></div>

                <div class="contents-list">
                    ${contentsItems}
                </div>
            </div>
        `;
    }

    generateContactPage() {
        const isEnglish = this.currentLanguage === 'en';
        const title = isEnglish ? 'Our Story & Contact' : 'Notre Histoire & Contact';

        const teamTitle = isEnglish ? 'Meet Our Team' : 'Rencontrez Notre Équipe';
        const eventsTitle = isEnglish ? 'Upcoming Events' : 'Événements à Venir';
        const contactTitle = isEnglish ? 'Visit Us' : 'Venez Nous Voir';

        const teamMembers = [
            {
                name: 'Nicole & Jerome',
                roleFr: 'Fondateurs & Support Équipe',
                roleEn: 'Founders & Team Support',
                descFr: 'Animés par la passion et l\'impact',
                descEn: 'Driven by passion and impact'
            },
            {
                name: 'Maeva Tetuanui',
                roleFr: 'Serveuse & Responsable Accueil',
                roleEn: 'Server & Welcome Manager',
                descFr: 'Le sourire de Caramel\'in, toujours prête à vous aider',
                descEn: 'The smile of Caramel\'in, always ready to help'
            },
            {
                name: 'Teiva Salmon',
                roleFr: 'Barista & Créateur de Boissons',
                roleEn: 'Barista & Beverage Creator',
                descFr: 'Expert en café, créateur de nos spécialités glacées',
                descEn: 'Coffee expert, creator of our iced specialties'
            },
            {
                name: 'Teiva Salmon',
                roleFr: 'Service & Comptoir',
                roleEn: 'Service & Counter',
                descFr: 'Nous maintient organisés',
                descEn: 'Keeps us organized'
            },
            {
                name: 'Cindy Gleron',
                roleFr: 'Réseaux Sociaux & Communication',
                roleEn: 'Social Media & Communication',
                descFr: 'Maintient Caramel\'in à jour',
                descEn: 'Keeps Caramel\'in up to date'
            }
        ];

        const localPartners = [
            {
                name: 'Heiari',
                roleFr: 'Pêcheur Local',
                roleEn: 'Local Fisherman'
            },
            {
                name: 'Arii',
                roleFr: 'Fruits Frais',
                roleEn: 'Fresh Fruits'
            },
            {
                name: 'Poae',
                roleFr: 'Légumes',
                roleEn: 'Vegetables'
            }
        ];

        const events = [
            {
                dateFr: '11 octobre 2025',
                dateEn: 'October 11th, 2025',
                eventFr: 'Concert avec le groupe "Tropical Vibes"',
                eventEn: 'Concert with "Tropical Vibes" band'
            },
            {
                dateFr: '25 novembre 2025',
                dateEn: 'November 25th, 2025',
                eventFr: 'Soirée dégustation de vins français',
                eventEn: 'French wine tasting evening'
            },
            {
                dateFr: '15 décembre 2025',
                dateEn: 'December 15th, 2025',
                eventFr: 'Festival des pâtisseries traditionnelles',
                eventEn: 'Traditional pastries festival'
            }
        ];

        const quoteFr = '« Chez Caramel\'in, chaque visiteur devient famille. Mauruuru pour partager nos histoires. »';
        const quoteEn = '"At Caramel\'in, every visitor becomes family. Mauruuru for sharing our stories."';

        const teamHtml = teamMembers.map(member => `
            <div class="team-member">
                <h4 class="member-name">${member.name}</h4>
                <p class="member-role">${isEnglish ? member.roleEn : member.roleFr}</p>
                <p class="member-desc">${isEnglish ? member.descEn : member.descFr}</p>
            </div>
        `).join('');

        const partnersTitle = isEnglish ? 'Our Local Partners' : 'Nos Partenaires Locaux';
        const partnersHtml = localPartners.map(partner => `
            <div class="partner-member">
                <h4 class="partner-name">${partner.name}</h4>
                <p class="partner-role">${isEnglish ? partner.roleEn : partner.roleFr}</p>
            </div>
        `).join('');

        const eventsHtml = events.map(event => `
            <div class="event-item">
                <div class="event-date">${isEnglish ? event.dateEn : event.dateFr}</div>
                <div class="event-desc">${isEnglish ? event.eventEn : event.eventFr}</div>
            </div>
        `).join('');

        return `
            <div class="contact-page">
                <div class="decorative-line"></div>
                <h2 class="contact-title">${title}</h2>
                <div class="decorative-line"></div>

                <div class="contact-sections">
                    <section class="team-section">
                        <h3 class="section-title">${teamTitle}</h3>
                        <div class="team-grid">
                            ${teamHtml}
                        </div>

                        <h3 class="section-title partners-title">${partnersTitle}</h3>
                        <div class="partners-grid">
                            ${partnersHtml}
                        </div>
                    </section>

                    <section class="events-section">
                        <h3 class="section-title">${eventsTitle}</h3>
                        <div class="events-list">
                            ${eventsHtml}
                        </div>
                    </section>

                    <section class="contact-details">
                        <h3 class="section-title">${contactTitle}</h3>
                        <div class="contact-info">
                            <div class="contact-item">
                                <span class="contact-icon">📍</span>
                                <span class="contact-text">Centre Commercial Maharepa<br>Moorea 98728, French Polynesia</span>
                            </div>
                            <div class="contact-item">
                                <span class="contact-icon">📞</span>
                                <span class="contact-text">+689 87 33 03 61</span>
                            </div>
                            <div class="contact-item">
                                <span class="contact-icon">⏰</span>
                                <span class="contact-text">${isEnglish ? 'Daily 6:30h - 17:00h' : 'Tous les jours 6h30 - 17h00'}</span>
                            </div>
                        </div>

                        <div class="welcome-quote">
                            <p class="quote-text">${isEnglish ? quoteEn : quoteFr}</p>
                            <p class="quote-author">– L'équipe Caramel'in</p>
                        </div>
                    </section>
                </div>
            </div>
        `;
    }

    initializeMenuData() {
        return {
            welcome: {
                fr: {
                    title: "Mot des Éditeurs",
                    subtitle: "A Note from the Publishers",
                    sections: [{
                        title: "",
                        items: []
                    }]
                },
                en: {
                    title: "A Note from the Publishers",
                    subtitle: "Mot des Éditeurs",
                    sections: [{
                        title: "",
                        items: []
                    }]
                }
            },
            contents: {
                fr: {
                    title: "Table des Matières",
                    subtitle: "Sommaire",
                    sections: [{
                        title: "",
                        items: []
                    }]
                },
                en: {
                    title: "Table of Contents",
                    subtitle: "Contents",
                    sections: [{
                        title: "",
                        items: []
                    }]
                }
            },
            drinks: {
                fr: {
                    title: "Les Boissons",
                    subtitle: "Toute la journée",
                    sections: [
                        {
                            title: "Boissons Chaudes",
                            items: [
                                { name: "Espresso", price: "300 XPF" },
                                { name: "Americano", price: "350 XPF" },
                                { name: "Café au Lait / Cappuccino", price: "500 XPF" },
                                { name: "Sélection de Thés", price: "450 XPF" },
                                { name: "Chocolat Chaud", price: "550 XPF" }
                            ]
                        },
                        {
                            title: "Boissons Fraîches",
                            items: [
                                { name: "Sodas (Coca-Cola, etc.)", price: "400 XPF" },
                                { name: "Jus de fruits frais", price: "650 XPF" },
                                { name: "Café Glacé", price: "600 XPF" },
                                { name: "Café Frappé", price: "700 XPF" }
                            ]
                        },
                        {
                            title: "Bières & Vins",
                            items: [
                                { name: "Bière pression (33cl)", price: "700 XPF" },
                                { name: "Verre de vin (15cl)", price: "900 XPF" }
                            ]
                        }
                    ]
                },
                en: {
                    title: "Beverages",
                    subtitle: "All Day",
                    sections: [
                        {
                            title: "Hot Beverages",
                            items: [
                                { name: "Espresso", price: "300 XPF" },
                                { name: "Americano", price: "350 XPF" },
                                { name: "Café au Lait / Cappuccino", price: "500 XPF" },
                                { name: "Selection of Teas", price: "450 XPF" },
                                { name: "Hot Chocolate", price: "550 XPF" }
                            ]
                        },
                        {
                            title: "Cold Beverages",
                            items: [
                                { name: "Sodas (Coca-Cola, etc.)", price: "400 XPF" },
                                { name: "Fresh Fruit Juices", price: "650 XPF" },
                                { name: "Iced Coffee", price: "600 XPF" },
                                { name: "Blended Iced Coffee", price: "700 XPF" }
                            ]
                        },
                        {
                            title: "Beers & Wines",
                            items: [
                                { name: "Draft Beer (33cl)", price: "700 XPF" },
                                { name: "Glass of Wine (15cl)", price: "900 XPF" }
                            ]
                        }
                    ]
                }
            },
            breakfast: {
                fr: {
                    title: "L'Édition du Matin",
                    subtitle: "6h30 - 11h00",
                    sections: [
                        {
                            title: "Formules Petit Déjeuner",
                            items: [
                                { name: "Continental", price: "1550 XPF" },
                                { name: "Américain", price: "2100 XPF" },
                                { name: "Tahitien", price: "2050 XPF" }
                            ]
                        },
                        {
                            title: "Les Œufs",
                            items: [
                                { name: "3 œufs (frits, omelette, brouillés)", price: "790 XPF" },
                                { name: "Suppléments: Jambon (100), Fromage (50), Bacon (200), Légumes (150)", price: "", isNote: true }
                            ]
                        },
                        {
                            title: "Les Assiettes",
                            items: [
                                { name: "Assiette Anglaise", price: "1900 XPF", description: "Saucisses, bacon, œufs, toast, pommes sautées" },
                                { name: "Pancakes", price: "1040 XPF", description: "3 pancakes, sirop, chantilly" },
                                { name: "Pain Perdu", price: "920 XPF", description: "3 tranches, sirop, chantilly" }
                            ]
                        },
                        {
                            title: "Bien-être",
                            items: [
                                { name: "Yoggi Bowl", price: "820 XPF", description: "Yaourt, céréales, fruits frais, sirop" }
                            ]
                        }
                    ]
                },
                en: {
                    title: "The Morning Edition",
                    subtitle: "6:30am - 11:00am",
                    sections: [
                        {
                            title: "Breakfast Sets",
                            items: [
                                { name: "Continental", price: "1550 XPF" },
                                { name: "American", price: "2100 XPF" },
                                { name: "Tahitian", price: "2050 XPF" }
                            ]
                        },
                        {
                            title: "Eggs",
                            items: [
                                { name: "3 eggs (fried, omelette, scrambled)", price: "790 XPF" },
                                { name: "Add-ons: Ham (100), Cheese (50), Bacon (200), Vegetables (150)", price: "", isNote: true }
                            ]
                        },
                        {
                            title: "Plates",
                            items: [
                                { name: "English Breakfast Plate", price: "1900 XPF", description: "Sausages, bacon, eggs, toast, hashbrown" },
                                { name: "Pancakes", price: "1040 XPF", description: "3 pancakes, syrup, whipped cream" },
                                { name: "French Toast", price: "920 XPF", description: "3 slices, syrup, whipped cream" }
                            ]
                        },
                        {
                            title: "Wellness",
                            items: [
                                { name: "Yoggi Bowl", price: "820 XPF", description: "Yogurt, cereals, fresh fruits, syrup" }
                            ]
                        }
                    ]
                }
            },
            lunch: {
                fr: {
                    title: "Spéciaux de Midi",
                    subtitle: "11h00 - 15h00",
                    sections: [
                        {
                            title: "Formules Midi",
                            items: [
                                { name: "Formule Burger", price: "1950 XPF", description: "Burger, soda, glace" },
                                { name: "Menu Adulte", price: "3100 XPF", description: "Bière/vin, plat, pâtisserie/glace, café" },
                                { name: "Menu Enfant", price: "1200 XPF", description: "Sirop, plat, accompagnement, glace" }
                            ]
                        },
                        {
                            title: "Poissons",
                            subtitle: "Servis avec riz, frites ou salade",
                            items: [
                                { name: "Poisson cru au lait de coco (Petite)", price: "1550 XPF" },
                                { name: "Poisson cru au lait de coco (Grande)", price: "2000 XPF" },
                                { name: "Sashimi de thon rouge", price: "2000 XPF" },
                                { name: "Trilogie de thon", price: "2500 XPF", description: "Tartare, Sashimi, Poisson Cru" },
                                { name: "Fish & chips", price: "2000 XPF" }
                            ]
                        },
                        {
                            title: "Salades",
                            items: [
                                { name: "Crudités (Petite)", price: "750 XPF" },
                                { name: "Crudités (Grande)", price: "950 XPF" },
                                { name: "Thon tiède (Petite)", price: "1300 XPF" },
                                { name: "Thon tiède (Grande)", price: "1900 XPF" },
                                { name: "Chèvre (Petite)", price: "1350 XPF" },
                                { name: "Chèvre (Grande)", price: "1950 XPF" }
                            ]
                        }
                    ]
                },
                en: {
                    title: "Midday Specials",
                    subtitle: "11:00am - 3:00pm",
                    sections: [
                        {
                            title: "Lunch Sets",
                            items: [
                                { name: "Burger Set", price: "1950 XPF", description: "Burger, soda, ice cream" },
                                { name: "Adult Menu", price: "3100 XPF", description: "Beer/wine, main, pastry/ice cream, coffee" },
                                { name: "Kids Menu", price: "1200 XPF", description: "Syrup, main, side, ice cream" }
                            ]
                        },
                        {
                            title: "Fish",
                            subtitle: "Served with rice, fries, or salad",
                            items: [
                                { name: "Raw Fish with Coconut Milk (Small)", price: "1550 XPF" },
                                { name: "Raw Fish with Coconut Milk (Large)", price: "2000 XPF" },
                                { name: "Red Tuna Sashimi", price: "2000 XPF" },
                                { name: "Tuna Trilogy", price: "2500 XPF", description: "Tartare, Sashimi, Raw Fish" },
                                { name: "Fish & Chips", price: "2000 XPF" }
                            ]
                        },
                        {
                            title: "Salads",
                            items: [
                                { name: "Fresh Vegetables (Small)", price: "750 XPF" },
                                { name: "Fresh Vegetables (Large)", price: "950 XPF" },
                                { name: "Warm Tuna (Small)", price: "1300 XPF" },
                                { name: "Warm Tuna (Large)", price: "1900 XPF" },
                                { name: "Goat Cheese (Small)", price: "1350 XPF" },
                                { name: "Goat Cheese (Large)", price: "1950 XPF" }
                            ]
                        }
                    ]
                }
            },
            pastries: {
                fr: {
                    title: "La Section Sucrée",
                    subtitle: "Toute la journée",
                    sections: [
                        {
                            title: "Les Classiques",
                            items: [
                                { name: "Croissant", price: "185 XPF" },
                                { name: "Pain au Chocolat", price: "195 XPF" },
                                { name: "Croissant Amandes", price: "275 XPF" },
                                { name: "Beignet", price: "235 XPF" },
                                { name: "Pain Chocolat Amandes", price: "290 XPF" },
                                { name: "Pain Raisin", price: "270 XPF" },
                                { name: "Chausson aux Pommes", price: "270 XPF" }
                            ]
                        },
                        {
                            title: "Délices Sucrés",
                            items: [
                                { name: "Cake Ananas ou Banane", price: "245 XPF" },
                                { name: "Brownies", price: "265 XPF" },
                                { name: "Brioche au Sucre", price: "245 XPF" },
                                { name: "Palmier", price: "275 XPF" },
                                { name: "Tresse Nutella", price: "295 XPF" }
                            ]
                        },
                        {
                            title: "Nos Spécialités",
                            items: [
                                { name: "Chouquette", price: "65 XPF" },
                                { name: "Fondant Chocolat", price: "325 XPF" },
                                { name: "Pithivier ananas / pommes", price: "285 XPF" },
                                { name: "Cookie Coco Pépites", price: "255 XPF" }
                            ]
                        }
                    ]
                },
                en: {
                    title: "The Sweet Section",
                    subtitle: "All Day",
                    sections: [
                        {
                            title: "The Classics",
                            items: [
                                { name: "Croissant", price: "185 XPF" },
                                { name: "Pain au Chocolat", price: "195 XPF" },
                                { name: "Almond Croissant", price: "275 XPF" },
                                { name: "Beignet", price: "235 XPF" },
                                { name: "Almond Chocolate Bread", price: "290 XPF" },
                                { name: "Raisin Bread", price: "270 XPF" },
                                { name: "Apple Turnover", price: "270 XPF" }
                            ]
                        },
                        {
                            title: "Sweet Delights",
                            items: [
                                { name: "Pineapple or Banana Cake", price: "245 XPF" },
                                { name: "Brownies", price: "265 XPF" },
                                { name: "Sugar Brioche", price: "245 XPF" },
                                { name: "Palmier", price: "275 XPF" },
                                { name: "Nutella Braid", price: "295 XPF" }
                            ]
                        },
                        {
                            title: "Our Specialties",
                            items: [
                                { name: "Chouquette", price: "65 XPF" },
                                { name: "Chocolate Fondant", price: "325 XPF" },
                                { name: "Pithivier Pineapple / Apple", price: "285 XPF" },
                                { name: "Coconut Chip Cookie", price: "255 XPF" }
                            ]
                        }
                    ]
                }
            },
            tapas: {
                fr: {
                    title: "Coucher de Soleil Social",
                    subtitle: "15h00 - 18h00",
                    sections: [
                        {
                            title: "Tapas & Partage",
                            items: [
                                { name: "Portion de Frites / Patate Douce", price: "600 XPF" },
                                { name: "Mini Pizza / Quiche", price: "450 XPF", description: "Portion partage" },
                                { name: "Verrine de Poisson Cru", price: "900 XPF", description: "Poisson cru servi dans un petit verre" },
                                { name: "Assiette de Dégustation de Thon", price: "1500 XPF", description: "Petite assiette avec sashimi/tartare" },
                                { name: "Paquet de 10 chouquettes", price: "600 XPF" },
                                { name: "Planche de Fromage et Jambon Cru", price: "1950 XPF" }
                            ]
                        }
                    ]
                },
                en: {
                    title: "Social Sunset",
                    subtitle: "3:00pm - 6:00pm",
                    sections: [
                        {
                            title: "Tapas & Sharing",
                            items: [
                                { name: "Portion of Fries / Sweet Potato Fries", price: "600 XPF" },
                                { name: "Mini Pizza / Quiche", price: "450 XPF", description: "Sharing portion" },
                                { name: "Raw Fish Glass", price: "900 XPF", description: "Raw fish served in a small glass" },
                                { name: "Tuna Tasting Plate", price: "1500 XPF", description: "Small plate with sashimi/tartare" },
                                { name: "Bag of 10 Chouquettes", price: "600 XPF" },
                                { name: "Cheese and Cured Ham Board", price: "1950 XPF" }
                            ]
                        }
                    ]
                }
            },
            contact: {
                fr: {
                    title: "Notre Histoire & Contact",
                    subtitle: "L'équipe et les événements",
                    sections: [{
                        title: "",
                        items: []
                    }]
                },
                en: {
                    title: "Our Story & Contact",
                    subtitle: "The team and events",
                    sections: [{
                        title: "",
                        items: []
                    }]
                }
            }
        };
    }

    setupLanguageToggle() {
        const frBtn = document.getElementById('lang-fr');
        const enBtn = document.getElementById('lang-en');

        frBtn.addEventListener('click', () => this.switchLanguage('fr'));
        enBtn.addEventListener('click', () => this.switchLanguage('en'));
    }

    switchLanguage(lang) {
        this.currentLanguage = lang;

        // Update button states
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`lang-${lang}`).classList.add('active');

        // Update HTML lang attribute
        document.getElementById('html-root').setAttribute('lang', lang);

        // Update all translatable elements
        document.querySelectorAll('[data-fr]').forEach(element => {
            const text = element.getAttribute(`data-${lang}`);
            if (text) {
                element.textContent = text;
            }
        });

        // Update date
        if (this.updateDate) {
            this.updateDate();
        }

        // Regenerate pages with new language
        if (this.flipbookEnabled && this.pageFlip) {
            this.updateFlipbookContent();
        } else {
            this.generateMenuPage(this.currentPage);
        }
    }

    updateFlipbookContent() {
        if (!this.flipbookEnabled || !this.pageFlip) {
            console.log('Flipbook not enabled or pageFlip not available');
            return;
        }

        console.log('Updating flipbook content for language:', this.currentLanguage);

        // Store current page index
        const currentPageIndex = this.currentPageIndex;

        // Regenerate all pages with new language
        const pageElements = [];
        this.pages.forEach((page, index) => {
            const pageDiv = document.createElement('div');
            pageDiv.className = 'flipbook-page';
            pageDiv.setAttribute('data-page', page);

            const pageData = this.menuData[page][this.currentLanguage];
            if (pageData) {
                pageDiv.innerHTML = this.generatePageContent(page, pageData);
            }

            pageElements.push(pageDiv);
        });

        try {
            // Try to update existing flipbook pages directly
            // First clear existing pages
            this.pageFlip.clear();

            // Load new pages
            this.pageFlip.loadFromHTML(pageElements);

            // Try to go back to the same page
            if (currentPageIndex < this.pages.length) {
                setTimeout(() => {
                    this.pageFlip.flip(currentPageIndex);
                    this.updatePageIndicator();
                }, 100);
            }

            console.log('✅ Flipbook content updated for language:', this.currentLanguage);
        } catch (error) {
            console.warn('Failed to update flipbook directly, reinitializing...', error);

            // Fallback: reinitialize the entire flipbook
            this.reinitializeFlipbook(pageElements, currentPageIndex);
        }
    }

    reinitializeFlipbook(pageElements, targetPageIndex = 0) {
        console.log('Reinitializing flipbook...');

        // Get the flipbook element
        const flipbookElement = document.getElementById('flipbook');
        if (!flipbookElement) {
            console.error('Flipbook element not found for reinitialization');
            return;
        }

        const container = flipbookElement.parentElement;
        if (!container) {
            console.error('Flipbook container not found');
            return;
        }

        // Get dimensions
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const pageWidth = Math.max(350, Math.min(containerWidth * 0.45, 500));
        const pageHeight = Math.max(500, Math.min(containerHeight * 0.9, 800));

        // Destroy old flipbook if it exists
        if (this.pageFlip) {
            try {
                this.pageFlip.destroy();
            } catch (e) {
                console.warn('Error destroying flipbook:', e);
            }
        }

        // Clear element
        flipbookElement.innerHTML = '';

        // Create new flipbook
        this.pageFlip = new St.PageFlip(flipbookElement, {
            width: pageWidth,
            height: pageHeight,
            size: 'stretch',
            minWidth: 300,
            maxWidth: 600,
            minHeight: 500,
            maxHeight: 900,
            drawShadow: true,
            flippingTime: 500,
            usePortrait: true,
            startPage: targetPageIndex,
            autoSize: true,
            maxShadowOpacity: 0.15,
            showCover: false,
            mobileScrollSupport: true,
            swipeDistance: 30,
            clickEventForward: true,
            useMouseEvents: true,
            disableFlipByClick: false
        });

        // Load pages
        this.pageFlip.loadFromHTML(pageElements);

        // Setup event listeners
        this.pageFlip.on('flip', (e) => {
            this.currentPageIndex = e.data;
            this.currentPage = this.pages[this.currentPageIndex] || 'welcome';
            this.updatePageIndicator();
        });

        this.pageFlip.on('init', () => {
            console.log('✅ Flipbook reinitialized successfully!');
            this.updatePageIndicator();
        });
    }

    setupArrowNavigation() {
        const prevBtn = document.getElementById('nav-prev');
        const nextBtn = document.getElementById('nav-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigatePrevious());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateNext());
        }

        // Update page indicator initially
        this.updatePageIndicator();
    }

    navigatePrevious() {
        if (this.currentPageIndex > 0) {
            this.navigateToPageIndex(this.currentPageIndex - 1);
        }
    }

    navigateNext() {
        if (this.currentPageIndex < this.pages.length - 1) {
            this.navigateToPageIndex(this.currentPageIndex + 1);
        }
    }

    navigateToPageIndex(index) {
        if (index >= 0 && index < this.pages.length) {
            this.currentPageIndex = index;
            this.currentPage = this.pages[index];

            if (this.flipbookEnabled && this.pageFlip) {
                this.pageFlip.flip(index, 'top');
            }

            this.updatePageIndicator();
        }
    }

    updatePageIndicator() {
        const currentPageSpan = document.getElementById('current-page');
        const totalPagesSpan = document.getElementById('total-pages');
        const prevBtn = document.getElementById('nav-prev');
        const nextBtn = document.getElementById('nav-next');

        if (currentPageSpan) {
            currentPageSpan.textContent = this.currentPageIndex + 1;
        }

        if (totalPagesSpan) {
            totalPagesSpan.textContent = this.pages.length;
        }

        // Update button states
        if (prevBtn) {
            prevBtn.disabled = this.currentPageIndex === 0;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPageIndex === this.pages.length - 1;
        }
    }

    switchPage(page) {
        this.currentPage = page;
        const pageIndex = this.pages.indexOf(page);

        if (this.flipbookEnabled && this.pageFlip && pageIndex >= 0) {
            // Use flipbook navigation
            this.pageFlip.flip(pageIndex, 'top');
        } else {
            // Use fallback navigation
            document.querySelectorAll('.menu-page').forEach(pageEl => {
                pageEl.classList.remove('active');
            });

            setTimeout(() => {
                const targetPage = document.getElementById(`page-${page}`);
                if (targetPage) {
                    targetPage.classList.add('active');
                }
            }, 50);

            // Generate content for fallback mode
            this.generateMenuPage(page);
        }
    }

    generateAllMenuPages() {
        // Only for fallback mode
        if (!this.flipbookEnabled) {
            Object.keys(this.menuData).forEach(page => {
                this.generateMenuPage(page);
            });
        }
    }

    generateMenuPage(page) {
        // Only for fallback mode
        if (this.flipbookEnabled) return;

        const pageData = this.menuData[page][this.currentLanguage];
        if (!pageData) return;

        const pageElement = document.getElementById(`page-${page}`);
        if (!pageElement) return;

        pageElement.innerHTML = this.generatePageContent(page, pageData);
    }

    generateMenuSection(section) {
        return `
            <div class="menu-column">
                <h3>${section.title}</h3>
                ${section.subtitle ? `<p class="section-subtitle">${section.subtitle}</p>` : ''}
                <div class="menu-items">
                    ${section.items.map(item => this.generateMenuItem(item)).join('')}
                </div>
            </div>
        `;
    }

    generateMenuItem(item) {
        if (item.isNote) {
            return `
                <div class="menu-item supplement">
                    <div class="menu-item-header">
                        <span class="item-name">${item.name}</span>
                    </div>
                </div>
            `;
        }

        return `
            <div class="menu-item">
                <div class="menu-item-header">
                    <span class="item-name">${item.name}</span>
                    ${item.price ? `<span class="item-dots"></span>` : ''}
                    ${item.price ? `<span class="item-price">${item.price}</span>` : ''}
                </div>
                ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
            </div>
        `;
    }

    setupDateDisplay() {
        const dateElement = document.getElementById('current-date');
        if (!dateElement) return;

        const now = new Date();
        const options = {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        };

        const updateDate = () => {
            const date = this.currentLanguage === 'fr'
                ? now.toLocaleDateString('fr-FR', options)
                : now.toLocaleDateString('en-US', options);
            dateElement.textContent = date;
        };

        updateDate();
        this.updateDate = updateDate;
    }

    setupImagePlaceholders() {
        setTimeout(() => {
            document.querySelectorAll('img').forEach(img => {
                img.addEventListener('error', function() {
                    this.style.display = 'none';
                    this.classList.add('image-failed');
                });

                if (img.src.includes('[') && img.src.includes(']')) {
                    img.style.display = 'none';
                    img.classList.add('image-placeholder');
                }
            });
        }, 100);
    }

    isMobileDevice() {
        return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    cleanupScrollAnimations() {
        console.log('Cleaning up scroll animations and orphaned content...');

        // Remove all menu items with scroll animation styles
        const scrollAnimatedItems = document.querySelectorAll('.menu-item[style*="opacity"], .menu-item[style*="transform"], .menu-item[style*="transition"]');
        console.log('Found scroll animated menu items:', scrollAnimatedItems.length);

        scrollAnimatedItems.forEach((item, index) => {
            item.remove();
            console.log('Removed scroll animated item', index);
        });

        // Remove any orphaned menu sections or columns that might have been created by scroll animations
        const orphanedSections = document.querySelectorAll('.menu-column:not(.flipbook-page .menu-column)');
        console.log('Found orphaned menu sections:', orphanedSections.length);

        orphanedSections.forEach((section, index) => {
            section.remove();
            console.log('Removed orphaned section', index);
        });

        // Remove any remaining fallback content outside of flipbook
        const fallbackContent = document.querySelectorAll('.menu-pages:not(.flipbook), .menu-page:not(.flipbook-page)');
        console.log('Found fallback content:', fallbackContent.length);

        fallbackContent.forEach((content, index) => {
            content.remove();
            console.log('Removed fallback content', index);
        });

        console.log('✅ Scroll animations cleanup complete');
    }
}

// Initialize the menu when DOM is loaded
let caramelinMenu;
document.addEventListener('DOMContentLoaded', () => {
    caramelinMenu = new CaramelinMenu();
});

// Add scroll animations ONLY for fallback mode
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // Only run animations if flipbook is NOT active
        if (document.body.classList.contains('use-fallback')) {
            console.log('Setting up scroll animations for fallback mode');
            const menuItems = document.querySelectorAll('.menu-item');

            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, observerOptions);

            menuItems.forEach((item, index) => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
                observer.observe(item);
            });
        } else {
            console.log('Flipbook mode active - skipping scroll animations');
        }
    }, 2000);
});