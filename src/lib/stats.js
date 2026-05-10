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
    const winRate = gamesPlayed > 0 ? round1((wins / gamesPlayed) * 100) : 0
    const avgPosition = gamesPlayed > 0 ? round1(entries.reduce((sum, e) => sum + e.rank, 0) / gamesPlayed) : 0
    const scores = entries.map((e) => e.score)
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0
    const worstScore = scores.length > 0 ? Math.min(...scores) : 0
    const skips = matches.length - gamesPlayed

    return {
      player,
      gamesPlayed,
      totalPoints,
      avgPoints,
      wins,
      winRate,
      avgPosition,
      bestScore,
      worstScore,
      skips,
    }
  })
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
