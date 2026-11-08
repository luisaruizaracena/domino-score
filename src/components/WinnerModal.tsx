import { Crown, RotateCcw, Users } from 'lucide-react'
import type { Game } from '../lib/game'
import { Modal, btn } from './Modal'

interface Props {
  open: boolean
  game: Game
  totals: [number, number]
  onRematch: () => void
  onNewGame: () => void
  onClose: () => void
}

export function WinnerModal({ open, game, totals, onRematch, onNewGame, onClose }: Props) {
  if (game.winner === null) return null
  const w = game.winner
  const l = w === 0 ? 1 : 0
  const name = game.teams[w].name.trim() || `Pareja ${w + 1}`
  const loser = game.teams[l].name.trim() || `Pareja ${l + 1}`
  const players = game.teams[w].players.map((p) => p.trim()).filter(Boolean).join(' y ')

  return (
    <Modal open={open} onClose={onClose} title="¡Tenemos ganadores!" hideTitle>
      <div className="flex flex-col items-center text-center">
        <div className="animate-pop mb-3 grid size-20 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold shadow-gold">
          <Crown className="size-10" aria-hidden="true" />
        </div>
        <p className="text-2xl font-bold" aria-hidden="true">
          ¡Tenemos ganadores!
        </p>
        <p className="mt-1 max-w-full truncate text-lg font-semibold text-gold-light">{name}</p>
        {players && <p className="max-w-full truncate text-sm text-muted">{players}</p>}

        <div className="tabular my-5 grid w-full grid-cols-2 gap-2">
          <div className="rounded-2xl border border-gold/50 bg-card p-3">
            <p className="truncate text-xs text-muted">{name}</p>
            <p className="text-3xl font-bold text-gold">{totals[w]}</p>
          </div>
          <div className="rounded-2xl border border-line bg-card p-3">
            <p className="truncate text-xs text-muted">{loser}</p>
            <p className="text-3xl font-bold">{totals[l]}</p>
          </div>
        </div>
        <p className="mb-5 text-sm text-muted">
          <span className="tabular font-semibold text-ink">{game.hands.length}</span>{' '}
          {game.hands.length === 1 ? 'mano disputada' : 'manos disputadas'} · Meta {game.target}
        </p>

        <div className="grid w-full grid-cols-2 gap-2">
          <button type="button" onClick={onNewGame} className={btn.secondary}>
            <Users className="size-4" aria-hidden="true" /> Nueva partida
          </button>
          <button type="button" onClick={onRematch} className={btn.primary} data-autofocus>
            <RotateCcw className="size-4" aria-hidden="true" /> Revancha
          </button>
        </div>
        <button type="button" onClick={onClose} className={`${btn.ghost} mt-2`}>
          Ver marcador
        </button>
      </div>
    </Modal>
  )
}
