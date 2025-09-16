// tourist-app/src/components/shared/LaunchingSoonModal.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Rocket, Mail, Send, Check } from 'lucide-react';
import LanguageDropdown from './LanguageDropdown';

const VAILogo = () => (
  <img src="/logos/vai-logo-2025.png" alt="VAI Tickets Logo" className="h-12 w-auto" />
);

const LaunchingSoonModal = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false); // State for the checkbox
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !agreed) return;

    setLoading(true);
    setError('');

    try {
        // 1. Dynamically import supabase to avoid initialization errors
        const { supabase } = await import('../../services/supabase');

        // 2. Insert into waitlist (current behavior)
        const { error: supabaseError } = await supabase
        .from('waitlist')
        .insert({
            email,
            agreed_to_marketing: agreed
        });

        if (supabaseError) {
        throw supabaseError;
        }

        // 2. Trigger n8n welcome email flow
        const n8nPayload = {
        type: "welcome_email",
        user_type: "tourist", 
        user_id: crypto.randomUUID(), // Generate unique ID
        email: email,
        first_name: "Friend", // Default since we don't collect name
        island: null,
        languages: ["english"], // Default
        marketing_emails: agreed,
        timestamp: new Date().toISOString(),
        launch_date: "2025-08-11",
        platform_url: "https://app.vai.studio",
        registration_source: "waitlist_modal"
        };

        // Call n8n webhook
        await fetch('https://n8n-stable-latest.onrender.com/webhook/vai-app-user-registration', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(n8nPayload)
        });

        setSubmitted(true);
        
    } catch (error) {
        console.error('Error during signup:', error);
        
        if (error.code === '23505') { // Unique constraint violation
        setError(t('launchingSoon.form.duplicate', 'You are already on our waitlist!'));
        } else {
        setError(t('launchingSoon.form.error', 'An error occurred. Please try again.'));
        }
        setSubmitted(false);
    }
    
    setLoading(false);
    };

  return (
    <div className="fixed inset-0 z-system bg-vai-deep-ocean/80 backdrop-blur-vai flex items-center justify-center p-4 animate-fade-in">
      
      {/* Language Selector in the top right corner */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageDropdown />
      </div>

      <div className="w-full max-w-md bg-vai-lagoon/80 rounded-mobile-xl border border-white/10 shadow-vai-float p-6 sm:p-8 text-center">
        
        <div className="mb-6 flex justify-center">
          <VAILogo />
        </div>

        <div className="flex justify-center items-center gap-3 mb-4">
          <Rocket className="w-8 h-8 text-vai-coral" />
          <h1 className="text-2xl sm:text-3xl font-bold text-vai-pearl">
            {t('launchingSoon.title', 'Launching Soon!')}
          </h1>
        </div>
        
        <p className="vai-text-secondary mb-8 text-mobile-base sm:text-base">
          {t('launchingSoon.message', 'Ia Orana! We are preparing an unforgettable experience for you in French Polynesia. Be the first to know when we go live.')}
        </p>

        {submitted ? (
          <div className="bg-vai-bamboo/10 border border-vai-bamboo/20 text-vai-bamboo p-4 rounded-lg text-center">
            <p className="font-semibold">{t('launchingSoon.form.successTitle', 'Māuruuru!')}</p>
            <p className="text-sm">{t('launchingSoon.form.successMessage', 'You are on the list. We will notify you at launch.')}</p>
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 vai-text-disabled" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('launchingSoon.form.placeholder', 'Enter your email')}
                className="vai-input w-full py-3 pl-10 pr-4 rounded-lg text-ui-text-primary focus:ring-2 focus:ring-vai-coral focus:border-vai-coral transition"
                required
              />
            </div>

            {/* Marketing Checkbox */}
            <div className="flex items-center gap-3 text-left">
              <button
                type="button"
                onClick={() => setAgreed(!agreed)}
                className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-colors ${
                  agreed ? 'bg-vai-coral border-vai-coral' : 'bg-transparent border-ui-border-secondary'
                }`}
              >
                {agreed && <Check className="w-4 h-4 text-ui-text-primary" />}
              </button>
              <label 
                onClick={() => setAgreed(!agreed)} 
                className="text-xs vai-text-disabled cursor-pointer"
              >
                {t('launchingSoon.form.consent')}
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !agreed}
              className="w-full flex items-center justify-center gap-2 bg-vai-coral hover:bg-opacity-90 text-ui-text-primary font-bold py-3 px-4 rounded-lg transition-all transform active:scale-95 disabled:bg-ui-surface-tertiary disabled:text-ui-text-disabled disabled:cursor-not-allowed"
            >
              {loading ? (
                <>{t('launchingSoon.form.submitting', 'Submitting...')}</>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {t('launchingSoon.form.button', 'Notify Me')}
                </>
              )}
            </button>
            {error && <p className="text-status-error-light text-sm mt-2">{error}</p>}
          </form>
        )}

        <p className="text-xs vai-text-disabled mt-6">
          {t('launchingSoon.footer')}
        </p>
        {/* more info  */}
        <div className="mt-6 text-center">
            <p className="vai-text-disabled text-xs">
            {t('login.moreInfo')}{' '}
            <a 
              href="https://vai.studio/app/welcome" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-status-caution-light hover:text-status-caution transition-colors"
            >
              VAI Tickets
            </a>
          </p>
        </div>
      </div>
      {/*  OPERATOR LINK OUTSIDE MODAL CONTAINER */}
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
      <a 
        href="https://vai-operator-dashboard.onrender.com/?welcome=utm_source=vai-tickets-launchscreen" 
        target="_blank"
        rel="noopener noreferrer"
        className="vai-text-disabled hover:vai-text-secondary transition-colors text-xs flex items-center gap-2"
      >
        {t('login.foroperator')}
      </a>
    </div>
    </div>
  );
};


export default LaunchingSoonModal;
