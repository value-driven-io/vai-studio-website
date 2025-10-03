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
        const response = await fetch(`${lang}_funding_investors.json`);
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
            { text: texts.businessPlan, href: "/presentation/VAI/businessplan/businessplan.html" },
            { text: texts.financials, href: "/presentation/VAI/funding-strategy/index.html" },
            { text: texts.funding, href: "index.html" }
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
        document.title = allData.title || 'VAI Funding Strategy';
        const heroSection = document.createElement('section');
        heroSection.id = 'section-hero';
        heroSection.className = 'section hero-section';
        const heroContent = document.createElement('div');
        heroContent.className = 'hero-content';
        const heroTitle = document.createElement('h1');
        heroTitle.className = 'hero-title';
        heroTitle.textContent = allData.title;
        heroContent.appendChild(heroTitle);
        if (allData.executive_summary) {
            const heroSubtitle = document.createElement('p');
            heroSubtitle.className = 'hero-subtitle';
            heroSubtitle.textContent = allData.executive_summary.title;
            heroContent.appendChild(heroSubtitle);
        }
        heroSection.appendChild(heroContent);
        contentSectionsContainer.appendChild(heroSection);
    }

    function renderContent() {
        if (allData.executive_summary) {
            const section = document.createElement('section');
            section.className = 'section content-section';
            const header = document.createElement('h2');
            header.className = 'section-header';
            header.textContent = allData.executive_summary.title;
            section.appendChild(header);
            const contentDiv = document.createElement('div');
            contentDiv.className = 'section-content';

            const card = document.createElement('div');
            card.className = 'info-card';

            const description = document.createElement('p');
            description.innerHTML = markdownToHtml(allData.executive_summary.description);
            card.appendChild(description);

            if (allData.executive_summary.value_proposition) {
                const subData = allData.executive_summary.value_proposition;
                const subTitle = document.createElement('h3');
                subTitle.textContent = subData.title;
                card.appendChild(subTitle);
                const ul = document.createElement('ul');
                subData.items.forEach(item => {
                    const li = document.createElement('li');
                    li.innerHTML = markdownToHtml(item);
                    ul.appendChild(li);
                });
                card.appendChild(ul);
            }

            if (allData.executive_summary.funding_stack) {
                const subData = allData.executive_summary.funding_stack;
                const subTitle = document.createElement('h3');
                subTitle.textContent = subData.title;
                card.appendChild(subTitle);
                card.appendChild(createTable(subData.table));
            }

            if (allData.executive_summary.investment_offer) {
                const subData = allData.executive_summary.investment_offer;
                const subTitle = document.createElement('h3');
                subTitle.textContent = subData.title;
                card.appendChild(subTitle);
                if (subData.table) {
                    card.appendChild(createTable(subData.table));
                }
            }

            contentDiv.appendChild(card);
            section.appendChild(contentDiv);
            contentSectionsContainer.appendChild(section);
        }

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

            const card = document.createElement('div');
            card.className = 'info-card';

            // Track which keys have been processed to avoid duplicates
            const processedKeys = new Set();

            Object.keys(sectionData).forEach(key => {
                if (key === 'title') return;

                const item = sectionData[key];

                if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                    // Mark this key as processed
                    processedKeys.add(key);

                    // Render main title if exists
                    if (item.title) {
                        const subTitle = document.createElement('h3');
                        subTitle.textContent = item.title;
                        card.appendChild(subTitle);
                    }

                    // Render description if exists
                    if (item.description) {
                        const description = document.createElement('p');
                        description.innerHTML = markdownToHtml(item.description);
                        card.appendChild(description);
                    }

                    // Render items list if exists (for sections like "the_numbers")
                    if (item.items && Array.isArray(item.items)) {
                        const ul = document.createElement('ul');
                        item.items.forEach(point => {
                            const li = document.createElement('li');
                            li.innerHTML = markdownToHtml(point);
                            ul.appendChild(li);
                        });
                        card.appendChild(ul);
                    }

                    // Render points if exists
                    if (item.points && Array.isArray(item.points)) {
                        const ul = document.createElement('ul');
                        item.points.forEach(point => {
                            const li = document.createElement('li');
                            li.innerHTML = markdownToHtml(point);
                            ul.appendChild(li);
                        });
                        card.appendChild(ul);
                    }

                    // Render table if exists
                    if (item.table) {
                        card.appendChild(createTable(item.table));
                    }

                    // Render note if exists
                    if (item.note) {
                        const note = document.createElement('p');
                        note.className = 'section-note';
                        note.innerHTML = `<em>${markdownToHtml(item.note)}</em>`;
                        card.appendChild(note);
                    }

                    // Render final_statement if exists (for call_to_action)
                    if (item.final_statement) {
                        const statement = document.createElement('p');
                        statement.className = 'final-statement';
                        statement.innerHTML = markdownToHtml(item.final_statement);
                        card.appendChild(statement);
                    }

                    // Handle nested tables in budget
                    const budgetItems = ['personnel', 'transactional_costs', 'technology', 'marketing', 'services', 'operations', 'reserve', 'summary'];
                    budgetItems.forEach(budgetKey => {
                        if(item[budgetKey]) {
                            processedKeys.add(budgetKey);
                            const budgetItem = item[budgetKey];
                            const t = document.createElement('h4');
                            t.textContent = budgetItem.title;
                            card.appendChild(t);
                            if(budgetItem.note) {
                                const noteP = document.createElement('p');
                                noteP.className = 'budget-note';
                                noteP.innerHTML = `<em>${markdownToHtml(budgetItem.note)}</em>`;
                                card.appendChild(noteP);
                            }
                            if(budgetItem.table) {
                                card.appendChild(createTable(budgetItem.table));
                            }
                        }
                    });

                    // revenue projections
                    if(item.institutional_support){
                        processedKeys.add('institutional_support');
                        const t = document.createElement('h4');
                        t.textContent = item.institutional_support.title;
                        card.appendChild(t);
                        const ul = document.createElement('ul');
                        item.institutional_support.points.forEach(p => {
                            const li = document.createElement('li');
                            li.innerHTML = markdownToHtml(p);
                            ul.appendChild(li);
                        });
                        card.appendChild(ul);
                    }
                    if(item.metrics){
                        processedKeys.add('metrics');
                        const t = document.createElement('h4');
                        t.textContent = item.metrics.title;
                        card.appendChild(t);
                        card.appendChild(createTable(item.metrics.table));
                    }

                    // allocation (legacy sections that may still exist)
                    if(item.expenses){
                        processedKeys.add('expenses');
                        const t = document.createElement('h4');
                        t.textContent = item.title;
                        card.appendChild(t);
                        const ul = document.createElement('ul');
                        item.expenses.points.forEach(p => {
                            const li = document.createElement('li');
                            li.innerHTML = markdownToHtml(p);
                            ul.appendChild(li);
                        });
                        card.appendChild(ul);
                        if(item.score) {
                            const score = document.createElement('p');
                            score.innerHTML = `<strong>${item.score}</strong>`;
                            card.appendChild(score);
                        }
                    }
                    if(item.equipment_list){
                        processedKeys.add('equipment_list');
                        const t = document.createElement('h4');
                        t.textContent = item.title;
                        card.appendChild(t);
                        card.appendChild(createTable(item.equipment_list.table));
                    }
                    if(item.use){
                        processedKeys.add('use');
                        const t = document.createElement('h4');
                        t.textContent = item.title;
                        card.appendChild(t);
                        const ul = document.createElement('ul');
                        item.use.points.forEach(p => {
                            const li = document.createElement('li');
                            li.innerHTML = markdownToHtml(p);
                            ul.appendChild(li);
                        });
                        card.appendChild(ul);
                    }
                    if(item.repayment){
                        processedKeys.add('repayment');
                        const t = document.createElement('h4');
                        t.textContent = item.repayment.title;
                        card.appendChild(t);
                        const ul = document.createElement('ul');
                        item.repayment.points.forEach(p => {
                            const li = document.createElement('li');
                            li.innerHTML = markdownToHtml(p);
                            ul.appendChild(li);
                        });
                        card.appendChild(ul);
                    }

                    // Handle deeply nested objects (like in conclusion section)
                    // Only process keys that haven't been handled yet
                    const skipKeys = new Set(['title', 'description', 'points', 'table', 'note', 'score', 'items', 'final_statement']);
                    Object.keys(item).forEach(nestedKey => {
                        // Skip if already processed or in skip list
                        if (processedKeys.has(nestedKey) || skipKeys.has(nestedKey)) return;

                        const nestedItem = item[nestedKey];
                        if (typeof nestedItem === 'object' && nestedItem !== null && !Array.isArray(nestedItem)) {
                            processedKeys.add(nestedKey);

                            if (nestedItem.title) {
                                const nestedTitle = document.createElement('h4');
                                nestedTitle.textContent = nestedItem.title;
                                card.appendChild(nestedTitle);
                            }
                            if (nestedItem.description) {
                                const nestedDesc = document.createElement('p');
                                nestedDesc.innerHTML = markdownToHtml(nestedItem.description);
                                card.appendChild(nestedDesc);
                            }
                            if (nestedItem.items) {
                                const nestedUl = document.createElement('ul');
                                nestedItem.items.forEach(point => {
                                    const li = document.createElement('li');
                                    li.innerHTML = markdownToHtml(point);
                                    nestedUl.appendChild(li);
                                });
                                card.appendChild(nestedUl);
                            }
                        }
                    });

                } else if (Array.isArray(item)) {
                    const ul = document.createElement('ul');
                    item.forEach(point => {
                        const li = document.createElement('li');
                        li.innerHTML = markdownToHtml(point);
                        ul.appendChild(li);
                    });
                    card.appendChild(ul);
                } else if (typeof item === 'string') {
                    const p = document.createElement('p');
                    p.innerHTML = markdownToHtml(item);
                    card.appendChild(p);
                }
            });

            contentDiv.appendChild(card);
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

    function createTableWithNote(tableData, noteText) {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-with-note';
        wrapper.appendChild(createTable(tableData));
        if (noteText) {
            const noteP = document.createElement('p');
            noteP.className = 'table-note';
            noteP.innerHTML = `<em>${markdownToHtml(noteText)}</em>`;
            wrapper.appendChild(noteP);
        }
        return wrapper;
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
