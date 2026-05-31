import AppLayout from '@/components/AppLayout'
import { supabase } from '@/lib/supabase'
import AnalyticsCategoryChart from '@/components/analytics/AnalyticsCategoryChart'
import AnalyticsYearChart from '@/components/analytics/AnalyticsYearChart'
import AnalyticsProgressChart from '@/components/analytics/AnalyticsProgressChart'
import AnalyticsContractorsTable from '@/components/analytics/AnalyticsContractorsTable'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AnalyticsPage() {
  const bucketQueries = Array.from({ length: 10 }, (_, i) => {
    const min = i * 10
    const max = i * 10 + 10
    const q = supabase
      .from('dpwh_projects')
      .select('*', { count: 'exact', head: true })
      .not('progress', 'is', null)
      .gte('progress', min)
    return i === 9 ? q.lte('progress', 100) : q.lt('progress', max)
  })

  const results = await Promise.all([
    supabase.from('dpwh_projects')
      .select('category, count:contract_id.count(), budget:budget.sum()')
      .not('category', 'is', null),

    supabase.from('dpwh_projects')
      .select('infra_year, status, count:contract_id.count()')
      .not('infra_year', 'is', null)
      .not('status', 'is', null),

    ...bucketQueries,

    supabase.from('dpwh_projects')
      .select('contractor, count:contract_id.count(), budget:budget.sum(), avgProgress:progress.avg()')
      .not('contractor', 'is', null),
  ])

  const categoryAgg = results[0]?.data
  const yearStatusAgg = results[1]?.data
  const bucketCounts = results.slice(2, 12)
  const contractorAgg = results[12]?.data

  const byCategory = (categoryAgg || [])
    .map((r: any) => ({
      category: r.category || 'Unknown',
      count: Number(r.count || 0),
      budget: Number(r.budget || 0),
    }))
    .sort((a, b) => b.count - a.count)

  const yearMap: Record<string, Record<string, number>> = {}
  for (const r of yearStatusAgg || []) {
    const y = r.infra_year || 'Unknown'
    const s = r.status || 'Unknown'
    if (!yearMap[y]) yearMap[y] = {}
    yearMap[y][s] = (yearMap[y][s] || 0) + Number(r.count || 0)
  }
  const byYearStatus = Object.entries(yearMap)
    .map(([year, statuses]) => ({ year, ...statuses }))
    .sort((a, b) => a.year.localeCompare(b.year))

  const buckets = Array.from({ length: 10 }, (_, i) => ({
    range: `${i * 10}–${i * 10 + 10}%`,
    count: Number(bucketCounts[i]?.count || 0),
    min: i * 10,
    max: i * 10 + 10,
  }))

  const topContractors = (contractorAgg || [])
    .map((r: any) => ({
      contractor: (r.contractor || 'Unknown').slice(0, 60),
      count: Number(r.count || 0),
      budget: Number(r.budget || 0),
      avgProgress: Number(r.avgProgress || 0),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)

  return (
    <AppLayout title="Analytics">
      <div className="card-elevated" style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>
          Projects by Category
        </h3>
        <AnalyticsCategoryChart data={byCategory} />
      </div>

      <div className="card-elevated" style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>
          Project Status by Year
        </h3>
        <AnalyticsYearChart data={byYearStatus} />
      </div>

      <div className="card-elevated" style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>
          Progress Distribution (all projects)
        </h3>
        <AnalyticsProgressChart data={buckets} />
      </div>

      <div className="card-elevated" style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e6edf3', marginBottom: '1rem' }}>
          Top 20 Contractors by Project Count
        </h3>
        <AnalyticsContractorsTable data={topContractors} />
      </div>
    </AppLayout>
  )
}
