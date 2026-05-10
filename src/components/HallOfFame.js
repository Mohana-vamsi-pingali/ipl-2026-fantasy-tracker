import { getAllPlayerStats, getPlayerStats } from '@/lib/stats'

// ── Record definitions ──────────────────────────────────────────────────────

function computeRecords(allStats) {
  // 1. Most Wins
  const mostWins = [...allStats].sort((a, b) => b.wins - a.wins)[0]

  // 2. Highest Single Game Score — scan each player's scores array
  let highScoreEntry = { score: 0, player: '', matchNumber: 0, teams: '' }
  for (const s of allStats) {
    const ps = getPlayerStats(s.player)
    for (const entry of ps.scores) {
      if (entry.score > highScoreEntry.score) {
        highScoreEntry = { score: entry.score, player: s.player, matchNumber: entry.matchNumber, teams: entry.teams }
      }
    }
  }

  // 3. Longest Win Streak
  let bestStreakEntry = { player: '', bestStreak: 0 }
  for (const s of allStats) {
    const ps = getPlayerStats(s.player)
    if (ps.bestStreak > bestStreakEntry.bestStreak) {
      bestStreakEntry = { player: s.player, bestStreak: ps.bestStreak }
    }
  }

  // 4. Most Games Played
  const mostGames = [...allStats].sort((a, b) => b.gamesPlayed - a.gamesPlayed)[0]

  // 5. Most Skips
  const mostSkips = [...allStats].sort((a, b) => b.skips - a.skips)[0]

  // 6. Most Consistent (lowest std deviation, min 5 games played)
  const eligible = allStats.filter((s) => s.gamesPlayed >= 5)
  let mostConsistent = null
  if (eligible.length > 0) {
    const withStdDev = eligible.map((s) => ({
      player: s.player,
      gamesPlayed: s.gamesPlayed,
      consistencyScore: getPlayerStats(s.player).consistencyScore,
    }))
    mostConsistent = withStdDev.sort((a, b) => a.consistencyScore - b.consistencyScore)[0]
  }

  return { mostWins, highScoreEntry, bestStreakEntry, mostGames, mostSkips, mostConsistent }
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

function HofCard({ emoji, title, statValue, player, subtitle, themeIndex }) {
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

      {/* Player name */}
      <p className="text-base font-bold text-white mb-1">{player}</p>

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
  const { mostWins, highScoreEntry, bestStreakEntry, mostGames, mostSkips, mostConsistent } =
    computeRecords(allStats)

  const cards = [
    {
      emoji: '🏆',
      title: 'Most Wins',
      statValue: mostWins.wins,
      player: mostWins.player,
      subtitle: `${mostWins.winRate}% win rate`,
    },
    {
      emoji: '⚡',
      title: 'Highest Score',
      statValue: highScoreEntry.score.toLocaleString(),
      player: highScoreEntry.player,
      subtitle: `Match ${highScoreEntry.matchNumber} · ${highScoreEntry.teams}`,
    },
    {
      emoji: '🔥',
      title: 'Longest Win Streak',
      statValue: `${bestStreakEntry.bestStreak}`,
      player: bestStreakEntry.player,
      subtitle: bestStreakEntry.bestStreak === 1 ? '1 consecutive win' : `${bestStreakEntry.bestStreak} consecutive wins`,
    },
    {
      emoji: '📅',
      title: 'Most Games Played',
      statValue: mostGames.gamesPlayed,
      player: mostGames.player,
      subtitle: `${mostGames.skips} skips`,
    },
    {
      emoji: '💀',
      title: 'Most Skips',
      statValue: mostSkips.skips,
      player: mostSkips.player,
      subtitle: `${mostSkips.gamesPlayed} games played`,
    },
    {
      emoji: '🎯',
      title: 'Most Consistent',
      statValue: mostConsistent ? `±${mostConsistent.consistencyScore}` : 'N/A',
      player: mostConsistent?.player ?? '—',
      subtitle: mostConsistent
        ? `Std deviation · ${mostConsistent.gamesPlayed} games`
        : 'Min 5 games required',
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
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Fame
          </span>
        </h2>
        <p className="mt-1 text-sm text-gray-500">Season records — updated every match</p>
      </div>

      {/* 2-col on mobile, 3-col on md+ */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {cards.map((card, i) => (
          <HofCard key={card.title} {...card} themeIndex={i} />
        ))}
      </div>
    </section>
  )
}
