'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { REGIONS } from '@/lib/regions'

interface Props { data: { region: string; total: number }[] }

// Convert DB region string → short display label for the chart axis
function toLabel(dbValue: string): string {
  const match = REGIONS.find(r => r.value === dbValue)
  if (match) {
    // Return just the short part before " — "
    return match.label.split(' — ')[0]
  }
  // Return as-is without shortening
  return dbValue
}

const formatBudget = (v: number) =>
  v >= 1e12 ? `₱${(v/1e12).toFixed(0)}T` :
  v >= 1e9  ? `₱${(v/1e9).toFixed(0)}B`  :
              `₱${(v/1e6).toFixed(0)}M`

export default function BudgetByRegionChart({ data }: Props) {
  const labeled = data.map(d => ({ ...d, label: toLabel(d.region) }))

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={labeled} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 12 }}>
          <CartesianGrid horizontal={false} stroke="#2c2c2e" />
          <XAxis
            type="number"
            tick={{ fill: '#86868b', fontSize: 12 }}
            tickLine={false} axisLine={false}
            tickFormatter={formatBudget}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fill: '#86868b', fontSize: 13, whiteSpace: 'nowrap' }}
            tickLine={false} axisLine={false}
            width={110}
          />
          <Tooltip
            contentStyle={{ background: '#1c1c1e', border: '1px solid #38383a', borderRadius: 12, color: '#f5f5f7', fontSize: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
            formatter={(v: any) => [formatBudget(Number(v)), 'Budget']}
            labelFormatter={(label) => {
              const match = labeled.find(d => d.label === label)
              return match?.region || label
            }}
          />
          <Bar dataKey="total" fill="#0a84ff" radius={[0, 8, 8, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
