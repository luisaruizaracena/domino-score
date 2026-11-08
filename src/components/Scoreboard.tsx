import { getLeader, type Game, type TeamIndex } from '../lib/game'
import { TeamScoreCard } from './TeamScoreCard'

interface Props {
  game: Game
  totals: [number, number]
  onEditTeam: (i: TeamIndex) => void
}

export function Scoreboard({ game, totals, onEditTeam }: Props) {
  const leader = getLeader(totals)
  return (
    <section aria-label="Marcador" className="grid grid-cols-2 gap-3 pt-3 sm:gap-4">
      {([0, 1] as const).map((i) => (
        <TeamScoreCard
          key={i}
          team={game.teams[i]}
          fallbackName={`Pareja ${i + 1}`}
          score={totals[i]}
          target={game.target}
          leader={leader === i}
          winner={game.winner === i}
          onEdit={() => onEditTeam(i)}
        />
      ))}
      {leader === null && totals[0] > 0 && (
        <p className="col-span-2 -mt-1 text-center text-xs font-medium text-muted">Empate</p>
      )}
    </section>
  )
}
