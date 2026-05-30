'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { getProjectsByCategory, getTopContractors } from '@/lib/queries';
import { formatCurrency } from '@/lib/utils';

export default function AnalyticsPage() {
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topContractors, setTopContractors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [categories, contractors] = await Promise.all([
        getProjectsByCategory(),
        getTopContractors(10),
      ]);
      setCategoryData(categories);
      setTopContractors(contractors);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col main-content">
        <Topbar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-5">
              <h3 className="text-base font-semibold text-white mb-4">Projects by Category</h3>
              {loading ? (
                <div className="h-80 flex items-center justify-center text-white/50">Loading...</div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis dataKey="category" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.55)' }} angle={-45} textAnchor="end" height={80} />
                      <YAxis tick={{ fontSize: 12, fill: 'rgba(255,255,255,0.55)' }} />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(10,14,22,0.90)',
                          backdropFilter: 'blur(16px)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: '10px',
                          color: '#fff'
                        }}
                      />
                      <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="glass-card p-5">
              <h3 className="text-base font-semibold text-white mb-4">Top Contractors</h3>
              {loading ? (
                <div className="h-80 flex items-center justify-center text-white/50">Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase tracking-wider">Contractor</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase tracking-wider">Projects</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase tracking-wider">Total Budget</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase tracking-wider">Avg Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {topContractors.map((contractor) => (
                        <tr
                          key={contractor.contractor}
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                        >
                          <td className="py-3 px-4 text-sm text-white/80">{contractor.contractor}</td>
                          <td className="py-3 px-4 text-sm text-white/80">{contractor.count}</td>
                          <td className="py-3 px-4 text-sm text-white/80">{formatCurrency(contractor.totalBudget)}</td>
                          <td className="py-3 px-4 text-sm text-white/80">{contractor.avgProgress.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
