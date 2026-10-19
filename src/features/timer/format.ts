import type { Phase } from './timerReducer'

export const PHASE_LABEL: Record<Phase, string> = {
  work: 'Work',
  short: 'Short break',
  long: 'Long break',
}

/** Format a duration as whole minutes and seconds, e.g. `24:59`. */
export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
