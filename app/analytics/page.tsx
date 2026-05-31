import AppLayout from '@/components/AppLayout'
import { supabase } from '@/lib/supabase'
import { fetchAllRows, getTotalBudget } from '@/lib/queries'
import AnalyticsCategoryChart from '@/components/analytics/AnalyticsCategoryChart'
import AnalyticsYearChart from '@/components/analytics/AnalyticsYearChart'
import AnalyticsProgressChart from '@/components/analytics/AnalyticsProgressChart'
import AnalyticsContractorsTable from '@/components/analytics/AnalyticsContractorsTable'

export const revalidate = 300

export default async function AnalyticsPage() {
  const [projects, totalBudget] = await Promise.all([
      fetchAllRows(
        supabase.from('dpwh_projects'),
        50000
      ),
      getTotalBudget()
    ])

  const data = projects || []

  // Calculate stats
  const categoryMap: Record<string, { count: number, budget: number }> = {}
  const yearMap: Record<string, { [status: string]: number, count: number, budget: number }> = {}
  const progressBuckets = [0,0,0,0,0,0,0,0,0,0]
  const contractorMap: Record<string, { count: number, budget: number, totalProgress: number }> = {}

  for (const p of data) {
    // Category
    if (p.category) {
      if (!categoryMap[p.category]) categoryMap[p.category] = { count: 0, budget: 0 }
      categoryMap[p.category].count += 1
      categoryMap[p.category].budget += p.budget || 0
    }

    // Year
    const y = p.infra_year
    if (y) {
      if (!yearMap[y]) yearMap[y] = { count: 0, budget: 0 }
      yearMap[y].count += 1
      yearMap[y].budget += p.budget || 0
      if (p.status) {
        yearMap[y][p.status] = (yearMap[y][p.status] || 0) + 1
      }
    }

    // Progress
    const prog = Math.max(0, Math.min(100, p.progress || 0))
    const bucket = Math.min(9, Math.floor(prog / 10))
    progressBuckets[bucket] += 1

    // Contractor
    if (p.contractor) {
      if (!contractorMap[p.contractor]) contractorMap[p.contractor] = { count: 0, budget: 0, totalProgress: 0 }
      contractorMap[p.contractor].count += 1
      contractorMap[p.contractor].budget += p.budget || 0
      contractorMap[p.contractor].totalProgress += prog
    }
  }

  // Format for charts
  const categoryData = Object.entries(categoryMap)
    .map(([category, { count, budget }]) => ({ category, count, budget }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  const yearData = Object.entries(yearMap)
    .map(([year, stats]) => ({ year, ...stats }))
    .sort((a, b) => a.year.localeCompare(b.year))

  const progressData = progressBuckets.map((count, i) => ({
    range: `${i*10}–${(i+1)*10}%`,
    count,
    min: i * 10
  }))

  const contractorData = Object.entries(contractorMap)
    .map(([contractor, { count, budget, totalProgress }]) => ({
      contractor,
      count,
      budget,
      avgProgress: totalProgress / count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  return (
    <AppLayout title="Analytics">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="card-elevated">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>Projects by Category</h3>
          <AnalyticsCategoryChart data={categoryData} />
        </div>

        <div className="card-elevated">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>Projects by Year</h3>
          <AnalyticsYearChart data={yearData} />
        </div>

        <div className="card-elevated">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>Progress Distribution</h3>
          <AnalyticsProgressChart data={progressData} />
        </div>

        <div className="card-elevated">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>Top 20 Contractors</h3>
          <AnalyticsContractorsTable data={contractorData} />
        </div>
      </div>
    </AppLayout>
  )
}
