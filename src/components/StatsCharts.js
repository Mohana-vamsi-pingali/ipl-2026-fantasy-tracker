'use client'

import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  RadialBarChart, RadialBar, Legend,
  LineChart, Line,
  ScatterChart, Scatter, ZAxis, ReferenceLine
} from 'recharts'

const COLORS = [
  '#FFD700', // gold
  '#00D4FF', // electric blue
  '#FF6B00', // orange
  '#9B59B6', // purple
  '#2ECC71', // emerald
  '#E74C3C', // red
  '#1ABC9C', // teal
  '#F39C12', // amber
  '#3498DB', // blue
]

export default function StatsCharts({ playerStats, matches, dailyLeaders, h2hMatrix, allPlayers }) {
  const [hiddenPlayers, setHiddenPlayers] = useState(new Set())

  // --- Data pre-processing ---
  const totalPointsData = [...playerStats].sort((a, b) => a.totalPoints - b.totalPoints)
  const avgPointsData = [...playerStats].sort((a, b) => a.avgPoints - b.avgPoints)

  const winRateData = [...playerStats]
    .filter(p => p.winRate > 0)
    .sort((a, b) => a.winRate - b.winRate)
    .map((p, i) => ({
      name: p.player,
      winRate: p.winRate,
      fill: COLORS[i % COLORS.length]
    }))

  const chronologicalMatches = [...matches].sort((a, b) => a.matchNumber - b.matchNumber)
  const trendData = chronologicalMatches.map(m => {
    const dataPoint = { name: `M${m.matchNumber}` }
    m.results.forEach(r => {
      dataPoint[r.player] = r.score
    })
    return dataPoint
  })

  const positionTrendData = chronologicalMatches.map(m => {
    const dataPoint = { name: `M${m.matchNumber}` }
    m.results.forEach(r => {
      dataPoint[r.player] = r.rank
    })
    return dataPoint
  })

  const scatterData = playerStats
    .filter(p => p.gamesPlayed >= 5)
    .map((p, i) => ({
      name: p.player,
      avgPoints: p.avgPoints,
      consistencyScore: p.consistencyScore,
      fill: COLORS[i % COLORS.length]
    }))

  const skipData = [...playerStats]
    .filter(p => p.skips > 0)
    .sort((a, b) => a.skips - b.skips) // sorted asc for vertical rendering so max is top

  // Daily Leader History (stacked bar chart, value = 1)
  const leaderHistoryData = dailyLeaders.map(dl => {
    const dataPoint = {
      name: `M${dl.matchNumber}`,
      date: dl.date,
      teams: dl.teams,
      winner: dl.winner
    }
    if (dl.winner) {
      dataPoint[dl.winner] = 1
    }
    return dataPoint
  })

  // --- Custom tooltips ---
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-[#0e1628] border border-white/20 p-3 rounded-lg shadow-xl text-sm">
          <p className="font-bold text-white mb-1">{data.player}</p>
          <p className="text-gray-300"><span className="text-yellow-400 font-semibold">{payload[0].value.toLocaleString()}</span> {payload[0].name}</p>
          {data.gamesPlayed && <p className="text-gray-400 text-xs mt-1">{data.gamesPlayed} games played</p>}
        </div>
      )
    }
    return null
  }

  const CustomLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0e1628] border border-white/20 p-3 rounded-lg shadow-xl text-sm min-w-[150px]">
          <p className="font-bold text-white mb-2">{label}</p>
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

  const ScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-[#0e1628] border border-white/20 p-3 rounded-lg shadow-xl text-sm">
          <p className="font-bold text-white mb-1" style={{ color: data.fill }}>{data.name}</p>
          <p className="text-gray-300">Avg Points: <span className="font-semibold text-white">{data.avgPoints}</span></p>
          <p className="text-gray-300">Std Dev: <span className="font-semibold text-white">±{data.consistencyScore}</span></p>
        </div>
      )
    }
    return null
  }

  const LeaderHistoryTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-[#0e1628] border border-white/20 p-3 rounded-lg shadow-xl text-sm">
          <p className="font-bold text-gray-400 mb-1">{label} · {data.date}</p>
          <p className="text-white font-semibold mb-2">{data.teams}</p>
          <p className="text-gray-300">Winner: <span className="font-bold text-yellow-400">🏆 {data.winner || 'N/A'}</span></p>
        </div>
      )
    }
    return null
  }

  const togglePlayerLine = (e) => {
    const playerName = e.dataKey
    setHiddenPlayers(prev => {
      const next = new Set(prev)
      if (next.has(playerName)) next.delete(playerName)
      else next.add(playerName)
      return next
    })
  }

  // Calculate scatter chart center for quadrants
  const scatterAvgPoints = scatterData.length > 0 ? scatterData.reduce((acc, curr) => acc + curr.avgPoints, 0) / scatterData.length : 0
  const scatterAvgStdDev = scatterData.length > 0 ? scatterData.reduce((acc, curr) => acc + curr.consistencyScore, 0) / scatterData.length : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">

      {/* Chart 1: Total Points */}
      <div className="bg-[#0a0f1c] rounded-2xl p-6 border border-white/5 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-1">Total Points Comparison</h3>
        <p className="text-xs text-gray-500 mb-6">Overall cumulative points scored across the season</p>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={totalPointsData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" stroke="#6b7280" fontSize={12} tickFormatter={val => val.toLocaleString()} />
              <YAxis dataKey="player" type="category" stroke="#9ca3af" fontSize={12} width={80} />
              <RechartsTooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="totalPoints" name="Points" radius={[0, 4, 4, 0]}>
                {totalPointsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Average Points */}
      <div className="bg-[#0a0f1c] rounded-2xl p-6 border border-white/5 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-1">Points Average Comparison</h3>
        <p className="text-xs text-gray-500 mb-6">Average points scored per match played</p>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={avgPointsData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" stroke="#6b7280" fontSize={12} domain={['dataMin - 50', 'dataMax + 20']} />
              <YAxis dataKey="player" type="category" stroke="#9ca3af" fontSize={12} width={80} />
              <RechartsTooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="avgPoints" name="Avg" radius={[0, 4, 4, 0]}>
                {avgPointsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Win Rate */}
      <div className="bg-[#0a0f1c] rounded-2xl p-6 border border-white/5 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-1">Win Rate %</h3>
        <p className="text-xs text-gray-500 mb-6">Percentage of matches won (excludes 0% players)</p>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%" cy="50%"
              innerRadius="20%" outerRadius="90%"
              barSize={20} data={winRateData}
              startAngle={90} endAngle={-270}
            >
              <RadialBar
                minAngle={15}
                background={{ fill: 'rgba(255,255,255,0.03)' }}
                clockWise
                dataKey="winRate"
                cornerRadius={10}
                label={{ position: 'insideStart', fill: '#fff', fontSize: 11, formatter: (v) => `${v}%` }}
              />
              <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0, fontSize: 12, color: '#9ca3af' }} />
              <RechartsTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#0e1628] border border-white/20 p-2 rounded shadow-lg text-xs">
                        <span style={{ color: payload[0].payload.fill }} className="font-bold">{payload[0].payload.name}:</span> {payload[0].value}%
                      </div>
                    )
                  }
                  return null
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 8: Skip Frequency */}
      <div className="bg-[#0a0f1c] rounded-2xl p-6 border border-white/5 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-1">Skip Frequency</h3>
        <p className="text-xs text-gray-500 mb-6">Number of matches skipped by each player</p>
        <div className="h-[400px]">
          {skipData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">No matches skipped yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skipData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="#6b7280" fontSize={12} allowDecimals={false} />
                <YAxis dataKey="player" type="category" stroke="#9ca3af" fontSize={12} width={80} />
                <RechartsTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0e1628] border border-white/20 p-3 rounded-lg shadow-xl text-sm">
                          <p className="font-bold text-white mb-1">{payload[0].payload.player}</p>
                          <p className="text-red-400 font-semibold">{payload[0].value} skips</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="skips" radius={[0, 4, 4, 0]}>
                  {skipData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#EF4444" opacity={0.8 + (index * 0.05)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 4: Score Trend Over Time */}
      {/* <div className="bg-[#0a0f1c] rounded-2xl p-6 border border-white/5 shadow-2xl lg:col-span-2">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Score Trend Over Time (Form)</h3>
            <p className="text-xs text-gray-500">Player scores per match across the season. Gaps indicate skipped matches.</p>
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest hidden sm:block">Click legend to toggle</p>
        </div>
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickMargin={10} />
              <YAxis stroke="#6b7280" fontSize={11} domain={['auto', 'auto']} />
              <RechartsTooltip content={<CustomLineTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px', fontSize: 12 }} 
                onClick={togglePlayerLine}
                formatter={(value) => {
                  return <span style={{ color: hiddenPlayers.has(value) ? '#4b5563' : '#d1d5db', transition: 'color 0.2s', cursor: 'pointer' }}>{value}</span>
                }}
              />
              {allPlayers.map((player, i) => (
                <Line
                  key={player}
                  type="monotone"
                  dataKey={player}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={hiddenPlayers.has(player) ? 0 : 2.5}
                  dot={hiddenPlayers.has(player) ? false : { r: 3, strokeWidth: 0 }}
                  activeDot={hiddenPlayers.has(player) ? false : { r: 6, strokeWidth: 0 }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div> */}

      {/* Chart 5: Position Trend Over Time
      <div className="bg-[#0a0f1c] rounded-2xl p-6 border border-white/5 shadow-2xl lg:col-span-2">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Position Trend Over Time</h3>
            <p className="text-xs text-gray-500">Daily rankings per match. Rank 1 is at the top.</p>
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest hidden sm:block">Click legend to toggle</p>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={positionTrendData} margin={{ top: 20, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickMargin={10} />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                domain={[1, allPlayers.length]}
                reversed={true}
                tickCount={allPlayers.length}
                interval={0}
              />
              <RechartsTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#0e1628] border border-white/20 p-3 rounded-lg shadow-xl text-sm min-w-[150px]">
                        <p className="font-bold text-white mb-2">{label} Rankings</p>
                        {[...payload].sort((a, b) => a.value - b.value).map((entry, index) => (
                          <p key={index} className="flex justify-between gap-4 text-xs mb-1">
                            <span style={{ color: entry.color }}>{entry.name}</span>
                            <span className="font-bold text-gray-200">#{entry.value}</span>
                          </p>
                        ))}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px', fontSize: 12 }}
                onClick={togglePlayerLine}
                formatter={(value) => {
                  return <span style={{ color: hiddenPlayers.has(value) ? '#4b5563' : '#d1d5db', transition: 'color 0.2s', cursor: 'pointer' }}>{value}</span>
                }}
              />
              {allPlayers.map((player, i) => (
                <Line
                  key={player}
                  type="stepAfter"
                  dataKey={player}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={hiddenPlayers.has(player) ? 0 : 2}
                  dot={hiddenPlayers.has(player) ? false : { r: 4, strokeWidth: 0 }}
                  activeDot={hiddenPlayers.has(player) ? false : { r: 6, strokeWidth: 0 }}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div> */}

      <H2HMatrix allPlayers={allPlayers} h2hMatrix={h2hMatrix} />

      {/* Chart 9: Daily Point Leader History */}
      <div className="bg-[#0a0f1c] rounded-2xl p-6 border border-white/5 shadow-2xl lg:col-span-2">
        <h3 className="text-lg font-bold text-white mb-1">Daily Point Leader History</h3>
        <p className="text-xs text-gray-500 mb-6">Which player secured Rank 1 in each match</p>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leaderHistoryData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} horizontal={false} />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickMargin={10} />
              <YAxis hide domain={[0, 1]} />
              <RechartsTooltip content={<LeaderHistoryTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Legend
                wrapperStyle={{ paddingTop: '10px', fontSize: 12 }}
                formatter={(value) => <span className="text-gray-300">{value}</span>}
              />
              {allPlayers.map((player, i) => (
                <Bar key={player} dataKey={player} name={player} stackId="a" fill={COLORS[i % COLORS.length]} radius={[4, 4, 4, 4]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 7: Score Consistency Scatter Plot */}
      <div className="bg-[#0a0f1c] rounded-2xl p-6 border border-white/5 shadow-2xl lg:col-span-2">
        <h3 className="text-lg font-bold text-white mb-1">Score Consistency vs. Average Points</h3>
        <p className="text-xs text-gray-500 mb-6">Scatter plot identifying player archetypes. High average points is better. Low standard deviation (variance) is better.</p>

        <div className="relative h-[500px]">
          {/* Quadrant Labels */}
          <div className="absolute top-8 left-16 text-[10px] text-gray-500 uppercase tracking-widest bg-[#0a0f1c]/80 p-1 rounded z-10 pointer-events-none">
            Low Avg / High Variance (Inconsistent)
          </div>
          <div className="absolute top-8 right-8 text-[10px] text-gray-500 uppercase tracking-widest bg-[#0a0f1c]/80 p-1 rounded z-10 pointer-events-none text-right">
            High Avg / High Variance (Boom or Bust)
          </div>
          <div className="absolute bottom-16 left-16 text-[10px] text-gray-500 uppercase tracking-widest bg-[#0a0f1c]/80 p-1 rounded z-10 pointer-events-none">
            Low Avg / Low Variance (Consistently Bad)
          </div>
          <div className="absolute bottom-16 right-8 text-[10px] text-green-500/80 uppercase tracking-widest bg-[#0a0f1c]/80 p-1 rounded z-10 pointer-events-none text-right font-bold">
            High Avg / Low Variance (Consistent Elite)
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                type="number"
                dataKey="avgPoints"
                name="Average Points"
                domain={['dataMin - 10', 'dataMax + 10']}
                stroke="#6b7280"
                fontSize={12}
                label={{ value: 'Average Points →', position: 'bottom', fill: '#9ca3af', fontSize: 12, offset: 0 }}
              />
              <YAxis
                type="number"
                dataKey="consistencyScore"
                name="Std Dev"
                domain={['dataMin - 5', 'dataMax + 5']}
                stroke="#6b7280"
                fontSize={12}
                label={{ value: 'Standard Deviation (Variance) ↑', angle: -90, position: 'left', fill: '#9ca3af', fontSize: 12 }}
              />
              <ZAxis type="number" range={[100, 100]} />
              <RechartsTooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />

              {/* Quadrant Dividers */}
              <ReferenceLine x={scatterAvgPoints} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
              <ReferenceLine y={scatterAvgStdDev} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />

              <Scatter data={scatterData} shape="circle">
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>


    </div>
  )
}

function H2HMatrix({ allPlayers, h2hMatrix }) {
  const [activeH2H, setActiveH2H] = useState(null)

  useEffect(() => {
    const handleClickOutside = () => setActiveH2H(null)
    if (activeH2H) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [activeH2H])

  return (
    <div className="bg-[#0a0f1c] rounded-2xl p-6 border border-white/5 shadow-2xl lg:col-span-2 overflow-x-auto">
      <h3 className="text-lg font-bold text-white mb-1">Head-to-Head Matrix</h3>
      <p className="text-xs text-gray-500 mb-6">Read rows across: Number of times Row Player ranked higher than Column Player</p>

      <div className="min-w-[700px]">
        <div className="grid" style={{ gridTemplateColumns: `100px repeat(${allPlayers.length}, minmax(0, 1fr))` }}>
          {/* Header Row */}
          <div className="p-2"></div>
          {allPlayers.map(p => (
            <div key={`header-${p}`} className="p-2 text-center text-xs font-bold text-gray-400 rotate-[-45deg] origin-bottom-left truncate h-12 flex items-end justify-center">
              {p}
            </div>
          ))}

          {/* Matrix Rows */}
          {allPlayers.map((rowPlayer, rowIndex) => (
            <React.Fragment key={`row-${rowPlayer}`}>
              <div className="p-2 text-right text-xs font-bold text-white border-r border-white/10 flex items-center justify-end pr-4">
                {rowPlayer}
              </div>
              {allPlayers.map((colPlayer) => {
                const val = h2hMatrix[rowPlayer][colPlayer]
                const isSelf = val === null

                let bgOpacity = 0
                if (!isSelf && val > 0) {
                  bgOpacity = Math.min(0.1 + (val / 20), 0.9)
                }

                return (
                  <div
                    key={`${rowPlayer}-${colPlayer}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isSelf) {
                        setActiveH2H(activeH2H?.row === rowPlayer && activeH2H?.col === colPlayer ? null : { row: rowPlayer, col: colPlayer })
                      }
                    }}
                    className="relative aspect-square border border-white/5 flex items-center justify-center text-sm font-semibold transition-colors hover:border-yellow-400/50 cursor-pointer"
                    style={{
                      backgroundColor: isSelf ? 'rgba(255,255,255,0.02)' : `rgba(0, 212, 255, ${bgOpacity})`,
                      color: isSelf ? '#4b5563' : (bgOpacity > 0.4 ? '#fff' : '#9ca3af')
                    }}
                    title={`${rowPlayer} beat ${colPlayer} ${val} times`}
                  >
                    {isSelf ? '—' : val}

                    {activeH2H?.row === rowPlayer && activeH2H?.col === colPlayer && (
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-max bg-[#0e1628] border border-white/20 p-2 rounded shadow-2xl text-xs text-center z-50 pointer-events-none">
                        <span className="font-bold text-white">{rowPlayer}</span> beat <span className="font-bold text-white">{colPlayer}</span><br />
                        <span className="text-yellow-400 font-bold">{val} times</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
