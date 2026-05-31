'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const bucketColor = (min: number) => {
  if (min >= 90) return '#3fb950'
  if (min >= 70) return '#58a6ff'
  if (min >= 40) return '#d29922'
  return '#f85149'
}

export default function AnalyticsProgressChart({ data }: { data: any[] }) {
  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
          <CartesianGrid vertical={false} stroke="#21262d" />
          <XAxis dataKey="range" tick={{ fill: '#8b949e', fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fill: '#8b949e', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          />
          <Tooltip
            contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 12 }}
            formatter={(v: any) => [Number(v).toLocaleString(), 'Projects']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={50}>
            {data.map((entry) => (
              <Cell key={entry.range} fill={bucketColor(entry.min)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
