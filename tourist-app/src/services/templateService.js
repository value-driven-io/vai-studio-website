// src/services/templateService.js
import { supabase } from './supabase'

export const templateService = {
  // Get templates for discovery (not instances)
  getDiscoveryTemplates: async (filters = {}) => {
    try {

      let query = supabase
        .from('activity_templates_view')
        .select(`
          id,
          tour_name,
          tour_type,
          description,
          duration_hours,
          discount_price_adult,
          discount_price_child,
          original_price_adult,
          location,
          operator_id,
          equipment_included,
          food_included,
          drinks_included,
          pickup_available,
          languages,
          fitness_level,
          min_age,
          max_age,
          whale_regulation_compliant,
          weather_dependent,
          created_at
        `)

      // Apply basic template criteria
      query = query.eq('is_template', true)

      // Apply location filter
      if (filters.location && filters.location !== 'all') {
        query = query.eq('location', filters.location)
      }

      // Apply tour type filter
      if (filters.tourType && filters.tourType !== 'all') {
        query = query.eq('tour_type', filters.tourType)
      }

      // Apply price range filter
      if (filters.priceRange) {
        if (filters.priceRange.min) {
          query = query.gte('discount_price_adult', filters.priceRange.min)
        }
        if (filters.priceRange.max) {
          query = query.lte('discount_price_adult', filters.priceRange.max)
        }
      }

      // Apply duration filter
      if (filters.duration && filters.duration !== 'any') {
        switch (filters.duration) {
          case 'half-day':
            query = query.lte('duration_hours', 4)
            break
          case 'full-day':
            query = query.gt('duration_hours', 4).lte('duration_hours', 8)
            break
          case 'multi-day':
            query = query.gt('duration_hours', 8)
            break
        }
      }

      // Apply difficulty filter
      if (filters.difficulty && filters.difficulty !== 'any') {
        query = query.eq('fitness_level', filters.difficulty)
      }

      const { data: templates, error } = await query

      if (error) {
        console.error('Error fetching templates:', error)
        throw error
      }

      // SIMPLIFIED: Use templates directly without heavy enrichment
      // This avoids the performance issue of querying instances for each template
      const enrichedTemplates = templates.map(template => ({
        ...template,
        // Template-specific fields
        template_id: template.id,
        is_template: true,

        // Use template pricing directly (will be refined later)
        total_available_spots: 10, // Placeholder
        instance_count: 1, // Placeholder to show templates
        next_available_date: new Date().toISOString().split('T')[0],
        price_from: template.discount_price_adult,

        // Placeholder operator info
        company_name: 'Operator Name', // Will be enriched later
        average_rating: 4.5,

        // For compatibility with existing TourCard component
        tour_id: template.id,
        available_spots: 10,
        tour_date: new Date().toISOString().split('T')[0],
        discount_price_adult: template.discount_price_adult,
        discount_price_child: template.discount_price_child,
        // Use discount_price_child as original_price_child (no original child pricing in templates)
        original_price_child: template.discount_price_child,

        // Calculate savings
        savings_amount: template.original_price_adult - template.discount_price_adult,
        savings_percentage: template.original_price_adult > 0
          ? Math.round(((template.original_price_adult - template.discount_price_adult) / template.original_price_adult) * 100)
          : 0
      }))

      const availableTemplates = enrichedTemplates // All templates are considered available for now

      // Sort by availability and rating
      availableTemplates.sort((a, b) => {
        // Prioritize templates with more available instances
        if (b.instance_count !== a.instance_count) {
          return b.instance_count - a.instance_count
        }
        // Then by operator rating
        if (b.average_rating !== a.average_rating) {
          return (b.average_rating || 0) - (a.average_rating || 0)
        }
        // Then by price (lower first)
        return a.price_from - b.price_from
      })

      return availableTemplates

    } catch (error) {
      console.error('Error in getDiscoveryTemplates:', error)
      throw error
    }
  },

  // Get template details with full availability calendar
  getTemplateWithAvailability: async (templateId, dateRange = {}) => {
    try {
      // Get template details
      const { data: template, error: templateError } = await supabase
        .from('activity_templates_view')
        .select('*')
        .eq('id', templateId)
        .eq('is_template', true)
        .single()

      if (templateError) {
        console.error('Error fetching template:', templateError)
        throw templateError
      }

      // Get available instances for this template
      let instanceQuery = supabase
        .from('active_tours_with_operators')
        .select(`
          id,
          tour_date,
          time_slot,
          duration_hours,
          available_spots,
          max_capacity,
          effective_discount_price_adult,
          effective_discount_price_child,
          original_price_adult,
          meeting_point,
          has_promotional_pricing,
          promo_discount_percent,
          promo_discount_value,
          company_name,
          operator_average_rating,
          status,
          parent_template_id
        `)
        .eq('parent_template_id', templateId)
        .eq('status', 'active')
        .gt('available_spots', 0)
        .gte('tour_date', new Date().toISOString().split('T')[0])
        .order('tour_date', { ascending: true })
        .order('time_slot', { ascending: true })

      // Apply date range if provided
      if (dateRange.start) {
        instanceQuery = instanceQuery.gte('tour_date', dateRange.start)
      }
      if (dateRange.end) {
        instanceQuery = instanceQuery.lte('tour_date', dateRange.end)
      }

      const { data: instances, error: instancesError } = await instanceQuery

      if (instancesError) {
        console.error('Error fetching instances:', instancesError)
        throw instancesError
      }

      // For now, use instances directly - override logic can be added later when DB supports it
      const processedInstances = instances?.map(instance => ({
        ...instance,
        // Inherit template fields if instance doesn't have them
        tour_name: instance.tour_name || template.tour_name,
        description: instance.description || template.description,
        location: instance.location || template.location,
        fitness_level: instance.fitness_level || template.fitness_level,
        min_age: instance.min_age || template.min_age,
        max_age: instance.max_age || template.max_age
      })) || []

      return {
        template: {
          ...template,
          template_id: template.id
        },
        instances: processedInstances,
        availability: {
          total_spots: processedInstances?.reduce((sum, inst) => sum + inst.available_spots, 0) || 0,
          instance_count: processedInstances?.length || 0,
          price_range: processedInstances?.length > 0 ? {
            min: Math.min(...processedInstances.map(i => i.effective_discount_price_adult)),
            max: Math.max(...processedInstances.map(i => i.effective_discount_price_adult))
          } : null,
          next_available: processedInstances?.length > 0 ? processedInstances[0].tour_date : null
        }
      }

    } catch (error) {
      console.error('Error in getTemplateWithAvailability:', error)
      throw error
    }
  }
}

// Override logic removed for now - can be added later when database supports it
// The simplified inheritance logic above handles basic template → instance inheritance