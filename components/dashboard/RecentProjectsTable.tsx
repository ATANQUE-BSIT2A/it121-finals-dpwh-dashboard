'use client'
import { truncate, formatPeso, progressColor } from '@/lib/utils'
import { statusBadgeStyle } from '@/lib/statuses'
import { useState } from 'react'
import ProjectDrawer from '@/components/ProjectDrawer'

export default function RecentProjectsTable({ data }: { data: any[] }) {
  const [selected, setSelected] = useState<any>(null)
  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {['Contract ID', 'Description', 'Region', 'Category', 'Budget', 'Status', 'Progress'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(p => (
              <tr key={p.contract_id} onClick={() => setSelected(p)}>
                <td style={{ color: '#8b949e', fontFamily: 'monospace', fontSize: '0.75rem' }}>{p.contract_id}</td>
                <td style={{ maxWidth: 280 }}>{truncate(p.description, 65)}</td>
                <td style={{ color: '#8b949e', whiteSpace: 'nowrap' }}>{p.region}</td>
                <td style={{ color: '#8b949e', whiteSpace: 'nowrap' }}>{p.category}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{formatPeso(p.budget)}</td>
                <td><span style={statusBadgeStyle(p.status)}>{p.status}</span></td>
                <td style={{ minWidth: 100 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="progress-track" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{ width: `${p.progress || 0}%`, background: progressColor(p.progress || 0) }} />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#8b949e', minWidth: 28 }}>{p.progress || 0}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && <ProjectDrawer project={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
