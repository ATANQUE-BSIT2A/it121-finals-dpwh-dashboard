'use client'
import AppLayout from '@/components/AppLayout'
import MapView from '@/components/MapView'

export default function MapPage() {
  return (
    <AppLayout title="Map View">
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <MapView />
      </div>
    </AppLayout>
  )
}
