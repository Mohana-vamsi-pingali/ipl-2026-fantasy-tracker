import { getAllPlayerStats } from '@/lib/stats'
import HomePageClient from '@/components/HomePageClient'
import HallOfFame from '@/components/HallOfFame'
import HallOfDoom from '@/components/HallOfDoom'
import TeamSpecialists from '@/components/TeamSpecialists'
import Podiums from '@/components/Podiums'

export const metadata = {
  title: 'Leaderboard · IPL Fantasy Tracker 2026',
  description: 'Season leaderboard — total points, win rates, and rankings for every player.',
}

export default function HomePage() {
  const stats = getAllPlayerStats()
  const totalMatches = Math.max(...stats.map((s) => s.gamesPlayed + s.skips))
  const topPlayer = [...stats].sort((a, b) => b.championshipPoints - a.championshipPoints)[0]

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Season{' '}
          <span className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-500">
            Leaderboard
          </span>
        </h1>
        <p className="mt-2 text-gray-400 text-sm">
          {totalMatches} matches played · Click any column header to sort · Click a player name to view their full profile
        </p>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-1.5 text-sm font-medium text-yellow-300">
          🏆 Current Leader: <span className="font-bold ml-1">{topPlayer.player}</span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-1.5 text-sm font-medium text-blue-300">
          📅 Matches Played: <span className="font-bold ml-1">{totalMatches}</span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-400/10 px-4 py-1.5 text-sm font-medium text-orange-300">
          👥 Players: <span className="font-bold ml-1">{stats.length}</span>
        </div>
      </div>

      {/* Podiums */}
      <Podiums />

      {/* Client section: sort dropdown + cards + table */}
      <HomePageClient stats={stats} totalMatches={totalMatches} />

      <p className="mt-4 text-xs text-gray-600 text-right">
        🥇 Gold · 🥈 Silver · 🥉 Bronze rows reflect current table sort &nbsp;·&nbsp; 🏆 = Season leader by total points
      </p>

      {/* Team Specialists */}
      <TeamSpecialists />

      {/* Hall of Fame */}
      <HallOfFame />

      {/* Hall of Doom */}
      <HallOfDoom />
    </div>
  )
}
