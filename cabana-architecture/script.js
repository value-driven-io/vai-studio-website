// cabana-architecture/script.js
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Loading screen - fires when DOM is ready, not when all media is loaded
    const loadingScreen = document.querySelector('.loading-screen');
    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
    }, 600);

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            if (hamburger && navMenu) {
                hamburger.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navContainer = document.querySelector('.nav-container');
        if (window.scrollY > 50) {
            navContainer.classList.add('scrolled');
        } else {
            navContainer.classList.remove('scrolled');
        }
    });

    // Fade in animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navHeight = document.querySelector('.nav-container').offsetHeight;
                const targetPosition = target.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Project Modal
    const modal = document.getElementById('projectModal');
    const modalImage = document.querySelector('.modal-image');
    const modalTitle = document.querySelector('.modal-title');
    const modalDescription = document.querySelector('.modal-description');
    const modalClose = document.querySelector('#projectModal .modal-close');

    // About Modal
    const aboutModal = document.getElementById('aboutModal');
    const aboutModalBtn = document.getElementById('aboutModalBtn');
    const aboutModalClose = document.querySelector('#aboutModal .modal-close');

    // Project data mapping
    const projectData = {
            1: {
                image: 'https://architecturecabana.org/wp-content/uploads/2025/10/3D3_page-0001-enhanced-enhanced-enhanced.png',
                title: 'PROJET DE MAISON D\'HABITATION Á PIHAENA - MOOREA',
                description: 'Maison de 180 m², style moderne - En cours'
            },
            2: {
                image: 'https://architecturecabana.org/wp-content/uploads/2025/10/Tiza-enhanced-enhanced-enhanced.png',
                title: 'PROJET D\'EXTENSION DE TERRASSE Á TEAVARO - MOOREA',
                description: 'Bungalow de 25m² et piscine de 40m² - En cours'
            },
            3: {
                image: 'https://architecturecabana.org/wp-content/uploads/2025/10/enhanced_aab7bae3-5fa2-4fa4-8218-7ecf3b56eb24.png',
                title: 'MAISON D\'HABITATION PAOPAO - MOOREA',
                description: 'Maison de 110 m² - En cours'
            },
            4: {
                image: 'https://architecturecabana.org/wp-content/uploads/2025/10/enhanced_1e.png',
                title: 'PROJET DE RÉNOVATION MODELISÉ TEMAE - MOOREA',
                description: 'Bungalow de 65 m²  - modélisation 3d + accompagnement du client - 2025'
            },
            5: {
                image: 'https://architecturecabana.org/wp-content/uploads/2025/10/enhanced_27b338b0-a433-4436-a1b6-93087c1d221d.png',
                title: 'PROJET DE MAISON PARTICULIÈRE Á MAHAREPA - MOOREA',
                description: 'Maison de 130 m²  - 2024'
            },
            6: {
                image: 'https://architecturecabana.org/wp-content/uploads/2025/10/Perspectivas20Finales2-enhanced-enhanced.png',
                title: 'PROJET DE CAVE SOUTERRAINE EN ARGENTINE',
                description: 'Cave de 25m²  - modélisation 3D et choix des matériaux - 2024'
            },
            7: {
                image: 'https://architecturecabana.org/wp-content/uploads/2025/10/maison_en_bois_toiture_en_tle_verte_integr_au_climat_tropical__moorea_beaucoup_de_vegetation_9vc8mv4mb3fg6cs9yurl_5.png',
                title: 'EXTENSION DE BUNGALOWS ANNEXES A MAISON EXISTANTE',
                description: '3 bungalows de 30 m² chacun  - 2024'
            },
            8: {
                image: 'https://architecturecabana.org/wp-content/uploads/2025/10/image-13-e1759641310159.png',
                title: 'Maison d\'habitation Paopao - Moorea',
                description: 'Maison de 113 m²  - style local avec une touche classe - 2023'
            },
            9: {
                image: 'https://architecturecabana.org/wp-content/uploads/2025/10/IMG_3628.jpg',
                title: 'MAISON D\'HABITATION PAOPAO - MOOREA',
                description: 'Maison de 125 m²  - maison "en dur", carrelé style local moderne - 2023'
            },
            10: {
                image: 'https://architecturecabana.org/wp-content/uploads/2025/10/enhanced_a3794aa3-c63b-4774-99ef-5781295d0be22.png',
                title: 'MAISON PARTICULIÈRE Á TEMAE - MOOREA',
                description: 'Maison de 113 m²  - style local avec une touche classe - 2023'
            },
            11: {
                image: 'https://architecturecabana.org/wp-content/uploads/2025/10/293763037_1959424710908582_1512830163563795475_n.jpg',
                title: 'AMÉNAGEMENT EXTÉRIEUR DU JARDIN Á MAHAREPA - MOOREA',
                description: 'Piscine et plage 35 m² - 2021'
            },
            12: {
                image: 'https://architecturecabana.org/wp-content/uploads/2025/10/FINAL201-enhanced-enhanced-enhanced.png',
                title: 'RÉNOVATION DU BEACH CLUB Á KOH TAO - TAHILANDE',
                description: 'Bar, restaurant et beach club de 80m² - 2016'
            }
    };

    // Open modal when project card is clicked
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', function() {
            const projectId = this.getAttribute('data-project');
            const project = projectData[projectId];

            if (project) {
                modalImage.style.backgroundImage = `url('${project.image}')`;
                modalTitle.textContent = project.title;
                modalDescription.textContent = project.description;
                modal.classList.add('active');
                modal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
                modalClose.focus(); // Set focus to close button for accessibility
            }
        });
    });

    // Function to close project modal
    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
    }

    // Function to close about modal
    function closeAboutModal() {
        aboutModal.classList.remove('active');
        aboutModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
    }

    // Open about modal
    if (aboutModalBtn) {
        aboutModalBtn.addEventListener('click', function(e) {
            e.preventDefault();
            aboutModal.classList.add('active');
            aboutModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            aboutModalClose.focus(); // Set focus to close button for accessibility
        });
    }

    // Close project modal
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    // Close about modal
    if (aboutModalClose) {
        aboutModalClose.addEventListener('click', closeAboutModal);
    }

    // Close project modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close about modal when clicking outside
    aboutModal.addEventListener('click', function(e) {
        if (e.target === aboutModal) {
            closeAboutModal();
        }
    });

    // Close about modal and navigate to contact when clicking "Commencer la conversation"
    const aboutModalContactBtn = document.querySelector('#aboutModal .cta-button');
    if (aboutModalContactBtn) {
        aboutModalContactBtn.addEventListener('click', function(e) {
            closeAboutModal();
            // Let the default anchor behavior handle scrolling to #contact
        });
    }

    // Close modals with ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (modal.classList.contains('active')) {
                closeModal();
            }
            if (aboutModal.classList.contains('active')) {
                closeAboutModal();
            }
        }
    });
});