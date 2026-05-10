'use client'

import { useState } from 'react'
import { getHeadToHead } from '@/lib/stats'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts'

const COLORS = ['#FFD700', '#00D4FF', '#FF6B00']
const PIE_COLORS = {
  win: '#22c55e', // green
  top3: '#eab308', // yellow
  rest: '#6b7280', // grey
  skip: '#ef4444' // red
}

export default function CompareClient({ allPlayers, allStatsRecord, matches }) {
  const [selectedPlayers, setSelectedPlayers] = useState([])
  const [shake, setShake] = useState(false)

  const togglePlayer = (player) => {
    if (selectedPlayers.includes(player)) {
      setSelectedPlayers(selectedPlayers.filter(p => p !== player))
    } else {
      if (selectedPlayers.length >= 3) {
        setShake(true)
        setTimeout(() => setShake(false), 500)
      } else {
        setSelectedPlayers([...selectedPlayers, player])
      }
    }
  }

  // Calculate winner for a specific metric
  const getBestMetric = (metric, isRank = false) => {
    if (selectedPlayers.length < 2) return null
    const vals = selectedPlayers.map(p => parseFloat(allStatsRecord[p][metric]))
    return isRank ? Math.min(...vals) : Math.max(...vals)
  }

  const bestTotalPoints = getBestMetric('totalPoints')
  const bestAvgPoints = getBestMetric('avgPoints')
  const bestWins = getBestMetric('wins')
  const bestWinRate = getBestMetric('winRate')
  const bestBestScore = getBestMetric('bestScore')
  const bestWorstScore = getBestMetric('worstScore') // highest is best

  const h2h = selectedPlayers.length === 2 ? getHeadToHead(selectedPlayers[0], selectedPlayers[1]) : null

  // Trend Data
  const trendData = matches.map(m => {
    const row = { name: `M${m.matchNumber}`, teams: m.teams }
    selectedPlayers.forEach(p => {
      const result = m.results.find(r => r.player === p)
      row[p] = result ? result.score : null
    })
    return row
  }).sort((a, b) => parseInt(a.name.substring(1)) - parseInt(b.name.substring(1)))

  const CustomLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0e1628] border border-white/20 p-3 rounded-lg shadow-xl text-sm min-w-[150px]">
          <p className="font-bold text-white mb-1">{label}</p>
          <p className="text-xs text-gray-400 mb-3">{payload[0].payload.teams}</p>
          {[...payload].sort((a, b) => b.value - a.value).map((entry, index) => (
            <p key={index} className="flex justify-between gap-4 text-xs mb-1">
              <span style={{ color: entry.color }}>{entry.name}</span>
              <span className="font-bold text-gray-200">{entry.value}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-12 pb-16 animate-fade-in">

      {/* Section 1: Player Selector */}
      <div className="bg-[#0a0f1c] rounded-2xl p-6 border border-white/5 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Select Players to Compare</h2>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-gray-300">
            {selectedPlayers.length} / 3 Selected
          </span>
        </div>
        <div className={`flex flex-wrap gap-3 ${shake ? 'animate-shake' : ''}`}>
          {allPlayers.map(player => {
            const isSelected = selectedPlayers.includes(player)
            const playerIndex = selectedPlayers.indexOf(player)
            const color = isSelected ? COLORS[playerIndex] : ''

            return (
              <button
                key={player}
                onClick={() => togglePlayer(player)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${isSelected
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'bg-transparent border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                  }`}
                style={{ borderColor: isSelected ? color : undefined, color: isSelected ? color : undefined }}
              >
                {player}
              </button>
            )
          })}
        </div>
        {shake && <p className="text-red-400 text-xs mt-3 animate-fade-in">Max 3 players allowed for comparison.</p>}
      </div>

      {selectedPlayers.length < 2 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
          <p className="text-gray-400 text-lg">Select at least 2 players to compare</p>
        </div>
      ) : (
        <div className="space-y-12 animate-fade-in">

          {/* Section 2: Stat Cards Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedPlayers.map((player, index) => {
              const stats = allStatsRecord[player]
              const color = COLORS[index]

              return (
                <div key={player} className="bg-[#0a0f1c] rounded-2xl border border-white/5 shadow-2xl overflow-hidden flex flex-col">
                  <div className="p-4 text-center border-b border-white/5 bg-white/5">
                    <h3 className="text-2xl font-extrabold" style={{ color }}>{player}</h3>
                  </div>
                  <div className="flex-1 p-0 flex flex-col divide-y divide-white/5 text-sm">
                    <MetricRow label="Total Points" value={stats.totalPoints} isBest={parseFloat(stats.totalPoints) === bestTotalPoints} />
                    <MetricRow label="Games Played" value={stats.gamesPlayed} isBest={false} />
                    <MetricRow label="Points Avg" value={stats.avgPoints} isBest={parseFloat(stats.avgPoints) === bestAvgPoints} />
                    <MetricRow label="Wins" value={stats.wins} isBest={parseFloat(stats.wins) === bestWins} />
                    <MetricRow label="Win Rate" value={`${stats.winRate}%`} isBest={parseFloat(stats.winRate) === bestWinRate} />
                    <MetricRow label="Best Score" value={stats.bestScore} isBest={parseFloat(stats.bestScore) === bestBestScore} />
                    <MetricRow label="Worst Score" value={stats.worstScore} isBest={parseFloat(stats.worstScore) === bestWorstScore} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Section 3: Who Beats Who (Tug of War) */}
          {selectedPlayers.length === 2 && h2h && (
            <div className="bg-[#0a0f1c] rounded-2xl p-6 border border-white/5 shadow-2xl text-center">
              <h3 className="text-lg font-bold text-white mb-2">
                <span style={{ color: COLORS[0] }}>{selectedPlayers[0]}</span> vs <span style={{ color: COLORS[1] }}>{selectedPlayers[1]}</span> · Head to Head
              </h3>
              <p className="text-xs text-gray-500 mb-6">{h2h.matchesPlayed} matches played together</p>

              {/* Tug of War Bar */}
              <div className="relative h-12 w-full bg-white/5 rounded-full overflow-hidden flex mb-4 shadow-inner">
                {h2h.matchesPlayed === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold text-gray-500">No common matches</div>
                ) : (
                  <>
                    <div
                      className="h-full flex items-center px-4 font-bold text-black transition-all duration-1000 ease-out"
                      style={{ width: `${(h2h.player1Wins / h2h.matchesPlayed) * 100}%`, backgroundColor: COLORS[0], justifyContent: 'flex-start' }}
                    >
                      {h2h.player1Wins > 0 && h2h.player1Wins}
                    </div>
                    <div
                      className="h-full flex items-center px-4 font-bold text-black transition-all duration-1000 ease-out"
                      style={{ width: `${(h2h.player2Wins / h2h.matchesPlayed) * 100}%`, backgroundColor: COLORS[1], justifyContent: 'flex-end' }}
                    >
                      {h2h.player2Wins > 0 && h2h.player2Wins}
                    </div>
                  </>
                )}
              </div>

              {/* Result Text */}
              <div className="text-lg font-bold text-white">
                {h2h.player1Wins > h2h.player2Wins ? (
                  <>{selectedPlayers[0]} leads <span style={{ color: COLORS[0] }}>{h2h.player1Wins} – {h2h.player2Wins}</span></>
                ) : h2h.player2Wins > h2h.player1Wins ? (
                  <>{selectedPlayers[1]} leads <span style={{ color: COLORS[1] }}>{h2h.player2Wins} – {h2h.player1Wins}</span></>
                ) : (
                  <>All square · <span className="text-gray-400">{h2h.player1Wins} – {h2h.player2Wins}</span></>
                )}
              </div>
            </div>
          )}

          {/* Section 4: Score Trend */}
          <div className="bg-[#0a0f1c] rounded-2xl p-6 border border-white/5 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Score Trend Across the Season</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickMargin={10} />
                  <YAxis stroke="#6b7280" fontSize={11} domain={['auto', 'auto']} />
                  <RechartsTooltip content={<CustomLineTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px', fontSize: 12 }} />
                  {selectedPlayers.map((player, index) => (
                    <Line
                      key={player}
                      type="monotone"
                      dataKey={player}
                      stroke={COLORS[index]}
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#0a0f1c', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: COLORS[index], strokeWidth: 0 }}
                      connectNulls={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section 5: Pie Breakdowns */}
          <div className="bg-[#0a0f1c] rounded-2xl p-6 border border-white/5 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Performance Breakdown</h3>
            <div className={`grid grid-cols-1 md:grid-cols-${selectedPlayers.length} gap-8`}>
              {selectedPlayers.map((player, index) => {
                const stats = allStatsRecord[player]
                const skips = stats.skips
                const wins = stats.wins
                const top3 = stats.scores.filter(s => s.rank > 1 && s.rank <= 3).length
                const rest = stats.scores.filter(s => s.rank > 3).length

                const pieData = [
                  { name: 'Win (Rank 1)', value: wins, fill: PIE_COLORS.win },
                  { name: 'Top 3 (Rank 2-3)', value: top3, fill: PIE_COLORS.top3 },
                  { name: 'Rest (Rank 4+)', value: rest, fill: PIE_COLORS.rest },
                ]
                if (skips > 0) {
                  pieData.push({ name: 'Skipped', value: skips, fill: PIE_COLORS.skip })
                }

                return (
                  <div key={player} className="flex flex-col items-center">
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((entry, i) => (
                              <Cell key={`cell-${i}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-[#0e1628] border border-white/20 p-2 rounded shadow-xl text-xs">
                                    <span style={{ color: payload[0].payload.fill }} className="font-bold">{payload[0].name}:</span> {payload[0].value} matches
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-center mt-4 w-full">
                      <h4 className="font-bold text-lg mb-2" style={{ color: COLORS[index] }}>{player}</h4>
                      <p className="text-xs text-gray-400 flex flex-wrap justify-center gap-2">
                        <span className="text-green-400">{wins} Wins</span> ·
                        <span className="text-yellow-400">{top3} Top 3</span> ·
                        <span className="text-gray-400">{rest} Rest</span>
                        {skips > 0 && <> · <span className="text-red-400">{skips} Skipped</span></>}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

function MetricRow({ label, value, isBest }) {
  return (
    <div className={`flex justify-between items-center p-4 transition-colors ${isBest ? 'bg-yellow-400/10' : 'hover:bg-white/5'}`}>
      <span className="text-gray-400">{label}</span>
      <span className={`font-bold ${isBest ? 'text-yellow-400' : 'text-white'}`}>{value}</span>
    </div>
  )
}
