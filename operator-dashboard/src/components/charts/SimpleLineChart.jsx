import React from 'react'

const SimpleLineChart = ({ data, title, valueKey, labelKey, formatValue = (v) => v, height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-slate-700/20 rounded-lg">
        <p className="text-slate-400">No data available</p>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(item => item[valueKey] || 0))
  const minValue = Math.min(...data.map(item => item[valueKey] || 0))
  const range = maxValue - minValue

  const chartWidth = 300
  const chartHeight = height - 60
  const padding = 20

  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * (chartWidth - 2 * padding)
    const y = range > 0 
      ? chartHeight - padding - ((item[valueKey] || 0) - minValue) / range * (chartHeight - 2 * padding)
      : chartHeight / 2
    return { x, y, value: item[valueKey] || 0, label: item[labelKey] }
  })

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')

  return (
    <div className="bg-slate-700/20 rounded-lg p-4">
      {title && (
        <h4 className="text-white font-medium mb-4">{title}</h4>
      )}
      <div className="relative">
        <svg width={chartWidth} height={chartHeight} className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <line
              key={index}
              x1={padding}
              y1={padding + ratio * (chartHeight - 2 * padding)}
              x2={chartWidth - padding}
              y2={padding + ratio * (chartHeight - 2 * padding)}
              stroke="rgb(71 85 105)"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}
          
          {/* Chart line */}
          <path
            d={pathData}
            fill="none"
            stroke="rgb(59 130 246)"
            strokeWidth="3"
            className="drop-shadow-sm"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="rgb(59 130 246)"
              className="drop-shadow-sm"
            />
          ))}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 px-5">
          {data.map((item, index) => (
            <div key={index} className="text-slate-400 text-xs text-center flex-1">
              {item[labelKey]}
            </div>
          ))}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-5">
          {[maxValue, maxValue * 0.75, maxValue * 0.5, maxValue * 0.25, minValue].map((value, index) => (
            <div key={index} className="text-slate-400 text-xs">
              {formatValue(value)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SimpleLineChart