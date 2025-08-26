import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Globe } from 'lucide-react'

const LanguageDropdown = () => {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef(null)
  const dropdownRef = useRef(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })

  // Complete language configuration with cultural flags and names
  const languages = [
    {
      code: 'fr',
      name: 'French',
      flag: '🇫🇷',
      nativeName: 'Français',
      region: 'Default'
    },
    {
      code: 'ty', 
      name: 'Tahitian',
      flag: '🇵🇫',
      nativeName: 'Reo Tahiti',
      region: 'Local'
    },
    {
      code: 'en', 
      name: 'English',
      flag: '🇺🇸',
      nativeName: 'English',
      region: 'International'
    },
    {
      code: 'de',
      name: 'German',
      flag: '🇩🇪', 
      nativeName: 'Deutsch',
      region: 'Europe'
    },
    {
      code: 'es',
      name: 'Spanish',
      flag: '🇪🇸',
      nativeName: 'Español',
      region: 'International'
    },
    {
      code: 'zh',
      name: 'Chinese',
      flag: '🇨🇳',
      nativeName: '中文',
      region: 'Asia'
    }
  ]

  // Filter to only show supported languages
  const supportedLanguages = languages.filter(lang => 
    i18n.options.supportedLngs?.includes(lang.code)
  )

  const currentLanguage = supportedLanguages.find(lang => lang.code === i18n.language)

  // FIXED: Mobile-responsive dropdown positioning
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const scrollY = window.scrollY || document.documentElement.scrollTop
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      // Mobile detection (using Tailwind's sm breakpoint)
      const isMobile = viewportWidth < 640
      
      // Dropdown dimensions
      const dropdownWidth = isMobile ? Math.min(viewportWidth - 32, 320) : 288 // w-full with padding on mobile, w-72 on desktop
      const estimatedDropdownHeight = 400 // Approximate height
      
      // Calculate positions
      let top = rect.bottom + scrollY + 8
      let left = rect.right - dropdownWidth
      
      // Mobile positioning adjustments
      if (isMobile) {
        // On mobile, center the dropdown with padding
        left = Math.max(16, Math.min(
          (viewportWidth - dropdownWidth) / 2,
          viewportWidth - dropdownWidth - 16
        ))
      } else {
        // Desktop positioning with edge protection
        left = Math.max(16, Math.min(left, viewportWidth - dropdownWidth - 16))
      }
      
      // Prevent dropdown from going below viewport
      if (top + estimatedDropdownHeight > viewportHeight + scrollY) {
        top = rect.top + scrollY - estimatedDropdownHeight - 8
      }
      
      // Final boundary checks
      top = Math.max(scrollY + 16, top)
      
      setDropdownPosition({
        top,
        left,
        width: dropdownWidth
      })
    }
  }

  // Handle dropdown toggle
  const handleToggle = () => {
    if (!isOpen) {
      updateDropdownPosition()
    }
    setIsOpen(!isOpen)
  }

  // FIXED: Improved mobile scroll handling
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close on scroll events or touch events within dropdown
      if (event.type === 'scroll' || event.type === 'touchmove') return
      
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

    const handleScroll = (event) => {
      if (isOpen) {
        // Ignore scroll events from the dropdown itself
        if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
          return
        }
        
        // Only handle window/document scroll, not dropdown internal scroll
        if (event.target === document || event.target === document.documentElement || event.target === document.body || event.target === window) {
          const isMobile = window.innerWidth < 640
          if (isMobile) {
            setIsOpen(false)
          } else {
            updateDropdownPosition()
          }
        }
      }
    }

    const handleResize = () => {
      if (isOpen) {
        updateDropdownPosition()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      window.addEventListener('scroll', handleScroll, { passive: true })
      window.addEventListener('resize', handleResize)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [isOpen])

  const handleLanguageChange = async (langCode) => {
    try {
      await i18n.changeLanguage(langCode)
      
      // Store preference
      localStorage.setItem('vai_language', langCode)
      
      // Optional: Send analytics
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'language_change', {
          'new_language': langCode,
          'previous_language': currentLanguage?.code,
          'component': 'operator_dashboard'
        })
      }
      
      setIsOpen(false)
      
      // Show success feedback
      console.log(`🌍 Language changed to: ${langCode}`)
      
    } catch (error) {
      console.error('Language change failed:', error)
    }
  }

  // Group languages by region for better UX
  const languageGroups = {
    'Local': supportedLanguages.filter(lang => lang.region === 'Local'),
    'Default': supportedLanguages.filter(lang => lang.region === 'Default'),
    'International': supportedLanguages.filter(lang => lang.region === 'International'),
    'Europe': supportedLanguages.filter(lang => lang.region === 'Europe'),
    'Asia': supportedLanguages.filter(lang => lang.region === 'Asia')
  }

  // FIXED: Mobile-responsive dropdown component
  const DropdownMenu = () => (
    <div 
      ref={dropdownRef}
      className="fixed bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden z-[9999]"
      onScroll={(e) => e.stopPropagation()} // Prevent scroll events from bubbling up
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
        zIndex: 999999,
        maxHeight: 'min(80vh, 400px)', // Responsive height
        overflowY: 'auto',
        // Enhanced mobile scroll behavior
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <div className="py-2">
        {/* Header */}
        <div className="px-4 py-2 text-xs font-medium text-slate-400 uppercase tracking-wider border-b border-slate-700">
          Choose Language / Choisir la langue
        </div>
        
        {/* Language Groups */}
        {Object.entries(languageGroups).map(([group, langs]) => {
          if (langs.length === 0) return null
          
          return (
            <div key={group}>
              {group !== 'Default' && (
                <div className="px-4 py-1 text-xs text-slate-500 font-medium mt-2">
                  {group}
                </div>
              )}
              
              {langs.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 transition-colors text-left touch-target ${
                    language.code === i18n.language 
                      ? 'bg-blue-500/10 text-blue-400' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{language.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-xs text-slate-400">{language.name}</div>
                  </div>
                  {language.code === i18n.language && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          )
        })}
      </div>
      
      {/* Footer */}
      <div className="border-t border-slate-700 px-4 py-3 bg-slate-700/20">
        <div className="text-xs text-slate-400 mb-1">
          🌺 VAI supports local Polynesian languages
        </div>
        <div className="text-xs text-slate-500">
          Missing your language? 
          <a 
            href="mailto:hello@vai.studio?subject=Language Request" 
            className="text-blue-400 hover:text-blue-300 ml-1"
            onClick={() => setIsOpen(false)}
          >
            Let us know!
          </a>
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
          className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 rounded-lg transition-colors text-slate-300 hover:text-white"
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

      {/* Portal Dropdown - Renders outside normal DOM tree */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <DropdownMenu />,
        document.body
      )}
    </>
  )
}

export default LanguageDropdown