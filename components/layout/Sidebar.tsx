'use client';

import { Home, FileText, BarChart3, Map, Info } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const navItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: FileText, label: 'Projects', href: '/projects' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Map, label: 'Map View', href: '/map' },
  { icon: Info, label: 'About', href: '/about' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar-desktop glass-strong fixed left-0 top-0 h-full z-40 transition-all duration-300" style={{ borderRadius: 0, borderLeft: 'none', borderTop: 'none', borderBottom: 'none' }}>
      <div className="p-6 mb-6 flex items-center gap-3">
        <Image src="/logos/DPWH.png" alt="DPWH Logo" width={48} height={48} />
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">DPWH</h1>
          <p className="text-xs text-white/40">Infrastructure Dashboard</p>
        </div>
      </div>
      <nav className="px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'glass-accent'
                  : 'glass-subtle hover:glass-card'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-blue-400' : 'text-white/70'} />
              <span className="nav-label text-sm font-medium" style={{ color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)' }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
