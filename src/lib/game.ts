// Lógica de negocio de Dominó Score. Funciones puras: no tocan el DOM ni localStorage.

export type TeamIndex = 0 | 1

export interface Team {
  name: string
  players: [string, string]
}

export interface Hand {
  id: string
  team: TeamIndex
  points: number
  createdAt: string
}

export type GameStatus = 'playing' | 'finished'

export interface Game {
  id: string
  teams: [Team, Team]
  target: number
  hands: Hand[]
  startedAt: string
  finishedAt: string | null
  status: GameStatus
  winner: TeamIndex | null
}

export interface HandRow {
  number: number
  hand: Hand
  totals: [number, number]
}

export const DEFAULT_TARGET = 200
export const MAX_HAND_POINTS = 999
export const MIN_TARGET = 50
export const MAX_TARGET = 1000

export const DEFAULT_TEAMS: [Team, Team] = [
  { name: 'Pareja 1', players: ['Papá', 'Yo'] },
  { name: 'Pareja 2', players: ['Mamá', 'Tía'] },
]

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

const cloneTeams = (teams: [Team, Team]): [Team, Team] => [
  { name: teams[0].name, players: [...teams[0].players] as [string, string] },
  { name: teams[1].name, players: [...teams[1].players] as [string, string] },
]

export function createGame(
  teams: [Team, Team] = DEFAULT_TEAMS,
  target: number = DEFAULT_TARGET,
  now: Date = new Date(),
): Game {
  return {
    id: newId(),
    teams: cloneTeams(teams),
    target,
    hands: [],
    startedAt: now.toISOString(),
    finishedAt: null,
    status: 'playing',
    winner: null,
  }
}

/**
 * Convierte el texto del campo en puntos válidos.
 * Solo enteros positivos (sin signo, sin decimales, sin cero). Devuelve null si no es válido.
 */
export function parsePoints(input: string): number | null {
  const s = input.trim()
  if (!/^\d+$/.test(s)) return null
  const n = Number(s)
  if (!Number.isSafeInteger(n) || n <= 0 || n > MAX_HAND_POINTS) return null
  return n
}

export function isValidTarget(n: number): boolean {
  return Number.isInteger(n) && n >= MIN_TARGET && n <= MAX_TARGET
}

export function computeTotals(hands: Hand[]): [number, number] {
  const t: [number, number] = [0, 0]
  for (const h of hands) t[h.team] += h.points
  return t
}

/** Filas del historial con el marcador acumulado tras cada mano (orden cronológico). */
export function computeRows(hands: Hand[]): HandRow[] {
  const totals: [number, number] = [0, 0]
  return hands.map((hand, i) => {
    totals[hand.team] += hand.points
    return { number: i + 1, hand, totals: [totals[0], totals[1]] }
  })
}

/** Pareja líder, o null si hay empate. */
export function getLeader(totals: [number, number]): TeamIndex | null {
  if (totals[0] === totals[1]) return null
  return totals[0] > totals[1] ? 0 : 1
}

/** Ganador: la primera pareja cuyo acumulado alcanza o supera la meta. */
export function findWinner(hands: Hand[], target: number): TeamIndex | null {
  const totals: [number, number] = [0, 0]
  for (const h of hands) {
    totals[h.team] += h.points
    if (totals[h.team] >= target) return h.team
  }
  return null
}

/** Recalcula estado y ganador a partir de las manos (tras añadir, editar o borrar). */
export function settle(game: Game, now: Date = new Date()): Game {
  const winner = findWinner(game.hands, game.target)
  if (winner === null) return { ...game, status: 'playing', winner: null, finishedAt: null }
  return {
    ...game,
    status: 'finished',
    winner,
    finishedAt: game.status === 'finished' && game.finishedAt ? game.finishedAt : now.toISOString(),
  }
}

export function addHand(game: Game, team: TeamIndex, points: number, now: Date = new Date()): Game {
  if (game.status === 'finished') throw new Error('La partida ya terminó')
  if (!Number.isInteger(points) || points <= 0 || points > MAX_HAND_POINTS) {
    throw new Error('Puntos no válidos')
  }
  const hand: Hand = { id: newId(), team, points, createdAt: now.toISOString() }
  return settle({ ...game, hands: [...game.hands, hand] }, now)
}

export function undoLastHand(game: Game, now: Date = new Date()): Game {
  if (game.hands.length === 0) return game
  return settle({ ...game, hands: game.hands.slice(0, -1) }, now)
}

export function editHand(
  game: Game,
  handId: string,
  changes: { team: TeamIndex; points: number },
  now: Date = new Date(),
): Game {
  if (!Number.isInteger(changes.points) || changes.points <= 0 || changes.points > MAX_HAND_POINTS) {
    throw new Error('Puntos no válidos')
  }
  if (!game.hands.some((h) => h.id === handId)) throw new Error('Mano no encontrada')
  const hands = game.hands.map((h) => (h.id === handId ? { ...h, ...changes } : h))
  return settle({ ...game, hands }, now)
}

export function deleteHand(game: Game, handId: string, now: Date = new Date()): Game {
  return settle({ ...game, hands: game.hands.filter((h) => h.id !== handId) }, now)
}

export function setTarget(game: Game, target: number, now: Date = new Date()): Game {
  if (!isValidTarget(target)) throw new Error('Meta no válida')
  return settle({ ...game, target }, now)
}

export function renameTeam(game: Game, index: TeamIndex, team: Team): Game {
  const teams = cloneTeams(game.teams)
  teams[index] = { name: team.name, players: [...team.players] as [string, string] }
  return { ...game, teams }
}

/** Revancha: mismos equipos y meta, marcador a cero. */
export function rematch(game: Game, now: Date = new Date()): Game {
  return createGame(game.teams, game.target, now)
}

export function teamLabel(team: Team, fallback: string): string {
  return team.name.trim() || fallback
}
