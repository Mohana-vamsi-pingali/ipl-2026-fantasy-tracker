import { allPlayers, matches } from '@/data/matches'
import { getPlayerStats } from '@/lib/stats'
import CompareClient from '@/components/CompareClient'

export const metadata = {
  title: 'Compare Players · IPL Fantasy Tracker',
}

export default function ComparePage() {
  
  // Pre-calculate all stats on the server
  const allStatsRecord = {}
  allPlayers.forEach(player => {
    allStatsRecord[player] = getPlayerStats(player)
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Compare <span className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-500">Players</span>
          </h1>
          <p className="mt-2 text-gray-400 text-lg">
            Side-by-side performance analysis
          </p>
        </div>
      </div>

      <CompareClient 
        allPlayers={allPlayers} 
        allStatsRecord={allStatsRecord} 
        matches={matches} 
      />
    </div>
  )
}
