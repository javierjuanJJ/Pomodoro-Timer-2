interface SessionDotsProps {
  completed: number
  every: number
}

/** Dots are decorative; the wrapper's accessible name carries the count. */
export function SessionDots({ completed, every }: SessionDotsProps) {
  const count = Math.min(Math.max(every, 1), 12)
  const filled =
    completed === 0 ? 0 : completed % every === 0 ? every : completed % every
  return (
    <div
      role="img"
      aria-label={`Session ${filled} of ${every} toward the next long break`}
      className="mt-6 flex items-center gap-2"
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={
            i < filled
              ? 'accent-bg h-2.5 w-2.5 rounded-full'
              : 'h-2.5 w-2.5 rounded-full border border-black/20'
          }
        />
      ))}
    </div>
  )
}
