import AppLayout from '@/components/AppLayout'

export default function AboutPage() {
  return (
    <AppLayout title="About">
      <div className="card-elevated" style={{ marginBottom: '1rem' }}>
        <h2 style={{ color: '#e6edf3', fontSize: '1.2rem', marginBottom: '0.75rem' }}>
          DPWH Infrastructure Dashboard
        </h2>
        <p style={{ color: '#8b949e', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1rem' }}>
          This dashboard provides transparency into public infrastructure projects of the Department of Public Works and Highways (DPWH) of the Philippines.
        </p>
      </div>

      <div className="card-elevated" style={{ marginBottom: '1rem' }}>
        <h3 style={{ color: '#e6edf3', fontSize: '1rem', marginBottom: '0.75rem' }}>
          Technology Stack
        </h3>
        <ul style={{ color: '#8b949e', fontSize: '0.9rem', marginLeft: '1.25rem' }}>
          <li style={{ marginBottom: '0.25rem' }}>Next.js</li>
          <li style={{ marginBottom: '0.25rem' }}>Supabase</li>
          <li style={{ marginBottom: '0.25rem' }}>Vercel</li>
          <li style={{ marginBottom: '0.25rem' }}>Recharts</li>
        </ul>
      </div>

      <div className="card-elevated">
        <h3 style={{ color: '#e6edf3', fontSize: '1rem', marginBottom: '0.75rem' }}>
          Data Source
        </h3>
        <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>
          Data from transparency.dpwh.gov.ph
        </p>
        <p style={{ color: '#484f58', fontSize: '0.8rem', marginTop: '0.5rem' }}>
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </AppLayout>
  )
}
