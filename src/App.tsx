import { useEffect, useRef } from 'react'
import { Controls } from './features/timer/Controls'
import { PhaseTabs } from './features/timer/PhaseTabs'
import { ProgressRing } from './features/timer/ProgressRing'
import { SessionDots } from './features/timer/SessionDots'
import { SettingsDialog } from './features/timer/SettingsDialog'
import { formatClock, PHASE_LABEL } from './features/timer/format'
import { useTimerEngine } from './features/timer/useTimerEngine'

function App() {
  const { state, remaining, ratio, toggle, reset, skip, selectPhase, updateSettings } =
    useTimerEngine()
  const dialogRef = useRef<HTMLDialogElement>(null)

  // Space = start/pause, R = reset, S = skip — never while typing, focused in
  // a dialog, or when Space belongs to a focused button.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target
      if (!(target instanceof HTMLElement) || target.closest('dialog') !== null) return
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target.isContentEditable
      if (typing) return
      if (
        event.key === ' ' &&
        (target instanceof HTMLButtonElement || target instanceof HTMLAnchorElement)
      ) {
        return
      }
      switch (event.key.toLowerCase()) {
        case ' ':
          event.preventDefault()
          toggle()
          break
        case 'r':
          reset()
          break
        case 's':
          skip()
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [toggle, reset, skip])

  function openSettings() {
    dialogRef.current?.showModal()
  }

  return (
    <div data-phase={state.phase} className="tint-bg flex min-h-svh flex-col items-center px-4 py-6">
      <header className="flex w-full max-w-xl items-center justify-between">
        <h1 className="text-xl font-extrabold uppercase tracking-widest text-neutral-700">
          Pomodoro
        </h1>
        <button
          type="button"
          onClick={openSettings}
          aria-haspopup="dialog"
          className="flex size-11 items-center justify-center rounded-xl text-neutral-500 hover:bg-black/5"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span className="sr-only">Settings</span>
        </button>
      </header>

      <main className="mt-6 flex w-full max-w-xl flex-col items-center gap-6">
        <PhaseTabs phase={state.phase} onSelect={selectPhase} />
        <section
          role="tabpanel"
          id="timer-panel"
          aria-labelledby={`tab-${state.phase}`}
          tabIndex={0}
          className="flex w-full flex-col items-center rounded-3xl bg-white/90 px-4 py-8 shadow-lg ring-1 ring-black/5"
        >
          <ProgressRing
            ratio={ratio}
            timeText={formatClock(remaining)}
            phaseLabel={PHASE_LABEL[state.phase]}
          />
          <Controls
            status={state.status}
            onToggle={toggle}
            onReset={reset}
            onSkip={skip}
          />
          <SessionDots
            completed={state.completedPomodoros}
            every={state.settings.longBreakEvery}
          />
        </section>
      </main>

      <SettingsDialog
        dialogRef={dialogRef}
        settings={state.settings}
        onChange={updateSettings}
      />
    </div>
  )
}

export default App
