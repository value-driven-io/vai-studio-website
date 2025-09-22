// HierarchicalBookingsList.jsx - Template→Date/Time→Bookings Hierarchy for Bookings
// FIXED VERSION addressing all enhancement requests
import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Calendar, ChevronDown, ChevronUp, Package, MessageCircle
} from 'lucide-react'
import BookingRow from './BookingRow'

const HierarchicalBookingsList = ({
  filteredBookings,
  tours,
  bookingsLoading,
  operator,
  formatDate,
  formatPrice,
  getTimeUntilDeadline,
  shouldShowCustomerDetails,
  onBookingClick,
  onChatClick,
  setActiveTab
}) => {
  const { t } = useTranslation()

  // Hierarchical expansion state
  const [expandedTemplates, setExpandedTemplates] = useState(new Set())
  const [expandedInstances, setExpandedInstances] = useState(new Set())

  // IMPROVED HIERARCHY: Template → Date/Time → Bookings (removed schedule level)
  const hierarchicalData = useMemo(() => {
    // Use filteredBookings directly - if empty due to filters, show empty results
    const bookingsToGroup = filteredBookings

    // Group by template first
    const templateGroups = {}

    bookingsToGroup.forEach(booking => {
      const tour = booking.tours
      if (!tour) return

      // Extract template information - use tour name + type as unique template identifier
      // This ensures tours with same name/type are grouped together even without parent_template_id
      const templateId = tour.parent_template_id || `template_${tour.tour_name}_${tour.tour_type}`
      const templateName = tour.tour_name || t('bookings.labels.unknownTour')
      const templateType = tour.tour_type || t('bookings.labels.unknownType')

      // Extract instance information (Date/Time level)
      const instanceId = tour.id
      const instanceDate = tour.tour_date
      const instanceTime = tour.time_slot
      const instanceKey = `${tour.id}_${instanceDate}_${instanceTime}` // Use tour.id to ensure uniqueness

      // Build hierarchy: Template → Date/Time Instance → Bookings
      if (!templateGroups[templateId]) {
        templateGroups[templateId] = {
          id: templateId,
          name: templateName,
          type: templateType,
          instances: {},
          totalBookings: 0,
          pendingBookings: 0,
          revenue: 0,
          urgentCount: 0,
          unreadMessages: 0
        }
      }

      const template = templateGroups[templateId]

      if (!template.instances[instanceKey]) {
        template.instances[instanceKey] = {
          id: instanceId,
          key: instanceKey,
          date: instanceDate,
          time: instanceTime,
          tour: tour,
          bookings: [],
          totalBookings: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          revenue: 0,
          occupancyRate: 0
        }
      }

      const instance = template.instances[instanceKey]

      // Add booking to instance
      instance.bookings.push(booking)

      // Calculate metrics
      const bookingRevenue = booking.total_amount || booking.subtotal || 0
      const isPending = booking.booking_status === 'pending'
      const isConfirmed = ['confirmed', 'completed'].includes(booking.booking_status)
      const isUrgent = getTimeUntilDeadline ? getTimeUntilDeadline(booking).isUrgent : false
      // For now, treat all messages as unread since we don't have read/unread tracking
      const hasUnreadMessages = booking.has_messages

      // Update instance metrics
      instance.totalBookings++
      if (isPending) instance.pendingBookings++
      if (isConfirmed) instance.confirmedBookings++
      instance.revenue += bookingRevenue
      // Occupancy based on confirmed bookings only (actual capacity used)
      instance.occupancyRate = tour.max_capacity && tour.max_capacity > 0
        ? Math.round((instance.confirmedBookings / tour.max_capacity) * 100)
        : 0 // No percentage for unlimited capacity

      // Update template metrics
      template.totalBookings++
      if (isPending) template.pendingBookings++
      if (isUrgent) template.urgentCount++
      if (hasUnreadMessages) template.unreadMessages++
      template.revenue += bookingRevenue
    })

    return templateGroups
  }, [filteredBookings, tours, getTimeUntilDeadline, t])

  // Use BookingsHeader filtered data - no additional filtering
  const filteredData = Object.values(hierarchicalData)

  // Toggle functions
  const toggleTemplate = (templateId) => {
    const newExpanded = new Set(expandedTemplates)
    if (newExpanded.has(templateId)) {
      newExpanded.delete(templateId)
    } else {
      newExpanded.add(templateId)
    }
    setExpandedTemplates(newExpanded)
  }

  const toggleInstance = (instanceKey) => {
    const newExpanded = new Set(expandedInstances)
    if (newExpanded.has(instanceKey)) {
      newExpanded.delete(instanceKey)
    } else {
      newExpanded.add(instanceKey)
    }
    setExpandedInstances(newExpanded)
  }

  if (bookingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <div className="text-slate-400 text-sm">{t('bookings.messages.loading')}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Simple Header - BookingsHeader handles all filtering */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">{t('bookings.grouped.title')}</h2>
        <p className="text-slate-400">{t('bookings.hierarchical.description')}</p>
      </div>

      {/* Hierarchical Template Cards */}
      <div className="space-y-4">
        {filteredData.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            isExpanded={expandedTemplates.has(template.id)}
            onToggle={() => toggleTemplate(template.id)}
            expandedInstances={expandedInstances}
            onToggleInstance={toggleInstance}
            formatDate={formatDate}
            formatPrice={formatPrice}
            getTimeUntilDeadline={getTimeUntilDeadline}
            shouldShowCustomerDetails={shouldShowCustomerDetails}
            onBookingClick={onBookingClick}
            onChatClick={onChatClick}
            t={t}
          />
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">{t('bookings.list.noBookings')}</h3>
          <p className="text-slate-400 mb-6">
            {t('bookings.list.createFirstTour')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setActiveTab('templates')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
            >
              {t('bookings.list.createTemplate')}
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-2 rounded-lg transition-colors font-medium"
            >
              {t('bookings.list.manageSchedules')}
            </button>
          </div>
          <p className="text-slate-500 text-sm mt-3">
            {t('bookings.list.emptyStateExplanation')}
          </p>
        </div>
      )}
    </div>
  )
}

// Template Card Component (Level 1: Activity Template)
const TemplateCard = ({
  template,
  isExpanded,
  onToggle,
  expandedInstances,
  onToggleInstance,
  formatDate,
  formatPrice,
  getTimeUntilDeadline,
  shouldShowCustomerDetails,
  onBookingClick,
  onChatClick,
  t
}) => {
  const hasUrgentItems = template.urgentCount > 0
  const hasPendingItems = template.pendingBookings > 0
  const hasUnreadMessages = template.unreadMessages > 0

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
      {/* Template Header */}
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-slate-700/30 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{template.name}</h3>
            <p className="text-slate-400 text-sm">{template.type}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Template Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="text-white font-medium">{template.totalBookings}</div>
              <div className="text-slate-400">{t('bookings.stats.total')}</div>
            </div>
            {hasPendingItems && (
              <div className="text-center">
                <div className="text-orange-400 font-medium">{template.pendingBookings}</div>
                <div className="text-slate-400">{t('bookings.stats.pending')}</div>
              </div>
            )}
            {hasUrgentItems && (
              <div className="text-center">
                <div className="text-red-400 font-medium">{template.urgentCount}</div>
                <div className="text-slate-400">{t('bookings.priority.urgent')}</div>
              </div>
            )}
            <div className="text-center">
              <div className="text-green-400 font-medium">{formatPrice(template.revenue)}</div>
              <div className="text-slate-400">{t('bookings.stats.revenue')}</div>
            </div>
          </div>

          {/* Chat Icon with Counter */}
          {hasUnreadMessages && (
            <div className="relative">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-lg">
                <MessageCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{template.unreadMessages}</span>
              </div>
            </div>
          )}

          {/* Expand Icon */}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded Date/Time Instances */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-3">
          {Object.values(template.instances).map(instance => (
            <InstanceCard
              key={instance.key}
              instance={instance}
              isExpanded={expandedInstances.has(instance.key)}
              onToggle={() => onToggleInstance(instance.key)}
              formatDate={formatDate}
              formatPrice={formatPrice}
              getTimeUntilDeadline={getTimeUntilDeadline}
              shouldShowCustomerDetails={shouldShowCustomerDetails}
              onBookingClick={onBookingClick}
              onChatClick={onChatClick}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Instance Card Component (Level 2: Specific Date/Time)
const InstanceCard = ({
  instance,
  isExpanded,
  onToggle,
  formatDate,
  formatPrice,
  getTimeUntilDeadline,
  shouldShowCustomerDetails,
  onBookingClick,
  onChatClick,
  t
}) => {
  const hasPendingBookings = instance.pendingBookings > 0
  const occupancyColor =
    instance.occupancyRate >= 90 ? 'text-red-400' :
    instance.occupancyRate >= 70 ? 'text-yellow-400' :
    instance.occupancyRate >= 40 ? 'text-blue-400' :
    'text-green-400'

  return (
    <div className="bg-slate-700/30 rounded-lg border border-slate-600">
      {/* Instance Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-600/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <h4 className="text-white font-medium">
              {formatDate(instance.date)} • {instance.time || t('bookings.labels.timeTbd')}
            </h4>
            <p className="text-slate-400 text-sm">
              {instance.totalBookings} {t('bookings.labels.bookings')}
              {instance.tour.max_capacity && instance.tour.max_capacity > 0 ?
                ` • ${instance.occupancyRate}% ${t('bookings.labels.full')}` :
                ' • Unlimited capacity'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Instance Stats */}
          <div className="flex items-center gap-2 text-sm">
            <span className={`font-medium ${occupancyColor}`}>
              {instance.confirmedBookings}/{instance.tour.max_capacity && instance.tour.max_capacity > 0 ? instance.tour.max_capacity : '∞'}
            </span>
            {hasPendingBookings && (
              <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs">
                {instance.pendingBookings} {t('bookings.stats.pending')}
              </span>
            )}
          </div>

          {/* Expand Icon */}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded Bookings */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {instance.bookings.map(booking => (
            <BookingRow
              key={booking.id}
              booking={booking}
              formatDate={formatDate}
              formatPrice={formatPrice}
              getTimeUntilDeadline={getTimeUntilDeadline}
              shouldShowCustomerDetails={shouldShowCustomerDetails}
              onBookingClick={onBookingClick}
              onChatClick={onChatClick}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// BookingRow now handled by ImprovedBookingRow component

export default HierarchicalBookingsList