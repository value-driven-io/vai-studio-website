// tourist-app/src/components/shared/LaunchingSoonModal.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Rocket, Mail, Send, Check } from 'lucide-react';
import { supabase } from '../../services/supabase';
import LanguageSelector from './LanguageSelector'; // Import the language selector

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

    const { error } = await supabase.from('waitlist').insert({ email, agreed_to_marketing: agreed });

    if (error) {
      console.error('Error signing up for waitlist:', error);
      setError(t('launchingSoon.form.error', 'An error occurred. Please try again.'));
      setSubmitted(false);
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-system bg-vai-deep-ocean/80 backdrop-blur-vai flex items-center justify-center p-4 animate-fade-in">
      
      {/* Language Selector in the top right corner */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector />
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
        
        <p className="text-slate-300 mb-8 text-mobile-base sm:text-base">
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
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('launchingSoon.form.placeholder', 'Enter your email')}
                className="w-full bg-vai-deep-ocean border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:ring-2 focus:ring-vai-coral focus:border-vai-coral transition"
                required
              />
            </div>

            {/* Marketing Checkbox */}
            <div className="flex items-center gap-3 text-left">
              <button
                type="button"
                onClick={() => setAgreed(!agreed)}
                className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-colors ${
                  agreed ? 'bg-vai-coral border-vai-coral' : 'bg-transparent border-slate-500'
                }`}
              >
                {agreed && <Check className="w-4 h-4 text-white" />}
              </button>
              <label 
                onClick={() => setAgreed(!agreed)} 
                className="text-xs text-slate-400 cursor-pointer"
              >
                {t('launchingSoon.form.consent', 'By registering, you agree to receive updates about the launch of VAI.')}
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !agreed}
              className="w-full flex items-center justify-center gap-2 bg-vai-coral hover:bg-opacity-90 text-white font-bold py-3 px-4 rounded-lg transition-all transform active:scale-95 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
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
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </form>
        )}

        <p className="text-xs text-slate-500 mt-6">
          {t('launchingSoon.footer', 'VAI Tickets - Your key to paradise.')}
        </p>
      </div>
    </div>
  );
};

export default LaunchingSoonModal;
