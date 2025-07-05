// ================================
// SUCCESS SCREEN COMPONENT
// File: success-screen.js
// ================================

class SuccessScreen {
    constructor() {
        this.modal = null;
        this.isVisible = false;
    }

    show(data = {}) {
        this.create(data);
        this.display();
        this.trackSuccess();
    }

    create(data) {
        // Remove existing modal if any
        this.hide();

        const currentLang = document.body.getAttribute('data-current-lang') || 'en';
        
        // Create modal HTML
        this.modal = document.createElement('div');
        this.modal.className = 'success-modal-overlay';
        this.modal.innerHTML = `
            <div class="success-modal">
                <div class="success-header">
                    <div class="success-icon">
                        <div class="check-animation">
                            <svg width="60" height="60" viewBox="0 0 60 60">
                                <circle cx="30" cy="30" r="28" fill="none" stroke="#10b981" stroke-width="4" stroke-dasharray="175" stroke-dashoffset="175" class="check-circle"/>
                                <path d="M18 30l8 8 16-16" fill="none" stroke="#10b981" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="40" stroke-dashoffset="40" class="check-mark"/>
                            </svg>
                        </div>
                    </div>
                    
                    <h2 class="success-title">
                        <span data-lang="en">🌺 Application Submitted Successfully!</span>
                        <span data-lang="fr">🌺 Candidature Soumise avec Succès !</span>
                    </h2>
                    
                    <p class="success-subtitle">
                        <span data-lang="en">Welcome to the VAI Operator Family</span>
                        <span data-lang="fr">Bienvenue dans la Famille VAI Opérateur</span>
                    </p>
                </div>
                
                <div class="success-content">
                    <div class="success-info">
                        <div class="info-item">
                            <div class="info-icon">📧</div>
                            <div class="info-text">
                                <h4>
                                    <span data-lang="en">Check Your Email</span>
                                    <span data-lang="fr">Vérifie ton Email</span>
                                </h4>
                                <p>
                                    <span data-lang="en">Confirmation sent to <strong>${data.email || 'your email'}</strong></span>
                                    <span data-lang="fr">Confirmation envoyée à <strong>${data.email || 'ton email'}</strong></span>
                                </p>
                            </div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-icon">⏰</div>
                            <div class="info-text">
                                <h4>
                                    <span data-lang="en">Review Process</span>
                                    <span data-lang="fr">Processus d'Examen</span>
                                </h4>
                                <p>
                                    <span data-lang="en">We'll review your application within <strong>24 hours</strong></span>
                                    <span data-lang="fr">On examinera ta candidature dans les <strong>24 heures</strong></span>
                                </p>
                            </div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-icon">🎯</div>
                            <div class="info-text">
                                <h4>
                                    <span data-lang="en">What's Next?</span>
                                    <span data-lang="fr">Et Maintenant ?</span>
                                </h4>
                                <p>
                                    <span data-lang="en">Dashboard access credentials will be sent once approved</span>
                                    <span data-lang="fr">Les identifiants d'accès au tableau de bord seront envoyés une fois approuvé</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="success-benefits">
                        <h3>
                            <span data-lang="en">🚀 Your Founding Member Benefits</span>
                            <span data-lang="fr">🚀 Tes Avantages de Membre Fondateur</span>
                        </h3>
                        <div class="benefits-grid">
                            <div class="benefit-item">
                                <span class="benefit-icon">💰</span>
                                <span class="benefit-text">
                                    <span data-lang="en">Reduced 8% commission rate</span>
                                    <span data-lang="fr">Taux de commission réduit 8%</span>
                                </span>
                            </div>
                            <div class="benefit-item">
                                <span class="benefit-icon">⭐</span>
                                <span class="benefit-text">
                                    <span data-lang="en">Premium placement in app</span>
                                    <span data-lang="fr">Placement premium dans l'app</span>
                                </span>
                            </div>
                            <div class="benefit-item">
                                <span class="benefit-icon">📞</span>
                                <span class="benefit-text">
                                    <span data-lang="en">Dedicated support channel</span>
                                    <span data-lang="fr">Canal de support dédié</span>
                                </span>
                            </div>
                            <div class="benefit-item">
                                <span class="benefit-icon">🎓</span>
                                <span class="benefit-text">
                                    <span data-lang="en">Free operator training</span>
                                    <span data-lang="fr">Formation opérateur gratuite</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="success-actions">
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-large dashboard-preview-btn">
                            <span data-lang="en">🔍 Preview Dashboard</span>
                            <span data-lang="fr">🔍 Aperçu Tableau de Bord</span>
                        </button>
                        <button class="btn btn-outline whatsapp-support-btn">
                            <span data-lang="en">💬 WhatsApp Support</span>
                            <span data-lang="fr">💬 Support WhatsApp</span>
                        </button>
                    </div>
                    
                    <div class="success-footer">
                        <p>
                            <span data-lang="en">Questions? Contact us at <a href="https://wa.me/68987269065">+689 87 26 90 65</a></span>
                            <span data-lang="fr">Questions ? Contacte-nous au <a href="https://wa.me/68987269065">+689 87 26 90 65</a></span>
                        </p>
                        
                        <button class="close-modal-btn">
                            <span data-lang="en">Close</span>
                            <span data-lang="fr">Fermer</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        this.addStyles();
        
        // Add event listeners
        this.addEventListeners();
    }

    addStyles() {
        if (document.querySelector('#success-modal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'success-modal-styles';
        styles.textContent = `
            .success-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.95);
                backdrop-filter: blur(10px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                opacity: 0;
                animation: fadeIn 0.5s ease forwards;
            }

            .success-modal {
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
                border: 1px solid rgba(99, 102, 241, 0.3);
                border-radius: 24px;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                transform: translateY(30px);
                animation: slideUp 0.5s ease forwards 0.2s;
            }

            .success-header {
                text-align: center;
                padding: 40px 40px 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .success-icon {
                margin-bottom: 24px;
            }

            .check-animation {
                display: inline-block;
            }

            .check-circle {
                animation: drawCircle 1s ease forwards 0.5s;
            }

            .check-mark {
                animation: drawCheck 0.5s ease forwards 1.2s;
            }

            .success-title {
                font-size: 28px;
                font-weight: 800;
                color: #ffffff;
                margin-bottom: 12px;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .success-subtitle {
                font-size: 18px;
                color: #94a3b8;
                font-weight: 500;
            }

            .success-content {
                padding: 30px 40px;
            }

            .success-info {
                margin-bottom: 40px;
            }

            .info-item {
                display: flex;
                align-items: flex-start;
                gap: 16px;
                margin-bottom: 24px;
                padding: 20px;
                background: rgba(255, 255, 255, 0.03);
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }

            .info-icon {
                font-size: 24px;
                flex-shrink: 0;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                border-radius: 50%;
                width: 48px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .info-text h4 {
                color: #ffffff;
                font-size: 16px;
                font-weight: 600;
                margin-bottom: 8px;
            }

            .info-text p {
                color: #94a3b8;
                font-size: 14px;
                line-height: 1.5;
            }

            .success-benefits {
                background: rgba(16, 185, 129, 0.05);
                border: 1px solid rgba(16, 185, 129, 0.2);
                border-radius: 16px;
                padding: 24px;
                margin-bottom: 30px;
            }

            .success-benefits h3 {
                color: #10b981;
                font-size: 18px;
                font-weight: 700;
                margin-bottom: 20px;
                text-align: center;
            }

            .benefits-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }

            .benefit-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: rgba(16, 185, 129, 0.05);
                border-radius: 8px;
            }

            .benefit-icon {
                font-size: 20px;
            }

            .benefit-text {
                color: #ffffff;
                font-size: 14px;
                font-weight: 500;
            }

            .success-actions {
                padding: 0 40px 40px;
            }

            .action-buttons {
                display: flex;
                gap: 16px;
                margin-bottom: 30px;
            }

            .action-buttons .btn {
                flex: 1;
                padding: 16px 24px;
                font-size: 16px;
                font-weight: 600;
                border-radius: 12px;
                transition: all 0.3s ease;
                text-decoration: none;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .btn-primary {
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                color: #ffffff;
                border: 2px solid transparent;
            }

            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
            }

            .btn-outline {
                background: transparent;
                color: #94a3b8;
                border: 2px solid rgba(148, 163, 184, 0.3);
            }

            .btn-outline:hover {
                border-color: #6366f1;
                color: #6366f1;
                background: rgba(99, 102, 241, 0.05);
            }

            .success-footer {
                text-align: center;
                padding-top: 24px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            .success-footer p {
                color: #94a3b8;
                font-size: 14px;
                margin-bottom: 20px;
            }

            .success-footer a {
                color: #6366f1;
                text-decoration: none;
                font-weight: 600;
            }

            .close-modal-btn {
                background: none;
                border: none;
                color: #64748b;
                font-size: 14px;
                cursor: pointer;
                padding: 8px 16px;
                border-radius: 6px;
                transition: all 0.2s ease;
            }

            .close-modal-btn:hover {
                background: rgba(255, 255, 255, 0.05);
                color: #94a3b8;
            }

            /* Animations */
            @keyframes fadeIn {
                to { opacity: 1; }
            }

            @keyframes slideUp {
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            @keyframes drawCircle {
                to { stroke-dashoffset: 0; }
            }

            @keyframes drawCheck {
                to { stroke-dashoffset: 0; }
            }

            /* Language visibility */
            [data-current-lang="en"] .success-modal [data-lang="en"],
            [data-current-lang="fr"] .success-modal [data-lang="fr"] {
                display: inline;
            }

            [data-current-lang="en"] .success-modal [data-lang="fr"],
            [data-current-lang="fr"] .success-modal [data-lang="en"] {
                display: none;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .success-modal {
                    margin: 10px;
                    border-radius: 16px;
                }

                .success-header,
                .success-content,
                .success-actions {
                    padding: 24px;
                }

                .success-title {
                    font-size: 24px;
                }

                .benefits-grid {
                    grid-template-columns: 1fr;
                }

                .action-buttons {
                    flex-direction: column;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    addEventListeners() {
        if (!this.modal) return;

        // Close modal
        const closeBtn = this.modal.querySelector('.close-modal-btn');
        closeBtn?.addEventListener('click', () => this.hide());

        // Close on overlay click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // Dashboard preview
        const dashboardBtn = this.modal.querySelector('.dashboard-preview-btn');
        dashboardBtn?.addEventListener('click', () => {
            window.open('https://vai-operator-dashboard.onrender.com/', '_blank');
            this.trackAction('dashboard_preview');
        });

        // WhatsApp support
        const whatsappBtn = this.modal.querySelector('.whatsapp-support-btn');
        whatsappBtn?.addEventListener('click', () => {
            window.open('https://wa.me/68987269065', '_blank');
            this.trackAction('whatsapp_support');
        });

        // ESC key to close
        document.addEventListener('keydown', this.handleEscKey.bind(this));
    }

    handleEscKey(e) {
        if (e.key === 'Escape' && this.isVisible) {
            this.hide();
        }
    }

    display() {
        if (this.modal) {
            document.body.appendChild(this.modal);
            document.body.style.overflow = 'hidden';
            this.isVisible = true;
        }
    }

    hide() {
        if (this.modal && this.modal.parentElement) {
            this.modal.remove();
            document.body.style.overflow = '';
            this.isVisible = false;
        }
        document.removeEventListener('keydown', this.handleEscKey.bind(this));
    }

    trackSuccess() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'registration_success', {
                event_category: 'Operator Registration',
                event_label: 'Success Modal Shown'
            });
        }
        console.log('🎉 Success screen displayed');
    }

    trackAction(action) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'success_screen_action', {
                event_category: 'Operator Registration',
                event_label: action
            });
        }
        console.log(`📊 Success screen action: ${action}`);
    }
}

// Export for global use
if (typeof window !== 'undefined') {
    window.SuccessScreen = SuccessScreen;
}