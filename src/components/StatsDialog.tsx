import { useState } from 'react'
import { Crown } from 'lucide-react'
import { computeTotals, type Game } from '../lib/game'
import { Modal, btn } from './Modal'

interface Props {
  open: boolean
  archive: Game[]
  onClose: () => void
  onClear: () => void
}

const fmt = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' })

export function StatsDialog({ open, archive, onClose, onClear }: Props) {
  const [confirm, setConfirm] = useState(false)
  const finished = archive.filter((g) => g.winner !== null)
  const hands = archive.reduce((n, g) => n + g.hands.length, 0)

  return (
    <Modal
      open={open}
      onClose={() => {
        setConfirm(false)
        onClose()
      }}
      title="Estadísticas"
    >
      <div className="tabular mb-4 grid grid-cols-3 gap-2 text-center">
        {[
          ['Partidas', archive.length],
          ['Terminadas', finished.length],
          ['Manos', hands],
        ].map(([label, n]) => (
          <div key={label} className="rounded-2xl border border-line bg-card p-3">
            <p className="text-2xl font-bold">{n}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>

      {archive.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          Las partidas anteriores aparecerán aquí al empezar una nueva.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {archive.map((g) => {
            const t = computeTotals(g.hands)
            return (
              <li key={g.id} className="rounded-2xl border border-line bg-card p-3">
                <p className="mb-1.5 text-xs text-muted">
                  {fmt.format(new Date(g.startedAt))} · {g.hands.length} manos · Meta {g.target}
                  {g.winner === null && ' · Sin terminar'}
                </p>
                {([0, 1] as const).map((i) => (
                  <div key={i} className="flex items-center justify-between gap-2 text-sm">
                    <span className={`flex min-w-0 items-center gap-1.5 ${g.winner === i ? 'font-semibold text-gold-light' : ''}`}>
                      {g.winner === i && <Crown className="size-3.5 shrink-0 text-gold" aria-label="Ganador" />}
                      <span className="truncate">{g.teams[i].name || `Pareja ${i + 1}`}</span>
                    </span>
                    <span className="tabular font-semibold">{t[i]}</span>
                  </div>
                ))}
              </li>
            )
          })}
        </ul>
      )}

      {archive.length > 0 &&
        (confirm ? (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" className={btn.secondary} onClick={() => setConfirm(false)}>
              Cancelar
            </button>
            <button
              type="button"
              className={btn.danger}
              onClick={() => {
                onClear()
                setConfirm(false)
              }}
            >
              Sí, borrar todo
            </button>
          </div>
        ) : (
          <button type="button" className={`${btn.ghost} mt-3 w-full`} onClick={() => setConfirm(true)}>
            Borrar historial de partidas
          </button>
        ))}
    </Modal>
  )
}
