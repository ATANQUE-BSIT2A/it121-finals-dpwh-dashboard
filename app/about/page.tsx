import AppLayout from '@/components/AppLayout'

const teamMembers = [
  { name: 'Albert Matthew V. Calibjo', photo: '/photos/ALBERT.png', age: 20, location: 'Mandog, Maasin, Iloilo', position: 'Foreman', amountStolen: '69,000 php' },
  { name: 'Allen James A. Jolampong', photo: '/photos/ALLEN.png', age: 20, location: 'Nasa comment section ang link', position: 'doggy', amountStolen: '6.7M php' },
  { name: 'Julz Benedict D. Cometa', photo: '/photos/JULZ.png', age: 20, location: 'Bingo Plus link pls', position: 'Tamby', amountStolen: '420M php' },
  { name: 'Raven T. Animas', photo: '/photos/RAVEN.png', age: 20, location: 'Brgy. Mohon Arevalo, Iloilo City', position: 'Bata ni Henry Sy', amountStolen: '100M php' },
  { name: 'Roj Gabriel P. Atanque', photo: '/photos/ROJ_.png', age: 20, location: 'Don Francisco Village, Jaro, Iloilo City', position: 'Helicopter', amountStolen: '120M php' },
]

const techStack = [
  {
    name: 'Next.js 15',
    description: 'Powers the core application. It handles both the frontend UI and backend API routes, ensuring fast page loads and seamless navigation.'
  },
  {
    name: 'Supabase',
    description: 'Serves as our cloud database. It securely stores, filters, and instantly serves thousands of raw DPWH project and contractor records.'
  },
  {
    name: 'Vercel',
    description: 'Hosts the live website. It provides automated, high-speed cloud hosting to ensure the dashboard is always fast and accessible.'
  },
  {
    name: 'Recharts',
    description: 'Drives the analytics. It transforms complex government spreadsheets into clean, interactive, and responsive visual charts.'
  },
  {
    name: 'Tailwind CSS',
    description: 'Manages the visual design. It enables a clean, modern, and fully mobile-responsive user interface with minimal footprint.'
  },
]

export default function AboutPage() {
  return (
    <AppLayout title="About">
      <div className="card-elevated" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#e6edf3', fontSize: '1.5rem', marginBottom: '0.75rem', fontWeight: 700 }}>
          Damo Project Waay Human Dashboard
        </h2>
        <div style={{ color: '#8b949e', fontSize: '1rem', lineHeight: '1.8', marginBottom: '1rem' }}>
          <p style={{ marginBottom: '1rem', fontWeight: 'bold', color: '#e6edf3' }}>
            About this project
          </p>
          <p style={{ marginBottom: '1rem' }}>
            The DPWH Infrastructure Dashboard is an interactive, data-driven web application developed as a final project for IT 121.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            Our mission is to promote civic awareness and data accessibility by transforming public government data into meaningful, easy-to-digest visual analytics. Utilizing official data sourced from the Department of Public Works and Highways (DPWH) transparency portal (transparency.dpwh.gov.ph), this platform tracks, organizes, and visualizes national infrastructure projects across the Philippines.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            Through automated tracking, geographical mappings, and contractor analytics, this dashboard provides citizens, students, and researchers with transparent insights into budget allocations, project distributions, and completion rates.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#e6edf3' }}>Key Features:</strong>
          </p>
          <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>Project Categorization: Breakdown of infrastructure by sector (roads, bridges, flood control).</li>
            <li style={{ marginBottom: '0.5rem' }}>Contractor Accountability: A performance and budget leaderboard of the top contractors handling public funds.</li>
            <li style={{ marginBottom: '0.5rem' }}>Progress Tracking: Data visualizations showing the real-time completion status of ongoing and suspended projects.</li>
          </ul>
        </div>
      </div>

      <div className="card-elevated" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ color: '#e6edf3', fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 600 }}>
          Meet the Team
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {teamMembers.map((member) => (
            <div key={member.name} style={{
              background: '#1c1c1e',
              border: '1px solid #38383a',
              borderRadius: '16px',
              padding: '1.25rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: 120,
                height: 120,
                borderRadius: '100%',
                overflow: 'hidden',
                margin: '0 auto 1rem auto',
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
                fontSize: '1.1rem', 
                fontWeight: 700, 
                margin: 0,
                marginBottom: '0.75rem'
              }}>
                {member.name}
              </p>
              <div style={{ fontSize: '0.9rem', color: '#8b949e', lineHeight: '1.7', textAlign: 'left' }}>
                <p style={{ margin: 0, marginBottom: '0.35rem' }}><strong style={{ color: '#58a6ff' }}>Age:</strong> {member.age}</p>
                <p style={{ margin: 0, marginBottom: '0.35rem' }}><strong style={{ color: '#58a6ff' }}>Location:</strong> {member.location}</p>
                <p style={{ margin: 0, marginBottom: '0.35rem' }}><strong style={{ color: '#58a6ff' }}>Position:</strong> {member.position}</p>
                <p style={{ margin: 0 }}><strong style={{ color: '#58a6ff' }}>Amount Stolen:</strong> {member.amountStolen}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-elevated" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ color: '#e6edf3', fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 600 }}>
          Technology Stack
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {techStack.map((tech) => (
            <div key={tech.name} style={{
              background: '#1c1c1e',
              border: '1px solid #38383a',
              borderRadius: '12px',
              padding: '1rem',
            }}>
              <p style={{ color: '#e6edf3', fontSize: '1rem', fontWeight: 700, margin: 0, marginBottom: '0.5rem' }}>
                {tech.name}
              </p>
              <p style={{ color: '#8b949e', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                {tech.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="card-elevated">
        <h3 style={{ color: '#e6edf3', fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 600 }}>
          Data Source
        </h3>
        <p style={{ color: '#8b949e', fontSize: '1rem' }}>
          Dataset from <a href="https://huggingface.co/datasets/bettergovph/dpwh-transparency-data/tree/main" style={{ color: '#58a6ff', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">https://huggingface.co/datasets/bettergovph/dpwh-transparency-data/tree/main</a>
        </p>
        <p style={{ color: '#484f58', fontSize: '0.9rem', marginTop: '0.75rem' }}>
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </AppLayout>
  )
}
