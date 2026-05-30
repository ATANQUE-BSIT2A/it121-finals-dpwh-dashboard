'use client';

import { Search, Bell } from 'lucide-react';

export default function Topbar() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="glass-strong sticky top-0 z-30 px-6 py-3 flex items-center justify-between" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
      <h2 className="text-xl font-heading font-semibold text-white">Infrastructure Dashboard</h2>
      <div className="flex items-center gap-6">
        <span className="text-sm text-white/50">{today}</span>
        <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
          <Search size={20} />
        </button>
        <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
}
