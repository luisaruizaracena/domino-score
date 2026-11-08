import { useRef, useState, type FormEvent } from 'react'
import { Check, Plus } from 'lucide-react'
import { parsePoints, MAX_HAND_POINTS, type Team, type TeamIndex } from '../lib/game'
import { QuickScoreButtons } from './QuickScoreButtons'
import { btn } from './Modal'

interface Props {
  teams: [Team, Team]
  selected: TeamIndex
  onSelect: (i: TeamIndex) => void
  onSubmit: (team: TeamIndex, points: number) => void
  finished: boolean
}

export function ScoreEntry({ teams, selected, onSelect, onSubmit, finished }: Props) {
  const [value, setValue] = useState('')
  const [touched, setTouched] = useState(false)
  const [confirmed, setConfirmed] = useState<string | null>(null)
  const busy = useRef(false)
  const points = parsePoints(value)
  const showError = touched && value !== '' && points === null
  const names = teams.map((t, i) => t.name.trim() || `Pareja ${i + 1}`)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    // Evita doble registro por doble toque o Enter repetido.
    if (busy.current || points === null || finished) return
    busy.current = true
    onSubmit(selected, points)
    setValue('')
    setTouched(false)
    setConfirmed(`+${points} a ${names[selected]}`)
    setTimeout(() => {
      busy.current = false
    }, 0)
    setTimeout(() => setConfirmed(null), 1600)
  }

  return (
    <section aria-labelledby="anotar-title" className="rounded-3xl border border-line bg-card p-4 shadow-soft sm:p-5">
      <h2 id="anotar-title" className="mb-3 text-base font-semibold">
        Anotar puntos
      </h2>

      <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
        <div role="radiogroup" aria-label="Pareja que gana la mano" className="grid grid-cols-2 gap-1 rounded-2xl bg-surface p-1">
          {([0, 1] as const).map((i) => {
            const active = selected === i
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={finished}
                onClick={() => onSelect(i)}
                className={`min-h-11 truncate rounded-xl px-3 text-sm font-semibold transition-[background-color,color] duration-150 disabled:opacity-50 ${
                  active ? 'bg-gold text-bg shadow-soft' : 'text-muted hover:text-ink'
                }`}
              >
                {names[i]}
              </button>
            )
          })}
        </div>

        <QuickScoreButtons
          value={value}
          disabled={finished}
          onPick={(n) => {
            setValue(String(n))
            setTouched(true)
          }}
        />

        <div>
          <label htmlFor="puntos" className="sr-only">
            Puntos de la mano
          </label>
          <input
            id="puntos"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            enterKeyHint="done"
            autoComplete="off"
            placeholder="Puntos"
            maxLength={3}
            disabled={finished}
            value={value}
            onChange={(e) => {
              // Solo dígitos: descarta signos, decimales y letras al escribir o pegar.
              setValue(e.target.value.replace(/\D/g, '').slice(0, 3))
              setTouched(true)
            }}
            aria-invalid={showError}
            aria-describedby="puntos-ayuda"
            className={`tabular w-full min-h-16 rounded-2xl border bg-surface px-4 text-center text-3xl font-bold text-ink placeholder:text-xl placeholder:font-medium placeholder:text-muted/50 transition-colors focus:outline-none disabled:opacity-50 ${
              showError ? 'border-danger' : 'border-line focus:border-gold'
            }`}
          />
          <p id="puntos-ayuda" className={`mt-1.5 min-h-4 text-center text-xs ${showError ? 'text-danger' : 'text-muted'}`}>
            {showError ? `Escribe un número entero entre 1 y ${MAX_HAND_POINTS}` : finished ? 'La partida terminó' : ' '}
          </p>
        </div>

        <button type="submit" disabled={points === null || finished} className={`${btn.primary} min-h-14 text-base`}>
          <Plus className="size-5" aria-hidden="true" />
          Anotar puntos
        </button>

        <p role="status" aria-live="polite" className="h-5 text-center text-sm font-medium text-success">
          {confirmed && (
            <span className="animate-fade-up inline-flex items-center gap-1">
              <Check className="size-4" aria-hidden="true" />
              {confirmed}
            </span>
          )}
        </p>
      </form>
    </section>
  )
}
