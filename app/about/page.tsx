import AppLayout from '@/components/AppLayout'

const teamMembers = [
  { name: 'Albert Matthew V. Calibjo', photo: '/photos/ALBERT.png', age: 20, location: 'Mandog, Maasin, Iloilo', position: 'Foreman', amountStolen: '69,000 php' },
  { name: 'Allen James A. Jolampong', photo: '/photos/ALLEN.png', age: 20, location: 'Nasa comment section ang link', position: 'doggy', amountStolen: '6.7M php' },
  { name: 'Julz Benedict D. Cometa', photo: '/photos/JULZ.png', age: 20, location: 'Bingo Plus link pls', position: 'Tamby', amountStolen: '420M php' },
  { name: 'Raven T. Animas', photo: '/photos/RAVEN.png', age: 20, location: 'Brgy. Mohon Arevalo, Iloilo City', position: 'Bata ni Henry Sy', amountStolen: '100M php' },
  { name: 'Roj Gabriel P. Atanque', photo: '/photos/ROJ_.png', age: 20, location: 'Don Francisco Village, Jaro, Iloilo City', position: 'Helicopter', amountStolen: '120M php' },
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
                margin: 0,
                marginBottom: '0.5rem'
              }}>
                {member.name}
              </p>
              <div style={{ fontSize: '0.85rem', color: '#8b949e', lineHeight: 1.6 }}>
                <p style={{ margin: 0 }}>Age: {member.age}</p>
                <p style={{ margin: 0 }}>Location: {member.location}</p>
                <p style={{ margin: 0 }}>Position: {member.position}</p>
                <p style={{ margin: 0 }}>Amount Stolen: {member.amountStolen}</p>
              </div>
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
