/**
 * VAI Studio - Homepage JavaScript
 *
 * This file contains scripts specific to the homepage (index.html).
 * It manages the interactive "Journey Experience" section and
 * homepage-specific analytics.
 *
 * It depends on `global.js` being loaded first.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Homepage scripts initializing...');

    // =================================================================
    // HERO PARALLAX EFFECT (Desktop Only)
    // =================================================================
    const heroBackground = document.getElementById('hero-bg');
    if (heroBackground && window.innerWidth > 768) {
        window.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) * 10 - 5; // Center the effect
            const y = (e.clientY / window.innerHeight) * 10 - 5;
            heroBackground.style.transform = `translate(${x}px, ${y}px)`;
        });
    }

    // =================================================================
    // ENHANCED JOURNEY EXPERIENCE CLASS
    // =================================================================
    class EnhancedJourneyExperience {
        constructor() {
            this.elements = {
                section: document.querySelector('.journey-experience-section'),
                heroButtons: document.querySelectorAll('.hero-journey-btn'),
                deviceButtons: document.querySelectorAll('.device-journey-btn'), // New selector
                textSteps: document.querySelectorAll('.journey-step'),
                screens: document.querySelectorAll('.journey-screen'),
                dots: document.querySelectorAll('.progress-dot'),
                paths: document.querySelectorAll('.journey-path'),
            };

            if (!this.elements.section) {
                console.log('Journey section not found, skipping initialization.');
                return;
            }

            this.currentJourney = 'tourism'; // Default journey
            this.init();
        }

        init() {
            this.selectJourney(this.currentJourney, true);

            // Add event listeners for BOTH sets of journey buttons
            this.elements.heroButtons.forEach(btn => {
                btn.addEventListener('click', () => this.selectJourney(btn.dataset.journey));
            });
            this.elements.deviceButtons.forEach(btn => {
                btn.addEventListener('click', () => this.selectJourney(btn.dataset.journey));
            });
            
            this.elements.dots.forEach(dot => {
                dot.addEventListener('click', () => this.scrollToStep(dot.dataset.step));
            });
            
            this.setupStepObserver();
        }

        selectJourney(journey, isInitialLoad = false) {
            if (!journey) return;
            this.currentJourney = journey;

            // Sync BOTH sets of buttons
            this.elements.heroButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.journey === journey));
            this.elements.deviceButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.journey === journey));
            
            this.elements.paths.forEach(path => path.classList.toggle('active', path.dataset.journey === journey));

            // Reset to the first step when a new journey is selected
            this.updateScreenAndProgress(1);

            if (!isInitialLoad) {
                 const journeySection = document.getElementById('journey-experience');
                 if(journeySection) {
                    journeySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                 }
            }
            
            // Track journey selection
            if (typeof gtag !== 'undefined' && !isInitialLoad) {
                gtag('event', 'hero_journey_select', {
                    'event_category': 'Homepage Interaction',
                    'event_label': `Journey: ${journey}`
                });
            }
        }

        setupStepObserver() {
            const observerOptions = {
                root: null, // viewport
                rootMargin: '0px 0px -40% 0px', // Trigger when step is in the middle of the screen
                threshold: 0.1,
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const stepEl = entry.target;
                        // Only update if the step is part of the currently active journey
                        if (stepEl.closest('.journey-path.active')) {
                            const stepNumber = this.getStepNumber(stepEl.dataset.step);
                            this.updateScreenAndProgress(stepNumber);
                        }
                    }
                });
            }, observerOptions);

            this.elements.textSteps.forEach(step => observer.observe(step));
        }

        updateScreenAndProgress(stepNumber) {
            const stepName = this.getStepName(stepNumber);

            // Update device screen
            const targetScreen = document.querySelector(`.journey-screen[data-journey="${this.currentJourney}"][data-step="${stepName}"]`);
            this.elements.screens.forEach(s => s.classList.remove('active'));
            if (targetScreen) targetScreen.classList.add('active');

            // Update progress dots
            this.elements.dots.forEach(dot => dot.classList.toggle('active', parseInt(dot.dataset.step) === stepNumber));

            // Highlight the active text step
            const activePath = document.querySelector(`.journey-path[data-journey="${this.currentJourney}"]`);
            activePath?.querySelectorAll('.journey-step').forEach(step => {
                step.classList.toggle('active-step', step.dataset.step === stepName);
            });
        }
        
        scrollToStep(stepNumberStr) {
            const stepNumber = parseInt(stepNumberStr);
            if (isNaN(stepNumber)) return;

            const stepName = this.getStepName(stepNumber);
            const targetStep = document.querySelector(`.journey-path.active .journey-step[data-step="${stepName}"]`);
            if (targetStep) {
                targetStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        getStepName = (num) => ({ 1: 'problem', 2: 'solution', 3: 'result' }[num]);
        getStepNumber = (name) => ({ 'problem': 1, 'solution': 2, 'result': 3 }[name]);
    }

    // Initialize the Journey Experience
    new EnhancedJourneyExperience();

    // =================================================================
    // HOMEPAGE SPECIFIC ANALYTICS
    // =================================================================
    
    // Track final CTA interactions
    const finalCTAs = document.querySelectorAll('.final-cta-buttons .btn');
    finalCTAs.forEach((cta, index) => {
        cta.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            const buttonType = this.classList.contains('btn-primary') ? 'Primary' : 'Secondary';
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'final_cta_click', {
                    'event_category': 'Homepage CTA',
                    'event_label': `${buttonType}: ${buttonText}`,
                    'value': index + 1
                });
            }
        });
    });

    console.log('Homepage scripts initialized successfully.');
});
