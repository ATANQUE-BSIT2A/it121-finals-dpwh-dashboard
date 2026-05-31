'use client'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { STATUSES } from '@/lib/statuses'

interface Props { data: { name: string; value: number }[] }

const LABEL_THRESHOLD = 3  // degrees — slices smaller than this show in legend only

export default function StatusDonutChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0)

  // Sort largest first so small slices are grouped at end
  const sorted = [...data].sort((a, b) => b.value - a.value)

  // Map each status to its unique color
  const getColor = (name: string) => {
    const s = STATUSES.find(x => x.value === name || x.label === name)
    return s?.color || '#8b949e'
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
        style={{ fontSize: 11, fontWeight: 600, pointerEvents: 'none' }}>
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    )
  }

  // Custom legend shows ALL statuses with their count
  const renderLegend = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingLeft: 12 }}>
      {sorted.map(entry => (
        <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: getColor(entry.name), flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: '#8b949e', whiteSpace: 'nowrap' }}>
            {entry.name}
          </span>
          <span style={{ fontSize: 11, color: '#e6edf3', fontWeight: 600, marginLeft: 'auto', paddingLeft: 8 }}>
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 280 }}>
      {/* Donut */}
      <div style={{ flex: '0 0 200px', height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sorted}
              dataKey="value"
              nameKey="name"
              cx="50%" cy="50%"
              innerRadius={60}
              outerRadius={90}
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
              contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 12 }}
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
