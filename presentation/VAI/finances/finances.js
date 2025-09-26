
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
            initAnimations();
            finalizeSetup();
        } catch (error) {
            console.error("Failed to initialize website:", error);
            finalizeSetup(); 
        }
    }

    async function loadLanguage(lang) {
        const response = await fetch(`${lang}_finance.json`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        allData = await response.json();
        
        contentSectionsContainer.innerHTML = '';
        navLinks.innerHTML = '';
        navActions.innerHTML = '';

        renderInitialStructure();
        renderNavigation();
        renderContent();
        addLanguageSwitcher();
        initMobileMenu();
    }

    function markdownToHtml(markdown) {
        if (!markdown || typeof markdown !== 'string') {
            return '';
        }
        let html = markdown.trim();
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
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
        if (!html.includes('<ul>') && !html.includes('<li>') && !html.includes('<p>')) {
            html = `<p>${html}</p>`;
        }
        return html;
    }

    function renderNavigation() {
        const navTexts = {
            en: {
                businessPlan: "Business Plan",
                financials: "Financials",
                funding: "Funding Strategy"
            },
            fr: {
                businessPlan: "Plan d'Affaires",
                financials: "Finances",
                funding: "Stratégie de Financement"
            }
        };

        const texts = navTexts[currentLang] || navTexts.en;

        const links = [
            { text: texts.businessPlan, href: "../businessplan/businessplan.html" },
            { text: texts.financials, href: "index.html" },
            //{ text: texts.funding, href: "../funding-strategy/index.html" }
        ];

        links.forEach(linkInfo => {
            const a = document.createElement('a');
            a.href = linkInfo.href;
            a.textContent = linkInfo.text;
            a.className = 'nav-link';
            if (window.location.pathname.includes(linkInfo.href)) {
                a.classList.add('active');
            }
            navLinks.appendChild(a);
        });
    }

    function renderInitialStructure() {
        document.title = allData.title || 'VAI Financial Projections';
        const heroSection = document.createElement('section');
        heroSection.id = 'section-hero';
        heroSection.className = 'section hero-section';
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
        heroSection.appendChild(heroContent);
        contentSectionsContainer.appendChild(heroSection);
    }

    function renderContent() {
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

            if (sectionData.phases) {
                sectionData.phases.forEach(phase => {
                    const subContainer = document.createElement('div');
                    subContainer.className = 'subsection-container';
                    const card = document.createElement('div');
                    card.className = 'info-card';
                    const cardTitle = document.createElement('h3');
                    cardTitle.textContent = phase.title;
                    card.appendChild(cardTitle);
                    if (phase.strategy) {
                        const strategy = document.createElement('p');
                        strategy.innerHTML = markdownToHtml(phase.strategy);
                        card.appendChild(strategy);
                    }
                    if (phase.table) {
                        card.appendChild(createTable(phase.table));
                    }
                    subContainer.appendChild(card);
                    contentDiv.appendChild(subContainer);
                });
            }

            if (sectionData.summary_table) {
                const subContainer = document.createElement('div');
                subContainer.className = 'subsection-container';
                const card = document.createElement('div');
                card.className = 'info-card';
                card.appendChild(createTable(sectionData.summary_table));
                subContainer.appendChild(card);
                contentDiv.appendChild(subContainer);
            }

            if (sectionData.distribution_table) {
                const subContainer = document.createElement('div');
                subContainer.className = 'subsection-container';
                const card = document.createElement('div');
                card.className = 'info-card';
                 const cardTitle = document.createElement('h3');
                cardTitle.textContent = sectionData.distribution_table.title;
                card.appendChild(cardTitle);
                card.appendChild(createTable(sectionData.distribution_table));
                subContainer.appendChild(card);
                contentDiv.appendChild(subContainer);
            }

            if (sectionData.content) {
                sectionData.content.forEach(contentItem => {
                    const subContainer = document.createElement('div');
                    subContainer.className = 'subsection-container';
                    const card = document.createElement('div');
                    card.className = 'info-card';
                    const cardTitle = document.createElement('h3');
                    cardTitle.textContent = contentItem.title;
                    card.appendChild(cardTitle);
                    const ul = document.createElement('ul');
                    contentItem.points.forEach(point => {
                        const li = document.createElement('li');
                        li.innerHTML = markdownToHtml(point);
                        ul.appendChild(li);
                    });
                    card.appendChild(ul);
                    subContainer.appendChild(card);
                    contentDiv.appendChild(subContainer);
                });
            }

            if (sectionData.table) {
                const subContainer = document.createElement('div');
                subContainer.className = 'subsection-container';
                const card = document.createElement('div');
                card.className = 'info-card';
                card.appendChild(createTable(sectionData.table));
                subContainer.appendChild(card);
                contentDiv.appendChild(subContainer);
            }

            if (sectionData.scenarios) {
                const subContainer = document.createElement('div');
                subContainer.className = 'subsection-container';
                const card = document.createElement('div');
                card.className = 'info-card';
                const cardTitle = document.createElement('h3');
                cardTitle.textContent = sectionData.title;
                card.appendChild(cardTitle);
                const grid = document.createElement('div');
                grid.className = 'list-grid';
                sectionData.scenarios.forEach(scenario => {
                    const listCard = document.createElement('div');
                    listCard.className = 'list-card';
                    const title = document.createElement('h4');
                    title.textContent = scenario.title;
                    listCard.appendChild(title);
                    const ul = document.createElement('ul');
                    scenario.values.forEach(item => {
                        const li = document.createElement('li');
                        li.innerHTML = markdownToHtml(item);
                        ul.appendChild(li);
                    });
                    listCard.appendChild(ul);
                    grid.appendChild(listCard);
                });
                card.appendChild(grid);
                subContainer.appendChild(card);
                contentDiv.appendChild(subContainer);
            }
            
            if (sectionData.investment) {
                const subContainer = document.createElement('div');
                subContainer.className = 'subsection-container';
                const card = document.createElement('div');
                card.className = 'info-card';

                const investmentList = document.createElement('div');
                investmentList.className = 'list-card';
                const investmentTitle = document.createElement('h4');
                investmentTitle.textContent = sectionData.investment.title;
                investmentList.appendChild(investmentTitle);
                const i_ul = document.createElement('ul');
                sectionData.investment.items.forEach(item => {
                    const li = document.createElement('li');
                    li.innerHTML = markdownToHtml(item);
                    i_ul.appendChild(li);
                });
                investmentList.appendChild(i_ul);
                const i_total = document.createElement('p');
                i_total.innerHTML = `<strong>${sectionData.investment.total}</strong>`;
                investmentList.appendChild(i_total);

                const returnList = document.createElement('div');
                returnList.className = 'list-card';
                const returnTitle = document.createElement('h4');
                returnTitle.textContent = sectionData.return.title;
                returnList.appendChild(returnTitle);
                const r_ul = document.createElement('ul');
                sectionData.return.items.forEach(item => {
                    const li = document.createElement('li');
                    li.innerHTML = markdownToHtml(item);
                    r_ul.appendChild(li);
                });
                returnList.appendChild(r_ul);

                card.appendChild(investmentList);
                card.appendChild(returnList);
                subContainer.appendChild(card);
                contentDiv.appendChild(subContainer);
            }

            if (sectionData.steps) {
                 const subContainer = document.createElement('div');
                subContainer.className = 'subsection-container';
                const card = document.createElement('div');
                card.className = 'info-card';
                const cardTitle = document.createElement('h3');
                cardTitle.textContent = sectionData.title;
                card.appendChild(cardTitle);
                const grid = document.createElement('div');
                grid.className = 'list-grid';
                sectionData.steps.forEach(step => {
                    const listCard = document.createElement('div');
                    listCard.className = 'list-card';
                    const title = document.createElement('h4');
                    title.textContent = step.title;
                    listCard.appendChild(title);
                    const ul = document.createElement('ul');
                    step.tasks.forEach(item => {
                        const li = document.createElement('li');
                        li.innerHTML = markdownToHtml(item);
                        ul.appendChild(li);
                    });
                    listCard.appendChild(ul);
                    grid.appendChild(listCard);
                });
                card.appendChild(grid);
                subContainer.appendChild(card);
                contentDiv.appendChild(subContainer);
            }

            if(sectionData.paragraphs) {
                const subContainer = document.createElement('div');
                subContainer.className = 'subsection-container';
                const card = document.createElement('div');
                card.className = 'info-card';
                const cardTitle = document.createElement('h3');
                cardTitle.textContent = sectionData.title;
                card.appendChild(cardTitle);
                sectionData.paragraphs.forEach(p => {
                    const paragraph = document.createElement('p');
                    paragraph.innerHTML = markdownToHtml(p);
                    card.appendChild(paragraph);
                });
                const footer = document.createElement('p');
                footer.innerHTML = `<em>${sectionData.footer}</em>`;
                card.appendChild(footer);
                const contact = document.createElement('p');
                contact.innerHTML = `<strong>${sectionData.contact}</strong>`;
                card.appendChild(contact);
                subContainer.appendChild(card);
                contentDiv.appendChild(subContainer);
            }

            section.appendChild(contentDiv);
            contentSectionsContainer.appendChild(section);
        });
    }

    function createTable(tableData) {
        const container = document.createElement('div');
        container.className = 'table-container';
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        const tfoot = document.createElement('tfoot');
        
        const headerRow = document.createElement('tr');
        tableData.headers.forEach(headerText => {
            const th = document.createElement('th');
            const processedHeaderText = markdownToHtml(headerText);
            th.innerHTML = processedHeaderText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        tableData.rows.forEach(rowData => {
            const row = document.createElement('tr');
            rowData.forEach(cellData => {
                const td = document.createElement('td');
                const processedCellData = markdownToHtml(cellData);
                td.innerHTML = processedCellData;
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });

        if (tableData.footer) {
            const footerRow = document.createElement('tr');
            tableData.footer.forEach(cellData => {
                const td = document.createElement('td');
                const processedCellData = markdownToHtml(cellData);
                td.innerHTML = `<strong>${processedCellData}</strong>`;
                footerRow.appendChild(td);
            });
            tfoot.appendChild(footerRow);
        }

        table.appendChild(thead);
        table.appendChild(tbody);
        table.appendChild(tfoot);
        container.appendChild(table);
        return container;
    }

    function initMobileMenu() {
        mobileToggle.addEventListener('click', () => {
            mainNav.classList.toggle('mobile-open');
            mobileToggle.classList.toggle('active');
        });
        navLinks.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                mainNav.classList.remove('mobile-open');
                mobileToggle.classList.remove('active');
            }
        });
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
        enBtn.innerHTML = `<span class="flag-icon">🇺🇸</span><span class="lang-text">EN</span>`;
        enBtn.classList.add('lang-btn');
        enBtn.setAttribute('data-lang', 'en');
        enBtn.setAttribute('title', 'English');
        if (currentLang === 'en') enBtn.classList.add('active');
        enBtn.addEventListener('click', () => switchLanguage('en'));

        const frBtn = document.createElement('button');
        frBtn.innerHTML = `<span class="flag-icon">🇫🇷</span><span class="lang-text">FR</span>`;
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
        await loadLanguage(currentLang);
        initAnimations();
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            }
        });
    }

    function initAnimations() {
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
        gsap.to(mainHeader, { y: 0, duration: 1, ease: 'power2.out', delay: 0.5 });
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
        document.querySelectorAll('.main-nav a').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    gsap.to(window, { 
                        duration: 1.5, 
                        scrollTo: { y: href, offsetY: 100 }, 
                        ease: 'power3.inOut' 
                    });
                }
            });
        });
        gsap.utils.toArray('.content-section').forEach(section => {
            ScrollTrigger.create({
                trigger: section,
                start: 'top center',
                end: 'bottom center',
                onToggle: self => {
                    const link = document.querySelector(`a[href="#${section.id}"]`);
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
        gsap.to(loadingScreen, { 
            opacity: 0, 
            duration: 0.5, 
            onComplete: () => loadingScreen.style.display = 'none' 
        });
        gsap.to(body, { opacity: 1, duration: 1 });
    }

    init();
});
