// src/components/operator/sections/OperatorShare.jsx
import { useTranslation } from 'react-i18next'
import { Share2, Copy, MessageCircle, Facebook, Instagram, Link } from 'lucide-react'
import toast from 'react-hot-toast'

const OperatorShare = ({ operator, operatorSlug, onShare }) => {
  const { t } = useTranslation()

  const profileUrl = `${window.location.origin}/profile/${operatorSlug}`

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'text-green-600',
      bg: 'bg-green-50 hover:bg-green-100',
      action: () => {
        const message = encodeURIComponent(
          t('operatorProfile.share.whatsappMessage', {
            name: operator.company_name,
            island: operator.island,
            url: profileUrl
          })
        )
        window.open(`https://wa.me/?text=${message}`, '_blank')
      }
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      bg: 'bg-blue-50 hover:bg-blue-100',
      action: () => {
        const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`
        window.open(shareUrl, '_blank', 'width=600,height=400')
      }
    },
    {
      name: 'Copy Link',
      icon: Copy,
      color: 'text-gray-600',
      bg: 'bg-gray-50 hover:bg-gray-100',
      action: async () => {
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(profileUrl)
            toast.success(t('operatorProfile.share.linkCopied'))
          } else {
            // Fallback for insecure contexts
            const textArea = document.createElement('textarea')
            textArea.value = profileUrl
            textArea.style.position = 'fixed'
            textArea.style.left = '-999999px'
            textArea.style.top = '-999999px'
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            toast.success(t('operatorProfile.share.linkCopied'))
          }
        } catch (error) {
          console.error('Copy failed:', error)
          toast.error(t('operatorProfile.share.copyFailed'))
        }
      }
    }
  ]

  const handleNativeShare = async () => {
    try {
      await onShare()
    } catch (error) {
      console.error('Share failed:', error)
    }
  }

  return (
    <div className="bg-ui-surface-secondary/50 rounded-xl p-6 border border-ui-border-primary">
      <h2 className="text-lg font-semibold text-ui-text-primary mb-4 flex items-center gap-2">
        <Share2 className="w-5 h-5" />
        {t('operatorProfile.share.title')}
      </h2>

      <div className="space-y-4">
        {/* Share message */}
        <div className="text-center">
          <p className="text-ui-text-secondary mb-4">
            {t('operatorProfile.share.description', { name: operator.company_name })}
          </p>

          {/* Native share button (mobile) */}
          <button
            onClick={handleNativeShare}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-interactive-primary hover:bg-interactive-primary-hover text-ui-text-primary rounded-lg font-medium transition-colors touch-manipulation active:scale-[0.98] mb-4"
          >
            <Share2 className="w-4 h-4" />
            {t('operatorProfile.share.shareProfile')}
          </button>
        </div>

        {/* Share options */}
        <div>
          <h3 className="text-sm font-medium text-ui-text-secondary mb-3 uppercase tracking-wide">
            {t('operatorProfile.share.shareVia')}
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {shareOptions.map((option, index) => {
              const Icon = option.icon

              return (
                <button
                  key={index}
                  onClick={option.action}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border border-ui-border-primary transition-all duration-200 hover:border-interactive-primary/30 ${option.bg} touch-manipulation active:scale-[0.98]`}
                >
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Icon className={`w-5 h-5 ${option.color}`} />
                  </div>
                  <span className="text-xs font-medium text-ui-text-primary">
                    {option.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* URL display */}
        <div>
          <h3 className="text-sm font-medium text-ui-text-secondary mb-3 uppercase tracking-wide">
            {t('operatorProfile.share.profileUrl')}
          </h3>

          <div className="flex items-center gap-2 p-3 bg-ui-surface-primary rounded-lg border border-ui-border-primary">
            <Link className="w-4 h-4 text-ui-text-muted flex-shrink-0" />
            <input
              type="text"
              value={profileUrl}
              readOnly
              className="flex-1 bg-transparent text-sm text-ui-text-secondary focus:outline-none"
            />
            <button
              onClick={shareOptions.find(o => o.name === 'Copy Link')?.action}
              className="p-1 text-ui-text-muted hover:text-ui-text-primary transition-colors"
              title={t('operatorProfile.share.copyUrl')}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Benefits message for operator */}
        <div className="mt-4 p-3 bg-interactive-primary/10 rounded-lg border border-interactive-primary/20">
          <p className="text-sm text-interactive-primary text-center">
            {t('operatorProfile.share.benefits')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default OperatorShare