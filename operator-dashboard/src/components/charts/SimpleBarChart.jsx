import React from 'react'

const SimpleBarChart = ({ data, title, valueKey, labelKey, formatValue = (v) => v, height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-slate-700/20 rounded-lg">
        <p className="text-slate-400">No data available</p>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(item => item[valueKey] || 0))
  const chartData = data.map(item => ({
    ...item,
    percentage: maxValue > 0 ? ((item[valueKey] || 0) / maxValue) * 100 : 0
  }))

  return (
    <div className="bg-slate-700/20 rounded-lg p-4">
      {title && (
        <h4 className="text-white font-medium mb-4">{title}</h4>
      )}
      <div className="space-y-3" style={{ height }}>
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-20 text-slate-300 text-sm truncate">
              {item[labelKey]}
            </div>
            <div className="flex-1 relative">
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
            <div className="w-16 text-right text-slate-300 text-sm">
              {formatValue(item[valueKey] || 0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SimpleBarChart