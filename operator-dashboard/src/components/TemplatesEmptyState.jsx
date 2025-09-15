import React from 'react'
import { Plus, HelpCircle } from 'lucide-react'

const TemplatesEmptyState = ({ onCreateTemplate }) => {
  return (
    <div className="text-center py-12 px-6">
      {/* Icon */}
      <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>

      {/* Heading */}
      <h3 className="text-xl font-semibold text-gray-300 mb-3">
        Create Your First Activity Template
      </h3>
      
      {/* Description */}
      <p className="text-slate-500 mb-6 max-w-md mx-auto">
        Templates are reusable and the foundation for your Activity instances. Create them once, then schedule them multiple times with different dates and frequencies.
      </p>

      {/* Benefits */}
      <div className="rounded-lg p-4 mb-6 max-w-lg mx-auto border border-slate-600">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Templates help you:</h4>
        <ul className="text-sm text-slate-500 space-y-2">
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Save time by reusing activity details
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Keep consistent pricing and descriptions
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Schedule the same activity multiple times
          </li>
        </ul>
      </div>

      {/* Action */}
      <div className="space-y-3">
        <button
          onClick={onCreateTemplate}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Template
          <div className="group relative">
            <HelpCircle className="w-4 h-4 ml-1 text-indigo-200 hover:text-white cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              Templates contain all your activity details except dates and times
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        </button>
        
        <p className="text-xs text-gray-500">
          You can always edit templates later
        </p>
      </div>

    </div>
  )
}

export default TemplatesEmptyState