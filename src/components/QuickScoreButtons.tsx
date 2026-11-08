export const QUICK_VALUES = [5, 10, 20, 25] as const

interface Props {
  value: string
  onPick: (n: number) => void
  disabled?: boolean
}

export function QuickScoreButtons({ value, onPick, disabled }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2" role="group" aria-label="Puntos rápidos">
      {QUICK_VALUES.map((n) => {
        const active = value === String(n)
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onPick(n)}
            aria-pressed={active}
            className={`tabular min-h-12 rounded-2xl border text-base font-semibold transition-[background-color,border-color,color,transform] duration-150 active:scale-95 disabled:opacity-40 ${
              active
                ? 'border-gold bg-gold/15 text-gold-light'
                : 'border-line bg-surface text-ink hover:border-muted/60'
            }`}
          >
            +{n}
          </button>
        )
      })}
    </div>
  )
}
