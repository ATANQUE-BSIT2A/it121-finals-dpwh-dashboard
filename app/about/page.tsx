import AppLayout from '@/components/AppLayout'

const teamMembers = [
  { name: 'Albert', photo: '/photos/ALBERT.png' },
  { name: 'Allen', photo: '/photos/ALLEN.png' },
  { name: 'Julz', photo: '/photos/JULZ.png' },
  { name: 'Raven', photo: '/photos/RAVEN.png' },
  { name: 'Roj', photo: '/photos/ROJ_.png' },
]

export default function AboutPage() {
  return (
    <AppLayout title="About">
      <div className="card-elevated" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#e6edf3', fontSize: '1.5rem', marginBottom: '0.75rem', fontWeight: 700 }}>
          DPWH Infrastructure Dashboard
        </h2>
        <p style={{ color: '#8b949e', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
          This dashboard provides transparency into public infrastructure projects of the Department of Public Works and Highways (DPWH) of the Philippines.
        </p>
      </div>

      <div className="card-elevated" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ color: '#e6edf3', fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 600 }}>
          Meet the Team
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {teamMembers.map((member) => (
            <div key={member.name} style={{ textAlign: 'center' }}>
              <div style={{
                width: 140,
                height: 140,
                borderRadius: '20px',
                overflow: 'hidden',
                margin: '0 auto 0.75rem auto',
                border: '3px solid #30363d',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}>
                <img 
                  src={member.photo} 
                  alt={member.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <p style={{ 
                color: '#e6edf3', 
                fontSize: '1rem', 
                fontWeight: 600, 
                margin: 0 
              }}>
                {member.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="card-elevated" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ color: '#e6edf3', fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 600 }}>
          Technology Stack
        </h3>
        <ul style={{ color: '#8b949e', fontSize: '1rem', marginLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Next.js 15</li>
          <li style={{ marginBottom: '0.5rem' }}>Supabase</li>
          <li style={{ marginBottom: '0.5rem' }}>Vercel</li>
          <li style={{ marginBottom: '0.5rem' }}>Recharts</li>
          <li style={{ marginBottom: '0.5rem' }}>Tailwind CSS</li>
        </ul>
      </div>

      <div className="card-elevated">
        <h3 style={{ color: '#e6edf3', fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 600 }}>
          Data Source
        </h3>
        <p style={{ color: '#8b949e', fontSize: '1rem' }}>
          Data from transparency.dpwh.gov.ph
        </p>
        <p style={{ color: '#484f58', fontSize: '0.9rem', marginTop: '0.75rem' }}>
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </AppLayout>
  )
}
