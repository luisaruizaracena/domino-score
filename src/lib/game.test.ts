import { describe, expect, it } from 'vitest'
import {
  addHand,
  computeRows,
  computeTotals,
  createGame,
  deleteHand,
  editHand,
  getLeader,
  parsePoints,
  rematch,
  renameTeam,
  setTarget,
  undoLastHand,
  type Game,
  type TeamIndex,
} from './game'

const play = (g: Game, ...hands: [TeamIndex, number][]) => hands.reduce((acc, [t, p]) => addHand(acc, t, p), g)

describe('parsePoints (validación de entrada)', () => {
  it('acepta enteros positivos', () => {
    expect(parsePoints('25')).toBe(25)
    expect(parsePoints(' 7 ')).toBe(7)
  })
  it.each(['', '0', '00', '-5', '2.5', '1e2', 'abc', '+5', '1000'])('rechaza %j', (v) => {
    expect(parsePoints(v)).toBeNull()
  })
})

describe('anotar puntos', () => {
  it('1. registra la mano correctamente', () => {
    const g = addHand(createGame(), 0, 25)
    expect(g.hands).toHaveLength(1)
    expect(g.hands[0]).toMatchObject({ team: 0, points: 25 })
    expect(g.hands[0].id).toBeTruthy()
  })

  it('2. suma solo a la pareja seleccionada', () => {
    const g = play(createGame(), [1, 30], [1, 10], [0, 5])
    expect(computeTotals(g.hands)).toEqual([5, 40])
  })

  it('rechaza puntos inválidos', () => {
    expect(() => addHand(createGame(), 0, 0)).toThrow()
    expect(() => addHand(createGame(), 0, -5)).toThrow()
    expect(() => addHand(createGame(), 0, 2.5)).toThrow()
  })
})

describe('líder y empate', () => {
  it('3. detecta empates', () => {
    expect(getLeader([0, 0])).toBeNull()
    const g = play(createGame(), [0, 40], [1, 40])
    expect(getLeader(computeTotals(g.hands))).toBeNull()
  })
  it('4. identifica a la pareja líder', () => {
    expect(getLeader([65, 40])).toBe(0)
    expect(getLeader([10, 11])).toBe(1)
  })
})

describe('fin de partida', () => {
  it('5. detecta ganador al llegar a 200', () => {
    const g = play(createGame(), [0, 100], [1, 50], [0, 100])
    expect(g.status).toBe('finished')
    expect(g.winner).toBe(0)
    expect(g.finishedAt).not.toBeNull()
  })
  it('no termina con 199', () => {
    const g = play(createGame(), [0, 199])
    expect(g.status).toBe('playing')
  })
  it('6. permite superar 200 en la última mano', () => {
    const g = play(createGame(), [1, 180], [1, 75])
    expect(g.winner).toBe(1)
    expect(computeTotals(g.hands)).toEqual([0, 255])
  })
  it('bloquea anotaciones tras terminar', () => {
    const g = play(createGame(), [0, 200])
    expect(() => addHand(g, 1, 5)).toThrow('La partida ya terminó')
  })
  it('respeta una meta personalizada', () => {
    const g = play(setTarget(createGame(), 100), [0, 100])
    expect(g.winner).toBe(0)
  })
})

describe('correcciones', () => {
  it('7. deshace la última anotación', () => {
    let g = play(createGame(), [0, 20], [1, 25])
    g = undoLastHand(g)
    expect(g.hands).toHaveLength(1)
    expect(computeTotals(g.hands)).toEqual([20, 0])
    expect(undoLastHand(createGame()).hands).toHaveLength(0)
  })
  it('deshacer la mano ganadora reabre la partida', () => {
    const g = undoLastHand(play(createGame(), [0, 150], [0, 60]))
    expect(g.status).toBe('playing')
    expect(g.winner).toBeNull()
    expect(g.finishedAt).toBeNull()
  })

  it('8 y 9. edita una mano anterior y recalcula los marcadores posteriores', () => {
    let g = play(createGame(), [0, 40], [1, 40], [0, 25])
    expect(computeRows(g.hands).map((r) => r.totals)).toEqual([[40, 0], [40, 40], [65, 40]])
    g = editHand(g, g.hands[0].id, { team: 1, points: 10 })
    expect(computeRows(g.hands).map((r) => r.totals)).toEqual([[0, 10], [0, 50], [25, 50]])
    expect(getLeader(computeTotals(g.hands))).toBe(1)
  })
  it('una corrección puede declarar o retirar al ganador', () => {
    let g = play(createGame(), [0, 150], [1, 20])
    g = editHand(g, g.hands[0].id, { team: 0, points: 200 })
    expect(g.winner).toBe(0)
    g = editHand(g, g.hands[0].id, { team: 0, points: 150 })
    expect(g.status).toBe('playing')
  })
  it('elimina una mano concreta y recalcula', () => {
    let g = play(createGame(), [0, 40], [1, 40], [0, 25])
    g = deleteHand(g, g.hands[1].id)
    expect(computeRows(g.hands).map((r) => r.totals)).toEqual([[40, 0], [65, 0]])
  })
})

describe('nueva partida y revancha', () => {
  it('11. crea una partida nueva a cero', () => {
    const g = createGame([
      { name: 'Los Primos', players: ['Ana', 'Luis'] },
      { name: 'Vecinos', players: ['Pepe', 'Rosa'] },
    ], 150)
    expect(g.hands).toEqual([])
    expect(g.target).toBe(150)
    expect(g.status).toBe('playing')
    expect(g.teams[0].name).toBe('Los Primos')
  })
  it('12. la revancha conserva nombres y meta y reinicia a cero', () => {
    let g = renameTeam(createGame(), 0, { name: 'Campeones', players: ['A', 'B'] })
    g = setTarget(g, 150)
    g = play(g, [0, 150])
    const r = rematch(g)
    expect(r.id).not.toBe(g.id)
    expect(r.teams).toEqual(g.teams)
    expect(r.target).toBe(150)
    expect(r.hands).toEqual([])
    expect(computeTotals(r.hands)).toEqual([0, 0])
    expect(r.status).toBe('playing')
  })
})
