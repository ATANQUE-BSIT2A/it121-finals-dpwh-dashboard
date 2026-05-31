'use client';

import AppLayout from '@/components/AppLayout'
import { getRegions } from '@/lib/queries'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { formatPeso } from '@/lib/utils'

async function fetchAllRows(selectQuery: any) {
  const allData: any[] = []
  let page = 0
  const pageSize = 1000
  
  while (true) {
    const { data, error } = await selectQuery.range(page * pageSize, (page + 1) * pageSize - 1)
    if (error) {
      console.error('Error fetching all rows:', error)
      break
    }
    if (!data || data.length === 0) break
    allData.push(...data)
    if (data.length < pageSize) break
    page++
  }
  
  return allData
}

export default function MapPage() {
  const regions = getRegions()
  const [regionData, setRegionData] = useState<Record<string, { count: number, totalBudget: number, completed: number, ongoing: number }>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const allProjects = await fetchAllRows(supabase.from('dpwh_projects').select('region, status, budget'))
      
      const data: Record<string, { count: number, totalBudget: number, completed: number, ongoing: number }> = {}
      
      regions.forEach(region => {
        data[region] = { count: 0, totalBudget: 0, completed: 0, ongoing: 0 }
      })
      
      allProjects.forEach(project => {
        if (project.region && data[project.region]) {
          data[project.region].count++
          data[project.region].totalBudget += project.budget || 0
          if (project.status === 'Completed') {
            data[project.region].completed++
          } else if (project.status === 'On-Going' || project.status === 'On Going') {
            data[project.region].ongoing++
          }
        }
      })
      
      setRegionData(data)
      setLoading(false)
    }
    loadData()
  }, [regions])

  if (loading) {
    return (
      <AppLayout title="Map View">
        <div className="card-elevated text-center p-8">
          <p style={{ color: '#8b949e' }}>Loading map data...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Map View">
      <div className="card-elevated">
        <h3 style={{ color: '#e6edf3', fontSize: '1.2rem', marginBottom: '1rem' }}>
          Regional Project Overview
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {regions.map(region => {
            const data = regionData[region] || { count: 0, totalBudget: 0, completed: 0, ongoing: 0 }
            return (
              <div key={region} className="card-elevated p-4" style={{ border: '1px solid #30363d' }}>
                <h4 style={{ color: '#e6edf3', fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                  {region}
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: '#8b949e' }}>Total Projects:</span>
                    <span style={{ color: '#e6edf3' }}>{data.count}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: '#8b949e' }}>Total Budget:</span>
                    <span style={{ color: '#e6edf3' }}>{formatPeso(data.totalBudget)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: '#3fb950' }}>Completed:</span>
                    <span style={{ color: '#3fb950' }}>{data.completed}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span style={{ color: '#58a6ff' }}>Ongoing:</span>
                    <span style={{ color: '#58a6ff' }}>{data.ongoing}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}
