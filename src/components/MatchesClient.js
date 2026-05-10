'use client'

import { useState } from 'react'
import Link from 'next/link'

const BORDER_COLORS = [
  '#FFD700', // gold
  '#00D4FF', // electric blue
  '#FF6B00', // orange
  '#9B59B6', // purple
  '#2ECC71', // emerald
  '#E74C3C', // red
]

export default function MatchesClient({ matchDetails }) {
  const [searchTerm, setSearchTerm] = useState('')

  // Sort descending by match number
  const sortedMatches = [...matchDetails].sort((a, b) => b.matchNumber - a.matchNumber)

  const filteredMatches = sortedMatches.filter((match) => {
    const term = searchTerm.toLowerCase()
    if (!term) return true
    
    // Check teams
    if (match.teams.toLowerCase().includes(term)) return true
    
    // Check participants
    const participants = match.results.map(r => r.player.toLowerCase())
    if (participants.some(p => p.includes(term))) return true
    
    return false
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header & Search */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Season{' '}
            <span className="inline-block text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-electric-blue" style={{ backgroundImage: 'linear-gradient(to bottom, #00D4FF, #9B59B6)'}}>
              Matches
            </span>
          </h1>
          <p className="mt-2 text-gray-400 text-sm">
            {matchDetails.length} matches played. Click any match for full details.
          </p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search team or player..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0e1628] border border-white/10 text-white text-sm rounded-lg
                       px-4 py-2.5 focus:outline-none focus:border-blue-400/60
                       hover:border-white/20 transition-colors"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white font-bold"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filteredMatches.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No matches found matching "{searchTerm}"
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match, i) => {
            const color = BORDER_COLORS[i % BORDER_COLORS.length]
            const winner = match.results.find(r => r.rank === 1)?.player
            const participantCount = match.results.length
            
            // Format date: "Sat, 12 Apr 2026"
            const dateObj = new Date(match.date)
            const dateStr = dateObj.toLocaleDateString('en-GB', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })

            return (
              <Link 
                href={`/matches/${match.id}`} 
                key={match.id}
                className="block group"
              >
                <div 
                  className="flex flex-col rounded-xl p-5 h-full transition-transform duration-200 group-hover:-translate-y-1"
                  style={{
                    background: 'linear-gradient(135deg, #0e1628 0%, #111c30 100%)',
                    borderLeft: `4px solid ${color}`,
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold tracking-wider uppercase text-gray-400">
                      Match {match.matchNumber}
                    </span>
                    <span className="text-xs text-gray-500">
                      {dateStr}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-4">
                    {match.teams}
                  </h3>
                  
                  <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Winner</p>
                      <p className="text-sm font-bold text-yellow-400 flex items-center gap-1.5">
                        <span className="text-base">🏆</span> {winner || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        {participantCount} played
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
