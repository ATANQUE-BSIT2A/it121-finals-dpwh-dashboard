// lib/statuses.ts
// Run: SELECT DISTINCT status FROM dpwh_projects ORDER BY status;
// to get exact strings, then update this list.

export const STATUSES: { label: string; value: string; color: string; bg: string; border: string }[] = [
  { label: 'Completed',       value: 'Completed',       color: '#30d158', bg: 'rgba(48,209,88,0.15)',   border: 'rgba(48,209,88,0.25)'   },
  { label: 'On-Going',        value: 'On-Going',        color: '#0a84ff', bg: 'rgba(10,132,255,0.15)',  border: 'rgba(10,132,255,0.25)'  },
  { label: 'For Procurement', value: 'For Procurement', color: '#ffd60a', bg: 'rgba(255,214,10,0.15)',  border: 'rgba(255,214,10,0.25)'  },
  { label: 'Not Yet Started', value: 'Not Yet Started', color: '#ffd60a', bg: 'rgba(255,214,10,0.15)',  border: 'rgba(255,214,10,0.25)'  },
  { label: 'Suspended',       value: 'Suspended',       color: '#ffd60a', bg: 'rgba(255,214,10,0.15)',  border: 'rgba(255,214,10,0.25)'  },
  { label: 'Terminated',      value: 'Terminated',      color: '#ff453a', bg: 'rgba(255,69,58,0.15)',   border: 'rgba(255,69,58,0.25)'   },
  { label: 'Under Warranty',  value: 'Under Warranty',  color: '#64d2ff', bg: 'rgba(100,210,255,0.15)', border: 'rgba(100,210,255,0.25)' },
]

// Add or remove entries based on what the SQL audit returns.
// Every value must match the exact DB string.

export function getStatusStyle(status: string) {
  const s = STATUSES.find(x => x.value === status)
  return s || { color: '#86868b', bg: 'rgba(134,134,139,0.15)', border: 'rgba(134,134,139,0.25)' }
}

export function statusBadgeStyle(status: string): React.CSSProperties {
  const s = getStatusStyle(status)
  return {
    display: 'inline-flex', alignItems: 'center',
    padding: '4px 12px', borderRadius: 100,
    fontSize: '0.75rem', fontWeight: 600,
    background: s.bg, border: `1px solid ${s.border}`, color: s.color,
  }
}
