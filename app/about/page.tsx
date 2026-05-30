'use client';

import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col main-content">
        <Topbar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="glass-card p-8 max-w-3xl">
            <h2 className="text-2xl font-heading font-semibold text-white mb-6">About DPWH Dashboard</h2>

            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-heading font-semibold text-white mb-2">Project Overview</h3>
                <p className="text-white/60 leading-relaxed">
                  This dashboard provides transparency into infrastructure projects managed by the
                  Department of Public Works and Highways (DPWH) in the Philippines. It displays
                  real-time data on project statuses, budgets, and progress across all regions.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-heading font-semibold text-white mb-2">Data Source</h3>
                <p className="text-white/60 leading-relaxed">
                  Data is sourced from the DPWH Transparency Portal and processed to provide
                  meaningful insights into government infrastructure spending.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-heading font-semibold text-white mb-2">Technology Stack</h3>
                <ul className="text-white/60 space-y-1">
                  <li>• Next.js with TypeScript</li>
                  <li>• Tailwind CSS for styling</li>
                  <li>• Supabase as database</li>
                  <li>• Recharts for data visualization</li>
                  <li>• Deployed on Vercel</li>
                </ul>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
