'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine,
  PieChart, Pie, Cell, Legend
} from 'recharts'

export default function PlayerProfileClient({ playerStats, trendData, pieData, h2hData }) {
  
  const CustomLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-[#0e1628] border border-white/20 p-3 rounded-lg shadow-xl text-sm">
          <p className="font-bold text-white mb-1">{label}</p>
          {data.score !== null ? (
            <>
              <p className="text-gray-300">Score: <span className="font-bold text-yellow-400">{data.score}</span></p>
              <p className="text-gray-300">Rank: <span className="font-bold text-blue-400">#{data.rank}</span></p>
            </>
          ) : (
            <p className="text-red-400 font-medium">Skipped Match</p>
          )}
        </div>
      )
    }
    return null
  }

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-[#0e1628] border border-white/20 p-2 rounded-lg shadow-xl text-sm">
          <p className="text-gray-300">
            <span style={{ color: data.fill }} className="font-bold">{data.name}:</span> {data.value} matches
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* Section 1: Stat Cards Row */}
      <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x">
        <StatCard title="Wins" value={playerStats.wins} color="text-yellow-400" />
        <StatCard title="Win Rate" value={`${playerStats.winRate}%`} color="text-blue-400" />
        <StatCard title="Best Score" value={playerStats.bestScore} color="text-green-400" />
        <StatCard title="Worst Score" value={playerStats.worstScore} color="text-red-400" />
        <StatCard title="Avg Score" value={playerStats.avgPoints} color="text-purple-400" />
        <StatCard title="Avg Position" value={playerStats.avgPosition} color="text-emerald-400" />
        <StatCard title="Current Streak" value={playerStats.currentStreak} color="text-orange-400" />
        <StatCard title="Best Win Streak" value={playerStats.bestStreak} color="text-teal-400" />
        <StatCard title="Consistency (Std Dev)" value={`±${playerStats.consistencyScore}`} color="text-gray-300" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 2: Score Trend */}
        <div className="bg-[#0a0f1c] rounded-2xl p-6 border border-white/5 shadow-2xl lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-1">Score Trend</h3>
          <p className="text-xs text-gray-500 mb-6">Historical scores with average reference line</p>
          <div className="w-full overflow-x-auto custom-scrollbar pb-2">
            <div className="h-[300px]" style={{ minWidth: `${Math.max(trendData.length * 45, 600)}px` }}>
              <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickMargin={10} />
                <YAxis stroke="#6b7280" fontSize={11} domain={['auto', 'auto']} />
                <RechartsTooltip content={<CustomLineTooltip />} />
                <ReferenceLine y={playerStats.avgPoints} stroke="#9ca3af" strokeDasharray="3 3" label={{ position: 'top', value: 'Avg Score', fill: '#9ca3af', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#00D4FF"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0a0f1c', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#FFD700', strokeWidth: 0 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Section 3: Position Trend */}
        <div className="bg-[#0a0f1c] rounded-2xl p-6 border border-white/5 shadow-2xl lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-1">Position Trend</h3>
          <p className="text-xs text-gray-500 mb-6">Daily rank per match. Rank 1 is at the top.</p>
          <div className="w-full overflow-x-auto custom-scrollbar pb-2">
            <div className="h-[300px]" style={{ minWidth: `${Math.max(trendData.length * 45, 600)}px` }}>
              <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickMargin={10} />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={11} 
                  domain={[1, 9]} 
                  reversed={true} 
                  tickCount={9}
                  interval={0}
                />
                <RechartsTooltip content={<CustomLineTooltip />} />
                <ReferenceLine y={playerStats.avgPosition} stroke="#9ca3af" strokeDasharray="3 3" label={{ position: 'top', value: 'Avg Rank', fill: '#9ca3af', fontSize: 10 }} />
                <Line
                  type="stepAfter"
                  dataKey="rank"
                  stroke="#FFD700"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0a0f1c', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#00D4FF', strokeWidth: 0 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Section 4: Pie Breakdown */}
        <div className="bg-[#0a0f1c] rounded-2xl p-6 border border-white/5 shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-1">Performance Breakdown</h3>
          <p className="text-xs text-gray-500 mb-6">Distribution of match outcomes</p>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomPieTooltip />} />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  formatter={(value, entry) => <span className="text-gray-300 text-sm">{value} ({entry.payload.value})</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 5: Head-to-Head */}
        <div className="bg-[#0a0f1c] rounded-2xl p-6 border border-white/5 shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-1">Head-to-Head Record</h3>
          <p className="text-xs text-gray-500 mb-6">Wins against each opponent in shared matches</p>
          <div className="overflow-x-auto max-h-[300px] hide-scrollbar rounded-lg border border-white/10">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-xs uppercase text-gray-400 sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="px-4 py-3">Opponent</th>
                  <th className="px-4 py-3 text-center">Matches</th>
                  <th className="px-4 py-3 text-center">Wins</th>
                  <th className="px-4 py-3 text-center">Losses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {h2hData.map(row => {
                  const isWinning = row.thisPlayerWins > row.opponentWins
                  const isLosing = row.thisPlayerWins < row.opponentWins
                  
                  return (
                    <tr key={row.opponent} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{row.opponent}</td>
                      <td className="px-4 py-3 text-center text-gray-400">{row.matchesPlayedTogether}</td>
                      <td className={`px-4 py-3 text-center font-bold ${isWinning ? 'text-green-400' : 'text-gray-300'}`}>
                        {row.thisPlayerWins}
                      </td>
                      <td className={`px-4 py-3 text-center font-bold ${isLosing ? 'text-red-400' : 'text-gray-300'}`}>
                        {row.opponentWins}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}

function StatCard({ title, value, color }) {
  return (
    <div className="min-w-[140px] flex-shrink-0 snap-start bg-[#0a0f1c] rounded-xl p-4 border border-white/5 shadow-lg">
      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-1 truncate">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
