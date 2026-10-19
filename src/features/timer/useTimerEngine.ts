import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { ensureAudioContext, playChime } from '../../lib/audio'
import { loadPersistedData, savePersistedData } from '../../lib/persistence'
import { formatClock, PHASE_LABEL } from './format'
import {
  createTimerState,
  phaseDurationMs,
  remainingMs,
  timerReducer,
  type Phase,
  type Settings,
} from './timerReducer'

const TICK_MS = 250

/**
 * Binds the pure timer FSM to React: localStorage on init (never during
 * render), a timestamp-derived tick while running, best-effort persistence,
 * and the end-of-session chime on auto-advance.
 */
export function useTimerEngine() {
  const [state, dispatch] = useReducer(timerReducer, undefined, () => {
    const saved = loadPersistedData()
    const initial = createTimerState(saved.settings)
    return { ...initial, completedPomodoros: saved.completedPomodoros }
  })
  // Clock state only re-renders while the timer runs; idle/paused remaining
  // time does not depend on it.
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (state.status !== 'running') return
    const id = window.setInterval(() => {
      const t = Date.now()
      setNow(t)
      dispatch({ type: 'tick', now: t })
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [state.status])

  useEffect(() => {
    savePersistedData({
      v: 1,
      settings: state.settings,
      completedPomodoros: state.completedPomodoros,
    })
  }, [state.settings, state.completedPomodoros])

  // Chime + announcement only for auto-advance: a manual tab switch leaves
  // status idle and is announced natively by the tablist selection.
  const [announcement, setAnnouncement] = useState('')
  const prevPhase = useRef(state.phase)
  useEffect(() => {
    if (prevPhase.current !== state.phase && state.status === 'running') {
      playChime()
      const from = prevPhase.current
      setAnnouncement(
        `${from === 'work' ? 'Work session' : PHASE_LABEL[from]} complete — ${PHASE_LABEL[state.phase].toLowerCase()} started`,
      )
    }
    prevPhase.current = state.phase
  }, [state.phase, state.status])

  const remaining = remainingMs(state, now)

  useEffect(() => {
    document.title = `${formatClock(remaining)} — ${PHASE_LABEL[state.phase]} · Pomodoro`
  }, [remaining, state.phase])

  const toggle = useCallback(() => {
    ensureAudioContext()
    dispatch({ type: 'toggle', now: Date.now() })
  }, [])

  const reset = useCallback(() => {
    ensureAudioContext()
    dispatch({ type: 'reset' })
  }, [])

  const skip = useCallback(() => {
    ensureAudioContext()
    dispatch({ type: 'skip', now: Date.now() })
  }, [])

  const selectPhase = useCallback((phase: Phase) => {
    ensureAudioContext()
    dispatch({ type: 'selectPhase', phase })
  }, [])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    dispatch({ type: 'updateSettings', settings: patch, now: Date.now() })
  }, [])

  const duration = phaseDurationMs(state.phase, state.settings)

  return {
    state,
    remaining,
    ratio: duration > 0 ? remaining / duration : 0,
    announcement,
    toggle,
    reset,
    skip,
    selectPhase,
    updateSettings,
  }
}
