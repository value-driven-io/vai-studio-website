// Add this at the TOP of app.js temporarily
console.log('Config loaded:', window.APP_CONFIG);
testAirtableConnection();


// App State
let currentTours = [];
let selectedTour = null;
let filters = {
    tourType: '',
    date: 'week', // Set default to 'week'
    island: ''
};

// DOM Elements
const elements = {
    loading: document.getElementById('loading'),
    toursGrid: document.getElementById('toursGrid'),
    emptyState: document.getElementById('emptyState'),
    filters: document.getElementById('filters'),
    bookingModal: document.getElementById('bookingModal'),
    bookingForm: document.getElementById('bookingForm')
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    registerServiceWorker();
    checkInstallPrompt();
});

async function initializeApp() {
    // This makes the dropdown match our default state on page load
    document.getElementById('tourDate').value = filters.date;

    try {
        await loadTours();
        setupEventListeners();
    } catch (error) {
        showError('Impossible de charger les tours. Veuillez réessayer.');
    }
}

// Load Tours
async function loadTours() {
    showLoading(true);
    // Explicitly hide both main content areas before fetching
    elements.toursGrid.classList.add('hidden');
    elements.emptyState.classList.add('hidden');

    try {
        currentTours = await API.fetchTours(filters);
        renderTours(currentTours);
    } catch (error) {
        console.error('Error loading tours:', error);
        showEmptyState();
    } finally {
        showLoading(false);
    }
}

// Render Tours
function renderTours(tours) {
    if (tours.length === 0) {
        showEmptyState();
        return;
    }

    elements.emptyState.classList.add('hidden');
    elements.toursGrid.innerHTML = tours.map(tour => createTourCard(tour)).join('');

    elements.toursGrid.classList.remove('hidden');
}

// Create Tour Card HTML
function createTourCard(tour) {
    const { fields } = tour;
    const operator = tour.operator?.fields || {};
    // Check if original price exists and is not zero to avoid division by zero
    const discountPercent = (fields.original_price_adult && fields.discount_price_adult)
        ? Math.round((1 - (fields.discount_price_adult / fields.original_price_adult)) * 100)
        : 0;

    return `
        <article class="tour-card" onclick="openBookingModal('${tour.id}')">
            ${discountPercent > 1 ? `<div class="tour-discount">-${discountPercent}%</div>` : ''}
            
            <div class="tour-header">
                <span class="tour-type">${getTourTypeEmoji(fields.tour_type)} ${fields.tour_type || 'Excursion'}</span>
                <h3 class="tour-title">${fields.tour_name}</h3>
                <div class="tour-meta">
                    <span>📅 ${formatDate(fields.date)}</span>
                    <span>|</span>
                    <span>⏰ ${fields.time_slot}</span>
                </div>
            </div>
            
            <div class="tour-body">
                <div class="tour-info">
                    <div class="info-item">📍 <strong>Location:</strong> ${fields.meeting_point || operator.island || 'Not specified'}</div>
                    <div class="info-item">🏢 <strong>Operator:</strong> ${operator.company_name || 'Verified'}</div>
                    <div class="info-item">🌐 <strong>Languages:</strong> ${(fields.languages || ['N/A']).join(', ')}</div>
                    ${fields.whale_regulation_compliant ? '<div class="info-item">✅ Complies with Whale Regulations</div>' : ''}
                </div>
                
                <div class="tour-footer">
                    <div class="tour-price">
                        ${fields.original_price_adult > fields.discount_price_adult ? `<div class="price-original">${formatPrice(fields.original_price_adult)}</div>` : ''}
                        <div class="price-discount">${formatPrice(fields.discount_price_adult)}</div>
                    </div>
                    <span class="spots-remaining">${fields.available_spots} places</span>
                </div>
            </div>
             <button class="btn-book">Book Now</button>
        </article>
    `;
}

// Open Booking Modal
function openBookingModal(tourId) {
    selectedTour = currentTours.find(t => t.id === tourId);
    
    if (!selectedTour) return;
    
    const { fields } = selectedTour;
    
    // Populate modal
    document.getElementById('modalTourName').textContent = fields.tour_name;
    
    // Reset form
    elements.bookingForm.reset();
    document.getElementById('numAdults').max = fields.available_spots;
    document.getElementById('numChildren').max = fields.available_spots;
    
    // Update price
    updatePrice();
    
    // Show modal
    elements.bookingModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close Booking Modal
function closeBookingModal() {
    elements.bookingModal.classList.add('hidden');
    document.body.style.overflow = '';
    selectedTour = null;
}

// Update Price Calculation
function updatePrice() {
    if (!selectedTour) return;
    
    const { fields } = selectedTour;
    const numAdults = parseInt(document.getElementById('numAdults').value) || 0;
    const numChildren = parseInt(document.getElementById('numChildren').value) || 0;
    
    const subtotal = (numAdults * fields.discount_price_adult) + 
                    (numChildren * (fields.discount_price_child || fields.discount_price_adult * 0.5));
    const commission = subtotal * 0.10;
    const total = subtotal + commission;
    
    document.getElementById('totalPrice').textContent = formatPrice(total);
}

// Submit Booking
async function submitBooking(event) {
    event.preventDefault();
    
    if (!selectedTour) return;
    
    const formData = new FormData(event.target);
    const bookingData = {
        tour_id: [selectedTour.id],
        customer_name: formData.get('customerName'),
        customer_email: formData.get('customerEmail'),
        customer_phone: formData.get('customerWhatsApp'),
        customer_whatsapp: formData.get('customerWhatsApp'),
        num_adults: parseInt(formData.get('numAdults')) || 0,
        num_children: parseInt(formData.get('numChildren')) || 0,
        booking_status: 'Pending',
        payment_status: 'Pending'
    };
    
    // Validate total participants
    const totalParticipants = bookingData.num_adults + bookingData.num_children;
    if (totalParticipants > selectedTour.fields.available_spots) {
        alert(`Désolé, seulement ${selectedTour.fields.available_spots} places disponibles.`);
        return;
    }
    
    // For whale tours, check group size compliance
    if (selectedTour.fields.whale_regulation_compliant && totalParticipants > 6) {
        alert('Les tours d\'observation des baleines sont limités à 6 personnes maximum (réglementation 2025).');
        return;
    }
    
    try {
        // Create booking in Airtable
        const booking = await API.createBooking(bookingData);
        
        // Generate WhatsApp message
        const message = generateWhatsAppMessage(booking, selectedTour);
        
        // Open WhatsApp
        const whatsappUrl = `https://wa.me/${selectedTour.operator.fields.whatsapp_number}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
        // Close modal and refresh tours
        closeBookingModal();
        showSuccessMessage('Réservation créée! Confirmez via WhatsApp.');
        await loadTours();
        
    } catch (error) {
        console.error('Booking error:', error);
        alert('Erreur lors de la réservation. Veuillez réessayer.');
    }
}

// Generate WhatsApp Message
function generateWhatsAppMessage(booking, tour) {
    const { fields: bookingFields } = booking;
    const { fields: tourFields } = tour;
    const operator = tour.operator?.fields || {};
    
    return `🎉 NOUVELLE RÉSERVATION - Last Minute Tours PF

📋 Référence: ${booking.id}
🚢 Tour: ${tourFields.tour_name}
📅 Date: ${formatDate(tourFields.date)}
⏰ Heure: ${tourFields.time_slot}

👤 Client: ${bookingFields.customer_name}
📱 Contact: ${bookingFields.customer_phone}
👥 Participants: ${bookingFields.num_adults} adultes, ${bookingFields.num_children} enfants

💰 Total: ${formatPrice(bookingFields.total_price || 0)}

Merci de confirmer cette réservation dans les 30 minutes.

---
Last Minute Tours PF
Commission: 10% incluse`;
}

// Filter Functions
function toggleFilters() {
    elements.filters.classList.toggle('hidden');
}

function filterTours() {
    filters = {
        tourType: document.getElementById('tourType').value,
        date: document.getElementById('tourDate').value,
        island: document.getElementById('island').value
    };
    
    loadTours();
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short' };
    return date.toLocaleDateString('fr-FR', options);
}

function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XPF',
        minimumFractionDigits: 0
    }).format(price);
}

function getTourTypeEmoji(type) {
    const emojis = {
        'Whale Watching': '🐋',
        'Diving': '🤿',
        'Cultural': '🗿',
        'Lagoon': '🏊'
    };
    return emojis[type] || '🌊';
}

function showLoading(show) {
    elements.loading.classList.toggle('hidden', !show);
}

function showEmptyState() {
    elements.emptyState.classList.remove('hidden');
    elements.toursGrid.classList.add('hidden');
}

function showSuccessMessage(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Event Listeners
function setupEventListeners() {
    // Close modal on background click
    elements.bookingModal.addEventListener('click', (e) => {
        if (e.target === elements.bookingModal) {
            closeBookingModal();
        }
    });
    
    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !elements.bookingModal.classList.contains('hidden')) {
            closeBookingModal();
        }
    });
}

// Service Worker Registration
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/lastminute-app/sw.js', {
                scope: '/lastminute-app/'
            });
            console.log('Service Worker registered');
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
}

// PWA Install Prompt
let deferredPrompt;

function checkInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallPrompt();
    });
}

function showInstallPrompt() {
    const installPrompt = document.createElement('div');
    installPrompt.className = 'install-prompt';
    installPrompt.innerHTML = `
        <div>
            <strong>Installer l'application</strong>
            <p>Accès rapide aux offres last minute</p>
        </div>
        <button onclick="installPWA()" class="btn-primary">Installer</button>
        <button onclick="this.parentElement.remove()" class="close-modal">×</button>
    `;
    document.body.appendChild(installPrompt);
}

async function installPWA() {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        console.log('PWA installed');
    }
    
    deferredPrompt = null;
    document.querySelector('.install-prompt')?.remove();
}

// Add toast styles
const style = document.createElement('style');
style.textContent = `
.toast {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    color: white;
    font-weight: 500;
    z-index: 1000;
    animation: slideUp 0.3s ease;
}

.toast.success {
    background: var(--success);
}

.toast.error {
    background: var(--danger);
}

@keyframes slideUp {
    from {
        transform: translate(-50%, 100%);
        opacity: 0;
    }
    to {
        transform: translate(-50%, 0);
        opacity: 1;
    }
}
`;
document.head.appendChild(style);