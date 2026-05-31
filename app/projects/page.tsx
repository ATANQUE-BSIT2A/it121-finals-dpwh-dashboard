'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import AppLayout from '@/components/AppLayout'
import ProjectDrawer from '@/components/ProjectDrawer'
import { formatPeso, truncate, progressColor } from '@/lib/utils'
import { REGIONS } from '@/lib/regions'
import { STATUSES, statusBadgeStyle } from '@/lib/statuses'
import { Search, X } from 'lucide-react'

const PER_PAGE = 50

export default function ProjectsPage() {
  const [projects, setProjects]         = useState<any[]>([])
  const [totalCount, setTotalCount]     = useState(0)
  const [loading, setLoading]           = useState(true)
  const [errorMsg, setErrorMsg]         = useState('')
  const [selected, setSelected]         = useState<any>(null)
  const [page, setPage]                 = useState(1)
  const requestIdRef = useRef(0)

  // Filters
  const [rawSearch, setRawSearch] = useState('')
  const [search, setSearch]       = useState('')
  const [region, setRegion]       = useState('')
  const [category, setCategory]   = useState('')
  const [status, setStatus]       = useState('')
  const [year, setYear]           = useState('')
  const [sortBy, setSortBy]       = useState('start_date')
  const [sortDir, setSortDir]     = useState<'asc'|'desc'>('desc')

  // Filter options
  const [categories, setCategories] = useState<string[]>([])
  const [years, setYears]           = useState<string[]>([])

  useEffect(() => {
    const t = setTimeout(() => setSearch(rawSearch), 400)
    return () => clearTimeout(t)
  }, [rawSearch])

  // Load filter options once
  useEffect(() => {
    const loadOptions = async () => {
      const cacheKey = 'dpwh:project-options:v1'
      const cached = typeof window !== 'undefined' ? window.localStorage.getItem(cacheKey) : null
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as { ts: number; categories: string[]; years: string[] }
          if (Date.now() - parsed.ts < 24 * 60 * 60 * 1000) {
            setCategories(parsed.categories || [])
            setYears(parsed.years || [])
            return
          }
        } catch {}
      }

      const [{ data: c }, { data: y }] = await Promise.all([
        supabase.from('dpwh_projects').select('category, count:contract_id.count()').not('category', 'is', null),
        supabase.from('dpwh_projects').select('infra_year, count:contract_id.count()').not('infra_year', 'is', null),
      ])

      const cats = (c || []).map((r: any) => r.category).filter(Boolean).sort() as string[]
      const yrs = (y || []).map((r: any) => r.infra_year).filter(Boolean).sort().reverse() as string[]
      setCategories(cats)
      setYears(yrs)
      try {
        window.localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), categories: cats, years: yrs }))
      } catch {}
    }
    loadOptions()
  }, [])

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setErrorMsg('')
    const requestId = ++requestIdRef.current

    let q = supabase.from('dpwh_projects').select('contract_id,description,region,province,category,status,budget,progress,start_date,contractor', { count: 'estimated' })

    if (search.trim()) {
      const s = search.trim()
      q = q.or(`description.ilike.%${s}%,contract_id.ilike.%${s}%,contractor.ilike.%${s}%,province.ilike.%${s}%,program_name.ilike.%${s}%`)
    }
    if (region)   q = q.eq('region', region)
    if (category) q = q.eq('category', category)
    if (status)   q = q.eq('status', status)
    if (year)     q = q.eq('infra_year', year)

    const from = (page - 1) * PER_PAGE
    const { data, count, error } = await q
      .order(sortBy, { ascending: sortDir === 'asc' })
      .range(from, from + PER_PAGE - 1)

    if (requestId !== requestIdRef.current) return

    if (error) {
      setProjects([])
      setTotalCount(0)
      setErrorMsg(error.message || 'Failed to load projects.')
      setLoading(false)
      return
    }

    setProjects(data || [])
    setTotalCount(count || 0)
    setLoading(false)
  }, [search, region, category, status, year, page, sortBy, sortDir])

  useEffect(() => { setPage(1) }, [search, region, category, status, year])
  useEffect(() => { fetchProjects() }, [fetchProjects])

  const clearAll = () => { setRawSearch(''); setSearch(''); setRegion(''); setCategory(''); setStatus(''); setYear('') }
  const hasFilters = rawSearch || region || category || status || year
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE))

  return (
    <AppLayout title="Projects">
      {/* Filter bar */}
      <div className="card-elevated" style={{ padding: '0.75rem 1rem', marginBottom: '0.75rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#484f58', pointerEvents: 'none' }} />
            <input
              className="input"
              style={{ paddingLeft: 30, height: 34, fontSize: '0.8rem', width: '100%' }}
              placeholder="Search by name, ID, or contractor…"
              value={rawSearch}
              onChange={e => setRawSearch(e.target.value)}
            />
          </div>

          <select
            className="input"
            style={{ width: 180, flexShrink: 0, height: 34, fontSize: '0.8rem' }}
            value={region}
            onChange={e => setRegion(e.target.value)}
          >
            <option value="">All Regions</option>
            {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>

          <select
            className="input"
            style={{ width: 170, flexShrink: 0, height: 34, fontSize: '0.8rem' }}
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            className="input"
            style={{ width: 160, flexShrink: 0, height: 34, fontSize: '0.8rem' }}
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <select
            className="input"
            style={{ width: 110, flexShrink: 0, height: 34, fontSize: '0.8rem' }}
            value={year}
            onChange={e => setYear(e.target.value)}
          >
            <option value="">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <select
            className="input"
            style={{ width: 150, flexShrink: 0, height: 34, fontSize: '0.8rem' }}
            value={`${sortBy}:${sortDir}`}
            onChange={e => {
              const [s, d] = e.target.value.split(':')
              setSortBy(s)
              setSortDir(d as 'asc'|'desc')
            }}
          >
            <option value="start_date:desc">Newest First</option>
            <option value="start_date:asc">Oldest First</option>
            <option value="budget:desc">Budget: High → Low</option>
            <option value="budget:asc">Budget: Low → High</option>
            <option value="progress:desc">Progress: High → Low</option>
            <option value="progress:asc">Progress: Low → High</option>
          </select>

          {hasFilters && (
            <button
              className="btn btn-ghost"
              onClick={clearAll}
              style={{ flexShrink: 0, height: 34, padding: '0 10px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
            >
              <X size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Results header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>
          {loading
            ? 'Loading…'
            : totalCount > 0
              ? `Showing ${((page - 1) * PER_PAGE) + 1}–${Math.min(page * PER_PAGE, totalCount)} of ${totalCount.toLocaleString()} projects`
              : `Showing ${projects.length.toLocaleString()} projects`}
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
          ) : errorMsg ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#f85149', fontSize: '0.875rem' }}>{errorMsg}</div>
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
                    <td><span style={statusBadgeStyle(p.status)}>{p.status}</span></td>
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
