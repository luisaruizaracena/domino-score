import type { Team } from '../lib/game'
import { inputClass } from './Modal'

interface Props {
  index: 0 | 1
  team: Team
  onChange: (t: Team) => void
  autoFocus?: boolean
}

export const NAME_MAX = 24

/** Campos de nombre de pareja y de sus dos jugadores. */
export function TeamFields({ index, team, onChange, autoFocus }: Props) {
  const id = `pareja-${index}`
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-sm font-medium text-muted">Pareja {index + 1}</legend>
      <label htmlFor={`${id}-nombre`} className="sr-only">
        Nombre de la pareja {index + 1}
      </label>
      <input
        id={`${id}-nombre`}
        data-autofocus={autoFocus || undefined}
        className={inputClass}
        maxLength={NAME_MAX}
        placeholder={`Pareja ${index + 1}`}
        value={team.name}
        onChange={(e) => onChange({ ...team, name: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-2">
        {([0, 1] as const).map((p) => (
          <div key={p}>
            <label htmlFor={`${id}-j${p}`} className="sr-only">
              Jugador {p + 1} de la pareja {index + 1}
            </label>
            <input
              id={`${id}-j${p}`}
              className={inputClass}
              maxLength={NAME_MAX}
              placeholder={`Jugador ${p + 1}`}
              value={team.players[p]}
              onChange={(e) => {
                const players: [string, string] = [...team.players]
                players[p] = e.target.value
                onChange({ ...team, players })
              }}
            />
          </div>
        ))}
      </div>
    </fieldset>
  )
}

export const cleanTeam = (t: Team, i: number): Team => ({
  name: t.name.trim() || `Pareja ${i + 1}`,
  players: [t.players[0].trim(), t.players[1].trim()],
})
