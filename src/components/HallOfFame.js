import { getAllPlayerStats, getPlayerStats } from '@/lib/stats'

// ── Record definitions ──────────────────────────────────────────────────────

function computeRecords(allStats) {
  // 0. Highest Total Points
  const maxPoints = Math.max(...allStats.map(s => s.totalPoints))
  const highestTotalPoints = allStats.filter(s => s.totalPoints === maxPoints)

  // 1. Most Wins
  const maxWins = Math.max(...allStats.map(s => s.wins))
  const mostWins = allStats.filter(s => s.wins === maxWins)

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

  return { 
    highestTotalPoints, 
    mostWins, 
    highestScoreEntries: { score: maxScore, players: uniqueHighestScorePlayers, subtitle: highestScoreEntries.length === 1 ? `Match ${highestScoreEntries[0].matchNumber} · ${highestScoreEntries[0].teams}` : 'Multiple matches' }, 
    bestStreakEntries, 
    mostGames, 
    mostSkips, 
    mostConsistent 
  }
}

// ── Individual Hall of Fame card ────────────────────────────────────────────

const CARD_THEMES = [
  { bg: 'from-yellow-500/10 to-yellow-900/5', border: 'border-yellow-500/30', accent: '#FFD700',   glow: 'rgba(255,215,0,0.12)'   },
  { bg: 'from-blue-500/10  to-blue-900/5',   border: 'border-blue-400/30',   accent: '#00D4FF',   glow: 'rgba(0,212,255,0.12)'   },
  { bg: 'from-red-500/10   to-red-900/5',    border: 'border-red-400/30',    accent: '#FF6B6B',   glow: 'rgba(255,107,107,0.12)' },
  { bg: 'from-green-500/10 to-green-900/5',  border: 'border-green-400/30',  accent: '#2ECC71',   glow: 'rgba(46,204,113,0.12)'  },
  { bg: 'from-purple-500/10 to-purple-900/5',border: 'border-purple-400/30', accent: '#B07FD4',   glow: 'rgba(155,89,182,0.12)'  },
  { bg: 'from-teal-500/10  to-teal-900/5',   border: 'border-teal-400/30',   accent: '#1ABC9C',   glow: 'rgba(26,188,156,0.12)'  },
]

function HofCard({ emoji, title, statValue, players, subtitle, themeIndex }) {
  const theme = CARD_THEMES[themeIndex % CARD_THEMES.length]
  return (
    <div
      className={`relative flex flex-col items-center text-center rounded-2xl p-6 border ${theme.border} bg-gradient-to-b ${theme.bg} transition-transform duration-200 hover:-translate-y-1`}
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
      <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2">{title}</p>

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
  const allStats = getAllPlayerStats()
  const { highestTotalPoints, mostWins, highestScoreEntries, bestStreakEntries, mostGames, mostSkips, mostConsistent } =
    computeRecords(allStats)

  const cards = [
    {
      emoji: '🌟',
      title: 'Highest Total Points',
      statValue: highestTotalPoints[0].totalPoints.toLocaleString(),
      players: highestTotalPoints.map(p => p.player),
      subtitle: highestTotalPoints.length === 1 ? `${highestTotalPoints[0].gamesPlayed} games played` : 'Multiple players',
    },
    {
      emoji: '🏆',
      title: 'Most Wins',
      statValue: mostWins[0].wins,
      players: mostWins.map(p => p.player),
      subtitle: mostWins.length === 1 ? `${mostWins[0].winRate}% win rate` : 'Multiple players',
    },
    {
      emoji: '⚡',
      title: 'Highest Score',
      statValue: highestScoreEntries.score.toLocaleString(),
      players: highestScoreEntries.players,
      subtitle: highestScoreEntries.subtitle,
    },
    {
      emoji: '🔥',
      title: 'Longest Win Streak',
      statValue: `${bestStreakEntries[0]?.bestStreak || 0}`,
      players: bestStreakEntries.map(p => p.player),
      subtitle: bestStreakEntries[0]?.bestStreak === 1 ? '1 consecutive win' : `${bestStreakEntries[0]?.bestStreak || 0} consecutive wins`,
    },
    {
      emoji: '📅',
      title: 'Most Games Played',
      statValue: mostGames[0].gamesPlayed,
      players: mostGames.map(p => p.player),
      subtitle: mostGames.length === 1 ? `${mostGames[0].skips} skips` : 'Multiple players',
    },
    {
      emoji: '💀',
      title: 'Most Skips',
      statValue: mostSkips[0].skips,
      players: mostSkips.map(p => p.player),
      subtitle: mostSkips.length === 1 ? `${mostSkips[0].gamesPlayed} games played` : 'Multiple players',
    },
    {
      emoji: '🎯',
      title: 'Most Consistent',
      statValue: mostConsistent.length > 0 ? `±${mostConsistent[0].consistencyScore}` : 'N/A',
      players: mostConsistent.length > 0 ? mostConsistent.map(p => p.player) : ['—'],
      subtitle: mostConsistent.length === 1
        ? `Std deviation · ${mostConsistent[0].gamesPlayed} games`
        : mostConsistent.length > 1 ? 'Std deviation · Multiple players' : 'Min 5 games required',
    },
  ]

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
            <HofCard {...card} themeIndex={i} />
          </div>
        ))}
      </div>
    </section>
  )
}
