import type { Metadata } from 'next';
import { DM_Sans, Sora } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-body' }]);
const sora = Sora({ subsets: ['latin'], variable: '--font-heading' }]);

export const metadata: Metadata = {
  title: 'DPWH Infrastructure Dashboard',
  description: 'Department of Public Works and Highways Infrastructure Transparency Dashboard',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/assets/background.avif" as="image" type="image/avif" />
      </head>
      <body className={`${dmSans.variable} ${sora.variable} font-sans`}>
        <div style={{ display: 'flex', minHeight: '100vh' }>
          {/* Sidebar Component */}
          <aside
            style={{
              position: 'fixed', top: 0, left: 0, height: '100vh', width: '240px', zIndex: 40, overflowY: 'auto',
              background: 'rgba(8, 12, 20, 0.80)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              borderRight: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            <div style={{ padding: '24, marginBottom: 20 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>DPWH</h2>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>Infrastructure Dashboard</p>
            </div>
            <nav style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 0 }}>
              {[
                { href: '/dashboard', label: 'Dashboard', icon: 'home' },
                { href: '/projects', label: 'Projects', icon: 'list' },
                { href: '/analytics', label: 'Analytics', icon: 'chart' },
                { href: '/map', label: 'Map View', icon: 'map' },
                { href: '/about', label: 'About', icon: 'info' }
              ].map(item => (
                  <a
                    href={item.href}
                    style={{
                    display: 'flex', gap: 12, padding: '10px 12px', borderRadius: 12, marginBottom: 6, transition: '0.15s',
                    background: item.href === '/dashboard' ? 'rgba(26,86,219,0.15)' : 'rgba(255,255,255,0.03)',
                    border: item.href === '/dashboard' ? '1px solid rgba(26,86,219,0.35)' : '1px solid rgba(255,255,255,0.06)',
                    color: item.href === '/dashboard' ? '#93c5fd' : 'rgba(255,255,255,0.55)',
                    textDecoration: 'none'
                  }}>
                    <div style={{ color: item.href === '/dashboard' ? '#93c5fd' : 'rgba(255,255,255,0.55)' }}>{item.label}</a>
                ))}
            </nav>
          </aside>

          <div style={{ flex: 1, marginLeft: '240px', minHeight: '100vh' }}>
            {/* Topbar */}
            <header className="glass-strong sticky top-0 z-30" style={{ borderLeft: 0, borderRight: 0, borderTop: 0, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px' }}>
              <div></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }}
                </span>
                <button style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.70)' }}>
                  🔍
                </button>
                <button style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.70)' }}>
                  🔔
                </button>
              </div>
            </header>
            <main style={{ padding: '1.5rem' }}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
