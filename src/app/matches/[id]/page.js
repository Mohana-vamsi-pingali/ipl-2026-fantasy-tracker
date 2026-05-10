import Link from 'next/link'
import { matches } from '@/data/matches'
import { getMatchDetails } from '@/lib/stats'

const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' }

function rowStyle(rank) {
  if (rank === 1) return { background: 'rgba(255,215,0,0.10)', borderLeft: '3px solid #FFD700' }
  if (rank === 2) return { background: 'rgba(192,192,192,0.08)', borderLeft: '3px solid #C0C0C0' }
  if (rank === 3) return { background: 'rgba(205,127,50,0.08)', borderLeft: '3px solid #CD7F32' }
  return { borderLeft: '3px solid transparent' }
}

export function generateStaticParams() {
  return matches.map((m) => ({
    id: m.id.toString(),
  }))
}

export async function generateMetadata({ params }) {
  const { id } = await params
  const matchId = parseInt(id, 10)
  const match = getMatchDetails(matchId)
  
  if (!match) return { title: 'Match Not Found' }
  
  return {
    title: `Match ${match.matchNumber} · ${match.teams} · IPL Fantasy 2026`,
  }
}

export default async function MatchDetailPage({ params }) {
  const { id } = await params
  const matchId = parseInt(id, 10)
  const match = getMatchDetails(matchId)

  if (!match) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-white">
        <h1 className="text-2xl font-bold">Match Not Found</h1>
        <Link href="/matches" className="text-blue-400 hover:underline mt-4 inline-block">← Back to Matches</Link>
      </div>
    )
  }

  const sortedResults = [...match.results].sort((a, b) => a.rank - b.rank)
  const highest = sortedResults[0]
  const lowest = sortedResults[sortedResults.length - 1]

  const dateObj = new Date(match.date)
  const dateStr = dateObj.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <Link 
          href="/matches" 
          className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors mb-4"
        >
          <span className="mr-1">←</span> Back to Matches
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Match {match.matchNumber} · <span className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-purple-400">{match.teams}</span>
        </h1>
        <p className="mt-2 text-gray-400">{dateStr}</p>
      </div>

      {/* Section 1: Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-[#0e1628] rounded-xl p-5 border border-white/10 shadow-lg">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-1">Highest Score</p>
          <p className="text-2xl font-bold text-green-400">{highest.score}</p>
          <p className="text-sm text-gray-300 mt-1">{highest.player}</p>
        </div>
        <div className="bg-[#0e1628] rounded-xl p-5 border border-white/10 shadow-lg">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-1">Lowest Score</p>
          <p className="text-2xl font-bold text-red-400">{lowest.score}</p>
          <p className="text-sm text-gray-300 mt-1">{lowest.player}</p>
        </div>
        <div className="bg-[#0e1628] rounded-xl p-5 border border-white/10 shadow-lg">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-1">Average Score</p>
          <p className="text-2xl font-bold text-blue-400">{match.avgScore}</p>
          <p className="text-sm text-gray-500 mt-1">{match.results.length} players</p>
        </div>
        <div className="bg-[#0e1628] rounded-xl p-5 border border-white/10 shadow-lg">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-1">Point Spread</p>
          <p className="text-2xl font-bold text-purple-400">{Math.round(match.pointSpread * 10) / 10}</p>
          <p className="text-sm text-gray-500 mt-1">Max - Min</p>
        </div>
      </div>

      {/* Section 2: Results Table */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-white mb-4">Results</h2>
        <div className="overflow-x-auto rounded-xl border border-white/10 shadow-2xl">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#0e1628]">
                <th className="px-4 py-3 text-right font-semibold text-gray-400 w-16">Rank</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-400">Player</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-400">Score</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-400">Diff from Avg</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((row, idx) => {
                const diff = row.score - match.avgScore;
                const diffStr = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
                const diffColor = diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-400';

                return (
                  <tr
                    key={row.player}
                    style={rowStyle(row.rank)}
                    className={`border-b border-white/5 transition-colors duration-150 cursor-default
                      ${idx % 2 === 1 ? 'bg-white/[0.02]' : ''}
                      hover:bg-white/[0.06]`}
                  >
                    <td className="px-4 py-3 text-right font-bold text-gray-300">
                      <span className="text-base">{MEDAL[row.rank] ?? row.rank}</span>
                    </td>
                    <td className="px-4 py-3 text-left font-semibold text-white">
                      <Link
                        href={`/player/${encodeURIComponent(row.player)}`}
                        className="hover:text-yellow-400 transition-colors flex items-center gap-1.5"
                      >
                        {row.rank === 1 && <span className="text-base">🏆</span>}
                        {row.player}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-white">
                      {row.score}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${diffColor}`}>
                      {diffStr}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Skipped */}
      {match.skippedBy.length > 0 && (
        <div className="bg-[#0a0f1c] rounded-xl p-6 border border-white/5 shadow-inner">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
            Skipped this match
          </h2>
          <div className="flex flex-wrap gap-2">
            {match.skippedBy.map(player => (
              <span 
                key={player}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-sm"
              >
                {player}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
