'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ProjectsByYearChart({ data }: { data: { year: string; count: number; budget: number }[] }) {
  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="countGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1f6feb" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#1f6feb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
          <XAxis dataKey="year" tick={{ fill: '#8b949e', fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: '#8b949e', fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 12 }}
            formatter={(v: any) => [Number(v).toLocaleString(), 'Projects']}
          />
          <Area type="monotone" dataKey="count" stroke="#1f6feb" strokeWidth={2} fill="url(#countGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
