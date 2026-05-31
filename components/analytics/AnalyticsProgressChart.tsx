'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const bucketColor = (min: number) => {
  if (min >= 90) return '#30d158'
  if (min >= 70) return '#0a84ff'
  if (min >= 40) return '#ffd60a'
  return '#ff453a'
}

export default function AnalyticsProgressChart({ data }: { data: any[] }) {
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 12 }}>
          <CartesianGrid vertical={false} stroke="#2c2c2e" />
          <XAxis dataKey="range" tick={{ fill: '#86868b', fontSize: 13 }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fill: '#86868b', fontSize: 13 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          />
          <Tooltip
            contentStyle={{ background: '#1c1c1e', border: '1px solid #38383a', borderRadius: 12, color: '#f5f5f7', fontSize: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
            formatter={(v: any) => [Number(v).toLocaleString(), 'Projects']}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={56}>
            {data.map((entry) => (
              <Cell key={entry.range} fill={bucketColor(entry.min)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
