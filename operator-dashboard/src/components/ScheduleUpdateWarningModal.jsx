import React from 'react'
import { AlertTriangle, Lock, CheckCircle, Plus, Minus } from 'lucide-react'

const ScheduleUpdateWarningModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  schedule,
  updateAnalysis,
  loading = false 
}) => {
  if (!isOpen) return null

  // Use updateAnalysis if provided, otherwise create basic analysis from schedule
  const analysis = updateAnalysis || {
    customizedCount: 0,
    standardCount: 0,
    newDates: [],
    removedDates: [],
    timeChange: null,
    existingTours: []
  }

  const {
    customizedCount = 0,
    standardCount = 0, 
    newDates = [],
    removedDates = [],
    timeChange = null,
    existingTours = []
  } = analysis

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Smart Update System
              </h3>
              <p className="text-sm text-gray-600">
                We'll preserve your customizations while applying changes
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Current state */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Current: {existingTours.length} activities total
            </h4>
            <div className="flex items-center gap-4 text-sm">
              {customizedCount > 0 && (
                <div className="flex items-center gap-1">
                  <Lock className="w-4 h-4 text-orange-500" />
                  <span>{customizedCount} customized</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>{standardCount} standard</span>
              </div>
            </div>
          </div>

          {/* Update preview */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">
              Your changes will:
            </h4>
            
            {/* Preserved customizations */}
            {customizedCount > 0 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <Lock className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-orange-900">
                    Preserve {customizedCount} customized activities
                  </div>
                  <div className="text-xs text-orange-700">
                    Keep their special changes unchanged
                  </div>
                </div>
              </div>
            )}

            {/* Standard updates */}
            {standardCount > 0 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-green-900">
                    Update {standardCount} standard activities
                  </div>
                  {timeChange && (
                    <div className="text-xs text-green-700">
                      Change time: {timeChange}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* New dates */}
            {newDates.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Plus className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-blue-900">
                    Add {newDates.length} new activities
                  </div>
                  <div className="text-xs text-blue-700">
                    For newly scheduled dates
                  </div>
                </div>
              </div>
            )}

            {/* Removed dates */}
            {removedDates.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Minus className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Remove {removedDates.length} obsolete activities
                  </div>
                  <div className="text-xs text-gray-600">
                    Only standard activities on removed dates
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Safety message */}
          {customizedCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">
                  Your customizations are safe!
                </span>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                Special activities will keep their changes and won't be affected by this update.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </div>
            ) : (
              'Apply Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScheduleUpdateWarningModal