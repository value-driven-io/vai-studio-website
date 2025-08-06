// src/components/auth/PendingApprovalScreen.jsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Clock, CheckCircle, Mail, MessageCircle, 
  RefreshCw, ArrowLeft, AlertCircle, 
  Calendar, Award, ExternalLink
} from 'lucide-react'
import { useRegistration } from '../../hooks/useRegistration'

const PendingApprovalScreen = ({ 
  operator, 
  registrationResult, 
  onBack, 
  onCheckStatus 
}) => {
  const { t } = useTranslation()
  const { checkApprovalStatus, loading } = useRegistration()
  const [statusData, setStatusData] = useState(null)
  const [lastChecked, setLastChecked] = useState(new Date())

  // Auto-refresh status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefreshStatus(false) // Silent refresh
    }, 30000)

    return () => clearInterval(interval)
  }, [operator?.email])

  const handleRefreshStatus = async (showToast = true) => {
    if (!operator?.email) return

    console.log('🔄 Refreshing approval status...')
    const result = await checkApprovalStatus(operator.email)
    setStatusData(result)
    setLastChecked(new Date())

    if (result.canLogin && showToast) {
      // Operator has been approved!
      console.log('🎉 Operator approved!')
      onCheckStatus && onCheckStatus(result)
    }
  }

  const getStatusInfo = () => {
    const status = statusData?.status || operator?.status || 'pending'
    
    switch (status) {
      case 'active':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-500/10 border-green-500/20',
          title: t('pendingApproval.status.approved'),
          message: t('pendingApproval.status.approvedMessage'),
          canLogin: true
        }
      case 'suspended':
        return {
          icon: AlertCircle,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10 border-yellow-500/20',
          title: t('pendingApproval.status.suspended'),
          message: t('pendingApproval.status.suspendedMessage'),
          canLogin: false
        }
      case 'inactive':
        return {
          icon: AlertCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10 border-red-500/20',
          title: t('pendingApproval.status.inactive'),
          message: t('pendingApproval.status.inactiveMessage'),
          canLogin: false
        }
      default: // pending
        return {
          icon: Clock,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10 border-blue-500/20',
          title: t('pendingApproval.status.pending'),
          message: t('pendingApproval.status.pendingMessage'),
          canLogin: false
        }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  const formatTimeAgo = (date) => {
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    
    if (diff < 60) return t('pendingApproval.timeAgo.justNow')
    if (diff < 3600) return t('pendingApproval.timeAgo.minutesAgo', { minutes: Math.floor(diff / 60) })
    if (diff < 86400) return t('pendingApproval.timeAgo.hoursAgo', { hours: Math.floor(diff / 3600) })
    return t('pendingApproval.timeAgo.daysAgo', { days: Math.floor(diff / 86400) })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">🏝️ VAI Operator</h1>
            <p className="text-slate-300">{t('pendingApproval.title')}</p>
          </div>
        </div>

        {/* Main Status Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 mb-6">
          
          {/* Status Header */}
          <div className={`${statusInfo.bgColor} rounded-lg p-6 mb-6`}>
            <div className="flex items-center gap-4">
              <StatusIcon className={`w-12 h-12 ${statusInfo.color}`} />
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {statusInfo.title}
                </h2>
                <p className="text-slate-300">
                  {statusInfo.message}
                </p>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                {t('pendingApproval.applicationDetails')}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('pendingApproval.company')}:</span>
                  <span className="text-white font-medium">
                    {operator?.company_name || registrationResult?.operator?.company_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('pendingApproval.contact')}:</span>
                  <span className="text-white">
                    {operator?.contact_person || registrationResult?.operator?.contact_person}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('pendingApproval.island')}:</span>
                  <span className="text-white">
                    {operator?.island || registrationResult?.operator?.island}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('pendingApproval.submitted')}:</span>
                  <span className="text-white">
                    {operator?.created_at 
                      ? new Date(operator.created_at).toLocaleDateString()
                      : t('pendingApproval.today')
                    }
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                {t('pendingApproval.nextSteps')}
              </h3>
              <div className="space-y-3">
                {registrationResult?.next_steps?.map((step, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{step}</span>
                  </div>
                )) || [
                  'Check your email for confirmation',
                  'Our team will review your application',
                  'You\'ll receive approval notification',
                  'Once approved, you can start creating activities'
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Founding Member Benefits */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Award className="w-6 h-6 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="text-yellow-400 font-semibold mb-1">
                  {t('pendingApproval.foundingBenefits')}
                </h4>
                <p className="text-slate-300 text-sm">
                  {t('pendingApproval.foundingBenefitsText')}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleRefreshStatus(true)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? t('pendingApproval.actions.checking') : t('pendingApproval.actions.refresh')}
            </button>

            {statusInfo.canLogin && (
              <button
                onClick={() => onCheckStatus && onCheckStatus(statusData)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                {t('pendingApproval.actions.login')}
              </button>
            )}
          </div>

          {/* Last Checked */}
          <div className="text-center mt-4">
            <p className="text-slate-500 text-xs">
              {t('pendingApproval.lastChecked')}: {formatTimeAgo(lastChecked)}
            </p>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-slate-800/30 rounded-lg p-4">
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-3">
              {t('pendingApproval.contactApproval.questions')}
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="mailto:hello@vai.studio"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                {t('pendingApproval.contactApproval.email')}
              </a>
              <a
                href="https://wa.me/68987269065"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                {t('pendingApproval.contactApproval.whatsapp')}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PendingApprovalScreen