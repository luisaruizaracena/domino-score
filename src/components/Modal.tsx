import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Oculta el título visual (se mantiene para lectores de pantalla). */
  hideTitle?: boolean
  dismissible?: boolean
}

/** Hoja inferior en móvil, diálogo centrado en pantallas grandes. */
export function Modal({ open, onClose, title, children, hideTitle, dismissible = true }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const node = ref.current
    const focusables = () =>
      Array.from(
        node?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select, textarea, [href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      )
    const firstField = node?.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0]
    firstField?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) {
        e.preventDefault()
        onClose()
      } else if (e.key === 'Tab') {
        const els = focusables()
        if (els.length === 0) return
        const first = els[0]
        const last = els[els.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      prev?.focus?.()
    }
  }, [open, onClose, dismissible])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="animate-fade-in absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismissible ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="animate-fade-up relative max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl border border-line bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-soft sm:max-w-md sm:rounded-3xl"
      >
        <div className={hideTitle ? 'sr-only' : 'mb-4 flex items-center justify-between gap-3'}>
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          {dismissible && !hideTitle && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="-mr-2 grid size-11 place-items-center rounded-full text-muted transition-colors hover:bg-card hover:text-ink"
            >
              <X className="size-5" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}

export const btn = {
  primary:
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gold px-5 font-semibold text-bg shadow-gold transition-[background-color,transform,opacity] duration-150 hover:bg-gold-light active:scale-[0.98] disabled:bg-line disabled:text-muted disabled:shadow-none disabled:active:scale-100',
  secondary:
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-line bg-card px-5 font-semibold text-ink transition-[background-color,transform] duration-150 hover:bg-line/60 active:scale-[0.98] disabled:opacity-50',
  danger:
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-danger/40 bg-danger/10 px-5 font-semibold text-danger transition-[background-color,transform] duration-150 hover:bg-danger/20 active:scale-[0.98]',
  ghost:
    'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-medium text-muted transition-colors duration-150 hover:bg-card hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent',
}

export const inputClass =
  'w-full min-h-12 rounded-2xl border border-line bg-card px-4 text-base text-ink placeholder:text-muted/60 transition-colors focus:border-gold focus:outline-none'
