// Standalone Card-based Menu System
class CardMenu {
    constructor() {
        this.currentLanguage = 'fr';
        this.currentCardIndex = 0;
        this.cards = ['welcome', 'drinks', 'breakfast', 'lunch', 'pastries', 'tapas'];

        // Wait for main menu to load
        if (window.caramelinMenu && window.caramelinMenu.menuData) {
            this.menuData = window.caramelinMenu.menuData;
            this.init();
        } else {
            // Retry after a delay
            setTimeout(() => {
                if (window.caramelinMenu && window.caramelinMenu.menuData) {
                    this.menuData = window.caramelinMenu.menuData;
                    this.init();
                } else {
                    console.warn('Menu data not available, card system not initialized');
                }
            }, 500);
        }
    }

    init() {
        console.log('Initializing card menu system...');
        this.renderAllCards();
        this.showCard(0);
        this.setupNavigation();
        this.setupLanguageSync();

        // Show the card system
        const cardSection = document.querySelector('.menu-cards-section');
        const cardNav = document.querySelector('.card-navigation');

        if (cardSection) {
            cardSection.classList.add('initialized');
        }
        if (cardNav) {
            cardNav.classList.add('initialized');
        }

        console.log('Card menu initialized successfully');
    }

    setupLanguageSync() {
        // Sync with main menu language changes
        const observer = new MutationObserver(() => {
            const frBtn = document.getElementById('lang-fr');
            if (frBtn && frBtn.classList.contains('active')) {
                this.currentLanguage = 'fr';
                this.updateLanguage();
            } else {
                this.currentLanguage = 'en';
                this.updateLanguage();
            }
        });

        const frBtn = document.getElementById('lang-fr');
        const enBtn = document.getElementById('lang-en');

        if (frBtn) {
            observer.observe(frBtn, { attributes: true, attributeFilter: ['class'] });
        }
        if (enBtn) {
            observer.observe(enBtn, { attributes: true, attributeFilter: ['class'] });
        }
    }

    updateLanguage() {
        // Update all translatable elements in cards
        document.querySelectorAll('#cards-container [data-fr]').forEach(element => {
            const text = element.getAttribute(`data-${this.currentLanguage}`);
            if (text) {
                element.textContent = text;
            }
        });
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
                        <h2 class="card-title" data-fr="${this.escapeHtml(frData.title)}" data-en="${this.escapeHtml(enData.title)}">${frData.title}</h2>
                        <p class="card-subtitle" data-fr="${this.escapeHtml(frData.subtitle)}" data-en="${this.escapeHtml(enData.subtitle)}">${frData.subtitle}</p>
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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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

    showCard(index) {
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

        // Update navigation buttons
        this.updateNavButtons();
        this.updatePageIndicator();
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, waiting for menu data...');
    // Wait a bit for the main script to load
    setTimeout(() => {
        window.cardMenu = new CardMenu();
    }, 300);
});