import { useTranslation } from 'react-i18next'

const LoadingScreen = () => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-vai-coral/10 rounded-full blur-3xl animate-vai-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-vai-sunset/10 rounded-full blur-3xl animate-vai-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="text-center relative">
        {/* Logo/Icon placeholder */}
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto bg-vai-coral/20 rounded-xl flex items-center justify-center">
            <div className="w-8 h-8 bg-vai-coral rounded-lg animate-vai-pulse" />
          </div>
        </div>

        {/* Loading animation */}
        <div className="mb-6">
          <div className="flex justify-center items-center gap-2">
            <div className="w-3 h-3 bg-vai-coral rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 bg-vai-coral rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 bg-vai-coral rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>

        {/* Loading text */}
        <h2 className="text-xl font-semibold text-vai-pearl mb-2">
          VAI Studio Client Portal
        </h2>
        
        <p className="text-vai-muted animate-vai-pulse">
          {t('common.loading')}
        </p>

        {/* Progress bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="vai-progress-bar">
            <div 
              className="vai-progress-fill"
              style={{ 
                width: '100%',
                animation: 'progress 2s ease-in-out infinite'
              }}
            />
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes progress {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
        `}
      </style>
    </div>
  )
}

export default LoadingScreen