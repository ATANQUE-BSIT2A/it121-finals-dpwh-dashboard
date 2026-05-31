import { formatPeso, formatNumber } from '@/lib/utils'
import { FolderOpen, DollarSign, CheckCircle, Clock } from 'lucide-react'

interface Props {
  total: number
  totalBudget: number
  completed: number
  ongoing: number
}

export default function KpiCards({ total, totalBudget, completed, ongoing }: Props) {
  const cards = [
    { label: 'Total Projects',    value: formatNumber(total),        icon: FolderOpen,   color: '#0a84ff' },
    { label: 'Total Budget',      value: formatPeso(totalBudget),    icon: DollarSign,   color: '#30d158' },
    { label: 'Completed',         value: formatNumber(completed),    icon: CheckCircle,  color: '#30d158' },
    { label: 'On-Going',          value: formatNumber(ongoing),      icon: Clock,        color: '#ffd60a' },
    { label: 'Completion Rate',   value: total > 0 ? `${((completed / total) * 100).toFixed(1)}%` : '—', icon: CheckCircle, color: '#bf5af2' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="card-elevated" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.875rem', color: '#86868b', fontWeight: 600 }}>{label}</span>
            <div style={{
              width: 36, height: 36, borderRadius: 12,
              background: `${color}20`,
              border: `1px solid ${color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={18} style={{ color }} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f5f5f7', lineHeight: 1.1 }}>
            {value}
          </div>
        </div>
      ))}
    </div>
  )
}
