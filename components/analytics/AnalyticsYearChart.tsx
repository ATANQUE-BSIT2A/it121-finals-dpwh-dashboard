'use client'
import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { STATUSES } from '@/lib/statuses'

export default function AnalyticsYearChart({ data }: { data: any[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const allStatuses = STATUSES.map(s => s.value).filter(s =>
    data.some(d => d[s] !== undefined)
  )

  if (!mounted) return <div style={{ width: '100%', height: 300, background: 'transparent' }} />

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
          <CartesianGrid vertical={false} stroke="#21262d" />
          <XAxis dataKey="year" tick={{ fill: '#e6edf3', fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fill: '#e6edf3', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          />
          <Tooltip
            contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 12 }}
            itemStyle={{ color: '#e6edf3' }}
            formatter={(v: any, name: any) => [Number(v).toLocaleString(), String(name)]}
          />
          <Legend formatter={(v) => <span style={{ color: '#e6edf3', fontSize: 11 }}>{v}</span>} />
          {allStatuses.map(s => {
            const st = STATUSES.find(x => x.value === s)
            return <Bar key={s} dataKey={s} stackId="a" fill={st?.color || '#8b949e'} name={s} />
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
