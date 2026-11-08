import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { parsePoints, MAX_HAND_POINTS, type HandRow, type Team, type TeamIndex } from '../lib/game'
import { Modal, btn } from './Modal'

interface Props {
  row: HandRow | null
  teams: [Team, Team]
  onClose: () => void
  onSave: (id: string, team: TeamIndex, points: number) => void
  onDelete: (id: string) => void
}

export function EditHandDialog({ row, teams, onClose, onSave, onDelete }: Props) {
  const [team, setTeam] = useState<TeamIndex>(0)
  const [value, setValue] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (row) {
      setTeam(row.hand.team)
      setValue(String(row.hand.points))
      setConfirmDelete(false)
    }
  }, [row])

  const points = parsePoints(value)
  const names = teams.map((t, i) => t.name.trim() || `Pareja ${i + 1}`)

  return (
    <Modal open={row !== null} onClose={onClose} title={row ? `Corregir mano ${row.number}` : ''}>
      {row && !confirmDelete && (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (points === null) return
            onSave(row.hand.id, team, points)
            onClose()
          }}
        >
          <div role="radiogroup" aria-label="Pareja ganadora" className="grid grid-cols-2 gap-1 rounded-2xl bg-card p-1">
            {([0, 1] as const).map((i) => (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={team === i}
                onClick={() => setTeam(i)}
                className={`min-h-11 truncate rounded-xl px-3 text-sm font-semibold transition-colors duration-150 ${
                  team === i ? 'bg-gold text-bg' : 'text-muted hover:text-ink'
                }`}
              >
                {names[i]}
              </button>
            ))}
          </div>
          <div>
            <label htmlFor="editar-puntos" className="mb-1.5 block text-sm text-muted">
              Puntos
            </label>
            <input
              id="editar-puntos"
              data-autofocus
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={3}
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, 3))}
              aria-invalid={points === null}
              className={`tabular w-full min-h-14 rounded-2xl border bg-card px-4 text-center text-2xl font-bold focus:outline-none ${
                points === null ? 'border-danger' : 'border-line focus:border-gold'
              }`}
            />
            {points === null && (
              <p className="mt-1.5 text-center text-xs text-danger">
                Escribe un número entero entre 1 y {MAX_HAND_POINTS}
              </p>
            )}
          </div>
          <p className="text-xs text-muted">Los marcadores de las manos posteriores se recalculan automáticamente.</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setConfirmDelete(true)} className={btn.danger}>
              <Trash2 className="size-4" aria-hidden="true" /> Eliminar
            </button>
            <button type="submit" disabled={points === null} className={btn.primary}>
              Guardar
            </button>
          </div>
        </form>
      )}
      {row && confirmDelete && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            ¿Eliminar la mano {row.number} ({names[row.hand.team]}, +{row.hand.points})? El marcador se recalculará.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setConfirmDelete(false)} className={btn.secondary} data-autofocus>
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                onDelete(row.hand.id)
                onClose()
              }}
              className={btn.danger}
            >
              Sí, eliminar
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
