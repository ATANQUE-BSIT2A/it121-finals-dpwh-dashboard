'use client'
import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AnalyticsCategoryChart({ data }: { data: any[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return <div style={{ width: '100%', height: 320, background: 'transparent' }} />

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 24, bottom: 72, left: 12 }}>
          <CartesianGrid vertical={false} stroke="#2c2c2e" />
          <XAxis
            dataKey="category"
            tick={{ fill: '#86868b', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            tick={{ fill: '#86868b', fontSize: 13 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          />
          <Tooltip
            contentStyle={{ background: '#1c1c1e', border: '1px solid #38383a', borderRadius: 12, color: '#f5f5f7', fontSize: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
            formatter={(v: any, name: any) => [Number(v).toLocaleString(), name === 'count' ? 'Projects' : 'Budget']}
          />
          <Bar dataKey="count" fill="#0a84ff" radius={[8, 8, 0, 0]} maxBarSize={44} name="count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
