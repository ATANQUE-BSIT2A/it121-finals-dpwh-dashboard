'use client'
import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ProjectsByYearChart({ data }: { data: { year: string; count: number; totalBudget?: number }[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return <div style={{ width: '100%', height: '100%', background: 'transparent' }} />

  const tooltipFormatter = (v: any, name: any) => {
    if (name === 'count') return [Number(v).toLocaleString(), 'Projects'];
    if (name === 'totalBudget') return ['₱' + (Number(v) / 1e9).toFixed(2) + 'B', 'Budget'];
    return [v, name];
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2c2c2e" vertical={false} />
          <XAxis 
            dataKey="year" 
            tick={{ fill: '#e6edf3', fontSize: 13 }} 
            tickLine={false} 
            axisLine={false}
            dy={10}
          />
          <YAxis 
            tick={{ fill: '#e6edf3', fontSize: 13 }} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          />
          <Tooltip
            contentStyle={{ background: '#1c1c1e', border: '1px solid #38383a', borderRadius: 12, color: '#f5f5f7', fontSize: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
            itemStyle={{ color: '#f5f5f7' }}
            formatter={tooltipFormatter}
          />
          <Bar dataKey="count" fill="#0a84ff" radius={[8, 8, 0, 0]} barSize={60} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
