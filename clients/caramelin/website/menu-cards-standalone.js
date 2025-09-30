// Standalone Card-based Menu System
// Complete menu data embedded

class CardMenuStandalone {
    constructor() {
        this.currentLanguage = 'fr';
        this.currentCardIndex = 0;
        this.cards = ['welcome', 'drinks', 'breakfast', 'lunch', 'pastries', 'tapas'];
        this.menuData = this.getMenuData();
        this.init();
    }

    init() {
        console.log('Initializing standalone card menu...');
        this.setupDateDisplay();
        this.setupLanguageToggle();
        this.setupTOCToggle();
        this.setupTOCNavigation();
        this.setupTabNavigation();
        this.renderAllCards();
        this.showCard(0);
        this.setupNavigation();
        console.log('Card menu initialized successfully');
    }

    setupTOCToggle() {
        const tocToggle = document.getElementById('toc-toggle');
        const tocContent = document.getElementById('toc-content');

        if (tocToggle && tocContent) {
            tocToggle.addEventListener('click', () => {
                tocToggle.classList.toggle('open');
                tocContent.classList.toggle('open');
            });
        }
    }

    setupTOCNavigation() {
        const tocItems = document.querySelectorAll('.toc-item');

        tocItems.forEach(item => {
            item.addEventListener('click', () => {
                const cardIndex = parseInt(item.getAttribute('data-card'));
                this.showCard(cardIndex, true); // Pass true to scroll to cards

                // Close TOC on mobile after selection
                const tocToggle = document.getElementById('toc-toggle');
                const tocContent = document.getElementById('toc-content');
                if (window.innerWidth < 768 && tocToggle && tocContent) {
                    tocToggle.classList.remove('open');
                    tocContent.classList.remove('open');
                }
            });
        });
    }

    setupTabNavigation() {
        const tabItems = document.querySelectorAll('.tab-item');

        tabItems.forEach(tab => {
            tab.addEventListener('click', () => {
                const cardIndex = parseInt(tab.getAttribute('data-card'));
                this.showCard(cardIndex, true); // Pass true to scroll to cards
            });
        });
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

    setupLanguageToggle() {
        const frBtn = document.getElementById('lang-fr');
        const enBtn = document.getElementById('lang-en');

        if (frBtn) {
            frBtn.addEventListener('click', () => this.switchLanguage('fr'));
        }
        if (enBtn) {
            enBtn.addEventListener('click', () => this.switchLanguage('en'));
        }
    }

    switchLanguage(lang) {
        this.currentLanguage = lang;

        // Update button states
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`lang-${lang}`).classList.add('active');

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
    }

    renderAllCards() {
        const container = document.getElementById('cards-container');
        if (!container) {
            console.warn('Cards container not found');
            return;
        }

        container.innerHTML = this.cards.map((cardId, index) =>
            this.generateCard(cardId, index)
        ).join('');
    }

    generateCard(cardId, index) {
        const data = this.menuData[cardId];
        if (!data) return '';

        if (cardId === 'welcome') {
            return this.generateWelcomeCard(index);
        }

        return this.generateMenuCard(cardId, index, data);
    }

    generateWelcomeCard(index) {
        return `
            <div class="menu-card" id="card-${index}" data-card="welcome">
                <div class="menu-card-content">
                    <h2 class="card-title" data-fr="Mot des Éditeurs" data-en="A Note from the Publishers">Mot des Éditeurs</h2>
                    <div class="card-body welcome-body">
                        <div class="welcome-image-card">
                            <img src="/clients/caramelin/resources/media/nicoleandjerome1.jpg" alt="Nicole and Jerome" class="publisher-photo-card" />
                        </div>
                        <div class="welcome-text-card">
                            <p class="welcome-paragraph-card" data-fr="Bienvenue au Caramel'in. Depuis des années, ce café est un point de rencontre pour notre communauté. Notre rêve est d'honorer cette histoire en transformant cet endroit en un livre d'histoires vivant de Moorea." data-en="Welcome to Caramel'in. For years, this cafe has been a meeting point for our community. Our dream is to honor that history by turning this place into a living storybook of Moorea.">Bienvenue au Caramel'in. Depuis des années, ce café est un point de rencontre pour notre communauté. Notre rêve est d'honorer cette histoire en transformant cet endroit en un livre d'histoires vivant de Moorea.</p>
                            <p class="welcome-paragraph-card" data-fr="Tout ce que nous servons a une histoire, du pêcheur local qui nous apporte notre thon à la famille qui cultive nos ananas. Mauruuru, et profitez de l'édition d'aujourd'hui." data-en="Everything we serve has a story, from the local fisherman who brings us our tuna to the family that grows our pineapples. Mauruuru, and enjoy today's edition.">Tout ce que nous servons a une histoire, du pêcheur local qui nous apporte notre thon à la famille qui cultive nos ananas. Mauruuru, et profitez de l'édition d'aujourd'hui.</p>
                            <p class="signature-card">– Nicole & Jerome</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateMenuCard(cardId, index, data) {
        const illustrations = {
            drinks: '/clients/caramelin/resources/media/illustrations_menu/drinks1.png',
            breakfast: '/clients/caramelin/resources/media/illustrations_menu/breakfast1.png',
            lunch: '/clients/caramelin/resources/media/illustrations_menu/lunch1.png',
            pastries: '/clients/caramelin/resources/media/illustrations_menu/sweets1.png',
            tapas: '/clients/caramelin/resources/media/illustrations_menu/tapas1.png'
        };

        const frData = data.fr;
        const enData = data.en;

        return `
            <div class="menu-card" id="card-${index}" data-card="${cardId}">
                <div class="menu-card-content">
                    <div class="card-header">
                        <div class="card-illustration">
                            <img src="${illustrations[cardId]}" alt="${cardId}" class="card-illustration-img" />
                        </div>
                        <h2 class="card-title" data-fr="${frData.title}" data-en="${enData.title}">${frData.title}</h2>
                        <p class="card-subtitle" data-fr="${frData.subtitle}" data-en="${enData.subtitle}">${frData.subtitle}</p>
                    </div>
                    <div class="card-body">
                        ${frData.sections.map(section => this.generateSection(section)).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    generateSection(section) {
        if (!section.items || section.items.length === 0) return '';

        return `
            <div class="card-section">
                <h3>${section.title}</h3>
                ${section.subtitle ? `<p class="section-subtitle">${section.subtitle}</p>` : ''}
                <div class="card-items">
                    ${section.items.map(item => this.generateItem(item)).join('')}
                </div>
            </div>
        `;
    }

    generateItem(item) {
        if (item.isNote) {
            return `
                <div class="card-item note-item">
                    <span class="card-item-name">${item.name}</span>
                </div>
            `;
        }

        return `
            <div class="card-item">
                <span class="card-item-name">${item.name}</span>
                ${item.price ? `<span class="card-item-dots"></span>` : ''}
                ${item.price ? `<span class="card-item-price">${item.price}</span>` : ''}
            </div>
            ${item.description ? `<div class="card-item-description">${item.description}</div>` : ''}
        `;
    }

    setupNavigation() {
        const prevBtn = document.getElementById('card-nav-prev');
        const nextBtn = document.getElementById('card-nav-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousCard());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextCard());
        }

        // Touch swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        const container = document.getElementById('cards-container');
        if (container) {
            container.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            container.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe(touchStartX, touchEndX);
            }, { passive: true });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousCard();
            } else if (e.key === 'ArrowRight') {
                this.nextCard();
            }
        });
    }

    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextCard();
            } else {
                this.previousCard();
            }
        }
    }

    previousCard() {
        if (this.currentCardIndex > 0) {
            this.showCard(this.currentCardIndex - 1);
        }
    }

    nextCard() {
        if (this.currentCardIndex < this.cards.length - 1) {
            this.showCard(this.currentCardIndex + 1);
        }
    }

    showCard(index, scrollToCards = false) {
        this.currentCardIndex = index;

        // Hide all cards
        document.querySelectorAll('.menu-card').forEach(card => {
            card.classList.remove('active');
        });

        // Show current card
        const currentCard = document.getElementById(`card-${index}`);
        if (currentCard) {
            currentCard.classList.add('active');
        }

        // Update TOC active state
        document.querySelectorAll('.toc-item').forEach(item => {
            item.classList.remove('active');
            if (parseInt(item.getAttribute('data-card')) === index) {
                item.classList.add('active');
            }
        });

        // Update tab active state
        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.classList.remove('active');
            if (parseInt(tab.getAttribute('data-card')) === index) {
                tab.classList.add('active');
                // Scroll active tab into view on mobile
                if (window.innerWidth < 768) {
                    tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            }
        });

        // Update navigation buttons
        this.updateNavButtons();
        this.updatePageIndicator();

        // Scroll to cards section if requested (from TOC or Tab click)
        if (scrollToCards) {
            const cardsSection = document.querySelector('.menu-cards-section');
            if (cardsSection) {
                setTimeout(() => {
                    cardsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }

    updateNavButtons() {
        const prevBtn = document.getElementById('card-nav-prev');
        const nextBtn = document.getElementById('card-nav-next');

        if (prevBtn) {
            prevBtn.disabled = this.currentCardIndex === 0;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentCardIndex === this.cards.length - 1;
        }
    }

    updatePageIndicator() {
        const indicator = document.getElementById('card-page-indicator');
        if (indicator) {
            indicator.textContent = `${this.currentCardIndex + 1} / ${this.cards.length}`;
        }
    }

    getMenuData() {
        return {
            welcome: {
                fr: { title: "Mot des Éditeurs", subtitle: "" },
                en: { title: "A Note from the Publishers", subtitle: "" }
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
            }
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing card menu...');
    window.cardMenu = new CardMenuStandalone();
});