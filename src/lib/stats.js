import { matches, allPlayers } from '@/data/matches'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CHAMPIONSHIP_POINTS = {
  1: 20, 2: 16, 3: 13, 4: 11, 5: 9,
  6: 7, 7: 5, 8: 3, 9: 2, 10: 1
}

function round1(n) {
  return Math.round(n * 10) / 10
}

function stdDev(scores) {
  if (scores.length < 2) return 0
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length
  const variance = scores.reduce((sum, s) => sum + (s - mean) ** 2, 0) / scores.length
  return round1(Math.sqrt(variance))
}

function calcStreaks(playerName) {
  let currentStreak = 0
  let bestStreak = 0
  let running = 0

  for (const match of matches) {
    const result = match.results.find((r) => r.player === playerName)
    if (!result) continue // skipped match — does NOT break a win streak

    if (result.rank === 1) {
      running++
      if (running > bestStreak) bestStreak = running
    } else {
      running = 0
    }
  }

  // currentStreak = trailing wins
  for (let i = matches.length - 1; i >= 0; i--) {
    const result = matches[i].results.find((r) => r.player === playerName)
    if (!result) continue // skip absent matches
    if (result.rank === 1) {
      currentStreak++
    } else {
      break
    }
  }

  return { currentStreak, bestStreak }
}

// ---------------------------------------------------------------------------
// getAllPlayerStats()
// ---------------------------------------------------------------------------

export function getAllPlayerStats() {
  const allLastPlace = getLastPlaceStats()
  const allSilverMedals = getSilverMedalStats()
  const allBronzeMedals = getBronzeMedalStats()
  const allBelowAvg = getBelowAverageStats()
  const championshipStandings = getChampionshipStandings()

  return allPlayers.map((player) => {
    const entries = []

    for (const match of matches) {
      const result = match.results.find((r) => r.player === player)
      if (result) entries.push(result)
    }

    const gamesPlayed = entries.length
    const totalPoints = entries.reduce((sum, e) => sum + e.score, 0)
    const avgPoints = gamesPlayed > 0 ? round1(totalPoints / gamesPlayed) : 0
    const wins = entries.filter((e) => e.rank === 1).length
    const top3 = entries.filter((e) => e.rank <= 3).length
    const winRate = gamesPlayed > 0 ? round1((wins / gamesPlayed) * 100) : 0
    const avgPosition = gamesPlayed > 0 ? round1(entries.reduce((sum, e) => sum + e.rank, 0) / gamesPlayed) : 0
    const scores = entries.map((e) => e.score)
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0
    const worstScore = scores.length > 0 ? Math.min(...scores) : 0
    const skips = matches.length - gamesPlayed
    const bestTop3Streak = getBestTop3Streaks(player)[0]?.length || 0
    const lastPlaceCount = allLastPlace.find(s => s.player === player)?.lastPlaceCount || 0
    const silverMedals = allSilverMedals.find(s => s.player === player)?.silverCount || 0
    const bronzeMedals = allBronzeMedals.find(s => s.player === player)?.bronzeCount || 0
    const belowAvgCount = allBelowAvg.find(s => s.player === player)?.belowAvgCount || 0
    const championshipPoints = championshipStandings.find(s => s.player === player)?.championshipPoints || 0
    const stdDevScore = stdDev(scores)

    return {
      player,
      gamesPlayed,
      totalPoints,
      avgPoints,
      wins,
      top3,
      winRate,
      avgPosition,
      bestScore,
      worstScore,
      skips,
      bestTop3Streak,
      lastPlaceCount,
      silverMedals,
      bronzeMedals,
      belowAvgCount,
      championshipPoints,
      stdDev: stdDevScore,
    }
  })
}

// ---------------------------------------------------------------------------
// getBestTop3Streaks(playerName)
// ---------------------------------------------------------------------------

export function getBestTop3Streaks(playerName) {
  const playerMatches = []
  for (const match of matches) {
    const result = match.results.find((r) => r.player === playerName)
    if (result) {
      playerMatches.push({
        matchNumber: match.matchNumber,
        teams: match.teams,
        rank: result.rank,
        score: result.score,
      })
    }
  }

  const streaks = []
  let currentStreakMatches = []

  for (const pm of playerMatches) {
    if (pm.rank <= 3) {
      currentStreakMatches.push(pm)
    } else {
      if (currentStreakMatches.length > 0) {
        streaks.push({
          length: currentStreakMatches.length,
          matches: [...currentStreakMatches],
        })
        currentStreakMatches = []
      }
    }
  }
  if (currentStreakMatches.length > 0) {
    streaks.push({
      length: currentStreakMatches.length,
      matches: [...currentStreakMatches],
    })
  }

  return streaks.sort((a, b) => b.length - a.length)
}

// ---------------------------------------------------------------------------
// getAllTop3Streaks()
// ---------------------------------------------------------------------------

export function getAllTop3Streaks() {
  const allStreaks = []

  // Only consider the top streak per player or all streaks?
  // "Wait, example shows tied players... If a player has a 9-streak and a 7-streak, 
  // do we show their 7-streak again?"
  // "returns the top 3 longest streaks across ALL players"
  // Let's only use the BEST streak per player to avoid duplicates.
  for (const player of allPlayers) {
    const pStreaks = getBestTop3Streaks(player)
    if (pStreaks.length > 0) {
      const bestStreak = pStreaks[0]
      allStreaks.push({
        player,
        length: bestStreak.length,
        matches: bestStreak.matches,
      })
    }
  }

  allStreaks.sort((a, b) => b.length - a.length)

  const rankedStreaks = []
  let currentRank = 1
  let currentLength = -1
  let lengthsSeen = 0

  for (const st of allStreaks) {
    if (st.length !== currentLength) {
      lengthsSeen++
      if (lengthsSeen > 5) break
      currentLength = st.length
      currentRank = lengthsSeen
    }

    rankedStreaks.push({
      rank: currentRank,
      length: st.length,
      player: st.player,
      matches: st.matches,
    })
  }

  return rankedStreaks
}

// ---------------------------------------------------------------------------
// getPlayerStats(playerName)
// ---------------------------------------------------------------------------

export function getPlayerStats(playerName) {
  const base = getAllPlayerStats().find((s) => s.player === playerName)
  if (!base) return null

  const scores = []
  for (const match of matches) {
    const result = match.results.find((r) => r.player === playerName)
    if (result) {
      scores.push({
        matchId: match.id,
        matchNumber: match.matchNumber,
        teams: match.teams,
        score: result.score,
        rank: result.rank,
      })
    }
  }

  const { currentStreak, bestStreak } = calcStreaks(playerName)
  const consistencyScore = stdDev(scores.map((s) => s.score))

  return {
    ...base,
    scores,
    currentStreak,
    bestStreak,
    consistencyScore,
  }
}

// ---------------------------------------------------------------------------
// getMatchDetails(matchId)
// ---------------------------------------------------------------------------

export function getMatchDetails(matchId) {
  const match = matches.find((m) => m.id === matchId)
  if (!match) return null

  const participantNames = match.results.map((r) => r.player)
  const skippedBy = allPlayers.filter((p) => !participantNames.includes(p))

  const matchScores = match.results.map((r) => r.score)
  const avgScore = round1(matchScores.reduce((a, b) => a + b, 0) / matchScores.length)
  const pointSpread = Math.max(...matchScores) - Math.min(...matchScores)

  return {
    ...match,
    skippedBy,
    avgScore,
    pointSpread,
  }
}

// ---------------------------------------------------------------------------
// getHeadToHead(player1, player2)
// ---------------------------------------------------------------------------

export function getHeadToHead(player1, player2) {
  let player1Wins = 0
  let player2Wins = 0
  let matchesPlayed = 0

  for (const match of matches) {
    const r1 = match.results.find((r) => r.player === player1)
    const r2 = match.results.find((r) => r.player === player2)
    if (!r1 || !r2) continue // both must have played

    matchesPlayed++
    if (r1.rank < r2.rank) player1Wins++
    else if (r2.rank < r1.rank) player2Wins++
    // ties not counted for either
  }

  return { player1Wins, player2Wins, matchesPlayed }
}

// ---------------------------------------------------------------------------
// getWinStreaks(playerName)
// ---------------------------------------------------------------------------

export function getWinStreaks(playerName) {
  return calcStreaks(playerName)
}

// ---------------------------------------------------------------------------
// getConsistencyScore(playerName)
// ---------------------------------------------------------------------------

export function getConsistencyScore(playerName) {
  const scores = matches
    .flatMap((m) => m.results.filter((r) => r.player === playerName))
    .map((r) => r.score)
  return stdDev(scores)
}

// ---------------------------------------------------------------------------
// getDailyLeaders()
// ---------------------------------------------------------------------------

export function getDailyLeaders() {
  return matches.map((match) => {
    const winner = match.results.find((r) => r.rank === 1)
    return {
      matchId: match.id,
      matchNumber: match.matchNumber,
      teams: match.teams,
      date: match.date,
      winner: winner ? winner.player : null,
    }
  })
}

// ---------------------------------------------------------------------------
// getTopScores(limit)
// ---------------------------------------------------------------------------

export function getTopScores(limit = 19) {
  const allScores = []
  for (const match of matches) {
    for (const result of match.results) {
      allScores.push({
        score: result.score,
        player: result.player,
        matchNumber: match.matchNumber,
        teams: match.teams
      })
    }
  }
  return allScores.sort((a, b) => b.score - a.score).slice(0, limit)
}

// ---------------------------------------------------------------------------
// getAllWinStreaks()
// ---------------------------------------------------------------------------

export function getAllWinStreaks() {
  const allStreaks = []

  for (const player of allPlayers) {
    let currentStreakCount = 0
    let currentStreakMatches = []

    for (const match of matches) {
      const result = match.results.find((r) => r.player === player)
      if (!result) continue // Skipped match doesn't break streak

      if (result.rank === 1) {
        currentStreakCount++
        currentStreakMatches.push(match.matchNumber)
      } else {
        if (currentStreakCount > 0) {
          allStreaks.push({ player, streak: currentStreakCount, matches: [...currentStreakMatches] })
        }
        currentStreakCount = 0
        currentStreakMatches = []
      }
    }
    if (currentStreakCount > 0) {
      allStreaks.push({ player, streak: currentStreakCount, matches: [...currentStreakMatches] })
    }
  }

  // Sort descending by streak length
  return allStreaks.sort((a, b) => b.streak - a.streak)
}

// ---------------------------------------------------------------------------
// getLastPlaceStats()
// ---------------------------------------------------------------------------

export function getLastPlaceStats() {
  const statsMap = {}
  for (const player of allPlayers) {
    statsMap[player] = { player, lastPlaceCount: 0, matches: [] }
  }

  for (const match of matches) {
    if (!match.results || match.results.length === 0) continue

    // Highest rank number is last place
    const maxRank = Math.max(...match.results.map(r => r.rank))

    // Find all players with this rank
    const lastPlaceResults = match.results.filter(r => r.rank === maxRank)

    for (const res of lastPlaceResults) {
      if (!statsMap[res.player]) {
        statsMap[res.player] = { player: res.player, lastPlaceCount: 0, matches: [] }
      }
      statsMap[res.player].lastPlaceCount++
      statsMap[res.player].matches.push({
        matchNumber: match.matchNumber,
        teams: match.teams,
        score: res.score,
        rank: res.rank
      })
    }
  }

  return Object.values(statsMap).sort((a, b) => b.lastPlaceCount - a.lastPlaceCount)
}

// ---------------------------------------------------------------------------
// getWorstLosingStreaks()
// ---------------------------------------------------------------------------

export function getWorstLosingStreaks() {
  const streaks = []

  for (const player of allPlayers) {
    let currentStreakCount = 0
    let currentStreakMatches = []
    let worstStreakCount = 0
    let worstStreakMatches = []

    for (const match of matches) {
      const result = match.results.find((r) => r.player === player)
      if (!result) continue // Skipped match doesn't break streak

      if (result.rank > 1) {
        currentStreakCount++
        currentStreakMatches.push({
          matchNumber: match.matchNumber,
          teams: match.teams,
          rank: result.rank,
          score: result.score
        })
        if (currentStreakCount > worstStreakCount) {
          worstStreakCount = currentStreakCount
          worstStreakMatches = [...currentStreakMatches]
        }
      } else {
        currentStreakCount = 0
        currentStreakMatches = []
      }
    }

    streaks.push({
      player,
      worstStreak: worstStreakCount,
      matches: worstStreakMatches
    })
  }

  return streaks.sort((a, b) => b.worstStreak - a.worstStreak)
}

// ---------------------------------------------------------------------------
// getVolatilityStats()
// ---------------------------------------------------------------------------

export function getVolatilityStats() {
  const allStats = getAllPlayerStats()
  const eligible = allStats.filter(s => s.gamesPlayed >= 5)

  const volatility = eligible.map(s => ({
    player: s.player,
    stdDev: s.stdDev,
    avgScore: s.avgPoints,
    highestScore: s.bestScore,
    lowestScore: s.worstScore,
    gamesPlayed: s.gamesPlayed
  }))

  return volatility.sort((a, b) => b.stdDev - a.stdDev)
}

// ---------------------------------------------------------------------------
// getSlowestStarters()
// ---------------------------------------------------------------------------

export function getSlowestStarters() {
  const starters = []

  for (const player of allPlayers) {
    const playerMatches = []

    for (const match of matches) {
      const result = match.results.find(r => r.player === player)
      if (result) {
        playerMatches.push({
          matchNumber: match.matchNumber,
          teams: match.teams,
          score: result.score,
          rank: result.rank
        })
      }
    }

    if (playerMatches.length >= 10) {
      const first10 = playerMatches.slice(0, 10)
      const sum = first10.reduce((a, b) => a + b.score, 0)
      const earlyAvg = round1(sum / 10)

      starters.push({
        player,
        earlyAvg,
        first10Matches: first10,
        gamesPlayed: playerMatches.length
      })
    }
  }

  return starters.sort((a, b) => a.earlyAvg - b.earlyAvg)
}

// ---------------------------------------------------------------------------
// getGhostAwardStats()
// ---------------------------------------------------------------------------
export function getGhostAwardStats() {
  const stats = []
  for (const player of allPlayers) {
    let currentStreakCount = 0
    let currentStreakMatches = []
    let worstStreakCount = 0
    let worstStreakMatches = []

    for (const match of matches) {
      const result = match.results.find((r) => r.player === player)
      if (!result) { // skipped
        currentStreakCount++
        currentStreakMatches.push({ matchNumber: match.matchNumber, teams: match.teams })
        if (currentStreakCount > worstStreakCount) {
          worstStreakCount = currentStreakCount
          worstStreakMatches = [...currentStreakMatches]
        }
      } else {
        currentStreakCount = 0
        currentStreakMatches = []
      }
    }
    stats.push({
      player,
      longestSkipStreak: worstStreakCount,
      matches: worstStreakMatches
    })
  }
  return stats.sort((a, b) => b.longestSkipStreak - a.longestSkipStreak)
}

// ---------------------------------------------------------------------------
// getClosestNearMiss()
// ---------------------------------------------------------------------------
export function getClosestNearMiss() {
  const nearMisses = []

  for (const match of matches) {
    if (!match.results || match.results.length === 0) continue

    // Find rank 1 score and rank 2 score
    const ranks = [...new Set(match.results.map(r => r.rank))].sort((a, b) => a - b)
    if (ranks.length < 2) continue // Need at least two ranks

    const rank1Score = match.results.find(r => r.rank === ranks[0]).score
    const rank1Players = match.results.filter(r => r.rank === ranks[0]).map(r => r.player).join(', ')
    const rank2Score = match.results.find(r => r.rank === ranks[1]).score
    const rank2Players = match.results.filter(r => r.rank === ranks[1])

    const gapPoints = rank1Score - rank2Score
    const gapPercent = round1((gapPoints / rank1Score) * 100)

    for (const r2 of rank2Players) {
      nearMisses.push({
        player: r2.player,
        matchNumber: match.matchNumber,
        teams: match.teams,
        rank1Player: rank1Players,
        rank1Score: rank1Score,
        rank2Score: rank2Score,
        gapPoints: round1(gapPoints),
        gapPercent: gapPercent
      })
    }
  }

  return nearMisses.sort((a, b) => a.gapPercent - b.gapPercent)
}

// ---------------------------------------------------------------------------
// getSilverMedalStats()
// ---------------------------------------------------------------------------
export function getSilverMedalStats() {
  const statsMap = {}
  for (const player of allPlayers) {
    statsMap[player] = { player, silverCount: 0, matches: [] }
  }

  for (const match of matches) {
    if (!match.results || match.results.length === 0) continue

    const ranks = [...new Set(match.results.map(r => r.rank))].sort((a, b) => a - b)
    if (ranks.length < 2) continue

    const rank1Score = match.results.find(r => r.rank === ranks[0]).score
    const rank1Players = match.results.filter(r => r.rank === ranks[0]).map(r => r.player).join(', ')

    const rank2Results = match.results.filter(r => r.rank === ranks[1])

    for (const res of rank2Results) {
      if (!statsMap[res.player]) {
        statsMap[res.player] = { player: res.player, silverCount: 0, matches: [] }
      }
      statsMap[res.player].silverCount++
      statsMap[res.player].matches.push({
        matchNumber: match.matchNumber,
        teams: match.teams,
        score: res.score,
        rank1Player: rank1Players,
        rank1Score: rank1Score
      })
    }
  }

  return Object.values(statsMap).sort((a, b) => b.silverCount - a.silverCount)
}

// ---------------------------------------------------------------------------
// getBronzeMedalStats()
// ---------------------------------------------------------------------------
export function getBronzeMedalStats() {
  const statsMap = {}
  for (const player of allPlayers) {
    statsMap[player] = { player, bronzeCount: 0, matches: [] }
  }

  for (const match of matches) {
    if (!match.results || match.results.length === 0) continue

    const ranks = [...new Set(match.results.map(r => r.rank))].sort((a, b) => a - b)
    if (ranks.length < 3) continue

    const rank1Score = match.results.find(r => r.rank === ranks[0]).score
    const rank1Players = match.results.filter(r => r.rank === ranks[0]).map(r => r.player).join(', ')

    const rank3Results = match.results.filter(r => r.rank === ranks[2])

    for (const res of rank3Results) {
      if (!statsMap[res.player]) {
        statsMap[res.player] = { player: res.player, bronzeCount: 0, matches: [] }
      }
      statsMap[res.player].bronzeCount++
      statsMap[res.player].matches.push({
        matchNumber: match.matchNumber,
        teams: match.teams,
        score: res.score,
        rank1Player: rank1Players,
        rank1Score: rank1Score
      })
    }
  }

  return Object.values(statsMap).sort((a, b) => b.bronzeCount - a.bronzeCount)
}

// ---------------------------------------------------------------------------
// getWorstScores(limit) and getWorstSingleScore()
// ---------------------------------------------------------------------------
export function getWorstScores(limit = 10) {
  const allScores = []
  for (const match of matches) {
    for (const result of match.results) {
      allScores.push({
        score: result.score,
        player: result.player,
        matchNumber: match.matchNumber,
        teams: match.teams
      })
    }
  }
  return allScores.sort((a, b) => a.score - b.score).slice(0, limit)
}

export function getWorstSingleScore() {
  const worst = getWorstScores(1000)
  if (worst.length === 0) return []
  const minScore = worst[0].score
  return worst.filter(s => s.score === minScore)
}

// ---------------------------------------------------------------------------
// getBelowAverageStats()
// ---------------------------------------------------------------------------
export function getBelowAverageStats() {
  const statsMap = {}
  for (const player of allPlayers) {
    statsMap[player] = { player, belowAvgCount: 0, gamesPlayed: 0, matches: [] }
  }

  for (const match of matches) {
    if (!match.results || match.results.length === 0) continue

    const matchScores = match.results.map(r => r.score)
    const matchAvg = round1(matchScores.reduce((a, b) => a + b, 0) / matchScores.length)

    for (const res of match.results) {
      if (!statsMap[res.player]) {
        statsMap[res.player] = { player: res.player, belowAvgCount: 0, gamesPlayed: 0, matches: [] }
      }

      statsMap[res.player].gamesPlayed++

      if (res.score < matchAvg) {
        statsMap[res.player].belowAvgCount++
        statsMap[res.player].matches.push({
          matchNumber: match.matchNumber,
          teams: match.teams,
          score: res.score,
          matchAvg: matchAvg,
          difference: round1(res.score - matchAvg)
        })
      }
    }
  }

  const result = Object.values(statsMap).map(s => {
    return {
      ...s,
      belowAvgRate: s.gamesPlayed > 0 ? round1((s.belowAvgCount / s.gamesPlayed) * 100) : 0
    }
  })

  return result.sort((a, b) => b.belowAvgCount - a.belowAvgCount)
}

// ---------------------------------------------------------------------------
// getImprovementStats()
// ---------------------------------------------------------------------------
export function getImprovementStats() {
  const stats = []

  for (const player of allPlayers) {
    const playerMatches = []

    for (const match of matches) {
      const result = match.results.find((r) => r.player === player)
      if (result) {
        playerMatches.push({
          matchNumber: match.matchNumber,
          score: result.score,
        })
      }
    }

    playerMatches.sort((a, b) => a.matchNumber - b.matchNumber)

    if (playerMatches.length >= 10) {
      const halfSize = Math.floor(playerMatches.length / 2)
      const firstHalf = playerMatches.slice(0, halfSize)
      const secondHalf = playerMatches.slice(halfSize)

      const firstHalfSum = firstHalf.reduce((a, b) => a + b.score, 0)
      const secondHalfSum = secondHalf.reduce((a, b) => a + b.score, 0)

      const firstHalfAvg = round1(firstHalfSum / firstHalf.length)
      const secondHalfAvg = round1(secondHalfSum / secondHalf.length)
      const improvement = round1(secondHalfAvg - firstHalfAvg)

      stats.push({
        player,
        improvement,
        firstHalfAvg,
        secondHalfAvg,
        gamesPlayed: playerMatches.length
      })
    }
  }

  return stats.sort((a, b) => b.improvement - a.improvement)
}

// ---------------------------------------------------------------------------
// getSharpshooterStats()
// ---------------------------------------------------------------------------
export function getSharpshooterStats() {
  const statsMap = {}
  for (const player of allPlayers) {
    statsMap[player] = { player, sharpshooterCount: 0, gamesPlayed: 0, matches: [] }
  }

  for (const match of matches) {
    if (!match.results || match.results.length === 0) continue

    const winnerScore = Math.max(...match.results.map(r => r.score))

    for (const res of match.results) {
      statsMap[res.player].gamesPlayed++

      const gapPercent = round1(((winnerScore - res.score) / winnerScore) * 100)

      if (gapPercent <= 5 && res.rank > 1) {
        statsMap[res.player].sharpshooterCount++
        statsMap[res.player].matches.push({
          matchNumber: match.matchNumber,
          teams: match.teams,
          score: res.score,
          winnerScore,
          gapPercent
        })
      }
    }
  }

  const result = Object.values(statsMap)
    .filter(s => s.gamesPlayed >= 10)
    .map(s => {
      return {
        ...s,
        sharpshooterRate: round1((s.sharpshooterCount / s.gamesPlayed) * 100)
      }
    })

  return result.sort((a, b) => b.sharpshooterCount - a.sharpshooterCount)
}

// ---------------------------------------------------------------------------
// getChampionshipStandings()
// ---------------------------------------------------------------------------
export function getChampionshipStandings() {
  const standingsMap = {}
  for (const player of allPlayers) {
    standingsMap[player] = { player, championshipPoints: 0, matchesPlayed: 0, skips: 0 }
  }

  for (const match of matches) {
    if (!match.results || match.results.length === 0) continue

    const participantNames = match.results.map((r) => r.player)

    // Assign skips
    for (const player of allPlayers) {
      if (!participantNames.includes(player)) {
        standingsMap[player].skips++
      }
    }

    // Assign points based on rank
    for (const result of match.results) {
      standingsMap[result.player].matchesPlayed++
      const points = CHAMPIONSHIP_POINTS[result.rank] || 0
      standingsMap[result.player].championshipPoints += points
    }
  }

  return Object.values(standingsMap).sort((a, b) => b.championshipPoints - a.championshipPoints)
}

// ---------------------------------------------------------------------------
// getTeamSpecialists()
// ---------------------------------------------------------------------------
export function getTeamSpecialists() {
  const IPL_TEAMS = [
    { abbr: 'CSK', fullName: 'Chennai Super Kings', color: '#F9CD1C' },
    { abbr: 'MI', fullName: 'Mumbai Indians', color: '#004BA0' },
    { abbr: 'RCB', fullName: 'Royal Challengers Bengaluru', color: '#EC1C24' },
    { abbr: 'RR', fullName: 'Rajasthan Royals', color: '#EA1A7F' },
    { abbr: 'KKR', fullName: 'Kolkata Knight Riders', color: '#7B2FBE' },
    { abbr: 'PBKS', fullName: 'Punjab Kings', color: '#ED1B24' },
    { abbr: 'SRH', fullName: 'Sunrisers Hyderabad', color: '#F7A721' },
    { abbr: 'DC', fullName: 'Delhi Capitals', color: '#0078BC' },
    { abbr: 'GT', fullName: 'Gujarat Titans', color: '#7B8B9A' },
    { abbr: 'LSG', fullName: 'Lucknow Super Giants', color: '#A0E6FF' }
  ]

  const teamData = IPL_TEAMS.map(team => ({
    team: team.abbr,
    fullName: team.fullName,
    color: team.color,
    matchesInvolved: 0,
    playerWins: {} // { "Arjun": 5, "Prem": 3 }
  }))

  for (const match of matches) {
    if (!match.results || match.results.length === 0) continue

    // Extract teams from "CSK vs RR"
    // Handle PK to PBKS mapping
    const matchTeamsRaw = match.teams.split('vs').map(t => t.trim().toUpperCase())
    const matchTeams = matchTeamsRaw.map(t => t === 'PK' ? 'PBKS' : t)

    // Find rank 1 players
    const rank1Results = match.results.filter(r => r.rank === 1)
    if (rank1Results.length === 0) continue

    for (const teamAbbr of matchTeams) {
      const teamObj = teamData.find(t => t.team === teamAbbr)
      if (teamObj) {
        teamObj.matchesInvolved++
        
        // Award a win to all rank 1 players for this team
        for (const res of rank1Results) {
          if (!teamObj.playerWins[res.player]) {
            teamObj.playerWins[res.player] = 0
          }
          teamObj.playerWins[res.player]++
        }
      }
    }
  }

  // Calculate specialists array for each team
  return teamData.map(teamObj => {
    // Convert playerWins object to array and sort by wins descending
    const winArray = Object.entries(teamObj.playerWins)
      .map(([player, wins]) => ({ player, wins }))
      .sort((a, b) => b.wins - a.wins)

    const topWins = winArray.length > 0 ? winArray[0].wins : 0
    const topPlayers = winArray.filter(w => w.wins === topWins).map(w => w.player)

    return {
      team: teamObj.team,
      fullName: teamObj.fullName,
      color: teamObj.color,
      matchesInvolved: teamObj.matchesInvolved,
      topPlayers: topWins > 0 ? topPlayers : [],
      topWins: topWins
    }
  })
}
