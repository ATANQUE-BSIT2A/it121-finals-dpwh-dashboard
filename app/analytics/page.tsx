import AppLayout from '@/components/AppLayout'
import { supabase } from '@/lib/supabase'
import AnalyticsCategoryChart from '@/components/analytics/AnalyticsCategoryChart'
import AnalyticsYearChart from '@/components/analytics/AnalyticsYearChart'
import AnalyticsProgressChart from '@/components/analytics/AnalyticsProgressChart'
import AnalyticsContractorsTable from '@/components/analytics/AnalyticsContractorsTable'

export const revalidate = 300

export default async function AnalyticsPage() {
  const { data: projects } = await supabase.from('dpwh_projects')
    .select('category, status, infra_year, start_year, progress, budget, contractor')
    .limit(5000)

  const data = projects || []

  // Calculate stats
  const categoryMap: Record<string, { count: number, budget: number }> = {}
  const yearMap: Record<string, { count: number, budget: number }> = {}
  const progressBuckets = [0,0,0,0,0,0,0,0,0,0]
  const contractorMap: Record<string, number> = {}

  for (const p of data) {
    // Category
    if (p.category) {
      if (!categoryMap[p.category]) categoryMap[p.category] = { count: 0, budget: 0 }
      categoryMap[p.category].count += 1
      categoryMap[p.category].budget += p.budget || 0
    }

    // Year
    const y = p.infra_year || p.start_year
    if (y) {
      if (!yearMap[y]) yearMap[y] = { count: 0, budget: 0 }
      yearMap[y].count += 1
      yearMap[y].budget += p.budget || 0
    }

    // Progress
    const prog = Math.max(0, Math.min(100, p.progress || 0))
    const bucket = Math.min(9, Math.floor(prog / 10))
    progressBuckets[bucket] += 1

    // Contractor
    if (p.contractor) {
      contractorMap[p.contractor] = (contractorMap[p.contractor] || 0) + 1
    }
  }

  // Format for charts
  const categoryData = Object.entries(categoryMap)
    .map(([category, { count, budget }]) => ({ category, count, budget }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  const yearData = Object.entries(yearMap)
    .map(([year, { count, budget }]) => ({ year, count, budget }))
    .sort((a, b) => a.year.localeCompare(b.year))

  const progressData = progressBuckets.map((count, i) => ({
    range: `${i*10}–${(i+1)*10}%`,
    count,
  }))

  const contractorData = Object.entries(contractorMap)
    .map(([name, count]) => ({ name, count }))
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
