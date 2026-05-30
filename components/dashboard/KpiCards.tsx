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
    { label: 'Total Projects',    value: formatNumber(total),        icon: FolderOpen,   color: '#58a6ff' },
    { label: 'Total Budget',      value: formatPeso(totalBudget),    icon: DollarSign,   color: '#3fb950' },
    { label: 'Completed',         value: formatNumber(completed),    icon: CheckCircle,  color: '#3fb950' },
    { label: 'On-Going',          value: formatNumber(ongoing),      icon: Clock,        color: '#d29922' },
    { label: 'Completion Rate',   value: total > 0 ? `${((completed / total) * 100).toFixed(1)}%` : '—', icon: CheckCircle, color: '#a371f7' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem' }}>
      {cards.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className="card-elevated" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', color: '#8b949e', fontWeight: 500 }}>{label}</span>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: `${color}20`,
              border: `1px solid ${color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={14} style={{ color }} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e6edf3', lineHeight: 1 }}>
            {value}
          </div>
        </div>
      ))}
    </div>
  )
}
