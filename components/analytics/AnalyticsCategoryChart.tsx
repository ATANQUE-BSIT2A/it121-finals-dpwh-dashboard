'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AnalyticsCategoryChart({ data }: { data: any[] }) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 16, bottom: 60, left: 8 }}>
          <CartesianGrid vertical={false} stroke="#21262d" />
          <XAxis
            dataKey="category"
            tick={{ fill: '#8b949e', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            tick={{ fill: '#8b949e', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          />
          <Tooltip
            contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 12 }}
            formatter={(v: any, name: any) => [Number(v).toLocaleString(), name === 'count' ? 'Projects' : 'Budget']}
          />
          <Bar dataKey="count" fill="#1f6feb" radius={[4, 4, 0, 0]} maxBarSize={40} name="count" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
