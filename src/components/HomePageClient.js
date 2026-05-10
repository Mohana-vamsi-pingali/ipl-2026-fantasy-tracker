'use client'

import { useState, useMemo } from 'react'
import PlayerCard from '@/components/PlayerCard'
import LeaderboardTable from '@/components/LeaderboardTable'

const SORT_OPTIONS = [
  { value: 'totalPoints', label: 'Total Points' },
  { value: 'avgPoints',   label: 'Avg Points'   },
  { value: 'wins',        label: 'Wins'          },
  { value: 'winRate',     label: 'Win Rate'      },
  { value: 'avgPosition', label: 'Avg Position'  },
  { value: 'gamesPlayed', label: 'Games Played'  },
]

// Avg Position sorts ascending (lower = better); everything else descending
const ASCENDING_KEYS = new Set(['avgPosition'])

export default function HomePageClient({ stats, totalMatches }) {
  const [sortKey, setSortKey] = useState('totalPoints')

  const sorted = useMemo(() => {
    const asc = ASCENDING_KEYS.has(sortKey)
    return [...stats].sort((a, b) =>
      asc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]
    )
  }, [stats, sortKey])

  const topPlayer = sorted[0]?.player

  return (
    <>
      {/* ── Sort control ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <label htmlFor="sort-select" className="text-sm text-gray-400 whitespace-nowrap font-medium">
          Sort by:
        </label>
        <div className="relative">
          <select
            id="sort-select"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="appearance-none bg-[#0e1628] border border-white/10 text-white text-sm rounded-lg
                       px-4 py-2 pr-8 cursor-pointer focus:outline-none focus:border-yellow-400/60
                       hover:border-white/20 transition-colors"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {/* Custom chevron */}
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
        </div>
        <span className="text-xs text-gray-600">
          {ASCENDING_KEYS.has(sortKey) ? '(lower is better)' : '(highest first)'}
        </span>
      </div>

      {/* ── Stat Cards ───────────────────────────────────────── */}
      {/* Mobile: horizontal scroll; Desktop: 3–4 col grid */}
      <div className="mb-10">
        {/* Mobile scroll container */}
        <div className="flex gap-4 overflow-x-auto pb-3 sm:hidden">
          {sorted.map((stat, i) => (
            <PlayerCard key={stat.player} stat={stat} rank={i + 1} accentIndex={i} />
          ))}
        </div>

        {/* Desktop grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 2xl:grid-cols-5">
          {sorted.map((stat, i) => (
            <PlayerCard key={stat.player} stat={stat} rank={i + 1} accentIndex={i} />
          ))}
        </div>
      </div>

      {/* ── Leaderboard Table ────────────────────────────────── */}
      <div className="mb-2 flex items-baseline gap-3">
        <h2 className="text-xl font-bold text-white">Leaderboard Table</h2>
        <span className="text-xs text-gray-500">Click any column header for independent table sort</span>
      </div>
      <LeaderboardTable stats={stats} externalSortKey={sortKey} />
    </>
  )
}
