import { useState } from 'react'
import { ChevronDown, ChevronUp, Pencil, Undo2 } from 'lucide-react'
import { computeRows, type Game, type HandRow } from '../lib/game'
import { btn } from './Modal'

interface Props {
  game: Game
  onUndo: () => void
  onEdit: (row: HandRow) => void
}

export const HISTORY_PREVIEW = 3

export function HandHistory({ game, onUndo, onEdit }: Props) {
  const [showAll, setShowAll] = useState(false)
  const rows = computeRows(game.hands).reverse()
  const visible = showAll ? rows : rows.slice(0, HISTORY_PREVIEW)
  const names = game.teams.map((t, i) => t.name.trim() || `Pareja ${i + 1}`)

  return (
    <section aria-labelledby="historial-title" className="rounded-3xl border border-line bg-card p-4 shadow-soft sm:p-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 id="historial-title" className="text-base font-semibold">
          Historial de manos
        </h2>
        <button type="button" onClick={onUndo} disabled={rows.length === 0} className={`${btn.ghost} -mr-2`}>
          <Undo2 className="size-4" aria-hidden="true" />
          Deshacer
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">Aún no hay manos. Anota la primera arriba.</p>
      ) : (
        <>
          <table className="tabular w-full table-fixed text-sm">
            <caption className="sr-only">
              Manos jugadas, de la más reciente a la más antigua. Usa el lápiz para corregir una.
            </caption>
            <thead>
              <tr className="text-left text-xs text-muted">
                <th scope="col" className="w-12 py-2 font-medium">Mano</th>
                <th scope="col" className="py-2 font-medium">Ganador</th>
                <th scope="col" className="w-14 py-2 text-right font-medium">Puntos</th>
                <th scope="col" className="w-20 py-2 text-right font-medium">Marcador</th>
                <th scope="col" className="w-9">
                  <span className="sr-only">Corregir</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.hand.id} className="animate-fade-in border-t border-line/60">
                  <td className="py-1 text-muted">{row.number}</td>
                  <td className="truncate py-1 font-medium" title={names[row.hand.team]}>
                    {names[row.hand.team]}
                  </td>
                  <td className="py-1 text-right font-semibold text-gold-light">+{row.hand.points}</td>
                  <td className="py-1 text-right text-muted">
                    {row.totals[0]}–{row.totals[1]}
                  </td>
                  <td className="py-0.5 text-right">
                    <button
                      type="button"
                      onClick={() => onEdit(row)}
                      aria-label={`Corregir mano ${row.number}`}
                      className="-mr-2 inline-grid size-11 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > HISTORY_PREVIEW && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className={`${btn.ghost} mt-1 w-full`}
              aria-expanded={showAll}
            >
              {showAll ? (
                <>
                  <ChevronUp className="size-4" aria-hidden="true" /> Ver menos
                </>
              ) : (
                <>
                  <ChevronDown className="size-4" aria-hidden="true" /> Ver todas las manos ({rows.length})
                </>
              )}
            </button>
          )}
        </>
      )}
    </section>
  )
}
