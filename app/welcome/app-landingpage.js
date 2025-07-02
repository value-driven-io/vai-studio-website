// VAI Landing Page JavaScript

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initAnimations();
    initCountdown();
    initFAQ();
    initForms();
    initSmoothScrolling();
    initHeaderEffects();
    initOperatorForm();
});

// Intersection Observer for animations
function initAnimations() {
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

    // Observe all animation elements
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
    animatedElements.forEach(el => {
        if (el) observer.observe(el);
    });
}

// Countdown Timer
function initCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;

    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');

    if (!daysElement || !hoursElement || !minutesElement) return;

    function updateCountdown() {
        try {
            const launchDate = new Date('July 14, 2025 00:00:00').getTime();
            const now = new Date().getTime();
            const distance = launchDate - now;

            if (distance < 0) {
                // Launch date has passed
                countdownElement.innerHTML = '<div class="countdown-item"><span class="countdown-number">LIVE</span><span class="countdown-label">NOW</span></div>';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

            daysElement.textContent = days.toString().padStart(2, '0');
            hoursElement.textContent = hours.toString().padStart(2, '0');
            minutesElement.textContent = minutes.toString().padStart(2, '0');
        } catch (error) {
            console.warn('Countdown update error:', error);
        }
    }

    // Update immediately and then every minute
    updateCountdown();
    setInterval(updateCountdown, 60000);
}

// FAQ Toggle functionality
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            toggleFAQ(this);
        });
    });
}

function toggleFAQ(element) {
    try {
        const answer = element.nextElementSibling;
        const icon = element.querySelector('span:last-child');
        
        if (!answer || !icon) return;
        
        if (answer.classList.contains('active')) {
            answer.classList.remove('active');
            icon.textContent = '+';
            icon.style.transform = 'rotate(0deg)';
        } else {
            // Close all other FAQs
            document.querySelectorAll('.faq-answer.active').forEach(faq => {
                faq.classList.remove('active');
                const prevIcon = faq.previousElementSibling?.querySelector('span:last-child');
                if (prevIcon) {
                    prevIcon.textContent = '+';
                    prevIcon.style.transform = 'rotate(0deg)';
                }
            });
            
            // Open this FAQ
            answer.classList.add('active');
            icon.textContent = '−';
            icon.style.transform = 'rotate(180deg)';
        }
    } catch (error) {
        console.warn('FAQ toggle error:', error);
    }
}

// Form handling
function initForms() {
    // Tourist form
    const touristForm = document.getElementById('touristForm');
    if (touristForm) {
        touristForm.addEventListener('submit', handleTouristSubmission);
    }

    // Operator form
    const operatorForm = document.getElementById('operatorForm');
    if (operatorForm) {
        operatorForm.addEventListener('submit', handleOperatorSubmission);
    }
}

function handleTouristSubmission(e) {
    e.preventDefault();
    
    try {
        // Get form data
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Validate required fields
        if (!data.email || !data.name || !data.islands || !data.travel_date) {
            showMessage('Please fill in all required fields.', 'error');
            return;
        }
        
        // Validate email format
        if (!isValidEmail(data.email)) {
            showMessage('Please enter a valid email address.', 'error');
            return;
        }
        
        // Here you would send to your backend/Supabase
        console.log('Tourist Registration:', data);
        
        // Show success message
        showMessage('🎉 Success! You\'re registered for VAI launch access. Check your email for confirmation.', 'success');
        
        // Reset form
        e.target.reset();
        
        // Optional: Track conversion event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'tourist_registration', {
                'event_category': 'Lead Generation',
                'event_label': 'Tourist Registration'
            });
        }
        
    } catch (error) {
        console.error('Tourist form submission error:', error);
        showMessage('Something went wrong. Please try again.', 'error');
    }
}

function handleOperatorSubmission(e) {
    e.preventDefault();
    
    try {
        // Get form data
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Validate required fields
        const requiredFields = ['company_name', 'email', 'whatsapp', 'island', 'tour_types', 'contact_person'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
            showMessage('Please fill in all required fields.', 'error');
            return;
        }
        
        // Validate email format
        if (!isValidEmail(data.email)) {
            showMessage('Please enter a valid business email address.', 'error');
            return;
        }
        
        // Here you would send to your backend/Supabase
        console.log('Operator Registration:', data);
        
        // Show success message
        showMessage('🌺 Welcome to VAI! Your founding operator application has been submitted. We\'ll contact you within 24 hours.', 'success');
        
        // Reset form
        e.target.reset();
        
        // Hide operator form
        const operatorSection = document.getElementById('operator-form');
        if (operatorSection) {
            operatorSection.style.display = 'none';
        }
        
        // Optional: Track conversion event
        if (typeof gtag !== 'undefined') {
            gtag('event', 'operator_registration', {
                'event_category': 'Lead Generation',
                'event_label': 'Operator Registration'
            });
        }
        
    } catch (error) {
        console.error('Operator form submission error:', error);
        showMessage('Something went wrong. Please try again.', 'error');
    }
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showMessage(message, type = 'info') {
    // Remove any existing messages
    const existingMessage = document.querySelector('.vai-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `vai-message vai-message-${type}`;
    messageEl.textContent = message;
    
    // Style the message
    messageEl.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        max-width: 90%;
        text-align: center;
        animation: slideInMessage 0.3s ease;
    `;
    
    // Add animation keyframes if not already added
    if (!document.querySelector('#vai-message-styles')) {
        const style = document.createElement('style');
        style.id = 'vai-message-styles';
        style.textContent = `
            @keyframes slideInMessage {
                from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to DOM
    document.body.appendChild(messageEl);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.style.animation = 'slideInMessage 0.3s ease reverse';
            setTimeout(() => messageEl.remove(), 300);
        }
    }, 5000);
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') {
                e.preventDefault();
                return;
            }
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Header scroll effects
function initHeaderEffects() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let lastScrollY = window.scrollY;
    
    function updateHeader() {
        const currentScrollY = window.scrollY;
        
        try {
            if (currentScrollY > 100) {
                header.style.background = 'rgba(15, 23, 42, 0.95)';
                header.style.backdropFilter = 'blur(15px)';
            } else {
                header.style.background = 'rgba(15, 23, 42, 0.9)';
                header.style.backdropFilter = 'blur(10px)';
            }
            
            lastScrollY = currentScrollY;
        } catch (error) {
            console.warn('Header update error:', error);
        }
    }
    
    // Throttle scroll events
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateHeader();
                ticking = false;
            });
            ticking = true;
        }
    });
}

// Operator form show/hide functionality
function initOperatorForm() {
    const operatorLinks = document.querySelectorAll('a[href="#operator-form"]');
    const operatorSection = document.getElementById('operator-form');
    
    if (!operatorSection) return;
    
    operatorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            try {
                // Show the operator form
                operatorSection.style.display = 'block';
                
                // Smooth scroll to the form
                const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
                const targetPosition = operatorSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Add fade-in animation
                operatorSection.style.opacity = '0';
                operatorSection.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    operatorSection.style.transition = 'all 0.6s ease';
                    operatorSection.style.opacity = '1';
                    operatorSection.style.transform = 'translateY(0)';
                }, 100);
                
            } catch (error) {
                console.error('Operator form show error:', error);
            }
        });
    });
}

// Error handling for images
function initImageErrorHandling() {
    const images = document.querySelectorAll('img[onerror]');
    
    images.forEach(img => {
        img.addEventListener('error', function() {
            // The onerror attribute in HTML will handle the fallback
            console.warn('Image failed to load:', this.src);
        });
    });
}

// Initialize image error handling when DOM is ready
document.addEventListener('DOMContentLoaded', initImageErrorHandling);

// Expose functions globally for HTML event handlers (if needed)
window.toggleFAQ = toggleFAQ;

// Optional: Performance monitoring
window.addEventListener('load', function() {
    console.log('VAI Landing Page loaded successfully');
    
    // Track page load time if analytics available
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_load_complete', {
            'event_category': 'Performance',
            'event_label': 'Landing Page'
        });
    }
});

// Handle any uncaught errors gracefully
window.addEventListener('error', function(e) {
    console.warn('JavaScript error caught:', e.error);
    // Don't show error to users, just log it
});

// Optional: Add keyboard navigation for accessibility
document.addEventListener('keydown', function(e) {
    // ESC key to close any open FAQs
    if (e.key === 'Escape') {
        const activeFAQs = document.querySelectorAll('.faq-answer.active');
        activeFAQs.forEach(faq => {
            const question = faq.previousElementSibling;
            if (question) {
                toggleFAQ(question);
            }
        });
    }
});