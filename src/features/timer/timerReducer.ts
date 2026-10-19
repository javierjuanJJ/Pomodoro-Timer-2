/**
 * Pure finite state machine for the Pomodoro timer.
 *
 * No React imports, no side effects, and no `Date.now()` calls — every action
 * that needs the clock receives `now` (epoch ms) as a payload, which keeps the
 * machine deterministic and trivially testable.
 *
 * Timing is timestamp-based: the running state stores `endsAt` (ms epoch) and
 * remaining time is derived on each tick as `endsAt - now`. Counters decremented
 * in an interval would drift or freeze under background-tab throttling.
 */

export type Phase = 'work' | 'short' | 'long'

export type Status = 'idle' | 'running' | 'paused'

export interface Settings {
  /** Duration of a work session, in minutes. */
  workMinutes: number
  /** Duration of a short break, in minutes. */
  shortMinutes: number
  /** Duration of a long break, in minutes. */
  longMinutes: number
  /** A long break starts after every N completed work sessions. */
  longBreakEvery: number
}

export interface TimerState {
  phase: Phase
  status: Status
  completedPomodoros: number
  /** Epoch ms at which the running interval ends. Null unless running. */
  endsAt: number | null
  /** Remaining ms frozen at pause time. Null unless paused. */
  pausedRemainingMs: number | null
  settings: Settings
}

export type TimerAction =
  | { type: 'start'; now: number }
  | { type: 'pause'; now: number }
  | { type: 'resume'; now: number }
  | { type: 'reset' }
  | { type: 'skip'; now: number }
  | { type: 'sessionCompleted'; now: number }
  | { type: 'selectPhase'; phase: Phase }
  | { type: 'updateSettings'; settings: Partial<Settings>; now: number }

export const PHASES: readonly Phase[] = ['work', 'short', 'long']

export const DEFAULT_SETTINGS: Settings = {
  workMinutes: 25,
  shortMinutes: 5,
  longMinutes: 15,
  longBreakEvery: 4,
}

export function createTimerState(settings: Settings = DEFAULT_SETTINGS): TimerState {
  return {
    phase: 'work',
    status: 'idle',
    completedPomodoros: 0,
    endsAt: null,
    pausedRemainingMs: null,
    settings,
  }
}

/** Full duration of `phase` under the given settings, in ms. */
export function phaseDurationMs(phase: Phase, settings: Settings): number {
  const minutes =
    phase === 'work'
      ? settings.workMinutes
      : phase === 'short'
        ? settings.shortMinutes
        : settings.longMinutes
  return minutes * 60_000
}

/** Remaining time of the current session, clamped to >= 0. */
export function remainingMs(state: TimerState, now: number): number {
  switch (state.status) {
    case 'running':
      return state.endsAt === null ? 0 : Math.max(0, state.endsAt - now)
    case 'paused':
      return state.pausedRemainingMs ?? 0
    case 'idle':
      return phaseDurationMs(state.phase, state.settings)
  }
}

function clampInt(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : fallback
}

/** Clamp every field to a sane positive integer; never trust incoming values. */
export function sanitizeSettings(
  raw: Partial<Settings>,
  base: Settings = DEFAULT_SETTINGS,
): Settings {
  return {
    workMinutes: clampInt(raw.workMinutes, base.workMinutes),
    shortMinutes: clampInt(raw.shortMinutes, base.shortMinutes),
    longMinutes: clampInt(raw.longMinutes, base.longMinutes),
    longBreakEvery: clampInt(raw.longBreakEvery, base.longBreakEvery),
  }
}

/**
 * Move to the next phase, auto-starting it (Pomofocus behavior). Only a
 * *completed* work session increments the counter and may trigger a long
 * break; finishing a break or skipping never counts.
 */
function advance(state: TimerState, now: number, countCompleted: boolean): TimerState {
  const finishedWork = countCompleted && state.phase === 'work'
  const completedPomodoros = finishedWork
    ? state.completedPomodoros + 1
    : state.completedPomodoros
  const phase: Phase =
    state.phase === 'work'
      ? finishedWork && completedPomodoros % state.settings.longBreakEvery === 0
        ? 'long'
        : 'short'
      : 'work'
  return {
    ...state,
    phase,
    completedPomodoros,
    status: 'running',
    endsAt: now + phaseDurationMs(phase, state.settings),
    pausedRemainingMs: null,
  }
}

export function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    // start (from idle) and resume (from paused) both mean "run again from
    // whatever is left"; remainingMs() resolves the difference.
    case 'start':
    case 'resume': {
      if (state.status === 'running') return state
      const remaining = remainingMs(state, action.now)
      if (remaining <= 0) return state
      return {
        ...state,
        status: 'running',
        endsAt: action.now + remaining,
        pausedRemainingMs: null,
      }
    }
    case 'pause': {
      if (state.status !== 'running') return state
      return {
        ...state,
        status: 'paused',
        endsAt: null,
        pausedRemainingMs: remainingMs(state, action.now),
      }
    }
    case 'reset': {
      return { ...state, status: 'idle', endsAt: null, pausedRemainingMs: null }
    }
    case 'skip':
      return advance(state, action.now, false)
    case 'sessionCompleted':
      return advance(state, action.now, true)
    case 'selectPhase': {
      return {
        ...state,
        phase: action.phase,
        status: 'idle',
        endsAt: null,
        pausedRemainingMs: null,
      }
    }
    case 'updateSettings': {
      // Invalid fields fall back to the current settings (not the defaults),
      // so a bad form value never resets unrelated preferences.
      const settings = sanitizeSettings(
        { ...state.settings, ...action.settings },
        state.settings,
      )
      if (state.status === 'idle') return { ...state, settings }
      // Keep the current session, but never longer than the new duration.
      const max = phaseDurationMs(state.phase, settings)
      const remaining = Math.min(remainingMs(state, action.now), max)
      return {
        ...state,
        settings,
        status: state.status,
        endsAt: state.status === 'running' ? action.now + remaining : null,
        pausedRemainingMs: state.status === 'paused' ? remaining : null,
      }
    }
  }
}
