'use client'
import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ProjectsByYearChart({ data }: { data: { year: string; count: number; budget: number }[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return <div style={{ width: '100%', height: 240, background: 'transparent' }} />

  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2c2c2e" />
          <XAxis dataKey="year" tick={{ fill: '#86868b', fontSize: 13 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#86868b', fontSize: 13 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#1c1c1e', border: '1px solid #38383a', borderRadius: 12, color: '#f5f5f7', fontSize: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
            formatter={(v: any) => [Number(v).toLocaleString(), 'Projects']}
          />
          <Bar dataKey="count" fill="#0a84ff" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
