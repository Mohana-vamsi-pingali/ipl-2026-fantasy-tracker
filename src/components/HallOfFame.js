'use client'

import { useState, useEffect } from 'react'
import { getAllPlayerStats, getPlayerStats, getTopScores, getAllWinStreaks, getAllTop3Streaks } from '@/lib/stats'

// ── Record definitions ──────────────────────────────────────────────────────

function computeRecords(allStats) {
  // 0. Highest Total Points
  const maxPoints = Math.max(...allStats.map(s => s.totalPoints))
  const highestTotalPoints = allStats.filter(s => s.totalPoints === maxPoints)

  // 1. Most Wins
  const maxWins = Math.max(...allStats.map(s => s.wins))
  const mostWins = allStats.filter(s => s.wins === maxWins)

  // 1b. Most Top 3 Finishes
  const maxTop3 = Math.max(...allStats.map(s => s.top3))
  const mostTop3 = allStats.filter(s => s.top3 === maxTop3)

  // 2. Highest Single Game Score
  let maxScore = -Infinity
  for (const s of allStats) {
    const ps = getPlayerStats(s.player)
    for (const entry of ps.scores) {
      if (entry.score > maxScore) maxScore = entry.score
    }
  }
  const highestScoreEntries = []
  for (const s of allStats) {
    const ps = getPlayerStats(s.player)
    for (const entry of ps.scores) {
      if (entry.score === maxScore) {
        highestScoreEntries.push({ score: entry.score, player: s.player, matchNumber: entry.matchNumber, teams: entry.teams })
      }
    }
  }
  // Deduplicate highestScore players just in case one player got the same high score twice
  const uniqueHighestScorePlayers = [...new Set(highestScoreEntries.map(e => e.player))]

  // 3. Longest Win Streak
  let maxStreak = 0
  for (const s of allStats) {
    const ps = getPlayerStats(s.player)
    if (ps.bestStreak > maxStreak) maxStreak = ps.bestStreak
  }
  const bestStreakEntries = allStats
    .filter(s => getPlayerStats(s.player).bestStreak === maxStreak)
    .map(s => ({ player: s.player, bestStreak: maxStreak }))

  // 4. Most Games Played
  const maxGames = Math.max(...allStats.map(s => s.gamesPlayed))
  const mostGames = allStats.filter(s => s.gamesPlayed === maxGames)

  // 5. Most Skips
  const maxSkips = Math.max(...allStats.map(s => s.skips))
  const mostSkips = allStats.filter(s => s.skips === maxSkips)

  // 6. Most Consistent (lowest std deviation, min 5 games played)
  const eligible = allStats.filter((s) => s.gamesPlayed >= 5)
  let mostConsistent = []
  if (eligible.length > 0) {
    const withStdDev = eligible.map((s) => ({
      player: s.player,
      gamesPlayed: s.gamesPlayed,
      consistencyScore: getPlayerStats(s.player).consistencyScore,
    }))
    const minStdDev = Math.min(...withStdDev.map(s => s.consistencyScore))
    mostConsistent = withStdDev.filter(s => s.consistencyScore === minStdDev)
  }

  // 7. Most Consecutive Top 3s
  const maxTop3Streak = Math.max(...allStats.map(s => s.bestTop3Streak || 0))
  const mostConsecutiveTop3 = allStats.filter(s => s.bestTop3Streak === maxTop3Streak && maxTop3Streak > 0)

  return {
    highestTotalPoints,
    mostWins,
    mostTop3,
    highestScoreEntries: { score: maxScore, players: uniqueHighestScorePlayers, subtitle: highestScoreEntries.length === 1 ? `Match ${highestScoreEntries[0].matchNumber} · ${highestScoreEntries[0].teams}` : 'Multiple matches' },
    bestStreakEntries,
    mostGames,
    mostSkips,
    mostConsistent,
    mostConsecutiveTop3
  }
}

// ── Individual Hall of Fame card ────────────────────────────────────────────

const CARD_THEMES = [
  { bg: 'from-yellow-500/10 to-yellow-900/5', border: 'border-yellow-500/30', accent: '#FFD700', glow: 'rgba(255,215,0,0.12)' },
  { bg: 'from-blue-500/10  to-blue-900/5', border: 'border-blue-400/30', accent: '#00D4FF', glow: 'rgba(0,212,255,0.12)' },
  { bg: 'from-red-500/10   to-red-900/5', border: 'border-red-400/30', accent: '#FF6B6B', glow: 'rgba(255,107,107,0.12)' },
  { bg: 'from-green-500/10 to-green-900/5', border: 'border-green-400/30', accent: '#2ECC71', glow: 'rgba(46,204,113,0.12)' },
  { bg: 'from-purple-500/10 to-purple-900/5', border: 'border-purple-400/30', accent: '#B07FD4', glow: 'rgba(155,89,182,0.12)' },
  { bg: 'from-teal-500/10  to-teal-900/5', border: 'border-teal-400/30', accent: '#1ABC9C', glow: 'rgba(26,188,156,0.12)' },
]

function HofCard({ id, emoji, title, statValue, players, subtitle, themeIndex, onClick }) {
  const theme = CARD_THEMES[themeIndex % CARD_THEMES.length]
  const isClickable = !!onClick

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col items-center text-center rounded-2xl p-6 border ${theme.border} bg-gradient-to-b ${theme.bg} transition-transform duration-200 ${isClickable ? 'cursor-pointer hover:scale-[1.02]' : 'hover:-translate-y-1'}`}
      style={{ boxShadow: `0 0 24px ${theme.glow}, 0 4px 16px rgba(0,0,0,0.4)` }}
    >
      {/* Coloured top accent line */}
      <div
        className="absolute top-0 left-6 right-6 h-px rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }}
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
      <p className="text-3xl font-black mb-1" style={{ color: theme.accent }}>
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

// ── Main export ─────────────────────────────────────────────────────────────

export default function HallOfFame() {
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

  const allStats = getAllPlayerStats()
  const { highestTotalPoints, mostWins, mostTop3, highestScoreEntries, bestStreakEntries, mostGames, mostSkips, mostConsistent, mostConsecutiveTop3 } =
    computeRecords(allStats)

  const cards = [
    {
      id: 'total-points',
      emoji: '🌟',
      title: 'Highest Total Points',
      statValue: highestTotalPoints[0].totalPoints.toLocaleString(),
      players: highestTotalPoints.map(p => p.player),
      subtitle: highestTotalPoints.length === 1 ? `${highestTotalPoints[0].gamesPlayed} games played` : 'Multiple players',
    },
    {
      id: 'most-wins',
      emoji: '🏆',
      title: 'Most Wins',
      statValue: mostWins[0].wins,
      players: mostWins.map(p => p.player),
      subtitle: mostWins.length === 1 ? `${mostWins[0].winRate}% win rate` : 'Multiple players',
    },
    {
      id: 'most-top3',
      emoji: '🏅',
      title: 'Most Top 3 Finishes',
      statValue: mostTop3[0].top3,
      players: mostTop3.map(p => p.player),
      subtitle: mostTop3.length === 1 ? `${Math.round((mostTop3[0].top3 / mostTop3[0].gamesPlayed) * 100)}% podium rate` : 'Multiple players',
    },
    {
      id: 'highest-score',
      emoji: '⚡',
      title: 'Highest Score',
      statValue: highestScoreEntries.score.toLocaleString(),
      players: highestScoreEntries.players,
      subtitle: highestScoreEntries.subtitle,
    },
    {
      id: 'longest-streak',
      emoji: '🔥',
      title: 'Longest Win Streak',
      statValue: `${bestStreakEntries[0]?.bestStreak || 0}`,
      players: bestStreakEntries.map(p => p.player),
      subtitle: bestStreakEntries[0]?.bestStreak === 1 ? '1 consecutive win' : `${bestStreakEntries[0]?.bestStreak || 0} consecutive wins`,
    },
    {
      id: 'most-games',
      emoji: '📅',
      title: 'Most Games Played',
      statValue: mostGames[0].gamesPlayed,
      players: mostGames.map(p => p.player),
      subtitle: mostGames.length === 1 ? `${mostGames[0].skips} skips` : 'Multiple players',
    },
    {
      id: 'longest-top3-streak',
      emoji: '🔝',
      title: 'Most Consecutive Top 3s',
      statValue: mostConsecutiveTop3.length > 0 ? `${mostConsecutiveTop3[0].bestTop3Streak} matches` : '0 matches',
      players: mostConsecutiveTop3.map(p => p.player),
      subtitle: 'Skips not counted',
    },
    {
      id: 'most-skips',
      emoji: '💀',
      title: 'Most Skips',
      statValue: mostSkips[0].skips,
      players: mostSkips.map(p => p.player),
      subtitle: mostSkips.length === 1 ? `${mostSkips[0].gamesPlayed} games played` : 'Multiple players',
    },
    {
      id: 'most-consistent',
      emoji: '🎯',
      title: 'Most Consistent',
      statValue: mostConsistent.length > 0 ? `±${mostConsistent[0].consistencyScore}` : 'N/A',
      players: mostConsistent.length > 0 ? mostConsistent.map(p => p.player) : ['—'],
      subtitle: mostConsistent.length === 1
        ? `Std deviation · ${mostConsistent[0].gamesPlayed} games`
        : mostConsistent.length > 1 ? 'Std deviation · Multiple players' : 'Min 5 games required',
    },
  ]

  // Helper to render modal headers and tables based on activeModal
  const renderModalContent = () => {
    if (!activeModal) return null

    let modalTitle, modalDesc, tableHeader, tableBody

    if (activeModal === 'total-points') {
      modalTitle = "Highest Total Points"
      modalDesc = "Total points accumulated across the season"
      tableHeader = (
        <tr>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Rank</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Player</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Points</th>
        </tr>
      )
      tableBody = [...allStats]
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .map((stat, idx) => (
          <tr key={stat.player} className="hover:bg-white/5 transition-colors">
            <td className="px-6 py-3 text-sm text-gray-400">{idx + 1}</td>
            <td className="px-6 py-3 text-sm font-bold text-white">{stat.player}</td>
            <td className="px-6 py-3 text-sm font-black text-yellow-400 text-right">{stat.totalPoints.toLocaleString()}</td>
          </tr>
        ))
    }
    else if (activeModal === 'most-wins') {
      modalTitle = "Most Wins"
      modalDesc = "Total times placing 1st in a match"
      tableHeader = (
        <tr>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Rank</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Player</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Wins</th>
        </tr>
      )
      tableBody = [...allStats]
        .sort((a, b) => b.wins - a.wins)
        .map((stat, idx) => (
          <tr key={stat.player} className="hover:bg-white/5 transition-colors">
            <td className="px-6 py-3 text-sm text-gray-400">{idx + 1}</td>
            <td className="px-6 py-3 text-sm font-bold text-white">{stat.player}</td>
            <td className="px-6 py-3 text-sm font-black text-yellow-400 text-right">{stat.wins}</td>
          </tr>
        ))
    }
    else if (activeModal === 'most-top3') {
      modalTitle = "Top 3 Finishes Leaderboard"
      modalDesc = "Total times each player ranked 1st, 2nd, or 3rd"
      tableHeader = (
        <tr>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Rank</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Player</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Top 3s</th>
        </tr>
      )
      tableBody = [...allStats]
        .sort((a, b) => b.top3 - a.top3)
        .map((stat, idx) => (
          <tr key={stat.player} className="hover:bg-white/5 transition-colors">
            <td className="px-6 py-3 text-sm text-gray-400">{idx + 1}</td>
            <td className="px-6 py-3 text-sm font-bold text-white">{stat.player}</td>
            <td className="px-6 py-3 text-sm font-black text-yellow-400 text-right">{stat.top3}</td>
          </tr>
        ))
    }
    else if (activeModal === 'highest-score') {
      modalTitle = "Highest Scores"
      modalDesc = "Top 19 highest individual match scores across the season"
      const topScores = getTopScores(19)
      tableHeader = (
        <tr>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Rank</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Player</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Match</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Score</th>
        </tr>
      )
      tableBody = topScores.map((scoreInfo, idx) => (
        <tr key={`${scoreInfo.player}-${scoreInfo.matchNumber}`} className="hover:bg-white/5 transition-colors">
          <td className="px-6 py-3 text-sm text-gray-400">{idx + 1}</td>
          <td className="px-6 py-3 text-sm font-bold text-white">{scoreInfo.player}</td>
          <td className="px-6 py-3 text-sm text-gray-400">Match {scoreInfo.matchNumber}</td>
          <td className="px-6 py-3 text-sm font-black text-yellow-400 text-right">{scoreInfo.score.toLocaleString()}</td>
        </tr>
      ))
    }
    else if (activeModal === 'longest-streak') {
      modalTitle = "Longest Win Streaks"
      modalDesc = "Win streaks by length (Highest to Highest-4)"
      const allStreaks = getAllWinStreaks()
      const maxStreak = allStreaks.length > 0 ? allStreaks[0].streak : 0
      const filteredStreaks = allStreaks.filter(s => s.streak >= maxStreak - 4 && s.streak > 1)
      tableHeader = (
        <tr>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Streak</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Player</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Matches</th>
        </tr>
      )
      tableBody = filteredStreaks.map((s, idx) => (
        <tr key={`${s.player}-${s.matches.join('-')}-${idx}`} className="hover:bg-white/5 transition-colors">
          <td className="px-6 py-3 text-sm font-black text-yellow-400">{s.streak}</td>
          <td className="px-6 py-3 text-sm font-bold text-white">{s.player}</td>
          <td className="px-6 py-3 text-xs text-gray-400">Matches {s.matches.join(', ')}</td>
        </tr>
      ))
    }
    else if (activeModal === 'most-games') {
      modalTitle = "Most Games Played"
      modalDesc = "Total number of games played by each player"
      tableHeader = (
        <tr>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Rank</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Player</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Games</th>
        </tr>
      )
      tableBody = [...allStats]
        .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
        .map((stat, idx) => (
          <tr key={stat.player} className="hover:bg-white/5 transition-colors">
            <td className="px-6 py-3 text-sm text-gray-400">{idx + 1}</td>
            <td className="px-6 py-3 text-sm font-bold text-white">{stat.player}</td>
            <td className="px-6 py-3 text-sm font-black text-yellow-400 text-right">{stat.gamesPlayed}</td>
          </tr>
        ))
    }
    else if (activeModal === 'most-skips') {
      modalTitle = "Most Skips"
      modalDesc = "Total number of games skipped by each player"
      tableHeader = (
        <tr>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Rank</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Player</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Skips</th>
        </tr>
      )
      tableBody = [...allStats]
        .sort((a, b) => b.skips - a.skips)
        .map((stat, idx) => (
          <tr key={stat.player} className="hover:bg-white/5 transition-colors">
            <td className="px-6 py-3 text-sm text-gray-400">{idx + 1}</td>
            <td className="px-6 py-3 text-sm font-bold text-white">{stat.player}</td>
            <td className="px-6 py-3 text-sm font-black text-yellow-400 text-right">{stat.skips}</td>
          </tr>
        ))
    }
    else if (activeModal === 'most-consistent') {
      modalTitle = "Most Consistent"
      modalDesc = "Standard deviation of scores (lower is better, min 5 games)"
      const eligible = [...allStats].filter(s => s.gamesPlayed >= 5)
      const withStdDev = eligible.map(s => ({
        player: s.player,
        consistencyScore: getPlayerStats(s.player).consistencyScore
      })).sort((a, b) => a.consistencyScore - b.consistencyScore)

      tableHeader = (
        <tr>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Rank</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Player</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10 text-right">Std Dev</th>
        </tr>
      )
      tableBody = withStdDev.map((stat, idx) => (
        <tr key={stat.player} className="hover:bg-white/5 transition-colors">
          <td className="px-6 py-3 text-sm text-gray-400">{idx + 1}</td>
          <td className="px-6 py-3 text-sm font-bold text-white">{stat.player}</td>
          <td className="px-6 py-3 text-sm font-black text-yellow-400 text-right">±{stat.consistencyScore}</td>
        </tr>
      ))
    }
    else if (activeModal === 'longest-top3-streak') {
      modalTitle = "Most Consecutive Top 3 Finishes"
      modalDesc = "Skips are not counted. Tied ranks handled correctly."
      const top3Streaks = getAllTop3Streaks()
      tableHeader = (
        <tr>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Rank</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Player</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Streak Length</th>
          <th className="px-6 py-3 text-xs font-semibold tracking-wider text-gray-400 uppercase border-b border-white/10">Matches</th>
        </tr>
      )
      tableBody = top3Streaks.map((s, idx) => (
        <tr key={`${s.player}-${s.length}-${idx}`} className="hover:bg-white/5 transition-colors">
          <td className="px-6 py-3 text-sm text-gray-400">{s.rank}</td>
          <td className="px-6 py-3 text-sm font-bold text-white">{s.player}</td>
          <td className="px-6 py-3 text-sm font-black text-yellow-400">{s.length} matches</td>
          <td className="px-6 py-3 text-xs text-gray-400">Match {s.matches.map(m => m.matchNumber).join(', ')}</td>
        </tr>
      ))
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setActiveModal(null)}>
        <div
          className="bg-[#0a0f1c] border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl relative"
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

          <div className="p-0 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#0a0f1c] sticky top-0 z-10">
                {tableHeader}
              </thead>
              <tbody className="divide-y divide-white/5">
                {tableBody}
              </tbody>
            </table>
            {activeModal === 'longest-top3-streak' && (
              <div className="p-4 text-xs text-gray-500 text-center border-t border-white/10">
                Only played matches counted toward streaks
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <section aria-labelledby="hof-heading" className="mt-16">
      {/* Section header */}
      <div className="mb-6">
        <h2
          id="hof-heading"
          className="text-2xl font-extrabold tracking-tight text-white"
        >
          Hall of{' '}
          <span className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-500">
            Fame
          </span>
        </h2>
        <p className="mt-1 text-sm text-gray-500">Season records — updated every match</p>
      </div>

      {/* 2-col on mobile, 3-col on md, 4-col on lg. Using flex wrap with centering for uneven last row. */}
      <div className="flex flex-wrap justify-center gap-4">
        {cards.map((card, i) => (
          <div key={card.title} className="w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.67rem)] lg:w-[calc(25%-0.75rem)]">
            <HofCard
              {...card}
              themeIndex={i}
              onClick={() => setActiveModal(card.id)}
            />
          </div>
        ))}
      </div>

      {/* Dynamic Leaderboard Modal */}
      {renderModalContent()}
    </section>
  )
}
