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
  // Fallback: shorten manually
  return dbValue
    .replace('National Capital Region', 'NCR')
    .replace('Cordillera Administrative Region', 'CAR')
    .replace('Bangsamoro Autonomous Region in Muslim Mindanao', 'BARMM')
    .replace('Negros Island Region', 'NIR')
    .replace('Region ', 'R')
}

const formatBudget = (v: number) =>
  v >= 1e12 ? `₱${(v/1e12).toFixed(0)}T` :
  v >= 1e9  ? `₱${(v/1e9).toFixed(0)}B`  :
              `₱${(v/1e6).toFixed(0)}M`

export default function BudgetByRegionChart({ data }: Props) {
  const labeled = data.map(d => ({ ...d, label: toLabel(d.region) }))

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={labeled} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 8 }}>
          <CartesianGrid horizontal={false} stroke="#21262d" />
          <XAxis
            type="number"
            tick={{ fill: '#8b949e', fontSize: 10 }}
            tickLine={false} axisLine={false}
            tickFormatter={formatBudget}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fill: '#8b949e', fontSize: 10 }}
            tickLine={false} axisLine={false}
            width={64}
          />
          <Tooltip
            contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 12 }}
            formatter={(v: any) => [formatBudget(Number(v)), 'Budget']}
            labelFormatter={(label) => {
              const match = labeled.find(d => d.label === label)
              return match?.region || label
            }}
          />
          <Bar dataKey="total" fill="#1f6feb" radius={[0, 4, 4, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
