// operator-dashboard/src/components/SchedulesTab.jsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Clock, RefreshCw, AlertCircle } from 'lucide-react'
import { scheduleService } from '../services/scheduleService'

const SchedulesTab = ({ operator }) => {
  const { t } = useTranslation()
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load schedules on component mount
  useEffect(() => {
    if (operator?.id) {
      loadSchedules()
    }
  }, [operator])

  const loadSchedules = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await scheduleService.getSchedules(operator.id)
      setSchedules(data)
    } catch (err) {
      console.error('Error loading schedules:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDaysOfWeek = (daysArray) => {
    if (!daysArray || daysArray.length === 0) return 'No days set'
    
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return daysArray.map(day => dayNames[day - 1] || '?').join(', ')
  }

  const formatRecurrenceType = (type) => {
    const types = {
      'once': 'One-time',
      'daily': 'Daily',
      'weekly': 'Weekly',
      'monthly': 'Monthly'
    }
    return types[type] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center gap-3 text-slate-400">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading schedules...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Error Loading Schedules</h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <button
            onClick={loadSchedules}
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
          <h1 className="text-2xl font-bold text-white mb-2">Schedule Management</h1>
          <p className="text-slate-400">Manage your recurring tour schedules</p>
        </div>
        <button
          onClick={loadSchedules}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Schedules Table */}
      {schedules.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Schedules Yet</h3>
          <p className="text-slate-400 mb-6">
            You haven't created any recurring schedules yet. When you do, they'll appear here.
          </p>
          <div className="px-4 py-2 bg-slate-700 text-slate-400 rounded-lg inline-block">
            Create functionality coming in Phase 3
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Tour</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Recurrence</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Days</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Time</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Period</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-slate-300">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">
                          {schedule.tours?.tour_name || 'Unknown Tour'}
                        </div>
                        <div className="text-sm text-slate-400">
                          {schedule.tours?.tour_type} • {schedule.tours?.max_capacity} max capacity
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                        {formatRecurrenceType(schedule.recurrence_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {formatDaysOfWeek(schedule.days_of_week)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-4 h-4" />
                        {schedule.start_time}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <div className="text-sm">
                        <div>{schedule.start_date}</div>
                        <div className="text-slate-500">to {schedule.end_date}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {new Date(schedule.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-6 text-center text-slate-500 text-sm">
        Showing {schedules.length} schedule{schedules.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

export default SchedulesTab