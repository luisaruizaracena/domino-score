import { useEffect, useState } from 'react'
import { isValidTarget, MAX_TARGET, MIN_TARGET, type Game } from '../lib/game'
import type { Preferences } from '../lib/storage'
import { Modal, btn, inputClass } from './Modal'

const PRESETS = [100, 150, 200, 250] as const

/** Selector de meta: valores frecuentes o uno personalizado. Devuelve null si no es válido. */
export function TargetPicker({ value, onChange }: { value: number | null; onChange: (n: number | null) => void }) {
  const [text, setText] = useState(value ? String(value) : '')
  useEffect(() => {
    if (value !== null && String(value) !== text) setText(String(value))
  }, [value])
  const invalid = text !== '' && !isValidTarget(Number(text))

  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-muted">Meta de puntos</legend>
      <div className="mb-2 grid grid-cols-4 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={value === p}
            onClick={() => {
              setText(String(p))
              onChange(p)
            }}
            className={`tabular min-h-11 rounded-xl border text-sm font-semibold transition-colors duration-150 ${
              value === p ? 'border-gold bg-gold/15 text-gold-light' : 'border-line bg-card text-ink'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <label htmlFor="meta-personalizada" className="sr-only">
        Meta personalizada
      </label>
      <input
        id="meta-personalizada"
        className={`${inputClass} tabular ${invalid ? 'border-danger' : ''}`}
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        placeholder="Otra meta"
        value={text}
        aria-invalid={invalid}
        onChange={(e) => {
          const t = e.target.value.replace(/\D/g, '').slice(0, 4)
          setText(t)
          const n = Number(t)
          onChange(t !== '' && isValidTarget(n) ? n : null)
        }}
      />
      {invalid && (
        <p className="mt-1.5 text-xs text-danger">
          Entre {MIN_TARGET} y {MAX_TARGET} puntos
        </p>
      )}
    </fieldset>
  )
}

interface Props {
  open: boolean
  game: Game
  prefs: Preferences
  onClose: () => void
  onTarget: (n: number) => void
  onPrefs: (p: Partial<Preferences>) => void
}

export function GameSettings({ open, game, prefs, onClose, onTarget, onPrefs }: Props) {
  const [goal, setGoal] = useState<number | null>(game.target)
  useEffect(() => {
    if (open) setGoal(game.target)
  }, [open, game.target])

  return (
    <Modal open={open} onClose={onClose} title="Configuración">
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          if (goal === null) return
          if (goal !== game.target) onTarget(goal)
          onClose()
        }}
      >
        <TargetPicker value={goal} onChange={setGoal} />
        {game.hands.length > 0 && (
          <p className="-mt-3 text-xs text-muted">
            Cambiar la meta en mitad de la partida vuelve a evaluar si ya hay ganador.
          </p>
        )}

        <label className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-line bg-card px-4">
          <span className="text-sm">Reducir animaciones</span>
          <input
            type="checkbox"
            className="size-5 accent-[var(--color-gold)]"
            checked={prefs.reduceMotion}
            onChange={(e) => onPrefs({ reduceMotion: e.target.checked })}
          />
        </label>

        <button type="submit" disabled={goal === null} className={btn.primary}>
          Guardar
        </button>
      </form>
    </Modal>
  )
}
