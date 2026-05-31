import { formatPeso } from '@/lib/utils'

export default function AnalyticsContractorsTable({ data }: { data: any[] }) {
  return (
    <div style={{ height: '100%' }}>
      <table className="data-table" style={{ fontSize: '0.8rem' }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Contractor</th>
            <th style={{ textAlign: 'right' }}>Projects</th>
            <th style={{ textAlign: 'right' }}>Total Budget</th>
            <th style={{ textAlign: 'right' }}>Avg Progress</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.contractor}>
              <td style={{ color: '#484f58', width: 32 }}>{i + 1}</td>
              <td style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.contractor}</td>
              <td style={{ textAlign: 'right', color: '#58a6ff', fontWeight: 600 }}>{(row.count || 0).toLocaleString()}</td>
              <td style={{ textAlign: 'right', color: '#3fb950', fontWeight: 600 }}>{formatPeso(row.budget)}</td>
              <td style={{ textAlign: 'right', color: '#e6edf3', paddingTop: 2 }}>{(row.avgProgress || 0).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
