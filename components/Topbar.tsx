'use client'
import { Bell } from 'lucide-react'

export default function Topbar({ title }: { title: string }) {
  const now = new Date().toLocaleDateString('en-PH', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  })

  return (
    <div className="topbar">
      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e6edf3', flexShrink: 0 }}>{title}</span>
      <div style={{ flex: 1 }} />
      {/* Date */}
      <span style={{ fontSize: '0.75rem', color: '#484f58', flexShrink: 0 }}>{now}</span>
      {/* Bell */}
      <button className="btn btn-ghost" style={{ padding: '6px', borderRadius: 8 }}>
        <Bell size={16} />
      </button>
    </div>
  )
}
