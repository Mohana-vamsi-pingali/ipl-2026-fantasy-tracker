'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'

const COLUMNS = [
  { key: 'rank',        label: 'Rank',         numeric: true },
  { key: 'player',      label: 'Player',        numeric: false },
  { key: 'gamesPlayed', label: 'Games',         numeric: true },
  { key: 'totalPoints', label: 'Total Pts',     numeric: true },
  { key: 'avgPoints',   label: 'Avg Pts',       numeric: true },
  { key: 'wins',        label: 'Wins',          numeric: true },
  { key: 'winRate',     label: 'Win Rate %',    numeric: true },
  { key: 'avgPosition', label: 'Avg Position',  numeric: true },
]

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' }

// Row accent classes by sorted rank
function rowStyle(rank) {
  if (rank === 1) return { background: 'rgba(255,215,0,0.10)', borderLeft: '3px solid #FFD700' }
  if (rank === 2) return { background: 'rgba(192,192,192,0.08)', borderLeft: '3px solid #C0C0C0' }
  if (rank === 3) return { background: 'rgba(205,127,50,0.08)', borderLeft: '3px solid #CD7F32' }
  return { borderLeft: '3px solid transparent' }
}

export default function LeaderboardTable({ stats, externalSortKey }) {
  // overallChamp is always the #1 by championshipPoints regardless of current sort
  const overallChamp = useMemo(
    () => [...stats].sort((a, b) => b.championshipPoints - a.championshipPoints)[0]?.player,
    [stats]
  )

  const [sortKey, setSortKey] = useState(externalSortKey ?? 'totalPoints')
  const [sortDir, setSortDir] = useState('desc') // 'asc' | 'desc'

  // Sync to dropdown when it changes
  useEffect(() => {
    if (externalSortKey) {
      setSortKey(externalSortKey)
      setSortDir(externalSortKey === 'avgPosition' ? 'asc' : 'desc')
    }
  }, [externalSortKey])

  function handleSort(key) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'player' ? 'asc' : 'desc')
    }
  }

  const sorted = useMemo(() => {
    const copy = [...stats]
    copy.sort((a, b) => {
      let av = a[sortKey]
      let bv = b[sortKey]
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return copy.map((row, i) => ({ ...row, rank: i + 1 }))
  }, [stats, sortKey, sortDir])

  function SortIcon({ col }) {
    if (col !== sortKey) return <span className="ml-1 opacity-20 text-xs">↕</span>
    return (
      <span className="ml-1 text-yellow-400 text-xs">
        {sortDir === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 shadow-2xl">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-white/10" style={{ background: '#0e1628' }}>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className={`
                  px-4 py-3 font-semibold tracking-wide uppercase text-xs cursor-pointer select-none
                  whitespace-nowrap transition-colors duration-150
                  ${col.numeric ? 'text-right' : 'text-left'}
                  ${sortKey === col.key ? 'text-yellow-400' : 'text-gray-400 hover:text-gray-200'}
                `}
              >
                {col.label}
                <SortIcon col={col.key} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, idx) => (
            <tr
              key={row.player}
              style={rowStyle(row.rank)}
              className={`
                border-b border-white/5 transition-colors duration-150 cursor-default
                ${idx % 2 === 1 ? 'bg-white/[0.02]' : ''}
                hover:bg-white/[0.06]
              `}
            >
              {/* Rank */}
              <td className="px-4 py-3 text-right font-bold text-gray-300 w-14">
                <span className="text-base">{MEDAL[row.rank] ?? row.rank}</span>
              </td>

              {/* Player name */}
              <td className="px-4 py-3 text-left font-semibold">
                <Link
                  href={`/player/${encodeURIComponent(row.player)}`}
                  className="hover:text-yellow-400 transition-colors duration-150 flex items-center gap-1.5"
                >
                  {row.player === overallChamp && (
                    <span title="Overall Champion" className="text-base">🏆</span>
                  )}
                  {row.player}
                </Link>
              </td>

              {/* Numeric columns */}
              <td className="px-4 py-3 text-right text-gray-300">{row.gamesPlayed}</td>
              <td className="px-4 py-3 text-right font-semibold text-white">{row.totalPoints.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-gray-300">{row.avgPoints}</td>
              <td className="px-4 py-3 text-right text-gray-300">{row.wins}</td>
              <td className="px-4 py-3 text-right text-gray-300">{row.winRate}%</td>
              <td className="px-4 py-3 text-right text-gray-300">{row.avgPosition}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
