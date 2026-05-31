'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { LayoutDashboard, FolderOpen, BarChart2, Map, Info } from 'lucide-react'

const links = [
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/projects',  label: 'Projects',   icon: FolderOpen },
  { href: '/analytics', label: 'Analytics',  icon: BarChart2 },
  { href: '/map',       label: 'Map View',   icon: Map },
  { href: '/about',     label: 'About',      icon: Info },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <nav className="sidebar">
      {/* Logo */}
      <div style={{ padding: '1rem', borderBottom: '1px solid #21262d', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Image
          src="/logos/DPWH.png"
          alt="DPWH"
          width={100}
          height={100}
          style={{ objectFit: 'contain', flexShrink: 0 }}
          priority
        />
        <div>
          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#e6edf3', lineHeight: 1.2 }}>DPWH</div>
          <div style={{ fontSize: '0.8rem', color: '#8b949e', lineHeight: 1.2 }}>Damo Project Waay Human Dashboard</div>
        </div>
      </div>

      {/* Nav links */}
      <div style={{ padding: '0.75rem 0.5rem', flex: 1 }}>
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '0.55rem 0.75rem', borderRadius: 8, marginBottom: 2,
                background: active ? 'rgba(56,139,253,0.15)' : 'transparent',
                color: active ? '#58a6ff' : '#8b949e',
                fontSize: '0.875rem', fontWeight: active ? 600 : 400,
                transition: 'all 0.15s', cursor: 'pointer',
                border: active ? '1px solid rgba(56,139,253,0.2)' : '1px solid transparent',
              }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = '#21262d'; (e.currentTarget as HTMLElement).style.color = '#e6edf3' }}}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#8b949e' }}}
              >
                <Icon size={16} />
                <span>{label}</span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #21262d', fontSize: '0.7rem', color: '#484f58' }}>
        Data from transparency.dpwh.gov.ph
      </div>
    </nav>
  )
}
