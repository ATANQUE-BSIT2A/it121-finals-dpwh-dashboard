'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import Badge from '@/components/ui/Badge';
import { getProjects } from '@/lib/queries';
import { formatCurrency, truncate } from '@/lib/utils';
import type { Project } from '@/types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getProjects({ perPage: 20 });
      setProjects(data.data);
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
          <div className="glass-card overflow-hidden p-0">
            <div className="p-5 border-b border-white/10">
              <h2 className="text-xl font-heading font-semibold text-white">Projects</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase tracking-wider">Contract ID</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase tracking-wider">Description</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase tracking-wider">Region</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase tracking-wider">Category</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase tracking-wider">Budget</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-white/40 uppercase tracking-wider">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-white/50">Loading projects...</td>
                    </tr>
                  ) : (
                    projects.map((project) => (
                      <tr
                        key={project.contract_id}
                        className="cursor-pointer transition-colors duration-150"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td className="py-3 px-4 font-mono text-sm text-yellow-400">{project.contract_id}</td>
                        <td className="py-3 px-4 text-sm text-white/80 max-w-xs truncate" title={project.description}>{truncate(project.description, 50)}</td>
                        <td className="py-3 px-4 text-sm text-white/60">{project.region}</td>
                        <td className="py-3 px-4 text-sm text-white/60">{project.category}</td>
                        <td className="py-3 px-4"><Badge status={project.status} /></td>
                        <td className="py-3 px-4 text-sm text-white/80">{formatCurrency(project.budget)}</td>
                        <td className="py-3 px-4">
                          <div className="w-32">
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${Math.min(project.progress || 0, 100)}%`,
                                  backgroundColor:
                                    project.status === 'Completed' ? '#86efac' :
                                    project.status === 'On-Going' ? '#93c5fd' : '#fcd34d',
                                }}
                              />
                            </div>
                            <p className="text-xs text-white/40 mt-1">{Math.round(project.progress || 0)}%</p>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
