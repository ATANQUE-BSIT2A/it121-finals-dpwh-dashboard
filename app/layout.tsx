import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DPWH Infrastructure Dashboard',
  description: 'Philippine infrastructure project tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
