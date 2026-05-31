import AppLayout from '@/components/AppLayout'
import KpiCards from '@/components/dashboard/KpiCards'
import BudgetByRegionChart from '@/components/dashboard/BudgetByRegionChart'
import StatusDonutChart from '@/components/dashboard/StatusDonutChart'
import ProjectsByYearChart from '@/components/dashboard/ProjectsByYearChart'
import RecentProjectsTable from '@/components/dashboard/RecentProjectsTable'
import { supabase } from '@/lib/supabase'

export const revalidate = 300

export default async function DashboardPage() {
  const [{ count: totalCount }, { data: statsData }, { data: recentData }] = await Promise.all([
    supabase.from('dpwh_projects').select('*', { count: 'estimated', head: true }),
    supabase.from('dpwh_projects')
      .select('contract_id, region, status, budget, infra_year')
      .limit(5000),
    supabase.from('dpwh_projects')
      .select('contract_id, description, region, category, budget, status, progress')
      .order('start_date', { ascending: false })
      .limit(10),
  ])

  // Calculate stats
  const budgetByRegion: Record<string, number> = {}
  const statusCounts: Record<string, number> = {}
  const yearStats: Record<string, { count: number, budget: number }> = {}
  let totalBudget = 0

  for (const p of statsData || []) {
    const b = p.budget || 0
    totalBudget += b

    if (p.region) {
      budgetByRegion[p.region] = (budgetByRegion[p.region] || 0) + b
    }
    if (p.status) {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1
    }
    if (p.infra_year) {
      const y = p.infra_year
      if (!yearStats[y]) yearStats[y] = { count: 0, budget: 0 }
      yearStats[y].count += 1
      yearStats[y].budget += b
    }
  }

  const budgetByRegionList = Object.entries(budgetByRegion)
    .map(([region, total]) => ({ region, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  const byStatus = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
  const byYear = Object.entries(yearStats)
    .map(([year, { count, budget }]) => ({ year, count, budget }))
    .sort((a, b) => a.year.localeCompare(b.year))

  const completed = statusCounts['Completed'] || 0
  const ongoing = (statusCounts['On-Going'] || 0) + (statusCounts['On Going'] || 0)

  return (
    <AppLayout title="Infrastructure Dashboard">
      <KpiCards total={totalCount || 0} totalBudget={totalBudget} completed={completed} ongoing={ongoing} />

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div className="card-elevated">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>Budget by Region (Top 10)</h3>
          <BudgetByRegionChart data={budgetByRegionList} />
        </div>
        <div className="card-elevated">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>Projects by Status</h3>
          <StatusDonutChart data={byStatus} />
        </div>
      </div>

      {/* Year chart */}
      <div className="card-elevated" style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>Projects by Year</h3>
        <ProjectsByYearChart data={byYear} />
      </div>

      {/* Recent projects */}
      <div className="card-elevated" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3' }}>Recent Projects</h3>
          <a href="/projects" style={{ fontSize: '0.8rem', color: '#58a6ff', textDecoration: 'none' }}>View all →</a>
        </div>
        <RecentProjectsTable data={recentData || []} />
      </div>
    </AppLayout>
  )
}
