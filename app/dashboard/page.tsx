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
import { fetchAllRows, getTotalBudget, getStatusCounts, getYearStats, getBudgetByRegion } from '@/lib/queries'

export const revalidate = 300

export default async function DashboardPage() {
  const [
    { count: totalCount },
    statsData,
    { data: recentData },
    fullBudget,
    globalStatuses,
    globalYearStats,
    globalBudgetByRegion,
  ] = await Promise.all([
    supabase.from('dpwh_projects').select('*', { count: 'exact', head: true }),
    fetchAllRows(supabase.from('dpwh_projects').select('region, status, budget, infra_year, category, progress, contractor').order('infra_year', { ascending: false }).order('contract_id', { ascending: true }), 10000),
    supabase.from('dpwh_projects')
      .select('contract_id, description, region, category, budget, status, progress')
      .order('infra_year', { ascending: false })
      .limit(10),
    getTotalBudget(),
    getStatusCounts(),
    getYearStats(),
    getBudgetByRegion(),
  ])

  // Calculate stats from sample
  const budgetByRegion: Record<string, number> = {}
  const categoryMap: Record<string, { count: number, budget: number }> = {}
  const progressBuckets = [0,0,0,0,0,0,0,0,0,0]
  const contractorMap: Record<string, { count: number, totalBudget: number, totalProgress: number, progressCount: number }> = {}
  
  // Use the reliable fullBudget for the KPI
  let totalBudget = fullBudget || 0

  for (const p of statsData || []) {
    const b = p.budget || 0

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
  const budgetByRegionList = globalBudgetByRegion.map(r => ({ region: r.region, total: r.totalBudget }))

  // Use global statuses for the donut chart
  const byStatus = globalStatuses

  // Use global year stats for the bar chart
  const byYear = globalYearStats.sort((a, b) => a.year.localeCompare(b.year))

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

  // Get totals from global statuses
  const completed = globalStatuses.find(s => s.name === 'Completed')?.value || 0
  const ongoing = globalStatuses.find(s => s.name === 'On-Going')?.value || 0

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
