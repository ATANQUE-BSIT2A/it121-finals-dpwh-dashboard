'use client';

import { Search, Bell } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Topbar() {
  const router = useRouter();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, title: 'New project added', message: 'A new infrastructure project has been registered in NCR', read: false, date: new Date().toLocaleDateString() },
    { id: 2, title: 'Project status updated', message: 'Project in Region III is now 75% complete', read: false, date: new Date(Date.now() - 86400000).toLocaleDateString() },
    { id: 3, title: 'Budget approved', message: 'Budget for Region IV-A project has been approved', read: true, date: new Date(Date.now() - 172800000).toLocaleDateString() },
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearchClick = () => {
    router.push('/projects');
  };

  return (
    <header className="glass-strong sticky top-0 z-30 px-6 py-3 flex items-center justify-between" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
      <h2 className="text-xl font-heading font-semibold text-white">Infrastructure Dashboard</h2>
      <div className="flex items-center gap-6 relative">
        <span className="text-sm text-white/50">{today}</span>
        <button
          className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          onClick={handleSearchClick}
        >
          <Search size={20} />
        </button>
        <div className="relative">
          <button
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#0d1117] border border-[#30363d] rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-[#30363d]">
                <h3 className="text-white font-semibold">Notifications</h3>
              </div>
              <div className="divide-y divide-[#30363d]">
                {notifications.map(n => (
                  <div key={n.id} className={`p-4 ${n.read ? 'opacity-60' : 'opacity-100'}`}>
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium text-white">{n.title}</h4>
                      <span className="text-xs text-gray-500">{n.date}</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
