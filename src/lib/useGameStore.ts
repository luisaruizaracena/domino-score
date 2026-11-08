import { useCallback, useEffect, useRef, useState } from 'react'
import * as G from './game'
import { archiveAndStart, loadState, saveState, type AppState, type Preferences } from './storage'

export function useGameStore() {
  const [boot] = useState(() => loadState())
  const [state, setState] = useState<AppState>(boot.state)
  const [saveFailed, setSaveFailed] = useState(false)
  const [loadWarning, setLoadWarning] = useState<string | undefined>(boot.error)
  const first = useRef(true)

  useEffect(() => {
    // No sobrescribir en el primer render si los datos guardados estaban dañados:
    // se conservan por si se pueden recuperar a mano.
    if (first.current) {
      first.current = false
      if (boot.error) return
    }
    setSaveFailed(!saveState(state))
  }, [state, boot.error])

  const update = useCallback((fn: (g: G.Game) => G.Game) => {
    setState((s) => ({ ...s, current: fn(s.current) }))
  }, [])

  return {
    state,
    game: state.current,
    saveFailed,
    loadWarning,
    dismissLoadWarning: () => setLoadWarning(undefined),
    addHand: (team: G.TeamIndex, points: number) => update((g) => G.addHand(g, team, points)),
    undo: () => update((g) => G.undoLastHand(g)),
    editHand: (id: string, team: G.TeamIndex, points: number) => update((g) => G.editHand(g, id, { team, points })),
    deleteHand: (id: string) => update((g) => G.deleteHand(g, id)),
    renameTeam: (i: G.TeamIndex, team: G.Team) => update((g) => G.renameTeam(g, i, team)),
    setTarget: (t: number) => update((g) => G.setTarget(g, t)),
    setPrefs: (p: Partial<Preferences>) => setState((s) => ({ ...s, prefs: { ...s.prefs, ...p } })),
    newGame: (teams: [G.Team, G.Team], target: number) =>
      setState((s) => archiveAndStart(s, G.createGame(teams, target))),
    rematch: () => setState((s) => archiveAndStart(s, G.rematch(s.current))),
    clearArchive: () => setState((s) => ({ ...s, archive: [] })),
  }
}

export type GameStore = ReturnType<typeof useGameStore>
