'use client'

import { cn } from '@/lib/utils'

interface ChartProps {
  data: { label: string; value: number; color?: string }[]
  height?: number
  className?: string
}

export function SimpleBarChart({ data, height = 200, className }: ChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1)
  
  return (
    <div className={cn('w-full', className)}>
      <svg width="100%" height={height} className="overflow-visible">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 40)
          const barWidth = 100 / data.length - 2
          const x = (index * 100) / data.length + 1
          const y = height - barHeight - 20
          
          return (
            <g key={index}>
              <rect
                x={`${x}%`}
                y={y}
                width={`${barWidth}%`}
                height={barHeight}
                fill={item.color || '#3b82f6'}
                rx={4}
                className="transition-all duration-500 hover:opacity-80"
              />
              <text
                x={`${x + barWidth / 2}%`}
                y={height - 5}
                textAnchor="middle"
                className="text-xs fill-gray-600"
                fontSize="12"
              >
                {item.label}
              </text>
              {item.value > 0 && (
                <text
                  x={`${x + barWidth / 2}%`}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-xs fill-gray-900 font-semibold"
                  fontSize="12"
                >
                  {item.value}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

interface LineChartProps {
  data: { label: string; value: number }[]
  height?: number
  className?: string
  color?: string
}

export function SimpleLineChart({ data, height = 200, className, color = '#3b82f6' }: LineChartProps) {
  if (data.length === 0) return null
  
  const maxValue = Math.max(...data.map(d => d.value), 1)
  const minValue = Math.min(...data.map(d => d.value), 0)
  const range = maxValue - minValue || 1
  
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1 || 1)) * 100
    const y = 100 - ((item.value - minValue) / range) * 80
    return `${x},${y}`
  }).join(' ')
  
  return (
    <div className={cn('w-full', className)}>
      <svg width="100%" height={height} viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-500"
        />
        {data.map((item, index) => {
          const x = (index / (data.length - 1 || 1)) * 100
          const y = 100 - ((item.value - minValue) / range) * 80
          
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="2"
                fill={color}
                className="transition-all duration-300 hover:r-3"
              />
              <text
                x={x}
                y={y - 8}
                textAnchor="middle"
                className="text-xs fill-gray-600"
                fontSize="8"
              >
                {item.value}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
