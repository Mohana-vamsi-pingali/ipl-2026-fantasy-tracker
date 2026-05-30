'use client'

import { useState, useEffect } from 'react'
import { getAllPlayerStats, getChampionshipStandings } from '@/lib/stats'

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

function PodiumChart({ title, data, valueLabel, extraHeaderContent }) {
  // data is { pos1, pos2, pos3 }
  // Order: Rank 2 (left), Rank 1 (center), Rank 3 (right)
  return (
    <div className="bg-[#0a0f1c] rounded-2xl p-6 border border-white/5 shadow-2xl flex-1 relative">
      <div className="flex flex-col items-center justify-center mb-4 relative">
        <h2 className="text-xl font-extrabold text-white text-center mb-3">{title}</h2>
        {extraHeaderContent && (
          <div className="w-full flex justify-between z-10 px-1">
            {extraHeaderContent}
          </div>
        )}
      </div>
      
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

function ChampionshipPodiumChart({ data }) {
  const [showPointsModal, setShowPointsModal] = useState(false)
  const [showStandingsModal, setShowStandingsModal] = useState(false)

  useEffect(() => {
    if (showPointsModal || showStandingsModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showPointsModal, showStandingsModal])
  
  const standings = getChampionshipStandings()

  // Calculate tie-aware ranks for the modal
  let currentRank = 1;
  let currentPoints = -1;
  let ranksSeen = 0;
  
  const rankedStandings = standings.map((st) => {
    if (st.championshipPoints !== currentPoints) {
      ranksSeen++;
      currentPoints = st.championshipPoints;
      currentRank = ranksSeen;
    }
    return { ...st, rank: currentRank };
  });

  const extraButtons = (
    <>
      <button 
        onClick={() => setShowPointsModal(true)}
        className="text-xs font-medium text-gray-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-200 cursor-pointer flex items-center gap-1.5"
      >
        <span>ℹ️</span><span>Points System</span>
      </button>
      <button 
        onClick={() => setShowStandingsModal(true)}
        className="text-xs font-medium text-gray-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-200 cursor-pointer flex items-center gap-1.5"
      >
        <span>📊</span><span>Full Standings</span>
      </button>
    </>
  )

  return (
    <>
      <PodiumChart title="🏆 Championship Points" data={data} valueLabel="Pts" extraHeaderContent={extraButtons} />
      
      {/* Points System Modal */}
      {showPointsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowPointsModal(false)}>
          <div className="bg-[#0a0f1c] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowPointsModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
            <h3 className="text-xl font-bold text-white mb-2">🏆 Championship Points System</h3>
            <p className="text-sm text-gray-400 mb-6">Points awarded per match based on finishing rank. Skipping a match earns 0 points.</p>
            
            <div className="overflow-y-auto max-h-[60vh] rounded-xl border border-white/5 bg-white/5 custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
              <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-gray-400 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300 divide-y divide-white/5">
                  {[
                    { r: '1st', p: 20 },
                    { r: '2nd', p: 16 },
                    { r: '3rd', p: 13 },
                    { r: '4th', p: 11 },
                    { r: '5th', p: 9 },
                    { r: '6th', p: 7 },
                    { r: '7th', p: 5 },
                    { r: '8th', p: 3 },
                    { r: '9th', p: 2 },
                    { r: '10th', p: 1 },
                    { r: 'Skipped', p: 0 }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="px-4 py-2 font-medium">{row.r}</td>
                      <td className="px-4 py-2 text-right text-yellow-400 font-bold">{row.p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Full Standings Modal */}
      {showStandingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowStandingsModal(false)}>
          <div className="bg-[#0a0f1c] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowStandingsModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">🏆 Championship Standings</h3>
              <p className="text-sm text-gray-400 mb-6">Total championship points accumulated across all matches.</p>
            </div>
            
            <div className="overflow-y-auto rounded-xl border border-white/5 bg-white/5 custom-scrollbar flex-1" style={{ WebkitOverflowScrolling: 'touch' }}>
              <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-gray-400 text-xs uppercase sticky top-0 backdrop-blur-md">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">Rank</th>
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3 text-right">Points</th>
                    <th className="px-4 py-3 text-right hidden sm:table-cell">Played</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300 divide-y divide-white/5">
                  {rankedStandings.map((row, i) => {
                    let style = { borderLeft: '3px solid transparent' }
                    let className = "hover:bg-white/5 transition-colors duration-150"
                    let rankContent = row.rank
                    
                    if (row.rank === 1) {
                      style = { background: 'rgba(255,215,0,0.10)', borderLeft: '3px solid #FFD700' }
                      rankContent = <span className="text-base" title="Rank 1">🥇</span>
                    } else if (row.rank === 2) {
                      style = { background: 'rgba(192,192,192,0.08)', borderLeft: '3px solid #C0C0C0' }
                      rankContent = <span className="text-base" title="Rank 2">🥈</span>
                    } else if (row.rank === 3) {
                      style = { background: 'rgba(205,127,50,0.08)', borderLeft: '3px solid #CD7F32' }
                      rankContent = <span className="text-base" title="Rank 3">🥉</span>
                    }
                    
                    return (
                      <tr key={i} className={className} style={style}>
                        <td className="px-4 py-3 text-center text-gray-400 font-bold">{rankContent}</td>
                        <td className="px-4 py-3 font-semibold text-white">{row.player}</td>
                        <td className="px-4 py-3 text-right text-yellow-400 font-bold">{row.championshipPoints}</td>
                        <td className="px-4 py-3 text-right text-gray-500 hidden sm:table-cell">{row.matchesPlayed}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


export default function Podiums() {
  const stats = getAllPlayerStats()
  
  const champData = getPodiumData(stats, 'championshipPoints')
  const winsData = getPodiumData(stats, 'wins')
  const pointsData = getPodiumData(stats, 'totalPoints')
  
  return (
    <div className="flex flex-col md:flex-row gap-6 mb-12">
      <ChampionshipPodiumChart data={champData} />
      <PodiumChart title="🏆 Most Wins" data={winsData} valueLabel="Wins" />
      <PodiumChart title="⚡ Total Points" data={pointsData} valueLabel="Points" />
    </div>
  )
}
