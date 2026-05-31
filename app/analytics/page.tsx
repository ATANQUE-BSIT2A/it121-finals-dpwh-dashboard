'use client';

import AppLayout from '@/components/AppLayout'
import { formatPeso } from '@/lib/utils'
import { getDashboardStats, getBudgetByRegion, getProjectsByStatus, getProjectsByYear, getRegions } from '@/lib/queries'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useEffect, useState } from 'react'

const COLORS = ['#3fb950', '#58a6ff', '#f85149', '#d29922']

async function fetchAllRows(selectQuery: any) {
  const allData: any[] = []
  let page = 0
  const pageSize = 1000
  
  while (true) {
    const { data, error } = await selectQuery.range(page * pageSize, (page + 1) * pageSize - 1)
    if (error) {
      console.error('Error fetching all rows:', error)
      break
    }
    if (!data || data.length === 0) break
    allData.push(...data)
    if (data.length < pageSize) break
    page++
  }
  
  return allData
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [budgetByRegion, setBudgetByRegion] = useState<any[]>([])
  const [byStatus, setByStatus] = useState<any[]>([])
  const [byYear, setByYear] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const regions = getRegions()

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      
      // Get all data
      const [
        statsData,
        budgetData,
        statusData,
        yearData,
        allProjects,
      ] = await Promise.all([
        getDashboardStats(),
        getBudgetByRegion(),
        getProjectsByStatus(),
        getProjectsByYear(),
        fetchAllRows(require('@/lib/supabase').supabase.from('dpwh_projects').select('region, status')),
      ])
      
      setStats(statsData)
      setBudgetByRegion(budgetData)
      setByStatus(statusData.map(s => ({ name: s.status, value: s.count })))
      setByYear(yearData)
      
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <AppLayout title="Analytics">
        <div className="card-elevated text-center p-8">
          <p style={{ color: '#8b949e' }}>Loading analytics...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Analytics">
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div className="card-elevated p-4">
          <h4 style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Projects</h4>
          <p style={{ color: '#e6edf3', fontSize: '1.5rem', fontWeight: 'bold' }}>{stats?.total?.toLocaleString() || 0}</p>
        </div>
        <div className="card-elevated p-4">
          <h4 style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Budget</h4>
          <p style={{ color: '#e6edf3', fontSize: '1.5rem', fontWeight: 'bold' }}>{formatPeso(stats?.totalBudget || 0)}</p>
        </div>
        <div className="card-elevated p-4">
          <h4 style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Completed</h4>
          <p style={{ color: '#3fb950', fontSize: '1.5rem', fontWeight: 'bold' }}>{stats?.completed?.toLocaleString() || 0}</p>
        </div>
        <div className="card-elevated p-4">
          <h4 style={{ color: '#8b949e', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Ongoing</h4>
          <p style={{ color: '#58a6ff', fontSize: '1.5rem', fontWeight: 'bold' }}>{stats?.ongoing?.toLocaleString() || 0}</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div className="card-elevated">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>
            Budget by Region (Top 10)
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetByRegion.map(b => ({ ...b, region: b.region.replace('Region ', 'R') }))} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#21262d" />
                <XAxis
                  type="number"
                  tick={{ fill: '#8b949e', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v >= 1e12 ? `₱${(v/1e12).toFixed(0)}T` : v >= 1e9 ? `₱${(v/1e9).toFixed(0)}B` : `₱${(v/1e6).toFixed(0)}M`}
                />
                <YAxis
                  type="category"
                  dataKey="region"
                  tick={{ fill: '#8b949e', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                />
                <Tooltip
                  formatter={(v: any) => {
                    const num = Number(v)
                    return [`₱${(num/1e9).toFixed(2)}B`, 'Budget']
                  }}
                  contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 12 }}
                />
                <Bar dataKey="totalBudget" fill="#1f6feb" radius={[0, 4, 4, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card-elevated">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>
            Projects by Status
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {byStatus.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 12 }}
                  formatter={(v: any, name: any) => [Number(v).toLocaleString(), String(name)]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Projects by Year */}
      <div className="card-elevated">
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>
          Projects by Year
        </h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byYear} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="year" tick={{ fill: '#8b949e', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#8b949e', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#1c2128', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', fontSize: 12 }}
                formatter={(v: any) => [Number(v).toLocaleString(), 'Projects']}
              />
              <Bar dataKey="count" fill="#1f6feb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppLayout>
  )
}
