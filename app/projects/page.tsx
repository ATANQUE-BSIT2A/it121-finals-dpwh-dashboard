'use client'
import { useEffect, useState, useCallback } from 'react'
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

  // Filters
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

  // Load filter options
  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true)
      try {
        const [catRes, yearRes] = await Promise.all([
          // Load first 5k rows to get unique categories
          supabase.from('dpwh_projects')
            .select('category')
            .not('category', 'is', null)
            .limit(5000),
          supabase.from('dpwh_projects')
            .select('infra_year')
            .not('infra_year', 'is', null)
            .limit(5000),
        ])

        const uniqueCats = [...new Set(catRes.data?.map((x: any) => x.category || ''))].sort()
        const uniqueYears = [...new Set(yearRes.data?.map((x: any) => x.infra_year || ''))].sort().reverse()

        setCategories(uniqueCats)
        setYears(uniqueYears)
      } catch (e) {
        console.error('Error loading filters:', e)
      } finally {
        setLoading(false)
      }
    }
    loadOptions()
  }, [])

  // Fetch projects with debounced search
  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      let q = supabase.from('dpwh_projects')
        .select('contract_id,description,region,province,category,status,budget,progress,start_date,contractor', { count: 'estimated' })

      if (search.trim()) {
        q = q.or(`description.ilike.%${search}%,contract_id.ilike.%${search}%,contractor.ilike.%${search}%,province.ilike.%${search}%,program_name.ilike.%${search}%`)
      }
      if (region)   q = q.eq('region', region)
      if (category) q = q.eq('category', category)
      if (status)   q = q.eq('status', status)
      if (year)     q = q.eq('infra_year', year)

      const from = (page - 1) * PER_PAGE
      const { data, count, error } = await q
        .order(sortBy, { ascending: sortDir === 'asc' })
        .range(from, from + PER_PAGE - 1)

      if (error) {
        setErrorMsg('canceling statement due to statement timeout')
      }

      setProjects(data || [])
      setTotalCount(count || 0)
    } catch (e) {
      setErrorMsg('Error loading projects')
    } finally {
      setLoading(false)
    }
  }, [search, region, category, status, year, page, sortBy, sortDir])

  useEffect(() => { setPage(1) }, [search, region, category, status, year])
  useEffect(() => { fetchProjects() }, [fetchProjects])

  const clearAll = () => { setSearch(''); setRegion(''); setCategory(''); setStatus(''); setYear('') }
  const hasFilters = search || region || category || status || year
  const totalPages = Math.ceil(totalCount / PER_PAGE)

  return (
    <AppLayout title="Projects">
      {/* Filter bar */}
      <div className="card-elevated" style={{ padding: '0.75rem 1rem', marginBottom: '0.75rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#484f58', pointerEvents: 'none' }} />
            <input
              className="input"
              style={{ paddingLeft: 30, height: 34, lineHeight: '34px', fontSize: '0.8rem', width: '100%' }}
              placeholder="Search by name, ID, or contractor…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="input"
            style={{ width: 190, flexShrink: 0, height: 34, lineHeight: '34px', fontSize: '0.8rem' }}
            value={region}
            onChange={e => setRegion(e.target.value)}
          >
            <option value="">All Regions</option>
            {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>

          <select
            className="input"
            style={{ width: 180, flexShrink: 0, height: 34, lineHeight: '34px', fontSize: '0.8rem' }}
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{truncate(c, 30)}</option>)}
          </select>

          <select
            className="input"
            style={{ width: 170, flexShrink: 0, height: 34, lineHeight: '34px', fontSize: '0.8rem' }}
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <select
            className="input"
            style={{ width: 130, flexShrink: 0, height: 34, lineHeight: '34px', fontSize: '0.8rem' }}
            value={year}
            onChange={e => setYear(e.target.value)}
          >
            <option value="">All Years</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <select
            className="input"
            style={{ width: 160, flexShrink: 0, height: 34, lineHeight: '34px', fontSize: '0.8rem' }}
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
              ? `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, totalCount)} of ${totalCount.toLocaleString()} projects`
              : `Showing ${projects.length.toLocaleString()} projects`}
        </span>
        <span style={{ fontSize: '0.75rem', color: '#484f58' }}>
          Page {page} of {totalPages.toLocaleString()}
        </span>
      </div>

      {/* Table */}
      <div className="card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', minWidth: '1200px' }}>
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
                  <th style={{ width: '120px' }}>Contract ID</th>
                  <th style={{ width: '280px' }}>Description</th>
                  <th style={{ width: '160px' }}>Region</th>
                  <th style={{ width: '220px' }}>Category</th>
                  <th style={{ width: '120px' }}>Budget</th>
                  <th style={{ width: '140px' }}>Status</th>
                  <th style={{ width: '110px' }}>Progress</th>
                  <th style={{ width: '190px' }}>Contractor</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.contract_id} onClick={() => setSelected(p)}>
                    <td style={{ color: '#8b949e', fontFamily: 'monospace', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>{p.contract_id}</td>
                    <td style={{ maxWidth: '280px' }}>{truncate(p.description, 70)}</td>
                    <td style={{ color: '#8b949e', whiteSpace: 'nowrap', fontSize: '0.78rem' }}>{p.region}</td>
                    <td style={{ color: '#8b949e', fontSize: '0.78rem' }}>{truncate(p.category, 45)}</td>
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
                    <td style={{ color: '#8b949e', maxWidth: '190px', fontSize: '0.75rem' }}>{truncate(p.contractor, 30)}</td>
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
