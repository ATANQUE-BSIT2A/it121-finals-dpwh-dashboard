import AppLayout from '@/components/AppLayout'
import KpiCards from '@/components/dashboard/KpiCards'
import BudgetByRegionChart from '@/components/dashboard/BudgetByRegionChart'
import StatusDonutChart from '@/components/dashboard/StatusDonutChart'
import ProjectsByYearChart from '@/components/dashboard/ProjectsByYearChart'
import RecentProjectsTable from '@/components/dashboard/RecentProjectsTable'
import { supabase } from '@/lib/supabase'

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

export default async function DashboardPage() {
  // Run all queries in parallel
  const [
    { count: totalCount },
    budgetData,
    statusData,
    yearData,
    { data: recentData },
  ] = await Promise.all([
    supabase.from('dpwh_projects').select('*', { count: 'exact', head: true }),
    fetchAllRows(supabase.from('dpwh_projects').select('region, budget').not('region', 'is', null)),
    fetchAllRows(supabase.from('dpwh_projects').select('status').not('status', 'is', null)),
    fetchAllRows(supabase.from('dpwh_projects').select('infra_year, budget').not('infra_year', 'is', null)),
    supabase.from('dpwh_projects')
      .select('contract_id, description, region, category, budget, status, progress')
      .order('start_date', { ascending: false })
      .limit(10),
  ])

  // Aggregate budget by region
  const regionMap: Record<string, number> = {}
  for (const row of budgetData) {
    if (!row.region) continue
    regionMap[row.region] = (regionMap[row.region] || 0) + Number(row.budget || 0)
  }
  const budgetByRegion = Object.entries(regionMap)
    .map(([region, total]) => ({ region: region.replace('Region ', 'R'), total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  // Aggregate by status
  const statusMap: Record<string, number> = {}
  for (const row of statusData) {
    const s = row.status || 'Unknown'
    statusMap[s] = (statusMap[s] || 0) + 1
  }
  const byStatus = Object.entries(statusMap).map(([name, value]) => ({ name, value }))

  // Aggregate by year
  const yearMap: Record<string, { count: number; budget: number }> = {}
  for (const row of yearData) {
    const y = row.infra_year || 'Unknown'
    if (!yearMap[y]) yearMap[y] = { count: 0, budget: 0 }
    yearMap[y].count += 1
    yearMap[y].budget += Number(row.budget || 0)
  }
  const byYear = Object.entries(yearMap)
    .map(([year, v]) => ({ year, count: v.count, budget: v.budget }))
    .sort((a, b) => a.year.localeCompare(b.year))

  // KPI numbers
  const totalBudget = budgetData.reduce((s, r) => s + Number(r.budget || 0), 0)
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
