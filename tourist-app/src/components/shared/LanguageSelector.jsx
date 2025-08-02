// src/components/shared/LanguageSelector.jsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../services/supabase'

const LanguageSelector = ({ size = 'sm', showText = false }) => {
  const { i18n } = useTranslation()
  const { user } = useAuth()
  const [isChanging, setIsChanging] = useState(false)

  // Available languages for tourist app (starting with 2)
  const languages = [
    {
      code: 'fr',
      name: 'French',
      flag: '🇫🇷',
      nativeName: 'Français'
    },
    {
      code: 'en', 
      name: 'English',
      flag: '🇺🇸',
      nativeName: 'English'
    }
  ]

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  const handleLanguageChange = async (langCode) => {
    if (langCode === i18n.language || isChanging) return
    
    setIsChanging(true)
    
    try {
      // 1. Update i18n (this also saves to localStorage automatically)
      await i18n.changeLanguage(langCode)
      
      // 2. If user is logged in, save to database
      if (user) {
        try {
          // Get tourist user ID first
          const { data: touristUser } = await supabase
            .from('tourist_users')
            .select('id')
            .eq('auth_user_id', user.id)
            .single()
          
          if (touristUser) {
            // Update preferred_language in database
            const { error: updateError } = await supabase
              .from('tourist_users')
              .update({ preferred_language: langCode })
              .eq('id', touristUser.id)
            
            if (updateError) {
              console.error('Error updating preferred language in database:', updateError)
              // Don't throw - localStorage fallback is working
            } else {
              console.log(`✅ Language preference saved to database: ${langCode}`)
            }
          }
        } catch (dbError) {
          console.error('Database language update failed:', dbError)
          // Don't throw - localStorage fallback is working
        }
      }
      
      // 3. Optional: Send analytics
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'language_change', {
          'new_language': langCode,
          'previous_language': currentLanguage?.code,
          'component': 'tourist_app',
          'user_authenticated': !!user
        })
      }
      
    } catch (error) {
      console.error('Language change failed:', error)
    } finally {
      setIsChanging(false)
    }
  }

  // Button size variants
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs gap-1',
    sm: 'px-3 py-2 text-sm gap-2',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-5 py-3 text-lg gap-3'
  }

  const currentSizeClass = sizeClasses[size] || sizeClasses.sm

  return (
    <div className="flex items-center gap-2">
      {/* Current Language Button */}
      <div className={`flex items-center ${currentSizeClass} bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors ${isChanging ? 'opacity-50' : ''}`}>
        <Globe className="w-4 h-4 text-slate-300" />
        <span className="text-slate-300">{currentLanguage.flag}</span>
        {showText && (
          <span className="text-white font-medium">
            {currentLanguage.nativeName}
          </span>
        )}
      </div>

      {/* Language Toggle Buttons */}
      <div className="flex gap-1">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            disabled={isChanging}
            className={`px-2 py-1 rounded text-sm transition-colors ${
              language.code === i18n.language 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            } ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={`Switch to ${language.name}`}
          >
            {language.flag}
          </button>
        ))}
      </div>
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <span className="text-xs text-slate-500">
          [{i18n.language}] {user ? '🔐' : '👤'}
        </span>
      )}
    </div>
  )
}

export default LanguageSelector