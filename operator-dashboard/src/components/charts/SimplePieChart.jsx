import React from 'react'

const SimplePieChart = ({ data, title, valueKey, labelKey, formatValue = (v) => v }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-slate-700/20 rounded-lg">
        <p className="text-slate-400">No data available</p>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + (item[valueKey] || 0), 0)
  const colors = [
    'from-blue-400 to-blue-500',
    'from-purple-400 to-purple-500', 
    'from-green-400 to-green-500',
    'from-yellow-400 to-yellow-500',
    'from-red-400 to-red-500',
    'from-indigo-400 to-indigo-500',
    'from-pink-400 to-pink-500'
  ]

  const chartData = data.map((item, index) => ({
    ...item,
    percentage: total > 0 ? ((item[valueKey] || 0) / total) * 100 : 0,
    color: colors[index % colors.length]
  }))

  return (
    <div className="bg-slate-700/20 rounded-lg p-4">
      {title && (
        <h4 className="text-white font-medium mb-4">{title}</h4>
      )}
      <div className="flex items-center gap-6">
        {/* Simple Circular Progress Representation */}
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="rgb(71 85 105)"
              strokeWidth="12"
            />
            {(() => {
              let currentAngle = 0
              return chartData.map((item, index) => {
                const circumference = 2 * Math.PI * 54
                const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`
                const strokeDashoffset = -currentAngle * (circumference / 100)
                currentAngle += item.percentage
                
                return (
                  <circle
                    key={index}
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke={`rgb(59 130 246)`} // Blue color for simplicity
                    strokeWidth="12"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="opacity-80"
                    style={{
                      filter: `hue-rotate(${index * 60}deg)`
                    }}
                  />
                )
              })
            })()}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-white font-bold text-lg">{data.length}</div>
              <div className="text-slate-400 text-xs">Items</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: 'rgb(59 130 246)',
                    filter: `hue-rotate(${index * 60}deg)`
                  }}
                />
                <span className="text-slate-300 text-sm">{item[labelKey]}</span>
              </div>
              <div className="text-white text-sm font-medium">
                {formatValue(item[valueKey] || 0)} ({item.percentage.toFixed(1)}%)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SimplePieChart