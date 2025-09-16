import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Globe } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../services/supabase'

const LanguageDropdown = () => {
  const { i18n } = useTranslation()
  const { user } = useAuth()
  const [isChanging, setIsChanging] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef(null)
  const dropdownRef = useRef(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })

  // EXACT same languages array from your LanguageSelector
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
    },
    {
      code: 'es', 
      name: 'Spanish',  // Fixed the name from 'English' to 'Spanish'
      flag: '🇪🇸',
      nativeName: 'Español'
    },
    {
      code: 'de', 
      name: 'German',
      flag: '🇩🇪',
      nativeName: 'Deutsch'
    },
    {
      code: 'it', 
      name: 'Italian',
      flag: '🇮🇹',
      nativeName: 'Italiano'
    },
    {
      code:'ty',
      name: 'Tahitian',
      flag: '🇵🇫',
      nativeName: 'Reo Tahiti'
    }
  ]

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  // EXACT same handleLanguageChange logic from your LanguageSelector
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
      setIsOpen(false) // Close dropdown after selection
    }
  }

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const scrollY = window.scrollY || document.documentElement.scrollTop
      
      setDropdownPosition({
        top: rect.bottom + scrollY + 8,
        left: rect.right - 220, // Adjust for dropdown width
      })
    }
  }

  const handleToggle = () => {
    if (!isOpen) {
      updateDropdownPosition()
    }
    setIsOpen(!isOpen)
  }

  // Close dropdown handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
        if (
        buttonRef.current && 
        !buttonRef.current.contains(event.target) &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target)
        ) {
        setIsOpen(false)
        }
    }

    const handleEscape = (event) => {
        if (event.key === 'Escape') {
        setIsOpen(false)
        }
    }

    // FIX: Close dropdown on any scroll (better UX)
    const handleScroll = () => {
        if (isOpen) {
        setIsOpen(false)
        }
    }

    if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscape)
        // FIX: Use passive listener for better performance
        window.addEventListener('scroll', handleScroll, { passive: true })
        window.addEventListener('resize', () => setIsOpen(false))
    }
    
    return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
        window.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', () => setIsOpen(false))
    }
    }, [isOpen])

  // Dropdown Menu Component
  const DropdownMenu = () => (
    <div 
      ref={dropdownRef}
      className="fixed w-56 vai-surface-elevated rounded-lg shadow-xl overflow-hidden"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${Math.max(16, dropdownPosition.left)}px`,
        zIndex: 999999,
        maxHeight: 'min(400px, calc(100vh - 100px))', // FIX: Responsive height
        overflowY: 'auto',
        // FIX: Better scrolling behavior
        overscrollBehavior: 'contain',
        scrollbarWidth: 'thin'
        }}
    >

        <div 
            ref={dropdownRef}
            className="fixed w-56 vai-surface-elevated rounded-lg shadow-xl overflow-hidden"
            style={{
            top: `${dropdownPosition.top}px`,
            left: `${Math.max(16, dropdownPosition.left)}px`,
            zIndex: 999999,
            maxHeight: 'min(400px, calc(100vh - 100px))',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            scrollbarWidth: 'thin'
            }}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
        >

  </div>
      <div className="py-2">
        {/* Header */}
        <div className="px-4 py-2 text-xs font-medium vai-text-disabled uppercase tracking-wider border-b border-ui-border-primary">
          Choose Language
        </div>
        
        {/* Language Options */}
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            disabled={isChanging}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-ui-surface-tertiary transition-colors text-left ${
              language.code === i18n.language 
                ? 'bg-status-info-bg text-status-info-light' 
                : 'vai-text-secondary hover:vai-text-primary'
            } ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="text-xl">{language.flag}</span>
            <div className="flex-1">
              <div className="font-medium">{language.nativeName}</div>
              <div className="text-xs vai-text-disabled">{language.name}</div>
            </div>
            {language.code === i18n.language && (
              <div className="w-2 h-2 bg-status-info-light rounded-full"></div>
            )}
          </button>
        ))}
      </div>
      
      {/* Footer */}
      <div className="border-t border-ui-border-primary px-4 py-3 bg-ui-surface-tertiary">
        <div className="text-xs vai-text-disabled">
          🌺 VAI Tickets - French Polynesia
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Trigger Button */}
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={handleToggle}
          disabled={isChanging}
          className={`flex items-center gap-2 px-3 py-2 vai-button-secondary rounded-lg transition-colors ${
            isChanging ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Select language"
          aria-expanded={isOpen}
        >
          <span className="text-lg">{currentLanguage?.flag}</span>
          <span className="hidden sm:inline font-medium">
            {currentLanguage?.nativeName || 'Language'}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Portal Dropdown */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <DropdownMenu />,
        document.body
      )}
    </>
  )
}

export default LanguageDropdown