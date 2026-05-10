import { getAllPlayerStats, getPlayerStats, getDailyLeaders, getHeadToHead } from '@/lib/stats'
import { matches, allPlayers } from '@/data/matches'
import StatsCharts from '@/components/StatsCharts'

export const metadata = {
  title: 'Analytics & Trends · IPL Fantasy Tracker 2026',
  description: 'Deep dive into season analytics, win rates, and score trends.',
}

export default function StatsPage() {
  const basePlayerStats = getAllPlayerStats()

  // Enhance player stats with consistency score (std dev)
  const enhancedPlayerStats = basePlayerStats.map(p => {
    const fullStats = getPlayerStats(p.player)
    return { ...p, consistencyScore: fullStats.consistencyScore }
  })

  // Compute Head-to-Head Matrix
  const h2hMatrix = {}
  allPlayers.forEach(p1 => {
    h2hMatrix[p1] = {}
    allPlayers.forEach(p2 => {
      if (p1 === p2) {
        h2hMatrix[p1][p2] = null
      } else {
        h2hMatrix[p1][p2] = getHeadToHead(p1, p2).player1Wins
      }
    })
  })

  const dailyLeaders = getDailyLeaders()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Analytics &{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            Trends
          </span>
        </h1>
        <p className="mt-2 text-gray-400 text-sm">
          Interactive charts tracking points, win rates, and historical form across the season.
        </p>
      </div>

      <StatsCharts 
        playerStats={enhancedPlayerStats} 
        matches={matches}
        dailyLeaders={dailyLeaders}
        h2hMatrix={h2hMatrix}
        allPlayers={allPlayers}
      />
    </div>
  )
}
