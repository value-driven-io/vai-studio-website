// src/services/templateService.js - Template Management Service for Unified Dual-System
import { supabase } from '../lib/supabase'

export const templateService = {
  /**
   * Create a new activity template
   * @param {Object} templateData - Template data
   * @returns {Promise<Object>} Created template
   */
  async createTemplate(templateData) {
    try {
      console.log('🎯 Creating activity template:', templateData)

      // Ensure template-specific fields are set and exclude generated columns
      const { discount_percentage, ...cleanTemplateData } = templateData
      const templatePayload = {
        ...cleanTemplateData,
        activity_type: 'template',
        is_template: true,
        tour_date: null,
        time_slot: null,
        available_spots: templateData.max_capacity || 1
      }

      const { data: template, error } = await supabase
        .from('tours')
        .insert(templatePayload)
        .select()
        .single()

      if (error) {
        console.error('❌ Template creation failed:', error)
        throw error
      }

      console.log('✅ Template created successfully:', template.id)
      return { success: true, data: template }

    } catch (error) {
      console.error('❌ Error in createTemplate:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get all templates for an operator
   * @param {string} operatorId - Operator ID
   * @returns {Promise<Array>} Array of templates
   */
  async getOperatorTemplates(operatorId) {
    try {
      const { data: templates, error } = await supabase
        .from('tours')
        .select('*')
        .eq('operator_id', operatorId)
        .eq('is_template', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error fetching templates:', error)
        throw error
      }

      return templates || []

    } catch (error) {
      console.error('❌ Error in getOperatorTemplates:', error)
      return []
    }
  },

  /**
   * Update an existing template
   * @param {string} templateId - Template ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Update result
   */
  async updateTemplate(templateId, updateData) {
    try {
      console.log('📝 Updating template:', templateId)

      const { data: template, error } = await supabase
        .from('tours')
        .update(updateData)
        .eq('id', templateId)
        .eq('is_template', true)
        .select()
        .single()

      if (error) {
        console.error('❌ Template update failed:', error)
        throw error
      }

      console.log('✅ Template updated successfully')
      return { success: true, data: template }

    } catch (error) {
      console.error('❌ Error in updateTemplate:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Delete a template (soft delete by setting status to 'cancelled')
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteTemplate(templateId) {
    try {
      console.log('🗑️ Deleting template:', templateId)

      // Check if template has any scheduled activities
      const { data: scheduledActivities, error: checkError } = await supabase
        .from('tours')
        .select('id')
        .eq('parent_template_id', templateId)
        .eq('activity_type', 'scheduled')
        
      if (checkError) {
        throw checkError
      }

      if (scheduledActivities && scheduledActivities.length > 0) {
        return { 
          success: false, 
          error: `Cannot delete template: ${scheduledActivities.length} scheduled activities depend on it` 
        }
      }

      // Soft delete the template
      const { data: template, error } = await supabase
        .from('tours')
        .update({ status: 'cancelled' })
        .eq('id', templateId)
        .eq('is_template', true)
        .select()
        .single()

      if (error) {
        console.error('❌ Template deletion failed:', error)
        throw error
      }

      console.log('✅ Template deleted successfully')
      return { success: true, data: template }

    } catch (error) {
      console.error('❌ Error in deleteTemplate:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Generate scheduled activities from a template
   * @param {string} templateId - Template ID
   * @param {Object} scheduleData - Schedule configuration
   * @returns {Promise<Object>} Generation result
   */
  async generateActivitiesFromTemplate(templateId, scheduleData) {
    try {
      console.log('🔄 Generating activities from template:', templateId)

      // Use the database function we created in the migration
      const { data: activities, error } = await supabase
        .rpc('generate_scheduled_activities_from_template', {
          template_id_param: templateId,
          schedule_data_param: scheduleData
        })

      if (error) {
        console.error('❌ Activity generation failed:', error)
        throw error
      }

      console.log(`✅ Generated ${activities?.length || 0} scheduled activities`)
      return { success: true, data: activities }

    } catch (error) {
      console.error('❌ Error in generateActivitiesFromTemplate:', error)
      return { success: false, error: error.message }
    }
  }
}

export default templateService