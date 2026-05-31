'use client';

export default function Topbar() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="glass-strong sticky top-0 z-30 px-6 py-3 flex items-center justify-between" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
      <h2 className="text-xl font-heading font-semibold text-white">Infrastructure Dashboard</h2>
      <div className="flex items-center">
        <span className="text-sm text-white/50">{today}</span>
      </div>
    </header>
  );
}
