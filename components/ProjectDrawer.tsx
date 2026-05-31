'use client'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { formatPeso, formatDate, progressColor } from '@/lib/utils'
import { statusBadgeStyle } from '@/lib/statuses'

interface AiResult { title: string; summary: string; url: string; source: string }

export default function ProjectDrawer({ project, onClose }: { project: any; onClose: () => void }) {
  const [aiResults, setAiResults] = useState<AiResult[]>([])
  const [aiLoading, setAiLoading] = useState(true)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    setAiLoading(true)
    setAiResults([])
    fetch('/api/ai-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contractId: project.contract_id,
        description: project.description,
        region: project.region,
        contractor: project.contractor,
      }),
    })
      .then(r => r.json())
      .then(d => { setAiResults(d.results || []); setAiLoading(false) })
      .catch(() => setAiLoading(false))
  }, [project.contract_id])

  const progress = project.progress || 0
  const budget   = Number(project.budget || 0)
  const paid     = Number(project.amount_paid || 0)

  return (
    <>
      {/* Overlay */}
      <div className="drawer-overlay" onClick={onClose} />

      {/* Panel */}
      <div className="drawer-panel">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, paddingRight: 12 }}>
            <div style={{ fontSize: '0.7rem', color: '#8b949e', fontFamily: 'monospace', marginBottom: 4 }}>
              {project.contract_id}
            </div>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#e6edf3', lineHeight: 1.4, marginBottom: 8 }}>
              {project.description}
            </h2>
            <span style={statusBadgeStyle(project.status)}>{project.status || 'Unknown'}</span>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 6, flexShrink: 0 }}>
            <X size={18} />
          </button>
        </div>

        {/* Progress */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>Completion Progress</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e6edf3' }}>{progress}%</span>
          </div>
          <div className="progress-track" style={{ height: 10, borderRadius: 5 }}>
            <div className="progress-fill" style={{ width: `${progress}%`, background: progressColor(progress), borderRadius: 5 }} />
          </div>
        </div>

        {/* Financials */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <div className="card">
            <div style={{ fontSize: '0.7rem', color: '#8b949e', marginBottom: 4 }}>Contract Budget</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3fb950' }}>{formatPeso(budget)}</div>
          </div>
          <div className="card">
            <div style={{ fontSize: '0.7rem', color: '#8b949e', marginBottom: 4 }}>Amount Paid</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#58a6ff' }}>{formatPeso(paid)}</div>
          </div>
        </div>

        {/* Details grid */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e6edf3', marginBottom: 12 }}>Project Details</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem 1rem' }}>
            {[
              ['Region',        project.region],
              ['Province',      project.province],
              ['Category',      project.category],
              ['Program',       project.program_name],
              ['Source of Funds', project.source_of_funds],
              ['Infra Year',    project.infra_year],
              ['Start Date',    formatDate(project.start_date)],
              ['Target Completion', formatDate(project.completion_date)],
              ['Contractor',    project.contractor],
              ['Report Count',  project.report_count ?? '0'],
            ].map(([label, value]) => (
              <div key={label as string}>
                <div style={{ fontSize: '0.68rem', color: '#484f58', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: '0.8rem', color: '#8b949e', wordBreak: 'break-word' }}>
                  {value || '—'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: '1rem' }}>🤖</span>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', margin: 0 }}>
              AI Research Assistant
            </h4>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#484f58', marginBottom: 12, lineHeight: 1.5 }}>
            Related links and search resources for this project.
          </p>

          {aiLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#484f58', fontSize: '0.8rem' }}>
              <div style={{
                width: 12, height: 12, borderRadius: '50%',
                border: '2px solid #58a6ff', borderTopColor: 'transparent',
                animation: 'aispin 0.8s linear infinite', flexShrink: 0,
              }} />
              Searching for related resources…
            </div>
          ) : aiResults.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: '#484f58' }}>No results found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {aiResults.map((r: any, i: number) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: '#0d1117',
                      border: '1px solid #30363d',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#58a6ff')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#30363d')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#58a6ff', lineHeight: 1.3 }}>
                        {r.title}
                      </span>
                      <span style={{ fontSize: 11, color: '#484f58', flexShrink: 0 }}>↗</span>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: '#8b949e', margin: '0 0 4px', lineHeight: 1.4 }}>
                      {r.summary}
                    </p>
                    <span style={{ fontSize: '0.65rem', color: '#484f58' }}>{r.source}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes aispin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
