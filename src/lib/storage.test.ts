import { describe, expect, it } from 'vitest'
import { addHand, createGame } from './game'
import { archiveAndStart, initialState, loadState, parseState, saveState, STORAGE_KEY } from './storage'

describe('10. almacenamiento local', () => {
  it('guarda y recupera la partida', () => {
    const s = initialState()
    s.current = addHand(addHand(s.current, 0, 25), 1, 10)
    expect(saveState(s, localStorage)).toBe(true)
    const { state, recovered, error } = loadState(localStorage)
    expect(recovered).toBe(true)
    expect(error).toBeUndefined()
    expect(state.current.id).toBe(s.current.id)
    expect(state.current.hands).toEqual(s.current.hands)
    expect(state.current.teams).toEqual(s.current.teams)
  })

  it('sin datos empieza una partida nueva', () => {
    const r = parseState(null)
    expect(r.recovered).toBe(false)
    expect(r.state.current.hands).toEqual([])
  })

  it('JSON dañado no rompe la app y avisa', () => {
    const r = parseState('{no es json')
    expect(r.error).toBeTruthy()
    expect(r.state.current.hands).toEqual([])
  })

  it('rechaza manos con puntos inválidos', () => {
    const s = initialState()
    const bad = JSON.parse(JSON.stringify(s))
    bad.current.hands = [{ id: 'x', team: 0, points: -10, createdAt: new Date().toISOString() }]
    expect(parseState(JSON.stringify(bad)).error).toBeTruthy()
  })

  it('elimina manos duplicadas y recalcula el estado guardado', () => {
    const s = initialState()
    const h = { id: 'h1', team: 0, points: 200, createdAt: new Date().toISOString() }
    const raw = JSON.parse(JSON.stringify(s))
    raw.current.hands = [h, h]
    raw.current.status = 'playing' // estado falso: se recalcula desde las manos
    const { state } = parseState(JSON.stringify(raw))
    expect(state.current.hands).toHaveLength(1)
    expect(state.current.status).toBe('finished')
    expect(state.current.winner).toBe(0)
  })

  it('informa si no se puede guardar', () => {
    const broken = {
      setItem() {
        throw new Error('QuotaExceededError')
      },
    } as unknown as Storage
    expect(saveState(initialState(), broken)).toBe(false)
  })

  it('archiva la partida anterior solo si tiene manos', () => {
    const s = initialState()
    const empty = archiveAndStart(s, createGame())
    expect(empty.archive).toHaveLength(0)
    s.current = addHand(s.current, 0, 5)
    const next = archiveAndStart(s, createGame())
    expect(next.archive).toHaveLength(1)
    expect(next.archive[0].id).toBe(s.current.id)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
