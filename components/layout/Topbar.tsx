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
    <div className="h-16 bg-bg-secondary border-b border-white/10 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-heading font-semibold text-white">
          Infrastructure Dashboard
        </h2>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-sm text-text-secondary">{today}</span>
        <button className="p-2 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-white transition-colors">
          <Search size={20} />
        </button>
        <button className="p-2 rounded-lg hover:bg-bg-hover text-text-secondary hover:text-white transition-colors">
          <Bell size={20} />
        </button>
      </div>
    </div>
  );
}
