'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function BudgetByRegionChart({ data }: { data: { region: string; total: number }[] }) {
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#21262d" />
          <XAxis
            type="number"
            tick={{ fill: '#8b949e', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v >= 1e12 ? `₱${(v/1e12).toFixed(0)}T` : v >= 1e9 ? `₱${(v/1e9).toFixed(0)}B` : `₱${(v/1e6).toFixed(0)}M`}
          />
          <YAxis
            type="category"
            dataKey="region"
            tick={{ fill: '#8b949e', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={56}
          />
          <Tooltip
            formatter={(v: any) => {
              const num = Number(v)
              return [`₱${(num/1e9).toFixed(2)}B`, 'Budget']
            }}
            contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 12 }}
          />
          <Bar dataKey="total" fill="#1f6feb" radius={[0, 4, 4, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
