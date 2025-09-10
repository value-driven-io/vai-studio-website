// TemplatesTab.jsx - Dedicated Activity Templates Management
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus, Search, Filter, Edit, Copy, Trash2, Archive,
  Activity, DollarSign, Users, Clock, MapPin, Globe,
  CheckCircle, AlertCircle, Eye, Settings, MoreVertical
} from 'lucide-react'
import templateService from '../services/templateService'
import TemplateCreateModal from './TemplateCreateModal'

const TemplatesTab = ({ operator, formatPrice }) => {
  const { t } = useTranslation()
  
  // State management
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  // Load templates on component mount
  useEffect(() => {
    if (operator?.id) {
      loadTemplates()
    }
  }, [operator])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await templateService.getOperatorTemplates(operator.id)
      setTemplates(data)
      console.log('📦 Loaded templates:', data.length)
    } catch (err) {
      console.error('Error loading templates:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter templates based on search and type
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.tour_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || template.tour_type === filterType
    
    return matchesSearch && matchesType
  })

  // Get unique activity types for filter dropdown
  const activityTypes = [...new Set(templates.map(t => t.tour_type))].filter(Boolean)

  const handleCreateTemplate = () => {
    setSelectedTemplate(null)
    setShowCreateModal(true)
  }

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template)
    setShowCreateModal(true)
  }

  const handleDuplicateTemplate = async (template) => {
    try {
      // Create a copy of the template with modified name
      const duplicateData = {
        ...template,
        tour_name: `${template.tour_name} (Copy)`,
        id: undefined, // Remove ID so a new one is generated
        created_at: undefined,
        updated_at: undefined
      }
      
      const result = await templateService.createTemplate(duplicateData)
      if (result.success) {
        await loadTemplates() // Refresh the list
        alert('✅ Template duplicated successfully!')
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error duplicating template:', error)
      alert(`❌ Failed to duplicate template: ${error.message}`)
    }
  }

  const handleDeleteTemplate = async (template) => {
    try {
      const result = await templateService.deleteTemplate(template.id)
      if (result.success) {
        await loadTemplates() // Refresh the list
        setShowDeleteConfirm(null)
        alert('✅ Template deleted successfully!')
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      alert(`❌ Failed to delete template: ${error.message}`)
    }
  }

  const getActivityIcon = (type) => {
    const icons = {
      'Whale Watching': '🐋',
      'Snorkeling': '🤿', 
      'Lagoon Tour': '🏝️',
      'Hike': '🥾',
      'Cultural': '🗿',
      'Adrenalin': '🪂',
      'Mindfulness': '🧘',
      'Culinary Experience': '🍽️',
      'Diving': '🤿'
    }
    return icons[type] || '🏄'
  }

  const getActivityColor = (type) => {
    const colors = {
      'Whale Watching': 'bg-blue-500',
      'Snorkeling': 'bg-cyan-500',
      'Lagoon Tour': 'bg-teal-500', 
      'Hike': 'bg-green-500',
      'Cultural': 'bg-amber-500',
      'Adrenalin': 'bg-red-500',
      'Mindfulness': 'bg-purple-500',
      'Culinary Experience': 'bg-orange-500',
      'Diving': 'bg-indigo-500'
    }
    return colors[type] || 'bg-slate-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          <span>Loading templates...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Error Loading Templates</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={loadTemplates}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Activity Templates</h1>
          <p className="text-slate-400">Create and manage reusable activity templates for scheduling</p>
        </div>
        <button
          onClick={handleCreateTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          {activityTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <div className="flex items-center bg-slate-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
              <div className="bg-current rounded-sm"></div>
            </div>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="w-4 h-4 flex flex-col gap-1">
              <div className="h-0.5 bg-current"></div>
              <div className="h-0.5 bg-current"></div>
              <div className="h-0.5 bg-current"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Templates Display */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {searchTerm || filterType !== 'all' ? 'No templates found' : 'No templates yet'}
          </h3>
          <p className="text-slate-400 mb-6">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first activity template to get started'
            }
          </p>
          {!searchTerm && filterType === 'all' && (
            <button
              onClick={handleCreateTemplate}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="w-5 h-5" />
              Create First Template
            </button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-all ${
                viewMode === 'list' ? 'flex items-center' : ''
              }`}
            >
              {/* Template Header */}
              <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${getActivityColor(template.tour_type)} rounded-lg flex items-center justify-center text-white text-xl`}>
                      {getActivityIcon(template.tour_type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-lg">{template.tour_name}</h3>
                      <p className="text-slate-400 text-sm">{template.tour_type}</p>
                    </div>
                  </div>
                  
                  {/* Actions Dropdown */}
                  <div className="relative group">
                    <button className="p-2 text-slate-400 hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Template
                      </button>
                      <button
                        onClick={() => handleDuplicateTemplate(template)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Duplicate
                      </button>
                      <hr className="border-slate-700 my-1" />
                      <button
                        onClick={() => setShowDeleteConfirm(template)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-left text-red-400 hover:text-red-300 hover:bg-slate-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Template Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-slate-300">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatPrice(template.discount_price_adult)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-300">
                      <Users className="w-4 h-4" />
                      <span>Max {template.max_capacity}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-300">
                      <Clock className="w-4 h-4" />
                      <span>{template.duration_hours}h</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-slate-400 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{template.meeting_point}</span>
                  </div>

                  {template.languages && template.languages.length > 0 && (
                    <div className="flex items-center gap-1 text-slate-400 text-sm">
                      <Globe className="w-4 h-4" />
                      <span>{template.languages.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {template.description && (
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {template.description}
                  </p>
                )}

                {/* Template Status & Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      template.status === 'active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {template.status === 'active' ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-500">
                    Created {new Date(template.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results Summary */}
      <div className="mt-6 text-center text-slate-500 text-sm">
        Showing {filteredTemplates.length} of {templates.length} templates
        {(searchTerm || filterType !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('')
              setFilterType('all')
            }}
            className="ml-2 text-blue-400 hover:text-blue-300"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl max-w-md w-full border border-slate-700">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Delete Template</h3>
                  <p className="text-slate-400">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-slate-300">
                  Are you sure you want to delete <span className="font-semibold">"{showDeleteConfirm.tour_name}"</span>?
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  Any active schedules using this template will be affected.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 text-slate-400 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTemplate(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Create/Edit Modal */}
      <TemplateCreateModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setSelectedTemplate(null)
        }}
        onSuccess={(newTemplate) => {
          loadTemplates() // Refresh templates list
          setShowCreateModal(false)
          setSelectedTemplate(null)
          console.log('✅ Template saved successfully:', newTemplate)
        }}
        operator={operator}
        formatPrice={formatPrice}
        existingTemplate={selectedTemplate}
      />
    </div>
  )
}

export default TemplatesTab