'use client'
import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AnalyticsCategoryChart({ data }: { data: any[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return <div style={{ width: '100%', height: 320, background: 'transparent' }} />

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid horizontal={false} stroke="#2c2c2e" />
          <XAxis
            type="number"
            tick={{ fill: '#86868b', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          />
          <YAxis
            dataKey="category"
            type="category"
            tick={{ fill: '#86868b', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={150}
            tickFormatter={(value) => value.length > 25 ? `${value.substring(0, 25)}...` : value}
          />
          <Tooltip
            contentStyle={{ background: '#1c1c1e', border: '1px solid #38383a', borderRadius: 12, color: '#f5f5f7', fontSize: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
            itemStyle={{ color: '#f5f5f7' }}
            formatter={(v: any, name: any) => [Number(v).toLocaleString(), name === 'count' ? 'Projects' : 'Budget']}
          />
          <Bar dataKey="count" fill="#0a84ff" radius={[0, 4, 4, 0]} maxBarSize={30} name="count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
