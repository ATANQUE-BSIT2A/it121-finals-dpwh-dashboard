'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AppLayout from '@/components/AppLayout'
import ProjectDrawer from '@/components/ProjectDrawer'
import { formatPeso, truncate, statusClass, progressColor } from '@/lib/utils'
import { getRegions } from '@/lib/queries'
import { Search, Filter, X } from 'lucide-react'

const PER_PAGE = 50

export default function ProjectsPage() {
  const router = useRouter()

  const [projects, setProjects]         = useState<any[]>([])
  const [totalCount, setTotalCount]     = useState(0)
  const [loading, setLoading]           = useState(true)
  const [selected, setSelected]         = useState<any>(null)
  const [page, setPage]                 = useState(1)

  // Filters
  const [search, setSearch]       = useState('')
  const [region, setRegion]       = useState('')
  const [province, setProvince]   = useState('')
  const [category, setCategory]   = useState('')
  const [status, setStatus]       = useState('')
  const [year, setYear]           = useState('')
  const [sortBy, setSortBy]       = useState('start_date')
  const [sortDir, setSortDir]     = useState<'asc'|'desc'>('desc')

  // Filter options
  const regions = getRegions()
  const [provinces, setProvinces]   = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [years, setYears]           = useState<string[]>([])

  // Load filter options once
  useEffect(() => {
    const loadOptions = async () => {
      const [{ data: c }, { data: y }, { data: r }] = await Promise.all([
        supabase.from('dpwh_projects').select('category').not('category','is',null),
        supabase.from('dpwh_projects').select('infra_year').not('infra_year','is',null),
        supabase.from('dpwh_projects').select('region').not('region','is',null).limit(100),
      ])
      console.log('Unique regions in Supabase:', [...new Set(r?.map((x: any) => x.region))])
      setCategories([...new Set(c?.map((x: any) => x.category))].sort() as string[])
      setYears([...new Set(y?.map((x: any) => x.infra_year))].sort().reverse() as string[])
    }
    loadOptions()
  }, [])

  // Load provinces when region changes
  useEffect(() => {
    setProvince('')
    if (!region) { setProvinces([]); return }
    supabase.from('dpwh_projects').select('province').eq('region', region).not('province','is',null)
      .then(({ data }) => {
        setProvinces([...new Set(data?.map((x: any) => x.province))].sort() as string[])
      })
  }, [region])

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('dpwh_projects').select('contract_id,description,region,province,category,status,budget,progress,start_date,contractor', { count: 'exact' })

    if (search.trim()) {
      q = q.or(`description.ilike.%${search}%,contract_id.ilike.%${search}%,contractor.ilike.%${search}%`)
    }
    if (region)   q = q.eq('region', region)
    if (province) q = q.eq('province', province)
    if (category) q = q.eq('category', category)
    if (status)   q = q.eq('status', status)
    if (year)     q = q.eq('infra_year', year)

    const from = (page - 1) * PER_PAGE
    const { data, count, error } = await q
      .order(sortBy, { ascending: sortDir === 'asc' })
      .range(from, from + PER_PAGE - 1)

    setProjects(data || [])
    setTotalCount(count || 0)
    setLoading(false)
  }, [search, region, province, category, status, year, page, sortBy, sortDir])

  useEffect(() => { setPage(1) }, [search, region, province, category, status, year])
  useEffect(() => { fetchProjects() }, [fetchProjects])

  const clearAll = () => { setSearch(''); setRegion(''); setProvince(''); setCategory(''); setStatus(''); setYear('') }
  const hasFilters = search || region || province || category || status || year
  const totalPages = Math.ceil(totalCount / PER_PAGE)

  const statuses = ['Completed', 'On-Going', 'Suspended', 'Terminated', 'For Procurement']
  const sortOptions = [
    { value: 'start_date:desc',  label: 'Newest First' },
    { value: 'start_date:asc',   label: 'Oldest First' },
    { value: 'budget:desc',      label: 'Budget: High → Low' },
    { value: 'budget:asc',       label: 'Budget: Low → High' },
    { value: 'progress:desc',    label: 'Progress: High → Low' },
    { value: 'progress:asc',     label: 'Progress: Low → High' },
  ]

  return (
    <AppLayout title="Projects">
      {/* Filter bar */}
      <div className="card-elevated" style={{ marginBottom: '1rem', padding: '0.875rem 1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '0.75rem', alignItems: 'center', overflowX: 'auto' }}>

          {/* Search */}
          <div style={{ position: 'relative', flexGrow: 1, minWidth: 220, flexShrink: 1 }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#484f58' }} />
            <input
              className="input"
              style={{ paddingLeft: 30, fontSize: '0.8rem', height: 34, width: '100%' }}
              placeholder="Search by name, ID, or contractor…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Region */}
          <select className="input" style={{ minWidth: 160, width: 160, height: 34, fontSize: '0.8rem', flexShrink: 0 }} value={region} onChange={e => setRegion(e.target.value)}>
            <option value="">All Regions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Province — only if region selected */}
          {region && (
            <select className="input" style={{ minWidth: 180, width: 180, height: 34, fontSize: '0.8rem', flexShrink: 0 }} value={province} onChange={e => setProvince(e.target.value)}>
              <option value="">All Provinces</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}

          {/* Category */}
          <select className="input" style={{ minWidth: 180, width: 180, height: 34, fontSize: '0.8rem', flexShrink: 0 }} value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Status */}
          <select className="input" style={{ minWidth: 150, width: 150, height: 34, fontSize: '0.8rem', flexShrink: 0 }} value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Year */}
          <select className="input" style={{ minWidth: 110, width: 110, height: 34, fontSize: '0.8rem', flexShrink: 0 }} value={year} onChange={e => setYear(e.target.value)}>
            <option value="">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          {/* Sort */}
          <select
            className="input"
            style={{ width: 180, height: 34, fontSize: '0.8rem' }}
            value={`${sortBy}:${sortDir}`}
            onChange={e => { const [s, d] = e.target.value.split(':'); setSortBy(s); setSortDir(d as 'asc'|'desc') }}
          >
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Clear */}
          {hasFilters && (
            <button className="btn btn-ghost" style={{ height: 34, fontSize: '0.8rem', whiteSpace: 'nowrap' }} onClick={clearAll}>
              <X size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Results header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>
          {loading ? 'Loading…' : `Showing ${((page-1)*PER_PAGE)+1}–${Math.min(page*PER_PAGE, totalCount)} of ${totalCount.toLocaleString()} projects`}
        </span>
        <span style={{ fontSize: '0.75rem', color: '#484f58' }}>
          Page {page} of {totalPages.toLocaleString()}
        </span>
      </div>

      {/* Table */}
      <div className="card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#484f58', fontSize: '0.875rem' }}>Loading projects…</div>
          ) : projects.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#484f58', fontSize: '0.875rem' }}>No projects match your filters.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  {['Contract ID','Description','Region','Category','Budget','Status','Progress','Contractor'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.contract_id} onClick={() => setSelected(p)}>
                    <td style={{ color: '#8b949e', fontFamily: 'monospace', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{p.contract_id}</td>
                    <td style={{ maxWidth: 300 }}>{truncate(p.description, 70)}</td>
                    <td style={{ color: '#8b949e', whiteSpace: 'nowrap', fontSize: '0.78rem' }}>{p.region}</td>
                    <td style={{ color: '#8b949e', whiteSpace: 'nowrap', fontSize: '0.78rem' }}>{p.category}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatPeso(p.budget)}</td>
                    <td><span className={statusClass(p.status)}>{p.status}</span></td>
                    <td style={{ minWidth: 100 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className="progress-track" style={{ flex: 1 }}>
                          <div className="progress-fill" style={{ width: `${p.progress||0}%`, background: progressColor(p.progress||0) }} />
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#8b949e', minWidth: 28 }}>{p.progress||0}%</span>
                      </div>
                    </td>
                    <td style={{ color: '#8b949e', maxWidth: 180, fontSize: '0.75rem' }}>{truncate(p.contractor, 30)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, padding: '0.875rem', borderTop: '1px solid #21262d' }}>
            <button className="btn btn-secondary" style={{ height: 30, fontSize: '0.78rem', padding: '0 10px' }} disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
              return (
                <button key={p} onClick={() => setPage(p)}
                  style={{
                    height: 30, minWidth: 30, fontSize: '0.78rem', padding: '0 8px',
                    borderRadius: 6, border: 'none', cursor: 'pointer',
                    background: p === page ? '#1f6feb' : '#21262d',
                    color: p === page ? '#fff' : '#8b949e',
                  }}>
                  {p}
                </button>
              )
            })}
            <button className="btn btn-secondary" style={{ height: 30, fontSize: '0.78rem', padding: '0 10px' }} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>

      {selected && <ProjectDrawer project={selected} onClose={() => setSelected(null)} />}
    </AppLayout>
  )
}
