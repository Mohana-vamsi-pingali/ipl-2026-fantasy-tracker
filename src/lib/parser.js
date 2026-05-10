/**
 * Parses raw match data string into structured match objects.
 * Format per block:
 *   Match-{n} {Team A} vs {Team B}
 *   {rank}-@{player name} -{score}
 */

// IPL 2026 season starts March 22. We space matches ~1-2 days apart.
function matchDate(matchNumber) {
  const start = new Date("2026-03-22");
  // Alternate 1 and 2 day gaps to get realistic spacing
  const daysOffset = Math.floor((matchNumber - 1) * 1.5);
  const d = new Date(start);
  d.setDate(start.getDate() + daysOffset);
  return d.toISOString().split("T")[0];
}

/**
 * @param {string} rawString
 * @returns {Array<{id, matchNumber, teams, date, results: Array<{rank, player, score}>}>}
 */
export function parseRawData(rawString) {
  // Split into blocks separated by one or more blank lines
  const blocks = rawString
    .trim()
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.map((block) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);

    // First line: "Match-{n} {teams}"
    const headerMatch = lines[0].match(/^Match-(\d+)\s+(.+)$/);
    if (!headerMatch) {
      throw new Error(`Invalid match header: "${lines[0]}"`);
    }
    const matchNumber = parseInt(headerMatch[1], 10);
    const teams = headerMatch[2].trim();

    // Remaining lines: "{rank}-@{name} -{score}"
    const results = lines.slice(1).map((line) => {
      // e.g. "1-@Narsi Reddy -1045"
      const resultMatch = line.match(/^(\d+)-@(.+?)\s+-(\d+(?:\.\d+)?)$/);
      if (!resultMatch) {
        throw new Error(`Invalid result line: "${line}"`);
      }
      return {
        rank: parseInt(resultMatch[1], 10),
        player: resultMatch[2].trim(),
        score: parseFloat(resultMatch[3]),
      };
    });

    return {
      id: matchNumber,
      matchNumber,
      teams,
      date: matchDate(matchNumber),
      results,
    };
  });
}
