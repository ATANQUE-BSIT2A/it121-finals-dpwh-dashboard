'use client';

import { useEffect, useState } from 'react';
import { Layout, DollarSign, CheckCircle, Clock, TrendingUp, MapPin } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';

import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import KpiCard from '@/components/dashboard/KpiCard';
import Badge from '@/components/ui/Badge';
import {
  getDashboardStats,
  getBudgetByRegion,
  getProjectsByStatus,
  getProjectsByCategory,
  getProjectsByYear,
  getProjects,
} from '@/lib/queries';
import { formatCurrency, formatNumber, truncate } from '@/lib/utils';
import type { Project } from '@/types';

const STATUS_COLORS = {
  Completed: '#22C55E',
  'On-Going': '#3B82F6',
  Suspended: '#F59E0B',
  Terminated: '#EF4444',
};

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [budgetByRegion, setBudgetByRegion] = useState<any[]>([]);
  const [projectsByStatus, setProjectsByStatus] = useState<any[]>([]);
  const [projectsByCategory, setProjectsByCategory] = useState<any[]>([]);
  const [projectsByYear, setProjectsByYear] = useState<any[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [statsData, budgetData, statusData, categoryData, yearData, projectsData] = await Promise.all([
        getDashboardStats(),
        getBudgetByRegion(),
        getProjectsByStatus(),
        getProjectsByCategory(),
        getProjectsByYear(),
        getProjects({ perPage: 8, sortBy: 'start_date', sortDir: 'desc' }),
      ]);

      setStats(statsData);
      setBudgetByRegion(budgetData);
      setProjectsByStatus(statusData);
      setProjectsByCategory(categoryData);
      setProjectsByYear(yearData);
      setRecentProjects(projectsData.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-8 overflow-y-auto">
          {loading ? (
            <div className="text-center text-text-muted py-20">Loading dashboard...</div>
          ) : (
            <>
              {/* KPI Cards */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
              >
                <KpiCard
                  icon={Layout}
                  label="Total Projects"
                  value={stats.total}
                  color="bg-accent-blue"
                  delay={0.05}
                />
                <KpiCard
                  icon={DollarSign}
                  label="Total Budget"
                  value={Math.floor(stats.totalBudget / 1000000000)}
                  prefix="₱"
                  suffix="B"
                  color="bg-accent-gold"
                  delay={0.1}
                />
                <KpiCard
                  icon={CheckCircle}
                  label="Completed"
                  value={stats.completed}
                  color="bg-status-completed"
                  delay={0.15}
                />
                <KpiCard
                  icon={Clock}
                  label="On-Going"
                  value={stats.ongoing}
                  color="bg-status-ongoing"
                  delay={0.2}
                />
                <KpiCard
                  icon={TrendingUp}
                  label="Avg Progress"
                  value={Math.floor(stats.avgProgress)}
                  suffix="%"
                  color="bg-purple-600"
                  delay={0.25}
                />
              </motion.div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="glass-card p-6">
                  <h3 className="text-lg font-heading font-semibold text-white mb-6">Budget by Region</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={budgetByRegion} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="region"
                          type="category"
                          width={150}
                          tick={{ fontSize: 12, fill: '#9CA3AF' }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#161A22', border: '1px solid #374151', borderRadius: '8px' }}
                          itemStyle={{ color: '#F9FAFB' }}
                          formatter={(value: any) => formatCurrency(value as number)}
                        />
                        <Bar
                          dataKey="totalBudget"
                          fill="#3B82F6"
                          radius={[0, 4, 4, 0]}
                          isAnimationActive
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="text-lg font-heading font-semibold text-white mb-6">Projects by Status</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={projectsByStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          {projectsByStatus.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || '#6B7280'}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#161A22', border: '1px solid #374151', borderRadius: '8px' }}
                          itemStyle={{ color: '#F9FAFB' }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Projects by Category */}
              <div className="glass-card p-6 mb-8">
                <h3 className="text-lg font-heading font-semibold text-white mb-6">Projects by Category</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectsByCategory.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                      <XAxis
                        dataKey="category"
                        tick={{ fontSize: 11, fill: '#9CA3AF' }}
                        tickLine={false}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: '#9CA3AF' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#161A22', border: '1px solid #374151', borderRadius: '8px' }}
                        itemStyle={{ color: '#F9FAFB' }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#1A56DB"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Projects by Year */}
              <div className="glass-card p-6 mb-8">
                <h3 className="text-lg font-heading font-semibold text-white mb-6">Projects Over Time</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectsByYear}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 12, fill: '#9CA3AF' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: '#9CA3AF' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#161A22', border: '1px solid #374151', borderRadius: '8px' }}
                        itemStyle={{ color: '#F9FAFB' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#3B82F6"
                        fillOpacity={1}
                        fill="url(#colorCount)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Projects */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-heading font-semibold text-white">Recent Projects</h3>
                  <a href="/projects" className="text-sm text-accent-blue hover:text-accent-blue-light transition-colors">
                    View All Projects →
                  </a>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">Contract ID</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">Description</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">Region</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">Category</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">Budget</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {recentProjects.map((project, index) => (
                        <tr key={project.contract_id} className="hover:bg-bg-hover/50 transition-colors">
                          <td className="py-3 px-4 font-mono text-sm text-accent-gold">{project.contract_id}</td>
                          <td className="py-3 px-4 text-sm text-text-primary max-w-xs truncate" title={project.description}>{truncate(project.description, 50)}</td>
                          <td className="py-3 px-4 text-sm text-text-secondary">{project.region}</td>
                          <td className="py-3 px-4 text-sm text-text-secondary">{project.category}</td>
                          <td className="py-3 px-4 text-sm text-text-primary">{formatCurrency(project.budget)}</td>
                          <td className="py-3 px-4"><Badge status={project.status} /></td>
                          <td className="py-3 px-4">
                            <div className="w-32">
                              <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${Math.min(project.progress || 0, 100)}%`,
                                    backgroundColor:
                                      project.status === 'Completed' ? '#22C55E' :
                                      project.status === 'On-Going' ? '#3B82F6' : '#F59E0B',
                                  }}
                                />
                              </div>
                              <p className="text-xs text-text-muted mt-1">{Math.round(project.progress || 0)}%</p>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
