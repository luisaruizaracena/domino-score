// Persistencia en localStorage con validación de los datos recuperados.
import {
  createGame,
  DEFAULT_TARGET,
  isValidTarget,
  MAX_HAND_POINTS,
  settle,
  type Game,
  type Hand,
  type Team,
} from './game'

export const STORAGE_KEY = 'domino-score:v1'
export const MAX_ARCHIVE = 50

export interface Preferences {
  selectedTeam: 0 | 1
  reduceMotion: boolean
}

export interface AppState {
  version: 1
  current: Game
  archive: Game[]
  prefs: Preferences
}

export const DEFAULT_PREFS: Preferences = { selectedTeam: 0, reduceMotion: false }

export function initialState(): AppState {
  return { version: 1, current: createGame(), archive: [], prefs: { ...DEFAULT_PREFS } }
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
const str = (v: unknown, max = 40): string | null => (typeof v === 'string' ? v.slice(0, max) : null)
const isoDate = (v: unknown): string | null =>
  typeof v === 'string' && !Number.isNaN(Date.parse(v)) ? v : null

function parseTeam(v: unknown): Team | null {
  if (!isObj(v) || !Array.isArray(v.players) || v.players.length !== 2) return null
  const name = str(v.name)
  const p0 = str(v.players[0])
  const p1 = str(v.players[1])
  if (name === null || p0 === null || p1 === null) return null
  return { name, players: [p0, p1] }
}

function parseHand(v: unknown): Hand | null {
  if (!isObj(v)) return null
  const id = str(v.id, 80)
  const createdAt = isoDate(v.createdAt)
  const { team, points } = v
  if (!id || !createdAt) return null
  if (team !== 0 && team !== 1) return null
  if (typeof points !== 'number' || !Number.isInteger(points) || points <= 0 || points > MAX_HAND_POINTS) {
    return null
  }
  return { id, team, points, createdAt }
}

export function parseGame(v: unknown): Game | null {
  if (!isObj(v) || !Array.isArray(v.teams) || v.teams.length !== 2 || !Array.isArray(v.hands)) return null
  const id = str(v.id, 80)
  const startedAt = isoDate(v.startedAt)
  const t0 = parseTeam(v.teams[0])
  const t1 = parseTeam(v.teams[1])
  if (!id || !startedAt || !t0 || !t1) return null
  const hands: Hand[] = []
  const seen = new Set<string>()
  for (const raw of v.hands) {
    const h = parseHand(raw)
    if (!h) return null
    if (seen.has(h.id)) continue // evita manos duplicadas
    seen.add(h.id)
    hands.push(h)
  }
  const target = typeof v.target === 'number' && isValidTarget(v.target) ? v.target : DEFAULT_TARGET
  const finishedAt = isoDate(v.finishedAt)
  const base: Game = {
    id,
    teams: [t0, t1],
    target,
    hands,
    startedAt,
    finishedAt,
    status: v.status === 'finished' ? 'finished' : 'playing',
    winner: null,
  }
  // El estado y el ganador se recalculan siempre desde las manos: nunca se confía en lo guardado.
  return settle(base, finishedAt ? new Date(finishedAt) : new Date())
}

export function parseState(raw: string | null): { state: AppState; recovered: boolean; error?: string } {
  if (raw === null) return { state: initialState(), recovered: false }
  try {
    const data: unknown = JSON.parse(raw)
    if (!isObj(data) || data.version !== 1) throw new Error('Versión desconocida')
    const current = parseGame(data.current)
    if (!current) throw new Error('Partida actual dañada')
    const archive = Array.isArray(data.archive)
      ? data.archive.map(parseGame).filter((g): g is Game => g !== null).slice(0, MAX_ARCHIVE)
      : []
    const p = isObj(data.prefs) ? data.prefs : {}
    const prefs: Preferences = {
      selectedTeam: p.selectedTeam === 1 ? 1 : 0,
      reduceMotion: p.reduceMotion === true,
    }
    return { state: { version: 1, current, archive, prefs }, recovered: true }
  } catch (e) {
    return {
      state: initialState(),
      recovered: false,
      error: e instanceof Error ? e.message : 'Datos guardados no válidos',
    }
  }
}

export function loadState(storage: Storage | undefined = safeStorage()): ReturnType<typeof parseState> {
  if (!storage) return { state: initialState(), recovered: false, error: 'Almacenamiento no disponible' }
  try {
    return parseState(storage.getItem(STORAGE_KEY))
  } catch {
    return { state: initialState(), recovered: false, error: 'No se pudo leer el almacenamiento' }
  }
}

/** Guarda el estado. Devuelve false si no se pudo (cuota llena, modo privado, etc.). */
export function saveState(state: AppState, storage: Storage | undefined = safeStorage()): boolean {
  if (!storage) return false
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

/** Archiva la partida actual (si tiene manos) y empieza una nueva. */
export function archiveAndStart(state: AppState, next: Game): AppState {
  const archive =
    state.current.hands.length > 0 && !state.archive.some((g) => g.id === state.current.id)
      ? [state.current, ...state.archive].slice(0, MAX_ARCHIVE)
      : state.archive
  return { ...state, current: next, archive }
}

function safeStorage(): Storage | undefined {
  try {
    return typeof window !== 'undefined' ? window.localStorage : undefined
  } catch {
    return undefined
  }
}
