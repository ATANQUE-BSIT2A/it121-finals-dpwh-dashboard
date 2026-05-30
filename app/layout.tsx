import type { Metadata } from 'next';
import { DM_Sans, Sora } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-body' });
const sora = Sora({ subsets: ['latin'], variable: '--font-heading' });

export const metadata: Metadata = {
  title: 'DPWH Infrastructure Dashboard',
  description: 'Department of Public Works and Highways Infrastructure Transparency Dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${sora.variable} font-sans`}>
        <div className="flex min-h-screen">
          <aside
            className="fixed left-0 top-0 h-screen w-60 z-40 overflow-y-auto"
            style={{
              background: 'rgba(8,12,20,0.8)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRight: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="p-6 mb-6">
              <h2 className="text-2xl font-bold text-white">DPWH</h2>
              <p className="text-xs text-white/40">Infrastructure Dashboard</p>
            </div>
            <nav className="px-4 space-y-2">
              {[
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/projects', label: 'Projects' },
                { href: '/analytics', label: 'Analytics' },
                { href: '/map', label: 'Map View' },
                { href: '/about', label: 'About' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
                  style={{
                    background:
                      item.href === '/dashboard'
                        ? 'rgba(26,86,219,0.15)'
                        : 'rgba(255,255,255,0.03)',
                    border:
                      item.href === '/dashboard'
                        ? '1px solid rgba(26,86,219,0.35)'
                        : '1px solid rgba(255,255,255,0.06)',
                    color: item.href === '/dashboard' ? '#93c5fd' : 'rgba(255,255,255,0.55)',
                    textDecoration: 'none',
                  }}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>

          <div className="flex-1 ml-60 min-h-screen">
            <header
              className="glass-strong sticky top-0 z-30 px-6 py-3 flex justify-between items-center"
              style={{
                borderLeft: 0,
                borderRight: 0,
                borderTop: 0,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div></div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-white/50">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <button
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10,
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  🔍
                </button>
                <button
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10,
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  🔔
                </button>
              </div>
            </header>

            <main className="p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
