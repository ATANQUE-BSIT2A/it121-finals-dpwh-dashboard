export function formatPeso(value: number | null | undefined): string {
  if (value === null || value === undefined || value === 0) return 'N/A'
  if (value >= 1_000_000_000_000) return `₱${(value / 1_000_000_000_000).toFixed(2)}T`
  if (value >= 1_000_000_000)     return `₱${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000)         return `₱${(value / 1_000_000).toFixed(2)}M`
  return `₱${value.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`
}

export function formatNumber(n: number | null | undefined): string {
  if (!n) return '0'
  return n.toLocaleString('en-PH')
}

export function formatDate(d: string | null | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function truncate(str: string | null | undefined, len: number): string {
  if (!str) return '—'
  return str.length > len ? str.slice(0, len) + '…' : str
}

export function statusClass(status: string | null | undefined): string {
  const s = (status || '').toLowerCase()
  if (s === 'completed')  return 'badge badge-completed'
  if (s === 'on-going' || s === 'ongoing') return 'badge badge-ongoing'
  if (s === 'suspended')  return 'badge badge-suspended'
  if (s === 'terminated') return 'badge badge-terminated'
  return 'badge badge-default'
}

export function progressColor(p: number): string {
  if (p >= 100) return '#3fb950'
  if (p >= 50)  return '#58a6ff'
  if (p >= 25)  return '#d29922'
  return '#f85149'
}
