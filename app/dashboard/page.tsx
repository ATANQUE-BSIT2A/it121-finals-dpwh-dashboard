'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

// Types
type Project = {
  contract_id: string;
  description: string;
  category: string | null;
  status: string | null;
  budget: number | null;
  progress: number | null;
  region: string | null;
  start_date: string | null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<{
    total: number;
    totalBudget: number;
    completed: number;
    ongoing: number;
    avgProgress: number;
  } | null>(null);

  const [budgetByRegion, setBudgetByRegion] = useState<{ region: string; totalBudget: number }[]>([]);
  const [projectsByStatus, setProjectsByStatus] = useState<{ status: string; count: number }[]>([]);
  const [projectsByCategory, setProjectsByCategory] = useState<{ category: string; count: number; totalBudget: number }[]>([]);
  const [projectsByYear, setProjectsByYear] = useState<{ year: string; count: number; totalBudget: number }[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Dashboard Stats
      const [
        { count: totalCount },
        { data: budgetData },
        { count: completedCount },
        { count: ongoingCount },
        { data: progressData },
      ] = await Promise.all([
        supabase.from('dpwh_projects').select('*', { count: 'exact', head: true }),
        supabase.from('dpwh_projects').select('budget'),
        supabase.from('dpwh_projects').select('*', { count: 'exact', head: true }).eq('status', 'Completed'),
        supabase.from('dpwh_projects').select('*', { count: 'exact', head: true }).eq('status', 'On-Going'),
        supabase.from('dpwh_projects').select('progress'),
      ]);

      const totalBudget = budgetData?.reduce((sum, p) => sum + (p.budget || 0), 0) || 0;
      const validProgress = progressData?.filter(p => p.progress !== null) || [];
      const avgProgress = validProgress.length > 0
        ? validProgress.reduce((sum, p) => sum + (p.progress as number), 0) / validProgress.length
        : 0;

      // Budget by Region
      const { data: regionBudgetData } = await supabase
        .from('dpwh_projects')
        .select('region, budget');

      const regionMap: Record<string, number> = {};
      (regionBudgetData || []).forEach(item => {
        if (item.region && item.budget) {
          regionMap[item.region] = (regionMap[item.region] || 0) + item.budget;
        }
      });
      const regionBudgetArray = Object.entries(regionMap)
        .map(([region, totalBudget]) => ({ region, totalBudget }))
        .sort((a, b) => b.totalBudget - a.totalBudget)
        .slice(0, 10);

      // Projects by Status
      const { data: statusData } = await supabase.from('dpwh_projects').select('status');
      const statusMap: Record<string, number> = {};
      (statusData || []).forEach(item => {
        if (item.status) statusMap[item.status] = (statusMap[item.status] || 0) + 1;
      });
      const statusArray = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

      // Projects by Category
      const { data: categoryData } = await supabase.from('dpwh_projects').select('category, budget');
      const categoryMap: Record<string, { count: number; totalBudget: number }> = {};
      (categoryData || []).forEach(item => {
        if (item.category) {
          if (!categoryMap[item.category]) {
            categoryMap[item.category] = { count: 0, totalBudget: 0 };
          }
          categoryMap[item.category].count += 1;
          categoryMap[item.category].totalBudget += item.budget || 0;
        }
      });
      const categoryArray = Object.entries(categoryMap).map(([category, data]) => ({
        category,
        count: data.count,
        totalBudget: data.totalBudget,
      }));

      // Projects by Year
      const { data: yearData } = await supabase.from('dpwh_projects').select('infra_year, budget');
      const yearMap: Record<string, { count: number; totalBudget: number }> = {};
      (yearData || []).forEach(item => {
        if (item.infra_year) {
          if (!yearMap[item.infra_year]) {
            yearMap[item.infra_year] = { count: 0, totalBudget: 0 };
          }
          yearMap[item.infra_year].count += 1;
          yearMap[item.infra_year].totalBudget += item.budget || 0;
        }
      });
      const yearArray = Object.entries(yearMap)
        .map(([year, data]) => ({ year, count: data.count, totalBudget: data.totalBudget }))
        .sort((a, b) => a.year.localeCompare(b.year));

      // Recent Projects
      const { data: recentData } = await supabase
        .from('dpwh_projects')
        .select('contract_id, description, region, category, budget, status, progress')
        .order('start_date', { ascending: false })
        .limit(10);

      setStats({
        total: totalCount || 0,
        totalBudget,
        completed: completedCount || 0,
        ongoing: ongoingCount || 0,
        avgProgress,
      });
      setBudgetByRegion(regionBudgetArray);
      setProjectsByStatus(statusArray);
      setProjectsByCategory(categoryArray);
      setProjectsByYear(yearArray);
      setRecentProjects(recentData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const STATUS_COLORS: Record<string, string> = {
    Completed: '#86efac',
    'On-Going': '#93c5fd',
    Suspended: '#fcd34d',
    Terminated: '#fca5a5',
  };

  return (
    <div>
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
          Loading dashboard...
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="glass-card p-5 flex flex-col justify-between" style={{ minHeight: 130 }}>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginBottom: 8 }}>Total Projects</p>
              <p style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 700 }}>
                {stats?.total.toLocaleString() || '—'}
              </p>
            </div>
            <div className="glass-card p-5 flex flex-col justify-between" style={{ minHeight: 130 }}>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginBottom: 8 }}>Total Budget</p>
              <p style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 700 }}>
                {stats ? `₱${(stats.totalBudget / 1000000000).toFixed(2)}B` : '—'}
              </p>
            </div>
            <div className="glass-card p-5 flex flex-col justify-between" style={{ minHeight: 130 }}>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginBottom: 8 }}>Completed</p>
              <p style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 700 }}>
                {stats?.completed.toLocaleString() || '—'}
              </p>
            </div>
            <div className="glass-card p-5 flex flex-col justify-between" style={{ minHeight: 130 }}>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginBottom: 8 }}>On-Going</p>
              <p style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 700 }}>
                {stats?.ongoing.toLocaleString() || '—'}
              </p>
            </div>
            <div className="glass-card p-5 flex flex-col justify-between" style={{ minHeight: 130 }}>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginBottom: 8 }}>Avg Progress</p>
              <p style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 700 }}>
                {stats ? `${Math.round(stats.avgProgress)}%` : '—'}
              </p>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="glass-card p-5">
              <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Budget by Region</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetByRegion} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="region"
                      type="category"
                      width={150}
                      tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(255,255,255,0.10)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(10,14,22,0.92)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 10,
                        color: '#fff',
                        fontSize: 13,
                      }}
                      cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                      formatter={(value: number) => {
                        if (value >= 1000000000) {
                          return `₱${(value / 1000000000).toFixed(2)}B`;
                        } else if (value >= 1000000) {
                          return `₱${(value / 1000000).toFixed(2)}M`;
                        } else {
                          return `₱${value.toLocaleString()}`;
                        }
                      }}
                    />
                    <Bar dataKey="totalBudget" fill="#3B82F6" radius={[0, 4, 4, 0]} isAnimationActive />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Projects by Status</h3>
              <div style={{ width: '100%', height: 300 }}>
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
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#64748b'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(10,14,22,0.92)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 10,
                        color: '#fff',
                      }}
                    />
                    <Legend
                      formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Projects by Category */}
          <div className="glass-card p-5 mb-6">
            <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Projects by Category</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectsByCategory.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="category"
                    tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.10)' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(10,14,22,0.92)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 10,
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Projects by Year */}
          <div className="glass-card p-5 mb-6">
            <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Projects Over Time</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectsByYear}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.10)' }}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(10,14,22,0.92)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 10,
                      color: '#fff',
                    }}
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
          <div className="glass-card overflow-hidden">
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3 style={{ color: '#fff', fontWeight: 600, fontSize: 15, margin: 0 }}>Recent Projects</h3>
              <a
                href="/projects"
                style={{
                  color: 'rgba(99,179,237,0.8)',
                  fontSize: 13,
                  textDecoration: 'none',
                }}
              >
                View All →
              </a>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {['Contract ID', 'Description', 'Region', 'Category', 'Budget', 'Status', 'Progress'].map((col) => (
                      <th
                        key={col}
                        style={{
                          padding: '10px 16px',
                          textAlign: 'left',
                          color: 'rgba(255,255,255,0.45)',
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          borderBottom: '1px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.map((project) => (
                    <tr
                      key={project.contract_id}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td
                        style={{
                          padding: '10px 16px',
                          color: 'rgba(255,255,255,0.50)',
                          fontFamily: 'monospace',
                          fontSize: 12,
                        }}
                      >
                        {project.contract_id}
                      </td>
                      <td style={{ padding: '10px 16px', color: 'rgba(255,255,255,0.85)', maxWidth: 260 }}>
                        <span
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                          }}
                        >
                          {project.description}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '10px 16px',
                          color: 'rgba(255,255,255,0.55)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {project.region}
                      </td>
                      <td
                        style={{
                          padding: '10px 16px',
                          color: 'rgba(255,255,255,0.55)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {project.category}
                      </td>
                      <td style={{ padding: '10px 16px', color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap' }}>
                        ₱{Number(project.budget).toLocaleString('en-PH', { maximumFractionDigits: 0 })}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            fontSize: 12,
                            fontWeight: 600,
                            background: project.status === 'Completed'
                              ? 'rgba(34,197,94,0.15)'
                              : project.status === 'On-Going'
                              ? 'rgba(59,130,246,0.15)'
                              : 'rgba(245,158,11,0.15)',
                            border: project.status === 'Completed'
                              ? '1px solid rgba(34,197,94,0.35)'
                              : project.status === 'On-Going'
                              ? '1px solid rgba(59,130,246,0.35)'
                              : '1px solid rgba(245,158,11,0.35)',
                            color: project.status === 'Completed'
                              ? '#86efac'
                              : project.status === 'On-Going'
                              ? '#93c5fd'
                              : '#fcd34d',
                          }}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', minWidth: 100 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div
                            style={{
                              flex: 1,
                              height: 5,
                              background: 'rgba(255,255,255,0.08)',
                              borderRadius: 3,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${project.progress || 0}%`,
                                background: (project.progress || 0) >= 100
                                  ? '#22c55e'
                                  : (project.progress || 0) >= 50
                                  ? '#3b82f6'
                                  : '#f59e0b',
                                borderRadius: 3,
                                transition: 'width 0.6s ease',
                              }}
                            />
                          </div>
                          <span
                            style={{
                              color: 'rgba(255,255,255,0.50)',
                              fontSize: 12,
                              minWidth: 28,
                            }}
                          >
                            {project.progress || 0}%
                          </span>
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
    </div>
  );
}
