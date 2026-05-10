import { getAllPlayerStats } from '@/lib/stats'

// Tie-handling podium logic
function getPodiumData(stats, metric) {
  const sorted = [...stats].sort((a, b) => b[metric] - a[metric])
  
  const ranks = []
  for (let i = 0; i < sorted.length; i++) {
    const player = sorted[i]
    const value = player[metric]
    
    const lastRankGroup = ranks[ranks.length - 1]
    if (lastRankGroup && lastRankGroup.value === value) {
      lastRankGroup.players.push(player.player)
    } else {
      if (ranks.length >= 3) break
      ranks.push({ rank: i + 1, value, players: [player.player] })
    }
  }
  
  // We need exactly 3 positions: the top 3 distinct value groups
  const pos1 = ranks[0] || null
  const pos2 = ranks[1] || null
  const pos3 = ranks[2] || null
  
  return { pos1, pos2, pos3 }
}

function PodiumBlock({ pos, height, color, medal }) {
  if (!pos) {
    return (
      <div className="flex flex-col items-center justify-end w-1/3">
        <div className={`w-full rounded-t-lg bg-white/5 border-t border-white/10 flex flex-col items-center justify-start p-2 ${height}`} />
      </div>
    )
  }
  
  return (
    <div className="flex flex-col items-center justify-end w-1/3 text-center">
      <div className="mb-2 flex flex-col items-center gap-1 z-10 px-1">
        <span className="text-2xl drop-shadow-md mb-1">{medal}</span>
        {pos.players.map(p => (
          <span key={p} className="text-xs sm:text-sm font-bold text-white leading-tight truncate w-full">{p}</span>
        ))}
      </div>
      <div 
        className={`w-full rounded-t-lg flex flex-col items-center justify-start p-2 sm:p-3 relative overflow-hidden transition-all duration-500 ${height}`}
        style={{ background: `linear-gradient(to bottom, ${color}33, transparent)`, borderTop: `2px solid ${color}` }}
      >
        <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(180deg, ${color}, transparent)` }} />
        <span className="font-extrabold text-white z-10 text-xs sm:text-sm">{pos.value.toLocaleString()}</span>
      </div>
    </div>
  )
}

function PodiumChart({ title, data, valueLabel }) {
  // data is { pos1, pos2, pos3 }
  // Order: Rank 2 (left), Rank 1 (center), Rank 3 (right)
  return (
    <div className="bg-[#0a0f1c] rounded-2xl p-6 border border-white/5 shadow-2xl flex-1">
      <h2 className="text-xl font-extrabold text-white text-center mb-8">{title}</h2>
      
      <div className="flex items-end justify-center h-[260px] max-w-[400px] mx-auto gap-1 sm:gap-2 border-b border-white/10 pb-0">
        
        {/* Rank 2 - Left */}
        <PodiumBlock pos={data.pos2} height="h-[120px]" color="#C0C0C0" medal="🥈" />
        
        {/* Rank 1 - Center */}
        <PodiumBlock pos={data.pos1} height="h-[170px]" color="#FFD700" medal="🥇" />
        
        {/* Rank 3 - Right */}
        <PodiumBlock pos={data.pos3} height="h-[90px]" color="#CD7F32" medal="🥉" />
        
      </div>
      <p className="text-center text-xs text-gray-500 mt-4 uppercase tracking-widest font-semibold">{valueLabel}</p>
    </div>
  )
}

export default function Podiums() {
  const stats = getAllPlayerStats()
  
  const winsData = getPodiumData(stats, 'wins')
  const pointsData = getPodiumData(stats, 'totalPoints')
  
  return (
    <div className="flex flex-col md:flex-row gap-6 mb-12">
      <PodiumChart title="🏆 Most Wins" data={winsData} valueLabel="Wins" />
      <PodiumChart title="⚡ Total Points" data={pointsData} valueLabel="Points" />
    </div>
  )
}
