import { BarChart3, Settings, Target } from 'lucide-react'
import { DominoIcon } from './DominoIcon'

interface Props {
  target: number
  onStats: () => void
  onSettings: () => void
}

export function AppHeader({ target, onStats, onSettings }: Props) {
  return (
    <header className="flex flex-col items-center gap-3">
      <div className="flex w-full items-center gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-line bg-surface text-gold shadow-soft">
          <DominoIcon className="h-7" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
            Dominó <span className="text-gold">Score</span>
          </h1>
          <p className="truncate text-xs text-muted sm:text-sm">Apunte de dominó · Por parejas</p>
        </div>
        <nav className="flex shrink-0 items-center gap-1" aria-label="Opciones">
          <button
            type="button"
            onClick={onStats}
            aria-label="Estadísticas"
            className="grid size-11 place-items-center rounded-full text-muted transition-colors duration-150 hover:bg-surface hover:text-ink"
          >
            <BarChart3 className="size-5" />
          </button>
          <button
            type="button"
            onClick={onSettings}
            aria-label="Configuración"
            className="grid size-11 place-items-center rounded-full text-muted transition-colors duration-150 hover:bg-surface hover:text-ink"
          >
            <Settings className="size-5" />
          </button>
        </nav>
      </div>
      <button
        type="button"
        onClick={onSettings}
        className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-sm font-medium text-gold-light transition-colors hover:bg-gold/15"
        aria-label={`Meta: ${target} puntos. Cambiar meta`}
      >
        <Target className="size-4" aria-hidden="true" />
        Meta: <span className="tabular font-semibold">{target}</span> puntos
      </button>
    </header>
  )
}
