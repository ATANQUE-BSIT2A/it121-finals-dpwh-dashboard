'use client';

import { Home, FileText, BarChart3, Map, Info } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    <div className="w-60 bg-bg-secondary border-r border-white/10 p-4 flex flex-col gap-2">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-white">DPWH</h1>
        <p className="text-xs text-text-muted">Infrastructure Dashboard</p>
      </div>
      <nav className="flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
