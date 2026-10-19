import { useEffect, useRef, useState, type RefObject } from 'react'
import type { Settings } from './timerReducer'

interface SettingsDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>
  settings: Settings
  onChange: (patch: Partial<Settings>) => void
}

/** Native <dialog> gives the focus trap, Esc-to-close and top layer for free. */
export function SettingsDialog({ dialogRef, settings, onChange }: SettingsDialogProps) {
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="settings-title"
      className="w-[min(92vw,24rem)] rounded-2xl border border-black/10 bg-white p-6 shadow-xl"
    >
      <form method="dialog" className="flex flex-col gap-5">
        <h2 id="settings-title" className="text-lg font-bold text-neutral-800">
          Settings
        </h2>
        <NumberField
          id="work-minutes"
          label="Work minutes"
          value={settings.workMinutes}
          min={1}
          max={120}
          onCommit={(workMinutes) => onChange({ workMinutes })}
        />
        <NumberField
          id="short-minutes"
          label="Short break minutes"
          value={settings.shortMinutes}
          min={1}
          max={60}
          onCommit={(shortMinutes) => onChange({ shortMinutes })}
        />
        <NumberField
          id="long-minutes"
          label="Long break minutes"
          value={settings.longMinutes}
          min={1}
          max={60}
          onCommit={(longMinutes) => onChange({ longMinutes })}
        />
        <NumberField
          id="long-break-every"
          label="Long break every (sessions)"
          value={settings.longBreakEvery}
          min={1}
          max={12}
          onCommit={(longBreakEvery) => onChange({ longBreakEvery })}
        />
        <button
          value="close"
          className="accent-bg h-11 rounded-xl font-bold text-white"
        >
          Close
        </button>
      </form>
    </dialog>
  )
}

interface NumberFieldProps {
  id: string
  label: string
  value: number
  min: number
  max: number
  onCommit: (value: number) => void
}

function NumberField({ id, label, value, min, max, onCommit }: NumberFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  // Local draft so the field can be cleared while typing; committed on blur.
  const [draft, setDraft] = useState(() => String(value))

  useEffect(() => {
    if (document.activeElement !== inputRef.current) setDraft(String(value))
  }, [value])

  function commit() {
    const parsed = Number.parseInt(draft, 10)
    const next = Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : value
    setDraft(String(next))
    onCommit(next)
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <label htmlFor={id} className="text-sm font-semibold text-neutral-700">
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            commit()
          }
        }}
        className="h-11 w-24 rounded-lg border border-black/15 px-3 text-right text-neutral-800"
      />
    </div>
  )
}
