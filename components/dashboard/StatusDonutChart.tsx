'use client'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS: Record<string, string> = {
  'Completed': '#3fb950',
  'On-Going': '#58a6ff',
  'On Going': '#58a6ff',
  'Suspended': '#d29922',
  'Terminated': '#f85149',
  'For Procurement': '#f0883e',
}

export default function StatusDonutChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie 
            data={data} 
            dataKey="value" 
            nameKey="name" 
            cx="50%" 
            cy="45%" 
            innerRadius={55} 
            outerRadius={90} 
            paddingAngle={2}
            minAngle={3}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] || '#8b949e'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 12 }}
            formatter={(v: any, name: any) => [Number(v).toLocaleString(), String(name)]}
          />
          <Legend
            formatter={(v) => <span style={{ color: '#8b949e', fontSize: 11 }}>{v}</span>}
            iconType="circle" iconSize={8}
            verticalAlign="bottom"
            height={36}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
