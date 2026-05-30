'use client'

import { useState, useEffect } from 'react'
import {
  getLastPlaceStats, getAllPlayerStats, getWorstLosingStreaks, getVolatilityStats, getSlowestStarters,
  getGhostAwardStats, getClosestNearMiss, getWorstSingleScore, getWorstScores, getBelowAverageStats, getImprovementStats
} from '@/lib/stats'

// ── Individual Hall of Doom card ────────────────────────────────────────────

function DoomCard({ id, emoji, title, statValue, players, subtitle, color = '#FF4444', onClick }) {
  const isClickable = !!onClick

  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }
  const rgb = hexToRgb(color);

  return (
    <div
      onClick={onClick}
      className={`relative h-full flex flex-col items-center text-center rounded-2xl p-6 border bg-gradient-to-b from-red-500/10 to-red-900/5 transition-transform duration-200 ${isClickable ? 'cursor-pointer hover:scale-[1.02]' : 'hover:-translate-y-1'}`}
      style={{
        borderColor: `rgba(${rgb}, 0.3)`,
        boxShadow: `0 0 24px rgba(${rgb}, 0.15), 0 4px 16px rgba(0,0,0,0.4)`
      }}
    >
      {/* Coloured top accent line */}
      <div
        className="absolute top-0 left-6 right-6 h-px rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      {/* Emoji icon */}
      <span className="text-4xl mb-3 select-none">{emoji}</span>

      {/* Record title */}
      <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2 flex items-center gap-1">
        {title}
        {isClickable && (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/10 text-white/70 text-[10px] ml-1" title="Click for full table">ℹ</span>
        )}
      </p>

      {/* Big stat number */}
      <p className="text-3xl font-black mb-1" style={{ color: color }}>
        {statValue}
      </p>

      {/* Player name(s) */}
      {players.length > 2 ? (
        <div className="flex flex-col gap-0.5 mb-1 mt-1">
          {players.map(p => <p key={p} className="text-sm font-bold text-white leading-tight">{p}</p>)}
        </div>
      ) : (
        <p className="text-base font-bold text-white mb-1 mt-1">{players.join(', ')}</p>
      )}

      {/* Optional subtitle (e.g. match info) */}
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1 leading-snug">{subtitle}</p>
      )}
    </div>
  )
}

function PlayerRow({ stat, isRank1 }) {
  const [expanded, setExpanded] = useState(false)
  const isZero = stat.lastPlaceCount === 0

  return (
    <>
      <tr
        onClick={() => !isZero && setExpanded(!expanded)}
        className={`transition-colors ${isZero ? 'opacity-40' : 'cursor-pointer hover:bg-white/5'} ${isRank1 && !isZero ? 'bg-red-500/10' : ''}`}
      >
        <td className="px-6 py-3 text-sm text-gray-400">{isZero ? '—' : stat.rank}</td>
        <td className={`px-6 py-3 text-sm font-bold ${isRank1 && !isZero ? 'text-red-400' : 'text-white'}`}>{stat.player}</td>
        <td className="px-6 py-3 text-sm font-black text-red-400 text-center">{stat.lastPlaceCount}</td>
        <td className="px-6 py-3 text-sm text-gray-400 text-right">{isZero ? '—' : `${stat.pct.toFixed(1)}%`}</td>
      </tr>
      {expanded && !isZero && (
        <tr className="bg-black/40">
          <td colSpan="4" className="px-6 py-4">
            <div className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">Matches finished last:</div>
            <div className="space-y-2">
              {stat.matches.map((m, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white/5 p-2 rounded">
                  <div>
                    <span className="font-bold text-white">Match {m.matchNumber}</span>
                    <span className="text-gray-500 ml-2">{m.teams}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-400">Score: {m.score}</div>
                    <div className="text-gray-500 text-[10px] uppercase tracking-wide">Rank: {m.rank}</div>
                  </div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function MatchesRow({ stat, isRank1, type }) {
  const [expanded, setExpanded] = useState(false)

  let isZero = false;
  let matchesLabel = "Matches:";
  let matchesData = [];

  if (type === 'worst-losing-streak') {
    isZero = stat.worstStreak <= 1;
    matchesLabel = "Matches in streak:";
    matchesData = stat.matches || [];
  } else if (type === 'slowest-starter') {
    isZero = stat.gamesPlayed < 10;
    matchesLabel = "First 10 matches:";
    matchesData = stat.first10Matches || [];
  } else if (type === 'ghost-award') {
    isZero = stat.longestSkipStreak === 0;
    matchesLabel = "Skipped matches in streak:";
    matchesData = stat.matches || [];
  } else if (type === 'most-silver-medals') {
    isZero = stat.silverCount === 0;
    matchesLabel = "Silver medal matches:";
    matchesData = stat.matches || [];
  } else if (type === 'below-average') {
    isZero = stat.belowAvgCount === 0;
    matchesLabel = "Below average matches:";
    matchesData = stat.matches || [];
  }

  return (
    <>
      <tr
        onClick={() => !isZero && setExpanded(!expanded)}
        className={`transition-colors ${isZero ? 'opacity-40' : 'cursor-pointer hover:bg-white/5'} ${isRank1 && !isZero ? 'bg-red-500/10' : ''}`}
      >
        <td className="px-6 py-3 text-sm text-gray-400">{isZero ? '—' : stat.rank}</td>
        <td className={`px-6 py-3 text-sm font-bold ${isRank1 && !isZero ? 'text-red-400' : 'text-white'}`}>{stat.player}</td>

        {type === 'worst-losing-streak' && (
          <>
            <td className="px-6 py-3 text-sm font-black text-red-400 text-center">{stat.worstStreak}</td>
            <td className="px-6 py-3 text-sm text-gray-400 text-right">
              {isZero ? '—' : (matchesData.length > 0 ? `Match ${matchesData[0].matchNumber} → Match ${matchesData[matchesData.length - 1].matchNumber}` : '—')}
            </td>
          </>
        )}

        {type === 'slowest-starter' && (
          <>
            <td className="px-6 py-3 text-sm font-black text-red-400 text-center">{stat.earlyAvg}</td>
            <td className="px-6 py-3 text-sm text-gray-400 text-right">
              {isZero ? `Insufficient data (${stat.gamesPlayed} games)` : '10'}
            </td>
          </>
        )}

        {type === 'ghost-award' && (
          <>
            <td className="px-6 py-3 text-sm font-black text-red-400 text-center">{stat.longestSkipStreak}</td>
            <td className="px-6 py-3 text-sm text-gray-400 text-right">
              {isZero ? 'Never skipped 🎖️' : (matchesData.length > 0 ? `Match ${matchesData[0].matchNumber} → Match ${matchesData[matchesData.length - 1].matchNumber}` : '—')}
            </td>
          </>
        )}


        {type === 'below-average' && (
          <>
            <td className="px-6 py-3 text-sm font-black text-red-400 text-center">{stat.belowAvgCount}</td>
            <td className="px-6 py-3 text-sm text-gray-400 text-center">{stat.gamesPlayed}</td>
            <td className="px-6 py-3 text-sm text-gray-400 text-right">{stat.belowAvgRate}%</td>
          </>
        )}
      </tr>
      {expanded && !isZero && matchesData.length > 0 && (
        <tr className="bg-black/40">
          <td colSpan="4" className="px-6 py-4">
            <div className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wider">{matchesLabel}</div>
            <div className="space-y-2">
              {matchesData.map((m, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white/5 p-2 rounded">
                  <div>
                    <span className="font-bold text-white">Match {m.matchNumber}</span>
                    <span className="text-gray-500 ml-2">{m.teams}</span>
                  </div>
                  {type === 'below-average' ? (
                    <div className="text-right">
                      <div className="font-bold text-red-400">Score: {m.score}</div>
                      <div className="text-gray-500 text-[10px] uppercase tracking-wide">Avg: {m.matchAvg} ({m.difference})</div>
                    </div>
                  ) : type === 'ghost-award' ? (
                    <div className="text-right">
                      <div className="text-gray-500 text-[10px] uppercase tracking-wide">Absent</div>
                    </div>
                  ) : (
                    <div className="text-right">
                      <div className="font-bold text-red-400">Score: {m.score}</div>
                      <div className="text-gray-500 text-[10px] uppercase tracking-wide">Rank: {m.rank}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function HallOfDoom() {
  const [activeModal, setActiveModal] = useState(null)

  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [activeModal])

  const lastPlaceData = getLastPlaceStats()
  const allStats = getAllPlayerStats()

  // Calculate most last place finishes for the card
  const maxLastPlace = lastPlaceData.length > 0 ? Math.max(...lastPlaceData.map(d => d.lastPlaceCount)) : 0
  const topLastPlacePlayers = lastPlaceData.filter(d => d.lastPlaceCount === maxLastPlace).map(d => d.player)

  // Calculate most skips
  const maxSkips = Math.max(...allStats.map(s => s.skips))
  const mostSkips = allStats.filter(s => s.skips === maxSkips)

  // Calculate worst losing streak
  const losingStreaks = getWorstLosingStreaks()
  const maxLosingStreak = losingStreaks.length > 0 ? Math.max(...losingStreaks.map(d => d.worstStreak)) : 0
  const topLosingPlayers = losingStreaks.filter(d => d.worstStreak === maxLosingStreak).map(d => d.player)

  // Calculate volatility
  const volatileStats = getVolatilityStats()
  const maxVolatile = volatileStats.length > 0 ? Math.max(...volatileStats.map(d => d.stdDev)) : 0
  const topVolatilePlayers = volatileStats.filter(d => d.stdDev === maxVolatile).map(d => d.player)

  // Calculate slowest starter
  const slowStarters = getSlowestStarters()
  const minEarlyAvg = slowStarters.length > 0 ? Math.min(...slowStarters.map(d => d.earlyAvg)) : 0
  const topSlowPlayers = slowStarters.filter(d => d.earlyAvg === minEarlyAvg).map(d => d.player)

  // Calculate Ghost Award
  const ghostStats = getGhostAwardStats()
  const maxGhost = ghostStats.length > 0 ? Math.max(...ghostStats.map(d => d.longestSkipStreak)) : 0
  const topGhostPlayers = ghostStats.filter(d => d.longestSkipStreak === maxGhost && maxGhost > 0).map(d => d.player)

  // Calculate Closest Near Miss
  const nearMisses = getClosestNearMiss()
  const minGap = nearMisses.length > 0 ? Math.min(...nearMisses.map(d => d.gapPercent)) : 0
  const topNearMisses = nearMisses.filter(d => d.gapPercent === minGap)
  const topNearMissPlayers = [...new Set(topNearMisses.map(d => d.player))]

  // Calculate Wooden Spoon
  const minPoints = allStats.length > 0 ? Math.min(...allStats.map(d => d.totalPoints)) : 0
  const woodenSpoonPlayers = allStats.filter(d => d.totalPoints === minPoints).map(d => d.player)

  // Calculate Worst Single Score
  const worstScores = getWorstSingleScore()
  const absoluteWorstScore = worstScores.length > 0 ? worstScores[0].score : 0
  const absoluteWorstPlayers = [...new Set(worstScores.map(d => d.player))]

  // Calculate Below Average Most Often
  const belowAvgStats = getBelowAverageStats()
  const maxBelowAvg = belowAvgStats.length > 0 ? Math.max(...belowAvgStats.map(d => d.belowAvgCount)) : 0
  const topBelowAvgPlayers = belowAvgStats.filter(d => d.belowAvgCount === maxBelowAvg && maxBelowAvg > 0).map(d => d.player)

  // Calculate Least Wins & Lowest Win Rate
  const eligibleDoom = allStats.filter(s => s.gamesPlayed >= 10)

  const minWins = eligibleDoom.length > 0 ? Math.min(...eligibleDoom.map(d => d.wins)) : 0
  const leastWins = eligibleDoom.filter(d => d.wins === minWins).map(d => d.player)

  const minWinRate = eligibleDoom.length > 0 ? Math.min(...eligibleDoom.map(d => d.winRate)) : 0
  const lowestWinRate = eligibleDoom.filter(d => d.winRate === minWinRate).map(d => d.player)

  // Calculate Biggest Decline
  const improvementStats = getImprovementStats()
  const minImprovement = improvementStats.length > 0 ? Math.min(...improvementStats.map(s => s.improvement)) : 0
  const biggestDecline = improvementStats.filter(s => s.improvement === minImprovement).map(s => s.player)

  const cards = [
    {
      id: 'last-place',
      emoji: '😤',
      title: 'Most Last Place Finishes',
      color: '#DC2626',
      statValue: `${maxLastPlace} times`,
      players: topLastPlacePlayers,
      subtitle: 'Last place = lowest rank among participants that day',
    },
    {
      id: 'most-skips',
      emoji: '💀',
      title: 'Most Skips',
      color: '#7C3AED',
      statValue: mostSkips[0]?.skips || 0,
      players: mostSkips.map(p => p.player),
      subtitle: mostSkips.length === 1 ? `${mostSkips[0].gamesPlayed} games played` : 'Multiple players',
    },
    {
      id: 'worst-losing-streak',
      emoji: '🥶',
      title: 'Worst Losing Streak',
      color: '#1D4ED8',
      statValue: `${maxLosingStreak} matches`,
      players: topLosingPlayers,
      subtitle: 'Consecutive matches without a win',
    },
    {
      id: 'most-volatile',
      emoji: '📊',
      title: 'Least Consistent Player',
      color: '#EA580C',
      statValue: `${maxVolatile}`,
      players: topVolatilePlayers,
      subtitle: 'Highest score standard deviation',
    },
    {
      id: 'slowest-starter',
      emoji: '🐢',
      title: 'Slowest Starter',
      color: '#92400E',
      statValue: `${minEarlyAvg}`,
      players: topSlowPlayers,
      subtitle: 'Lowest avg score in their first 10 matches played.',
    },
    {
      id: 'ghost-award',
      emoji: '👻',
      title: 'Ghost Award',
      color: '#0F766E',
      statValue: `${maxGhost} matches`,
      players: topGhostPlayers.length > 0 ? topGhostPlayers : ['—'],
      subtitle: 'Most consecutive matches skipped.',
    },

    {
      id: 'below-average',
      emoji: '😬',
      title: 'Below Average Most Often',
      color: '#4D7C0F',
      statValue: `${maxBelowAvg} matches`,
      players: topBelowAvgPlayers.length > 0 ? topBelowAvgPlayers : ['—'],
      subtitle: 'Most matches scored below the day\'s average.',
    },
    {
      id: 'closest-near-miss',
      emoji: '💔',
      title: 'Closest Near Miss',
      color: '#BE185D',
      statValue: `${minGap}% gap`,
      players: topNearMissPlayers.length > 0 ? [topNearMissPlayers.join(', ')] : ['—'],
      subtitle: 'Came 2nd by the smallest margin across all matches.',
    },
    {
      id: 'worst-single-score',
      emoji: '📆',
      title: 'Worst Single Match Score',
      color: '#9F1239',
      statValue: `${absoluteWorstScore} pts`,
      players: absoluteWorstPlayers.length > 0 ? absoluteWorstPlayers : ['—'],
      subtitle: 'Lowest individual score recorded this season.',
    },
    {
      id: 'least-wins',
      emoji: '😶',
      title: 'Least Wins',
      color: '#64748B',
      statValue: `${minWins} win${minWins === 1 ? '' : 's'}`,
      players: leastWins.length > 0 ? leastWins : ['—'],
      subtitle: 'Fewest match wins. Min 10 games.',
    },
    {
      id: 'lowest-win-rate',
      emoji: '📉',
      title: 'Lowest Win Rate',
      color: '#B45309',
      statValue: `${minWinRate}%`,
      players: lowestWinRate.length > 0 ? lowestWinRate : ['—'],
      subtitle: 'Worst wins per game ratio. Min 10 games.',
    },
    {
      id: 'biggest-decline',
      emoji: '🥴',
      title: 'Barely Improved',
      color: '#BE123C',
      statValue: `${minImprovement > 0 ? '+' : ''}${minImprovement} pts`,
      players: biggestDecline.length > 0 ? biggestDecline : ['—'],
      subtitle: 'Biggest avg score drop: first half vs second half of season.',
    }
    /*
    {
      id: 'wooden-spoon',
      emoji: '🗑️',
      title: 'Wooden Spoon',
      color: '#78350F',
      statValue: `${minPoints.toLocaleString()} pts`,
      players: woodenSpoonPlayers,
      subtitle: 'Lowest total points in the season.',
    }
    */
  ]

  // Helper to render modal
  const renderModalContent = () => {
    if (!activeModal) return null

    let modalTitle, modalDesc, tableHeader, tableBody

    if (activeModal === 'last-place') {
      modalTitle = "Most Last Place Finishes"
      modalDesc = "Tied last place counts for all tied players. Skips not counted."

      // Merge games played and last place count
      const tableData = allStats.map(s => {
        const lpData = lastPlaceData.find(lp => lp.player === s.player) || { lastPlaceCount: 0, matches: [] }
        return {
          player: s.player,
          gamesPlayed: s.gamesPlayed,
          lastPlaceCount: lpData.lastPlaceCount,
          matches: lpData.matches,
          pct: s.gamesPlayed > 0 ? (lpData.lastPlaceCount / s.gamesPlayed) * 100 : 0
        }
      })

      // Sort by last place count descending
      tableData.sort((a, b) => b.lastPlaceCount - a.lastPlaceCount)

      // Calculate ranks
      let currentRank = 0
      let lastVal = null
      const rankedData = tableData.map((stat) => {
        if (stat.lastPlaceCount !== lastVal && stat.lastPlaceCount > 0) {
          currentRank++
          lastVal = stat.lastPlaceCount
        }
        return { ...stat, rank: currentRank }
      })

      tableHeader = (
        <tr>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Rank</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Player</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-center">Last Place Finishes</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">% of Games Played</th>
        </tr>
      )

      tableBody = rankedData.map((stat) => (
        <PlayerRow key={stat.player} stat={stat} isRank1={stat.rank === 1 && stat.lastPlaceCount > 0} />
      ))
    } else if (activeModal === 'most-skips') {
      modalTitle = "Most Skips"
      modalDesc = "Total number of games skipped by each player"

      const sortedStats = [...allStats].sort((a, b) => b.skips - a.skips)
      let currentRank = 0
      let lastVal = null
      const rankedStats = sortedStats.map((stat, idx) => {
        if (stat.skips !== lastVal) { currentRank++; lastVal = stat.skips }
        return { ...stat, rank: currentRank }
      })

      tableHeader = (
        <tr>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Rank</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Player</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Skips</th>
        </tr>
      )

      tableBody = rankedStats.map((stat, idx) => (
        <tr key={stat.player} className="hover:bg-white/5 transition-colors">
          <td className="px-6 py-3 text-sm text-gray-400">{stat.rank}</td>
          <td className="px-6 py-3 text-sm font-bold text-white">{stat.player}</td>
          <td className="px-6 py-3 text-sm font-black text-red-400 text-right">{stat.skips}</td>
        </tr>
      ))
    } else if (activeModal === 'worst-losing-streak') {
      modalTitle = "Worst Losing Streak"
      modalDesc = "Consecutive matches without a rank 1 finish. Skips ignored."

      let currentRank = 0
      let lastVal = null
      const rankedData = losingStreaks.map((stat) => {
        if (stat.worstStreak !== lastVal) {
          currentRank++
          lastVal = stat.worstStreak
        }
        return { ...stat, rank: currentRank }
      })

      tableHeader = (
        <tr>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Rank</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Player</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-center">Worst Streak</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Matches</th>
        </tr>
      )

      tableBody = rankedData.map((stat) => (
        <MatchesRow key={stat.player} stat={stat} isRank1={stat.rank === 1 && stat.worstStreak > 1} type="worst-losing-streak" />
      ))
    } else if (activeModal === 'most-volatile') {
      modalTitle = "Least Consistent Player"
      modalDesc = "Higher σ = more unpredictable. Min 5 games to qualify."

      let currentRank = 0
      let lastVal = null
      const rankedData = volatileStats.map((stat) => {
        if (stat.stdDev !== lastVal) {
          currentRank++
          lastVal = stat.stdDev
        }
        return { ...stat, rank: currentRank }
      })

      tableHeader = (
        <tr>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Rank</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Player</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Std Dev (σ)</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Avg Score</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Highest</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Lowest</th>
        </tr>
      )

      tableBody = rankedData.map((stat) => {
        const isRank1 = stat.rank === 1;
        return (
          <tr key={stat.player} className={`hover:bg-white/5 transition-colors ${isRank1 ? 'bg-red-500/10' : ''}`}>
            <td className="px-6 py-3 text-sm text-gray-400">{stat.rank}</td>
            <td className={`px-6 py-3 text-sm font-bold ${isRank1 ? 'text-red-400' : 'text-white'}`}>{stat.player}</td>
            <td className="px-6 py-3 text-sm font-black text-red-400 text-right">{stat.stdDev}</td>
            <td className="px-6 py-3 text-sm text-gray-400 text-right">{stat.avgScore}</td>
            <td className="px-6 py-3 text-sm text-gray-400 text-right">{stat.highestScore}</td>
            <td className="px-6 py-3 text-sm text-gray-400 text-right">{stat.lowestScore}</td>
          </tr>
        );
      })
    } else if (activeModal === 'slowest-starter') {
      modalTitle = "Slowest Starter"
      modalDesc = "Based on each player's first 10 participated matches. Min 10 games to qualify."

      // We need to also show ineligible players at the bottom.
      // slowStarters only contains eligible players. Let's find ineligible ones.
      const ineligible = allStats
        .filter(s => !slowStarters.find(st => st.player === s.player))
        .map(s => {
          return { player: s.player, gamesPlayed: s.gamesPlayed, earlyAvg: 999999 }; // Dummy high value
        });

      let currentRank = 0
      let lastVal = null
      const rankedData = slowStarters.map((stat) => {
        if (stat.earlyAvg !== lastVal) {
          currentRank++
          lastVal = stat.earlyAvg
        }
        return { ...stat, rank: currentRank }
      })

      // Append ineligible players
      const fullData = [...rankedData, ...ineligible];

      tableHeader = (
        <tr>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Rank</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Player</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-center">Early Avg</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Games Used</th>
        </tr>
      )

      tableBody = fullData.map((stat) => (
        <MatchesRow key={stat.player} stat={stat} isRank1={stat.rank === 1 && stat.earlyAvg < 999999} type="slowest-starter" />
      ))
    } else if (activeModal === 'ghost-award') {
      modalTitle = "Ghost Award"
      modalDesc = "Consecutive matches with no submission."

      let currentRank = 0
      let lastVal = null
      const rankedData = ghostStats.map((stat) => {
        if (stat.longestSkipStreak !== lastVal) {
          currentRank++
          lastVal = stat.longestSkipStreak
        }
        return { ...stat, rank: currentRank }
      })

      tableHeader = (
        <tr>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Rank</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Player</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-center">Longest Skip Streak</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Matches</th>
        </tr>
      )

      tableBody = rankedData.map((stat) => (
        <MatchesRow key={stat.player} stat={stat} isRank1={stat.rank === 1 && stat.longestSkipStreak > 0} type="ghost-award" />
      ))
    } else if (activeModal === 'closest-near-miss') {
      modalTitle = "Closest Near Miss"
      modalDesc = "Rank 2 finishes ranked by % gap to the winner. Smaller = more heartbreaking."

      let currentRank = 0
      let lastVal = null
      // We only want top 10 near misses across ALL matches
      const top10 = nearMisses.slice(0, 10)
      const rankedData = top10.map((stat) => {
        if (stat.gapPercent !== lastVal) {
          currentRank++
          lastVal = stat.gapPercent
        }
        return { ...stat, rank: currentRank }
      })

      tableHeader = (
        <tr>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Rank</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Player</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Match</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Lost To</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Gap (pts)</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Gap %</th>
        </tr>
      )

      tableBody = rankedData.map((stat, idx) => {
        const isRank1 = stat.rank === 1;
        return (
          <tr key={`${stat.player}-${stat.matchNumber}-${idx}`} className={`hover:bg-white/5 transition-colors ${isRank1 ? 'bg-red-500/10' : ''}`}>
            <td className="px-6 py-3 text-sm text-gray-400">{stat.rank}</td>
            <td className={`px-6 py-3 text-sm font-bold ${isRank1 ? 'text-red-400' : 'text-white'}`}>{stat.player}</td>
            <td className="px-6 py-3 text-sm text-gray-400">Match {stat.matchNumber} <span className="text-[10px] ml-1">{stat.teams}</span></td>
            <td className="px-6 py-3 text-sm text-gray-400">{stat.rank1Player} ({stat.rank1Score})</td>
            <td className="px-6 py-3 text-sm font-bold text-red-400 text-right">{stat.gapPoints} pts</td>
            <td className="px-6 py-3 text-sm text-gray-400 text-right">{stat.gapPercent}%</td>
          </tr>
        );
      })
    } else if (activeModal === 'wooden-spoon') {
      modalTitle = "Wooden Spoon"
      modalDesc = "Full season total points ranking, bottom up."

      const sortedStats = [...allStats].sort((a, b) => a.totalPoints - b.totalPoints)
      let currentRank = 0
      let lastVal = null
      const rankedData = sortedStats.map((stat) => {
        if (stat.totalPoints !== lastVal) {
          currentRank++
          lastVal = stat.totalPoints
        }
        return { ...stat, rank: currentRank }
      })

      tableHeader = (
        <tr>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Rank</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Player</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Total Points</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Games Played</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Avg Points</th>
        </tr>
      )

      tableBody = rankedData.map((stat) => {
        const isRank1 = stat.rank === 1;
        return (
          <tr key={stat.player} className={`hover:bg-white/5 transition-colors ${isRank1 ? 'bg-red-500/10' : ''}`}>
            <td className="px-6 py-3 text-sm text-gray-400">{stat.rank}</td>
            <td className={`px-6 py-3 text-sm font-bold ${isRank1 ? 'text-red-400' : 'text-white'}`}>{stat.player}</td>
            <td className="px-6 py-3 text-sm font-black text-red-400 text-right">{stat.totalPoints.toLocaleString()}</td>
            <td className="px-6 py-3 text-sm text-gray-400 text-right">{stat.gamesPlayed}</td>
            <td className="px-6 py-3 text-sm text-gray-400 text-right">{stat.avgPoints}</td>
          </tr>
        );
      })
    } else if (activeModal === 'worst-single-score') {
      modalTitle = "Worst Single Match Score"
      modalDesc = "Bottom 10 individual match scores across the entire season."

      const bottom10 = getWorstScores(10)
      let currentRank = 0
      let lastVal = null
      const rankedData = bottom10.map((stat) => {
        if (stat.score !== lastVal) {
          currentRank++
          lastVal = stat.score
        }
        return { ...stat, rank: currentRank }
      })

      tableHeader = (
        <tr>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Rank</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Player</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Match</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Teams</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Score</th>
        </tr>
      )

      tableBody = rankedData.map((stat, idx) => {
        const isRank1 = stat.rank === 1;
        return (
          <tr key={`${stat.player}-${stat.matchNumber}-${idx}`} className={`hover:bg-white/5 transition-colors ${isRank1 ? 'bg-red-500/10' : ''}`}>
            <td className="px-6 py-3 text-sm text-gray-400">{stat.rank}</td>
            <td className={`px-6 py-3 text-sm font-bold ${isRank1 ? 'text-red-400' : 'text-white'}`}>{stat.player}</td>
            <td className="px-6 py-3 text-sm text-gray-400">Match {stat.matchNumber}</td>
            <td className="px-6 py-3 text-sm text-gray-400">{stat.teams}</td>
            <td className="px-6 py-3 text-sm font-bold text-red-400 text-right">{stat.score}</td>
          </tr>
        );
      })
    } else if (activeModal === 'below-average') {
      modalTitle = "Below Average Most Often"
      modalDesc = "Times each player scored below the match average. Skips excluded."

      const ineligible = allStats
        .filter(s => !belowAvgStats.find(st => st.player === s.player))
        .map(s => {
          return { player: s.player, belowAvgCount: 0, gamesPlayed: s.gamesPlayed, belowAvgRate: 0 };
        });

      let currentRank = 0
      let lastVal = null
      const rankedData = belowAvgStats.map((stat) => {
        if (stat.belowAvgCount !== lastVal) {
          currentRank++
          lastVal = stat.belowAvgCount
        }
        return { ...stat, rank: currentRank }
      })

      const fullData = [...rankedData, ...ineligible];

      tableHeader = (
        <tr>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Rank</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Player</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-center">Below Avg Count</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-center">Games Played</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Below Avg Rate</th>
        </tr>
      )

      tableBody = fullData.map((stat) => (
        <MatchesRow key={stat.player} stat={stat} isRank1={stat.rank === 1 && stat.belowAvgCount > 0} type="below-average" />
      ))
    } else if (activeModal === 'least-wins') {
      modalTitle = "Least Wins"
      modalDesc = "Fewest rank 1 finishes. Min 10 games to qualify."

      const eligible = allStats.filter(s => s.gamesPlayed >= 10).sort((a, b) => a.wins - b.wins)
      const ineligible = allStats.filter(s => s.gamesPlayed < 10)

      let currentRank = 0
      let lastVal = null
      const rankedData = eligible.map((stat) => {
        if (stat.wins !== lastVal) {
          currentRank++
          lastVal = stat.wins
        }
        return { ...stat, rank: currentRank }
      })

      tableHeader = (
        <tr>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Rank</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Player</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Wins</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Games Played</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Win Rate %</th>
        </tr>
      )

      tableBody = (
        <>
          {rankedData.map((stat) => {
            const isRank1 = stat.rank === 1;
            return (
              <tr key={stat.player} className={`hover:bg-white/5 transition-colors ${isRank1 ? 'bg-red-500/10' : ''}`}>
                <td className="px-6 py-3 text-sm text-gray-400">{stat.rank}</td>
                <td className={`px-6 py-3 text-sm font-bold ${isRank1 ? 'text-red-400' : 'text-white'}`}>{stat.player}</td>
                <td className="px-6 py-3 text-sm font-black text-red-400 text-right">{stat.wins}</td>
                <td className="px-6 py-3 text-sm text-gray-400 text-right">{stat.gamesPlayed}</td>
                <td className="px-6 py-3 text-sm text-gray-400 text-right">{stat.winRate}%</td>
              </tr>
            );
          })}
          {ineligible.map(stat => (
            <tr key={stat.player} className="opacity-40">
              <td className="px-6 py-3 text-sm text-gray-400">—</td>
              <td className="px-6 py-3 text-sm font-bold text-white">{stat.player}</td>
              <td colSpan="3" className="px-6 py-3 text-sm text-gray-400 text-right">Insufficient data ({stat.gamesPlayed} games)</td>
            </tr>
          ))}
        </>
      )
    } else if (activeModal === 'lowest-win-rate') {
      modalTitle = "Lowest Win Rate"
      modalDesc = "Win rate = wins ÷ games played × 100. Min 10 games to qualify."

      const eligible = allStats.filter(s => s.gamesPlayed >= 10).sort((a, b) => a.winRate - b.winRate)
      const ineligible = allStats.filter(s => s.gamesPlayed < 10)

      let currentRank = 0
      let lastVal = null
      const rankedData = eligible.map((stat) => {
        if (stat.winRate !== lastVal) {
          currentRank++
          lastVal = stat.winRate
        }
        return { ...stat, rank: currentRank }
      })

      tableHeader = (
        <tr>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Rank</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Player</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Win Rate %</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Wins</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Games Played</th>
        </tr>
      )

      tableBody = (
        <>
          {rankedData.map((stat) => {
            const isRank1 = stat.rank === 1;
            return (
              <tr key={stat.player} className={`hover:bg-white/5 transition-colors ${isRank1 ? 'bg-red-500/10' : ''}`}>
                <td className="px-6 py-3 text-sm text-gray-400">{stat.rank}</td>
                <td className={`px-6 py-3 text-sm font-bold ${isRank1 ? 'text-red-400' : 'text-white'}`}>{stat.player}</td>
                <td className="px-6 py-3 text-sm font-black text-red-400 text-right">{stat.winRate}%</td>
                <td className="px-6 py-3 text-sm text-gray-400 text-right">{stat.wins}</td>
                <td className="px-6 py-3 text-sm text-gray-400 text-right">{stat.gamesPlayed}</td>
              </tr>
            );
          })}
          {ineligible.map(stat => (
            <tr key={stat.player} className="opacity-40">
              <td className="px-6 py-3 text-sm text-gray-400">—</td>
              <td className="px-6 py-3 text-sm font-bold text-white">{stat.player}</td>
              <td colSpan="3" className="px-6 py-3 text-sm text-gray-400 text-right">Insufficient data ({stat.gamesPlayed} games)</td>
            </tr>
          ))}
        </>
      )
    } else if (activeModal === 'biggest-decline') {
      modalTitle = "Barely Improved"
      modalDesc = "Compares each player's average score in their first vs second half of matches played."

      const ineligible = allStats.filter(s => s.gamesPlayed < 10)

      // Sort improvementStats ascending to get biggest decline first
      const sortedStats = [...improvementStats].sort((a, b) => a.improvement - b.improvement)

      let currentRank = 0
      let lastVal = null
      const rankedData = sortedStats.map((stat) => {
        if (stat.improvement !== lastVal) {
          currentRank++
          lastVal = stat.improvement
        }
        return { ...stat, rank: currentRank }
      })

      tableHeader = (
        <tr>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Rank</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Player</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">First Half Avg</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Second Half Avg</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Change</th>
        </tr>
      )

      tableBody = (
        <>
          {rankedData.map((stat) => {
            const isRank1 = stat.rank === 1;
            const valClass = stat.improvement < 0 ? 'text-red-400' : stat.improvement > 0 ? 'text-green-400' : 'text-gray-400'
            const sign = stat.improvement > 0 ? '+' : ''
            return (
              <tr key={stat.player} className={`hover:bg-white/5 transition-colors ${isRank1 ? 'bg-red-500/10' : ''}`}>
                <td className="px-6 py-3 text-sm text-gray-400">{stat.rank}</td>
                <td className={`px-6 py-3 text-sm font-bold ${isRank1 ? 'text-red-400' : 'text-white'}`}>{stat.player}</td>
                <td className="px-6 py-3 text-sm text-gray-400 text-right">{stat.firstHalfAvg.toFixed(1)}</td>
                <td className="px-6 py-3 text-sm text-gray-400 text-right">{stat.secondHalfAvg.toFixed(1)}</td>
                <td className={`px-6 py-3 text-sm font-black text-right ${valClass}`}>{sign}{stat.improvement.toFixed(1)}</td>
              </tr>
            );
          })}
          {ineligible.map(stat => (
            <tr key={stat.player} className="opacity-40">
              <td className="px-6 py-3 text-sm text-gray-400">—</td>
              <td className="px-6 py-3 text-sm font-bold text-white">{stat.player}</td>
              <td colSpan="3" className="px-6 py-3 text-sm text-gray-400 text-right">Insufficient data ({stat.gamesPlayed} games)</td>
            </tr>
          ))}
        </>
      )
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
        <div
          className="bg-[#0a0f1c] border border-red-500/30 rounded-2xl w-full max-w-lg h-[80vh] flex flex-col shadow-[0_0_40px_rgba(255,68,68,0.15)] relative"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
            onClick={() => setActiveModal(null)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          <div className="p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>{cards.find(c => c.id === activeModal)?.emoji}</span> {modalTitle}
            </h3>
            <p className="text-sm text-gray-400 mt-1">{modalDesc}</p>
          </div>

          <div className="flex-1 p-0 overflow-y-auto custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#0a0f1c] sticky top-0 z-10">
                {tableHeader}
              </thead>
              <tbody className="divide-y divide-white/5">
                {tableBody}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section aria-labelledby="doom-heading" className="mt-16 mb-16">
      {/* Section header */}
      <div className="mb-6">
        <h2
          id="doom-heading"
          className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2"
        >
          <span>💀</span>
          Hall of{' '}
          <span className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-700">
            Doom
          </span>
        </h2>
        <p className="mt-1 text-sm text-gray-500">The darker side of the leaderboard</p>
      </div>

      {/* Same grid as Hall of Fame */}
      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
        {cards.map((c) => (
          <div key={c.id} className="w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.67rem)] lg:w-[calc(25%-0.75rem)]">
            <DoomCard
              {...c}
              onClick={() => setActiveModal(c.id)}
            />
          </div>
        ))}
      </div>

      {/* Dynamic Modal */}
      {renderModalContent()}
    </section>
  )
}
