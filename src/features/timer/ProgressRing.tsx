interface ProgressRingProps {
  /** Remaining time as a fraction of the full duration, 0..1. */
  ratio: number
  /** Formatted countdown, e.g. `24:59`. */
  timeText: string
  /** Phase label shown under the countdown. */
  phaseLabel: string
}

const SIZE = 300
const STROKE = 10
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** The arc depletes with the remaining time; the text uses tabular numerals. */
export function ProgressRing({ ratio, timeText, phaseLabel }: ProgressRingProps) {
  const clamped = Math.min(1, Math.max(0, ratio))
  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden="true"
        className="w-[min(72vw,17.5rem)]"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - clamped)}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          className="ring-arc"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="countdown text-[clamp(3rem,13vw,5rem)] font-bold leading-none text-neutral-800">
          {timeText}
        </span>
        <span className="accent-text mt-2 text-xs font-bold uppercase tracking-[0.2em]">
          {phaseLabel}
        </span>
      </div>
    </div>
  )
}
