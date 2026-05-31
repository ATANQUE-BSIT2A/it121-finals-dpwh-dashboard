import AppLayout from '@/components/AppLayout'
import { supabase } from '@/lib/supabase'
import AnalyticsCategoryChart from '@/components/analytics/AnalyticsCategoryChart'
import AnalyticsYearChart from '@/components/analytics/AnalyticsYearChart'
import AnalyticsProgressChart from '@/components/analytics/AnalyticsProgressChart'
import AnalyticsContractorsTable from '@/components/analytics/AnalyticsContractorsTable'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AnalyticsPage() {
  const [
    { data: categoryData },
    { data: yearStatusData },
    { data: progressData },
    { data: contractorData },
  ] = await Promise.all([
    supabase.from('dpwh_projects')
      .select('category, budget, status')
      .not('category', 'is', null),

    supabase.from('dpwh_projects')
      .select('infra_year, status')
      .not('infra_year', 'is', null)
      .not('status', 'is', null),

    supabase.from('dpwh_projects')
      .select('progress')
      .not('progress', 'is', null),

    supabase.from('dpwh_projects')
      .select('contractor, budget, progress')
      .not('contractor', 'is', null),
  ])

  const catMap: Record<string, { count: number; budget: number }> = {}
  for (const r of categoryData || []) {
    const k = r.category || 'Unknown'
    if (!catMap[k]) catMap[k] = { count: 0, budget: 0 }
    catMap[k].count += 1
    catMap[k].budget += Number(r.budget || 0)
  }
  const byCategory = Object.entries(catMap)
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.count - a.count)

  const yearMap: Record<string, Record<string, number>> = {}
  for (const r of yearStatusData || []) {
    const y = r.infra_year || 'Unknown'
    const s = r.status || 'Unknown'
    if (!yearMap[y]) yearMap[y] = {}
    yearMap[y][s] = (yearMap[y][s] || 0) + 1
  }
  const byYearStatus = Object.entries(yearMap)
    .map(([year, statuses]) => ({ year, ...statuses }))
    .sort((a, b) => a.year.localeCompare(b.year))

  const buckets = Array.from({ length: 10 }, (_, i) => ({
    range: `${i * 10}–${i * 10 + 10}%`,
    count: 0,
    min: i * 10,
    max: i * 10 + 10,
  }))
  for (const r of progressData || []) {
    const p = Number(r.progress || 0)
    const idx = Math.min(Math.floor(p / 10), 9)
    buckets[idx].count += 1
  }

  const conMap: Record<string, { count: number; budget: number; progressSum: number }> = {}
  for (const r of contractorData || []) {
    const k = r.contractor?.slice(0, 60) || 'Unknown'
    if (!conMap[k]) conMap[k] = { count: 0, budget: 0, progressSum: 0 }
    conMap[k].count += 1
    conMap[k].budget += Number(r.budget || 0)
    conMap[k].progressSum += Number(r.progress || 0)
  }
  const topContractors = Object.entries(conMap)
    .map(([contractor, v]) => ({
      contractor,
      count: v.count,
      budget: v.budget,
      avgProgress: v.count > 0 ? v.progressSum / v.count : 0,
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
