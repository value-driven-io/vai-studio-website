// src/hooks/useOperatorDisplay.js
import { useMemo } from 'react'
import {
  shouldShowSection,
  shouldShowField,
  getTrustIndicators,
  getDisplayStats,
  NEW_OPERATOR_INDICATORS
} from '../config/operatorFields'

export const useOperatorDisplay = (operatorData) => {
  // Determine which sections should be visible
  const visibleSections = useMemo(() => {
    if (!operatorData) return {}

    return {
      hero: shouldShowSection('hero', operatorData),
      trust: shouldShowSection('trust', operatorData),
      stats: shouldShowSection('stats', operatorData),
      about: shouldShowSection('about', operatorData),
      activities: shouldShowSection('activities', operatorData),
      contact: shouldShowSection('contact', operatorData),
      share: shouldShowSection('share', operatorData),
    }
  }, [operatorData])

  // Get trust indicators for the operator
  const trustIndicators = useMemo(() => {
    if (!operatorData) return []
    return getTrustIndicators(operatorData)
  }, [operatorData])

  // Get displayable statistics
  const displayStats = useMemo(() => {
    if (!operatorData) return []
    return getDisplayStats(operatorData)
  }, [operatorData])

  // Determine if operator is new (no completed tours)
  const isNewOperator = useMemo(() => {
    return operatorData?.total_tours_completed === 0 || !operatorData?.total_tours_completed
  }, [operatorData])

  // Get new operator specific indicators
  const newOperatorStatus = useMemo(() => {
    if (!operatorData || !isNewOperator) return {}

    return {
      licensed: NEW_OPERATOR_INDICATORS.licensed(operatorData),
      certified: NEW_OPERATOR_INDICATORS.certified(operatorData),
      localExpert: NEW_OPERATOR_INDICATORS.local_expert(operatorData),
      newToPlatform: NEW_OPERATOR_INDICATORS.new_to_platform(operatorData),
    }
  }, [operatorData, isNewOperator])

  // Helper function to check if specific field should show
  const shouldShow = useMemo(() => {
    return (sectionOrField, value = null) => {
      if (visibleSections.hasOwnProperty(sectionOrField)) {
        return visibleSections[sectionOrField]
      }

      if (value !== null) {
        return shouldShowField(sectionOrField, value, operatorData)
      }

      return false
    }
  }, [visibleSections, operatorData])

  // Get contact methods available
  const contactMethods = useMemo(() => {
    if (!operatorData) return []

    const methods = []

    if (operatorData.whatsapp_number) {
      methods.push({
        type: 'whatsapp',
        value: operatorData.whatsapp_number,
        primary: true // WhatsApp is primary in French Polynesia
      })
    }

    if (operatorData.phone) {
      methods.push({
        type: 'phone',
        value: operatorData.phone,
        primary: !operatorData.whatsapp_number // Phone is primary only if no WhatsApp
      })
    }

    return methods
  }, [operatorData])

  // Get activity statistics
  const activityStats = useMemo(() => {
    if (!operatorData?.activities) return null

    const activities = operatorData.activities
    const totalActivities = activities.length
    const totalAvailableSpots = activities.reduce((sum, activity) =>
      sum + (activity.availability?.total_spots || 0), 0
    )

    // Get unique tour types
    const tourTypes = [...new Set(activities.map(activity => activity.tour_type))]

    // Get unique languages
    const allLanguages = activities.flatMap(activity => activity.languages || [])
    const uniqueLanguages = [...new Set(allLanguages)]

    // Get price range
    const prices = activities.map(activity => activity.discount_price_adult || 0).filter(p => p > 0)
    const priceRange = prices.length > 0 ? {
      min: Math.min(...prices),
      max: Math.max(...prices)
    } : null

    return {
      totalActivities,
      totalAvailableSpots,
      tourTypes,
      uniqueLanguages,
      priceRange,
      hasUpcomingActivities: totalAvailableSpots > 0
    }
  }, [operatorData])

  return {
    visibleSections,
    trustIndicators,
    displayStats,
    isNewOperator,
    newOperatorStatus,
    shouldShow,
    contactMethods,
    activityStats,

    // Convenience getters
    hasActivities: visibleSections.activities,
    hasContactInfo: visibleSections.contact,
    hasTrustIndicators: visibleSections.trust,
    hasStats: visibleSections.stats,
    hasAbout: visibleSections.about,
  }
}