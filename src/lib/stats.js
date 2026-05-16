import { matches, allPlayers } from '@/data/matches'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
