import type { Status } from './timerReducer'

interface ControlsProps {
  status: Status
  onToggle: () => void
  onReset: () => void
  onSkip: () => void
}

/** The label carries the state in words — never color alone. */
const TOGGLE_LABEL: Record<Status, string> = {
  idle: 'Start',
  running: 'Pause',
  paused: 'Resume',
}

export function Controls({ status, onToggle, onReset, onSkip }: ControlsProps) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        onClick={onToggle}
        className="accent-bg h-14 min-w-36 rounded-2xl px-8 text-lg font-bold text-white active:opacity-85"
      >
        {TOGGLE_LABEL[status]}
      </button>
      <button
        type="button"
        onClick={onReset}
        className="flex h-11 min-w-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-neutral-600 hover:bg-black/5"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
        </svg>
        Reset
      </button>
      <button
        type="button"
        onClick={onSkip}
        className="flex h-11 min-w-11 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-neutral-600 hover:bg-black/5"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 4 10 8-10 8z" />
          <path d="M19 5v14" />
        </svg>
        Skip
      </button>
    </div>
  )
}
