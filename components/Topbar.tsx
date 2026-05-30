'use client'
import { Search, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Topbar({ title }: { title: string }) {
  const [q, setQ] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && q.trim()) {
      router.push(`/projects?search=${encodeURIComponent(q.trim())}`)
    }
  }

  const now = new Date().toLocaleDateString('en-PH', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  })

  return (
    <div className="topbar">
      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e6edf3', flexShrink: 0 }}>{title}</span>
      <div style={{ flex: 1 }} />
      {/* Search */}
      <div style={{ position: 'relative', width: 240 }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#484f58', pointerEvents: 'none' }} />
        <input
          className="input"
          style={{ paddingLeft: 32, fontSize: '0.8rem', height: 34 }}
          placeholder="Search projects…"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>
      {/* Date */}
      <span style={{ fontSize: '0.75rem', color: '#484f58', flexShrink: 0 }}>{now}</span>
      {/* Bell */}
      <button className="btn btn-ghost" style={{ padding: '6px', borderRadius: 8 }}>
        <Bell size={16} />
      </button>
    </div>
  )
}
