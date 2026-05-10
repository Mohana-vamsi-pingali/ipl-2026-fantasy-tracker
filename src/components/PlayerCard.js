'use client'

import Link from 'next/link'

// Rotating accent colors per card index
const CARD_ACCENTS = [
  { border: '#FFD700', glow: 'rgba(255,215,0,0.15)',  text: '#FFD700'  }, // gold
  { border: '#00D4FF', glow: 'rgba(0,212,255,0.15)',  text: '#00D4FF'  }, // electric blue
  { border: '#FF6B00', glow: 'rgba(255,107,0,0.15)',  text: '#FF6B00'  }, // orange
  { border: '#9B59B6', glow: 'rgba(155,89,182,0.15)', text: '#B07FD4'  }, // purple
  { border: '#2ECC71', glow: 'rgba(46,204,113,0.15)', text: '#2ECC71'  }, // emerald
  { border: '#E74C3C', glow: 'rgba(231,76,60,0.15)',  text: '#FF6B6B'  }, // red
  { border: '#1ABC9C', glow: 'rgba(26,188,156,0.15)', text: '#1ABC9C'  }, // teal
  { border: '#F39C12', glow: 'rgba(243,156,18,0.15)', text: '#F39C12'  }, // amber
  { border: '#3498DB', glow: 'rgba(52,152,219,0.15)', text: '#5DADE2'  }, // blue
]

function StatItem({ label, value, accent }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">{label}</span>
      <span className="text-base font-bold text-white mt-0.5" style={{ color: accent }}>{value}</span>
    </div>
  )
}

export default function PlayerCard({ stat, rank, accentIndex }) {
  const accent = CARD_ACCENTS[accentIndex % CARD_ACCENTS.length]

  return (
    <div
      className="relative flex flex-col rounded-xl p-5 min-w-[220px] flex-shrink-0 sm:min-w-0 transition-transform duration-200 hover:-translate-y-1"
      style={{
        background: 'linear-gradient(135deg, #0e1628 0%, #111c30 100%)',
        border: `1px solid ${accent.border}40`,
        boxShadow: `0 0 20px ${accent.glow}, 0 4px 16px rgba(0,0,0,0.4)`,
      }}
    >
      {/* Colored top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ background: `linear-gradient(90deg, ${accent.border}, transparent)` }}
      />

      {/* Rank badge */}
      <div
        className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
        style={{ background: `${accent.border}22`, color: accent.border, border: `1px solid ${accent.border}44` }}
      >
        {rank}
      </div>

      {/* Player name */}
      <Link
        href={`/player/${encodeURIComponent(stat.player)}`}
        className="text-lg font-extrabold mb-4 pr-8 leading-tight hover:underline"
        style={{ color: accent.text }}
      >
        {stat.player}
      </Link>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <StatItem label="Total Pts"   value={stat.totalPoints.toLocaleString()} accent="white" />
        <StatItem label="Games"       value={stat.gamesPlayed}                  accent="white" />
        <StatItem label="Avg Pts"     value={stat.avgPoints}                    accent="white" />
        <StatItem label="Wins"        value={stat.wins}                         accent={accent.text} />
        <StatItem label="Win Rate"    value={`${stat.winRate}%`}               accent={accent.text} />
        <StatItem label="Avg Pos"     value={stat.avgPosition}                  accent="white" />
      </div>
    </div>
  )
}
