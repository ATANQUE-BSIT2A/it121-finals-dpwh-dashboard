'use client';

import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

export default function MapPage() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col main-content">
        <Topbar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="glass-card p-10 h-full flex flex-col items-center justify-center">
            <div className="text-6xl mb-6">🗺️</div>
            <h2 className="text-2xl font-heading font-semibold text-white mb-3">Map View</h2>
            <p className="text-white/50 max-w-md text-center">
              Map visualization will be added here. Displaying project locations using latitude and longitude coordinates.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
