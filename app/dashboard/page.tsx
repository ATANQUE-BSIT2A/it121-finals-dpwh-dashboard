import AppLayout from '@/components/AppLayout'
import KpiCards from '@/components/dashboard/KpiCards'
import BudgetByRegionChart from '@/components/dashboard/BudgetByRegionChart'
import StatusDonutChart from '@/components/dashboard/StatusDonutChart'
import ProjectsByYearChart from '@/components/dashboard/ProjectsByYearChart'
import RecentProjectsTable from '@/components/dashboard/RecentProjectsTable'
import { supabase } from '@/lib/supabase'

export const revalidate = 300

export default async function DashboardPage() {
  const [
    { count: totalCount },
    { data: budgetByRegionAgg },
    { data: statusAgg },
    { data: yearAgg },
    { data: budgetSumAgg },
    { data: recentData },
  ] = await Promise.all([
    supabase.from('dpwh_projects').select('*', { count: 'exact', head: true }),
    supabase.from('dpwh_projects')
      .select('region, total:budget.sum()')
      .not('region', 'is', null),
    supabase.from('dpwh_projects')
      .select('status, count:contract_id.count()')
      .not('status', 'is', null),
    supabase.from('dpwh_projects')
      .select('infra_year, count:contract_id.count(), budget:budget.sum()')
      .not('infra_year', 'is', null),
    supabase.from('dpwh_projects')
      .select('total:budget.sum()'),
    supabase.from('dpwh_projects')
      .select('contract_id, description, region, category, budget, status, progress')
      .order('start_date', { ascending: false })
      .limit(10),
  ])

  const budgetByRegion = (budgetByRegionAgg || [])
    .map((r: any) => ({ region: r.region, total: Number(r.total || 0) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  const statusMap: Record<string, number> = {}
  for (const row of statusAgg || []) {
    const s = row.status || 'Unknown'
    statusMap[s] = Number(row.count || 0)
  }
  const byStatus = Object.entries(statusMap).map(([name, value]) => ({ name, value }))

  const byYear = (yearAgg || [])
    .map((row: any) => ({
      year: row.infra_year || 'Unknown',
      count: Number(row.count || 0),
      budget: Number(row.budget || 0),
    }))
    .sort((a, b) => a.year.localeCompare(b.year))

  const totalBudget = Number(budgetSumAgg?.[0]?.total || 0)
  const completedCount = statusMap['Completed'] || 0
  const ongoingCount = statusMap['On-Going'] || statusMap['On Going'] || 0

  return (
    <AppLayout title="Infrastructure Dashboard">
      <KpiCards
        total={totalCount || 0}
        totalBudget={totalBudget}
        completed={completedCount}
        ongoing={ongoingCount}
      />

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div className="card-elevated">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>
            Budget by Region (Top 10)
          </h3>
          <BudgetByRegionChart data={budgetByRegion} />
        </div>
        <div className="card-elevated">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>
            Projects by Status
          </h3>
          <StatusDonutChart data={byStatus} />
        </div>
      </div>

      {/* Year chart */}
      <div className="card-elevated" style={{ marginTop: '1rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>
          Projects by Year
        </h3>
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
