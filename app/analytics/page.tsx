import AppLayout from '@/components/AppLayout'
import { formatPeso } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

export default async function AnalyticsPage() {
  return (
    <AppLayout title="Analytics">
      <div className="card-elevated">
        <h2 style={{ color: '#e6edf3', fontSize: '1.2rem', marginBottom: '1rem' }}>
          Analytics (Coming Soon)
        </h2>
        <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>
          Advanced analytics features will be available here.
        </p>
      </div>
    </AppLayout>
  )
}
