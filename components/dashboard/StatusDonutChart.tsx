'use client'
import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { STATUSES } from '@/lib/statuses'

interface Props { data: { name: string; value: number }[] }

const LABEL_THRESHOLD = 3  // degrees — slices smaller than this show in legend only

export default function StatusDonutChart({ data }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const total = data.reduce((s, d) => s + d.value, 0)

  if (!mounted) return <div style={{ width: '100%', height: 320, background: 'transparent' }} />

  // Sort largest first so small slices are grouped at end
  const sorted = [...data].sort((a, b) => b.value - a.value)

  // Map each status to its unique color
  const getColor = (name: string) => {
    const s = STATUSES.find(x => x.value === name || x.label === name)
    return s?.color || '#86868b'
  }

  // Custom label: only show % for slices > 5%
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.05) return null
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: 12, fontWeight: 700, pointerEvents: 'none' }}>
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    )
  }

  // Custom legend shows ALL statuses with their count
  const renderLegend = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 16 }}>
      {sorted.map(entry => (
        <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: getColor(entry.name), flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#86868b', whiteSpace: 'nowrap' }}>
            {entry.name}
          </span>
          <span style={{ fontSize: 13, color: '#f5f5f7', fontWeight: 700, marginLeft: 'auto', paddingLeft: 12 }}>
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 320 }}>
      {/* Donut */}
      <div style={{ flex: '0 0 220px', height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sorted}
              dataKey="value"
              nameKey="name"
              cx="50%" cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={2}
              minAngle={4}
              labelLine={false}
              label={renderLabel}
            >
              {sorted.map(entry => (
                <Cell key={entry.name} fill={getColor(entry.name)} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#1c1c1e', border: '1px solid #38383a', borderRadius: 12, color: '#f5f5f7', fontSize: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
              formatter={(v: any, name: any) => [Number(v).toLocaleString(), String(name)]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Legend — all statuses with counts */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {renderLegend()}
      </div>
    </div>
  )
}
