// lib/statuses.ts
// Run: SELECT DISTINCT status FROM dpwh_projects ORDER BY status;
// to get exact strings, then update this list.

export const STATUSES: { label: string; value: string; color: string; bg: string; border: string }[] = [
  { label: 'Completed',       value: 'Completed',       color: '#3fb950', bg: 'rgba(63,185,80,0.15)',   border: 'rgba(63,185,80,0.35)'   },
  { label: 'On-Going',        value: 'On-Going',        color: '#58a6ff', bg: 'rgba(88,166,255,0.15)',  border: 'rgba(88,166,255,0.35)'  },
  { label: 'For Procurement', value: 'For Procurement', color: '#a371f7', bg: 'rgba(163,113,247,0.15)', border: 'rgba(163,113,247,0.35)' },
  { label: 'Not Yet Started', value: 'Not Yet Started', color: '#e3b341', bg: 'rgba(227,179,65,0.15)',  border: 'rgba(227,179,65,0.35)'  },
  { label: 'Suspended',       value: 'Suspended',       color: '#d29922', bg: 'rgba(210,153,34,0.15)',  border: 'rgba(210,153,34,0.35)'  },
  { label: 'Terminated',      value: 'Terminated',      color: '#f85149', bg: 'rgba(248,81,73,0.15)',   border: 'rgba(248,81,73,0.35)'   },
  { label: 'Under Warranty',  value: 'Under Warranty',  color: '#79c0ff', bg: 'rgba(121,192,255,0.15)', border: 'rgba(121,192,255,0.35)' },
]

// Add or remove entries based on what the SQL audit returns.
// Every value must match the exact DB string.

export function getStatusStyle(status: string) {
  const s = STATUSES.find(x => x.value === status)
  return s || { color: '#8b949e', bg: 'rgba(139,148,158,0.15)', border: 'rgba(139,148,158,0.35)' }
}

export function statusBadgeStyle(status: string): React.CSSProperties {
  const s = getStatusStyle(status)
  return {
    display: 'inline-flex', alignItems: 'center',
    padding: '2px 10px', borderRadius: 999,
    fontSize: '0.7rem', fontWeight: 600,
    background: s.bg, border: `1px solid ${s.border}`, color: s.color,
  }
}
