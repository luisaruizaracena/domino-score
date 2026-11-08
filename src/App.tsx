import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Crown, RotateCcw, X } from 'lucide-react'
import { computeTotals, computeRows, type HandRow, type TeamIndex } from './lib/game'
import { useGameStore } from './lib/useGameStore'
import { AppHeader } from './components/AppHeader'
import { Scoreboard } from './components/Scoreboard'
import { ScoreEntry } from './components/ScoreEntry'
import { HandHistory } from './components/HandHistory'
import { WinnerModal } from './components/WinnerModal'
import { NewGameDialog } from './components/NewGameDialog'
import { GameSettings } from './components/GameSettings'
import { TeamEditDialog } from './components/TeamEditDialog'
import { EditHandDialog } from './components/EditHandDialog'
import { ConfirmDialog } from './components/ConfirmDialog'
import { StatsDialog } from './components/StatsDialog'
import { btn } from './components/Modal'

export default function App() {
  const store = useGameStore()
  const { game, state } = store
  const totals = useMemo(() => computeTotals(game.hands), [game.hands])
  const finished = game.status === 'finished'

  const [winnerOpen, setWinnerOpen] = useState(false)
  const [newGameOpen, setNewGameOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [undoOpen, setUndoOpen] = useState(false)
  const [editTeam, setEditTeam] = useState<TeamIndex | null>(null)
  const [editRow, setEditRow] = useState<HandRow | null>(null)

  // Abre el modal de ganador cuando la partida pasa a terminada (no al recargar una ya terminada).
  const wasFinished = useRef(finished)
  useEffect(() => {
    if (finished && !wasFinished.current) setWinnerOpen(true)
    if (!finished) setWinnerOpen(false)
    wasFinished.current = finished
  }, [finished])

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', state.prefs.reduceMotion)
  }, [state.prefs.reduceMotion])

  const lastRow = game.hands.length > 0 ? computeRows(game.hands).at(-1)! : null
  const names = game.teams.map((t, i) => t.name.trim() || `Pareja ${i + 1}`)

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-4 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
      {store.saveFailed && (
        <div role="alert" className="flex items-start gap-2 rounded-2xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            No se pudieron guardar los cambios en este dispositivo. El marcador sigue funcionando, pero se perderá si
            cierras la app. Revisa si estás en modo privado o sin espacio.
          </span>
        </div>
      )}
      {store.loadWarning && (
        <div role="alert" className="flex items-start gap-2 rounded-2xl border border-gold/40 bg-gold/10 p-3 text-sm text-gold-light">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span className="flex-1">
            No se pudo recuperar la partida guardada ({store.loadWarning}). Se empezó una nueva.
          </span>
          <button type="button" aria-label="Cerrar aviso" onClick={store.dismissLoadWarning} className="-m-2 grid size-11 shrink-0 place-items-center">
            <X className="size-4" />
          </button>
        </div>
      )}

      <AppHeader target={game.target} onStats={() => setStatsOpen(true)} onSettings={() => setSettingsOpen(true)} />

      <Scoreboard game={game} totals={totals} onEditTeam={setEditTeam} />

      {finished && game.winner !== null && (
        <button
          type="button"
          onClick={() => setWinnerOpen(true)}
          className="animate-fade-up flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-gold/40 bg-gold/10 px-4 text-sm font-semibold text-gold-light"
        >
          <Crown className="size-4" aria-hidden="true" />
          Ganó {names[game.winner]} · Ver resultado
        </button>
      )}

      <ScoreEntry
        teams={game.teams}
        selected={state.prefs.selectedTeam}
        onSelect={(i) => store.setPrefs({ selectedTeam: i })}
        onSubmit={store.addHand}
        finished={finished}
      />

      <HandHistory game={game} onUndo={() => setUndoOpen(true)} onEdit={setEditRow} />

      <button type="button" onClick={() => setNewGameOpen(true)} className={`${btn.secondary} mt-auto w-full`}>
        <RotateCcw className="size-4" aria-hidden="true" />
        Nueva partida
      </button>

      <WinnerModal
        open={winnerOpen}
        game={game}
        totals={totals}
        onClose={() => setWinnerOpen(false)}
        onRematch={() => {
          setWinnerOpen(false)
          store.rematch()
        }}
        onNewGame={() => {
          setWinnerOpen(false)
          setNewGameOpen(true)
        }}
      />
      <NewGameDialog
        open={newGameOpen}
        teams={game.teams}
        target={game.target}
        hasHands={game.hands.length > 0}
        finished={finished}
        onClose={() => setNewGameOpen(false)}
        onStart={store.newGame}
      />
      <GameSettings
        open={settingsOpen}
        game={game}
        prefs={state.prefs}
        onClose={() => setSettingsOpen(false)}
        onTarget={store.setTarget}
        onPrefs={store.setPrefs}
      />
      <StatsDialog open={statsOpen} archive={state.archive} onClose={() => setStatsOpen(false)} onClear={store.clearArchive} />
      <TeamEditDialog index={editTeam} teams={game.teams} onClose={() => setEditTeam(null)} onSave={store.renameTeam} />
      <EditHandDialog
        row={editRow}
        teams={game.teams}
        onClose={() => setEditRow(null)}
        onSave={store.editHand}
        onDelete={store.deleteHand}
      />
      <ConfirmDialog
        open={undoOpen}
        title="¿Deshacer la última mano?"
        message={
          lastRow
            ? `Se quitará la mano ${lastRow.number}: ${names[lastRow.hand.team]} +${lastRow.hand.points}.`
            : ''
        }
        confirmLabel="Deshacer"
        danger
        onConfirm={store.undo}
        onClose={() => setUndoOpen(false)}
      />
    </div>
  )
}
