import { useRef, type KeyboardEvent } from 'react'
import { PHASES, type Phase } from './timerReducer'
import { PHASE_LABEL } from './format'

interface PhaseTabsProps {
  phase: Phase
  onSelect: (phase: Phase) => void
}

/**
 * Full ARIA tabs pattern: roving tabindex (only the selected tab is
 * focusable), automatic selection on arrow keys, Home/End jumps.
 */
export function PhaseTabs({ phase, onSelect }: PhaseTabsProps) {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = PHASES.indexOf(phase)
    let nextIndex: number
    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (index + 1) % PHASES.length
        break
      case 'ArrowLeft':
        nextIndex = (index - 1 + PHASES.length) % PHASES.length
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = PHASES.length - 1
        break
      default:
        return
    }
    event.preventDefault()
    const next = PHASES[nextIndex]
    if (next === undefined) return
    onSelect(next)
    tabsRef.current[nextIndex]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label="Timer phases"
      onKeyDown={handleKeyDown}
      className="flex gap-1"
    >
      {PHASES.map((p, index) => (
        <button
          key={p}
          ref={(el) => {
            tabsRef.current[index] = el
          }}
          type="button"
          role="tab"
          id={`tab-${p}`}
          aria-selected={p === phase}
          aria-controls="timer-panel"
          tabIndex={p === phase ? 0 : -1}
          onClick={() => onSelect(p)}
          className={
            'min-h-11 rounded-full px-4 text-sm font-semibold uppercase tracking-wide ' +
            (p === phase
              ? 'accent-text underline decoration-2 underline-offset-6'
              : 'text-neutral-500 hover:text-neutral-700')
          }
        >
          {PHASE_LABEL[p]}
        </button>
      ))}
    </div>
  )
}
