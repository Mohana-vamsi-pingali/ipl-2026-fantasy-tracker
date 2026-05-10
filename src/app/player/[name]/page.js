import Link from 'next/link'
import { getPlayerStats, getAllPlayerStats, getHeadToHead } from '@/lib/stats'
import { matches, allPlayers } from '@/data/matches'
import PlayerProfileClient from '@/components/PlayerProfileClient'

export function generateStaticParams() {
  return allPlayers.map((name) => ({
    name: name,
  }))
}

export async function generateMetadata({ params }) {
  const { name } = await params
  const playerName = decodeURIComponent(name)
  return {
    title: `${playerName} · Player Profile · IPL Fantasy Tracker`,
  }
}

export default async function PlayerProfilePage({ params }) {
  const { name } = await params
  const playerName = decodeURIComponent(name)

  const playerStats = getPlayerStats(playerName)

  if (!playerStats) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-white">
        <h1 className="text-2xl font-bold">Player Not Found</h1>
        <Link href="/" className="text-blue-400 hover:underline mt-4 inline-block">← Back to Leaderboard</Link>
      </div>
    )
  }

  // Calculate overall rank
  const allStats = getAllPlayerStats().sort((a, b) => b.totalPoints - a.totalPoints)
  const rank = allStats.findIndex(p => p.player === playerName) + 1

  // Trend Data for 52 matches
  const trendData = matches.map(m => {
    const result = m.results.find(r => r.player === playerName)
    return {
      matchNumber: m.matchNumber,
      name: `M${m.matchNumber}`,
      score: result ? result.score : null,
      rank: result ? result.rank : null,
    }
  })

  // Pie Data
  const skips = playerStats.skips
  const wins = playerStats.wins
  const top3 = playerStats.scores.filter(s => s.rank > 1 && s.rank <= 3).length
  const rest = playerStats.scores.filter(s => s.rank > 3).length

  const pieData = [
    { name: 'Wins (Rank 1)', value: wins, fill: '#FFD700' },
    { name: 'Top 3 (Rank 2-3)', value: top3, fill: '#00D4FF' },
    { name: 'Rest (Rank 4+)', value: rest, fill: '#6b7280' },
  ]
  if (skips > 0) {
    pieData.push({ name: 'Skipped', value: skips, fill: '#EF4444' })
  }

  // Head to Head Data
  const h2hData = allPlayers
    .filter(p => p !== playerName)
    .map(opponent => {
      const stats = getHeadToHead(playerName, opponent)
      return {
        opponent,
        matchesPlayedTogether: stats.matchesPlayed,
        thisPlayerWins: stats.player1Wins,
        opponentWins: stats.player2Wins
      }
    })
    .sort((a, b) => b.matchesPlayedTogether - a.matchesPlayedTogether)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors mb-4"
          >
            <span className="mr-1">←</span> Back to Leaderboard
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-purple-400">{playerName}</span>
          </h1>
          <p className="mt-2 text-gray-400 text-lg">
            Season Profile & Performance Analytics
          </p>
        </div>
        <div className="bg-[#0e1628] rounded-xl px-6 py-4 border border-white/10 shadow-lg inline-flex flex-col items-end">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-1">Overall Rank</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">#{rank}</span>
            <span className="text-gray-400 text-sm">/ {allPlayers.length}</span>
          </div>
        </div>
      </div>

      <PlayerProfileClient 
        playerStats={playerStats}
        trendData={trendData}
        pieData={pieData}
        h2hData={h2hData}
      />
    </div>
  )
}
