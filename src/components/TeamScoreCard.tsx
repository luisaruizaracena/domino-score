import { useEffect, useRef, useState } from 'react'
import { Crown, Pencil } from 'lucide-react'
import type { Team } from '../lib/game'

interface Props {
  team: Team
  fallbackName: string
  score: number
  target: number
  leader: boolean
  winner: boolean
  onEdit: () => void
}

export function TeamScoreCard({ team, fallbackName, score, target, leader, winner, onEdit }: Props) {
  const name = team.name.trim() || fallbackName
  const players = team.players.map((p) => p.trim()).filter(Boolean).join(' y ')
  const pct = Math.min(100, (score / target) * 100)
  const remaining = Math.max(0, target - score)
  const highlighted = leader || winner

  // Pequeño "pop" del número cuando cambia el marcador.
  const [pulse, setPulse] = useState(false)
  const prev = useRef(score)
  useEffect(() => {
    if (prev.current !== score) {
      prev.current = score
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 240)
      return () => clearTimeout(t)
    }
  }, [score])

  return (
    <article
      aria-label={`${name}: ${score} puntos${leader ? ', va ganando' : ''}`}
      className={`relative flex min-w-0 flex-col rounded-3xl border p-4 transition-[border-color,box-shadow] duration-200 sm:p-5 ${
        highlighted ? 'border-gold bg-card shadow-gold' : 'border-line bg-card shadow-soft'
      }`}
    >
      {highlighted && (
        <span className="absolute -top-3 left-1/2 grid size-7 -translate-x-1/2 place-items-center rounded-full border border-gold bg-bg text-gold">
          <Crown className="size-4" aria-hidden="true" />
          <span className="sr-only">{winner ? 'Ganador' : 'Líder'}</span>
        </span>
      )}
      <div className="flex items-start gap-1">
        <div className="min-w-0 flex-1">
          <h2 className={`truncate text-base font-semibold ${highlighted ? 'text-gold-light' : 'text-ink'}`} title={name}>
            {name}
          </h2>
          <p className="truncate text-xs text-muted sm:text-sm" title={players}>
            {players || 'Sin jugadores'}
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Editar ${name}`}
          className="-mr-2 -mt-2 grid size-11 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <Pencil className="size-4" />
        </button>
      </div>

      <p
        className={`tabular my-3 text-center text-5xl leading-none font-bold tracking-tight sm:text-6xl ${
          highlighted ? 'text-gold' : 'text-ink'
        } ${pulse ? 'animate-pop' : ''}`}
        aria-live="polite"
      >
        {score}
      </p>

      <div
        className="h-2 overflow-hidden rounded-full bg-surface"
        role="progressbar"
        aria-label={`Progreso de ${name}`}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={Math.min(score, target)}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-250 ease-out ${highlighted ? 'bg-gold' : 'bg-muted/70'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="tabular mt-2 text-center text-xs text-muted">
        {remaining === 0 ? (
          <span className="font-medium text-success">¡Meta alcanzada!</span>
        ) : (
          <>
            Faltan <span className="font-semibold text-ink">{remaining}</span>
          </>
        )}
      </p>
    </article>
  )
}
