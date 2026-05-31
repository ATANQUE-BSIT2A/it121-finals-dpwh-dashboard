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
import { fetchAllRows } from '@/lib/queries'

export const revalidate = 300

export default async function DashboardPage() {
  const [
    { count: totalCount },
    statsData,
    recentData,
  ] = await Promise.all([
    supabase.from('dpwh_projects').select('*', { count: 'exact', head: true }),
    fetchAllRows(supabase.from('dpwh_projects').select('contract_id, region, status, budget, infra_year, category, progress, contractor')),
    supabase.from('dpwh_projects')
      .select('contract_id, description, region, category, budget, status, progress')
      .order('start_date', { ascending: false })
      .limit(10),
  ])

  // Calculate ALL stats
  const budgetByRegion: Record<string, number> = {}
  const statusCounts: Record<string, number> = {}
  const yearStats: Record<string, { count: number, budget: number }> = {}
  const categoryMap: Record<string, { count: number, budget: number }> = {}
  const progressBuckets = [0,0,0,0,0,0,0,0,0,0]
  const contractorMap: Record<string, { count: number, totalBudget: number, totalProgress: number, progressCount: number }> = {}
  let totalBudget = 0

  for (const p of statsData || []) {
    const b = p.budget || 0
    totalBudget += b

    // Budget by Region
    if (p.region) {
      budgetByRegion[p.region] = (budgetByRegion[p.region] || 0) + b
    }

    // Status Counts
    if (p.status) {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1
    }

    // Year Stats
    if (p.infra_year) {
      const y = p.infra_year
      if (!yearStats[y]) yearStats[y] = { count: 0, budget: 0 }
      yearStats[y].count += 1
      yearStats[y].budget += b
    }

    // Category Stats
    if (p.category) {
      if (!categoryMap[p.category]) categoryMap[p.category] = { count: 0, budget: 0 }
      categoryMap[p.category].count += 1
      categoryMap[p.category].budget += b
    }

    // Progress Buckets
    const prog = Math.max(0, Math.min(100, p.progress || 0))
    const bucket = Math.min(9, Math.floor(prog / 10))
    progressBuckets[bucket] += 1

    // Contractor Stats
    if (p.contractor) {
      if (!contractorMap[p.contractor]) {
        contractorMap[p.contractor] = { count: 0, totalBudget: 0, totalProgress: 0, progressCount: 0 }
      }
      contractorMap[p.contractor].count += 1
      contractorMap[p.contractor].totalBudget += b
      if (p.progress !== null) {
        contractorMap[p.contractor].totalProgress += p.progress
        contractorMap[p.contractor].progressCount += 1
      }
    }
  }

  // Format data for all charts
  const budgetByRegionList = Object.entries(budgetByRegion)
    .map(([region, total]) => ({ region, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  const byStatus = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
  const byYear = Object.entries(yearStats)
    .map(([year, { count, budget }]) => ({ year, count, budget }))
    .sort((a, b) => a.year.localeCompare(b.year))

  const categoryData = Object.entries(categoryMap)
    .map(([category, { count, budget }]) => ({ category, count, budget }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  const progressData = progressBuckets.map((count, i) => ({
    range: `${i*10}–${(i+1)*10}%`,
    count,
    min: i * 10
  }))

  const contractorData = Object.entries(contractorMap)
    .map(([contractor, data]) => ({
      contractor,
      count: data.count,
      budget: data.totalBudget,
      avgProgress: data.progressCount > 0 ? data.totalProgress / data.progressCount : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  const completed = statusCounts['Completed'] || 0
  const ongoing = (statusCounts['On-Going'] || 0) + (statusCounts['On Going'] || 0)

  return (
    <AppLayout title="Infrastructure Dashboard">
      <KpiCards total={totalCount || 0} totalBudget={totalBudget} completed={completed} ongoing={ongoing} />

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
        <div className="card-elevated">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>Projects by Year</h3>
          <ProjectsByYearChart data={byYear} />
        </div>
        <div className="card-elevated">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>Projects by Category</h3>
          <AnalyticsCategoryChart data={categoryData} />
        </div>
      </div>

      {/* Third Row: Progress & Contractors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div className="card-elevated">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>Progress Distribution</h3>
          <AnalyticsProgressChart data={progressData} />
        </div>
        <div className="card-elevated">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>Top 20 Contractors</h3>
          <AnalyticsContractorsTable data={contractorData} />
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
