'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { STATUSES } from '@/lib/statuses'

function getColor(status: string) {
  const s = STATUSES.find(x => x.value === status || x.label === status)
  return s?.color || '#8b949e'
}

function makePin(color: string, L: any) {
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="30" viewBox="0 0 20 30">
      <path d="M10 0C4.5 0 0 4.5 0 10c0 7.5 10 20 10 20S20 17.5 20 10C20 4.5 15.5 0 10 0z"
        fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="1.2"/>
      <circle cx="10" cy="10" r="4" fill="white" opacity="0.85"/>
    </svg>`,
    className: '',
    iconSize: [20, 30],
    iconAnchor: [10, 30],
    popupAnchor: [0, -32],
  })
}

function makePopup(p: any) {
  const budget = p.budget
    ? '₱' + Number(p.budget).toLocaleString('en-PH', { maximumFractionDigits: 0 })
    : '—'
  const color = getColor(p.status)
  const desc = (p.description || 'No description').slice(0, 100)
  return `
    <div style="font-family:-apple-system,sans-serif;min-width:220px">
      <div style="font-size:9px;color:#8b949e;font-family:monospace;margin-bottom:3px">${p.contract_id || ''}</div>
      <div style="font-size:12px;font-weight:600;color:#e6edf3;margin-bottom:8px;line-height:1.4">${desc}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;font-size:11px">
        <div><div style="color:#484f58;font-size:9px">Region</div>
             <div style="color:#8b949e">${p.region || '—'}</div></div>
        <div><div style="color:#484f58;font-size:9px">Category</div>
             <div style="color:#8b949e">${p.category || '—'}</div></div>
        <div><div style="color:#484f58;font-size:9px">Budget</div>
             <div style="color:#3fb950;font-weight:600">${budget}</div></div>
        <div><div style="color:#484f58;font-size:9px">Progress</div>
             <div style="color:#58a6ff;font-weight:600">${p.progress || 0}%</div></div>
      </div>
      <span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:9px;font-weight:600;
        background:${color}22;border:1px solid ${color}55;color:${color}">${p.status || 'Unknown'}</span>
    </div>`
}

async function loadAllPins(
  statusFilter: string,
  searchFilter: string,
  onBatch: (rows: any[]) => void,
  onDone: (total: number) => void
) {
  const BATCH = 10_000
  let offset = 0
  let total = 0

  while (true) {
    let q = supabase
      .from('dpwh_projects')
      .select('contract_id,description,region,category,status,budget,progress,latitude,longitude')
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .neq('latitude', 0)
      .neq('longitude', 0)

    if (statusFilter) q = q.eq('status', statusFilter)
    if (searchFilter.trim()) q = q.ilike('description', `%${searchFilter}%`)

    const { data } = await q.range(offset, offset + BATCH - 1)
    if (!data || data.length === 0) break

    onBatch(data)
    total += data.length
    offset += BATCH
    if (data.length < BATCH) break
  }

  onDone(total)
}

export default function MapView() {
  const mapEl = useRef<HTMLDivElement>(null)
  const mapInst = useRef<any>(null)
  const clusterRef = useRef<any>(null)
  const abortRef = useRef(false)

  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(0)
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState('')
  const [rawSearch, setRawSearch] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setSearch(rawSearch), 600)
    return () => clearTimeout(t)
  }, [rawSearch])

  useEffect(() => {
    if (!mapEl.current || mapInst.current) return

    ;(async () => {
      const L = (await import('leaflet')).default
      await import('@/lib/leaflet-fix')
      await import('leaflet.markercluster')

      const map = L.map(mapEl.current!, { center: [12.88, 121.77], zoom: 6, preferCanvas: true })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      const cluster = (L as any).markerClusterGroup({
        chunkedLoading: true,
        chunkInterval: 50,
        chunkDelay: 10,
        maxClusterRadius: 60,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        iconCreateFunction: (c: any) => {
          const n = c.getChildCount()
          const size = n > 1000 ? 46 : n > 100 ? 38 : 30
          const col = n > 1000 ? '#f85149' : n > 100 ? '#d29922' : '#58a6ff'
          return L.divIcon({
            html: `<div style="width:${size}px;height:${size}px;border-radius:50%;
              background:${col}22;border:2px solid ${col};
              display:flex;align-items:center;justify-content:center;
              font-size:${size < 38 ? 10 : 12}px;font-weight:700;color:${col};
              font-family:-apple-system,sans-serif">
              ${n > 999 ? Math.round(n / 1000) + 'k' : n}
            </div>`,
            className: '',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          })
        },
      })

      map.addLayer(cluster)
      mapInst.current = map
      clusterRef.current = cluster
      setReady(true)
    })()

    return () => {
      mapInst.current?.remove()
      mapInst.current = null
      clusterRef.current = null
    }
  }, [])

  const loadMarkers = useCallback(async () => {
    if (!ready || !clusterRef.current) return

    abortRef.current = true
    await new Promise(r => setTimeout(r, 80))
    abortRef.current = false

    setLoading(true)
    setLoaded(0)
    setTotal(0)
    clusterRef.current.clearLayers()

    const L = (await import('leaflet')).default
    const iconCache: Record<string, any> = {}

    await loadAllPins(
      status,
      search,
      (batch) => {
        if (abortRef.current) return

        const markers: any[] = []
        for (const p of batch) {
          const lat = Number(p.latitude)
          const lng = Number(p.longitude)
          if (!lat || !lng || isNaN(lat) || isNaN(lng)) continue
          if (lat < 4 || lat > 22 || lng < 116 || lng > 128) continue

          const s = p.status || 'Unknown'
          if (!iconCache[s]) iconCache[s] = makePin(getColor(s), L)

          const marker = L.marker([lat, lng], { icon: iconCache[s] })
          marker.bindPopup(
            () => {
              const d = document.createElement('div')
              d.innerHTML = makePopup(p)
              return d
            },
            { maxWidth: 280, className: 'dpwh-popup' }
          )
          markers.push(marker)
        }

        clusterRef.current?.addLayers(markers)
        setLoaded(n => n + batch.length)
      },
      (n) => {
        setTotal(n)
        setLoading(false)
      }
    )
  }, [ready, status, search])

  useEffect(() => { loadMarkers() }, [loadMarkers])

  const statusList = STATUSES.map(s => s.value)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.75rem' }}>
      <div className="card-elevated" style={{ padding: '0.75rem 1rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <input
            className="input"
            style={{ width: 220, height: 34, fontSize: '0.8rem' }}
            placeholder="Search project names…"
            value={rawSearch}
            onChange={e => setRawSearch(e.target.value)}
          />

          {['', ...statusList].map(s => (
            <button
              key={s || 'all'}
              onClick={() => setStatus(s)}
              style={{
                padding: '3px 11px',
                borderRadius: 999,
                fontSize: '0.72rem',
                fontWeight: 500,
                border: '1px solid',
                cursor: 'pointer',
                transition: 'all 0.15s',
                borderColor: status === s ? (s ? getColor(s) : '#388bfd') : '#30363d',
                background: status === s ? `${s ? getColor(s) : '#388bfd'}22` : 'transparent',
                color: status === s ? (s ? getColor(s) : '#58a6ff') : '#8b949e',
              }}
            >
              {s || 'All'}
            </button>
          ))}

          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#8b949e' }}>
            {loading ? `Loading… ${loaded.toLocaleString()} pins` : `${total.toLocaleString()} projects on map`}
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: 8 }}>
          {statusList.map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: getColor(s) }} />
              <span style={{ fontSize: '0.68rem', color: '#8b949e' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          position: 'relative',
          minHeight: 300,
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid #30363d',
        }}
      >
        <div ref={mapEl} style={{ width: '100%', height: '100%' }} />

        {loading && (
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 999,
              background: 'rgba(13,17,23,0.92)',
              border: '1px solid #30363d',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: '0.75rem',
              color: '#8b949e',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                border: '2px solid #58a6ff',
                borderTopColor: 'transparent',
                animation: 'mapspin 0.8s linear infinite',
                flexShrink: 0,
              }}
            />
            Loading {loaded.toLocaleString()} pins…
          </div>
        )}
      </div>

      <style>{`
        @keyframes mapspin { to { transform: rotate(360deg); } }
        .dpwh-popup .leaflet-popup-content-wrapper {
          background: #1c2128 !important;
          border: 1px solid #30363d !important;
          border-radius: 10px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5) !important;
          color: #e6edf3 !important;
          padding: 0 !important;
        }
        .dpwh-popup .leaflet-popup-content  { margin: 12px 14px !important; }
        .dpwh-popup .leaflet-popup-tip      { background: #1c2128 !important; }
        .dpwh-popup .leaflet-popup-close-button { color: #8b949e !important; }
        .leaflet-container { background: #0d1117 !important; }
        .leaflet-control-attribution {
          background: rgba(13,17,23,0.85) !important;
          color: #484f58 !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a { color: #58a6ff !important; }
        .leaflet-control-zoom a {
          background: #1c2128 !important;
          color: #e6edf3 !important;
          border-color: #30363d !important;
        }
        .leaflet-control-zoom a:hover { background: #21262d !important; }
      `}</style>
    </div>
  )
}
