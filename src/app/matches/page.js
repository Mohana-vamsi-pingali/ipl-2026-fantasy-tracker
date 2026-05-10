import { matches } from '@/data/matches'
import { getMatchDetails } from '@/lib/stats'
import MatchesClient from '@/components/MatchesClient'

export const metadata = {
  title: 'Matches · IPL Fantasy Tracker 2026',
  description: 'View all match results and daily winners.',
}

export default function MatchesPage() {
  const matchDetails = matches.map(m => getMatchDetails(m.id))
  
  return <MatchesClient matchDetails={matchDetails} />
}
