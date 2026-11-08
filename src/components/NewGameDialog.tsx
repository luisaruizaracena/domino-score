import { useEffect, useState } from 'react'
import { DEFAULT_TARGET, type Team } from '../lib/game'
import { Modal, btn } from './Modal'
import { TeamFields, cleanTeam } from './TeamFields'
import { TargetPicker } from './GameSettings'

interface Props {
  open: boolean
  teams: [Team, Team]
  target: number
  hasHands: boolean
  finished: boolean
  onClose: () => void
  onStart: (teams: [Team, Team], target: number) => void
}

/** Configura equipos y meta, y confirma antes de reiniciar una partida en curso. */
export function NewGameDialog({ open, teams, target, hasHands, finished, onClose, onStart }: Props) {
  const [draft, setDraft] = useState<[Team, Team]>(teams)
  const [goal, setGoal] = useState<number | null>(target || DEFAULT_TARGET)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (open) {
      setDraft(teams)
      setGoal(target)
      setConfirming(false)
    }
  }, [open, teams, target])

  const needsConfirm = hasHands && !finished

  const start = () => {
    if (goal === null) return
    onStart([cleanTeam(draft[0], 0), cleanTeam(draft[1], 1)], goal)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={confirming ? '¿Reiniciar la partida?' : 'Nueva partida'}>
      {!confirming ? (
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            if (goal === null) return
            if (needsConfirm) setConfirming(true)
            else start()
          }}
        >
          <TeamFields index={0} team={draft[0]} onChange={(t) => setDraft([t, draft[1]])} />
          <TeamFields index={1} team={draft[1]} onChange={(t) => setDraft([draft[0], t])} />
          <TargetPicker value={goal} onChange={setGoal} />
          {hasHands && (
            <p className="text-xs text-muted">La partida actual se guardará en Estadísticas.</p>
          )}
          <button type="submit" disabled={goal === null} className={btn.primary}>
            Empezar partida
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            La partida actual aún no ha terminado. Se guardará en Estadísticas y el marcador volverá a cero.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setConfirming(false)} className={btn.secondary} data-autofocus>
              Volver
            </button>
            <button type="button" onClick={start} className={btn.primary}>
              Sí, reiniciar
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
