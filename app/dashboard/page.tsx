import AppLayout from '@/components/AppLayout'
import KpiCards from '@/components/dashboard/KpiCards'
import BudgetByRegionChart from '@/components/dashboard/BudgetByRegionChart'
import StatusDonutChart from '@/components/dashboard/StatusDonutChart'
import ProjectsByYearChart from '@/components/dashboard/ProjectsByYearChart'
import RecentProjectsTable from '@/components/dashboard/RecentProjectsTable'
import AnalyticsCategoryChart from '@/components/analytics/AnalyticsCategoryChart'
import AnalyticsProgressChart from '@/components/analytics/AnalyticsProgressChart'
import AnalyticsContractorsTable from '@/components/analytics/AnalyticsContractorsTable'
import { supabase } from '@/lib/supabase'
import { fetchAllRows, getTotalBudget, getStatusCounts, getYearStats, getBudgetByRegion, getProjectsByCategory } from '@/lib/queries'

export const revalidate = 300

export default async function DashboardPage() {
  // Master Fetch: Get core fields for ALL projects to ensure 100% consistency across all charts
  const allProjects = await fetchAllRows(
    supabase.from('dpwh_projects').select('region, status, budget, infra_year, category, progress, contractor')
  )

  const [
    { data: recentData },
  ] = await Promise.all([
    supabase.from('dpwh_projects')
      .select('contract_id, description, region, category, budget, status, progress')
      .order('infra_year', { ascending: false })
      .limit(10),
  ])

  // Aggregation logic in memory for 100% consistency
  const totalCount = allProjects.length
  let totalBudget = 0
  let completed = 0
  let ongoing = 0
  
  const budgetByRegionMap: Record<string, number> = {}
  const statusMap: Record<string, number> = {}
  const yearMap: Record<string, { count: number, totalBudget: number }> = {}
  const categoryMap: Record<string, { count: number, totalBudget: number }> = {}
  const progressBuckets = Array(10).fill(0)
  const contractorMap: Record<string, { count: number, totalBudget: number, totalProgress: number, progressCount: number }> = {}

  for (const p of allProjects) {
    const b = p.budget || 0
    totalBudget += b
    
    // Regions
    const r = p.region || 'Unknown'
    budgetByRegionMap[r] = (budgetByRegionMap[r] || 0) + b
    
    // Status
    const s = p.status || 'Unknown'
    statusMap[s] = (statusMap[s] || 0) + 1
    if (s === 'Completed') completed++
    if (s === 'On-Going') ongoing++
    
    // Years
    const y = p.infra_year || 'Unknown'
    if (!yearMap[y]) yearMap[y] = { count: 0, totalBudget: 0 }
    yearMap[y].count++
    yearMap[y].totalBudget += b
    
    // Category
    const c = p.category || 'Unknown'
    if (!categoryMap[c]) categoryMap[c] = { count: 0, totalBudget: 0 }
    categoryMap[c].count++
    categoryMap[c].totalBudget += b
    
    // Progress
    const prog = Math.max(0, Math.min(100, p.progress || 0))
    const bucket = Math.min(9, Math.floor(prog / 10))
    progressBuckets[bucket]++
    
    // Contractors
    const con = p.contractor || 'Unknown'
    if (!contractorMap[con]) contractorMap[con] = { count: 0, totalBudget: 0, totalProgress: 0, progressCount: 0 }
    contractorMap[con].count++
    contractorMap[con].totalBudget += b
    if (p.progress !== null) {
      contractorMap[con].totalProgress += p.progress
      contractorMap[con].progressCount++
    }
  }

  // Format data for charts
  const budgetByRegionList = Object.entries(budgetByRegionMap)
    .map(([region, total]) => ({ region, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  const byStatus = Object.entries(statusMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const byYear = Object.entries(yearMap)
    .map(([year, d]) => ({ year, count: d.count, totalBudget: d.totalBudget }))
    .sort((a, b) => a.year.localeCompare(b.year))

  const categoryData = Object.entries(categoryMap)
    .map(([category, d]) => ({ category, count: d.count, budget: d.totalBudget }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  const progressData = progressBuckets.map((count, i) => ({
    range: `${i*10}–${(i+1)*10}%`,
    count,
    min: i * 10
  }))

  const contractorData = Object.entries(contractorMap)
    .map(([contractor, d]) => ({
      contractor,
      count: d.count,
      budget: d.totalBudget,
      avgProgress: d.progressCount > 0 ? d.totalProgress / d.progressCount : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  return (
    <AppLayout title="Infrastructure Dashboard">
      <KpiCards total={totalCount} totalBudget={totalBudget} completed={completed} ongoing={ongoing} />

      {/* First Row: Budget & Status */}
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

      {/* Second Row: Projects by Year & Category */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div className="card-elevated" style={{ height: 450, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>Projects by Year</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <ProjectsByYearChart data={byYear} />
          </div>
        </div>
        <div className="card-elevated" style={{ height: 450, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#c8dbebff', marginBottom: '1rem' }}>Projects by Category</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <AnalyticsCategoryChart data={categoryData} />
          </div>
        </div>
      </div>

      {/* Third Row: Progress & Contractors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div className="card-elevated" style={{ height: 450, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>Progress Distribution</h3>
          <div style={{ flex: 1, minHeight: 0 }}>
            <AnalyticsProgressChart data={progressData} />
          </div>
        </div>
        <div className="card-elevated" style={{ height: 450, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>Top 20 Contractors</h3>
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <AnalyticsContractorsTable data={contractorData} />
          </div>
        </div>
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
