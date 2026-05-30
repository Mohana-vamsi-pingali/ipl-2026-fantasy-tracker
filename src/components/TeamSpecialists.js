'use client'

import { useState, useEffect } from 'react'
import { getTeamSpecialists } from '@/lib/stats'

export default function TeamSpecialists() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const teamData = getTeamSpecialists()

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isModalOpen])

  return (
    <>
      {/* Compact Card Divider */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className="group relative overflow-hidden rounded-xl bg-[#0e1628] border border-white/5 p-5 my-8 flex items-center justify-between cursor-pointer transition-all hover:border-white/20 hover:shadow-lg"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 z-10">
          <div className="text-3xl select-none">🏏</div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Team Specialists</h3>
            <p className="text-xs text-gray-500">Find out who dominates fantasy when each IPL team plays</p>
          </div>
        </div>
        
        <div className="z-10 ml-4 shrink-0">
          <button className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white transition-colors group-hover:bg-white/10 group-hover:border-white/30">
            View All Teams <span className="text-gray-400">→</span>
          </button>
        </div>

        {/* Subtle background glow on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none bg-gradient-to-r from-blue-500/20 via-transparent to-yellow-500/20" />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#0b1120] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-start justify-between bg-black/20 shrink-0">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>🏏</span> Team Specialists
                </h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm">
                  The #1 fantasy player for each IPL team this season. Wins counted for both teams in every match.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-white transition-colors p-1"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-2" style={{ WebkitOverflowScrolling: 'touch' }}>
              {teamData.map((teamObj, idx) => (
                <div 
                  key={teamObj.team}
                  className={`flex items-center justify-between p-4 rounded-lg border-l-4 transition-colors hover:bg-white/5 ${idx % 2 === 0 ? 'bg-[#0e1628]' : 'bg-[#11192e]'}`}
                  style={{ borderLeftColor: teamObj.color }}
                >
                  {/* Left: Team Info */}
                  <div className="flex items-center gap-3 w-1/3">
                    <div 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: teamObj.color, boxShadow: `0 0 8px ${teamObj.color}` }}
                    />
                    <div>
                      <div className="font-black text-lg tracking-tight leading-none" style={{ color: teamObj.color }}>
                        {teamObj.team}
                      </div>
                    </div>
                  </div>

                  {/* Center: Top Players */}
                  <div className="flex-1 px-4 text-center">
                    {teamObj.topPlayers.length > 0 ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-lg">🥇</span>
                        <span className="font-bold text-white text-sm">
                          {teamObj.topPlayers.join(', ')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-600 text-sm italic">No data</span>
                    )}
                  </div>

                  {/* Right: Wins & Matches */}
                  <div className="text-right w-1/4">
                    {teamObj.topWins > 0 ? (
                      <>
                        <div className="font-black text-base leading-none" style={{ color: teamObj.color }}>
                          {teamObj.topWins} wins
                        </div>
                        <div className="text-[10px] text-gray-500 font-semibold mt-1">
                          {teamObj.matchesInvolved} matches
                        </div>
                      </>
                    ) : (
                      <div className="text-[10px] text-gray-500 font-semibold mt-1">
                        {teamObj.matchesInvolved} matches
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}
    </>
  )
}
