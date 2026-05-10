import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'IPL Fantasy Tracker 2026',
  description: 'Track fantasy cricket points for IPL 2026 — leaderboards, match breakdowns, and player stats.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen flex flex-col" style={{ background: '#06091a', color: '#f1f5f9' }}>

        {/* Subtle background grid pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,215,0,0.07) 0%, transparent 60%),
              linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 40px 40px, 40px 40px',
          }}
        />

        <Navbar />

        <main className="flex-1 w-full">
          {children}
        </main>

        <footer className="border-t border-white/10 py-4 text-center text-sm text-gray-500">
          IPL Fantasy Tracker 2026 &middot; Built for friends
        </footer>

      </body>
    </html>
  )
}
