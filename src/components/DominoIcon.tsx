export function DominoIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 40" className={className} aria-hidden="true">
      <rect x="1" y="1" width="22" height="38" rx="5" fill="currentColor" />
      <rect x="4" y="19.4" width="16" height="1.2" rx="0.6" fill="var(--color-bg)" />
      <circle cx="8" cy="7" r="2" fill="var(--color-bg)" />
      <circle cx="16" cy="13" r="2" fill="var(--color-bg)" />
      <circle cx="8" cy="26" r="2" fill="var(--color-bg)" />
      <circle cx="16" cy="26" r="2" fill="var(--color-bg)" />
      <circle cx="8" cy="33" r="2" fill="var(--color-bg)" />
      <circle cx="16" cy="33" r="2" fill="var(--color-bg)" />
    </svg>
  )
}
